
from typing import Annotated

from fastapi import Depends
from sqlalchemy import distinct, func, or_, select
from sqlalchemy.orm import selectinload

from app.shared.db import DbSessionDeps
from app.executor.models import Executor
from app.user.models import User


class ExecutorRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    async def save(self, assigned: Executor):
        self.db_session.add(assigned)
        await self.db_session.commit()
        await self.db_session.refresh(assigned)
        return assigned

    async def get_by_task_and_user(
        self,
        task_id: int,
        user_id: int,
        tenant_id: int,
    ) -> Executor | None:
        stmt = select(Executor).where(
            Executor.task_id == task_id,
            Executor.user_id == user_id,
            Executor.tenant_id == tenant_id,
        )
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()

    # ---------- helpers ----------
    
    async def get_hours_by_all_users(self, id: int, tenant_id: int):
        stmt = select(func.sum(Executor.hours)).where(Executor.id==id, Executor.tenant_id == tenant_id)
        res = await self.db_session.execute(stmt)
        return res.scalar_one_or_none()
    
    async def get_planned_by_all_users(self, id: int, tenant_id: int):
        stmt = select(func.sum(Executor.planned)).where(
            Executor.id == id, Executor.tenant_id == tenant_id)
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
            .join(Executor, Executor.user_id == User.id)
            .where(Executor.tenant_id == tenant_id)
            .distinct()
            .order_by(User.name)
        )
        if only_active:
            stmt = stmt.where(
                Executor.removed.is_(False),
                Executor.is_active.is_(True),
            )
        result = await self.db_session.execute(stmt)
        return list(result.scalars().all())


def get_executor_repository(db_session: DbSessionDeps):
    return ExecutorRepository(db_session)


ExecutorRepoDeps = Annotated[
    ExecutorRepository, Depends(get_executor_repository)
]
