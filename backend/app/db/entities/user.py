from datetime import datetime
from enum import Enum as PyEnum
from typing import List

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.entities.assigned_task import AssignedTask
from app.db.entities.base import Base
from app.db.entities.task import Task
from app.db.entities.tenant import Tenant


class TenantRole(PyEnum):
    OWNER = "OWNER"  # ты (фрилансер)
    CLIENT = "CLIENT"  # заказчик
    TEAM = "TEAM"  # твои помощники (если будут)


class User(Base):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenant.id"), nullable=False, index=True
    )
    role: Mapped[TenantRole] = mapped_column(
        Enum(TenantRole), default=TenantRole.CLIENT
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    tenant: Mapped["Tenant"] = relationship(back_populates="users")
    created_tasks: Mapped[List["Task"]] = relationship(
        back_populates="created_by_user", foreign_keys="Task.created_by"
    )
    assigned_tasks: Mapped[list["AssignedTask"]] = relationship(
        back_populates="user",
        foreign_keys=[AssignedTask.user_id],
        cascade="all, delete-orphan",
    )
