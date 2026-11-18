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
    "interactive-apps",
]

# Los 13 modos cuentan con las partes A, B y C (39 ejercicios en total).
MODES_WITH_PART_C = list(MODES)


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
    assert all(f'data-exercise-index="{i}"' in html for i in range(3))


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
    assert data["totalExercises"] == 39
    js_ex = _js_exercises()
    by_id = {p["id"]: p for p in data["possibilities"]}
    for mode in MODES:
        bank = by_id[mode]["exercises"]
        esperados = 3 if mode in MODES_WITH_PART_C else 2
        assert len(bank) == esperados == len(js_ex[mode]), f"{mode} debe tener {esperados} ejercicios en el banco JSON"
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
    assert 'canvas-mode-prev' not in html, "el paginador ya no salta modos completos"
    assert 'id="canvas-continue-btn"' in html, "botón para retomar el primer ejercicio pendiente"
    for section in ["canvas-simulator-module", "canvas-exercises-module"]:
        assert f'data-canvas-section="{section}"' in html, "la barra sabe qué paso está en pantalla"
        assert f'id="{section}"' in html


def test_canvas_page_follows_one_journey_per_mode():
    html = _html()
    start = html.index('<section class="page-view" id="gemini-canvas">')
    end = html.index('<section class="page-view" id="proyectos">')
    page = html[start:end]
    assert "canvas-quick-nav" not in page, "la navegación por secciones ya no compite con el recorrido"
    for element_id in ["canvas-journey-bar", "canvas-mode-menu", "canvas-mode-menu-grid", "canvas-mode-stations",
                       "canvas-journey-prev", "canvas-journey-next", "canvas-journey-progress",
                       "canvas-mode-workspace", "canvas-workspace-title", "canvas-sim-mode-label", "canvas-mode-wrapup",
                       "canvas-resources"]:
        assert f'id="{element_id}"' in page, f"Falta #{element_id}"
    order = [page.index(f'id="{i}"') for i in [
        "canvas-start-details", "canvas-journey-bar", "canvas-mode-workspace", "canvas-simulator-module",
        "canvas-exercises-module", "multimodal-simulator-module", "gem-studio-module", "canvas-mode-wrapup",
        "canvas-resources", "canvas-coverage-module"]]
    assert order == sorted(order), "orden: antes de empezar, barra, ejemplo, ejercicios, laboratorio, qué sigue y recursos"
    workspace = page[page.index('id="canvas-mode-workspace"'):page.index('id="canvas-resources"')]
    for inside in ["canvas-simulator-module", "canvas-exercises-module", "multimodal-simulator-module", "gem-studio-module"]:
        assert f'id="{inside}"' in workspace, f"#{inside} vive dentro del espacio de trabajo del modo"
    assert 'id="canvas-coverage-module"' not in workspace, "el mapa de funciones queda fuera del recorrido"
    assert page.count('class="canvas-aside canvas-mode-lab"') == 2
    assert 'data-lab-mode="multimodal-vision" hidden' in page and 'data-lab-mode="gem-studio" hidden' in page
    assert 'class="canvas-tab-bar" role="tablist" aria-label="Posibilidades de Gemini Canvas" hidden' in page
    for removed in ["canvas-learner-compass", "data-immersive-focus=", "canvas-exercise-index", "canvas-exercise-position",
                    "canvas-category-filters", "canvas-advanced-labs-anchor", "btn-toggle-exercises-fullscreen"]:
        assert removed not in page, f"{removed} ya no forma parte de la página"


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
    app = (BASE_DIR / "js" / "app.js").read_text(encoding="utf-8")
    assert 'href="#proyectos">Ir al Hub de proyectos' in app, "el cierre del recorrido de Canvas enlaza al Hub de proyectos"
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


def test_immersive_mode_and_journey_bar():
    html = _html()
    app = (BASE_DIR / "js" / "app.js").read_text(encoding="utf-8")
    css = (BASE_DIR / "css" / "styles.css").read_text(encoding="utf-8")
    for required_id in [
        "canvas-journey-bar",
        "btn-hud-toggle-immersive",
        "btn-toggle-mm-fullscreen",
        "btn-toggle-gem-fullscreen",
        "mm-sim-bridge",
        "gem-sim-bridge",
        "btn-toggle-dia3-fullscreen",
        "btn-toggle-dia3-ex-fullscreen",
        "dia3-sim-bridge",
    ]:
        assert f'id="{required_id}"' in html, f"Falta #{required_id} en index.html"
    assert "#gemini-canvas.is-immersive" in css
    assert "#canvas-exercises-module.is-fullscreen" in css
    for fn in ["buildModeStations(", "buildModeWrapUp(", "buildJourneyGroups(", "parseJourneyValue("]:
        assert fn in app, f"app.js debe usar {fn}"
    assert "resolveImmersiveFocus(" in app
    assert "getSpecializedLabForMode(" in app


def test_simulator_live_enhancements_and_360_vision():
    html = _html()
    app = (BASE_DIR / "js" / "app.js").read_text(encoding="utf-8")
    poss = (BASE_DIR / "js" / "canvas-possibilities.js").read_text(encoding="utf-8")
    cov = (BASE_DIR / "js" / "canvas-coverage.js").read_text(encoding="utf-8")
    for elem_id in [
        "btn-sim-apply-variation",
        "btn-sim-copy-variation",
        "sim-calibration-live-slot",
        "sim-transform-toolbar",
        "sim-variation-live-slot",
    ]:
        assert f'id="{elem_id}"' in html, f"Falta #{elem_id} en index.html"
    for transform_key in ["artifact", "infographic", "quiz", "audio"]:
        assert f'data-sim-transform="{transform_key}"' in html
    assert "computeCalibratedSimulation(" in poss and "computeCalibratedSimulation(" in app
    assert "simulateVariationForMode(" in poss and "simulateVariationForMode(" in app
    assert "buildCanvasTransformPreviewHtml(" in poss and "buildCanvasTransformPreviewHtml(" in app
    assert "buildCompleteVisionSummaryHtml(" in cov
    assert "CANVAS_VISION_STAGES" in cov
    for clean_id in ["canvas-mode-menu", "canvas-mode-stations", "dia3-immersive-bar", "btn-dia3-hud-exit"]:
        assert f'id="{clean_id}"' in html, f"Falta #{clean_id} en index.html"





