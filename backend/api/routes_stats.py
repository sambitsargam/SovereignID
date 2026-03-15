"""Stats API routes — dashboard statistics and platform metrics."""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.schemas import StatsResponse
from backend.db import get_session
from backend.db.models import Agent, AgentAction, HumanIdentity

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/", response_model=StatsResponse)
async def get_stats(
    session: AsyncSession = Depends(get_session),
):
    """Get platform-wide dashboard statistics.

    Returns aggregate counts for identities, agents, and actions, along
    with the number of verified identities, subnet-registered agents,
    and the average reputation score across all agents.
    """
    # Total identities
    total_identities_result = await session.execute(
        select(func.count()).select_from(HumanIdentity)
    )
    total_identities = total_identities_result.scalar() or 0

    # Total agents
    total_agents_result = await session.execute(
        select(func.count()).select_from(Agent)
    )
    total_agents = total_agents_result.scalar() or 0

    # Total actions
    total_actions_result = await session.execute(
        select(func.count()).select_from(AgentAction)
    )
    total_actions = total_actions_result.scalar() or 0

    # Verified identities
    verified_identities_result = await session.execute(
        select(func.count()).select_from(HumanIdentity).where(HumanIdentity.verified.is_(True))
    )
    verified_identities = verified_identities_result.scalar() or 0

    # Agents registered on the subnet
    registered_agents_result = await session.execute(
        select(func.count()).select_from(Agent).where(Agent.registered_on_subnet.is_(True))
    )
    registered_agents = registered_agents_result.scalar() or 0

    # Average reputation score across all agents
    avg_reputation_result = await session.execute(
        select(func.avg(Agent.reputation_score))
    )
    avg_reputation = avg_reputation_result.scalar() or 0.0

    return StatsResponse(
        total_identities=total_identities,
        total_agents=total_agents,
        total_actions=total_actions,
        verified_identities=verified_identities,
        registered_agents=registered_agents,
        avg_reputation=round(float(avg_reputation), 4),
    )
