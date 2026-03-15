"""Passport (Holonym) human verification client.

Integrates with the Holonym sybil-resistance API to verify human identity
via government ID, phone number, or biometric verification.

API docs: https://docs.passport.xyz/building-with-passport/individual-verifications/api-reference
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

import httpx
from pydantic import BaseModel

from backend.config import settings


class VerificationType(str, Enum):
    GOV_ID = "gov-id"
    PHONE = "phone"
    BIOMETRICS = "biometrics"


class VerificationResult(BaseModel):
    """Result of a Passport verification check."""

    verified: bool
    verification_type: VerificationType
    expiration_date: Optional[datetime] = None
    wallet_address: str


class PassportClient:
    """HTTP client for the Holonym/Passport sybil-resistance API."""

    def __init__(
        self,
        api_url: str = settings.passport_api_url,
        action_id: str = settings.passport_action_id,
        network: str = settings.passport_network,
    ):
        self.api_url = api_url.rstrip("/")
        self.action_id = action_id
        self.network = network

    async def check_verification(
        self, wallet_address: str, verification_type: VerificationType
    ) -> VerificationResult:
        """Check whether a wallet address has completed a specific verification type.

        Calls: GET /sybil-resistance/{type}/{network}?user={address}&action-id={action_id}
        """
        url = (
            f"{self.api_url}/sybil-resistance/{verification_type.value}/{self.network}"
        )
        params = {"user": wallet_address, "action-id": self.action_id}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        expiration = None
        if data.get("expirationDate"):
            expiration = datetime.fromtimestamp(data["expirationDate"], tz=timezone.utc)

        return VerificationResult(
            verified=data.get("result", False),
            verification_type=verification_type,
            expiration_date=expiration,
            wallet_address=wallet_address,
        )

    async def check_gov_id(self, wallet_address: str) -> VerificationResult:
        """Check government ID verification status."""
        return await self.check_verification(wallet_address, VerificationType.GOV_ID)

    async def check_phone(self, wallet_address: str) -> VerificationResult:
        """Check phone verification status."""
        return await self.check_verification(wallet_address, VerificationType.PHONE)

    async def check_biometrics(self, wallet_address: str) -> VerificationResult:
        """Check biometrics verification status."""
        return await self.check_verification(wallet_address, VerificationType.BIOMETRICS)

    async def verify_any(self, wallet_address: str) -> VerificationResult:
        """Try all verification methods and return the first successful one.

        This is useful for accepting any form of identity verification.
        Falls back through gov-id -> phone -> biometrics.
        """
        for vtype in VerificationType:
            try:
                result = await self.check_verification(wallet_address, vtype)
                if result.verified:
                    return result
            except httpx.HTTPError:
                continue

        return VerificationResult(
            verified=False,
            verification_type=VerificationType.GOV_ID,
            wallet_address=wallet_address,
        )


passport_client = PassportClient()
