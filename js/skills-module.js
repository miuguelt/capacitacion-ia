// Módulo de Agent Skills: qué es una skill, comparación con prompts, Gems y agentes,
// constructor y validador de SKILL.md, ejemplos para el aula y lista de seguridad.
// Funciones puras y deterministas: sin temporizadores ni datos inventados.

const SKILL_NAME_MAX = 64;
const SKILL_DESCRIPTION_MAX = 1024;
const SKILL_RESERVED_WORDS = ["anthropic", "claude"];
const SKILL_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SKILL_WHEN_PATTERN = /\b(cuando|úsala|úsalo|usar|utilízala)\b/i;

const SKILL_BODY_SECTIONS = [
  { key: "contexto", label: "Contexto" },
  { key: "rol", label: "Rol" },
  { key: "tarea", label: "Tarea" },
  { key: "tono", label: "Tono" },
  { key: "limites", label: "Límites" }
];

function skillText(value) {
  return typeof value === "string" ? value.trim() : "";
}

// --- 1. Validación ---

function validateSkillName(name) {
  const value = skillText(name);
  const errors = [];
  if (value === "") return ["El nombre es obligatorio."];
  if (value.length > SKILL_NAME_MAX) errors.push(`El nombre admite como máximo ${SKILL_NAME_MAX} caracteres.`);
  if (!SKILL_NAME_PATTERN.test(value)) errors.push("Usa solo minúsculas, números y guiones (por ejemplo, acta-de-comite).");
  if (SKILL_RESERVED_WORDS.some(word => value.includes(word))) errors.push("El nombre no puede contener palabras reservadas como «claude» o «anthropic».");
  return errors;
}

function validateSkillDescription(description) {
  const value = skillText(description);
  const errors = [];
  if (value === "") return ["La descripción es obligatoria: el agente la lee para decidir cuándo usar la skill."];
  if (value.length > SKILL_DESCRIPTION_MAX) errors.push(`La descripción admite como máximo ${SKILL_DESCRIPTION_MAX} caracteres.`);
  if (/[<>]/.test(value)) errors.push("La descripción no puede contener los signos < o >.");
  if (/[\r\n]/.test(value)) errors.push("La descripción debe ocupar una sola línea.");
  if (!SKILL_WHEN_PATTERN.test(value)) errors.push("Explica cuándo usar la skill (por ejemplo, «Úsala cuando…»).");
  return errors;
}

// Evalúa la skill completa. Estados: empty, invalid, valid.
function evaluateSkill(parts) {
  const source = parts && typeof parts === "object" ? parts : {};
  const fields = ["name", "description", "resources"].concat(SKILL_BODY_SECTIONS.map(s => s.key));
  if (fields.every(f => skillText(source[f]) === "")) {
    return { state: "empty", errors: [], warnings: [] };
  }
  const errors = validateSkillName(source.name).concat(validateSkillDescription(source.description));
  if (skillText(source.tarea) === "") errors.push("Las instrucciones necesitan al menos la Tarea.");
  const warnings = [];
  if (skillText(source.limites) === "") warnings.push("Agrega Límites: qué no debe hacer y qué hacer si falta un dato.");
  if (skillText(source.contexto) === "") warnings.push("Agrega Contexto: qué material recibe la skill.");
  return { state: errors.length === 0 ? "valid" : "invalid", errors, warnings };
}

// --- 2. Composición y lectura de SKILL.md ---

function humanizeSkillName(name) {
  const value = skillText(name);
  if (value === "") return "Skill";
  const text = value.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function composeSkillMd(parts) {
  const source = parts && typeof parts === "object" ? parts : {};
  const lines = [
    "---",
    `name: ${skillText(source.name)}`,
    `description: ${skillText(source.description)}`,
    "---",
    "",
    `# ${skillText(source.title) || humanizeSkillName(source.name)}`
  ];
  for (const section of SKILL_BODY_SECTIONS) {
    const text = skillText(source[section.key]);
    if (text !== "") lines.push("", `## ${section.label}`, "", text);
  }
  const resources = skillText(source.resources)
    .split(/\r?\n/)
    .map(r => r.trim())
    .filter(Boolean);
  if (resources.length > 0) {
    lines.push("", "## Recursos", "", ...resources.map(r => `- ${r}`));
  }
  return lines.join("\n") + "\n";
}

// Lee el frontmatter de un SKILL.md. Devuelve null si no tiene la forma esperada.
function parseSkillMd(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(typeof text === "string" ? text : "");
  if (!match) return null;
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { name: meta.name || "", description: meta.description || "", body: match[2] };
}

// --- 3. Contenido didáctico ---

const SKILL_COMPARISON = [
  { tool: "Prompt", what: "Instrucción que escribes en cada conversación.", when: "Tareas únicas o que cambian cada vez.", reuse: "Copiar y pegar." },
  { tool: "Gem o GPT personalizado", what: "Asistente con instrucciones fijas dentro de una plataforma de chat.", when: "Un rol estable para conversar (tutor, revisor).", reuse: "Se comparte el enlace del asistente." },
  { tool: "Skill", what: "Carpeta con SKILL.md, instrucciones y recursos que un agente carga solo cuando la tarea lo necesita.", when: "Procedimientos repetibles con plantillas, datos o scripts propios.", reuse: "Se copia la carpeta; varios agentes pueden usarla." },
  { tool: "Agente", what: "IA que planea y ejecuta pasos con herramientas (archivos, terminal, web).", when: "Tareas de varios pasos que requieren actuar, no solo responder.", reuse: "Se configura una vez y usa skills y herramientas." }
];

const SKILL_SECURITY_CHECKLIST = [
  "Conoces el origen de la skill y quién la mantiene.",
  "Leíste el SKILL.md y todos sus scripts antes de instalarla.",
  "La skill no contiene contraseñas, claves de API ni datos personales.",
  "Los scripts no borran archivos ni envían datos a sitios desconocidos.",
  "Revisas con V.E.R.A. el resultado antes de usarlo."
];

const SKILL_EXAMPLES = [
  {
    name: "acta-de-comite",
    title: "Acta de comité",
    description: "Convierte notas desordenadas de una reunión en un acta con tabla de compromisos. Úsala cuando recibas notas de comité o de reuniones de coordinación.",
    contexto: "Recibes notas tomadas a mano o en chat durante una reunión de un centro de formación.",
    rol: "Actúa como secretario técnico del comité.",
    tarea: "Entrega: 1) resumen de 4 oraciones; 2) tabla Markdown con tarea, responsable y fecha; 3) lista de temas pendientes.",
    tono: "Institucional y claro, en español de Colombia.",
    limites: "No inventes fechas ni responsables: escribe [Pendiente]. No incluyas comentarios personales de los asistentes.",
    resources: "Ejemplo de entrada: materiales/dia1_prompting/caso_estudio_comite_desordenado.txt"
  },
  {
    name: "respuesta-correo-institucional",
    title: "Respuesta a correo institucional",
    description: "Redacta respuestas breves y cordiales a correos institucionales. Úsala cuando debas contestar solicitudes, recordatorios o quejas por correo.",
    contexto: "Recibes el texto de un correo y, si existe, el acta o documento con los datos para responder.",
    rol: "Actúa como asistente administrativo de un centro de formación.",
    tarea: "Redacta una respuesta de máximo 6 líneas que conteste cada pregunta y cierre con una acción concreta.",
    tono: "Cordial y directo; trata de usted al destinatario.",
    limites: "No prometas fechas ni recursos que no aparezcan en el material. Señala con [Confirmar] lo que necesite aprobación.",
    resources: "Ejemplos de entrada: materiales/dia1_prompting/bandeja_correos_practica.md"
  },
  {
    name: "informe-mesa-ayuda",
    title: "Informe de mesa de ayuda",
    description: "Resume los indicadores de una mesa de ayuda a partir de un CSV. Úsala cuando necesites un informe mensual de casos, tiempos y satisfacción.",
    contexto: "Recibes un archivo CSV con columnas de casos abiertos, resueltos, tiempo promedio y satisfacción.",
    rol: "Actúa como analista de datos de un área de soporte.",
    tarea: "Entrega: 1) tabla con porcentaje de casos resueltos por fila; 2) tres hallazgos con la fila que los respalda; 3) una recomendación.",
    tono: "Ejecutivo y concreto.",
    limites: "Usa solo las columnas del archivo. Si un valor falta, indícalo; no lo estimes.",
    resources: "Ejemplo de entrada: materiales/gemini_canvas/mesa_ayuda_2026.csv"
  }
];

// --- 4. Constructores de HTML ---

function escapeSkillHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSkillComparisonHtml(rows) {
  const e = escapeSkillHtml;
  const body = rows.map(r => `<tr><th scope="row">${e(r.tool)}</th><td>${e(r.what)}</td><td>${e(r.when)}</td><td>${e(r.reuse)}</td></tr>`).join("");
  return `<table class="skills-table"><thead><tr><th scope="col">Herramienta</th><th scope="col">Qué es</th><th scope="col">Cuándo usarla</th><th scope="col">Cómo se reutiliza</th></tr></thead><tbody>${body}</tbody></table>`;
}

function buildSkillResultHtml(result) {
  const e = escapeSkillHtml;
  const list = items => `<ul>${items.map(i => `<li>${e(i)}</li>`).join("")}</ul>`;
  if (result.state === "empty") {
    return `<p class="skill-status" data-state="empty" role="status">Completa el nombre, la descripción y la tarea para generar tu SKILL.md.</p>`;
  }
  if (result.state === "invalid") {
    return `<div class="skill-status" data-state="invalid" role="status"><strong>Corrige antes de usar la skill:</strong>${list(result.errors)}</div>`;
  }
  const warnings = result.warnings.length > 0 ? `<p>Sugerencias:</p>${list(result.warnings)}` : "";
  return `<div class="skill-status" data-state="valid" role="status"><strong>SKILL.md válido.</strong> Guárdalo como <code>SKILL.md</code> dentro de una carpeta con el mismo nombre de la skill.${warnings}</div>`;
}

function buildSkillExamplesHtml(examples) {
  const e = escapeSkillHtml;
  return examples.map(ex => `
    <details class="skill-example" data-skill="${e(ex.name)}">
      <summary>${e(ex.name)}</summary>
      <pre>${e(composeSkillMd(ex))}</pre>
    </details>`).join("");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SKILL_NAME_MAX,
    SKILL_DESCRIPTION_MAX,
    SKILL_RESERVED_WORDS,
    SKILL_BODY_SECTIONS,
    SKILL_COMPARISON,
    SKILL_SECURITY_CHECKLIST,
    SKILL_EXAMPLES,
    validateSkillName,
    validateSkillDescription,
    evaluateSkill,
    humanizeSkillName,
    composeSkillMd,
    parseSkillMd,
    escapeSkillHtml,
    buildSkillComparisonHtml,
    buildSkillResultHtml,
    buildSkillExamplesHtml
  };
}
