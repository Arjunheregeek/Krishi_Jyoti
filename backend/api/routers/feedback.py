from fastapi import APIRouter, Form, HTTPException
from typing import Optional
import sys
import os

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from schemas import *
from models import FeedbackService

router = APIRouter(prefix="/api/v1/feedback", tags=["feedback"])

@router.post("/", response_model=FeedbackResponse)
async def submit_feedback(
    query_id: str = Form(...),
    rating: int = Form(...),
    comments: Optional[str] = Form(None),
    is_helpful: bool = Form(...)
):
    """Captures user feedback on advice."""
    try:
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
            
        feedback_data = FeedbackCreate(
            query_id=query_id,
            rating=rating,
            comments=comments,
            is_helpful=is_helpful
        )
        
        result = await FeedbackService.create_feedback(feedback_data)
        return FeedbackResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
