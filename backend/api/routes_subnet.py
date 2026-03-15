"""Subnet API routes — Bittensor subnet registration and status."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.schemas import RegisterSubnetRequest, SubnetRegistrationResponse, SubnetStatusResponse
from backend.config import settings
from backend.db import get_session
from backend.db.models import Agent, HumanIdentity, SubnetRegistration
from backend.identity.crypto import compute_identity_hash
from backend.reputation.engine import VERIFICATION_BONUS, update_agent_reputation

router = APIRouter(prefix="/subnet", tags=["subnet"])


@router.post("/register", response_model=SubnetRegistrationResponse)
async def register_on_subnet(
    req: RegisterSubnetRequest,
    session: AsyncSession = Depends(get_session),
):
    """Register an agent's identity on the Bittensor subnet.

    Validates that the agent exists and has a verified owner. Computes a
    deterministic identity hash, creates a subnet registration record,
    marks the agent as registered, and awards a reputation verification bonus.
    """
    agent_id = req.agent_id
    # Validate agent exists
    agent = await session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if agent.registered_on_subnet:
        raise HTTPException(status_code=409, detail="Agent is already registered on the subnet")

    # Validate the agent has a verified owner
    owner = await session.get(HumanIdentity, agent.owner_id)
    if not owner:
        raise HTTPException(status_code=404, detail="Agent owner identity not found")
    if not owner.verified:
        raise HTTPException(
            status_code=403,
            detail="Agent owner is not verified. Complete verification before subnet registration.",
        )

    # Compute the deterministic identity hash
    identity_hash = compute_identity_hash(agent.id, agent.public_key, owner.wallet_address)

    # Create the subnet registration record
    registration = SubnetRegistration(
        agent_id=agent.id,
        netuid=settings.bittensor_netuid,
        identity_hash=identity_hash,
        status="pending",
    )
    session.add(registration)

    # Mark the agent as registered on the subnet
    agent.registered_on_subnet = True
    agent.trust_score = max(agent.trust_score, 0.5)  # Initial trust floor

    # Award verification bonus to reputation
    await update_agent_reputation(
        session=session,
        agent_id=agent.id,
        event_type="verification",
        score_delta=VERIFICATION_BONUS,
        reason="Subnet registration identity verification bonus",
    )

    await session.commit()
    await session.refresh(registration)

    return registration


@router.get("/registration/{agent_id}", response_model=SubnetRegistrationResponse)
async def get_subnet_registration(
    agent_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get the subnet registration record for a specific agent."""
    result = await session.execute(
        select(SubnetRegistration).where(SubnetRegistration.agent_id == agent_id)
    )
    registration = result.scalar_one_or_none()
    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Subnet registration not found for this agent",
        )
    return registration


@router.get("/status", response_model=SubnetStatusResponse)
async def get_subnet_status():
    """Get the current Bittensor subnet connectivity status.

    Attempts to connect to the configured subtensor endpoint and retrieve
    network information. Returns connection status even if the local
    Bittensor node is not running.
    """
    try:
        import bittensor as bt

        subtensor = bt.subtensor(network=settings.subtensor_endpoint)
        block_height = subtensor.get_current_block()
        metagraph = subtensor.metagraph(netuid=settings.bittensor_netuid)
        num_neurons = metagraph.n.item()

        return SubnetStatusResponse(
            connected=True,
            network=settings.bittensor_network,
            netuid=settings.bittensor_netuid,
            block_height=block_height,
            num_neurons=num_neurons,
        )
    except Exception:
        # Bittensor node may not be running locally — return disconnected status
        return SubnetStatusResponse(
            connected=False,
            network=settings.bittensor_network,
            netuid=settings.bittensor_netuid,
            block_height=None,
            num_neurons=None,
        )
