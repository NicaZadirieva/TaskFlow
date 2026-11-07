from typing import Annotated

from app.executor.models import Executor
from app.executor.schema import AddHoursToExecutorRequest
from app.github_label.models import GithubLabel
from app.shared.db import DbSessionDeps
from app.task.access import task_scope
from app.task.models import Task
from app.user.models import User
from fastapi import Depends, HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.orm import selectinload, with_loader_criteria
from sqlalchemy.orm.exc import StaleDataError


class ExecutorRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    async def save(self, assigned: Executor) -> Executor:
        self.db_session.add(assigned)
        try:
            await self.db_session.commit()
        except StaleDataError as exc:
            await self.db_session.rollback()
            raise HTTPException(409, "Assignment version is out of date") from exc
        await self.db_session.refresh(assigned)
        return assigned

    async def add_hours(
        self, tenant_id: int, dto: AddHoursToExecutorRequest
    ) -> Executor:
        stmt = (
            update(Executor)
            .where(
                Executor.id == dto.id,
                Executor.task_id == dto.task_id,
                Executor.user_id == dto.user_id,
                Executor.tenant_id == tenant_id,
                Executor.removed.is_(False),
                Executor.is_active.is_(True),
                Executor.user.has(User.tenant_id == tenant_id),
            )
            .values(
                hours=func.coalesce(Executor.hours, 0) + dto.today_hours_to_add,
                version=Executor.version + 1,
            )
            .returning(Executor)
            .execution_options(populate_existing=True, synchronize_session=False)
        )
        result = await self.db_session.execute(stmt)
        assigned = result.scalar_one_or_none()
        if assigned is None:
            await self.db_session.rollback()
            raise HTTPException(404, "Active assignment not found")
        await self.db_session.commit()
        await self.db_session.refresh(assigned)
        return assigned

    async def get_by_task_and_user(
        self,
        task_id: int,
        user_id: int,
        tenant_id: int,
        *,
        for_update: bool = False,
    ) -> Executor | None:
        stmt = select(Executor).join(Executor.user).where(
            Executor.task_id == task_id,
            Executor.user_id == user_id,
            Executor.tenant_id == tenant_id,
            User.tenant_id == tenant_id,
        )
        if for_update:
            stmt = stmt.with_for_update(of=Executor)
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()

    # ---------- helpers ----------

    # Preserve every executor's contribution, including removed/inactive assignments.
    async def get_hours_by_all_users(self, task_id: int, tenant_id: int):
        stmt = select(func.sum(Executor.hours)).where(
            Executor.task_id == task_id,
            Executor.tenant_id == tenant_id,
        )
        res = await self.db_session.execute(stmt)
        return res.scalar_one_or_none()

    async def get_planned_by_all_users(self, task_id: int, tenant_id: int):
        stmt = select(func.sum(Executor.planned)).where(
            Executor.task_id == task_id,
            Executor.tenant_id == tenant_id,
        )
        res = await self.db_session.execute(stmt)
        return res.scalar_one_or_none()

    # -------- получение всех исполнителей тенанта --------

    async def get_executors(
        self,
        tenant_id: int,
        only_active: bool = True,
    ) -> list[User]:
        """Уникальные пользователи тенанта, у которых есть назначения."""
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

    async def get_all_executors(
        self,
        user: User,
        only_active: bool = True,
    ) -> list[Executor]:
        """Все назначения тенанта из таблицы executor (со связанным User)."""
        stmt = (
            select(Executor)
            .join(Executor.task)
            .join(Executor.user)
            .where(
                task_scope(user),
                Executor.tenant_id == user.tenant_id,
                User.tenant_id == user.tenant_id,
            )
            .options(
                selectinload(Executor.user),
                selectinload(Executor.task).selectinload(Task.tags),
                with_loader_criteria(GithubLabel, GithubLabel.tenant_id == user.tenant_id),
            )
            .order_by(Executor.task_id, Executor.id)
        )
        if only_active:
            stmt = stmt.where(
                Executor.removed.is_(False),
                Executor.is_active.is_(True),
            )
        result = await self.db_session.execute(stmt)
        return list(result.scalars().all())


def get_executor_repository(db_session: DbSessionDeps) -> ExecutorRepository:
    return ExecutorRepository(db_session)


ExecutorRepoDeps = Annotated[
    ExecutorRepository, Depends(get_executor_repository)
]
