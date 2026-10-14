from typing import Annotated

from fastapi import Cookie, Depends, HTTPException

from app.user.models import User
from app.user.jwt import decode_access_token
from app.user.service import UserServiceDeps


# TODO: проверка на tenant_id
async def get_current_user(
    service: UserServiceDeps,
    jwt: Annotated[str | None, Cookie()] = None,
) -> User:
    if jwt is None:
        raise HTTPException(401, "Not authenticated")

    user_id = decode_access_token(jwt)
    if user_id is None:
        raise HTTPException(401, "Invalid token")

    user = await service.get_user(user_id)
    if user is None:
        raise HTTPException(401, "User not found")

    return user


CurrentUserDeps = Annotated[User, Depends(get_current_user)]
