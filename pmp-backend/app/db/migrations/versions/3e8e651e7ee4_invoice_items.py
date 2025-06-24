"""invoice_items

Revision ID: 3e8e651e7ee4
Revises: b4f10c41a3c1
Create Date: 2025-06-24 08:58:26.582541

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3e8e651e7ee4'
down_revision: Union[str, None] = 'b4f10c41a3c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Enable uuid-ossp extension for UUID generation
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    op.create_table(
        "invoice_items",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("invoice_id", postgresql.UUID(as_uuid=True),
            sa.ForeignKey("invoices.id", ondelete="CASCADE"),
            nullable=True),
        sa.Column("amount", sa.String(length=255), nullable=True),
        sa.Column("currency", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=255), nullable=True),
        sa.Column("payment_date", sa.String(length=255), nullable=True),
        sa.Column("payment_method", sa.String(length=255), nullable=True),
        sa.Column("file", sa.String(length=255), nullable=True),
        sa.Column("description", sa.String(length=2555), nullable=True),
        sa.Column("remarks", sa.String(length=2555), nullable=True),
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
    op.drop_table("invoice_items")