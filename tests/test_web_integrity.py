"""
Pruebas de integridad de la interfaz web index.html y sus recursos.
"""

from pathlib import Path
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent

def test_index_html_exists():
    index_file = BASE_DIR / "index.html"
    assert index_file.exists(), "index.html debe existir en la raíz"
    
    html = index_file.read_text(encoding="utf-8")
    assert '<html lang="es-CO"' in html, "Debe tener idioma es-CO"
    assert 'id="role-learner"' in html, "Debe tener botón de modo participante"
    assert 'id="role-instructor"' in html, "Debe tener botón de modo facilitador"
    assert 'id="timer-display"' in html, "Debe tener el display del temporizador"

def test_index_html_has_all_page_views():
    index_file = BASE_DIR / "index.html"
    html = index_file.read_text(encoding="utf-8")
    
    expected_views = ['id="inicio"', 'id="dia-1"', 'id="dia-2"', 'id="dia-3"', 'id="dia-4"', 'id="materiales"']
    for v in expected_views:
        assert v in html, f"La vista {v} debe estar presente en el HTML"

def test_prompt_builder_elements_exist():
    index_file = BASE_DIR / "index.html"
    html = index_file.read_text(encoding="utf-8")
    
    assert 'id="prompt-builder-form"' in html
    assert 'id="p-rol"' in html
    assert 'id="p-contexto"' in html
    assert 'id="p-instruccion"' in html
    assert 'id="p-restricciones"' in html
    assert 'id="p-formato"' in html
    assert 'id="generated-prompt-output"' in html

def test_css_and_js_files_exist():
    assert (BASE_DIR / "css" / "styles.css").exists()
    assert (BASE_DIR / "js" / "app.js").exists()
