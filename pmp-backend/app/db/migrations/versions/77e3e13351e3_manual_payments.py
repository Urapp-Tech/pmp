"""manual_payments

Revision ID: 77e3e13351e3
Revises: b7fa0f3e9cdd
Create Date: 2025-10-09 11:38:42.851511

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "77e3e13351e3"
down_revision: Union[str, None] = "b7fa0f3e9cdd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1) invoices.submitted_type enum
    submittedtype = postgresql.ENUM("auto", "manual", name="submittedtype")
    submittedtype.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "invoices",
        sa.Column(
            "submitted_type",
            submittedtype,
            nullable=False,
            server_default="auto",
        ),
    )
    op.alter_column("invoices", "submitted_type", server_default=None)

    # 2) manual_payments table
    op.create_table(
        "manual_payments",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "invoice_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("invoices.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(  # when superadmin submits (we store invoice's landlord here)
            "landlord_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("landlords.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(  # when landlord user submits (we store the user id here)
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("amount", sa.Numeric(12, 3), nullable=False),
        sa.Column("currency", sa.String(), nullable=False, server_default="KWD"),
        sa.Column("method", sa.String(), nullable=True),
        sa.Column("deposit_reference", sa.String(), nullable=True),
        sa.Column("deposit_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        # JSONB docs
        sa.Column("docs", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        # submitted_by can be super_admin.id OR landlord.id, so **no FK** here
        sa.Column("submitted_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_index("idx_manual_payments_invoice_id", "manual_payments", ["invoice_id"])
    op.create_index(
        "idx_manual_payments_landlord_id", "manual_payments", ["landlord_id"]
    )
    op.create_index("idx_manual_payments_user_id", "manual_payments", ["user_id"])
    op.create_index(
        "idx_manual_payments_deposit_date", "manual_payments", ["deposit_date"]
    )


def downgrade():
    op.drop_index("idx_manual_payments_deposit_date", table_name="manual_payments")
    op.drop_index("idx_manual_payments_user_id", table_name="manual_payments")
    op.drop_index("idx_manual_payments_landlord_id", table_name="manual_payments")
    op.drop_index("idx_manual_payments_invoice_id", table_name="manual_payments")
    op.drop_table("manual_payments")

    op.drop_column("invoices", "submitted_type")
    submittedtype = postgresql.ENUM("auto", "manual", name="submittedtype")
    submittedtype.drop(op.get_bind(), checkfirst=True)
