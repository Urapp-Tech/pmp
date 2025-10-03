from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4


from app.db.database import Base  # Adjust import as needed



class EmailOTP(Base):
    __tablename__ = "email_otps"

    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")
    )
    email = Column(String(255), nullable=True)
    otp = Column(String(2000), nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at = Column(
        TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False
    )

