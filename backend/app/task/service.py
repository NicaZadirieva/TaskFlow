from typing import Annotated

from fastapi import Depends

from app.executor.models import Executor
from app.executor.repository import ExecutorRepoDeps
from app.executor.schema import ExecutorOut
from app.github_label.repository import GithubLabelRepoDeps
from app.github_label.schemas import GithubLabelOut
from app.task.models import Task
from app.task.schemas.create_task import CreateTaskRequest
from app.task.schemas.get_filtered_tasks import ExecutorShortOut, TaskFilters, TasksOut, UserShortOut


from .repository import TaskRepoDeps


class TaskService:
    def __init__(self, task_repo: TaskRepoDeps, github_label_repo: GithubLabelRepoDeps, executors_repo: ExecutorRepoDeps):
        self.task_repo = task_repo
        self.github_label_repo = github_label_repo
        self.executors_repo = executors_repo

    async def create_task(
        self,
        tenant_id: int,
        user_id: int,
        dto: CreateTaskRequest,
    ) -> Task:
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
            executors=[]
        )
        new_task = await self.task_repo.save(task)
        for tag in dto.tags:
           await self.github_label_repo.attach_or_create(new_task.id, tenant_id, tag.name)
        executors = [
            Executor(
                user_id=e.user_id,
                task_id=task.id,
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
        for executor in executors:
            await self.executors_repo.save(executor)
        return new_task

    async def list_tasks(
        self,
        tenant_id: int,
        filters: TaskFilters,
        user_ids: list[int] | None = None,
    ) -> TasksOut:
        items = await self.task_repo.list_tasks(tenant_id, filters, user_ids)
        total = await self.task_repo.count(tenant_id, filters, user_ids)
        return TasksOut(
            items=items,
            total=total,
            limit=filters.limit,
            offset=filters.offset
        )

    async def list_my_tasks(
        self,
        tenant_id: int,
        user_id: int,
        filters: TaskFilters,
    ) -> TasksOut:
        return await self.list_tasks(
            tenant_id=tenant_id,
            filters=filters,
            user_ids=[user_id],   # всегда только текущий
        )
        
    async def get_filter_assignees(self, tenant_id: int) -> list[UserShortOut]:
        data = await self.executors_repo.get_executors(tenant_id, only_active=True)
        return [
            UserShortOut(
                user_id=e.id,
                login=e.login,
                email=e.email,
                name=e.name,
            )
            for e in data
        ]

    async def get_filter_tags(self, tenant_id: int) -> list[GithubLabelOut]:
        return await self.github_label_repo.get_all(tenant_id)


def get_task_service(task_repo: TaskRepoDeps, github_label_repo: GithubLabelRepoDeps, executors_repo: ExecutorRepoDeps) -> TaskService:
    return TaskService(task_repo, github_label_repo, executors_repo)


TaskServiceDeps = Annotated[TaskService, Depends(get_task_service)]
