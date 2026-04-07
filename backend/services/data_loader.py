"""
AirWatch — Hourly Data Loader
Loads dataset_airwatch_hourly.xlsx once at startup.
Builds the 24-row lookback window for the ML pipeline.
"""

import json
import math
import os
from pathlib import Path
from typing import Optional
import pandas as pd

DATA_PATH = Path(__file__).parent.parent.parent / "data" / "dataset_airwatch_hourly.xlsx"
MODELS_DIR = Path(__file__).parent.parent / "models"

# ─── Cached data ──────────────────────────────────────────────────────────────
_df: Optional[pd.DataFrame] = None
_city_encoding: dict = {}       # city_name → city_enc int
_feature_cols: list = []        # 24 LSTM feature names
_full_feature_cols: list = []   # 26 features (incl. city_enc + region_enc)


def _load_json(filename: str) -> dict | list:
    path = MODELS_DIR / filename
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def _load_encodings():
    global _city_encoding, _feature_cols, _full_feature_cols

    # city_encoding.json may be {int_str: city_name} → invert to {city_name: int}
    raw_city_enc = _load_json("city_encoding.json")
    if raw_city_enc:
        _city_encoding = {v: int(k) for k, v in raw_city_enc.items()}

    feat = _load_json("lstm_feature_cols.json")
    _feature_cols = feat if isinstance(feat, list) else []

    full_feat = _load_json("feature_columns.json")
    _full_feature_cols = full_feat if isinstance(full_feat, list) else []


def _engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add all derived columns the model expects."""
    df = df.copy()

    # ── temporal ──────────────────────────────────────────────────────────────
    if "datetime" in df.columns:
        df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
        df["hour"] = df["datetime"].dt.hour
        df["month"] = df["datetime"].dt.month
    elif "hour" not in df.columns:
        df["hour"] = 0
    if "month" not in df.columns:
        df["month"] = 1

    df["hour_sin"] = df["hour"].apply(lambda h: math.sin(2 * math.pi * h / 24))
    df["hour_cos"] = df["hour"].apply(lambda h: math.cos(2 * math.pi * h / 24))
    df["month_sin"] = df["month"].apply(lambda m: math.sin(2 * math.pi * m / 12))
    df["month_cos"] = df["month"].apply(lambda m: math.cos(2 * math.pi * m / 12))
    df["is_dry_season"] = df["month"].apply(lambda m: 1 if m in [11, 12, 1, 2, 3] else 0)
    df["is_peak_heat_hour"] = df["hour"].apply(lambda h: 1 if 11 <= h <= 15 else 0)

    # ── derived weather ────────────────────────────────────────────────────────
    for col in ["temperature_2m", "relative_humidity_2m", "wind_speed_10m",
                "precipitation", "shortwave_radiation", "dust",
                "wind_direction_10m"]:
        if col not in df.columns:
            df[col] = 0.0

    df["heat_stress"] = df["temperature_2m"] * (1 - df["relative_humidity_2m"] / 100)
    df["dust_risk"] = df.apply(
        lambda r: 1 if (r.get("dust", 0) > 50 or
                        (r.get("wind_speed_10m", 0) > 15 and r.get("relative_humidity_2m", 100) < 30))
        else 0, axis=1)
    df["humidity_wind_ratio"] = df.apply(
        lambda r: r["relative_humidity_2m"] / (r["wind_speed_10m"] + 0.1), axis=1)
    df["is_no_wind"] = (df["wind_speed_10m"] < 1).astype(int)
    df["is_no_rain"] = (df["precipitation"] < 0.1).astype(int)

    wind_rad = df["wind_direction_10m"].apply(lambda d: math.radians(d))
    df["wind_dir_sin"] = wind_rad.apply(math.sin)
    df["wind_dir_cos"] = wind_rad.apply(math.cos)

    # ── FIRMS fire (may not be in hourly CSV — default 0) ─────────────────────
    for col in ["has_fire_nearby", "fire_count_50km", "fire_count_100km",
                "max_frp_50km", "total_frp_100km"]:
        if col not in df.columns:
            df[col] = 0.0

    return df


def load_dataset():
    """Load hourly Excel file and prepare features. Called once at startup."""
    global _df
    _load_encodings()

    if not DATA_PATH.exists():
        print(f"⚠️  Hourly dataset not found at {DATA_PATH}")
        _df = pd.DataFrame()
        return

    try:
        print(f"📂 Loading hourly dataset from {DATA_PATH} …")
        raw = pd.read_excel(DATA_PATH, engine="openpyxl")
        print(f"✅ Dataset loaded: {len(raw):,} rows, {len(raw.columns)} columns")
        _df = _engineer_features(raw)
        print(f"✅ Features engineered. Columns: {list(_df.columns)}")
    except Exception as e:
        print(f"⚠️  Error loading dataset: {e}")
        _df = pd.DataFrame()


def get_city_enc(city_name: str) -> Optional[int]:
    """Return the integer city encoding for a given city name."""
    if _city_encoding:
        # Try exact match first, then case-insensitive
        if city_name in _city_encoding:
            return _city_encoding[city_name]
        for name, enc in _city_encoding.items():
            if name.lower() == city_name.lower():
                return enc
    return None


def get_city_lookback(city_name: str, n: int = 24) -> Optional[pd.DataFrame]:
    """
    Return the last N rows from the hourly dataset for the given city.
    Returns None if city not found or data insufficient.
    """
    if _df is None or _df.empty:
        return None

    # Find the city column name
    city_col = None
    for candidate in ["city", "ville", "city_name"]:
        if candidate in _df.columns:
            city_col = candidate
            break

    if city_col is None:
        # Try city_enc match as fallback
        enc = get_city_enc(city_name)
        if enc is not None and "city_enc" in _df.columns:
            subset = _df[_df["city_enc"] == enc].tail(n)
        else:
            print(f"⚠️  No city column found in dataset")
            return None
    else:
        subset = _df[_df[city_col].str.lower() == city_name.lower()].tail(n)

    if len(subset) < n:
        print(f"⚠️  Only {len(subset)} rows for {city_name} (need {n})")
        return subset if len(subset) > 0 else None

    return subset.reset_index(drop=True)


def get_feature_cols() -> list:
    return _feature_cols


def get_full_feature_cols() -> list:
    return _full_feature_cols
