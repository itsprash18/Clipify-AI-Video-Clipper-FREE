import requests
import pytest
from clipify.platform.ollama_adapter import get_ollama_adapter

@pytest.fixture(scope="module")
def ollama_service():
    adapter = get_ollama_adapter()
    if not adapter.is_service_running():
        pytest.skip("Local Ollama service not running on http://127.0.0.1:11434")
    return adapter

def test_ollama_service_health_and_version(ollama_service):
    assert ollama_service.is_service_running() is True
    version = ollama_service.get_version()
    assert version is not None
    assert len(version) > 0

def test_ollama_list_models(ollama_service):
    models = ollama_service.list_installed_models()
    assert isinstance(models, list)
    assert len(models) > 0
    names = [m["name"] for m in models]
    print(f"Discovered local models: {names}")

def test_actual_local_inference(ollama_service):
    models = ollama_service.list_installed_models()
    target_model = models[0]["name"]

    payload = {
        "model": target_model,
        "prompt": "Say hello in one word.",
        "stream": False
    }
    r = requests.post(f"{ollama_service.host}/api/generate", json=payload, timeout=30)
    assert r.status_code == 200
    res = r.json()
    assert "response" in res
    assert len(res["response"].strip()) > 0
    print(f"Model {target_model} responded: {res['response'].strip()}")

def test_invalid_model_error_handling(ollama_service):
    # Requesting non-existent model should return 404 cleanly
    payload = {
        "model": "non_existent_fake_model_9999",
        "prompt": "Test",
        "stream": False
    }
    r = requests.post(f"{ollama_service.host}/api/generate", json=payload, timeout=10)
    assert r.status_code == 404 or "error" in r.text.lower()
