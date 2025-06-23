import os
from app.utils.slug import to_kebab_case
from datetime import datetime
from fastapi import UploadFile
from uuid import uuid4
import uuid
from fastapi import UploadFile
from app.core.s3 import s3_client
from app.core.config import settings



def is_upload_file(obj):
    return hasattr(obj, "filename") and hasattr(obj, "file") and callable(getattr(obj.file, "read", None))

def save_uploaded_file(file: UploadFile, upload_dir: str = "uploads" ) -> str:
    if settings.s3_bucket_storage:
        return upload_file_to_s3(file, folder=upload_dir)
    os.makedirs(upload_dir, exist_ok=True)

    if not file.filename:
        raise ValueError("Uploaded file has no filename.")

    original_name, extension = os.path.splitext(file.filename)
    if not extension:
        extension = ".bin"  # fallback

    slug_name = to_kebab_case(original_name or str(uuid4()))
    date_str = datetime.now().strftime("%Y%m%d")
    unique_id = uuid4().hex[:6]  # short unique suffix

    new_filename = f"{slug_name}-{date_str}-{unique_id}{extension}"
    file_path = os.path.join(upload_dir, new_filename)

    try:
        with open(file_path, "wb") as buffer:
            contents = file.file.read()
            if not contents:
                raise ValueError("Uploaded file is empty.")
            buffer.write(contents)
    except Exception as e:
        raise RuntimeError(f"Failed to save file: {e}")
    return file_path


def upload_file_to_s3(file: UploadFile, folder: str = "uploads") -> str:
    file_ext = file.filename.split(".")[-1]
    key = f"{folder}/{uuid.uuid4()}.{file_ext}"
    s3_client.upload_fileobj(
        file.file,
        settings.s3_bucket,
        key,
        ExtraArgs={"ACL": "public-read", "ContentType": file.content_type},
    )
    return key

def get_file_base_url():
    if settings.s3_bucket_storage == True:
        return f"https://{settings.s3_bucket}.s3.{settings.s3_region}.amazonaws.com/"
    return "http://localhost:8000/"