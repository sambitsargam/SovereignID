"""Reputation scoring engine for AI agents.

Computes and tracks agent reputation based on verified actions,
miner validation results, and temporal decay.
"""

import math
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import Agent, AgentAction, ReputationEvent


# Reputation scoring parameters
BASE_SUCCESS_REWARD = 0.05
BASE_FAILURE_PENALTY = -0.10
VERIFICATION_BONUS = 0.15
MINER_VALIDATION_BONUS = 0.10
DECAY_RATE = 0.001  # Per-hour decay when idle
MAX_REPUTATION = 10.0
MIN_REPUTATION = -2.0


def compute_action_delta(action_success: bool, current_reputation: float) -> float:
    """Compute reputation change from a single action.

    Successful actions give diminishing returns at higher reputation.
    Failed actions have a fixed penalty.
    """
    if action_success:
        decay_factor = 1.0 / (1.0 + current_reputation * 0.1) if current_reputation > 0 else 1.0
        return BASE_SUCCESS_REWARD * decay_factor
    return BASE_FAILURE_PENALTY


def compute_temporal_decay(current_reputation: float, hours_idle: float) -> float:
    """Apply temporal decay to reputation when agent is inactive."""
    if current_reputation <= 0 or hours_idle <= 0:
        return 0.0
    decay = DECAY_RATE * hours_idle * math.log1p(current_reputation)
    return -min(decay, current_reputation * 0.1)  # Cap at 10% per decay event


def clamp_reputation(score: float) -> float:
    """Clamp reputation within valid bounds."""
    return max(MIN_REPUTATION, min(MAX_REPUTATION, score))


async def update_agent_reputation(
    session: AsyncSession,
    agent_id: str,
    event_type: str,
    score_delta: float,
    reason: str,
    miner_uid: Optional[int] = None,
) -> float:
    """Apply a reputation change to an agent and record the event.

    Returns the new reputation score.
    """
    agent = await session.get(Agent, agent_id)
    if not agent:
        raise ValueError(f"Agent {agent_id} not found")

    new_score = clamp_reputation(agent.reputation_score + score_delta)
    agent.reputation_score = new_score

    event = ReputationEvent(
        agent_id=agent_id,
        event_type=event_type,
        score_delta=score_delta,
        reason=reason,
        miner_uid=miner_uid,
    )
    session.add(event)
    await session.flush()

    return new_score


async def get_agent_reputation_history(
    session: AsyncSession, agent_id: str, limit: int = 50
) -> list[ReputationEvent]:
    """Fetch recent reputation events for an agent."""
    result = await session.execute(
        select(ReputationEvent)
        .where(ReputationEvent.agent_id == agent_id)
        .order_by(ReputationEvent.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_reputation_leaderboard(
    session: AsyncSession, limit: int = 20
) -> list[Agent]:
    """Get top agents ranked by reputation score."""
    result = await session.execute(
        select(Agent)
        .where(Agent.registered_on_subnet.is_(True))
        .order_by(Agent.reputation_score.desc())
        .limit(limit)
    )
    return list(result.scalars().all())
