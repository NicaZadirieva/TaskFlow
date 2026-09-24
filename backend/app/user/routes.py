import logging

from fastapi import APIRouter, HTTPException

from app.user.current_user import CurrentUserDeps
from app.user.schema import (
    CreateUserRequest,
    GetUsersResponse,
    JWTResponse,
    TenantRole,
    UserDto,
    UserLoginRequest,
)
from app.user.service import UserServiceDeps

router = APIRouter(prefix="/v1/user", tags=["User"])
logger = logging.getLogger(__name__)


@router.post(
    "/create",
    response_model=JWTResponse,
    status_code=201,
    summary="Создает юзера",
    description="""Создает юзера""",
)
async def create_user(data: CreateUserRequest, service: UserServiceDeps):
    jwt = await service.create(data)
    return JWTResponse(jwt=jwt)


@router.post(
    "/login",
    response_model=JWTResponse,
    status_code=200,
    summary="Авторизовывает пользователя",
    description="""
    Авторизовывает пользователя
    """,
)
async def login(data: UserLoginRequest, service: UserServiceDeps):
    jwt = await service.authenticate(data)
    if jwt is None:
        raise HTTPException(401, "Wrong email or password")
    else:
        return JWTResponse(jwt=jwt)


@router.get(
    "/users",
    response_model=GetUsersResponse,
    status_code=200,
    summary="Получает пользователей для текущего тенанта",
    description="""
Получает пользователей для текущего тенанта
""",
)
async def get_users(current_user: CurrentUserDeps, service: UserServiceDeps):
    users = await service.get_users_by_tenant_id(current_user.tenant_id)
    if users:
        return GetUsersResponse(
            users=[
                UserDto(
                    name=user.name,
                    email=user.email,
                    id=user.id,
                    tenant_id=user.tenant_id,
                    role=TenantRole(user.role.value),
                    is_active=user.is_active,
                    hourly_rate=user.hourly_rate,
                )
                for user in users
            ]
        )
    raise HTTPException(403, "Tenant not exists")
