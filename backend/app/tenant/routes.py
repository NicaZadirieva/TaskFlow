import logging

from fastapi import APIRouter, HTTPException

from app.tenant.schemas import (
    CreateTenantRequest,
    CreateTenantResponse,
    GetTenantResponse,
)
from app.tenant.service import TenantServiceDeps

router = APIRouter(prefix="/v1/tenant", tags=["Tenant"])
logger = logging.getLogger(__name__)


@router.post(
    "/create",
    response_model=CreateTenantResponse,
    status_code=201,
    summary="Создает тенант",
    description="""Создает тенант""",
)
async def create_tenant(data: CreateTenantRequest, service: TenantServiceDeps):
    tenant_id = await service.create(data)
    return CreateTenantResponse(tenant_id=tenant_id)


@router.get(
    "/slug",
    response_model=GetTenantResponse,
    status_code=200,
    summary="Получает тенант",
    description="""Получает тенант""",
)
async def get_tenant_by_slug(slug: str, service: TenantServiceDeps):
    tenant = await service.get_tenant(slug)
    if tenant is None:
        raise HTTPException(404, "Tenant not found")
    return GetTenantResponse(slug=tenant.slug, name=tenant.name, tenant_id=tenant.id)
