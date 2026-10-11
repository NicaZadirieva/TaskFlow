from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db import Base
from app.github_label.models import task_github_label


class Status(PyEnum):
    OPEN = "OPEN"
    BACKLOG = "BACKLOG"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


class Priority(PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


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

    status: Mapped[Status] = mapped_column(
        Enum(Status), default=Status.BACKLOG)
    priority: Mapped[Priority] = mapped_column(
        Enum(Priority), default=Priority.MEDIUM)

    estimated_budget: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    actual_budget: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True)

    estimated_hours: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True)
    actual_hours: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True)
    note: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # изображения
    task_images: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)

    created_by: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False)
    due_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())

    # Связи
    tenant: Mapped["Tenant"] = relationship(back_populates="tasks")  # type: ignore  # noqa: F821
    project: Mapped[Optional["Project"]] = relationship(back_populates="tasks")  # type: ignore  # noqa: F821
    created_by_user: Mapped["User"] = relationship(  # type: ignore  # noqa: F821
        foreign_keys=[created_by],
    )
    executors: Mapped[list["Executor"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="task",
        cascade="all, delete-orphan",
    )
    tags: Mapped[list["GithubLabel"]] = relationship(  # type: ignore  # noqa: F821
        secondary=task_github_label,
        back_populates="tasks",
        lazy="selectin",  # чтобы не ловить N+1 при отдаче
    )

    def __init__(self,  tenant_id: int,
                 created_by: int,
                 title: str,
                 project_id: int | None = None,
                 description: str | None = None,
                 status: Status = Status.BACKLOG,
                 priority: Priority = Priority.MEDIUM,
                 due_date: datetime | None = None,
                 estimated_budget: float | None = None,
                 actual_budget: float | None = None,
                 estimated_hours: float | None = None,
                 actual_hours: float | None = None,
                 note: dict | None = None,
                 task_images: list[str] | None = None,
                 ) -> None:
        self.tenant_id = tenant_id
        self.created_by = created_by
        self.title = title
        self.project_id = project_id
        self.description = description
        self.status = status
        self.priority = priority
        self.due_date = due_date
        self.estimated_budget = estimated_budget
        self.actual_budget = actual_budget
        self.estimated_hours = estimated_hours
        self.actual_hours = actual_hours
        self.note = note
        self.task_images = task_images
