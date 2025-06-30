"""alter_property_units

Revision ID: 160bd5f1604e
Revises: f740f92b0a40
Create Date: 2025-06-30 13:42:40.552016

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "160bd5f1604e"
down_revision: Union[str, None] = "f740f92b0a40"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "property_units",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade():
    op.drop_column("property_units", "is_active")
