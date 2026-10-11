from typing import Annotated

from fastapi import Depends


from app.assigned_task.repository import AssignedTasksRepoDeps
from app.assigned_task.models import AssignedTask
from app.assigned_task.schema import AddHoursToAssignedTaskRequest, CreateAssignedTaskRequest, OwnerChangeAssigneeHoursRequest, ReassignedUserTaskRequest, RemoveUserFromTaskRequest
from app.user.repository import UserRepoDeps


class AssignedTasksService:
    def __init__(self, assigned_tasks_repo: AssignedTasksRepoDeps, user_repo: UserRepoDeps):
        self.assigned_tasks_repo = assigned_tasks_repo
        self.user_repo = user_repo
        
    async def get_user_hourly_rate(self, task_id: int, user_id: int, tenant_id):
        existing = await self.assigned_tasks_repo.get_by_task_and_user(
                            task_id=task_id,
                            user_id=user_id,
                            tenant_id=tenant_id,
                        )
        if existing is None or existing.removed or existing.hourly_rate is None:
            return await self.user_repo.get_default_hourly_rate(user_id=user_id, tenant_id=tenant_id)
        return existing.hourly_rate
    
    
    
    async def change_hours_to_task(self, tenant_id, dto: OwnerChangeAssigneeHoursRequest):
        existing = await self.assigned_tasks_repo.get_by_task_and_user(
                                    task_id=dto.task_id,
                                    user_id=dto.user_id,
                                    tenant_id=tenant_id,
                                )
        if existing is None or existing.removed:
            return None
        existing.hours = dto.hours
        existing.planned = dto.planned if dto.planned is not None else existing.planned
        return await self.assigned_tasks_repo.save(existing)  
        
        
    
    async def get_all_hours(self, id: int, tenant_id: int):
        return await self.assigned_tasks_repo.get_hours_by_all_users(id, tenant_id)
    
    async def get_all_planned_hours(self, id: int, tenant_id: int):
            return await self.assigned_tasks_repo.get_planned_by_all_users(id, tenant_id)
        
        
    async def add_hours_to_task(self, tenant_id: int, dto: AddHoursToAssignedTaskRequest):
        existing = await self.assigned_tasks_repo.get_by_task_and_user(
                    task_id=dto.task_id,
                    user_id=dto.user_id,
                    tenant_id=tenant_id,
                )
        if existing is None or existing.removed:
            raise ValueError("User cannot have rules to update already removed task")
        existing.hours += dto.today_hours_to_add
        return await self.assigned_tasks_repo.save(existing)   
        
        
    
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
    
    async def get_executors(self, tenant_id: int, only_active=True):
        executors = await self.assigned_tasks_repo.get_executors(tenant_id, only_active)
        return executors
        


def get_assigned_tasks_service(assigned_tasks_repo: AssignedTasksRepoDeps, user_repo: UserRepoDeps):
    return AssignedTasksService(assigned_tasks_repo, user_repo)


AssignedTasksServiceDeps = Annotated[
    AssignedTasksService, Depends(get_assigned_tasks_service)
]
