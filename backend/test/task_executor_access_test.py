from asyncio import run
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, Mock

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, func, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.executor.models import Executor
from app.executor.repository import ExecutorRepository
from app.executor.routes import router as executor_router
from app.executor.schema import CreateExecutorRequest
from app.executor.service import ExecutorService
from app.github_label.models import GithubLabel, task_github_label
from app.github_label.repository import GithubLabelRepo
from app.project.models import Project
from app.shared.db import Base, get_session
from app.task.models import Status, Task
from app.task.repository import TaskRepository
from app.task.routes import router as task_router
from app.task.schemas.create_task import CreateTaskRequest
from app.task.service import TaskService
from app.tenant.models import Tenant
from app.user.current_user import get_current_user
from app.user.models import TenantRole, User
from app.user.repository import UserRepository


@compiles(JSONB, "sqlite")
def compile_jsonb_for_sqlite(element, compiler, **kwargs):
    return "JSON"


def async_session_adapter(session):
    adapter = Mock(wraps=session)
    for method in ("execute", "scalar", "scalars", "get", "flush", "commit", "refresh", "rollback"):
        setattr(adapter, method, AsyncMock(wraps=getattr(session, method)))
    @asynccontextmanager
    async def begin_nested():
        with session.begin_nested():
            yield

    adapter.begin_nested = begin_nested
    return adapter


@pytest.fixture
def api():
    engine = create_engine(
        "sqlite://",
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(engine)
    with Session(engine, expire_on_commit=False) as session:
        session.add_all(
            [Tenant(name="One", slug="one"), Tenant(name="Two", slug="two")]
        )
        for user_id, tenant_id, role in [
            (1, 1, TenantRole.OWNER),
            (2, 1, TenantRole.CLIENT),
            (3, 1, TenantRole.CLIENT),
            (4, 1, TenantRole.TEAM),
            (5, 1, TenantRole.TEAM),
            (6, 2, TenantRole.OWNER),
        ]:
            user = User(
                login=f"user{user_id}",
                tenant_id=tenant_id,
                role=role,
                name=f"User {user_id}",
                email=f"user{user_id}@example.com",
                password_hash="unused",
            )
            user.id = user_id
            session.add(user)
        session.add_all(
            [
                Project(id=1, tenant_id=1, client_id=2, name="Client 2"),
                Project(id=2, tenant_id=1, client_id=3, name="Client 3"),
                Project(id=3, tenant_id=2, name="Other tenant"),
                Project(id=4, tenant_id=1, name="Unlinked project"),
            ]
        )
        for task_id, project_id, tenant_id in [
            (1, 1, 1),
            (2, 1, 1),
            (3, 2, 1),
            (4, 3, 2),
            (5, None, 1),
            (6, 4, 1),
            (7, 3, 1),
        ]:
            task = Task(
                tenant_id=tenant_id,
                created_by=1 if tenant_id == 1 else 6,
                title=f"Task {task_id}",
                status=Status.OPEN,
                project_id=project_id,
                executors=[],
            )
            task.id = task_id
            task.tags = [GithubLabel(tenant_id=tenant_id, name=f"tag{task_id}")]
            session.add(task)
        for task_id, user_id, tenant_id, active, removed in [
            (1, 4, 1, True, False),
            (1, 5, 1, True, False),
            (2, 4, 1, True, True),
            (3, 4, 1, False, False),
            (4, 6, 2, True, False),
            (7, 4, 1, True, False),
        ]:
            session.add(
                Executor(
                    user_id=user_id,
                    task_id=task_id,
                    tenant_id=tenant_id,
                    role_in_task="executor",
                    is_active=active,
                    removed=removed,
                    hours=1,
                )
            )
        session.commit()

    app = FastAPI()
    app.include_router(task_router)
    app.include_router(executor_router)
    actor = {"id": 1}

    async def database():
        with Session(engine, expire_on_commit=False) as session:
            yield async_session_adapter(session)

    async def current_user():
        with Session(engine) as session:
            return session.get(User, actor["id"])

    app.dependency_overrides[get_session] = database
    app.dependency_overrides[get_current_user] = current_user
    with TestClient(app) as client:
        yield client, actor, engine
    engine.dispose()


@pytest.mark.parametrize(
    ("project_id", "assignee_ids", "error"),
    [
        (3, [5], "Project not found"),
        (1, [5, 6], "Assignee not found"),
        (1, [5], None),
    ],
)
def test_create_task_service_validates_tenant_before_writing(
    api, project_id, assignee_ids, error
):
    _, _, engine = api
    dto = CreateTaskRequest(
        title="New task",
        project_id=project_id,
        executors=[
            {
                "user_id": user_id,
                "login": f"user{user_id}",
                "role_in_task": "executor",
                "is_active": True,
                "hours": 0,
                "planned": 1,
                "hourly_rate": 1,
            }
            for user_id in assignee_ids
        ],
    )
    with Session(engine, expire_on_commit=False) as session:
        adapter = async_session_adapter(session)
        service = TaskService(TaskRepository(adapter), GithubLabelRepo(adapter))
        task_count = session.scalar(select(func.count()).select_from(Task))
        executor_count = session.scalar(select(func.count()).select_from(Executor))
        if error:
            with pytest.raises(HTTPException) as exc:
                run(service.create_task(tenant_id=1, user_id=1, dto=dto))
            assert (exc.value.status_code, exc.value.detail) == (404, error)
            assert session.scalar(select(func.count()).select_from(Task)) == task_count
            assert (
                session.scalar(select(func.count()).select_from(Executor))
                == executor_count
            )
            return
        task_id = run(service.create_task(tenant_id=1, user_id=1, dto=dto)).id

    with Session(engine) as session:
        task = session.get(Task, task_id)
        assert (task.tenant_id, task.project_id) == (1, project_id)
        assert [(e.tenant_id, e.user_id) for e in task.executors] == [(1, 5)]


@pytest.mark.parametrize(
    ("task_id", "login", "error"),
    [
        (4, "user5", "Task not found"),
        (2, "user6", "Assignee not found"),
        (2, "user5", None),
    ],
)
def test_create_executor_service_validates_tenant_before_writing(
    api, task_id, login, error
):
    _, _, engine = api
    dto = CreateExecutorRequest(task_id=task_id, login=login, role_in_task="executor")
    with Session(engine, expire_on_commit=False) as session:
        adapter = async_session_adapter(session)
        service = ExecutorService(ExecutorRepository(adapter), UserRepository(adapter))
        executor_count = session.scalar(select(func.count()).select_from(Executor))
        if error:
            with pytest.raises(HTTPException) as exc:
                run(service.create_executor(tenant_id=1, user_id=1, dto=dto))
            assert (exc.value.status_code, exc.value.detail) == (404, error)
            assert (
                session.scalar(select(func.count()).select_from(Executor))
                == executor_count
            )
            return
        executor, _ = run(service.create_executor(tenant_id=1, user_id=1, dto=dto))
        executor_id = executor.id

    with Session(engine) as session:
        executor = session.get(Executor, executor_id)
        assert (executor.tenant_id, executor.task_id, executor.user_id) == (1, task_id, 5)


@pytest.mark.parametrize(
    ("actor_id", "expected"),
    [
        (1, {1, 2, 3, 5, 6}),
        (2, {1, 2}),
        (3, {3}),
        (4, {1}),
        (6, {4}),
    ],
)
def test_task_list_and_count_share_the_same_scope(api, actor_id, expected):
    client, actor, _ = api
    actor["id"] = actor_id
    response = client.get("/v1/task/all")
    assert response.status_code == 200, response.json()
    assert {item["id"] for item in response.json()["items"]} == expected
    assert client.get("/v1/task/all?limit=1").json()["total"] == len(expected)


def test_team_cannot_expand_scope_with_assignee_filters(api):
    client, actor, _ = api
    actor["id"] = 4
    assert client.get("/v1/task/all?user_ids=6").json()["total"] == 0
    assert client.get("/v1/task/my").json()["total"] == 1
    assignees = client.get("/v1/task/filters/assignees").json()
    assert {assignee["user_id"] for assignee in assignees} == {4, 5}
    assert {tag["name"] for tag in client.get("/v1/task/filters/tags").json()} == {
        "tag1"
    }
    response = client.get("/v1/executor/executors?only_active=false")
    assert response.status_code == 200, response.json()
    assert {item["task_id"] for item in response.json()["items"]} == {1}


@pytest.mark.parametrize(
    ("actor_id", "project_id", "status"),
    [
        (1, None, 201),
        (1, 3, 404),
        (2, 1, 403),
        (4, 1, 201),
        (4, 2, 403),
        (4, None, 403),
    ],
)
def test_create_task_requires_project_access(api, actor_id, project_id, status):
    client, actor, _ = api
    actor["id"] = actor_id
    response = client.post(
        "/v1/task/create", json={"title": "New", "project_id": project_id}
    )
    assert response.status_code == status, response.json()


@pytest.mark.parametrize(
    ("actor_id", "target", "status"),
    [
        (4, 4, 403),
        (1, 2, 404),
        (1, 6, 404),
        (1, 5, 201),
    ],
)
def test_inline_assignments_require_owner_and_same_tenant_assignee(
    api, actor_id, target, status
):
    client, actor, _ = api
    actor["id"] = actor_id
    response = client.post(
        "/v1/task/create",
        json={
            "title": "New",
            "project_id": 1,
            "executors": [
                {
                    "user_id": target,
                    "login": f"user{target}",
                    "role_in_task": "executor",
                    "is_active": True,
                    "hours": 0,
                    "planned": 1,
                    "hourly_rate": 1,
                }
            ],
        },
    )
    assert response.status_code == status, response.json()
    if status != 201:
        actor["id"] = 1
        assert client.get("/v1/task/all").json()["total"] == 5


@pytest.mark.parametrize(
    ("method", "path", "fields"),
    [
        ("POST", "create", {"login": "user4", "role_in_task": "executor"}),
        ("POST", "remove", {"user_id": 4}),
        ("POST", "reassign", {"user_id": 4}),
        ("PUT", "admin/hours/change", {"user_id": 4, "id": 1, "hours": 8}),
    ],
)
@pytest.mark.parametrize(
    ("actor_id", "task_id", "status"),
    [
        (2, 1, 403),
        (4, 1, 403),
        (1, 4, 404),
        (1, 7, 404),
    ],
)
def test_assignment_and_admin_hours_require_owner_of_task_tenant(
    api,
    method,
    path,
    fields,
    actor_id,
    task_id,
    status,
):
    client, actor, _ = api
    actor["id"] = actor_id
    response = client.request(
        method, f"/v1/executor/{path}", json={"task_id": task_id, **fields}
    )
    assert response.status_code == status, response.json()


@pytest.mark.parametrize(
    ("actor_id", "task_id", "user_id", "assignment_id", "status"),
    [
        (2, 1, 2, 1, 403),
        (4, 1, 5, 2, 403),
        (4, 2, 4, 3, 404),
        (4, 3, 4, 4, 404),
        (4, 1, 4, 2, 404),
        (4, 1, 4, 1, 200),
        (1, 1, 5, 2, 200),
        (1, 4, 6, 5, 404),
    ],
)
def test_add_hours_requires_active_assignment_and_permission(
    api,
    actor_id,
    task_id,
    user_id,
    assignment_id,
    status,
):
    client, actor, engine = api
    actor["id"] = actor_id
    response = client.put(
        "/v1/executor/hours/add",
        json={
            "id": assignment_id,
            "task_id": task_id,
            "user_id": user_id,
            "today_hours_to_add": 2,
        },
    )
    assert response.status_code == status, response.json()
    with Session(engine) as session:
        assert session.get(Executor, assignment_id).hours == (3 if status == 200 else 1)


def test_owner_can_manage_assignments_in_own_tenant(api):
    client, _, _ = api
    payload = {"task_id": 2, "role_in_task": "executor"}
    assert (
        client.post(
            "/v1/executor/create",
            json={**payload, "login": "user6"},
        ).status_code
        == 404
    )
    response = client.post("/v1/executor/create", json={**payload, "login": "user5"})
    assert response.status_code == 201, response.json()
    assignment_id = response.json()["id"]

    payload = {"task_id": 2, "user_id": 5}
    response = client.put(
        "/v1/executor/admin/hours/change",
        json={**payload, "id": assignment_id, "hours": 3},
    )
    assert response.status_code == 200, response.json()
    assert float(response.json()["user_hours"]) == 3
    assert client.post("/v1/executor/remove", json=payload).status_code == 200
    assert client.post("/v1/executor/reassign", json=payload).status_code == 200


@pytest.mark.parametrize("failure", ["tag", "executor"])
def test_create_task_rolls_back_late_failure(api, monkeypatch, failure):
    client, _, engine = api
    original_attach = GithubLabelRepo.attach_or_create
    attached = []
    inserted = []

    async def attach(repo, task_id, tenant_id, name, **kwargs):
        if failure == "tag" and attached:
            raise HTTPException(422, "Second tag failed")
        label = await original_attach(repo, task_id, tenant_id, name, **kwargs)
        attached.append(label.id)
        return label

    def insert_executor(mapper, connection, target):
        inserted.append(target.user_id)
        if failure == "executor" and len(inserted) == 2:
            raise HTTPException(422, "Second executor failed")

    monkeypatch.setattr(GithubLabelRepo, "attach_or_create", attach)
    event.listen(Executor, "before_insert", insert_executor)
    tables = [Task, GithubLabel, Executor, task_github_label]
    with Session(engine) as session:
        before = [session.scalar(select(func.count()).select_from(t)) for t in tables]
    try:
        response = client.post(
            "/v1/task/create",
            json={
                "title": "Must be rolled back",
                "tags": [{"name": "new-tag1"}, {"name": "new-tag2"}],
                "executors": [
                    {
                        "user_id": user_id,
                        "login": f"user{user_id}",
                        "role_in_task": "executor",
                        "is_active": True,
                        "hours": 0,
                        "planned": 1,
                        "hourly_rate": 1,
                    }
                    for user_id in [4, 5]
                ],
            },
        )
        assert response.status_code == 422, response.text
        assert len(attached) == (1 if failure == "tag" else 2)
        if failure == "executor":
            assert inserted == [4, 5]
        with Session(engine) as session:
            after = [session.scalar(select(func.count()).select_from(t)) for t in tables]
            assert after == before
    finally:
        event.remove(Executor, "before_insert", insert_executor)


@pytest.mark.parametrize(
    ("actor_id", "task_id", "status"),
    [
        (1, 1, 200), (1, 999, 404), (1, 4, 404), (1, 7, 404),
        (2, 1, 200), (2, 3, 404), (2, 5, 404),
        (4, 1, 200), (4, 2, 404), (4, 3, 404), (4, 7, 404),
        (6, 4, 200), (6, 1, 404),
    ],
)
def test_task_detail_access(api, actor_id, task_id, status):
    client, actor, _ = api
    actor["id"] = actor_id
    response = client.get(f"/v1/task/{task_id}")
    assert response.status_code == status
    if status == 200:
        body = response.json()
        assert body["id"] == task_id
        assert body["tags"]
        assert "executors_actual_hours" in body
        if task_id == 1:
            assert len(body["executors"]) == 2
            assert body["executors_actual_hours"] == "2.00"


def test_task_detail_inactive_user(api):
    client, _, engine = api
    with Session(engine) as session:
        session.get(User, 1).is_active = False
        session.commit()
    assert client.get("/v1/task/1").status_code == 403
