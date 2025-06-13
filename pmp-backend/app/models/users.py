import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID

# from sqlalchemy.orm import relationship
from app.db.database import Base  # your declarative base
from sqlalchemy.orm import relationship, backref


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    # role_id = Column(UUID(as_uuid=True), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    landlord_id = Column(UUID(as_uuid=True), ForeignKey("landlords.id"), nullable=True)
    is_landlord = Column(Boolean, default=True, nullable=True)
    fname = Column(String(255), nullable=True)
    lname = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password = Column(String(255), nullable=False)
    profile_pic = Column(String(255), nullable=True)
    gender = Column(String(10), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )
    updated_at = Column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )

    landlord = relationship("Landlord", backref="users")
    role = relationship("Role", backref="users")

    # role = relationship("Role", back_populates="users")
    # landlord = relationship("Landlord", back_populates="landlords")
