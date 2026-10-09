import logging
from typing import Annotated

from fastapi import Depends
from sqlalchemy import select

from app.core.db import DbSessionDeps
from app.db.entities.task import Task

logger = logging.getLogger(__name__)


class TaskRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    async def save(self, task: Task):
        self.db_session.add(task)
        await self.db_session.commit()
        await self.db_session.refresh(task)
        return task


def get_task_repository(db_session: DbSessionDeps):
    return TaskRepository(db_session)


TaskRepoDeps = Annotated[TaskRepository, Depends(get_task_repository)]
