from sqlalchemy import Column, String, Float, Boolean, Integer, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid
from app.db.database import Base
from sqlalchemy.dialects.postgresql import UUID


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_name = Column(String(255), nullable=False)
    description = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False, default="KWD")
    duration_in_days = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
