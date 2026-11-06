from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy import and_, exists, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.executor.models import Executor
from app.project.models import Project
from app.shared.db import DbSessionDeps
from app.task.models import Task
from app.user.current_user import CurrentUserDeps
from app.user.models import TenantRole, User


def active_assignment(user_id: int):
    return (
        exists()
        .where(
            Executor.task_id == Task.id,
            Executor.tenant_id == Task.tenant_id,
            Executor.user_id == user_id,
            Executor.is_active.is_(True),
            Executor.removed.is_(False),
        )
        .correlate(Task)
    )


def task_scope(user: User):
    project = and_(Project.id == Task.project_id, Project.tenant_id == Task.tenant_id)
    in_tenant = Task.tenant_id == user.tenant_id
    if user.role == TenantRole.CLIENT:
        return and_(
            in_tenant,
            exists().where(project, Project.client_id == user.id).correlate(Task),
        )

    scope = and_(
        in_tenant,
        or_(
            Task.project_id.is_(None),
            exists().where(project).correlate(Task),
        ),
    )
    if user.role == TenantRole.TEAM:
        return and_(scope, active_assignment(user.id))
    return scope


def require_active_user(user: CurrentUserDeps) -> User:
    if not user.is_active or user.role not in (
        TenantRole.OWNER,
        TenantRole.CLIENT,
        TenantRole.TEAM,
    ):
        raise HTTPException(403, "Task access denied")
    return user


ActiveUserDeps = Annotated[User, Depends(require_active_user)]


async def require_project_in_tenant(
    session: AsyncSession, project_id: int, tenant_id: int
) -> None:
    stmt = (
        select(Project.id)
        .where(Project.id == project_id, Project.tenant_id == tenant_id)
        .with_for_update(read=True)
    )
    if await session.scalar(stmt) is None:
        raise HTTPException(404, "Project not found")


async def require_assignees_in_tenant(
    session: AsyncSession, assignee_ids: set[int], tenant_id: int
) -> None:
    stmt = (
        select(User.id)
        .where(
            User.id.in_(assignee_ids),
            User.tenant_id == tenant_id,
            User.role.in_([TenantRole.OWNER, TenantRole.TEAM]),
            User.is_active.is_(True),
        )
        .with_for_update(read=True)
    )
    if set(await session.scalars(stmt)) != assignee_ids:
        raise HTTPException(404, "Assignee not found")


class TaskAccess:
    def __init__(self, session: DbSessionDeps, user: ActiveUserDeps):
        self.session = session
        self.user = user

    def require_owner(self) -> None:
        if self.user.role != TenantRole.OWNER:
            raise HTTPException(403, "Owner access required")

    async def require_task(self, task_id: int) -> None:
        stmt = (
            select(Task.id)
            .where(Task.id == task_id, task_scope(self.user))
            .with_for_update()
        )
        if await self.session.scalar(stmt) is None:
            raise HTTPException(404, "Task not found")

    async def require_create(
        self, project_id: int | None, assignee_ids: set[int]
    ) -> None:
        if self.user.role == TenantRole.CLIENT:
            raise HTTPException(403, "Task creation is forbidden")
        if assignee_ids:
            self.require_owner()

        if project_id is not None:
            await require_project_in_tenant(
                self.session, project_id, self.user.tenant_id
            )
        if self.user.role == TenantRole.TEAM:
            assigned = (
                select(Task.id)
                .where(
                    Task.project_id == project_id,
                    task_scope(self.user),
                )
                .limit(1)
            )
            if project_id is None or await self.session.scalar(assigned) is None:
                raise HTTPException(403, "Project assignment required")

        if assignee_ids:
            await require_assignees_in_tenant(
                self.session, assignee_ids, self.user.tenant_id
            )


TaskAccessDeps = Annotated[TaskAccess, Depends(TaskAccess)]
