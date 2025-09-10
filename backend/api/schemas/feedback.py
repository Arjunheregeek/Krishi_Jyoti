from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Feedback Schemas (Anonymous)
class FeedbackBase(BaseModel):
    query_id: str
    rating: int  # 1-5
    comments: Optional[str] = None
    is_helpful: bool

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackResponse(FeedbackBase):
    id: str
    created_at: datetime
