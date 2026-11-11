"""
Pruebas de integración de los ejercicios prácticos de Gemini Canvas Lab:
módulo en la página, carga del script, sincronía con el banco JSON y réplicas src/.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

BASE_DIR = Path(__file__).resolve().parent.parent
MODES = [
    "doc-editorial",
    "code-prototyping",
    "data-matrix",
    "flowchart-diagram",
    "visual-mockup",
    "inline-prompting",
    "algorithm-refactor",
    "rubric-curriculum",
    "sql-pipeline",
    "executive-report",
    "multimodal-vision",
    "gem-studio",
]


def _html():
    return (BASE_DIR / "index.html").read_text(encoding="utf-8")


def _js_exercises():
    node = shutil.which("node")
    if not node:
        pytest.skip("Node.js no está disponible")
    script = (
        "const m=require(process.argv[1]);"
        "process.stdout.write(JSON.stringify(m.CANVAS_EXERCISES));"
    )
    out = subprocess.run(
        [node, "-e", script, str(BASE_DIR / "js" / "canvas-exercises.js")],
        capture_output=True, text=True, encoding="utf-8", check=True,
    )
    return json.loads(out.stdout)


def test_exercises_module_markup():
    html = _html()
    for element_id in [
        "canvas-exercises-module",
        "canvas-exercises-mode-label",
        "canvas-exercises-switch",
        "canvas-exercises-content",
    ]:
        assert f'id="{element_id}"' in html, f"Falta #{element_id}"
    assert html.index('id="canvas-simulator-module"') < html.index('id="canvas-exercises-module"') < html.index('id="multimodal-simulator-module"')
    assert 'data-exercise-index="0"' in html and 'data-exercise-index="1"' in html


def test_exercises_script_loads_before_app():
    html = _html()
    assert '<script src="js/canvas-exercises.js"></script>' in html
    assert html.index("js/canvas-exercises.js") < html.index('<script src="js/app.js"></script>')


def test_app_renders_exercises_on_mode_change():
    js = (BASE_DIR / "js" / "app.js").read_text(encoding="utf-8")
    assert "function renderCanvasExercises" in js
    assert "renderCanvasExercises(id)" in js
    assert "buildCanvasExerciseHtml" in js


def test_exercises_css_present():
    css = (BASE_DIR / "css" / "styles.css").read_text(encoding="utf-8")
    for selector in [".canvas-exercise-card", ".canvas-exercise-code", ".canvas-exercise-preview", ".canvas-exercise-check"]:
        assert selector in css, f"Falta el estilo {selector}"


def test_json_bank_matches_js_exercises():
    data = json.loads((BASE_DIR / "materiales" / "gemini_canvas" / "banco_prompts_canvas.json").read_text(encoding="utf-8"))
    assert data["totalExercises"] == 24
    js_ex = _js_exercises()
    by_id = {p["id"]: p for p in data["possibilities"]}
    for mode in MODES:
        bank = by_id[mode]["exercises"]
        assert len(bank) == 2, f"{mode} debe tener 2 ejercicios en el banco JSON"
        for bank_ex, js_ex_item in zip(bank, js_ex[mode]):
            assert bank_ex["id"] == js_ex_item["id"]
            assert bank_ex["title"] == js_ex_item["title"]
            assert bank_ex["prompt"] == js_ex_item["prompt"]
            assert bank_ex["expected"] == js_ex_item["expected"]


def test_guide_lists_all_exercises():
    guide = (BASE_DIR / "materiales" / "gemini_canvas" / "guia_gemini_canvas_todas_las_posibilidades.md").read_text(encoding="utf-8")
    assert "Ejercicios prácticos por modo" in guide
    for mode in MODES:
        for ex in _js_exercises()[mode]:
            assert ex["title"] in guide, f"La guía debe incluir «{ex['title']}»"


def test_src_mirrors_are_exact():
    pairs = [
        ("index.html", "src/index.html"),
        ("css/styles.css", "src/css/styles.css"),
        ("css/styles.css", "src/styles/styles.css"),
        ("devbrain-prose.css", "src/devbrain-prose.css"),
        ("devbrain-prose.js", "src/devbrain-prose.js"),
        ("js/app.js", "src/js/app.js"),
        ("js/app.js", "src/shared/app.js"),
        ("js/projects-hub.js", "src/js/projects-hub.js"),
        ("js/projects-hub.js", "src/shared/projects-hub.js"),
        ("js/canvas-exercises.js", "src/js/canvas-exercises.js"),
        ("js/canvas-exercises.js", "src/shared/canvas-exercises.js"),
        ("js/canvas-possibilities.js", "src/js/canvas-possibilities.js"),
        ("js/canvas-possibilities.js", "src/shared/canvas-possibilities.js"),
        ("js/canvas-nav.js", "src/js/canvas-nav.js"),
        ("js/canvas-nav.js", "src/shared/canvas-nav.js"),
        ("js/canvas-coverage.js", "src/js/canvas-coverage.js"),
        ("js/canvas-coverage.js", "src/shared/canvas-coverage.js"),
        ("js/canvas-subnav.js", "src/js/canvas-subnav.js"),
        ("js/canvas-subnav.js", "src/shared/canvas-subnav.js"),
        ("js/canvas-column-dnd.js", "src/js/canvas-column-dnd.js"),
        ("js/canvas-column-dnd.js", "src/shared/canvas-column-dnd.js"),
        ("js/dia3-module.js", "src/js/dia3-module.js"),
        ("js/dia3-module.js", "src/shared/dia3-module.js"),
    ]
    assert len(pairs) == 23, "Deben existir exactamente 23 pares espejo"
    for root, mirror in pairs:
        assert (BASE_DIR / root).read_text(encoding="utf-8") == (BASE_DIR / mirror).read_text(encoding="utf-8"), f"{mirror} debe replicar {root}"


def test_canvas_module_follows_crttl_prompt_canon():
    canvas_files = [
        "js/canvas-exercises.js",
        "js/canvas-possibilities.js",
        "js/canvas-coverage.js",
        "js/canvas-subnav.js",
        "js/canvas-column-dnd.js",
        "materiales/gemini_canvas/guia_gemini_canvas_todas_las_posibilidades.md",
        "materiales/gemini_canvas/banco_prompts_canvas.json",
    ]
    banned_frameworks = [
        "R-C-I-R-F",
        "".join(["G", "C", "S", "E"]),
        "".join(["R", "C", "T", "F"]),
        "R-C-T-R",
        "".join(["C", "O", "-", "S", "T", "A", "R"]),
    ]
    for rel_path in canvas_files:
        content = (BASE_DIR / rel_path).read_text(encoding="utf-8")
        for banned in banned_frameworks:
            assert banned not in content, f"{rel_path} no debe mencionar el marco no canónico «{banned}»"
        assert "dossier" not in content.lower(), f"{rel_path} no debe usar el extranjerismo prohibido «dossier»"


def test_canvas_navigation_markup():
    html = _html()
    assert html.index('src="js/canvas-nav.js"') < html.index('src="js/app.js"'), "las rutas cargan antes de app.js"
    assert html.index('src="js/canvas-coverage.js"') < html.index('src="js/canvas-exercises.js"'), "cobertura carga antes de ejercicios"
    assert html.index('src="js/canvas-subnav.js"') < html.index('src="js/app.js"'), "subnavegación carga antes de app.js"
    assert html.index('src="js/canvas-column-dnd.js"') < html.index('src="js/app.js"'), "column-dnd carga antes de app.js"
    assert 'id="canvas-exercise-index-list"' in html, "índice de los 24 ejercicios"
    assert 'id="canvas-exercise-prev"' in html and 'id="canvas-exercise-next"' in html, "paginador entre ejercicios"
    assert 'canvas-mode-prev' not in html, "el paginador ya no salta modos completos"
    assert 'id="canvas-exercise-position"' in html, "posición «Ejercicio N de 24»"
    assert 'id="canvas-continue-btn"' in html, "botón para retomar el primer ejercicio pendiente"
    assert 'id="canvas-exercise-done-next"' in html, "aviso de ejercicio completado con salto al siguiente"
    for section in ["canvas-fundamentals-anchor", "canvas-simulator-module", "canvas-exercises-module", "canvas-coverage-module", "canvas-advanced-labs-anchor"]:
        assert f'data-canvas-section="{section}"' in html
        assert f'id="{section}"' in html


def test_app_uses_linear_exercise_sequence():
    app = (BASE_DIR / "js" / "app.js").read_text(encoding="utf-8")
    for fn in ["listExerciseSequence(", "neighborExercise(", "firstPendingExercise(", "exercisePosition(", "serializeChecks(", "parseChecks("]:
        assert fn in app, f"app.js debe usar {fn}"
    assert "canvasPartialChecks" in app, "las casillas a medias se guardan"


def test_app_supports_deep_links_and_history():
    app = (BASE_DIR / "js" / "app.js").read_text(encoding="utf-8")
    assert 'addEventListener("hashchange", applyHashRoute)' in app
    assert 'addEventListener("popstate", applyHashRoute)' in app
    assert "window.openCanvasRoute = openCanvasRoute" in app
    assert "buildCanvasRoute(mode, i)" in app, "índice y paleta usan enlaces directos"


def test_page_never_promises_tools_outside_canvas():
    html = _html()
    for banned in ["Google Sheets", "Hojas de Cálculo", "mermaid.live", "Gem Studio"]:
        assert banned not in html, f"index.html no debe mencionar «{banned}»"


def test_projects_hub_markup_and_integration():
    html = _html()
    assert 'id="proyectos"' in html, "Sección #proyectos debe existir"
    assert '<section class="page-view" id="proyectos">' in html, "Etiqueta section de proyectos debe existir"
    assert 'href="#proyectos"' in html and 'data-target="proyectos"' in html, "Enlace en sidebar debe existir"
    assert '<a href="#proyectos" class="quick-nav-pill">' in html, "Pill en subnavegación de Canvas Lab debe existir"
    assert '<script src="js/projects-hub.js"></script>' in html, "Script projects-hub.js referenciado"
    assert html.index('src="js/projects-hub.js"') < html.index('src="js/app.js"'), "projects-hub.js debe cargar antes de app.js"
    for element_id in [
        "projects-hub-view-container",
        "hub-search-input",
        "hub-filter-area",
        "hub-filter-level",
        "hub-filter-duration",
        "hub-results-count",
    ]:
        assert f'id="{element_id}"' in html, f"Falta #{element_id} en index.html"
    assert 'data-hub-view="kanban"' in html
    assert 'data-hub-view="bento"' in html
    assert 'data-hub-view="list"' in html
    assert 'data-hub-reset-order' in html


