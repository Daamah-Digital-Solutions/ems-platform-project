from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./move.db"
    secret_key: str = "dev-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    cors_origins: str = "http://localhost:5188,http://localhost:5173,http://localhost:3000"
    env: str = "development"
    zatca_sandbox: bool = True

    # Public website intake (leads). The site authenticates with a static API key
    # and all its submissions are filed under one studio.
    public_api_key: str = "dev-public-key-change-me"
    public_studio_id: int = 1

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
