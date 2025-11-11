"""managers

Revision ID: 04a398215b59
Revises: 59fb05239a5f
Create Date: 2025-06-18 12:32:09.648196

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from uuid import UUID

# revision identifiers, used by Alembic.
revision: str = "04a398215b59"
down_revision: Union[str, None] = "59fb05239a5f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "managers",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, default=UUID),
        sa.Column(
            "manager_user_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "assign_property_unit",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("property_units.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")
        ),
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


def downgrade():
    op.drop_table("managers")
