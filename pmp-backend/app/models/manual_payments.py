# app/models/manual_payments.py
from uuid import uuid4
from sqlalchemy import Column, String, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.database import Base
from datetime import datetime


class ManualPayment(Base):
    __tablename__ = "manual_payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    invoice_id = Column(UUID(as_uuid=True), nullable=False)
    # one of these will be set based on actor role
    landlord_id = Column(UUID(as_uuid=True), nullable=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)

    amount = Column(Numeric(12, 3), nullable=False)
    currency = Column(String, nullable=False, server_default="KWD")
    method = Column(String, nullable=True)

    deposit_reference = Column(String, nullable=True)
    deposit_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String, nullable=True)

    # store merged uploaded files & any links as JSON
    docs = Column(
        JSONB, nullable=True, default=dict
    )  # <- important: Python-side default

    # generic UUID of who submitted (superadmin.id or landlord.id)
    submitted_by = Column(UUID(as_uuid=True), nullable=True)

    # CRITICAL: set Python-side defaults so ORM never sends NULL
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
