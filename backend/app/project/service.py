from typing import Annotated

from fastapi import Depends, HTTPException

from app.project.models import Project
from app.project.repository import ProjectRepositoryDeps
from app.project.schema import CreateProjectRequest, ProjectOut, ProjectTaskOut, UpdateProjectBudgetRequest
from app.task.models import Status
from app.user.models import TenantRole, User


class ProjectService:
    def __init__(self, repository: ProjectRepositoryDeps):
        self.repository = repository

    async def create(self, user: User, dto: CreateProjectRequest) -> Project:
        if user.role != TenantRole.OWNER:
            raise HTTPException(403, "Owner access required")
        if dto.client_id is not None and not await self.repository.client_exists(
            dto.client_id, user.tenant_id
        ):
            raise HTTPException(404, "Client not found")
        return await self.repository.save(
            Project(
                tenant_id=user.tenant_id,
                name=dto.name,
                description=dto.description,
                budget_hours=dto.budget_hours,
                budget=dto.budget,
                deadline=dto.deadline,
                client_id=dto.client_id,
            )
        )

    async def update_budget(self, user: User, project_id: int, dto: UpdateProjectBudgetRequest) -> None:
        if user.role != TenantRole.OWNER:
            raise HTTPException(403, "Owner access required")
        projects = await self.repository.list_visible(user, project_id)
        if not projects:
            raise HTTPException(404, "Project not found")
        project = projects[0]
        project.budget = dto.budget
        project.budget_hours = dto.budget_hours
        await self.repository.save(project)

    async def list_visible(
        self, user: User, project_id: int | None = None
    ) -> list[ProjectOut]:
        projects = await self.repository.list_visible(user, project_id)
        tasks = await self.repository.list_visible_tasks(
            user, [project.id for project in projects]
        )
        result = []
        for project in projects:
            project_tasks = [task for task in tasks if task.project_id == project.id]
            done = sum(task.status == Status.DONE for task in project_tasks)
            result.append(
                ProjectOut(
                    id=project.id,
                    name=project.name,
                    budget_hours=project.budget_hours,
                    budget=project.budget,
                    deadline=project.deadline,
                    tasks=[
                        ProjectTaskOut(id=t.id, title=t.title, status=t.status)
                        for t in project_tasks
                    ],
                    progress=round(done * 100 / len(project_tasks))
                    if project_tasks
                    else 0,
                )
            )
        return result

    async def get_visible(self, user: User, project_id: int) -> ProjectOut:
        projects = await self.list_visible(user, project_id)
        if not projects:
            raise HTTPException(404, "Project not found")
        return projects[0]


def get_project_service(repository: ProjectRepositoryDeps) -> ProjectService:
    return ProjectService(repository)


ProjectServiceDeps = Annotated[ProjectService, Depends(get_project_service)]
