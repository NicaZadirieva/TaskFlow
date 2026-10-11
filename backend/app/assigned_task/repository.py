
from typing import Annotated

from fastapi import Depends
from sqlalchemy import distinct, func, or_, select
from sqlalchemy.orm import selectinload

from app.shared.db import DbSessionDeps
from app.assigned_task.models import AssignedTask
from app.user.models import User


class AssignedTasksRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    async def save(self, assigned: AssignedTask):
        self.db_session.add(assigned)
        await self.db_session.commit()
        await self.db_session.refresh(assigned)
        return assigned

    async def get_by_task_and_user(
        self,
        task_id: int,
        user_id: int,
        tenant_id: int,
    ) -> AssignedTask | None:
        stmt = select(AssignedTask).where(
            AssignedTask.task_id == task_id,
            AssignedTask.user_id == user_id,
            AssignedTask.tenant_id == tenant_id,
        )
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()

    # ---------- helpers ----------
    
    async def get_hours_by_all_users(self, id: int, tenant_id: int):
        stmt = select(func.sum(AssignedTask.hours)).where(AssignedTask.id==id, AssignedTask.tenant_id == tenant_id)
        res = await self.db_session.execute(stmt)
        return res.scalar_one_or_none()
    
    async def get_planned_by_all_users(self, id: int, tenant_id: int):
        stmt = select(func.sum(AssignedTask.planned)).where(
            AssignedTask.id == id, AssignedTask.tenant_id == tenant_id)
        res = await self.db_session.execute(stmt)
        return res.scalar_one_or_none()

    
    # --------Получение всех исполнителей задач---------

    async def get_executors(
        self,
        tenant_id: int,
        only_active: bool = True,
    ) -> list[User]:
        stmt = (
            select(User)
            .join(AssignedTask, AssignedTask.user_id == User.id)
            .where(AssignedTask.tenant_id == tenant_id)
            .distinct()
            .order_by(User.name)
        )
        if only_active:
            stmt = stmt.where(
                AssignedTask.removed.is_(False),
                AssignedTask.is_active.is_(True),
            )
        result = await self.db_session.execute(stmt)
        return list(result.scalars().all())


def get_assigned_tasks_repository(db_session: DbSessionDeps):
    return AssignedTasksRepository(db_session)


AssignedTasksRepoDeps = Annotated[
    AssignedTasksRepository, Depends(get_assigned_tasks_repository)
]
