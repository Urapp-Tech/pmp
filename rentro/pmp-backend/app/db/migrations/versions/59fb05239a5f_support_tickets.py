"""support_tickets

Revision ID: 59fb05239a5f
Revises: 2dfb10025a57
Create Date: 2025-06-17 11:29:34.614358

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "59fb05239a5f"
down_revision: Union[str, None] = "2dfb10025a57"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "support_tickets",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "sender_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False
        ),
        sa.Column(
            "sender_role_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False
        ),
        sa.Column(
            "receiver_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False
        ),
        sa.Column(
            "receiver_role_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "open", "in_progress", "resolved", "closed", name="supportticketstatus"
            ),
            nullable=False,
            server_default="open",
        ),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )


def downgrade():
    """Downgrade schema."""
    op.drop_table("support_tickets")
    op.execute("DROP TYPE IF EXISTS roleenum CASCADE")
    op.execute("DROP TYPE IF EXISTS supportticketstatus CASCADE")
