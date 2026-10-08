from typing import Annotated

from fastapi import Depends

from app.assigned_tasks.repository import AssignedTasksRepoDeps
from app.assigned_tasks.schema import AssignedTaskFiltersDeps, CreateAssignedTaskRequest, ReassignedUserTaskRequest, RemoveUserFromTaskRequest
from app.db.entities.assigned_task import AssignedTask


class AssignedTasksService:
    def __init__(self, assigned_tasks_repo: AssignedTasksRepoDeps):
        self.assigned_tasks_repo = assigned_tasks_repo
    
    async def create_assigned_task(self, user_id: int, tenant_id: int, dto: CreateAssignedTaskRequest):
        existing = await self.assigned_tasks_repo.get_by_task_and_user(
            task_id=dto.task_id,
            user_id=dto.user_id,
            tenant_id=tenant_id,
        )
        if existing is not None and not existing.removed:
            raise ValueError("User is already assigned to this task")
        # Если была soft-deleted запись — реактивируем её, а не создаём дубль
        if existing is not None and existing.removed:
            existing.removed = False
            existing.remove_reason = None
            existing.role_in_task = dto.role_in_task
            existing.assigned_at = dto.assigned_at
            existing.hours = dto.hours
            existing.planned = dto.planned
            existing.hourly_rate = dto.hourly_rate
            return await self.assigned_tasks_repo.save(existing)
        
        assigned_task = AssignedTask(
            tenant_id=tenant_id,
            task_id=dto.task_id,
            user_id=dto.user_id,
            role_in_task=dto.role_in_task,
            assigned_at=dto.assigned_at,
            hours=dto.hours,
            planned=dto.planned,
            hourly_rate=dto.hourly_rate,
            removed=False,
            assigned_by=user_id,  # кто назначил — текущий пользователь
        )
        refreshed_assigned_task = await self.assigned_tasks_repo.save(assigned_task)
        return refreshed_assigned_task.id
    
     # -------- Soft Delete User (removed=True) ------------

    async def remove_user_from_task(
        self,
        tenant_id: int,
        dto: RemoveUserFromTaskRequest,
    ) -> AssignedTask:
        assigned_task = await self.assigned_tasks_repo.get_by_task_and_user(
            task_id=dto.task_id,
            user_id=dto.user_id,
            tenant_id=tenant_id,
        )
        if assigned_task is None or assigned_task.removed:
            raise ValueError("Active assignment not found")

        assigned_task.removed = True
        assigned_task.remove_reason = dto.remove_reason
        return await self.assigned_tasks_repo.save(assigned_task)
    
     # --------- Reassigned User (removed=False) ----------
    async def reassign_user_to_task(
        self,
        tenant_id: int,
        dto: ReassignedUserTaskRequest,
    ) -> AssignedTask:
        assigned_task = await self.assigned_tasks_repo.get_by_task_and_user(
            task_id=dto.task_id,
            user_id=dto.user_id,
            tenant_id=tenant_id,
        )
        if assigned_task is None:
            raise ValueError("Assignment not found")
        if not assigned_task.removed:
            raise ValueError("User is already active on this task")

        assigned_task.removed = False
        assigned_task.reassigned_reason = dto.reassigned_reason
        return await self.assigned_tasks_repo.save(assigned_task)

    async def get_my_tasks(self, user_id: int, tenant_id: int, filters: AssignedTaskFiltersDeps):
        assigned_tasks = await self.assigned_tasks_repo.get_by_user_id(user_id, tenant_id, filters)
        total = await self.assigned_tasks_repo.count_by_user_id(user_id, tenant_id, filters)
        return assigned_tasks, total

    async def get_all_tasks(self, tenant_id: int, filters: AssignedTaskFiltersDeps):
        assigned_tasks = await self.assigned_tasks_repo.get_by_tenant_id(
            tenant_id, filters
        )
        total = await self.assigned_tasks_repo.count_by_tenant_id(tenant_id, filters)
        return assigned_tasks, total


def get_assigned_tasks_service(assigned_tasks_repo: AssignedTasksRepoDeps):
    return AssignedTasksService(assigned_tasks_repo)


AssignedTasksServiceDeps = Annotated[
    AssignedTasksService, Depends(get_assigned_tasks_service)
]
