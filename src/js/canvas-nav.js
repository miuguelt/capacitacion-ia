// Rutas profundas del módulo Gemini Canvas: #gemini-canvas/<modo>/<a|b>.
// Funciones puras: app.js las usa para navegar y las pruebas las comprueban sin DOM.
const CANVAS_ROUTE_PAGE = "gemini-canvas";
const CANVAS_EXERCISE_LETTERS = ["a", "b"];

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

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseCanvasRoute, buildCanvasRoute, neighborCanvasMode, listExerciseSequence,
    neighborExercise, firstPendingExercise, exercisePosition, serializeChecks, parseChecks
  };
}
