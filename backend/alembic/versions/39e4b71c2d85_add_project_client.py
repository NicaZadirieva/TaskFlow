"""add project client

Revision ID: 39e4b71c2d85
Revises: bb49e2004684
"""

import sqlalchemy as sa

from alembic import op

revision = "39e4b71c2d85"
down_revision = "bb49e2004684"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("project", sa.Column("client_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_project_client",
        "project",
        "user",
        ["client_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_project_client_id", "project", ["client_id"])


def downgrade() -> None:
    op.drop_index("ix_project_client_id", table_name="project")
    op.drop_constraint("fk_project_client", "project", type_="foreignkey")
    op.drop_column("project", "client_id")
