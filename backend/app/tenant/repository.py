import logging
from typing import Annotated

from fastapi import Depends
from sqlalchemy import select

from app.core.db import DbSessionDeps
from app.db.entities.tenant import Tenant

logger = logging.getLogger(__name__)


class TenantRepository:
    def __init__(self, db_session: DbSessionDeps):
        self.db_session = db_session

    async def save(self, tenant: Tenant):
        self.db_session.add(tenant)
        await self.db_session.commit()
        await self.db_session.refresh(tenant)
        return tenant

    async def get_by_slug(self, slug: str):
        query = select(Tenant).where(Tenant.slug == slug)
        tenant = await self.db_session.execute(query)
        return tenant.scalar_one_or_none()

    async def get_by_id(self, id: int):
        user = await self.db_session.get(Tenant, id)
        return user


def get_tenant_repository(db_session: DbSessionDeps):
    return TenantRepository(db_session)


TenantRepoDeps = Annotated[TenantRepository, Depends(get_tenant_repository)]
