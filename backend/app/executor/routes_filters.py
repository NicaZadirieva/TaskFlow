from typing import Annotated

from fastapi import Depends, HTTPException

from app.user.models import TenantRole
from app.user.current_user import CurrentUserDeps



import logging

logger = logging.getLogger(__name__)


def must_not_be_client(current_user: CurrentUserDeps) -> CurrentUserDeps:
    if current_user.role == TenantRole.CLIENT:
        logger.warning("Access denied for client")
        raise HTTPException(
            status_code=403, detail="Не разрешён доступ клиентам")
    logger.info("Access granted")
    return current_user



MustNotBeClientDeps = Annotated[CurrentUserDeps, Depends(must_not_be_client)]
