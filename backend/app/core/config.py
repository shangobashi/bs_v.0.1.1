from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings from environment variables"""

    # App
    APP_NAME: str = "BlueSwarm MVP"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # API
    API_PREFIX: str = "/api/v1"

    # Security
    SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    PUBLIC_EXECUTION_ENABLED: bool = False
    RUNTIME_KEY_CONFIG_ENABLED: bool = False
    RUNTIME_KEY_CONFIG_PERSIST_TO_ENV: bool = False
    PUBLIC_EXECUTION_MAX_TOKENS: int = 1024
    PUBLIC_EXECUTION_RATE_LIMIT_WINDOW_SECONDS: int = 900
    PUBLIC_EXECUTION_RATE_LIMIT_MAX_REQUESTS: int = 12

    # Database
    DATABASE_URL: Optional[str] = None

    # API Keys (from environment or hardcoded for MVP)
    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434/v1"

    # Agent Configuration
    MAX_CONCURRENT_AGENTS: int = 10
    AGENT_TIMEOUT_SECONDS: int = 300

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
