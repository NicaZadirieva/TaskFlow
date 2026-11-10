from fastapi import APIRouter

from app.project.schema import CreateProjectRequest, CreateProjectResponse, ProjectOut
from app.project.service import ProjectServiceDeps
from app.task.access import ActiveUserDeps

router = APIRouter(prefix="/v1/project", tags=["Projects"])


@router.post("/create", response_model=CreateProjectResponse, status_code=201)
async def create_project(
    dto: CreateProjectRequest, service: ProjectServiceDeps, user: ActiveUserDeps
) -> CreateProjectResponse:
    project = await service.create(user, dto)
    return CreateProjectResponse(id=project.id)


@router.get("", response_model=list[ProjectOut])
async def list_projects(
    service: ProjectServiceDeps, user: ActiveUserDeps
) -> list[ProjectOut]:
    return await service.list_visible(user)


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: int, service: ProjectServiceDeps, user: ActiveUserDeps
) -> ProjectOut:
    return await service.get_visible(user, project_id)
