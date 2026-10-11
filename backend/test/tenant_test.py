import pytest
from unittest.mock import AsyncMock, MagicMock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.tenant.routes import router
from app.tenant.schemas import (
    CreateTenantRequest,
    CreateTenantResponse,
    GetTenantResponse,
)
from app.tenant.service import get_tenant_service  # ← проверьте имя


# ---------- Фикстуры ----------
@pytest.fixture
def mock_service():
    return AsyncMock()


@pytest.fixture
def client(mock_service):
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_tenant_service] = lambda: mock_service
    return TestClient(app)


# ---------- Тесты схем ----------
class TestSchemas:
    def test_create_tenant_request(self):
        req = CreateTenantRequest(name="Acme", slug="acme")
        assert req.name == "Acme"
        assert req.slug == "acme"

    def test_create_tenant_request_requires_fields(self):
        with pytest.raises(ValueError):
            CreateTenantRequest(name="Acme")
        with pytest.raises(ValueError):
            CreateTenantRequest(slug="acme")
        with pytest.raises(ValueError):
            CreateTenantRequest()

    def test_create_tenant_response(self):
        resp = CreateTenantResponse(tenant_id=42)
        assert resp.tenant_id == 42
        assert resp.model_dump() == {"tenant_id": 42}

    def test_get_tenant_response(self):
        resp = GetTenantResponse(slug="acme", name="Acme", tenant_id=42)
        assert resp.slug == "acme"
        assert resp.name == "Acme"
        assert resp.tenant_id == 42
        assert resp.model_dump() == {
            "slug": "acme",
            "name": "Acme",
            "tenant_id": 42,
        }


# ---------- Тесты маршрутов ----------
class TestCreateTenant:
    def test_create_tenant_success(self, client, mock_service):
        mock_service.create.return_value = 42

        response = client.post(
            "/v1/tenant/create",
            json={"name": "Acme", "slug": "acme"},
        )
        assert response.status_code == 201, response.json()
        assert response.json() == {"tenant_id": 42}

        mock_service.create.assert_awaited_once()
        dto = mock_service.create.call_args.args[0]
        assert isinstance(dto, CreateTenantRequest)
        assert dto.name == "Acme"
        assert dto.slug == "acme"

    def test_create_tenant_missing_field(self, client):
        response = client.post("/v1/tenant/create", json={"name": "Acme"})
        assert response.status_code == 422

    def test_create_tenant_empty_body(self, client):
        response = client.post("/v1/tenant/create", json={})
        assert response.status_code == 422

    def test_create_tenant_wrong_types(self, client):
        response = client.post(
            "/v1/tenant/create",
            json={"name": 123, "slug": ["a"]},
        )
        assert response.status_code == 422


class TestGetTenantBySlug:
    def test_get_tenant_success(self, client, mock_service):
        tenant = MagicMock()
        tenant.id = 42
        tenant.slug = "acme"
        tenant.name = "Acme Corp"
        mock_service.get_tenant.return_value = tenant

        response = client.get("/v1/tenant/slug", params={"slug": "acme"})
        assert response.status_code == 200, response.json()
        assert response.json() == {
            "slug": "acme",
            "name": "Acme Corp",
            "tenant_id": 42,
        }

        mock_service.get_tenant.assert_awaited_once_with("acme")

    def test_get_tenant_not_found(self, client, mock_service):
        mock_service.get_tenant.return_value = None

        response = client.get("/v1/tenant/slug", params={"slug": "ghost"})
        assert response.status_code == 404
        assert response.json() == {"detail": "Tenant not found"}

        mock_service.get_tenant.assert_awaited_once_with("ghost")

    def test_get_tenant_missing_slug(self, client, mock_service):
        # slug — обязательный query-параметр
        response = client.get("/v1/tenant/slug")
        assert response.status_code == 422
        mock_service.get_tenant.assert_not_awaited()
