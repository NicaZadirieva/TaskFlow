from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from app.github_label.schemas import GithubLabelOut
from app.task.access import ActiveUserDeps, TaskAccessDeps
from app.task.schemas.create_task import CreateTaskRequest, CreateTaskResponse
from app.task.schemas.get_filtered_tasks import (
    CsvIntList,
    TaskFiltersDeps,
    TasksOut,
    TaskOut,
    UserShortOut,
)
from app.task.service import TaskServiceDeps

router = APIRouter(prefix="/v1/task", tags=["Tasks"])

# TODO: добавить updated_at в редактирование задачи
@router.post(
    "/create",
    response_model=CreateTaskResponse,
    status_code=201,
    summary="Создать задачу",
)
async def create_task(
    dto: CreateTaskRequest,
    service: TaskServiceDeps,
    user: ActiveUserDeps,
    access: TaskAccessDeps,
) -> CreateTaskResponse:
    executors = dto.executors or []
    assignee_ids = {executor.user_id for executor in executors}
    await access.require_create(dto.project_id, assignee_ids)
    if len(assignee_ids) != len(executors):
        raise HTTPException(422, "Duplicate assignee")
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
    user: ActiveUserDeps,
) -> TasksOut:
    return await service.list_my_tasks(
        user=user,
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
    user: ActiveUserDeps,
    user_ids: Annotated[
        CsvIntList | None,
        Query(description="ID исполнителей (OR)", explode=False),
    ] = None,
) -> TasksOut:
    return await service.list_tasks(
        user=user,
        filters=filters,
        user_ids=user_ids,
    )
    

@router.get("/filters/assignees", response_model=list[UserShortOut])
async def list_filter_assignees(
    user: ActiveUserDeps,
    service: TaskServiceDeps,
):
    return await service.get_filter_assignees(user)


@router.get("/filters/tags", response_model=list[GithubLabelOut])
async def list_filter_tags(
    user: ActiveUserDeps,
    service: TaskServiceDeps,
):
    return await service.get_filter_tags(user)


@router.get("/{task_id}", response_model=TaskOut, summary="Task details")
async def get_task(
    task_id: int,
    user: ActiveUserDeps,
    service: TaskServiceDeps,
) -> TaskOut:
    return await service.get_task(task_id, user)
