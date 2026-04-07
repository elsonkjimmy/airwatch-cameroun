"""
AirWatch — Model Service
Loads airwatch_pipeline_v2.pkl and routes predictions.
Falls back to mock values if the pickle fails.
"""

import io
import json
import pickle
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd

from backend.config import settings
from backend.services.data_loader import (
    get_city_lookback, get_city_enc, get_feature_cols, get_full_feature_cols
)

MODELS_DIR = Path(__file__).parent.parent / "models"


def _load_json(filename: str):
    path = MODELS_DIR / filename
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


import sys


def _inject_pipeline_stub():
    """
    The pipeline pickle was saved from a Jupyter notebook where AirWatchPipeline
    was defined in __main__. When uvicorn runs, __main__ is the uvicorn entrypoint
    and doesn't have that class. We inject a stub so pickle can deserialize the object.
    """
    import types

    # Build a stub class that pickle can bind the serialized state to.
    # The real methods will come from the pickled __dict__.
    class AirWatchPipeline:
        """Stub for unpickling. Real implementation comes from pickle state."""
        def predict(self, df):
            raise NotImplementedError("Stub — should be replaced by pickle state")

    class AirWatchLSTM:
        """Stub for unpickling LSTM model stored inside pipeline."""
        pass

    # Also create stubs for any other top-level classes that might be referenced
    class LSTMRegressor:
        pass

    class XGBPollutionClassifier:
        pass

    # Inject into __main__ so pickle's class lookup succeeds
    main_mod = sys.modules.get("__main__")
    if main_mod is None:
        main_mod = types.ModuleType("__main__")
        sys.modules["__main__"] = main_mod

    for cls in [AirWatchPipeline, AirWatchLSTM, LSTMRegressor, XGBPollutionClassifier]:
        if not hasattr(main_mod, cls.__name__):
            setattr(main_mod, cls.__name__, cls)


class CPUUnpickler(pickle.Unpickler):
    """
    Remaps CUDA tensors → CPU during unpickling.
    Needed when the pipeline was trained on GPU but the server runs CPU-only.
    """
    def find_class(self, module, name):
        if module == "torch.storage" and name == "_load_from_bytes":
            try:
                import torch
                return lambda b: torch.load(
                    io.BytesIO(b), map_location="cpu", weights_only=False
                )
            except ImportError:
                pass
        return super().find_class(module, name)


class ModelService:
    def __init__(self):
        self.pipeline = None
        self.pattern_encoding: dict = {}   # int_str → label string
        self.city_encoding: dict = {}      # city_name → int
        self._load_models()

    def _load_models(self):
        """Load the AirWatch pipeline pickle and JSON metadata."""
        pkl_path = Path(settings.MODEL_PIPELINE_PATH)
        try:
            if pkl_path.exists():
                _inject_pipeline_stub()          # ← must come before pickle.load
                with open(pkl_path, "rb") as f:
                    self.pipeline = CPUUnpickler(f).load()   # CPU-safe
                print("✅ airwatch_pipeline_v2.pkl loaded successfully.")
            else:
                print(f"⚠️  Pipeline not found at {pkl_path}. Using mock predictions.")
        except Exception as e:
            print(f"⚠️  Failed to load pipeline: {e}. Using mock predictions.")


        raw_pattern = _load_json("pattern_encoding.json")
        self.pattern_encoding = raw_pattern  # {"0": "qualite_acceptable", ...}

        raw_city = _load_json("city_encoding.json")
        # city_encoding.json: {"0": "Bafoussam", ...} → invert
        self.city_encoding = {v: int(k) for k, v in raw_city.items()} if raw_city else {}

    # ─── Real pipeline call ───────────────────────────────────────────────────

    def predict_for_city(self, city_name: str) -> Optional[Dict[str, Any]]:
        """
        Run the full LSTM+XGBoost pipeline for one city.
        Returns dict with aqi_value, aqi_label, pollution_type — or None on failure.
        """
        if self.pipeline is None:
            return None

        lookback = get_city_lookback(city_name, n=24)
        if lookback is None or lookback.empty:
            print(f"⚠️  No lookback data for {city_name}")
            return None

        # Get city_enc
        city_enc = get_city_enc(city_name)
        if city_enc is None:
            print(f"⚠️  Unknown city_enc for {city_name}")
            return None

        try:
            feature_cols = get_feature_cols()  # 24 LSTM feature names

            # Ensure all required columns exist (fill missing with 0)
            for col in feature_cols:
                if col not in lookback.columns:
                    lookback[col] = 0.0

            df_input = lookback[feature_cols].copy()
            df_input["city_enc"] = city_enc

            # Also add region_enc if available
            if "region_enc" in lookback.columns:
                df_input["region_enc"] = lookback["region_enc"].iloc[-1]
            else:
                df_input["region_enc"] = 0

            results = self.pipeline.predict(df_input)

            # Results is a list of dicts; take the last one (most recent prediction)
            if results:
                r = results[-1] if isinstance(results, list) else results
                return {
                    "aqi_value": float(r.get("aqi_value", 50)),
                    "aqi_label": r.get("aqi_label", "moderate"),
                    "pollution_type": r.get("pollution_type", "qualite_acceptable"),
                }
        except Exception as e:
            print(f"⚠️  Pipeline prediction error for {city_name}: {e}")

        return None

    # ─── Convenience wrappers (keep existing interface) ───────────────────────

    def predict_aqi(self, city_name: str = "", features: Dict[str, Any] = None) -> int:
        """Returns AQI as integer. Uses real pipeline if available."""
        result = self.predict_for_city(city_name) if city_name else None
        if result:
            return int(round(result["aqi_value"]))

        # Mock fallback
        import random
        f = features or {}
        base = 40
        if f.get("temp", 30) > 30:
            base += 50
        if f.get("wind_speed", 10) < 5:
            base += 40
        return min(500, base + random.randint(0, 30))

    def predict_pollution_type(self, city_name: str = "", aqi: int = 0,
                               features: Dict[str, Any] = None) -> str:
        """Returns pollution pattern label string. Uses real pipeline if available."""
        result = self.predict_for_city(city_name) if city_name else None
        if result:
            return result["pollution_type"]

        # Mock fallback
        import random
        types = ["Poussière/Harmattan", "Brulage agricole", "Industrie",
                 "Trafic urbain", "Ozone"]
        if aqi > 150:
            f = features or {}
            return types[0] if f.get("humidity", 50) < 30 else types[2]
        return random.choice(types)

    def predict_full(self, city_name: str) -> Dict[str, Any]:
        """
        Full prediction: returns aqi_value, aqi_label, pollution_type.
        Uses real pipeline; falls back to mock on failure.
        """
        result = self.predict_for_city(city_name)
        if result:
            return result

        # Mock fallback
        import random
        aqi = self.predict_aqi(features={"temp": 30, "wind_speed": 8})
        label = (
            "hazardous" if aqi >= 301 else
            "very_unhealthy" if aqi >= 201 else
            "unhealthy" if aqi >= 151 else
            "unhealthy_sensitive" if aqi >= 101 else
            "moderate" if aqi >= 51 else "good"
        )
        return {
            "aqi_value": float(aqi),
            "aqi_label": label,
            "pollution_type": random.choice([
                "episode_poussieres", "stress_thermique",
                "stagnation_atmospherique", "qualite_acceptable"
            ])
        }

    def get_health_advice(self, aqi: int, profile: str = "general") -> List[str]:
        if aqi <= 50:
            return ["L'air est bon.", "Activité extérieure sans restriction."]
        if aqi <= 100:
            return ["Air acceptable.", "Pensez à aérer vos espaces intérieurs."]
        if aqi <= 150:
            return ["Portez un masque à l'extérieur.", "Limitez les efforts physiques intenses."]
        if aqi <= 200:
            return ["AIR MAUVAIS.", "Groupes sensibles : restez à l'intérieur.", "Masque FFP2 recommandé."]
        return ["DANGER — RESTEZ À L'INTÉRIEUR.", "Masque FFP2 obligatoire si sortie.",
                "Fermez portes et fenêtres."]


model_service = ModelService()
