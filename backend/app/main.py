import logging

from fastapi import FastAPI

from app.core.settings import Settings
from app.tenant.routes import router as tenant_router
from app.user.routes import router as user_router

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    logger.debug("Запуск")
    settings = Settings()  # type: ignore
    new_app = FastAPI(
        title="TaskFlow",
        description="API для работы приложения трекер задач TaskFlow",
        version="0.0.1",
        openapi_tags=[
            {"name": "Tenant", "description": "Управление тенантами"},
            {"name": "User", "description": "Авторизация пользователя"},
            {"name": "Assigned", "description": "Управление назначенными тасками"},
        ],
    )
    new_app.state.settings = settings

    new_app.include_router(tenant_router)
    new_app.include_router(user_router)
    return new_app


app = create_app()
