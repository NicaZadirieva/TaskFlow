from enum import Enum as PyEnum

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.entities.base import Base


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
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Добавить для расчёта стоимости
    hourly_rate: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )  # в копейках/центах

    tenant: Mapped["Tenant"] = relationship(back_populates="users")  # type: ignore  # noqa: F821
    assigned_tasks: Mapped[list["AssignedTask"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="user",
        cascade="all, delete-orphan",
    )
