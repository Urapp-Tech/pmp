"""bank_deposit_items

Revision ID: 7c9ce18adee8
Revises: 78589b028178
Create Date: 2025-09-30 07:39:59.517511

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "7c9ce18adee8"
down_revision: Union[str, None] = "78589b028178"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "bank_deposit_items",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "deposit_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("bank_deposits.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "payment_history_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("payment_history.id", ondelete="SET NULL"),
            nullable=True,
        ),
        # Handy denormalized fields for quick reporting
        sa.Column("invoice_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("invoice_reference", sa.String(length=100), nullable=True),
        sa.Column("invoice_value", sa.Numeric(18, 3), nullable=True),
        sa.Column("currency", sa.String(length=10), nullable=True),
        sa.Column("due_value", sa.Numeric(18, 3), nullable=True),
        sa.Column("service_charge", sa.Numeric(18, 3), nullable=True),
        sa.Column("transaction_id", sa.String(length=100), nullable=True),
        sa.Column("payment_id", sa.String(length=100), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_bank_deposit_items_deposit_id",
        "bank_deposit_items",
        ["deposit_id"],
        unique=False,
    )
    op.create_index(
        "ix_bank_deposit_items_payment_history_id",
        "bank_deposit_items",
        ["payment_history_id"],
        unique=False,
    )
    op.create_index(
        "ix_bank_deposit_items_invoice_reference",
        "bank_deposit_items",
        ["invoice_reference"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        "ix_bank_deposit_items_invoice_reference", table_name="bank_deposit_items"
    )
    op.drop_index(
        "ix_bank_deposit_items_payment_history_id", table_name="bank_deposit_items"
    )
    op.drop_index("ix_bank_deposit_items_deposit_id", table_name="bank_deposit_items")
    op.drop_table("bank_deposit_items")
