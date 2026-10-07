"""Health check endpoint."""
from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/api/health")
def health_check():
    """Returns backend health status."""
    return {
        "status": "ok",
        "service": "HealthOS Backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
