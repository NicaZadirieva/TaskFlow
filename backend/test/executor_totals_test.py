import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from app.executor.models import Executor
from app.executor.repository import ExecutorRepository
from app.executor.routes import add_hours_to_executor, change_hours_to_executor
from app.executor.schema import (
    AddHoursToExecutorRequest,
    OwnerChangeAssigneeHoursRequest,
)
from app.executor.service import ExecutorService
from app.user.models import TenantRole, User
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine


@pytest.mark.parametrize("operation", ["add", "change"])
def test_hours_response_totals(tmp_path, operation):
    async def scenario():
        engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'totals.db'}")
        try:
            async with engine.begin() as connection:
                await connection.run_sync(User.__table__.create)
                await connection.run_sync(Executor.__table__.create)
            async with async_sessionmaker(engine, expire_on_commit=False)() as session:
                session.add_all([
                    User(id=i, tenant_id=1, role=TenantRole.TEAM, login=f"u{i}",
                         name=f"User {i}", email=f"u{i}@example.com", password_hash="unused")
                    for i in range(1, 7)
                ])
                # Task ID deliberately differs from the assignment ID.
                for user_id, task_id, tenant_id, hours, removed, active in [
                    (1, 10, 1, 2, False, True),
                    (2, 10, 1, 3, False, True),
                    (3, 10, 1, 50, True, True),
                    (4, 10, 1, 4, False, False),
                    (5, 10, 2, 100, False, True),
                    (6, 20, 1, 200, False, True),
                ]:
                    session.add(Executor(user_id=user_id, task_id=task_id,
                                         tenant_id=tenant_id, role_in_task="DEV",
                                         hours=hours, planned=hours * 2,
                                         hourly_rate=100, removed=removed, is_active=active))
                await session.commit()
                service = ExecutorService(ExecutorRepository(session), None)
                user = SimpleNamespace(id=1, tenant_id=1, role=TenantRole.OWNER)
                access = Mock(require_task=AsyncMock())
                if operation == "add":
                    result = await add_hours_to_executor(
                        AddHoursToExecutorRequest(id=1, task_id=10, user_id=1,
                                                  today_hours_to_add=1),
                        service, user, access,
                    )
                else:
                    result = await change_hours_to_executor(
                        OwnerChangeAssigneeHoursRequest(id=1, task_id=10, user_id=1,
                                                        hours=3),
                        service, user, access,
                    )
                assert result.user_hours == 3
                # Removed and inactive executors retain their contributions.
                # Other tenants and other tasks must not affect these totals.
                assert result.all_hours == 60
                assert result.all_planned == 118
        finally:
            await engine.dispose()

    asyncio.run(scenario())
