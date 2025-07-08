"""add_col_in_property

Revision ID: 00662298f02f
Revises: 160bd5f1604e
Create Date: 2025-07-03 09:01:18.781446

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '00662298f02f'
down_revision: Union[str, None] = '160bd5f1604e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    op.add_column(
        "properties",
        sa.Column("unit_counts", sa.Integer(), nullable=False, server_default="0")
    )
    op.add_column(
        "properties",
        sa.Column("bank_name", sa.String(length=255), nullable=True)
    )
    op.add_column(
        "properties",
        sa.Column("account_no", sa.String(length=255), nullable=True)
    )
    op.add_column(
        "properties",
        sa.Column("account_name", sa.String(length=255), nullable=True)
    )

def downgrade():
    op.drop_column("properties", "unit_counts")
    op.drop_column("properties", "bank_name")
    op.drop_column("properties", "account_no")
    op.drop_column("properties", "account_name")

