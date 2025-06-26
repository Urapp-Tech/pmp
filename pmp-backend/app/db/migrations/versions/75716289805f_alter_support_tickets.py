"""alter_support_tickets

Revision ID: 75716289805f
Revises: 3e8e651e7ee4
Create Date: 2025-06-25 14:25:16.314189

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "75716289805f"
down_revision: Union[str, None] = "3e8e651e7ee4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "support_tickets",
        sa.Column("images", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )


def downgrade():
    op.drop_column("support_tickets", "images")
