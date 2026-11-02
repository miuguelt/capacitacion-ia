"""
Deep Adversarial Stress and Fuzzing Harness for Milestone 1
Tests SVG XML validity, prohibited tokens, setTimeout violations, and math boundaries.
"""
import json
import os
import re
import xml.etree.ElementTree as ET
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(BASE_DIR, "materiales", "gemini_canvas", "banco_prompts_canvas.json")
POSSIBILITIES_JS = os.path.join(BASE_DIR, "js", "canvas-possibilities.js")
EXERCISES_JS = os.path.join(BASE_DIR, "js", "canvas-exercises.js")

results = {"passed": 0, "failed": 0, "errors": []}

def test(name, fn):
    try:
        fn()
        results["passed"] += 1
        print(f"  [PASS] {name}")
    except Exception as e:
        results["failed"] += 1
        results["errors"].append((name, str(e)))
        print(f"  [FAIL] {name}: {e}")

print("=== ADVERSARIAL DEEP DIVE & FUZZING ===")

# 1. XML Parsing of all 24 exercise SVGs
def test_all_exercise_svgs_xml_validity():
    # Load exercises via node
    node_cmd = [
        "node", "-e",
        "const { CANVAS_EXERCISES } = require('./js/canvas-exercises.js');"
        "console.log(JSON.stringify(Object.values(CANVAS_EXERCISES).flat().map(e => ({ id: e.id, svg: e.previewSvg }))));"
    ]
    p = subprocess.run(node_cmd, capture_output=True, text=True, cwd=BASE_DIR, check=True)
    exercises = json.loads(p.stdout)
    assert len(exercises) == 24, f"Expected 24 exercises, got {len(exercises)}"

    for ex in exercises:
        svg_str = ex["svg"]
        assert svg_str.startswith("<svg"), f"{ex['id']} SVG does not start with <svg"
        assert svg_str.endswith("</svg>"), f"{ex['id']} SVG does not end with </svg>"
        # Parse with ET
        try:
            root = ET.fromstring(svg_str)
            assert "svg" in root.tag.lower(), f"{ex['id']} root is not svg: {root.tag}"
        except ET.ParseError as pe:
            raise AssertionError(f"XML parse error in {ex['id']}: {pe}\nSnippet: {svg_str[:150]}")

test("1. XML Strict Parsing for all 24 previewSvg outputs", test_all_exercise_svgs_xml_validity)

# 2. Check for setTimeout or timer simulation in interactiveHtml and JS files
def test_no_fictitious_settimeout():
    node_cmd = [
        "node", "-e",
        "const { CANVAS_POSSIBILITIES } = require('./js/canvas-possibilities.js');"
        "const list = Object.entries(CANVAS_POSSIBILITIES).map(([id, p]) => ({ id, html: p.interactiveHtml }));"
        "console.log(JSON.stringify(list));"
    ]
    p = subprocess.run(node_cmd, capture_output=True, text=True, cwd=BASE_DIR, check=True)
    modes = json.loads(p.stdout)
    for m in modes:
        html = m["html"]
        assert "setTimeout" not in html, f"setTimeout found in interactiveHtml of {m['id']}"
        assert "setInterval" not in html, f"setInterval found in interactiveHtml of {m['id']}"

test("2. Zero fictitious timers (setTimeout / setInterval) in interactiveHtml", test_no_fictitious_settimeout)

# 3. Exhaustive Lexical Scanner for Prohibited Words in All Data Files
def test_exhaustive_lexical_prohibitions():
    prohibited_patterns = [
        (r"\bdossier\b", "dossier"),
        (r"infograf[íi]a", "infografía"),
        (r"resumen en audio", "resumen en audio"),
        (r"Crear →", "Crear →")
    ]
    files_to_scan = [
        os.path.join(BASE_DIR, "js", "canvas-possibilities.js"),
        os.path.join(BASE_DIR, "js", "canvas-exercises.js"),
        os.path.join(BASE_DIR, "src", "shared", "canvas-possibilities.js"),
        os.path.join(BASE_DIR, "src", "js", "canvas-possibilities.js"),
        os.path.join(BASE_DIR, "src", "shared", "canvas-exercises.js"),
        os.path.join(BASE_DIR, "src", "js", "canvas-exercises.js"),
        JSON_PATH
    ]
    for fpath in files_to_scan:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        rel = os.path.relpath(fpath, BASE_DIR)
        for pattern, label in prohibited_patterns:
            matches = list(re.finditer(pattern, content, re.IGNORECASE))
            assert len(matches) == 0, f"Found {len(matches)} match(es) of '{label}' in {rel}: {[m.group(0) for m in matches[:3]]}"

test("3. Exhaustive lexical scanner (cero dossier, cero infografía, cero resumen en audio, cero Crear →)", test_exhaustive_lexical_prohibitions)

# 4. Math Fuzzing via Node.js
def test_math_fuzzing():
    fuzz_script = """
    const {
      canvasRound,
      canvasFormatNumber,
      canvasFormatCop,
      canvasSum,
      canvasAverage,
      canvasWeightedScore,
      canvasMatrixStatus,
      canvasContrastRatio,
      canvasWcagLevel,
      canvasRiskLevel,
      canvasReportDecision,
      canvasLearnerStatus,
      canvasClassifyDeliveries,
      canvasSqlRanking,
      canvasRubricLevel
    } = require('./js/canvas-possibilities.js');
    const assert = require('assert/strict');

    // 1. canvasRound with tricky float half-way cases
    assert.equal(canvasRound(1.005, 2), 1.01);
    assert.equal(canvasRound(2.675, 2), 2.68);
    assert.equal(canvasRound(1.055, 2), 1.06);
    assert.equal(canvasRound(-1.005, 2), -1.01);

    // 2. canvasContrastRatio with uppercase, lowercase, mixed case
    assert.equal(canvasWcagLevel(canvasContrastRatio('#FFFFFF', '#000000')), 'AAA');
    assert.equal(canvasWcagLevel(canvasContrastRatio('#ffffff', '#000000')), 'AAA');
    assert.equal(canvasWcagLevel(canvasContrastRatio('#FfFfFf', '#000000')), 'AAA');

    // 3. canvasWeightedScore sum validation (weights sum to 100.1 != 100)
    assert.throws(() => canvasWeightedScore([10, 20], [99.9, 0.2]), /Los pesos deben sumar 100/);

    // 4. canvasClassifyDeliveries with 100 deliveries and random scores
    const largeList = [];
    for (let i = 0; i < 100; i++) {
      largeList.push({ documento: 'DOC_' + (i % 20), nombre: 'Persona ' + i, puntaje: (i * 3) % 100 });
    }
    const res = canvasClassifyDeliveries(largeList);
    assert.equal(res.al_dia.length + res.en_progreso.length + res.apoyo.length, 20); // only 20 unique docs

    // 5. canvasSqlRanking with identical scores (tie-breaking preservation)
    const tieLearners = [
      { id: 1, ficha_id: 1, nombre: 'A' },
      { id: 2, ficha_id: 1, nombre: 'B' }
    ];
    const tieGrades = [
      { aprendiz_id: 1, calificacion: 80 },
      { aprendiz_id: 2, calificacion: 80 }
    ];
    const tieRanking = canvasSqlRanking(tieLearners, tieGrades, []);
    assert.equal(tieRanking[0].puesto, 1);
    assert.equal(tieRanking[1].puesto, 2);
    assert.equal(tieRanking[0].promedio, 80);
    assert.equal(tieRanking[1].promedio, 80);
    assert.equal(tieRanking[0].pct_asistencia, null);
    """
    node_cmd = ["node", "-e", fuzz_script]
    p = subprocess.run(node_cmd, capture_output=True, text=True, cwd=BASE_DIR)
    if p.returncode != 0:
        raise AssertionError(f"Math fuzzing failed:\nSTDOUT: {p.stdout}\nSTDERR: {p.stderr}")

test("4. Mathematical helper functions fuzzing and stress boundaries", test_math_fuzzing)

# 5. Check images integrity directly from CANVAS_POSSIBILITIES
def test_images_integrity():
    node_cmd = [
        "node", "-e",
        "const { CANVAS_POSSIBILITIES } = require('./js/canvas-possibilities.js');"
        "console.log(JSON.stringify(Object.values(CANVAS_POSSIBILITIES).map(p => p.image)));"
    ]
    p = subprocess.run(node_cmd, capture_output=True, text=True, cwd=BASE_DIR, check=True)
    images = json.loads(p.stdout)
    assert len(images) == 12, f"Expected 12 images, got {len(images)}"

    for rel in images:
        fpath = os.path.join(BASE_DIR, rel)
        assert os.path.exists(fpath), f"Missing image: {rel}"
        sz = os.path.getsize(fpath)
        assert sz > 50000, f"Image {rel} size is {sz} bytes (must be > 50000)"
        with open(fpath, "rb") as f:
            header = f.read(3)
            assert header == b"\xff\xd8\xff", f"Image {rel} is not a valid JPEG"

test("5. All 12 canvas reference images exist, > 50 KB, valid JPEG headers", test_images_integrity)

print(f"\nTOTAL: {results['passed'] + results['failed']}, PASSED: {results['passed']}, FAILED: {results['failed']}")
if results["failed"] > 0:
    sys.exit(1)
