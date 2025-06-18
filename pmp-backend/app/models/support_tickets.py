from sqlalchemy import Column, String, ForeignKey, Text, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid

from app.db.database import Base


class SupportTicketStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), nullable=False)
    sender_role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), nullable=False)
    receiver_role_id = Column(
        UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False
    )
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(Enum(SupportTicketStatus), default=SupportTicketStatus.open)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
