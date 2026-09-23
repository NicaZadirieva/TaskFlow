from pydantic import BaseModel


class CreateTenantRequest(BaseModel):
    name: str
    slug: str


class CreateTenantResponse(BaseModel):
    tenant_id: int


class GetTenantRequest(BaseModel):
    slug: str


class GetTenantResponse(BaseModel):
    slug: str
    name: str
    tenant_id: int
