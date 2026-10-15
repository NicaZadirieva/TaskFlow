# app/shared/models.py
"""
Единая точка импорта всех ORM-моделей.
Импортируйте этот модуль один раз при старте приложения —
тогда SQLAlchemy сможет резолвить строковые ссылки в relationship().
"""
from app.executor.models import Executor
from app.tenant.models import Tenant  # noqa: F401
from app.user.models import User  # noqa: F401
from app.project.models import Project  # noqa: F401
from app.task.models import Task  # noqa: F401
from app.github_label.models import GithubLabel

__all__ = ["Tenant", "User", "Project", "Task", "Executor", "GithubLabel"]
