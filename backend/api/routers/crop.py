
from fastapi import APIRouter, Form, HTTPException
from typing import Optional
from schemas import *
from models import QueryService
from Wheather.crop_recommendation import CropChatBot

router = APIRouter(prefix="/api/v1/crop", tags=["crop"])




@router.post("/recommendation")
async def get_crop_recommendation(query: str = Form(...)):
    """Simple crop recommendation chatbot endpoint. Receives a user query and returns the chatbot response."""
    try:
        chatbot = CropChatBot()
        response_text = chatbot.get_response(query)
        return {"response_text": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

