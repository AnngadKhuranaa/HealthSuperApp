"""Modules listing endpoint."""
from fastapi import APIRouter

router = APIRouter()

MODULES = [
    {
        "id": "mental-health",
        "name": "Mental Health Screening",
        "status": "available",
        "description": (
            "A structured self-report questionnaire to screen for common mental "
            "health symptoms. Results are not a diagnosis."
        ),
        "endpoint": "/api/mental-health/info",
    },
    {
        "id": "neurological",
        "name": "Neurological Screening",
        "status": "planned",
        "description": (
            "Planned: Speech, movement, and coordination tasks to observe "
            "neurological function. Not yet implemented."
        ),
        "endpoint": None,
    },
    {
        "id": "cardiovascular",
        "name": "Cardiovascular Screening",
        "status": "planned",
        "description": (
            "Planned: Heart rate, blood pressure, and wearable data integration "
            "to flag readings worth medical attention. Not yet implemented."
        ),
        "endpoint": None,
    },
]


@router.get("/modules")
def list_modules():
    """List all screening modules with their availability status."""
    return {
        "modules": MODULES,
        "note": (
            "Only 'available' modules are currently functional. "
            "'planned' modules are in development."
        ),
    }
