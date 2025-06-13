"""properties

Revision ID: e28d10dffbe9
Revises: 42208d679db3
Create Date: 2025-06-11 10:33:24.657704

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e28d10dffbe9'
down_revision: Union[str, None] = '42208d679db3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('properties',
    sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
    sa.Column(
        "landlord_id",
        postgresql.UUID(as_uuid=True),
        sa.ForeignKey("landlords.id", ondelete="CASCADE"),
        nullable=True,
    ),
    sa.Column("name", sa.String(length=255), nullable=True),
    sa.Column("governance", sa.String(length=255), nullable=True),
    sa.Column("city", sa.String(length=255), nullable=True),
    sa.Column("address", sa.String(length=255), nullable=True),
    sa.Column("address2", sa.String(length=255), nullable=True),
    sa.Column("property_no", sa.String(length=222), nullable=True),
    sa.Column("paci_no", sa.String(length=240), nullable=True),
    sa.Column("civil_no", sa.String(length=240), nullable=True),
    sa.Column("type", sa.Enum("residential", "commercial", name="p_type"), nullable=True),
    sa.Column("property_type", sa.String(length=255), nullable=True),
    sa.Column("pictures", sa.JSON(), nullable=True),
    sa.Column("latitude", sa.String(length=255), nullable=True),
    sa.Column("longitude", sa.String(length=255), nullable=True),
    sa.Column("build_year", sa.String(length=255), nullable=True),
    sa.Column("description", sa.String(length=255), nullable=True),
    sa.Column("book_value", sa.String(length=255), nullable=True),
    sa.Column("estimate_value", sa.String(length=255), nullable=True),
    sa.Column("status", sa.String(length=255), nullable=True),
    sa.Column("created_at", postgresql.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    sa.Column("updated_at", postgresql.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('properties')
    # ### end Alembic commands ###
