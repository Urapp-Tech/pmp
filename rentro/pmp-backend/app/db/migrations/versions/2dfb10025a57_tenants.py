"""tenants

Revision ID: 2dfb10025a57
Revises: d3681cf210bb
Create Date: 2025-06-11 11:59:31.901402
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2dfb10025a57'
down_revision: Union[str, None] = 'd3681cf210bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # Enable uuid-ossp extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Create tenants table
    op.create_table(
        'tenants',
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column('tenant_type', sa.Enum('individual', 'company', name='tenant_type'), nullable=False),
        sa.Column('civil_id', sa.String(length=255), nullable=True),
        sa.Column('nationality', sa.String(length=255), nullable=True),
        sa.Column('legal_case', sa.Boolean, server_default=sa.text("false"), nullable=False),
        sa.Column('language', sa.String(length=255), nullable=True),

        # Replacing status with is_active
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text("true")),

        # Contract-related
        sa.Column("property_unit_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("property_units.id", ondelete="SET NULL"), nullable=True),
        sa.Column("contract_start", postgresql.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("contract_end", postgresql.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("contract_number", sa.String(length=255), nullable=True),
        sa.Column("agreement_doc", sa.String(length=255), nullable=True),

        # Rent info
        sa.Column("rent_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("rent_pay_day", sa.Integer(), nullable=True),
        sa.Column("payment_cycle", sa.Enum("Monthly", "Quarterly", "Yearly", name="payment_cycle"), nullable=True),
        sa.Column("leaving_date", postgresql.TIMESTAMP(timezone=True), nullable=True),

        # Approval
        sa.Column("is_approved", sa.Boolean(), nullable=True, server_default=sa.text("false")),

        # Timestamps
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )


def downgrade() -> None:
    # Drop table
    op.drop_table('tenants')

    # Drop ENUM types
    op.execute("DROP TYPE tenant_type")
    op.execute("DROP TYPE payment_cycle")
