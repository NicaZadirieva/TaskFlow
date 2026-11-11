"""Add project monetary budget."""

import sqlalchemy as sa
from alembic import op

revision = "2f1a3b4c5d6e"
down_revision = "39e4b71c2d85"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("project", sa.Column("budget", sa.Numeric(10, 2), nullable=True))


def downgrade() -> None:
    op.drop_column("project", "budget")
