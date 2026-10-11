from sqlalchemy.orm import DeclarativeBase
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.shared.settings import Settings

settings = Settings()  # type: ignore[call-arg]

engine = create_async_engine(
    settings.db.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,  # ждать слот в пуле не более 30с
    pool_recycle=1800,  # пересоздавать соединения раз в 30 мин
    connect_args={
        "timeout": 10,  # таймаут установки соединения (asyncpg)
        "command_timeout": 30,  # таймаут выполнения команды (asyncpg)
        "server_settings": {
            "statement_timeout": "30000",  # 30с на запрос на стороне PG
            "idle_in_transaction_session_timeout": "60000",
        },
    },
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


class Base(DeclarativeBase):
    pass
