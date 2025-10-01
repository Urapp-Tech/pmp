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
    subscription_id = Column(String(255), nullable=True)
    updated_at = Column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )

    # properties = relationship("Property", ...)
    invoices = relationship(
        "Invoice",
        back_populates="landlord",
        passive_deletes=True,
        cascade="all, delete-orphan",
    )

    users = relationship(
        "User", back_populates="landlord", cascade="all, delete-orphan"
    )
    # Relationships
    # users = relationship("User", back_populates="landlord", cascade="all, delete")
    # tenants = relationship("Tenant", back_populates="landlord", cascade="all, delete")
    # payments = relationship("Payment", back_populates="landlord", cascade="all, delete")
