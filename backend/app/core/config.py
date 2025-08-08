from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    POSTGRES_USER: str = 'postgres'
    POSTGRES_PASSWORD: str = '3891123'
    POSTGRES_DB: str = 'medical_appication'
    POSTGRES_HOST: str = 'localhost'
    POSTGRES_PORT: int = 5432

    @property
    def postgres_url(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()