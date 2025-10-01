# app/models/bank_deposit.py
from sqlalchemy import (
    JSON,
    Column,
    String,
    Integer,
    DateTime,
    Numeric,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.database import Base


class BankDeposit(Base):
    __tablename__ = "bank_deposits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # settlement (deposit) reference from MyFatoorah (unique per deposit batch)
    reference = Column(String(100), nullable=False, unique=True, index=True)

    deposit_date = Column(DateTime(timezone=True), nullable=True, index=True)

    amount = Column(Numeric(18, 3), nullable=True)
    currency = Column(String(10), nullable=True)
    transactions_count = Column(Integer, nullable=True)

    bank_name = Column(String(200), nullable=True)
    bank_iban = Column(String(64), nullable=True)
    bank_account = Column(String(64), nullable=True)

    # raw deposit payload from MyFatoorah "GetDeposit" (or future settlement API)
    raw = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # children
    items = relationship(
        "BankDepositItem",
        back_populates="deposit",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
