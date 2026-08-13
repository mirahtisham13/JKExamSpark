import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "email": "new@test.com",
        "username": "newuser",
        "password": "password123",
        "full_name": "New User",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@test.com"
    assert data["role"] == "student"  # Always student


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, test_student):
    response = await client.post("/api/v1/auth/register", json={
        "email": "student@test.com",  # Already exists
        "username": "differentuser",
        "password": "password123",
        "full_name": "Another User",
    })
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_register_duplicate_username(client: AsyncClient, test_student):
    response = await client.post("/api/v1/auth/register", json={
        "email": "different@test.com",
        "username": "teststudent",  # Already exists
        "password": "password123",
        "full_name": "Another User",
    })
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "email": "weak@test.com",
        "username": "weakuser",
        "password": "short",  # < 8 chars
        "full_name": "Weak User",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_student):
    response = await client.post("/api/v1/auth/login", json={
        "email": "student@test.com",
        "password": "testpass123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, test_student):
    response = await client.post("/api/v1/auth/login", json={
        "email": "student@test.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "email": "nobody@test.com",
        "password": "anypassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, test_student):
    login = await client.post("/api/v1/auth/login", json={
        "email": "student@test.com",
        "password": "testpass123",
    })
    refresh_token = login.json()["refresh_token"]

    response = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_logout_revokes_token(client: AsyncClient, test_student):
    login = await client.post("/api/v1/auth/login", json={
        "email": "student@test.com",
        "password": "testpass123",
    })
    refresh_token = login.json()["refresh_token"]

    logout = await client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
    assert logout.status_code == 200

    # Refresh should now fail
    refresh = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh.status_code == 401


@pytest.mark.asyncio
async def test_access_protected_without_token(client: AsyncClient):
    response = await client.get("/api/v1/users/profile")
    assert response.status_code == 403  # No auth header


@pytest.mark.asyncio
async def test_register_role_always_student(client: AsyncClient):
    """Registration must always create student role, never admin."""
    response = await client.post("/api/v1/auth/register", json={
        "email": "tryadmin@test.com",
        "username": "tryadmin",
        "password": "password123",
        "full_name": "Try Admin",
    })
    assert response.status_code == 201
    assert response.json()["role"] == "student"
