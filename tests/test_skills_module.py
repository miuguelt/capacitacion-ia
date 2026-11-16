"""
Integridad del módulo de Agent Skills (Día 3) y del bloque de IA ofimática (Día 1).
"""

import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SKILLS_DIR = BASE_DIR / "materiales" / "dia3_agentes_web" / "skills"


def _html():
    return (BASE_DIR / "index.html").read_text(encoding="utf-8")


def _section(html, section_id):
    start = html.index(f'<section class="page-view" id="{section_id}">')
    return html[start:html.index("</section>", start)]


def test_modulo_de_skills_en_el_dia_3():
    dia3 = _section(_html(), "dia-3")
    for element_id in ["skills-module", "skills-comparison", "skill-builder-form", "skill-name", "skill-description",
                       "skill-tarea", "skill-limites", "btn-skill-validate", "btn-skill-example", "btn-skill-reset",
                       "skill-builder-status", "skill-md-output", "skills-examples", "skills-security-list"]:
        assert f'id="{element_id}"' in dia3, f"Falta #{element_id} en el Día 3"
    for field in ["skill-name", "skill-description", "skill-contexto", "skill-rol", "skill-tarea", "skill-tono",
                  "skill-limites", "skill-resources"]:
        assert f'<label for="{field}"' in dia3, f"{field} necesita etiqueta"


def test_ia_ofimatica_en_el_dia_1():
    dia1 = _section(_html(), "dia-1")
    assert 'id="office-ai-module"' in dia1 and 'id="office-ai-table"' in dia1
    assert "licencia" in dia1 and "Microsoft 365" in dia1 and "Google Workspace" in dia1


def test_script_de_skills_carga_antes_de_app_js():
    html = _html()
    assert html.index('src="js/skills-module.js"') < html.index('src="js/app.js"')


def test_skills_de_ejemplo_y_guia():
    folders = sorted(p.name for p in SKILLS_DIR.iterdir() if p.is_dir())
    assert folders == ["acta-de-comite", "informe-mesa-ayuda", "respuesta-correo-institucional"]
    for name in folders:
        text = (SKILLS_DIR / name / "SKILL.md").read_text(encoding="utf-8")
        assert text.startswith(f"---\nname: {name}\ndescription: ")
        assert "cuando" in text.split("---")[1].lower()
    guide = (BASE_DIR / "materiales" / "dia3_agentes_web" / "guia_agent_skills.md").read_text(encoding="utf-8")
    assert "CRTT+L" in guide and "V.E.R.A." in guide and "para aprender" in guide
    html = _html()
    assert 'href="materiales/dia3_agentes_web/guia_agent_skills.md"' in html
    assert 'href="materiales/dia3_agentes_web/skills/acta-de-comite/SKILL.md"' in html


def test_manifiesto_y_registro():
    manifest = json.loads((BASE_DIR / "guide.manifest.json").read_text(encoding="utf-8"))
    for rel in manifest["skills"]["examples"] + [manifest["skills"]["guide"], manifest["skills"]["module"]]:
        assert (BASE_DIR / rel).exists(), rel
    registry = (BASE_DIR / "deliverables.registry.json").read_text(encoding="utf-8")
    assert "SKILL.md" in registry


def test_espejos_del_modulo_de_skills():
    source = (BASE_DIR / "js" / "skills-module.js").read_bytes()
    for mirror in ["src/js/skills-module.js", "src/shared/skills-module.js"]:
        assert (BASE_DIR / mirror).read_bytes() == source, mirror
