import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID

# from sqlalchemy.orm import relationship
from app.db.database import Base  # your declarative base
from sqlalchemy.orm import relationship, backref


class Landlord(Base):
    __tablename__ = "landlords"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    title = Column(String(255), nullable=True)
    image = Column(String(255), nullable=True)
    subscription_id = Column(String(255), nullable=True)
    expiration_date = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )
    updated_at = Column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )

    # user = relationship("User", back_populates="landlord")
    # Relationships
    # users = relationship("User", back_populates="landlord", cascade="all, delete")
    # properties = relationship("Property", back_populates="landlord", cascade="all, delete")
    # tenants = relationship("Tenant", back_populates="landlord", cascade="all, delete")
    # payments = relationship("Payment", back_populates="landlord", cascade="all, delete")
