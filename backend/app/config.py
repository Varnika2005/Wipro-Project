import os
from typing import List
from pydantic import BaseModel, Field


class Settings(BaseModel):
    PROJECT_NAME: str = "NetSentinel AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./netsentinel.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "netsentinel-super-secret-antigravity-spatial-key-2026")
    
    # Model Artifact Storage
    ARTIFACTS_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "artifacts"
    )
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    def __init__(self, **data):
        super().__init__(**data)
        if self.ENVIRONMENT == "production":
            if self.JWT_SECRET_KEY == "netsentinel-super-secret-antigravity-spatial-key-2026" or len(self.JWT_SECRET_KEY) < 32:
                raise ValueError("A secure JWT_SECRET_KEY of at least 32 characters must be provided in production.")


settings = Settings()
os.makedirs(settings.ARTIFACTS_DIR, exist_ok=True)
