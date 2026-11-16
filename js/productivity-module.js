// Módulo de Productividad con IA: estaciones por día, kit de bolsillo CRTT+L,
// matriz «¿cuándo no usar IA?», lista V.E.R.A. y calculadora de tiempo ahorrado.
// Todas las funciones son puras y deterministas: no hay temporizadores ni datos inventados.

// --- 1. Método CRTT+L y protocolo V.E.R.A. ---

const CRTTL_PILLARS = [
  { key: "contexto", label: "Contexto", hint: "Situación, fuente y datos que la IA debe usar." },
  { key: "rol", label: "Rol", hint: "Perfil institucional o técnico que debe asumir." },
  { key: "tarea", label: "Tarea", hint: "Producto concreto y formato de salida." },
  { key: "tono", label: "Tono", hint: "Registro y audiencia en español de Colombia." },
  { key: "limites", label: "Límites", hint: "Prohibiciones y qué hacer ante datos faltantes." }
];

const VERA_CHECKLIST = [
  { key: "V", label: "Verificar fuentes", question: "¿Cada cifra, nombre o fecha aparece en el material de entrada?" },
  { key: "E", label: "Examinar estructura", question: "¿La respuesta respeta las columnas, secciones o formato pedidos?" },
  { key: "R", label: "Revisar calidad y límites", question: "¿No hay datos inventados ni datos personales expuestos?" },
  { key: "A", label: "Atribuir y decidir", question: "¿Una persona revisó, ajustó y asume la versión final?" }
];

const CRTTL_MIN_LENGTH = 8;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Evalúa un prompt por pilares. Estados: empty, invalid, valid.
function validateCrttlParts(parts) {
  const source = parts && typeof parts === "object" ? parts : {};
  const filled = CRTTL_PILLARS.filter(p => normalizeText(source[p.key]).length > 0);
  if (filled.length === 0) {
    return { state: "empty", score: 0, missing: CRTTL_PILLARS.map(p => p.key), weak: [] };
  }
  const missing = CRTTL_PILLARS.filter(p => normalizeText(source[p.key]).length === 0).map(p => p.key);
  const weak = CRTTL_PILLARS
    .filter(p => {
      const len = normalizeText(source[p.key]).length;
      return len > 0 && len < CRTTL_MIN_LENGTH;
    })
    .map(p => p.key);
  const score = Math.round(((CRTTL_PILLARS.length - missing.length - weak.length) / CRTTL_PILLARS.length) * 100);
  const state = missing.length === 0 && weak.length === 0 ? "valid" : "invalid";
  return { state, score, missing, weak };
}

// Compone el prompt en el orden canónico Contexto, Rol, Tarea, Tono y Límites.
function composeCrttlPrompt(parts) {
  const source = parts && typeof parts === "object" ? parts : {};
  return CRTTL_PILLARS
    .filter(p => normalizeText(source[p.key]).length > 0)
    .map(p => `${p.label}:\n${normalizeText(source[p.key])}`)
    .join("\n\n");
}

// Resume la revisión V.E.R.A. a partir de las casillas marcadas.
function evaluateVeraChecklist(checked) {
  const marks = checked && typeof checked === "object" ? checked : {};
  const done = VERA_CHECKLIST.filter(item => marks[item.key] === true).map(item => item.key);
  const pending = VERA_CHECKLIST.filter(item => marks[item.key] !== true).map(item => item.key);
  let state = "partial";
  if (done.length === 0) state = "empty";
  else if (pending.length === 0) state = "ready";
  return { state, done, pending };
}

// --- 2. Calculadora de tiempo ahorrado ---

const SAVINGS_LIMITS = { maxMinutes: 600, maxTimesPerWeek: 100, weeksPerMonth: 4 };

function parseNumberField(value) {
  if (value === null || value === undefined) return { empty: true, value: NaN };
  const raw = String(value).trim().replace(",", ".");
  if (raw === "") return { empty: true, value: NaN };
  return { empty: false, value: Number(raw) };
}

// Calcula el ahorro mensual de una tarea repetitiva.
// Entradas: minutos sin IA, minutos con IA (incluida la revisión humana) y veces por semana.
function computeTimeSavings(input) {
  const source = input && typeof input === "object" ? input : {};
  const before = parseNumberField(source.minutesBefore);
  const after = parseNumberField(source.minutesAfter);
  const times = parseNumberField(source.timesPerWeek);

  if (before.empty && after.empty && times.empty) {
    return { state: "empty", message: "Escribe los minutos de la tarea y cuántas veces la haces por semana." };
  }
  if (before.empty || after.empty || times.empty) {
    return { state: "invalid", message: "Completa los tres campos para calcular el ahorro." };
  }
  const values = [before.value, after.value, times.value];
  if (values.some(v => !Number.isFinite(v) || v < 0)) {
    return { state: "invalid", message: "Usa solo números mayores o iguales a cero." };
  }
  if (before.value > SAVINGS_LIMITS.maxMinutes || after.value > SAVINGS_LIMITS.maxMinutes) {
    return { state: "invalid", message: `Cada tarea admite como máximo ${SAVINGS_LIMITS.maxMinutes} minutos.` };
  }
  if (times.value > SAVINGS_LIMITS.maxTimesPerWeek || !Number.isInteger(times.value)) {
    return { state: "invalid", message: `Las veces por semana deben ser un número entero entre 0 y ${SAVINGS_LIMITS.maxTimesPerWeek}.` };
  }
  if (before.value === 0) {
    return { state: "invalid", message: "El tiempo sin IA debe ser mayor que cero." };
  }

  const minutesSavedPerTask = before.value - after.value;
  const monthlyMinutes = minutesSavedPerTask * times.value * SAVINGS_LIMITS.weeksPerMonth;
  const hoursPerMonth = Math.round((monthlyMinutes / 60) * 10) / 10;
  const percent = Math.round((minutesSavedPerTask / before.value) * 100);
  const verdict = minutesSavedPerTask > 0 ? "ahorro" : minutesSavedPerTask === 0 ? "neutro" : "perdida";
  return { state: "valid", minutesSavedPerTask, monthlyMinutes, hoursPerMonth, percent, verdict };
}

// --- 3. Estaciones de productividad por día ---

const PRODUCTIVITY_STATIONS = [
  {
    id: "prod-dia-1-correo-actas",
    day: "dia-1",
    title: "Correo y actas en minutos",
    goal: "Convertir notas desordenadas en un acta con compromisos y responder correos con un tono institucional.",
    material: "materiales/dia1_prompting/bandeja_correos_practica.md",
    promptParts: {
      contexto: "Te comparto las notas de la reunión del comité de coordinación (archivo caso_estudio_comite_desordenado.txt) y tres correos de la bandeja de práctica.",
      rol: "Actúa como secretario técnico de un centro de formación.",
      tarea: "Entrega: 1) acta con tabla de compromisos (tarea, responsable, fecha); 2) respuesta breve a cada correo en máximo 6 líneas.",
      tono: "Profesional, cordial y directo, en español de Colombia; trata de usted al destinatario.",
      limites: "No inventes fechas ni responsables: si faltan, escribe [Pendiente]. No incluyas datos personales que no estén en el texto."
    },
    gold: [
      "Cada compromiso tiene responsable y fecha, o la marca [Pendiente].",
      "Las respuestas de correo caben en una pantalla y cierran con una acción concreta.",
      "No aparecen nombres ni fechas que no estén en el material."
    ],
    antipattern: [
      "Resumen largo en prosa sin tabla de compromisos.",
      "Fechas «estimadas» por la IA que nadie acordó.",
      "Respuestas genéricas que no contestan la pregunta del correo."
    ],
    facilitatorTip: "Pida que cronometren la tarea sin IA y con IA; esos minutos alimentan la calculadora del Día 4.",
    deliverableId: "evidencia-dia-1"
  },
  {
    id: "prod-dia-2-presentacion-express",
    day: "dia-2",
    title: "De documento a presentación de 5 diapositivas",
    goal: "Transformar un documento extenso en un guion de 5 diapositivas con notas del orador.",
    material: "materiales/dia2_multimedia/guion_capsula_aprendizaje.md",
    promptParts: {
      contexto: "Te comparto el guion de la cápsula de aprendizaje; la audiencia son aprendices de primer trimestre y tengo 7 minutos para exponer.",
      rol: "Actúa como diseñador instruccional y asesor de presentaciones.",
      tarea: "Propón 5 diapositivas con título, máximo 3 viñetas cada una y notas del orador de 60 palabras. Sugiere una imagen por diapositiva.",
      tono: "Claro y motivador, sin tecnicismos innecesarios.",
      limites: "Usa solo ideas del documento. Ninguna viñeta supera 12 palabras. Marca con [Verificar] cualquier dato numérico."
    },
    gold: [
      "Exactamente 5 diapositivas con una idea principal cada una.",
      "Notas del orador que permiten exponer sin leer la diapositiva.",
      "Los datos numéricos están marcados para verificación."
    ],
    antipattern: [
      "Diapositivas con párrafos completos.",
      "Más de 5 diapositivas o ideas repetidas.",
      "Imágenes sugeridas sin relación con el contenido."
    ],
    facilitatorTip: "Haga que dos aprendices expongan la misma presentación: si las notas son buenas, ambos dirán lo mismo.",
    deliverableId: "evidencia-dia-2"
  },
  {
    id: "prod-dia-3-hojas-calculo",
    day: "dia-3",
    title: "Hojas de cálculo con IA",
    goal: "Pedir fórmulas, limpiar datos y resumir con tabla dinámica la mesa de ayuda de práctica.",
    material: "materiales/gemini_canvas/mesa_ayuda_2026.csv",
    promptParts: {
      contexto: "Tengo el archivo mesa_ayuda_2026.csv abierto en Excel o Google Sheets. Columnas: Seccion, Mes_o_Categoria, Abiertos_o_Casos, Resueltos, Tiempo_promedio_horas, Satisfaccion_1a5 y Detalle.",
      rol: "Actúa como analista de datos que enseña a personal administrativo.",
      tarea: "1) Dame la fórmula para calcular el porcentaje de casos resueltos de cada fila (Resueltos / Abiertos_o_Casos); 2) explica cómo crear una tabla dinámica por Seccion con el promedio de Satisfaccion_1a5; 3) sugiere un gráfico.",
      tono: "Paso a paso, con lenguaje sencillo y nombres de menú en español.",
      limites: "Indica la fórmula para Excel y para Google Sheets. No supongas columnas que no estén en el encabezado; si dudas, pregunta."
    },
    gold: [
      "Fórmula que funciona al pegarla, con rangos y nombres de columna reales.",
      "Pasos de la tabla dinámica en el orden de los menús.",
      "El aprendiz comprueba un conteo a mano contra el resultado."
    ],
    antipattern: [
      "Fórmulas con columnas inventadas que devuelven error.",
      "Copiar el resultado sin contrastarlo con un conteo manual.",
      "Subir el archivo con datos personales reales a un servicio no autorizado."
    ],
    facilitatorTip: "Exija que cada grupo encuentre al menos un error de la IA y explique cómo lo detectó.",
    deliverableId: "evidencia-dia-3"
  },
  {
    id: "prod-dia-4-sistema-personal",
    day: "dia-4",
    title: "Mi sistema personal de productividad",
    goal: "Construir una biblioteca personal de prompts y medir con la calculadora cuánto tiempo ahorra cada uno.",
    material: "materiales/dia4_agentes_integrador/biblioteca_personal_prompts.md",
    promptParts: {
      contexto: "Estas son las 5 tareas que más repito en mi trabajo, con los minutos que me toman cada semana.",
      rol: "Actúa como consultor de productividad para personal de formación.",
      tarea: "Para cada tarea, redacta un prompt reutilizable con el método CRTT+L y deja entre corchetes los datos que cambian cada vez.",
      tono: "Práctico y breve; una plantilla por tarea.",
      limites: "No propongas automatizar decisiones que afecten personas (calificaciones, sanciones, contratación). Señala dónde se necesita revisión humana."
    },
    gold: [
      "5 plantillas con campos variables entre corchetes.",
      "Cada plantilla tiene su ahorro calculado en horas por mes.",
      "Las tareas con impacto sobre personas quedan con revisión humana obligatoria."
    ],
    antipattern: [
      "Prompts de una sola línea imposibles de reutilizar.",
      "Ahorros declarados sin medir el tiempo real.",
      "Automatizar una decisión sensible sin supervisión."
    ],
    facilitatorTip: "Cierre con una ronda en la que cada aprendiz comparte su plantilla con mayor ahorro medido.",
    deliverableId: "evidencia-dia-4"
  }
];

function getStationByDay(day) {
  return PRODUCTIVITY_STATIONS.find(s => s.day === day) || null;
}

// --- 4. Kit de bolsillo y matriz de uso responsable ---

const POCKET_KIT = [
  ["correo", "Responder un correo difícil", "Recibí este correo: [pegar].", "Asistente administrativo", "Redacta una respuesta de máximo 8 líneas con una propuesta concreta.", "Cordial y firme", "No prometas fechas que no te indique."],
  ["correo", "Resumir un hilo largo", "Este es un hilo de correos: [pegar].", "Analista de comunicaciones", "Resume en 5 viñetas: acuerdos, pendientes y quién debe responder.", "Neutral y objetivo", "Cita solo lo escrito en el hilo."],
  ["reuniones", "Acta con compromisos", "Notas de la reunión: [pegar].", "Secretario técnico", "Tabla con tarea, responsable y fecha.", "Institucional y claro", "Usa [Pendiente] si falta un dato."],
  ["reuniones", "Agenda de reunión", "Objetivo de la reunión: [escribir]. Duración: [minutos].", "Coordinador académico", "Agenda con tiempos por punto y resultado esperado de cada uno.", "Directo y ordenado", "Que la suma de tiempos no supere la duración."],
  ["documentos", "Corregir redacción", "Texto: [pegar].", "Corrector de estilo", "Devuelve el texto corregido y una lista de cambios.", "Español de Colombia, natural", "No cambies datos, nombres ni cifras."],
  ["documentos", "Simplificar un texto técnico", "Documento: [pegar]. Lector: [perfil].", "Divulgador", "Explica el contenido en 150 palabras para ese lector.", "Sencillo", "No omitas restricciones ni plazos."],
  ["documentos", "Comparar dos versiones", "Versión A: [pegar]. Versión B: [pegar].", "Revisor documental", "Tabla con cambios, ubicación e impacto.", "Preciso y técnico", "No interpretes intenciones del autor."],
  ["datos", "Fórmula de hoja de cálculo", "Columnas: [listar]. Necesito: [objetivo].", "Analista de datos", "Fórmula para Excel y Google Sheets con explicación.", "Paso a paso", "No supongas columnas que no listé."],
  ["datos", "Interpretar una tabla", "Tabla: [pegar].", "Analista", "Tres hallazgos y una recomendación.", "Ejecutivo y concreto", "Cada hallazgo cita la fila o columna de origen."],
  ["planeacion", "Plan semanal", "Tareas de la semana: [listar con duración].", "Asistente de planeación", "Distribuye las tareas en 5 días con bloques de 90 minutos.", "Práctico", "Deja 20 % del tiempo libre para imprevistos."],
  ["planeacion", "Priorizar pendientes", "Pendientes: [listar con fecha límite].", "Coordinador", "Matriz urgente/importante y orden sugerido.", "Claro y práctico", "No descartes ninguna tarea sin decírmelo."],
  ["formacion", "Preguntas de repaso", "Tema y material: [pegar].", "Instructor", "8 preguntas de opción múltiple con respuesta y justificación.", "Didáctico", "Solo preguntas respondibles con el material."],
  ["formacion", "Rúbrica rápida", "Evidencia que voy a evaluar: [describir].", "Evaluador", "Rúbrica de 4 criterios y 3 niveles.", "Objetivo y verificable", "Criterios observables, sin juicios sobre la persona."],
  ["comunicacion", "Anuncio para el grupo", "Información: [pegar].", "Comunicador institucional", "Mensaje de 80 palabras con fecha, lugar y acción.", "Cercano y amable", "No agregues información que no di."],
  ["comunicacion", "Mensaje de seguimiento", "Situación: [describir]. Destinatario: [cargo].", "Asistente administrativo", "Mensaje breve que recuerde el compromiso y proponga fecha.", "Respetuoso y breve", "Sin tono de reclamo."]
].map(([category, title, contexto, rol, tarea, tono, limites], i) => ({
  id: `kit-${String(i + 1).padStart(2, "0")}`,
  category,
  title,
  parts: { contexto, rol, tarea, tono, limites }
}));

function filterPocketKit(category) {
  const key = normalizeText(category).toLowerCase();
  if (key === "" || key === "todas") return POCKET_KIT.slice();
  return POCKET_KIT.filter(item => item.category === key);
}

const NO_AI_MATRIX = [
  { situation: "Datos personales sensibles (salud, historia disciplinaria, documentos de identidad)", risk: "Exposición de información protegida por la Ley 1581 de 2012.", alternative: "Anonimiza o trabaja solo con herramientas aprobadas por la entidad." },
  { situation: "Decisiones con efecto sobre personas (calificar, sancionar, contratar)", risk: "Sesgos y falta de responsable de la decisión.", alternative: "Usa la IA para preparar insumos; la decisión la toma y firma una persona." },
  { situation: "Documentos con valor legal o contractual", risk: "Cláusulas o normas citadas que no existen.", alternative: "Revisión jurídica y contraste con la norma oficial vigente." },
  { situation: "Cifras oficiales o informes para entes de control", risk: "Números inventados o desactualizados.", alternative: "Toma las cifras del sistema de información oficial y cítalo." },
  { situation: "Contraseñas, claves de API o información interna clasificada", risk: "Filtración de credenciales o secretos.", alternative: "Nunca pegues secretos en un chat; usa los canales seguros de la entidad." }
];

// --- 4b. IA integrada en las suites ofimáticas ---
// Las funciones disponibles dependen de la licencia de la entidad; solo se describen usos generales.

const OFFICE_AI_TASKS = [
  {
    task: "Correo",
    workspace: "Gemini en Gmail: resumir hilos y redactar respuestas desde el panel lateral.",
    microsoft: "Copilot en Outlook: resumir conversaciones y crear borradores.",
    prompt: { contexto: "Este hilo trata sobre la reserva del auditorio.", rol: "Asistente administrativo.", tarea: "Resume acuerdos y redacta una respuesta de 5 líneas.", tono: "Cordial e institucional.", limites: "No confirmes fechas que no estén en el hilo." }
  },
  {
    task: "Documentos",
    workspace: "Gemini en Docs: redactar, reescribir y resumir documentos.",
    microsoft: "Copilot en Word: redactar a partir de otros archivos y resumir.",
    prompt: { contexto: "Este documento es el reglamento del aprendiz.", rol: "Divulgador institucional.", tarea: "Resume en 10 viñetas los deberes del aprendiz.", tono: "Claro y respetuoso.", limites: "Cita el artículo de cada viñeta; no agregues normas." }
  },
  {
    task: "Hojas de cálculo",
    workspace: "Gemini en Sheets: crear tablas, fórmulas y resúmenes de datos.",
    microsoft: "Copilot en Excel: sugerir fórmulas, gráficos y análisis.",
    prompt: { contexto: "La hoja tiene las columnas Seccion, Abiertos_o_Casos y Resueltos.", rol: "Analista de datos.", tarea: "Agrega una columna con el porcentaje de casos resueltos.", tono: "Paso a paso.", limites: "No modifiques las columnas originales." }
  },
  {
    task: "Presentaciones",
    workspace: "Gemini en Slides: generar imágenes y redactar diapositivas.",
    microsoft: "Copilot en PowerPoint: crear una presentación a partir de un documento.",
    prompt: { contexto: "Tengo el informe trimestral del área en un documento.", rol: "Asesor de presentaciones.", tarea: "Crea 5 diapositivas con notas del orador.", tono: "Ejecutivo.", limites: "Máximo 3 viñetas por diapositiva; usa solo datos del informe." }
  },
  {
    task: "Reuniones",
    workspace: "Gemini en Meet: tomar notas y resumir la reunión (según licencia).",
    microsoft: "Copilot en Teams: resumir reuniones y listar tareas.",
    prompt: { contexto: "Esta es la transcripción del comité de hoy.", rol: "Secretario técnico.", tarea: "Lista compromisos con responsable y fecha.", tono: "Institucional.", limites: "Marca [Pendiente] lo que no tenga fecha; no atribuyas frases a nadie." }
  }
];

function buildOfficeAiTableHtml(rows) {
  const e = escapeProdHtml;
  const body = rows.map(r => `<tr><th scope="row">${e(r.task)}</th><td>${e(r.workspace)}</td><td>${e(r.microsoft)}</td><td><pre class="prod-prompt">${e(composeCrttlPrompt(r.prompt))}</pre></td></tr>`).join("");
  return `<table class="prod-no-ai-table"><thead><tr><th scope="col">Tarea</th><th scope="col">Google Workspace</th><th scope="col">Microsoft 365</th><th scope="col">Prompt CRTT+L de ejemplo</th></tr></thead><tbody>${body}</tbody></table>`;
}

// --- 5. Constructores de HTML (escapado incluido) ---

function escapeProdHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildStationHtml(station) {
  const e = escapeProdHtml;
  const list = items => items.map(i => `<li>${e(i)}</li>`).join("");
  const prompt = composeCrttlPrompt(station.promptParts);
  const promptId = `prompt-${station.id}`;
  return `
    <article class="prod-station tool-container" id="${e(station.id)}" data-day="${e(station.day)}">
      <h3>⚡ Estación de productividad: ${e(station.title)}</h3>
      <p><strong>Objetivo:</strong> ${e(station.goal)}</p>
      <p><strong>Material:</strong> <a class="material-link" href="${e(station.material)}" download>${e(station.material)}</a></p>
      <div class="prompt-box">
        <div class="prompt-header">
          <span>PROMPT CRTT+L LISTO PARA COPIAR</span>
          <button type="button" class="copy-btn" data-copy-target="${e(promptId)}">Copiar prompt CRTT+L</button>
        </div>
        <div class="prompt-content prod-prompt" id="${e(promptId)}">${e(prompt)}</div>
      </div>
      <div class="comparison-grid">
        <div class="comparison-col col-good"><div class="col-title">✓ Estándar de Oro</div><ul>${list(station.gold)}</ul></div>
        <div class="comparison-col col-bad"><div class="col-title">✗ Antipatrón</div><ul>${list(station.antipattern)}</ul></div>
      </div>
      <div class="instructor-guide-card">
        <span class="card-badge">Notas para el Facilitador</span>
        <p>${e(station.facilitatorTip)}</p>
      </div>
    </article>`;
}

function buildSavingsResultHtml(result) {
  const e = escapeProdHtml;
  if (result.state !== "valid") {
    return `<p class="prod-savings-msg" data-state="${e(result.state)}" role="status">${e(result.message)}</p>`;
  }
  const fmt = n => n.toLocaleString("es-CO");
  let note = "La IA no reduce el tiempo de esta tarea: conserva tu método actual.";
  if (result.verdict === "ahorro") note = `Ahorras ${fmt(result.minutesSavedPerTask)} min por tarea (${result.percent} %).`;
  if (result.verdict === "perdida") note = "Con IA tardas más: revisa el prompt o descarta la herramienta para esta tarea.";
  return `
    <div class="prod-savings-result" data-state="valid" data-verdict="${e(result.verdict)}" role="status">
      <strong>${fmt(result.hoursPerMonth)} horas al mes</strong>
      <span>${e(note)}</span>
    </div>`;
}

function buildPocketKitHtml(items) {
  const e = escapeProdHtml;
  if (items.length === 0) return `<p role="status">No hay plantillas en esta categoría.</p>`;
  return items.map(item => `
    <details class="prod-kit-item" data-category="${e(item.category)}">
      <summary>${e(item.title)}</summary>
      <pre>${e(composeCrttlPrompt(item.parts))}</pre>
    </details>`).join("");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CRTTL_PILLARS,
    VERA_CHECKLIST,
    SAVINGS_LIMITS,
    PRODUCTIVITY_STATIONS,
    POCKET_KIT,
    NO_AI_MATRIX,
    OFFICE_AI_TASKS,
    buildOfficeAiTableHtml,
    validateCrttlParts,
    composeCrttlPrompt,
    evaluateVeraChecklist,
    computeTimeSavings,
    getStationByDay,
    filterPocketKit,
    escapeProdHtml,
    buildStationHtml,
    buildSavingsResultHtml,
    buildPocketKitHtml
  };
}
