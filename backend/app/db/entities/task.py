from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.entities.base import Base


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
    project_id: Mapped[int | None] = mapped_column(
        ForeignKey("project.id"), nullable=True, index=True
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)

    status: Mapped[Status] = mapped_column(Enum(Status), default=Status.BACKLOG)
    priority: Mapped[Priority] = mapped_column(Enum(Priority), default=Priority.MEDIUM)

    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    estimated_hours: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    actual_hours: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True
    )  # без default

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
