/**
 * Empirical Adversarial & Visual/Layout QA Harness for Milestone 2
 * Tests layout, text-layout audit, mirror SHA256 integrity, split view, 12 modes tabs, lexical scanner.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { execSync } = require("node:child_process");

console.log("================================================================================");
console.log("   EMPIRICAL ADVERSARIAL QA HARNESS — MILESTONE 2: LAYOUT & VISUAL QA");
console.log("================================================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  process.stdout.write(`[TEST ${totalTests}] ${name} ... `);
  try {
    fn();
    passedTests++;
    console.log("PASSED \u2705");
  } catch (err) {
    console.log("FAILED \u274C");
    console.error(err.message);
    throw err;
  }
}

// TEST 1: Text Layout Audit (Regla 7.4)
runTest("Text layout audit CLI tool (Regla 7.4)", () => {
  const result = execSync("node tools/text-layout/scripts/text-layout-audit.mjs --root . --project --fail-on-violations --json", {
    encoding: "utf8"
  });
  const data = JSON.parse(result);
  assert.strictEqual(data.errors, 0, "Should have 0 errors");
  assert.strictEqual(data.findings.length, 0, "Should have 0 findings/violations");
  assert.strictEqual(data.scopes[0].findings, 0, "Scope findings must be 0");
});

// TEST 2: Mirror Exactness (SHA-256 and byte diff = 0)
runTest("Mirror exactness SHA-256 and 0 bytes diff", () => {
  const pairs = [
    ["index.html", "src/index.html"],
    ["css/styles.css", "src/css/styles.css"],
    ["css/styles.css", "src/styles/styles.css"],
    ["js/app.js", "src/js/app.js"],
    ["js/app.js", "src/shared/app.js"]
  ];

  for (const [f1, f2] of pairs) {
    assert(fs.existsSync(f1), `File ${f1} must exist`);
    assert(fs.existsSync(f2), `File ${f2} must exist`);
    const buf1 = fs.readFileSync(f1);
    const buf2 = fs.readFileSync(f2);
    assert.strictEqual(buf1.length, buf2.length, `Byte discrepancy between ${f1} and ${f2}: ${buf1.length} vs ${buf2.length}`);
    const hash1 = crypto.createHash("sha256").update(buf1).digest("hex");
    const hash2 = crypto.createHash("sha256").update(buf2).digest("hex");
    assert.strictEqual(hash1, hash2, `Hash mismatch between ${f1} and ${f2}: ${hash1} vs ${hash2}`);
  }
});

// TEST 3: Lexical Prohibitions ("dossier" scanner across all modified & production files)
runTest("Lexical scan for forbidden 'dossier' across production files", () => {
  const productionFiles = [
    "index.html",
    "src/index.html",
    "css/styles.css",
    "src/css/styles.css",
    "src/styles/styles.css",
    "js/app.js",
    "src/js/app.js",
    "src/shared/app.js",
    "js/canvas-possibilities.js",
    "src/js/canvas-possibilities.js",
    "src/shared/canvas-possibilities.js",
    "js/canvas-exercises.js",
    "src/js/canvas-exercises.js",
    "src/shared/canvas-exercises.js",
    "materiales/gemini_canvas/banco_prompts_canvas.json"
  ];

  for (const f of productionFiles) {
    const content = fs.readFileSync(f, "utf8");
    const match = content.match(/dossier/i);
    assert.strictEqual(match, null, `Forbidden term 'dossier' found in ${f}`);
  }
});

// TEST 4: Botonera de 12 Modos en index.html y src/index.html
runTest("12 Modes tabs and data-possibility attributes in index.html and src/index.html", () => {
  const canonical12 = [
    "doc-editorial",
    "code-prototyping",
    "data-matrix",
    "flowchart-diagram",
    "visual-mockup",
    "inline-prompting",
    "algorithm-refactor",
    "rubric-curriculum",
    "sql-pipeline",
    "executive-report",
    "multimodal-vision",
    "gem-studio"
  ];

  for (const htmlFile of ["index.html", "src/index.html"]) {
    const html = fs.readFileSync(htmlFile, "utf8");
    const regex = /<button[^>]*class=["'][^"']*canvas-tab[^"']*["'][^>]*data-possibility=["']([^"']+)["']/g;
    let m;
    const found = [];
    while ((m = regex.exec(html)) !== null) {
      found.push(m[1]);
    }
    assert.strictEqual(found.length, 12, `Must find 12 canvas-tab buttons in ${htmlFile}`);
    assert.deepStrictEqual(found, canonical12, `Canvas tab keys in ${htmlFile} do not match canonical 12 modes`);
  }
});

// TEST 5: Modo Split de 2 Salidas en index.html y src/index.html
runTest("Modo Split structure (Salida 1 y Salida 2) in HTML", () => {
  for (const htmlFile of ["index.html", "src/index.html"]) {
    const html = fs.readFileSync(htmlFile, "utf8");
    assert(html.includes("canvas-split-container"), `Missing .canvas-split-container in ${htmlFile}`);
    assert(html.includes("id=\"canvas-output-primary\""), `Missing #canvas-output-primary in ${htmlFile}`);
    assert(html.includes("id=\"canvas-output-refinement\""), `Missing #canvas-output-refinement in ${htmlFile}`);
    assert(html.includes("Salida 1: Lienzo Principal (Artefacto generado)"), `Missing Salida 1 label in ${htmlFile}`);
    assert(html.includes("Salida 2: Interacción y Refinamiento"), `Missing Salida 2 label in ${htmlFile}`);
    assert(html.includes("canvas-output-badge output-primary"), `Missing Salida 1 badge class in ${htmlFile}`);
    assert(html.includes("canvas-output-badge output-refinement"), `Missing Salida 2 badge class in ${htmlFile}`);
  }
});

// TEST 6: CSS Grid Responsiveness and Layout Architecture
runTest("CSS Grid and responsive rules for .canvas-split-container and badges", () => {
  for (const cssFile of ["css/styles.css", "src/css/styles.css", "src/styles/styles.css"]) {
    const css = fs.readFileSync(cssFile, "utf8");
    assert(css.includes(".canvas-split-container"), `Missing .canvas-split-container in ${cssFile}`);
    assert(css.includes("grid-template-columns: minmax(320px, 1fr) minmax(380px, 1.35fr)"), `Missing desktop 2-column grid in ${cssFile}`);
    assert(css.includes("max-width: 1024px"), `Missing responsive breakpoint in ${cssFile}`);
    assert(css.includes(".canvas-output-badge"), `Missing .canvas-output-badge in ${cssFile}`);
    assert(css.includes(".output-primary"), `Missing .output-primary in ${cssFile}`);
    assert(css.includes(".output-refinement"), `Missing .output-refinement in ${cssFile}`);
    assert(css.includes("[data-theme=\"dark\"] .canvas-output-badge.output-primary"), `Missing dark theme styles for primary in ${cssFile}`);
    assert(css.includes("[data-theme=\"dark\"] .canvas-output-badge.output-refinement"), `Missing dark theme styles for refinement in ${cssFile}`);
  }
});

// TEST 7: Lower modules preservation (F12)
runTest("Preservation of lower modules (#multimodal-simulator-module, #gem-studio-module)", () => {
  for (const htmlFile of ["index.html", "src/index.html"]) {
    const html = fs.readFileSync(htmlFile, "utf8");
    assert(html.includes("id=\"multimodal-simulator-module\""), `Missing #multimodal-simulator-module in ${htmlFile}`);
    assert(html.includes("id=\"gem-studio-module\""), `Missing #gem-studio-module in ${htmlFile}`);
  }
});

console.log(`\n================================================================================`);
console.log(`   ALL ${passedTests}/${totalTests} TESTS PASSED CLEANLY \u2705`);
console.log(`================================================================================\n`);
