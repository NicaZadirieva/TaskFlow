
from pydantic import BeforeValidator
from typing import Annotated
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Annotated, Any

from fastapi import Depends, Query
from pydantic import AliasPath, BaseModel, ConfigDict, Field

from app.task.models import Priority, Status


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


class AdminGetAllTasksResponse(BaseModel):
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


class TaskDeadline(str, Enum):
    # Просрочено
    overdue = "overdue"
    # Остался 1 день
    today = "today"
    # Через 2–4 дня
    this_week = "this_week"
    # Более чем через неделю
    next_week = "next_week"
    # Сдано
    done = "done"


class TaskSortBy(str, Enum):
    created_at = "created_at"
    due_date = "due_date"
    priority = "priority"


class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"


class TaskFilters(BaseModel):
    limit: int = 100
    offset: int = 0
    sort_by: TaskSortBy = TaskSortBy.created_at
    sort_order: SortOrder = SortOrder.desc

    tag_ids: list[int] | None = None
    priority: list[Priority] | None = None
    status: list[Status] | None = None
    deadline: list[TaskDeadline] | None = None
    

# ---------- вложенные ----------

class TagShortOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    name: str
    description: str | None = None


class ExecutorShortOut(BaseModel):
    """Краткая инфа об исполнителе задачи."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    user_id: int

    # name/login — через связанного User
    name: str = Field(validation_alias=AliasPath("user", "name"))
    login: str = Field(validation_alias=AliasPath("user", "login"))

    role_in_task: str
    is_active: bool
    removed: bool
    
    hours: float | None = None
    planned: float | None = None
    
    hourly_rate: int | None = None
    remove_reason: str | None = None
    reassigned_reason: str | None = None
    


# ---------- сама задача ----------

class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    project_id: int | None = None

    title: str
    description: str | None = None

    status: Status
    priority: Priority

    due_date: datetime | None = None
    created_at: datetime
    created_by: int

    estimated_budget: Decimal | None = Field(
        default=None, max_digits=12, decimal_places=2,
    )
    actual_budget: Decimal | None = Field(
        default=None, max_digits=12, decimal_places=2,
    )
    estimated_hours: Decimal | None = Field(
        default=None, max_digits=5, decimal_places=2,
    )
    actual_hours: Decimal | None = Field(
        default=None, max_digits=5, decimal_places=2,
    )

    note: dict[str, Any] | None = None
    task_images: list[str] | None = None

    tags: list[TagShortOut] = []
    executors: list[ExecutorShortOut] = Field(
        default_factory=list,
        validation_alias=AliasPath("assignees"),
    )
    

class TasksOut(BaseModel):
    items: list[TaskOut]
    total: int
    limit: int
    offset: int


# ---------- DI-фабрика ----------


def _split_csv(v: Any) -> Any:
    """Принимает None, строку 'a,b,c' или список ['a,b,c'] -> список строк."""
    if v is None:
        return None
    items = v if isinstance(v, list) else [v]
    result: list[Any] = []
    for item in items:
        if isinstance(item, str) and "," in item:
            result.extend(s.strip() for s in item.split(",") if s.strip())
        else:
            result.append(item)
    return result or None


# элементы массива через ","
CsvIntList = Annotated[list[int],      BeforeValidator(_split_csv)]
CsvPriority = Annotated[list[Priority], BeforeValidator(_split_csv)]
CsvStatus = Annotated[list[Status],   BeforeValidator(_split_csv)]
CsvDeadline = Annotated[list[TaskDeadline], BeforeValidator(_split_csv)]

async def get_task_filters(
    limit: Annotated[
        int,
        Query(ge=1, le=500, description="Лимит записей"),
    ] = 100,
    offset: Annotated[
        int,
        Query(ge=0, description="Смещение"),
    ] = 0,
    sort_by: Annotated[
        TaskSortBy,
        Query(description="Поле сортировки"),
    ] = TaskSortBy.created_at,
    sort_order: Annotated[
        SortOrder,
        Query(description="Порядок сортировки"),
    ] = SortOrder.desc,

    # --- OR-фильтры ---
    tag_ids:  Annotated[CsvIntList | None, Query(explode=False)] = None,
    priority: Annotated[CsvPriority | None, Query(explode=False)] = None,
    status:   Annotated[CsvStatus | None, Query(explode=False)] = None,
    deadline: Annotated[CsvDeadline | None, Query(explode=False)] = None,
) -> TaskFilters:
    return TaskFilters(
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
        tag_ids=tag_ids,
        priority=priority,
        status=status,
        deadline=deadline,
    )


TaskFiltersDeps = Annotated[TaskFilters, Depends(get_task_filters)]
