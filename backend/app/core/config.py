from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://chatflow:chatflow@localhost:5432/chatflow"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_URL: str = "http://localhost:3000"

    # AI
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_AI_MODEL: str = "gpt-4o"

    # GitHub
    GITHUB_WEBHOOK_SECRET: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
