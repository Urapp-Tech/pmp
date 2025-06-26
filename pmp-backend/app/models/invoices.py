from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
import enum


from app.db.database import Base  # Adjust import as needed


class InvoiceStatus(str, enum.Enum):
    paid = "paid"
    un_paid = "un_paid"


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")
    )
    landlord_id = Column(
        UUID(as_uuid=True),
        ForeignKey("landlords.id", ondelete="CASCADE"),
        nullable=True,
    )
    tenant_id = Column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True
    )

    invoice_no = Column(String(255), nullable=True)
    total_amount = Column(String(255), nullable=True)
    paid_amount = Column(String(255), nullable=True)
    discount_amount = Column(String(255), nullable=True)
    due_amount = Column(String(255), nullable=True)
    currency = Column(String(255), nullable=True)
    status = Column(String(255), nullable=True)
    payment_date = Column(String(255), nullable=True)
    invoice_date = Column(String(255), nullable=True)
    due_date = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    payment_method = Column(String(255), nullable=True)
    qty = Column(String(255), nullable=True)
    created_by = Column(String(255), nullable=True, default="machine")
    updated_by = Column(String(255), nullable=True)

    created_at = Column(
        TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at = Column(
        TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False
    )

    # Relationships (optional, if models exist)
    landlord = relationship("Landlord", back_populates="invoices", passive_deletes=True)
    tenant = relationship("Tenant", back_populates="invoices", passive_deletes=True)
    # updated_user = relationship("User", back_populates="invoice_items", foreign_keys=[updated_by])
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    invoice_items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    
