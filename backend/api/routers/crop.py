from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import sys
import os

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from schemas import *
from models import QueryService
import uuid

router = APIRouter(prefix="/api/v1/crop", tags=["crop"])

@router.post("/disease-detection", response_model=QueryResponse)
async def detect_crop_disease(
    image: UploadFile = File(...),
    farmer_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    crop_type: str = Form(...),  # Required for disease detection
    language: Language = Form(Language.MALAYALAM)
):
    """Detects crop diseases from uploaded images using ML model."""
    try:
        # Validate image file
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # TODO: Add image processing and ML model integration here
        # 1. Save/process the uploaded image
        # 2. Run through disease detection ML model
        # 3. Get disease prediction and confidence score
        
        query_data = QueryCreate(
            query_text=f"Disease detection for {crop_type} crop from image: {image.filename}",
            query_type=QueryType.IMAGE,
            language=language,
            farmer_name=farmer_name,
            phone=phone,
            location=location,
            district=district,
            state=state,
            crop_type=crop_type,
            season=None,
            farm_size=None,
            farming_type=None
        )
        
        result = await QueryService.create_query(query_data)
        
        # TODO: In production, update the result with ML model prediction
        # await QueryService.update_query(result['id'], QueryUpdate(
        #     status=QueryStatus.COMPLETED,
        #     response_text="Disease detected: Leaf Blight",
        #     confidence_score=0.85
        # ))
        
        return QueryResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendation", response_model=QueryResponse)
async def get_crop_recommendation(
    farmer_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    location: str = Form(...),  # Required for recommendations
    district: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    season: str = Form(...),  # Required for recommendations
    farm_size: Optional[str] = Form(None),
    farming_type: Optional[str] = Form(None),
    soil_type: Optional[str] = Form(None),
    water_availability: Optional[str] = Form(None),
    budget_range: Optional[str] = Form(None),
    market_preference: Optional[str] = Form(None),
    language: Language = Form(Language.MALAYALAM)
):
    """Recommends suitable crops based on farmer's inputs and location."""
    try:
        # TODO: Add AI model integration here
        # 1. Process farmer inputs (location, season, soil, etc.)
        # 2. Run through crop recommendation AI model
        # 3. Get recommended crops with reasons
        
        query_text = f"Crop recommendation request for {location}, {season} season"
        if soil_type:
            query_text += f", {soil_type} soil"
        if farming_type:
            query_text += f", {farming_type} farming"
            
        query_data = QueryCreate(
            query_text=query_text,
            query_type=QueryType.TEXT,
            language=language,
            farmer_name=farmer_name,
            phone=phone,
            location=location,
            district=district,
            state=state,
            crop_type=None,  # Will be filled by recommendation
            season=season,
            farm_size=farm_size,
            farming_type=farming_type
        )
        
        result = await QueryService.create_query(query_data)
        
        # TODO: In production, update the result with AI model recommendation
        # await QueryService.update_query(result['id'], QueryUpdate(
        #     status=QueryStatus.COMPLETED,
        #     response_text="Recommended crops: Rice, Coconut, Banana based on your location and season",
        #     confidence_score=0.92
        # ))
        
        return QueryResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/diseases/{crop_type}")
async def get_common_diseases(crop_type: str):
    """Get common diseases for a specific crop type."""
    try:
        # TODO: Return common diseases for the crop from database
        common_diseases = {
            "rice": ["Blast", "Brown Spot", "Sheath Blight"],
            "banana": ["Panama Disease", "Black Sigatoka", "Bunchy Top"],
            "coconut": ["Lethal Yellowing", "Bud Rot", "Root Wilt"],
            "pepper": ["Anthracnose", "Bacterial Wilt", "Phytophthora"]
        }
        
        diseases = common_diseases.get(crop_type.lower(), ["No data available"])
        return {"crop_type": crop_type, "common_diseases": diseases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/seasons/{location}")
async def get_crop_seasons(location: str):
    """Get suitable crop seasons for a specific location."""
    try:
        # TODO: Return season information based on location from database
        return {
            "location": location,
            "seasons": {
                "kharif": {"months": "June-October", "suitable_crops": ["Rice", "Cotton", "Sugarcane"]},
                "rabi": {"months": "November-April", "suitable_crops": ["Wheat", "Barley", "Peas"]},
                "summer": {"months": "April-June", "suitable_crops": ["Watermelon", "Cucumber", "Fodder"]}
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
