from datetime import datetime
from sqlalchemy import ForeignKey, DateTime, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.entities.base import Base
from app.db.entities.task import Task
from app.db.entities.user import User


class AssignedTask(Base):
    __tablename__ = "assigned_task"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Мультитенантность: изоляция на уровне связи
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenant.id"), nullable=False, index=True
    )

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    task_id: Mapped[int] = mapped_column(ForeignKey("task.id"), nullable=False)

    # Бизнес-поля
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    role_in_task: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )  # "executor", "reviewer"
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True
    )  # soft delete для связи

    # Отношения
    user: Mapped["User"] = relationship(
        back_populates="assigned_tasks",
        foreign_keys=[user_id],
        lazy="selectin",  # хороший компромисс для списков
    )
    task: Mapped["Task"] = relationship(
        back_populates="assignees",
        foreign_keys=[task_id],
        lazy="selectin",
    )

    def __repr__(self):
        return f"<AssignedTask(id={self.id}, user_id={self.user_id}, task_id={self.task_id}, role={self.role_in_task})>"
