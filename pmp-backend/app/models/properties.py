import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, TIMESTAMP, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID

# from sqlalchemy.orm import relationship
from app.db.database import Base  # your declarative base
from sqlalchemy.orm import relationship, backref


class Property(Base):
    __tablename__ = "properties"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    landlord_id = Column(UUID(as_uuid=True), ForeignKey("landlords.id"), nullable=False)
    name = Column(String(255), nullable=True)
    city = Column(String(255), nullable=True)
    governance = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    address2 = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    pictures = Column(JSON, nullable=True)
    property_type = Column(String(255), nullable=True)
    type = Column(Enum("residential", "commercial", name="p_type"), nullable=True)
    paci_no = Column(String(255), nullable=True)
    property_no = Column(String(255), nullable=True)
    civil_no = Column(String(255), nullable=True)
    build_year = Column(String(255), nullable=True)
    book_value = Column(String(255), nullable=True)
    estimate_value = Column(String(255), nullable=True)
    latitude = Column(String(255), nullable=True)
    longitude = Column(String(255), nullable=True)

    status = Column(String(255), nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )
    updated_at = Column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )

    # Relationships
    landlord = relationship("Landlord", backref="properties")
    property_units = relationship(
        "PropertyUnit", back_populates="property", cascade="all, delete-orphan"
    )
    units = relationship(
        "PropertyUnit", back_populates="property", cascade="all, delete-orphan"
    )
