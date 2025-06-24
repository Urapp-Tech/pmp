from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))

    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=True)
    amount = Column(String(255), nullable=True)
    currency = Column(String(255), nullable=True)
    status = Column(String(255), nullable=True)
    payment_date = Column(String(255), nullable=True)
    payment_method = Column(String(255), nullable=True)
    file = Column(String(255), nullable=True)
    description = Column(String(2555), nullable=True)
    remarks = Column(String(2555), nullable=True)

    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False)

    # Relationships
    invoice = relationship("Invoice", back_populates="items", passive_deletes=True)
    updated_user = relationship("User", back_populates="invoice_items", foreign_keys=[updated_by])
