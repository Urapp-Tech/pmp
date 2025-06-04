"""role_permissions

Revision ID: d16578fe52ee
Revises: 35e2d95917f2
Create Date: 2025-05-29 13:30:21.972347

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "d16578fe52ee"
down_revision: Union[str, None] = "35e2d95917f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Enable uuid-ossp extension for UUID generation
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    op.create_table(
        "role_permissions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "role",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("roles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "permission",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("permissions.id", ondelete="CASCADE"),
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


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("role_permissions")
