import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_status_endpoint():
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    assert "providers" in response.json()

def test_agents_list():
    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    data = response.json()
    assert "agents" in data
    assert "summary" in data

def test_swarms_list():
    response = client.get("/api/v1/swarms")
    assert response.status_code == 200
    data = response.json()
    assert "swarms" in data
