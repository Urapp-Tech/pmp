from __future__ import annotations
from sqlalchemy import Column, Text, Integer, TIMESTAMP, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, NUMERIC
from sqlalchemy.orm import relationship

from app.db.database import Base


class SubscribedLandlord(Base):
    __tablename__ = "subscribed_landlords"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
        nullable=False,
    )

    landlord_id = Column(
        UUID(as_uuid=True),
        ForeignKey("landlords.id", ondelete="CASCADE"),
        nullable=False,
    )
    subscription_id = Column(
        UUID(as_uuid=True),
        ForeignKey("subscriptions.id", ondelete="RESTRICT"),
        nullable=False,
    )

    plan_name = Column(Text, nullable=True)
    holding_properties = Column(Integer, nullable=False)

    total_amount = Column(NUMERIC(18, 3), nullable=False)
    discounted_amount = Column(NUMERIC(18, 3), nullable=False, server_default=text("0"))
    due_amount = Column(NUMERIC(18, 3), nullable=False)

    status = Column(
        Text, nullable=False, server_default=text("'pending'")
    )  # pending|approved|rejected
    approved_by = Column(
        UUID(as_uuid=True),
        ForeignKey("super_admins.id", ondelete="SET NULL"),
        nullable=True,
    )

    expiration_date = Column(TIMESTAMP(timezone=True), nullable=True)
    payment_link = Column(Text, nullable=True)

    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()"),
        onupdate=text("now()"),
    )

    landlord = relationship("Landlord", backref="subscriptions")
