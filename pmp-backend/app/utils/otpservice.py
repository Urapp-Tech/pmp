import random
import string
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.email_otp import EmailOTP
from app.utils.email_service import render_template, send_email

from datetime import datetime, timedelta

def verify_otp_email(db: Session, email: str, otp_code: str):
    
    otp_entry = (
        db.query(EmailOTP)
        .filter(EmailOTP.email == email, EmailOTP.otp == otp_code)
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_entry:
        return {
            "success": False,
            "message": "Invalid OTP or email."
        }

    # Check expiry (5 minutes)
    if otp_entry.created_at < datetime.utcnow() - timedelta(minutes=5):
        return {
            "success": False,
            "message": "OTP has expired. Please request a new one."
        }

    return {
        "success": True,
        "message": "OTP verified successfully."
    }
def send_otp_email(db: Session, email: str, message: str):
    
    # OTP generate
    otp_code = ''.join(random.choices(string.digits, k=6))

    # Save OTP in DB
    otp_entry = EmailOTP(
        email=email,
        otp=otp_code,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(otp_entry)
    db.commit()
    db.refresh(otp_entry)
    data ={
            "otp": otp_code,
            "message": message,
        }
    # Prepare email content
    html_content = render_template(
        "email_verification.html",
       data ,
    )

    # Send email
    send_email(
        to_email=email,
        subject="OTP for Verification",
        html_content=html_content,
    )

    return data
