"""add_col_property_ibn

Revision ID: e950f32bb2d7
Revises: 8568d23fd8c2
Create Date: 2025-07-15 09:32:39.615635

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e950f32bb2d7'
down_revision: Union[str, None] = '8568d23fd8c2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column("properties", sa.Column("ibn_no", sa.String(length=255), nullable=True))
    

def downgrade():
    op.drop_column("properties", "ibn_no")