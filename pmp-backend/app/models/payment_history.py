from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
from sqlalchemy.orm import relationship
import uuid
import enum


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "PAID"
    FAILED = "FAILED"


class PaymentHistory(Base):
    __tablename__ = "payment_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    subscription_id = Column(
        UUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=True
    )
    property_unit_id = Column(
        UUID(as_uuid=True), ForeignKey("property_units.id"), nullable=True
    )
    invoice_id = Column(
        UUID(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
    )
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False, default="KWD")
    payment_type = Column(
        Enum("RENT", "SUBSCRIPTION", name="paymenttype"), nullable=False
    )
    payment_url = Column(String, nullable=True)
    status = Column(
        Enum("PENDING", "PAID", "FAILED", name="paymentstatus"),
        nullable=False,
        default="PENDING",
    )
    created_at = Column(DateTime, server_default="now()")
    updated_at = Column(DateTime, server_default="now()", onupdate="now()")

    invoice = relationship("Invoice", back_populates="payments")
