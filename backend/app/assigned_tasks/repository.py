from typing import Annotated

from fastapi import Depends
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import selectinload

from app.assigned_tasks.schema import AssignedTaskFilters, SortOrder
from app.core.db import DbSessionDeps
from app.db.entities.assigned_task import AssignedTask
from app.db.entities.github_label import GithubLabel
from app.db.entities.task import Task


class AssignedTasksRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    def _apply_filters(
        self, stmt: Select, filters: AssignedTaskFilters
    ) -> Select:

        if filters.tenant_id is not None:
            stmt = stmt.where(AssignedTask.tenant_id == filters.tenant_id)

        if filters.task_id is not None:
            stmt = stmt.where(AssignedTask.task_id == filters.task_id)

        if filters.role_in_task is not None:
            stmt = stmt.where(AssignedTask.role_in_task == filters.role_in_task)

        if filters.is_active is not None:
            stmt = stmt.where(AssignedTask.is_active.is_(filters.is_active))

        if filters.removed is not None:
            stmt = stmt.where(AssignedTask.removed.is_(filters.removed))

        if filters.assigned_from is not None:
            stmt = stmt.where(AssignedTask.assigned_at >= filters.assigned_from)
        if filters.assigned_to is not None:
            stmt = stmt.where(AssignedTask.assigned_at <= filters.assigned_to)

        if filters.hours_min is not None:
            stmt = stmt.where(AssignedTask.hours >= filters.hours_min)
        if filters.hours_max is not None:
            stmt = stmt.where(AssignedTask.hours <= filters.hours_max)

        if filters.planned_min is not None:
            stmt = stmt.where(AssignedTask.planned >= filters.planned_min)
        if filters.planned_max is not None:
            stmt = stmt.where(AssignedTask.planned <= filters.planned_max)
        # --- теги: OR по id ---

        if filters.tag_ids:
            stmt = stmt.join(Task.tags).where(GithubLabel.id.in_(filters.tag_ids))

        # --- теги: OR по именам ---
        if filters.tag_names:
            stmt = stmt.join(Task.tags)
            name_conds = [GithubLabel.name.ilike(f"%{n}%") for n in filters.tag_names]
            stmt = stmt.where(or_(*name_conds))

        # фильтры по связанной задаче
        if filters.task_title or filters.task_status:
            stmt = stmt.join(AssignedTask.task)

            if filters.task_title:
                stmt = stmt.where(Task.title.ilike(f"%{filters.task_title}%"))
            if filters.task_status:
                stmt = stmt.where(Task.status == filters.task_status)

        return stmt

    async def get_by_user_id(
        self, user_id: int, tenant_id: int, filters: AssignedTaskFilters
    ) -> list[AssignedTask]:
        sort_col = getattr(AssignedTask, filters.sort_by.value)
        order = (
            sort_col.desc() if filters.sort_order == SortOrder.desc else sort_col.asc()
        )
        stmt = (
            select(AssignedTask)
            # фильтр по пользователю
            .where(AssignedTask.user_id == user_id)
            .where(AssignedTask.tenant_id == tenant_id)
        )

        stmt = self._apply_filters(stmt, filters)
        stmt = (
            stmt.order_by(order)
            .limit(filters.limit)
            .offset(filters.offset)
            .options(selectinload(AssignedTask.task).selectinload(Task.tags))
        )

        result = await self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    async def count_by_user_id(self, user_id: int, tenant_id: int, filters: AssignedTaskFilters) -> int:
        stmt = (
            select(func.count())
            .select_from(AssignedTask)
            # фильтр по пользователю
            .where(AssignedTask.user_id == user_id)
            .where(AssignedTask.tenant_id == tenant_id)
        )
        stmt = self._apply_filters(stmt, filters)
        return (await self.db_session.execute(stmt)).scalar_one()

    async def get_by_tenant_id(
        self, tenant_id: int, filters: AssignedTaskFilters
    ) -> list[AssignedTask]:
        sort_col = getattr(AssignedTask, filters.sort_by.value)
        order = (
            sort_col.desc() if filters.sort_order == SortOrder.desc else sort_col.asc()
        )
        stmt = (
            select(AssignedTask)
            # фильтр по тенанту
            .where(AssignedTask.tenant_id == tenant_id)
        )

        stmt = self._apply_filters(stmt, filters)
        stmt = (
            stmt.order_by(order)
            .limit(filters.limit)
            .offset(filters.offset)
            .options(selectinload(AssignedTask.task).selectinload(Task.tags))
        )

        result = await self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    async def count_by_tenant_id(
        self, tenant_id: int, filters: AssignedTaskFilters
    ) -> int:
        stmt = (
            select(func.count())
            .select_from(AssignedTask)
            # фильтр по тенанту
            .where(AssignedTask.tenant_id == tenant_id)
        )
        stmt = self._apply_filters(stmt, filters)
        return (await self.db_session.execute(stmt)).scalar_one()


def get_assigned_tasks_repository(db_session: DbSessionDeps):
    return AssignedTasksRepository(db_session)


AssignedTasksRepoDeps = Annotated[
    AssignedTasksRepository, Depends(get_assigned_tasks_repository)
]
