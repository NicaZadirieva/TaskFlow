from datetime import datetime
from typing import List, Optional
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.entities.base import Base
from app.db.entities.task import Status, Task
from app.db.entities.tenant import Tenant


class Project(Base):
    __tablename__ = "project"
    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenant.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # «Верстка лендинга», «Интеграция API»
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Status] = mapped_column(Enum(Status), default=Status.BACKLOG)
    budget_cents: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )  # бюджет проекта в рублях (int!)
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    tenant: Mapped["Tenant"] = relationship(back_populates="projects")
    tasks: Mapped[List["Task"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
