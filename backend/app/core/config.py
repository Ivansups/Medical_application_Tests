from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str | None = None

    RATE_LIMIT_PER_MINUTE: int = 60
    
    POSTGRES_USER: str = 'postgres'
    POSTGRES_PASSWORD: str = '3891123'
    POSTGRES_DB: str = 'medical_application'
    POSTGRES_HOST: str = 'localhost'
    POSTGRES_PORT: int = 5432
    
    # JWT settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS settings
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"

    @property
    def postgres_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()