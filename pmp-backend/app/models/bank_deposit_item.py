# app/models/bank_deposit_item.py
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Numeric,
    ForeignKey,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.database import Base


class BankDepositItem(Base):
    __tablename__ = "bank_deposit_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    deposit_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bank_deposits.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    payment_history_id = Column(
        UUID(as_uuid=True),
        ForeignKey("payment_history.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # denormalized for quick reporting/matching
    invoice_id = Column(UUID(as_uuid=True), nullable=True)
    invoice_reference = Column(String(100), nullable=True, index=True)
    invoice_value = Column(Numeric(18, 3), nullable=True)
    currency = Column(String(10), nullable=True)

    due_value = Column(Numeric(18, 3), nullable=True)
    service_charge = Column(Numeric(18, 3), nullable=True)

    transaction_id = Column(String(100), nullable=True)
    payment_id = Column(String(100), nullable=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # relationships
    deposit = relationship("BankDeposit", back_populates="items")
    payment_history = relationship("PaymentHistory", back_populates="deposit_items")
