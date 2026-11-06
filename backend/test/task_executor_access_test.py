from unittest.mock import AsyncMock, Mock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.executor.models import Executor
from app.executor.routes import router as executor_router
from app.github_label.models import GithubLabel
from app.project.models import Project
from app.shared.db import Base, get_session
from app.task.models import Status, Task
from app.task.routes import router as task_router
from app.tenant.models import Tenant
from app.user.current_user import get_current_user
from app.user.models import TenantRole, User


@compiles(JSONB, "sqlite")
def compile_jsonb_for_sqlite(element, compiler, **kwargs):
    return "JSON"


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
            adapter = Mock(wraps=session)
            for method in (
                "execute",
                "scalar",
                "scalars",
                "get",
                "flush",
                "commit",
                "refresh",
            ):
                setattr(adapter, method, AsyncMock(wraps=getattr(session, method)))
            yield adapter

    async def current_user():
        with Session(engine) as session:
            return session.get(User, actor["id"])

    app.dependency_overrides[get_session] = database
    app.dependency_overrides[get_current_user] = current_user
    with TestClient(app) as client:
        yield client, actor, engine
    engine.dispose()


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
