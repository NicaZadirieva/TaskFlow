import asyncio
from decimal import Decimal

import pytest
from app.executor.models import Executor
from app.executor.repository import ExecutorRepository
from app.executor.schema import (
    AddHoursToExecutorRequest,
    OwnerChangeAssigneeHoursRequest,
)
from app.executor.service import ExecutorService
from app.user.models import TenantRole, User
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine


@pytest.mark.parametrize("initial", [None, Decimal("3.00")])
def test_concurrent_additions_and_stale_edit(tmp_path, initial):
    async def scenario():
        engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'hours.db'}")
        sessions = async_sessionmaker(engine, expire_on_commit=False)
        try:
            async with engine.begin() as connection:
                await connection.run_sync(User.__table__.create)
                await connection.run_sync(Executor.__table__.create)
            async with sessions() as seed:
                seed.add(
                    User(
                        tenant_id=1,
                        role=TenantRole.TEAM,
                        login="worker",
                        name="Worker",
                        email="worker@example.com",
                        password_hash="unused",
                    )
                )
                seed.add(
                    Executor(
                        user_id=1,
                        task_id=1,
                        tenant_id=1,
                        role_in_task="DEV",
                        hours=initial,
                    )
                )
                await seed.commit()

            async with sessions() as first, sessions() as second:
                # Both sessions retain the same original hours and version.
                stale = await first.get(Executor, 1)
                other = await second.get(Executor, 1)
                assert stale.version == other.version == 1
                dto = {"id": 1, "task_id": 1, "user_id": 1}
                await asyncio.gather(
                    ExecutorService(ExecutorRepository(first), None).add_hours_to_task(
                        1,
                        AddHoursToExecutorRequest(
                            **dto, today_hours_to_add=Decimal("1.25")
                        ),
                    ),
                    ExecutorService(ExecutorRepository(second), None).add_hours_to_task(
                        1,
                        AddHoursToExecutorRequest(
                            **dto, today_hours_to_add=Decimal("2.50")
                        ),
                    ),
                )
            async with sessions() as reader:
                result = await reader.get(Executor, 1)
                assert result.hours == (initial or 0) + Decimal("3.75")
                assert result.version == 3

            async with sessions() as editor, sessions() as writer:
                stale = await editor.get(Executor, 1)
                await ExecutorRepository(writer).add_hours(
                    1, AddHoursToExecutorRequest(**dto, today_hours_to_add=1)
                )
                with pytest.raises(HTTPException) as conflict:
                    await ExecutorService(
                        ExecutorRepository(editor), None
                    ).change_hours_to_task(
                        1, OwnerChangeAssigneeHoursRequest(**dto, hours=99)
                    )
                assert conflict.value.status_code == 409
                # Rollback leaves the session usable and preserves the addition.
                await editor.refresh(stale)
                assert stale.hours == (initial or 0) + Decimal("4.75")
                assert stale.version == 4
        finally:
            await engine.dispose()

    asyncio.run(scenario())
