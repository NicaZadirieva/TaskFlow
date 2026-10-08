from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.db.entities.task import Priority, Status


class CreateTaskRequest(BaseModel):
    project_id: int | None = None

    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = None

    status: Status = Status.BACKLOG
    priority: Priority = Priority.MEDIUM

    due_date: datetime | None = None

    estimated_budget: Decimal | None = Field(
        default=None,
        max_digits=12,
        decimal_places=2,
        ge=0,
    )
    actual_budget: Decimal | None = Field(
        default=None,
        max_digits=12,
        decimal_places=2,
        ge=0,
    )

    estimated_hours: Decimal | None = Field(
        default=None,
        max_digits=5,
        decimal_places=2,
        ge=0,
    )
    actual_hours: Decimal | None = Field(
        default=None,
        max_digits=5,
        decimal_places=2,
        ge=0,
    )

    note: dict[str, Any] | None = None
    task_images: list[str] | None = None


class CreateTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
