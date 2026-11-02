/**
 * Empirical Adversarial & Stress Testing Harness for Milestone 1
 * Gemini Canvas Lab (12 modes, 24 exercises, math helpers, JSON discrepancy, mirrors)
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const possibilitiesModule = require("../js/canvas-possibilities.js");
const exercisesModule = require("../js/canvas-exercises.js");

const {
  CANVAS_POSSIBILITIES,
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
  canvasRubricLevel,
  canvasMermaidFlow,
  buildCanvasChecklistHtml,
  buildCanvasFollowUpsHtml,
  exportCanvasPossibilities
} = possibilitiesModule;

const {
  CANVAS_EXERCISES,
  composeCanvasPrompt,
  escapeCanvasHtml,
  formatCanvasStep,
  buildCanvasPromptHtml,
  buildCanvasExerciseHtml,
  countCanvasChecklist,
  canvasSvgFrame,
  canvasSvgBars,
  canvasSvgLine,
  canvasSvgDonut,
  canvasSvgRadar,
  canvasSvgHeatmap,
  canvasSvgFlow,
  canvasSvgMock
} = exercisesModule;

const EXPECTED_MODES = [
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
  "gem-studio"
];

const results = {
  passed: 0,
  failed: 0,
  errors: []
};

function runTest(name, fn) {
  try {
    fn();
    results.passed++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    results.failed++;
    results.errors.push({ name, error: err.message, stack: err.stack });
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

console.log("=== EMPIRICAL STRESS TEST SUITE 1: CANVAS_POSSIBILITIES (12 MODES) ===");

runTest("1.1 Exactly 12 modes in canonical order", () => {
  const keys = Object.keys(CANVAS_POSSIBILITIES);
  assert.equal(keys.length, 12, `Expected 12 modes, got ${keys.length}`);
  assert.deepEqual(keys, EXPECTED_MODES, "Modes keys do not match expected order");
});

runTest("1.2 Structural completeness and field integrity for all 12 modes", () => {
  for (const modeId of EXPECTED_MODES) {
    const p = CANVAS_POSSIBILITIES[modeId];
    assert.ok(p, `Mode ${modeId} is missing or undefined`);
    assert.ok(typeof p.docTitle === "string" && p.docTitle.trim().length > 5, `${modeId}: docTitle missing`);
    assert.ok(typeof p.docIcon === "string" && p.docIcon.trim().length > 0, `${modeId}: docIcon missing`);
    assert.ok(typeof p.userPrompt === "string" && p.userPrompt.trim().length > 50, `${modeId}: userPrompt missing`);
    assert.ok(typeof p.aiResponse === "string" && p.aiResponse.trim().length > 20, `${modeId}: aiResponse missing`);
    assert.ok(typeof p.imageCaption === "string" && p.imageCaption.trim().length > 10, `${modeId}: imageCaption missing`);
    assert.ok(typeof p.interactiveHtml === "string" && p.interactiveHtml.trim().length >= 100, `${modeId}: interactiveHtml missing or too short`);
    assert.ok(typeof p.imageSpec === "object" && p.imageSpec !== null, `${modeId}: imageSpec missing`);
    if (p.followUps) {
      assert.ok(Array.isArray(p.followUps), `${modeId}: followUps must be array`);
      for (const fu of p.followUps) {
        assert.ok(typeof fu === "object" && fu !== null, `${modeId}: followUp must be an object`);
        assert.ok(typeof fu.label === "string" && fu.label.trim().length > 0, `${modeId}: followUp.label invalid`);
        assert.ok(typeof fu.text === "string" && fu.text.trim().length > 0, `${modeId}: followUp.text invalid`);
      }
    }
  }
});

runTest("1.3 PromptParts R-C-I-R-F and embedded data constraints", () => {
  for (const modeId of EXPECTED_MODES) {
    const p = CANVAS_POSSIBILITIES[modeId];
    const parts = p.promptParts;
    assert.ok(parts, `${modeId}: promptParts missing`);
    for (const f of ["role", "context", "instruction", "data", "format"]) {
      assert.ok(typeof parts[f] === "string" && parts[f].trim().length > 0, `${modeId}: promptParts.${f} empty`);
    }
    assert.ok(parts.data.trim().length >= 250, `${modeId}: data must be >= 250 chars (got ${parts.data.trim().length})`);
    assert.ok(parts.instruction.startsWith("En Canvas, "), `${modeId}: instruction must start with 'En Canvas, '`);
    assert.ok(Array.isArray(parts.task) && parts.task.length >= 3 && parts.task.length <= 5, `${modeId}: task count must be 3-5`);
    assert.ok(Array.isArray(parts.constraints) && parts.constraints.length >= 1 && parts.constraints.length <= 3, `${modeId}: constraints count must be 1-3`);
    assert.equal(p.userPrompt, composeCanvasPrompt(parts), `${modeId}: userPrompt must match composeCanvasPrompt(parts)`);
  }
});

runTest("1.4 Expected criteria validation (>= 5 real criteria, non-empty, unique)", () => {
  for (const modeId of EXPECTED_MODES) {
    const p = CANVAS_POSSIBILITIES[modeId];
    assert.ok(Array.isArray(p.expected), `${modeId}: expected must be array`);
    assert.ok(p.expected.length >= 5, `${modeId}: expected length must be >= 5 (got ${p.expected.length})`);
    const criteriaSet = new Set();
    for (let i = 0; i < p.expected.length; i++) {
      const item = p.expected[i];
      assert.ok(typeof item === "object" && item !== null, `${modeId}.expected[${i}] is not an object`);
      assert.ok(typeof item.criterion === "string" && item.criterion.trim().length >= 10, `${modeId}.expected[${i}].criterion invalid`);
      assert.ok(typeof item.how === "string" && item.how.trim().length >= 5, `${modeId}.expected[${i}].how invalid`);
      assert.ok(!criteriaSet.has(item.criterion), `${modeId}: duplicate criterion detected: ${item.criterion}`);
      criteriaSet.add(item.criterion);
    }
  }
});

runTest("1.5 QuickActions validation (>= 2 actions, unique IDs, valid labels and actions/toasts/modals)", () => {
  for (const modeId of EXPECTED_MODES) {
    const p = CANVAS_POSSIBILITIES[modeId];
    assert.ok(Array.isArray(p.quickActions), `${modeId}: quickActions must be array`);
    assert.ok(p.quickActions.length >= 2, `${modeId}: quickActions length must be >= 2 (got ${p.quickActions.length})`);
    const actionIds = new Set();
    for (let i = 0; i < p.quickActions.length; i++) {
      const action = p.quickActions[i];
      assert.ok(typeof action === "object" && action !== null, `${modeId}.quickActions[${i}] is not an object`);
      assert.ok(typeof action.id === "string" && action.id.trim().length > 0, `${modeId}.quickActions[${i}].id empty`);
      assert.ok(typeof action.label === "string" && action.label.trim().length > 0, `${modeId}.quickActions[${i}].label empty`);
      const hasHandler = (typeof action.toast === "string" && action.toast.trim().length > 0) ||
                         (typeof action.action === "string" && action.action.trim().length > 0) ||
                         (typeof action.modal === "object" && action.modal !== null);
      assert.ok(hasHandler, `${modeId}.quickActions[${i}] must have toast, action or modal`);
      assert.ok(!actionIds.has(action.id), `${modeId}: duplicate quickAction id: ${action.id}`);
      actionIds.add(action.id);
    }
  }
});

runTest("1.6 Image existence, format and size check (> 50 KB, JPEG magic bytes)", () => {
  for (const modeId of EXPECTED_MODES) {
    const p = CANVAS_POSSIBILITIES[modeId];
    assert.ok(typeof p.image === "string" && p.image.length > 0, `${modeId}: image path missing`);
    const imgPath = path.resolve(__dirname, "..", p.image);
    assert.ok(fs.existsSync(imgPath), `${modeId}: image file not found at ${imgPath}`);
    const stat = fs.statSync(imgPath);
    assert.ok(stat.size > 50000, `${modeId}: image file size too small: ${stat.size} bytes (must be > 50000)`);
    const buf = fs.readFileSync(imgPath);
    // JPEG magic bytes: FF D8 FF
    assert.equal(buf[0], 0xFF, `${modeId}: image not valid JPEG (byte 0)`);
    assert.equal(buf[1], 0xD8, `${modeId}: image not valid JPEG (byte 1)`);
    assert.equal(buf[2], 0xFF, `${modeId}: image not valid JPEG (byte 2)`);
  }
});

runTest("1.7 Prohibited terms check across all 12 possibilities", () => {
  for (const modeId of EXPECTED_MODES) {
    const p = CANVAS_POSSIBILITIES[modeId];
    const s = JSON.stringify(p);
    assert.doesNotMatch(s, /dossier/i, `${modeId}: contains prohibited term 'dossier'`);
    assert.doesNotMatch(s, /resumen en audio/i, `${modeId}: contains non-native 'resumen en audio'`);
    assert.doesNotMatch(s, /infograf[íi]a/i, `${modeId}: contains non-native 'infografía'`);
    assert.doesNotMatch(s, /Crear →/i, `${modeId}: contains non-native 'Crear →'`);
  }
});

console.log("\n=== EMPIRICAL STRESS TEST SUITE 2: CANVAS_EXERCISES (24 EXERCISES) ===");

runTest("2.1 Exactly 24 exercises (2 per each of the 12 modes)", () => {
  const keys = Object.keys(CANVAS_EXERCISES);
  assert.deepEqual(keys, EXPECTED_MODES, "Exercise modes do not match expected 12 modes");
  let totalEx = 0;
  for (const modeId of EXPECTED_MODES) {
    const exList = CANVAS_EXERCISES[modeId];
    assert.ok(Array.isArray(exList), `${modeId}: exercises must be an array`);
    assert.equal(exList.length, 2, `${modeId}: must have exactly 2 exercises, got ${exList.length}`);
    totalEx += exList.length;
  }
  assert.equal(totalEx, 24, `Total exercises must be 24, got ${totalEx}`);
});

runTest("2.2 Unique IDs across all 24 exercises", () => {
  const seenIds = new Set();
  for (const modeId of EXPECTED_MODES) {
    for (const ex of CANVAS_EXERCISES[modeId]) {
      assert.ok(!seenIds.has(ex.id), `Duplicate exercise ID: ${ex.id}`);
      seenIds.add(ex.id);
    }
  }
  assert.equal(seenIds.size, 24, "Must have 24 unique exercise IDs");
});

runTest("2.3 Structural completeness of each exercise", () => {
  for (const modeId of EXPECTED_MODES) {
    for (const ex of CANVAS_EXERCISES[modeId]) {
      assert.ok(typeof ex.id === "string" && ex.id.length > 0, `${ex.id}: id invalid`);
      assert.ok(typeof ex.title === "string" && ex.title.length > 5, `${ex.id}: title invalid`);
      assert.ok(["Básico", "Intermedio", "Avanzado"].includes(ex.level), `${ex.id}: invalid level '${ex.level}'`);
      assert.match(ex.duration, /^\d+\s*min$/, `${ex.id}: invalid duration format '${ex.duration}'`);
      assert.ok(typeof ex.canvasFeature === "string" && ex.canvasFeature.length > 0, `${ex.id}: canvasFeature invalid`);
      assert.ok(typeof ex.goal === "string" && ex.goal.length > 10, `${ex.id}: goal invalid`);
      assert.ok(typeof ex.scenario === "string" && ex.scenario.length > 10, `${ex.id}: scenario invalid`);
      assert.ok(typeof ex.stretch === "string" && ex.stretch.length > 10, `${ex.id}: stretch invalid`);
      assert.ok(Array.isArray(ex.steps) && ex.steps.length >= 4, `${ex.id}: steps must have >= 4 items`);
      for (const st of ex.steps) {
        assert.ok(typeof st === "string" && st.trim().length > 5, `${ex.id}: step invalid '${st}'`);
      }
      assert.ok(Array.isArray(ex.expected) && ex.expected.length >= 4, `${ex.id}: expected must have >= 4 items`);
      for (const exp of ex.expected) {
        assert.ok(typeof exp === "string" && exp.trim().length > 5, `${ex.id}: expected item invalid '${exp}'`);
      }
    }
  }
});

runTest("2.4 PromptParts R-C-I-R-F and prompt composition for all 24 exercises", () => {
  for (const modeId of EXPECTED_MODES) {
    for (const ex of CANVAS_EXERCISES[modeId]) {
      const parts = ex.promptParts;
      assert.ok(parts, `${ex.id}: promptParts missing`);
      for (const f of ["role", "context", "instruction", "data", "format"]) {
        assert.ok(typeof parts[f] === "string" && parts[f].trim().length > 0, `${ex.id}: promptParts.${f} empty`);
      }
      assert.ok(parts.data.trim().length >= 150, `${ex.id}: promptParts.data must be >= 150 chars (got ${parts.data.trim().length})`);
      assert.ok(Array.isArray(parts.task) && parts.task.length >= 1, `${ex.id}: promptParts.task must have >= 1 item`);
      assert.ok(Array.isArray(parts.constraints) && parts.constraints.length >= 1, `${ex.id}: promptParts.constraints must have >= 1 item`);
      assert.equal(ex.prompt, composeCanvasPrompt(parts), `${ex.id}: prompt must equal composeCanvasPrompt(parts)`);
    }
  }
});

runTest("2.5 Preview SVG markup stress test (well-formed, valid tags, viewBox, no NaN)", () => {
  for (const modeId of EXPECTED_MODES) {
    for (const ex of CANVAS_EXERCISES[modeId]) {
      assert.ok(typeof ex.previewSvg === "string", `${ex.id}: previewSvg is not a string`);
      assert.ok(ex.previewSvg.startsWith("<svg"), `${ex.id}: previewSvg does not start with <svg`);
      assert.ok(ex.previewSvg.endsWith("</svg>"), `${ex.id}: previewSvg does not end with </svg>`);
      assert.ok(ex.previewSvg.includes('viewBox="0 0 320 180"'), `${ex.id}: missing viewBox 0 0 320 180`);
      assert.ok(ex.previewSvg.includes('xmlns="http://www.w3.org/2000/svg"'), `${ex.id}: missing xmlns`);
      assert.doesNotMatch(ex.previewSvg, /\bNaN\b/, `${ex.id}: previewSvg contains NaN!`);
      assert.doesNotMatch(ex.previewSvg, /\bundefined\b/, `${ex.id}: previewSvg contains undefined!`);
      assert.doesNotMatch(ex.previewSvg, /\bnull\b/, `${ex.id}: previewSvg contains null!`);

      // Basic tag balance check
      const openTags = (ex.previewSvg.match(/<([a-zA-Z0-9]+)(\s[^>]*)?>/g) || [])
        .map(t => t.match(/<([a-zA-Z0-9]+)/)[1])
        .filter(t => !["rect", "circle", "line", "polyline", "polygon", "path"].includes(t)); // self-closing or empty in SVG
      const closeTags = (ex.previewSvg.match(/<\/([a-zA-Z0-9]+)>/g) || [])
        .map(t => t.match(/<\/([a-zA-Z0-9]+)>/)[1]);
      
      // Ensure <svg> and <text> tags match
      const svgOpen = openTags.filter(t => t === "svg").length;
      const svgClose = closeTags.filter(t => t === "svg").length;
      assert.equal(svgOpen, svgClose, `${ex.id}: <svg> tags mismatch: open ${svgOpen}, close ${svgClose}`);

      const textOpen = openTags.filter(t => t === "text").length;
      const textClose = closeTags.filter(t => t === "text").length;
      assert.equal(textOpen, textClose, `${ex.id}: <text> tags mismatch: open ${textOpen}, close ${textClose}`);
    }
  }
});

runTest("2.6 Prohibited terms check across all 24 exercises", () => {
  for (const modeId of EXPECTED_MODES) {
    for (const ex of CANVAS_EXERCISES[modeId]) {
      const s = JSON.stringify(ex);
      assert.doesNotMatch(s, /dossier/i, `${ex.id}: contains prohibited term 'dossier'`);
      assert.doesNotMatch(s, /resumen en audio/i, `${ex.id}: contains non-native 'resumen en audio'`);
      assert.doesNotMatch(s, /infograf[íi]a/i, `${ex.id}: contains non-native 'infografía'`);
      assert.doesNotMatch(s, /Crear →/i, `${ex.id}: contains non-native 'Crear →'`);
    }
  }
});

console.log("\n=== EMPIRICAL STRESS TEST SUITE 3: MATHEMATICAL & AUXILIARY HELPERS ===");

runTest("3.1 canvasRound edge cases & precision", () => {
  assert.equal(canvasRound(3.14159, 2), 3.14);
  assert.equal(canvasRound(3.145, 2), 3.15);
  assert.equal(canvasRound(-3.14159, 2), -3.14);
  assert.equal(canvasRound(-3.145, 2), -3.15);
  assert.equal(canvasRound(4.6, 0), 5);
  assert.equal(canvasRound(-4.6, 0), -5);
  assert.equal(canvasRound(0, 4), 0);
  assert.equal(canvasRound(0.1 + 0.2, 1), 0.3);
  assert.equal(canvasRound(1234567.891, 1), 1234567.9);
});

runTest("3.2 canvasFormatNumber & canvasFormatCop (es-CO)", () => {
  assert.equal(canvasFormatNumber(1234567.89, 2), "1.234.567,89");
  assert.equal(canvasFormatNumber(-1234567.89, 2), "-1.234.567,89");
  assert.equal(canvasFormatNumber(0, 0), "0");
  assert.equal(canvasFormatNumber(999, 0), "999");
  assert.equal(canvasFormatNumber(1000, 0), "1.000");
  assert.equal(canvasFormatCop(3500000), "COP 3.500.000");
  assert.equal(canvasFormatCop(0), "COP 0");
  assert.equal(canvasFormatCop(-250000), "COP -250.000");
});

runTest("3.3 canvasSum and canvasAverage robustness", () => {
  assert.equal(canvasSum([]), 0);
  assert.equal(canvasSum([42]), 42);
  assert.equal(canvasSum([10, -5, 25]), 30);
  assert.equal(canvasRound(canvasSum([0.1, 0.2, 0.3]), 2), 0.6);

  assert.equal(canvasAverage([10, 20, 30]), 20);
  assert.equal(canvasAverage([5]), 5);
  assert.throws(() => canvasAverage([]), /No se puede promediar una lista vacía/);
});

runTest("3.4 canvasWeightedScore adversarial conditions", () => {
  // Normal
  assert.equal(canvasWeightedScore([80, 90], [50, 50]), 85);
  assert.equal(canvasWeightedScore([100, 50, 70], [30, 30, 40]), 73);
  // Length mismatch
  assert.throws(() => canvasWeightedScore([80], [50, 50]), /Notas y pesos deben tener la misma cantidad/);
  // Weights != 100
  assert.throws(() => canvasWeightedScore([80, 90], [50, 40]), /Los pesos deben sumar 100/);
  assert.throws(() => canvasWeightedScore([80, 90], [60, 50]), /Los pesos deben sumar 100/);
});

runTest("3.5 canvasMatrixStatus boundaries", () => {
  assert.equal(canvasMatrixStatus(100), "Recomendado");
  assert.equal(canvasMatrixStatus(85), "Recomendado");
  assert.equal(canvasMatrixStatus(84.99), "Admisible con observaciones");
  assert.equal(canvasMatrixStatus(70), "Admisible con observaciones");
  assert.equal(canvasMatrixStatus(69.99), "No cumple");
  assert.equal(canvasMatrixStatus(0), "No cumple");
});

runTest("3.6 canvasContrastRatio & canvasWcagLevel color contrast", () => {
  // Pure black vs white
  const blackWhite = canvasContrastRatio("#000000", "#ffffff");
  assert.ok(Math.abs(blackWhite - 21) < 0.1, `Black/white ratio should be ~21, got ${blackWhite}`);
  assert.equal(canvasWcagLevel(blackWhite), "AAA");

  // Symmetric
  const whiteBlack = canvasContrastRatio("#ffffff", "#000000");
  assert.ok(Math.abs(whiteBlack - blackWhite) < 0.001);

  // Identical colors
  const same = canvasContrastRatio("#2D5A4C", "#2D5A4C");
  assert.equal(canvasRound(same, 2), 1);
  assert.equal(canvasWcagLevel(same), "No cumple");

  // 3-digit hex vs 6-digit hex
  const hex3 = canvasContrastRatio("#fff", "#000");
  assert.ok(Math.abs(hex3 - 21) < 0.1);

  // Invalid hex
  assert.throws(() => canvasContrastRatio("invalid", "#ffffff"), /HEX inválido/);
  assert.throws(() => canvasContrastRatio("#12345", "#ffffff"), /HEX inválido/);

  // WCAG level boundaries
  assert.equal(canvasWcagLevel(7.0), "AAA");
  assert.equal(canvasWcagLevel(6.99), "AA");
  assert.equal(canvasWcagLevel(4.5), "AA");
  assert.equal(canvasWcagLevel(4.49), "AA texto grande");
  assert.equal(canvasWcagLevel(3.0), "AA texto grande");
  assert.equal(canvasWcagLevel(2.99), "No cumple");
});

runTest("3.7 canvasRiskLevel and canvasReportDecision", () => {
  // Levels: Bajo/Baja (1), Medio/Media (2), Alto/Alta (3)
  assert.deepEqual(canvasRiskLevel("Alto", "Alta"), { score: 9, color: "ROJO" });
  assert.deepEqual(canvasRiskLevel("Alto", "Media"), { score: 6, color: "ROJO" });
  assert.deepEqual(canvasRiskLevel("Medio", "Alta"), { score: 6, color: "ROJO" });
  assert.deepEqual(canvasRiskLevel("Medio", "Medio"), { score: 4, color: "ÁMBAR" });
  assert.deepEqual(canvasRiskLevel("Bajo", "Alto"), { score: 3, color: "ÁMBAR" });
  assert.deepEqual(canvasRiskLevel("Bajo", "Media"), { score: 2, color: "VERDE" });
  assert.deepEqual(canvasRiskLevel("Bajo", "Baja"), { score: 1, color: "VERDE" });

  assert.throws(() => canvasRiskLevel("Inexistente", "Alta"), /Riesgo con nivel desconocido/);

  const findingsRojo = [{ risk: { color: "ROJO" } }, { risk: { color: "VERDE" } }];
  assert.ok(canvasReportDecision(findingsRojo).includes("El pago final del 20 % queda retenido"));

  const findingsOk = [{ risk: { color: "ÁMBAR" } }, { risk: { color: "VERDE" } }];
  assert.ok(canvasReportDecision(findingsOk).includes("Se aprueba el pago final con observaciones"));
});

runTest("3.8 canvasLearnerStatus & canvasClassifyDeliveries", () => {
  // Status boundaries
  assert.equal(canvasLearnerStatus(85, 85), "Al día");
  assert.equal(canvasLearnerStatus(90, 85), "Al día");
  assert.equal(canvasLearnerStatus(84.9, 85), "En progreso");
  assert.equal(canvasLearnerStatus(70, 70), "En progreso");
  assert.equal(canvasLearnerStatus(69.9, 90), "Requiere apoyo");
  assert.equal(canvasLearnerStatus(90, 69.9), "Requiere apoyo");

  // Deliveries deduplication and grouping
  const sample = [
    { documento: "101", nombre: "Ana", puntaje: 80 },
    { documento: "102", nombre: "Luis", puntaje: 60 },
    { documento: "103", nombre: "Carlos", puntaje: 40 },
    { documento: "101", nombre: "Ana Duplicada", puntaje: 95 } // Duplicate doc
  ];
  const classified = canvasClassifyDeliveries(sample);
  assert.deepEqual(classified.al_dia, ["Ana"]);
  assert.deepEqual(classified.en_progreso, ["Luis"]);
  assert.deepEqual(classified.apoyo, ["Carlos"]);
});

runTest("3.9 canvasSqlRanking sorting and tie-breaking", () => {
  const learners = [
    { id: 1, ficha_id: 101, nombre: "Aprendiz A" },
    { id: 2, ficha_id: 101, nombre: "Aprendiz B" },
    { id: 3, ficha_id: 102, nombre: "Aprendiz C" }
  ];
  const grades = [
    { aprendiz_id: 1, calificacion: 80 },
    { aprendiz_id: 1, calificacion: 90 }, // avg 85
    { aprendiz_id: 2, calificacion: 90 },
    { aprendiz_id: 2, calificacion: 100 }, // avg 95
    { aprendiz_id: 3, calificacion: 70 } // avg 70
  ];
  const attendance = [
    { aprendiz_id: 1, asistio: true },
    { aprendiz_id: 1, asistio: false }, // 50%
    { aprendiz_id: 2, asistio: true },
    { aprendiz_id: 2, asistio: true }, // 100%
    { aprendiz_id: 3, asistio: true } // 100%
  ];

  const ranking = canvasSqlRanking(learners, grades, attendance);
  // Ficha 101: Aprendiz B (95) should be rank 1, Aprendiz A (85) rank 2
  const ficha101 = ranking.filter(r => r.ficha_id === 101);
  assert.equal(ficha101[0].nombre, "Aprendiz B");
  assert.equal(ficha101[0].puesto, 1);
  assert.equal(ficha101[0].promedio, 95);
  assert.equal(ficha101[0].pct_asistencia, 100);

  assert.equal(ficha101[1].nombre, "Aprendiz A");
  assert.equal(ficha101[1].puesto, 2);
  assert.equal(ficha101[1].promedio, 85);
  assert.equal(ficha101[1].pct_asistencia, 50);

  // Ficha 102: Aprendiz C should be rank 1
  const ficha102 = ranking.filter(r => r.ficha_id === 102);
  assert.equal(ficha102[0].nombre, "Aprendiz C");
  assert.equal(ficha102[0].puesto, 1);
});

runTest("3.10 canvasRubricLevel scale", () => {
  assert.equal(canvasRubricLevel(5.0), "Excelente");
  assert.equal(canvasRubricLevel(4.5), "Excelente");
  assert.equal(canvasRubricLevel(4.49), "Bueno");
  assert.equal(canvasRubricLevel(3.8), "Bueno");
  assert.equal(canvasRubricLevel(3.79), "En desarrollo");
  assert.equal(canvasRubricLevel(3.0), "En desarrollo");
  assert.equal(canvasRubricLevel(2.99), "Requiere refuerzo");
  assert.equal(canvasRubricLevel(1.0), "Requiere refuerzo");
});

runTest("3.11 HTML generation helpers escaping and structure", () => {
  assert.equal(escapeCanvasHtml("<b>test & 'quotes'</b>"), "&lt;b&gt;test &amp; &#39;quotes&#39;&lt;/b&gt;");
  
  const checklistHtml = buildCanvasChecklistHtml([
    { criterion: "Criterio A", how: "Paso A" },
    { criterion: "Criterio B", how: "Paso B" }
  ]);
  assert.ok(checklistHtml.includes("Criterio A"));
  assert.ok(checklistHtml.includes("Paso A"));

  const followUpsHtml = buildCanvasFollowUpsHtml([
    { label: "Paso 1", text: "Pregunta 1" },
    { label: "Paso 2", text: "Pregunta 2" }
  ]);
  assert.ok(followUpsHtml.includes("Pregunta 1"));
  assert.ok(followUpsHtml.includes("Pregunta 2"));
  assert.ok(followUpsHtml.includes("Paso 1"));
});

console.log("\n=== EMPIRICAL STRESS TEST SUITE 4: JSON DISCREPANCY & MIRROR PARITY ===");

const jsonPath = path.resolve(__dirname, "..", "materiales", "gemini_canvas", "banco_prompts_canvas.json");

runTest("4.1 banco_prompts_canvas.json exists, valid JSON, correct totals", () => {
  assert.ok(fs.existsSync(jsonPath), `JSON file not found at ${jsonPath}`);
  const raw = fs.readFileSync(jsonPath, "utf8");
  const bank = JSON.parse(raw);
  assert.equal(bank.totalPossibilities, 12, `bank.totalPossibilities must be 12, got ${bank.totalPossibilities}`);
  assert.equal(bank.totalExercises, 24, `bank.totalExercises must be 24, got ${bank.totalExercises}`);
  assert.equal(bank.possibilities.length, 12, `bank.possibilities.length must be 12, got ${bank.possibilities.length}`);

  const totalEx = bank.possibilities.reduce((acc, p) => acc + (p.exercises ? p.exercises.length : 0), 0);
  assert.equal(totalEx, 24, `Sum of exercises in bank must be 24, got ${totalEx}`);
});

runTest("4.2 Deep discrepancy check: Possibilities in JSON vs JS module", () => {
  const bank = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  for (let i = 0; i < EXPECTED_MODES.length; i++) {
    const modeId = EXPECTED_MODES[i];
    const jsPoss = CANVAS_POSSIBILITIES[modeId];
    const jsonPoss = bank.possibilities[i];

    assert.equal(jsonPoss.id, modeId, `Index ${i}: expected id ${modeId}, got ${jsonPoss.id}`);
    assert.equal(jsonPoss.number, String(i + 1), `Number mismatch for ${modeId}`);
    assert.equal(jsonPoss.icon, jsPoss.docIcon, `Icon mismatch for ${modeId}`);
    assert.equal(jsonPoss.image, jsPoss.image, `Image mismatch for ${modeId}`);
    assert.equal(jsonPoss.imageCaption, jsPoss.imageCaption, `Image caption mismatch for ${modeId}`);
    assert.equal(jsonPoss.masterPrompt, jsPoss.userPrompt, `MasterPrompt mismatch for ${modeId}`);
    
    // QuickActions vs canvasControls
    const expectedControls = jsPoss.quickActions.map(a => a.label);
    assert.deepEqual(jsonPoss.canvasControls, expectedControls, `canvasControls mismatch for ${modeId}`);

    // Expected criteria
    assert.deepEqual(jsonPoss.expected, jsPoss.expected, `Expected criteria mismatch for ${modeId}`);

    // FollowUps
    assert.deepEqual(jsonPoss.followUps, jsPoss.followUps || [], `FollowUps mismatch for ${modeId}`);

    // ImageSpec
    assert.deepEqual(jsonPoss.imageSpec, jsPoss.imageSpec, `ImageSpec mismatch for ${modeId}`);
  }
});

runTest("4.3 Deep discrepancy check: Exercises in JSON vs JS module", () => {
  const bank = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  for (const jsonPoss of bank.possibilities) {
    const modeId = jsonPoss.id;
    const jsExercises = CANVAS_EXERCISES[modeId];
    assert.ok(Array.isArray(jsonPoss.exercises), `JSON mode ${modeId} has no exercises array`);
    assert.equal(jsonPoss.exercises.length, 2, `JSON mode ${modeId} exercises count != 2`);

    for (let j = 0; j < 2; j++) {
      const jsEx = jsExercises[j];
      const jsonEx = jsonPoss.exercises[j];

      assert.equal(jsonEx.id, jsEx.id, `Exercise ID mismatch: ${jsonEx.id} !== ${jsEx.id}`);
      assert.equal(jsonEx.title, jsEx.title, `Exercise title mismatch in ${jsEx.id}`);
      assert.equal(jsonEx.level, jsEx.level, `Exercise level mismatch in ${jsEx.id}`);
      assert.equal(jsonEx.duration, jsEx.duration, `Exercise duration mismatch in ${jsEx.id}`);
      assert.equal(jsonEx.canvasFeature, jsEx.canvasFeature, `Exercise canvasFeature mismatch in ${jsEx.id}`);
      assert.equal(jsonEx.goal, jsEx.goal, `Exercise goal mismatch in ${jsEx.id}`);
      assert.equal(jsonEx.scenario, jsEx.scenario, `Exercise scenario mismatch in ${jsEx.id}`);
      assert.deepEqual(jsonEx.promptParts, jsEx.promptParts, `Exercise promptParts mismatch in ${jsEx.id}`);
      assert.deepEqual(jsonEx.steps, jsEx.steps, `Exercise steps mismatch in ${jsEx.id}`);
      assert.deepEqual(jsonEx.expected, jsEx.expected, `Exercise expected mismatch in ${jsEx.id}`);
      assert.equal(jsonEx.stretch, jsEx.stretch, `Exercise stretch mismatch in ${jsEx.id}`);
      assert.equal(jsonEx.prompt, jsEx.prompt, `Exercise prompt mismatch in ${jsEx.id}`);
    }
  }
});

runTest("4.4 Idempotence of exportCanvasPossibilities", () => {
  const raw = fs.readFileSync(jsonPath, "utf8");
  const bank = JSON.parse(raw);
  const exported = exportCanvasPossibilities(bank);
  assert.deepEqual(exported, bank, "exportCanvasPossibilities(bank) must be idempotent and match bank");
});

runTest("4.5 SHA-256 exact parity across src/ mirrors", () => {
  function getHash(relPath) {
    const full = path.resolve(__dirname, "..", relPath);
    assert.ok(fs.existsSync(full), `File not found: ${relPath}`);
    return crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
  }

  // canvas-possibilities.js
  const hashPossRoot = getHash("js/canvas-possibilities.js");
  const hashPossShared = getHash("src/shared/canvas-possibilities.js");
  const hashPossSrcJs = getHash("src/js/canvas-possibilities.js");
  assert.equal(hashPossShared, hashPossRoot, "src/shared/canvas-possibilities.js hash mismatch");
  assert.equal(hashPossSrcJs, hashPossRoot, "src/js/canvas-possibilities.js hash mismatch");

  // canvas-exercises.js
  const hashExRoot = getHash("js/canvas-exercises.js");
  const hashExShared = getHash("src/shared/canvas-exercises.js");
  const hashExSrcJs = getHash("src/js/canvas-exercises.js");
  assert.equal(hashExShared, hashExRoot, "src/shared/canvas-exercises.js hash mismatch");
  assert.equal(hashExSrcJs, hashExRoot, "src/js/canvas-exercises.js hash mismatch");

  // canvas_gem_studio.jpg
  const hashGemRoot = getHash("assets/images/canvas/canvas_gem_studio.jpg");
  const hashGemSrc = getHash("src/assets/images/canvas/canvas_gem_studio.jpg");
  assert.equal(hashGemSrc, hashGemRoot, "src/assets/images/canvas/canvas_gem_studio.jpg hash mismatch");

  // canvas_multimodal_sketch.jpg
  const hashMmRoot = getHash("assets/images/canvas/canvas_multimodal_sketch.jpg");
  const hashMmSrc = getHash("src/assets/images/canvas/canvas_multimodal_sketch.jpg");
  assert.equal(hashMmSrc, hashMmRoot, "src/assets/images/canvas/canvas_multimodal_sketch.jpg hash mismatch");
});

console.log("\n========================================================");
console.log(`TOTAL TESTS: ${results.passed + results.failed}`);
console.log(`PASSED: ${results.passed}`);
console.log(`FAILED: ${results.failed}`);
console.log("========================================================");

if (results.failed > 0) {
  process.exit(1);
}
