"""bank_deposits

Revision ID: 78589b028178
Revises: af0b5f108c23
Create Date: 2025-09-30 07:29:20.798576

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "78589b028178"
down_revision: Union[str, None] = "af0b5f108c23"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Enable uuid-ossp extension for UUID generation
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    op.create_table(
        "bank_deposits",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("reference", sa.String(length=100), nullable=False, unique=True),
        sa.Column(
            "deposit_date",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
        sa.Column("amount", sa.Numeric(18, 3), nullable=True),
        sa.Column("currency", sa.String(length=10), nullable=True),
        sa.Column("transactions_count", sa.Integer(), nullable=True),
        sa.Column("bank_name", sa.String(length=200), nullable=True),
        sa.Column("bank_iban", sa.String(length=64), nullable=True),
        sa.Column("bank_account", sa.String(length=64), nullable=True),
        sa.Column("raw", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_bank_deposits_reference",
        "bank_deposits",
        ["reference"],
        unique=True,
    )
    op.create_index(
        "ix_bank_deposits_deposit_date",
        "bank_deposits",
        ["deposit_date"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_bank_deposits_deposit_date", table_name="bank_deposits")
    op.drop_index("ix_bank_deposits_reference", table_name="bank_deposits")
    op.drop_table("bank_deposits")
