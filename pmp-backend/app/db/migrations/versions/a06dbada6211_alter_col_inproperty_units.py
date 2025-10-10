"""alter_col_inproperty_units

Revision ID: a06dbada6211
Revises: c8553d1f5c85
Create Date: 2025-10-09 06:15:53.291219

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a06dbada6211'
down_revision: Union[str, None] = '77e3e13351e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # --- Drop old FK (name may vary across envs) ---
    op.execute('ALTER TABLE managers DROP CONSTRAINT IF EXISTS fk_managers_assign_property_unit')
    op.execute('ALTER TABLE managers DROP CONSTRAINT IF EXISTS managers_assign_property_unit_fkey')

    # --- Drop old column ---
    with op.batch_alter_table("managers") as batch_op:
        batch_op.drop_column("assign_property_unit")

    # --- Add new column on managers ---
    op.add_column(
        "managers",
        sa.Column(
            "assign_property",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )

    # --- Create new FK to properties(id) ---
    op.create_foreign_key(
        "fk_managers_assign_property",
        source_table="managers",
        referent_table="properties",
        local_cols=["assign_property"],
        remote_cols=["id"],
        ondelete="CASCADE",
    )


def downgrade():
    # --- Drop new FK + column ---
    op.drop_constraint("fk_managers_assign_property", "managers", type_="foreignkey")
    with op.batch_alter_table("managers") as batch_op:
        batch_op.drop_column("assign_property")

    # --- Recreate old column (nullable first to be safe) ---
    op.add_column(
        "managers",
        sa.Column(
            "assign_property_unit",
            postgresql.UUID(as_uuid=True),
            nullable=True,  # use False if you have backfilled data
        ),
    )

    # --- Recreate old FK to property_units(id) ---
    op.create_foreign_key(
        "fk_managers_assign_property_unit",
        source_table="managers",
        referent_table="property_units",
        local_cols=["assign_property_unit"],
        remote_cols=["id"],
        ondelete="CASCADE",
    )
