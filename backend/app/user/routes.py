import logging

from fastapi import APIRouter, HTTPException

from app.user.schema import CreateUserRequest, JWTResponse, UserLoginRequest
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
