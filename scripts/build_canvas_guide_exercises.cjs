// Regenera la sección «7. Ejercicios prácticos por modo» de la guía Markdown a partir de js/canvas-exercises.js.
// Uso: node scripts/build_canvas_guide_exercises.cjs
const fs = require("node:fs");
const path = require("node:path");
const { CANVAS_EXERCISES, canvasCapabilityNames } = require(path.join(__dirname, "..", "js", "canvas-exercises.js"));

const file = path.join(__dirname, "..", "materiales", "gemini_canvas", "guia_gemini_canvas_todas_las_posibilidades.md");
const START = "## 7. Ejercicios prácticos por modo";
const END = "\n---\n\n### Posibilidad 11";
const CR = String.fromCharCode(13);
const LF = String.fromCharCode(10);

function renderExercise(ex, index) {
  return [
    `#### Ejercicio ${index === 0 ? "A" : "B"}: ${ex.title}`,
    "",
    `- **Nivel:** ${ex.level} · **Duración:** ${ex.duration} · **Función de Canvas:** ${ex.canvasFeature}`,
    `- **Qué vas a lograr:** ${ex.goal}`,
    `- **Situación:** ${ex.scenario}`,
    `- **¿Por qué en Canvas?:** ${ex.whyCanvas}`,
    `- **Capacidades que practicas:** ${canvasCapabilityNames(ex.capabilities).join(" · ")}`,
    "",
    "**1. Prompt para pegar en Gemini:**",
    "",
    "```text",
    ex.prompt,
    "```",
    "",
    "**2. Itera dentro de Canvas:**",
    "",
    ...ex.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
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
const headings = section.match(/^### \d+\. .+$/gm);
const intro = section.slice(0, section.indexOf(headings[0]));
const modes = Object.keys(CANVAS_EXERCISES).slice(0, headings.length);
const body = modes.map((mode, i) => `${headings[i]}${LF}${LF}${CANVAS_EXERCISES[mode].map(renderExercise).join(LF)}`).join(LF);
const result = guide.slice(0, start) + intro + body + guide.slice(end);
fs.writeFileSync(file, crlf ? result.split(LF).join(CR + LF) : result, "utf8");
console.log(`Sección 7 regenerada con ${modes.length} modos.`);
