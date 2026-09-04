from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.entities.assigned_task import AssignedTask
from app.db.entities.base import Base
from app.db.entities.project import Project
from app.db.entities.tenant import Tenant
from app.db.entities.user import User


# TODO: переходы между статусами лучше контролировать в коде
# Ex: нельзя из DONE вернуться в BACKLOG без ревью)
class Status(PyEnum):
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
    project_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("project.id"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Status] = mapped_column(Enum(Status), default=Status.BACKLOG)
    priority: Mapped[Priority] = mapped_column(Enum(Priority), default=Priority.MEDIUM)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    estimated_hours: Mapped[Optional[float]] = mapped_column(
        Numeric(5, 2), nullable=True
    )  # оценка в часах
    actual_hours: Mapped[Optional[float]] = mapped_column(
        Numeric(5, 2), default=0.0
    )  # сколько реально потрачено

    created_by: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    # связи
    tenant: Mapped["Tenant"] = relationship(back_populates="tasks")
    project: Mapped[Optional["Project"]] = relationship(
        back_populates="tasks", lazy="selectin"
    )
    created_by_user: Mapped["User"] = relationship(
        back_populates="created_tasks",
        foreign_keys=[created_by],
        lazy="selectin",
    )
    assignees: Mapped[list["AssignedTask"]] = relationship(
        back_populates="task",
        foreign_keys=[AssignedTask.task_id],
        cascade="all, delete-orphan",
    )
