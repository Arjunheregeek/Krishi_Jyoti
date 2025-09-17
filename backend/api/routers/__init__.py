# Router package initialization
from .queries import router as queries_router
from .feedback import router as feedback_router
from .escalation import router as escalation_router
from .health import router as health_router
from .crop import router as crop_router
from .schemes import router as schemes_router
from .voice_ws import router as voice_ws_router

__all__ = [
    "queries_router",
    "feedback_router", 
    "escalation_router",
    "health_router",
    "crop_router",
    "schemes_router",
    "voice_ws_router"
]
