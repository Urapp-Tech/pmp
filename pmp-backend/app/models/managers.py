from sqlalchemy import Column, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.database import Base


class Manager(Base):
    __tablename__ = "managers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    manager_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    assign_property_unit = Column(
        UUID(as_uuid=True), ForeignKey("property_units.id", ondelete="CASCADE")
    )
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_unit = relationship("PropertyUnit", back_populates="manager_links")
