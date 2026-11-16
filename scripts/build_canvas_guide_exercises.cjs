// Regenera la sección «7. Ejercicios prácticos por modo» de la guía Markdown a partir de js/canvas-exercises.js.
// Uso: node scripts/build_canvas_guide_exercises.cjs
const fs = require("node:fs");
const path = require("node:path");
const { CANVAS_STEP_PLACES } = require(path.join(__dirname, "..", "js", "canvas-coverage.js"));
const { CANVAS_EXERCISES, canvasCapabilityNames } = require(path.join(__dirname, "..", "js", "canvas-exercises.js"));

const file = path.join(__dirname, "..", "materiales", "gemini_canvas", "guia_gemini_canvas_todas_las_posibilidades.md");
const START = "## 7. Ejercicios prácticos por modo";
const END = "\n---\n\n### Posibilidad 11";
const CR = String.fromCharCode(13);
const LF = String.fromCharCode(10);

const EXTRA_HEADINGS = {
  "multimodal-vision": "### 11. Visión Multimodal (De boceto a Canvas en vivo)",
  "gem-studio": "### 12. Gems para Canvas (Asistente especializado de coescritura)",
  "interactive-apps": "### 13. Apps interactivas (datos guardados y compartidos)"
};

function formatStepWithPlace(step, placeKey) {
  const meta = CANVAS_STEP_PLACES[placeKey] || CANVAS_STEP_PLACES.canvas;
  return `[${meta.icon} ${meta.label}] ${step}`;
}

function renderExercise(ex, index) {
  const places = Array.isArray(ex.places) ? ex.places : [];
  const letter = ["A", "B", "C"][index] || "A";
  return [
    `#### Ejercicio ${letter} (${ex.code || ex.id}): ${ex.title}`,
    "",
    `- **Nivel:** ${ex.level} · **Duración:** ${ex.duration} · **Función de Canvas:** ${ex.canvasFeature}`,
    `- **Qué vas a lograr:** ${ex.goal}`,
    `- **Situación:** ${ex.scenario}`,
    `- **¿Por qué en Canvas?:** ${ex.whyCanvas}`,
    `- **¿Qué ocurre fuera de Canvas?:** ${ex.outsideCanvas}`,
    `- **Capacidades que practicas:** ${canvasCapabilityNames(ex.capabilities).join(" · ")}`,
    "",
    "**1. Prompt (CRTT+L) para pegar en Gemini:**",
    "",
    "```text",
    ex.prompt,
    "```",
    "",
    "**2. Itera paso a paso (con frontera de ejecución):**",
    "",
    ...ex.steps.map((s, i) => `${i + 1}. ${formatStepWithPlace(s, places[i])}`),
    "",
    ...(ex.reference ? [
      `**${ex.reference.label}:** ${ex.reference.intro}`,
      "",
      "```mermaid",
      ex.reference.code,
      "```",
      ""
    ] : []),
    "**3. Verifica tu resultado:**",
    "",
    ...ex.expected.map(c => `- [ ] ${c}`),
    "",
    `**Reto extra:** ${ex.stretch}`,
    ""
  ].join(LF);
}

const raw = fs.readFileSync(file, "utf8");
const crlf = raw.includes(CR + LF);
const guide = raw.split(CR + LF).join(LF);
const start = guide.indexOf(START);
const end = guide.indexOf(END);
if (start < 0 || end < 0) throw new Error("No se encontraron los límites de la sección 7");
const section = guide.slice(start, end);
const rawHeadings = section.match(/^### \d+\. .+$/gm) || [];
const baseHeadings = rawHeadings.slice(0, 10);
const intro = section.slice(0, section.indexOf(baseHeadings[0]));
const modes = Object.keys(CANVAS_EXERCISES);
const headings = modes.map((mode, idx) => baseHeadings[idx] || EXTRA_HEADINGS[mode] || `### ${idx + 1}. ${mode}`);
const body = modes.map((mode, i) => `${headings[i]}${LF}${LF}${CANVAS_EXERCISES[mode].map(renderExercise).join(LF)}`).join(LF);
const result = guide.slice(0, start) + intro + body + guide.slice(end);
fs.writeFileSync(file, crlf ? result.split(LF).join(CR + LF) : result, "utf8");
console.log(`Sección 7 regenerada con ${modes.length} modos.`);

