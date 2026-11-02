"""
Harness Adversarial de Verificación Empírica DOM - Milestone 2
Capacitación IA - Gemini Canvas Lab

Verifica exhaustivamente mediante análisis de árbol DOM (BeautifulSoup):
1. Botonera de 12 pestañas (.canvas-tab-bar): data-possibility, iconos, numeración y texto legible.
2. Modo Split de 2 salidas (.canvas-split-container): coexistencia de #canvas-output-primary y
   #canvas-output-refinement con sus badges distintivos (.canvas-output-badge).
3. Totalidad de IDs interactivos requeridos y unicidad estricta en el DOM.
4. Invariante de orden DOM entre módulos y no anidamiento (hermanos en el DOM).
5. Sincronización espejo exacta entre index.html y src/index.html.
6. Cumplimiento de estilos CSS (.canvas-split-container, .canvas-output-badge) y políticas DevBrain.
"""

import os
import re
import sys
from bs4 import BeautifulSoup

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_PATH = os.path.join(BASE_DIR, "index.html")
SRC_INDEX_PATH = os.path.join(BASE_DIR, "src", "index.html")
CSS_PATH = os.path.join(BASE_DIR, "css", "styles.css")
SRC_CSS_PATH = os.path.join(BASE_DIR, "src", "css", "styles.css")

EXPECTED_POSSIBILITIES = [
    ("doc-editorial", 1, "Redacción & Documentos"),
    ("code-prototyping", 2, "Código & Web en Vivo"),
    ("data-matrix", 3, "Matrices & Hojas de Cálculo"),
    ("flowchart-diagram", 4, "Diagramas de Proceso"),
    ("visual-mockup", 5, "Diseño Visual UI/UX"),
    ("inline-prompting", 6, "Edición por Selección (Inline)"),
    ("algorithm-refactor", 7, "Algoritmos & Python (O(n))"),
    ("rubric-curriculum", 8, "Rúbricas & Didáctica"),
    ("sql-pipeline", 9, "SQL & Pipelines"),
    ("executive-report", 10, "Informes & Auditoría"),
    ("multimodal-vision", 11, "Visión Multimodal"),
    ("gem-studio", 12, "Gem Studio para Canvas")
]

REQUIRED_INTERACTIVE_IDS = [
    "sim-doc-icon",
    "sim-doc-title",
    "sim-quick-actions",
    "panel-image-view",
    "panel-interactive-view",
    "panel-insights-view",
    "sim-user-prompt",
    "sim-copy-prompt-btn",
    "sim-followups",
    "sim-ai-response",
    "sim-prompt-variation",
    "sim-result-image",
    "sim-image-caption",
    "sim-interactive-content",
    "sim-insights-content"
]

results = {"passed": 0, "failed": 0, "errors": []}

def run_test(name, fn):
    try:
        fn()
        results["passed"] += 1
        print(f"  [PASS] {name}")
    except Exception as e:
        results["failed"] += 1
        results["errors"].append((name, str(e)))
        print(f"  [FAIL] {name}: {e}")

print("======================================================================")
print("  HARNESS ADVERSARIAL DOM (BEAUTIFUL SOUP) - MILESTONE 2: GEMINI CANVAS LAB")
print("======================================================================")

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    raw_html = f.read()

soup = BeautifulSoup(raw_html, "html.parser")

# ----------------------------------------------------------------------
# 1. Inspección de los 12 botones en .canvas-tab-bar
# ----------------------------------------------------------------------
def test_twelve_tab_buttons_in_tab_bar():
    sim_module = soup.find(id="canvas-simulator-module")
    assert sim_module is not None, "Elemento #canvas-simulator-module no encontrado en index.html"

    tab_bar = sim_module.find("div", class_="canvas-tab-bar")
    assert tab_bar is not None, "Elemento .canvas-tab-bar no encontrado en #canvas-simulator-module"
    assert tab_bar.get("role") == "tablist", ".canvas-tab-bar debe tener role='tablist'"
    assert tab_bar.get("aria-label"), ".canvas-tab-bar debe tener un atributo aria-label"

    buttons = tab_bar.find_all("button", class_="canvas-tab")
    assert len(buttons) == 12, f"Se esperaban exactamente 12 botones .canvas-tab, encontrados: {len(buttons)}"

    for idx, (expected_key, expected_num, expected_label_part) in enumerate(EXPECTED_POSSIBILITIES):
        btn = buttons[idx]
        
        # 1. data-possibility
        actual_key = btn.get("data-possibility")
        assert actual_key == expected_key, f"Botón {idx+1}: data-possibility esperado '{expected_key}', obtenido '{actual_key}'"

        # 2. Icono (span)
        span_icon = btn.find("span")
        assert span_icon is not None, f"Botón {idx+1} ({expected_key}) debe contener un <span> para el icono"
        icon_text = span_icon.get_text(strip=True)
        assert len(icon_text) > 0, f"Botón {idx+1} ({expected_key}) tiene un icono vacío"

        # 3. Numeración y título legible
        full_text = btn.get_text(strip=True)
        # Extraer texto sin el icono
        text_without_icon = full_text.replace(icon_text, "").strip()
        expected_prefix = f"{expected_num}."
        assert text_without_icon.startswith(expected_prefix), \
            f"Botón {idx+1} ({expected_key}): debe iniciar con '{expected_prefix}', texto='{text_without_icon}'"
        
        title_text = text_without_icon[len(expected_prefix):].strip()
        assert len(title_text) >= 5, f"Botón {idx+1} ({expected_key}) título demasiado corto: '{title_text}'"
        assert expected_label_part.lower() in title_text.lower(), \
            f"Botón {idx+1} ({expected_key}) no contiene '{expected_label_part}': texto='{title_text}'"

        # 4. Clase active
        classes = btn.get("class", [])
        if idx == 0:
            assert "active" in classes, "El primer botón debe tener la clase 'active'"
        else:
            assert "active" not in classes, f"El botón {idx+1} ({expected_key}) no debe tener clase 'active' por defecto"

run_test("1. Validación de 12 botones en .canvas-tab-bar (data-possibility, icono, número, título y accesibilidad)", test_twelve_tab_buttons_in_tab_bar)

# ----------------------------------------------------------------------
# 2. Inspección del Modo Split de 2 salidas en .canvas-split-container
# ----------------------------------------------------------------------
def test_split_container_and_two_outputs():
    sim_module = soup.find(id="canvas-simulator-module")
    split_container = sim_module.find("div", class_="canvas-split-container")
    assert split_container is not None, "No se encontró .canvas-split-container dentro de #canvas-simulator-module"

    # 1. Existencia simultánea
    primary = split_container.find(id="canvas-output-primary")
    refinement = split_container.find(id="canvas-output-refinement")
    assert primary is not None, "Falta #canvas-output-primary dentro de .canvas-split-container"
    assert refinement is not None, "Falta #canvas-output-refinement dentro de .canvas-split-container"

    # 2. Salida 1: Lienzo Principal (Artefacto)
    assert "canvas-editor-pane" in primary.get("class", []), "#canvas-output-primary debe tener clase .canvas-editor-pane"
    assert primary.get("role") == "region", "#canvas-output-primary debe tener role='region'"
    primary_label = primary.get("aria-label", "")
    assert "Salida 1: Lienzo Principal" in primary_label, f"aria-label de #canvas-output-primary incorrecto: '{primary_label}'"

    badge_primary = primary.find(id="canvas-output-primary-badge")
    assert badge_primary is not None, "Falta #canvas-output-primary-badge dentro de #canvas-output-primary"
    bp_classes = badge_primary.get("class", [])
    assert "canvas-output-badge" in bp_classes, "Badge 1 debe tener clase .canvas-output-badge"
    assert "output-primary" in bp_classes, "Badge 1 debe tener clase .output-primary"
    bp_text = badge_primary.get_text(strip=True)
    assert "Salida 1: Lienzo Principal" in bp_text, f"Texto de badge 1 inesperado: '{bp_text}'"

    # 3. Salida 2: Interacción y Refinamiento
    assert "canvas-chat-pane" in refinement.get("class", []), "#canvas-output-refinement debe tener clase .canvas-chat-pane"
    assert refinement.get("role") == "region", "#canvas-output-refinement debe tener role='region'"
    refinement_label = refinement.get("aria-label", "")
    assert "Salida 2: Interacción y Refinamiento" in refinement_label, f"aria-label de #canvas-output-refinement incorrecto: '{refinement_label}'"

    badge_refinement = refinement.find(id="canvas-output-refinement-badge")
    assert badge_refinement is not None, "Falta #canvas-output-refinement-badge dentro de #canvas-output-refinement"
    br_classes = badge_refinement.get("class", [])
    assert "canvas-output-badge" in br_classes, "Badge 2 debe tener clase .canvas-output-badge"
    assert "output-refinement" in br_classes, "Badge 2 debe tener clase .output-refinement"
    br_text = badge_refinement.get_text(strip=True)
    assert "Salida 2: Interacción y Refinamiento" in br_text, f"Texto de badge 2 inesperado: '{br_text}'"

run_test("2. Validación de Modo Split (.canvas-split-container, Salida 1, Salida 2, roles WAI-ARIA y badges distintivos)", test_split_container_and_two_outputs)

# ----------------------------------------------------------------------
# 3. Inspección de Totalidad de IDs Interactivos y Unicidad en el DOM
# ----------------------------------------------------------------------
def test_all_interactive_ids_and_strict_uniqueness():
    sim_module = soup.find(id="canvas-simulator-module")
    
    # 1. Clase .canvas-view-mode-tabs
    tabs_mode = sim_module.find("div", class_="canvas-view-mode-tabs")
    assert tabs_mode is not None, "Falta .canvas-view-mode-tabs dentro de #canvas-simulator-module"

    # 2. Validar cada ID requerido
    for req_id in REQUIRED_INTERACTIVE_IDS:
        elem = sim_module.find(id=req_id)
        assert elem is not None, f"Falta el identificador interactivo #{req_id} dentro de #canvas-simulator-module"

    # 3. Validar unicidad global estricta en todo el documento para estos IDs
    for req_id in REQUIRED_INTERACTIVE_IDS:
        all_instances = soup.find_all(id=req_id)
        assert len(all_instances) == 1, \
            f"Violación de unicidad DOM global: #{req_id} aparece {len(all_instances)} veces en index.html"

    # 4. Validar que no existan IDs duplicados en el árbol DOM completo de index.html
    all_elements_with_id = soup.find_all(id=True)
    seen_ids = set()
    duplicate_ids = []
    for el in all_elements_with_id:
        eid = el["id"]
        if eid in seen_ids:
            duplicate_ids.append(eid)
        seen_ids.add(eid)
    assert len(duplicate_ids) == 0, f"Se detectaron IDs duplicados en index.html: {duplicate_ids}"

run_test("3. Totalidad y unicidad estricta de IDs interactivos en #canvas-simulator-module y documento", test_all_interactive_ids_and_strict_uniqueness)

# ----------------------------------------------------------------------
# 4. Invariante de Orden DOM y No Anidamiento
# ----------------------------------------------------------------------
def test_dom_order_invariant_and_no_nesting():
    modules = [
        "canvas-simulator-module",
        "canvas-exercises-module",
        "multimodal-simulator-module",
        "gem-studio-module"
    ]

    elements = []
    for mod_id in modules:
        el = soup.find(id=mod_id)
        assert el is not None, f"Falta el módulo #{mod_id} en el DOM"
        elements.append(el)

    # 1. Validar orden físico en el texto fuente
    raw_positions = [raw_html.find(f'id="{m}"') for m in modules]
    for i in range(len(raw_positions) - 1):
        assert raw_positions[i] < raw_positions[i+1], \
            f"Violación de orden físico en fuente: #{modules[i]} (pos {raw_positions[i]}) no precede a #{modules[i+1]} (pos {raw_positions[i+1]})"

    # 2. Validar que ninguno sea descendiente/hijo de otro (hermanos o primos en árbol DOM)
    for i, el1 in enumerate(elements):
        for j, el2 in enumerate(elements):
            if i != j:
                assert el1 not in el2.parents, \
                    f"Violación de anidamiento DOM: #{modules[j]} está anidado dentro de #{modules[i]}"

run_test("4. Invariante de orden DOM estricto (#canvas-sim < #canvas-ex < #mm-sim < #gem-studio) y no anidamiento", test_dom_order_invariant_and_no_nesting)

# ----------------------------------------------------------------------
# 5. Sincronización Espejo Exacta con src/index.html
# ----------------------------------------------------------------------
def test_exact_mirror_with_src_index():
    assert os.path.exists(SRC_INDEX_PATH), "src/index.html debe existir"
    with open(INDEX_PATH, "rb") as f1, open(SRC_INDEX_PATH, "rb") as f2:
        b1 = f1.read()
        b2 = f2.read()
    assert b1 == b2, f"index.html y src/index.html deben ser idénticos byte a byte (len1={len(b1)}, len2={len(b2)})"

run_test("5. Sincronización espejo exacta entre index.html y src/index.html", test_exact_mirror_with_src_index)

# ----------------------------------------------------------------------
# 6. Verificación de Reglas CSS del Modo Split y Distintivos
# ----------------------------------------------------------------------
def test_css_split_mode_and_badges():
    assert os.path.exists(CSS_PATH), "css/styles.css debe existir"
    with open(CSS_PATH, "r", encoding="utf-8") as f:
        css = f.read()

    # 1. Regla .canvas-split-container
    assert ".canvas-split-container" in css, "css/styles.css debe definir .canvas-split-container"
    split_rule_match = re.search(r'\.canvas-split-container\s*\{([^}]+)\}', css)
    assert split_rule_match, "No se encontró el bloque de reglas para .canvas-split-container"
    split_body = split_rule_match.group(1)
    assert "display: grid" in split_body or "display:grid" in split_body, ".canvas-split-container debe usar display: grid"
    assert "grid-template-columns" in split_body, ".canvas-split-container debe definir grid-template-columns"

    # 2. Regla responsive media query
    assert "@media (max-width: 1024px)" in css or "@media (max-width: 992px)" in css or "@media" in css, \
        "Debe existir regla responsive para .canvas-split-container"

    # 3. Reglas de distintivos .canvas-output-badge
    assert ".canvas-output-badge" in css, "css/styles.css debe definir .canvas-output-badge"
    assert ".output-primary" in css, "css/styles.css debe definir .output-primary"
    assert ".output-refinement" in css, "css/styles.css debe definir .output-refinement"

    # 4. Sincronización con src/css/styles.css
    with open(CSS_PATH, "rb") as f1, open(SRC_CSS_PATH, "rb") as f2:
        assert f1.read() == f2.read(), "css/styles.css y src/css/styles.css deben ser idénticos"

run_test("6. Estilos CSS del Modo Split (.canvas-split-container, badges, responsive) y réplica en src/css/", test_css_split_mode_and_badges)

# ----------------------------------------------------------------------
# 7. Verificación Léxica y Prohibición de 'dossier'
# ----------------------------------------------------------------------
def test_lexical_compliance_no_dossier():
    assert "dossier" not in raw_html.lower(), "Término no permitido 'dossier' detectado en index.html"

run_test("7. Cumplimiento léxico: erradicación total del extranjerismo 'dossier'", test_lexical_compliance_no_dossier)

print("======================================================================")
print(f"  RESULTADOS: {results['passed']} PASSED, {results['failed']} FAILED")
print("======================================================================")

if results["failed"] > 0:
    sys.exit(1)
