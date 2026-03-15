"""Pydantic schemas for API request/response models."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ─── Human Identity ───

class VerifyIdentityRequest(BaseModel):
    wallet_address: str = Field(..., min_length=10, description="Blockchain wallet address")
    verification_type: str = Field(default="gov-id", pattern="^(gov-id|phone|biometrics)$")


class HumanIdentityResponse(BaseModel):
    id: str
    wallet_address: str
    verification_type: str
    verified: bool
    verification_expiry: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Agent ───

class CreateAgentRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=256)
    owner_wallet_address: str = Field(..., min_length=10)
    capabilities: Optional[list[str]] = None


class AgentResponse(BaseModel):
    id: str
    name: str
    owner_id: str
    public_key: str
    did: Optional[str] = None
    capabilities: Optional[str] = None
    registered_on_subnet: bool
    reputation_score: float
    trust_score: float
    total_actions: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AgentCreatedResponse(BaseModel):
    agent: AgentResponse
    private_key: str = Field(..., description="Ed25519 private key — store securely, not retrievable later")


# ─── Agent Actions ───

class ExecuteActionRequest(BaseModel):
    agent_id: str
    private_key: str = Field(..., description="Agent's Ed25519 private key for signing")
    action_type: str = Field(default="web_search", pattern="^(web_search|data_retrieve|form_submit|intent_resolve)$")
    intent: str = Field(..., min_length=1, description="Natural language intent for the action")
    url: Optional[str] = Field(default=None, description="Target URL for the action")


class ActionResponse(BaseModel):
    id: str
    agent_id: str
    action_type: str
    intent: str
    result: Optional[str] = None
    signature: str
    verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Reputation ───

class ReputationEventResponse(BaseModel):
    id: str
    agent_id: str
    event_type: str
    score_delta: float
    reason: Optional[str] = None
    miner_uid: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReputationSummary(BaseModel):
    agent_id: str
    reputation_score: float
    trust_score: float
    total_actions: int
    recent_events: list[ReputationEventResponse]


# ─── Subnet ───

class RegisterSubnetRequest(BaseModel):
    agent_id: str = Field(..., min_length=1)


class SubnetRegistrationResponse(BaseModel):
    id: str
    agent_id: str
    netuid: int
    identity_hash: str
    status: str
    verification_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SubnetStatusResponse(BaseModel):
    connected: bool
    network: str
    netuid: int
    block_height: Optional[int] = None
    num_neurons: Optional[int] = None


# ─── Generic ───

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    subnet_connected: bool = False


class StatsResponse(BaseModel):
    total_identities: int
    total_agents: int
    total_actions: int
    verified_identities: int
    registered_agents: int
    avg_reputation: float
