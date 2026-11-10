from app.project.routes import router
from test.task_executor_access_test import api  # noqa: F401


def test_project_visibility_and_details(api):  # noqa: F811
    client, actor, _ = api
    client.app.include_router(router)
    for user_id, expected in [
        (1, {1, 2, 4}),
        (2, {1}),
        (3, {2}),
        (4, {1}),
        (5, {1}),
        (6, {3}),
    ]:
        actor["id"] = user_id
        response = client.get("/v1/project")
        assert response.status_code == 200
        assert {project["id"] for project in response.json()} == expected
    actor["id"] = 4
    project = client.get("/v1/project/1").json()
    assert [task["id"] for task in project["tasks"]] == [1]
    assert project["progress"] == 0
    assert client.get("/v1/project/2").status_code == 404
    assert client.get("/v1/project/3").status_code == 404


def test_create_project_restricts_roles_and_validates_client(api):  # noqa: F811
    from sqlalchemy.orm import Session

    from app.project.models import Project

    client, actor, engine = api
    client.app.include_router(router)
    for actor_id in (2, 4):
        actor["id"] = actor_id
        assert (
            client.post("/v1/project/create", json={"name": "Denied"}).status_code
            == 403
        )
    actor["id"] = 1
    for client_id in (4, 6, 999):
        assert (
            client.post(
                "/v1/project/create", json={"name": "Invalid", "client_id": client_id}
            ).status_code
            == 404
        )
    assert client.post("/v1/project/create", json={"name": "  "}).status_code == 422
    assert (
        client.post(
            "/v1/project/create", json={"name": "Invalid", "budget_hours": -1}
        ).status_code
        == 422
    )
    response = client.post(
        "/v1/project/create",
        json={
            "name": "  New project  ",
            "description": "Description",
            "client_id": 2,
            "budget_hours": "20.50",
            "deadline": "2026-12-01T00:00:00",
            "tenant_id": 2,
        },
    )
    assert response.status_code == 201
    with Session(engine) as session:
        project = session.get(Project, response.json()["id"])
        assert (project.name, project.tenant_id, project.client_id) == (
            "New project",
            1,
            2,
        )
        assert str(project.budget_hours) == "20.50"

