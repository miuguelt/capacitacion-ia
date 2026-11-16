// Pruebas del módulo de Productividad con IA (CRTT+L, V.E.R.A., calculadora y estaciones).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const P = require(path.join(ROOT, "js", "productivity-module.js"));

const FULL = {
  contexto: "Notas de la reunión del comité",
  rol: "Secretario técnico del centro",
  tarea: "Tabla de compromisos con fecha",
  tono: "Institucional y cordial",
  limites: "No inventes datos faltantes"
};

test("los pilares CRTT+L siguen el orden canónico", () => {
  assert.deepEqual(P.CRTTL_PILLARS.map(p => p.label), ["Contexto", "Rol", "Tarea", "Tono", "Límites"]);
  assert.deepEqual(P.VERA_CHECKLIST.map(v => v.key), ["V", "E", "R", "A"]);
});

test("validateCrttlParts: entrada válida", () => {
  assert.deepEqual(P.validateCrttlParts(FULL), { state: "valid", score: 100, missing: [], weak: [] });
});

test("validateCrttlParts: entrada vacía y no objeto", () => {
  for (const input of [{}, null, "texto", { contexto: "   " }]) {
    const r = P.validateCrttlParts(input);
    assert.equal(r.state, "empty");
    assert.equal(r.score, 0);
    assert.equal(r.missing.length, 5);
  }
});

test("validateCrttlParts: entrada inválida por pilar faltante o débil", () => {
  const r = P.validateCrttlParts({ ...FULL, tono: "", limites: "corto" });
  assert.equal(r.state, "invalid");
  assert.deepEqual(r.missing, ["tono"]);
  assert.deepEqual(r.weak, ["limites"]);
  assert.equal(r.score, 60);
  assert.equal(P.validateCrttlParts({ ...FULL, rol: 42 }).missing[0], "rol");
});

test("composeCrttlPrompt ordena, recorta y omite pilares vacíos", () => {
  const prompt = P.composeCrttlPrompt({ limites: " L ", contexto: " C ", rol: "" });
  assert.equal(prompt, "Contexto:\nC\n\nLímites:\nL");
  assert.equal(P.composeCrttlPrompt(null), "");
  assert.ok(P.composeCrttlPrompt(FULL).startsWith("Contexto:"));
});

test("evaluateVeraChecklist: vacío, parcial, listo y reinicio", () => {
  assert.equal(P.evaluateVeraChecklist(null).state, "empty");
  assert.equal(P.evaluateVeraChecklist({}).state, "empty");
  const partial = P.evaluateVeraChecklist({ V: true, E: "sí" });
  assert.equal(partial.state, "partial");
  assert.deepEqual(partial.done, ["V"]);
  assert.deepEqual(partial.pending, ["E", "R", "A"]);
  assert.equal(P.evaluateVeraChecklist({ V: true, E: true, R: true, A: true }).state, "ready");
});

test("computeTimeSavings: entrada válida con ahorro", () => {
  const r = P.computeTimeSavings({ minutesBefore: "45", minutesAfter: "15", timesPerWeek: "3" });
  assert.equal(r.state, "valid");
  assert.equal(r.minutesSavedPerTask, 30);
  assert.equal(r.monthlyMinutes, 360);
  assert.equal(r.hoursPerMonth, 6);
  assert.equal(r.percent, 67);
  assert.equal(r.verdict, "ahorro");
});

test("computeTimeSavings: acepta coma decimal y veredictos neutro y pérdida", () => {
  assert.equal(P.computeTimeSavings({ minutesBefore: "10,5", minutesAfter: 0.5, timesPerWeek: 1 }).minutesSavedPerTask, 10);
  assert.equal(P.computeTimeSavings({ minutesBefore: 10, minutesAfter: 10, timesPerWeek: 2 }).verdict, "neutro");
  const loss = P.computeTimeSavings({ minutesBefore: 10, minutesAfter: 20, timesPerWeek: 1 });
  assert.equal(loss.verdict, "perdida");
  assert.equal(loss.hoursPerMonth, -0.7);
});

test("computeTimeSavings: entrada vacía (reinicio del formulario)", () => {
  for (const input of [undefined, null, {}, { minutesBefore: "", minutesAfter: " ", timesPerWeek: null }]) {
    assert.equal(P.computeTimeSavings(input).state, "empty");
  }
});

test("computeTimeSavings: entradas inválidas y límites", () => {
  const cases = [
    [{ minutesBefore: 10, minutesAfter: "", timesPerWeek: 1 }, /tres campos/],
    [{ minutesBefore: "abc", minutesAfter: 1, timesPerWeek: 1 }, /números/],
    [{ minutesBefore: 10, minutesAfter: -1, timesPerWeek: 1 }, /números/],
    [{ minutesBefore: 601, minutesAfter: 1, timesPerWeek: 1 }, /600/],
    [{ minutesBefore: 10, minutesAfter: 601, timesPerWeek: 1 }, /600/],
    [{ minutesBefore: 10, minutesAfter: 1, timesPerWeek: 101 }, /entero/],
    [{ minutesBefore: 10, minutesAfter: 1, timesPerWeek: 1.5 }, /entero/],
    [{ minutesBefore: 0, minutesAfter: 0, timesPerWeek: 1 }, /mayor que cero/]
  ];
  for (const [input, pattern] of cases) {
    const r = P.computeTimeSavings(input);
    assert.equal(r.state, "invalid", JSON.stringify(input));
    assert.match(r.message, pattern);
  }
  assert.equal(P.computeTimeSavings({ minutesBefore: 600, minutesAfter: 0, timesPerWeek: 100 }).state, "valid");
  assert.equal(P.computeTimeSavings({ minutesBefore: 5, minutesAfter: 1, timesPerWeek: 0 }).hoursPerMonth, 0);
});

test("hay una estación completa por día, con material existente y prompt CRTT+L válido", () => {
  assert.deepEqual(P.PRODUCTIVITY_STATIONS.map(s => s.day), ["dia-1", "dia-2", "dia-3", "dia-4"]);
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "deliverables.registry.json"), "utf-8"));
  const deliverableIds = JSON.stringify(registry);
  for (const s of P.PRODUCTIVITY_STATIONS) {
    assert.equal(P.validateCrttlParts(s.promptParts).state, "valid", s.id);
    assert.ok(fs.existsSync(path.join(ROOT, s.material)), `falta material ${s.material}`);
    assert.ok(s.gold.length >= 3 && s.antipattern.length >= 3, s.id);
    assert.ok(deliverableIds.includes(s.deliverableId), s.deliverableId);
    assert.equal(P.getStationByDay(s.day), s);
  }
  assert.equal(P.getStationByDay("dia-9"), null);
});

test("el kit de bolsillo tiene 15 plantillas válidas y filtra por categoría", () => {
  assert.equal(P.POCKET_KIT.length, 15);
  assert.equal(new Set(P.POCKET_KIT.map(k => k.id)).size, 15);
  for (const item of P.POCKET_KIT) {
    assert.equal(P.validateCrttlParts(item.parts).state, "valid", item.id);
  }
  assert.equal(P.filterPocketKit("").length, 15);
  assert.equal(P.filterPocketKit("Todas").length, 15);
  assert.equal(P.filterPocketKit(undefined).length, 15);
  assert.equal(P.filterPocketKit(" CORREO ").length, 2);
  assert.equal(P.filterPocketKit("inexistente").length, 0);
});

test("la matriz de uso responsable cubre datos personales y decisiones sobre personas", () => {
  assert.ok(P.NO_AI_MATRIX.length >= 5);
  const text = JSON.stringify(P.NO_AI_MATRIX);
  assert.match(text, /Ley 1581 de 2012/);
  assert.match(text, /sancionar/);
});

test("los constructores de HTML escapan el contenido", () => {
  assert.equal(P.escapeProdHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  const evil = { ...P.PRODUCTIVITY_STATIONS[0], title: "<script>alert(1)</script>" };
  const html = P.buildStationHtml(evil);
  assert.ok(!html.includes("<script>"));
  assert.match(html, /Copiar prompt CRTT\+L/);
  assert.match(html, /Estándar de Oro/);
});

test("buildSavingsResultHtml muestra los cuatro estados observables", () => {
  assert.match(P.buildSavingsResultHtml(P.computeTimeSavings({})), /data-state="empty"/);
  assert.match(P.buildSavingsResultHtml(P.computeTimeSavings({ minutesBefore: -1, minutesAfter: 1, timesPerWeek: 1 })), /data-state="invalid"/);
  assert.match(P.buildSavingsResultHtml(P.computeTimeSavings({ minutesBefore: 45, minutesAfter: 15, timesPerWeek: 3 })), /6 horas al mes[\s\S]*67 %/);
  assert.match(P.buildSavingsResultHtml(P.computeTimeSavings({ minutesBefore: 10, minutesAfter: 10, timesPerWeek: 1 })), /no reduce/);
  assert.match(P.buildSavingsResultHtml(P.computeTimeSavings({ minutesBefore: 10, minutesAfter: 20, timesPerWeek: 1 })), /tardas más/);
});

test("buildPocketKitHtml muestra plantillas o un estado vacío", () => {
  assert.match(P.buildPocketKitHtml([]), /No hay plantillas/);
  const html = P.buildPocketKitHtml(P.filterPocketKit("datos"));
  assert.equal((html.match(/<details/g) || []).length, 2);
  assert.match(html, /Contexto:/);
});

test("el módulo es determinista y no usa temporizadores", () => {
  const code = fs.readFileSync(path.join(ROOT, "js", "productivity-module.js"), "utf-8");
  assert.ok(!/setTimeout|setInterval/.test(code));
  assert.ok(!/R-C-I-R-F/.test(code));
});

test("ninguna superficie publicada enseña el marco R-C-I-R-F", () => {
  const files = ["index.html", "README.md", "deliverables.registry.json", "js/app.js", "js/dia3-module.js",
    "materiales/dia1_prompting/banco_prompts_referencia.md"];
  for (const rel of files) {
    const content = fs.readFileSync(path.join(ROOT, rel), "utf-8");
    assert.ok(!/R-C-I-R-F|rcirf/i.test(content), `${rel} menciona un marco no canónico`);
  }
});
