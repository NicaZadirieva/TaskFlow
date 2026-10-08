from typing import Annotated

from fastapi import Depends

from app.db.entities.task import Task
from app.task.schema import CreateTaskRequest

from .repository import TaskRepoDeps

class TaskService:
    def __init__(self, task_repo: TaskRepoDeps):
        self.task_repo = task_repo
    
    async def create_task(self, tenant_id: int, user_id: int, dto: CreateTaskRequest):
        task = await self.task_repo.save(Task(
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
            
        ))
        return task
    

def get_task_service(task_repo: TaskRepoDeps) -> TaskService:
    return TaskService(task_repo)


TaskServiceDeps = Annotated[TaskService, Depends(get_task_service)]
