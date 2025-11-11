"""alter_super_admins

Revision ID: b7fa0f3e9cdd
Revises: c8553d1f5c85
Create Date: 2025-10-07 11:40:02.458985

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "b7fa0f3e9cdd"
down_revision: Union[str, None] = "c8553d1f5c85"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "super_admins",
        sa.Column(
            "role_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("roles.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_super_admins_role_id", "super_admins", ["role_id"], unique=False
    )

    # Enforce ONLY ONE root super admin (role_id IS NULL) in Postgres
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS uq_single_root_super_admin
        ON super_admins ((TRUE))
        WHERE role_id IS NULL;
        """
    )


def downgrade():
    op.drop_index("ix_super_admins_role_id", table_name="super_admins")
    op.drop_column("super_admins", "role_id")
    op.execute("DROP INDEX IF EXISTS uq_single_root_super_admin;")
