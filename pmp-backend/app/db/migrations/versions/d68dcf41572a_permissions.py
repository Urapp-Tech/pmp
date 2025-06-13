"""permissions

Revision ID: d68dcf41572a
Revises: d38b56338497
Create Date: 2025-06-12 07:31:52.222809

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "d68dcf41572a"
down_revision: Union[str, None] = "d38b56338497"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Enable uuid-ossp extension for UUID generation
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    op.create_table(
        "permissions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("permission_sequence", sa.Integer(), nullable=True),
        sa.Column(
            "permission_parent",
            postgresql.UUID(as_uuid=True),
            nullable=True,
            default=None,
        ),
        sa.Column("desc", sa.String(length=255), nullable=False),
        sa.Column("action", sa.String(length=255), nullable=True),
        sa.Column("permission_type", sa.String(length=255), nullable=False),
        sa.Column(
            "show_on_menu",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
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
    op.drop_table("permissions")
