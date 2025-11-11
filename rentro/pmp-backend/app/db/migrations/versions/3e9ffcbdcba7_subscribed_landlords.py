"""subscribed_landlords

Revision ID: 3e9ffcbdcba7
Revises: e9ca4f6e2f71
Create Date: 2025-10-01 10:45:20.795546

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "3e9ffcbdcba7"
down_revision: Union[str, None] = "e9ca4f6e2f71"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    op.create_table(
        "subscribed_landlords",
        sa.Column(
            "id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "landlord_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("landlords.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "subscription_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("subscriptions.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("plan_name", sa.Text(), nullable=True),
        # per your revision: put these here (not on landlords)
        sa.Column("holding_properties", sa.Integer(), nullable=False),
        sa.Column(
            "total_amount", sa.dialects.postgresql.NUMERIC(18, 3), nullable=False
        ),
        sa.Column(
            "discounted_amount",
            sa.dialects.postgresql.NUMERIC(18, 3),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column("due_amount", sa.dialects.postgresql.NUMERIC(18, 3), nullable=False),
        sa.Column(
            "status", sa.Text(), nullable=False, server_default=sa.text("'pending'")
        ),  # pending|approved|rejected
        sa.Column(
            "approved_by",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("super_admins.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("expiration_date", sa.TIMESTAMP(timezone=True), nullable=True),
        # renewal helper (we’ll update at least 7 days before expiry)
        sa.Column("payment_link", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_index(
        "ix_subscribed_landlords_status_exp",
        "subscribed_landlords",
        ["status", "expiration_date"],
    )


def downgrade():
    op.drop_index(
        "ix_subscribed_landlords_status_exp", table_name="subscribed_landlords"
    )
    op.drop_table("subscribed_landlords")
