"""alter_payment_history

Revision ID: 88d21761e52f
Revises: 7c9ce18adee8
Create Date: 2025-09-30 07:43:33.684716

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "88d21761e52f"
down_revision: Union[str, None] = "7c9ce18adee8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "payment_history",
        sa.Column("deposit_reference", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "payment_history",
        sa.Column("deposit_date", sa.TIMESTAMP(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_payment_history_deposit_reference",
        "payment_history",
        ["deposit_reference"],
        unique=False,
    )
    op.create_index(
        "ix_payment_history_deposit_date",
        "payment_history",
        ["deposit_date"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_payment_history_deposit_date", table_name="payment_history")
    op.drop_index("ix_payment_history_deposit_reference", table_name="payment_history")
    op.drop_column("payment_history", "deposit_date")
    op.drop_column("payment_history", "deposit_reference")
