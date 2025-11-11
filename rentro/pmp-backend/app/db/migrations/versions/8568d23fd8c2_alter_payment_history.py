"""alter_payment_history

Revision ID: 8568d23fd8c2
Revises: 1389939171bf
Create Date: 2025-07-11 13:12:59.050048

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "8568d23fd8c2"
down_revision: Union[str, None] = "1389939171bf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Add payout_status column
    op.add_column(
        "payment_history",
        sa.Column(
            "payout_status",
            sa.String(length=50),
            nullable=False,
            server_default="pending",
            comment="Tracks payout state: pending, success, failed",
        ),
    )

    # Add payout_error column
    op.add_column(
        "payment_history",
        sa.Column(
            "payout_error",
            sa.Text(),
            nullable=True,
            comment="Stores error message if payout failed",
        ),
    )


def downgrade():
    # Drop payout_status column
    op.drop_column("payment_history", "payout_status")
    # Drop payout_error column
    op.drop_column("payment_history", "payout_error")
