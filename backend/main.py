from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routers import signalement, predict, aqi
from supabase import create_client, Client
import logging

app = FastAPI(title=settings.PROJECT_NAME)

# Client Supabase pour vérification côté serveur
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_current_user(authorization: str = Header(None)):
    """Middleware de vérification JWT Supabase"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    token = authorization.replace("Bearer ", "")
    try:
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Session")

# Inclusion des routers
app.include_router(signalement.router)
app.include_router(predict.router)
app.include_router(aqi.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "project": "AirWatch Cameroun", "api_version": "1.0"}
