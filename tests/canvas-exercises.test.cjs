// Pruebas de los ejercicios prácticos de Gemini Canvas Lab (node:test).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  CANVAS_EXERCISES,
  composeCanvasPrompt,
  escapeCanvasHtml,
  formatCanvasStep,
  buildCanvasPromptHtml,
  buildCanvasExerciseHtml,
  countCanvasChecklist
} = require(path.join(__dirname, "..", "js", "canvas-exercises.js"));

const MODES = [
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

const allExercises = () => MODES.flatMap(mode => CANVAS_EXERCISES[mode] || []);
// La instrucción se dirige a Gemini y nombra Canvas como lugar de trabajo; activar Canvas es un paso del aprendiz.
const CANVAS_INSTRUCTION = /^(En Canvas, |Copia (el|la) \S+ en Canvas sin cambiar )/;

test("cada uno de los 12 modos tiene exactamente dos ejercicios", () => {
  assert.deepEqual(Object.keys(CANVAS_EXERCISES).sort(), [...MODES].sort());
  for (const mode of MODES) {
    assert.equal(CANVAS_EXERCISES[mode].length, 2, `${mode} debe tener 2 ejercicios`);
  }
  assert.equal(allExercises().length, 24);
});

test("cada ejercicio trae toda la información necesaria para resolverlo", () => {
  const ids = new Set();
  for (const ex of allExercises()) {
    assert.ok(!ids.has(ex.id), `id repetido: ${ex.id}`);
    ids.add(ex.id);
    for (const field of ["title", "level", "duration", "goal", "scenario", "stretch", "previewSvg", "canvasFeature"]) {
      assert.equal(typeof ex[field], "string", `${ex.id}.${field} debe ser texto`);
      assert.ok(ex[field].trim().length > 0, `${ex.id}.${field} no puede estar vacío`);
    }
    assert.ok(!("inputs" in ex), `${ex.id}: los datos viven solo dentro del prompt`);
    assert.ok(Array.isArray(ex.steps) && ex.steps.length >= 4, `${ex.id}: mínimo 4 pasos`);
    assert.ok(Array.isArray(ex.expected) && ex.expected.length >= 4, `${ex.id}: mínimo 4 criterios`);
    assert.match(ex.previewSvg, /^<svg[\s\S]*role="img"[\s\S]*aria-label="[^"]+"[\s\S]*<\/svg>$/);
    assert.doesNotMatch(JSON.stringify(ex), /dossier/i);
  }
});

test("cada prompt sigue R-C-I-R-F, es conciso y trae los datos una sola vez", () => {
  for (const ex of allExercises()) {
    const p = ex.promptParts;
    for (const field of ["role", "context", "data", "instruction", "format"]) {
      assert.ok(typeof p[field] === "string" && p[field].trim(), `${ex.id}.promptParts.${field}`);
    }
    assert.ok(p.data.trim().length >= 150, `${ex.id}: los datos deben ser suficientes para resolverlo`);
    assert.match(p.instruction, CANVAS_INSTRUCTION, `${ex.id}: la instrucción pide el trabajo a Gemini dentro de Canvas`);
    assert.doesNotMatch(ex.prompt, /Abre un Canvas/, `${ex.id}: el prompt no da órdenes de interfaz que parezcan pasos del aprendiz`);
    assert.ok(p.task.length >= 1 && p.task.length <= 5, `${ex.id}: entre 1 y 5 tareas`);
    assert.ok(p.constraints.length >= 1 && p.constraints.length <= 3, `${ex.id}: entre 1 y 3 restricciones`);
    assert.equal(ex.prompt, composeCanvasPrompt(p));
    assert.equal(ex.prompt.split(p.data.trim()).length - 1, 1, `${ex.id}: los datos aparecen una sola vez`);
    const words = (ex.prompt.replace(p.data.trim(), "").match(/\S+/g) || []).length;
    assert.ok(words <= 280, `${ex.id}: el prompt sin datos tiene ${words} palabras (máximo 280)`);
  }
});

test("ningún ejercicio contiene funciones experimentales ni términos no institucionales", () => {
  const exercises = allExercises();
  assert.equal(exercises.length, 24);
  for (const ex of exercises) {
    const raw = JSON.stringify(ex);
    assert.doesNotMatch(raw, /infograf[ií]a|resumen en audio|crear\s*→/i, `${ex.id}: no debe usar funciones experimentales no estándar`);
    assert.doesNotMatch(raw, /dossier/i, `${ex.id}: debe usar Portafolio de Evidencias`);
  }
});

test("composeCanvasPrompt ordena las partes y delimita los datos", () => {
  const text = composeCanvasPrompt({
    role: "analista", context: "Contexto breve.", data: "  a,b\n1,2  ",
    instruction: "En Canvas, haz:", task: ["Uno", "Dos"], constraints: ["Sin inventar"], format: "Tabla."
  });
  assert.equal(text, [
    "Actúa como analista.",
    "Contexto: Contexto breve.",
    'Datos:\n"""\na,b\n1,2\n"""',
    "Instrucción: En Canvas, haz:\n1. Uno\n2. Dos",
    "Restricciones:\n- Sin inventar",
    "Formato: Tabla."
  ].join("\n\n"));
});

test("formatCanvasStep resalta lo que se escribe y escapa el resto", () => {
  assert.equal(formatCanvasStep("Escribe: «Hazlo <b>»."), 'Escribe: <span class="canvas-exercise-followup">«Hazlo &lt;b&gt;»</span>.');
  assert.equal(formatCanvasStep("Sin comillas"), "Sin comillas");
  assert.equal(formatCanvasStep("Abre «Exportar» y elige «Documentos de Google»."), "Abre «Exportar» y elige «Documentos de Google».", "los menús no se resaltan");
});

test("buildCanvasPromptHtml muestra las seis partes con etiqueta", () => {
  const html = buildCanvasPromptHtml(CANVAS_EXERCISES["doc-editorial"][0].promptParts);
  for (const label of ["Rol", "Contexto", "Datos", "Instrucción", "Restricciones", "Formato"]) {
    assert.ok(html.includes(`<span class="canvas-prompt-label">${label}</span>`), label);
  }
  assert.equal((html.match(/<pre/g) || []).length, 1, "solo los datos van en bloque preformateado");
});

test("escapeCanvasHtml neutraliza caracteres especiales", () => {
  assert.equal(escapeCanvasHtml(`<b a="1">&'</b>`), "&lt;b a=&quot;1&quot;&gt;&amp;&#39;&lt;/b&gt;");
  assert.equal(escapeCanvasHtml(null), "");
  assert.equal(escapeCanvasHtml(42), "42");
});

test("buildCanvasExerciseHtml arma una tarjeta completa y segura", () => {
  const base = CANVAS_EXERCISES["sql-pipeline"][0];
  const ex = { ...base, promptParts: { ...base.promptParts, data: "SELECT '<script>' AS x;" } };
  const html = buildCanvasExerciseHtml(ex, 0);
  assert.ok(html.includes('data-exercise-id="' + ex.id + '"'));
  assert.ok(html.includes("&lt;script&gt;"), "los datos se escapan");
  assert.ok(!html.includes("SELECT '<script>'"));
  assert.equal((html.match(/data-copy=/g) || []).length, 1, "un solo botón de copia");
  assert.ok(html.includes('data-copy="prompt"'));
  assert.ok(html.includes("data-exercise-reset"));
  assert.ok(html.includes("Las órdenes del prompt van dirigidas a Gemini"), "la tarjeta aclara a quién se dirige el prompt");
  assert.ok(html.includes(ex.previewSvg), "la vista previa SVG se inserta tal cual");
  assert.ok(html.includes('class="canvas-exercise-followup"'), "los pasos resaltan lo que se escribe");
  assert.equal(countCanvasChecklist(html), ex.expected.length);
  assert.equal((html.match(/class="canvas-exercise-step"/g) || []).length, ex.steps.length);
  assert.ok(html.includes("Ejercicio A"));
  assert.ok(buildCanvasExerciseHtml(CANVAS_EXERCISES["sql-pipeline"][1], 1).includes("Ejercicio B"));
});

test("buildCanvasExerciseHtml devuelve cadena vacía sin ejercicio", () => {
  assert.equal(buildCanvasExerciseHtml(null, 0), "");
  assert.equal(buildCanvasExerciseHtml(undefined, 1), "");
});

test("countCanvasChecklist cuenta solo casillas de verificación", () => {
  assert.equal(countCanvasChecklist(""), 0);
  assert.equal(countCanvasChecklist('<input type="checkbox" class="canvas-exercise-check"><input type="text">'), 1);
});
