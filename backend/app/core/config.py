from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str | None = None
    
    POSTGRES_USER: str = 'postgres'
    POSTGRES_PASSWORD: str = '3891123'
    POSTGRES_DB: str = 'medical_application'
    POSTGRES_HOST: str = 'localhost'
    POSTGRES_PORT: int = 5432

    @property
    def postgres_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()