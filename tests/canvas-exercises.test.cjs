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
  buildCanvasMaterialsHtml,
  countCanvasChecklist,
  CANVAS_CAPABILITIES,
  canvasCapabilityNames
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

// Siete modos suman una parte C con funciones que las partes A y B no practican.
const MODES_WITH_PART_C = ["doc-editorial", "code-prototyping", "visual-mockup", "inline-prompting", "algorithm-refactor", "rubric-curriculum", "multimodal-vision"];

test("cada modo tiene las partes A y B, y siete modos suman una parte C", () => {
  assert.deepEqual(Object.keys(CANVAS_EXERCISES).sort(), [...MODES].sort());
  for (const mode of MODES) {
    const expected = MODES_WITH_PART_C.includes(mode) ? 3 : 2;
    assert.equal(CANVAS_EXERCISES[mode].length, expected, `${mode} debe tener ${expected} ejercicios`);
  }
  assert.equal(allExercises().length, 31);
  const codes = allExercises().map(ex => ex.code);
  assert.equal(new Set(codes).size, 31, "los códigos de ejercicio no se repiten");
  MODES.forEach((mode, i) => CANVAS_EXERCISES[mode].forEach((ex, j) => assert.equal(ex.code, `${i + 1}${"ABC"[j]}`, `${ex.id}: código según su posición`)));
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

test("cada prompt sigue CRTT+L, es conciso y trae los datos una sola vez", () => {
  for (const ex of allExercises()) {
    const p = ex.promptParts;
    for (const field of ["role", "context", "data", "instruction", "format", "tone"]) {
      assert.ok(typeof p[field] === "string" && p[field].trim(), `${ex.id}.promptParts.${field}`);
    }
    assert.notEqual(p.tone, p.format, `${ex.id}: el tono no repite el formato de entrega`);
    assert.ok(p.role.split(/\s+/).length <= 12, `${ex.id}: rol breve`);
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

test("ningún ejercicio usa términos no institucionales", () => {
  for (const ex of allExercises()) {
    assert.doesNotMatch(JSON.stringify(ex), /dossier/i, `${ex.id}: debe usar Portafolio de Evidencias`);
  }
});

// Herramientas externas o funciones que Canvas no ofrece: un ejercicio debe resolverse dentro de Gemini Canvas.
const OUTSIDE_CANVAS = /Hojas de c[aá]lculo|Google Sheets|\bSheets\b|\bExcel\b|mermaid\.live|sql\.js|Gem Studio|pytest|tu equipo local/i;

test("el catálogo de capacidades describe funciones reales de Canvas", () => {
  const ids = Object.keys(CANVAS_CAPABILITIES);
  assert.ok(ids.length >= 14);
  for (const id of ids) {
    const cap = CANVAS_CAPABILITIES[id];
    assert.equal(typeof cap.name, "string", `${id}.name`);
    assert.ok(cap.how.trim().length > 10, `${id}.how explica cómo se usa`);
    assert.ok(cap.pattern instanceof RegExp, `${id}.pattern`);
  }
});

test("cada ejercicio declara capacidades de Canvas que de verdad usa en sus pasos", () => {
  for (const ex of allExercises()) {
    assert.ok(Array.isArray(ex.capabilities) && ex.capabilities.length >= 2, `${ex.id}: al menos 2 capacidades`);
    const stepsText = ex.steps.join("\n");
    for (const cap of ex.capabilities) {
      assert.ok(CANVAS_CAPABILITIES[cap], `${ex.id}: capacidad desconocida ${cap}`);
      assert.match(stepsText, CANVAS_CAPABILITIES[cap].pattern, `${ex.id}: declara ${cap} pero ningún paso la usa`);
    }
    assert.equal(typeof ex.whyCanvas, "string");
    assert.ok(ex.whyCanvas.trim().length >= 40, `${ex.id}: whyCanvas explica qué aporta Canvas frente al chat`);
    assert.match(ex.steps[0], /Activa Canvas|adjunta/i, `${ex.id}: el primer paso activa Canvas`);
  }
});

test("los 31 ejercicios cubren todas las capacidades del catálogo", () => {
  const used = new Set(allExercises().flatMap(ex => ex.capabilities));
  assert.deepEqual([...used].sort(), Object.keys(CANVAS_CAPABILITIES).sort());
});

test("ningún ejercicio exige herramientas fuera de Gemini Canvas", () => {
  for (const ex of allExercises()) {
    const raw = JSON.stringify([ex.title, ex.canvasFeature, ex.goal, ex.promptParts, ex.steps, ex.expected, ex.stretch, ex.whyCanvas]);
    assert.doesNotMatch(raw, OUTSIDE_CANVAS, `${ex.id}: debe resolverse dentro de Gemini Canvas`);
  }
});

test("canvasCapabilityNames traduce ids y descarta los desconocidos", () => {
  assert.deepEqual(canvasCapabilityNames(["code-preview", "nada"]), [CANVAS_CAPABILITIES["code-preview"].name]);
  assert.deepEqual(canvasCapabilityNames(undefined), []);
});

test("composeCanvasPrompt ordena las partes y delimita los datos", () => {
  const text = composeCanvasPrompt({
    role: "analista", context: "Contexto breve.", data: "  a,b\n1,2  ",
    instruction: "En Canvas, haz:", task: ["Uno", "Dos"], constraints: ["Sin inventar"], format: "Tabla.", tone: "Claro y directo."
  });
  assert.equal(text, [
    "Contexto: Contexto breve.",
    "Rol: Actúa como analista.",
    'Datos:\n"""\na,b\n1,2\n"""',
    "Tarea: En Canvas, haz:\n1. Uno\n2. Dos\nEntrega: Tabla.",
    "Tono: Claro y directo.",
    "Límites:\n- Sin inventar"
  ].join("\n\n"));
});

test("formatCanvasStep resalta lo que se escribe y escapa el resto", () => {
  assert.equal(formatCanvasStep("Escribe: «Hazlo <b>»."), 'Escribe: <span class="canvas-exercise-followup">«Hazlo &lt;b&gt;»</span>.');
  assert.equal(formatCanvasStep("Sin comillas"), "Sin comillas");
  assert.equal(formatCanvasStep("Abre «Exportar» y elige «Documentos de Google»."), "Abre «Exportar» y elige «Documentos de Google».", "los menús no se resaltan");
});

test("buildCanvasPromptHtml muestra las seis partes con etiqueta CRTT+L", () => {
  const html = buildCanvasPromptHtml(CANVAS_EXERCISES["doc-editorial"][0].promptParts);
  for (const label of ["Contexto", "Rol", "Datos", "Tarea", "Tono", "Límites"]) {
    assert.ok(html.includes(`<span class="canvas-prompt-label">${label}</span>`), label);
  }
  assert.equal((html.match(/<pre/g) || []).length, 1, "solo los datos van en bloque preformateado");
  const parts = CANVAS_EXERCISES["doc-editorial"][0].promptParts;
  assert.ok(html.includes(escapeCanvasHtml(parts.tone)), "la fila Tono muestra el tono real");
  const order = ["Contexto", "Rol", "Datos", "Tarea", "Tono", "Límites"].map(l => html.indexOf(`>${l}</span>`));
  assert.deepEqual(order, [...order].sort((a, b) => a - b), "mismo orden que el prompt copiado");
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
  assert.ok(html.includes("CRTT+L (Contexto, Rol, Tarea, Tono y Límites)"), "la tarjeta nombra el canon CRTT+L");
  assert.ok(html.includes(ex.previewSvg), "la vista previa SVG se inserta tal cual");
  assert.ok(html.includes('class="canvas-exercise-followup"'), "los pasos resaltan lo que se escribe");
  assert.equal(countCanvasChecklist(html), ex.expected.length);
  assert.equal((html.match(/class="canvas-exercise-step"/g) || []).length, ex.steps.length);
  assert.ok(html.includes("Parte A"));
  assert.ok(html.includes("¿Por qué en Canvas?"), "la tarjeta explica qué aporta Canvas");
  assert.ok(html.includes(escapeCanvasHtml(ex.whyCanvas)));
  assert.equal((html.match(/class="canvas-capability-chip"/g) || []).length, ex.capabilities.length);
  assert.ok(html.includes(`id="ejercicio-${ex.id}"`), "la tarjeta tiene ancla para enlaces directos");
  assert.ok(buildCanvasExerciseHtml(CANVAS_EXERCISES["sql-pipeline"][1], 1).includes("Parte B"));
});

test("buildCanvasExerciseHtml omite la explicación de Canvas cuando el ejercicio no la trae", () => {
  const base = CANVAS_EXERCISES["code-prototyping"][0];
  const html = buildCanvasExerciseHtml({ ...base, whyCanvas: undefined, capabilities: undefined, places: undefined }, 0);
  assert.ok(!html.includes("¿Por qué en Canvas?"));
  assert.ok(!html.includes("canvas-capability-chip"));
  const noOutside = buildCanvasExerciseHtml({ ...base, outsideCanvas: undefined }, 0);
  assert.ok(!noOutside.includes("canvas-outside-callout"));
  const unknown = buildCanvasExerciseHtml({ ...base, capabilities: ["code-preview", "inexistente"] }, 0);
  assert.equal((unknown.match(/class="canvas-capability-chip"/g) || []).length, 1, "las capacidades desconocidas se descartan");
});

test("buildCanvasExerciseHtml devuelve cadena vacía sin ejercicio", () => {
  assert.equal(buildCanvasExerciseHtml(null, 0), "");
  assert.equal(buildCanvasExerciseHtml(undefined, 1), "");
});

test("countCanvasChecklist cuenta solo casillas de verificación", () => {
  assert.equal(countCanvasChecklist(""), 0);
  assert.equal(countCanvasChecklist('<input type="checkbox" class="canvas-exercise-check"><input type="text">'), 1);
});

test("buildCanvasMaterialsHtml enlaza archivos descargables y se omite sin material", () => {
  assert.equal(buildCanvasMaterialsHtml(undefined), "");
  assert.equal(buildCanvasMaterialsHtml([]), "");
  const html = buildCanvasMaterialsHtml([{ href: "materiales/x/a<b>.png", label: "Foto" }]);
  assert.match(html, /download="a&lt;b&gt;\.png"/);
  assert.match(html, /📥 Foto/);
});

test("los ejercicios con archivo adjunto traen material real y lo muestran en la tarjeta", () => {
  const fs = require("node:fs");
  const withFiles = allExercises().filter(ex => ex.materials);
  assert.deepEqual(withFiles.map(ex => ex.code).sort(), ["10A", "11A", "11B", "11C"]);
  for (const ex of withFiles) {
    for (const m of ex.materials) {
      assert.ok(fs.existsSync(path.join(__dirname, "..", m.href)), `${ex.id}: falta ${m.href}`);
      assert.ok(ex.steps.some(s => s.includes(m.href)), `${ex.id}: un paso indica adjuntar ${m.href}`);
    }
    assert.match(buildCanvasExerciseHtml(ex, 0), /canvas-exercise-materials/);
  }
  for (const code of ["11A", "11B"]) {
    const ex = withFiles.find(x => x.code === code);
    assert.doesNotMatch(ex.promptParts.data, /FOTOGRAFÍA ADJUNTA/, `${code}: los datos no fingen una foto que el aprendiz no tiene`);
  }
});

test("los días de la semana del correo 6A coinciden con el calendario", () => {
  const ex = allExercises().find(x => x.code === "6A");
  const text = JSON.stringify(ex);
  const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const months = { noviembre: 10, diciembre: 11 };
  const found = [...text.matchAll(/(lunes|martes|miércoles|jueves|viernes|sábado|domingo) (\d{1,2}) de (noviembre|diciembre)/g)];
  assert.ok(found.length >= 2);
  for (const [, day, num, month] of found) {
    assert.equal(days[new Date(2026, months[month], Number(num)).getDay()], day, `${num} de ${month} de 2026`);
  }
});

test("cada ejercicio con Gem verifica la prueba del Gem en sus criterios", () => {
  for (const ex of allExercises().filter(x => x.capabilities.includes("gems"))) {
    assert.ok(ex.expected.some(c => /el Gem/.test(c)), `${ex.id}: un criterio comprueba el comportamiento del Gem`);
  }
});

// --- Trabajo completo dentro de Gemini Canvas ---
const { canvasCopyText, buildCanvasReferenceHtml, GEMINI_APP_URL } = require(path.join(__dirname, "..", "js", "canvas-exercises.js"));

test("cada tarjeta enlaza a Gemini en una pestaña nueva junto al botón de copiar", () => {
  assert.equal(GEMINI_APP_URL, "https://gemini.google.com/app");
  for (const ex of allExercises()) {
    const html = buildCanvasExerciseHtml(ex, 0);
    assert.match(html, /<a class="canvas-exercise-open" href="https:\/\/gemini\.google\.com\/app" target="_blank" rel="noopener noreferrer">/, `${ex.id}: enlace a Gemini`);
    assert.ok(html.indexOf('data-copy="prompt"') < html.indexOf("canvas-exercise-open"), `${ex.id}: el botón de copiar va primero`);
    assert.match(html, /Herramientas → Canvas/, `${ex.id}: indica cómo activar Canvas`);
  }
});

test("canvasCopyText entrega el prompt, el código de referencia o vacío", () => {
  const ex = CANVAS_EXERCISES["flowchart-diagram"][0];
  assert.equal(canvasCopyText(ex, "prompt"), ex.prompt);
  assert.equal(canvasCopyText(ex, "reference"), ex.reference.code);
  assert.equal(canvasCopyText(CANVAS_EXERCISES["doc-editorial"][0], "reference"), "");
  assert.equal(canvasCopyText(ex, "otro"), "");
  assert.equal(canvasCopyText(null, "prompt"), "");
  assert.equal(canvasCopyText({}, "prompt"), "", "sin prompt devuelve vacío");
  assert.equal(canvasCopyText({ reference: {} }, "reference"), "", "referencia sin código");
});

test("buildCanvasReferenceHtml muestra el código para pegar en Canvas o nada si falta", () => {
  assert.equal(buildCanvasReferenceHtml(undefined), "");
  assert.equal(buildCanvasReferenceHtml({ label: "x", intro: "y", code: "" }), "");
  const html = buildCanvasReferenceHtml({ label: "Diagrama", intro: "Pega <esto>", code: "flowchart LR\n A-->B" });
  assert.match(html, /data-copy="reference"/);
  assert.match(html, /Pega &lt;esto&gt;/);
  assert.match(html, /A--&gt;B/);
});

test("4A y 4B se resuelven por completo en Canvas y traen código Mermaid de referencia", () => {
  const [a, b] = CANVAS_EXERCISES["flowchart-diagram"];
  for (const ex of [a, b]) {
    assert.ok(ex.places.every(p => p === "canvas" || p === "portal"), `${ex.id}: sin pasos fuera de Canvas`);
    assert.ok(ex.reference && ex.reference.code.length > 100, `${ex.id}: referencia`);
    const html = buildCanvasExerciseHtml(ex, 0);
    assert.equal((html.match(/data-copy=/g) || []).length, 2, `${ex.id}: copiar prompt y referencia`);
    assert.doesNotMatch(ex.steps.join(" "), /descargar el diagrama en SVG|tamaño carta/);
  }
  assert.match(a.prompt, /flowchart LR/);
  assert.match(a.prompt, /subgraph/);
  assert.match(a.reference.code, /^flowchart LR/);
  assert.equal((a.reference.code.match(/^\s*subgraph /gm) || []).length, 4, "un carril por actor");
  assert.equal((a.reference.code.match(/\{[^}]+\}/g) || []).length, 4, "cuatro decisiones");
  assert.match(a.reference.code, /Aprendiz matriculado/);
  assert.match(a.expected.join(" "), /cuatro decisiones/);
  const tiempos = IN_TIEMPOS(a.promptParts.data);
  assert.equal(tiempos, 8);
  assert.ok(a.expected.some(c => c.includes(`${tiempos} días`)));
  assert.match(b.reference.code, /sequenceDiagram/);
  assert.match(b.reference.code, /gantt/);
  assert.match(b.reference.code, /milestone, \w+, 2026-12-11/);
  assert.match(b.prompt, /alt/);
});

function IN_TIEMPOS(data) {
  const line = data.split("\n").find(l => l.startsWith("Tiempos promedio"));
  return [...line.matchAll(/(\d+) días?/g)].reduce((acc, m) => acc + Number(m[1]), 0);
}

test("7A y 9A ejecutan su código dentro de la vista previa de Canvas", () => {
  const a7 = allExercises().find(x => x.code === "7A");
  const a9 = allExercises().find(x => x.code === "9A");
  assert.ok(!a7.places.includes("external"), "7A sin Colab obligatorio");
  assert.match(a7.steps.join(" "), /Pyodide/);
  assert.match(a9.steps.join(" "), /Pyodide[\s\S]*sqlite3/);
  assert.match(a9.steps.join(" "), /prueba que compare el resultado devuelto por SQLite/);
  assert.ok(!a9.expected.some(c => /Colab/.test(c)), "9A se verifica sin Colab");
  assert.match(a9.steps.find(s => /Colab/.test(s)), /^\(Opcional\)/);
});

test("las exportaciones a Documentos de Google son opcionales y no bloquean la verificación", () => {
  for (const ex of allExercises()) {
    ex.steps.forEach((s, i) => {
      // Solo el ejercicio cuyo objetivo es ejecutar en Colab (externalRequired) exige pasos fuera de Gemini.
      if (ex.places[i] === "external" && !ex.externalRequired) assert.match(s, /^\(Opcional\)/, `${ex.id} paso ${i + 1}`);
    });
    assert.ok(!ex.expected.some(c => /quedó (guardad[oa] )?en Documentos de Google|Existe una copia .* Documentos de Google/.test(c)), `${ex.id}: criterio verificable en Canvas`);
  }
});

test("cada tarjeta incluye el hilo paso a paso, enlace de regreso al simulador y pasos marcables", () => {
  const ex = CANVAS_EXERCISES["doc-editorial"][0];
  const html = buildCanvasExerciseHtml(ex, 0);
  assert.match(html, /class="canvas-exercise-stepper"/);
  assert.match(html, /data-go-simulator/, "incluye botón para volver a ver el ejemplo en el simulador");
  assert.match(html, /class="canvas-step-done"/, "cada paso de iteración tiene control de avance");
  const stepChecks = (html.match(/class="canvas-step-done"/g) || []).length;
  assert.equal(stepChecks, ex.steps.length, "un control por cada paso");
});
