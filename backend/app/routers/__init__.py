from app.routers.topology import router as topology_router
from app.routers.telemetry import router as telemetry_router
from app.routers.ml import router as ml_router
from app.routers.rca import router as rca_router
from app.routers.remediation import router as remediation_router
from app.routers.auth import router as auth_router

__all__ = [
    "topology_router",
    "telemetry_router",
    "ml_router",
    "rca_router",
    "remediation_router",
    "auth_router",
]
