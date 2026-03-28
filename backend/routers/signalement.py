from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from backend.services.openmeteo import get_weather_data
from backend.services.model_service import model_service
from datetime import datetime

router = APIRouter(prefix="/api/signalement", tags=["Signalement"])

class SignalementRequest(BaseModel):
    lat: float
    lon: float
    user_id: str
    profile: Optional[str] = "parent"

class SignalementResponse(BaseModel):
    aqi: int
    type_pollution: str
    niveau: int
    conseils: List[str]
    timestamp: datetime
    ville: str = "Maroua" # Mocké pour l'instant

@router.post("/", response_model=SignalementResponse)
async def create_signalement(req: SignalementRequest):
    # 1. Appel Open-Meteo
    weather = await get_weather_data(req.lat, req.lon)
    
    # 2. Mock IA AQI
    aqi = model_service.predict_aqi(weather)
    
    # 3. Mock IA Type Pollution
    p_type = model_service.predict_pollution_type(aqi, weather)
    
    # 4. Logique de Niveaux
    niveau = 1
    if 150 <= aqi < 200:
        niveau = 2
    elif aqi >= 200:
        niveau = 3
        # TODO: Trigger Twilio SMS et WebSocket Alerte (Main.py)
    
    # 5. Conseils personnalisés
    conseils = model_service.get_health_advice(aqi, req.profile)
    
    return {
        "aqi": aqi,
        "type_pollution": p_type,
        "niveau": niveau,
        "conseils": conseils,
        "timestamp": datetime.now(),
        "ville": "Maroua"
    }
