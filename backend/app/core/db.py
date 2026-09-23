from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.settings import Settings

settings = Settings()  # type: ignore[call-arg]

engine = create_async_engine(
    settings.db.DATABASE_URL,
    echo=False,  # вывод sql-команд отключена
    pool_pre_ping=True,
)

async_session_local = async_sessionmaker(
    engine,
    expire_on_commit=False,  # создание новой сессии после каждого коммита в БД отключена
)


async def get_session() -> AsyncGenerator[AsyncSession]:
    async with async_session_local() as session:
        yield session


async def check_db(session: AsyncSession) -> int:
    result = await session.execute(select(1))
    return result.scalar_one()


DbSessionDeps = Annotated[AsyncSession, Depends(get_session)]
