import random
import joblib
import os
from typing import Dict, Any, List
from backend.config import settings

class ModelService:
    def __init__(self):
        self.aqi_model = None
        self.type_model = None
        self.load_models()

    def load_models(self):
        """Charge les modèles .pkl s'ils sont présents dans le dossier models/"""
        try:
            if os.path.exists(settings.MODEL_AQI_PATH):
                self.aqi_model = joblib.load(settings.MODEL_AQI_PATH)
                print("✅ Modèle AQI chargé avec succès.")
            if os.path.exists(settings.MODEL_TYPE_PATH):
                self.type_model = joblib.load(settings.MODEL_TYPE_PATH)
                print("✅ Modèle Type Pollution chargé avec succès.")
        except Exception as e:
            print(f"⚠️ Erreur chargement modèles : {e}. Utilisation des mocks.")

    def predict_aqi(self, features: Dict[str, Any]) -> int:
        if self.aqi_model:
            # Ici on passera le vecteur de features réel extrait de Open-Meteo
            # return int(self.aqi_model.predict([list(features.values())])[0])
            pass
        
        # Fallback Mock intelligent
        base_aqi = 40
        temp = features.get("temp", 30)
        wind = features.get("wind_speed", 10)
        if temp > 30: base_aqi += 50
        if wind < 5: base_aqi += 40
        return min(500, base_aqi + random.randint(0, 30))

    def predict_pollution_type(self, aqi: int, features: Dict[str, Any]) -> str:
        if self.type_model:
            # return self.type_model.predict([[aqi, features['humidity'], ...]])[0]
            pass
            
        types = ["Poussière/Harmattan", "Brulage agricole", "Industrie", "Trafic urbain", "Ozone"]
        if aqi > 150:
            return types[0] if features.get("humidity", 50) < 30 else types[2]
        return random.choice(types)

    def get_health_advice(self, aqi: int, profile: str = "parent") -> List[str]:
        if aqi <= 50: return ["L'air est pur.", "Activité extérieure recommandée."]
        if aqi <= 100: return ["Air acceptable.", "Pensez à aérer."]
        if aqi <= 150: return ["Portez un masque.", "Limitez les efforts intenses."]
        return ["RESTEZ À L'INTÉRIEUR.", "Masque FFP2 obligatoire."]

model_service = ModelService()
