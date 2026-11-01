// Ejercicios prácticos de Gemini Canvas Lab: dos por cada modo del simulador.
// Cada ejercicio define su prompt por partes (fórmula R-C-I-R-F + datos), pasos dentro de Canvas,
// criterios verificables y una vista previa SVG generada con los mismos datos.

// --- Generadores de vistas previas SVG (offline, sin dependencias) ---
function canvasSvgFrame(label, inner) {
  return `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}"><rect class="cx-bg" x="0" y="0" width="320" height="180" rx="10"/>${inner}</svg>`;
}

function canvasSvgBars(label, title, labels, values, highlight) {
  const max = Math.max(...values);
  const slot = 280 / values.length;
  const bars = values.map((v, i) => {
    const h = Math.round((v / max) * 110);
    const x = 24 + i * slot + slot * 0.15;
    const w = slot * 0.7;
    const cls = i === highlight ? "cx-a" : "cx-p";
    return `<rect class="${cls}" x="${x.toFixed(1)}" y="${150 - h}" width="${w.toFixed(1)}" height="${h}" rx="3"/>` +
      `<text class="cx-m" x="${(x + w / 2).toFixed(1)}" y="166" font-size="8" text-anchor="middle">${labels[i]}</text>` +
      `<text class="cx-t" x="${(x + w / 2).toFixed(1)}" y="${146 - h}" font-size="7.5" text-anchor="middle">${v}</text>`;
  }).join("");
  return canvasSvgFrame(label, `<text class="cx-t" x="16" y="20" font-size="11" font-weight="700">${title}</text><line class="cx-ln" x1="20" y1="150" x2="304" y2="150"/>${bars}`);
}

function canvasSvgLine(label, title, labels, series) {
  const all = series.flatMap(s => s.values);
  const max = Math.max(...all);
  const step = 270 / (labels.length - 1);
  const lines = series.map(s => {
    const pts = s.values.map((v, i) => `${(30 + i * step).toFixed(1)},${(150 - (v / max) * 110).toFixed(1)}`).join(" ");
    const dots = s.values.map((v, i) => `<circle class="${s.cls}" cx="${(30 + i * step).toFixed(1)}" cy="${(150 - (v / max) * 110).toFixed(1)}" r="2.6"/>`).join("");
    return `<polyline class="cx-stroke ${s.cls}-s" fill="none" stroke-width="2.4" points="${pts}"/>${dots}`;
  }).join("");
  const ticks = labels.map((l, i) => `<text class="cx-m" x="${(30 + i * step).toFixed(1)}" y="166" font-size="8" text-anchor="middle">${l}</text>`).join("");
  const legendX = 320 - series.length * 64;
  const legend = series.map((s, i) => `<rect class="${s.cls}" x="${legendX + i * 64}" y="12" width="9" height="9" rx="2"/><text class="cx-m" x="${legendX + 12 + i * 64}" y="20" font-size="8">${s.name}</text>`).join("");
  return canvasSvgFrame(label, `<text class="cx-t" x="16" y="20" font-size="11" font-weight="700">${title}</text>${legend}<line class="cx-ln" x1="24" y1="150" x2="306" y2="150"/>${lines}${ticks}`);
}

function canvasSvgDonut(label, title, segments, center) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = 46;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map(s => {
    const len = (s.value / total) * c;
    const arc = `<circle class="${s.cls}-s" cx="88" cy="100" r="${r}" fill="none" stroke-width="20" stroke-dasharray="${len.toFixed(2)} ${(c - len).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 88 100)"/>`;
    offset += len;
    return arc;
  }).join("");
  const legend = segments.map((s, i) => `<rect class="${s.cls}" x="166" y="${46 + i * 18}" width="10" height="10" rx="2"/><text class="cx-t" x="182" y="${55 + i * 18}" font-size="8.5">${s.name} · ${Math.round((s.value / total) * 100)} %</text>`).join("");
  return canvasSvgFrame(label, `<text class="cx-t" x="16" y="20" font-size="11" font-weight="700">${title}</text>${arcs}<text class="cx-t" x="88" y="104" font-size="12" font-weight="700" text-anchor="middle">${center}</text>${legend}`);
}

function canvasSvgRadar(label, title, axes, series, max) {
  const cx = 110, cy = 106, R = 54;
  const point = (i, v) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
    return [cx + Math.cos(ang) * R * (v / max), cy + Math.sin(ang) * R * (v / max)];
  };
  const rings = [0.25, 0.5, 0.75, 1].map(f => `<polygon class="cx-ln" fill="none" points="${axes.map((_, i) => point(i, max * f).map(n => n.toFixed(1)).join(",")).join(" ")}"/>`).join("");
  const names = axes.map((a, i) => {
    const [x, y] = point(i, max * 1.28);
    return `<text class="cx-m" x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="7.5" text-anchor="middle">${a}</text>`;
  }).join("");
  const polys = series.map(s => `<polygon class="${s.cls} ${s.cls}-s cx-area" stroke-width="2" points="${s.values.map((v, i) => point(i, v).map(n => n.toFixed(1)).join(",")).join(" ")}"/>`).join("");
  const legend = series.map((s, i) => `<rect class="${s.cls}" x="226" y="${50 + i * 18}" width="10" height="10" rx="2"/><text class="cx-t" x="242" y="${59 + i * 18}" font-size="8.5">${s.name}</text>`).join("");
  return canvasSvgFrame(label, `<text class="cx-t" x="16" y="20" font-size="11" font-weight="700">${title}</text>${rings}${polys}${names}${legend}`);
}

function canvasSvgHeatmap(label, title, grid) {
  const cells = [];
  for (let p = 5; p >= 1; p--) {
    for (let i = 1; i <= 5; i++) {
      const score = p * i;
      const cls = score >= 15 ? "cx-d" : score >= 8 ? "cx-w" : score >= 4 ? "cx-a" : "cx-p";
      const x = 60 + (i - 1) * 30;
      const y = 30 + (5 - p) * 26;
      const n = grid[`${p}-${i}`] || 0;
      cells.push(`<rect class="${cls} cx-cell" x="${x}" y="${y}" width="28" height="24" rx="3"/>` +
        (n ? `<text class="cx-on" x="${x + 14}" y="${y + 16}" font-size="10" font-weight="700" text-anchor="middle">${n}</text>` : ""));
    }
  }
  const legend = [["cx-d", "Crítico ≥15"], ["cx-w", "Alto 8–14"], ["cx-a", "Medio 4–7"], ["cx-p", "Bajo ≤3"]]
    .map(([c, t], i) => `<rect class="${c}" x="222" y="${44 + i * 18}" width="10" height="10" rx="2"/><text class="cx-t" x="238" y="${53 + i * 18}" font-size="8.5">${t}</text>`).join("");
  return canvasSvgFrame(label, `<text class="cx-t" x="16" y="20" font-size="11" font-weight="700">${title}</text><text class="cx-m" x="48" y="98" font-size="8" transform="rotate(-90 48 98)" text-anchor="middle">Probabilidad</text><text class="cx-m" x="134" y="172" font-size="8" text-anchor="middle">Impacto</text>${cells.join("")}${legend}`);
}

function canvasSvgFlow(label, title, lanes) {
  const laneH = 140 / lanes.length;
  const body = lanes.map((lane, li) => {
    const y = 30 + li * laneH;
    const boxes = lane.steps.map((s, si) => {
      const x = 74 + si * 62;
      const shape = s.startsWith("¿")
        ? `<polygon class="cx-w" points="${x + 27},${y + 4} ${x + 54},${y + laneH / 2} ${x + 27},${y + laneH - 4} ${x},${y + laneH / 2}"/>`
        : `<rect class="cx-p" x="${x}" y="${y + 6}" width="54" height="${laneH - 12}" rx="5"/>`;
      const arrow = si < lane.steps.length - 1 ? `<line class="cx-ln" x1="${x + 54}" y1="${y + laneH / 2}" x2="${x + 62}" y2="${y + laneH / 2}" stroke-width="1.5"/>` : "";
      return `${shape}<text class="cx-on" x="${x + 27}" y="${y + laneH / 2 + 3}" font-size="6.5" text-anchor="middle">${s}</text>${arrow}`;
    }).join("");
    return `<rect class="cx-lane" x="12" y="${y}" width="296" height="${laneH}" /><text class="cx-t" x="18" y="${y + laneH / 2 + 3}" font-size="7.5" font-weight="700">${lane.name}</text>${boxes}`;
  }).join("");
  return canvasSvgFrame(label, `<text class="cx-t" x="16" y="20" font-size="11" font-weight="700">${title}</text>${body}`);
}

function canvasSvgMock(label, title, kind) {
  const parts = {
    landing: `<rect class="cx-p" x="16" y="30" width="288" height="18" rx="4"/><text class="cx-on" x="24" y="42" font-size="8" font-weight="700">BiblioTurnos</text><rect class="cx-lane" x="16" y="54" width="170" height="58" rx="6"/><text class="cx-t" x="24" y="72" font-size="10" font-weight="700">Reserva tu cubículo</text><text class="cx-m" x="24" y="86" font-size="7.5">Elige franja y confirma en 1 minuto</text><rect class="cx-a" x="24" y="94" width="70" height="12" rx="6"/><text class="cx-on" x="59" y="103" font-size="7" text-anchor="middle">Reservar</text>` +
      [60, 85, 40].map((v, i) => `<rect class="${v >= 80 ? "cx-d" : "cx-p"}" x="${200 + i * 34}" y="${112 - v * 0.55}" width="24" height="${v * 0.55}" rx="3"/><text class="cx-m" x="${212 + i * 34}" y="122" font-size="7" text-anchor="middle">${["8-10", "10-12", "14-16"][i]}</text>`).join("") +
      `<rect class="cx-lane" x="16" y="128" width="88" height="40" rx="6"/><rect class="cx-lane" x="116" y="128" width="88" height="40" rx="6"/><rect class="cx-lane" x="216" y="128" width="88" height="40" rx="6"/>`,
    phone: [0, 1, 2, 3].map(i => {
      const x = 14 + i * 76;
      const content = [
        `<rect class="cx-a" x="${x + 8}" y="60" width="52" height="24" rx="4"/><rect class="cx-lane" x="${x + 8}" y="90" width="52" height="10" rx="3"/><rect class="cx-lane" x="${x + 8}" y="104" width="52" height="10" rx="3"/>`,
        `<rect class="cx-lane" x="${x + 8}" y="56" width="52" height="10" rx="3"/><rect class="cx-lane" x="${x + 8}" y="70" width="52" height="24" rx="3"/><rect class="cx-p" x="${x + 8}" y="120" width="52" height="12" rx="6"/>`,
        `<rect class="cx-w" x="${x + 8}" y="56" width="30" height="9" rx="4"/><rect class="cx-lane" x="${x + 8}" y="70" width="52" height="40" rx="3"/>`,
        `<circle class="cx-p-s" cx="${x + 34}" cy="86" r="18" fill="none" stroke-width="8"/><circle class="cx-d-s" cx="${x + 34}" cy="86" r="18" fill="none" stroke-width="8" stroke-dasharray="38 75"/>`
      ][i];
      return `<rect class="cx-lane" x="${x}" y="30" width="68" height="140" rx="10"/><rect class="cx-p" x="${x + 4}" y="36" width="60" height="12" rx="4"/><text class="cx-on" x="${x + 34}" y="45" font-size="6.5" text-anchor="middle">${["Inicio", "Reportar", "Detalle", "Estadísticas"][i]}</text>${content}`;
    }).join(""),
    doc: `<rect class="cx-lane" x="40" y="28" width="240" height="144" rx="6"/>` +
      [40, 52, 64].map(y => `<rect class="cx-ln-f" x="54" y="${y}" width="${y === 64 ? 150 : 212}" height="6" rx="2"/>`).join("") +
      `<rect class="cx-a cx-sel" x="50" y="80" width="220" height="34" rx="4"/>` +
      [86, 96, 106].map(y => `<rect class="cx-on-f" x="56" y="${y}" width="${y === 106 ? 120 : 200}" height="5" rx="2"/>`).join("") +
      `<rect class="cx-p" x="200" y="118" width="74" height="16" rx="8"/><text class="cx-on" x="237" y="129" font-size="7" text-anchor="middle">Tono empático</text>` +
      [142, 154].map(y => `<rect class="cx-ln-f" x="54" y="${y}" width="200" height="6" rx="2"/>`).join(""),
    code: `<rect class="cx-code" x="16" y="30" width="180" height="140" rx="6"/>` +
      [42, 54, 66, 78, 90, 102, 114, 126, 138, 150].map((y, i) => `<rect class="${i >= 3 && i <= 6 ? "cx-a" : "cx-ln-f"}" x="${i >= 3 && i <= 6 ? 26 : 30}" y="${y}" width="${[90, 120, 60, 150, 130, 110, 60, 140, 100, 70][i]}" height="6" rx="2"/>`).join("") +
      `<rect class="cx-lane" x="204" y="30" width="100" height="140" rx="6"/><text class="cx-t" x="212" y="46" font-size="8" font-weight="700">Consola</text><text class="cx-p-t" x="212" y="62" font-size="7.5">✓ promedio = 4.1</text><text class="cx-p-t" x="212" y="76" font-size="7.5">✓ 3 pruebas OK</text>` +
      [3.8, 4.5, 4.0].map((v, i) => `<rect class="cx-p" x="${216 + i * 28}" y="${160 - v * 14}" width="18" height="${v * 14}" rx="3"/>`).join("")
  };
  return canvasSvgFrame(label, `<text class="cx-t" x="16" y="20" font-size="11" font-weight="700">${title}</text>${parts[kind]}`);
}

// --- Insumos y prompts ---
const CANVAS_EXERCISES = {};

// 1. Redacción y documentos
const IN_DESERCION = `DATOS DE DESERCIÓN 2025 — Centro de Gestión Empresarial (datos de práctica)

Trimestre,Matriculados,Desertores,Tasa
2025-T1,420,38,9.0%
2025-T2,395,31,7.8%
2025-T3,402,22,5.5%
2025-T4,388,14,3.6%

Causas reportadas en la encuesta de salida (105 desertores):
- Dificultad económica: 41
- Cruce con horario laboral: 27
- Problemas de conectividad: 19
- Salud o situación familiar: 10
- Otras causas: 8

Acciones aplicadas desde el T2:
- Apoyo de sostenimiento para 60 aprendices (desde abril).
- Franja nocturna nueva en dos programas (desde julio).
- Préstamo de 35 portátiles con módem (desde septiembre).`;

const IN_HUERTA = `PROYECTO PRODUCTIVO: HUERTA HIDROPÓNICA ESCOLAR (datos de práctica)

Equipo: 12 aprendices del programa Producción Agropecuaria Ecológica y 1 instructor líder.
Espacio: terraza de 60 m² con punto de agua y energía.
Duración: 16 semanas.
Meta de producción: 180 kg de lechuga y 40 kg de cilantro por ciclo de 8 semanas.

Presupuesto (COP):
Estructura y canales NFT,3.200.000
Bomba y temporizador,850.000
Semillas y plántulas,420.000
Solución nutritiva 12 meses,960.000
Sensores de pH y conductividad,1.150.000
Capacitación y certificación BPA,1.420.000
TOTAL,8.000.000

Cronograma:
Semanas 1-3: diseño e instalación de la estructura.
Semanas 4-5: siembra y calibración de sensores.
Semanas 6-13: dos ciclos de cultivo con registro diario.
Semanas 14-16: venta en la feria del centro y evaluación.

Indicadores: kg cosechados, costo por kg, % de plántulas perdidas, ingresos por venta.`;

CANVAS_EXERCISES["doc-editorial"] = [
  {
    id: "doc-a-informe-desercion",
    title: "Informe de deserción con infografía automática",
    level: "Básico",
    duration: "25 min",
    canvasFeature: "Documento + menú Crear → Infografía",
    goal: "Convertir una tabla de deserción en un informe ejecutivo claro y, desde el mismo Canvas, generar una infografía visual lista para presentar al comité.",
    scenario: "La coordinación académica debe presentar el lunes cómo bajó la deserción durante 2025 y qué acciones funcionaron. Solo tienes la tabla trimestral y la encuesta de salida.",
    promptParts: {
      role: "analista de calidad educativa que prepara informes para comités directivos",
      context: "El comité académico se reúne el lunes para decidir qué acciones contra la deserción mantener en 2026. Leerá el informe en cinco minutos.",
      data: IN_DESERCION,
      instruction: "En Canvas, redacta un informe ejecutivo con:",
      task: ["Un resumen de máximo cinco líneas con la conclusión principal.", "Una tabla con la tasa de cada trimestre y su variación en puntos frente al trimestre anterior.", "Las causas de deserción ordenadas de mayor a menor, con su porcentaje.", "Tres recomendaciones para 2026, cada una con un responsable sugerido y un indicador."],
      constraints: ["Usa solo estos datos; si una acción no se puede relacionar con certeza con un resultado, dilo.", "No inventes cifras ni nombres de personas."],
      format: "Títulos numerados, una tabla y frases cortas en español de Colombia."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.",
      "Selecciona la sección de recomendaciones y escribe en el cuadro de edición: «Agrega una meta numérica para 2026 a cada recomendación».",
      "Usa «Ajustar longitud → Más corto» y comprueba que la tabla se conserve.",
      "Abre el menú «Crear» del Canvas y elige «Infografía».",
      "Exporta el informe con «Compartir y exportar → Exportar a Documentos de Google»."
    ],
    expected: [
      "El resumen menciona la caída de 9,0 % a 3,6 % (5,4 puntos).",
      "La tabla muestra las cuatro tasas y la variación entre trimestres.",
      "La dificultad económica aparece como primera causa (39 % de 105).",
      "Cada recomendación tiene responsable, fecha e indicador.",
      "La infografía generada muestra la tendencia descendente y las tres acciones.",
      "El documento quedó guardado en Google Docs."
    ],
    stretch: "Pide en el chat: «Crea una página web a partir de este informe con un gráfico de líneas animado y tarjetas para cada acción». Compara la página con la infografía.",
    previewSvg: canvasSvgBars("Gráfico de barras con la tasa de deserción por trimestre de 2025: 9,0; 7,8; 5,5 y 3,6 por ciento", "Tasa de deserción 2025 (%)", ["T1", "T2", "T3", "T4"], [9.0, 7.8, 5.5, 3.6], 3)
  },
  {
    id: "doc-b-propuesta-huerta",
    title: "Propuesta de proyecto productivo con cuestionario de repaso",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Exportar a Docs + menú Crear → Cuestionario",
    goal: "Redactar una propuesta formal de proyecto productivo con presupuesto y cronograma, y generar un cuestionario para que el equipo de aprendices domine la propuesta.",
    scenario: "Un equipo quiere financiar una huerta hidropónica con recursos del centro. La propuesta debe convencer al comité y el equipo debe sustentarla sin leer.",
    promptParts: {
      role: "formulador de proyectos productivos para convocatorias institucionales",
      context: "Un equipo de aprendices presentará esta propuesta al comité de proyectos del centro para obtener financiación. El comité decide por viabilidad, costos y valor formativo.",
      data: IN_HUERTA,
      instruction: "En Canvas, redacta la propuesta con:",
      task: ["El problema, la justificación pedagógica y el objetivo general.", "Tres objetivos específicos medibles, cada uno ligado a un indicador de los datos.", "El presupuesto con el porcentaje de cada rubro y el cronograma por fases.", "El costo por kilogramo si toda la inversión se carga al primer ciclo y los kilos que hay que vender a 9.000 COP para recuperarla.", "Tres riesgos con su medida de mitigación."],
      constraints: ["Muestra los cálculos paso a paso.", "Montos en pesos colombianos con punto de miles."],
      format: "Documento formal con títulos numerados y dos tablas."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.",
      "Selecciona el párrafo de justificación y escribe: «Relaciónalo con las competencias del programa de formación».",
      "Usa «Cambiar tono → Más formal» para la versión que irá al comité.",
      "Abre «Crear → Cuestionario» para que el equipo repase la propuesta antes de sustentarla.",
      "Exporta la propuesta a Documentos de Google desde «Compartir y exportar»."
    ],
    expected: [
      "La tabla de presupuesto suma 8.000.000 COP y la estructura NFT pesa 40 %.",
      "Los tres objetivos específicos tienen un indicador medible.",
      "El cálculo de costo por kilogramo y punto de equilibrio aparece paso a paso.",
      "El cronograma cubre las 16 semanas sin huecos.",
      "El cuestionario generado tiene preguntas sobre presupuesto, cronograma e indicadores.",
      "Existe una copia de la propuesta en Google Docs."
    ],
    stretch: "Pide: «Agrega un escenario optimista con dos ciclos más y compáralo en una tabla con el escenario base».",
    previewSvg: canvasSvgDonut("Gráfico de dona con la distribución del presupuesto de 8 millones de pesos por rubro", "Presupuesto huerta (8 M COP)", [
      { name: "Estructura NFT", value: 3200000, cls: "cx-p" },
      { name: "Capacitación BPA", value: 1420000, cls: "cx-a" },
      { name: "Sensores", value: 1150000, cls: "cx-w" },
      { name: "Nutrientes", value: 960000, cls: "cx-d" },
      { name: "Bomba y semillas", value: 1270000, cls: "cx-m" }
    ], "8 M")
  }
];

// 2. Código y web en vivo
const IN_PRESUPUESTO = `PRESUPUESTO DE LA FERIA DE PROYECTOS (datos de práctica)

Presupuesto total: 12.000.000 COP

Categoría,Porcentaje inicial,Mínimo permitido
Logística y montaje,35,25
Alimentación,25,15
Publicidad,15,5
Premios,15,10
Imprevistos,10,5

Reglas de negocio:
1. La suma de porcentajes siempre debe ser 100.
2. Si una categoría queda por debajo de su mínimo, se muestra una alerta roja con el nombre de la categoría.
3. Si imprevistos baja de 8 %, se muestra una advertencia amarilla: "Riesgo financiero alto".
4. Cada categoría muestra su valor en pesos (porcentaje x 12.000.000).`;

const IN_KANBAN = `TAREAS DEL SPRINT 3 — APP DE CITAS DEL CENTRO (datos de práctica)

id,titulo,responsable,puntos,estado
T1,Diseñar pantalla de login,Ana,3,Hecho
T2,Conectar API de usuarios,Luis,5,Hecho
T3,Validar formulario de cita,Marta,3,En curso
T4,Calendario de disponibilidad,Jorge,8,En curso
T5,Notificación por correo,Sara,5,Por hacer
T6,Pruebas unitarias del backend,Iván,5,Por hacer
T7,Panel del instructor,Ana,8,Por hacer
T8,Accesibilidad y contraste,Marta,3,Hecho

Sprint de 10 días con 40 puntos.
Puntos pendientes reales por día (corte del día 10): 40,40,37,37,34,34,32,29,29,29`;

CANVAS_EXERCISES["code-prototyping"] = [
  {
    id: "code-a-simulador-presupuesto",
    title: "Simulador de presupuesto con sliders y gráfico de dona en vivo",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Canvas de código + Vista previa ejecutable",
    goal: "Construir una aplicación web que recalcula en tiempo real un presupuesto, con controles deslizantes, alertas de negocio y un gráfico animado.",
    scenario: "El comité de la feria necesita jugar con la distribución del presupuesto en la reunión, ver el impacto en pesos y detectar de inmediato una distribución riesgosa.",
    promptParts: {
      role: "desarrollador frontend que crea herramientas de decisión para equipos no técnicos",
      context: "El comité de la feria repartirá su presupuesto en una reunión en vivo y quiere ver al instante el efecto de cada cambio.",
      data: IN_PRESUPUESTO,
      instruction: "En Canvas, crea una aplicación web de una sola página que permita:",
      task: ["Ajustar el porcentaje de cada categoría con un control deslizante y ver su valor en pesos.", "Mantener la suma en 100 % repartiendo la diferencia entre las demás categorías.", "Ver la distribución en un gráfico de dona que se actualice en vivo (Chart.js desde CDN).", "Recibir las alertas de las reglas de negocio.", "Restablecer los valores iniciales."],
      constraints: ["Formato de moneda colombiano.", "Diseño responsivo y accesible: contraste AA y controles con etiqueta."],
      format: "Un solo archivo HTML con CSS y JavaScript."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.",
      "Sube «Logística» a 50 % y observa cómo se redistribuyen las demás categorías.",
      "Baja «Imprevistos» a 6 % y comprueba que aparezca la advertencia.",
      "Si la vista previa muestra un error, escribe en el chat: «Corrige el error que aparece en la consola».",
      "Pide en el chat: «Agrega un botón para descargar la distribución en CSV y un interruptor de modo oscuro»."
    ],
    expected: [
      "La app abre en la vista previa sin errores.",
      "Los valores iniciales en pesos son 4.200.000 / 3.000.000 / 1.800.000 / 1.800.000 / 1.200.000.",
      "La suma de porcentajes se mantiene en 100 al mover cualquier control.",
      "La dona cambia en vivo con animación.",
      "Las alertas roja y amarilla aparecen según las reglas.",
      "El CSV descargado contiene las cinco categorías y el modo oscuro funciona."
    ],
    stretch: "Pide: «Agrega un segundo escenario guardado y un gráfico de barras que compare ambos escenarios lado a lado».",
    previewSvg: canvasSvgDonut("Gráfico de dona con la distribución inicial del presupuesto de la feria: logística 35, alimentación 25, publicidad 15, premios 15 e imprevistos 10 por ciento", "Distribución inicial (12 M COP)", [
      { name: "Logística", value: 35, cls: "cx-p" },
      { name: "Alimentación", value: 25, cls: "cx-a" },
      { name: "Publicidad", value: 15, cls: "cx-w" },
      { name: "Premios", value: 15, cls: "cx-m" },
      { name: "Imprevistos", value: 10, cls: "cx-d" }
    ], "100 %")
  },
  {
    id: "code-b-kanban-burndown",
    title: "Tablero Kanban arrastrable con gráfico de avance del sprint",
    level: "Avanzado",
    duration: "35 min",
    canvasFeature: "Canvas de código + Vista previa + iteración por selección",
    goal: "Crear un tablero Kanban funcional con arrastrar y soltar, contadores por columna y un gráfico burndown que compara el avance ideal y el real.",
    scenario: "El equipo del sprint 3 quiere ver en una sola pantalla qué tareas faltan y si va atrasado frente a la línea ideal.",
    promptParts: {
      role: "desarrollador frontend con experiencia en herramientas ágiles",
      context: "El equipo del sprint 3 necesita ver en una sola pantalla qué falta y si va atrasado frente al plan.",
      data: IN_KANBAN,
      instruction: "En Canvas, crea un tablero Kanban web que:",
      task: ["Muestre las tareas en las columnas Por hacer, En curso y Hecho.", "Permita mover las tarjetas arrastrándolas y también con el teclado.", "Sume los puntos de cada columna y muestre el avance del sprint.", "Incluya un gráfico burndown con la línea ideal y la real (Chart.js desde CDN).", "Filtre las tarjetas por responsable."],
      constraints: ["Sin frameworks: solo HTML, CSS y JavaScript.", "Cada tarjeta debe poder enfocarse y tener una etiqueta para lectores de pantalla."],
      format: "Un solo archivo HTML ejecutable."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.",
      "Arrastra la tarea T3 a «Hecho» y observa los contadores y la barra de avance.",
      "Filtra por «Ana» y comprueba qué tarjetas quedan.",
      "En el código, selecciona la función del gráfico y escribe: «Marca los días en que la línea real supera a la ideal».",
      "Pide en el chat: «Guarda el estado del tablero en localStorage» y recarga la vista previa."
    ],
    expected: [
      "Al inicio, Hecho suma 11 puntos (T1, T2, T8) y el progreso es 27,5 %.",
      "Las tarjetas se mueven con ratón y con teclado.",
      "El burndown muestra la línea ideal y la real; la real queda por encima desde el día 2 y cierra con 29 puntos pendientes.",
      "El filtro por responsable funciona sin recargar.",
      "Los contadores se actualizan al soltar una tarjeta.",
      "El estado persiste al recargar la vista previa."
    ],
    stretch: "Pide: «Agrega una columna Bloqueado con límite WIP de 2 tarjetas y una alerta visual cuando se supere».",
    previewSvg: canvasSvgLine("Gráfico de líneas burndown del sprint: la línea ideal baja de 40 a 0 y la real termina en 29 puntos pendientes", "Burndown sprint 3 (puntos)", ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"], [
      { name: "Ideal", values: [40, 35.6, 31.1, 26.7, 22.2, 17.8, 13.3, 8.9, 4.4, 0], cls: "cx-m" },
      { name: "Real", values: [40, 40, 37, 37, 34, 34, 32, 29, 29, 29], cls: "cx-p" }
    ])
  }
];

// 3. Matrices y hojas de cálculo
const IN_VENTAS = `VENTAS 2025 — TIENDA AGROINDUSTRIAL DEL CENTRO (miles de COP, datos de práctica)

Mes,Cafe,Panela,Queso
Ene,4200,2100,1800
Feb,3900,2000,1750
Mar,4500,2300,1900
Abr,4800,2250,2000
May,5100,2400,2100
Jun,4700,2600,2050
Jul,5300,2500,2200
Ago,5600,2700,2300
Sep,5200,2650,2250
Oct,5800,2900,2400
Nov,6200,3100,2600
Dic,7400,3600,3100`;

const IN_RIESGOS = `RIESGOS DEL PROYECTO "APP DE CITAS DEL CENTRO" (datos de práctica)
Escala: probabilidad 1-5 e impacto 1-5. Nivel = probabilidad x impacto.
Crítico >= 15 | Alto 8-14 | Medio 4-7 | Bajo <= 3

id,riesgo,probabilidad,impacto
R1,Rotación del líder técnico,2,5
R2,Retraso en la entrega de requisitos,4,4
R3,Falla del servidor de pruebas,3,3
R4,Fuga de datos personales,2,5
R5,Cambios de alcance sin control,4,3
R6,Baja adopción por parte de usuarios,3,4
R7,Dependencia de una API externa,3,5
R8,Errores de estimación,5,3
R9,Falta de pruebas automatizadas,4,5
R10,Corte de energía en el centro,2,2`;

CANVAS_EXERCISES["data-matrix"] = [
  {
    id: "data-a-ventas-tienda",
    title: "Análisis de ventas anuales con exportación a Sheets y tablero",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Tabla en Canvas + Exportar a Hojas de cálculo + página web",
    goal: "Transformar 12 meses de ventas en una matriz con totales, participación y crecimiento, llevarla a Google Sheets y convertirla en un tablero visual.",
    scenario: "La tienda del centro debe decidir qué producto promocionar en 2026 y en qué meses reforzar inventario.",
    promptParts: {
      role: "analista comercial de pequeñas unidades productivas",
      context: "La tienda del centro debe decidir qué producto promocionar en 2026 y en qué meses reforzar el inventario.",
      data: IN_VENTAS,
      instruction: "En Canvas, prepara un análisis con:",
      task: ["Una tabla con el total de cada mes y su variación porcentual frente al mes anterior.", "Los totales anuales y la participación de cada producto.", "El mes pico, el mes más bajo y el producto que más creció de enero a diciembre.", "Tres recomendaciones de inventario y promoción basadas en esas cifras."],
      constraints: ["Cifras en miles de COP con separador de miles y porcentajes con un decimal.", "Si haces una proyección, declara el supuesto."],
      format: "Tabla principal, tabla de resumen y recomendaciones en viñetas."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.",
      "Usa «Compartir y exportar → Exportar a Hojas de cálculo» para abrir la tabla en Google Sheets.",
      "En Sheets, aplica formato condicional de escala de color a la columna de totales.",
      "Vuelve a Gemini y pide: «Crea un tablero web con barras apiladas por mes y tarjetas con los totales anuales».",
      "En el tablero, selecciona las tarjetas y escribe: «Agrega la participación anual de cada producto»."
    ],
    expected: [
      "El total anual es 120.250 (café 62.700, panela 31.100, queso 26.450).",
      "El café concentra cerca de 52 % de las ventas.",
      "Diciembre aparece como pico y febrero como mes más bajo.",
      "Las recomendaciones citan cifras de la tabla.",
      "La tabla abre correctamente en Google Sheets.",
      "La página web muestra barras apiladas y tarjetas KPI."
    ],
    stretch: "Pide: «Agrega un filtro por trimestre y una línea de tendencia sobre el total mensual».",
    previewSvg: canvasSvgBars("Gráfico de barras con el total mensual de ventas 2025 en miles de pesos; diciembre es el pico con 14.100", "Total mensual 2025 (miles COP)", ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], [8100, 7650, 8700, 9050, 9600, 9350, 10000, 10600, 10100, 11100, 11900, 14100], 11)
  },
  {
    id: "data-b-matriz-riesgos",
    title: "Matriz de riesgos con mapa de calor interactivo",
    level: "Intermedio",
    duration: "25 min",
    canvasFeature: "Tabla + aplicación web con mapa de calor",
    goal: "Calcular el nivel de cada riesgo, priorizarlos y visualizarlos en un mapa de calor 5 × 5 donde se pueda consultar cada celda.",
    scenario: "Antes del comité de seguimiento, el líder del proyecto debe mostrar qué riesgos atender primero y con qué plan.",
    promptParts: {
      role: "gestor de proyectos de software con experiencia en gestión de riesgos",
      context: "El líder del proyecto presentará al comité de seguimiento qué riesgos atender primero y cómo hacerlo.",
      data: IN_RIESGOS,
      instruction: "En Canvas, construye la matriz de riesgos:",
      task: ["Calcula el nivel de cada riesgo y clasifícalo con los umbrales de los datos.", "Ordena los riesgos de mayor a menor nivel.", "Asigna a cada riesgo una respuesta (evitar, mitigar, transferir o aceptar) y una acción concreta."],
      constraints: ["Usa exactamente los umbrales entregados.", "Propón acciones realistas para un equipo de cinco personas."],
      format: "Tabla con las columnas id, riesgo, probabilidad, impacto, nivel, clasificación, respuesta y acción."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.",
      "Selecciona la columna de acciones y escribe: «Agrega un responsable y una fecha límite a cada acción».",
      "Exporta la tabla con «Exportar a Hojas de cálculo» para el seguimiento semanal.",
      "Pide en el chat: «Crea una aplicación web con un mapa de calor 5 x 5 de estos riesgos; al hacer clic en una celda, muestra sus riesgos y acciones».",
      "En la vista previa, haz clic en la celda de probabilidad 2 e impacto 5."
    ],
    expected: [
      "Hay 4 riesgos críticos: R9 (20), R2 (16), R7 (15) y R8 (15).",
      "Hay 5 riesgos altos: R5 y R6 (12), R1 y R4 (10) y R3 (9).",
      "R10 (4) es el único riesgo medio y ninguno queda en Bajo.",
      "El mapa muestra 2 riesgos en la celda probabilidad 2 / impacto 5.",
      "Al hacer clic en una celda aparece la lista con acciones.",
      "La tabla se exportó a Hojas de cálculo."
    ],
    stretch: "Pide: «Calcula el riesgo residual suponiendo que cada acción baja un punto la probabilidad y muestra ambos mapas lado a lado».",
    previewSvg: canvasSvgHeatmap("Mapa de calor de 5 por 5 con la ubicación de los 10 riesgos del proyecto según probabilidad e impacto", "Mapa de calor de riesgos", { "2-5": 2, "4-4": 1, "3-3": 1, "4-3": 1, "3-4": 1, "3-5": 1, "5-3": 1, "4-5": 1, "2-2": 1 })
  }
];

// 4. Diagramas de proceso
const IN_MATRICULA = `PROCESO DE MATRÍCULA DE APRENDICES (descripción de práctica)

Actores (carriles): Aspirante | Plataforma de inscripción | Bienestar | Coordinación académica

1. El aspirante se registra en la plataforma de inscripción y elige el programa.
2. La plataforma valida que el documento no tenga otra matrícula activa.
   - Si ya tiene matrícula activa: se notifica al aspirante y el proceso termina.
3. El aspirante presenta la prueba de conocimientos.
4. Coordinación académica revisa el puntaje.
   - Puntaje >= 60: pasa a entrevista.
   - Puntaje < 60: queda en lista de espera y recibe un correo.
5. Bienestar realiza la entrevista y verifica documentos.
6. Si faltan documentos, el aspirante tiene 3 días hábiles para cargarlos; si no lo hace, se libera el cupo.
7. Coordinación académica asigna ficha y horario.
8. La plataforma envía el correo de bienvenida y el aspirante pasa a ser aprendiz.

Tiempos promedio: registro 1 día, prueba 2 días, revisión 1 día, entrevista 3 días, asignación 1 día.`;

const IN_JWT = `INICIO DE SESIÓN CON JWT Y PLAN DEL PROYECTO (datos de práctica)

Participantes: Usuario, App web, API de autenticación, Base de datos, API de citas

Flujo:
1. Usuario escribe correo y contraseña en la App web.
2. App web envía POST /auth/login a la API de autenticación.
3. API consulta el usuario en la Base de datos y compara el hash de la contraseña.
4. Si es inválido: responde 401 y la App muestra "Credenciales incorrectas".
5. Si es válido: firma un access token (15 min) y un refresh token (7 días) y responde 200.
6. App web llama GET /citas a la API de citas con el header Authorization: Bearer <token>.
7. API de citas valida la firma y la expiración; responde 200 con las citas.
8. Si el access token expiró: responde 401, la App llama POST /auth/refresh y repite la petición.

Plan del proyecto (año 2026):
Tarea,Inicio,Duración
Diseño del flujo,2026-11-02,5 días
Endpoint de login,2026-11-09,4 días
Middleware de validación,2026-11-13,3 días
Refresh token,2026-11-18,3 días
Pruebas de seguridad,2026-11-23,4 días
Despliegue,2026-11-27,1 día`;

CANVAS_EXERCISES["flowchart-diagram"] = [
  {
    id: "flow-a-matricula-swimlanes",
    title: "Flujograma de matrícula por carriles con Mermaid",
    level: "Intermedio",
    duration: "25 min",
    canvasFeature: "Código Mermaid renderizado en vista previa",
    goal: "Convertir un procedimiento escrito en un diagrama de flujo por carriles, con decisiones y tiempos, que se pueda exportar como imagen.",
    scenario: "Bienestar y coordinación tienen versiones distintas del proceso de matrícula. Un diagrama único evita confusiones.",
    promptParts: {
      role: "analista de procesos que documenta con diagramas Mermaid",
      context: "Bienestar y coordinación académica tienen versiones distintas del proceso de matrícula. Se necesita un diagrama único para proyectarlo en la reunión de alineación.",
      data: IN_MATRICULA,
      instruction: "En Canvas, crea una página web que muestre el proceso como diagrama de flujo con:",
      task: ["Un carril por actor.", "Rombos para las decisiones y nodos de inicio y fin diferenciados.", "El camino feliz resaltado.", "Una tabla con la duración de cada etapa y el tiempo total del camino feliz."],
      constraints: ["Usa Mermaid cargado desde CDN.", "Máximo seis palabras por nodo para que se lea en el proyector."],
      format: "Un solo archivo HTML ejecutable."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.",
      "Si Mermaid muestra un error, escribe en el chat: «Corrige este error de Mermaid» y pega el mensaje.",
      "En el código, selecciona el nodo de la entrevista y escribe: «Agrega una nota con su duración».",
      "Pide en el chat: «Agrega un botón para descargar el diagrama en SVG» y prueba la descarga.",
      "Pide: «Genera una versión vertical para imprimir en tamaño carta»."
    ],
    expected: [
      "Hay cuatro carriles con nombre visible.",
      "Aparecen tres decisiones: matrícula activa, puntaje ≥ 60 y documentos completos.",
      "El camino feliz está resaltado y termina en «Aprendiz matriculado».",
      "La tabla muestra un tiempo total de 8 días en el camino feliz.",
      "El botón descarga un archivo SVG válido.",
      "La versión vertical cabe en una hoja tamaño carta."
    ],
    stretch: "Pide: «Agrega indicadores de cuello de botella: colorea en ámbar la etapa más lenta».",
    previewSvg: canvasSvgFlow("Diagrama de flujo por carriles del proceso de matrícula con cuatro actores", "Matrícula por carriles", [
      { name: "Aspirante", steps: ["Registro", "Prueba", "Carga docs"] },
      { name: "Plataforma", steps: ["¿Activa?", "Bienvenida"] },
      { name: "Bienestar", steps: ["Entrevista", "¿Docs?"] },
      { name: "Coordinación", steps: ["¿Puntaje?", "Asigna ficha"] }
    ])
  },
  {
    id: "flow-b-secuencia-jwt-gantt",
    title: "Diagrama de secuencia JWT y cronograma Gantt en una sola página",
    level: "Avanzado",
    duration: "30 min",
    canvasFeature: "Mermaid (sequenceDiagram + gantt) en vista previa",
    goal: "Documentar el flujo de autenticación con tokens y el plan de implementación en dos diagramas conectados.",
    scenario: "El equipo de desarrollo debe explicar en la revisión técnica cómo funciona el login y cuándo estará listo.",
    promptParts: {
      role: "arquitecto de software que documenta flujos de autenticación",
      context: "El equipo explicará en la revisión técnica cómo funciona el inicio de sesión y cuándo estará listo.",
      data: IN_JWT,
      instruction: "En Canvas, crea una página web con dos diagramas Mermaid en pestañas:",
      task: ["Secuencia: el inicio de sesión con sus dos caminos de error (credenciales inválidas y token vencido) y la vigencia de cada token.", "Cronograma: un diagrama de Gantt con las tareas, sus fechas y el despliegue como hito."],
      constraints: ["Los códigos HTTP y las fechas deben coincidir con los datos.", "Las pestañas deben funcionar con teclado."],
      format: "Un solo archivo HTML con Mermaid cargado desde CDN."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.",
      "Revisa la pestaña de secuencia y ubica los dos caminos de error.",
      "En el código, selecciona el bloque gantt y escribe: «Marca como crítica la tarea de pruebas de seguridad».",
      "Pide en el chat: «Agrega una pestaña de glosario con JWT, access token, refresh token, firma y código 401, cada uno en una frase».",
      "Usa «Compartir» para enviar el enlace al equipo."
    ],
    expected: [
      "El diagrama de secuencia muestra los cinco participantes en orden.",
      "Existen las ramas 401 por credenciales y 401 por token expirado con refresh.",
      "Las notas indican 15 minutos y 7 días.",
      "El Gantt muestra seis tareas sin solapamiento y termina el 27/11/2026.",
      "Las pestañas funcionan con teclado.",
      "El glosario explica los cinco términos en una frase cada uno."
    ],
    stretch: "Pide: «Agrega un diagrama de estados del token: emitido, vigente, expirado, renovado y revocado».",
    previewSvg: canvasSvgFlow("Diagrama de secuencia simplificado del inicio de sesión con JWT y su renovación", "Secuencia login JWT", [
      { name: "App web", steps: ["POST login", "GET /citas", "Refresh"] },
      { name: "API auth", steps: ["¿Válido?", "Firma JWT"] },
      { name: "API citas", steps: ["¿Expiró?", "200 citas"] }
    ])
  }
];

// 5. Diseño visual UI/UX
const IN_BIBLIO = `LANDING "BIBLIOTURNOS" — RESERVA DE CUBÍCULOS DE ESTUDIO (contenido de práctica)

Marca: BiblioTurnos · Biblioteca del Centro de Formación
Lema: "Tu espacio de estudio, reservado en un minuto"
Colores: verde salvia #2d5a4c, arena #f5efe6, azul acento #2563eb
Tipografía: sistema (sans-serif)

Secciones:
1. Encabezado con logo textual y enlaces: Cómo funciona, Horarios, Preguntas.
2. Héroe con lema, botón "Reservar ahora" y contador de cubículos libres hoy.
3. Tres pasos: Elige franja, Confirma con tu documento, Llega 10 minutos antes.
4. Ocupación de hoy por franja (cupos de 20 por franja):
   08:00-10:00: 12 ocupados
   10:00-12:00: 17 ocupados
   14:00-16:00: 8 ocupados
   16:00-18:00: 19 ocupados
5. Formulario: documento (solo números, 6 a 10 dígitos), franja (lista), aceptar normas.
6. Preguntas frecuentes (3) en acordeón:
   - ¿Cuánto dura la reserva? 2 horas.
   - ¿Puedo cancelar? Sí, hasta 30 minutos antes.
   - ¿Qué pasa si no llego? La reserva se libera a los 15 minutos.
7. Pie con horario: lunes a viernes 8:00-18:00.`;

const IN_INCIDENCIAS = `APP MÓVIL "REPORTA YA" — INCIDENCIAS DE INFRAESTRUCTURA (contenido de práctica)

Pantallas:
1. Inicio: saludo, botón grande "Reportar incidencia" y lista de mis reportes.
2. Nuevo reporte: tipo (Eléctrico, Agua, Mobiliario, Red), ubicación (bloque y salón), descripción, foto (simulada), prioridad (Baja, Media, Alta).
3. Detalle: estado con línea de tiempo (Recibido, Asignado, En reparación, Resuelto).
4. Estadísticas: gráfico de dona por tipo y tiempo promedio de solución.

Reportes de ejemplo:
id,tipo,ubicación,prioridad,estado,horas_solución
INC-01,Eléctrico,Bloque A-201,Alta,Resuelto,6
INC-02,Red,Bloque C-105,Media,En reparación,
INC-03,Agua,Baños bloque B,Alta,Resuelto,4
INC-04,Mobiliario,Biblioteca,Baja,Asignado,
INC-05,Red,Sala de sistemas 3,Alta,Resuelto,9
INC-06,Eléctrico,Auditorio,Media,Recibido,`;

CANVAS_EXERCISES["visual-mockup"] = [
  {
    id: "ui-a-landing-biblioturnos",
    title: "Landing de reservas con modo oscuro y ocupación en vivo",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Canvas de código + Vista previa responsiva",
    goal: "Diseñar y construir una página de aterrizaje completa, accesible y con modo oscuro, que muestre la ocupación por franja con un gráfico.",
    scenario: "La biblioteca quiere lanzar las reservas en línea la próxima semana y necesita una página atractiva y clara para los aprendices.",
    promptParts: {
      role: "diseñador UI/UX que también desarrolla frontend",
      context: "La biblioteca lanzará la próxima semana las reservas en línea de cubículos. La página debe invitar a reservar y ser fácil de usar desde el celular.",
      data: IN_BIBLIO,
      instruction: "En Canvas, construye la landing con el contenido de los datos, incluyendo:",
      task: ["Un gráfico de ocupación por franja: verde por debajo de 75 %, ámbar entre 75 % y 89 % y rojo desde 90 %.", "Un contador de cubículos libres calculado con esos datos.", "Un formulario con validación en vivo y mensajes que expliquen cómo corregir.", "Un interruptor de modo oscuro."],
      constraints: ["Contraste WCAG AA, foco visible y uso completo con teclado.", "Responsiva desde 360 px y sin librerías externas."],
      format: "Un solo archivo HTML con colores definidos en variables CSS."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.",
      "Escribe un documento con letras en el formulario y lee el mensaje de error.",
      "Activa el modo oscuro y revisa que el gráfico siga legible.",
      "En el código, selecciona la sección principal (héroe) y escribe: «Agrega una ilustración SVG sencilla de un escritorio con libros».",
      "Pide en el chat: «Muestra cómo se ve a 390 px y corrige lo que no quepa»."
    ],
    expected: [
      "La franja 16:00-18:00 aparece en rojo (95 %) y 10:00-12:00 en ámbar (85 %).",
      "El contador del héroe muestra 24 cubículos libres.",
      "El formulario rechaza documentos fuera de 6 a 10 dígitos con mensaje claro.",
      "El formulario válido muestra una confirmación con la franja elegida.",
      "El modo oscuro cambia todos los colores sin perder contraste.",
      "El acordeón abre y cierra con teclado."
    ],
    stretch: "Pide: «Agrega una vista de calendario semanal con la ocupación de cada día como mapa de calor».",
    previewSvg: canvasSvgMock("Maqueta de la landing BiblioTurnos con encabezado, héroe, botón de reserva y barras de ocupación por franja", "Landing BiblioTurnos", "landing")
  },
  {
    id: "ui-b-app-reporta-ya",
    title: "Prototipo móvil navegable de reporte de incidencias",
    level: "Avanzado",
    duration: "35 min",
    canvasFeature: "Canvas de código + prototipo multipantalla",
    goal: "Construir un prototipo móvil con cuatro pantallas navegables, estados visuales y un panel de estadísticas calculado con los datos de ejemplo.",
    scenario: "Mantenimiento quiere validar con aprendices una app para reportar daños antes de contratar el desarrollo.",
    promptParts: {
      role: "diseñador de producto móvil",
      context: "Mantenimiento quiere validar la idea con aprendices antes de contratar el desarrollo, así que necesita un prototipo que se sienta real.",
      data: IN_INCIDENCIAS,
      instruction: "En Canvas, crea un prototipo web con apariencia de teléfono que:",
      task: ["Implemente las cuatro pantallas con una barra de navegación inferior.", "Cargue los reportes de ejemplo con un indicador de estado legible.", "Permita crear un reporte nuevo que aparezca de inmediato en Inicio.", "Calcule en Estadísticas la distribución por tipo y el tiempo promedio de solución."],
      constraints: ["Botones de al menos 44 px de alto y texto de al menos 16 px.", "El estado se comunica con texto, no solo con color."],
      format: "Un solo archivo HTML ejecutable, sin frameworks."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.",
      "Navega por las cuatro pantallas con la barra inferior.",
      "Crea un reporte de tipo Agua en «Bloque D-110» con prioridad Alta y búscalo en Inicio.",
      "En el código, selecciona la línea de tiempo del detalle y escribe: «Agrega la fecha y hora de cada cambio de estado».",
      "Pide en el chat: «Agrega un filtro por prioridad en Inicio»."
    ],
    expected: [
      "Las cuatro pantallas navegan sin recargar.",
      "Inicio muestra los seis reportes con chip de estado legible.",
      "El nuevo reporte aparece con estado Recibido.",
      "La dona muestra 2 Eléctrico, 2 Red, 1 Agua y 1 Mobiliario (antes de crear reportes nuevos).",
      "El promedio de solución es (6 + 4 + 9) / 3 = 6,3 horas.",
      "Los botones cumplen el tamaño mínimo táctil."
    ],
    stretch: "Pide: «Agrega un filtro por prioridad y una insignia con el número de reportes de prioridad Alta abiertos».",
    previewSvg: canvasSvgMock("Maqueta de cuatro pantallas móviles: inicio, reportar, detalle y estadísticas", "Prototipo Reporta Ya", "phone")
  }
];

// 6. Edición por selección (inline)
const IN_CORREO = `ASUNTO: Reunión obligatoria de acudientes

Señores acudientes:

Les informamos que el rendimiento del grupo es muy malo y que varios aprendices no están cumpliendo con nada. Si no asisten a la reunión, no nos hacemos responsables de lo que pase con la matrícula.

La reunión será el jueves 6 de noviembre de 2026 a las 6:00 p. m. en el auditorio principal. También se puede asistir por videollamada con el enlace que se enviará el miércoles.

Los temas son: resultados del trimestre, inasistencias, plan de mejoramiento, uso del celular en clase, salida pedagógica de diciembre.

Es obligatorio confirmar. El que no confirme se entiende que no le interesa.

Atentamente,
Coordinación académica`;

const IN_BUG_JS = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Calculadora de promedio</title></head>
<body>
  <h1>Calculadora de promedio</h1>
  <label for="notas">Notas separadas por coma</label>
  <input id="notas" value="3.8,4.5,4.0">
  <button id="calcular">Calcular</button>
  <p id="resultado"></p>
  <script>
    function leerNotas(texto) {
      return texto.split(",");
    }

    function calcularPromedio(notas) {
      let suma = 0;
      for (let i = 0; i <= notas.length; i++) {
        suma += notas[i];
      }
      return suma / notas.length;
    }

    function estado(promedio) {
      if (promedio > 3.5) return "Aprobado";
      return "Plan de mejoramiento";
    }

    document.getElementById("calcular").addEventListener("click", function () {
      const notas = leerNotas(document.getElementById("notas").value);
      const promedio = calcularPromedio(notas);
      document.getElementById("resultado").textContent =
        "Promedio: " + promedio + " - " + estado(promedio);
    });
  </script>
</body>
</html>

Casos de prueba esperados:
"3.8,4.5,4.0" -> Promedio 4.1 - Aprobado
"3.5,3.5"     -> Promedio 3.5 - Aprobado
"2.0,3.0,4.0" -> Promedio 3.0 - Plan de mejoramiento`;

CANVAS_EXERCISES["inline-prompting"] = [
  {
    id: "inline-a-correo-acudientes",
    title: "Correo a acudientes: corregir tono párrafo por párrafo",
    level: "Básico",
    duration: "20 min",
    canvasFeature: "Selección de texto + ventanita de edición + Cambiar tono",
    goal: "Practicar la edición quirúrgica: corregir solo los fragmentos problemáticos de un correo sin que Canvas reescriba el resto.",
    scenario: "La coordinación redactó un correo con tono amenazante. Debe salir hoy, pero los datos de fecha, hora y lugar no pueden cambiar.",
    promptParts: {
      role: "editor de comunicaciones institucionales",
      context: "Voy a practicar la edición por selección en Canvas con un correo que tiene problemas de tono. Necesito el texto original intacto para corregirlo fragmento por fragmento.",
      data: IN_CORREO,
      instruction: "Copia el correo en Canvas sin cambiar ninguna palabra. Luego, en el chat:",
      task: ["Señala los tres fragmentos con más problemas de tono y explica cada uno en una línea, sin reescribirlos."],
      constraints: ["No cambies ninguna palabra del documento en este paso."],
      format: "Documento en Canvas y una lista breve en el chat."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Selecciona solo el párrafo que empieza «Les informamos…» y escribe: «Reescríbelo con tono empático y propositivo, sin culpar a nadie».",
      "Selecciona la lista de temas y escribe: «Conviértela en viñetas ordenadas por prioridad».",
      "Selecciona la línea «Es obligatorio confirmar…» y escribe: «Pide la confirmación con amabilidad y fija como plazo el miércoles 5 de noviembre».",
      "Usa «Ajustar longitud → Más corto» y observa qué cambia.",
      "Compara con el original: la fecha, la hora y el lugar deben seguir iguales."
    ],
    expected: [
      "Solo cambiaron los fragmentos seleccionados.",
      "El párrafo inicial ya no contiene juicios como «muy malo» ni amenazas.",
      "Los temas aparecen como lista con viñetas.",
      "La solicitud de confirmación es amable e incluye el miércoles 5 de noviembre.",
      "Fecha (jueves 6 de noviembre de 2026), hora (6:00 p. m.) y lugar quedaron intactos.",
      "El correo final se lee en menos de un minuto."
    ],
    stretch: "Selecciona el correo completo y pide: «Crea una versión corta para WhatsApp de máximo 400 caracteres».",
    previewSvg: canvasSvgMock("Maqueta de documento con un párrafo seleccionado y la acción Tono empático", "Edición por selección", "doc")
  },
  {
    id: "inline-b-depurar-funcion",
    title: "Depurar una app seleccionando solo la función con error",
    level: "Intermedio",
    duration: "25 min",
    canvasFeature: "Canvas de código + selección de función + Vista previa",
    goal: "Corregir tres errores de una calculadora de promedios seleccionando cada función por separado y comprobando el resultado en la vista previa.",
    scenario: "Un aprendiz entregó una calculadora que muestra «NaN». Debes corregirla sin reescribir toda la aplicación.",
    promptParts: {
      role: "instructor de programación que enseña a depurar",
      context: "Un aprendiz entregó una calculadora de promedios que muestra «NaN». Quiero practicar la corrección función por función usando la selección de Canvas.",
      data: IN_BUG_JS,
      instruction: "Copia el código en Canvas sin cambiar ninguna línea. Luego, en el chat:",
      task: ["Describe en tres viñetas los síntomas que veré en la vista previa, sin revelar la solución."],
      constraints: ["No modifiques el código en este paso."],
      format: "Código HTML ejecutable en Canvas y viñetas en el chat."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Abre la «Vista previa», presiona «Calcular» y observa el resultado.",
      "Selecciona solo la función calcularPromedio y escribe: «Corrige el error del ciclo sin tocar nada más».",
      "Selecciona solo leerNotas y escribe: «Convierte cada nota a número y descarta los valores vacíos».",
      "Selecciona solo estado y escribe: «Un promedio de 3.5 debe quedar Aprobado».",
      "Prueba en la vista previa los tres casos de prueba de los datos."
    ],
    expected: [
      "El ciclo usa i < notas.length.",
      "leerNotas devuelve números (Number o parseFloat) y filtra vacíos.",
      "estado usa promedio >= 3.5.",
      "Los tres casos dan ≈ 4.1, 3.5 y 3.0 con el estado correcto (si ves 4.1000000000000005, resuélvelo con el reto extra).",
      "Las líneas que no seleccionaste quedaron iguales.",
      "El gráfico muestra cada nota y la línea de aprobación."
    ],
    stretch: "Pide: «Muestra el promedio con un decimal usando toFixed y agrega validación para notas fuera de 1.0 a 5.0».",
    previewSvg: canvasSvgMock("Maqueta de editor de código con una función resaltada y la consola con pruebas aprobadas", "Depuración por selección", "code")
  }
];

// 7. Algoritmos y Python
const IN_DUPLICADOS = `def documentos_duplicados(documentos):
    duplicados = []
    for i in range(len(documentos)):
        for j in range(i + 1, len(documentos)):
            if documentos[i] == documentos[j] and documentos[i] not in duplicados:
                duplicados.append(documentos[i])
    return duplicados


muestra = ["1001", "1002", "1003", "1002", "1004", "1001", "1005", "1002"]
print(documentos_duplicados(muestra))  # Salida esperada: ['1001', '1002']`;

const IN_ORDENAMIENTO = `ARREGLO DE PRUEBA (16 valores):
[38, 27, 43, 3, 9, 82, 10, 55, 21, 64, 17, 49, 70, 5, 33, 91]

Resultado ordenado esperado:
[3, 5, 9, 10, 17, 21, 27, 33, 38, 43, 49, 55, 64, 70, 82, 91]

Algoritmos a comparar:
1. Burbuja, sin parada temprana.
2. Merge sort.

Colores sugeridos:
- Barra normal: gris pizarra
- Barras comparándose: ámbar
- Barras ya ordenadas: verde salvia`;

CANVAS_EXERCISES["algorithm-refactor"] = [
  {
    id: "algo-a-duplicados-on",
    title: "De O(n²) a O(n): refactorizar y visualizar la diferencia",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Canvas de código Python + página HTML con gráfico",
    goal: "Refactorizar una búsqueda de duplicados cuadrática a lineal, explicarla y demostrar la mejora con un gráfico interactivo.",
    scenario: "El script que detecta documentos duplicados en la base de aprendices tarda demasiado. Hay que justificar el cambio ante el equipo.",
    promptParts: {
      role: "ingeniero de software que enseña complejidad algorítmica",
      context: "Esta función detecta documentos duplicados, pero con la base real de 10.000 registros tarda varios segundos. Necesito una versión eficiente y entender por qué lo es.",
      data: IN_DUPLICADOS,
      instruction: "En Canvas, entrega:",
      task: ["Una versión en Python con complejidad O(n) que conserve el orden de primera aparición.", "Tres pruebas con assert: la muestra, una lista vacía y una lista sin duplicados.", "Una explicación breve de por qué la versión original es O(n²) y la nueva O(n)."],
      constraints: ["Solo biblioteca estándar de Python.", "Explica para un aprendiz de primer trimestre, sin fórmulas innecesarias."],
      format: "Código Python con docstring, anotaciones de tipo y comentarios breves."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.",
      "Selecciona el bloque de pruebas y escribe: «Agrega una medición de tiempo con 10.000 elementos usando time.perf_counter».",
      "Pide en el chat: «Crea una página web con un gráfico de operaciones contra n para ambas versiones, con escala logarítmica y un control para elegir n».",
      "Abre la «Vista previa», mueve el control hasta 10.000 y activa la escala logarítmica.",
      "Explica con tus palabras por qué las curvas se separan tanto."
    ],
    expected: [
      "La función refactorizada devuelve ['1001', '1002'] con la muestra.",
      "La lista vacía y la lista sin duplicados devuelven [].",
      "Para n = 10.000, la versión original hace 49.995.000 comparaciones y la nueva cerca de 10.000.",
      "El gráfico muestra ambas curvas y la escala logarítmica funciona.",
      "El control de n actualiza el número de comparaciones al instante.",
      "La explicación es comprensible sin conocimientos previos de notación O."
    ],
    stretch: "Pide: «Agrega una tercera versión con collections.Counter y compárala en la misma tabla».",
    previewSvg: canvasSvgLine("Gráfico de líneas que compara operaciones en millones: la versión cuadrática llega a 50 millones con n igual a 10.000 y la lineal se mantiene cerca de cero", "Operaciones (millones) vs. n", ["1k", "2k", "3k", "4k", "5k", "6k", "7k", "8k", "9k", "10k"], [
      { name: "O(n²)", values: [0.5, 2, 4.5, 8, 12.5, 18, 24.5, 32, 40.5, 50], cls: "cx-d" },
      { name: "O(n)", values: [0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007, 0.008, 0.009, 0.01], cls: "cx-p" }
    ])
  },
  {
    id: "algo-b-visualizador-ordenamiento",
    title: "Visualizador animado: burbuja contra merge sort",
    level: "Avanzado",
    duration: "35 min",
    canvasFeature: "Canvas de código + animación en vista previa",
    goal: "Crear un visualizador que ejecuta dos algoritmos de ordenamiento lado a lado, con contadores en vivo, para comprender su eficiencia.",
    scenario: "En la clase de algoritmia, los aprendices entienden mejor viendo las comparaciones que leyendo pseudocódigo.",
    promptParts: {
      role: "desarrollador de material educativo interactivo para algoritmia",
      context: "Los aprendices entienden mejor un algoritmo cuando ven cada comparación. Quiero comparar burbuja y merge sort con el mismo arreglo.",
      data: IN_ORDENAMIENTO,
      instruction: "En Canvas, crea un visualizador web que:",
      task: ["Muestre los dos algoritmos lado a lado, con barras proporcionales a los valores.", "Permita iniciar, pausar, avanzar paso a paso y reiniciar, con control de velocidad.", "Cuente las comparaciones de cada algoritmo en vivo.", "Use los colores sugeridos para el estado de cada barra.", "Al terminar, indique cuántas veces más comparaciones hizo burbuja."],
      constraints: ["Implementa los algoritmos como generadores de JavaScript.", "Anuncia los contadores con aria-live y no uses librerías externas."],
      format: "Un solo archivo HTML ejecutable."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.",
      "Presiona «Iniciar» con velocidad media y espera a que ambos terminen.",
      "Reinicia y usa «Paso a paso» en merge sort; explica en voz alta qué mezcla en cada paso.",
      "En el código, selecciona la función de burbuja y escribe: «Agrega parada temprana y muestra cuántas comparaciones ahorra».",
      "Pide en el chat: «Agrega un botón que genere un arreglo aleatorio de 16 valores»."
    ],
    expected: [
      "Ambos paneles terminan con el arreglo ordenado esperado.",
      "Burbuja registra 120 comparaciones sin parada temprana.",
      "Merge sort registra 64 comparaciones o menos.",
      "Los colores cambian según el estado de cada barra.",
      "Pausa, paso a paso y reinicio funcionan.",
      "El botón de arreglo aleatorio genera una nueva ejecución que termina ordenada."
    ],
    stretch: "Pide: «Agrega un modo carrera con 100 barras y un gráfico final de comparaciones por algoritmo».",
    previewSvg: canvasSvgBars("Gráfico de barras con los 16 valores iniciales del arreglo de prueba; el mayor es 91", "Arreglo inicial (16 valores)", ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], [38, 27, 43, 3, 9, 82, 10, 55, 21, 64, 17, 49, 70, 5, 33, 91], 15)
  }
];

// 8. Rúbricas y didáctica
const IN_RUBRICA = `RÚBRICA DE PROYECTO: API REST DE GESTIÓN DE CITAS (datos de práctica)

Criterios y pesos:
1. Diseño de endpoints y recursos: 30 %
2. Validación de datos y manejo de errores: 25 %
3. Documentación OpenAPI: 20 %
4. Pruebas automatizadas: 25 %

Niveles y puntaje (se admiten valores intermedios):
Excelente = 5 | Bueno = 4 | Aceptable = 3 | Insuficiente = 1

Regla de resultado:
Nota final = suma(puntaje x peso). Aprobado si la nota final >= 3,5.
Si algún criterio queda por debajo de 3, se exige plan de mejoramiento aunque la nota apruebe.

Evaluación del aprendiz 1:
Diseño 4, Validación 3, Documentación 5, Pruebas 2`;

const IN_GIT = `GUÍA DIDÁCTICA: FUNDAMENTOS DE GIT (contenido de práctica)

Resultado de aprendizaje: Versionar el código fuente de un proyecto con Git aplicando un flujo de ramas básico.
Duración: 4 horas. Grupo: 25 aprendices de primer trimestre.

Conceptos clave:
1. Repositorio: carpeta cuyo historial controla Git.
2. git init: crea un repositorio nuevo.
3. git add: agrega cambios al área de preparación (staging).
4. git commit -m: guarda una instantánea con un mensaje.
5. git status: muestra el estado de los archivos.
6. git log --oneline: lista el historial resumido.
7. Rama (branch): línea de trabajo independiente.
8. git switch -c: crea una rama y cambia a ella.
9. git merge: integra una rama en la actual.
10. Conflicto: dos cambios en la misma línea que Git no puede unir solo.

Producto esperado: repositorio con 5 commits, una rama "feature/login" integrada y un conflicto resuelto.`;

CANVAS_EXERCISES["rubric-curriculum"] = [
  {
    id: "rubric-a-calculadora-radar",
    title: "Rúbrica analítica con calculadora de nota y gráfico radar",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Tabla de rúbrica + aplicación web + Exportar a Hojas de cálculo",
    goal: "Redactar una rúbrica con descriptores observables y convertirla en una calculadora que muestre la nota y el perfil del aprendiz en un radar.",
    scenario: "Tres instructores califican el mismo proyecto y obtienen notas distintas. Una rúbrica precisa y una calculadora común reducen la diferencia.",
    promptParts: {
      role: "especialista en evaluación por competencias en formación técnica",
      context: "Tres instructores califican el mismo proyecto y obtienen notas distintas. Necesitamos una rúbrica que cualquiera aplique de la misma forma.",
      data: IN_RUBRICA,
      instruction: "En Canvas, construye:",
      task: ["La rúbrica de 4 criterios por 4 niveles, con un descriptor observable en cada celda.", "El cálculo paso a paso de la nota del aprendiz 1 y su resultado según la regla.", "Una retroalimentación de tres líneas para el aprendiz 1, centrada en su criterio más bajo."],
      constraints: ["Cada descriptor nombra una evidencia verificable en el código o la entrega; evita adjetivos como «bueno» o «adecuado».", "Tono respetuoso y orientado a la mejora."],
      format: "Tabla de rúbrica, seguida del cálculo y la retroalimentación."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.",
      "Selecciona una celda que te parezca ambigua y escribe: «Hazla verificable con una evidencia concreta».",
      "Exporta la rúbrica con «Exportar a Hojas de cálculo».",
      "Pide en el chat: «Crea una calculadora web: elijo el nivel de cada criterio, veo la nota en vivo y un radar del perfil frente al nivel esperado de 4».",
      "En la vista previa, carga los valores del aprendiz 1 y luego sube Pruebas a 4."
    ],
    expected: [
      "La rúbrica tiene 16 descriptores observables.",
      "La nota del aprendiz 1 es 3,45 y el resultado es «Plan de mejoramiento».",
      "Con Pruebas en 4, la nota sube a 3,95 y el resultado pasa a «Aprobado».",
      "El radar muestra el perfil del aprendiz y la serie esperada.",
      "La retroalimentación del aprendiz 1 se enfoca en Pruebas, su criterio más bajo.",
      "La rúbrica quedó en Google Sheets."
    ],
    stretch: "Pide: «Permite registrar 5 aprendices y muestra un radar promedio del grupo con el criterio más débil resaltado».",
    previewSvg: canvasSvgRadar("Gráfico radar con el perfil del aprendiz 1 frente al nivel esperado en cuatro criterios", "Perfil del aprendiz 1", ["Diseño", "Validación", "Documentación", "Pruebas"], [
      { name: "Esperado (4)", values: [4, 4, 4, 4], cls: "cx-m" },
      { name: "Aprendiz 1", values: [4, 3, 5, 2], cls: "cx-p" }
    ], 5)
  },
  {
    id: "rubric-b-guia-quiz-git",
    title: "Guía didáctica de Git con cuestionario autocalificable",
    level: "Básico",
    duration: "30 min",
    canvasFeature: "Documento + menú Crear → Cuestionario + página web",
    goal: "Producir una guía didáctica estructurada por momentos y un cuestionario interactivo con retroalimentación inmediata.",
    scenario: "Mañana inicia la competencia de control de versiones y el instructor necesita guía, actividad práctica y evaluación diagnóstica.",
    promptParts: {
      role: "diseñador instruccional para formación en desarrollo de software",
      context: "Mañana inicia la competencia de control de versiones con 25 aprendices de primer trimestre que nunca han usado Git.",
      data: IN_GIT,
      instruction: "En Canvas, redacta la guía didáctica con:",
      task: ["Los cinco momentos de la sesión con su duración: reflexión inicial, contextualización, apropiación, transferencia y evaluación.", "Una práctica paso a paso que lleve al producto esperado, incluido un conflicto y su resolución.", "Una tabla de errores frecuentes con su causa y su solución.", "Una lista de chequeo de la evidencia."],
      constraints: ["Usa comandos reales y vigentes de Git (git switch en lugar de git checkout).", "Explica cada término técnico la primera vez que aparezca."],
      format: "Guía con un título por momento y la práctica en bloques de comandos."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.",
      "Selecciona la práctica y escribe: «Agrega la salida esperada de la terminal después de cada comando».",
      "Abre «Crear → Cuestionario» para generar una evaluación a partir de la guía.",
      "Pide en el chat: «Crea un cuestionario web de 10 preguntas con retroalimentación inmediata, puntaje en un gráfico de dona y opción de reiniciar con las preguntas mezcladas».",
      "Responde el cuestionario web con dos errores a propósito y revisa el puntaje.",
      "Exporta la guía a Documentos de Google."
    ],
    expected: [
      "Los cinco momentos suman 240 minutos.",
      "La práctica produce 5 commits, la rama feature/login y un conflicto resuelto.",
      "La tabla de errores tiene al menos 4 filas con causa y solución.",
      "El cuestionario tiene 10 preguntas con retroalimentación.",
      "Con dos errores, el puntaje es 8/10 y la dona lo refleja.",
      "El botón reiniciar mezcla las preguntas."
    ],
    stretch: "Pide: «Agrega un simulador visual de ramas que dibuje los commits como círculos conectados al ejecutar comandos escritos».",
    previewSvg: canvasSvgDonut("Gráfico de dona con el resultado del cuestionario: 8 aciertos y 2 errores", "Resultado del cuestionario", [
      { name: "Aciertos", value: 8, cls: "cx-p" },
      { name: "Errores", value: 2, cls: "cx-d" }
    ], "8/10")
  }
];

// 9. SQL y pipelines
const IN_BIBLIO_SQL = `-- BASE DE DATOS DE PRÉSTAMOS DE BIBLIOTECA (datos de práctica, PostgreSQL)
CREATE TABLE usuarios (id INT PRIMARY KEY, nombre VARCHAR(60), programa VARCHAR(40));
CREATE TABLE libros (id INT PRIMARY KEY, titulo VARCHAR(80), categoria VARCHAR(40));
CREATE TABLE prestamos (
  id INT PRIMARY KEY,
  libro_id INT REFERENCES libros(id),
  usuario_id INT REFERENCES usuarios(id),
  fecha_prestamo DATE NOT NULL,
  fecha_limite DATE NOT NULL,
  fecha_devolucion DATE
);

INSERT INTO usuarios VALUES
(1,'Ana Torres','ADSO'),(2,'Luis Pérez','ADSO'),(3,'Marta Gil','Contabilidad'),
(4,'Jorge Ríos','Contabilidad'),(5,'Sara Mejía','Multimedia'),(6,'Iván Cruz','Multimedia');

INSERT INTO libros VALUES
(1,'Código limpio','Programación'),(2,'Bases de datos relacionales','Programación'),
(3,'Contabilidad básica','Finanzas'),(4,'Diseño de experiencia de usuario','Diseño'),
(5,'Python para todos','Programación');

INSERT INTO prestamos VALUES
(1,1,1,'2026-09-01','2026-09-15','2026-09-08'),
(2,1,2,'2026-09-10','2026-09-24','2026-09-20'),
(3,1,5,'2026-10-01','2026-10-15',NULL),
(4,2,1,'2026-09-03','2026-09-17','2026-09-12'),
(5,2,2,'2026-10-05','2026-10-19',NULL),
(6,3,3,'2026-09-02','2026-09-16','2026-09-30'),
(7,3,4,'2026-10-02','2026-10-16','2026-10-10'),
(8,4,5,'2026-09-15','2026-09-29','2026-09-25'),
(9,4,6,'2026-10-08','2026-10-22',NULL),
(10,5,1,'2026-10-12','2026-10-26','2026-10-20'),
(11,5,2,'2026-10-14','2026-10-28',NULL),
(12,1,6,'2026-10-16','2026-10-30','2026-10-24');`;

const IN_ASISTENCIA = `ARCHIVO asistencia_cruda.csv (14 filas, datos de práctica con errores a propósito)
documento,nombre,fecha,estado
1001, ana torres ,2026-10-01,P
1001,Ana Torres,01/10/2026,presente
1002,LUIS PÉREZ,2026-10-01,A
1003,marta gil,2026/10/01,Presente
1004,Jorge Ríos,2026-10-01,
1005,Sara Mejía,2026-10-01,tarde
1001,Ana Torres,2026-10-02,P
1002,Luis Pérez,02-10-2026,P
1003,Marta Gil,2026-10-02,ausente
1004,jorge rios,2026-10-02,P
1005,Sara Mejía,2026-10-02,P
,Sin Documento,2026-10-02,P
1006,Iván Cruz,2026-13-02,P
1003,Marta Gil,2026-10-02,A

TABLA MAESTRA aprendices (nombres oficiales):
1001,Ana Torres | 1002,Luis Pérez | 1003,Marta Gil | 1004,Jorge Ríos | 1005,Sara Mejía | 1006,Iván Cruz

REGLAS DE LIMPIEZA:
1. Fechas válidas en formatos AAAA-MM-DD, AAAA/MM/DD, DD/MM/AAAA y DD-MM-AAAA; una fecha imposible se descarta.
2. Filas sin documento se descartan.
3. El nombre se toma de la tabla maestra.
4. Estados: P, presente, Presente -> Presente | A, ausente -> Ausente | tarde -> Tarde | vacío -> Sin registro.
5. Un mismo documento y fecha cuenta una sola vez (se conserva la primera fila).`;

CANVAS_EXERCISES["sql-pipeline"] = [
  {
    id: "sql-a-biblioteca-dashboard",
    title: "Consultas SQL de biblioteca ejecutadas en el navegador con tablero",
    level: "Avanzado",
    duration: "35 min",
    canvasFeature: "Canvas de código SQL + página HTML con sql.js y gráficos",
    goal: "Escribir consultas con JOIN, agregaciones y funciones de ventana, y ejecutarlas en el navegador para alimentar un tablero visual.",
    scenario: "La biblioteca necesita saber qué libros rotan más, quién tiene préstamos vencidos y qué programa usa más el servicio.",
    promptParts: {
      role: "ingeniero de datos que enseña SQL",
      context: "La biblioteca necesita saber qué libros rotan más, quién tiene préstamos vencidos y qué programa usa más el servicio. La fecha de corte es el 30 de octubre de 2026.",
      data: IN_BIBLIO_SQL,
      instruction: "En Canvas, escribe consultas PostgreSQL que respondan:",
      task: ["¿Qué libros se prestan más? Usa RANK().", "¿Qué préstamos están vencidos y con cuántos días de atraso?", "¿Cuántos préstamos tiene cada programa?", "¿Cuál es el promedio de días de préstamo de los libros devueltos, en general y por programa?", "¿Qué préstamos se devolvieron después de la fecha límite?"],
      constraints: ["Antes de cada consulta, escribe un comentario con la pregunta de negocio.", "Usa JOIN explícitos y alias legibles."],
      format: "Un script .sql comentado."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.",
      "Selecciona la consulta de vencidos y escribe: «Agrega el nombre del usuario y ordena por días de atraso».",
      "Pide en el chat: «Crea una página web que cargue sql.js desde CDN, cree esta base adaptada a SQLite, ejecute las consultas y muestre tarjetas, un gráfico por programa y un área para probar consultas propias».",
      "Abre la «Vista previa» y ejecuta en el área de consultas: SELECT COUNT(*) FROM prestamos;",
      "Si la página no carga, escribe: «Corrige la carga de sql.js» y pega el error."
    ],
    expected: [
      "El ranking pone «Código limpio» en 1 (4 préstamos) y los otros cuatro libros empatan en 2 (2 préstamos).",
      "Hay 4 préstamos vencidos con 15, 11, 8 y 2 días de atraso.",
      "Por programa: ADSO 6, Multimedia 4 y Contabilidad 2.",
      "El promedio general de días de los devueltos es 11,0.",
      "Solo el préstamo 6 se devolvió con retraso (14 días).",
      "El tablero ejecuta consultas propias y muestra el resultado en tabla."
    ],
    stretch: "Pide: «Agrega una vista materializada de indicadores mensuales y un gráfico de líneas de préstamos por semana».",
    previewSvg: canvasSvgBars("Gráfico de barras de préstamos por programa: ADSO 6, Contabilidad 2 y Multimedia 4", "Préstamos por programa", ["ADSO", "Contabilidad", "Multimedia"], [6, 2, 4], 0)
  },
  {
    id: "sql-b-limpieza-asistencia",
    title: "Pipeline de limpieza de asistencia con diagrama entidad-relación",
    level: "Avanzado",
    duration: "35 min",
    canvasFeature: "Canvas de código SQL + Mermaid erDiagram + tablero de calidad",
    goal: "Diseñar un pipeline ETL que limpia un archivo con errores reales, documentarlo con un diagrama entidad-relación y medir la calidad antes y después.",
    scenario: "El reporte de asistencia llega de varias sedes con formatos distintos y la coordinación no confía en los porcentajes.",
    promptParts: {
      role: "ingeniero de datos especializado en calidad de datos",
      context: "El reporte de asistencia llega de varias sedes con formatos distintos y la coordinación no confía en los porcentajes.",
      data: IN_ASISTENCIA,
      instruction: "En Canvas, escribe en PostgreSQL un pipeline de limpieza por etapas:",
      task: ["Carga del archivo crudo en una tabla de staging con todas las columnas como texto.", "Limpieza según las reglas: fechas, nombres desde la tabla maestra y estados.", "Deduplicación por documento y fecha con ROW_NUMBER().", "Tabla final de asistencia y tabla de rechazos con su motivo.", "Porcentaje de asistencia: Presente más Tarde sobre el total limpio."],
      constraints: ["Cada etapa debe poder ejecutarse de nuevo sin duplicar datos.", "Un comentario por cada regla aplicada."],
      format: "Script .sql dividido por etapas."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.",
      "Selecciona la consulta que normaliza fechas y escribe: «Agrega una prueba por cada formato admitido».",
      "Pide en el chat: «Crea una página web con el diagrama entidad-relación en Mermaid y un tablero de calidad: filas crudas, limpias, rechazadas por motivo y una dona de estados».",
      "Abre la «Vista previa» y compara el tablero con tus resultados.",
      "Pide: «Convierte el pipeline en una función almacenada que reciba la fecha de carga»."
    ],
    expected: [
      "De 14 filas crudas quedan 10 limpias y 4 rechazadas.",
      "Rechazos: 2 duplicados, 1 sin documento y 1 fecha imposible (2026-13-02).",
      "Los estados limpios son: 6 Presente, 2 Ausente, 1 Tarde y 1 Sin registro.",
      "La asistencia (Presente + Tarde) es 70 %.",
      "Los nombres finales coinciden con la tabla maestra.",
      "El diagrama entidad-relación muestra las tres tablas y sus relaciones."
    ],
    stretch: "Pide: «Agrega una regla para detectar aprendices con dos ausencias seguidas y muéstralos en una alerta del tablero».",
    previewSvg: canvasSvgDonut("Gráfico de dona con los estados de asistencia después de la limpieza: 6 presentes, 2 ausentes, 1 tarde y 1 sin registro", "Asistencia limpia (10 filas)", [
      { name: "Presente", value: 6, cls: "cx-p" },
      { name: "Ausente", value: 2, cls: "cx-d" },
      { name: "Tarde", value: 1, cls: "cx-w" },
      { name: "Sin registro", value: 1, cls: "cx-m" }
    ], "70 %")
  }
];

// 10. Informes y auditoría
const IN_MESA = `MESA DE AYUDA TIC — MAYO A OCTUBRE DE 2026 (datos de práctica)

Mes,Abiertos,Resueltos,Tiempo_promedio_horas,Satisfaccion_1a5
May,120,110,18,4.1
Jun,135,128,16,4.2
Jul,160,140,22,3.8
Ago,150,149,14,4.4
Sep,142,140,12,4.5
Oct,128,127,10,4.6

Categorías de octubre:
Acceso y contraseñas,45
Red y wifi,30
Equipos,25
Software,20
Otros,8

Hechos relevantes:
- Julio: inicio de trimestre con 300 aprendices nuevos y caída del servidor de autenticación (2 días).
- Agosto: se publicó un portal de autoservicio para restablecer contraseñas.
- Septiembre: se contrató un segundo técnico de soporte.`;

const IN_PROVEEDORES = `EVALUACIÓN DE PROVEEDORES DE NUBE PARA LA PLATAFORMA DE FORMACIÓN (datos de práctica)
Los nombres se anonimizan como Proveedor A, B y C.

Criterio,Peso,Proveedor A,Proveedor B,Proveedor C
Costo anual,30%,4,5,3
Soporte en español,15%,3,4,5
Seguridad y certificaciones,25%,5,3,4
Facilidad de administración,15%,4,4,3
Región de datos y latencia,15%,3,4,5

Escala: 1 (muy deficiente) a 5 (excelente).
Costo anual estimado (COP): A 96.000.000 | B 78.000.000 | C 110.000.000
Requisito no negociable: los datos personales deben cumplir la Ley 1581 de 2012 de Colombia.`;

CANVAS_EXERCISES["executive-report"] = [
  {
    id: "report-a-mesa-ayuda",
    title: "Informe ejecutivo de mesa de ayuda con infografía y resumen en audio",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Documento + Crear → Infografía + Crear → Resumen en audio",
    goal: "Convertir seis meses de indicadores en un informe ejecutivo con conclusiones causales y producir dos formatos de difusión desde el mismo Canvas.",
    scenario: "La dirección quiere saber si las inversiones de agosto y septiembre mejoraron el servicio y necesita compartirlo con todo el personal.",
    promptParts: {
      role: "auditor de servicios TI que informa a la alta dirección",
      context: "La dirección quiere saber si el portal de autoservicio y el segundo técnico mejoraron el servicio, y compartirá el resultado con todo el personal.",
      data: IN_MESA,
      instruction: "En Canvas, redacta un informe ejecutivo con:",
      task: ["Un resumen de máximo cinco líneas con las tres cifras más importantes.", "Una tabla mensual con la tasa de resolución y el tiempo promedio.", "Una comparación entre mayo-julio y agosto-octubre.", "Qué cambios pueden atribuirse a cada hecho relevante y cuáles podrían ser coincidencia.", "Tres decisiones recomendadas."],
      constraints: ["No afirmes causalidad sin advertir sus límites.", "Cifras con un decimal y formato colombiano."],
      format: "Títulos numerados, una tabla y un cuadro de decisiones."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.",
      "Selecciona la sección de hechos relevantes y escribe: «Separa la evidencia fuerte de las coincidencias en dos columnas».",
      "Abre «Crear → Infografía» para la versión visual.",
      "Abre «Crear → Resumen en audio» para una versión que el personal pueda escuchar.",
      "Exporta el informe a Documentos de Google."
    ],
    expected: [
      "El tiempo promedio baja de 18 a 10 horas (−44,4 %).",
      "La satisfacción sube de 4,1 a 4,6.",
      "El promedio de tiempo antes (mayo-julio) es 18,7 h y después (agosto-octubre) 12,0 h.",
      "Acceso y contraseñas es la principal categoría de octubre (35,2 %).",
      "El informe advierte los límites de atribuir causalidad.",
      "Se generaron la infografía y el resumen en audio."
    ],
    stretch: "Pide: «Crea una página web con un tablero de los seis meses, un gráfico combinado de barras y líneas y un filtro por periodo».",
    previewSvg: canvasSvgLine("Gráfico de líneas del tiempo promedio de solución en horas de mayo a octubre: 18, 16, 22, 14, 12 y 10", "Tiempo promedio de solución (h)", ["May", "Jun", "Jul", "Ago", "Sep", "Oct"], [
      { name: "Horas", values: [18, 16, 22, 14, 12, 10], cls: "cx-a" }
    ])
  },
  {
    id: "report-b-dictamen-nube",
    title: "Dictamen técnico de proveedores con matriz ponderada y análisis de sensibilidad",
    level: "Avanzado",
    duration: "35 min",
    canvasFeature: "Documento + aplicación web con radar y pesos ajustables",
    goal: "Emitir un dictamen técnico defendible con una matriz ponderada y demostrar con una herramienta interactiva cómo cambia la decisión si cambian los pesos.",
    scenario: "El comité de compras debe elegir proveedor de nube. Los puntajes son muy cercanos y alguien preguntará qué pasa si la seguridad pesa más.",
    promptParts: {
      role: "consultor de arquitectura en la nube con experiencia en contratación pública",
      context: "El comité de compras elegirá proveedor de nube. Los puntajes son cercanos y el comité preguntará qué pasa si la seguridad pesa más.",
      data: IN_PROVEEDORES,
      instruction: "En Canvas, redacta el dictamen técnico con:",
      task: ["La metodología y la matriz ponderada con el cálculo de cada proveedor.", "Un análisis de sensibilidad con Seguridad en 35 % y Costo en 20 %, sin cambiar los demás pesos.", "El costo anual por punto de calidad de cada proveedor.", "La recomendación final con las condiciones contractuales mínimas para cumplir la Ley 1581 de 2012."],
      constraints: ["Muestra cada cálculo.", "No uses marcas comerciales reales."],
      format: "Documento con títulos numerados y tablas."
    },
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.",
      "Selecciona la recomendación y escribe: «Agrega una cláusula de salida y portabilidad de datos».",
      "Pide en el chat: «Crea una aplicación web con un control por cada peso (la suma debe ser 100 %), ranking en vivo, un radar de los tres proveedores y un aviso cuando cambie el ganador».",
      "En la vista previa, mueve los pesos hasta que cambie el ganador.",
      "Exporta el dictamen a Documentos de Google para su firma."
    ],
    expected: [
      "La matriz base da B 4,05, A 3,95 y C 3,85.",
      "Con Seguridad 35 % y Costo 20 %: A 4,05, C 3,95 y B 3,85.",
      "El costo por punto es menor en B (≈ 19,3 millones por punto).",
      "La recomendación incluye condiciones de la Ley 1581 de 2012.",
      "La app recalcula el ranking y el radar al mover los pesos.",
      "La app avisa cuando cambia el proveedor ganador."
    ],
    stretch: "Pide: «Agrega una simulación de Monte Carlo que varíe los pesos ±5 puntos y muestre en qué porcentaje de casos gana cada proveedor».",
    previewSvg: canvasSvgRadar("Gráfico radar que compara a los proveedores A, B y C en cinco criterios", "Proveedores A, B y C", ["Costo", "Soporte", "Seguridad", "Administración", "Región"], [
      { name: "A · 3,95", values: [4, 3, 5, 4, 3], cls: "cx-a" },
      { name: "B · 4,05", values: [5, 4, 3, 4, 4], cls: "cx-p" },
      { name: "C · 3,85", values: [3, 5, 4, 3, 5], cls: "cx-w" }
    ], 5)
  }
];

// --- Prompt R-C-I-R-F: un solo texto para copiar, con los datos delimitados una vez ---
function composeCanvasPrompt(parts) {
  return [
    `Actúa como ${parts.role}.`,
    `Contexto: ${parts.context}`,
    `Datos:\n"""\n${parts.data.trim()}\n"""`,
    `Instrucción: ${parts.instruction}\n${parts.task.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
    `Restricciones:\n${parts.constraints.map(c => `- ${c}`).join("\n")}`,
    `Formato: ${parts.format}`
  ].join("\n\n");
}

Object.values(CANVAS_EXERCISES).flat().forEach(ex => {
  ex.prompt = composeCanvasPrompt(ex.promptParts);
});

// --- Render de tarjetas ---
function escapeCanvasHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Resalta lo que el aprendiz escribe: el texto entre comillas latinas que sigue a dos puntos.
// Los nombres de botones y menús («Crear», «Vista previa») quedan sin resaltar.
function formatCanvasStep(text) {
  return escapeCanvasHtml(text).replace(/: «([^»]+)»/g, ': <span class="canvas-exercise-followup">«$1»</span>');
}

function buildCanvasPromptHtml(parts) {
  const e = escapeCanvasHtml;
  const row = (label, body) => `<div class="canvas-prompt-part"><span class="canvas-prompt-label">${label}</span><div class="canvas-prompt-body">${body}</div></div>`;
  return `
    <div class="canvas-exercise-prompt">
      ${row("Rol", `<p>Actúa como ${e(parts.role)}.</p>`)}
      ${row("Contexto", `<p>${e(parts.context)}</p>`)}
      ${row("Datos", `<pre class="canvas-exercise-code"><code>${e(parts.data.trim())}</code></pre>`)}
      ${row("Instrucción", `<p>${e(parts.instruction)}</p><ol>${parts.task.map(t => `<li>${e(t)}</li>`).join("")}</ol>`)}
      ${row("Restricciones", `<ul>${parts.constraints.map(c => `<li>${e(c)}</li>`).join("")}</ul>`)}
      ${row("Formato", `<p>${e(parts.format)}</p>`)}
    </div>`;
}

function buildCanvasExerciseHtml(exercise, index) {
  if (!exercise) return "";
  const e = escapeCanvasHtml;
  const tag = index === 1 ? "Ejercicio B" : "Ejercicio A";
  const steps = exercise.steps.map(s => `<li class="canvas-exercise-step">${formatCanvasStep(s)}</li>`).join("");
  const checks = exercise.expected.map((c, i) =>
    `<li><label><input type="checkbox" class="canvas-exercise-check" data-check-index="${i}"> <span>${e(c)}</span></label></li>`).join("");
  return `
    <article class="canvas-exercise-card" data-exercise-id="${e(exercise.id)}">
      <header class="canvas-exercise-head">
        <span class="canvas-exercise-tag">${tag}</span>
        <h4>${e(exercise.title)}</h4>
        <div class="canvas-exercise-meta">
          <span>📶 ${e(exercise.level)}</span>
          <span>⏱️ ${e(exercise.duration)}</span>
          <span>✨ ${e(exercise.canvasFeature)}</span>
        </div>
      </header>
      <div class="canvas-exercise-grid">
        <div class="canvas-exercise-main">
          <section class="canvas-exercise-section">
            <h5>🎯 Qué vas a lograr</h5>
            <p>${e(exercise.goal)}</p>
            <h5>📌 Situación</h5>
            <p>${e(exercise.scenario)}</p>
          </section>
          <section class="canvas-exercise-section">
            <div class="canvas-exercise-block-head">
              <h5>💬 1. Copia este prompt y pégalo en Gemini</h5>
              <button type="button" class="canvas-exercise-copy is-primary" data-copy="prompt">📋 Copiar prompt completo</button>
            </div>
            <p class="canvas-exercise-hint">Las órdenes del prompt van dirigidas a Gemini: tú solo activas Canvas, pegas el texto y lo envías. Está organizado con la fórmula R-C-I-R-F y los datos van entre comillas triples (""") para que Gemini los distinga de las instrucciones.</p>
            ${buildCanvasPromptHtml(exercise.promptParts)}
          </section>
          <section class="canvas-exercise-section">
            <h5>🧭 2. Itera dentro de Canvas</h5>
            <p class="canvas-exercise-hint">El texto resaltado es lo que escribes en el chat o en el cuadro que aparece al seleccionar un fragmento.</p>
            <ol class="canvas-exercise-steps">${steps}</ol>
          </section>
        </div>
        <aside class="canvas-exercise-side">
          <figure class="canvas-exercise-preview">
            ${exercise.previewSvg}
            <figcaption>Vista de referencia del resultado, dibujada con los mismos datos del ejercicio.</figcaption>
          </figure>
          <section class="canvas-exercise-checklist">
            <div class="canvas-exercise-block-head">
              <h5>✅ 3. Verifica tu resultado</h5>
              <span class="canvas-exercise-progress" data-exercise-progress aria-live="polite">0/${exercise.expected.length}</span>
            </div>
            <div class="canvas-exercise-bar" aria-hidden="true"><span data-exercise-bar></span></div>
            <ul>${checks}</ul>
            <button type="button" class="canvas-exercise-reset" data-exercise-reset>↺ Reiniciar verificación</button>
          </section>
          <section class="canvas-exercise-stretch">
            <h5>🚀 Reto extra</h5>
            <p>${e(exercise.stretch)}</p>
          </section>
        </aside>
      </div>
    </article>`;
}

function countCanvasChecklist(html) {
  return (String(html).match(/class="canvas-exercise-check"/g) || []).length;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CANVAS_EXERCISES, composeCanvasPrompt, escapeCanvasHtml, formatCanvasStep, buildCanvasPromptHtml, buildCanvasExerciseHtml, countCanvasChecklist, canvasSvgFrame, canvasSvgBars, canvasSvgLine, canvasSvgDonut, canvasSvgRadar, canvasSvgHeatmap, canvasSvgFlow, canvasSvgMock };
}
