from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db import Base


class Project(Base):
    __tablename__ = "project"
    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenant.id"), nullable=False, index=True
    )
    client_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True, index=True
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    budget_hours: Mapped[float | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )  # бюджет в часах
    budget: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    tenant: Mapped["Tenant"] = relationship(back_populates="projects")  # type: ignore  # noqa: F821
    tasks: Mapped[list["Task"]] = relationship(  # type: ignore  # noqa: F821
        back_populates="project", cascade="all, delete-orphan"
    )
