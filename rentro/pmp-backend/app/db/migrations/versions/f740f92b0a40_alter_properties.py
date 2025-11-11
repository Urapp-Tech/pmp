"""alter_properties

Revision ID: f740f92b0a40
Revises: 75716289805f
Create Date: 2025-06-30 13:41:28.427008

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "f740f92b0a40"
down_revision: Union[str, None] = "75716289805f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "properties",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade():
    op.drop_column("properties", "is_active")
