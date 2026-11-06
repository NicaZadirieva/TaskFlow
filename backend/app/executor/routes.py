import logging

from fastapi import APIRouter, HTTPException, Query

from app.executor.schema import (
    AddHoursToExecutorRequest,
    AddHoursToExecutorResponse,
    CreateExecutorRequest,
    CreateExecutorResponse,
    ExecutorListOut,
    ExecutorOut,
    OwnerChangeAssigneeHoursRequest,
    OwnerChangeAssigneeHoursResponse,
    ReassignedUserTaskRequest,
    ReassignedUserTaskResponse,
    RemoveUserFromTaskRequest,
    RemoveUserFromTaskResponse,
)
from app.executor.service import ExecutorServiceDeps
from app.task.access import ActiveUserDeps, TaskAccessDeps
from app.user.models import TenantRole
from app.user.service import UserServiceDeps

router = APIRouter(prefix="/v1/executor", tags=["Executors"])
logger = logging.getLogger(__name__)  # noqa: F821

# ---------- ADD HOURS -------


@router.put(
    "/hours/add",
    response_model=AddHoursToExecutorResponse,
    status_code=200,
    summary="Добавить время выполнения задачи (в часах)",
)
async def add_hours_to_executor(
    dto: AddHoursToExecutorRequest,
    service: ExecutorServiceDeps,
    current_user: ActiveUserDeps,
    access: TaskAccessDeps,
):
    if current_user.role != TenantRole.OWNER and (
        current_user.role != TenantRole.TEAM or dto.user_id != current_user.id
    ):
        raise HTTPException(403, "Cannot add hours for this assignee")
    await access.require_task(dto.task_id)
    executor = await service.add_hours_to_task(current_user.tenant_id, dto)
    hourly_rate = await service.get_user_hourly_rate(
        dto.task_id, dto.user_id, current_user.tenant_id
    )
    all_hours = await service.get_all_hours(
        executor.id, tenant_id=current_user.tenant_id
    )
    all_planned = await service.get_all_planned_hours(
        executor.id, tenant_id=current_user.tenant_id
    )
    return AddHoursToExecutorResponse(
        id=executor.id,
        user_id=executor.user_id,
        user_hours=executor.hours,
        user_planned=executor.planned,
        hourly_rate=hourly_rate,
        all_hours=all_hours,
        all_planned=all_planned,
    )


@router.put(
    "/admin/hours/change",
    response_model=OwnerChangeAssigneeHoursResponse,
    status_code=200,
    summary="Изменить время выполнения задачи (в часах)",
)
async def change_hours_to_executor(
    dto: OwnerChangeAssigneeHoursRequest,
    service: ExecutorServiceDeps,
    current_user: ActiveUserDeps,
    access: TaskAccessDeps,
):
    access.require_owner()
    await access.require_task(dto.task_id)
    executor = await service.change_hours_to_task(current_user.tenant_id, dto)
    if executor is None:
        raise HTTPException(404, "Executor not exists")
    hourly_rate = await service.get_user_hourly_rate(
        dto.task_id, dto.user_id, current_user.tenant_id
    )
    all_hours = await service.get_all_hours(
        executor.id, tenant_id=current_user.tenant_id
    )
    all_planned = await service.get_all_planned_hours(
        executor.id, tenant_id=current_user.tenant_id
    )
    return OwnerChangeAssigneeHoursResponse(
        id=executor.id,
        user_id=executor.user_id,
        user_hours=executor.hours,
        user_planned=executor.planned,
        hourly_rate=hourly_rate,
        all_hours=all_hours,
        all_planned=all_planned,
    )


# --------- CREATE -----------


@router.post(
    "/create",
    response_model=CreateExecutorResponse,
    status_code=201,
    summary="Назначить пользователя на задачу",
)
async def create_executor(
    dto: CreateExecutorRequest,
    service: ExecutorServiceDeps,
    current_user: ActiveUserDeps,
    access: TaskAccessDeps,
) -> CreateExecutorResponse:
    access.require_owner()
    await access.require_task(dto.task_id)
    executor, user = await service.create_executor(
        user_id=current_user.id,
        tenant_id=current_user.tenant_id,
        dto=dto,
    )
    return CreateExecutorResponse(
        id=executor.id,
        user_id=executor.user_id,
        user_name=user.name,
        role_in_task=executor.role_in_task,
        hours=executor.hours,
        planned=executor.planned,
        is_active=executor.is_active,
        login=user.login,
        email=user.email,
        version=executor.version,
    )


# -------- Soft Delete User (removed=True) ------------


@router.post(
    "/remove",
    response_model=RemoveUserFromTaskResponse,
    summary="Снять пользователя с задачи (soft-delete)",
    status_code=200,
)
async def remove_user_from_task(
    dto: RemoveUserFromTaskRequest,
    service: ExecutorServiceDeps,
    user_service: UserServiceDeps,
    current_user: ActiveUserDeps,
    access: TaskAccessDeps,
) -> RemoveUserFromTaskResponse:
    access.require_owner()
    await access.require_task(dto.task_id)
    executor = await service.remove_user_from_task(
        tenant_id=current_user.tenant_id,
        dto=dto,
    )
    user = await user_service.get_user(executor.user_id)

    return RemoveUserFromTaskResponse(
        id=executor.id,
        user_id=executor.user_id,
        task_id=executor.task_id,
        user_name=user.name,
        role_in_task=executor.role_in_task,
        hours=executor.hours,
        planned=executor.planned,
        is_active=executor.is_active,
        login=user.login,
        email=user.email,
        version=executor.version,
    )


# --------- Reassigned User (removed=False) ----------
@router.post(
    "/reassign",
    response_model=ReassignedUserTaskResponse,
    summary="Вернуть пользователя на задачу",
)
async def reassign_user_to_task(
    dto: ReassignedUserTaskRequest,
    service: ExecutorServiceDeps,
    current_user: ActiveUserDeps,
    access: TaskAccessDeps,
) -> ReassignedUserTaskResponse:
    access.require_owner()
    await access.require_task(dto.task_id)
    executor = await service.reassign_user_to_task(
        tenant_id=current_user.tenant_id,
        dto=dto,
    )
    return ReassignedUserTaskResponse(
        id=executor.id, user_id=executor.user_id, task_id=executor.task_id
    )


@router.get(
    "/executors",
    response_model=ExecutorListOut,
    summary="Исполнители, у которых есть задачи",
)
async def get_executors(
    service: ExecutorServiceDeps,
    current_user: ActiveUserDeps,
    only_active: bool = Query(True),
) -> ExecutorListOut:
    users = await service.get_executors(current_user, only_active=only_active)
    return ExecutorListOut(
        items=[ExecutorOut.model_validate(u) for u in users],
    )
