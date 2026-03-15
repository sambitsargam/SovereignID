"""Unbrowse AI client for agent web interactions.

Enables AI agents to interact with websites by resolving natural-language intents
into structured API calls, bypassing traditional browser automation.

API docs: https://www.unbrowse.ai/llms.txt
"""

from enum import Enum
from typing import Any, Optional

import httpx
from pydantic import BaseModel

from backend.config import settings


class ActionType(str, Enum):
    WEB_SEARCH = "web_search"
    DATA_RETRIEVE = "data_retrieve"
    FORM_SUBMIT = "form_submit"
    INTENT_RESOLVE = "intent_resolve"


class UnbrowseResult(BaseModel):
    """Result of an Unbrowse API call."""

    success: bool
    data: Optional[dict[str, Any]] = None
    error: Optional[str] = None
    skill_used: Optional[str] = None
    execution_time_ms: Optional[int] = None


class SkillInfo(BaseModel):
    """Metadata about an Unbrowse skill."""

    name: str
    domain: str
    description: str
    endpoint_count: int
    score: float


class UnbrowseClient:
    """HTTP client for the Unbrowse AI API."""

    def __init__(
        self,
        api_url: str = settings.unbrowse_api_url,
        api_key: Optional[str] = settings.unbrowse_api_key,
    ):
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def resolve_intent(self, intent: str, url: Optional[str] = None) -> UnbrowseResult:
        """Resolve a natural-language intent into a structured API response.

        This is the primary endpoint for agent web interactions.
        POST /v1/intent/resolve
        """
        payload: dict[str, Any] = {"intent": intent}
        if url:
            payload["url"] = url

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{self.api_url}/v1/intent/resolve",
                    json=payload,
                    headers=self._headers(),
                )
                response.raise_for_status()
                data = response.json()
                return UnbrowseResult(
                    success=True,
                    data=data,
                    skill_used=data.get("skill"),
                    execution_time_ms=data.get("execution_time_ms"),
                )
            except httpx.HTTPStatusError as e:
                return UnbrowseResult(success=False, error=f"HTTP {e.response.status_code}: {e.response.text}")
            except httpx.RequestError as e:
                return UnbrowseResult(success=False, error=f"Connection error: {str(e)}")

    async def search_skills(self, query: str) -> list[SkillInfo]:
        """Search the Unbrowse skill marketplace by intent.

        POST /v1/search
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.api_url}/v1/search",
                    json={"query": query},
                    headers=self._headers(),
                )
                response.raise_for_status()
                data = response.json()
                return [
                    SkillInfo(
                        name=s.get("name", ""),
                        domain=s.get("domain", ""),
                        description=s.get("description", ""),
                        endpoint_count=s.get("endpoint_count", 0),
                        score=s.get("score", 0.0),
                    )
                    for s in data.get("skills", [])
                ]
            except (httpx.HTTPError, KeyError):
                return []

    async def search_domain(self, intent: str, domain: str) -> list[SkillInfo]:
        """Search skills narrowed to a specific domain.

        POST /v1/search/domain
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.api_url}/v1/search/domain",
                    json={"intent": intent, "domain": domain},
                    headers=self._headers(),
                )
                response.raise_for_status()
                data = response.json()
                return [
                    SkillInfo(
                        name=s.get("name", ""),
                        domain=s.get("domain", ""),
                        description=s.get("description", ""),
                        endpoint_count=s.get("endpoint_count", 0),
                        score=s.get("score", 0.0),
                    )
                    for s in data.get("skills", [])
                ]
            except (httpx.HTTPError, KeyError):
                return []

    async def register_agent(self, agent_name: str, agent_description: str) -> Optional[str]:
        """Register an agent with Unbrowse and obtain an API key.

        POST /v1/agents/register
        Returns the API key string on success, None on failure.
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.api_url}/v1/agents/register",
                    json={"name": agent_name, "description": agent_description},
                    headers=self._headers(),
                )
                response.raise_for_status()
                data = response.json()
                return data.get("api_key")
            except httpx.HTTPError:
                return None

    async def get_platform_stats(self) -> Optional[dict[str, Any]]:
        """Get platform-wide statistics.

        GET /v1/stats/summary
        """
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(
                    f"{self.api_url}/v1/stats/summary",
                    headers=self._headers(),
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError:
                return None


unbrowse_client = UnbrowseClient()
