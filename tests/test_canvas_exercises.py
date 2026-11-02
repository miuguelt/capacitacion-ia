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
        ("js/canvas-exercises.js", "src/shared/canvas-exercises.js"),
    ]
    for root, mirror in pairs:
        assert (BASE_DIR / root).read_text(encoding="utf-8") == (BASE_DIR / mirror).read_text(encoding="utf-8"), f"{mirror} debe replicar {root}"
