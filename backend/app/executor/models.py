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

from app.shared.db import Base


class Executor(Base):
    __tablename__ = "executors"
    __table_args__ = (
        UniqueConstraint("user_id", "task_id", name="uq_executors_user_task"),
        Index("idx_executor_user_active", "user_id", "is_active"),
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
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # учёт часов по конкретному исполнителю у задачи
    hours: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    planned: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)

    # значение для роли текущего исполнителя этой задачи
    hourly_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)

    assigned_by: Mapped[int | None] = mapped_column(
        ForeignKey("user.id"), nullable=True
    )
    assigner: Mapped["User | None"] = relationship(  # type: ignore  # noqa: F821
        foreign_keys=[assigned_by],
    )

    user: Mapped["User"] = relationship(back_populates="executors",  foreign_keys=[user_id])  # type: ignore  # noqa: F821
    task: Mapped["Task"] = relationship(back_populates="executors")  # type: ignore  # noqa: F821

    # soft-delete / история переназначений
    removed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False)
    remove_reason: Mapped[str | None] = mapped_column(
        String(500), nullable=True)
    reassigned_reason: Mapped[str | None] = mapped_column(
        String(500), nullable=True)
    
    def __init__(
        self,
        user_id: int,
        task_id: int,
        tenant_id: int,
        role_in_task: str,
        hours: float | None = None,
        planned: float | None = None,
        hourly_rate: int | None = None,
        assigned_by: int | None = None,
        is_active: bool = True,
        removed: bool = False,
        remove_reason: str | None = None,
        reassigned_reason: str | None = None,
        id: int | None = None,
        assigned_at: datetime | None = None,
    ) -> None:
        self.id = id
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.task_id = task_id
        self.role_in_task = role_in_task
        if assigned_at is not None:
            self.assigned_at = assigned_at
        self.hours = hours
        self.planned = planned
        self.hourly_rate = hourly_rate
        self.assigned_by = assigned_by
        self.is_active = is_active
        self.removed = removed
        self.remove_reason = remove_reason
        self.reassigned_reason = reassigned_reason
