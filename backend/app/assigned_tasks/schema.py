from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Annotated

from fastapi import Depends, Query
from pydantic import AliasPath, BaseModel, ConfigDict, Field

from app.db.entities.assigned_task import AssignedTask


# --------- CREATE -----------
class CreateAssignedTaskRequest(BaseModel):
    task_id: int
    user_id: int
    role_in_task: str
    assigned_at: datetime
    hours: int | None = None
    planned: int | None = None
    hourly_rate: int | None = None
    
class CreateAssignedTaskResponse(BaseModel):
    id: int
    
# -------- Soft Delete User (removed=True) ------------
class RemoveUserFromTaskRequest(BaseModel):
    task_id: int
    user_id: int
    remove_reason: str | None = None

class RemoveUserFromTaskResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
     
# --------- Reassigned User (removed=False) ----------
class ReassignedUserTaskRequest(BaseModel):
    task_id: int
    user_id: int
    reassigned_reason: str | None = None
    

class ReassignedUserTaskResponse(BaseModel):
    id: int
    task_id: int
    user_id: int

# ---------- GET -------------

# ----------Получение всех исполнителей --------


class ExecutorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    login: str


class ExecutorListOut(BaseModel):
    items: list[ExecutorOut]


#----------Получение задач, у которых есть исполнитель (вместе с фильтрами)-------------

class TaskStatus(str, Enum):
    OPEN = "OPEN"
    BACKLOG = "BACKLOG"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


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
    assigned_at = "assigned_at"

class AssignedTaskDeadline(str, Enum):
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

class AssignedTaskFilters(BaseModel):
    # пагинация + сортировка
    limit: int = 100
    offset: int = 0
    sort_by: AssignedTaskSortBy = AssignedTaskSortBy.assigned_at
    sort_order: SortOrder = SortOrder.desc

    # --- фильтры (OR) ---
    tag_ids: list[int] | None = None
    user_ids: list[int] | None = None
    deadline: list[AssignedTaskDeadline] | None = None
    priority: list[TaskPriority] | None = None
    status: list[TaskStatus] | None = None
    

async def get_assigned_task_filters(
    limit: Annotated[int, Query(
        ge=1, le=500, description="Лимит записей")] = 100,
    offset: Annotated[int, Query(ge=0, description="Смещение")] = 0,
    sort_by: Annotated[
        AssignedTaskSortBy, Query(description="Поле сортировки")
    ] = AssignedTaskSortBy.assigned_at,
    sort_order: Annotated[SortOrder, Query(
        description="Порядок сортировки")] = SortOrder.desc,
    # --- OR-фильтры ---
    tag_ids: Annotated[
        list[int] | None,
        Query(description="ID тегов (OR — любой из перечисленных)"),
    ] = None,
    user_ids: Annotated[
        list[int] | None,
        Query(description="ID пользователей (OR — любой из перечисленных)"),
    ] = None,
    deadline: Annotated[
        list[AssignedTaskDeadline] | None,
        Query(description="Дедлайн (OR — любое из перечисленных)"),
    ] = None,
    priority: Annotated[
        list[TaskPriority] | None,
        Query(description="Приоритет (OR — любой из перечисленных)"),
    ] = None,
    status: Annotated[
        list[TaskStatus] | None,
        Query(description="Статус (OR — любой из перечисленных)"),
    ] = None,
) -> AssignedTaskFilters:
    return AssignedTaskFilters(
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
        tag_ids=tag_ids,
        user_ids=user_ids,
        deadline=deadline,
        priority=priority,
        status=status,
    )


AssignedTaskFiltersDeps = Annotated[
    AssignedTaskFilters, Depends(get_assigned_task_filters)
]
