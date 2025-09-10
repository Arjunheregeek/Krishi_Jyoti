from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .enums import QueryType, QueryStatus, Language

# Query Schemas (Anonymous)
class QueryBase(BaseModel):
    query_text: Optional[str] = None
    query_type: QueryType
    language: Language = Language.MALAYALAM
    farmer_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    crop_type: Optional[str] = None
    season: Optional[str] = None
    farm_size: Optional[str] = None
    farming_type: Optional[str] = None

class QueryCreate(QueryBase):
    pass

class QueryUpdate(BaseModel):
    status: Optional[QueryStatus] = None
    response_text: Optional[str] = None
    confidence_score: Optional[float] = None

class QueryResponse(QueryBase):
    id: str
    status: QueryStatus
    response_text: Optional[str] = None
    confidence_score: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
