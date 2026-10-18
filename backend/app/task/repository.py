from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends
from sqlalchemy import Select, and_, exists, func, or_, select
from sqlalchemy.orm import selectinload

from app.shared.db import DbSessionDeps
from app.executor.models import Executor
from app.github_label.models import GithubLabel
from app.task.models import Status, Task
from app.task.schemas.get_filtered_tasks import SortOrder, TaskDeadline, TaskFilters


class TaskRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    # ---------- write ----------

    async def save(self, task: Task) -> Task:
        if task.version:
            task.version += 1
        self.db_session.add(task)
        await self.db_session.commit()
        await self.db_session.refresh(task)
        return task

    # ---------- helpers ----------

    @staticmethod
    def _deadline_conditions(deadlines: list[TaskDeadline]) -> list:
        """OR-условия по Task.due_date / Task.status.

        Границы — календарные, полуинтервалы [start, end).
        Сравнение в naive UTC — совместимо с DateTime без timezone=True.
        """
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_tomorrow = start_of_today + timedelta(days=1)
        start_in_5_days = start_of_today + timedelta(days=5)
        start_in_8_days = start_of_today + timedelta(days=8)

        conds = []
        for d in deadlines:
            if d == TaskDeadline.overdue:
                conds.append(
                    and_(
                        Task.due_date.is_not(None),
                        Task.due_date < now,
                        Task.status != Status.DONE,
                    )
                )
            elif d == TaskDeadline.today:
                conds.append(
                    and_(
                        Task.due_date.is_not(None),
                        Task.due_date >= start_of_today,
                        Task.due_date < start_of_tomorrow,
                    )
                )
            elif d == TaskDeadline.this_week:
                conds.append(
                    and_(
                        Task.due_date.is_not(None),
                        Task.due_date >= start_of_tomorrow,
                        Task.due_date < start_in_5_days,
                    )
                )
            elif d == TaskDeadline.next_week:
                conds.append(
                    and_(
                        Task.due_date.is_not(None),
                        Task.due_date >= start_in_8_days,
                    )
                )
            elif d == TaskDeadline.done:
                conds.append(Task.status == Status.DONE)
        return conds

    def _apply_filters(
        self,
        stmt: Select,
        f: TaskFilters,
        user_ids: list[int] | None = None,
    ) -> Select:
        if f.priority:
            stmt = stmt.where(Task.priority.in_(f.priority))

        if f.status:
            stmt = stmt.where(Task.status.in_(f.status))

        if f.deadline:
            stmt = stmt.where(or_(*self._deadline_conditions(f.deadline)))

        if f.tag_ids:
            stmt = stmt.where(Task.tags.any(GithubLabel.id.in_(f.tag_ids)))

        if user_ids:
            stmt = stmt.where(
                exists().where(
                    Executor.task_id == Task.id,
                    Executor.user_id.in_(user_ids),
                    Executor.removed.is_(False),
                    Executor.is_active.is_(True),
                )
            )

        return stmt

    @staticmethod
    def _apply_sort_and_pagination(stmt: Select, f: TaskFilters) -> Select:
        sort_col = getattr(Task, f.sort_by.value)
        order = (
            sort_col.desc() if f.sort_order == SortOrder.desc else sort_col.asc()
        )
        return stmt.order_by(order).limit(f.limit).offset(f.offset)

    # ---------- read ----------

    async def list_tasks(
        self,
        tenant_id: int,
        filters: TaskFilters,
        user_ids: list[int] | None = None,
    ) -> list[Task]:
        stmt = select(Task).where(Task.tenant_id == tenant_id)
        stmt = self._apply_filters(stmt, filters, user_ids)
        stmt = self._apply_sort_and_pagination(stmt, filters).options(
            selectinload(Task.tags),
            selectinload(Task.executors),
        )
        result = await self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    async def count(
        self,
        tenant_id: int,
        filters: TaskFilters,
        user_ids: list[int] | None = None,
    ) -> int:
        stmt = (
            select(func.count(Task.id))
            .select_from(Task)
            .where(Task.tenant_id == tenant_id)
        )
        stmt = self._apply_filters(stmt, filters, user_ids)
        return (await self.db_session.execute(stmt)).scalar_one()

    async def get_by_id(self, task_id: int, tenant_id: int) -> Task | None:
        stmt = (
            select(Task)
            .where(Task.id == task_id, Task.tenant_id == tenant_id)
            .options(
                selectinload(Task.tags),
                selectinload(Task.executors),
            )
        )
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()


def get_task_repository(db_session: DbSessionDeps) -> TaskRepository:
    return TaskRepository(db_session)


TaskRepoDeps = Annotated[TaskRepository, Depends(get_task_repository)]
