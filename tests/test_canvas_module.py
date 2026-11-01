"""
Pruebas automatizadas de integridad del módulo Gemini Canvas Lab, resultados esperados,
sistema de 10 posibilidades, simulador multimodal y Gem Studio.
"""

import json
from pathlib import Path
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent

def test_canvas_view_exists():
    index_file = BASE_DIR / "index.html"
    assert index_file.exists(), "index.html debe existir"
    html = index_file.read_text(encoding="utf-8")
    assert 'id="gemini-canvas"' in html, "La sección #gemini-canvas debe existir en el HTML"
    assert 'data-target="gemini-canvas"' in html, "Debe existir un enlace con data-target='gemini-canvas'"

def test_canvas_simulator_elements():
    index_file = BASE_DIR / "index.html"
    html = index_file.read_text(encoding="utf-8")
    
    required_ids = [
        "canvas-simulator-module",
        "sim-user-prompt",
        "sim-copy-prompt-btn",
        "sim-ai-response",
        "sim-doc-icon",
        "sim-doc-title",
        "sim-quick-actions",
        "sim-result-image",
        "sim-image-caption",
        "sim-interactive-content",
        "sim-insights-content"
    ]
    for element_id in required_ids:
        assert f'id="{element_id}"' in html, f"El elemento #{element_id} debe existir en el HTML"

def test_all_ten_possibilities_tabs_exist():
    index_file = BASE_DIR / "index.html"
    html = index_file.read_text(encoding="utf-8")
    
    expected_possibilities = [
        "doc-editorial",
        "code-prototyping",
        "data-matrix",
        "flowchart-diagram",
        "visual-mockup",
        "inline-prompting",
        "algorithm-refactor",
        "rubric-curriculum",
        "sql-pipeline",
        "executive-report"
    ]
    for p in expected_possibilities:
        assert f'data-possibility="{p}"' in html, f"La pestaña de posibilidad {p} debe existir"

def test_all_ten_possibilities_in_app_js():
    js_file = BASE_DIR / "js" / "canvas-possibilities.js"
    assert js_file.exists(), "js/canvas-possibilities.js debe existir"
    js_code = js_file.read_text(encoding="utf-8")
    assert "const CANVAS_POSSIBILITIES" not in (BASE_DIR / "js" / "app.js").read_text(encoding="utf-8"), \
        "Los 10 modos se definen solo en js/canvas-possibilities.js"
    
    expected_possibilities = [
        "doc-editorial",
        "code-prototyping",
        "data-matrix",
        "flowchart-diagram",
        "visual-mockup",
        "inline-prompting",
        "algorithm-refactor",
        "rubric-curriculum",
        "sql-pipeline",
        "executive-report"
    ]
    for p in expected_possibilities:
        assert f'"{p}"' in js_code, f"La clave de posibilidad {p} debe estar registrada en CANVAS_POSSIBILITIES"

def test_canvas_images_exist_and_non_empty():
    images_dir = BASE_DIR / "assets" / "images" / "canvas"
    assert images_dir.exists(), "El directorio assets/images/canvas debe existir"
    
    expected_images = [
        "canvas_documento.jpg",
        "canvas_codigo.jpg",
        "canvas_matriz.jpg",
        "canvas_diagrama.jpg",
        "canvas_ui_ux.jpg",
        "canvas_inline.jpg",
        "canvas_algoritmo.jpg",
        "canvas_rubrica.jpg",
        "canvas_sql.jpg",
        "canvas_informe.jpg",
        "canvas_multimodal_sketch.jpg"
    ]
    for img_name in expected_images:
        img_path = images_dir / img_name
        assert img_path.exists(), f"La imagen {img_name} debe existir"
        assert img_path.stat().st_size > 50000, f"La imagen {img_name} debe tener un tamaño válido (> 50KB)"

def test_canvas_materials_exist():
    canvas_mat_dir = BASE_DIR / "materiales" / "gemini_canvas"
    assert canvas_mat_dir.exists(), "La carpeta materiales/gemini_canvas debe existir"
    
    guide_file = canvas_mat_dir / "guia_gemini_canvas_todas_las_posibilidades.md"
    json_file = canvas_mat_dir / "banco_prompts_canvas.json"
    
    assert guide_file.exists() and guide_file.stat().st_size > 500, "La guía de Canvas debe existir y tener contenido"
    assert json_file.exists() and json_file.stat().st_size > 500, "El dataset de Canvas debe existir"
    
    guide_text = guide_file.read_text(encoding="utf-8")
    assert "Gemini Canvas" in guide_text
    assert "R-C-I-R-F" in guide_text
    assert "Inline" in guide_text
    assert "Gemini Gems" in guide_text
    assert "Multimodal" in guide_text

def test_canvas_json_dataset_validity():
    json_file = BASE_DIR / "materiales" / "gemini_canvas" / "banco_prompts_canvas.json"
    data = json.loads(json_file.read_text(encoding="utf-8"))
    
    total = data.get("totalPossibilities")
    assert total == 10, f"totalPossibilities debe ser 10, obtenido {total}"
    possibilities = data.get("possibilities", [])
    assert len(possibilities) == 10, f"Debe contener exactamente 10 posibilidades, obtenido {len(possibilities)}"
    
    for p in possibilities:
        assert "id" in p
        assert "name" in p
        assert "masterPrompt" in p and len(p["masterPrompt"]) > 50
        assert "expectedResultSummary" in p
        assert "canvasControls" in p and len(p["canvasControls"]) > 0

def test_simulator_prompts_are_verifiable_in_json():
    """Cada modo del banco trae criterios verificables y la especificación de su imagen."""
    data = json.loads((BASE_DIR / "materiales" / "gemini_canvas" / "banco_prompts_canvas.json").read_text(encoding="utf-8"))
    images_dir = BASE_DIR / "assets" / "images" / "canvas"
    guide = (BASE_DIR / "materiales" / "gemini_canvas" / "guia_gemini_canvas_todas_las_posibilidades.md").read_text(encoding="utf-8")
    for p in data["possibilities"]:
        assert p["masterPrompt"] in guide, f"{p['id']}: la guía Markdown debe traer el mismo prompt del simulador"
        assert '"""' in p["masterPrompt"], f"{p['id']}: el prompt debe traer sus datos entre comillas triples"
        assert len(p["expected"]) >= 5, f"{p['id']}: mínimo 5 criterios verificables"
        assert all(item["criterion"] and item["how"] for item in p["expected"])
        spec = p["imageSpec"]
        assert spec["file"] == Path(p["image"]).name
        assert (images_dir / spec["file"]).exists(), f"{p['id']}: falta la imagen {spec['file']}"
        assert p["imageCaption"].startswith("Reconstrucción del resultado esperado")


def test_simulator_scripts_load_in_order_and_are_mirrored():
    for index_file in (BASE_DIR / "index.html", BASE_DIR / "src" / "index.html"):
        html = index_file.read_text(encoding="utf-8")
        order = [html.index(f'src="js/{name}.js"') for name in ("canvas-exercises", "canvas-possibilities", "app")]
        assert order == sorted(order), f"{index_file}: canvas-possibilities.js debe cargarse entre canvas-exercises.js y app.js"
        assert 'id="sim-followups"' in html
    root = (BASE_DIR / "js" / "canvas-possibilities.js").read_text(encoding="utf-8")
    mirror = (BASE_DIR / "src" / "shared" / "canvas-possibilities.js").read_text(encoding="utf-8")
    assert root == mirror, "src/shared/canvas-possibilities.js debe ser una réplica exacta"
    for name in ("canvas_documento", "canvas_codigo", "canvas_matriz", "canvas_diagrama", "canvas_ui_ux",
                 "canvas_inline", "canvas_algoritmo", "canvas_rubrica", "canvas_sql", "canvas_informe"):
        a = BASE_DIR / "assets" / "images" / "canvas" / f"{name}.jpg"
        b = BASE_DIR / "src" / "assets" / "images" / "canvas" / f"{name}.jpg"
        assert a.read_bytes() == b.read_bytes(), f"{name}.jpg debe ser igual en assets/ y src/assets/"


def test_all_expected_results_cards_exist():
    index_file = BASE_DIR / "index.html"
    html = index_file.read_text(encoding="utf-8")
    
    assert "expected-result-card" in html, "Debe existir al menos una tarjeta de resultado esperado"
    assert "col-good" in html, "Debe existir columna de resultado estándar de oro"
    assert "col-bad" in html, "Debe existir columna de antipatrón deficiente"
    assert "Resultado Esperado Observable: Acta Limpia" in html
    assert "Resultado Esperado Observable: Afiche Tipográfico" in html
    assert "Resultado Esperado Observable: Clasificación de 200 Archivos" in html
    assert "Resultado Esperado Observable: Tutor Socrático" in html

def test_canvas_accessible_modals_exist():
    """Valida la presencia y accesibilidad WAI-ARIA de los modales interactivos."""
    index_file = BASE_DIR / "index.html"
    html = index_file.read_text(encoding="utf-8")
    
    modal_ids = [
        "modal-canvas-lightbox",
        "modal-canvas-contrast",
        "modal-canvas-imagen3",
        "modal-canvas-code"
    ]
    for mid in modal_ids:
        assert f'id="{mid}"' in html, f"El modal #{mid} debe existir en el HTML"
        assert f'id="{mid}"' in html and 'role="dialog"' in html, f"El modal #{mid} debe tener role='dialog'"
        assert f'id="{mid}"' in html and 'aria-modal="true"' in html, f"El modal #{mid} debe tener aria-modal='true'"

def test_canvas_calibration_toolbar_elements():
    """Verifica los elementos interactivos de la barra de calibración reactiva de Canvas."""
    index_file = BASE_DIR / "index.html"
    html = index_file.read_text(encoding="utf-8")
    
    assert 'id="canvas-calibration-toolbar"' in html, "La barra de calibración debe existir"
    assert 'id="canvas-length-slider"' in html, "El slider de longitud debe existir"
    assert 'id="canvas-length-label"' in html, "La etiqueta de nivel de longitud debe existir"
    assert 'id="canvas-tone-group"' in html, "El grupo de tono debe existir"
    assert 'id="canvas-audience-group"' in html, "El grupo de audiencia debe existir"

def test_multimodal_simulator_elements():
    """Verifica los elementos interactivos del simulador de visión multimodal (boceto a Canvas)."""
    index_file = BASE_DIR / "index.html"
    html = index_file.read_text(encoding="utf-8")
    
    assert 'id="multimodal-simulator-module"' in html, "El módulo multimodal debe existir"
    assert 'id="btn-case-form"' in html, "El botón Caso A debe existir"
    assert 'id="btn-case-flow"' in html, "El botón Caso B debe existir"
    assert 'id="mm-sketch-box"' in html, "El contenedor de boceto debe existir"
    assert 'id="mm-ocr-list"' in html, "La lista de inferencia OCR debe existir"
    assert 'id="mm-interactive-result"' in html, "El contenedor del resultado interactivo debe existir"

def test_gem_studio_elements():
    """Verifica los elementos interactivos del Gem Studio para calibrar asistentes a medida."""
    index_file = BASE_DIR / "index.html"
    html = index_file.read_text(encoding="utf-8")
    
    assert 'id="gem-studio-module"' in html, "El módulo Gem Studio debe existir"
    assert 'id="gem-name-input"' in html, "El campo de nombre de Gem debe existir"
    assert 'id="gem-instructions-input"' in html, "El textarea de System Prompt debe existir"
    assert 'id="gem-chat-scroll"' in html, "El contenedor de chat de prueba debe existir"
    assert 'id="gem-user-input"' in html, "El input de usuario de Gem debe existir"
    assert 'id="btn-send-gem"' in html, "El botón enviar mensaje al Gem debe existir"
    assert 'id="btn-copy-gem-system-prompt"' in html, "El botón de copiar System Prompt debe existir"


def test_prompts_address_gemini_inside_canvas_not_the_learner():
    """«Abre un Canvas» parecía un paso del aprendiz; activar Canvas se explica fuera del prompt."""
    surfaces = [
        "index.html", "src/index.html",
        "js/app.js", "js/canvas-exercises.js", "js/canvas-possibilities.js", "js/dia3-module.js",
        "src/shared/app.js", "src/shared/canvas-exercises.js", "src/shared/canvas-possibilities.js", "src/shared/dia3-module.js",
        "materiales/gemini_canvas/guia_gemini_canvas_todas_las_posibilidades.md",
        "materiales/gemini_canvas/banco_prompts_canvas.json",
    ]
    for rel in surfaces:
        text = (BASE_DIR / rel).read_text(encoding="utf-8")
        assert "Abre un Canvas" not in text, f"{rel}: el prompt debe pedir el trabajo «En Canvas», no ordenar abrirlo"
    html = (BASE_DIR / "index.html").read_text(encoding="utf-8")
    assert "activa <strong>Canvas</strong>" in html, "El paso 1 debe indicar al aprendiz que active Canvas en Gemini"
