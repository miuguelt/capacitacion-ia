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

if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseCanvasRoute, buildCanvasRoute, neighborCanvasMode };
}
