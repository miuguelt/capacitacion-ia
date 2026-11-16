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
  resolveImmersiveFocus,
  computeLearnerGuideState
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

test("computeLearnerGuideState orienta las 4 fases del aprendizaje (explorar, iterar, verificar y avanzar)", () => {
  // Caso 0: sin parámetros o sin ejercicio
  const emptyState = computeLearnerGuideState(null);
  assert.equal(emptyState.phase, "1-explore");
  assert.equal(emptyState.phaseNumber, 1);
  assert.equal(emptyState.ctaAction, "go-exercises");
  assert.equal(emptyState.labInfo, null);

  // Fase 1: Inicio de ejercicio (0 pasos y 0 criterios marcados)
  const phase1 = computeLearnerGuideState({
    mode: "doc-editorial",
    modeName: "1. Redacción & Documentos",
    exerciseIndex: 0,
    exercise: { code: "1A", title: "Informe ejecutivo" },
    stepsDone: 0,
    stepsTotal: 4,
    checksDone: 0,
    checksTotal: 5,
    modeStats: { done: 0, total: 3 },
    nextStep: { mode: "doc-editorial", exercise: 1, id: "d-b" }
  });
  assert.equal(phase1.phase, "1-explore");
  assert.equal(phase1.phaseNumber, 1);
  assert.equal(phase1.totalPhases, 4);
  assert.match(phase1.headline, /1A/);
  assert.equal(phase1.ctaAction, "copy-prompt");

  // Fase 2: Iterando pasos en Canvas (algunos pasos hechos, pero no todos)
  const phase2 = computeLearnerGuideState({
    mode: "multimodal-vision",
    modeName: "11. Visión Multimodal",
    exerciseIndex: 0,
    exercise: { code: "11A", title: "Boceto de formulario" },
    stepsDone: 2,
    stepsTotal: 4,
    checksDone: 1,
    checksTotal: 4,
    modeStats: { done: 0, total: 3 },
    nextStep: { mode: "multimodal-vision", exercise: 1, id: "mm-b" }
  });
  assert.equal(phase2.phase, "2-iterate");
  assert.equal(phase2.phaseNumber, 2);
  assert.match(phase2.headline, /Paso 3 de 4/);
  assert.equal(phase2.ctaAction, "focus-steps");
  assert.ok(phase2.labInfo);
  assert.equal(phase2.labInfo.labId, "multimodal-simulator-module");

  // Fase 3: Todos los pasos completados, faltan criterios de verificación
  const phase3 = computeLearnerGuideState({
    mode: "code-prototyping",
    modeName: "2. Código & Web en Vivo",
    exerciseIndex: 1,
    exercise: { code: "2B", title: "Tablero web" },
    stepsDone: 4,
    stepsTotal: 4,
    checksDone: 2,
    checksTotal: 4,
    modeStats: { done: 1, total: 3 },
    nextStep: { mode: "code-prototyping", exercise: 2, id: "c-c" }
  });
  assert.equal(phase3.phase, "3-verify");
  assert.equal(phase3.phaseNumber, 3);
  assert.match(phase3.headline, /2\/4/);
  assert.equal(phase3.ctaAction, "focus-checks");

  // Fase 4a: Ejercicio completado, siguiente ejercicio es del mismo modo
  const phase4SameMode = computeLearnerGuideState({
    mode: "doc-editorial",
    modeName: "1. Redacción & Documentos",
    exerciseIndex: 0,
    exercise: { code: "1A", title: "Informe ejecutivo" },
    stepsDone: 4,
    stepsTotal: 4,
    checksDone: 4,
    checksTotal: 4,
    modeStats: { done: 1, total: 3 },
    nextStep: { mode: "doc-editorial", exercise: 1, id: "d-b" }
  });
  assert.equal(phase4SameMode.phase, "4-advance");
  assert.equal(phase4SameMode.phaseNumber, 4);
  assert.equal(phase4SameMode.ctaAction, "next-exercise");
  assert.match(phase4SameMode.ctaLabel, /Parte B/);

  // Fase 4b: Ejercicio completado, siguiente ejercicio cambia de modo
  const phase4NewMode = computeLearnerGuideState({
    mode: "doc-editorial",
    modeName: "1. Redacción & Documentos",
    exerciseIndex: 2,
    exercise: { code: "1C", title: "Recorrido interfaz" },
    stepsDone: 4,
    stepsTotal: 4,
    checksDone: 4,
    checksTotal: 4,
    modeStats: { done: 3, total: 3 },
    nextStep: { mode: "code-prototyping", exercise: 0, id: "c-a" }
  });
  assert.equal(phase4NewMode.phase, "4-advance");
  assert.equal(phase4NewMode.ctaAction, "next-mode");
  assert.match(phase4NewMode.ctaLabel, /Siguiente modo/);

  // Fase 4c: Último ejercicio completado (nextStep es null) y ramas fallback de índice/título
  const phase4CourseDone = computeLearnerGuideState({
    mode: "gem-studio",
    modeName: "12. Gems para Canvas",
    exerciseIndex: 5,
    exercise: {},
    stepsDone: 4,
    stepsTotal: 4,
    checksDone: 4,
    checksTotal: 4,
    modeStats: { done: 2, total: 2 },
    nextStep: null
  });
  assert.equal(phase4CourseDone.phase, "4-advance");
  assert.equal(phase4CourseDone.ctaAction, "open-projects-hub");
  assert.match(phase4CourseDone.ctaLabel, /Hub de Proyectos/);

  // Fase 4a con índice fuera de ABC en nextStep y Fase 2 iniciada solo con checksDone > 0
  const phase4FallbackLetter = computeLearnerGuideState({
    mode: "doc-editorial",
    exerciseIndex: 0,
    exercise: { code: "1A", title: "Informe" },
    stepsDone: 0,
    stepsTotal: 4,
    checksDone: 4,
    checksTotal: 4,
    nextStep: { mode: "doc-editorial", exercise: 9 }
  });
  assert.match(phase4FallbackLetter.ctaLabel, /Parte B/);

  const phase2OnlyChecks = computeLearnerGuideState({
    mode: "doc-editorial",
    exerciseIndex: 0,
    exercise: { code: "1A", title: "Informe" },
    stepsDone: 0,
    stepsTotal: 4,
    checksDone: 1,
    checksTotal: 4
  });
  assert.equal(phase2OnlyChecks.phase, "2-iterate");
});
