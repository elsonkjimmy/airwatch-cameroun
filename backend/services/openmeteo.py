import httpx
from typing import Dict, Any

async def get_weather_data(lat: float, lon: float) -> Dict[str, Any]:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "shortwave_radiation", "weather_code"],
        "timezone": "auto"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                current = data.get("current", {})
                return {
                    "temp": current.get("temperature_2m"),
                    "humidity": current.get("relative_humidity_2m"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "radiation": current.get("shortwave_radiation"),
                    "weather_code": current.get("weather_code")
                }
        except Exception:
            pass
        return {"temp": 30, "humidity": 40, "wind_speed": 10, "radiation": 500} # Fallback
