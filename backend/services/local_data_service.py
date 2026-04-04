"""
Service de données locales pour AirWatch
Charge les données depuis les fichiers JSON embarqués
Fonctionne 100% hors-ligne sans dépendances externes
"""

import json
import os
from typing import List, Dict, Any, Optional
from pathlib import Path

# Chemin vers les données
DATA_DIR = Path(__file__).parent.parent.parent / "frontend" / "src" / "data"
BACKEND_DATA_DIR = Path(__file__).parent.parent.parent / "data"

class LocalDataService:
    def __init__(self):
        self.cities = []
        self.regions = []
        self.monthly = []
        self.load_data()

    def load_data(self):
        """Charge toutes les données depuis les fichiers JSON"""
        try:
            cities_path = DATA_DIR / "cities.json"
            if cities_path.exists():
                with open(cities_path, 'r', encoding='utf-8') as f:
                    self.cities = json.load(f)
                print(f"✅ {len(self.cities)} villes chargées")

            regions_path = DATA_DIR / "regions.json"
            if regions_path.exists():
                with open(regions_path, 'r', encoding='utf-8') as f:
                    self.regions = json.load(f)
                print(f"✅ {len(self.regions)} régions chargées")

            monthly_path = DATA_DIR / "monthly.json"
            if monthly_path.exists():
                with open(monthly_path, 'r', encoding='utf-8') as f:
                    self.monthly = json.load(f)
                print(f"✅ Données mensuelles chargées")

        except Exception as e:
            print(f"⚠️ Erreur chargement données locales: {e}")

    def get_all_cities(self) -> List[Dict[str, Any]]:
        """Retourne toutes les villes avec leurs données"""
        return [
            {
                "name": city["name"],
                "region": city["region"],
                "latitude": city["latitude"],
                "longitude": city["longitude"],
                "aqi": city["current"]["aqi"],
                "pm25": city["current"]["pm25"],
                "pm10": city["current"]["pm10"],
                "temperature": city["current"].get("tempMean"),
                "wind_speed": city["current"].get("windSpeed"),
                "last_update": city["lastUpdate"]
            }
            for city in self.cities
        ]

    def get_city_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Trouve une ville par son nom"""
        for city in self.cities:
            if city["name"].lower() == name.lower():
                return city
        return None

    def get_city_aqi_data(self, ville_id: str) -> Optional[Dict[str, Any]]:
        """Retourne les données AQI complètes pour une ville"""
        city = self.get_city_by_name(ville_id)
        if not city:
            return None

        base_aqi = city["current"]["aqi"] or 50
        
        # Générer historique simulé basé sur l'AQI actuel
        import random
        historique = [
            {"day": i, "aqi": max(10, min(300, int(base_aqi * (0.8 + random.random() * 0.4))))}
            for i in range(1, 31)
        ]

        return {
            "ville": city["name"],
            "region": city["region"],
            "aqi_actuel": city["current"]["aqi"],
            "pm25": city["current"]["pm25"],
            "pm10": city["current"]["pm10"],
            "dust": city["current"].get("dust"),
            "temperature": city["current"].get("tempMean"),
            "temp_max": city["current"].get("tempMax"),
            "temp_min": city["current"].get("tempMin"),
            "wind_speed": city["current"].get("windSpeed"),
            "wind_gusts": city["current"].get("windGusts"),
            "precipitation": city["current"].get("precipitation"),
            "aqi_demain": max(10, int(base_aqi * (0.9 + random.random() * 0.2))),
            "aqi_apres_demain": max(10, int(base_aqi * (0.85 + random.random() * 0.3))),
            "historique_30j": historique,
            "derniere_maj": city["lastUpdate"]
        }

    def get_cities_by_region(self, region: str) -> List[Dict[str, Any]]:
        """Retourne toutes les villes d'une région"""
        return [
            city for city in self.cities
            if city["region"].lower() == region.lower()
        ]

    def get_region_stats(self, region_name: str) -> Optional[Dict[str, Any]]:
        """Retourne les statistiques d'une région"""
        region_cities = self.get_cities_by_region(region_name)
        if not region_cities:
            return None

        avg_aqi = sum(c["current"]["aqi"] or 0 for c in region_cities) / len(region_cities)
        avg_pm25 = sum(c["current"]["pm25"] or 0 for c in region_cities) / len(region_cities)

        sorted_by_aqi = sorted(region_cities, key=lambda c: c["current"]["aqi"] or 0, reverse=True)

        return {
            "region": region_name,
            "cities_count": len(region_cities),
            "avg_aqi": round(avg_aqi),
            "avg_pm25": round(avg_pm25, 1),
            "worst_city": sorted_by_aqi[0]["name"] if sorted_by_aqi else None,
            "best_city": sorted_by_aqi[-1]["name"] if sorted_by_aqi else None
        }

    def get_top_polluted(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Retourne les villes les plus polluées"""
        sorted_cities = sorted(
            self.cities,
            key=lambda c: c["current"]["aqi"] or 0,
            reverse=True
        )[:limit]
        
        return [
            {
                "name": c["name"],
                "region": c["region"],
                "aqi": c["current"]["aqi"],
                "pm25": c["current"]["pm25"]
            }
            for c in sorted_cities
        ]

    def get_cleanest_cities(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Retourne les villes les plus propres"""
        sorted_cities = sorted(
            self.cities,
            key=lambda c: c["current"]["aqi"] or 999
        )[:limit]
        
        return [
            {
                "name": c["name"],
                "region": c["region"],
                "aqi": c["current"]["aqi"],
                "pm25": c["current"]["pm25"]
            }
            for c in sorted_cities
        ]

    def get_national_stats(self) -> Dict[str, Any]:
        """Retourne les statistiques nationales"""
        total = len(self.cities)
        avg_aqi = sum(c["current"]["aqi"] or 0 for c in self.cities) / total
        avg_pm25 = sum(c["current"]["pm25"] or 0 for c in self.cities) / total

        critical = sum(1 for c in self.cities if (c["current"]["aqi"] or 0) >= 150)
        bad = sum(1 for c in self.cities if 100 <= (c["current"]["aqi"] or 0) < 150)
        moderate = sum(1 for c in self.cities if 50 <= (c["current"]["aqi"] or 0) < 100)
        good = sum(1 for c in self.cities if (c["current"]["aqi"] or 0) < 50)

        return {
            "total_cities": total,
            "avg_aqi": round(avg_aqi),
            "avg_pm25": round(avg_pm25, 1),
            "distribution": {
                "critical": critical,
                "bad": bad,
                "moderate": moderate,
                "good": good
            }
        }

    def find_nearest_city(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """Trouve la ville la plus proche d'une coordonnée"""
        nearest = None
        min_distance = float('inf')

        for city in self.cities:
            distance = ((city["latitude"] - lat) ** 2 + (city["longitude"] - lon) ** 2) ** 0.5
            if distance < min_distance:
                min_distance = distance
                nearest = city

        return nearest


# Instance singleton
local_data_service = LocalDataService()
