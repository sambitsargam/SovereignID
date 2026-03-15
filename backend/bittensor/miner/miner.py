"""SovereignID Bittensor Miner.

Handles identity verification, ownership validation, and reputation updates.
The miner runs an Axon server to receive synapse requests from validators.
"""

import argparse
import hashlib
import json
import time
import traceback

import bittensor as bt

from backend.bittensor.protocol import (
    IdentityVerificationSynapse,
    OwnershipValidationSynapse,
    PingIdentitySynapse,
    ReputationUpdateSynapse,
)
from backend.identity.crypto import verify_signature, compute_identity_hash


class SovereignMiner:
    """Bittensor miner node for the SovereignID subnet."""

    def __init__(self, config: bt.Config):
        self.config = config
        bt.logging.info(f"Initializing SovereignID miner with config: {config}")

        self.wallet = bt.Wallet(config=config)
        self.subtensor = bt.Subtensor(config=config)
        self.metagraph = self.subtensor.metagraph(config.netuid)

        self.uid = self.metagraph.hotkeys.index(self.wallet.hotkey.ss58_address)
        bt.logging.info(f"Miner running with UID: {self.uid}")

        self.axon = bt.Axon(wallet=self.wallet, config=config)
        self._attach_handlers()
        self.axon.serve(netuid=config.netuid, subtensor=self.subtensor)
        self.axon.start()

        self.step = 0

    def _attach_handlers(self):
        """Attach synapse handlers to the axon server."""
        self.axon.attach(
            forward_fn=self.handle_identity_verification,
            blacklist_fn=self.blacklist_identity_verification,
        ).attach(
            forward_fn=self.handle_ownership_validation,
            blacklist_fn=self.blacklist_ownership_validation,
        ).attach(
            forward_fn=self.handle_reputation_update,
            blacklist_fn=self.blacklist_reputation_update,
        ).attach(
            forward_fn=self.handle_ping,
        )

    def handle_identity_verification(self, synapse: IdentityVerificationSynapse) -> IdentityVerificationSynapse:
        """Verify that the provided signature was produced by the claimed public key."""
        bt.logging.info(f"Received identity verification request for agent {synapse.agent_id}")

        try:
            is_valid = verify_signature(synapse.public_key, synapse.message, synapse.signature)

            # Cross-check identity hash
            expected_hash_input = json.dumps(
                {"agent_id": synapse.agent_id, "public_key": synapse.public_key},
                sort_keys=True,
            )
            expected_hash = hashlib.sha256(expected_hash_input.encode("utf-8")).hexdigest()
            hash_matches = synapse.identity_hash.startswith(expected_hash[:16])

            synapse.is_valid = is_valid and hash_matches
            synapse.confidence = 1.0 if synapse.is_valid else 0.0
        except Exception as e:
            bt.logging.error(f"Identity verification error: {e}")
            synapse.is_valid = False
            synapse.confidence = 0.0

        return synapse

    def handle_ownership_validation(self, synapse: OwnershipValidationSynapse) -> OwnershipValidationSynapse:
        """Validate that an agent's public key is bound to the claimed owner."""
        bt.logging.info(f"Received ownership validation request for agent {synapse.agent_id}")

        try:
            expected_hash = compute_identity_hash(synapse.agent_id, synapse.public_key, synapse.owner_address)
            synapse.ownership_valid = expected_hash == synapse.identity_hash
            synapse.confidence = 1.0 if synapse.ownership_valid else 0.0
        except Exception as e:
            bt.logging.error(f"Ownership validation error: {e}")
            synapse.ownership_valid = False
            synapse.confidence = 0.0

        return synapse

    def handle_reputation_update(self, synapse: ReputationUpdateSynapse) -> ReputationUpdateSynapse:
        """Compute a reputation score delta based on action outcome."""
        bt.logging.info(f"Received reputation update request for agent {synapse.agent_id}")

        try:
            if synapse.action_success:
                # Successful actions increase reputation, with diminishing returns
                base_delta = 0.05
                decay_factor = 1.0 / (1.0 + synapse.current_reputation * 0.1)
                synapse.suggested_delta = base_delta * decay_factor
                synapse.rationale = f"Successful {synapse.action_type}: +{synapse.suggested_delta:.4f}"
            else:
                # Failed actions decrease reputation proportionally
                synapse.suggested_delta = -0.1
                synapse.rationale = f"Failed {synapse.action_type}: {synapse.suggested_delta:.4f}"
        except Exception as e:
            bt.logging.error(f"Reputation computation error: {e}")
            synapse.suggested_delta = 0.0
            synapse.rationale = "Error computing reputation delta"

        return synapse

    def handle_ping(self, synapse: PingIdentitySynapse) -> PingIdentitySynapse:
        """Respond to a ping with the same nonce to prove liveness."""
        synapse.response_nonce = synapse.nonce
        return synapse

    def blacklist_identity_verification(self, synapse: IdentityVerificationSynapse) -> tuple[bool, str]:
        """Only allow requests from registered validators."""
        return self._check_caller_is_validator(synapse)

    def blacklist_ownership_validation(self, synapse: OwnershipValidationSynapse) -> tuple[bool, str]:
        return self._check_caller_is_validator(synapse)

    def blacklist_reputation_update(self, synapse: ReputationUpdateSynapse) -> tuple[bool, str]:
        return self._check_caller_is_validator(synapse)

    def _check_caller_is_validator(self, synapse: bt.Synapse) -> tuple[bool, str]:
        """Check if the requesting hotkey is a registered validator."""
        caller_hotkey = synapse.dendrite.hotkey
        if caller_hotkey not in self.metagraph.hotkeys:
            return True, "Caller not registered on subnet"

        caller_uid = self.metagraph.hotkeys.index(caller_hotkey)
        if not self.metagraph.validator_permit[caller_uid]:
            return True, "Caller does not have validator permit"

        return False, "Caller is valid validator"

    def run(self):
        """Main miner loop — keeps the axon alive and syncs metagraph."""
        bt.logging.info("SovereignID miner is running...")
        while True:
            try:
                if self.step % 30 == 0:
                    self.metagraph.sync(subtensor=self.subtensor)
                    bt.logging.info(
                        f"Step {self.step} | Block: {self.metagraph.block.item()} | "
                        f"Incentive: {self.metagraph.I[self.uid]:.4f}"
                    )
                self.step += 1
                time.sleep(12)  # ~one block
            except KeyboardInterrupt:
                bt.logging.info("Miner shutting down...")
                self.axon.stop()
                break
            except Exception:
                bt.logging.error(traceback.format_exc())
                time.sleep(12)


def get_config() -> bt.Config:
    parser = argparse.ArgumentParser(description="SovereignID Miner")
    parser.add_argument("--netuid", type=int, default=1, help="Subnet UID")
    bt.Wallet.add_args(parser)
    bt.Subtensor.add_args(parser)
    bt.Axon.add_args(parser)
    bt.logging.add_args(parser)
    return bt.Config(parser)


def main():
    config = get_config()
    bt.logging(config=config)
    miner = SovereignMiner(config)
    miner.run()


if __name__ == "__main__":
    main()
