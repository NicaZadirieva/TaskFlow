from typing import Annotated

from fastapi import Depends

from app.assigned_tasks.repository import AssignedTasksRepoDeps
from app.assigned_tasks.schema import AssignedTaskFiltersDeps


class AssignedTasksService:
    def __init__(self, assigned_tasks_repo: AssignedTasksRepoDeps):
        self.assigned_tasks_repo = assigned_tasks_repo

    async def get_my_tasks(self, user_id: int, filters: AssignedTaskFiltersDeps):
        assigned_tasks = await self.assigned_tasks_repo.get_by_user_id(user_id, filters)
        total = await self.assigned_tasks_repo.count_by_user_id(user_id, filters)
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
