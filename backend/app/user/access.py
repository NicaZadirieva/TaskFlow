from enum import Enum

from app.user.models import TenantRole, User


class Action(str, Enum):
    READ_PROJECTS = "Доступ к чтению проектов"
    CREATE_TASKS = "Создание задач"
    ASSIGN_PEOPLE = "Назначение людей"
    DELETE_USERS = "Удаление пользователей"


ROLE_ACTIONS: dict[TenantRole, list[str]] = {
    TenantRole.OWNER: [
        Action.READ_PROJECTS,
        Action.CREATE_TASKS,
        Action.ASSIGN_PEOPLE,
        Action.DELETE_USERS,
    ],
    TenantRole.CLIENT: [
        Action.READ_PROJECTS,
    ],
    TenantRole.TEAM: [
        Action.READ_PROJECTS,
        Action.CREATE_TASKS,
    ],
}


class UserActionAccess:
    """Класс для управления действиями пользователя"""

    @staticmethod
    def get_all_role_actions(current_user: User):
        return ROLE_ACTIONS.get(current_user.role)
