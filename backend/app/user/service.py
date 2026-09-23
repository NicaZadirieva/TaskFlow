from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy import select

from app.db.entities.user import TenantRole, User
from app.tenant.repository import TenantRepoDeps, TenantRepository
from app.tenant.schema import GetTenantRequest
from app.user.jwt import create_access_token
from app.user.schema import CreateUserRequest, UserLoginRequest
from app.user.security import get_hashed_password, verify_password

from .repository import UserRepoDeps, UserRepository


class UserService:
    def __init__(self, user_repo: UserRepository, tenant_repo: TenantRepository):
        self.user_repo = user_repo
        self.tenant_repo = tenant_repo

    async def create(self, data: CreateUserRequest):
        user = await self.user_repo.get_by_email(data.email)
        if user:
            raise HTTPException(400, "User already exists")
        tenant = await self.tenant_repo.get_by_id(data.tenant_id)
        if tenant is None:
            raise HTTPException(403, "Tenant not exists. Forbidden")
        new_user = User(
            name=data.name,
            email=data.email,
            password_hash=get_hashed_password(data.password),
            tenant_id=data.tenant_id,
            hourly_rate=data.hourly_rate,
            is_active=data.is_active,
            role=TenantRole[data.role.value],
        )
        saved_user = await self.user_repo.save(new_user)
        return create_access_token(saved_user.id)

    async def get_user(self, user_id: int):
        return await self.user_repo.get_by_id(user_id)

    async def authenticate(self, data: UserLoginRequest):
        user = await self.user_repo.get_by_email(data.email)
        if user is None:
            return None
        if not verify_password(data.password, user.password_hash):
            return None
        jwt = create_access_token(user.id)
        return jwt


def get_user_service(user_repo: UserRepoDeps, tenant_repo: TenantRepoDeps):
    return UserService(user_repo, tenant_repo)


UserServiceDeps = Annotated[UserService, Depends(get_user_service)]
