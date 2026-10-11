
import pytest
from datetime import datetime
from decimal import Decimal
from unittest.mock import AsyncMock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.assigned_task.routes import router
from app.assigned_task.schema import (
    CreateAssignedTaskRequest,
    CreateAssignedTaskResponse,
    AddHoursToAssignedTaskRequest,
    AddHoursToAssignedTaskResponse,
    OwnerChangeAssigneeHoursRequest,
    OwnerChangeAssigneeHoursResponse,
    RemoveUserFromTaskRequest,
    RemoveUserFromTaskResponse,
    ReassignedUserTaskRequest,
    ReassignedUserTaskResponse,
    ExecutorOut,
    ExecutorListOut,
    TaskShortOut,
    AssignedTaskOut,
)
from app.assigned_task.service import get_assigned_tasks_service
from app.user.current_user import get_current_user


# ---------- Фикстуры ----------
@pytest.fixture
def mock_service():
    service = AsyncMock()
    return service


@pytest.fixture
def mock_current_user():
    user = AsyncMock()
    user.tenant_id = 1
    user.id = 100
    return user


@pytest.fixture
def client(mock_service, mock_current_user):
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_assigned_tasks_service] = lambda: mock_service
    app.dependency_overrides[get_current_user] = lambda: mock_current_user
    return TestClient(app)


# ---------- Тесты схем ----------
class TestSchemas:
    def test_create_assigned_task_request(self):
        data = {
            "task_id": 1,
            "user_id": 2,
            "role_in_task": "executor",
            "assigned_at": "2023-01-01T00:00:00",
            "hours": 10,
            "planned": 5,
            "hourly_rate": 100,
        }
        req = CreateAssignedTaskRequest(**data)
        assert req.task_id == 1
        assert req.user_id == 2
        assert req.role_in_task == "executor"
        assert req.hours == 10
        assert req.planned == 5
        assert req.hourly_rate == 100

        # Опциональные поля
        req2 = CreateAssignedTaskRequest(
            task_id=1,
            user_id=2,
            role_in_task="executor",
            assigned_at=datetime.now(),
        )
        assert req2.hours is None
        assert req2.planned is None
        assert req2.hourly_rate is None

    def test_add_hours_request_validation(self):
        # Валидный
        req = AddHoursToAssignedTaskRequest(
            id=1, task_id=10, user_id=2, today_hours_to_add=Decimal("2.5")
        )
        assert req.today_hours_to_add == Decimal("2.5")

        # Отрицательное значение должно вызвать ошибку
        with pytest.raises(ValueError):
            AddHoursToAssignedTaskRequest(
                id=1, task_id=10, user_id=2, today_hours_to_add=Decimal("-1")
            )

    def test_owner_change_assignee_hours_request(self):
        req = OwnerChangeAssigneeHoursRequest(
            id=1, hours=8, planned=4, task_id=10, user_id=2
        )
        assert req.hours == 8
        assert req.planned == 4
        assert req.task_id == 10
        assert req.user_id == 2

        # planned опционально
        req2 = OwnerChangeAssigneeHoursRequest(
            id=1, hours=8, task_id=10, user_id=2
        )
        assert req2.planned is None

    def test_remove_user_from_task_request(self):
        req = RemoveUserFromTaskRequest(
            task_id=10, user_id=2, remove_reason="no longer needed"
        )
        assert req.task_id == 10
        assert req.user_id == 2
        assert req.remove_reason == "no longer needed"

        req2 = RemoveUserFromTaskRequest(task_id=10, user_id=2)
        assert req2.remove_reason is None

    def test_reassigned_user_task_request(self):
        req = ReassignedUserTaskRequest(
            task_id=10, user_id=2, reassigned_reason="returning"
        )
        assert req.task_id == 10
        assert req.user_id == 2
        assert req.reassigned_reason == "returning"

        req2 = ReassignedUserTaskRequest(task_id=10, user_id=2)
        assert req2.reassigned_reason is None

    def test_executor_out(self):
        data = {"id": 1, "name": "John", "login": "jdoe"}
        executor = ExecutorOut(**data)
        assert executor.id == 1
        assert executor.name == "John"
        assert executor.login == "jdoe"

        # from_attributes (ORM mode)
        class User:
            id = 1
            name = "John"
            login = "jdoe"

        executor_orm = ExecutorOut.model_validate(User())
        assert executor_orm.id == 1

    def test_task_short_out(self):
        data = {
            "id": 1,
            "tenant_id": 1,
            "project_id": 2,
            "title": "Task",
            "description": "Desc",
            "status": "OPEN",
            "priority": "high",
            "due_date": "2023-12-31T23:59:59",
            "estimated_hours": 10.5,
            "actual_hours": 5.0,
            "created_by": 1,
            "created_at": "2023-01-01T00:00:00",
            "tags": [{"id": 1, "tenant_id": 1, "name": "tag1", "description": "tag desc"}],
        }
        task = TaskShortOut(**data)
        assert task.id == 1
        assert task.title == "Task"
        assert task.status == "OPEN"
        assert task.priority == "high"
        assert task.estimated_hours == Decimal("10.5")
        assert len(task.tags) == 1

    def test_assigned_task_out(self):
        data = {
            "id": 1,
            "tenant_id": 1,
            "user_id": 2,
            "task_id": 3,
            "role_in_task": "executor",
            "assigned_at": "2023-01-01T00:00:00",
            "is_active": True,
            "removed": False,
            "remove_reason": None,
            "reassigned_reason": None,
            "hours": 10.0,
            "planned": 5.0,
            "hourly_rate": 100,
            "task": {
                "id": 3,
                "tenant_id": 1,
                "project_id": 2,
                "title": "Task",
                "status": "OPEN",
                "priority": "high",
                "created_by": 1,
                "created_at": "2023-01-01T00:00:00",
            },
        }
        assigned = AssignedTaskOut(**data)
        assert assigned.id == 1
        assert assigned.user_id == 2
        assert assigned.task_id == 3
        assert assigned.hours == Decimal("10.0")
        assert assigned.task.id == 3


# ---------- Тесты маршрутов ----------
class TestRoutes:
    # PUT /v1/assigned/hours/add
    def test_add_hours_to_assigned_task(self, client, mock_service, mock_current_user):
        # Мокаем возвращаемое значение assigned_task
        mock_assigned_task = AsyncMock()
        mock_assigned_task.id = 1
        mock_assigned_task.user_id = 2
        mock_assigned_task.hours = 10
        mock_assigned_task.planned = 5

        mock_service.add_hours_to_task.return_value = mock_assigned_task
        mock_service.get_user_hourly_rate.return_value = 100
        mock_service.get_all_hours.return_value = 50
        mock_service.get_all_planned_hours.return_value = 40

        payload = {
            "id": 1,
            "task_id": 10,
            "user_id": 2,
            "today_hours_to_add": "2.5",
        }
        response = client.put("/v1/assigned/hours/add", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data == {
            "id": 1,
            "hourly_rate": 100,
            "user_id": 2,
            "user_hours": 10,
            "user_planned": 5,
            "all_hours": 50,
            "all_planned": 40,
        }

        # Проверка вызовов сервиса
        mock_service.add_hours_to_task.assert_awaited_once()
        args, kwargs = mock_service.add_hours_to_task.call_args
        assert args[0] == mock_current_user.tenant_id
        assert isinstance(args[1], AddHoursToAssignedTaskRequest)
        assert args[1].id == 1
        assert args[1].today_hours_to_add == Decimal("2.5")

        mock_service.get_user_hourly_rate.assert_awaited_once_with(
            10, 2, mock_current_user.tenant_id
        )
        mock_service.get_all_hours.assert_awaited_once_with(
            mock_assigned_task.id, tenant_id=mock_current_user.tenant_id
        )
        mock_service.get_all_planned_hours.assert_awaited_once_with(
            mock_assigned_task.id, tenant_id=mock_current_user.tenant_id
        )

    def test_add_hours_validation_error(self, client):
        # today_hours_to_add отрицательный -> 422
        payload = {
            "id": 1,
            "task_id": 10,
            "user_id": 2,
            "today_hours_to_add": "-1",
        }
        response = client.put("/v1/assigned/hours/add", json=payload)
        assert response.status_code == 422

    # PUT /v1/assigned/admin/hours/change
    def test_change_hours_to_assigned_task(self, client, mock_service, mock_current_user):
        mock_assigned_task = AsyncMock()
        mock_assigned_task.id = 1
        mock_assigned_task.user_id = 2
        mock_assigned_task.hours = 8
        mock_assigned_task.planned = 4

        mock_service.change_hours_to_task.return_value = mock_assigned_task
        mock_service.get_user_hourly_rate.return_value = 100
        mock_service.get_all_hours.return_value = 40
        mock_service.get_all_planned_hours.return_value = 20

        payload = {
            "id": 1,
            "hours": 8,
            "planned": 4,
            "task_id": 10,
            "user_id": 2,
        }
        response = client.put("/v1/assigned/admin/hours/change", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data == {
            "id": 1,
            "hourly_rate": 100,
            "user_id": 2,
            "user_hours": 8,
            "user_planned": 4,
            "all_hours": 40,
            "all_planned": 20,
        }

        mock_service.change_hours_to_task.assert_awaited_once()
        args, kwargs = mock_service.change_hours_to_task.call_args
        assert args[0] == mock_current_user.tenant_id
        assert isinstance(args[1], OwnerChangeAssigneeHoursRequest)
        assert args[1].hours == 8
        assert args[1].planned == 4

    # POST /v1/assigned/create
    def test_create_assigned_task(self, client, mock_service, mock_current_user):
        mock_service.create_assigned_task.return_value = 123

        payload = {
            "task_id": 1,
            "user_id": 2,
            "role_in_task": "executor",
            "assigned_at": "2023-01-01T00:00:00",
            "hours": 10,
            "planned": 5,
            "hourly_rate": 100,
        }
        response = client.post("/v1/assigned/create", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data == {"id": 123}

        mock_service.create_assigned_task.assert_awaited_once_with(
            user_id=mock_current_user.id,
            tenant_id=mock_current_user.tenant_id,
            dto=CreateAssignedTaskRequest(**payload),
        )

    def test_create_assigned_task_validation(self, client):
        # Отсутствует обязательное поле role_in_task
        payload = {
            "task_id": 1,
            "user_id": 2,
            "assigned_at": "2023-01-01T00:00:00",
        }
        response = client.post("/v1/assigned/create", json=payload)
        assert response.status_code == 422

    # POST /v1/assigned/remove
    def test_remove_user_from_task(self, client, mock_service, mock_current_user):
        mock_assigned_task = AsyncMock()
        mock_assigned_task.id = 1
        mock_assigned_task.user_id = 2
        mock_assigned_task.task_id = 10

        mock_service.remove_user_from_task.return_value = mock_assigned_task

        payload = {"task_id": 10, "user_id": 2, "remove_reason": "done"}
        response = client.post("/v1/assigned/remove", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data == {"id": 1, "user_id": 2, "task_id": 10}

        mock_service.remove_user_from_task.assert_awaited_once_with(
            tenant_id=mock_current_user.tenant_id,
            dto=RemoveUserFromTaskRequest(**payload),
        )

    # POST /v1/assigned/reassign
    def test_reassign_user_to_task(self, client, mock_service, mock_current_user):
        mock_assigned_task = AsyncMock()
        mock_assigned_task.id = 1
        mock_assigned_task.user_id = 2
        mock_assigned_task.task_id = 10

        mock_service.reassign_user_to_task.return_value = mock_assigned_task

        payload = {"task_id": 10, "user_id": 2, "reassigned_reason": "return"}
        response = client.post("/v1/assigned/reassign", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data == {"id": 1, "user_id": 2, "task_id": 10}

        mock_service.reassign_user_to_task.assert_awaited_once_with(
            tenant_id=mock_current_user.tenant_id,
            dto=ReassignedUserTaskRequest(**payload),
        )

    # GET /v1/assigned/executors
    def test_get_executors(self, client, mock_service, mock_current_user):
        # Мокаем список пользователей (ORM-объекты)
        user1 = AsyncMock()
        user1.id = 1
        user1.name = "Alice"
        user1.login = "alice"

        user2 = AsyncMock()
        user2.id = 2
        user2.name = "Bob"
        user2.login = "bob"

        mock_service.get_executors.return_value = [user1, user2]

        response = client.get("/v1/assigned/executors?only_active=true")
        assert response.status_code == 200
        data = response.json()
        assert data == {
            "items": [
                {"id": 1, "name": "Alice", "login": "alice"},
                {"id": 2, "name": "Bob", "login": "bob"},
            ]
        }

        mock_service.get_executors.assert_awaited_once_with(
            mock_current_user.tenant_id, only_active=True
        )

    def test_get_executors_only_active_false(self, client, mock_service, mock_current_user):
        mock_service.get_executors.return_value = []
        response = client.get("/v1/assigned/executors?only_active=false")
        assert response.status_code == 200
        data = response.json()
        assert data == {"items": []}
        mock_service.get_executors.assert_awaited_once_with(
            mock_current_user.tenant_id, only_active=False
        )
