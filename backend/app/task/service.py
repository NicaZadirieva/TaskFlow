from typing import Annotated

from fastapi import Depends

from app.task.models import Task
from app.task.schemas.create_task import CreateTaskRequest
from app.task.schemas.get_filtered_tasks import TaskFilters, TasksOut


from .repository import TaskRepoDeps


class TaskService:
    def __init__(self, task_repo: TaskRepoDeps):
        self.task_repo = task_repo

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
        )
        return await self.task_repo.save(task)

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
            offset=filters.offset,
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


def get_task_service(task_repo: TaskRepoDeps) -> TaskService:
    return TaskService(task_repo)


TaskServiceDeps = Annotated[TaskService, Depends(get_task_service)]
