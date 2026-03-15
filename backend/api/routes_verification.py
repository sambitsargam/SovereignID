"""Verification API routes — human identity verification via Passport/Holonym."""

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.schemas import HumanIdentityResponse, VerifyIdentityRequest
from backend.db import get_session
from backend.db.models import HumanIdentity
from backend.passport.verification.client import PassportClient, VerificationType

router = APIRouter(prefix="/verification", tags=["verification"])
passport = PassportClient()


@router.post("/verify", response_model=HumanIdentityResponse)
async def verify_identity(
    req: VerifyIdentityRequest,
    session: AsyncSession = Depends(get_session),
):
    """Verify a human identity through Passport sybil-resistance API.

    Checks the wallet address against Holonym's verification endpoints.
    If verified, creates or updates the identity record.
    """
    vtype = VerificationType(req.verification_type)

    # Check Passport API
    try:
        result = await passport.check_verification(req.wallet_address, vtype)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Passport API error: {str(e)}")

    # Check if identity already exists
    existing = await session.execute(
        select(HumanIdentity).where(HumanIdentity.wallet_address == req.wallet_address)
    )
    identity = existing.scalar_one_or_none()

    if identity:
        identity.verified = result.verified
        identity.verification_type = req.verification_type
        identity.verification_expiry = result.expiration_date
        identity.updated_at = datetime.now(timezone.utc)
    else:
        identity = HumanIdentity(
            wallet_address=req.wallet_address,
            verification_type=req.verification_type,
            verified=result.verified,
            verification_expiry=result.expiration_date,
        )
        session.add(identity)

    await session.commit()
    await session.refresh(identity)
    return identity


@router.get("/status/{wallet_address}", response_model=HumanIdentityResponse)
async def get_verification_status(
    wallet_address: str,
    session: AsyncSession = Depends(get_session),
):
    """Get the current verification status for a wallet address."""
    result = await session.execute(
        select(HumanIdentity).where(HumanIdentity.wallet_address == wallet_address)
    )
    identity = result.scalar_one_or_none()
    if not identity:
        raise HTTPException(status_code=404, detail="Identity not found")
    return identity


@router.post("/verify-demo", response_model=HumanIdentityResponse)
async def verify_identity_demo(
    req: VerifyIdentityRequest,
    session: AsyncSession = Depends(get_session),
):
    """Demo verification endpoint for local development.

    Creates a verified identity without calling the external Passport API.
    This enables the full demo flow when running locally without external API access.
    Use the /verify endpoint in production for real Passport verification.
    """
    existing = await session.execute(
        select(HumanIdentity).where(HumanIdentity.wallet_address == req.wallet_address)
    )
    identity = existing.scalar_one_or_none()

    if identity:
        identity.verified = True
        identity.verification_type = req.verification_type
        identity.updated_at = datetime.now(timezone.utc)
    else:
        identity = HumanIdentity(
            wallet_address=req.wallet_address,
            verification_type=req.verification_type,
            verified=True,
        )
        session.add(identity)

    await session.commit()
    await session.refresh(identity)
    return identity
