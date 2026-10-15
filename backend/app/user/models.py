from enum import Enum as PyEnum

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db import Base


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
    # TODO: добавить login в авторизацию и добавление исполнителя (вместо name)
    login: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # дефолтное значение для всех ролей текущего юзера и всех задач
    hourly_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)

    tenant: Mapped["Tenant"] = relationship(back_populates="users")  # type: ignore  # noqa: F821
    executors: Mapped[list["Executor"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Executor.user_id",
    )

    def __init__(
        self,
        login: str,
        tenant_id: int,
        role: TenantRole,
        name: str,
        email: str,
        password_hash: str,
        is_active: bool = True,
        hourly_rate: int | None = None,
    ):
        self.tenant_id = tenant_id
        self.login = login
        self.role = role
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.is_active = is_active
        self.hourly_rate = hourly_rate
