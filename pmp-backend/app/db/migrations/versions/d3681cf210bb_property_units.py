"""property_units

Revision ID: d3681cf210bb
Revises: e28d10dffbe9
Create Date: 2025-06-11 11:49:37.103026

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd3681cf210bb'
down_revision: Union[str, None] = 'e28d10dffbe9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'property_units',
        
        sa.Column(
                "id",
                postgresql.UUID(as_uuid=True),
                primary_key=True,
                server_default=sa.text("uuid_generate_v4()"),
            ),
        sa.Column(
            "property_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("properties.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('unit_no', sa.String(length=255), nullable=True),
        sa.Column('unit_type', sa.String(length=255), nullable=True),
        sa.Column('size', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=255), nullable=True),
        sa.Column('electricity_meter', sa.String(length=255), nullable=True),
        sa.Column('water_meter', sa.String(length=255), nullable=True),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("pictures", sa.JSON(), nullable=True),
        sa.Column("bedrooms", sa.String(length=255), nullable=True),
        sa.Column("bathrooms", sa.String(length=255), nullable=True),
        sa.Column("rent", sa.String(length=255), nullable=True),
        sa.Column("account_name", sa.String(length=255), nullable=True),
        sa.Column("account_no", sa.String(length=255), nullable=True),
        sa.Column("bank_name", sa.String(length=255), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('property_units')
    # ### end Alembic commands ###
