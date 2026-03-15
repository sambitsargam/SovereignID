"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "SovereignID"
    app_version: str = "1.0.0"
    debug: bool = False

    # Database
    database_url: str = "sqlite+aiosqlite:///./sovereignid.db"

    # Bittensor
    bittensor_network: str = "local"
    bittensor_netuid: int = 1
    bittensor_wallet_name: str = "sovereignid"
    bittensor_wallet_hotkey: str = "default"
    subtensor_endpoint: str = "ws://127.0.0.1:9945"
    miner_axon_port: int = 8901

    # Passport / Holonym verification
    passport_api_url: str = "https://api.holonym.io"
    passport_action_id: str = "123456789"
    passport_network: str = "optimism"

    # Unbrowse
    unbrowse_api_url: str = "https://beta-api.unbrowse.ai"
    unbrowse_api_key: Optional[str] = None

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:3000,http://localhost:8000"

    # JWT for session management
    jwt_secret: str = "sovereignid-dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 1440

    model_config = {"env_file": ".env", "env_prefix": "SOVEREIGNID_", "extra": "ignore"}


settings = Settings()
