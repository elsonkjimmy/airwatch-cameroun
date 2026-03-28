from fastapi import APIRouter
from pydantic import BaseModel
from datetime import date
from typing import List
from backend.services.model_service import model_service

router = APIRouter(prefix="/api/predict", tags=["Prédiction"])

class PredictRequest(BaseModel):
    lat: float
    lon: float
    target_date: date

class PredictResponse(BaseModel):
    aqi: int
    pm25: float
    type_pollution: str
    niveau: int
    conseils: List[str]

@router.post("/", response_model=PredictResponse)
async def predict_aqi_date(req: PredictRequest):
    # Mocking features for the prediction date
    mock_features = {"temp": 32, "humidity": 25, "wind_speed": 4}
    
    aqi = model_service.predict_aqi(mock_features)
    p_type = model_service.predict_pollution_type(aqi, mock_features)
    
    return {
        "aqi": aqi,
        "pm25": round(aqi * 0.31, 1), # Facteur de conversion mock
        "type_pollution": p_type,
        "niveau": 2 if aqi > 150 else 1,
        "conseils": model_service.get_health_advice(aqi)
    }
