"""
Pruebas del manifiesto curricular y registro de entregables de capacitacion-ia.
"""

import json
from pathlib import Path
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent

def test_guide_manifest_structure():
    manifest_file = BASE_DIR / "guide.manifest.json"
    assert manifest_file.exists(), "guide.manifest.json debe existir"
    
    data = json.loads(manifest_file.read_text(encoding="utf-8"))
    assert data["standard"]["id"] == "devbrain.educational-guide"
    assert data["guide"]["id"] == "capacitacion-ia-intensiva-4d"
    assert data["guide"]["format"] == "web"
    assert data["guide"]["language"] == "es-CO"
    assert len(data["modules"]) == 4, "Debe contener exactamente 4 módulos (uno por día)"

def test_deliverables_registry_structure():
    reg_file = BASE_DIR / "deliverables.registry.json"
    assert reg_file.exists(), "deliverables.registry.json debe existir"
    
    data = json.loads(reg_file.read_text(encoding="utf-8"))
    entregables = data.get("deliverables", [])
    assert len(entregables) == 4, "Debe haber 4 entregables registrados (uno por día)"
    
    ids = [e["id"] for e in entregables]
    assert "evidencia-dia-1" in ids
    assert "evidencia-dia-2" in ids
    assert "evidencia-dia-3" in ids
    assert "evidencia-dia-4" in ids
