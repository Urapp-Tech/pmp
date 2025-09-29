"""alter_users

Revision ID: af0b5f108c23
Revises: 648db5d0c6f8
Create Date: 2025-09-29 14:06:17.948707

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "af0b5f108c23"
down_revision: Union[str, None] = "648db5d0c6f8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1) Drop the global unique constraint (name may vary, handle defensively)
    # Try the common default name:
    try:
        op.drop_constraint("users_email_key", "users", type_="unique")
    except Exception:
        pass

    # 2) Also drop any lingering unique-only-email indexes regardless of name
    # (We do it with raw SQL because alembic/op has no wildcard drop)
    op.execute(
        """
    DO $$
    DECLARE
        _i record;
    BEGIN
        FOR _i IN
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = 'users'
              AND indexdef ILIKE 'CREATE UNIQUE INDEX%'
              AND indexdef ILIKE '%(email)%'
              AND indexdef NOT ILIKE '%(landlord_id,%'
        LOOP
            EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(_i.indexname);
        END LOOP;
    END$$;
    """
    )

    # 3) Ensure case-insensitive per-landlord unique
    # Option A: functional index using lower(email)
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS users_landlord_email_uniq
        ON users (landlord_id, lower(email));
    """
    )

    # Optional: if you prefer citext instead (alternative to the above):
    # op.execute('CREATE EXTENSION IF NOT EXISTS citext;')
    # op.execute('DROP INDEX IF EXISTS users_landlord_email_uniq;')
    # op.execute('ALTER TABLE users ALTER COLUMN email TYPE citext;')
    # op.execute('CREATE UNIQUE INDEX IF NOT EXISTS users_landlord_email_uniq ON users (landlord_id, email);')


def downgrade():
    # Remove the composite index
    op.execute("DROP INDEX IF EXISTS users_landlord_email_uniq;")
    # Recreate global unique constraint on email (old behavior)
    op.create_unique_constraint("users_email_key", "users", ["email"])
