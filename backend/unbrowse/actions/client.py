"""Unbrowse AI client for agent web interactions.

Enables AI agents to interact with websites by resolving natural-language intents
into structured API calls via the Unbrowse skill marketplace.

Beta API base: https://beta-api.unbrowse.ai
Docs: https://www.unbrowse.ai/llms.txt
"""

from typing import Any, Optional

import httpx
from pydantic import BaseModel

from backend.config import settings


class UnbrowseResult(BaseModel):
    """Result of an Unbrowse API call."""

    success: bool
    data: Optional[dict[str, Any]] = None
    error: Optional[str] = None
    skill_used: Optional[str] = None
    execution_time_ms: Optional[int] = None


class UnbrowseClient:
    """HTTP client for the Unbrowse AI beta API.

    The beta API exposes skill marketplace search, listing, agent management,
    and platform stats. Skill execution requires the local Unbrowse CLI.
    For the SovereignID demo, we use semantic search + skill listing to find
    relevant API skills for any given natural-language intent.
    """

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
        """Resolve a natural-language intent by searching the Unbrowse skill marketplace.

        Uses POST /v1/search to find semantically matching skills, then enriches
        the results with full skill metadata from GET /v1/skills. Returns the
        matched skills, their domains, endpoints, and similarity scores.
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                # Step 1: Semantic search for matching skills
                search_payload: dict[str, Any] = {"intent": intent, "k": 5}
                search_resp = await client.post(
                    f"{self.api_url}/v1/search",
                    json=search_payload,
                    headers=self._headers(),
                )
                search_resp.raise_for_status()
                search_data = search_resp.json()
                search_results = search_data.get("results", [])

                # Step 2: If a domain URL is provided, also do a domain-scoped search
                domain_results = []
                if url:
                    from urllib.parse import urlparse
                    domain = urlparse(url).netloc or url
                    domain_resp = await client.post(
                        f"{self.api_url}/v1/search/domain",
                        json={"intent": intent, "domain": domain, "k": 5},
                        headers=self._headers(),
                    )
                    if domain_resp.status_code == 200:
                        domain_results = domain_resp.json().get("results", [])

                # Step 3: Fetch full skill catalog for enrichment
                skills_resp = await client.get(
                    f"{self.api_url}/v1/skills",
                    headers=self._headers(),
                )
                skills_resp.raise_for_status()
                all_skills = {
                    s["skill_id"]: s
                    for s in skills_resp.json().get("skills", [])
                }

                # Step 4: Get platform stats
                stats_resp = await client.get(
                    f"{self.api_url}/v1/stats/summary",
                    headers=self._headers(),
                )
                platform_stats = stats_resp.json() if stats_resp.status_code == 200 else {}

                # Step 5: Get agent identity
                agent_resp = await client.get(
                    f"{self.api_url}/v1/agents/me",
                    headers=self._headers(),
                )
                agent_info = agent_resp.json() if agent_resp.status_code == 200 else {}

                # Build enriched result
                matched_skills = []
                for result in search_results:
                    skill_id = result.get("id", "")
                    score = result.get("score", 0.0)
                    skill_meta = all_skills.get(skill_id, {})
                    matched_skills.append({
                        "skill_id": skill_id,
                        "similarity_score": round(score, 4),
                        "name": skill_meta.get("name", "unknown"),
                        "domain": skill_meta.get("domain", "unknown"),
                        "description": skill_meta.get("description", ""),
                        "lifecycle": skill_meta.get("lifecycle", "unknown"),
                        "endpoints": [
                            {
                                "method": ep.get("method"),
                                "url": ep.get("url_template"),
                                "verification": ep.get("verification_status"),
                                "reliability": ep.get("reliability_score"),
                            }
                            for ep in skill_meta.get("endpoints", [])
                        ],
                    })

                return UnbrowseResult(
                    success=True,
                    data={
                        "intent": intent,
                        "url": url,
                        "matched_skills": matched_skills,
                        "domain_results": domain_results,
                        "total_marketplace_skills": platform_stats.get("skills", 0),
                        "total_marketplace_endpoints": platform_stats.get("endpoints", 0),
                        "total_executions": platform_stats.get("executions", 0),
                        "agent_id": agent_info.get("agent_id"),
                        "agent_name": agent_info.get("name"),
                    },
                    skill_used=matched_skills[0]["name"] if matched_skills else None,
                )

            except httpx.HTTPStatusError as e:
                return UnbrowseResult(
                    success=False,
                    error=f"HTTP {e.response.status_code}: {e.response.text}",
                )
            except httpx.RequestError as e:
                return UnbrowseResult(
                    success=False,
                    error=f"Connection error: {str(e)}",
                )

    async def search_skills(self, query: str) -> list[dict[str, Any]]:
        """Search the Unbrowse skill marketplace by intent.

        POST /v1/search
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.api_url}/v1/search",
                    json={"intent": query, "k": 10},
                    headers=self._headers(),
                )
                response.raise_for_status()
                return response.json().get("results", [])
            except httpx.HTTPError:
                return []

    async def search_domain(self, intent: str, domain: str) -> list[dict[str, Any]]:
        """Search skills narrowed to a specific domain.

        POST /v1/search/domain
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.api_url}/v1/search/domain",
                    json={"intent": intent, "domain": domain, "k": 10},
                    headers=self._headers(),
                )
                response.raise_for_status()
                return response.json().get("results", [])
            except httpx.HTTPError:
                return []

    async def get_platform_stats(self) -> Optional[dict[str, Any]]:
        """Get Unbrowse platform-wide statistics.

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

    async def get_agent_profile(self) -> Optional[dict[str, Any]]:
        """Get the authenticated agent's profile.

        GET /v1/agents/me
        """
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(
                    f"{self.api_url}/v1/agents/me",
                    headers=self._headers(),
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError:
                return None


unbrowse_client = UnbrowseClient()
