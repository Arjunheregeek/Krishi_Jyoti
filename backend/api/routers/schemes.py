from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import sys
import os

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from schemas import *

router = APIRouter(prefix="/api/v1/schemes", tags=["government_schemes"])

@router.get("/msp")
async def get_msp_rates(
    crop_type: Optional[str] = Query(None, description="Filter by crop type"),
    year: Optional[str] = Query(None, description="Filter by year"),
    state: Optional[str] = Query(None, description="Filter by state")
):
    """Get Minimum Support Price (MSP) rates for crops."""
    try:
        # TODO: Fetch real MSP data from government APIs or database
        sample_msp_data = {
            "year": "2024-25",
            "crops": [
                {
                    "crop_name": "Rice (Paddy)",
                    "variety": "Common",
                    "msp_rate": 2183,
                    "unit": "per quintal",
                    "increase_from_previous": 117
                },
                {
                    "crop_name": "Wheat",
                    "variety": "Common",
                    "msp_rate": 2275,
                    "unit": "per quintal", 
                    "increase_from_previous": 150
                },
                {
                    "crop_name": "Cotton",
                    "variety": "Medium Staple",
                    "msp_rate": 6620,
                    "unit": "per quintal",
                    "increase_from_previous": 300
                }
            ]
        }
        
        # Filter by crop if specified
        if crop_type:
            filtered_crops = [crop for crop in sample_msp_data["crops"] 
                            if crop_type.lower() in crop["crop_name"].lower()]
            sample_msp_data["crops"] = filtered_crops
            
        return sample_msp_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all")
async def get_all_schemes(
    category: Optional[str] = Query(None, description="Filter by scheme category"),
    state: Optional[str] = Query(None, description="Filter by state"),
    crop_type: Optional[str] = Query(None, description="Filter by crop type"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(10, description="Items per page")
):
    """Get all government schemes for farmers."""
    try:
        # TODO: Fetch real scheme data from database
        sample_schemes = [
            {
                "id": "pm-kisan",
                "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                "category": "Direct Benefit Transfer",
                "description": "Financial support of ₹6,000 per year to farmer families",
                "eligibility": "All landholding farmer families",
                "benefit_amount": "₹2,000 per installment (3 installments/year)",
                "application_process": "Online/Offline through CSC/Agriculture Department",
                "documents_required": ["Land records", "Aadhaar card", "Bank account"],
                "website": "https://pmkisan.gov.in",
                "is_active": True
            },
            {
                "id": "pm-fasal-bima",
                "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                "category": "Crop Insurance",
                "description": "Crop insurance scheme to protect farmers against crop losses",
                "eligibility": "All farmers growing notified crops",
                "benefit_amount": "Up to ₹2 lakh coverage per hectare",
                "application_process": "Through banks/insurance companies",
                "documents_required": ["Land records", "Sowing certificate", "Aadhaar"],
                "website": "https://pmfby.gov.in",
                "is_active": True
            },
            {
                "id": "kcc",
                "name": "Kisan Credit Card (KCC)",
                "category": "Credit Support",
                "description": "Provides credit support for crop cultivation and allied activities",
                "eligibility": "All eligible farmers including tenant farmers",
                "benefit_amount": "Credit limit based on scale of finance",
                "application_process": "Through banks",
                "documents_required": ["KYC documents", "Land records", "Identity proof"],
                "website": "https://kcc.gov.in",
                "is_active": True
            },
            {
                "id": "soil-health-card",
                "name": "Soil Health Card Scheme",
                "category": "Soil Testing",
                "description": "Provides soil health cards to farmers for better crop management",
                "eligibility": "All farmers",
                "benefit_amount": "Free soil testing and recommendations",
                "application_process": "Through Agriculture Department",
                "documents_required": ["Land records", "Identity proof"],
                "website": "https://soilhealth.dac.gov.in",
                "is_active": True
            }
        ]
        
        # Apply filters
        filtered_schemes = sample_schemes
        if category:
            filtered_schemes = [s for s in filtered_schemes if category.lower() in s["category"].lower()]
        
        # Pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_schemes = filtered_schemes[start_idx:end_idx]
        
        return {
            "schemes": paginated_schemes,
            "total": len(filtered_schemes),
            "page": page,
            "limit": limit,
            "total_pages": (len(filtered_schemes) + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{scheme_id}")
async def get_scheme_details(scheme_id: str):
    """Get detailed information about a specific government scheme."""
    try:
        # TODO: Fetch from database
        scheme_details = {
            "pm-kisan": {
                "id": "pm-kisan",
                "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                "category": "Direct Benefit Transfer",
                "description": "The PM-KISAN scheme provides financial support of ₹6,000 per year to eligible farmer families across the country in three equal installments of ₹2,000 each.",
                "detailed_description": "This scheme aims to supplement the financial needs of the farmers in procuring various inputs to ensure proper crop health and appropriate yields.",
                "eligibility_criteria": [
                    "All landholding farmer families",
                    "Farmer families having cultivable land holding",
                    "Families with combined land holding/ownership"
                ],
                "exclusion_criteria": [
                    "Institutional landholders",
                    "Farmer families with any family member as government employee",
                    "Income tax payers"
                ],
                "benefit_amount": "₹6,000 per year in 3 installments",
                "application_process": {
                    "steps": [
                        "Visit PM-KISAN website or nearest CSC",
                        "Fill registration form with required details",
                        "Upload necessary documents",
                        "Submit application and get acknowledgment",
                        "Track application status online"
                    ],
                    "online_url": "https://pmkisan.gov.in",
                    "offline_centers": ["CSC", "Agriculture Department", "Village Revenue Officer"]
                },
                "documents_required": [
                    "Citizenship of India",
                    "Land ownership documents",
                    "Aadhaar card",
                    "Bank account details",
                    "Mobile number"
                ],
                "contact_info": {
                    "helpline": "155261",
                    "email": "pmkisan-ict@gov.in",
                    "website": "https://pmkisan.gov.in"
                },
                "last_updated": "2024-09-01",
                "is_active": True
            }
        }
        
        if scheme_id not in scheme_details:
            raise HTTPException(status_code=404, detail="Scheme not found")
            
        return scheme_details[scheme_id]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/subsidies/fertilizer")
async def get_fertilizer_subsidies(
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district")
):
    """Get fertilizer subsidy information."""
    try:
        # TODO: Fetch real subsidy data
        subsidy_info = {
            "fertilizer_subsidies": [
                {
                    "fertilizer_type": "Urea",
                    "subsidy_rate": "₹17,000 per MT",
                    "farmer_price": "₹266.50 per 45kg bag",
                    "actual_cost": "₹2,400 per 45kg bag",
                    "subsidy_percentage": "89%"
                },
                {
                    "fertilizer_type": "DAP",
                    "subsidy_rate": "₹15,000 per MT",
                    "farmer_price": "₹1,350 per 50kg bag",
                    "actual_cost": "₹2,100 per 50kg bag",
                    "subsidy_percentage": "36%"
                },
                {
                    "fertilizer_type": "MOP",
                    "subsidy_rate": "₹10,000 per MT", 
                    "farmer_price": "₹1,700 per 50kg bag",
                    "actual_cost": "₹2,200 per 50kg bag",
                    "subsidy_percentage": "23%"
                }
            ],
            "how_to_avail": [
                "Purchase from authorized dealers only",
                "Carry Aadhaar card and land documents", 
                "Subsidy is directly provided at point of sale",
                "Check dealer authorization status"
            ]
        }
        
        return subsidy_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query", response_model=QueryResponse)
async def ask_scheme_question(
    question: str,
    farmer_name: Optional[str] = None,
    phone: Optional[str] = None,
    location: Optional[str] = None,
    language: Language = Language.MALAYALAM
):
    """Ask questions about government schemes and get AI-powered responses."""
    try:
        # TODO: Process through AI model for scheme-related queries
        query_data = QueryCreate(
            query_text=f"Government scheme query: {question}",
            query_type=QueryType.TEXT,
            language=language,
            farmer_name=farmer_name,
            phone=phone,
            location=location
        )
        
        # This would integrate with your QueryService
        # result = await QueryService.create_query(query_data)
        
        # Mock response for now
        mock_result = {
            "id": "scheme_query_123",
            "query_text": query_data.query_text,
            "query_type": query_data.query_type.value,
            "language": query_data.language.value,
            "farmer_name": farmer_name,
            "phone": phone,
            "location": location,
            "status": "completed",
            "response_text": f"Based on your question about '{question}', here are relevant schemes and information. This would be processed by AI in production.",
            "confidence_score": 0.85,
            "created_at": "2024-09-10T10:00:00Z"
        }
        
        return QueryResponse(**mock_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
