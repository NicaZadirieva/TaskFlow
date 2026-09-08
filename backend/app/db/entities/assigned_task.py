from datetime import datetime
from sqlalchemy import (
    Enum,
    ForeignKey,
    DateTime,
    Boolean,
    Index,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.entities.base import Base
from app.db.entities.task import Task
from app.db.entities.user import User
from enum import Enum as PyEnum


class TaskRole(PyEnum):
    EXECUTOR = "executor"
    REVIEWER = "reviewer"


class AssignedTask(Base):
    __tablename__ = "assigned_task"
    __table_args__ = (
        UniqueConstraint("user_id", "task_id", name="uq_user_task"),
        Index("idx_assigned_task_user_active", "user_id", "is_active"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenant.id"), nullable=False, index=True
    )

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    task_id: Mapped[int] = mapped_column(ForeignKey("task.id"), nullable=False)

    role_in_task: Mapped[TaskRole] = mapped_column(  # Не nullable, всегда есть роль
        Enum(TaskRole), nullable=False
    )
    assigned_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship(back_populates="assigned_tasks")
    task: Mapped["Task"] = relationship(back_populates="assignees")
