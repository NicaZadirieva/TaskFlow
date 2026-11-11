from pydantic import BaseModel, ConfigDict
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field

from app.task.models import Priority, Status


class TagOut(BaseModel):
    name: str


class UpdateTaskProjectRequest(BaseModel):
    project_id: int | None = Field(gt=0)


class CreateTaskExecutor(BaseModel):
    user_id: int
    login: str
    role_in_task: str
    is_active: bool
    hours: Decimal
    planned: Decimal
    hourly_rate: int


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
    tags: list[TagOut] | None = None
    executors: list[CreateTaskExecutor] | None = None


class CreateTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int


class UpdateTaskRequest(BaseModel):
    version: int = Field(ge=1)
    title: str = Field(min_length=1, max_length=200)
    description: str | None
    status: Status
    priority: Priority
    due_date: datetime | None
    estimated_budget: Decimal | None = Field(ge=0, max_digits=12, decimal_places=2)
    actual_budget: Decimal | None = Field(ge=0, max_digits=12, decimal_places=2)
    estimated_hours: Decimal | None = Field(ge=0, max_digits=5, decimal_places=2)
    actual_hours: Decimal | None = Field(ge=0, max_digits=5, decimal_places=2)
    note: dict[str, Any] | None
    task_images: list[str] | None
    tags: list[TagOut]
