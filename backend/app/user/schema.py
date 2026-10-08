from enum import Enum

from pydantic import BaseModel


class TenantRole(Enum):
    OWNER = "OWNER"  # ты (фрилансер)
    CLIENT = "CLIENT"  # заказчик
    TEAM = "TEAM"  # твои помощники (если будут)


# При создании tenant'а -> создаем OWNER'а
class CreateUserRequest(BaseModel):
    login: str
    email: str
    name: str
    password: str
    tenant_id: int
    role: TenantRole
    hourly_rate: int | None = None
    is_active: bool = True


class JWTResponse(BaseModel):
    jwt: str


class UserLoginRequest(BaseModel):
    email: str
    password: str
    model_config = {"extra": "forbid"}


class UserDto(BaseModel):
    id: int
    tenant_id: int
    role: TenantRole
    name: str
    email: str
    is_active: bool
    hourly_rate: int | None


class GetUsersResponse(BaseModel):
    users: list[UserDto]
