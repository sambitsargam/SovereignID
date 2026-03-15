"""Agent API routes — create and manage AI agents with Ed25519 identities."""

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.schemas import (
    AgentCreatedResponse,
    AgentResponse,
    CreateAgentRequest,
    SubnetRegistrationResponse,
)
from backend.config import settings
from backend.db import get_session
from backend.db.models import Agent, HumanIdentity, SubnetRegistration
from backend.identity.crypto import compute_identity_hash, generate_did, generate_keypair
from backend.reputation.engine import update_agent_reputation

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/", response_model=AgentCreatedResponse)
async def create_agent(
    req: CreateAgentRequest,
    session: AsyncSession = Depends(get_session),
):
    """Create a new AI agent with an Ed25519 cryptographic identity.

    The owner must have a verified human identity. A new Ed25519 keypair and
    DID are generated for the agent. The private key is returned only once
    in the response — the caller must store it securely as it cannot be
    retrieved later.
    """
    # Look up the owner identity by wallet address
    result = await session.execute(
        select(HumanIdentity).where(
            HumanIdentity.wallet_address == req.owner_wallet_address
        )
    )
    owner = result.scalar_one_or_none()
    if not owner:
        raise HTTPException(
            status_code=404,
            detail="Owner identity not found. Verify your wallet address first.",
        )
    if not owner.verified:
        raise HTTPException(
            status_code=403,
            detail="Owner identity is not verified. Complete verification before creating an agent.",
        )

    # Generate Ed25519 keypair and DID
    keypair = generate_keypair()
    did = generate_did(keypair.public_key)

    # Encode capabilities as JSON text for storage
    capabilities_json = json.dumps(req.capabilities) if req.capabilities else None

    # Create the agent record
    agent = Agent(
        name=req.name,
        owner_id=owner.id,
        public_key=keypair.public_key,
        did=did,
        capabilities=capabilities_json,
    )
    session.add(agent)
    await session.commit()
    await session.refresh(agent)

    return AgentCreatedResponse(
        agent=AgentResponse.model_validate(agent),
        private_key=keypair.private_key,
    )


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get an agent by its unique ID."""
    agent = await session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.get("/by-owner/{wallet_address}", response_model=list[AgentResponse])
async def get_agents_by_owner(
    wallet_address: str,
    session: AsyncSession = Depends(get_session),
):
    """List all agents owned by a given wallet address."""
    # Look up the owner identity first
    owner_result = await session.execute(
        select(HumanIdentity).where(
            HumanIdentity.wallet_address == wallet_address
        )
    )
    owner = owner_result.scalar_one_or_none()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner identity not found")

    # Fetch all agents belonging to this owner
    agents_result = await session.execute(
        select(Agent).where(Agent.owner_id == owner.id).order_by(Agent.created_at.desc())
    )
    agents = agents_result.scalars().all()
    return list(agents)


@router.post("/{agent_id}/register", response_model=SubnetRegistrationResponse)
async def register_on_subnet(
    agent_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Register an agent's identity on the Bittensor subnet.

    Computes the identity hash and creates a registration record.
    Awards initial verification reputation.
    """
    agent = await session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    existing = await session.execute(
        select(SubnetRegistration).where(SubnetRegistration.agent_id == agent_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Agent already registered on subnet")

    owner = await session.get(HumanIdentity, agent.owner_id)
    identity_hash = compute_identity_hash(agent.id, agent.public_key, owner.wallet_address)

    registration = SubnetRegistration(
        agent_id=agent.id,
        netuid=settings.bittensor_netuid,
        identity_hash=identity_hash,
        status="verified",
    )
    session.add(registration)

    agent.registered_on_subnet = True
    agent.trust_score = 0.5

    await update_agent_reputation(
        session, agent.id, "verification", 0.15,
        "Identity registered on subnet",
    )

    await session.commit()
    await session.refresh(registration)
    return registration


@router.get("/{agent_id}/registration", response_model=SubnetRegistrationResponse)
async def get_registration(
    agent_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get subnet registration details for an agent."""
    result = await session.execute(
        select(SubnetRegistration).where(SubnetRegistration.agent_id == agent_id)
    )
    reg = result.scalar_one_or_none()
    if not reg:
        raise HTTPException(status_code=404, detail="Agent not registered on subnet")
    return reg
