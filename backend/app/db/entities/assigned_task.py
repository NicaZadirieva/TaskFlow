from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.entities.base import Base


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

    role_in_task: Mapped[str] = mapped_column(  # Не nullable, всегда есть роль
        String(15), nullable=False
    )
    assigned_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # учёт часов по конкретному исполнителю у задачи
    hours: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    planned: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    
    # значение для роли текущего исполнителя этой задачи
    hourly_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)

    user: Mapped["User"] = relationship(back_populates="assigned_tasks")  # type: ignore  # noqa: F821
    task: Mapped["Task"] = relationship(back_populates="assignees")  # type: ignore  # noqa: F821

    # soft-delete / история переназначений
    removed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    remove_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reassigned_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
