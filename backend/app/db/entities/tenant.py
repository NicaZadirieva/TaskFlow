from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.entities.base import Base


class Tenant(Base):
    __tablename__ = "tenant"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )  # для поддоменов tenant.app.com
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True
    )  # блокировка тенанта для клиента (например, за неуплату)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    users: Mapped[list["User"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="tenant", cascade="all, delete-orphan"
    )
    projects: Mapped[list["Project"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="tenant", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["Task"]] = relationship(back_populates="tenant")  # type: ignore  # noqa: F821

    def __init__(self, name: str, slug: str):
        self.name = name
        self.slug = slug
