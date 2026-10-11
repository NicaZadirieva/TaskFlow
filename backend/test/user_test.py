import pytest
from unittest.mock import AsyncMock, MagicMock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.user.routes import router
from app.user.schemas import (
    CreateUserRequest,
    GetUsersResponse,
    JWTResponse,
    TenantRole,
    UserDto,
    UserLoginRequest,
)
from app.user.service import get_user_service
from app.user.current_user import get_current_user 


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
    app.dependency_overrides[get_user_service] = lambda: mock_service
    app.dependency_overrides[get_current_user] = lambda: mock_current_user
    return TestClient(app)


# ---------- Тесты схем ----------
class TestSchemas:
    def test_tenant_role_values(self):
        assert {r.value for r in TenantRole} == {"OWNER", "CLIENT", "TEAM"}

    def test_create_user_request_minimal(self):
        req = CreateUserRequest(
            login="alice",
            email="a@a.com",
            name="Alice",
            password="secret",
            tenant_id=1,
            role=TenantRole.OWNER,
        )
        assert req.login == "alice"
        assert req.email == "a@a.com"
        assert req.role == TenantRole.OWNER
        assert req.hourly_rate is None
        assert req.is_active is True

    def test_create_user_request_full(self):
        req = CreateUserRequest(
            login="bob",
            email="b@b.com",
            name="Bob",
            password="p",
            tenant_id=2,
            role=TenantRole.TEAM,
            hourly_rate=1500,
            is_active=False,
        )
        assert req.hourly_rate == 1500
        assert req.is_active is False

    @pytest.mark.parametrize(
        "missing",
        ["login", "email", "name", "password", "tenant_id", "role"],
    )
    def test_create_user_request_requires_fields(self, missing):
        base = {
            "login": "x",
            "email": "x@x.com",
            "name": "X",
            "password": "p",
            "tenant_id": 1,
            "role": "OWNER",
        }
        base.pop(missing)
        with pytest.raises(ValueError):
            CreateUserRequest(**base)

    def test_create_user_request_role_as_string(self):
        # Pydantic v2 умеет конвертить значение enum'а в сам enum
        req = CreateUserRequest(
            login="x", email="x@x.com", name="X", password="p",
            tenant_id=1, role="OWNER",
        )
        assert req.role == TenantRole.OWNER

    def test_create_user_request_invalid_role(self):
        with pytest.raises(ValueError):
            CreateUserRequest(
                login="x", email="x@x.com", name="X", password="p",
                tenant_id=1, role="UNKNOWN",
            )

    def test_jwt_response(self):
        r = JWTResponse(jwt="token123")
        assert r.jwt == "token123"
        assert r.model_dump() == {"jwt": "token123"}

    def test_user_login_request(self):
        r = UserLoginRequest(email="a@a.com", password="p")
        assert r.email == "a@a.com"
        assert r.password == "p"

    def test_user_login_request_forbids_extra(self):
        with pytest.raises(ValueError):
            UserLoginRequest(email="a@a.com", password="p", extra="boom")

    def test_user_dto(self):
        dto = UserDto(
            id=1, tenant_id=1, role=TenantRole.CLIENT,
            name="Alice", email="a@a.com",
            is_active=True, hourly_rate=None,
        )
        assert dto.id == 1
        assert dto.role == TenantRole.CLIENT
        assert dto.hourly_rate is None

    def test_get_users_response(self):
        dto = UserDto(
            id=1, tenant_id=1, role=TenantRole.OWNER,
            name="A", email="a@a.com",
            is_active=True, hourly_rate=100,
        )
        out = GetUsersResponse(users=[dto])
        assert len(out.users) == 1
        assert out.users[0].email == "a@a.com"


# ---------- Тесты маршрутов ----------
class TestCreateUser:
    def test_create_user_success(self, client, mock_service):
        mock_service.create.return_value = "jwt-token"

        payload = {
            "login": "alice",
            "email": "a@a.com",
            "name": "Alice",
            "password": "secret",
            "tenant_id": 1,
            "role": "OWNER",
        }
        response = client.post("/v1/user/create", json=payload)
        assert response.status_code == 201, response.json()
        assert response.json() == {"jwt": "jwt-token"}

        mock_service.create.assert_awaited_once()
        dto = mock_service.create.call_args.args[0]
        assert isinstance(dto, CreateUserRequest)
        assert dto.email == "a@a.com"
        assert dto.role == TenantRole.OWNER

    def test_create_user_missing_field(self, client):
        response = client.post(
            "/v1/user/create",
            json={"login": "a", "email": "a@a.com"},
        )
        assert response.status_code == 422

    def test_create_user_invalid_role(self, client):
        response = client.post(
            "/v1/user/create",
            json={
                "login": "a", "email": "a@a.com", "name": "A",
                "password": "p", "tenant_id": 1, "role": "NOPE",
            },
        )
        assert response.status_code == 422


class TestLogin:
    def test_login_success(self, client, mock_service):
        mock_service.authenticate.return_value = "jwt-token"

        response = client.post(
            "/v1/user/login",
            json={"email": "a@a.com", "password": "p"},
        )
        assert response.status_code == 200, response.json()
        assert response.json() == {"jwt": "jwt-token"}

        mock_service.authenticate.assert_awaited_once()
        dto = mock_service.authenticate.call_args.args[0]
        assert isinstance(dto, UserLoginRequest)
        assert dto.email == "a@a.com"

    def test_login_wrong_credentials(self, client, mock_service):
        mock_service.authenticate.return_value = None

        response = client.post(
            "/v1/user/login",
            json={"email": "a@a.com", "password": "bad"},
        )
        assert response.status_code == 401
        assert response.json() == {"detail": "Wrong email or password"}

    def test_login_extra_field_forbidden(self, client, mock_service):
        response = client.post(
            "/v1/user/login",
            json={"email": "a@a.com", "password": "p", "extra": "x"},
        )
        assert response.status_code == 422
        mock_service.authenticate.assert_not_awaited()

    def test_login_missing_password(self, client):
        response = client.post(
            "/v1/user/login",
            json={"email": "a@a.com"},
        )
        assert response.status_code == 422


class TestGetUsers:
    def _make_user(self, **kwargs):
        user = MagicMock()
        user.id = kwargs.get("id", 1)
        user.tenant_id = kwargs.get("tenant_id", 1)
        user.name = kwargs.get("name", "Alice")
        user.email = kwargs.get("email", "a@a.com")
        user.is_active = kwargs.get("is_active", True)
        user.hourly_rate = kwargs.get("hourly_rate", 100)
        # role — ORM-объект со значением .value
        role_enum = MagicMock()
        role_enum.value = kwargs.get("role_value", "OWNER")
        user.role = role_enum
        return user

    def test_get_users_success(self, client, mock_service, mock_current_user):
        mock_service.get_users_by_tenant_id.return_value = [
            self._make_user(id=1, name="Alice",
                            email="a@a.com", role_value="OWNER"),
            self._make_user(id=2, name="Bob", email="b@b.com",
                            role_value="TEAM"),
        ]

        response = client.get("/v1/user/users")
        assert response.status_code == 200, response.json()

        body = response.json()
        assert len(body["users"]) == 2
        assert body["users"][0] == {
            "id": 1,
            "tenant_id": 1,
            "role": "OWNER",
            "name": "Alice",
            "email": "a@a.com",
            "is_active": True,
            "hourly_rate": 100,
        }
        assert body["users"][1]["role"] == "TEAM"
        assert body["users"][1]["name"] == "Bob"

        mock_service.get_users_by_tenant_id.assert_awaited_once_with(
            mock_current_user.tenant_id
        )

    def test_get_users_empty_list_returns_403(
        self, client, mock_service, mock_current_user
    ):
        # В маршруте: `if users:` → пустой список трактуется как «tenant not exists»
        mock_service.get_users_by_tenant_id.return_value = []

        response = client.get("/v1/user/users")
        assert response.status_code == 403
        assert response.json() == {"detail": "Tenant not exists"}

    def test_get_users_none_returns_403(
        self, client, mock_service, mock_current_user
    ):
        mock_service.get_users_by_tenant_id.return_value = None

        response = client.get("/v1/user/users")
        assert response.status_code == 403
        assert response.json() == {"detail": "Tenant not exists"}

    def test_get_users_hourly_rate_none(self, client, mock_service):
        mock_service.get_users_by_tenant_id.return_value = [
            self._make_user(hourly_rate=None)
        ]
        response = client.get("/v1/user/users")
        assert response.status_code == 200
        assert response.json()["users"][0]["hourly_rate"] is None
