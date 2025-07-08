"""payment_history

Revision ID: 00a361b26c17
Revises: ab6ec42d8586
Create Date: 2025-07-07 09:36:56.566826

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "00a361b26c17"
down_revision: Union[str, None] = "ab6ec42d8586"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "payment_history",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False
        ),
        sa.Column(
            "subscription_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("subscriptions.id"),
            nullable=True,
        ),
        sa.Column(
            "property_unit_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("property_units.id"),
            nullable=True,
        ),
        sa.Column(
            "invoice_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("invoices.id"),
            nullable=True,
        ),
        sa.Column(
            "payment_id",
             sa.String(length=222),
            nullable=True,
        ),
        sa.Column(
            "payload",
             sa.JSON,
            nullable=True,
        ),
        sa.Column("amount", sa.Float, nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False, default="KWD"),
        sa.Column(
            "payment_type",
            sa.Enum("RENT", "SUBSCRIPTION", name="paymenttype"),
            nullable=False,
        ),
        sa.Column("payment_url", sa.Text, nullable=True),
        sa.Column(
            "status",
            sa.Enum("PENDING", "PAID", "FAILED", name="paymentstatus"),
            nullable=False,
            default="PENDING",
        ),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )


def downgrade():
    op.drop_table("payment_history")
    op.execute("DROP TYPE IF EXISTS paymenttype CASCADE")
    op.execute("DROP TYPE IF EXISTS paymentstatus CASCADE")
