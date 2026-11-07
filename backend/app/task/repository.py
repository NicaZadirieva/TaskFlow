from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Annotated

from fastapi import Depends
from sqlalchemy import Select, and_, cast, exists, func, literal, or_, select
from sqlalchemy.orm import selectinload, with_loader_criteria
from sqlalchemy.types import Numeric

from app.executor.models import Executor
from app.github_label.models import GithubLabel
from app.shared.db import DbSessionDeps
from app.task.access import task_scope
from app.task.models import Status, Task
from app.task.schemas.get_filtered_tasks import SortOrder, TaskDeadline, TaskFilters
from app.user.models import TenantRole, User


class TaskRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    # ---------- write ----------

    async def save(self, task: Task, *, commit: bool = True) -> Task:
        if task.version:
            task.version += 1
        self.db_session.add(task)
        if commit:
            await self.db_session.commit()
            await self.db_session.refresh(task)
        else:
            await self.db_session.flush()
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
                    Executor.tenant_id == Task.tenant_id,
                    Executor.user_id.in_(user_ids),
                    Executor.removed.is_(False),
                    Executor.is_active.is_(True),
                )
            )

        return stmt

    @staticmethod
    def _apply_sort_and_pagination(stmt: Select, f: TaskFilters) -> Select:
        sort_col = getattr(Task, f.sort_by.value)
        order = sort_col.desc() if f.sort_order == SortOrder.desc else sort_col.asc()
        return stmt.order_by(order).limit(f.limit).offset(f.offset)

    # ---------- executors aggregation ----------

    @staticmethod
    def calculate_executor_totals(
        executors: list[Executor],
    ) -> tuple[Decimal, Decimal, Decimal, Decimal]:
        """In-memory агрегат по уже загруженным исполнителям.

        Возвращает кортеж:
          (planned_hours, actual_hours, planned_budget, actual_budget)

        Снятые исполнители (removed=True) не учитываются.
        Если у исполнителя не задан hourly_rate, его часы попадают
        в *_hours, но вклад в *_budget = 0.
        """
        zero = Decimal("0")
        planned_hours = zero
        actual_hours = zero
        planned_budget = zero
        actual_budget = zero

        for e in executors:
            rate = Decimal(e.hourly_rate or 0)
            planned = e.planned if e.planned is not None else zero
            hours = e.hours if e.hours is not None else zero

            planned_hours += planned
            actual_hours += hours
            planned_budget += planned * rate
            actual_budget += hours * rate

        return planned_hours, actual_hours, planned_budget, actual_budget

    async def get_executor_totals_by_task_ids(
        self, task_ids: list[int], tenant_id: int
    ) -> dict[int, dict[str, Decimal]]:
        """Агрегаты по исполнителям на задачу, одним запросом.

        Возвращает:
          {task_id: {
              "executors_estimated_hours":  Decimal,
              "executors_actual_hours":     Decimal,
              "executors_estimated_budget": Decimal,
              "executors_actual_budget":    Decimal,
          }}

        Считаются только не снятые исполнители (removed=False).
        Задачи без исполнителей в результат не попадают.
        """
        if not task_ids:
            return {}

        zero = literal(Decimal("0"), Numeric(12, 2))

        planned_amount = func.coalesce(Executor.planned, zero) * func.coalesce(
            cast(Executor.hourly_rate, Numeric(12, 2)), zero
        )
        actual_amount = func.coalesce(Executor.hours, zero) * func.coalesce(
            cast(Executor.hourly_rate, Numeric(12, 2)), zero
        )

        stmt = (
            select(
                Executor.task_id,
                func.coalesce(func.sum(Executor.planned), zero).label(
                    "estimated_hours"
                ),
                func.coalesce(func.sum(Executor.hours), zero).label("actual_hours"),
                func.coalesce(func.sum(planned_amount), zero).label("estimated_budget"),
                func.coalesce(func.sum(actual_amount), zero).label("actual_budget"),
            )
            .where(
                Executor.task_id.in_(task_ids),
                Executor.tenant_id == tenant_id,
                Executor.removed.is_(False),
            )
            .group_by(Executor.task_id)
        )
        rows = (await self.db_session.execute(stmt)).all()

        return {
            task_id: {
                "executors_estimated_hours": est_h,
                "executors_actual_hours": act_h,
                "executors_estimated_budget": est_b,
                "executors_actual_budget": act_b,
            }
            for task_id, est_h, act_h, est_b, act_b in rows
        }

    # ---------- read ----------

    async def list_tasks(
        self,
        user: User,
        filters: TaskFilters,
        user_ids: list[int] | None = None,
    ) -> list[Task]:
        tenant_id = user.tenant_id
        stmt = select(Task).where(task_scope(user))
        stmt = self._apply_filters(stmt, filters, user_ids)
        stmt = self._apply_sort_and_pagination(stmt, filters).options(
            selectinload(Task.tags),
            selectinload(Task.executors).selectinload(Executor.user),
            with_loader_criteria(
                Executor,
                and_(Executor.tenant_id == tenant_id, Executor.user.has(User.tenant_id == tenant_id)),
                loader_only=True,
            ),
            with_loader_criteria(GithubLabel, GithubLabel.tenant_id == tenant_id),
        )
        result = await self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    async def count(
        self,
        user: User,
        filters: TaskFilters,
        user_ids: list[int] | None = None,
    ) -> int:
        stmt = (
            select(func.count(Task.id))
            .select_from(Task)
            .where(task_scope(user))
        )
        stmt = self._apply_filters(stmt, filters, user_ids)
        return (await self.db_session.execute(stmt)).scalar_one()

    async def get_filter_assignees(self, user: User) -> list[User]:
        stmt = (
            select(User)
            .join(Executor, Executor.user_id == User.id)
            .join(Task, Task.id == Executor.task_id)
            .where(
                task_scope(user),
                User.tenant_id == user.tenant_id,
                Executor.tenant_id == user.tenant_id,
                Executor.removed.is_(False),
                Executor.is_active.is_(True),
            )
            .distinct()
            .order_by(User.name)
        )
        return list(await self.db_session.scalars(stmt))

    async def get_filter_tags(self, user: User) -> list[GithubLabel]:
        stmt = select(GithubLabel).where(GithubLabel.tenant_id == user.tenant_id)
        if user.role != TenantRole.OWNER:
            stmt = stmt.where(GithubLabel.tasks.any(task_scope(user)))
        return list(await self.db_session.scalars(stmt))

    async def get_by_id(self, task_id: int, user: User) -> Task | None:
        stmt = (
            select(Task)
            .where(Task.id == task_id, task_scope(user))
            .options(
                selectinload(Task.tags),
                selectinload(Task.executors).selectinload(Executor.user),
                with_loader_criteria(
                    Executor,
                    and_(
                        Executor.tenant_id == user.tenant_id,
                        Executor.user.has(User.tenant_id == user.tenant_id),
                    ),
                    loader_only=True,
                ),
                with_loader_criteria(GithubLabel, GithubLabel.tenant_id == user.tenant_id),
            )
        )
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()


def get_task_repository(db_session: DbSessionDeps) -> TaskRepository:
    return TaskRepository(db_session)


TaskRepoDeps = Annotated[TaskRepository, Depends(get_task_repository)]
