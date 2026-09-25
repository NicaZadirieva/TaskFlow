from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Annotated

from fastapi import Depends, Query
from pydantic import BaseModel, ConfigDict, Field

from app.db.entities.assigned_task import AssignedTask


# ---------- вложенная задача ----------
class TaskStatus(str, Enum):
    OPEN = "OPEN"
    BACKLOG = "BACKLOG"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TagShortOut(BaseModel):
    id: int
    tenant_id: int
    name: str
    description: str | None = None


class TaskShortOut(BaseModel):
    """Краткая инфа о задаче для вложения в AssignedTaskOut."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    project_id: int | None = None

    title: str
    description: str | None = None

    status: TaskStatus
    priority: TaskPriority

    due_date: datetime | None = None

    estimated_hours: Decimal | None = None
    actual_hours: Decimal | None = None

    created_by: int
    created_at: datetime
    tags: list[TagShortOut] = []


# ---------- один элемент ----------


class AssignedTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    user_id: int
    task_id: int

    role_in_task: str
    assigned_at: datetime
    is_active: bool
    removed: bool

    remove_reason: str | None = None
    reassigned_reason: str | None = None

    # Numeric(6, 2) -> Decimal, не float
    hours: Decimal | None = None
    planned: Decimal | None = None

    # связанная задача (опционально, зависит от selectinload в репозитории)
    task: TaskShortOut | None = None


# ---------- пагинированный ответ ----------


class AssignedTasksOut(BaseModel):
    items: list[AssignedTaskOut]
    total: int
    limit: int
    offset: int


# Фильтры для поиска


class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"


class AssignedTaskSortBy(str, Enum):
    id = "id"
    assigned_at = "assigned_at"
    hours = "hours"
    planned = "planned"


class AssignedTaskFilters(BaseModel):
    # --- фильтры по полям самой AssignedTask ---
    tenant_id: int | None = None
    task_id: int | None = None
    role_in_task: str | None = None
    is_active: bool | None = None
    removed: bool | None = None

    # диапазон по assigned_at
    assigned_from: datetime | None = None
    assigned_to: datetime | None = None

    # диапазон по hours / planned
    hours_min: float | None = None
    hours_max: float | None = None
    planned_min: float | None = None
    planned_max: float | None = None

    # фильтры по связанной задаче (JOIN)
    task_title: str | None = None  # частичное совпадение
    task_status: str | None = None

    # пагинация + сортировка
    limit: int = 100
    offset: int = 0
    sort_by: AssignedTaskSortBy = AssignedTaskSortBy.id
    sort_order: SortOrder = SortOrder.asc

    # --- фильтры по тегам ---
    tag_ids: list[int] | None = None  # задачи, у которых ЕСТЬ любой из этих тегов (OR)
    tag_names: list[str] | None = None  # по именам (OR, ilike)


async def get_assigned_task_filters(
    tenant_id: Annotated[int | None, Query(description="ID тенанта")] = None,
    task_id: Annotated[int | None, Query(description="ID задачи")] = None,
    role_in_task: Annotated[
        str | None, Query(max_length=15, description="Роль в задаче")
    ] = None,
    is_active: Annotated[
        bool | None, Query(description="Только активные назначения")
    ] = None,
    removed: Annotated[bool | None, Query(description="Включая удалённые")] = None,
    assigned_from: Annotated[datetime | None, Query(description="Назначено с")] = None,
    assigned_to: Annotated[datetime | None, Query(description="Назначено по")] = None,
    hours_min: Annotated[float | None, Query(ge=0, description="Часы (мин)")] = None,
    hours_max: Annotated[float | None, Query(ge=0, description="Часы (макс)")] = None,
    planned_min: Annotated[float | None, Query(ge=0, description="План (мин)")] = None,
    planned_max: Annotated[float | None, Query(ge=0, description="План (макс)")] = None,
    task_title: Annotated[
        str | None,
        Query(min_length=1, max_length=255, description="Поиск по названию задачи"),
    ] = None,
    task_status: Annotated[
        str | None, Query(max_length=30, description="Статус задачи")
    ] = None,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
    sort_by: Annotated[AssignedTaskSortBy, Query()] = AssignedTaskSortBy.id,
    sort_order: Annotated[SortOrder, Query()] = SortOrder.asc,
    tag_ids: Annotated[
        list[int] | None,
        Query(description="Теги (OR — любой из перечисленных)"),
    ] = None,
    tag_names: Annotated[
        list[str] | None,
        Query(description="Имена тегов (OR, частичное совпадение)"),
    ] = None,
) -> AssignedTaskFilters:
    return AssignedTaskFilters(
        tenant_id=tenant_id,
        task_id=task_id,
        role_in_task=role_in_task,
        is_active=is_active,
        removed=removed,
        assigned_from=assigned_from,
        assigned_to=assigned_to,
        hours_min=hours_min,
        hours_max=hours_max,
        planned_min=planned_min,
        planned_max=planned_max,
        task_title=task_title,
        task_status=task_status,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
        tag_ids=tag_ids,
        tag_names=tag_names,
    )


AssignedTaskFiltersDeps = Annotated[
    AssignedTaskFilters, Depends(get_assigned_task_filters)
]
