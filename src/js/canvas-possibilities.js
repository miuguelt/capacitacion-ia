// Simulador de Gemini Canvas Lab: los 10 modos con prompts autosuficientes.
// Cada modo lleva sus datos dentro del prompt (fórmula R-C-I-R-F), la lista de criterios que el aprendiz
// comprueba en su propio Canvas y la especificación de la imagen de referencia. Las cifras se calculan
// con las funciones de este archivo para que prompt, imagen, vista interactiva y lista de chequeo coincidan.

let canvasKit = globalThis;
if (typeof module !== "undefined" && module.exports) {
  canvasKit = require("./canvas-exercises.js");
}

// --- Cálculos y formato (es-CO) ---
function canvasRound(value, decimals) {
  const factor = 10 ** decimals;
  return Math.sign(value) * Math.round((Math.abs(value) + Number.EPSILON) * factor) / factor;
}

function canvasFormatNumber(value, decimals) {
  const [int, dec] = Math.abs(canvasRound(value, decimals)).toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (value < 0 ? "-" : "") + grouped + (dec ? `,${dec}` : "");
}

function canvasFormatCop(value) {
  return `COP ${canvasFormatNumber(value, 0)}`;
}

function canvasSum(values) {
  return values.reduce((total, v) => total + v, 0);
}

function canvasAverage(values) {
  if (!values.length) throw new Error("No se puede promediar una lista vacía");
  return canvasSum(values) / values.length;
}

// Promedio ponderado con pesos en porcentaje; conserva la escala de las notas.
function canvasWeightedScore(scores, weights) {
  if (scores.length !== weights.length) throw new Error("Notas y pesos deben tener la misma cantidad");
  if (canvasSum(weights) !== 100) throw new Error("Los pesos deben sumar 100");
  return canvasSum(scores.map((s, i) => s * weights[i])) / 100;
}

function canvasMatrixStatus(score) {
  if (score >= 85) return "Recomendado";
  if (score >= 70) return "Admisible con observaciones";
  return "No cumple";
}

function canvasHexToRgb(hex) {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`HEX inválido: ${hex}`);
  const clean = match[1].length === 3 ? match[1].split("").map(c => c + c).join("") : match[1];
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function canvasContrastRatio(foreground, background) {
  const luminance = hex => {
    const [r, g, b] = canvasHexToRgb(hex).map(v => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [a, b] = [luminance(foreground), luminance(background)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function canvasWcagLevel(ratio) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA texto grande";
  return "No cumple";
}

const CANVAS_RISK_SCALE = { Bajo: 1, Baja: 1, Medio: 2, Media: 2, Alto: 3, Alta: 3 };

function canvasRiskLevel(impact, probability) {
  const i = CANVAS_RISK_SCALE[impact];
  const p = CANVAS_RISK_SCALE[probability];
  if (!i || !p) throw new Error(`Riesgo con nivel desconocido: ${impact} / ${probability}`);
  const score = i * p;
  if (score >= 6) return { score, color: "ROJO" };
  if (score >= 3) return { score, color: "ÁMBAR" };
  return { score, color: "VERDE" };
}

// Regla de decisión del dictamen: un solo riesgo ROJO retiene el pago final.
function canvasReportDecision(findings) {
  const decision = findings.some(f => f.risk.color === "ROJO")
    ? "El pago final del 20 % queda retenido hasta que se subsane el riesgo ROJO."
    : "Se aprueba el pago final con observaciones.";
  return `${decision} Plazo de subsanación: 10 días hábiles desde la notificación.`;
}

function canvasLearnerStatus(attendance, evidence) {
  if (attendance < 70 || evidence < 70) return "Requiere apoyo";
  if (attendance >= 85 && evidence >= 85) return "Al día";
  return "En progreso";
}

function canvasClassifyDeliveries(deliveries) {
  const summary = { al_dia: [], en_progreso: [], apoyo: [] };
  const seen = new Set();
  for (const d of deliveries) {
    if (seen.has(d.documento)) continue;
    seen.add(d.documento);
    if (d.puntaje >= 70) summary.al_dia.push(d.nombre);
    else if (d.puntaje >= 50) summary.en_progreso.push(d.nombre);
    else summary.apoyo.push(d.nombre);
  }
  return summary;
}

// Resultado que debe dar la consulta SQL del modo 9 con los datos de muestra.
function canvasSqlRanking(learners, grades, attendance) {
  const rows = learners.map(a => {
    const records = attendance.filter(r => r.aprendiz_id === a.id);
    const attended = records.filter(r => r.asistio).length;
    return {
      ficha_id: a.ficha_id,
      nombre: a.nombre,
      promedio: canvasRound(canvasAverage(grades.filter(g => g.aprendiz_id === a.id).map(g => g.calificacion)), 1),
      pct_asistencia: records.length ? canvasRound((attended / records.length) * 100, 1) : null
    };
  });
  rows.sort((x, y) => x.ficha_id - y.ficha_id || y.promedio - x.promedio);
  const positions = {};
  return rows.map(r => {
    positions[r.ficha_id] = (positions[r.ficha_id] || 0) + 1;
    return { ficha_id: r.ficha_id, puesto: positions[r.ficha_id], nombre: r.nombre, promedio: r.promedio, pct_asistencia: r.pct_asistencia };
  });
}

function canvasRubricLevel(grade) {
  if (grade >= 4.5) return "Excelente";
  if (grade >= 3.8) return "Bueno";
  if (grade >= 3.0) return "En desarrollo";
  return "Requiere refuerzo";
}

function canvasMermaidFlow(flow) {
  const shapes = { terminal: l => `(["${l}"])`, decision: l => `{"${l}"}` };
  const lanes = flow.lanes.map(lane =>
    [`  subgraph ${lane.id}["${lane.name}"]`, ...lane.nodes.map(n => `    ${n.id}${(shapes[n.shape] || (l => `["${l}"]`))(n.label)}`), "  end"].join("\n"));
  const edges = flow.edges.map(([from, to, label]) => (label ? `  ${from} -- ${label} --> ${to}` : `  ${from} --> ${to}`));
  return ["flowchart TD", ...lanes, ...edges].join("\n");
}

function canvasPythonRepr(summary) {
  return `{${Object.entries(summary).map(([k, v]) => `'${k}': [${v.map(n => `'${n}'`).join(", ")}]`).join(", ")}}`;
}

// --- HTML de apoyo para la interfaz ---
function buildCanvasChecklistHtml(expected) {
  if (!expected.length) return "";
  const e = canvasKit.escapeCanvasHtml;
  const items = expected.map((item, i) => `
        <li><label><input type="checkbox" class="canvas-exercise-check" data-check-index="${i}">
          <span><strong>${e(item.criterion)}</strong><small class="sim-check-how">Cómo comprobarlo: ${e(item.how)}</small></span></label></li>`).join("");
  return `
    <section class="canvas-exercise-checklist sim-checklist" aria-label="Verificación del resultado">
      <div class="canvas-exercise-block-head">
        <h5>✅ Verifica el resultado de tu Canvas</h5>
        <span class="canvas-exercise-progress" data-exercise-progress aria-live="polite">0/${expected.length}</span>
      </div>
      <p class="canvas-exercise-hint">Copia el prompt, pégalo en Gemini con Canvas activo y marca cada criterio solo cuando lo compruebes en tu propio resultado. El diseño puede variar; las cifras no.</p>
      <div class="canvas-exercise-bar" aria-hidden="true"><span data-exercise-bar></span></div>
      <ul>${items}
      </ul>
      <button type="button" class="canvas-exercise-reset" data-exercise-reset>↺ Reiniciar verificación</button>
    </section>`;
}

function buildCanvasFollowUpsHtml(followUps) {
  if (!followUps || !followUps.length) return "";
  const e = canvasKit.escapeCanvasHtml;
  return followUps.map((f, i) => `
    <div class="chat-bubble user-bubble sim-followup">
      <div class="bubble-tag">${e(f.label)}</div>
      <p class="bubble-text" id="sim-followup-${i}">${e(f.text)}</p>
      <div class="bubble-actions">
        <button type="button" class="copy-btn" data-copy-target="sim-followup-${i}" data-followup-copy="${i}">📋 Copiar este paso</button>
      </div>
    </div>`).join("");
}

const canvasTable = (headers, rows, attrs = "") => `
        <table class="schedule-table"${attrs}>
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>`;

const canvasStatusBadge = text => {
  const tone = { "Recomendado": "success", "Al día": "success", "VERDE": "success", "AAA": "success", "AA": "success", "ROJO": "danger", "No cumple": "danger", "Requiere apoyo": "danger" };
  return `<span class="badge badge-${tone[text] || "warning"}">${text}</span>`;
};

const canvasInsight = (title, text) => `
      <div class="insight-card">
        <h5>${title}</h5>
        <p>${text}</p>
      </div>`;

const CANVAS_IMAGE_CAPTION = "Reconstrucción del resultado esperado, dibujada con los datos del prompt. Tu Canvas puede variar en diseño, no en cifras ni en contenido.";

// =====================================================================
// 1. Redacción y documentos: términos de referencia
// =====================================================================
const TDR = {
  quantity: 20,
  unitPrice: 9800000,
  components: [
    ["Procesador", "14 núcleos y 20 hilos; frecuencia base de 2,5 GHz o superior", "Equivalente o superior, de cualquier fabricante"],
    ["Memoria RAM", "32 GB DDR5 a 5600 MHz en doble canal", "Ampliable a 64 GB"],
    ["GPU dedicada", "12 GB de VRAM GDDR6, compatible con PyTorch y TensorFlow", "Equivalente o superior"],
    ["Almacenamiento", "SSD NVMe PCIe 4.0 de 1 TB; lectura de 5.000 MB/s o más", "Una ranura M.2 adicional libre"],
    ["Pantalla", "27 pulgadas, 2560 × 1440, panel IPS", "Hasta 32 pulgadas"]
  ],
  schedule: [
    ["Semanas 1 y 2", "Entrega de los equipos en el ambiente 305"],
    ["Semana 3", "Instalación y configuración"],
    ["Semana 4", "Pruebas de rendimiento y recibo a satisfacción"]
  ]
};
const TDR_TOTAL = canvasFormatCop(TDR.quantity * TDR.unitPrice);
const TDR_UNIT = canvasFormatCop(TDR.unitPrice);
const TDR_VARIANTS = [
  `Compra de 20 estaciones de trabajo para el Laboratorio de IA y Multimedia por ${TDR_TOTAL}.`,
  `Compra de 20 estaciones de trabajo para el Laboratorio de IA y Multimedia (ambiente 305), con un presupuesto de ${TDR_TOTAL} y garantía en sitio de 36 meses.`,
  `El centro de formación requiere 20 estaciones de trabajo para el Laboratorio de Inteligencia Artificial y Multimedia, donde 40 aprendices por jornada entrenan modelos pequeños, practican visión artificial y editan video. El presupuesto de referencia es de ${TDR_TOTAL}, y la entrega, la instalación y las pruebas se completan en 4 semanas.`,
  `El centro de formación requiere 20 estaciones de trabajo para el Laboratorio de Inteligencia Artificial y Multimedia, donde 40 aprendices por jornada entrenan modelos pequeños, practican visión artificial y editan video. Los equipos actuales no tienen GPU dedicada. El presupuesto de referencia es de ${TDR_TOTAL} y el proveedor debe garantizar 36 meses de atención en sitio, con respuesta a fallas críticas en máximo 24 horas hábiles.`,
  `El centro de formación requiere 20 estaciones de trabajo para el Laboratorio de Inteligencia Artificial y Multimedia (ambiente 305), donde 40 aprendices por jornada entrenan modelos pequeños, practican visión artificial y editan video. Cada estación debe tener GPU dedicada de 12 GB, 32 GB de RAM y SSD de 1 TB. El presupuesto de referencia es de ${TDR_TOTAL} (20 × ${TDR_UNIT}); la entrega, la instalación y las pruebas se completan en 4 semanas, y la garantía cubre 36 meses en sitio con respuesta a fallas críticas en máximo 24 horas hábiles.`
];

const DOC_EDITORIAL = {
  name: "1. Redacción & Documentos",
  docIcon: "📄",
  docTitle: "Terminos_Referencia_Laboratorio_IA.docx",
  image: "assets/images/canvas/canvas_documento.jpg",
  promptParts: {
    role: "profesional de infraestructura tecnológica que redacta términos de referencia para compras públicas",
    context: "El centro de formación publicará una invitación abierta para comprar estaciones de trabajo. El comité de compras necesita un documento técnico que cualquier proveedor pueda cumplir sin favorecer una marca.",
    data: `Necesidad: Laboratorio de Inteligencia Artificial y Multimedia (ambiente 305). Lo usan 40 aprendices por jornada para entrenar modelos pequeños, practicar visión artificial y editar video. Los equipos actuales no tienen GPU dedicada.
Cantidad: 20 estaciones de trabajo.
Valor unitario de referencia (estudio de mercado, IVA incluido): ${TDR_UNIT}.

Requisitos mínimos (componente | requisito mínimo | tolerancia aceptada):
${TDR.components.map(c => c.join(" | ")).join("\n")}

Cronograma (plazo | actividad):
${TDR.schedule.map(s => s.join(" | ")).join("\n")}

Garantía mínima: 36 meses en sitio, con atención de fallas críticas en máximo 24 horas hábiles.`,
    instruction: "En Canvas, redacta los términos de referencia con estas cuatro secciones numeradas:",
    task: [
      "Resumen ejecutivo y justificación de la necesidad formativa, en máximo 120 palabras.",
      "Especificaciones técnicas mínimas: una tabla con las columnas Componente, Requisito mínimo y Tolerancia aceptada, con las 5 filas de los datos.",
      "Presupuesto y cronograma: calcula el presupuesto total (cantidad × valor unitario) y presenta el cronograma en una tabla de 3 filas.",
      "Criterios de aceptación y garantía: una lista de verificación que el comité pueda marcar al recibir los equipos."
    ],
    constraints: [
      "Copia los requisitos y valores tal como aparecen en los datos; no agregues componentes ni cambies cifras.",
      "No menciones marcas ni modelos comerciales.",
      "Escribe los valores en pesos colombianos con punto de miles, por ejemplo COP 1.000.000."
    ],
    format: "Documento formal en español de Colombia, con títulos numerados del 1 al 4 y dos tablas."
  },
  expected: [
    { criterion: "El documento tiene exactamente 4 secciones numeradas: resumen ejecutivo, especificaciones técnicas, presupuesto y cronograma, y aceptación y garantía.", how: "Revisa los títulos del Canvas de arriba abajo." },
    { criterion: "La tabla de especificaciones tiene 5 filas (Procesador, Memoria RAM, GPU dedicada, Almacenamiento y Pantalla) con los mismos valores de los datos.", how: "Compara fila por fila con el bloque de datos del prompt." },
    { criterion: `El presupuesto total es ${TDR_TOTAL} (20 × ${TDR_UNIT}).`, how: "Busca «196.000.000» con Ctrl+F en el Canvas." },
    { criterion: "El cronograma tiene 3 filas: semanas 1 y 2, semana 3 y semana 4.", how: "Cuenta las filas de la segunda tabla." },
    { criterion: "La garantía dice 36 meses en sitio y atención de fallas críticas en máximo 24 horas hábiles.", how: "Lee la sección 4." },
    { criterion: "No aparece ninguna marca ni modelo comercial de procesadores, tarjetas gráficas o pantallas.", how: "Busca nombres de fabricantes con Ctrl+F; no debe haber resultados." },
    { criterion: "El resumen ejecutivo tiene 120 palabras o menos.", how: "Si se pasa, selecciónalo y usa «Ajustar longitud» → «Más corto»." }
  ],
  lengthVariants: TDR_VARIANTS,
  aiResponse: "Abrí un Canvas con los términos de referencia: cuatro secciones numeradas, la tabla de especificaciones con las 5 filas de los datos, el presupuesto calculado y el cronograma. Puedes ajustar la longitud o exportarlo a Google Docs.",
  quickActions: [
    { id: "act-doc-length", label: "📏 Ajustar longitud", action: "toggle-doc-length" },
    { id: "act-doc-export", label: "📄 Exportar a Google Docs", class: "btn-docs", toast: "📄 En Gemini, este botón crea una copia del documento en tu Google Drive." }
  ],
  interactiveHtml: `
      <div class="canvas-rendered-doc">
        <div style="border-bottom: 2px solid var(--color-primary); padding-bottom: 0.5rem; margin-bottom: 1rem;">
          <h3 style="color:var(--color-primary); margin:0;">TÉRMINOS DE REFERENCIA: ESTACIONES DE TRABAJO PARA EL LABORATORIO DE IA Y MULTIMEDIA</h3>
          <small style="color:var(--text-muted);">Ambiente 305 · 20 estaciones · Presupuesto de referencia ${TDR_TOTAL}</small>
        </div>
        <div id="doc-executive-summary" style="background:var(--color-primary-subtle); border-left:3px solid var(--color-primary); padding:0.85rem; border-radius:4px; margin-bottom:1rem;">
          <strong>1. Resumen ejecutivo</strong>
          <p style="margin:0.3rem 0 0 0; font-size:0.88rem;">${TDR_VARIANTS[2]}</p>
        </div>
        <h4 style="margin:0.75rem 0 0.4rem 0;">2. Especificaciones técnicas mínimas</h4>
        ${canvasTable(["Componente", "Requisito mínimo", "Tolerancia aceptada"], TDR.components.map(([c, r, t]) => [`<strong>${c}</strong>`, r, t]), ' style="font-size:0.82rem; margin-bottom:1rem;"')}
        <h4 style="margin:0.75rem 0 0.4rem 0;">3. Presupuesto y cronograma</h4>
        <p style="font-size:0.85rem; margin:0 0 0.5rem 0;"><strong>Presupuesto total:</strong> 20 × ${TDR_UNIT} = <strong>${TDR_TOTAL}</strong></p>
        ${canvasTable(["Plazo", "Actividad"], TDR.schedule, ' style="font-size:0.82rem; margin-bottom:1rem;"')}
        <h4 style="margin:0.75rem 0 0.4rem 0;">4. Criterios de aceptación y garantía</h4>
        <ul style="font-size:0.85rem; margin:0;">
          <li>☐ Las 20 estaciones cumplen cada requisito mínimo de la tabla.</li>
          <li>☐ Las pruebas de rendimiento de la semana 4 quedan registradas en el acta de recibo.</li>
          <li>☐ Garantía de 36 meses en sitio, con atención de fallas críticas en máximo 24 horas hábiles.</li>
        </ul>
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "TÉRMINOS DE REFERENCIA · LABORATORIO DE IA Y MULTIMEDIA" },
      { type: "callout", title: "1. Resumen ejecutivo", text: TDR_VARIANTS[2] },
      { type: "subheading", text: "2. Especificaciones técnicas mínimas" },
      { type: "table", headers: ["Componente", "Requisito mínimo", "Tolerancia aceptada"], rows: TDR.components },
      { type: "subheading", text: `3. Presupuesto: 20 × ${TDR_UNIT} = ${TDR_TOTAL}` },
      { type: "table", headers: ["Plazo", "Actividad"], rows: TDR.schedule },
      { type: "subheading", text: "4. Criterios de aceptación y garantía" },
      { type: "bullets", items: ["☐ Cada estación cumple los requisitos mínimos de la tabla.", "☐ Garantía de 36 meses en sitio; fallas críticas atendidas en máximo 24 horas hábiles."] }
    ]
  },
  insightsHtml: canvasInsight("🎯 Por qué este prompt funciona", "Los requisitos, la cantidad y el valor unitario van dentro del prompt. Gemini no tiene que inventar cifras, y tú puedes comparar cada fila del Canvas con los datos.") +
    canvasInsight("🚫 La restricción que evita sesgos", "Prohibir marcas obliga a describir capacidades medibles. Así el documento sirve para una invitación abierta y no favorece a un fabricante."),
  variationTip: "Selecciona la sección 4 en el Canvas y escribe: «Convierte la garantía en un acuerdo de nivel de servicio con tiempos de respuesta por severidad»."
};

// =====================================================================
// 2. Código y web en vivo: tablero de seguimiento
// =====================================================================
const LEARNERS = [
  ["Ana María García", 95, 100],
  ["Carlos Andrés Pérez", 88, 90],
  ["Julián David Torres", 70, 65],
  ["Laura Sofía Mendoza", 92, 80],
  ["Diego Alejandro Ruiz", 64, 72],
  ["Valentina Ríos Cárdenas", 86, 95]
].map(([nombre, asistencia, evidencias]) => ({ nombre, asistencia, evidencias, estado: canvasLearnerStatus(asistencia, evidencias) }));
const LEARNERS_ATT = `${canvasFormatNumber(canvasAverage(LEARNERS.map(l => l.asistencia)), 1)} %`;
const LEARNERS_EVI = `${canvasFormatNumber(canvasAverage(LEARNERS.map(l => l.evidencias)), 1)} %`;
const learnersBy = estado => LEARNERS.filter(l => l.estado === estado);
const LEARNERS_SUPPORT = learnersBy("Requiere apoyo").map(l => l.nombre).join(" y ");
const LEARNERS_COUNTS = `${learnersBy("Al día").length} Al día, ${learnersBy("En progreso").length} En progreso y ${learnersBy("Requiere apoyo").length} Requiere apoyo`;

const CODE_PROTOTYPING = {
  name: "2. Código & Web en Vivo",
  docIcon: "💻",
  docTitle: "Tablero_Seguimiento_Ficha_2871.html",
  image: "assets/images/canvas/canvas_codigo.jpg",
  promptParts: {
    role: "desarrollador frontend que construye prototipos accesibles para equipos docentes",
    context: "La coordinación quiere probar un tablero sencillo antes de pedir un desarrollo formal. Lo usarán instructores sin conocimientos técnicos.",
    data: `Ficha 2871 · Seguimiento semanal (porcentajes de 0 a 100)
Aprendiz | Asistencia | Evidencias entregadas
${LEARNERS.map(l => `${l.nombre} | ${l.asistencia} | ${l.evidencias}`).join("\n")}

Regla de estado:
- Requiere apoyo: asistencia o evidencias por debajo de 70.
- Al día: asistencia y evidencias de 85 o más.
- En progreso: cualquier otro caso.`,
    instruction: "En Canvas, crea una sola página HTML, con CSS y JavaScript, que incluya:",
    task: [
      "Dos tarjetas KPI calculadas con JavaScript a partir de los datos: asistencia promedio y evidencias promedio, con un decimal.",
      "Una tabla con los 6 aprendices y una columna Estado calculada con la regla de los datos.",
      "Un buscador por nombre que no distinga mayúsculas y un filtro por estado que funcionen al mismo tiempo.",
      "Una gráfica de barras en SVG con las evidencias de cada aprendiz."
    ],
    constraints: [
      "No uses librerías externas, CDN ni npm: todo debe funcionar en la vista previa de Canvas.",
      "Guarda los datos en un arreglo de JavaScript; no escribas los resultados a mano.",
      "Usa el color #2D5A4C para los elementos principales y conserva un contraste AA."
    ],
    format: "Un único archivo HTML con comentarios breves en español."
  },
  expected: [
    { criterion: `La tarjeta de asistencia muestra ${LEARNERS_ATT} y la de evidencias ${LEARNERS_EVI} (también vale con punto decimal).`, how: "Abre la vista previa del Canvas." },
    { criterion: `La tabla tiene 6 filas y la columna Estado suma ${LEARNERS_COUNTS}.`, how: "Cuenta los estados en la vista previa." },
    { criterion: `Al filtrar «Requiere apoyo» quedan 2 filas: ${LEARNERS_SUPPORT}.`, how: "Usa el filtro por estado." },
    { criterion: "Al escribir «ana» en el buscador queda 1 fila (Ana María García); al borrar el texto vuelven las 6.", how: "Escribe en el buscador de la vista previa." },
    { criterion: "La gráfica tiene 6 barras; la más alta es Ana María García (100) y la más baja Julián David Torres (65).", how: "Observa la gráfica en la vista previa." },
    { criterion: "El código no contiene etiquetas script con src, sentencias import ni enlaces a CDN.", how: "Pasa a la vista de código y busca «src=» e «import»." }
  ],
  aiResponse: "Creé la página en un Canvas de código. Los promedios, los estados y la gráfica se calculan con JavaScript a partir del arreglo de datos. Usa «Vista previa» para probar el buscador y el filtro.",
  quickActions: [
    { id: "act-code-preview", label: "▶ Vista previa", toast: "▶ En Gemini, «Vista previa» ejecuta la página dentro del Canvas. Aquí puedes probarla en «Resultado interactivo»." },
    { id: "act-code-rules", label: "🧮 Regla de estado", modal: { title: "Regla de estado aplicada a los 6 aprendices", badge: "Datos", content: LEARNERS.map(l => `${l.nombre.padEnd(25)} asistencia ${l.asistencia} · evidencias ${l.evidencias} → ${l.estado}`).join("\n") } }
  ],
  interactiveHtml: `
      <div class="interactive-code-demo" style="font-family:var(--font-sans);">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap; border-bottom:1px solid var(--border-light); padding-bottom:0.5rem; margin-bottom:0.75rem;">
          <h4 style="margin:0; color:var(--color-primary);">📊 Seguimiento de aprendizaje · Ficha 2871</h4>
          <span class="badge badge-success">Vista previa</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:0.75rem; margin-bottom:1rem;">
          <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:6px; border-left:3px solid var(--color-primary);">
            <small style="color:var(--text-muted); display:block;">Asistencia promedio</small>
            <strong style="font-size:1.3rem; color:var(--color-primary);">${LEARNERS_ATT}</strong>
          </div>
          <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:6px; border-left:3px solid var(--color-primary);">
            <small style="color:var(--text-muted); display:block;">Evidencias promedio</small>
            <strong style="font-size:1.3rem; color:var(--color-primary);">${LEARNERS_EVI}</strong>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.5rem; margin-bottom:0.75rem;">
          <label style="font-size:0.8rem;">Buscar por nombre
            <input type="text" id="demo-filter-input" placeholder="Escribe un nombre" oninput="filterDemoTable()"
                   style="width:100%; padding:0.45rem 0.65rem; font-size:0.85rem; border:1px solid var(--border-light); border-radius:4px; background:var(--bg-app); color:var(--text-main);">
          </label>
          <label style="font-size:0.8rem;">Filtrar por estado
            <select id="demo-filter-estado" onchange="filterDemoTable()"
                    style="width:100%; padding:0.45rem 0.65rem; font-size:0.85rem; border:1px solid var(--border-light); border-radius:4px; background:var(--bg-app); color:var(--text-main);">
              <option value="">Todos</option><option>Al día</option><option>En progreso</option><option>Requiere apoyo</option>
            </select>
          </label>
        </div>
        <p style="font-size:0.8rem; margin:0 0 0.4rem 0;" aria-live="polite">Filas visibles: <strong id="demo-visible-count">${LEARNERS.length}</strong></p>
        <table class="schedule-table" id="demo-learners-table" style="font-size:0.8rem;">
          <thead><tr><th>Aprendiz</th><th>Asistencia</th><th>Evidencias</th><th>Estado</th></tr></thead>
          <tbody>${LEARNERS.map(l => `<tr data-estado="${l.estado}"><td><strong>${l.nombre}</strong></td><td>${l.asistencia} %</td><td>${l.evidencias} %</td><td>${canvasStatusBadge(l.estado)}</td></tr>`).join("")}</tbody>
        </table>
        <svg viewBox="0 0 320 150" role="img" aria-label="Evidencias por aprendiz" style="width:100%; height:auto; margin-top:0.75rem;">
          ${LEARNERS.map((l, i) => `<rect x="${16 + i * 50}" y="${120 - l.evidencias}" width="34" height="${l.evidencias}" rx="3" fill="#2D5A4C"/><text x="${33 + i * 50}" y="${114 - l.evidencias}" font-size="9" text-anchor="middle" fill="currentColor">${l.evidencias}</text><text x="${33 + i * 50}" y="136" font-size="8" text-anchor="middle" fill="currentColor">${l.nombre.split(" ")[0]}</text>`).join("")}
        </svg>
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "Seguimiento de aprendizaje · Ficha 2871" },
      { type: "kpis", items: [{ label: "Asistencia promedio", value: LEARNERS_ATT }, { label: "Evidencias promedio", value: LEARNERS_EVI }] },
      { type: "table", headers: ["Aprendiz", "Asistencia", "Evidencias", "Estado"], rows: LEARNERS.map(l => [l.nombre, String(l.asistencia), String(l.evidencias), l.estado]) },
      { type: "bars", title: "Evidencias por aprendiz", items: LEARNERS.map(l => ({ label: l.nombre.split(" ")[0], value: l.evidencias })) }
    ]
  },
  insightsHtml: canvasInsight("⚡ Lo que hace verificable este prompt", "Los seis aprendices y la regla de estado van en el prompt, y se exige que los KPI se calculen en JavaScript. Si cambias un dato en el arreglo, el tablero debe recalcularse solo.") +
    canvasInsight("🧪 Prueba los cuatro estados del filtro", "Un buscador vacío muestra todo, un texto válido filtra, un texto sin coincidencias deja la tabla vacía y al borrar vuelve a mostrar todo."),
  variationTip: "En el chat del Canvas escribe: «Agrega un aprendiz con asistencia 80 y evidencias 90 al arreglo y comprueba que los KPI se recalculen»."
};

// =====================================================================
// 3. Matrices y hojas de cálculo: matriz ponderada
// =====================================================================
const MATRIX = {
  weights: [25, 20, 15, 25, 15],
  criteria: ["C1 Ancho de banda garantizado", "C2 Disponibilidad SLA del 99,8 %", "C3 Soporte técnico 24/7 en sitio", "C4 Costo mensual por Mbps", "C5 Experiencia certificada"],
  providers: [
    { name: "Proveedor A (fibra)", short: "Proveedor A", scores: [9.5, 9, 8.5, 8, 9] },
    { name: "Proveedor B (híbrido)", short: "Proveedor B", scores: [8, 8.5, 7, 9, 8] },
    { name: "Proveedor C (satelital)", short: "Proveedor C", scores: [6, 7, 6, 5, 6] }
  ]
};
MATRIX.providers.forEach(p => {
  p.total = canvasWeightedScore(p.scores, MATRIX.weights) * 10;
  p.totalText = canvasFormatNumber(p.total, 1);
  p.status = canvasMatrixStatus(p.total);
});
const [PA, PB, PC] = MATRIX.providers;
const fmtScore = s => canvasFormatNumber(s, s % 1 ? 1 : 0);

const DATA_MATRIX = {
  name: "3. Matrices & Hojas de Cálculo",
  docIcon: "📊",
  docTitle: "Matriz_Ponderada_Conectividad_Campus.gsheet",
  image: "assets/images/canvas/canvas_matriz.jpg",
  promptParts: {
    role: "analista de compras públicas que prepara matrices de decisión para comités evaluadores",
    context: "El comité de compras debe elegir un proveedor de internet dedicado para el campus y necesita una matriz cuantitativa que cualquier integrante pueda recalcular.",
    data: `Proceso: servicio de internet dedicado para el campus durante 36 meses.
Escala de calificación: de 1 (no cumple) a 10 (cumple de forma sobresaliente).

Criterio | Peso | ${MATRIX.providers.map(p => p.name).join(" | ")}
${MATRIX.criteria.map((c, i) => `${c} | ${MATRIX.weights[i]} % | ${MATRIX.providers.map(p => fmtScore(p.scores[i])).join(" | ")}`).join("\n")}

Fórmula: puntaje sobre 100 = suma de (calificación × peso) ÷ 10.
Estados: Recomendado si el puntaje es 85 o más; Admisible con observaciones entre 70 y 84,9; No cumple por debajo de 70.`,
    instruction: "En Canvas, construye la matriz ponderada con:",
    task: [
      "Una tabla con los 5 criterios, su peso y la calificación de cada proveedor, tal como aparecen en los datos.",
      "Una columna de aporte por proveedor (calificación × peso ÷ 10) en cada criterio.",
      "Una fila final con el puntaje sobre 100 de cada proveedor, con un decimal, y su estado según los umbrales.",
      "Una conclusión de dos frases que nombre al proveedor recomendado y la diferencia de puntos con el segundo."
    ],
    constraints: [
      "Usa solo las calificaciones y los pesos de los datos, y muestra la fórmula que aplicaste.",
      "Si exportas a Hojas de cálculo, los totales deben ser fórmulas, no valores escritos a mano."
    ],
    format: "Tabla con encabezados claros, estados en verde, ámbar y rojo, y cifras con coma decimal."
  },
  expected: [
    { criterion: "Los pesos suman 100 % (25 + 20 + 15 + 25 + 15).", how: "Suma la columna Peso." },
    { criterion: `El aporte del Proveedor A en C1 es ${canvasFormatNumber((PA.scores[0] * MATRIX.weights[0]) / 10, 2)} (9,5 × 25 ÷ 10).`, how: "Busca la celda en la columna de aportes de A." },
    { criterion: `Puntaje final: Proveedor A = ${PA.totalText}; Proveedor B = ${PB.totalText}; Proveedor C = ${PC.totalText}.`, how: "Recalcula al menos uno con tu calculadora." },
    { criterion: `Estados: A ${PA.status} (verde), B ${PB.status} (ámbar) y C ${PC.status} (rojo).`, how: "Compara cada puntaje con los umbrales de los datos." },
    { criterion: `La conclusión recomienda al Proveedor A y menciona la diferencia de ${canvasFormatNumber(PA.total - PB.total, 1)} puntos con el Proveedor B.`, how: "Lee el texto debajo de la tabla." },
    { criterion: "Al exportar a Hojas de cálculo, la celda del total contiene una fórmula (por ejemplo, =SUMAPRODUCTO).", how: "Haz clic en la celda del total en Google Sheets y mira la barra de fórmulas." }
  ],
  aiResponse: "Construí la matriz en el Canvas con los aportes de cada criterio, el puntaje sobre 100 y el estado de cada proveedor. Puedes exportarla a Hojas de cálculo con las fórmulas incluidas.",
  quickActions: [
    { id: "act-sheet-formula", label: "🧮 Ver fórmula", modal: { title: "Cálculo del puntaje sobre 100", badge: "Fórmula", content: MATRIX.providers.map(p => `${p.short}: (${p.scores.map((s, i) => `${fmtScore(s)}×${MATRIX.weights[i]}`).join(" + ")}) ÷ 10 = ${p.totalText} → ${p.status}`).join("\n") } },
    { id: "act-sheet-export", label: "📊 Exportar a Google Sheets", class: "btn-sheets", toast: "📊 En Gemini, este botón crea la hoja en tu Google Drive. Revisa que el total sea una fórmula." }
  ],
  interactiveHtml: `
      <div class="matrix-preview-container">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.75rem;">
          <h4 style="margin:0; color:var(--color-primary);">📋 Matriz ponderada: internet dedicado para el campus</h4>
          <span class="badge badge-info">Pesos: 100 %</span>
        </div>
        ${canvasTable(["Criterio", "Peso", ...MATRIX.providers.map(p => p.name)], [
          ...MATRIX.criteria.map((c, i) => [c, `${MATRIX.weights[i]} %`, ...MATRIX.providers.map(p => fmtScore(p.scores[i]))]),
          ["<strong>Puntaje sobre 100</strong>", "", ...MATRIX.providers.map(p => `<strong>${p.totalText}</strong>`)],
          ["<strong>Estado</strong>", "", ...MATRIX.providers.map(p => canvasStatusBadge(p.status))]
        ], ' style="font-size:0.8rem;"')}
        <p style="font-size:0.82rem; margin:0.6rem 0 0 0;">Fórmula: suma de (calificación × peso) ÷ 10. Se recomienda el Proveedor A, que supera al Proveedor B por ${canvasFormatNumber(PA.total - PB.total, 1)} puntos.</p>
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "Matriz ponderada · Internet dedicado para el campus" },
      { type: "table", headers: ["Criterio", "Peso", "Proveedor A", "Proveedor B", "Proveedor C"], rows: [
        ...MATRIX.criteria.map((c, i) => [c, `${MATRIX.weights[i]} %`, ...MATRIX.providers.map(p => fmtScore(p.scores[i]))]),
        ["Puntaje sobre 100", "100 %", ...MATRIX.providers.map(p => p.totalText)],
        ["Estado", "", ...MATRIX.providers.map(p => p.status)]
      ] },
      { type: "paragraph", text: "Fórmula: suma de (calificación × peso) ÷ 10." },
      { type: "callout", title: "Conclusión", text: `Se recomienda el Proveedor A (${PA.totalText}). Supera al Proveedor B por ${canvasFormatNumber(PA.total - PB.total, 1)} puntos; el Proveedor C no cumple el mínimo de 70.` }
    ]
  },
  insightsHtml: canvasInsight("📊 Sin datos no hay matriz verificable", "Si el prompt no trae las calificaciones, Gemini las inventa y cada aprendiz obtiene un ganador distinto. Con los datos y la fórmula, todos deben llegar a 88,0, 82,0 y 59,5.") +
    canvasInsight("📈 Fórmulas, no valores", "Pedir que el total sea una fórmula al exportar permite cambiar una calificación en Sheets y ver el nuevo resultado sin volver a Gemini."),
  variationTip: "En el chat escribe: «El Proveedor B mejora su soporte en sitio a 9. Recalcula su puntaje y dime si cambia la recomendación»."
};

// =====================================================================
// 4. Diagramas de proceso: Mermaid
// =====================================================================
const FLOW = {
  lanes: [
    { id: "U", name: "Usuario solicitante", nodes: [{ id: "P1", label: "Reporta la falla", shape: "terminal" }, { id: "P7", label: "Verifica la solución y responde la encuesta" }] },
    { id: "N1", name: "Mesa de ayuda Nivel 1", nodes: [{ id: "P2", label: "Registra el ticket y diagnostica" }, { id: "D1", label: "¿Resuelto en 15 minutos o menos?", shape: "decision" }, { id: "P3", label: "Documenta la solución" }, { id: "P4", label: "Clasifica la severidad y escala" }, { id: "P8", label: "Cierra el ticket", shape: "terminal" }] },
    { id: "N2", name: "Soporte especializado Nivel 2", nodes: [{ id: "P5", label: "Interviene en sitio o reemplaza el hardware" }, { id: "P6", label: "Actualiza la base de conocimiento" }] }
  ],
  edges: [["P1", "P2"], ["P2", "D1"], ["D1", "P3", "Sí"], ["D1", "P4", "No"], ["P4", "P5"], ["P5", "P6"], ["P3", "P7"], ["P6", "P7"], ["P7", "P8"]]
};
const FLOW_MERMAID = canvasMermaidFlow(FLOW);
const FLOW_SHAPE_TEXT = { terminal: " (inicio o fin)", decision: " (decisión)" };
const FLOW_ORDER = ["P1", "P2", "D1", "P3", "P4", "P5", "P6", "P7", "P8"];

const FLOWCHART_DIAGRAM = {
  name: "4. Diagramas de Proceso",
  docIcon: "🔀",
  docTitle: "Flujo_Mesa_de_Ayuda.mmd",
  image: "assets/images/canvas/canvas_diagrama.jpg",
  promptParts: {
    role: "analista de procesos de soporte de TI",
    context: "La mesa de ayuda del centro necesita un diagrama que el personal nuevo entienda en un minuto y que se pueda guardar en el repositorio de documentación.",
    data: `Responsables y pasos (identificador | responsable | paso):
${FLOW.lanes.flatMap(l => l.nodes.map(n => ({ order: FLOW_ORDER.indexOf(n.id), line: `${n.id} | ${l.name} | ${n.label}${FLOW_SHAPE_TEXT[n.shape] || ""}` }))).sort((a, b) => a.order - b.order).map(x => x.line).join("\n")}

Conexiones:
${FLOW.edges.map(([a, b, label]) => `${a} → ${b}${label ? ` (respuesta «${label}»)` : ""}`).join("\n")}`,
    instruction: "En Canvas, genera el diagrama en Mermaid con:",
    task: [
      "Sintaxis flowchart TD.",
      "Un subgrafo por responsable, con el nombre exacto de los datos.",
      "Los 9 pasos con sus identificadores: D1 como rombo, y P1 y P8 como cápsulas de inicio y fin.",
      "Las 9 conexiones de los datos; las dos salidas de D1 rotuladas «Sí» y «No»."
    ],
    constraints: [
      "No agregues pasos, responsables ni conexiones que no estén en los datos.",
      "El código debe dibujarse sin errores en cualquier visor de Mermaid, por ejemplo mermaid.live."
    ],
    format: "Solo el bloque de código Mermaid, seguido de una línea que explique cómo leer el diagrama."
  },
  expected: [
    { criterion: "El código se dibuja sin mensajes de error de sintaxis.", how: "Copia el código del Canvas y pégalo en mermaid.live; Canvas puede mostrarlo como texto sin dibujarlo." },
    { criterion: "Hay 3 carriles (subgrafos): Usuario solicitante, Mesa de ayuda Nivel 1 y Soporte especializado Nivel 2.", how: "Cuenta los recuadros con título en el diagrama." },
    { criterion: "Aparecen los 9 pasos (P1 a P8 y D1), cada uno en el carril de su responsable.", how: "Compara cada nodo con la tabla de datos." },
    { criterion: "D1 es un rombo con dos salidas: «Sí» hacia P3 y «No» hacia P4.", how: "Sigue las flechas que salen del rombo." },
    { criterion: "Hay 9 flechas en total y los dos caminos llegan a P7 y luego a P8.", how: "Cuenta las líneas «-->» en el código." },
    { criterion: "El código empieza con «flowchart TD».", how: "Pasa a la vista de código." }
  ],
  aiResponse: "Generé el diagrama en Mermaid dentro del Canvas: tres carriles por responsable, nueve pasos y la decisión D1 con sus salidas «Sí» y «No». Pega el código en mermaid.live para comprobar que se dibuja sin errores.",
  quickActions: [
    { id: "act-flow-mermaid", label: "📝 Ver código Mermaid", modal: { title: "Código Mermaid de referencia", badge: "Mermaid", content: FLOW_MERMAID } },
    { id: "act-flow-svg", label: "📥 Descargar SVG", toast: "📥 Pega el código en mermaid.live: desde allí puedes descargar el diagrama en SVG o PNG." }
  ],
  interactiveHtml: `
      <div class="flowchart-rendered-box">
        <h4 style="margin:0 0 0.6rem 0; color:var(--color-primary);">🔀 Flujo de la mesa de ayuda por responsable</h4>
        <div style="display:grid; gap:0.5rem;">
          ${FLOW.lanes.map(l => `<div style="border:1px solid var(--border-light); border-radius:6px; padding:0.5rem 0.65rem;"><strong style="font-size:0.82rem;">${l.name}</strong><div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.35rem;">${l.nodes.map(n => `<span class="badge ${n.shape === "decision" ? "badge-warning" : "badge-info"}">${n.id} · ${n.label}</span>`).join("")}</div></div>`).join("")}
        </div>
        <pre style="margin:0.75rem 0 0 0; padding:0.75rem; border-radius:6px; background:#1e1e1e; color:#d4d4d4; font-size:0.76rem; overflow-x:auto; white-space:pre;"><code>${FLOW_MERMAID}</code></pre>
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "Flujo de la mesa de ayuda (Mermaid · flowchart TD)" },
      { type: "flow", lanes: FLOW.lanes, edges: FLOW.edges },
      { type: "paragraph", text: "Lectura: el usuario reporta (P1); Nivel 1 diagnostica y decide en D1. Con «Sí» documenta la solución; con «No» escala a Nivel 2. Ambos caminos terminan en la verificación del usuario (P7) y el cierre (P8)." }
    ]
  },
  insightsHtml: canvasInsight("📐 Identificadores fijos, diagrama comprobable", "Al dar los identificadores y las conexiones, puedes contar nodos y flechas en el código y saber si Gemini agregó o quitó pasos.") +
    canvasInsight("🗂️ Mermaid se guarda con el código", "El texto Mermaid funciona en GitHub y en muchas herramientas de documentación, así que el diagrama se actualiza con un cambio de texto."),
  variationTip: "En el chat escribe: «Agrega un paso P9 de Nivel 2 que notifique al usuario antes de P7 y muéstrame solo las líneas que cambiaron»."
};

// =====================================================================
// 5. Diseño visual UI/UX: tokens, contraste y maqueta
// =====================================================================
const PALETTE = [
  ["--color-primario", "#2D5A4C", "encabezado y botón"],
  ["--color-texto", "#1E293B", "texto"],
  ["--color-fondo", "#F8FAF9", "fondo"],
  ["--color-alerta", "#D97706", "íconos y avisos grandes"],
  ["--color-alerta-texto", "#B45309", "texto de avisos"]
];
const CONTRAST_PAIRS = [["#2D5A4C", "#F8FAF9"], ["#1E293B", "#F8FAF9"], ["#FFFFFF", "#2D5A4C"], ["#D97706", "#FFFFFF"], ["#B45309", "#FFFFFF"]]
  .map(([fg, bg]) => {
    const ratio = canvasContrastRatio(fg, bg);
    return { fg, bg, ratioText: `${canvasFormatNumber(ratio, 2)}:1`, level: canvasWcagLevel(ratio) };
  });
const UI_IMAGE_PROMPT = "High-fidelity mobile app UI mockup, 360 px wide home screen of a student portfolio app called 'Mi Portafolio SENA'. Header in sage green #2D5A4C with white text, background #F8FAF9, body text in slate #1E293B. Three cards: 'Evidencias 18 de 20', 'Asistencia 96 %' and 'Próxima entrega: Diagrama de procesos'. Primary button 'Subir evidencia'. Flat, minimal, soft shadows, centered phone, no hands, no extra text.";

const VISUAL_MOCKUP = {
  name: "5. Diseño Visual UI/UX",
  docIcon: "🎨",
  docTitle: "Sistema_Diseno_Mi_Portafolio.html",
  image: "assets/images/canvas/canvas_ui_ux.jpg",
  promptParts: {
    role: "diseñador de interfaces con experiencia en accesibilidad WCAG 2.2",
    context: "El equipo quiere validar la paleta y la pantalla de inicio antes de diseñar el resto de la aplicación móvil.",
    data: `Producto: aplicación móvil «Mi Portafolio SENA» para aprendices.
Pantalla: inicio del aprendiz, 360 px de ancho.
Contenido de la pantalla:
- Encabezado: «Mi Portafolio SENA» y «Tecnología en ADSO · Ficha 2871».
- Tarjeta 1: Evidencias entregadas, 18 de 20.
- Tarjeta 2: Asistencia, 96 %.
- Tarjeta 3: Próxima entrega, «Diagrama de procesos», vence el 14 de noviembre.
- Botón principal: «Subir evidencia».

Paleta (token | HEX | uso):
${PALETTE.map(p => p.join(" | ")).join("\n")}

Pares de contraste que se deben comprobar (texto sobre fondo):
${CONTRAST_PAIRS.map((p, i) => `${i + 1}. ${p.fg} sobre ${p.bg}`).join("\n")}`,
    instruction: "En Canvas, crea una página HTML con:",
    task: [
      "Una sección de tokens con una muestra de color por cada fila de la paleta.",
      "Una tabla que calcule con JavaScript la razón de contraste de los 5 pares con la fórmula de WCAG 2.2, con dos decimales, y el nivel que cumple: AAA, AA, AA texto grande o No cumple.",
      "Una maqueta de la pantalla de inicio de 360 px de ancho con el contenido de los datos; el botón debe mostrar un contorno real con :focus-visible al llegar con la tecla Tab, no un contorno fijo.",
      "Al final de la página, un bloque de texto en inglés que describa la maqueta con los HEX de la paleta; lo copiaré después como descripción de diseño."
    ],
    constraints: [
      "Calcula los contrastes en el código; no los escribas a mano.",
      "Usa solo los colores de la paleta y no uses librerías externas."
    ],
    format: "Un único archivo HTML; la tabla de contraste con las columnas Par, Razón y Nivel."
  },
  expected: [
    { criterion: `La tabla de contraste muestra ${CONTRAST_PAIRS.slice(0, 3).map(p => `${p.fg} sobre ${p.bg} = ${p.ratioText} (${p.level})`).join("; ")}.`, how: "Compáralo con «Validar contraste» de este simulador (también vale con punto decimal)." },
    { criterion: `${CONTRAST_PAIRS[3].fg} sobre ${CONTRAST_PAIRS[3].bg} = ${CONTRAST_PAIRS[3].ratioText} (${CONTRAST_PAIRS[3].level}): solo sirve para íconos o texto grande.`, how: "Revisa la fila 4 de la tabla." },
    { criterion: `${CONTRAST_PAIRS[4].fg} sobre ${CONTRAST_PAIRS[4].bg} = ${CONTRAST_PAIRS[4].ratioText} (${CONTRAST_PAIRS[4].level}): sirve para el texto de los avisos.`, how: "Revisa la fila 5 de la tabla." },
    { criterion: "La maqueta muestra Evidencias 18 de 20, Asistencia 96 % y la próxima entrega «Diagrama de procesos».", how: "Abre la vista previa del Canvas." },
    { criterion: "El botón «Subir evidencia» muestra un contorno solo al llegar a él con la tecla Tab, y el CSS usa :focus-visible.", how: "Haz clic en la vista previa, presiona Tab y busca «focus-visible» en el código." },
    { criterion: "El bloque en inglés del final describe la maqueta e incluye #2D5A4C, #1E293B y #F8FAF9.", how: "Busca los tres HEX en ese bloque; luego puedes pegarlo en un chat nuevo de Gemini para generar la imagen." }
  ],
  imagePrompt: UI_IMAGE_PROMPT,
  aiResponse: "Preparé en el Canvas los tokens de color, la tabla de contraste calculada con la fórmula de WCAG 2.2, la maqueta de la pantalla de inicio y, al final, la descripción en inglés de la maqueta.",
  quickActions: [
    { id: "act-ui-contrast", label: "👁️ Validar contraste", action: "check-contrast" },
    { id: "act-ui-imagen3", label: "🖼️ Prompt de imagen", action: "prompt-imagen3" },
    { id: "act-ui-tokens", label: "🎨 Copiar tokens CSS", action: "copy-css-tokens" }
  ],
  cssTokens: `:root {\n${PALETTE.map(([t, hex, use]) => `  ${t}: ${hex}; /* ${use} */`).join("\n")}\n}`,
  interactiveHtml: `
      <div class="ui-design-spec-box">
        <h4 style="margin:0 0 0.5rem 0; color:var(--color-primary);">🎨 Tokens de color de «Mi Portafolio SENA»</h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.5rem; margin-bottom:1rem;">
          ${PALETTE.map(([t, hex]) => `<div style="background:${hex}; color:${canvasContrastRatio("#FFFFFF", hex) >= 4.5 ? "#FFFFFF" : "#1E293B"}; border:1px solid #e2e8f0; padding:0.6rem; border-radius:6px; text-align:center;"><strong style="display:block; font-size:0.75rem;">${t}</strong><small>${hex}</small></div>`).join("")}
        </div>
        <h5 style="margin:0 0 0.35rem 0;">Contraste calculado con la fórmula de WCAG 2.2</h5>
        ${canvasTable(["Par", "Razón", "Nivel"], CONTRAST_PAIRS.map(p => [`${p.fg} sobre ${p.bg}`, p.ratioText, canvasStatusBadge(p.level)]), ' style="font-size:0.8rem; margin-bottom:1rem;"')}
        <div style="max-width:360px; border:1px solid var(--border-light); border-radius:16px; overflow:hidden; background:#F8FAF9; color:#1E293B;">
          <div style="background:#2D5A4C; color:#FFFFFF; padding:0.75rem;"><strong>Mi Portafolio SENA</strong><br><small>Tecnología en ADSO · Ficha 2871</small></div>
          <div style="padding:0.75rem; display:grid; gap:0.5rem; font-size:0.85rem;">
            <div style="background:#FFFFFF; border-radius:8px; padding:0.6rem;">Evidencias entregadas: <strong>18 de 20</strong></div>
            <div style="background:#FFFFFF; border-radius:8px; padding:0.6rem;">Asistencia: <strong>96 %</strong></div>
            <div style="background:#FFFFFF; border-radius:8px; padding:0.6rem;">Próxima entrega: <strong>Diagrama de procesos</strong> · vence el 14 de noviembre</div>
            <button type="button" style="background:#2D5A4C; color:#FFFFFF; border:none; border-radius:999px; padding:0.6rem; font-weight:700; outline-offset:3px;">Subir evidencia</button>
          </div>
        </div>
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "Sistema de diseño · Mi Portafolio SENA" },
      { type: "swatches", items: PALETTE.map(([t, hex]) => ({ name: t, hex })) },
      { type: "table", headers: ["Par (texto sobre fondo)", "Razón", "Nivel"], rows: CONTRAST_PAIRS.map(p => [`${p.fg} sobre ${p.bg}`, p.ratioText, p.level]) },
      { type: "phone", title: "Mi Portafolio SENA", subtitle: "Tecnología en ADSO · Ficha 2871", cards: ["Evidencias entregadas: 18 de 20", "Asistencia: 96 %", "Próxima entrega: Diagrama de procesos"], button: "Subir evidencia" }
    ]
  },
  insightsHtml: canvasInsight("👁️ El contraste se calcula, no se adivina", `Verde Salvia sobre Lino da ${CONTRAST_PAIRS[0].ratioText}, y el ámbar #D97706 sobre blanco apenas llega a ${CONTRAST_PAIRS[3].ratioText}. Por eso los avisos con texto usan #B45309.`) +
    canvasInsight("🖼️ Del Canvas a la imagen", "Si el prompt pide dentro de Canvas un texto «para un generador de imágenes», Gemini puede rechazarlo. Por eso se pide una descripción en inglés y la imagen se genera aparte, en un chat nuevo sin Canvas."),
  variationTip: "En el chat escribe: «Agrega un modo oscuro con fondo #121816 y recalcula la tabla de contraste para los mismos pares»."
};

// =====================================================================
// 6. Edición por selección (inline)
// =====================================================================
const ACTA_POINT_3 = "Los aprendices que no asistan perderán la oportunidad de presentar la prueba final a menos que tengan una excusa válida de un médico u otra autoridad y deben presentarla antes de dos días hábiles.";
const ACTA_REWRITE = [
  "Entrega del soporte: si no puedes asistir, presenta la excusa de un médico u otra autoridad dentro de los dos días hábiles siguientes a la prueba.",
  "Resultado: con un soporte válido, conservas la oportunidad de presentar la prueba final."
];
const INLINE_PROMPTING = {
  name: "6. Edición por Selección (Inline)",
  docIcon: "✂️",
  docTitle: "Acta_Concertacion_Ficha_2879123.docx",
  image: "assets/images/canvas/canvas_inline.jpg",
  promptParts: {
    role: "secretario técnico que transcribe las actas del comité académico",
    context: "Necesitas el acta en un Canvas para corregir después solo el punto 3, que el comité consideró confuso y punitivo.",
    data: `ACTA DE CONCERTACIÓN · Ficha 2879123 (Técnico en Programación de Software)
1. Objeto: acordar las condiciones de la evaluación final del módulo de bases de datos.
2. Fecha de la prueba final: 14 de noviembre de 2026, 8:00 a. m., ambiente 204.
3. Inasistencia: ${ACTA_POINT_3}
4. Compromisos: el instructor publica la rúbrica el 7 de noviembre; los aprendices confirman su asistencia en la plataforma del curso.`,
    instruction: "En Canvas, haz lo siguiente:",
    task: [
      "Transcribe el acta exactamente como aparece en los datos, con su título y los 4 puntos numerados.",
      "No corrijas ni resumas nada todavía; la edición del punto 3 se hará en el paso 2.",
      "Al final, confirma en el chat cuántos puntos tiene el acta."
    ],
    constraints: ["Conserva sin cambios las fechas, la hora y los números de ficha y de ambiente."],
    format: "Documento con el título en negrita y los puntos numerados del 1 al 4."
  },
  followUps: [
    {
      label: "PASO 2 · SELECCIONA SOLO EL PUNTO 3 EN EL CANVAS Y ESCRIBE EN EL CUADRO DE EDICIÓN",
      text: "Reescribe este punto en tono respetuoso y claro, en dos viñetas: 1) cómo y en qué plazo se entrega el soporte de la inasistencia; 2) qué ocurre si el soporte es válido. Conserva el plazo de dos días hábiles y no agregues requisitos, correos ni fechas nuevas."
    }
  ],
  expected: [
    { criterion: "Después del paso 1, el Canvas tiene el acta completa con 4 puntos idénticos a los datos.", how: "Compara el Canvas con el bloque de datos antes de editar." },
    { criterion: "Después del paso 2, solo cambió el punto 3: ahora tiene exactamente 2 viñetas.", how: "Compara con la versión anterior (deshacer o historial de versiones del Canvas)." },
    { criterion: "Los puntos 1, 2 y 4 siguen iguales: 14 de noviembre de 2026, 8:00 a. m., ambiente 204 y rúbrica el 7 de noviembre.", how: "Lee los tres puntos sin editar." },
    { criterion: "El punto 3 conserva «dos días hábiles» y el soporte de un médico u otra autoridad.", how: "Busca «dos días hábiles» con Ctrl+F." },
    { criterion: "La segunda viñeta dice que, con un soporte válido, el aprendiz conserva la oportunidad de presentar la prueba final.", how: "Lee la segunda viñeta." },
    { criterion: "No aparecen requisitos nuevos (correos, formatos, fechas o sanciones) y ya no dice «perderán».", how: "Busca «correo», «formato» y «perderán»; no debe haber resultados." }
  ],
  aiResponse: "Transcribí el acta en el Canvas con sus 4 puntos. Ahora selecciona solo el punto 3 y escribe la instrucción del paso 2 en el cuadro que aparece: cambiaré únicamente ese fragmento.",
  quickActions: [
    { id: "act-inline-diff", label: "🔄 Comparar antes y después", modal: { title: "Punto 3: antes y después de la edición por selección", badge: "Comparación", content: `ANTES\n${ACTA_POINT_3}\n\nDESPUÉS (referencia)\n• ${ACTA_REWRITE[0]}\n• ${ACTA_REWRITE[1]}` } },
    { id: "act-inline-history", label: "🕒 Historial de versiones", toast: "🕒 En Gemini, el historial del Canvas permite volver a la versión anterior y comparar los cambios." }
  ],
  interactiveHtml: `
      <div class="inline-diff-comparison">
        <h4 style="margin:0 0 0.5rem 0; color:var(--color-primary);">✂️ Punto 3 del acta: antes y después</h4>
        <div class="comparison-grid" style="margin-top:0.5rem;">
          <div class="comparison-col col-bad">
            <div class="col-title">❌ Antes (texto seleccionado)</div>
            <p style="font-size:0.83rem; margin:0;">${ACTA_POINT_3}</p>
            <small style="display:block; margin-top:0.5rem; opacity:0.8;">Problema: tono punitivo y una sola oración que mezcla condición, soporte y plazo.</small>
          </div>
          <div class="comparison-col col-good">
            <div class="col-title">✓ Después (referencia del paso 2)</div>
            <ul style="font-size:0.82rem; margin:0.2rem 0 0 1rem; padding:0;">
              ${ACTA_REWRITE.map(t => `<li>${t}</li>`).join("")}
            </ul>
            <small style="display:block; margin-top:0.5rem; opacity:0.8;">Se conservan el plazo y el soporte; no se agregan requisitos.</small>
          </div>
        </div>
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "ACTA DE CONCERTACIÓN · Ficha 2879123" },
      { type: "paragraph", text: "1. Objeto: acordar las condiciones de la evaluación final del módulo de bases de datos." },
      { type: "paragraph", text: "2. Fecha de la prueba final: 14 de noviembre de 2026, 8:00 a. m., ambiente 204." },
      { type: "selection", title: "3. Inasistencia (fragmento editado por selección)", items: ACTA_REWRITE },
      { type: "paragraph", text: "4. Compromisos: el instructor publica la rúbrica el 7 de noviembre; los aprendices confirman su asistencia en la plataforma del curso." }
    ]
  },
  insightsHtml: canvasInsight("✂️ Dos pasos, un solo cambio", "Primero se crea el documento con el texto exacto; después se selecciona solo el punto 3. Así puedes comprobar que el resto del acta no cambió.") +
    canvasInsight("🛡️ Restricciones que protegen el contenido", "Pedir que se conserve el plazo y que no se agreguen requisitos evita que la IA invente correos, formatos o sanciones que el comité no aprobó."),
  variationTip: "Selecciona el punto 4 y escribe: «Conviértelo en una tabla de dos columnas: responsable y compromiso, sin cambiar las fechas»."
};

// =====================================================================
// 7. Algoritmos y Python: de O(n²) a O(n)
// =====================================================================
const DELIVERIES = [
  ["101", "Ana", 70.0], ["102", "Luis", 69.9], ["103", "Marta", 50.0], ["104", "Jorge", 49.9],
  ["101", "Ana", 95.0], ["105", "Sara", 0.0], ["106", "Iván", 100.0]
].map(([documento, nombre, puntaje]) => ({ documento, nombre, puntaje }));
const DELIVERIES_OUTPUT = canvasPythonRepr(canvasClassifyDeliveries(DELIVERIES));
const ALGO_REFERENCE = `from typing import Any


def agrupar_por_estado(entregas: list[dict[str, Any]]) -> dict[str, list[str]]:
    """Agrupa a los aprendices por estado según su puntaje.

    Si un documento aparece varias veces, solo cuenta su primer registro.
    Complejidad O(n): buscar en un set toma tiempo constante en promedio.
    """
    resumen: dict[str, list[str]] = {"al_dia": [], "en_progreso": [], "apoyo": []}
    vistos: set[str] = set()
    for e in entregas:
        if e["documento"] in vistos:
            continue
        vistos.add(e["documento"])
        if e["puntaje"] >= 70:
            resumen["al_dia"].append(e["nombre"])
        elif e["puntaje"] >= 50:
            resumen["en_progreso"].append(e["nombre"])
        else:
            resumen["apoyo"].append(e["nombre"])
    return resumen`;
const ALGO_TESTS = `import pytest

from clasificador import agrupar_por_estado


def entrega(doc, puntaje, nombre=None):
    return {"documento": doc, "nombre": nombre or f"A{doc}", "puntaje": puntaje}


def test_lista_vacia():
    assert agrupar_por_estado([]) == {"al_dia": [], "en_progreso": [], "apoyo": []}


@pytest.mark.parametrize("puntaje, estado", [
    (0.0, "apoyo"), (49.9, "apoyo"), (50.0, "en_progreso"),
    (69.9, "en_progreso"), (70.0, "al_dia"),
])
def test_limites(puntaje, estado):
    assert agrupar_por_estado([entrega("1", puntaje)])[estado] == ["A1"]


def test_documento_repetido_cuenta_el_primero():
    resultado = agrupar_por_estado([entrega("1", 70.0), entrega("1", 10.0)])
    assert resultado == {"al_dia": ["A1"], "en_progreso": [], "apoyo": []}`;

const ALGORITHM_REFACTOR = {
  name: "7. Algoritmos & Python (O(n))",
  docIcon: "⚡",
  docTitle: "clasificador.py",
  image: "assets/images/canvas/canvas_algoritmo.jpg",
  promptParts: {
    role: "ingeniero de software que revisa el rendimiento de código Python",
    context: "La función agrupa las entregas de cada corte (10.000 registros) y se volvió lenta. Se necesita una versión eficiente que devuelva exactamente el mismo resultado.",
    data: `Función actual (Python 3.11):

def agrupar_por_estado(entregas):
    resumen = {"al_dia": [], "en_progreso": [], "apoyo": []}
    vistos = []
    for e in entregas:
        if e["documento"] in vistos:  # se ignora el documento repetido
            continue
        vistos.append(e["documento"])
        if e["puntaje"] >= 70:
            resumen["al_dia"].append(e["nombre"])
        elif e["puntaje"] >= 50:
            resumen["en_progreso"].append(e["nombre"])
        else:
            resumen["apoyo"].append(e["nombre"])
    return resumen

Entrada de ejemplo:
entregas = [
${DELIVERIES.map(d => `    {"documento": "${d.documento}", "nombre": "${d.nombre}", "puntaje": ${d.puntaje.toFixed(1)}},`).join("\n")}
]`,
    instruction: "En Canvas, entrega:",
    task: [
      "Una explicación de dos frases de por qué la función actual es O(n²), señalando la línea responsable.",
      "La función refactorizada en O(n), con el mismo nombre, type hints y docstring en español.",
      "Un archivo de pruebas con pytest que cubra la lista vacía, un documento repetido y los límites 0, 49.9, 50, 69.9 y 70.",
      "Un bloque final que imprima el resultado con la entrada de ejemplo."
    ],
    constraints: [
      "Conserva el comportamiento: si un documento se repite, cuenta su primer registro.",
      "Usa solo la biblioteca estándar de Python."
    ],
    format: "La explicación primero y después dos bloques de código: la función y las pruebas."
  },
  expected: [
    { criterion: "La explicación señala la línea «if e[\"documento\"] in vistos»: buscar en una lista recorre sus elementos, y eso ocurre dentro del ciclo.", how: "Lee la explicación antes del código." },
    { criterion: "La versión nueva usa un set (conjunto) para vistos y conserva el nombre agrupar_por_estado.", how: "Busca «set(» en el código." },
    { criterion: `Con la entrada de ejemplo imprime ${DELIVERIES_OUTPUT}.`, how: "Copia el código a tu equipo o a Google Colab y ejecútalo." },
    { criterion: "Las pruebas cubren la lista vacía, el documento repetido y los 5 límites, y «python -m pytest» termina sin fallos.", how: "Guarda la función como clasificador.py y las pruebas como test_clasificador.py, y ejecuta pytest. Si Gemini entrega todo en un solo archivo, ejecuta pytest sobre ese archivo." },
    { criterion: "La función tiene type hints y un docstring en español que menciona la complejidad O(n).", how: "Lee la firma y el docstring." }
  ],
  aiResponse: "Refactoricé la función en el Canvas: el cuello de botella era buscar en una lista dentro del ciclo, y ahora uso un set. Incluí las pruebas con pytest y un bloque que imprime el resultado de la entrada de ejemplo.",
  quickActions: [
    { id: "act-algo-code", label: "⚡ Solución de referencia", modal: { title: "clasificador.py · versión O(n) de referencia", badge: "Python 3.11+", content: ALGO_REFERENCE } },
    { id: "act-algo-pytest", label: "🧪 Pruebas de referencia", modal: { title: "test_clasificador.py · ejecútalo con «python -m pytest»", badge: "pytest", content: ALGO_TESTS } }
  ],
  interactiveHtml: `
      <div class="algo-interactive-demo" style="font-family:var(--font-sans);">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap; border-bottom:1px solid var(--border-light); padding-bottom:0.5rem; margin-bottom:0.75rem;">
          <h4 style="margin:0; color:var(--color-primary);">⚡ agrupar_por_estado(): de O(n²) a O(n)</h4>
          <span class="badge badge-success">Mismo resultado</span>
        </div>
        <p style="font-size:0.84rem; margin:0 0 0.6rem 0;"><strong>Causa:</strong> <code>if e["documento"] in vistos</code> busca en una lista; con 10.000 entregas son hasta 10.000 comparaciones por cada entrega. Un <code>set</code> responde en tiempo constante.</p>
        <pre style="background:#1e1e1e; color:#d4d4d4; padding:0.85rem; border-radius:6px; font-size:0.76rem; overflow-x:auto; white-space:pre; margin:0 0 0.6rem 0;"><code>${ALGO_REFERENCE}</code></pre>
        <p style="font-size:0.84rem; margin:0;"><strong>Salida esperada con la entrada de ejemplo:</strong><br><code>${DELIVERIES_OUTPUT}</code></p>
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "clasificador.py · de O(n²) a O(n)" },
      { type: "paragraph", text: "Causa: «if e[\"documento\"] in vistos» busca en una lista dentro del ciclo. Solución: vistos pasa a ser un set." },
      { type: "code", lines: ALGO_REFERENCE.split("\n") },
      { type: "callout", title: "Salida con la entrada de ejemplo", text: DELIVERIES_OUTPUT },
      { type: "bullets", items: ["test_lista_vacia", "test_limites[0.0, 49.9, 50.0, 69.9, 70.0]", "test_documento_repetido_cuenta_el_primero"] }
    ]
  },
  insightsHtml: canvasInsight("🧪 La entrada de ejemplo es la prueba de oro", "Incluye límites (49.9, 50, 69.9 y 70) y un documento repetido. Si la versión nueva imprime lo mismo que la anterior, la refactorización conservó el comportamiento.") +
    canvasInsight("⏱️ Mide tú mismo", "El simulador no promete milisegundos. Si quieres comparar, mide las dos versiones con el módulo timeit en tu equipo y con los mismos datos."),
  variationTip: "En el chat escribe: «Agrega una prueba con 10.000 entregas generadas y compara el tiempo de las dos versiones con timeit»."
};

// =====================================================================
// 8. Rúbricas y didáctica
// =====================================================================
const RUBRIC = {
  criteria: [
    ["C1 Separación de capas (dominio, aplicación e infraestructura)", 30],
    ["C2 Pruebas automatizadas con aserciones", 35],
    ["C3 Manejo de errores HTTP con el formato de RFC 9457", 35]
  ],
  sample: [4.8, 3.5, 4.0]
};
const RUBRIC_WEIGHTS = RUBRIC.criteria.map(c => c[1]);
const RUBRIC_GRADE = canvasWeightedScore(RUBRIC.sample, RUBRIC_WEIGHTS);
const RUBRIC_PARTS = RUBRIC.sample.map((g, i) => (g * RUBRIC_WEIGHTS[i]) / 100);
const RUBRIC_RESULT = `${canvasFormatNumber(RUBRIC_GRADE, 1)} (${canvasRubricLevel(canvasRound(RUBRIC_GRADE, 1))})`;
const RUBRIC_OPERATION = `${RUBRIC.sample.map((g, i) => `${canvasFormatNumber(g, 1)} × ${canvasFormatNumber(RUBRIC_WEIGHTS[i] / 100, 2)}`).join(" + ")} = ${RUBRIC_PARTS.map(p => canvasFormatNumber(p, 3).replace(/0$/, "")).join(" + ")} = ${canvasFormatNumber(RUBRIC_GRADE, 3)} ≈ ${RUBRIC_RESULT}`;
const RUBRIC_DESCRIPTORS = [
  ["Ninguna clase de dominio importa el framework web ni el ORM; las dependencias apuntan hacia el dominio.", "Las capas existen y solo una clase de dominio importa infraestructura.", "Las capas existen, pero varias clases de dominio importan infraestructura.", "No hay carpetas ni módulos que separen las capas."],
  ["Cada función de negocio tiene pruebas con aserciones y el informe muestra 0 fallos.", "Todas las rutas tienen pruebas; faltan casos de error en algunas funciones.", "Hay pruebas solo para el flujo exitoso.", "No hay pruebas o las pruebas no tienen aserciones."],
  ["Todos los errores responden con el formato de RFC 9457 (type, title, status, detail) y el código HTTP correcto.", "El formato se aplica, pero algún código HTTP no corresponde al error.", "Los errores se capturan con mensajes genéricos sin formato común.", "Las excepciones llegan al cliente con trazas internas."]
];
const RUBRIC_LEVELS = ["Excelente (4,5–5,0)", "Bueno (3,8–4,4)", "En desarrollo (3,0–3,7)", "Requiere refuerzo (< 3,0)"];
const RUBRIC_QUESTIONS = [
  "C1: Si mañana cambias la base de datos, ¿qué archivos de tu proyecto tendrías que modificar y por qué?",
  "C2: ¿Qué prueba de tu suite fallaría si alguien elimina la validación de una nota negativa?",
  "C3: Cuando un recurso no existe, ¿qué responde tu API y cómo lo decidiste?"
];

const RUBRIC_CURRICULUM = {
  name: "8. Rúbricas & Didáctica",
  docIcon: "📚",
  docTitle: "Rubrica_Backend_Arquitectura_Pruebas.gdoc",
  image: "assets/images/canvas/canvas_rubrica.jpg",
  promptParts: {
    role: "diseñador curricular que construye instrumentos de evaluación por competencias",
    context: "El equipo instructor necesita una rúbrica que dos evaluadores apliquen al mismo repositorio y obtengan la misma nota.",
    data: `Programa: Tecnólogo en Análisis y Desarrollo de Software (datos de práctica).
Competencia: Construir el sistema que cumpla con los requisitos de la solución informática.
Resultado de aprendizaje: Codificar los módulos del backend según la arquitectura definida y verificarlos con pruebas automatizadas.
Evidencia de producto: repositorio del backend con su informe de pruebas.

Criterios y pesos:
${RUBRIC.criteria.map(([c, w]) => `${c} | ${w} %`).join("\n")}

Niveles de desempeño (nota de 0,0 a 5,0):
Excelente: de 4,5 a 5,0
Bueno: de 3,8 a 4,4
En desarrollo: de 3,0 a 3,7
Requiere refuerzo: menos de 3,0

Nota final = suma de (nota del criterio × peso).
Caso para calibrar: un aprendiz obtiene ${RUBRIC.sample.map((g, i) => `${canvasFormatNumber(g, 1)} en C${i + 1}`).join("; ")}.`,
    instruction: "En Canvas, redacta la guía de evaluación con:",
    task: [
      "La identificación curricular copiada de los datos.",
      "Una rúbrica en una tabla: 3 filas (C1, C2 y C3, con su peso) y 4 columnas de nivel con el rango de nota en el encabezado.",
      "La calificación del caso para calibrar, con la operación paso a paso y el nivel que resulta.",
      "Tres preguntas de retroalimentación, una por criterio, que el instructor le haga al aprendiz."
    ],
    constraints: [
      "Cada descriptor debe nombrar algo observable en el repositorio o en el informe (archivos, pruebas, códigos HTTP), no adjetivos como «bueno» o «adecuado».",
      "Los pesos deben sumar 100 %."
    ],
    format: "Documento con títulos numerados y la rúbrica en una sola tabla."
  },
  expected: [
    { criterion: "La rúbrica tiene 3 criterios × 4 niveles = 12 descriptores.", how: "Cuenta las celdas de la tabla." },
    { criterion: "Los pesos 30 %, 35 % y 35 % suman 100 %.", how: "Suma la columna de pesos." },
    { criterion: "Cada descriptor nombra algo que se puede comprobar: archivos, importaciones, pruebas, fallos o códigos HTTP.", how: "Lee cada celda y pregúntate cómo lo verificarías en el repositorio." },
    { criterion: `La nota del caso es ${RUBRIC_OPERATION}.`, how: "Repite la operación con tu calculadora." },
    { criterion: "Hay 3 preguntas abiertas, una por criterio, que no se responden con «sí» o «no».", how: "Lee la última sección." },
    { criterion: "La competencia y el resultado de aprendizaje coinciden palabra por palabra con los datos.", how: "Compara con el bloque de datos." }
  ],
  aiResponse: "Redacté en el Canvas la guía de evaluación con la identificación curricular, la rúbrica de 3 criterios y 4 niveles, el cálculo del caso para calibrar y tres preguntas de retroalimentación.",
  quickActions: [
    { id: "act-rubric-questions", label: "💬 Preguntas de referencia", modal: { title: "Preguntas de retroalimentación de referencia", badge: "Pedagogía", content: RUBRIC_QUESTIONS.join("\n\n") } },
    { id: "act-rubric-export", label: "📄 Exportar a Google Docs", class: "btn-docs", toast: "📄 En Gemini, este botón crea la guía en tu Google Drive." }
  ],
  interactiveHtml: `
      <div class="rubric-interactive-demo" style="font-family:var(--font-sans);">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap; border-bottom:1px solid var(--border-light); padding-bottom:0.5rem; margin-bottom:0.75rem;">
          <h4 style="margin:0; color:var(--color-primary);">📋 Rúbrica analítica: backend con arquitectura y pruebas</h4>
          <span class="badge badge-info">Pesos: 100 %</span>
        </div>
        ${canvasTable(["Criterio", "Peso", ...RUBRIC_LEVELS], RUBRIC.criteria.map(([c, w], i) => [`<strong>${c}</strong>`, `${w} %`, ...RUBRIC_DESCRIPTORS[i]]), ' style="font-size:0.76rem;"')}
        <p style="font-size:0.84rem; margin:0.75rem 0 0 0;"><strong>Caso para calibrar:</strong> ${RUBRIC_OPERATION}</p>
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "Guía de evaluación · Rúbrica analítica del backend" },
      { type: "paragraph", text: "Resultado de aprendizaje: Codificar los módulos del backend según la arquitectura definida y verificarlos con pruebas automatizadas." },
      { type: "table", headers: ["Criterio", "Peso", ...RUBRIC_LEVELS], rows: RUBRIC.criteria.map(([c, w], i) => [c, `${w} %`, ...RUBRIC_DESCRIPTORS[i]]) },
      { type: "callout", title: "Caso para calibrar", text: RUBRIC_OPERATION },
      { type: "bullets", items: RUBRIC_QUESTIONS }
    ]
  },
  insightsHtml: canvasInsight("🎯 El caso para calibrar pone a prueba la rúbrica", "Con las notas y los pesos en el prompt, la operación tiene una sola respuesta. Si Gemini llega a otra nota o a otro nivel, el error se ve de inmediato.") +
    canvasInsight("🔎 Descriptores observables", "«Ninguna clase de dominio importa el ORM» se comprueba abriendo el código; «buen diseño» depende de quién evalúe."),
  variationTip: "En el chat escribe: «Convierte la rúbrica en una lista de chequeo de autoevaluación con 9 afirmaciones de sí o no para el aprendiz»."
};

// =====================================================================
// 9. SQL y pipelines
// =====================================================================
const SQL_DATA = {
  learners: [[1, "Ana", 2871], [2, "Luis", 2871], [3, "Marta", 2871], [4, "Jorge", 2872], [5, "Sara", 2872]].map(([id, nombre, ficha_id]) => ({ id, nombre, ficha_id })),
  grades: [[1, 4.5], [1, 4.1], [2, 3.8], [2, 4.2], [3, 4.6], [4, 3.0], [4, 3.4], [5, 4.9]].map(([aprendiz_id, calificacion]) => ({ aprendiz_id, calificacion })),
  attendance: [
    [1, [true, true, true, true]], [2, [true, false, true, true]], [3, [true, true, true, true]], [4, [true, false, false, true]]
  ].flatMap(([id, days]) => days.map((asistio, i) => ({ aprendiz_id: id, fecha: `2026-10-${String(5 + i * 7).padStart(2, "0")}`, asistio })))
};
const SQL_RESULT = canvasSqlRanking(SQL_DATA.learners, SQL_DATA.grades, SQL_DATA.attendance);
const sqlPct = r => (r.pct_asistencia === null ? "NULL" : canvasFormatNumber(r.pct_asistencia, 1));
const SQL_RESULT_ROWS = SQL_RESULT.map(r => [String(r.ficha_id), String(r.puesto), r.nombre, canvasFormatNumber(r.promedio, 1), sqlPct(r)]);
const SQL_RESULT_TEXT = [2871, 2872].map(f => `${f} → ${SQL_RESULT.filter(r => r.ficha_id === f).map(r => `${r.puesto} ${r.nombre} ${canvasFormatNumber(r.promedio, 1)} · ${sqlPct(r)}`).join("; ")}`).join(". ");
const SQL_REFERENCE = `-- Promedio de notas por aprendiz
WITH notas AS (
  SELECT aprendiz_id, ROUND(AVG(calificacion), 1) AS promedio
  FROM entregas
  GROUP BY aprendiz_id
),
-- Asistencia de octubre de 2026
asistencia AS (
  SELECT aprendiz_id,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE asistio) AS asistidas
  FROM registro_asistencia
  WHERE fecha BETWEEN DATE '2026-10-01' AND DATE '2026-10-31'
  GROUP BY aprendiz_id
)
SELECT a.ficha_id,
       ROW_NUMBER() OVER (PARTITION BY a.ficha_id ORDER BY n.promedio DESC) AS puesto,
       a.nombre,
       n.promedio,
       ROUND(100.0 * s.asistidas / NULLIF(s.total, 0), 1) AS pct_asistencia
FROM aprendices a
JOIN notas n ON n.aprendiz_id = a.id
LEFT JOIN asistencia s ON s.aprendiz_id = a.id
ORDER BY a.ficha_id, puesto;

-- Índice para filtrar por aprendiz y fecha sin leer la tabla completa
CREATE INDEX CONCURRENTLY idx_asistencia_aprendiz_fecha
  ON registro_asistencia (aprendiz_id, fecha) INCLUDE (asistio);`;

const SQL_PIPELINE = {
  name: "9. SQL & Pipelines",
  docIcon: "🗄️",
  docTitle: "Reporte_Mensual_Por_Ficha.sql",
  image: "assets/images/canvas/canvas_sql.jpg",
  promptParts: {
    role: "analista de bases de datos PostgreSQL",
    context: "El reporte mensual por ficha tarda demasiado con 5.000 aprendices. Antes de llevar la nueva consulta a producción, se valida con la muestra de los datos.",
    data: `CREATE TABLE aprendices (id INT PRIMARY KEY, nombre TEXT NOT NULL, ficha_id INT NOT NULL);
CREATE TABLE entregas (aprendiz_id INT REFERENCES aprendices(id), calificacion NUMERIC(2,1));
CREATE TABLE registro_asistencia (aprendiz_id INT REFERENCES aprendices(id), fecha DATE, asistio BOOLEAN);

INSERT INTO aprendices VALUES ${SQL_DATA.learners.map(l => `(${l.id},'${l.nombre}',${l.ficha_id})`).join(",")};
INSERT INTO entregas VALUES ${SQL_DATA.grades.map(g => `(${g.aprendiz_id},${g.calificacion.toFixed(1)})`).join(",")};
INSERT INTO registro_asistencia VALUES
${[1, 2, 3, 4].map(id => SQL_DATA.attendance.filter(r => r.aprendiz_id === id).map(r => `(${id},'${r.fecha}',${r.asistio})`).join(",")).join(",\n")};
-- Sara (id 5) no tiene registros de asistencia en octubre.`,
    instruction: "En Canvas, escribe en SQL:",
    task: [
      "Una consulta con dos CTE: una para el promedio de notas y otra para la asistencia del 2026-10-01 al 2026-10-31.",
      "El puesto de cada aprendiz dentro de su ficha con ROW_NUMBER(), ordenado por promedio de mayor a menor.",
      "El porcentaje de asistencia con un decimal; si un aprendiz no tiene registros, debe aparecer con NULL y sin error de división por cero.",
      "La sentencia que crea un índice compuesto en registro_asistencia (aprendiz_id, fecha) que incluya asistio.",
      "La tabla de resultado que esperas con los datos de muestra."
    ],
    constraints: [
      "No uses subconsultas correlacionadas.",
      "Usa ROUND(…, 1) para el promedio y el porcentaje, y ordena por ficha y puesto."
    ],
    format: "Un bloque SQL comentado y, debajo, la tabla de resultado esperada."
  },
  expected: [
    { criterion: "La consulta usa WITH con dos CTE y ROW_NUMBER() OVER (PARTITION BY ficha_id ORDER BY promedio DESC).", how: "Lee el bloque SQL." },
    { criterion: "Usa LEFT JOIN y NULLIF (o CASE) para que Sara aparezca con NULL en asistencia.", how: "Busca «LEFT JOIN» y «NULLIF» en el código." },
    { criterion: `Resultado con la muestra: ${SQL_RESULT_TEXT}.`, how: "Ejecuta el esquema y la consulta en PostgreSQL (local o en un editor en línea) y compara fila por fila." },
    { criterion: "El índice es CREATE INDEX … ON registro_asistencia (aprendiz_id, fecha) INCLUDE (asistio).", how: "Lee la sentencia del índice." },
    { criterion: "No hay subconsultas dentro de SELECT ni de WHERE.", how: "Busca «(SELECT» en el código; solo debe aparecer dentro de las CTE." }
  ],
  aiResponse: "Escribí en el Canvas la consulta con dos CTE, el puesto por ficha con ROW_NUMBER(), el porcentaje de asistencia protegido con NULLIF, el índice compuesto y la tabla de resultado que debe dar la muestra.",
  quickActions: [
    { id: "act-sql-reference", label: "🗄️ Consulta de referencia", modal: { title: "Consulta de referencia (PostgreSQL)", badge: "SQL", content: SQL_REFERENCE } },
    { id: "act-sql-result", label: "📋 Resultado esperado", modal: { title: "Resultado esperado con los datos de muestra", badge: "Resultado", content: ["ficha_id | puesto | nombre | promedio | pct_asistencia", ...SQL_RESULT.map(r => `${r.ficha_id} | ${r.puesto} | ${r.nombre} | ${r.promedio.toFixed(1)} | ${r.pct_asistencia === null ? "NULL" : r.pct_asistencia.toFixed(1)}`)].join("\n") } }
  ],
  interactiveHtml: `
      <div class="sql-interactive-demo" style="font-family:var(--font-sans);">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap; border-bottom:1px solid var(--border-light); padding-bottom:0.5rem; margin-bottom:0.75rem;">
          <h4 style="margin:0; color:var(--color-primary);">🗄️ Reporte mensual por ficha</h4>
          <span class="badge badge-success">5 filas esperadas</span>
        </div>
        <pre style="background:#1e1e1e; color:#d4d4d4; padding:0.85rem; border-radius:6px; font-size:0.76rem; overflow-x:auto; white-space:pre; margin:0 0 0.75rem 0;"><code>${SQL_REFERENCE}</code></pre>
        ${canvasTable(["ficha_id", "puesto", "nombre", "promedio", "pct_asistencia"], SQL_RESULT_ROWS, ' style="font-size:0.8rem;"')}
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "Reporte mensual por ficha · PostgreSQL" },
      { type: "code", lines: SQL_REFERENCE.split("\n") },
      { type: "subheading", text: "Resultado esperado con la muestra" },
      { type: "table", headers: ["ficha_id", "puesto", "nombre", "promedio", "pct_asistencia"], rows: SQL_RESULT_ROWS }
    ]
  },
  insightsHtml: canvasInsight("🧪 Una muestra pequeña con un caso difícil", "Sara no tiene registros de asistencia. Si la consulta usa JOIN en vez de LEFT JOIN, Sara desaparece; si no protege la división, falla. La tabla esperada lo delata.") +
    canvasInsight("⏱️ El rendimiento se mide, no se promete", "Ejecuta EXPLAIN ANALYZE en tu base con datos reales antes y después del índice. El simulador no inventa tiempos de ejecución."),
  variationTip: "En el chat escribe: «Convierte la consulta en una vista materializada y dime con qué sentencia se refresca sin bloquear las lecturas»."
};

// =====================================================================
// 10. Informes y auditoría: dictamen técnico
// =====================================================================
const FINDINGS = [
  { ref: "INF-1, p. 12", source: "Interventoría técnica", factor: "Tokens JWT sin expiración ni revocación", impact: "Alto", probability: "Media", text: "Los tokens JWT de acceso no expiran y no existe un mecanismo de revocación." },
  { ref: "INF-2, p. 31", source: "Rendimiento", factor: "Bitácora de auditoría sin índices", impact: "Medio", probability: "Media", text: "La tabla bitacora_auditoria tiene 2,1 millones de filas sin índices; la consulta de auditoría tarda 6,8 s." },
  { ref: "INF-3, p. 7", source: "Protección de datos", factor: "Aviso de privacidad (Ley 1581 de 2012)", impact: "Medio", probability: "Baja", text: "La autorización de tratamiento de datos está implementada; falta publicar el aviso de privacidad en el formulario de inscripción." }
].map(f => ({ ...f, risk: canvasRiskLevel(f.impact, f.probability) }));
const REPORT_DECISION = canvasReportDecision(FINDINGS);
const riskCell = f => `${CANVAS_RISK_SCALE[f.impact]} × ${CANVAS_RISK_SCALE[f.probability]} = ${f.risk.score} · ${f.risk.color}`;

const EXECUTIVE_REPORT = {
  name: "10. Informes & Auditoría",
  docIcon: "⚖️",
  docTitle: "Dictamen_Tecnico_CT-2026-014.pdf",
  image: "assets/images/canvas/canvas_informe.jpg",
  promptParts: {
    role: "auditor de sistemas que redacta dictámenes para comités directivos",
    context: "El comité directivo decide el lunes si libera el pago final del contrato. Necesita un dictamen de una página basado solo en los extractos de los informes.",
    data: `Contrato: CT-2026-014, plataforma de gestión académica (datos de práctica).
Fecha de corte: 30 de octubre de 2026.
Avance certificado por la interventoría: 94 %.
Pagos: 80 % desembolsado; 20 % final pendiente.

Extractos de los informes:
${FINDINGS.map(f => `[${f.ref}] ${f.source}: ${f.text} Impacto: ${f.impact}. Probabilidad: ${f.probability}.`).join("\n")}

Regla del semáforo: Bajo o Baja = 1; Medio o Media = 2; Alto o Alta = 3. Puntaje = impacto × probabilidad. De 1 a 2: VERDE; de 3 a 4: ÁMBAR; de 6 a 9: ROJO.
Regla de decisión: si hay al menos un riesgo ROJO, el pago final queda retenido hasta que se subsane; si no, se aprueba con observaciones.
Plazo de subsanación: 10 días hábiles desde la notificación.`,
    instruction: "En Canvas, redacta el dictamen técnico con:",
    task: [
      "Encabezado con el contrato, el objeto, la fecha de corte, el avance certificado y el estado de los pagos.",
      "Síntesis en tres párrafos cortos: cumplimiento general, hallazgos y decisión.",
      "Matriz de riesgos con las columnas Hallazgo, Fuente, Impacto, Probabilidad, Puntaje y Semáforo, calculada con la regla de los datos.",
      "Decisión y plazo de subsanación según la regla de decisión, con una acción recomendada por hallazgo."
    ],
    constraints: [
      "Usa solo los hechos de los extractos, cita la fuente de cada uno (por ejemplo [INF-1, p. 12]) y presenta las acciones como recomendaciones.",
      "Calcula la matriz antes de redactar la síntesis: los colores que mencione la síntesis deben coincidir con la matriz.",
      "Escribe los porcentajes como texto normal (94 %), sin notación matemática, y no pases de una página (unas 450 palabras)."
    ],
    format: "Documento formal en español de Colombia, con la matriz en una tabla."
  },
  expected: [
    { criterion: "El encabezado dice CT-2026-014, 30 de octubre de 2026, avance del 94 % y pagos: 80 % desembolsado y 20 % pendiente, con el signo % visible.", how: "Lee el encabezado; si ves «94» sin «%», Gemini usó notación matemática y debes pedirle que la quite." },
    { criterion: "La síntesis menciona los mismos colores que la matriz: 1 ROJO, 1 ÁMBAR y 1 VERDE.", how: "Compara el segundo y el tercer párrafo de la síntesis con la columna Semáforo." },
    { criterion: `La matriz tiene 3 filas: ${FINDINGS.map(f => `${f.factor} = ${riskCell(f)}`).join("; ")}.`, how: "Recalcula cada puntaje con la regla del semáforo." },
    { criterion: `Cada hallazgo cita su fuente: ${FINDINGS.map(f => `[${f.ref}]`).join(", ")}.`, how: "Busca «INF-» con Ctrl+F; deben aparecer las tres fuentes." },
    { criterion: `La decisión aplica la regla: ${REPORT_DECISION}`, how: "Lee el último párrafo y la sección de decisión." },
    { criterion: "No aparecen hechos que no estén en los extractos (otras tecnologías, cifras, normas o fechas).", how: "Subraya cada cifra del dictamen y búscala en los datos." },
    { criterion: "Cabe en una página: unas 450 palabras o menos.", how: "Exporta a Google Docs y revisa el número de páginas." }
  ],
  aiResponse: "Redacté el dictamen en el Canvas a partir de los tres extractos: encabezado del contrato, síntesis, matriz de riesgos calculada con la regla del semáforo y la decisión sobre el pago final con su plazo.",
  quickActions: [
    { id: "act-rep-rule", label: "⚖️ Ver regla del semáforo", modal: { title: "Cálculo del semáforo de cada hallazgo", badge: "Regla", content: FINDINGS.map(f => `[${f.ref}] ${f.factor}\n  Impacto ${f.impact} (${CANVAS_RISK_SCALE[f.impact]}) × Probabilidad ${f.probability} (${CANVAS_RISK_SCALE[f.probability]}) = ${f.risk.score} → ${f.risk.color}`).join("\n\n") + `\n\nDecisión: ${REPORT_DECISION}` } },
    { id: "act-rep-drive", label: "📄 Exportar a Google Docs", class: "btn-docs", toast: "📄 En Gemini, este botón crea el dictamen en tu Google Drive para revisar que quepa en una página." }
  ],
  interactiveHtml: `
      <div class="report-interactive-demo" style="font-family:var(--font-sans);">
        <div style="border-bottom:2px solid var(--color-primary); padding-bottom:0.5rem; margin-bottom:0.75rem;">
          <h4 style="margin:0; color:var(--color-primary);">DICTAMEN TÉCNICO · CONTRATO CT-2026-014</h4>
          <small style="color:var(--text-muted);">Plataforma de gestión académica · Corte: 30 de octubre de 2026 · Avance certificado: 94 % · Pagos: 80 % desembolsado, 20 % pendiente</small>
        </div>
        <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:6px; margin-bottom:0.75rem; font-size:0.83rem;">
          <strong>Síntesis:</strong>
          <p style="margin:0.25rem 0 0 0;">La interventoría certifica un avance del 94 %. Los informes reportan tres hallazgos: uno ROJO por la falta de expiración de los tokens JWT [INF-1, p. 12], uno ÁMBAR por la bitácora sin índices [INF-2, p. 31] y uno VERDE por el aviso de privacidad pendiente [INF-3, p. 7].</p>
        </div>
        <h5 style="margin:0.5rem 0 0.35rem 0; font-size:0.85rem;">Matriz de riesgos</h5>
        ${canvasTable(["Hallazgo", "Fuente", "Impacto", "Probabilidad", "Puntaje", "Semáforo"], FINDINGS.map(f => [f.factor, f.ref, f.impact, f.probability, String(f.risk.score), canvasStatusBadge(f.risk.color)]), ' style="font-size:0.76rem;"')}
        <p style="font-size:0.84rem; margin:0.75rem 0 0 0;"><strong>Decisión:</strong> ${REPORT_DECISION}</p>
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "DICTAMEN TÉCNICO · CONTRATO CT-2026-014" },
      { type: "paragraph", text: "Corte: 30 de octubre de 2026 · Avance certificado: 94 % · Pagos: 80 % desembolsado, 20 % pendiente." },
      { type: "callout", title: "Síntesis", text: "Tres hallazgos: tokens JWT sin expiración [INF-1, p. 12], bitácora sin índices [INF-2, p. 31] y aviso de privacidad pendiente [INF-3, p. 7]." },
      { type: "table", headers: ["Hallazgo", "Fuente", "Impacto", "Probabilidad", "Puntaje", "Semáforo"], rows: FINDINGS.map(f => [f.factor, f.ref, f.impact, f.probability, String(f.risk.score), f.risk.color]) },
      { type: "callout", title: "Decisión", text: REPORT_DECISION }
    ]
  },
  insightsHtml: canvasInsight("⚖️ Un dictamen solo vale lo que sus fuentes", "Gemini no puede resumir informes que no recibe. Con los extractos y sus páginas dentro del prompt, cada afirmación del dictamen se puede rastrear hasta [INF-x, p. y].") +
    canvasInsight("🚦 Una regla, un único semáforo", "Al definir impacto × probabilidad y los rangos de color, el riesgo de los tokens JWT siempre da 6 (ROJO). Sin la regla, cada ejecución podría colorearlo distinto."),
  variationTip: "En el chat escribe: «Redacta un correo de cinco líneas para el director con la decisión y el plazo, citando las tres fuentes»."
};

// =====================================================================
// 11. Visión Multimodal: de boceto a Canvas en vivo
// =====================================================================
const MULTIMODAL_VISION = {
  name: "11. Visión Multimodal",
  docIcon: "📷",
  docTitle: "Prototipo_Matricula_Boceto_a_Web.html",
  image: "assets/images/canvas/canvas_multimodal_sketch.jpg",
  promptParts: {
    role: "desarrollador frontend con experiencia en visión artificial e interfaces accesibles",
    context: "El equipo docente dibujó a mano en una libreta de apuntes el wireframe del formulario de matrícula de aprendices para la convocatoria 2026. Se requiere que Gemini analice la fotografía del boceto manuscrito y genere directamente en Canvas el artefacto web ejecutable y reactivo.",
    data: `FOTOGRAFÍA ADJUNTA: Boceto a lápiz en libreta de apuntes (datos de práctica)
Título del boceto: Formulario de Inscripción y Matrícula · Convocatoria 2026
Campos dibujados a lápiz:
1. Nombre Completo del Aprendiz: campo de texto obligatorio (mínimo 3 caracteres).
2. Correo Institucional: campo de correo con anotación a mano: "Solo correos @soy.sena.edu.co o @sena.edu.co".
3. Contraseña de Acceso: campo password con anotación: "Mínimo 8 caracteres, incluir números y símbolos".
4. Indicador de seguridad: barra dibujada con tres segmentos (Débil, Media, Segura).
5. Botón principal tipo píldora rotulado a mano: [Completar Registro Formativo].

Paleta institucional anotada al margen: Verde Salvia (#2D5A4C) para el botón primario y acentos, fondo suave (#F8FAF9), texto pizarra (#1E293B) y borde (#CBD5E1).`,
    instruction: "En Canvas, genera una sola página HTML ejecutable (HTML5, CSS y JavaScript nativo sin dependencias externas) que traduzca fielmente el boceto manuscrito con:",
    task: [
      "El formulario completo con sus 3 campos accesibles (<label> y aria-describedby) y el botón primario con la paleta Verde Salvia #2D5A4C.",
      "Validación reactiva en tiempo real del correo institucional: mensaje verde si contiene @soy.sena.edu.co o @sena.edu.co, y advertencia ámbar en caso contrario.",
      "Medidor dinámico de seguridad de contraseña con barra de progreso que cambie de color (rojo < 50 %, ámbar 50-79 %, verde ≥ 80 %) según longitud, números y caracteres especiales.",
      "Manejo del evento submit sin recargar la página, mostrando una confirmación accesible con el nombre del aprendiz registrado."
    ],
    constraints: [
      "Cero librerías externas o frameworks: todo debe funcionar de manera nativa e inmediata en la vista previa de Canvas.",
      "Conserva exactamente los textos, dominios y reglas anotados en el boceto a lápiz.",
      "Garantiza contraste WCAG 2.2 nivel AA para todos los elementos interactivos y textos."
    ],
    format: "Un único archivo HTML con estilos CSS embebidos, JavaScript reactivo nativo y comentarios breves en español de Colombia."
  },
  expected: [
    { criterion: "El formulario tiene los 3 campos del boceto: Nombre Completo, Correo Institucional y Contraseña de Acceso.", how: "Abre la vista previa del Canvas y verifica los campos." },
    { criterion: "El botón principal dice «Completar Registro Formativo» y usa el color Verde Salvia #2D5A4C.", how: "Inspecciona el botón en la vista previa o en el código CSS." },
    { criterion: "Al escribir un correo con @soy.sena.edu.co aparece la validación positiva en verde; con otro dominio muestra la advertencia.", how: "Escribe un correo de prueba en el formulario interactivo." },
    { criterion: "La barra de contraseña avanza y cambia de color al combinar letras, números y símbolos.", how: "Ingresa contraseñas de distinta longitud en la vista previa." },
    { criterion: "Al enviar el formulario con datos válidos no se recarga la página y se muestra la confirmación de bienvenida.", how: "Haz clic en el botón de registro con los datos completos." },
    { criterion: "El código no contiene etiquetas <script src=...> ni imports externos.", how: "Pasa a la vista de código del Canvas y busca enlaces a CDN." }
  ],
  aiResponse: "Analicé el boceto manuscrito de la libreta y generé en Canvas el formulario web ejecutable con validación reactiva de correo institucional, indicador dinámico de contraseña y la paleta Verde Salvia.",
  quickActions: [
    { id: "act-mm-preview", label: "▶ Vista previa en vivo", toast: "▶ Ejecutando prototipo web reactivo en la vista previa de Canvas." },
    { id: "act-mm-ocr", label: "🔍 Ver inferencia OCR", modal: { title: "Detección de elementos manuscritos (OCR Espacial)", badge: "Visión", content: "1. Título manuscrito: «Formulario de Inscripción y Matrícula · Convocatoria 2026»\n2. Campos detectados: Nombre Completo, Correo Institucional y Contraseña\n3. Regla de correo: «Solo correos @soy.sena.edu.co o @sena.edu.co»\n4. Barra de seguridad: Segmentos Débil, Media, Segura\n5. Botón rotulado: [Completar Registro Formativo]\n6. Paleta detectada: Verde Salvia #2D5A4C, fondo #F8FAF9, texto #1E293B" } },
    { id: "act-mm-code", label: "💻 Ver código HTML", toast: "💻 Código HTML5 nativo listo para exportar o desplegar." }
  ],
  interactiveHtml: `
      <div class="multimodal-interactive-demo" style="font-family:var(--font-sans);">
        <div style="border-bottom:2px solid var(--color-primary); padding-bottom:0.5rem; margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; color:var(--color-primary);">📷 Formulario Generado desde Boceto en Libreta</h4>
          <span class="badge badge-success">Vista previa en vivo</span>
        </div>
        <p style="font-size:0.82rem; color:var(--text-muted); margin:0 0 0.75rem 0;">Wireframe traducido a HTML5 reactivo con validación institucional y medidor dinámico.</p>
        <form id="demo-mm-form" onsubmit="event.preventDefault(); const res = document.getElementById('demo-mm-result'); const nom = document.getElementById('demo-mm-name').value; res.style.display='block'; res.innerHTML='✓ ¡Registro formativo exitoso para ' + (nom || 'Aprendiz') + '!'; return false;" style="background:var(--bg-subtle); padding:1rem; border-radius:8px; border:1px solid var(--border-light);">
          <div style="margin-bottom:0.65rem;">
            <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.25rem;">Nombre Completo del Aprendiz</label>
            <input type="text" id="demo-mm-name" required minlength="3" placeholder="Ej. Carlos Andrés Gómez" style="width:100%; padding:0.45rem 0.65rem; font-size:0.85rem; border:1px solid var(--border-light); border-radius:4px; background:var(--bg-app); color:var(--text-main);">
          </div>
          <div style="margin-bottom:0.65rem;">
            <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.25rem;">Correo Institucional (@soy.sena.edu.co o @sena.edu.co)</label>
            <input type="email" id="demo-mm-email" placeholder="aprendiz@soy.sena.edu.co" oninput="const ok = /^[a-zA-Z0-9._%+-]+@(soy\\.)?sena\\.edu\\.co$/.test(this.value); const msg = document.getElementById('demo-mm-email-feedback'); if(!this.value){msg.textContent='';}else if(ok){msg.style.color='var(--color-primary, #2D5A4C)'; msg.textContent='✓ Dominio institucional válido';}else{msg.style.color='#b45309'; msg.textContent='⚠️ Solo correos @soy.sena.edu.co o @sena.edu.co';}" style="width:100%; padding:0.45rem 0.65rem; font-size:0.85rem; border:1px solid var(--border-light); border-radius:4px; background:var(--bg-app); color:var(--text-main);">
            <small id="demo-mm-email-feedback" style="display:block; font-size:0.75rem; margin-top:0.2rem; font-weight:600;"></small>
          </div>
          <div style="margin-bottom:0.75rem;">
            <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.25rem;">Contraseña de Acceso</label>
            <input type="password" id="demo-mm-pass" placeholder="Mínimo 8 caracteres" oninput="const v=this.value; let s=0; if(v.length>=8)s+=35; if(/[0-9]/.test(v))s+=35; if(/[^a-zA-Z0-9]/.test(v))s+=30; const b=document.getElementById('demo-mm-pass-bar'); const t=document.getElementById('demo-mm-pass-text'); b.style.width=s+'%'; if(s<50){b.style.background='#dc2626'; t.textContent='Débil ('+s+'%)'; t.style.color='#dc2626';}else if(s<80){b.style.background='#f59e0b'; t.textContent='Media ('+s+'%)'; t.style.color='#f59e0b';}else{b.style.background='var(--color-primary, #2D5A4C)'; t.textContent='Segura ('+s+'%)'; t.style.color='var(--color-primary, #2D5A4C)';}" style="width:100%; padding:0.45rem 0.65rem; font-size:0.85rem; border:1px solid var(--border-light); border-radius:4px; background:var(--bg-app); color:var(--text-main);">
            <div style="height:6px; background:#e2e8f0; border-radius:3px; margin-top:0.35rem; overflow:hidden;">
              <div id="demo-mm-pass-bar" style="height:100%; width:0%; transition:width 0.3s, background 0.3s;"></div>
            </div>
            <small id="demo-mm-pass-text" style="display:block; font-size:0.75rem; margin-top:0.2rem;"></small>
          </div>
          <button type="submit" style="background:#2D5A4C; color:#ffffff; border:none; padding:0.55rem 1.25rem; font-size:0.85rem; font-weight:600; border-radius:20px; cursor:pointer; width:100%;">Completar Registro Formativo</button>
        </form>
        <div id="demo-mm-result" style="display:none; margin-top:0.75rem; padding:0.65rem; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-size:0.83rem; border-radius:6px; font-weight:600;"></div>
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "Formulario de Inscripción y Matrícula · Convocatoria 2026" },
      { type: "paragraph", text: "Prototipo web generado desde boceto manuscrito en libreta." },
      { type: "callout", title: "Validación de Correo", text: "Dominios permitidos: @soy.sena.edu.co y @sena.edu.co" },
      { type: "table", headers: ["Campo", "Tipo", "Regla de Validación", "Estado"], rows: [
        ["Nombre Completo", "text", "Mínimo 3 caracteres", "Requerido"],
        ["Correo Institucional", "email", "Dominios institucionales SENA", "En tiempo real"],
        ["Contraseña de Acceso", "password", "Mínimo 8 caracteres con símbolos y números", "Medidor activo"]
      ]},
      { type: "callout", title: "Paleta Institucional", text: "Botón primario Verde Salvia (#2D5A4C) · Contraste WCAG 2.2 AA" }
    ]
  },
  insightsHtml: canvasInsight("📷 De boceto a código interactivo", "Gemini Vision analiza la disposición espacial de los trazos a mano alzada, deduce campos y etiquetas, y genera la estructura HTML con validaciones reactivas en JavaScript sin librerías externas.") +
    canvasInsight("🔒 Validación institucional en el cliente", "El código generado aplica expresiones regulares para admitir exclusivamente correos con dominio @soy.sena.edu.co o @sena.edu.co y calcula el nivel de contraseña en vivo."),
  variationTip: "En el chat del Canvas escribe: «Agrega un campo selector para elegir la sede de formación y haz que el botón se deshabilite hasta que la contraseña sea Segura»."
};

// =====================================================================
// 12. Gem Studio para Canvas: coescritor especializado
// =====================================================================
const GEM_STUDIO = {
  name: "12. Gem Studio para Canvas",
  docIcon: "🤖",
  docTitle: "Asistente_Coescritura_Canvas.gem",
  image: "assets/images/canvas/canvas_gem_studio.jpg",
  promptParts: {
    role: "arquitecto de inteligencia artificial y diseñador de asistentes personalizados (Gemini Gems)",
    context: "La coordinación académica del centro requiere configurar un Gem especializado (asistente a medida) que actúe como coescritor pedagógico dentro de Gemini Canvas. El Gem debe asistir a los instructores en la redacción de guías de aprendizaje y rúbricas técnicas sin escribir el trabajo por ellos, aplicando el método socrático y las normas institucionales.",
    data: `ESPECIFICACIÓN DEL GEM: Coescritor Pedagógico de Guías Técnicas ADSO
Propósito: Asistir a instructores y aprendices en la estructuración de guías de aprendizaje en Canvas.
Guardrails obligatorios (Restricciones del System Prompt):
1. Método socrático: cuando el usuario pida una solución completa, formula preguntas guía en lugar de dar el producto terminado.
2. Alineación curricular: referenciar siempre resultados de aprendizaje (RAP) y competencias del programa ADSO.
3. Tono y estilo: redacción en español de Colombia (es-CO), respetuoso, claro y técnico; cero uso de extranjerismos o términos ajenos (usar siempre "Portafolio de Evidencias").
4. Estructura de salida en Canvas: organizar todo artefacto técnico en 4 secciones canónicas: 1) Identificación, 2) Planteamiento didáctico, 3) Criterios observables de evaluación, 4) Tareas de verificación.
Temperatura configurada: 0.2 (rigor pedagógico determinista).`,
    instruction: "En Canvas, redacta la ficha técnica y de configuración completa del Gem en un documento formal con:",
    task: [
      "El System Prompt exhaustivo listo para copiar y pegar en la configuración de Gemini Gems, estructurado con Rol, Misión, Guardrails y Ejemplos de Interacción (Few-shot).",
      "Una matriz de prueba con 3 casos de calibración (Pregunta del usuario | Respuesta incorrecta del Gem | Respuesta esperada conforme a guardrails).",
      "El protocolo de interacción en vivo dentro de Canvas: cómo debe comportarse el Gem al refinar textos seleccionados con el cursor.",
      "La lista de verificación de cumplimiento de políticas pedagógicas e institucionales para autorizar la publicación del Gem."
    ],
    constraints: [
      "El System Prompt debe exigir el uso obligatorio de «Portafolio de Evidencias» erradicando cualquier extranjerismo o término no institucional en todo el texto.",
      "No uses nombres de modelos comerciales ni enlaces externos no institucionales.",
      "Redacta en español de Colombia con lenguaje técnico accesible y riguroso."
    ],
    format: "Documento técnico con títulos numerados, bloques de texto de sistema destacados y dos tablas comparativas."
  },
  expected: [
    { criterion: "El documento contiene el System Prompt completo para configurar el Gem en la interfaz de Gemini Gems.", how: "Revisa la sección 1 del Canvas." },
    { criterion: "El System Prompt exige el uso obligatorio de «Portafolio de Evidencias» como único término institucional válido.", how: "Busca «Portafolio de Evidencias» con Ctrl+F en el Canvas." },
    { criterion: "La matriz de calibración incluye 3 casos de prueba con respuesta esperada socrática.", how: "Cuenta las filas de la tabla de calibración." },
    { criterion: "Se define el comportamiento del Gem para la edición por selección con cursor dentro de Canvas.", how: "Lee la sección de protocolo de interacción en Canvas." },
    { criterion: "La lista de verificación contiene al menos 4 puntos de auditoría pedagógica antes de publicar el Gem.", how: "Revisa la lista de chequeo al final del documento." }
  ],
  aiResponse: "Redacté en Canvas la especificación y el System Prompt del Gem Coescritor Pedagógico, con sus guardrails socráticos, la matriz de calibración de 3 casos y las directrices para refinar textos en el lienzo.",
  quickActions: [
    { id: "act-gem-prompt", label: "📋 Copiar System Prompt", toast: "📋 System Prompt del Gem copiado al portapapeles." },
    { id: "act-gem-test", label: "💬 Probar en Consola", toast: "💬 Abriendo entorno de prueba del Gem en la consola interactiva." },
    { id: "act-gem-export", label: "📄 Exportar a Google Docs", class: "btn-docs", toast: "📄 Creando ficha técnica del Gem en Google Drive para revisión institucional." }
  ],
  interactiveHtml: `
      <div class="gem-studio-interactive-demo" style="font-family:var(--font-sans);">
        <div style="border-bottom:2px solid var(--color-primary); padding-bottom:0.5rem; margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; color:var(--color-primary);">🤖 Consola de Calibración de Gem Studio</h4>
          <span class="badge badge-success">Temperatura: 0.2</span>
        </div>
        <div style="margin-bottom:0.75rem;">
          <small style="color:var(--text-muted); display:block; margin-bottom:0.25rem;">Cargar preajuste de calibración:</small>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('demo-gem-input').value='Escríbeme el código completo del taller de POO';">1. Solicitud directa</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('demo-gem-input').value='Califica esta función de cálculo sin dar retroalimentación';">2. Rúbrica</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('demo-gem-input').value='¿Dónde subo el archivo final de evidencias?';">3. Portafolio</button>
          </div>
        </div>
        <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:6px; border:1px solid var(--border-light); margin-bottom:0.75rem;">
          <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.25rem;">Prueba en vivo contra los Guardrails del Gem:</label>
          <div style="display:flex; gap:0.5rem;">
            <input type="text" id="demo-gem-input" placeholder="Escribe o selecciona un caso de prueba..." style="flex:1; padding:0.45rem 0.65rem; font-size:0.85rem; border:1px solid var(--border-light); border-radius:4px; background:var(--bg-app); color:var(--text-main);">
            <button type="button" class="btn btn-primary btn-sm" onclick="const v=document.getElementById('demo-gem-input').value; const r=document.getElementById('demo-gem-response'); r.style.display='block'; if(/archivo final|carpeta personal/i.test(v)){r.innerHTML='<strong>Guardrail Institucional Activado:</strong><br>En la institución utilizamos exclusivamente el término canónico <em>«Portafolio de Evidencias»</em>. ¿Deseas que revisemos los 4 entregables que deben conformarlo?';}else if(/código completo|taller/i.test(v)){r.innerHTML='<strong>Método Socrático Activado:</strong><br>En lugar de darte el código completo, razonemos juntos: ¿cuáles son los atributos principales que identificaste en el diagrama de clases y qué responsabilidad tiene cada método?';}else{r.innerHTML='<strong>Respuesta Socrática del Gem:</strong><br>Para orientarte con rigor en Canvas: ¿cuál es el resultado de aprendizaje (RAP) al que apunta esta actividad y qué criterio observable evaluaremos?';}">Evaluar</button>
          </div>
        </div>
        <div id="demo-gem-response" style="display:none; padding:0.75rem; background:#f0fdf4; border-left:3px solid var(--color-primary); color:var(--text-main); font-size:0.83rem; border-radius:4px;"></div>
      </div>`,
  imageSpec: {
    blocks: [
      { type: "heading", text: "FICHA TÉCNICA · GEM COESCRITOR PEDAGÓGICO ADSO" },
      { type: "paragraph", text: "Configuración de asistente a medida (Gem) para coescritura socrática en Gemini Canvas." },
      { type: "callout", title: "Guardrails del System Prompt", text: "Método socrático activo · Rigor curricular ADSO · Portafolio de Evidencias obligatorio · Temperatura: 0.2" },
      { type: "table", headers: ["Caso de Calibración", "Entrada del Usuario", "Respuesta Bloqueada", "Respuesta Socrática Esperada"], rows: [
        ["1. Solicitud directa", "Escríbeme el código completo del taller", "Entrega de solución copiable", "Formula 2 preguntas orientadoras sobre el diagrama de clases"],
        ["2. Rúbrica evaluativa", "Califica este ejercicio sin justificar", "Nota numérica sin detalle", "Desglosa puntaje por criterio observable y sugiere mejoras"],
        ["3. Portafolio formativo", "Adjunta el archivo al registro personal", "Uso de término no institucional", "Corrige a Portafolio de Evidencias y valida estructura"]
      ]},
      { type: "callout", title: "Protocolo Canvas", text: "Al seleccionar texto en el lienzo, sugiere mejoras de redacción conservando la voz del instructor." }
    ]
  },
  insightsHtml: canvasInsight("🤖 Coescritura asistida con Gems", "Configurar un Gem personalizado permite que Gemini actúe con un rol especializado dentro de Canvas, aplicando reglas de pedagogía activa como el método socrático y garantizando la terminología institucional.") +
    canvasInsight("🛡️ Blindaje de guardrails e integridad", "El System Prompt delimita estrictamente lo que el asistente puede y no puede hacer, forzando la evaluación formativa y garantizando el uso canónico de «Portafolio de Evidencias»."),
  variationTip: "En el chat del Canvas escribe: «Añade una regla al System Prompt para que cuando el usuario pida ayuda con bases de datos relacionales, exija siempre diagramas entidad-relación en Mermaid»."
};

// --- Registro de los 12 modos en el orden del simulador ---
const CANVAS_POSSIBILITIES = {
  "doc-editorial": DOC_EDITORIAL,
  "code-prototyping": CODE_PROTOTYPING,
  "data-matrix": DATA_MATRIX,
  "flowchart-diagram": FLOWCHART_DIAGRAM,
  "visual-mockup": VISUAL_MOCKUP,
  "inline-prompting": INLINE_PROMPTING,
  "algorithm-refactor": ALGORITHM_REFACTOR,
  "rubric-curriculum": RUBRIC_CURRICULUM,
  "sql-pipeline": SQL_PIPELINE,
  "executive-report": EXECUTIVE_REPORT,
  "multimodal-vision": MULTIMODAL_VISION,
  "gem-studio": GEM_STUDIO
};

Object.values(CANVAS_POSSIBILITIES).forEach(p => {
  p.userPrompt = canvasKit.composeCanvasPrompt(p.promptParts);
  p.imageCaption = CANVAS_IMAGE_CAPTION;
  p.imageSpec.file = p.image.split("/").pop();
  p.imageSpec.docTitle = p.docTitle;
  p.imageSpec.chat = p.aiResponse;
});

// Actualiza la sección «possibilities» del banco JSON sin perder los campos que solo viven allí.
function exportCanvasPossibilities(bank) {
  const previous = new Map((bank.possibilities || []).map(p => [p.id, p]));
  const defaultMeta = {
    "multimodal-vision": {
      name: "Visión Multimodal (De boceto a Canvas en vivo)",
      badge: "Visión",
      objective: "Digitalizar bocetos manuscritos y trazos en pizarra directamente en artefactos web y flujogramas ejecutables en Canvas.",
      variationPrompts: [
        "En el chat del Canvas escribe: «Agrega un selector de sede y valida que el botón se deshabilite hasta que la contraseña sea Segura»."
      ]
    },
    "gem-studio": {
      name: "Gem Studio para Canvas (Asistente especializado de coescritura en Canvas)",
      badge: "Gems",
      objective: "Configurar y calibrar asistentes personalizados (Gems) con directrices socráticas y guardrails institucionales para coescribir en Canvas.",
      variationPrompts: [
        "En el chat del Canvas escribe: «Añade una regla al System Prompt para que ante dudas de bases de datos exija diagramas relacionales en Mermaid»."
      ]
    }
  };
  const entries = Object.entries(CANVAS_POSSIBILITIES);
  return {
    ...bank,
    totalPossibilities: entries.length,
    totalExercises: entries.reduce((acc, [id]) => {
      const prev = previous.get(id);
      const exCount = (prev && prev.exercises && prev.exercises.length) || (canvasKit.CANVAS_EXERCISES && canvasKit.CANVAS_EXERCISES[id] && canvasKit.CANVAS_EXERCISES[id].length) || 0;
      return acc + exCount;
    }, 0),
    possibilities: entries.map(([id, p], i) => {
      const prev = previous.get(id) || defaultMeta[id] || {};
      const exercises = prev.exercises || (canvasKit.CANVAS_EXERCISES && canvasKit.CANVAS_EXERCISES[id] ? canvasKit.CANVAS_EXERCISES[id].map(ex => ({
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
      })) : []);
      return {
        ...prev,
        id,
        number: String(i + 1),
        icon: p.docIcon,
        image: p.image,
        imageCaption: p.imageCaption,
        canvasControls: p.quickActions.map(a => a.label),
        masterPrompt: p.userPrompt,
        expectedResultSummary: p.expected.map(x => x.criterion).join(" "),
        expected: p.expected,
        followUps: p.followUps || [],
        imageSpec: p.imageSpec,
        exercises
      };
    })
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CANVAS_POSSIBILITIES,
    canvasRound,
    canvasFormatNumber,
    canvasFormatCop,
    canvasSum,
    canvasAverage,
    canvasWeightedScore,
    canvasMatrixStatus,
    canvasContrastRatio,
    canvasWcagLevel,
    canvasRiskLevel,
    canvasReportDecision,
    canvasLearnerStatus,
    canvasClassifyDeliveries,
    canvasSqlRanking,
    canvasRubricLevel,
    canvasMermaidFlow,
    buildCanvasChecklistHtml,
    buildCanvasFollowUpsHtml,
    exportCanvasPossibilities
  };
}
