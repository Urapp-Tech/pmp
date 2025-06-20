"""Fix role_permissions column names

Revision ID: 4eff96e18a79
Revises: 04a398215b59
Create Date: 2025-06-19 20:31:33.241120

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "4eff96e18a79"
down_revision: Union[str, None] = "04a398215b59"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename old columns
    op.alter_column("role_permissions", "role", new_column_name="role_id")
    op.alter_column("role_permissions", "permission", new_column_name="permission_id")

    # Drop old FKs
    op.drop_constraint(
        "role_permissions_role_fkey", "role_permissions", type_="foreignkey"
    )
    op.drop_constraint(
        "role_permissions_permission_fkey", "role_permissions", type_="foreignkey"
    )

    # Create new FKs
    op.create_foreign_key(
        "fk_role_permissions_role_id",
        "role_permissions",
        "roles",
        ["role_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "fk_role_permissions_permission_id",
        "role_permissions",
        "permissions",
        ["permission_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop new FKs
    op.drop_constraint(
        "fk_role_permissions_permission_id", "role_permissions", type_="foreignkey"
    )
    op.drop_constraint(
        "fk_role_permissions_role_id", "role_permissions", type_="foreignkey"
    )

    # Rename columns back
    op.alter_column("role_permissions", "role_id", new_column_name="role")
    op.alter_column("role_permissions", "permission_id", new_column_name="permission")

    # Restore old FKs
    op.create_foreign_key(
        "role_permissions_role_fkey",
        "role_permissions",
        "roles",
        ["role"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "role_permissions_permission_fkey",
        "role_permissions",
        "permissions",
        ["permission"],
        ["id"],
        ondelete="CASCADE",
    )
