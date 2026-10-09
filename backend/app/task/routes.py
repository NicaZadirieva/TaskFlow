from fastapi import APIRouter

from app.task.schema import CreateTaskRequest, CreateTaskResponse
from app.task.service import TaskServiceDeps
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
    user: CurrentUserDeps
) -> CreateTaskResponse:
    task = await service.create_task(tenant_id=user.tenant_id, user_id=user.id, dto=dto)
    return CreateTaskResponse(id=task.id, tenant_id=task.tenant_id)
