// Sincroniza materiales/gemini_canvas/banco_prompts_canvas.json con js/canvas-possibilities.js.
// Uso: node scripts/export_canvas_possibilities.cjs
const fs = require("node:fs");
const path = require("node:path");
const { exportCanvasPossibilities } = require(path.join(__dirname, "..", "js", "canvas-possibilities.js"));

const file = path.join(__dirname, "..", "materiales", "gemini_canvas", "banco_prompts_canvas.json");
const bank = JSON.parse(fs.readFileSync(file, "utf8"));
fs.writeFileSync(file, `${JSON.stringify(exportCanvasPossibilities(bank), null, 2)}\n`, "utf8");
console.log(`Banco actualizado: ${path.relative(process.cwd(), file)}`);
