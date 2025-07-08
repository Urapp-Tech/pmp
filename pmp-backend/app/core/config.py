from pydantic_settings import BaseSettings

# from pydantic import BaseSettings, Field
from functools import lru_cache

# import os

# SERVER_BASE_PATH = os.getenv("SERVER_BASE_PATH", "/api/v1")


class Settings(BaseSettings):
    db_host: str
    db_port: str
    db_user: str
    db_password: str
    database: str
    server_base_path: str = "/api/v1"
    jwt_secret_key: str
    jwt_refresh_secret_key: str
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_minutes: int = 60 * 24 * 7  # 7 days, for example
    MYFATOORAH_API_URL: str
    MYFATOORAH_API_KEY: str
    FRONTEND_BASE_URL: str

    # S3 credentials
    s3_access_id: str
    s3_access_key: str
    s3_region: str
    s3_bucket: str
    s3_bucket_storage: bool

    @property
    def sqlalchemy_url(self):
        return (
            f"postgresql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.database}"
        )

    class Config:
        env_file = ".env"
        # extra = "forbid"


# @lru_cache()
def get_settings():
    return Settings()


settings = get_settings()  # ✅ This makes `from app.core.config import settings` work
