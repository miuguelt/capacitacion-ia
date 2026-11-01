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
    
    expected_views = ['id="inicio"', 'id="dia-1"', 'id="gemini-canvas"', 'id="dia-2"', 'id="dia-3"', 'id="dia-4"', 'id="materiales"']
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

def test_command_palette_elements_exist():
    """Valida la presencia y accesibilidad de la paleta de comandos rápida (Ctrl + K)."""
    index_file = BASE_DIR / "index.html"
    html = index_file.read_text(encoding="utf-8")
    js_file = BASE_DIR / "js" / "app.js"
    js_text = js_file.read_text(encoding="utf-8")
    css_file = BASE_DIR / "css" / "styles.css"
    css_text = css_file.read_text(encoding="utf-8")
    
    assert 'id="btn-open-command-palette"' in html, "Debe existir el botón disparador en el topbar"
    assert 'id="modal-command-palette"' in html, "Debe existir el modal dialog de la paleta"
    assert 'id="cmd-palette-input"' in html, "Debe existir el input de búsqueda de comandos"
    assert 'id="btn-close-cmd-palette"' in html, "Debe existir el botón para cerrar la paleta"
    assert 'id="cmd-palette-results"' in html, "Debe existir el contenedor de resultados"
    assert 'role="dialog"' in html and 'aria-modal="true"' in html
    
    assert "initCommandPalette" in js_text, "app.js debe definir initCommandPalette"
    assert "window.openCommandPalette" in js_text, "app.js debe exponer window.openCommandPalette"
    assert ".command-palette-backdrop" in css_text, "styles.css debe incluir estilos de la paleta"
    assert ".command-item" in css_text, "styles.css debe incluir estilos para los items de comando"

def test_prompt_health_meter_elements_exist():
    """Valida la barra interactiva de salud heurística del prompt R-C-I-R-F."""
    index_file = BASE_DIR / "index.html"
    html = index_file.read_text(encoding="utf-8")
    js_file = BASE_DIR / "js" / "app.js"
    js_text = js_file.read_text(encoding="utf-8")
    
    health_ids = [
        "prompt-health-card",
        "prompt-health-score",
        "prompt-health-fill",
        "prompt-health-tip",
        "req-r",
        "req-c",
        "req-i",
        "req-res",
        "req-f"
    ]
    for hid in health_ids:
        assert f'id="{hid}"' in html, f"El elemento de salud de prompt #{hid} debe existir en el HTML"
        
    assert "updatePromptHealth" in js_text, "app.js debe calcular en caliente la salud del prompt"

def test_dual_mirror_architecture_integrity():
    """Asegura sincronización entre la raíz y la estructura src/."""
    assert (BASE_DIR / "src" / "index.html").exists()
    assert (BASE_DIR / "src" / "styles" / "styles.css").exists()
    assert (BASE_DIR / "src" / "shared" / "app.js").exists()
    
    root_js = (BASE_DIR / "js" / "app.js").read_text(encoding="utf-8")
    src_js = (BASE_DIR / "src" / "shared" / "app.js").read_text(encoding="utf-8")
    assert root_js == src_js, "src/shared/app.js debe ser una réplica exacta de js/app.js"
    
    root_css = (BASE_DIR / "css" / "styles.css").read_text(encoding="utf-8")
    src_css = (BASE_DIR / "src" / "styles" / "styles.css").read_text(encoding="utf-8")
    assert root_css == src_css, "src/styles/styles.css debe ser una réplica exacta de css/styles.css"

