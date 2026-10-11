import logging
from typing import Annotated

from fastapi import Depends
from sqlalchemy import select

from app.shared.db import DbSessionDeps
from app.user.models import User

logger = logging.getLogger(__name__)


class UserRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    async def save(self, user: User):
        self.db_session.add(user)
        await self.db_session.commit()
        await self.db_session.refresh(user)
        return user

    async def get_by_email(self, email: str):
        query = select(User).where(User.email == email)
        user = await self.db_session.execute(query)
        return user.scalar_one_or_none()

    async def get_by_id(self, id: int):
        user = await self.db_session.get(User, id)
        return user
    
    async def get_default_hourly_rate(self, user_id: int, tenant_id: int):
        user = await self.user_repo.get_by_id(user_id)
        if user.tenant_id == tenant_id:
            return user.hourly_rate
        return None


def get_user_repository(db_session: DbSessionDeps):
    return UserRepository(db_session)


UserRepoDeps = Annotated[UserRepository, Depends(get_user_repository)]
