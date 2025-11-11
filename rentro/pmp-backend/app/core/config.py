from pydantic_settings import BaseSettings

# from pydantic import BaseSettings, Field
from functools import lru_cache

# import os

# SERVER_BASE_PATH = os.getenv("SERVER_BASE_PATH", "/api/v1")


class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    SERVER_BASE_PATH: str = "/api/v1"
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days, for example
    MYFATOORAH_API_URL: str
    MYFATOORAH_API_KEY: str
    FRONTEND_BASE_URL: str
    BACKEND_BASE_URL: str

    # S3 credentials
    S3_ACCESS_ID: str
    S3_ACCESS_KEY: str
    S3_REGION: str
    S3_BUCKET: str
    S3_BUCKET_STORAGE: bool

    # SendGrid credentials
    SENDGRID_API_KEY: str
    SENDGRID_MAIL_FROM: str

    # SMTP
    MAIL_MAILER: str
    MAIL_HOST: str
    MAIL_PORT: str
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_ENCRYPTION: str
    MAIL_FROM_ADDRESS: str
    MAIL_FROM_NAME: str

    @property
    def sqlalchemy_url(self):
        return (
            f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    class Config:
        env_file = ".env"
        extra = "forbid"


# @lru_cache()
def get_settings():
    return Settings()


settings = get_settings()  # ✅ This makes `from app.core.config import settings` work
