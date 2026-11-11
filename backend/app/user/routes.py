import logging

from fastapi import APIRouter, HTTPException

from app.user.current_user import CurrentUserDeps
from app.user.schemas import (
    CreateUserRequest,
    GetCurrentUserResponse,
    GetUsersResponse,
    JWTResponse,
    TenantRole,
    UserDto,
    UserLoginRequest,
    UpdateUserRequest,
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
async def create_user(
    data: CreateUserRequest, current_user: CurrentUserDeps, service: UserServiceDeps
):
    jwt = await service.create(data, current_user)
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
                    login=user.login,
                )
                for user in users
            ]
        )
    raise HTTPException(403, "Tenant not exists")


@router.get("/current", response_model=GetCurrentUserResponse, status_code=200)
async def get_current_user(current_user: CurrentUserDeps, service: UserServiceDeps):
    return GetCurrentUserResponse(
        user_id=current_user.id,
        role=TenantRole[current_user.role.value],
        tenant_id=current_user.tenant_id,
    )


@router.put("/{user_id}", status_code=204)
async def update_user(
    user_id: int, data: UpdateUserRequest, current_user: CurrentUserDeps, service: UserServiceDeps
):
    await service.update(user_id, data, current_user)
