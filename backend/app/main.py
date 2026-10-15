import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.shared import models  # noqa: F401 — регистрирует все модели в Base.registry

from app.shared.settings import Settings
from app.tenant.routes import router as tenant_router
from app.user.routes import router as user_router
from app.executor.routes import router as executor_router
from app.task.routes import router as tasks_router
from app.github_label.routes import router as github_label_router

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
            {"name": "Executors", "description": "Управление назначенными тасками"},
            {"name": "Tasks", "description": "Управление задачами"},
            {"name": "Tags", "description": "Управление тегами"}
        ],
    )

    # разрешённые источники (домены)
    origins = [
        "http://localhost:3000",  # Next.js фронтенд
        "http://127.0.0.1:3000",   # Альтернативный адрес
    ]

    new_app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        # Разрешить отправку учётных данных (cookies, Authorization)
        allow_credentials=True,
        allow_methods=["*"],      # Разрешить все HTTP-методы
        allow_headers=["*"],       # Разрешить все заголовки
    )
    new_app.state.settings = settings

    new_app.include_router(tenant_router)
    new_app.include_router(user_router)
    new_app.include_router(executor_router)
    new_app.include_router(tasks_router)
    new_app.include_router(github_label_router)

    return new_app


app = create_app()
