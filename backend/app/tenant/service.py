from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from app.tenant.models import Tenant
from app.tenant.schemas import CreateTenantRequest
from app.user.models import TenantRole, User
from app.user.security import get_hashed_password

from .repository import TenantRepoDeps, TenantRepository


class TenantService:
    def __init__(self, tenant_repo: TenantRepository):
        self.tenant_repo = tenant_repo

    async def create(self, data: CreateTenantRequest):
        tenant = await self.tenant_repo.get_by_slug(data.slug)
        if tenant:
            raise HTTPException(400, "Tenant already exists")
        new_tenant = Tenant(slug=data.slug, name=data.name)
        admin_user = User(
            login=data.admin_login if data.admin_login is not None else data.slug,
            tenant_id=None,
            role=TenantRole.OWNER,
            name=data.admin_name,
            email=data.admin_email,
            password_hash=get_hashed_password(data.admin_password),
        )
        new_tenant.users.append(admin_user)
        try:
            saved_tenant = await self.tenant_repo.save(new_tenant)
        except IntegrityError as exc:
            raise HTTPException(
                409, "Tenant slug or owner email/login already in use"
            ) from exc
        return saved_tenant.id

    async def get_tenant(self, slug: str):
        tenant = await self.tenant_repo.get_by_slug(slug)
        return tenant


def get_tenant_service(tenant_repo: TenantRepoDeps):
    return TenantService(tenant_repo)


TenantServiceDeps = Annotated[TenantService, Depends(get_tenant_service)]
