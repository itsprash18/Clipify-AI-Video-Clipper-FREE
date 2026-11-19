import pytest
from app import app

ENDPOINTS = [
    ("/", "GET"),
    ("/narrate", "GET"),
    ("/live", "GET"),
    ("/api/health", "GET"),
    ("/api/diagnostic", "GET"),
    ("/api/projects", "GET"),
    ("/api/fonts", "GET"),
    ("/api/models", "GET"),
    ("/api/live/status", "GET"),
    ("/api/narrate/voices", "GET"),
    ("/api/narrate/videos", "GET"),
]

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

@pytest.mark.parametrize("path,method", ENDPOINTS)
def test_live_server_endpoint(client, path, method):
    if method == "GET":
        resp = client.get(path)
    elif method == "POST":
        resp = client.post(path)
    assert resp.status_code == 200
    assert len(resp.data) > 0
