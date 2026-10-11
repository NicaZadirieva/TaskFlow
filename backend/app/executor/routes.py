import logging

from fastapi import APIRouter, Query

from app.executor.schema import AddHoursToExecutorRequest, AddHoursToExecutorResponse, CreateExecutorRequest, CreateExecutorResponse, ExecutorListOut, ExecutorOut, OwnerChangeAssigneeHoursRequest, OwnerChangeAssigneeHoursResponse, ReassignedUserTaskRequest, ReassignedUserTaskResponse, RemoveUserFromTaskRequest, RemoveUserFromTaskResponse
from app.user.current_user import CurrentUserDeps
from app.executor.service import ExecutorServiceDeps

router = APIRouter(prefix="/v1/executor", tags=["Executors"])
logger = logging.getLogger(__name__)  # noqa: F821

# ---------- ADD HOURS -------


@router.put(
    "/hours/add",
    response_model=AddHoursToExecutorResponse,
    status_code=200,
    summary="Добавить время выполнения задачи (в часах)"
)
async def add_hours_to_executor(
    dto: AddHoursToExecutorRequest,
    service: ExecutorServiceDeps,
    current_user: CurrentUserDeps
):
    executor = await service.add_hours_to_task(current_user.tenant_id, dto)
    hourly_rate = await service.get_user_hourly_rate(dto.task_id, dto.user_id, current_user.tenant_id)
    all_hours = await service.get_all_hours(executor.id, tenant_id=current_user.tenant_id)
    all_planned = await service.get_all_planned_hours(executor.id, tenant_id=current_user.tenant_id)
    return AddHoursToExecutorResponse(id=executor.id, user_id=executor.user_id, user_hours=executor.hours, user_planned=executor.planned, hourly_rate=hourly_rate, all_hours=all_hours, all_planned=all_planned)


@router.put(
    "/admin/hours/change",
    response_model=OwnerChangeAssigneeHoursResponse,
    status_code=200,
    summary="Изменить время выполнения задачи (в часах)"
)
async def change_hours_to_executor(
    dto: OwnerChangeAssigneeHoursRequest,
    service: ExecutorServiceDeps,
    current_user: CurrentUserDeps
):
    executor = await service.change_hours_to_task(current_user.tenant_id, dto)
    hourly_rate = await service.get_user_hourly_rate(dto.task_id, dto.user_id, current_user.tenant_id)
    all_hours = await service.get_all_hours(executor.id, tenant_id=current_user.tenant_id)
    all_planned = await service.get_all_planned_hours(executor.id, tenant_id=current_user.tenant_id)
    return OwnerChangeAssigneeHoursResponse(id=executor.id, user_id=executor.user_id, user_hours=executor.hours, user_planned=executor.planned, hourly_rate=hourly_rate, all_hours=all_hours, all_planned=all_planned)

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
    current_user: CurrentUserDeps,
) -> CreateExecutorResponse:
    executor_id = await service.create_executor(
        user_id=current_user.id,
        tenant_id=current_user.tenant_id,
        dto=dto,
    )
    return CreateExecutorResponse(id=executor_id)

# -------- Soft Delete User (removed=True) ------------


@router.post(
    "/remove",
    response_model=RemoveUserFromTaskResponse,
    summary="Снять пользователя с задачи (soft-delete)",
)
async def remove_user_from_task(
    dto: RemoveUserFromTaskRequest,
    service: ExecutorServiceDeps,
    current_user: CurrentUserDeps
) -> RemoveUserFromTaskResponse:
    executor = await service.remove_user_from_task(
        tenant_id=current_user.tenant_id,
        dto=dto,
    )
    return RemoveUserFromTaskResponse(id=executor.id, user_id=executor.user_id, task_id=executor.task_id)


# --------- Reassigned User (removed=False) ----------
@router.post(
    "/reassign",
    response_model=ReassignedUserTaskResponse,
    summary="Вернуть пользователя на задачу",
)
async def reassign_user_to_task(
    dto: ReassignedUserTaskRequest,
    service: ExecutorServiceDeps,
    current_user: CurrentUserDeps
) -> ReassignedUserTaskResponse:
    executor = await service.reassign_user_to_task(
        tenant_id=current_user.tenant_id,
        dto=dto,
    )
    return ReassignedUserTaskResponse(id=executor.id, user_id=executor.user_id, task_id=executor.task_id)


@router.get(
    "/executors",
    response_model=ExecutorListOut,
    summary="Исполнители, у которых есть задачи",
)
async def get_executors(
    service: ExecutorServiceDeps,
    current_user: CurrentUserDeps,
    only_active: bool = Query(True),
) -> ExecutorListOut:
    users = await service.get_executors(current_user.tenant_id, only_active=only_active)
    return ExecutorListOut(
        items=[ExecutorOut.model_validate(u) for u in users],
    )