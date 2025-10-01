"""alter_landlords

Revision ID: e9ca4f6e2f71
Revises: 88d21761e52f
Create Date: 2025-10-01 10:43:36.135273

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "e9ca4f6e2f71"
down_revision: Union[str, None] = "88d21761e52f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    with op.batch_alter_table("landlords", schema=None) as batch_op:
        for col in ("title", "image", "expiration_date"):
            try:
                batch_op.drop_column(col)
            except Exception:
                # safe if already removed
                pass


def downgrade():
    with op.batch_alter_table("landlords", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("expiration_date", sa.TIMESTAMP(timezone=True), nullable=True)
        )
        batch_op.add_column(sa.Column("image", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("title", sa.Text(), nullable=True))
