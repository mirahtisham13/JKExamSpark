from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./test.db"
    database_url_sync: str = "sqlite:///./test.db"
    jwt_secret_key: str = "YOUR_SUPER_SECRET_KEY"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket: str = "study-materials"
    backend_cors_origins: List[str] = ["http://localhost:3000"]
    environment: str = "development"
    debug: bool = False
    first_admin_email: str = "admin@example.com"
    first_admin_password: str = "admin123"
    first_admin_full_name: str = "Platform Admin"
    rate_limit_per_minute: int = 60
    max_file_size_mb: int = 50

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
