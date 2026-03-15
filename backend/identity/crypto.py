"""Ed25519 cryptographic identity system for agent key management and signing."""

import hashlib
import json
from dataclasses import dataclass
from typing import Any

from nacl.encoding import HexEncoder
from nacl.signing import SigningKey, VerifyKey


@dataclass
class KeyPair:
    """An Ed25519 key pair for agent identity."""

    public_key: str
    private_key: str


def generate_keypair() -> KeyPair:
    """Generate a new Ed25519 key pair."""
    signing_key = SigningKey.generate()
    verify_key = signing_key.verify_key
    return KeyPair(
        public_key=verify_key.encode(encoder=HexEncoder).decode("ascii"),
        private_key=signing_key.encode(encoder=HexEncoder).decode("ascii"),
    )


def sign_message(private_key_hex: str, message: str) -> str:
    """Sign a message with an Ed25519 private key. Returns hex-encoded signature."""
    signing_key = SigningKey(private_key_hex.encode("ascii"), encoder=HexEncoder)
    signed = signing_key.sign(message.encode("utf-8"), encoder=HexEncoder)
    return signed.signature.decode("ascii")


def verify_signature(public_key_hex: str, message: str, signature_hex: str) -> bool:
    """Verify an Ed25519 signature against a public key and message."""
    try:
        verify_key = VerifyKey(public_key_hex.encode("ascii"), encoder=HexEncoder)
        verify_key.verify(message.encode("utf-8"), bytes.fromhex(signature_hex))
        return True
    except Exception:
        return False


def compute_identity_hash(agent_id: str, public_key: str, owner_address: str) -> str:
    """Compute a deterministic identity hash for subnet registration."""
    payload = json.dumps(
        {"agent_id": agent_id, "public_key": public_key, "owner": owner_address},
        sort_keys=True,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def sign_action(private_key_hex: str, action_data: dict[str, Any]) -> str:
    """Sign an agent action payload. The action dict is canonically serialized before signing."""
    canonical = json.dumps(action_data, sort_keys=True, default=str)
    return sign_message(private_key_hex, canonical)


def verify_action_signature(public_key_hex: str, action_data: dict[str, Any], signature_hex: str) -> bool:
    """Verify the signature on an agent action payload."""
    canonical = json.dumps(action_data, sort_keys=True, default=str)
    return verify_signature(public_key_hex, canonical, signature_hex)


def generate_did(public_key_hex: str) -> str:
    """Generate a decentralized identifier (DID) from a public key.

    Format: did:sovereign:<truncated-hash>
    """
    key_hash = hashlib.sha256(public_key_hex.encode("ascii")).hexdigest()[:32]
    return f"did:sovereign:{key_hash}"
