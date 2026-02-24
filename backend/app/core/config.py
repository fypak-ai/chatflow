from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database — Railway injects DATABASE_URL automatically for Postgres plugin
    DATABASE_URL: str = "postgresql+asyncpg://chatflow:chatflow@localhost:5432/chatflow"
    REDIS_URL: str = "redis://localhost:6379"

    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_URL: str = "http://localhost:3000"

    # AI
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_AI_MODEL: str = "gpt-4o"

    # GitHub
    GITHUB_WEBHOOK_SECRET: str = ""

    # Railway automatically sets PORT
    PORT: int = 8000

    class Config:
        env_file = ".env"

    @property
    def async_database_url(self) -> str:
        """Convert postgres:// to postgresql+asyncpg:// (Railway uses postgres://)."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()
