from decimal import Decimal
from typing import Annotated

from fastapi import Depends

from app.executor.models import Executor
from app.github_label.models import GithubLabel
from app.github_label.repository import GithubLabelRepoDeps
from app.task.access import require_assignees_in_tenant, require_project_in_tenant
from app.task.models import Task
from app.task.schemas.create_task import CreateTaskRequest
from app.task.schemas.get_filtered_tasks import (
    TaskFilters,
    TaskOut,
    TasksOut,
    UserShortOut,
)
from app.user.models import User

from .repository import TaskRepoDeps


class TaskService:
    def __init__(
        self,
        task_repo: TaskRepoDeps,
        github_label_repo: GithubLabelRepoDeps,
    ):
        self.task_repo = task_repo
        self.github_label_repo = github_label_repo

    # ---------- write ----------

    async def create_task(
        self,
        tenant_id: int,
        user_id: int,
        dto: CreateTaskRequest,
    ) -> Task:
        session = self.task_repo.db_session
        try:
            if dto.project_id is not None:
                await require_project_in_tenant(session, dto.project_id, tenant_id)
            if dto.executors:
                assignee_ids = {executor.user_id for executor in dto.executors}
                await require_assignees_in_tenant(session, assignee_ids, tenant_id)

            task = Task(
                tenant_id=tenant_id,
                created_by=user_id,
                title=dto.title,
                project_id=dto.project_id,
                description=dto.description,
                status=dto.status,
                priority=dto.priority,
                due_date=dto.due_date,
                estimated_budget=dto.estimated_budget,
                actual_budget=dto.actual_budget,
                estimated_hours=dto.estimated_hours,
                actual_hours=dto.actual_hours,
                note=dto.note,
                task_images=dto.task_images,
                executors=[],
            )
            new_task = await self.task_repo.save(task, commit=False)
            if dto.tags:
                for tag in dto.tags:
                    await self.github_label_repo.attach_or_create(
                        new_task.id, tenant_id, tag.name, commit=False
                    )
            if dto.executors:
                executors = [
                    Executor(
                        user_id=e.user_id,
                        task_id=new_task.id,
                        tenant_id=tenant_id,
                        role_in_task=e.role_in_task,
                        hours=e.hours,
                        planned=e.planned,
                        hourly_rate=e.hourly_rate,
                        assigned_by=user_id,
                        is_active=True,
                        removed=False,
                    )
                    for e in dto.executors
                ]
                session.add_all(executors)

            await session.commit()
            return new_task
        except Exception:
            await session.rollback()
            raise

    # ---------- read ----------

    async def list_tasks(
        self,
        user: User,
        filters: TaskFilters,
        user_ids: list[int] | None = None,
    ) -> TasksOut:
        items = await self.task_repo.list_tasks(user, filters, user_ids)
        total = await self.task_repo.count(user, filters, user_ids)

        zero = Decimal("0")
        enriched: list[TaskOut] = []
        total_planned = zero
        total_hours = zero

        for task in items:
            (
                planned_hours,
                actual_hours,
                planned_budget,
                actual_budget,
            ) = self.task_repo.calculate_executor_totals(task.executors)

            total_planned += planned_hours
            total_hours += actual_hours

            enriched.append(
                TaskOut.model_validate(task).model_copy(
                    update={
                        "executors_estimated_hours": planned_hours or None,
                        "executors_actual_hours": actual_hours or None,
                        "executors_estimated_budget": planned_budget or None,
                        "executors_actual_budget": actual_budget or None,
                    }
                )
            )

        return TasksOut(
            items=enriched,
            total=total,
            limit=filters.limit,
            offset=filters.offset,
            total_planned=total_planned,
            total_hours=total_hours,
        )

    async def list_my_tasks(
        self,
        user: User,
        filters: TaskFilters,
    ) -> TasksOut:
        return await self.list_tasks(
            user=user,
            filters=filters,
            user_ids=[user.id],
        )

    async def get_filter_assignees(self, user: User) -> list[UserShortOut]:
        data = await self.task_repo.get_filter_assignees(user)
        return [
            UserShortOut(
                user_id=e.id,
                login=e.login,
                email=e.email,
                name=e.name,
            )
            for e in data
        ]

    async def get_filter_tags(self, user: User) -> list[GithubLabel]:
        return await self.task_repo.get_filter_tags(user)


def get_task_service(
    task_repo: TaskRepoDeps,
    github_label_repo: GithubLabelRepoDeps,
) -> TaskService:
    return TaskService(task_repo, github_label_repo)


TaskServiceDeps = Annotated[TaskService, Depends(get_task_service)]
