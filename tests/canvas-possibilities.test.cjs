// Pruebas del simulador de Gemini Canvas Lab: los 10 prompts deben ser autosuficientes
// y cada cifra del resultado esperado debe salir de los datos del propio prompt (node:test).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const kit = require(path.join(__dirname, "..", "js", "canvas-possibilities.js"));
const { composeCanvasPrompt } = require(path.join(__dirname, "..", "js", "canvas-exercises.js"));
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
} = kit;

const MODES = [
  "doc-editorial", "code-prototyping", "data-matrix", "flowchart-diagram", "visual-mockup",
  "inline-prompting", "algorithm-refactor", "rubric-curriculum", "sql-pipeline", "executive-report",
  "multimodal-vision", "gem-studio"
];
const all = () => MODES.map(id => [id, CANVAS_POSSIBILITIES[id]]);
const textOf = p => JSON.stringify([p.expected, p.interactiveHtml, p.imageSpec, p.aiResponse, p.imageCaption, p.quickActions]);

// --- Estructura de los 12 modos ---

test("los 12 modos existen en el orden del simulador", () => {
  assert.deepEqual(Object.keys(CANVAS_POSSIBILITIES), MODES);
});

test("cada prompt sigue R-C-I-R-F, trae sus datos y se compone con composeCanvasPrompt", () => {
  for (const [id, p] of all()) {
    const parts = p.promptParts;
    for (const field of ["role", "context", "data", "instruction", "format"]) {
      assert.ok(typeof parts[field] === "string" && parts[field].trim(), `${id}.promptParts.${field}`);
    }
    assert.ok(parts.data.trim().length >= 250, `${id}: los datos deben bastar para resolver el prompt`);
    assert.match(parts.instruction, /^En Canvas, /, `${id}: la instrucción pide el trabajo a Gemini dentro de Canvas`);
    assert.doesNotMatch(p.userPrompt, /Abre un Canvas/, `${id}: el prompt no da órdenes de interfaz que parezcan pasos del aprendiz`);
    assert.ok(parts.task.length >= 3 && parts.task.length <= 5, `${id}: entre 3 y 5 tareas`);
    assert.ok(parts.constraints.length >= 1 && parts.constraints.length <= 3, `${id}: entre 1 y 3 restricciones`);
    assert.equal(p.userPrompt, composeCanvasPrompt(parts), `${id}: userPrompt sale de composeCanvasPrompt`);
    const words = (p.userPrompt.replace(parts.data.trim(), "").match(/\S+/g) || []).length;
    assert.ok(words <= 280, `${id}: el prompt sin datos tiene ${words} palabras (máximo 280)`);
  }
});

test("cada modo trae criterios verificables, cómo comprobarlos y su imagen", () => {
  for (const [id, p] of all()) {
    for (const field of ["name", "docIcon", "docTitle", "image", "imageCaption", "aiResponse", "interactiveHtml", "insightsHtml", "variationTip"]) {
      assert.equal(typeof p[field], "string", `${id}.${field}`);
      assert.ok(p[field].trim(), `${id}.${field} no puede estar vacío`);
    }
    assert.ok(p.expected.length >= 5, `${id}: mínimo 5 criterios`);
    for (const item of p.expected) {
      assert.ok(item.criterion.trim() && item.how.trim(), `${id}: criterio y forma de comprobarlo`);
    }
    assert.match(p.image, /^assets\/images\/canvas\/canvas_[a-z_]+\.jpg$/);
    assert.match(p.imageCaption, /^Reconstrucción del resultado esperado/);
    assert.equal(p.imageSpec.file, path.basename(p.image));
    assert.equal(p.imageSpec.docTitle, p.docTitle);
    assert.ok(p.imageSpec.blocks.length >= 3, `${id}: la imagen tiene contenido`);
    assert.ok(p.quickActions.length >= 2 && p.quickActions.length <= 3, `${id}: 2 o 3 acciones rápidas`);
    for (const act of p.quickActions) {
      assert.ok(act.id && act.label, `${id}: acción con id y etiqueta`);
      assert.ok(act.modal || act.toast || act.action, `${id}.${act.id}: la acción hace algo`);
    }
  }
});

test("no quedan cifras inventadas ni términos prohibidos", () => {
  for (const [id, p] of all()) {
    const text = p.userPrompt + textOf(p);
    assert.doesNotMatch(text, /dossier/i, id);
    assert.doesNotMatch(text, /120 páginas/, `${id}: no se promete resumir documentos que no están en el prompt`);
    assert.doesNotMatch(text, /\b(195|840(\.\d+)?|1[.,]4) ?ms\b/, `${id}: sin latencias inventadas`);
    assert.doesNotMatch(text, /días calendario/, `${id}: el plazo es en días hábiles`);
    assert.doesNotMatch(text, /\b(Intel|AMD|NVIDIA|GeForce|Radeon)\b/, `${id}: sin marcas comerciales`);
  }
});

test("la imagen del resultado (salvo el código de referencia) solo usa valores del prompt o de la lista de chequeo", () => {
  for (const [id, p] of all()) {
    const source = p.userPrompt + JSON.stringify(p.expected) + JSON.stringify(p.followUps || []);
    const numbers = JSON.stringify(p.imageSpec.blocks.filter(b => b.type !== "code")).match(/\d+(?:[.,]\d+)*/g) || [];
    for (const n of numbers) {
      assert.ok(source.includes(n), `${id}: el valor ${n} de la imagen no sale del prompt ni de los criterios`);
    }
  }
});

// --- Cifras derivadas de los datos de cada modo ---

test("documento: el presupuesto total se calcula con cantidad y valor unitario", () => {
  const p = CANVAS_POSSIBILITIES["doc-editorial"];
  assert.match(p.promptParts.data, /Cantidad: 20 estaciones/);
  assert.match(p.promptParts.data, /COP 9\.800\.000/);
  assert.ok(textOf(p).includes("COP 196.000.000"));
  assert.equal(p.lengthVariants.length, 5);
  for (const v of p.lengthVariants) assert.match(v, /20 estaciones/);
});

test("código: KPI y estados salen de los 6 aprendices de los datos", () => {
  const p = CANVAS_POSSIBILITIES["code-prototyping"];
  const t = textOf(p);
  assert.ok(t.includes("82,5 %") && t.includes("83,7 %"));
  assert.match(t, /3 Al día, 1 En progreso y 2 Requiere apoyo/);
  assert.match(t, /Julián David Torres y Diego Alejandro Ruiz/);
  assert.equal((p.interactiveHtml.match(/<tr data-estado=/g) || []).length, 6);
});

test("matriz: puntajes ponderados sobre 100 y estado según umbrales", () => {
  const t = textOf(CANVAS_POSSIBILITIES["data-matrix"]);
  for (const s of ["88,0", "82,0", "59,5", "Recomendado", "Admisible con observaciones", "No cumple"]) {
    assert.ok(t.includes(s), s);
  }
});

test("diagrama: el Mermaid de referencia tiene 9 nodos, 9 flechas y 3 subgrafos", () => {
  const p = CANVAS_POSSIBILITIES["flowchart-diagram"];
  const code = p.quickActions.find(a => a.modal).modal.content;
  assert.match(code, /^flowchart TD/);
  assert.equal((code.match(/^\s+subgraph /gm) || []).length, 3);
  assert.equal((code.match(/-->/g) || []).length, 9);
  for (const node of ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "D1"]) assert.ok(code.includes(node), node);
  assert.match(code, /D1 -- Sí --> P3/);
  assert.match(code, /D1 -- No --> P4/);
});

test("UI/UX: las razones de contraste de la lista coinciden con la fórmula WCAG", () => {
  const t = textOf(CANVAS_POSSIBILITIES["visual-mockup"]);
  for (const s of ["7,48:1", "13,96:1", "7,84:1", "3,19:1", "5,02:1"]) assert.ok(t.includes(s), s);
});

test("edición en línea: el párrafo original está en el acta y hay un paso de seguimiento", () => {
  const p = CANVAS_POSSIBILITIES["inline-prompting"];
  assert.match(p.promptParts.data, /perderán la oportunidad de presentar la prueba final/);
  assert.equal(p.followUps.length, 1);
  assert.match(p.followUps[0].text, /dos días hábiles/);
  assert.ok(buildCanvasFollowUpsHtml(p.followUps).includes("data-followup-copy"));
});

test("algoritmo: la salida esperada corresponde a la entrada de ejemplo", () => {
  const p = CANVAS_POSSIBILITIES["algorithm-refactor"];
  assert.match(p.promptParts.data, /if e\["documento"\] in vistos/);
  assert.ok(textOf(p).includes(`{'al_dia': ['Ana', 'Iván'], 'en_progreso': ['Luis', 'Marta'], 'apoyo': ['Jorge', 'Sara']}`));
});

test("rúbrica: pesos que suman 100 y ejemplo calculado", () => {
  const p = CANVAS_POSSIBILITIES["rubric-curriculum"];
  assert.match(p.promptParts.data, /30 %[\s\S]*35 %[\s\S]*35 %/);
  assert.ok(textOf(p).includes("4,1 (Bueno)"));
});

test("SQL: el ranking esperado sale de las filas de muestra", () => {
  const p = CANVAS_POSSIBILITIES["sql-pipeline"];
  assert.match(p.promptParts.data, /INSERT INTO registro_asistencia/);
  const t = textOf(p);
  for (const s of ["Marta", "4,6", "100,0", "75,0", "50,0", "NULL"]) assert.ok(t.includes(s), s);
});

test("dictamen: el semáforo aplica la regla impacto × probabilidad", () => {
  const p = CANVAS_POSSIBILITIES["executive-report"];
  const t = textOf(p);
  assert.match(t, /6 · ROJO/);
  assert.match(t, /4 · ÁMBAR/);
  assert.match(t, /2 · VERDE/);
  assert.match(t, /10 días hábiles/);
  assert.match(t, /retenido/);
});

test("visión multimodal: boceto a formulario web con validaciones institucionales", () => {
  const p = CANVAS_POSSIBILITIES["multimodal-vision"];
  const t = textOf(p);
  assert.match(p.promptParts.data, /Boceto a lápiz en libreta de apuntes/);
  assert.match(p.promptParts.data, /@soy\.sena\.edu\.co/);
  assert.match(t, /Prototipo_Matricula_Boceto_a_Web\.html/);
  assert.match(t, /#2D5A4C/);
  assert.equal(p.quickActions.length, 3);
});

test("gem studio: asistente socrático con guardrails y Portafolio de Evidencias", () => {
  const p = CANVAS_POSSIBILITIES["gem-studio"];
  const t = textOf(p);
  assert.match(p.promptParts.data, /Portafolio de Evidencias/);
  assert.match(t, /Asistente_Coescritura_Canvas\.gem/);
  assert.match(t, /Método socrático activo/);
  assert.equal(p.quickActions.length, 3);
});

// --- Funciones puras ---

test("canvasRound y canvasFormatNumber usan coma decimal y punto de miles", () => {
  assert.equal(canvasRound(81.25, 1), 81.3);
  assert.equal(canvasRound(4.065, 1), 4.1);
  assert.equal(canvasRound(2, 0), 2);
  assert.equal(canvasFormatNumber(88, 1), "88,0");
  assert.equal(canvasFormatNumber(196000000, 0), "196.000.000");
  assert.equal(canvasFormatNumber(1234.5, 2), "1.234,50");
  assert.equal(canvasFormatNumber(-3.25, 1), "-3,3");
  assert.equal(canvasFormatCop(9800000), "COP 9.800.000");
});

test("canvasSum, canvasAverage y canvasWeightedScore validan sus entradas", () => {
  assert.equal(canvasSum([30, 35, 35]), 100);
  assert.equal(canvasSum([]), 0);
  assert.equal(canvasAverage([95, 88, 70, 92, 64, 86]), 82.5);
  assert.throws(() => canvasAverage([]), /lista vacía/);
  assert.equal(canvasWeightedScore([9.5, 9, 8.5, 8, 9], [25, 20, 15, 25, 15]), 8.8);
  assert.throws(() => canvasWeightedScore([1, 2], [50, 40]), /sumar 100/);
  assert.throws(() => canvasWeightedScore([1], [50, 50]), /misma cantidad/);
});

test("canvasMatrixStatus aplica los umbrales en sus límites", () => {
  assert.equal(canvasMatrixStatus(85), "Recomendado");
  assert.equal(canvasMatrixStatus(84.9), "Admisible con observaciones");
  assert.equal(canvasMatrixStatus(70), "Admisible con observaciones");
  assert.equal(canvasMatrixStatus(69.9), "No cumple");
});

test("canvasContrastRatio y canvasWcagLevel siguen WCAG 2.2", () => {
  assert.equal(canvasRound(canvasContrastRatio("#000000", "#FFFFFF"), 2), 21);
  assert.equal(canvasRound(canvasContrastRatio("#fff", "#fff"), 2), 1);
  assert.equal(canvasRound(canvasContrastRatio("#2D5A4C", "#F8FAF9"), 2), 7.48);
  assert.throws(() => canvasContrastRatio("#12", "#FFFFFF"), /HEX inválido/);
  assert.throws(() => canvasContrastRatio("verde", "#FFFFFF"), /HEX inválido/);
  assert.equal(canvasWcagLevel(7), "AAA");
  assert.equal(canvasWcagLevel(4.5), "AA");
  assert.equal(canvasWcagLevel(3), "AA texto grande");
  assert.equal(canvasWcagLevel(2.99), "No cumple");
});

test("canvasRiskLevel multiplica impacto por probabilidad", () => {
  assert.deepEqual(canvasRiskLevel("Alto", "Media"), { score: 6, color: "ROJO" });
  assert.deepEqual(canvasRiskLevel("Medio", "Media"), { score: 4, color: "ÁMBAR" });
  assert.deepEqual(canvasRiskLevel("Alto", "Baja"), { score: 3, color: "ÁMBAR" });
  assert.deepEqual(canvasRiskLevel("Medio", "Baja"), { score: 2, color: "VERDE" });
  assert.throws(() => canvasRiskLevel("Crítico", "Media"), /nivel desconocido/);
});

test("canvasReportDecision retiene el pago solo si hay un riesgo ROJO", () => {
  assert.match(canvasReportDecision([{ risk: { color: "ÁMBAR" } }, { risk: { color: "ROJO" } }]), /^El pago final del 20 % queda retenido/);
  assert.match(canvasReportDecision([{ risk: { color: "VERDE" } }]), /^Se aprueba el pago final con observaciones/);
  for (const f of [[{ risk: { color: "ROJO" } }], []]) assert.match(canvasReportDecision(f), /10 días hábiles/);
});

test("canvasLearnerStatus clasifica por asistencia y evidencias", () => {
  assert.equal(canvasLearnerStatus(85, 85), "Al día");
  assert.equal(canvasLearnerStatus(92, 80), "En progreso");
  assert.equal(canvasLearnerStatus(69, 95), "Requiere apoyo");
  assert.equal(canvasLearnerStatus(90, 69), "Requiere apoyo");
});

test("canvasClassifyDeliveries ignora documentos repetidos y respeta los límites", () => {
  assert.deepEqual(canvasClassifyDeliveries([]), { al_dia: [], en_progreso: [], apoyo: [] });
  assert.deepEqual(canvasClassifyDeliveries([
    { documento: "1", nombre: "A", puntaje: 70 },
    { documento: "2", nombre: "B", puntaje: 50 },
    { documento: "3", nombre: "C", puntaje: 49.9 },
    { documento: "1", nombre: "A", puntaje: 10 }
  ]), { al_dia: ["A"], en_progreso: ["B"], apoyo: ["C"] });
});

test("canvasSqlRanking promedia, ordena por ficha y deja NULL sin registros", () => {
  const rows = canvasSqlRanking(
    [{ id: 1, nombre: "X", ficha_id: 10 }, { id: 2, nombre: "Y", ficha_id: 10 }, { id: 3, nombre: "Z", ficha_id: 9 }],
    [{ aprendiz_id: 1, calificacion: 3 }, { aprendiz_id: 1, calificacion: 4 }, { aprendiz_id: 2, calificacion: 5 }, { aprendiz_id: 3, calificacion: 2 }],
    [{ aprendiz_id: 1, asistio: true }, { aprendiz_id: 1, asistio: false }, { aprendiz_id: 3, asistio: true }]
  );
  assert.deepEqual(rows, [
    { ficha_id: 9, puesto: 1, nombre: "Z", promedio: 2, pct_asistencia: 100 },
    { ficha_id: 10, puesto: 1, nombre: "Y", promedio: 5, pct_asistencia: null },
    { ficha_id: 10, puesto: 2, nombre: "X", promedio: 3.5, pct_asistencia: 50 }
  ]);
});

test("canvasRubricLevel ubica la nota en los cuatro niveles", () => {
  assert.equal(canvasRubricLevel(4.5), "Excelente");
  assert.equal(canvasRubricLevel(3.8), "Bueno");
  assert.equal(canvasRubricLevel(3.0), "En desarrollo");
  assert.equal(canvasRubricLevel(2.9), "Requiere refuerzo");
});

test("canvasMermaidFlow arma subgrafos, formas y flechas rotuladas", () => {
  const code = canvasMermaidFlow({
    lanes: [{ id: "U", name: "Usuario", nodes: [{ id: "A", label: "Inicio", shape: "terminal" }, { id: "B", label: "¿Listo?", shape: "decision" }, { id: "C", label: "Paso" }] }],
    edges: [["A", "B"], ["B", "C", "Sí"]]
  });
  assert.equal(code, 'flowchart TD\n  subgraph U["Usuario"]\n    A(["Inicio"])\n    B{"¿Listo?"}\n    C["Paso"]\n  end\n  A --> B\n  B -- Sí --> C');
});

test("buildCanvasChecklistHtml escapa el contenido y cuenta las casillas", () => {
  const html = buildCanvasChecklistHtml([{ criterion: "Total <b>", how: "Busca «x»" }]);
  assert.ok(html.includes("Total &lt;b&gt;"));
  assert.equal((html.match(/class="canvas-exercise-check"/g) || []).length, 1);
  assert.ok(html.includes("data-exercise-progress"));
  assert.ok(html.includes("data-exercise-reset"));
  assert.equal(buildCanvasChecklistHtml([]), "");
});

test("buildCanvasFollowUpsHtml devuelve cadena vacía sin pasos", () => {
  assert.equal(buildCanvasFollowUpsHtml(undefined), "");
  assert.equal(buildCanvasFollowUpsHtml([]), "");
});

test("exportCanvasPossibilities actualiza el banco JSON sin perder campos propios", () => {
  const bank = { title: "Banco", possibilities: [{ id: "doc-editorial", exercises: [1], badge: "Docs" }] };
  const out = exportCanvasPossibilities(bank);
  assert.equal(out.title, "Banco");
  assert.equal(out.possibilities.length, 12);
  const doc = out.possibilities[0];
  assert.deepEqual(doc.exercises, [1]);
  assert.equal(doc.badge, "Docs");
  assert.equal(doc.masterPrompt, CANVAS_POSSIBILITIES["doc-editorial"].userPrompt);
  assert.deepEqual(doc.imageSpec, CANVAS_POSSIBILITIES["doc-editorial"].imageSpec);
  assert.equal(out.possibilities[1].id, "code-prototyping");
  assert.equal(bank.possibilities[0].masterPrompt, undefined, "no modifica la entrada");

  // Casos borde: banco vacío y posibilidad con ejercicios vacíos previos
  const bankEmpty = exportCanvasPossibilities({});
  assert.equal(bankEmpty.totalPossibilities, 12);
  assert.ok(bankEmpty.totalExercises >= 24);

  const bankWithEmptyExercises = exportCanvasPossibilities({
    possibilities: [{ id: "multimodal-vision", exercises: [] }]
  });
  assert.equal(bankWithEmptyExercises.possibilities.find(p => p.id === "multimodal-vision").exercises.length, 0);

  // Caso de respaldo: posibilidad sin ejercicios registrados en kit
  kit.CANVAS_POSSIBILITIES["temp-no-exercises"] = {
    docIcon: "❓",
    image: "assets/images/canvas/canvas_dummy.jpg",
    imageCaption: "",
    quickActions: [],
    userPrompt: "prompt",
    expected: []
  };
  try {
    const outFallback = exportCanvasPossibilities({ possibilities: [] });
    const temp = outFallback.possibilities.find(p => p.id === "temp-no-exercises");
    assert.deepEqual(temp.exercises, []);
  } finally {
    delete kit.CANVAS_POSSIBILITIES["temp-no-exercises"];
  }
});

test("el banco JSON del repositorio está sincronizado con el módulo", () => {
  const file = path.join(__dirname, "..", "materiales", "gemini_canvas", "banco_prompts_canvas.json");
  const bank = JSON.parse(fs.readFileSync(file, "utf8"));
  assert.deepEqual(bank, exportCanvasPossibilities(bank), "ejecuta node scripts/export_canvas_possibilities.cjs");
});
