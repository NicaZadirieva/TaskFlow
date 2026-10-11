from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    String,
    Table,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base

# M2M: task <-> github_label
task_github_label = Table(
    "task_github_label",
    Base.metadata,
    Column(
        "task_id",
        ForeignKey("task.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "github_label_id",
        ForeignKey("github_label.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class GithubLabel(Base):
    __tablename__ = "github_label"
    __table_args__ = (
        UniqueConstraint("tenant_id", "name",
                         name="uq_github_label_tenant_name"),
        Index("idx_github_label_tenant", "tenant_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenant.id"), nullable=False, index=True
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    # hex без '#' — например 'ff0000'
    # TODO: на будущее color: Mapped[str] = mapped_column(String(6), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # Связи
    tasks: Mapped[list["Task"]] = relationship(  # type: ignore  # noqa: F821
        secondary=task_github_label,
        back_populates="tags",
    )
