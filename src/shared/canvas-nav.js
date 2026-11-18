// Rutas profundas del módulo Gemini Canvas: #gemini-canvas/<modo>/<a|b|c>.
// Funciones puras: app.js las usa para navegar y las pruebas las comprueban sin DOM.
const CANVAS_ROUTE_PAGE = "gemini-canvas";
const CANVAS_EXERCISE_LETTERS = ["a", "b", "c"];

function parseCanvasRoute(hash, modes) {
  const clean = String(hash || "").replace(/^#/, "");
  if (!clean) return { page: null, mode: null, exercise: null };
  const [page, mode, letter] = clean.split("/");
  const known = Array.isArray(modes) && modes.includes(mode);
  const index = CANVAS_EXERCISE_LETTERS.indexOf(letter);
  return {
    page,
    mode: known ? mode : null,
    exercise: known && index >= 0 ? index : null
  };
}

function buildCanvasRoute(mode, exercise) {
  if (!mode) return `#${CANVAS_ROUTE_PAGE}`;
  const letter = CANVAS_EXERCISE_LETTERS[exercise];
  return `#${CANVAS_ROUTE_PAGE}/${mode}${letter ? `/${letter}` : ""}`;
}

function neighborCanvasMode(modes, current, direction) {
  const index = modes.indexOf(current);
  if (index < 0) return null;
  return modes[index + direction] || null;
}

// Recorrido lineal de los ejercicios: modo 1 A, modo 1 B, modo 2 A...
function listExerciseSequence(modes, bank) {
  const seq = [];
  modes.forEach(mode => {
    (bank[mode] || []).forEach((ex, exercise) => seq.push({ mode, exercise, id: ex.id }));
  });
  return seq;
}

function findStep(seq, mode, exercise) {
  return seq.findIndex(step => step.mode === mode && step.exercise === exercise);
}

function neighborExercise(seq, mode, exercise, direction) {
  const index = findStep(seq, mode, exercise);
  if (index < 0) return null;
  return seq[index + direction] || null;
}

function firstPendingExercise(seq, completedIds) {
  const done = Array.isArray(completedIds) ? completedIds : [];
  return seq.find(step => !done.includes(step.id)) || null;
}

function exercisePosition(seq, mode, exercise) {
  const index = findStep(seq, mode, exercise);
  return index < 0 ? null : { number: index + 1, total: seq.length };
}

// Casillas marcadas a medias: se guardan como índices.
function serializeChecks(states) {
  return states.reduce((acc, on, i) => (on ? acc.concat(i) : acc), []);
}

function parseChecks(saved, count) {
  const list = Array.isArray(saved) ? saved : [];
  return Array.from({ length: count }, (_, i) => list.includes(i));
}

function modeExerciseProgress(mode, bank, completedIds) {
  const list = bank && Array.isArray(bank[mode]) ? bank[mode] : [];
  if (!list.length) return { done: 0, total: 0, nextIndex: 0, allDone: false };
  const completed = new Set(Array.isArray(completedIds) ? completedIds : []);
  const done = list.filter(ex => completed.has(ex.id)).length;
  const pendingIdx = list.findIndex(ex => !completed.has(ex.id));
  return {
    done,
    total: list.length,
    nextIndex: pendingIdx >= 0 ? pendingIdx : 0,
    allDone: done === list.length
  };
}

function isModeTransition(prevMode, nextMode) {
  return Boolean(prevMode && nextMode && prevMode !== nextMode);
}

const SPECIALIZED_MODE_LABS = {
  "multimodal-vision": {
    labId: "multimodal-simulator-module",
    title: "Simulador de Visión Multimodal (Boceto a Canvas)",
    cases: [
      { index: 0, caseId: "form", label: "Caso A: Boceto de Formulario (11A)" },
      { index: 1, caseId: "flow", label: "Caso B: Pizarra de Flujograma (11B)" }
    ]
  },
  "gem-studio": {
    labId: "gem-studio-module",
    title: "Constructor y Calibrador de Gems en Vivo",
    cases: [
      { index: 0, preset: "socratic", label: "Plantilla Tutor Socrático (12A)" },
      { index: 1, preset: "auditor", label: "Plantilla Auditor de Rúbricas (12B)" }
    ]
  }
};

function getSpecializedLabForMode(mode) {
  if (!mode || typeof mode !== "string") return null;
  return SPECIALIZED_MODE_LABS[mode] || null;
}

const IMMERSIVE_FOCUS_MODES = ["all", "split", "simulator", "exercises"];

function resolveImmersiveFocus(currentFocus, requestedSection) {
  const safeCurrent = IMMERSIVE_FOCUS_MODES.includes(currentFocus) ? currentFocus : "all";
  if (!requestedSection) return safeCurrent;
  if (requestedSection === "labs") return "all";
  if (safeCurrent === "all" || safeCurrent === "split") return safeCurrent;
  if (requestedSection === "exercises" && safeCurrent === "simulator") return "exercises";
  if (requestedSection === "simulator" && safeCurrent === "exercises") return "simulator";
  return safeCurrent;
}

// --- Recorrido guiado: selector de ejercicios agrupado por modo y progreso global ---
function buildJourneyGroups(modes, names, bank, completedIds) {
  const done = new Set(Array.isArray(completedIds) ? completedIds : []);
  const labels = names && typeof names === "object" ? names : {};
  const source = bank && typeof bank === "object" ? bank : {};
  return (Array.isArray(modes) ? modes : [])
    .filter(mode => Array.isArray(source[mode]) && source[mode].length)
    .map(mode => {
      const options = source[mode].map((ex, i) => ({
        value: `${mode}|${i}`,
        label: `${done.has(ex.id) ? "✓ " : ""}${ex.code} · ${ex.title}`,
        done: done.has(ex.id)
      }));
      const count = options.filter(o => o.done).length;
      return { mode, label: `${labels[mode] || mode} (${count}/${options.length})`, options };
    });
}

function journeyRemaining(seq, completedIds) {
  const done = new Set(Array.isArray(completedIds) ? completedIds : []);
  const pendingSteps = seq.filter(step => !done.has(step.id));
  return {
    done: seq.length - pendingSteps.length,
    total: seq.length,
    pending: pendingSteps.length,
    pendingModes: new Set(pendingSteps.map(step => step.mode)).size
  };
}

function parseJourneyValue(value, seq) {
  const [mode, raw] = String(value || "").split("|");
  const exercise = Number(raw);
  return seq.find(step => step.mode === mode && step.exercise === exercise) || null;
}

// Estaciones del modo actual para la barra fija: el ejemplo del simulador y las partes del modo.
function buildModeStations(mode, bank, completedIds, station, exerciseIndex) {
  const source = bank && typeof bank === "object" ? bank : {};
  const list = Array.isArray(source[mode]) ? source[mode] : [];
  if (!list.length) return [];
  const done = new Set(Array.isArray(completedIds) ? completedIds : []);
  const onExample = station !== "exercises";
  return [{ key: "example", label: "Ejemplo", done: false, active: onExample }].concat(list.map((ex, i) => ({
    key: i,
    label: `Parte ${String.fromCharCode(65 + i)}`,
    code: ex.code,
    title: ex.title,
    done: done.has(ex.id),
    active: !onExample && i === exerciseIndex
  })));
}

// Paso en pantalla según dónde empiezan los ejercicios: si su borde superior ya pasó del 40 % de la ventana, el aprendiz está en ellos.
function stationAtScroll(exercisesTop, viewportHeight) {
  return Number(exercisesTop) <= Number(viewportHeight) * 0.4 ? "exercises" : "simulator";
}

// Qué sigue después del ejercicio actual: otra parte del mismo modo, el modo siguiente o el final del recorrido.
function buildModeWrapUp(seq, mode, exercise, completedIds) {
  const steps = Array.isArray(seq) ? seq : [];
  if (findStep(steps, mode, exercise) < 0) return null;
  const next = neighborExercise(steps, mode, exercise, 1);
  const remaining = journeyRemaining(steps, completedIds);
  if (!next) return { kind: "finished", next: null, remaining };
  return { kind: next.mode === mode ? "next-part" : "next-mode", next, remaining };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    buildJourneyGroups, journeyRemaining, parseJourneyValue, buildModeStations, buildModeWrapUp, stationAtScroll,
    parseCanvasRoute, buildCanvasRoute, neighborCanvasMode, listExerciseSequence,
    neighborExercise, firstPendingExercise, exercisePosition, serializeChecks, parseChecks,
    modeExerciseProgress, isModeTransition, SPECIALIZED_MODE_LABS, getSpecializedLabForMode,
    IMMERSIVE_FOCUS_MODES, resolveImmersiveFocus
  };
}
