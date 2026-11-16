"""
Integridad del módulo de productividad: estaciones en cada día, herramientas,
materiales descargables, carga del script, gobernanza y espejos src/.
"""

import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _html():
    return (BASE_DIR / "index.html").read_text(encoding="utf-8")


def _section(html, section_id):
    start = html.index(f'<section class="page-view" id="{section_id}">')
    end = html.index("</section>", start)
    return html[start:end]


def test_cada_dia_tiene_su_estacion_de_productividad():
    html = _html()
    for day in ["dia-1", "dia-2", "dia-3", "dia-4"]:
        assert f'data-prod-day="{day}"' in _section(html, day), f"Falta la estación de productividad en {day}"


def test_herramientas_del_kit_en_el_dia_4():
    dia4 = _section(_html(), "dia-4")
    for element_id in ["prod-savings-form", "prod-min-before", "prod-min-after", "prod-times-week",
                       "btn-prod-reset", "prod-savings-output", "prod-vera-checklist", "prod-kit-filter",
                       "prod-kit-list", "btn-prod-kit-print", "prod-no-ai-body"]:
        assert f'id="{element_id}"' in dia4, f"Falta #{element_id} en el Día 4"
    assert 'aria-live="polite"' in dia4
    for label_for in ["prod-min-before", "prod-min-after", "prod-times-week", "prod-kit-filter"]:
        assert f'<label for="{label_for}"' in dia4, f"El campo {label_for} necesita etiqueta"


def test_script_carga_antes_de_app_js():
    html = _html()
    assert html.index('src="js/productivity-module.js"') < html.index('src="js/app.js"')


def test_materiales_nuevos_existen_y_se_enlazan():
    html = _html()
    for rel in ["materiales/dia1_prompting/bandeja_correos_practica.md",
                "materiales/dia4_agentes_integrador/biblioteca_personal_prompts.md"]:
        path = BASE_DIR / rel
        assert path.exists() and path.stat().st_size > 500, rel
        text = path.read_text(encoding="utf-8")
        assert "CRTT+L" in text and "V.E.R.A." in text, rel
        assert "para aprender" in text, f"{rel} debe aclarar que es material de práctica"
        assert f'href="{rel}"' in html, f"{rel} debe estar enlazado en Materiales"


def test_registro_y_manifiesto_enlazan_las_estaciones():
    registry = json.loads((BASE_DIR / "deliverables.registry.json").read_text(encoding="utf-8"))
    manifest = json.loads((BASE_DIR / "guide.manifest.json").read_text(encoding="utf-8"))
    module = (BASE_DIR / "js" / "productivity-module.js").read_text(encoding="utf-8")
    stations = manifest["productivity"]["stations"]
    assert len(stations) == 4
    for item in registry["deliverables"]:
        assert item["productivityStation"] in stations
        assert f'id: "{item["productivityStation"]}"' in module
    assert manifest["productivity"]["promptMethod"] == "CRTT+L"


def test_artefactos_de_gobernanza_presentes():
    for rel in ["guide.manifest.json", "deliverables.registry.json", "WEB-DESIGN-BRIEF.md",
                "GUIDE_READINESS_REVIEW.md", "GUIDE_ITERATION_LOG.md", "WEB-DESIGN-LEARNING.md"]:
        assert (BASE_DIR / rel).exists(), f"Falta {rel}"
    assert list((BASE_DIR / "docs" / "architecture" / "ADR").glob("ADR-*.md")), "Falta al menos una ADR"


def test_gem_studio_responde_sin_retardo_simulado():
    app = (BASE_DIR / "js" / "app.js").read_text(encoding="utf-8")
    assert not re.search(r"setTimeout\(\(\) => \{\s*const reply = generateAssistantResponse", app)
    assert "appendAssistantMessage(generateAssistantResponse(text));" in app


def test_espejos_del_modulo_identicos():
    source = (BASE_DIR / "js" / "productivity-module.js").read_bytes()
    for mirror in ["src/js/productivity-module.js", "src/shared/productivity-module.js"]:
        assert (BASE_DIR / mirror).read_bytes() == source, mirror
