from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.utils.seed_data import seed_topology
from app.services.ml_service import MLService
from app.routers import (
    topology_router,
    telemetry_router,
    ml_router,
    rca_router,
    remediation_router,
    auth_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables created and seed initial topology
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_topology(db)
        # Ensure active model is initialized and trained
        MLService.load_active_model()
    finally:
        db.close()
    yield
    # Shutdown logic if needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="NetSentinel AI — AI-Based Network Fault Prediction & Intelligent Incident Analysis Platform",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(topology_router, prefix=settings.API_PREFIX)
app.include_router(telemetry_router, prefix=settings.API_PREFIX)
app.include_router(ml_router, prefix=settings.API_PREFIX)
app.include_router(rca_router, prefix=settings.API_PREFIX)
app.include_router(remediation_router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "FastAPI + scikit-learn",
        "db": "SQLite connected",
    }
