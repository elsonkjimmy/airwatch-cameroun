from fastapi import APIRouter
from typing import List, Dict, Any
import random

router = APIRouter(prefix="/api/aqi", tags=["AQI Forecast"])

@router.get("/{ville_id}")
async def get_aqi_by_ville(ville_id: str):
    # Simulation d'historique
    historique = [
        {"day": i, "aqi": random.randint(40, 180)}
        for i in range(1, 31)
    ]
    
    return {
        "ville": ville_id.capitalize(),
        "aqi_actuel": random.randint(40, 250),
        "aqi_demain": random.randint(40, 200),
        "aqi_apres_demain": random.randint(40, 150),
        "historique_30j": historique,
        "derniere_maj": "2026-03-27T10:00:00Z"
    }
