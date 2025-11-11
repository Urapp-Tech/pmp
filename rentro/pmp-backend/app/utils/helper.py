from fastapi import UploadFile
from app.utils.s3_uploader import upload_file_to_s3


def handle_file_upload(file: UploadFile, folder: str = "uploads") -> dict:
    try:
        url = upload_file_to_s3(file, folder)
        return {
            "status": "success",
            "message": "File uploaded successfully",
            "url": url,
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Upload failed: {str(e)}",
            "url": None,
        }


# usage example
#     upload_result = handle_file_upload(file, folder="avatars")

#     if upload_result["status"] != "success":
#         raise HTTPException(status_code=400, detail=upload_result["message"])

#     avatar_url = upload_result["url"]

#     # Example DB update
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     user.avatar = avatar_url
