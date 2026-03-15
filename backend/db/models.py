"""SQLAlchemy models for SovereignID."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.db.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def generate_uuid() -> str:
    return str(uuid.uuid4())


class HumanIdentity(Base):
    """A verified human identity linked to a blockchain address."""

    __tablename__ = "human_identities"

    id = Column(String, primary_key=True, default=generate_uuid)
    wallet_address = Column(String(128), unique=True, nullable=False, index=True)
    verification_type = Column(String(32), nullable=False)  # gov-id, phone, biometrics
    verified = Column(Boolean, default=False, nullable=False)
    verification_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    agents = relationship("Agent", back_populates="owner")


class Agent(Base):
    """An AI agent with a decentralized identity."""

    __tablename__ = "agents"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(256), nullable=False)
    owner_id = Column(String, ForeignKey("human_identities.id"), nullable=False)
    public_key = Column(String(128), unique=True, nullable=False, index=True)
    capabilities = Column(Text, nullable=True)  # JSON-encoded capability metadata
    did = Column(String(256), unique=True, nullable=True)  # Decentralized identifier
    registered_on_subnet = Column(Boolean, default=False, nullable=False)
    reputation_score = Column(Float, default=0.0, nullable=False)
    trust_score = Column(Float, default=0.0, nullable=False)
    total_actions = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    owner = relationship("HumanIdentity", back_populates="agents")
    actions = relationship("AgentAction", back_populates="agent")
    reputation_events = relationship("ReputationEvent", back_populates="agent")


class AgentAction(Base):
    """A signed action performed by an agent."""

    __tablename__ = "agent_actions"

    id = Column(String, primary_key=True, default=generate_uuid)
    agent_id = Column(String, ForeignKey("agents.id"), nullable=False)
    action_type = Column(String(64), nullable=False)  # web_search, form_submit, data_retrieve
    intent = Column(Text, nullable=False)
    result = Column(Text, nullable=True)  # JSON-encoded result
    signature = Column(String(256), nullable=False)
    verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    agent = relationship("Agent", back_populates="actions")


class ReputationEvent(Base):
    """A reputation change event for an agent."""

    __tablename__ = "reputation_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    agent_id = Column(String, ForeignKey("agents.id"), nullable=False)
    event_type = Column(String(64), nullable=False)  # verification, action_success, action_failure, miner_validation
    score_delta = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    miner_uid = Column(Integer, nullable=True)  # UID of the miner that produced this event
    created_at = Column(DateTime, default=utcnow, nullable=False)

    agent = relationship("Agent", back_populates="reputation_events")


class SubnetRegistration(Base):
    """Record of an agent identity registered on the Bittensor subnet."""

    __tablename__ = "subnet_registrations"

    id = Column(String, primary_key=True, default=generate_uuid)
    agent_id = Column(String, ForeignKey("agents.id"), unique=True, nullable=False)
    netuid = Column(Integer, nullable=False)
    miner_uid = Column(Integer, nullable=True)
    identity_hash = Column(String(128), nullable=False)
    status = Column(String(32), default="pending", nullable=False)  # pending, verified, rejected
    verification_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)
