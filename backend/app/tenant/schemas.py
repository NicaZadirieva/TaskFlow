from pydantic import BaseModel


class CreateTenantRequest(BaseModel):
    name: str
    slug: str
    admin_email: str
    admin_password: str
    admin_login: str | None = None
    admin_name: str = "Owner"


class CreateTenantResponse(BaseModel):
    tenant_id: int


class GetTenantResponse(BaseModel):
    slug: str
    name: str
    tenant_id: int
