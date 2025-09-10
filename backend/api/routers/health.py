from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["health"])

@router.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "krishi-jyoti-api"}

@router.get("/languages")
def get_languages():
    """Returns supported languages."""
    return {"languages": ["Malayalam", "English", "Hindi"]}

@router.get("/docs")
def get_docs():
    """Auto-generated API documentation."""
    return {"docs": "API documentation available at /docs"}
