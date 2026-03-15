"""Reputation API routes — agent reputation scoring and leaderboard."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.schemas import AgentResponse, ReputationEventResponse, ReputationSummary
from backend.db import get_session
from backend.db.models import Agent
from backend.reputation.engine import get_agent_reputation_history, get_reputation_leaderboard

router = APIRouter(prefix="/reputation", tags=["reputation"])


@router.get("/leaderboard", response_model=list[AgentResponse])
async def get_leaderboard(
    limit: int = 20,
    session: AsyncSession = Depends(get_session),
):
    """Get the top agents ranked by reputation score.

    Only agents registered on the subnet are included. Results are ordered
    by reputation score descending.
    """
    agents = await get_reputation_leaderboard(session, limit=limit)
    return agents


@router.get("/{agent_id}", response_model=ReputationSummary)
async def get_reputation(
    agent_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get the full reputation summary for a specific agent.

    Returns the current reputation score, trust score, total action count,
    and a list of recent reputation events.
    """
    # Validate agent exists
    agent = await session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Fetch recent reputation events
    events = await get_agent_reputation_history(session, agent_id)

    return ReputationSummary(
        agent_id=agent.id,
        reputation_score=agent.reputation_score,
        trust_score=agent.trust_score,
        total_actions=agent.total_actions,
        recent_events=[ReputationEventResponse.model_validate(e) for e in events],
    )
