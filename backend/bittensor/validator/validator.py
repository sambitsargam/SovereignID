"""SovereignID Bittensor Validator.

Sends identity verification, ownership validation, and reputation update
tasks to miners, scores their responses, and sets weights on the subnet.
"""

import argparse
import hashlib
import json
import secrets
import time
import traceback
from typing import Optional

import bittensor as bt
import numpy as np

from backend.bittensor.protocol import (
    IdentityVerificationSynapse,
    OwnershipValidationSynapse,
    PingIdentitySynapse,
    ReputationUpdateSynapse,
)
from backend.identity.crypto import generate_keypair, sign_message, compute_identity_hash


class SovereignValidator:
    """Bittensor validator node for the SovereignID subnet."""

    def __init__(self, config: bt.Config):
        self.config = config
        bt.logging.info(f"Initializing SovereignID validator with config: {config}")

        self.wallet = bt.Wallet(config=config)
        self.subtensor = bt.Subtensor(config=config)
        self.metagraph = self.subtensor.metagraph(config.netuid)
        self.dendrite = bt.Dendrite(wallet=self.wallet)

        self.uid = self.metagraph.hotkeys.index(self.wallet.hotkey.ss58_address)
        bt.logging.info(f"Validator running with UID: {self.uid}")

        n = self.metagraph.n.item()
        self.scores = np.zeros(n, dtype=np.float32)
        self.step = 0

    async def forward(self):
        """Run one validation cycle: send tasks to miners and score responses."""
        miner_uids = self._get_miner_uids()
        if not miner_uids:
            bt.logging.warning("No miners available to query")
            return

        bt.logging.info(f"Querying {len(miner_uids)} miners: {miner_uids}")

        # Generate test identity for this round
        test_keypair = generate_keypair()
        test_agent_id = f"test-agent-{self.step}"
        test_owner = f"0x{secrets.token_hex(20)}"
        test_message = f"verify-{self.step}-{secrets.token_hex(8)}"
        test_signature = sign_message(test_keypair.private_key, test_message)
        test_identity_hash = compute_identity_hash(test_agent_id, test_keypair.public_key, test_owner)

        # Run all three task types
        identity_scores = await self._run_identity_verification(
            miner_uids, test_agent_id, test_keypair.public_key,
            test_identity_hash, test_signature, test_message,
        )
        ownership_scores = await self._run_ownership_validation(
            miner_uids, test_agent_id, test_keypair.public_key,
            test_owner, test_identity_hash,
        )
        reputation_scores = await self._run_reputation_update(
            miner_uids, test_agent_id, test_keypair.public_key,
        )
        liveness_scores = await self._run_ping(miner_uids)

        # Combine scores with weights: identity(0.35) + ownership(0.3) + reputation(0.2) + liveness(0.15)
        combined = np.zeros(len(miner_uids), dtype=np.float32)
        for i, uid in enumerate(miner_uids):
            combined[i] = (
                0.35 * identity_scores.get(uid, 0.0)
                + 0.30 * ownership_scores.get(uid, 0.0)
                + 0.20 * reputation_scores.get(uid, 0.0)
                + 0.15 * liveness_scores.get(uid, 0.0)
            )

        # Update running scores with exponential moving average
        alpha = 0.3
        for i, uid in enumerate(miner_uids):
            self.scores[uid] = alpha * combined[i] + (1 - alpha) * self.scores[uid]

        bt.logging.info(f"Step {self.step} scores: {dict(zip(miner_uids, combined))}")

    async def _run_identity_verification(
        self, miner_uids: list[int], agent_id: str, public_key: str,
        identity_hash: str, signature: str, message: str,
    ) -> dict[int, float]:
        """Send identity verification tasks and score responses."""
        axons = [self.metagraph.axons[uid] for uid in miner_uids]
        synapse = IdentityVerificationSynapse(
            agent_id=agent_id,
            public_key=public_key,
            identity_hash=identity_hash,
            signature=signature,
            message=message,
        )

        responses = await self.dendrite(axons=axons, synapse=synapse, timeout=12.0)
        scores = {}
        for uid, response in zip(miner_uids, responses):
            if response.is_valid is True and response.confidence and response.confidence > 0.5:
                scores[uid] = response.confidence
            else:
                scores[uid] = 0.0
        return scores

    async def _run_ownership_validation(
        self, miner_uids: list[int], agent_id: str, public_key: str,
        owner_address: str, identity_hash: str,
    ) -> dict[int, float]:
        """Send ownership validation tasks and score responses."""
        axons = [self.metagraph.axons[uid] for uid in miner_uids]
        synapse = OwnershipValidationSynapse(
            agent_id=agent_id,
            public_key=public_key,
            owner_address=owner_address,
            identity_hash=identity_hash,
        )

        responses = await self.dendrite(axons=axons, synapse=synapse, timeout=12.0)
        scores = {}
        for uid, response in zip(miner_uids, responses):
            if response.ownership_valid is True and response.confidence and response.confidence > 0.5:
                scores[uid] = response.confidence
            else:
                scores[uid] = 0.0
        return scores

    async def _run_reputation_update(
        self, miner_uids: list[int], agent_id: str, public_key: str,
    ) -> dict[int, float]:
        """Send reputation update tasks and score responses."""
        axons = [self.metagraph.axons[uid] for uid in miner_uids]
        action_hash = hashlib.sha256(f"test-action-{self.step}".encode()).hexdigest()
        synapse = ReputationUpdateSynapse(
            agent_id=agent_id,
            public_key=public_key,
            action_type="web_search",
            action_hash=action_hash,
            action_success=True,
            current_reputation=0.5,
        )

        responses = await self.dendrite(axons=axons, synapse=synapse, timeout=12.0)
        scores = {}
        for uid, response in zip(miner_uids, responses):
            if response.suggested_delta is not None and 0.0 < response.suggested_delta <= 0.1:
                scores[uid] = 1.0
            elif response.suggested_delta is not None:
                scores[uid] = 0.3  # responded but unreasonable value
            else:
                scores[uid] = 0.0
        return scores

    async def _run_ping(self, miner_uids: list[int]) -> dict[int, float]:
        """Ping miners to check liveness."""
        axons = [self.metagraph.axons[uid] for uid in miner_uids]
        nonce = secrets.token_hex(16)
        synapse = PingIdentitySynapse(nonce=nonce)

        responses = await self.dendrite(axons=axons, synapse=synapse, timeout=6.0)
        scores = {}
        for uid, response in zip(miner_uids, responses):
            scores[uid] = 1.0 if response.response_nonce == nonce else 0.0
        return scores

    def _get_miner_uids(self) -> list[int]:
        """Get UIDs of all active miners (non-validators) on the subnet."""
        uids = []
        for uid in range(self.metagraph.n.item()):
            if uid == self.uid:
                continue
            if self.metagraph.axons[uid].ip != "0.0.0.0":
                uids.append(uid)
        return uids

    def _set_weights(self):
        """Set weights on the Bittensor network based on accumulated scores."""
        weights = np.copy(self.scores)
        total = weights.sum()
        if total > 0:
            weights = weights / total

        uids = list(range(len(weights)))
        bt.logging.info(f"Setting weights: {dict(zip(uids, weights))}")

        self.subtensor.set_weights(
            netuid=self.config.netuid,
            wallet=self.wallet,
            uids=uids,
            weights=weights.tolist(),
            wait_for_inclusion=True,
        )

    async def run(self):
        """Main validator loop."""
        bt.logging.info("SovereignID validator is running...")
        while True:
            try:
                self.metagraph.sync(subtensor=self.subtensor)

                # Resize scores if metagraph changed
                n = self.metagraph.n.item()
                if len(self.scores) != n:
                    new_scores = np.zeros(n, dtype=np.float32)
                    new_scores[: len(self.scores)] = self.scores[:n]
                    self.scores = new_scores

                await self.forward()

                # Set weights every 10 steps
                if self.step % 10 == 0 and self.step > 0:
                    self._set_weights()

                self.step += 1
                time.sleep(12)
            except KeyboardInterrupt:
                bt.logging.info("Validator shutting down...")
                break
            except Exception:
                bt.logging.error(traceback.format_exc())
                time.sleep(12)


def get_config() -> bt.Config:
    parser = argparse.ArgumentParser(description="SovereignID Validator")
    parser.add_argument("--netuid", type=int, default=1, help="Subnet UID")
    bt.Wallet.add_args(parser)
    bt.Subtensor.add_args(parser)
    bt.logging.add_args(parser)
    return bt.Config(parser)


def main():
    import asyncio
    config = get_config()
    bt.logging(config=config)
    validator = SovereignValidator(config)
    asyncio.run(validator.run())


if __name__ == "__main__":
    main()
