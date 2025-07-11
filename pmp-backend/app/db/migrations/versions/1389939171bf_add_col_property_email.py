"""add_col_property_email

Revision ID: 1389939171bf
Revises: 00a361b26c17
Create Date: 2025-07-11 07:16:35.057792

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '1389939171bf'
down_revision: Union[str, None] = '00a361b26c17'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column("properties", sa.Column("email", sa.String(length=255), nullable=True))
    op.add_column("properties", sa.Column("phone", sa.String(length=255), nullable=True))
    op.add_column("properties", sa.Column("supplier_code", sa.String(length=255), nullable=True))


def downgrade():
    op.drop_column("properties", "supplier_code")
    op.drop_column("properties", "phone")
    op.drop_column("properties", "email")

