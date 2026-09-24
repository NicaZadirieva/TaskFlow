from urllib.parse import urlparse

from pydantic import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class CommonAppSettings(BaseModel):
    ENVIRONMENT: str = "development"
    SECRET: str
    EXPIRE_MINUTES: int


class DatabaseSettings(BaseModel):
    DATABASE_URL: str = Field(..., min_length=10, description="Database connection URL")
    DATABASE_URL_SYNC: str = Field(
        ..., min_length=10, description="Database connection sync URL"
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        parsed = urlparse(v)
        if parsed.scheme not in {"postgresql", "postgresql+asyncpg"}:
            raise ValueError(
                "Database_url scheme must be postgresql or postgresql+asyncpg"
            )
        if not parsed.hostname:
            raise ValueError("Database_url must include hostname")

        dbname = (parsed.path or "").lstrip("/")
        if not dbname:
            raise ValueError("Database_url must include database")

        if parsed.port is not None and not (1 <= parsed.port <= 65535):
            raise ValueError("Database_url port must be 1...65535")

        return v


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(..., min_length=10)
    DATABASE_URL_SYNC: str = Field(..., min_length=10)

    # Common
    ENVIRONMENT: str = "development"
    SECRET: str
    EXPIRE_MINUTES: int

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "production"}
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}")
        return v

    @property
    def common_app(self) -> CommonAppSettings:
        return CommonAppSettings(
            ENVIRONMENT=self.ENVIRONMENT,
            SECRET=self.SECRET,
            EXPIRE_MINUTES=self.EXPIRE_MINUTES,
        )

    @property
    def db(self) -> DatabaseSettings:
        return DatabaseSettings(
            DATABASE_URL=self.DATABASE_URL, DATABASE_URL_SYNC=self.DATABASE_URL_SYNC
        )


settings = Settings()  # type:ignore[call-arg]
