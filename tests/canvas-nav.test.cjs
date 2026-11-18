// Pruebas de las rutas profundas del módulo Gemini Canvas (node:test).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { parseCanvasRoute, buildCanvasRoute, neighborCanvasMode, listExerciseSequence, neighborExercise, firstPendingExercise, exercisePosition, serializeChecks, parseChecks } = require(path.join(__dirname, "..", "js", "canvas-nav.js"));

const MODES = ["doc-editorial", "code-prototyping", "data-matrix"];

test("parseCanvasRoute lee página, modo y ejercicio", () => {
  assert.deepEqual(parseCanvasRoute("#gemini-canvas/code-prototyping/b", MODES), { page: "gemini-canvas", mode: "code-prototyping", exercise: 1 });
  assert.deepEqual(parseCanvasRoute("#gemini-canvas/code-prototyping/c", MODES), { page: "gemini-canvas", mode: "code-prototyping", exercise: 2 });
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
  assert.equal(buildCanvasRoute("doc-editorial", 2), "#gemini-canvas/doc-editorial/c");
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

const BANK = {
  "doc-editorial": [{ id: "d-a" }, { id: "d-b" }],
  "code-prototyping": [{ id: "c-a" }, { id: "c-b" }],
  "data-matrix": [{ id: "m-a" }]
};

test("listExerciseSequence ordena los ejercicios por modo y variante", () => {
  const seq = listExerciseSequence(MODES, BANK);
  assert.equal(seq.length, 5);
  assert.deepEqual(seq[0], { mode: "doc-editorial", exercise: 0, id: "d-a" });
  assert.deepEqual(seq[2], { mode: "code-prototyping", exercise: 0, id: "c-a" });
  assert.deepEqual(listExerciseSequence(["sin-datos"], BANK), [], "modos sin ejercicios no aportan pasos");
});

test("neighborExercise cruza de la variante B al siguiente modo y se detiene en los extremos", () => {
  const seq = listExerciseSequence(MODES, BANK);
  assert.deepEqual(neighborExercise(seq, "doc-editorial", 1, 1), seq[2]);
  assert.deepEqual(neighborExercise(seq, "code-prototyping", 0, -1), seq[1]);
  assert.equal(neighborExercise(seq, "doc-editorial", 0, -1), null);
  assert.equal(neighborExercise(seq, "data-matrix", 0, 1), null);
  assert.equal(neighborExercise(seq, "otro", 0, 1), null);
});

test("firstPendingExercise devuelve el primero sin completar o null si todo está hecho", () => {
  const seq = listExerciseSequence(MODES, BANK);
  assert.deepEqual(firstPendingExercise(seq, []), seq[0]);
  assert.deepEqual(firstPendingExercise(seq, ["d-a", "d-b"]), seq[2]);
  assert.equal(firstPendingExercise(seq, ["d-a", "d-b", "c-a", "c-b", "m-a"]), null);
  assert.deepEqual(firstPendingExercise(seq, undefined), seq[0], "sin lista guardada empieza por el primero");
});

test("exercisePosition indica número y total, o null si no existe", () => {
  const seq = listExerciseSequence(MODES, BANK);
  assert.deepEqual(exercisePosition(seq, "code-prototyping", 1), { number: 4, total: 5 });
  assert.equal(exercisePosition(seq, "otro", 0), null);
});

test("serializeChecks y parseChecks conservan casillas marcadas a medias", () => {
  assert.deepEqual(serializeChecks([true, false, true]), [0, 2]);
  assert.deepEqual(parseChecks([0, 2], 4), [true, false, true, false]);
  assert.deepEqual(parseChecks([9, -1, "x"], 2), [false, false], "ignora índices inválidos");
  assert.deepEqual(parseChecks(null, 2), [false, false]);
});

const {
  modeExerciseProgress,
  isModeTransition,
  SPECIALIZED_MODE_LABS,
  getSpecializedLabForMode,
  IMMERSIVE_FOCUS_MODES,
  resolveImmersiveFocus
} = require(path.join(__dirname, "..", "js", "canvas-nav.js"));

test("modeExerciseProgress calcula completados, total y siguiente pendiente por modo", () => {
  assert.deepEqual(modeExerciseProgress("doc-editorial", BANK, []), {
    done: 0, total: 2, nextIndex: 0, allDone: false
  });
  assert.deepEqual(modeExerciseProgress("doc-editorial", BANK, ["d-a"]), {
    done: 1, total: 2, nextIndex: 1, allDone: false
  });
  assert.deepEqual(modeExerciseProgress("doc-editorial", BANK, ["d-a", "d-b"]), {
    done: 2, total: 2, nextIndex: 0, allDone: true
  });
  assert.deepEqual(modeExerciseProgress("desconocido", BANK, []), {
    done: 0, total: 0, nextIndex: 0, allDone: false
  });
});

test("isModeTransition detecta cuando el siguiente ejercicio cambia de modo", () => {
  assert.equal(isModeTransition("doc-editorial", "code-prototyping"), true);
  assert.equal(isModeTransition("doc-editorial", "doc-editorial"), false);
  assert.equal(isModeTransition(null, "doc-editorial"), false);
  assert.equal(isModeTransition("doc-editorial", null), false);
});

test("canvas-nav maneja entradas nulas o modos ausentes en el banco", () => {
  const seq = listExerciseSequence(["doc-editorial", "sin-ejercicios"], BANK);
  assert.equal(seq.length, 2);
  assert.deepEqual(firstPendingExercise(seq, null), { mode: "doc-editorial", exercise: 0, id: "d-a" });
  assert.deepEqual(modeExerciseProgress("doc-editorial", BANK, null), {
    done: 0, total: 2, nextIndex: 0, allDone: false
  });
});

test("getSpecializedLabForMode devuelve laboratorio especializado para modos 11 y 12 o null", () => {
  assert.ok(SPECIALIZED_MODE_LABS["multimodal-vision"]);
  assert.ok(SPECIALIZED_MODE_LABS["gem-studio"]);
  const mmLab = getSpecializedLabForMode("multimodal-vision");
  assert.equal(mmLab.labId, "multimodal-simulator-module");
  assert.equal(mmLab.cases.length, 2);
  const gemLab = getSpecializedLabForMode("gem-studio");
  assert.equal(gemLab.labId, "gem-studio-module");
  assert.equal(gemLab.cases.length, 2);
  assert.equal(getSpecializedLabForMode("doc-editorial"), null);
  assert.equal(getSpecializedLabForMode(null), null);
  assert.equal(getSpecializedLabForMode(""), null);
});

test("resolveImmersiveFocus conmuta automáticamente la vista cuando el aprendiz salta entre simulador, ejercicios y laboratorios", () => {
  assert.deepEqual(IMMERSIVE_FOCUS_MODES, ["all", "split", "simulator", "exercises"]);
  assert.equal(resolveImmersiveFocus("all", "exercises"), "all");
  assert.equal(resolveImmersiveFocus("split", "exercises"), "split");
  assert.equal(resolveImmersiveFocus("simulator", "exercises"), "exercises");
  assert.equal(resolveImmersiveFocus("exercises", "simulator"), "simulator");
  assert.equal(resolveImmersiveFocus("simulator", "labs"), "all");
  assert.equal(resolveImmersiveFocus("exercises", "labs"), "all");
  assert.equal(resolveImmersiveFocus("split", "labs"), "all");
  assert.equal(resolveImmersiveFocus("invalido", null), "all");
  assert.equal(resolveImmersiveFocus("simulator", null), "simulator");
  assert.equal(resolveImmersiveFocus("exercises", "otro"), "exercises");
});

// --- Recorrido guiado: selector desplegable de los ejercicios y progreso global ---
const { buildJourneyGroups, journeyRemaining, parseJourneyValue } = require(path.join(__dirname, "..", "js", "canvas-nav.js"));
const JOURNEY_BANK = {
  "doc-editorial": [{ id: "d-a", code: "1A", title: "Informe" }, { id: "d-b", code: "1B", title: "Propuesta" }],
  "code-prototyping": [{ id: "c-a", code: "2A", title: "Landing" }]
};
const JOURNEY_MODES = ["doc-editorial", "code-prototyping"];
const JOURNEY_NAMES = { "doc-editorial": "1. Redacción", "code-prototyping": "2. Código" };

test("buildJourneyGroups agrupa los ejercicios por modo con su estado", () => {
  const groups = buildJourneyGroups(JOURNEY_MODES, JOURNEY_NAMES, JOURNEY_BANK, ["d-a"]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].label, "1. Redacción (1/2)");
  assert.deepEqual(groups[0].options[0], { value: "doc-editorial|0", label: "✓ 1A · Informe", done: true });
  assert.deepEqual(groups[0].options[1], { value: "doc-editorial|1", label: "1B · Propuesta", done: false });
  assert.equal(groups[1].label, "2. Código (0/1)");
});

test("buildJourneyGroups tolera progreso vacío, nombres ausentes y modos sin ejercicios", () => {
  const groups = buildJourneyGroups(["doc-editorial", "vacio"], {}, JOURNEY_BANK, null);
  assert.equal(groups.length, 1, "un modo sin ejercicios no aparece en el selector");
  assert.equal(groups[0].label, "doc-editorial (0/2)");
  assert.ok(groups[0].options.every(o => o.done === false));
  assert.deepEqual(buildJourneyGroups(null, null, null, null), []);
});

test("journeyRemaining cuenta lo que falta y en cuántos modos", () => {
  const seq = listExerciseSequence(JOURNEY_MODES, JOURNEY_BANK);
  assert.deepEqual(journeyRemaining(seq, []), { done: 0, total: 3, pending: 3, pendingModes: 2 });
  assert.deepEqual(journeyRemaining(seq, ["d-a", "d-b"]), { done: 2, total: 3, pending: 1, pendingModes: 1 });
  assert.deepEqual(journeyRemaining(seq, ["d-a", "d-b", "c-a", "otro"]), { done: 3, total: 3, pending: 0, pendingModes: 0 });
  assert.deepEqual(journeyRemaining(seq, undefined), { done: 0, total: 3, pending: 3, pendingModes: 2 });
});

test("parseJourneyValue acepta opciones válidas y rechaza las inválidas o vacías", () => {
  const seq = listExerciseSequence(JOURNEY_MODES, JOURNEY_BANK);
  assert.deepEqual(parseJourneyValue("doc-editorial|1", seq), { mode: "doc-editorial", exercise: 1, id: "d-b" });
  assert.equal(parseJourneyValue("code-prototyping|4", seq), null, "ejercicio inexistente");
  assert.equal(parseJourneyValue("otro|0", seq), null, "modo inexistente");
  assert.equal(parseJourneyValue("", seq), null, "valor vacío");
  assert.equal(parseJourneyValue(undefined, seq), null);
});

// --- Barra fija del recorrido: estaciones del modo actual y cierre de cada modo ---
const { buildModeStations, buildModeWrapUp } = require(path.join(__dirname, "..", "js", "canvas-nav.js"));

test("buildModeStations arma el ejemplo y las partes del modo con su estado", () => {
  const onExample = buildModeStations("doc-editorial", JOURNEY_BANK, ["d-b"], "simulator", 0);
  assert.equal(onExample.length, 3, "ejemplo más dos partes");
  assert.deepEqual(onExample[0], { key: "example", label: "Ejemplo", done: false, active: true });
  assert.deepEqual(onExample[1], { key: 0, label: "Parte A", code: "1A", title: "Informe", done: false, active: false });
  assert.deepEqual(onExample[2], { key: 1, label: "Parte B", code: "1B", title: "Propuesta", done: true, active: false });

  const onPartB = buildModeStations("doc-editorial", JOURNEY_BANK, [], "exercises", 1);
  assert.equal(onPartB[0].active, false, "el ejemplo deja de estar activo");
  assert.equal(onPartB[1].active, false);
  assert.equal(onPartB[2].active, true, "la parte B queda activa");
  assert.ok(onPartB.every(s => s.done === false), "sin avance no hay partes completas");
  const noStore = buildModeStations("doc-editorial", JOURNEY_BANK, undefined, "exercises", 0);
  assert.ok(noStore.every(s => s.done === false), "sin almacenamiento todas las partes quedan pendientes");
});

test("buildModeStations devuelve una lista vacía con modo inexistente o banco vacío", () => {
  assert.deepEqual(buildModeStations("otro", JOURNEY_BANK, [], "exercises", 0), []);
  assert.deepEqual(buildModeStations("doc-editorial", null, null, "exercises", 0), []);
  assert.deepEqual(buildModeStations("doc-editorial", { "doc-editorial": [] }, [], "simulator", 0), []);
});

test("buildModeWrapUp indica si sigue otra parte, el modo siguiente o el final", () => {
  const seq = listExerciseSequence(JOURNEY_MODES, JOURNEY_BANK);
  const nextPart = buildModeWrapUp(seq, "doc-editorial", 0, ["d-a"]);
  assert.equal(nextPart.kind, "next-part");
  assert.deepEqual(nextPart.next, { mode: "doc-editorial", exercise: 1, id: "d-b" });
  assert.deepEqual(nextPart.remaining, { done: 1, total: 3, pending: 2, pendingModes: 2 });

  const nextMode = buildModeWrapUp(seq, "doc-editorial", 1, []);
  assert.equal(nextMode.kind, "next-mode");
  assert.deepEqual(nextMode.next, { mode: "code-prototyping", exercise: 0, id: "c-a" });

  const finished = buildModeWrapUp(seq, "code-prototyping", 0, ["d-a", "d-b", "c-a"]);
  assert.equal(finished.kind, "finished");
  assert.equal(finished.next, null);
  assert.equal(finished.remaining.pending, 0);
});

test("buildModeWrapUp devuelve null si el ejercicio no existe o no hay secuencia", () => {
  const seq = listExerciseSequence(JOURNEY_MODES, JOURNEY_BANK);
  assert.equal(buildModeWrapUp(seq, "doc-editorial", 7, []), null);
  assert.equal(buildModeWrapUp(null, "doc-editorial", 0, []), null);
});

test("stationAtScroll marca los ejercicios cuando su borde superior pasa del 40 % de la ventana", () => {
  const { stationAtScroll } = require(path.join(__dirname, "..", "js", "canvas-nav.js"));
  assert.equal(stationAtScroll(900, 800), "simulator", "los ejercicios aún están abajo");
  assert.equal(stationAtScroll(320, 800), "exercises", "justo en el límite del 40 %");
  assert.equal(stationAtScroll(321, 800), "simulator");
  assert.equal(stationAtScroll(-1500, 800), "exercises", "ya se bajó dentro de los ejercicios");
});
