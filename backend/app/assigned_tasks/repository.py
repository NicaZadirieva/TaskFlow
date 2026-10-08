from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends
from sqlalchemy import Select, distinct, func, or_, select
from sqlalchemy.orm import selectinload

from app.assigned_tasks.schema import (
    AssignedTaskDeadline,
    AssignedTaskFilters,
    SortOrder,
    TaskStatus,
)
from app.core.db import DbSessionDeps
from app.db.entities.assigned_task import AssignedTask
from app.db.entities.github_label import GithubLabel
from app.db.entities.task import Task


class AssignedTasksRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    # ---------- helpers ----------

    @staticmethod
    def _deadline_conditions(deadlines: list[AssignedTaskDeadline]) -> list:
        """OR-условия по due_date/status связанной задачи."""
        now = datetime.now(timezone.utc)
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=0)
        in_one_day = now + timedelta(days=1)
        in_four_days = now + timedelta(days=4)
        in_seven_days = now + timedelta(days=7)

        conds = []
        for d in deadlines:
            if d == AssignedTaskDeadline.overdue:
                conds.append((Task.due_date < now) & (
                    Task.status != TaskStatus.DONE))
            elif d == AssignedTaskDeadline.today:
                conds.append((Task.due_date >= now) &
                             (Task.due_date <= today_end))
            elif d == AssignedTaskDeadline.this_week:
                conds.append((Task.due_date > in_one_day) &
                             (Task.due_date <= in_four_days))
            elif d == AssignedTaskDeadline.next_week:
                conds.append(Task.due_date > in_seven_days)
            elif d == AssignedTaskDeadline.done:
                conds.append(Task.status == TaskStatus.DONE)
        return conds

    def _apply_filters(self, stmt: Select, filters: AssignedTaskFilters) -> Select:
        # JOIN к Task нужен один раз, если хотя бы один из фильтров его требует
        needs_task_join = bool(
            filters.tag_ids
            or filters.priority
            or filters.status
            or filters.deadline
        )
        if needs_task_join:
            stmt = stmt.join(AssignedTask.task)

        # --- теги: OR по id (many-to-many) ---
        if filters.tag_ids:
            stmt = stmt.join(Task.tags).where(
                GithubLabel.id.in_(filters.tag_ids))

        # --- пользователи: OR ---
        if filters.user_ids:
            stmt = stmt.where(AssignedTask.user_id.in_(filters.user_ids))

        # --- приоритет: OR ---
        if filters.priority:
            stmt = stmt.where(Task.priority.in_(filters.priority))

        # --- статус: OR ---
        if filters.status:
            stmt = stmt.where(Task.status.in_(filters.status))

        # --- дедлайн: OR ---
        if filters.deadline:
            stmt = stmt.where(
                or_(*self._deadline_conditions(filters.deadline)))

        return stmt

    @staticmethod
    def _apply_sort_and_pagination(
        stmt: Select, filters: AssignedTaskFilters
    ) -> Select:
        sort_col = getattr(AssignedTask, filters.sort_by.value)
        order = sort_col.desc() if filters.sort_order == SortOrder.desc else sort_col.asc()
        return stmt.order_by(order).limit(filters.limit).offset(filters.offset)

    # ---------- по пользователю ----------

    async def get_by_user_id(
        self, user_id: int, tenant_id: int, filters: AssignedTaskFilters
    ) -> list[AssignedTask]:
        stmt = (
            select(AssignedTask)
            .where(AssignedTask.user_id == user_id)
            .where(AssignedTask.tenant_id == tenant_id)
        )
        stmt = self._apply_filters(stmt, filters)
        stmt = self._apply_sort_and_pagination(stmt, filters).options(
            selectinload(AssignedTask.task).selectinload(Task.tags)
        )

        result = await self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    async def count_by_user_id(
        self, user_id: int, tenant_id: int, filters: AssignedTaskFilters
    ) -> int:
        stmt = (
            select(func.count(distinct(AssignedTask.id)))
            .select_from(AssignedTask)
            .where(AssignedTask.user_id == user_id)
            .where(AssignedTask.tenant_id == tenant_id)
        )
        stmt = self._apply_filters(stmt, filters)
        return (await self.db_session.execute(stmt)).scalar_one()

    # ---------- по тенанту ----------

    async def get_by_tenant_id(
        self, tenant_id: int, filters: AssignedTaskFilters
    ) -> list[AssignedTask]:
        stmt = select(AssignedTask).where(AssignedTask.tenant_id == tenant_id)
        stmt = self._apply_filters(stmt, filters)
        stmt = self._apply_sort_and_pagination(stmt, filters).options(
            selectinload(AssignedTask.task).selectinload(Task.tags)
        )

        result = await self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    async def count_by_tenant_id(
        self, tenant_id: int, filters: AssignedTaskFilters
    ) -> int:
        stmt = (
            select(func.count(distinct(AssignedTask.id)))
            .select_from(AssignedTask)
            .where(AssignedTask.tenant_id == tenant_id)
        )
        stmt = self._apply_filters(stmt, filters)
        return (await self.db_session.execute(stmt)).scalar_one()


def get_assigned_tasks_repository(db_session: DbSessionDeps):
    return AssignedTasksRepository(db_session)


AssignedTasksRepoDeps = Annotated[
    AssignedTasksRepository, Depends(get_assigned_tasks_repository)
]
