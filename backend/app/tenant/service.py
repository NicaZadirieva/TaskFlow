from typing import Annotated

from fastapi import Depends, HTTPException

from app.db.entities.tenant import Tenant
from app.tenant.schema import CreateTenantRequest

from .repository import TenantRepoDeps, TenantRepository


class TenantService:
    def __init__(self, tenant_repo: TenantRepository):
        self.tenant_repo = tenant_repo

    async def create(self, data: CreateTenantRequest):
        tenant = await self.tenant_repo.get_by_slug(data.slug)
        if tenant:
            raise HTTPException(400, "Tenant already exists")
        new_tenant = Tenant(slug=data.slug, name=data.name)
        saved_tenant = await self.tenant_repo.save(new_tenant)
        return saved_tenant.id

    async def get_tenant(self, slug: str):
        tenant = await self.tenant_repo.get_by_slug(slug)
        return tenant


def get_tenant_service(tenant_repo: TenantRepoDeps):
    return TenantService(tenant_repo)


TenantServiceDeps = Annotated[TenantService, Depends(get_tenant_service)]
