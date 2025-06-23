from pydantic_settings import BaseSettings

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

    # S3 credentials
    s3_access_id: str
    s3_access_key: str
    s3_region: str
    s3_bucket: str
    s3_bucket_storage: bool
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.database}"

    class Config:
        env_file = ".env"
        extra = "forbid"


settings = Settings()
