// Pruebas de las rutas profundas del módulo Gemini Canvas (node:test).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { parseCanvasRoute, buildCanvasRoute, neighborCanvasMode } = require(path.join(__dirname, "..", "js", "canvas-nav.js"));

const MODES = ["doc-editorial", "code-prototyping", "data-matrix"];

test("parseCanvasRoute lee página, modo y ejercicio", () => {
  assert.deepEqual(parseCanvasRoute("#gemini-canvas/code-prototyping/b", MODES), { page: "gemini-canvas", mode: "code-prototyping", exercise: 1 });
  assert.deepEqual(parseCanvasRoute("#gemini-canvas/data-matrix/a", MODES), { page: "gemini-canvas", mode: "data-matrix", exercise: 0 });
  assert.deepEqual(parseCanvasRoute("#gemini-canvas/data-matrix", MODES), { page: "gemini-canvas", mode: "data-matrix", exercise: null });
  assert.deepEqual(parseCanvasRoute("#gemini-canvas", MODES), { page: "gemini-canvas", mode: null, exercise: null });
});

test("parseCanvasRoute ignora modos y ejercicios desconocidos", () => {
  assert.deepEqual(parseCanvasRoute("#gemini-canvas/otro/b", MODES), { page: "gemini-canvas", mode: null, exercise: null });
  assert.deepEqual(parseCanvasRoute("#gemini-canvas/data-matrix/z", MODES), { page: "gemini-canvas", mode: "data-matrix", exercise: null });
});

test("parseCanvasRoute devuelve la página para otras secciones y vacío sin hash", () => {
  assert.deepEqual(parseCanvasRoute("#dia-2", MODES), { page: "dia-2", mode: null, exercise: null });
  assert.deepEqual(parseCanvasRoute("", MODES), { page: null, mode: null, exercise: null });
  assert.deepEqual(parseCanvasRoute(undefined, MODES), { page: null, mode: null, exercise: null });
  assert.deepEqual(parseCanvasRoute("#gemini-canvas/data-matrix"), { page: "gemini-canvas", mode: null, exercise: null }, "sin lista de modos no valida ninguno");
});

test("buildCanvasRoute arma el hash inverso", () => {
  assert.equal(buildCanvasRoute("data-matrix", 1), "#gemini-canvas/data-matrix/b");
  assert.equal(buildCanvasRoute("data-matrix", 0), "#gemini-canvas/data-matrix/a");
  assert.equal(buildCanvasRoute("data-matrix"), "#gemini-canvas/data-matrix");
  assert.equal(buildCanvasRoute(null), "#gemini-canvas");
  const parsed = parseCanvasRoute(buildCanvasRoute("code-prototyping", 1), MODES);
  assert.equal(parsed.mode, "code-prototyping");
  assert.equal(parsed.exercise, 1);
});

test("neighborCanvasMode da el anterior y el siguiente sin salirse de la lista", () => {
  assert.equal(neighborCanvasMode(MODES, "code-prototyping", 1), "data-matrix");
  assert.equal(neighborCanvasMode(MODES, "code-prototyping", -1), "doc-editorial");
  assert.equal(neighborCanvasMode(MODES, "doc-editorial", -1), null);
  assert.equal(neighborCanvasMode(MODES, "data-matrix", 1), null);
  assert.equal(neighborCanvasMode(MODES, "desconocido", 1), null);
});
