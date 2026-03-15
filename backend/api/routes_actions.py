"""Action API routes — execute and query signed agent actions via Unbrowse."""

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.schemas import ActionResponse, ExecuteActionRequest
from backend.db import get_session
from backend.db.models import Agent, AgentAction
from backend.identity.crypto import sign_action
from backend.reputation.engine import compute_action_delta, update_agent_reputation
from backend.unbrowse.actions.client import unbrowse_client

router = APIRouter(prefix="/actions", tags=["actions"])


@router.post("/execute", response_model=ActionResponse)
async def execute_action(
    req: ExecuteActionRequest,
    session: AsyncSession = Depends(get_session),
):
    """Execute a signed agent action via Unbrowse.

    Validates the agent exists, signs the action payload with the provided
    private key, resolves the intent through Unbrowse, stores the action
    record, and updates the agent's reputation score.
    """
    # Validate agent exists
    agent = await session.get(Agent, req.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Build the action data payload for signing
    action_data = {
        "agent_id": req.agent_id,
        "action_type": req.action_type,
        "intent": req.intent,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # Sign the action with the agent's private key
    try:
        signature = sign_action(req.private_key, action_data)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to sign action — invalid private key: {str(exc)}",
        )

    # Resolve the intent through Unbrowse
    try:
        unbrowse_result = await unbrowse_client.resolve_intent(req.intent, req.url)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unbrowse API error: {str(exc)}",
        )

    # Serialize the result as JSON text
    result_json = json.dumps(unbrowse_result.model_dump(), default=str)

    # Create the action record
    action = AgentAction(
        agent_id=req.agent_id,
        action_type=req.action_type,
        intent=req.intent,
        result=result_json,
        signature=signature,
        verified=unbrowse_result.success,
    )
    session.add(action)

    # Update reputation based on action outcome
    action_success = unbrowse_result.success
    score_delta = compute_action_delta(action_success, agent.reputation_score)
    event_type = "action_success" if action_success else "action_failure"
    reason = (
        f"Action '{req.action_type}' completed successfully"
        if action_success
        else f"Action '{req.action_type}' failed: {unbrowse_result.error or 'unknown error'}"
    )
    await update_agent_reputation(
        session=session,
        agent_id=req.agent_id,
        event_type=event_type,
        score_delta=score_delta,
        reason=reason,
    )

    # Increment total actions counter
    agent.total_actions = agent.total_actions + 1

    await session.commit()
    await session.refresh(action)

    return action


@router.get("/{agent_id}", response_model=list[ActionResponse])
async def get_agent_actions(
    agent_id: str,
    session: AsyncSession = Depends(get_session),
):
    """List all actions performed by a specific agent."""
    # Verify the agent exists
    agent = await session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    result = await session.execute(
        select(AgentAction)
        .where(AgentAction.agent_id == agent_id)
        .order_by(AgentAction.created_at.desc())
    )
    actions = result.scalars().all()
    return list(actions)


@router.get("/detail/{action_id}", response_model=ActionResponse)
async def get_action_detail(
    action_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get details for a specific action by its ID."""
    action = await session.get(AgentAction, action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return action
