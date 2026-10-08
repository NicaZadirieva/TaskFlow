import logging

from fastapi import APIRouter, Query

from app.assigned_tasks.routes_filters import MustNotBeClientDeps
from app.assigned_tasks.schema import (
    AssignedTaskFiltersDeps,
    AssignedTaskOut,
    AssignedTasksOut,
    CreateAssignedTaskRequest,
    CreateAssignedTaskResponse,
    ExecutorListOut,
    ExecutorOut,
    ReassignedUserTaskRequest,
    ReassignedUserTaskResponse,
    RemoveUserFromTaskRequest,
    RemoveUserFromTaskResponse,
)
from app.assigned_tasks.service import AssignedTasksServiceDeps
from app.user.current_user import CurrentUserDeps

router = APIRouter(prefix="/v1/assigned", tags=["Assigned"])
logger = logging.getLogger(__name__)  # noqa: F821


# --------- CREATE -----------
@router.post(
    "/create",
    response_model=CreateAssignedTaskResponse,
    status_code=201,
    summary="Назначить пользователя на задачу",
)
async def create_assigned_task(
    dto: CreateAssignedTaskRequest,
    service: AssignedTasksServiceDeps,
    current_user: CurrentUserDeps,
) -> CreateAssignedTaskResponse:
    assigned_task_id = await service.create_assigned_task(
        user_id=current_user.id,
        tenant_id=current_user.tenant_id,
        dto=dto,
    )
    return CreateAssignedTaskResponse(id=assigned_task_id)

# -------- Soft Delete User (removed=True) ------------


@router.post(
    "/remove",
    response_model=RemoveUserFromTaskResponse,
    summary="Снять пользователя с задачи (soft-delete)",
)
async def remove_user_from_task(
    dto: RemoveUserFromTaskRequest,
    service: AssignedTasksServiceDeps,
    current_user: CurrentUserDeps
) -> RemoveUserFromTaskResponse:
    assigned_task = await service.remove_user_from_task(
        tenant_id=current_user.tenant_id,
        dto=dto,
    )
    return RemoveUserFromTaskResponse(id=assigned_task.id, user_id=assigned_task.user_id, task_id=assigned_task.task_id)


# --------- Reassigned User (removed=False) ----------
@router.post(
    "/reassign",
    response_model=ReassignedUserTaskResponse,
    summary="Вернуть пользователя на задачу",
)
async def reassign_user_to_task(
    dto: ReassignedUserTaskRequest,
    service: AssignedTasksServiceDeps,
    current_user: CurrentUserDeps
) -> ReassignedUserTaskResponse:
    assigned_task = await service.reassign_user_to_task(
        tenant_id=current_user.tenant_id,
        dto=dto,
    )
    return ReassignedUserTaskResponse(id=assigned_task.id, user_id=assigned_task.user_id, task_id=assigned_task.task_id)

@router.get(
    "/my",
    status_code=200,
    response_model=AssignedTasksOut,
    description="Отдает задачи текущего юзера",
    summary="Задачи текущего юзера",
)
async def get_only_my_tasks(
    current_user: CurrentUserDeps,
    service: AssignedTasksServiceDeps,
    filters: AssignedTaskFiltersDeps,
) -> AssignedTasksOut:
    assigned_tasks, total = await service.get_my_tasks(current_user.id, current_user.tenant_id, filters)

    return AssignedTasksOut(
        items=[AssignedTaskOut.model_validate(a_task) for a_task in assigned_tasks],
        total=total,
        limit=filters.limit,
        offset=filters.offset,
    )
    

@router.get(
    "/executors",
    response_model=ExecutorListOut,
    summary="Исполнители, у которых есть задачи",
)
async def get_executors(
    service: AssignedTasksServiceDeps,
    current_user: CurrentUserDeps,
    only_active: bool = Query(True),
) -> ExecutorListOut:
    users = await service.get_executors(current_user.tenant_id, only_active=only_active)
    return ExecutorListOut(
        items=[ExecutorOut.model_validate(u) for u in users],
    )


@router.get(
    "/",
    status_code=200,
    response_model=AssignedTasksOut,
    description="Отдает задачи текущего тенанта",
    summary="Задачи текущего тенанта",
)
async def get_all_tasks(
    current_user: MustNotBeClientDeps,
    service: AssignedTasksServiceDeps,
    filters: AssignedTaskFiltersDeps,
) -> AssignedTasksOut:
    assigned_tasks, total = await service.get_all_tasks(current_user.tenant_id, filters)

    return AssignedTasksOut(
        items=[AssignedTaskOut.model_validate(
            a_task) for a_task in assigned_tasks],
        total=total,
        limit=filters.limit,
        offset=filters.offset,
    )
