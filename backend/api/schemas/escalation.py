from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Escalation Schemas (Anonymous)
class EscalationBase(BaseModel):
    query_id: str
    reason: str
    priority: str = "medium"  # low, medium, high
    agri_officer_notes: Optional[str] = None

class EscalationCreate(EscalationBase):
    pass

class EscalationResponse(EscalationBase):
    id: str
    status: str = "pending"  # pending, assigned, resolved
    created_at: datetime
    resolved_at: Optional[datetime] = None
