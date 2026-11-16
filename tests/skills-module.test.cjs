// Pruebas del módulo de Agent Skills (validación, SKILL.md, ejemplos y HTML).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const S = require(path.join(ROOT, "js", "skills-module.js"));

const VALID = {
  name: "resumen-semanal",
  description: "Resume los avances de la semana. Úsala cuando prepares el informe del viernes.",
  contexto: "Recibes la lista de tareas cerradas.",
  rol: "Asistente de coordinación",
  tarea: "Resume en 5 viñetas.",
  tono: "Ejecutivo",
  limites: "No inventes tareas.",
  resources: ""
};

test("validateSkillName acepta kebab-case y rechaza formatos inválidos", () => {
  assert.deepEqual(S.validateSkillName("acta-de-comite"), []);
  assert.deepEqual(S.validateSkillName("a1"), []);
  assert.match(S.validateSkillName("")[0], /obligatorio/);
  assert.match(S.validateSkillName(undefined)[0], /obligatorio/);
  assert.match(S.validateSkillName("Acta De Comite").join(" "), /minúsculas/);
  assert.match(S.validateSkillName("acta--doble").join(" "), /minúsculas/);
  assert.match(S.validateSkillName("-acta").join(" "), /minúsculas/);
  assert.match(S.validateSkillName("skill-claude").join(" "), /reservadas/);
  assert.match(S.validateSkillName("anthropic-x").join(" "), /reservadas/);
});

test("validateSkillName respeta el límite de 64 caracteres", () => {
  assert.deepEqual(S.validateSkillName("a".repeat(64)), []);
  assert.match(S.validateSkillName("a".repeat(65)).join(" "), /64/);
});

test("validateSkillDescription exige cuándo usarla y respeta los límites", () => {
  assert.deepEqual(S.validateSkillDescription(VALID.description), []);
  assert.match(S.validateSkillDescription("  ")[0], /obligatoria/);
  assert.match(S.validateSkillDescription("Resume documentos.").join(" "), /cuándo usar/);
  assert.match(S.validateSkillDescription("Úsala cuando <script>").join(" "), /< o >/);
  assert.match(S.validateSkillDescription("Úsala cuando\nhaya dos líneas").join(" "), /una sola línea/);
  const max = "Úsala cuando " + "x".repeat(S.SKILL_DESCRIPTION_MAX - 13);
  assert.equal(max.length, S.SKILL_DESCRIPTION_MAX);
  assert.deepEqual(S.validateSkillDescription(max), []);
  assert.match(S.validateSkillDescription(max + "x").join(" "), /1024/);
});

test("evaluateSkill: entrada válida", () => {
  assert.deepEqual(S.evaluateSkill(VALID), { state: "valid", errors: [], warnings: [] });
});

test("evaluateSkill: entrada vacía y reinicio", () => {
  for (const input of [undefined, null, "x", {}, { name: " ", tarea: "" }]) {
    assert.deepEqual(S.evaluateSkill(input), { state: "empty", errors: [], warnings: [] });
  }
});

test("evaluateSkill: entrada inválida acumula errores y advertencias", () => {
  const r = S.evaluateSkill({ name: "Mala Skill", description: "Sin indicación", rol: "x" });
  assert.equal(r.state, "invalid");
  assert.equal(r.errors.length, 3);
  assert.match(r.errors.join(" "), /Tarea/);
  assert.equal(r.warnings.length, 2);
  const warn = S.evaluateSkill({ ...VALID, limites: "", contexto: "" });
  assert.equal(warn.state, "valid");
  assert.equal(warn.warnings.length, 2);
});

test("humanizeSkillName produce un título legible", () => {
  assert.equal(S.humanizeSkillName("informe-mesa-ayuda"), "Informe mesa ayuda");
  assert.equal(S.humanizeSkillName(""), "Skill");
});

test("composeSkillMd genera frontmatter, secciones CRTT+L en orden y recursos", () => {
  const md = S.composeSkillMd({ ...VALID, resources: "plantilla.md\n\n  datos.csv " });
  assert.ok(md.startsWith("---\nname: resumen-semanal\ndescription: Resume"));
  assert.match(md, /# Resumen semanal/);
  const order = ["## Contexto", "## Rol", "## Tarea", "## Tono", "## Límites", "## Recursos"].map(h => md.indexOf(h));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.ok(order.every(i => i > 0));
  assert.match(md, /- plantilla\.md\n- datos\.csv\n$/);
  const minimal = S.composeSkillMd({ name: "x", title: "Título propio", tarea: "T" });
  assert.match(minimal, /# Título propio/);
  assert.ok(!minimal.includes("## Contexto") && !minimal.includes("## Recursos"));
  assert.match(S.composeSkillMd(null), /^---\nname: \ndescription: \n---\n\n# Skill\n$/);
});

test("parseSkillMd lee el frontmatter y rechaza documentos sin él", () => {
  const parsed = S.parseSkillMd(S.composeSkillMd(VALID));
  assert.equal(parsed.name, VALID.name);
  assert.equal(parsed.description, VALID.description);
  assert.match(parsed.body, /## Tarea/);
  assert.equal(S.parseSkillMd("# Sin frontmatter"), null);
  assert.equal(S.parseSkillMd(42), null);
  const partial = S.parseSkillMd("---\nsin dos puntos\n: vacio\n---\ncuerpo");
  assert.deepEqual(partial, { name: "", description: "", body: "cuerpo" });
  assert.equal(S.parseSkillMd("---\r\nname: a\r\n---\r\nb").name, "a");
});

test("los ejemplos son válidos y coinciden con los archivos de materiales", () => {
  assert.equal(S.SKILL_EXAMPLES.length, 3);
  for (const ex of S.SKILL_EXAMPLES) {
    assert.deepEqual(S.evaluateSkill(ex), { state: "valid", errors: [], warnings: [] }, ex.name);
    const file = path.join(ROOT, "materiales", "dia3_agentes_web", "skills", ex.name, "SKILL.md");
    const content = fs.readFileSync(file, "utf-8").replace(/\r\n/g, "\n");
    assert.equal(content, S.composeSkillMd(ex), `${ex.name}: SKILL.md desactualizado`);
    const parsed = S.parseSkillMd(content);
    assert.equal(parsed.name, ex.name);
    assert.deepEqual(S.validateSkillDescription(parsed.description), []);
    const resource = ex.resources.split(": ")[1];
    assert.ok(fs.existsSync(path.join(ROOT, resource)), `${ex.name}: falta ${resource}`);
  }
});

test("la comparación y la lista de seguridad están completas", () => {
  assert.deepEqual(S.SKILL_COMPARISON.map(r => r.tool), ["Prompt", "Gem o GPT personalizado", "Skill", "Agente"]);
  assert.ok(S.SKILL_SECURITY_CHECKLIST.length >= 5);
  assert.match(S.SKILL_SECURITY_CHECKLIST.join(" "), /V\.E\.R\.A\./);
  assert.deepEqual(S.SKILL_BODY_SECTIONS.map(s => s.label), ["Contexto", "Rol", "Tarea", "Tono", "Límites"]);
});

test("los constructores de HTML escapan y reflejan los estados", () => {
  assert.equal(S.escapeSkillHtml(`<b a="1">'&'</b>`), "&lt;b a=&quot;1&quot;&gt;&#39;&amp;&#39;&lt;/b&gt;");
  const table = S.buildSkillComparisonHtml([{ tool: "<x>", what: "a", when: "b", reuse: "c" }]);
  assert.match(table, /<th scope="row">&lt;x&gt;<\/th>/);
  assert.match(S.buildSkillResultHtml(S.evaluateSkill({})), /data-state="empty"/);
  const invalid = S.buildSkillResultHtml(S.evaluateSkill({ name: "<mal>" }));
  assert.match(invalid, /data-state="invalid"/);
  assert.ok(!invalid.includes("<mal>"));
  assert.match(S.buildSkillResultHtml(S.evaluateSkill(VALID)), /data-state="valid"[\s\S]*SKILL\.md válido/);
  assert.ok(!S.buildSkillResultHtml(S.evaluateSkill(VALID)).includes("Sugerencias"));
  assert.match(S.buildSkillResultHtml(S.evaluateSkill({ ...VALID, limites: "" })), /Sugerencias/);
  const examples = S.buildSkillExamplesHtml(S.SKILL_EXAMPLES);
  assert.equal((examples.match(/<details/g) || []).length, 3);
});

test("el módulo es determinista y no usa temporizadores", () => {
  const code = fs.readFileSync(path.join(ROOT, "js", "skills-module.js"), "utf-8");
  assert.ok(!/setTimeout|setInterval/.test(code));
});
