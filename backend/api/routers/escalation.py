from fastapi import APIRouter, HTTPException
import sys
import os

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from schemas import *
from models import EscalationService

router = APIRouter(prefix="/api/v1/escalation", tags=["escalation"])

@router.post("/", response_model=EscalationResponse)
async def escalate_query(escalation: EscalationCreate):
    """Forwards complex queries to local agri officers."""
    try:
        result = await EscalationService.create_escalation(escalation)
        return EscalationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
