"""invoices

Revision ID: b4f10c41a3c1
Revises: 04a398215b59
Create Date: 2025-06-24 07:52:48.197594

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b4f10c41a3c1'
down_revision: Union[str, None] = '04a398215b59'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Enable uuid-ossp extension for UUID generation
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    op.create_table(
        "invoices",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "landlord_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("landlords.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id", ondelete="CASCADE"),
            nullable=True),
        sa.Column("invoice_no", sa.String(length=255), nullable=True),
        sa.Column("total_amount", sa.String(length=255), nullable=True),
        sa.Column("paid_amount", sa.String(length=255), nullable=True),
        sa.Column("discount_amount", sa.String(length=255), nullable=True),
        sa.Column("due_amount", sa.String(length=255), nullable=True),
        sa.Column("currency", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=255), nullable=True),
        sa.Column("payment_date", sa.String(length=255), nullable=True),
        sa.Column("invoice_date", sa.String(length=255), nullable=True),
        sa.Column("due_date", sa.String(length=255), nullable=True),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("payment_method", sa.String(length=255), nullable=True),
        sa.Column("qty", sa.String(length=255), nullable=True),
        sa.Column("created_by", sa.String(length=255), default="machine", nullable=True),
        sa.Column("updated_by", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("invoices")