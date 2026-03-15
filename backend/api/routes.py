"""Main API router — aggregates all sub-routers into a single router."""

from fastapi import APIRouter

from backend.api.routes_actions import router as actions_router
from backend.api.routes_agents import router as agents_router
from backend.api.routes_reputation import router as reputation_router
from backend.api.routes_stats import router as stats_router
from backend.api.routes_subnet import router as subnet_router
from backend.api.routes_verification import router as verification_router

router = APIRouter()

router.include_router(verification_router)
router.include_router(agents_router)
router.include_router(actions_router)
router.include_router(subnet_router)
router.include_router(reputation_router)
router.include_router(stats_router)
