import boto3
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("S3_ACCESS_ID"),
    aws_secret_access_key=os.getenv("S3_ACCESS_KEY"),
    region_name=os.getenv("S3_REGION"),
)
