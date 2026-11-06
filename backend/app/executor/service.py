from typing import Annotated

from fastapi import Depends, HTTPException

from app.executor.models import Executor
from app.executor.repository import ExecutorRepoDeps
from app.executor.schema import (
    AddHoursToExecutorRequest,
    CreateExecutorRequest,
    OwnerChangeAssigneeHoursRequest,
    ReassignedUserTaskRequest,
    RemoveUserFromTaskRequest,
)
from app.user.models import TenantRole, User
from app.user.repository import UserRepoDeps


class ExecutorService:
    def __init__(self, executor_repo: ExecutorRepoDeps, user_repo: UserRepoDeps):
        self.executor_repo = executor_repo
        self.user_repo = user_repo

    async def get_user_hourly_rate(self, task_id: int, user_id: int, tenant_id):
        existing = await self.executor_repo.get_by_task_and_user(
            task_id=task_id,
            user_id=user_id,
            tenant_id=tenant_id,
        )
        if existing is None or existing.removed or existing.hourly_rate is None:
            return await self.user_repo.get_default_hourly_rate(
                user_id=user_id, tenant_id=tenant_id
            )
        return existing.hourly_rate

    async def change_hours_to_task(
        self, tenant_id, dto: OwnerChangeAssigneeHoursRequest
    ):
        existing = await self.executor_repo.get_by_task_and_user(
            task_id=dto.task_id,
            user_id=dto.user_id,
            tenant_id=tenant_id,
            for_update=True,
        )
        if existing is None or existing.id != dto.id or existing.removed:
            return None
        existing.hours = dto.hours
        existing.planned = dto.planned if dto.planned is not None else existing.planned
        return await self.executor_repo.save(existing)

    async def get_all_hours(self, id: int, tenant_id: int):
        return await self.executor_repo.get_hours_by_all_users(id, tenant_id)

    async def get_all_planned_hours(self, id: int, tenant_id: int):
        return await self.executor_repo.get_planned_by_all_users(id, tenant_id)

    async def add_hours_to_task(self, tenant_id: int, dto: AddHoursToExecutorRequest):
        existing = await self.executor_repo.get_by_task_and_user(
            task_id=dto.task_id,
            user_id=dto.user_id,
            tenant_id=tenant_id,
            for_update=True,
        )
        if existing is None or existing.id != dto.id or existing.removed or not existing.is_active:
            raise HTTPException(404, "Active assignment not found")
        existing.hours = (existing.hours or 0) + dto.today_hours_to_add
        return await self.executor_repo.save(existing)

    async def create_executor(
        self, user_id: int, tenant_id: int, dto: CreateExecutorRequest
    ):
        existing_user = await self.user_repo.get_by_login(dto.login, tenant_id)
        if (
            existing_user is None
            or not existing_user.is_active
            or existing_user.role not in (TenantRole.OWNER, TenantRole.TEAM)
        ):
            raise HTTPException(404, "Assignee not found")
        existing = await self.executor_repo.get_by_task_and_user(
            task_id=dto.task_id,
            user_id=existing_user.id,
            tenant_id=tenant_id,
            for_update=True,
        )
        if existing is not None and not existing.removed:
            raise HTTPException(409, "User is already assigned to this task")
        # TODO: добавить проверку на version только если edit_task
        if (
            dto.version is not None
            and existing is not None
            and existing.version != dto.version
        ):
            raise HTTPException(409, "Assignment version is out of date")
        # Если была soft-deleted запись — реактивируем её, а не создаём дубль
        if existing is not None and existing.removed:
            existing.removed = False
            existing.remove_reason = None
            existing.role_in_task = dto.role_in_task
            # TODO: история existing.assigned_at = dto.assigned_at
            if existing.hours and dto.hours:
                existing.hours = existing.hours + dto.hours
            elif dto.hours:
                existing.hours = dto.hours
            existing.planned = dto.planned
            existing.hourly_rate = dto.hourly_rate
            return await self.executor_repo.save(existing), existing_user

        executor = Executor(
            tenant_id=tenant_id,
            task_id=dto.task_id,
            user_id=existing_user.id,
            role_in_task=dto.role_in_task,
            hours=dto.hours,
            planned=dto.planned,
            hourly_rate=dto.hourly_rate,
            removed=False,
            assigned_by=user_id,  # кто назначил — текущий пользователь
        )
        refreshed_executor = await self.executor_repo.save(executor)
        return refreshed_executor, existing_user

    # -------- Soft Delete User (removed=True) ------------

    async def remove_user_from_task(
        self,
        tenant_id: int,
        dto: RemoveUserFromTaskRequest,
    ) -> Executor:
        executor = await self.executor_repo.get_by_task_and_user(
            task_id=dto.task_id,
            user_id=dto.user_id,
            tenant_id=tenant_id,
            for_update=True,
        )
        if executor is None or executor.removed:
            raise HTTPException(404, "Active assignment not found")

        executor.removed = True
        executor.remove_reason = dto.remove_reason
        return await self.executor_repo.save(executor)

    # --------- Reassigned User (removed=False) ----------
    async def reassign_user_to_task(
        self,
        tenant_id: int,
        dto: ReassignedUserTaskRequest,
    ) -> Executor:
        executor = await self.executor_repo.get_by_task_and_user(
            task_id=dto.task_id,
            user_id=dto.user_id,
            tenant_id=tenant_id,
            for_update=True,
        )
        if executor is None:
            raise HTTPException(404, "Assignment not found")
        if not executor.removed:
            raise HTTPException(409, "User is already active on this task")

        user = await self.user_repo.get_by_id(dto.user_id)
        if (
            user is None
            or not user.is_active
            or user.tenant_id != tenant_id
            or user.role not in (TenantRole.OWNER, TenantRole.TEAM)
        ):
            raise HTTPException(404, "Assignee not found")

        executor.removed = False
        executor.reassigned_reason = dto.reassigned_reason
        return await self.executor_repo.save(executor)

    async def get_executors(self, user: User, only_active=True):
        return await self.executor_repo.get_all_executors(user, only_active)


def get_executor_service(executor_repo: ExecutorRepoDeps, user_repo: UserRepoDeps):
    return ExecutorService(executor_repo, user_repo)


ExecutorServiceDeps = Annotated[ExecutorService, Depends(get_executor_service)]
