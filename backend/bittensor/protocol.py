"""SovereignID subnet protocol definition.

Defines synapse-based message types for identity verification,
ownership validation, and reputation computation on the Bittensor network.
"""

from typing import Any, Optional

import bittensor as bt


class IdentityVerificationSynapse(bt.Synapse):
    """Synapse for verifying an agent's identity signature.

    Sent by validators to miners. The miner must verify that the
    signature was correctly produced by the claimed public key.
    """

    agent_id: str
    public_key: str
    identity_hash: str
    signature: str
    message: str

    # Miner fills these
    is_valid: Optional[bool] = None
    confidence: Optional[float] = None


class OwnershipValidationSynapse(bt.Synapse):
    """Synapse for validating agent-to-owner binding.

    Miners verify that the agent's public key is bound to the
    claimed owner wallet address through the identity hash.
    """

    agent_id: str
    public_key: str
    owner_address: str
    identity_hash: str

    # Miner fills these
    ownership_valid: Optional[bool] = None
    confidence: Optional[float] = None


class ReputationUpdateSynapse(bt.Synapse):
    """Synapse for computing reputation score updates.

    Miners evaluate action logs and compute a suggested
    reputation delta for the agent.
    """

    agent_id: str
    public_key: str
    action_type: str
    action_hash: str
    action_success: bool
    current_reputation: float

    # Miner fills these
    suggested_delta: Optional[float] = None
    rationale: Optional[str] = None


class PingIdentitySynapse(bt.Synapse):
    """Simple ping synapse to check miner liveness and basic capability."""

    nonce: str
    response_nonce: Optional[str] = None
