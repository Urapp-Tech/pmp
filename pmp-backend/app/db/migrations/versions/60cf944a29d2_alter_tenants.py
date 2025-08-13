"""alter-tenants

Revision ID: 60cf944a29d2
Revises: e950f32bb2d7
Create Date: 2025-08-12 13:50:09.512301

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "60cf944a29d2"
down_revision: Union[str, None] = "e950f32bb2d7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Change agreement_doc column type to TEXT
    op.alter_column(
        "tenants",
        "agreement_doc",
        type_=sa.Text(),
        existing_type=sa.String(length=255),
        existing_nullable=True,
    )


def downgrade() -> None:
    # Change agreement_doc column type back to VARCHAR(255)
    op.alter_column(
        "tenants",
        "agreement_doc",
        type_=sa.String(length=255),
        existing_type=sa.Text(),
        existing_nullable=True,
    )
