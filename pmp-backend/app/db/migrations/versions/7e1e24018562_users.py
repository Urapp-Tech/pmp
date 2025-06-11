"""users

Revision ID: 7e1e24018562
Revises: d16578fe52ee
Create Date: 2025-06-05 09:51:06.956155

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7e1e24018562'
down_revision: Union[str, None] = 'd16578fe52ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Enable uuid-ossp extension for UUID generation
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "role_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("roles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "landlord_id",
            postgresql.UUID(as_uuid=True),
            # sa.ForeignKey("landlords.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("is_landlord", sa.Boolean, default=False),
        sa.Column("fname", sa.String(length=255), nullable=True),
        sa.Column("lname", sa.String(length=255), nullable=True),        
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),  # Fixed duplicate column
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("password", sa.String(length=255), nullable=False),
        sa.Column("profile_pic", sa.String(length=255), nullable=True),
        sa.Column("gender", sa.String(length=10), nullable=True),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")
        ),
        sa.Column(
            "is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")
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
    op.drop_table("users")