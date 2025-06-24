import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, TIMESTAMP, JSON
from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import relationship
from app.db.database import Base  # your declarative base
from sqlalchemy.orm import relationship, backref

class PropertyUnit(Base):
    __tablename__ = "property_units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
    name = Column(String(255), nullable=True)
    unit_no = Column(String(255), nullable=True)
    unit_type = Column(String(255), nullable=True)
    size = Column(String(255), nullable=True)
    rent = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    pictures = Column(JSON, nullable=True)
    bedrooms = Column(String(255), nullable=True)
    bathrooms = Column(String(255), nullable=True)
    water_meter = Column(String(255), nullable=True)
    electricity_meter = Column(String(255), nullable=True)
    account_name = Column(String(255), nullable=True)
    account_no = Column(String(255), nullable=True)
    bank_name = Column(String(255), nullable=True)
    status = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default="now()", nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default="now()", nullable=False)

    # Relationships
    property = relationship("Property", back_populates="property_units")