from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends
from sqlalchemy import Select, and_, exists, func, or_, select
from sqlalchemy.orm import selectinload

from app.core.db import DbSessionDeps
from app.entities.assigned_task import AssignedTask
from app.entities.github_label import GithubLabel
from app.entities.task import Status, Task
from app.task.schema import SortOrder, TaskDeadline, TaskFilters


class TaskRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    # ---------- write ----------

    async def save(self, task: Task) -> Task:
        self.db_session.add(task)
        await self.db_session.commit()
        await self.db_session.refresh(task)
        return task

    # ---------- helpers ----------

    @staticmethod
    def _deadline_conditions(deadlines: list[TaskDeadline]) -> list:
        """OR-условия по Task.due_date / Task.status."""
        now = datetime.now(timezone.utc)
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=0)
        in_one_day = now + timedelta(days=1)
        in_four_days = now + timedelta(days=4)
        in_seven_days = now + timedelta(days=7)

        conds = []
        for d in deadlines:
            if d == TaskDeadline.overdue:
                conds.append(
                    and_(Task.due_date < now, Task.status != Status.DONE)
                )
            elif d == TaskDeadline.today:
                conds.append(
                    and_(Task.due_date >= now, Task.due_date <= today_end)
                )
            elif d == TaskDeadline.this_week:
                conds.append(
                    and_(
                        Task.due_date > in_one_day,
                        Task.due_date <= in_four_days,
                    )
                )
            elif d == TaskDeadline.next_week:
                conds.append(Task.due_date > in_seven_days)
            elif d == TaskDeadline.done:
                conds.append(Task.status == Status.DONE)
        return conds

    def _apply_filters(self, stmt: Select, f: TaskFilters, user_ids: list[int] | None = None) -> Select:
        if f.priority:
            stmt = stmt.where(Task.priority.in_(f.priority))

        if f.status:
            stmt = stmt.where(Task.status.in_(f.status))

        if f.deadline:
            stmt = stmt.where(or_(*self._deadline_conditions(f.deadline)))

        if f.tag_ids:
            # EXISTS — без JOIN, без размножения строк, пагинация цела
            stmt = stmt.where(Task.tags.any(GithubLabel.id.in_(f.tag_ids)))

        if user_ids:
            stmt = stmt.where(
                exists().where(
                    AssignedTask.task_id == Task.id,
                    AssignedTask.user_id.in_(user_ids),
                    AssignedTask.removed.is_(False),
                    AssignedTask.is_active.is_(True),
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
        self, tenant_id: int, filters: TaskFilters, user_ids: list[int] | None = None
    ) -> list[Task]:
        stmt = select(Task).where(Task.tenant_id == tenant_id)
        stmt = self._apply_filters(stmt, filters, user_ids)
        stmt = self._apply_sort_and_pagination(stmt, filters).options(
            selectinload(Task.tags),
            selectinload(Task.assignees),
        )
        result = await self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    async def count(self, tenant_id: int, filters: TaskFilters, user_ids: list[int] | None = None) -> int:
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
                selectinload(Task.assignees),
            )
        )
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()


def get_task_repository(db_session: DbSessionDeps) -> TaskRepository:
    return TaskRepository(db_session)

TaskRepoDeps = Annotated[TaskRepository, Depends(get_task_repository)]