from typing import Annotated

from fastapi import Depends
from sqlalchemy import exists, select

from app.project.models import Project
from app.shared.db import DbSessionDeps
from app.task.access import active_assignment, task_scope
from app.task.models import Task
from app.user.models import TenantRole, User


class ProjectRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    async def client_exists(self, client_id: int, tenant_id: int) -> bool:
        stmt = (
            select(User.id)
            .where(
                User.id == client_id,
                User.tenant_id == tenant_id,
                User.role == TenantRole.CLIENT,
                User.is_active.is_(True),
            )
            .with_for_update(read=True)
        )
        return await self.db_session.scalar(stmt) is not None

    async def save(self, project: Project) -> Project:
        self.db_session.add(project)
        await self.db_session.commit()
        await self.db_session.refresh(project)
        return project

    async def list_visible(
        self, user: User, project_id: int | None = None
    ) -> list[Project]:
        stmt = select(Project).where(Project.tenant_id == user.tenant_id)
        if project_id is not None:
            stmt = stmt.where(Project.id == project_id)
        if user.role == TenantRole.CLIENT:
            stmt = stmt.where(Project.client_id == user.id)
        elif user.role == TenantRole.TEAM:
            stmt = stmt.where(
                exists().where(
                    Task.project_id == Project.id,
                    Task.tenant_id == Project.tenant_id,
                    active_assignment(user.id),
                )
            )
        return list(
            await self.db_session.scalars(stmt.order_by(Project.name, Project.id))
        )

    async def list_visible_tasks(
        self, user: User, project_ids: list[int]
    ) -> list[Task]:
        if not project_ids:
            return []
        stmt = (
            select(Task)
            .where(Task.project_id.in_(project_ids), task_scope(user))
            .order_by(Task.id)
        )
        return list(await self.db_session.scalars(stmt))


def get_project_repository(db_session: DbSessionDeps) -> ProjectRepository:
    return ProjectRepository(db_session)


ProjectRepositoryDeps = Annotated[ProjectRepository, Depends(get_project_repository)]
