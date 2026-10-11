from typing import Annotated

from fastapi import APIRouter, Depends, Query


from app.task.schemas.create_task import CreateTaskRequest, CreateTaskResponse
from app.task.service import TaskServiceDeps
from app.task.schemas.get_filtered_tasks import CsvIntList, TaskFiltersDeps, TasksOut
from app.user.current_user import CurrentUserDeps

router = APIRouter(prefix="/v1/task", tags=["Tasks"])


@router.post(
    "/create",
    response_model=CreateTaskResponse,
    status_code=201,
    summary="Создать задачу",
)
async def create_task(
    dto: CreateTaskRequest,
    service: TaskServiceDeps,
    user: CurrentUserDeps,
) -> CreateTaskResponse:
    task = await service.create_task(
        tenant_id=user.tenant_id,
        user_id=user.id,
        dto=dto,
    )
    return CreateTaskResponse(id=task.id, tenant_id=task.tenant_id)


@router.get(
    "/my",
    response_model=TasksOut,
    summary="Список только моих задач с фильтрами",
)
async def list_my_tasks(
    filters: TaskFiltersDeps,
    service: TaskServiceDeps,
    user: CurrentUserDeps,
) -> TasksOut:
    return await service.list_my_tasks(
        tenant_id=user.tenant_id,
        user_id=user.id,
        filters=filters,
    )


@router.get(
    "/all",
    response_model=TasksOut,
    summary="Список всех задач с фильтрами",
)
async def list_all_tasks(
    filters: TaskFiltersDeps,
    service: TaskServiceDeps,
    user: CurrentUserDeps,
    user_ids: Annotated[
        CsvIntList | None,
        Query(description="ID исполнителей (OR)", explode=False),
    ] = None,
) -> TasksOut:
    return await service.list_tasks(
        tenant_id=user.tenant_id,
        filters=filters,
        user_ids=user_ids,
    )
