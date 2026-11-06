from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.shared import models  # noqa: F401
from app.user.jwt import create_access_token, decode_access_token
from app.user.models import TenantRole
from app.user.routes import router
from app.user.service import UserService, get_user_service


@pytest.mark.parametrize(
    ("role", "is_active", "target_tenant", "expected_status"),
    [
        (None, True, 1, 401),
        (TenantRole.CLIENT, True, 1, 403),
        (TenantRole.TEAM, True, 1, 403),
        (TenantRole.OWNER, False, 1, 403),
        (TenantRole.OWNER, True, 2, 403),
        (TenantRole.OWNER, True, 1, 201),
    ],
)
def test_user_creation_requires_active_owner_of_target_tenant(
    role, is_active, target_tenant, expected_status,
):
    user_repo = AsyncMock()
    user_repo.get_by_id.return_value = SimpleNamespace(
        role=role, is_active=is_active, tenant_id=1,
    )
    user_repo.get_by_email.return_value = None
    user_repo.save.return_value = SimpleNamespace(id=20)
    service = UserService(user_repo, AsyncMock())
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_user_service] = lambda: service

    with TestClient(app) as client:
        if role is not None:
            client.cookies.set("jwt", create_access_token(10))
        response = client.post(
            "/v1/user/create",
            json={
                "login": "new-user",
                "name": "New User",
                "email": "new@example.com",
                "password": "secret",
                "tenant_id": target_tenant,
                "role": "TEAM" if expected_status == 201 else "OWNER",
            },
        )

    assert response.status_code == expected_status, response.json()
    if expected_status == 201:
        user_repo.save.assert_awaited_once()
        new_user = user_repo.save.call_args.args[0]
        assert new_user.tenant_id == 1
        assert new_user.role == TenantRole.TEAM
        assert decode_access_token(response.json()["jwt"]) == 20
    else:
        user_repo.get_by_email.assert_not_awaited()
        user_repo.save.assert_not_awaited()
