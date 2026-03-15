"""Identity management service."""

from backend.identity.crypto import (
    KeyPair,
    compute_identity_hash,
    generate_did,
    generate_keypair,
    sign_action,
    sign_message,
    verify_action_signature,
    verify_signature,
)

__all__ = [
    "KeyPair",
    "compute_identity_hash",
    "generate_did",
    "generate_keypair",
    "sign_action",
    "sign_message",
    "verify_action_signature",
    "verify_signature",
]
