"""
HealthOS Backend - FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, modules, mental_health
from app.core.config import settings

app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description=(
        "HealthOS is a modular, AI-assisted health screening platform. "
        "This API powers preliminary health screening tools. "
        "Results are not medical diagnoses and do not replace professional evaluation."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, tags=["System"])
app.include_router(modules.router, prefix="/api", tags=["Modules"])
app.include_router(mental_health.router, prefix="/api/mental-health", tags=["Mental Health"])


@app.get("/", tags=["System"])
def root():
    """Basic application information."""
    return {
        "application": "HealthOS",
        "version": settings.APP_VERSION,
        "description": (
            "A modular health screening platform. "
            "Screenings are preliminary and do not constitute medical diagnoses."
        ),
        "docs": "/docs",
        "health_check": "/api/health",
        "modules": "/api/modules",
    }
