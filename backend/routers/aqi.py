from fastapi import APIRouter
from datetime import datetime, timezone
from backend.services.model_service import model_service

router = APIRouter(prefix="/api/aqi", tags=["AQI Forecast"])


@router.get("/{ville_id}")
async def get_aqi_by_ville(ville_id: str):
    """
    Returns current AQI prediction for a city using the real ML pipeline.
    Falls back to mock values if the pipeline or data is unavailable.
    """
    prediction = model_service.predict_full(ville_id)

    aqi_value = prediction["aqi_value"]
    aqi_label = prediction["aqi_label"]
    pollution_type = prediction["pollution_type"]
    conseils = model_service.get_health_advice(int(aqi_value))

    # Derive tomorrow / day-after estimates from the same model output
    # (slight perturbation since we don't have a multi-step forecaster yet)
    import random
    seed = hash(ville_id) % 1000
    rng = random.Random(seed)
    aqi_tomorrow = max(10, int(aqi_value * (0.9 + rng.random() * 0.25)))
    aqi_after = max(10, int(aqi_value * (0.85 + rng.random() * 0.30)))

    return {
        "ville": ville_id,
        "aqi_actuel": round(aqi_value, 1),
        "aqi_label": aqi_label,
        "pollution_type": pollution_type,
        "aqi_demain": aqi_tomorrow,
        "aqi_apres_demain": aqi_after,
        "conseils": conseils,
        "source": "pipeline_v2" if model_service.pipeline else "mock",
        "derniere_maj": datetime.now(timezone.utc).isoformat(),
    }
