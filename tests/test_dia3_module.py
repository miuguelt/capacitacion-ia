"""
Pruebas de integración del módulo interactivo del Día 3 (Agentes, Código & APIs):
marcado de arquitectura, ejemplos con vista previa en vivo, laboratorio de seguridad
determinista (sin setTimeout), 6 ejercicios R-C-I-R-F, carga de scripts y réplica src/.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

BASE_DIR = Path(__file__).resolve().parent.parent
DIA3_BLOCKS = ["agentes-archivos", "web-tres-archivos", "propiedad-apis"]
DIA3_EXAMPLES = [
    "diagnostico-pc",
    "clasificador-200",
    "panel-3-archivos",
    "pasarela-bff-segura",
]


def _html():
    return (BASE_DIR / "index.html").read_text(encoding="utf-8")


def _js_dia3():
    node = shutil.which("node")
    if not node:
        pytest.skip("Node.js no está disponible")
    script = (
        "const m=require(process.argv[1]);"
        "const previews={};"
        "for(const k of Object.keys(m.DIA3_EXAMPLES)){previews[k]=m.buildDia3ExampleHtml(k,'preview');}"
        "process.stdout.write(JSON.stringify({examples:m.DIA3_EXAMPLES,previews,exercises:m.DIA3_EXERCISES}));"
    )
    out = subprocess.run(
        [node, "-e", script, str(BASE_DIR / "js" / "dia3-module.js")],
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=True,
    )
    return json.loads(out.stdout)


def test_dia3_module_markup():
    html = _html()
    for element_id in [
        "dia-3",
        "dia3-architecture-module",
        "dia3-examples-module",
        "dia3-example-viewer",
        "dia3-security-lab",
        "dia3-security-input",
        "dia3-audit-output",
        "dia3-budget-output",
        "dia3-exercises-module",
        "dia3-exercises-block-label",
        "dia3-exercises-content",
    ]:
        assert f'id="{element_id}"' in html, f"Falta #{element_id} en index.html"

    assert (
        html.index('id="dia3-architecture-module"')
        < html.index('id="dia3-examples-module"')
        < html.index('id="dia3-security-lab"')
        < html.index('id="dia3-exercises-module"')
    )


def test_dia3_script_loads_in_order():
    html = _html()
    assert '<script src="js/dia3-module.js"></script>' in html
    assert (
        html.index('<script src="js/canvas-exercises.js"></script>')
        < html.index('<script src="js/dia3-module.js"></script>')
        < html.index('<script src="js/app.js"></script>')
    )


def test_dia3_app_wiring_and_no_settimeout():
    app_js = (BASE_DIR / "js" / "app.js").read_text(encoding="utf-8")
    dia3_js = (BASE_DIR / "js" / "dia3-module.js").read_text(encoding="utf-8")
    assert "initDia3Module();" in app_js
    assert "function initDia3Module()" in app_js
    assert "setTimeout" not in dia3_js, "El módulo del Día 3 debe ser 100 % determinista sin setTimeout"


def test_dia3_css_present():
    css = (BASE_DIR / "css" / "styles.css").read_text(encoding="utf-8")
    for selector in [
        ".dia3-arch-grid",
        ".dia3-example-card",
        ".dia3-live-widget",
        ".dia3-lab-grid",
        ".dia3-audit-box",
        ".dia3-budget-inputs",
    ]:
        assert selector in css, f"Falta el estilo {selector} en css/styles.css"


def test_dia3_examples_and_exercises_structure():
    payload = _js_dia3()
    examples = payload["examples"]
    exercises = payload["exercises"]

    for ex_id in DIA3_EXAMPLES:
        assert ex_id in examples
        item = examples[ex_id]
        assert item["title"]
        assert payload["previews"][ex_id]
        assert item["code"]
        assert "Actúa como" in item["prompt"]
        assert "Restricciones:" in item["prompt"]

    for block in DIA3_BLOCKS:
        assert block in exercises
        assert len(exercises[block]) == 2
        for ex in exercises[block]:
            assert "Actúa como" in ex["prompt"]
            assert "Contexto:" in ex["prompt"]
            assert "Instrucción:" in ex["prompt"]
            assert "Restricciones:" in ex["prompt"]
            assert "Formato:" in ex["prompt"]
            assert '"""' in ex["prompt"]
            assert "<svg" in ex["previewSvg"]
            assert len(ex["expected"]) >= 4


def test_dia3_src_mirror_matches():
    assert (BASE_DIR / "js" / "dia3-module.js").read_text(encoding="utf-8") == (
        BASE_DIR / "src" / "shared" / "dia3-module.js"
    ).read_text(encoding="utf-8")
