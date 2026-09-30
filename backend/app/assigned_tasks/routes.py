import logging

from fastapi import APIRouter

from app.assigned_tasks.filters import MustNotBeClientDeps
from app.assigned_tasks.schema import (
    AssignedTaskFiltersDeps,
    AssignedTaskOut,
    AssignedTasksOut,
)
from app.assigned_tasks.service import AssignedTasksServiceDeps
from app.user.current_user import CurrentUserDeps

router = APIRouter(prefix="/v1/assigned", tags=["Assigned"])
logger = logging.getLogger(__name__)  # noqa: F821


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
    assigned_tasks, total = await service.get_my_tasks(current_user.id, filters)

    return AssignedTasksOut(
        items=[AssignedTaskOut.model_validate(a_task) for a_task in assigned_tasks],
        total=total,
        limit=filters.limit,
        offset=filters.offset,
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
