# test/task/test.py
import pytest
from datetime import datetime
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.task.routes import router

from app.task.schemas.create_task import CreateTaskRequest, CreateTaskResponse
from app.task.schemas.get_filtered_tasks import ExecutorShortOut, SortOrder, TagShortOut, TaskDeadline, TaskFilters, TaskOut, TaskSortBy, TasksOut, get_task_filters
from app.task.service import get_task_service
from app.user.current_user import get_current_user
from app.task.models import Priority, Status


# ---------- Фикстуры ----------
@pytest.fixture
def mock_service():
    return AsyncMock()


@pytest.fixture
def mock_current_user():
    user = MagicMock()
    user.tenant_id = 1
    user.id = 100
    return user


@pytest.fixture
def client(mock_service, mock_current_user):
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_task_service] = lambda: mock_service
    app.dependency_overrides[get_current_user] = lambda: mock_current_user
    # Для фильтров переопределять не нужно — они идут через Query
    return TestClient(app)


# ---------- Тесты схем ----------
class TestSchemas:
    def test_create_task_request_minimal(self):
        req = CreateTaskRequest(title="Task 1")
        assert req.title == "Task 1"
        assert req.status == Status.BACKLOG
        assert req.priority == Priority.MEDIUM
        assert req.project_id is None
        assert req.description is None

    def test_create_task_request_full(self):
        req = CreateTaskRequest(
            project_id=5,
            title="Task",
            description="Desc",
            status=Status.IN_PROGRESS,
            priority=Priority.HIGH,
            due_date=datetime(2025, 1, 1),
            estimated_budget=Decimal("1000.50"),
            actual_budget=Decimal("500.25"),
            estimated_hours=Decimal("10.00"),
            actual_hours=Decimal("5.50"),
            note={"key": "value"},
            task_images=["a.png", "b.png"],
        )
        assert req.project_id == 5
        assert req.status == Status.IN_PROGRESS
        assert req.priority == Priority.HIGH
        assert req.estimated_budget == Decimal("1000.50")
        assert req.note == {"key": "value"}
        assert req.task_images == ["a.png", "b.png"]

    def test_create_task_request_title_validation(self):
        # Пустой title — ошибка
        with pytest.raises(ValueError):
            CreateTaskRequest(title="")
        # Слишком длинный title — ошибка
        with pytest.raises(ValueError):
            CreateTaskRequest(title="a" * 201)

    def test_create_task_request_negative_values(self):
        with pytest.raises(ValueError):
            CreateTaskRequest(title="t", estimated_budget=Decimal("-1"))
        with pytest.raises(ValueError):
            CreateTaskRequest(title="t", estimated_hours=Decimal("-1"))

    def test_create_task_response_from_attributes(self):
        class Task:
            id = 1
            tenant_id = 2

        resp = CreateTaskResponse.model_validate(Task())
        assert resp.id == 1
        assert resp.tenant_id == 2

    def test_task_filters_defaults(self):
        f = TaskFilters()
        assert f.limit == 100
        assert f.offset == 0
        assert f.sort_by == TaskSortBy.created_at
        assert f.sort_order == SortOrder.desc
        assert f.tag_ids is None
        assert f.priority is None
        assert f.status is None
        assert f.deadline is None

    def test_get_task_filters_returns_model(self):
        import asyncio

        result = asyncio.run(
            get_task_filters(
                limit=10,
                offset=5,
                sort_by=TaskSortBy.due_date,
                sort_order=SortOrder.asc,
                tag_ids=[1, 2],
                priority=[Priority.HIGH],
                status=[Status.OPEN],
                deadline=[TaskDeadline.overdue],
            )
        )
        assert isinstance(result, TaskFilters)
        assert result.limit == 10
        assert result.offset == 5
        assert result.sort_by == TaskSortBy.due_date
        assert result.sort_order == SortOrder.asc
        assert result.tag_ids == [1, 2]
        assert result.priority == [Priority.HIGH]
        assert result.status == [Status.OPEN]
        assert result.deadline == [TaskDeadline.overdue]

    def test_executor_short_out_from_attributes(self):
        # Эмулируем ORM-объект с вложенным user
        user = MagicMock()
        user.name = "Alice"
        user.login = "alice"

        executor = MagicMock()
        executor.id = 1
        executor.user_id = 42
        executor.user = user
        executor.role_in_task = "executor"
        executor.is_active = True
        executor.removed = False
        executor.hours = 10.0
        executor.planned = 5.0
        executor.hourly_rate = 100
        executor.remove_reason = None
        executor.reassigned_reason = None

        out = ExecutorShortOut.model_validate(executor)
        assert out.id == 1
        assert out.user_id == 42
        assert out.name == "Alice"
        assert out.login == "alice"
        assert out.hours == 10.0
        assert out.hourly_rate == 100

    def test_task_out_with_executors_alias(self):
        # Проверяем, что executors берётся из assignees
        class Tag:
            id = 1
            tenant_id = 1
            name = "tag1"
            description = None

        class Task:
            id = 1
            tenant_id = 1
            project_id = None
            title = "Task"
            description = None
            status = Status.OPEN
            priority = Priority.HIGH
            due_date = None
            created_at = datetime(2025, 1, 1)
            created_by = 1
            estimated_budget = None
            actual_budget = None
            estimated_hours = None
            actual_hours = None
            note = None
            task_images = None
            tags = [Tag()]
            assignees = []

        out = TaskOut.model_validate(Task())
        assert out.id == 1
        assert out.title == "Task"
        assert out.executors == []
        assert len(out.tags) == 1

    def test_tasks_out(self):
        out = TasksOut(items=[], total=0, limit=100, offset=0)
        assert out.items == []
        assert out.total == 0


# ---------- Тесты маршрутов ----------
class TestCreateTask:
    def test_create_task_success(self, client, mock_service, mock_current_user):
        task = MagicMock()
        task.id = 7
        task.tenant_id = 1
        mock_service.create_task.return_value = task

        payload = {"title": "New task"}
        response = client.post("/v1/task/create", json=payload)
        assert response.status_code == 201
        assert response.json() == {"id": 7, "tenant_id": 1}

        mock_service.create_task.assert_awaited_once()
        kwargs = mock_service.create_task.call_args.kwargs
        assert kwargs["tenant_id"] == mock_current_user.tenant_id
        assert kwargs["user_id"] == mock_current_user.id
        assert isinstance(kwargs["dto"], CreateTaskRequest)
        assert kwargs["dto"].title == "New task"

    def test_create_task_full_payload(self, client, mock_service):
        task = MagicMock(id=1, tenant_id=1)
        mock_service.create_task.return_value = task

        payload = {
            "project_id": 5,
            "title": "Task",
            "description": "Desc",
            "status": "IN_PROGRESS",
            "priority": "high",
            "due_date": "2025-01-01T00:00:00",
            "estimated_budget": "1000.50",
            "actual_budget": "500.25",
            "estimated_hours": "10.00",
            "actual_hours": "5.50",
            "note": {"k": "v"},
            "task_images": ["a.png"],
        }
        response = client.post("/v1/task/create", json=payload)
        assert response.status_code == 201

        dto = mock_service.create_task.call_args.kwargs["dto"]
        assert dto.project_id == 5
        assert dto.status == Status.IN_PROGRESS
        assert dto.priority == Priority.HIGH
        assert dto.estimated_budget == Decimal("1000.50")
        assert dto.note == {"k": "v"}

    def test_create_task_missing_title(self, client):
        response = client.post("/v1/task/create", json={})
        assert response.status_code == 422

    def test_create_task_empty_title(self, client):
        response = client.post("/v1/task/create", json={"title": ""})
        assert response.status_code == 422

    def test_create_task_negative_budget(self, client):
        response = client.post(
            "/v1/task/create",
            json={"title": "t", "estimated_budget": "-1"},
        )
        assert response.status_code == 422


class TestListMyTasks:
    def test_list_my_tasks_success(self, client, mock_service, mock_current_user):
        mock_service.list_my_tasks.return_value = TasksOut(
            items=[], total=0, limit=100, offset=0
        )

        response = client.get("/v1/task/my")
        assert response.status_code == 200
        assert response.json() == {
            "items": [],
            "total": 0,
            "limit": 100,
            "offset": 0,
        }

        mock_service.list_my_tasks.assert_awaited_once()
        kwargs = mock_service.list_my_tasks.call_args.kwargs
        assert kwargs["tenant_id"] == mock_current_user.tenant_id
        assert kwargs["user_id"] == mock_current_user.id
        assert isinstance(kwargs["filters"], TaskFilters)

    def test_list_my_tasks_with_filters(self, client, mock_service):
        mock_service.list_my_tasks.return_value = TasksOut(
            items=[], total=0, limit=10, offset=5
        )
        response = client.get(
            "/v1/task/my",
            params={
                "limit": 10,
                "offset": 5,
                "sort_by": "due_date",
                "sort_order": "asc",
                "priority": "high,critical",
                "status": "OPEN,IN_PROGRESS",
                "tag_ids": "1,2,3",
                "deadline": "overdue,today",
            },
        )
        assert response.status_code == 200

        filters = mock_service.list_my_tasks.call_args.kwargs["filters"]
        assert filters.limit == 10
        assert filters.offset == 5
        assert filters.sort_by == TaskSortBy.due_date
        assert filters.sort_order == SortOrder.asc
        assert filters.priority == [Priority.HIGH, Priority.CRITICAL]
        assert filters.status == [Status.OPEN, Status.IN_PROGRESS]
        assert filters.tag_ids == [1, 2, 3]
        assert filters.deadline == [TaskDeadline.overdue, TaskDeadline.today]

    def test_list_my_tasks_invalid_limit(self, client):
        response = client.get("/v1/task/my?limit=0")
        assert response.status_code == 422

    def test_list_my_tasks_invalid_sort_by(self, client):
        response = client.get("/v1/task/my?sort_by=unknown")
        assert response.status_code == 422

    def test_list_my_tasks_invalid_priority(self, client):
        response = client.get("/v1/task/my?priority=unknown")
        assert response.status_code == 422


class TestListAllTasks:
    def test_list_all_tasks_success(self, client, mock_service, mock_current_user):
        mock_service.list_tasks.return_value = TasksOut(
            items=[], total=0, limit=100, offset=0
        )
        response = client.get("/v1/task/all")
        assert response.status_code == 200

        mock_service.list_tasks.assert_awaited_once()
        kwargs = mock_service.list_tasks.call_args.kwargs
        assert kwargs["tenant_id"] == mock_current_user.tenant_id
        assert isinstance(kwargs["filters"], TaskFilters)
        assert kwargs["user_ids"] is None

    def test_list_all_tasks_with_user_ids(self, client, mock_service):
        mock_service.list_tasks.return_value = TasksOut(
            items=[], total=0, limit=100, offset=0
        )
        response = client.get("/v1/task/all?user_ids=1,2,3")
        assert response.status_code == 200
        assert mock_service.list_tasks.call_args.kwargs["user_ids"] == [
            1, 2, 3]

    def test_list_all_tasks_with_filters(self, client, mock_service):
        mock_service.list_tasks.return_value = TasksOut(
            items=[], total=0, limit=50, offset=0
        )
        response = client.get(
            "/v1/task/all",
            params={
                "limit": 50,
                "status": "DONE",
                "user_ids": "10,20",
            },
        )
        assert response.status_code == 200

        kwargs = mock_service.list_tasks.call_args.kwargs
        assert kwargs["filters"].limit == 50
        assert kwargs["filters"].status == [Status.DONE]
        assert kwargs["user_ids"] == [10, 20]

    def test_list_all_tasks_response_serialization(self, client, mock_service):
        # Проверяем, что TaskOut корректно сериализуется
        tag = TagShortOut(id=1, tenant_id=1, name="tag", description=None)
        exec_user = MagicMock()
        exec_user.name = "Alice"
        exec_user.login = "alice"

        executor = MagicMock()
        executor.id = 1
        executor.user_id = 42
        executor.user = exec_user
        executor.role_in_task = "executor"
        executor.is_active = True
        executor.removed = False
        executor.hours = 10.0
        executor.planned = 5.0
        executor.hourly_rate = 100
        executor.remove_reason = None
        executor.reassigned_reason = None

        task_out = TaskOut(
            id=1,
            tenant_id=1,
            title="Task",
            status=Status.OPEN,
            priority=Priority.HIGH,
            created_at=datetime(2025, 1, 1),
            created_by=1,
            tags=[tag],
            assignees=[ExecutorShortOut.model_validate(executor)]
        )
        mock_service.list_tasks.return_value = TasksOut(
            items=[task_out], total=1, limit=100, offset=0
        )

        response = client.get("/v1/task/all")
        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 1
        assert body["items"][0]["id"] == 1
        assert body["items"][0]["executors"][0]["name"] == "Alice"
        assert body["items"][0]["tags"][0]["name"] == "tag"
