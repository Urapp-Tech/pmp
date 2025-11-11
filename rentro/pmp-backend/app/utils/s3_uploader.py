import uuid
from fastapi import UploadFile
from app.core.s3 import s3_client
from app.core.config import settings


def upload_file_to_s3(file: UploadFile, folder: str = "uploads") -> str:
    file_ext = file.filename.split(".")[-1]
    key = f"{folder}/{uuid.uuid4()}.{file_ext}"

    s3_client.upload_fileobj(
        file.file,
        settings.s3_bucket,
        key,
        ExtraArgs={"ACL": "public-read", "ContentType": file.content_type},
    )

    url = f"https://{settings.s3_bucket}.s3.{settings.s3_region}.amazonaws.com/{key}"
    return url
