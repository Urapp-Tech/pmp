"""alter_tenants

Revision ID: 6678535c7459
Revises: 04a398215b59
Create Date: 2025-06-24 07:38:58.863010

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "6678535c7459"
down_revision: Union[str, None] = "04a398215b59"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.drop_constraint("tenants_user_id_key", "tenants", type_="unique")

    # Create new enum type for payment_cycle
    payment_cycle_enum = postgresql.ENUM(
        "Monthly", "Quarterly", "Yearly", name="payment_cycle"
    )
    payment_cycle_enum.create(op.get_bind())

    # Add new columns
    op.add_column(
        "tenants",
        sa.Column(
            "property_unit_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("property_units.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )

    op.add_column(
        "tenants",
        sa.Column(
            "contract_start", postgresql.TIMESTAMP(timezone=True), nullable=False
        ),
    )
    op.add_column(
        "tenants",
        sa.Column("contract_end", postgresql.TIMESTAMP(timezone=True), nullable=False),
    )
    op.add_column(
        "tenants", sa.Column("contract_number", sa.String(length=255), nullable=True)
    )
    op.add_column(
        "tenants",
        sa.Column(
            "is_approved", sa.Boolean(), nullable=True, server_default=sa.text("false")
        ),
    )
    op.add_column(
        "tenants",
        sa.Column("rent_price", sa.Numeric(precision=10, scale=2), nullable=False),
    )
    op.add_column(
        "tenants",
        sa.Column("leaving_date", postgresql.TIMESTAMP(timezone=True), nullable=True),
    )
    op.add_column(
        "tenants",
        sa.Column("agreement_doc", sa.String(length=255), nullable=True),
    )
    op.add_column("tenants", sa.Column("rent_pay_day", sa.Integer(), nullable=True))
    op.add_column(
        "tenants",
        sa.Column(
            "payment_cycle",
            sa.Enum("Monthly", "Quarterly", "Yearly", name="payment_cycle"),
            nullable=True,
        ),
    )

    # Replace status with is_active
    op.drop_column("tenants", "status")
    op.add_column(
        "tenants",
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")
        ),
    )


def downgrade() -> None:

    op.create_unique_constraint("tenants_user_id_key", "tenants", ["user_id"])

    # Drop newly added columns
    op.drop_column("tenants", "is_active")
    op.add_column("tenants", sa.Column("status", sa.String(length=255), nullable=True))

    op.drop_column("tenants", "payment_cycle")
    op.drop_column("tenants", "rent_pay_day")
    op.drop_column("tenants", "leaving_date")
    op.drop_column("tenants", "rent_price")
    op.drop_column("tenants", "contract_number")
    op.drop_column("tenants", "agreement_doc")
    op.drop_column("tenants", "is_approved")
    op.drop_column("tenants", "contract_end")
    op.drop_column("tenants", "contract_start")
    op.drop_column("tenants", "property_unit_id")

    # Drop ENUM type
    op.execute("DROP TYPE payment_cycle")
