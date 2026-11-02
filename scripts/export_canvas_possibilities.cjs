// Sincroniza materiales/gemini_canvas/banco_prompts_canvas.json con js/canvas-possibilities.js y js/canvas-exercises.js.
// Uso: node scripts/export_canvas_possibilities.cjs
const fs = require("node:fs");
const path = require("node:path");
const { exportCanvasPossibilities } = require(path.join(__dirname, "..", "js", "canvas-possibilities.js"));
const { CANVAS_EXERCISES } = require(path.join(__dirname, "..", "js", "canvas-exercises.js"));

const file = path.join(__dirname, "..", "materiales", "gemini_canvas", "banco_prompts_canvas.json");
const bank = JSON.parse(fs.readFileSync(file, "utf8"));

// Sincroniza cada ejercicio con los definidos canónicamente en CANVAS_EXERCISES
for (const p of bank.possibilities) {
  if (CANVAS_EXERCISES[p.id]) {
    p.exercises = CANVAS_EXERCISES[p.id].map(ex => ({
      id: ex.id,
      title: ex.title,
      level: ex.level,
      duration: ex.duration,
      canvasFeature: ex.canvasFeature,
      goal: ex.goal,
      scenario: ex.scenario,
      promptParts: ex.promptParts,
      steps: ex.steps,
      expected: ex.expected,
      stretch: ex.stretch,
      prompt: ex.prompt
    }));
  }
}

fs.writeFileSync(file, `${JSON.stringify(exportCanvasPossibilities(bank), null, 2)}\n`, "utf8");
console.log(`Banco actualizado: ${path.relative(process.cwd(), file)}`);

