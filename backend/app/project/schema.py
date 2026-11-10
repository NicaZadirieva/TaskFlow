from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

from app.task.models import Status


class ProjectTaskOut(BaseModel):
    id: int
    title: str
    status: Status


class ProjectOut(BaseModel):
    id: int
    name: str
    budget_hours: Decimal | None
    deadline: datetime | None
    tasks: list[ProjectTaskOut]
    progress: int


class CreateProjectRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    budget_hours: Decimal | None = Field(
        default=None, ge=0, max_digits=10, decimal_places=2
    )
    deadline: datetime | None = None
    client_id: int | None = Field(default=None, gt=0)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name must not be blank")
        return value

    @field_validator("deadline")
    @classmethod
    def naive_deadline(cls, value: datetime | None) -> datetime | None:
        if value is not None and value.utcoffset() is not None:
            raise ValueError("Deadline must not include a timezone")
        return value


class CreateProjectResponse(BaseModel):
    id: int
