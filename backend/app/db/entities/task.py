from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.entities.base import Base
from app.db.entities.github_label import task_github_label


# TODO: переходы между статусами лучше контролировать в коде
class Status(PyEnum):
    OPEN = "OPEN"
    BACKLOG = "BACKLOG"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


class Priority(PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(Base):
    __tablename__ = "task"
    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenant.id"), nullable=False, index=True
    )
    project_id: Mapped[int | None] = mapped_column(
        ForeignKey("project.id"), nullable=True, index=True
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)

    status: Mapped[Status] = mapped_column(Enum(Status), default=Status.BACKLOG)
    priority: Mapped[Priority] = mapped_column(Enum(Priority), default=Priority.MEDIUM)

    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    estimated_budget: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    actual_budget: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)

    estimated_hours: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    actual_hours: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    note: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # изображения
    task_images: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)

    created_by: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Связи
    tenant: Mapped["Tenant"] = relationship(back_populates="tasks")  # type: ignore  # noqa: F821
    project: Mapped[Optional["Project"]] = relationship(back_populates="tasks")  # type: ignore  # noqa: F821
    created_by_user: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        foreign_keys=[created_by],
    )
    assignees: Mapped[list["AssignedTask"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="task",
        cascade="all, delete-orphan",
    )
    tags: Mapped[list["GithubLabel"]] = relationship(  # type: ignore  # noqa: F821
        secondary=task_github_label,
        back_populates="tasks",
        lazy="selectin",  # чтобы не ловить N+1 при отдаче
    )
