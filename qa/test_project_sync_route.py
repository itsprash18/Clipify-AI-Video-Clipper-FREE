import json
import pytest
from app import app, _safe_job_directory

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_project_sync_valid_payload(client, tmp_path):
    payload = {
        "project_id": "test_sync_project_123",
        "title": "Mobile Gaming Clip",
        "source_media": {
            "filename": "gameplay.mp4",
            "path": "/storage/emulated/0/DCIM/gameplay.mp4"
        },
        "highlights": [
            {"start": 10.5, "end": 40.5, "score": 9.2}
        ]
    }
    response = client.post("/api/projects/sync", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["ok"] is True
    assert data["project_id"] == "test_sync_project_123"

    # Cleanup synced test job dir if created
    job_dir = _safe_job_directory("test_sync_project_123")
    if job_dir and job_dir.exists():
        import shutil
        shutil.rmtree(job_dir, ignore_errors=True)

def test_project_sync_generated_id(client):
    payload = {
        "title": "Untitled Mobile Short"
    }
    response = client.post("/api/projects/sync", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["ok"] is True
    assert "sync_" in data["project_id"]

    # Cleanup
    job_dir = _safe_job_directory(data["project_id"])
    if job_dir and job_dir.exists():
        import shutil
        shutil.rmtree(job_dir, ignore_errors=True)

def test_project_sync_traversal_id_sanitized(client):
    payload = {
        "project_id": "../../../etc/passwd",
        "title": "Traversal Attempt"
    }
    response = client.post("/api/projects/sync", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["ok"] is True
    assert "/" not in data["project_id"]
    assert ".." not in data["project_id"]

    job_dir = _safe_job_directory(data["project_id"])
    if job_dir and job_dir.exists():
        import shutil
        shutil.rmtree(job_dir, ignore_errors=True)

def test_lan_mobile_authority_access(client):
    # Simulate an Android device on LAN (192.168.1.150) accessing the desktop
    from app import APP_PORT
    headers = {"Host": f"192.168.1.100:{APP_PORT}"}
    response = client.get("/api/health", headers=headers)
    assert response.status_code == 200
    assert response.get_json()["ok"] is True

def test_public_domain_authority_rejected(client):
    # Simulate an attacker trying DNS-rebinding via evil.com
    from app import APP_PORT
    headers = {"Host": f"evil-rebind.com:{APP_PORT}"}
    response = client.get("/api/health", headers=headers)
    assert response.status_code == 400
    assert "error" in response.get_json()
