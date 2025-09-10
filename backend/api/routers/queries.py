from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import sys
import os

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from schemas import *
from models import QueryService
import uuid

router = APIRouter(prefix="/api/v1/query", tags=["queries"])

@router.post("/voice", response_model=QueryResponse)
async def query_voice(
    audio: UploadFile = File(...),
    farmer_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    crop_type: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
    farm_size: Optional[str] = Form(None),
    farming_type: Optional[str] = Form(None)
):
    """Accepts voice input, processes speech-to-text, and initiates query handling."""
    try:
        # TODO: Implement speech-to-text processing here
        # For now, we'll create a placeholder query
        query_data = QueryCreate(
            query_text=f"Voice query from audio file: {audio.filename}",
            query_type=QueryType.VOICE,
            farmer_name=farmer_name,
            phone=phone,
            location=location,
            district=district,
            state=state,
            crop_type=crop_type,
            season=season,
            farm_size=farm_size,
            farming_type=farming_type
        )
        
        result = await QueryService.create_query(query_data)
        return QueryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text", response_model=QueryResponse)
async def query_text(
    text: str = Form(...),
    language: Language = Form(...),
    farmer_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    crop_type: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
    farm_size: Optional[str] = Form(None),
    farming_type: Optional[str] = Form(None)
):
    """Accepts text queries for AI advisory system."""
    try:
        query_data = QueryCreate(
            query_text=text,
            query_type=QueryType.TEXT,
            language=language,
            farmer_name=farmer_name,
            phone=phone,
            location=location,
            district=district,
            state=state,
            crop_type=crop_type,
            season=season,
            farm_size=farm_size,
            farming_type=farming_type
        )
        
        result = await QueryService.create_query(query_data)
        return QueryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image", response_model=QueryResponse)
async def query_image(
    image: UploadFile = File(...),
    farmer_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    crop_type: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
    farm_size: Optional[str] = Form(None),
    farming_type: Optional[str] = Form(None)
):
    """Receives image uploads for AI analysis."""
    try:
        # TODO: Implement image processing here
        query_data = QueryCreate(
            query_text=f"Image query from file: {image.filename}",
            query_type=QueryType.IMAGE,
            farmer_name=farmer_name,
            phone=phone,
            location=location,
            district=district,
            state=state,
            crop_type=crop_type,
            season=season,
            farm_size=farm_size,
            farming_type=farming_type
        )
        
        result = await QueryService.create_query(query_data)
        return QueryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/result/{query_id}", response_model=QueryResponse)
async def get_query_result(query_id: str):
    """Retrieves the response/advisory for a submitted query."""
    try:
        result = await QueryService.get_query_by_id(query_id)
        if not result:
            raise HTTPException(status_code=404, detail="Query not found")
        return QueryResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
