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
    """Upgrade schema."""
    # Enable uuid-ossp extension for UUID generation
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
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
            unique=True
        ),
        sa.Column('tenant_type', sa.Enum('individual', 'company', name='tenant_type'), nullable=False),
        sa.Column('civil_id', sa.String(length=255), nullable=True),
        sa.Column('nationality', sa.String(length=255), nullable=True),
        sa.Column('legal_case', sa.Boolean, default=False, nullable=False),
        sa.Column('language', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=255), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('tenants')
    op.execute("DROP TYPE tenant_type")
    # ### end Alembic commands ###
    
