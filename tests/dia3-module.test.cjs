// Pruebas del módulo Día 3 (Agentes, Web en 3 Archivos, Propiedad Intelectual y Seguridad de APIs).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  DIA3_CATEGORIES,
  DIA3_LEARNERS,
  DIA3_HARDWARE_PROFILES,
  DIA3_SECURITY_PRESETS,
  DIA3_EXAMPLES,
  DIA3_EXERCISES,
  DIA3_BLOCKS,
  dia3CategorizeExtension,
  dia3ComputeFileInventory,
  dia3ComputeInstructorKpis,
  dia3FilterLearners,
  dia3AuditCodeSecurity,
  dia3EstimateTokenBudget,
  dia3EvaluateHardwareProfile,
  buildDia3ExampleHtml,
  buildDia3AuditResultHtml,
  buildDia3BudgetResultHtml
} = require(path.join(__dirname, "..", "js", "dia3-module.js"));

const { composeCanvasPrompt } = require(path.join(__dirname, "..", "js", "canvas-exercises.js"));

test("los bloques y ejemplos del Día 3 existen en el orden canónico", () => {
  assert.deepEqual(DIA3_BLOCKS.map(b => b.id), [
    "agentes-archivos",
    "web-tres-archivos",
    "propiedad-apis"
  ]);
  for (const b of DIA3_BLOCKS) {
    assert.equal(DIA3_EXERCISES[b.id].length, 2, `${b.id} debe tener 2 ejercicios`);
  }
  assert.equal(Object.keys(DIA3_EXAMPLES).length, 4);
  assert.deepEqual(Object.keys(DIA3_EXAMPLES), [
    "diagnostico-pc",
    "clasificador-200",
    "panel-3-archivos",
    "pasarela-bff-segura"
  ]);
});

test("cada ejercicio del Día 3 sigue la fórmula R-C-I-R-F, incluye datos y vista previa SVG", () => {
  const all = DIA3_BLOCKS.flatMap(b => DIA3_EXERCISES[b.id]);
  assert.equal(all.length, 6);
  const ids = new Set();
  for (const ex of all) {
    assert.ok(!ids.has(ex.id), `id duplicado: ${ex.id}`);
    ids.add(ex.id);
    for (const f of ["title", "level", "duration", "canvasFeature", "goal", "scenario", "stretch", "previewSvg"]) {
      assert.equal(typeof ex[f], "string", `${ex.id}.${f}`);
      assert.ok(ex[f].trim().length > 0, `${ex.id}.${f} vacío`);
    }
    assert.match(ex.previewSvg, /^<svg[\s\S]*role="img"[\s\S]*aria-label="[^"]+"[\s\S]*<\/svg>$/);
    assert.equal(ex.prompt, composeCanvasPrompt(ex.promptParts));
    assert.ok(ex.promptParts.data.trim().length >= 140, `${ex.id}: datos suficientes`);
    assert.ok(ex.steps.length >= 4, `${ex.id}: mínimo 4 pasos`);
    assert.ok(ex.expected.length >= 4, `${ex.id}: mínimo 4 criterios`);
    assert.doesNotMatch(JSON.stringify(ex), /dossier/i);
  }
});

test("dia3CategorizeExtension y dia3ComputeFileInventory clasifican y detectan colisiones", () => {
  assert.equal(dia3CategorizeExtension(".PDF"), "Documentos");
  assert.equal(dia3CategorizeExtension(".png"), "Imágenes");
  assert.equal(dia3CategorizeExtension(".py"), "Código y Scripts");
  assert.equal(dia3CategorizeExtension(".json"), "Datos y Tablas");
  assert.equal(dia3CategorizeExtension(".zip"), "Comprimidos y Backups");
  assert.equal(dia3CategorizeExtension(".unknown"), "Otros");
  assert.equal(dia3CategorizeExtension(""), "Otros");

  const inv = dia3ComputeFileInventory([
    { name: "acta_1.pdf", sizeKb: 120 },
    { name: "acta_1.pdf", sizeKb: 80 },
    { name: "foto.png", sizeKb: 300 },
    { name: "script.py", sizeKb: 10 },
    { name: "datos.csv", sizeKb: 40 },
    { name: "backup.zip", sizeKb: 500 },
    { name: "raro.bin", sizeKb: 5 },
    { name: "README_SIN_EXTENSION", sizeKb: 2 }
  ]);
  assert.equal(inv.totalFiles, 8);
  assert.equal(inv.totalSizeKb, 1057);
  assert.deepEqual(inv.collisions, ["acta_1.pdf"]);
  assert.equal(inv.byCategory["Documentos"], 2);
  assert.equal(inv.byCategory["Imágenes"], 1);
  assert.equal(inv.byCategory["Código y Scripts"], 1);
  assert.equal(inv.byCategory["Datos y Tablas"], 1);
  assert.equal(inv.byCategory["Comprimidos y Backups"], 1);
  assert.equal(inv.byCategory["Otros"], 2);

  const emptyInv = dia3ComputeFileInventory([]);
  assert.equal(emptyInv.totalFiles, 0);
  assert.equal(emptyInv.totalSizeKb, 0);
  assert.deepEqual(emptyInv.collisions, []);
});

test("dia3ComputeInstructorKpis y dia3FilterLearners calculan KPIs y filtran aprendices", () => {
  assert.equal(DIA3_LEARNERS.length, 8);
  const kpis = dia3ComputeInstructorKpis(DIA3_LEARNERS);
  assert.equal(kpis.total, 8);
  assert.equal(kpis.alDia, 3);
  assert.equal(kpis.enProgreso, 3);
  assert.equal(kpis.requiereApoyo, 2);
  assert.equal(kpis.promedioAsistencia, 86.9);
  assert.equal(kpis.promedioEvidenciasPct, 79.7);

  const emptyKpis = dia3ComputeInstructorKpis([]);
  assert.equal(emptyKpis.total, 0);
  assert.equal(emptyKpis.promedioAsistencia, 0);

  assert.equal(dia3FilterLearners(DIA3_LEARNERS, "", "todos").length, 8);
  assert.equal(dia3FilterLearners(DIA3_LEARNERS, "andrés", "todos").length, 1);
  assert.equal(dia3FilterLearners(DIA3_LEARNERS, "2871", "Requiere apoyo").length, 2);
  assert.equal(dia3FilterLearners(DIA3_LEARNERS, "inexistente", "Al día").length, 0);
});

test("dia3EvaluateHardwareProfile diagnostica estaciones de cómputo", () => {
  assert.equal(Object.keys(DIA3_HARDWARE_PROFILES).length, 3);
  const slow = dia3EvaluateHardwareProfile(DIA3_HARDWARE_PROFILES["sala3-lenta"]);
  assert.equal(slow.status, "CRÍTICO");
  assert.ok(slow.bottlenecks.length >= 2);

  const mid = dia3EvaluateHardwareProfile({
    name: "Equipo Medio",
    cpuUsage: 78,
    ramUsedGb: 13,
    ramTotalGb: 16,
    diskFreeGb: 28,
    diskType: "SSD SATA"
  });
  assert.equal(mid.status, "ADVERTENCIA");

  const good = dia3EvaluateHardwareProfile(DIA3_HARDWARE_PROFILES["portatil-optimo"]);
  assert.equal(good.status, "ÓPTIMO");
  assert.equal(good.bottlenecks.length, 0);

  const singleBottle = dia3EvaluateHardwareProfile({
    name: "Disco lleno pero CPU baja",
    cpuUsage: 30,
    ramUsedGb: 4,
    ramTotalGb: 16,
    diskFreeGb: 10,
    diskType: "SSD NVMe",
    cpuModel: "CPU",
    topProcess: "Idle"
  });
  assert.equal(singleBottle.status, "ADVERTENCIA");

  const highRamOnly = dia3EvaluateHardwareProfile({
    name: "RAM media-alta",
    cpuUsage: 40,
    ramUsedGb: 12,
    ramTotalGb: 16,
    diskFreeGb: 100,
    diskType: "SSD NVMe",
    cpuModel: "CPU",
    topProcess: "App"
  });
  assert.equal(highRamOnly.status, "ADVERTENCIA");
});

test("dia3AuditCodeSecurity soporta los 4 estados: vacío, crítico, advertencia y seguro", () => {
  const emptyRes = dia3AuditCodeSecurity("   ");
  assert.equal(emptyRes.status, "VACÍO");
  assert.equal(emptyRes.findings.length, 0);

  const vulnRes = dia3AuditCodeSecurity(DIA3_SECURITY_PRESETS["vulnerable"].code);
  assert.equal(vulnRes.status, "CRÍTICO");
  assert.ok(vulnRes.findings.some(f => f.id === "hardcoded-key"));
  assert.ok(vulnRes.findings.some(f => f.id === "infinite-loop"));
  assert.ok(vulnRes.findings.some(f => f.id === "copyleft-license"));
  assert.ok(vulnRes.findings.some(f => f.id === "direct-frontend-call"));

  const warnRes = dia3AuditCodeSecurity(DIA3_SECURITY_PRESETS["warning"].code);
  assert.equal(warnRes.status, "ADVERTENCIA");
  assert.ok(warnRes.findings.some(f => f.severity === "ADVERTENCIA"));

  const safeRes = dia3AuditCodeSecurity(DIA3_SECURITY_PRESETS["secure"].code);
  assert.equal(safeRes.status, "SEGURO");
  assert.equal(safeRes.findings.length, 0);
});

test("dia3EstimateTokenBudget calcula tokens mensuales, costo USD/COP y techos", () => {
  assert.throws(() => dia3EstimateTokenBudget(0, 500, 300), /valores positivos/);
  assert.throws(() => dia3EstimateTokenBudget(100, -1, 300), /valores positivos/);
  assert.throws(() => dia3EstimateTokenBudget(100, 500, 0), /valores positivos/);

  const b = dia3EstimateTokenBudget(200, 1000, 500);
  // 200 req/day * 30 = 6000 req/month -> 6M input, 3M output
  assert.equal(b.monthlyRequests, 6000);
  assert.equal(b.monthlyInputTokens, 6000000);
  assert.equal(b.monthlyOutputTokens, 3000000);
  assert.ok(b.estimatedUsd > 0);
  assert.ok(b.hardLimitUsd > b.estimatedUsd);
  assert.ok(b.softAlertUsd < b.hardLimitUsd);
});

test("constructores HTML de ejemplos, auditoría y presupuesto escapan y generan marcado válido", () => {
  for (const key of Object.keys(DIA3_EXAMPLES)) {
    const html = buildDia3ExampleHtml(key, "preview");
    assert.ok(html.includes(DIA3_EXAMPLES[key].title));
    assert.ok(buildDia3ExampleHtml(key, "code").includes("<pre"));
    assert.ok(buildDia3ExampleHtml(key, "prompt").includes("data-dia3-copy-prompt"));
    assert.ok(buildDia3ExampleHtml(key, "compare").includes("col-good"));
  }
  assert.equal(buildDia3ExampleHtml("inexistente", "preview"), "");

  const emptyHtml = buildDia3AuditResultHtml(dia3AuditCodeSecurity(""));
  assert.ok(emptyHtml.includes("Entrada vacía"));
  const critHtml = buildDia3AuditResultHtml(dia3AuditCodeSecurity(DIA3_SECURITY_PRESETS["vulnerable"].code));
  assert.ok(critHtml.includes("CRÍTICO"));
  const warnHtml = buildDia3AuditResultHtml(dia3AuditCodeSecurity(DIA3_SECURITY_PRESETS["warning"].code));
  assert.ok(warnHtml.includes("ADVERTENCIA"));
  const safeHtml = buildDia3AuditResultHtml(dia3AuditCodeSecurity(DIA3_SECURITY_PRESETS["secure"].code));
  assert.ok(safeHtml.includes("SEGURO"));

  const { buildDia3HardwareCardHtml } = require(path.join(__dirname, "..", "js", "dia3-module.js"));
  for (const pKey of Object.keys(DIA3_HARDWARE_PROFILES)) {
    const p = DIA3_HARDWARE_PROFILES[pKey];
    const card = buildDia3HardwareCardHtml(p, dia3EvaluateHardwareProfile(p));
    assert.ok(card.includes(p.name));
  }

  const budgetHtml = buildDia3BudgetResultHtml(dia3EstimateTokenBudget(100, 800, 400));
  assert.ok(budgetHtml.includes("Hard Limit"));
});
