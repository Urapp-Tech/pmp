import os
from app.utils.slug import to_kebab_case
from datetime import datetime
from fastapi import UploadFile
from uuid import uuid4

def is_upload_file(obj):
    return hasattr(obj, "filename") and hasattr(obj, "file") and callable(getattr(obj.file, "read", None))

def save_uploaded_file(file: UploadFile, upload_dir: str = "uploads") -> str:
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

    return new_filename
