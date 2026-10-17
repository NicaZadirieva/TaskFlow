from datetime import datetime
from decimal import Decimal
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


# --------- CREATE -----------
class CreateExecutorRequest(BaseModel):
    task_id: int
    login: str 
    role_in_task: str
    hours: int | None = None
    planned: int | None = None
    hourly_rate: int | None = None
    
class CreateExecutorResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    role_in_task: str
    is_active: bool
    login: str
    email: str
    hours: int | None = None
    planned: int | None = None
    hourly_rate: int | None = None
    
    
    
# --------- UPDATE -----------


class AddHoursToExecutorRequest(BaseModel):
    id: int
    task_id: int
    user_id: int
    today_hours_to_add: Decimal = Field(ge=0)


class AddHoursToExecutorResponse(BaseModel):
    id: int
    hourly_rate: int
    user_id: int
    user_hours: int
    user_planned: int
    all_hours: int
    all_planned: int
    
# -------- Change Assignee Hours ---------
# TODO: только для админов
class OwnerChangeAssigneeHoursRequest(BaseModel):
    id: int
    hours: int
    planned: int | None = None
    task_id: int
    user_id: int
    
    
    
class OwnerChangeAssigneeHoursResponse(BaseModel):
    id: int
    hourly_rate: int
    user_id: int
    user_hours: int
    user_planned: int
    all_hours: int
    all_planned: int
    
    
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
    """Краткая инфа о задаче для вложения в ExecutorOut."""

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


# ----------Получение всех исполнителей --------

class ExecutorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    login: str

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
    hours: Decimal | None = None
    planned: Decimal | None = None
    hourly_rate: int | None = None
    task: TaskShortOut


class ExecutorListOut(BaseModel):
    items: list[ExecutorOut]




