import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AirWatch Cameroun API"
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    REDIS_URL: str = os.getenv("REDIS_URL", "")
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    
    # Main AirWatch pipeline (LSTM + XGBoost)
    MODEL_PIPELINE_PATH: str = "backend/models/airwatch_pipeline_v2.pkl"
    MODEL_FEATURE_COLS_PATH: str = "backend/models/lstm_feature_cols.json"
    MODEL_FULL_FEATURE_COLS_PATH: str = "backend/models/feature_columns.json"
    MODEL_CITY_ENCODING_PATH: str = "backend/models/city_encoding.json"
    MODEL_PATTERN_ENCODING_PATH: str = "backend/models/pattern_encoding.json"

settings = Settings()
