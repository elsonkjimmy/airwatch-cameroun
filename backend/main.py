from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routers import signalement, predict, aqi
from backend.services.data_loader import load_dataset
import logging

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the hourly dataset + ML pipeline at startup."""
    load_dataset()
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Inclusion des routers
app.include_router(signalement.router)
app.include_router(predict.router)
app.include_router(aqi.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "project": "AirWatch Cameroun", "api_version": "1.0"}
