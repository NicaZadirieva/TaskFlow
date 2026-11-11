from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.shared import models  # noqa: F401
from app.user.jwt import create_access_token
from app.user.models import TenantRole
from app.user.routes import router
from app.user.service import UserService, get_user_service


@pytest.mark.parametrize("role,active,tenant,status", [
    (TenantRole.OWNER, True, 1, 204),
    (TenantRole.TEAM, True, 1, 403),
    (TenantRole.CLIENT, True, 1, 403),
    (TenantRole.OWNER, False, 1, 403),
    (TenantRole.OWNER, True, 2, 404),
])
def test_update_requires_active_owner_in_same_tenant(role, active, tenant, status):
    repo = AsyncMock()
    actor = SimpleNamespace(id=1, role=role, is_active=active, tenant_id=1)
    target = SimpleNamespace(id=2, tenant_id=tenant)
    repo.get_by_id.side_effect = lambda user_id: actor if user_id == 1 else target
    repo.get_by_email.return_value = None
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_user_service] = lambda: UserService(repo, AsyncMock())
    with TestClient(app) as client:
        client.cookies.set("jwt", create_access_token(1))
        response = client.put("/v1/user/2", json={"name": "Edited", "email": "new@example.com", "role": "CLIENT", "is_active": True, "hourly_rate": 100})
    assert response.status_code == status
    if status == 204:
        assert target.name == "Edited"
        assert target.hourly_rate is None
        repo.save.assert_awaited_once_with(target)
    else:
        repo.save.assert_not_awaited()
