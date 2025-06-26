import uuid
from sqlalchemy import (
    Column,
    String,
    Boolean,
    ForeignKey,
    TIMESTAMP,
    Enum,
    Float,
    Integer,
    DateTime,
)
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

# from sqlalchemy.orm import relationship
from app.db.database import Base  # your declarative base
from sqlalchemy.orm import relationship, backref


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    property_unit_id = Column(
        UUID(as_uuid=True), ForeignKey("property_units.id"), nullable=False
    )
    tenant_type = Column(String(255), nullable=True)
    civil_id = Column(String(255), nullable=True)
    nationality = Column(String(255), nullable=True)
    legal_case = Column(Boolean, default=False, nullable=False)
    language = Column(String(255), nullable=True)

    contract_start = Column(TIMESTAMP(timezone=True), nullable=False)
    contract_end = Column(TIMESTAMP(timezone=True), nullable=False)
    contract_number = Column(String(255), nullable=False)
    rent_price = Column(Float, nullable=False)
    rent_pay_day = Column(Integer, nullable=False)
    payment_cycle = Column(
        Enum("Monthly", "Quarterly", "Yearly", name="payment_cycle_enum"),
        nullable=False,
    )
    leaving_date = Column(TIMESTAMP(timezone=True), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="tenants")
    property_unit = relationship("PropertyUnit", backref="tenants")
    invoices = relationship(
        "Invoice",
        back_populates="tenant",
        cascade="all, delete-orphan",
        passive_deletes=True
    )