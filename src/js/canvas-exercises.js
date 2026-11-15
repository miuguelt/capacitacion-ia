// Ejercicios prácticos de Gemini Canvas Lab: dos por cada modo del simulador (partes A y B) y, en siete modos, una parte C.
// Cada ejercicio define su prompt por partes (método CRTT+L + datos), pasos clasificados por lugar,
// criterios verificables y una vista previa SVG generada con los mismos datos.

let coverageKit = globalThis;
if (typeof module !== "undefined" && module.exports) {
  coverageKit = require("./canvas-coverage.js");
}

// --- Catálogo de capacidades reales de Gemini Canvas ---
// Cada ejercicio declara las que usa; las pruebas exigen que algún paso las ponga en práctica
// (pattern) y que entre los 31 ejercicios se cubra el catálogo completo (25 capacidades).
const CANVAS_CAPABILITIES = {
  "doc-create": { name: "Documento en Canvas", how: "Activa Canvas en Herramientas, pega el prompt y Gemini escribe el documento en el panel derecho.", pattern: /Activa Canvas/ },
  "inline-edit": { name: "Edición por selección", how: "Selecciona un fragmento del documento o del código y escribe el cambio en el cuadro que aparece.", pattern: /[Ss]elecciona/ },
  "length-tone": { name: "Ajustar longitud y tono", how: "Usa los botones de la esquina inferior del documento: «Ajustar longitud» y «Cambiar tono».", pattern: /Ajustar longitud|Cambiar tono/ },
  "code-preview": { name: "Código con vista previa", how: "Gemini escribe HTML, CSS y JavaScript y lo ejecuta en la pestaña «Vista previa»; «Código» muestra la fuente.", pattern: /[Vv]ista previa/ },
  "console-fix": { name: "Consola y corrección de errores", how: "Si la vista previa falla, abre la consola o usa «Corregir error» para que Gemini repare el código.", pattern: /consola|Corregir error/i },
  "create-webpage": { name: "Crear → Página web", how: "Desde un documento, abre «Crear» y elige «Página web» para convertir el contenido en un sitio interactivo.", pattern: /Crear → Página web/ },
  "create-infographic": { name: "Crear → Infografía", how: "Desde un documento, abre «Crear» y elige «Infografía» para resumir los datos en una pieza visual.", pattern: /Crear → Infografía/ },
  "create-quiz": { name: "Crear → Cuestionario", how: "Desde un documento, abre «Crear» y elige «Cuestionario» para generar preguntas con retroalimentación.", pattern: /Crear → Cuestionario/ },
  "create-audio": { name: "Crear → Resumen en audio", how: "Desde un documento, abre «Crear» y elige «Resumen en audio» para escuchar el contenido como conversación.", pattern: /Crear → Resumen en audio/ },
  "create-slides": { name: "Presentación y exportación a Presentaciones de Google", how: "Pide en el chat una presentación a partir del documento y expórtala con «Exportar a Presentaciones de Google».", pattern: /Presentaciones de Google/ },
  "gemini-in-app": { name: "Funciones de Gemini dentro de la app", how: "En una app con vista previa, usa «Agregar funciones de Gemini» para que la app genere texto con IA (mayores de 18 años).", pattern: /funciones de Gemini/ },
  "image-input": { name: "Imagen como punto de partida", how: "Adjunta una foto o captura (boceto, pizarra, pantalla) junto al prompt; Gemini la interpreta y la convierte en código.", pattern: /[Aa]djunta/ },
  "export-docs": { name: "Exportar a Documentos de Google", how: "Abre «Compartir y exportar» y elige «Exportar a Documentos de Google»; se crea una copia editable en tu Drive.", pattern: /Documentos de Google/ },
  "export-colab": { name: "Exportar a Colab", how: "Con código Python en Canvas, abre «Compartir y exportar» y elige «Exportar a Colab» para ejecutarlo en un cuaderno.", pattern: /Exportar a Colab/ },
  "share": { name: "Compartir el Canvas", how: "Usa «Compartir» para enviar un enlace público con la app o el documento funcionando.", pattern: /«Compartir»/ },
  "gems": { name: "Gems con Canvas", how: "En «Explorar Gems → Nuevo Gem» pega las instrucciones; luego usa el Gem con Canvas activo.", pattern: /Nuevo Gem/ },
  "select-ask": { name: "Seleccionar y preguntar en la vista previa", how: "En la vista previa web, activa «Seleccionar y preguntar», haz clic en un elemento visual y pide el cambio.", pattern: /Seleccionar y preguntar/ },
  "versions": { name: "Historial de versiones y cambios", how: "Usa «Versión anterior» o «Mostrar cambios recientes» en la barra superior de Canvas para comparar o restaurar.", pattern: /Versión anterior|Mostrar cambios recientes/ },
  "manual-edit": { name: "Edición directa y formato en el lienzo", how: "Haz clic directamente en el documento de Canvas para editar palabras o aplicar formato desde la barra inferior.", pattern: /directamente en el documento|barra de formato/ },
  "file-input": { name: "Archivo adjunto o de Drive como fuente", how: "Adjunta un archivo CSV, PDF o documento desde el botón «+» del chat para que Canvas construya el artefacto con esos datos.", pattern: /mesa_ayuda_2026\.csv|archivo adjunto/i },
  "deep-research": { name: "De Deep Research a Canvas", how: "Genera una investigación con Deep Research y ábrela en Canvas desde «Crear» para convertirla en informe, infografía o página web.", pattern: /Deep Research/ },
  "suggest-edits": { name: "Sugerencias de edición", how: "Selecciona texto del documento y pulsa «Sugerencias de edición» para que Gemini proponga cambios que aceptas o rechazas uno por uno.", pattern: /Sugerencias de edición/ },
  "latex": { name: "Fórmulas con LaTeX", how: "Desde el menú «Crear» del documento, agrega fórmulas en LaTeX para que se muestren con formato matemático.", pattern: /LaTeX/ },
  "export-pdf": { name: "Exportar a PDF con vista previa", how: "Abre «Compartir y exportar → Exportar a PDF» y revisa la vista previa antes de guardar el archivo.", pattern: /Exportar a PDF/ },
  "copy-canvas": { name: "Copiar un Canvas compartido", how: "Quien abre un enlace compartido pulsa «Copiar Canvas» para tener su propia copia editable sin tocar el original.", pattern: /Copiar Canvas/ }
};

function canvasCapabilityNames(ids) {
  return (ids || []).filter(id => CANVAS_CAPABILITIES[id]).map(id => CANVAS_CAPABILITIES[id].name);
}

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
    code: "1A",
    capabilities: ["doc-create", "inline-edit", "length-tone", "create-webpage", "export-docs"],
    whyCanvas: "El informe queda en un documento editable junto al chat: corriges una sección sin regenerar todo y, con «Crear → Página web», lo conviertes en un tablero sin copiar datos.",
    outsideCanvas: "El texto base podría redactarse en el chat normal, pero la edición por párrafo sin regenerar la tabla y la conversión directa con «Crear → Página web» ocurren en Canvas; el paso final abre Documentos de Google fuera de Gemini.",
    title: "Informe de deserción con tablero interactivo en Canvas",
    level: "Básico",
    duration: "25 min",
    canvasFeature: "Documento + Selección con cursor + Transformación a tablero web en Canvas",
    goal: "Convertir una tabla de deserción en un informe ejecutivo claro y, desde el mismo Canvas, transformar el documento en un tablero web interactivo con tarjetas KPI y gráfico de barras para presentar al comité.",
    scenario: "La coordinación académica debe presentar el lunes cómo bajó la deserción durante 2025 y qué acciones funcionaron. Solo tienes la tabla trimestral y la encuesta de salida.",
    promptParts: {
      role: "analista de calidad educativa que prepara informes para comités directivos",
      context: "El comité académico se reúne el lunes para decidir qué acciones contra la deserción mantener en 2026. Leerá el informe en cinco minutos.",
      data: IN_DESERCION,
      instruction: "En Canvas, redacta un informe ejecutivo con:",
      task: ["Un resumen de máximo cinco líneas con la conclusión principal.", "Una tabla con la tasa de cada trimestre y su variación en puntos frente al trimestre anterior.", "Las causas de deserción ordenadas de mayor a menor, con su porcentaje.", "Tres recomendaciones para 2026, cada una con un responsable sugerido y un indicador."],
      constraints: ["Usa solo estos datos; si una acción no se puede relacionar con certeza con un resultado, dilo.", "No inventes cifras ni nombres de personas."],
      format: "Títulos numerados, una tabla y frases cortas en español de Colombia.",
      tone: "Formal y directo, pensado para un comité directivo."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "external", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Selecciona la sección de recomendaciones y escribe en el cuadro de edición: «Agrega una meta numérica para 2026 a cada recomendación».",
      "Usa «Ajustar longitud → Más corto» y comprueba que la tabla se conserve.",
      "Abre «Crear → Página web» sobre el informe y, en la «Vista previa», comprueba las tarjetas KPI y el gráfico de la caída de deserción.",
      "(Opcional) Exporta el informe con «Compartir y exportar → Exportar a Documentos de Google» si necesitas una copia editable fuera de Gemini.",
      "Revisa tu entregable con la lista «Verifica tu resultado» de esta guía y marca cada criterio cumplido."
    ],
    expected: [
      "El resumen menciona la caída de 9,0 % a 3,6 % (5,4 puntos).",
      "La tabla muestra las cuatro tasas y la variación entre trimestres.",
      "La dificultad económica aparece como primera causa (39 % de 105).",
      "Cada recomendación tiene responsable, indicador y la meta numérica para 2026 que pediste por selección.",
      "La página web muestra tarjetas KPI y un gráfico con la caída de 9,0 % a 3,6 %.",
      "Después de «Ajustar longitud → Más corto», el informe en Canvas conserva la tabla completa."
    ],
    stretch: "Selecciona la tabla del informe y pide: «Agrega una columna que diga si el trimestre cumplió la meta de bajar al menos un punto». Así practicas editar una tabla sin regenerar el resto.",
    previewSvg: canvasSvgBars("Gráfico de barras con la tasa de deserción por trimestre de 2025: 9,0; 7,8; 5,5 y 3,6 por ciento", "Tasa de deserción 2025 (%)", ["T1", "T2", "T3", "T4"], [9.0, 7.8, 5.5, 3.6], 3)
  },
  {
    id: "doc-b-propuesta-huerta",
    code: "1B",
    capabilities: ["doc-create", "inline-edit", "length-tone", "manual-edit", "versions", "create-quiz", "export-docs"],
    whyCanvas: "Canvas mantiene la propuesta como documento vivo: editas directamente palabras, comparas versiones, ajustas el tono y, con «Crear → Cuestionario», generas el repaso desde el mismo texto.",
    outsideCanvas: "La redacción inicial podría pedirse en el chat, pero la edición directa con barra de formato, el historial de versiones y «Crear → Cuestionario» son exclusivos de Canvas; la exportación abre Documentos de Google.",
    title: "Propuesta de proyecto productivo con cuestionario de repaso",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Edición directa + Historial de versiones + Cuestionario + Exportar a Docs",
    goal: "Redactar una propuesta formal de proyecto productivo con presupuesto y cronograma, y generar un cuestionario para que el equipo de aprendices domine la propuesta.",
    scenario: "Un equipo quiere financiar una huerta hidropónica con recursos del centro. La propuesta debe convencer al comité y el equipo debe sustentarla sin leer.",
    promptParts: {
      role: "formulador de proyectos productivos para convocatorias institucionales",
      context: "Un equipo de aprendices presentará esta propuesta al comité de proyectos del centro para obtener financiación. El comité decide por viabilidad, costos y valor formativo.",
      data: IN_HUERTA,
      instruction: "En Canvas, redacta la propuesta con:",
      task: ["El problema, la justificación pedagógica y el objetivo general.", "Tres objetivos específicos medibles, cada uno ligado a un indicador de los datos.", "El presupuesto con el porcentaje de cada rubro y el cronograma por fases.", "El costo por kilogramo si toda la inversión se carga al primer ciclo y los kilos que hay que vender a 9.000 COP para recuperarla.", "Tres riesgos con su medida de mitigación."],
      constraints: ["Muestra los cálculos paso a paso.", "Montos en pesos colombianos con punto de miles.", "Si la inversión no se recupera en las 16 semanas, dilo con claridad y propón una medida."],
      format: "Documento formal con títulos numerados y dos tablas.",
      tone: "Formal y persuasivo, propio de una convocatoria institucional."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "external", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Haz clic directamente en el documento de Canvas para escribir el nombre de tu ficha y aplica formato de encabezado desde la barra de formato inferior.",
      "Selecciona el párrafo de justificación y escribe: «Relaciónalo con las competencias del programa de formación».",
      "Usa «Cambiar tono → Más formal» y luego abre «Mostrar cambios recientes» o «Versión anterior» en la barra superior de Canvas para comparar el ajuste.",
      "Abre «Crear → Cuestionario» sobre la propuesta, respóndelo y revisa la retroalimentación de cada pregunta.",
      "(Opcional) Exporta la propuesta a Documentos de Google desde «Compartir y exportar» si el comité la pide en Drive.",
      "Revisa tu entregable con la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "La tabla de presupuesto suma 8.000.000 COP y la estructura NFT pesa 40 %.",
      "Los tres objetivos específicos tienen un indicador medible.",
      "El costo del primer ciclo es 8.000.000 ÷ 220 kg ≈ 36.364 COP por kg y el punto de equilibrio a 9.000 COP es ≈ 889 kg.",
      "El informe concluye que la inversión no se recupera en las 16 semanas (dos ciclos dan 440 kg y 3.960.000 COP) y propone una medida.",
      "El cronograma cubre las 16 semanas sin huecos.",
      "El cuestionario de «Crear → Cuestionario» pregunta por presupuesto, cronograma e indicadores y explica cada respuesta.",
      "«Mostrar cambios recientes» o «Versión anterior» deja ver la diferencia del cambio de tono."
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
    code: "2A",
    capabilities: ["code-preview", "console-fix"],
    whyCanvas: "En el chat solo verías código; Canvas lo ejecuta en la vista previa, así pruebas los controles y corriges errores desde la consola sin salir de Gemini.",
    outsideCanvas: "Todos los pasos en Gemini se ejecutan dentro de Canvas (código, vista previa en vivo y consola de errores); no necesitas salir a un editor externo.",
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
      task: ["Ajustar el porcentaje de cada categoría con un control deslizante y ver su valor en pesos.", "Mantener la suma en 100 % repartiendo la diferencia entre las demás categorías.", "Ver la distribución en un gráfico de dona que se actualice en vivo, dibujado con SVG.", "Recibir las alertas de las reglas de negocio.", "Restablecer los valores iniciales."],
      constraints: ["Formato de moneda colombiano.", "Diseño responsivo y accesible: contraste AA y controles con etiqueta.", "Sin librerías externas ni descargas de archivos."],
      format: "Un solo archivo HTML con CSS y JavaScript.",
      tone: "Sencillo y amable: lo usará gente sin formación técnica."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.",
      "Sube «Logística» a 50 % y observa cómo se redistribuyen las demás categorías.",
      "Baja «Imprevistos» a 6 % y comprueba que aparezca la advertencia.",
      "Si la vista previa muestra un error, abre la consola o usa «Corregir error» en Canvas para repararlo.",
      "Pide en el chat de la izquierda: «Agrega un botón que muestre la distribución en formato CSV dentro de un cuadro de texto para copiarla y un interruptor de modo oscuro».",
      "Comprueba todos los puntos en la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "La app abre en la vista previa sin errores.",
      "Los valores iniciales en pesos son 4.200.000 / 3.000.000 / 1.800.000 / 1.800.000 / 1.200.000.",
      "La suma de porcentajes se mantiene en 100 al mover cualquier control.",
      "La dona cambia en vivo con animación.",
      "Las alertas roja y amarilla aparecen según las reglas.",
      "El cuadro de texto con el CSV lista las cinco categorías y el modo oscuro funciona."
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
    code: "2B",
    capabilities: ["code-preview", "inline-edit", "select-ask", "versions"],
    whyCanvas: "La app corre en la vista previa y puedes señalar un elemento con «Seleccionar y preguntar», editar solo una función en el código o volver a una versión anterior.",
    outsideCanvas: "Todo el flujo técnico transcurre 100 % dentro de Canvas (pestañas «Vista previa», «Código», «Seleccionar y preguntar» e historial de versiones). Nota: como la vista previa se ejecuta en un contenedor aislado (sandbox), algunas sesiones no conservan localStorage al recargar; por eso incluimos exportación/importación JSON como respaldo.",
    title: "Tablero Kanban arrastrable con gráfico de avance del sprint",
    level: "Avanzado",
    duration: "35 min",
    canvasFeature: "Vista previa + Seleccionar y preguntar + Historial de versiones",
    goal: "Crear un tablero Kanban funcional con arrastrar y soltar, contadores por columna y un gráfico burndown que compara el avance ideal y el real.",
    scenario: "El equipo del sprint 3 quiere ver en una sola pantalla qué tareas faltan y si va atrasado frente a la línea ideal.",
    promptParts: {
      role: "desarrollador frontend con experiencia en herramientas ágiles",
      context: "El equipo del sprint 3 necesita ver en una sola pantalla qué falta y si va atrasado frente al plan.",
      data: IN_KANBAN,
      instruction: "En Canvas, crea un tablero Kanban web que:",
      task: ["Muestre las tareas en las columnas Por hacer, En curso y Hecho.", "Permita mover las tarjetas arrastrándolas y también con el teclado.", "Sume los puntos de cada columna y muestre el avance del sprint.", "Incluya un gráfico burndown con la línea ideal y la real, dibujado con SVG.", "Filtre las tarjetas por responsable."],
      constraints: ["Sin frameworks: solo HTML, CSS y JavaScript.", "Cada tarjeta debe poder enfocarse y tener una etiqueta para lectores de pantalla."],
      format: "Un solo archivo HTML ejecutable.",
      tone: "Técnico y conciso en los comentarios del código."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas, arrastra la tarea T3 a «Hecho» y filtra por «Ana».",
      "En la «Vista previa», activa «Seleccionar y preguntar», haz clic sobre el encabezado de una columna y pide: «Muestra el porcentaje de puntos de esta columna frente al total».",
      "Pasa a «Código», selecciona la función del gráfico y escribe: «Marca los días en que la línea real supera a la ideal».",
      "Usa «Versión anterior» y «Mostrar cambios» en la barra superior de Canvas para comparar la diferencia del código y regresa a la versión más reciente.",
      "Pide en el chat de la izquierda: «Guarda el estado del tablero en localStorage y agrega dos botones: Exportar muestra el JSON en un cuadro de texto e Importar lo lee desde ese cuadro, por si el contenedor aislado de la vista previa reinicia la sesión».",
      "Revisa todos los criterios en la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "Al inicio, Hecho suma 11 puntos (T1, T2, T8) y el progreso es 27,5 %.",
      "Las tarjetas se mueven con ratón y con teclado.",
      "El burndown muestra la línea ideal y la real; la real queda por encima desde el día 2 y cierra con 29 puntos pendientes.",
      "El filtro por responsable funciona sin recargar.",
      "Los contadores se actualizan al soltar una tarjeta.",
      "El estado se conserva con localStorage o mediante los botones de exportar e importar JSON."
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
    code: "3A",
    capabilities: ["code-preview", "inline-edit", "share"],
    whyCanvas: "Una tabla sola la daría el chat; en Canvas los datos se vuelven un tablero que se ejecuta, se ajusta por selección y se comparte con un enlace.",
    outsideCanvas: "La tabla y el gráfico interactivo corren dentro de Canvas; si tu cuenta institucional restringe enlaces públicos en «Compartir», usa «Copiar contenido» para guardar el HTML.",
    title: "Tablero de ventas anuales con gráfico y recomendaciones en vivo",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Canvas de código + Vista previa + edición por selección + Compartir",
    goal: "Convertir 12 meses de ventas en un tablero web que calcule totales, participación y crecimiento, y que puedas filtrar y compartir.",
    scenario: "La tienda del centro debe decidir qué producto promocionar en 2026 y en qué meses reforzar inventario.",
    promptParts: {
      role: "analista comercial de pequeñas unidades productivas",
      context: "La tienda del centro debe decidir qué producto promocionar en 2026 y en qué meses reforzar el inventario.",
      data: IN_VENTAS,
      instruction: "En Canvas, crea un tablero web de una sola página con:",
      task: ["Una tabla con el total de cada mes y su variación porcentual frente al mes anterior.", "Los totales anuales y la participación de cada producto.", "El mes pico, el mes más bajo y el producto que más creció de enero a diciembre.", "Un gráfico de barras apiladas por mes, dibujado con SVG, y tres recomendaciones de inventario y promoción basadas en esas cifras."],
      constraints: ["Cifras en miles de COP con separador de miles y porcentajes con un decimal.", "Calcula todo en JavaScript a partir de los datos, sin librerías externas."],
      format: "Un solo archivo HTML con CSS y JavaScript.",
      tone: "Claro y práctico, para el dueño de un negocio pequeño."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Abre la «Vista previa» y revisa los totales anuales y el gráfico de barras apiladas.",
      "Pide en el chat de la izquierda: «Colorea cada total mensual con una escala de color de menor a mayor».",
      "En el código, selecciona la función que calcula la variación mensual y escribe: «Muestra la variación con signo y un decimal, en rojo si es negativa».",
      "Pide en el chat de la izquierda: «Agrega un botón que copie la tabla en formato CSV» y pruébalo en la vista previa.",
      "Usa «Compartir» en «Compartir y exportar» para generar el enlace del tablero (ruta alternativa en cuenta institucional `@soy.sena.edu.co`: si el administrador deshabilitó enlaces públicos, usa «Copiar contenido» y guarda el archivo `.html`).",
      "Comprueba las cifras con la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "El total anual es 120.250 (café 62.700, panela 31.100, queso 26.450).",
      "El café concentra cerca de 52 % de las ventas.",
      "Diciembre aparece como pico y febrero como mes más bajo.",
      "Las recomendaciones citan cifras de la tabla.",
      "La vista previa muestra barras apiladas por mes y tarjetas KPI.",
      "El botón copia la tabla en CSV sin errores en la consola."
    ],
    stretch: "Pide: «Agrega un filtro por trimestre y una línea de tendencia sobre el total mensual».",
    previewSvg: canvasSvgBars("Gráfico de barras con el total mensual de ventas 2025 en miles de pesos; diciembre es el pico con 14.100", "Total mensual 2025 (miles COP)", ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], [8100, 7650, 8700, 9050, 9600, 9350, 10000, 10600, 10100, 11100, 11900, 14100], 11)
  },
  {
    id: "data-b-matriz-riesgos",
    code: "3B",
    capabilities: ["code-preview", "inline-edit", "share"],
    whyCanvas: "El mapa de calor 5 × 5 funciona en la vista previa: haces clic en cada celda, ajustas una parte por selección y compartes la app con el comité.",
    outsideCanvas: "El cálculo de niveles podría hacerse en chat, pero el mapa de calor interactivo 5 × 5 y la edición por selección de celdas requieren Canvas.",
    title: "Matriz de riesgos con mapa de calor interactivo",
    level: "Intermedio",
    duration: "25 min",
    canvasFeature: "Canvas de código + Vista previa + edición por selección + Compartir",
    goal: "Calcular el nivel de cada riesgo, priorizarlos y visualizarlos en un mapa de calor 5 × 5 donde se pueda consultar cada celda.",
    scenario: "Antes del comité de seguimiento, el líder del proyecto debe mostrar qué riesgos atender primero y con qué plan.",
    promptParts: {
      role: "gestor de proyectos de software con experiencia en gestión de riesgos",
      context: "El líder del proyecto presentará al comité de seguimiento qué riesgos atender primero y cómo hacerlo.",
      data: IN_RIESGOS,
      instruction: "En Canvas, construye la matriz de riesgos:",
      task: ["Calcula el nivel de cada riesgo y clasifícalo con los umbrales de los datos.", "Ordena los riesgos de mayor a menor nivel.", "Asigna a cada riesgo una respuesta (evitar, mitigar, transferir o aceptar) y una acción concreta."],
      constraints: ["Usa exactamente los umbrales entregados.", "Propón acciones realistas para un equipo de cinco personas."],
      format: "Tabla con las columnas id, riesgo, probabilidad, impacto, nivel, clasificación, respuesta y acción.",
      tone: "Técnico y objetivo, sin dramatizar los riesgos."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Selecciona la columna de acciones en el lienzo y escribe: «Agrega un responsable y una fecha límite a cada acción».",
      "Pide en el chat de la izquierda: «Crea una aplicación web con un mapa de calor 5 x 5 de estos riesgos; al hacer clic en una celda, muestra sus riesgos y acciones».",
      "En la «Vista previa», haz clic en la celda de probabilidad 2 e impacto 5 y comprueba los dos riesgos.",
      "Usa «Compartir» para generar el enlace al comité de seguimiento (ruta alternativa en `@soy.sena.edu.co`: usa «Copiar contenido» o «Exportar a Documentos de Google» si los enlaces públicos están restringidos).",
      "Revisa tu entregable con la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "Hay 4 riesgos críticos: R9 (20), R2 (16), R7 (15) y R8 (15).",
      "Hay 5 riesgos altos: R5 y R6 (12), R1 y R4 (10) y R3 (9).",
      "R10 (4) es el único riesgo medio y ninguno queda en Bajo.",
      "El mapa muestra 2 riesgos en la celda probabilidad 2 / impacto 5.",
      "Al hacer clic en una celda aparece la lista con acciones.",
      "El enlace de «Compartir» (o la copia exportada) abre la matriz funcionando."
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

Plan del proyecto (año 2026; duraciones en días calendario):
Tarea,Inicio,Duración
Diseño del flujo,2026-11-16,5 días
Endpoint de login,2026-11-23,4 días
Middleware de validación,2026-11-27,3 días
Refresh token,2026-12-02,3 días
Pruebas de seguridad,2026-12-07,4 días
Despliegue (hito),2026-12-11,0 días`;

const REF_MATRICULA = `flowchart LR
  subgraph ASP[Aspirante]
    INI([Inicio])
    REG[Se registra y elige programa]
    PRU[Presenta prueba de conocimientos]
    CAR[Carga documentos faltantes]
  end
  subgraph PLA[Plataforma de inscripción]
    D1{¿Matrícula activa?}
    NOT([Notifica y termina])
    BIE[Envía correo de bienvenida]
    FIN([Aprendiz matriculado])
  end
  subgraph BIEN[Bienestar]
    ENT[Entrevista y verifica documentos]
    D3{¿Documentos completos?}
    D4{¿Cargó en 3 días?}
    LIB([Cupo liberado])
  end
  subgraph COO[Coordinación académica]
    REV[Revisa el puntaje]
    D2{¿Puntaje ≥ 60?}
    ESP([Lista de espera y correo])
    ASI[Asigna ficha y horario]
  end
  INI --> REG --> D1
  D1 -- Sí --> NOT
  D1 -- No --> PRU --> REV --> D2
  D2 -- No --> ESP
  D2 -- Sí --> ENT --> D3
  D3 -- No --> CAR --> D4
  D4 -- No --> LIB
  D4 -- Sí --> ASI
  D3 -- Sí --> ASI --> BIE --> FIN
  classDef feliz fill:#d9f2e3,stroke:#2d5a4c,stroke-width:3px
  class INI,REG,D1,PRU,REV,D2,ENT,D3,ASI,BIE,FIN feliz`;

const REF_JWT = `sequenceDiagram
  actor U as Usuario
  participant W as App web
  participant A as API de autenticación
  participant B as Base de datos
  participant C as API de citas
  U->>W: Escribe correo y contraseña
  W->>A: POST /auth/login
  A->>B: Consulta usuario
  B-->>A: Hash de la contraseña
  alt Credenciales inválidas
    A-->>W: 401
    W-->>U: Credenciales incorrectas
  else Credenciales válidas
    Note over A: Access token 15 min y refresh token 7 días
    A-->>W: 200 con los dos tokens
    W->>C: GET /citas con Bearer token
    alt Access token vigente
      C-->>W: 200 con las citas
    else Access token expirado
      C-->>W: 401
      W->>A: POST /auth/refresh
      A-->>W: 200 con access token nuevo
      W->>C: Repite GET /citas
      C-->>W: 200 con las citas
    end
  end

gantt
  title Plan del inicio de sesión con JWT (2026)
  dateFormat YYYY-MM-DD
  axisFormat %d/%m
  section Desarrollo
  Diseño del flujo         :t1, 2026-11-16, 5d
  Endpoint de login        :t2, 2026-11-23, 4d
  Middleware de validación :t3, 2026-11-27, 3d
  Refresh token            :t4, 2026-12-02, 3d
  section Calidad
  Pruebas de seguridad     :crit, t5, 2026-12-07, 4d
  section Entrega
  Despliegue               :milestone, t6, 2026-12-11, 0d`;

CANVAS_EXERCISES["flowchart-diagram"] = [
  {
    id: "flow-a-matricula-swimlanes",
    code: "4A",
    capabilities: ["code-preview", "console-fix", "inline-edit"],
    whyCanvas: "Canvas dibuja el diagrama en la vista previa; si Mermaid falla, la consola muestra el error y Gemini lo corrige en el mismo panel, sin instalar nada.",
    outsideCanvas: "Todo ocurre dentro de Canvas: el código Mermaid se escribe en «Código», el diagrama se ve en «Vista previa» y el código de referencia de esta guía se pega en el mismo chat de la izquierda para compararlo. No necesitas Mermaid Live ni otro editor.",
    title: "Flujograma de matrícula por carriles con Mermaid",
    level: "Intermedio",
    duration: "25 min",
    canvasFeature: "Código Mermaid renderizado en vista previa",
    goal: "Convertir un procedimiento escrito en un diagrama de flujo por carriles, con decisiones, camino feliz resaltado y tabla de tiempos, que puedas revisar y ajustar sin salir de Canvas.",
    scenario: "Bienestar y coordinación tienen versiones distintas del proceso de matrícula. Un diagrama único evita confusiones en la reunión de alineación.",
    promptParts: {
      role: "analista de procesos que documenta con diagramas Mermaid",
      context: "Bienestar y coordinación académica tienen versiones distintas del proceso de matrícula. Se necesita un diagrama único para proyectarlo en la reunión de alineación.",
      data: IN_MATRICULA,
      instruction: "En Canvas, crea una página web que muestre el proceso como diagrama de flujo con:",
      task: [
        "Un diagrama «flowchart LR» con un bloque «subgraph» por actor (Aspirante, Plataforma de inscripción, Bienestar y Coordinación académica); cada subgraph es un carril.",
        "Nodos de inicio y fin con forma redondeada y rombos {} para las cuatro decisiones: matrícula activa, puntaje >= 60, documentos completos y carga en 3 días.",
        "El camino feliz resaltado con un «classDef» y terminado en el nodo «Aprendiz matriculado»; usa el identificador ENT para el nodo de la entrevista.",
        "Debajo del diagrama, una tabla con la duración de cada etapa y el tiempo total del camino feliz.",
        "Un botón «Copiar código Mermaid» y un conmutador «Vista vertical» que vuelva a dibujar el diagrama con «flowchart TB»."
      ],
      constraints: ["Carga Mermaid 10 desde https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js con sintaxis válida de flowchart; si no carga, muestra un aviso y el código en un bloque de texto.", "Máximo seis palabras por nodo para que se lea en el proyector.", "No uses descargas de archivos: la vista previa de Canvas puede bloquearlas."],
      format: "Un solo archivo HTML ejecutable.",
      tone: "Claro y neutral, con etiquetas cortas en los nodos."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas y cuenta los cuatro carriles y las cuatro decisiones.",
      "Si en lugar del diagrama ves texto o un aviso de error, usa «Corregir error» o pide en el chat de la izquierda: «Corrige la sintaxis de Mermaid sin cambiar el contenido del diagrama».",
      "En «Código», selecciona la línea que empieza por ENT y escribe: «Agrega al texto del nodo su duración de 3 días».",
      "En la «Vista previa», activa el conmutador «Vista vertical» y comprueba que el diagrama se dibuje de arriba hacia abajo sin cortarse.",
      "Copia el código de referencia de esta guía, pégalo en el chat de la izquierda con la frase: «Muestra este diagrama debajo del tuyo para compararlos» y anota qué le falta a tu versión.",
      "Comprueba todos los criterios en la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "La vista previa muestra cuatro carriles con el nombre de cada actor.",
      "Aparecen cuatro decisiones en rombo: matrícula activa, puntaje ≥ 60, documentos completos y carga en 3 días.",
      "El camino feliz está resaltado y termina en «Aprendiz matriculado».",
      "La tabla muestra un tiempo total de 8 días en el camino feliz (1 + 2 + 1 + 3 + 1).",
      "El nodo de la entrevista muestra su duración de 3 días.",
      "El conmutador «Vista vertical» redibuja el diagrama de arriba hacia abajo sin desbordarse."
    ],
    reference: {
      label: "Código Mermaid de referencia para comparar",
      intro: "Cópialo y pégalo en el chat de la izquierda de Canvas con la frase «Muestra este diagrama debajo del tuyo para compararlos». Gemini lo dibuja en la misma vista previa, sin salir de la herramienta.",
      code: REF_MATRICULA
    },
    stretch: "Pide: «Agrega indicadores de cuello de botella: colorea en ámbar la etapa más lenta y explica en una nota por qué lo es».",
    previewSvg: canvasSvgFlow("Diagrama de flujo por carriles del proceso de matrícula con cuatro actores", "Matrícula por carriles", [
      { name: "Aspirante", steps: ["Registro", "Prueba", "Carga docs"] },
      { name: "Plataforma", steps: ["¿Activa?", "Bienvenida"] },
      { name: "Bienestar", steps: ["Entrevista", "¿Docs?"] },
      { name: "Coordinación", steps: ["¿Puntaje?", "Asigna ficha"] }
    ])
  },
  {
    id: "flow-b-secuencia-jwt-gantt",
    code: "4B",
    capabilities: ["code-preview", "inline-edit", "share"],
    whyCanvas: "Los dos diagramas quedan en una página que se ejecuta en la vista previa; seleccionas solo el bloque gantt para cambiarlo y compartes el resultado con un enlace.",
    outsideCanvas: "Todo ocurre dentro de Canvas: pestañas, diagramas y glosario se prueban en «Vista previa», y el código de referencia se pega en el mismo chat de la izquierda. «Compartir» es opcional; si tu cuenta lo restringe, el resultado queda en tu chat de Gemini.",
    title: "Diagrama de secuencia JWT y cronograma Gantt en una sola página",
    level: "Avanzado",
    duration: "30 min",
    canvasFeature: "Mermaid (sequenceDiagram + gantt) en vista previa",
    goal: "Documentar el flujo de autenticación con tokens y el plan de implementación en dos diagramas conectados que se revisan en la vista previa de Canvas.",
    scenario: "El equipo de desarrollo debe explicar en la revisión técnica cómo funciona el login y cuándo estará listo.",
    promptParts: {
      role: "arquitecto de software que documenta flujos de autenticación",
      context: "El equipo explicará en la revisión técnica cómo funciona el inicio de sesión y cuándo estará listo.",
      data: IN_JWT,
      instruction: "En Canvas, crea una página web con dos diagramas Mermaid en pestañas:",
      task: [
        "Secuencia: un «sequenceDiagram» con los cinco participantes en el orden de los datos, bloques «alt/else» para los dos caminos de error (credenciales inválidas y token vencido) y una «Note» con la vigencia de cada token.",
        "Cronograma: un «gantt» con «dateFormat YYYY-MM-DD», las seis tareas con sus fechas y el despliegue marcado como «milestone»."
      ],
      constraints: ["Carga Mermaid 10 desde https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js; si no carga, muestra un aviso y el código en un bloque de texto.", "Los códigos HTTP y las fechas deben coincidir con los datos.", "Las pestañas deben funcionar con teclado y volver a dibujar el diagrama al mostrarse."],
      format: "Un solo archivo HTML ejecutable.",
      tone: "Técnico y preciso, con términos estándar de autenticación."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas y recorre las dos pestañas con la tecla Tab y las flechas.",
      "En la pestaña de secuencia, ubica los dos bloques de error 401; si un diagrama no se dibuja, usa «Corregir error».",
      "En «Código», selecciona el bloque gantt y escribe: «Marca como crítica la tarea de pruebas de seguridad».",
      "Pide en el chat de la izquierda: «Agrega una pestaña de glosario con JWT, access token, refresh token, firma y código 401, cada uno en una frase».",
      "Copia el código de referencia de esta guía y pégalo en el chat de la izquierda con la frase: «Compara estos diagramas con los tuyos y dime qué diferencias hay»; corrige lo que falte.",
      "(Opcional) Usa «Compartir» para enviar el enlace al equipo; si tu cuenta `@soy.sena.edu.co` restringe enlaces públicos, el resultado queda guardado en tu chat de Gemini.",
      "Verifica tu entregable con la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "El diagrama de secuencia muestra los cinco participantes en orden.",
      "Existen las ramas 401 por credenciales y 401 por token expirado con refresh.",
      "La nota indica 15 minutos para el access token y 7 días para el refresh token.",
      "El Gantt muestra seis tareas sin solapamiento, pruebas de seguridad marcada como crítica y el hito el 11/12/2026.",
      "Las pestañas funcionan con teclado y cada diagrama se dibuja al abrirla.",
      "El glosario explica los cinco términos en una frase cada uno."
    ],
    reference: {
      label: "Código Mermaid de referencia para comparar",
      intro: "Contiene los dos diagramas separados por una línea en blanco. Cópialo y pégalo en el chat de la izquierda para que Gemini lo compare con tu página o lo dibuje en la vista previa.",
      code: REF_JWT
    },
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
    code: "5A",
    capabilities: ["code-preview", "inline-edit", "select-ask"],
    whyCanvas: "Ves la landing funcionando, pruebas el formulario y el modo oscuro, y señalas un componente con «Seleccionar y preguntar» para ajustarlo sin tocar el resto.",
    outsideCanvas: "Todo el diseño, prueba del formulario, modo oscuro y ajuste visual con «Seleccionar y preguntar» ocurre 100 % dentro de Canvas (como la vista previa de Canvas no incluye un selector nativo de ancho móvil, simulamos el marco de 390 px con un conmutador propio dentro de la página).",
    title: "Landing de reservas con modo oscuro y ocupación en vivo",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Vista previa responsiva + Seleccionar y preguntar",
    goal: "Diseñar y construir una página de aterrizaje completa, accesible y con modo oscuro, que muestre la ocupación por franja con un gráfico.",
    scenario: "La biblioteca quiere lanzar las reservas en línea la próxima semana y necesita una página atractiva y clara para los aprendices.",
    promptParts: {
      role: "diseñador UI/UX que también desarrolla frontend",
      context: "La biblioteca lanzará la próxima semana las reservas en línea de cubículos. La página debe invitar a reservar y ser fácil de usar desde el celular.",
      data: IN_BIBLIO,
      instruction: "En Canvas, construye la landing con el contenido de los datos, incluyendo:",
      task: ["Un gráfico de ocupación por franja: verde por debajo de 75 %, ámbar entre 75 % y 89 % y rojo desde 90 %.", "Un contador de cubículos libres calculado con esos datos.", "Un formulario con validación en vivo y mensajes que expliquen cómo corregir.", "Un interruptor de modo oscuro."],
      constraints: ["Contraste WCAG AA, foco visible y uso completo con teclado.", "Responsiva desde 360 px y sin librerías externas."],
      format: "Un solo archivo HTML con colores definidos en variables CSS.",
      tone: "Cercano y claro en los textos de la interfaz."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas, prueba el formulario con letras y activa el modo oscuro.",
      "En la «Vista previa», activa «Seleccionar y preguntar», haz clic en el bloque héroe y pide: «Agrega una ilustración SVG sencilla de un escritorio con libros».",
      "En el código, selecciona la sección de horarios y escribe: «Destaca con un borde la franja con más cubículos libres».",
      "Pide en el chat de la izquierda: «Agrega en el encabezado un conmutador Vista móvil (390 px) / Vista escritorio que ajuste el contenedor principal a 390 px centrados y apile las columnas sin desbordamiento».",
      "Vuelve a la «Vista previa», activa la vista de 390 px y comprueba que el acordeón funcione con teclado.",
      "Verifica tu resultado con la lista de comprobación de esta guía."
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
    code: "5B",
    capabilities: ["code-preview", "inline-edit"],
    whyCanvas: "El prototipo multipantalla se navega en la vista previa como si fuera un teléfono, y cada pantalla se ajusta por selección.",
    outsideCanvas: "Toda la navegación entre las 4 pantallas móviles, la creación de reportes en memoria y la edición por selección se ejecutan dentro de Canvas.",
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
      format: "Un solo archivo HTML ejecutable, sin frameworks.",
      tone: "Cercano y directo en los textos de cada pantalla."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.",
      "Navega por las cuatro pantallas con la barra inferior.",
      "Crea un reporte de tipo Agua en «Bloque D-110» con prioridad Alta y búscalo en Inicio.",
      "En el código, selecciona la línea de tiempo del detalle y escribe: «Agrega la fecha y hora de cada cambio de estado».",
      "Pide en el chat de la izquierda: «Agrega un filtro por prioridad en Inicio».",
      "Comprueba todos los puntos en la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "Las cuatro pantallas navegan sin recargar.",
      "Inicio muestra los seis reportes con chip de estado legible.",
      "El nuevo reporte aparece con estado Recibido.",
      "La dona muestra 2 Eléctrico, 2 Red, 1 Agua y 1 Mobiliario (antes de crear reportes nuevos).",
      "El promedio de solución es (6 + 4 + 9) / 3 = 6,3 horas.",
      "Los botones cumplen el tamaño mínimo táctil."
    ],
    stretch: "Selecciona la pantalla Estadísticas en el código y pide: «Agrega una insignia con el número de reportes de prioridad Alta abiertos».",
    previewSvg: canvasSvgMock("Maqueta de cuatro pantallas móviles: inicio, reportar, detalle y estadísticas", "Prototipo Reporta Ya", "phone")
  }
];

// 6. Edición por selección (inline)
const IN_CORREO = `ASUNTO: Reunión obligatoria de acudientes

Señores acudientes:

Les informamos que el rendimiento del grupo es muy malo y que varios aprendices no están cumpliendo con nada. Si no asisten a la reunión, no nos hacemos responsables de lo que pase con la matrícula.

La reunión será el viernes 4 de diciembre de 2026 a las 6:00 p. m. en el auditorio principal. También se puede asistir por videollamada con el enlace que se enviará el miércoles.

Los temas son: resultados del trimestre, inasistencias, plan de mejoramiento, uso del celular en clase, salida pedagógica de enero.

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
    code: "6A",
    capabilities: ["doc-create", "inline-edit", "manual-edit", "versions"],
    whyCanvas: "El correo queda en un documento y corriges párrafo por párrafo; en el chat Gemini reescribiría todo y podría cambiar fechas o lugares.",
    outsideCanvas: "Este ejercicio es imposible en el chat estándar sin riesgo de alterar datos fijos: la selección por párrafo, la barra de formato y «Mostrar cambios recientes» son exclusivos de Canvas.",
    title: "Correo a acudientes: corregir tono párrafo por párrafo",
    level: "Básico",
    duration: "20 min",
    canvasFeature: "Selección de texto + Edición directa + Historial de versiones",
    goal: "Practicar la edición quirúrgica: corregir solo los fragmentos problemáticos de un correo sin que Canvas reescriba el resto.",
    scenario: "La coordinación redactó un correo con tono amenazante. Debe salir hoy, pero los datos de fecha, hora y lugar no pueden cambiar.",
    promptParts: {
      role: "editor de comunicaciones institucionales",
      context: "Voy a practicar la edición por selección en Canvas con un correo que tiene problemas de tono. Necesito el texto original intacto para corregirlo fragmento por fragmento.",
      data: IN_CORREO,
      instruction: "Copia el correo en Canvas sin cambiar ninguna palabra. Luego, en el chat:",
      task: ["Señala los tres fragmentos con más problemas de tono y explica cada uno en una línea, sin reescribirlos."],
      constraints: ["No cambies ninguna palabra del documento en este paso."],
      format: "Documento en Canvas y una lista breve en el chat.",
      tone: "Respetuoso y neutral en las observaciones del chat."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Selecciona solo el párrafo que empieza «Les informamos…» y escribe: «Reescríbelo con tono empático y propositivo, sin culpar a nadie».",
      "Selecciona la lista de temas y escribe: «Conviértela en viñetas ordenadas por prioridad».",
      "Selecciona la línea «Es obligatorio confirmar…» y escribe: «Pide la confirmación con amabilidad y fija como plazo el jueves 3 de diciembre».",
      "Haz clic directamente en el documento y pon en negrita la fecha con la barra de formato.",
      "Abre «Mostrar cambios recientes» en la barra superior de Canvas para verificar que la fecha, la hora y el lugar siguen intactos.",
      "Comprueba todos los criterios en la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "Solo cambiaron los fragmentos seleccionados.",
      "El párrafo inicial ya no contiene juicios como «muy malo» ni amenazas.",
      "Los temas aparecen como lista con viñetas.",
      "La solicitud de confirmación es amable e incluye el jueves 3 de diciembre.",
      "Fecha (viernes 4 de diciembre de 2026), hora (6:00 p. m.) y lugar quedaron intactos.",
      "El correo final se lee en menos de un minuto."
    ],
    stretch: "Selecciona el correo completo y pide: «Crea una versión corta para WhatsApp de máximo 400 caracteres».",
    previewSvg: canvasSvgMock("Maqueta de documento con un párrafo seleccionado y la acción Tono empático", "Edición por selección", "doc")
  },
  {
    id: "inline-b-depurar-funcion",
    code: "6B",
    capabilities: ["code-preview", "inline-edit"],
    whyCanvas: "Seleccionas solo la función con error y la vista previa confirma la corrección: es una depuración precisa que el chat no permite.",
    outsideCanvas: "Todos los pasos ocurren dentro de Canvas: seleccionas cada función en la pestaña «Código» y verificas el cálculo en «Vista previa».",
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
      format: "Código HTML ejecutable en Canvas y viñetas en el chat.",
      tone: "Didáctico: explica cada error sin dar la solución por adelantado."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Abre la «Vista previa», presiona «Calcular» y observa el resultado.",
      "Selecciona solo la función calcularPromedio y escribe: «Corrige el error del ciclo sin tocar nada más».",
      "Selecciona solo leerNotas y escribe: «Convierte cada nota a número y descarta los valores vacíos».",
      "Selecciona solo estado y escribe: «Un promedio de 3.5 debe quedar Aprobado».",
      "Selecciona la línea que muestra el promedio y escribe: «Muestra el promedio con un decimal usando toFixed(1)».",
      "Prueba en la «Vista previa» los tres casos de prueba de los datos.",
      "Marca los puntos cumplidos en la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "El ciclo usa i < notas.length.",
      "leerNotas devuelve números (Number o parseFloat) y filtra vacíos.",
      "estado usa promedio >= 3.5.",
      "Los tres casos muestran 4.1, 3.5 y 3.0 (un decimal con toFixed) y el estado correcto: Aprobado, Aprobado y Plan de mejoramiento.",
      "Las líneas que no seleccionaste quedaron iguales.",
      "La «Vista previa» muestra el promedio y el estado sin errores en la consola."
    ],
    stretch: "Pide: «Agrega validación para notas fuera de 1.0 a 5.0 y muestra un mensaje que diga cuál nota es inválida».",
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
    code: "7A",
    capabilities: ["code-preview", "inline-edit"],
    whyCanvas: "El Python se edita en Canvas y se ejecuta en la misma vista previa con Pyodide (Python dentro del navegador); la comparación de curvas también corre allí.",
    outsideCanvas: "Todo ocurre dentro de Canvas: la vista previa no ejecuta un archivo `.py` por sí sola, así que se pide una página web que cargue Pyodide desde CDN y corra las pruebas. Exportar a Colab queda como alternativa opcional, no como requisito.",
    title: "De O(n²) a O(n): refactorizar y visualizar la diferencia",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Canvas de código Python + Pyodide en vista previa + página HTML con gráfico",
    goal: "Refactorizar una búsqueda de duplicados cuadrática a lineal, explicarla y demostrar la mejora con un gráfico interactivo.",
    scenario: "El script que detecta documentos duplicados en la base de aprendices tarda demasiado. Hay que justificar el cambio ante el equipo.",
    promptParts: {
      role: "ingeniero de software que enseña complejidad algorítmica",
      context: "Esta función detecta documentos duplicados, pero con la base real de 10.000 registros tarda varios segundos. Necesito una versión eficiente y entender por qué lo es.",
      data: IN_DUPLICADOS,
      instruction: "En Canvas, entrega:",
      task: ["Una versión en Python con complejidad O(n) que conserve el orden de primera aparición.", "Tres pruebas con assert: la muestra, una lista vacía y una lista sin duplicados.", "Una explicación breve de por qué la versión original es O(n²) y la nueva O(n)."],
      constraints: ["Solo biblioteca estándar de Python.", "Explica para un aprendiz de primer trimestre, sin fórmulas innecesarias."],
      format: "Código Python con docstring, anotaciones de tipo y comentarios breves.",
      tone: "Didáctico y preciso, con ejemplos numéricos."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo para generar el código Python.",
      "Selecciona el bloque de pruebas en el lienzo Python y escribe: «Agrega una medición de tiempo con 10.000 elementos usando time.perf_counter».",
      "Pide en el chat de la izquierda: «Crea una página web que cargue Pyodide desde https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js, ejecute este código Python con sus pruebas y muestre ✓ o ✗ por prueba y el tiempo medido».",
      "Abre la «Vista previa» y revisa el resultado; si Pyodide no carga, pide la misma función y pruebas en JavaScript.",
      "De regreso en Gemini Canvas, pide en el chat: «Crea una página web con un gráfico de operaciones contra n para ambas versiones, con escala logarítmica y un control para elegir n».",
      "Abre la «Vista previa» del nuevo lienzo HTML, mueve el control hasta 10.000 y activa la escala logarítmica.",
      "Comprueba todos los criterios con la lista «Verifica tu resultado» de esta guía."
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
    code: "7B",
    capabilities: ["code-preview", "inline-edit"],
    whyCanvas: "La animación corre en la vista previa: comparas los algoritmos paso a paso y cambias solo la función de burbuja por selección.",
    outsideCanvas: "Toda la simulación animada en JavaScript y la edición por selección de la función de ordenamiento ocurren 100 % dentro de Canvas.",
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
      format: "Un solo archivo HTML ejecutable.",
      tone: "Didáctico y visual, con rótulos breves."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.",
      "Presiona «Iniciar» con velocidad media y espera a que ambos terminen.",
      "Reinicia y usa «Paso a paso» en merge sort; observa qué subarreglos mezcla en cada paso.",
      "En el código, selecciona la función de burbuja y escribe: «Agrega parada temprana y muestra cuántas comparaciones ahorra».",
      "Pide en el chat de la izquierda: «Agrega un botón que genere un arreglo aleatorio de 16 valores».",
      "Verifica todos los resultados con la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "Ambos paneles terminan con el arreglo ordenado esperado.",
      "Burbuja registra 120 comparaciones sin parada temprana.",
      "Merge sort registra 47 comparaciones con la mezcla estándar (puede variar en 1 o 2 según cómo escribas la comparación).",
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
    code: "8A",
    capabilities: ["doc-create", "inline-edit", "code-preview", "gemini-in-app", "export-docs"],
    whyCanvas: "La rúbrica se pule celda por celda en el documento, se vuelve una calculadora ejecutable y, con funciones de Gemini, la app redacta la retroalimentación.",
    outsideCanvas: "El documento y la calculadora web viven en Canvas; la exportación final abre Documentos de Google fuera de Gemini.",
    title: "Rúbrica analítica con calculadora de nota y gráfico radar",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Documento + edición por selección + app con funciones de Gemini + Exportar a Docs",
    goal: "Redactar una rúbrica con descriptores observables y convertirla en una calculadora que muestre la nota y el perfil del aprendiz en un radar.",
    scenario: "Tres instructores califican el mismo proyecto y obtienen notas distintas. Una rúbrica precisa y una calculadora común reducen la diferencia.",
    promptParts: {
      role: "especialista en evaluación por competencias en formación técnica",
      context: "Tres instructores califican el mismo proyecto y obtienen notas distintas. Necesitamos una rúbrica que cualquiera aplique de la misma forma.",
      data: IN_RUBRICA,
      instruction: "En Canvas, construye:",
      task: ["La rúbrica de 4 criterios por 4 niveles, con un descriptor observable en cada celda.", "El cálculo paso a paso de la nota del aprendiz 1 y su resultado según la regla.", "Una retroalimentación de tres líneas para el aprendiz 1, centrada en su criterio más bajo."],
      constraints: ["Cada descriptor nombra una evidencia verificable en el código o la entrega; evita adjetivos como «bueno» o «adecuado».", "Tono respetuoso y orientado a la mejora."],
      format: "Tabla de rúbrica, seguida del cálculo y la retroalimentación.",
      tone: "Formativo y respetuoso con el aprendiz evaluado."
    },
    places: ["canvas", "canvas", "external", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Selecciona una celda que te parezca ambigua y escribe: «Hazla verificable con una evidencia concreta».",
      "(Opcional) Exporta la rúbrica con «Compartir y exportar → Exportar a Documentos de Google» para compartirla con otros instructores.",
      "Pide en el chat de la izquierda: «Crea una calculadora web: elijo el puntaje de 1 a 5 de cada criterio (se admiten valores intermedios), veo la nota en vivo y un radar del perfil frente al nivel esperado de 4».",
      "En la «Vista previa», carga los valores del aprendiz 1 y luego sube Pruebas a 4.",
      "Usa «Agregar funciones de Gemini» y pide: «Redacta la retroalimentación del aprendiz según su criterio más bajo» (ruta alternativa si tu cuenta `@soy.sena.edu.co` no muestra el botón: pide un generador determinista de retroalimentación en JavaScript por criterio y nivel).",
      "Verifica tu entregable con la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "La rúbrica tiene 16 descriptores observables.",
      "La nota del aprendiz 1 es 3,45 y el resultado es «Plan de mejoramiento».",
      "Con Pruebas en 4, la nota sube a 3,95 y el resultado pasa a «Aprobado».",
      "El radar muestra el perfil del aprendiz y la serie esperada.",
      "La retroalimentación del aprendiz 1 se enfoca en Pruebas, su criterio más bajo.",
      "La calculadora genera la retroalimentación en la vista previa de Canvas."
    ],
    stretch: "Pide: «Permite registrar 5 aprendices y muestra un radar promedio del grupo con el criterio más débil resaltado».",
    previewSvg: canvasSvgRadar("Gráfico radar con el perfil del aprendiz 1 frente al nivel esperado en cuatro criterios", "Perfil del aprendiz 1", ["Diseño", "Validación", "Documentación", "Pruebas"], [
      { name: "Esperado (4)", values: [4, 4, 4, 4], cls: "cx-m" },
      { name: "Aprendiz 1", values: [4, 3, 5, 2], cls: "cx-p" }
    ], 5)
  },
  {
    id: "rubric-b-guia-quiz-git",
    code: "8B",
    capabilities: ["doc-create", "inline-edit", "create-quiz", "export-docs"],
    whyCanvas: "La guía se ajusta por secciones y «Crear → Cuestionario» genera la evaluación desde el mismo contenido, sin escribir preguntas aparte.",
    outsideCanvas: "La edición modular de la guía y «Crear → Cuestionario» ocurren en Canvas; la exportación final abre Documentos de Google.",
    title: "Guía didáctica de Git con cuestionario autocalificable",
    level: "Básico",
    duration: "30 min",
    canvasFeature: "Documento + Cuestionario web interactivo en Canvas",
    goal: "Producir una guía didáctica estructurada por momentos y un cuestionario interactivo con retroalimentación inmediata.",
    scenario: "Mañana inicia la competencia de control de versiones y el instructor necesita guía, actividad práctica y evaluación diagnóstica.",
    promptParts: {
      role: "diseñador instruccional para formación en desarrollo de software",
      context: "Mañana inicia la competencia de control de versiones con 25 aprendices de primer trimestre que nunca han usado Git.",
      data: IN_GIT,
      instruction: "En Canvas, redacta la guía didáctica con:",
      task: ["Los cinco momentos de la sesión con su duración: reflexión inicial, contextualización, apropiación, transferencia y evaluación.", "Una práctica paso a paso que lleve al producto esperado, incluido un conflicto y su resolución.", "Una tabla de errores frecuentes con su causa y su solución.", "Una lista de chequeo de la evidencia."],
      constraints: ["Usa comandos reales y vigentes de Git (git switch en lugar de git checkout).", "Explica cada término técnico la primera vez que aparezca."],
      format: "Guía con un título por momento y la práctica en bloques de comandos.",
      tone: "Cercano y motivador, dirigido a aprendices."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "external", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Selecciona la práctica y escribe: «Agrega la salida esperada de la terminal después de cada comando».",
      "Selecciona la sección de errores frecuentes y escribe: «Agrega un ejemplo de mensaje de error real de la terminal a cada fila».",
      "Abre «Crear → Cuestionario» sobre la guía para generar la evaluación con retroalimentación inmediata.",
      "Responde el cuestionario con dos errores a propósito y revisa la explicación de cada respuesta.",
      "(Opcional) Exporta la guía a Documentos de Google desde «Compartir y exportar».",
      "Comprueba tu entregable con la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "Los cinco momentos suman 240 minutos.",
      "La práctica produce 5 commits, la rama feature/login y un conflicto resuelto.",
      "La tabla de errores tiene al menos 4 filas con causa y solución.",
      "El cuestionario cubre los comandos de la práctica y explica cada respuesta.",
      "Con dos errores a propósito, el puntaje final refleja esos dos fallos."
    ],
    stretch: "Pide en el chat: «Crea una página web con un cuestionario de 10 preguntas, puntaje en una dona y reinicio con preguntas mezcladas». Luego pide: «Agrega un simulador visual de ramas que dibuje los commits como círculos conectados al ejecutar comandos escritos».",
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

const IN_ASISTENCIA = `CONTENIDO DE asistencia_cruda (14 filas pegadas aquí, datos de práctica con errores a propósito)
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
    code: "9A",
    capabilities: ["code-preview", "inline-edit", "export-colab"],
    whyCanvas: "Las consultas se editan en Canvas y se ejecutan de verdad en la vista previa con SQLite dentro del navegador, que alimenta un tablero visual en la misma página.",
    outsideCanvas: "Canvas no trae un motor de base de datos, pero la vista previa carga Pyodide (Python en el navegador), que incluye sqlite3: así el SQL se ejecuta de verdad dentro de Canvas. PostgreSQL queda como dialecto de referencia. Exportar a Colab es un paso opcional fuera de Gemini.",
    title: "Consultas SQL de biblioteca con tablero en vista previa y ejecución en Colab",
    level: "Avanzado",
    duration: "35 min",
    canvasFeature: "Canvas de código + SQLite con Pyodide en la vista previa + Exportar a Colab",
    goal: "Escribir consultas con JOIN, agregaciones y funciones de ventana, y ejecutarlas en el navegador para alimentar un tablero visual.",
    scenario: "La biblioteca necesita saber qué libros rotan más, quién tiene préstamos vencidos y qué programa usa más el servicio.",
    promptParts: {
      role: "ingeniero de datos que enseña SQL",
      context: "La biblioteca necesita saber qué libros rotan más, quién tiene préstamos vencidos y qué programa usa más el servicio. La fecha de corte es el 30 de octubre de 2026.",
      data: IN_BIBLIO_SQL,
      instruction: "En Canvas, escribe consultas SQL, válidas en SQLite y en PostgreSQL, que respondan:",
      task: ["¿Qué libros se prestan más? Usa RANK().", "¿Qué préstamos están vencidos y con cuántos días de atraso?", "¿Cuántos préstamos tiene cada programa?", "¿Cuál es el promedio de días de préstamo de los libros devueltos, en general y por programa?", "¿Qué préstamos se devolvieron después de la fecha límite?"],
      constraints: ["Antes de cada consulta, escribe un comentario con la pregunta de negocio.", "Usa JOIN explícitos y alias legibles.", "Si una función de fecha es propia de SQLite, deja en un comentario su equivalente en PostgreSQL."],
      format: "Un script .sql comentado.",
      tone: "Didáctico, con comentarios breves en cada consulta."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "external", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Selecciona la consulta de vencidos en el script SQL y escribe: «Agrega el nombre del usuario y ordena por días de atraso».",
      "Pide en el chat de la izquierda: «Crea una página web que cargue Pyodide desde https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js, cree la base en memoria con sqlite3 usando el script de datos, ejecute cada consulta SQL y muestre su resultado en una tabla». Si Pyodide no carga, pídele que te avise con un mensaje claro.",
      "Abre la «Vista previa», espera a que termine de cargar y revisa que aparezcan las cinco tablas de resultado.",
      "Pide en el chat de la izquierda: «Junto a cada consulta, agrega una prueba que compare el resultado devuelto por SQLite con el valor de la lista Verifica tu resultado y marque ✓ o ✗»; revisa en la «Vista previa» que todas queden en ✓.",
      "Pide en el chat de la izquierda: «Agrega tarjetas con los totales y un gráfico de barras con los préstamos por programa, calculados con los resultados de las consultas».",
      "(Opcional) Si quieres un cuaderno aparte, pide un script Python con sqlite3 y usa «Compartir y exportar → Exportar a Colab»; este paso ocurre fuera de Gemini.",
      "Comprueba todos los resultados con la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "El ranking pone «Código limpio» en 1 (4 préstamos) y los otros cuatro libros empatan en 2 (2 préstamos).",
      "Hay 4 préstamos vencidos con 15, 11, 8 y 2 días de atraso.",
      "Por programa: ADSO 6, Multimedia 4 y Contabilidad 2.",
      "El promedio general de días de los devueltos es 11,0.",
      "Solo el préstamo 6 se devolvió con retraso (14 días).",
      "Las pruebas de la vista previa ejecutan el SQL con SQLite y marcan ✓ en las cinco consultas, sin errores en la consola."
    ],
    stretch: "Pide: «Agrega una vista materializada de indicadores mensuales y un gráfico de líneas de préstamos por semana».",
    previewSvg: canvasSvgBars("Gráfico de barras de préstamos por programa: ADSO 6, Contabilidad 2 y Multimedia 4", "Préstamos por programa", ["ADSO", "Contabilidad", "Multimedia"], [6, 2, 4], 0)
  },
  {
    id: "sql-b-limpieza-asistencia",
    code: "9B",
    capabilities: ["code-preview", "inline-edit"],
    whyCanvas: "El pipeline se revisa por etapas con selección y se ejecuta de verdad en la vista previa con SQLite; el tablero de calidad muestra cuántas filas pasa cada regla.",
    outsideCanvas: "El script SQL se redacta, se revisa por etapas y se ejecuta con SQLite (Pyodide) dentro de Canvas. La función `fn_limpiar_asistencia` para PostgreSQL se muestra para copiarla, pero Canvas no la ejecuta: para probarla usarías un PostgreSQL propio.",
    title: "Pipeline de limpieza de asistencia con diagrama entidad-relación",
    level: "Avanzado",
    duration: "35 min",
    canvasFeature: "Canvas de código SQL + SQLite con Pyodide + Mermaid erDiagram + tablero de calidad",
    goal: "Diseñar un pipeline ETL que limpia un archivo con errores reales, documentarlo con un diagrama entidad-relación y medir la calidad antes y después.",
    scenario: "El reporte de asistencia llega de varias sedes con formatos distintos y la coordinación no confía en los porcentajes.",
    promptParts: {
      role: "ingeniero de datos especializado en calidad de datos",
      context: "El reporte de asistencia llega de varias sedes con formatos distintos y la coordinación no confía en los porcentajes.",
      data: IN_ASISTENCIA,
      instruction: "En Canvas, escribe en SQL, válido en SQLite y en PostgreSQL, un pipeline de limpieza por etapas:",
      task: ["Carga del archivo crudo en una tabla de staging con todas las columnas como texto.", "Limpieza según las reglas: fechas, nombres desde la tabla maestra y estados.", "Deduplicación por documento y fecha con ROW_NUMBER().", "Tabla final de asistencia y tabla de rechazos con su motivo.", "Porcentaje de asistencia: Presente más Tarde sobre el total limpio."],
      constraints: ["Cada etapa debe poder ejecutarse de nuevo sin duplicar datos.", "Un comentario por cada regla aplicada."],
      format: "Script .sql dividido por etapas.",
      tone: "Técnico y preciso, explicando por qué se rechaza cada fila."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Selecciona la etapa que normaliza fechas y escribe: «Documenta con ejemplos en comentarios SQL los cuatro formatos de fecha admitidos y el caso inválido 2026-13-02».",
      "Pide en el chat de la izquierda: «Crea una página web que cargue Pyodide desde https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js, ejecute este script SQL con sqlite3 y muestre las tablas asistencia y rechazos y una tabla de calidad con filas crudas, limpias y rechazadas por motivo». Si Pyodide no carga, pídele que te avise con un mensaje claro.",
      "Abre la «Vista previa» y comprueba en la tabla de calidad que de 14 filas crudas queden 10 limpias y 4 rechazadas.",
      "Pide en el chat de la izquierda: «Agrega el diagrama entidad-relación en Mermaid de aprendices, asistencia y rechazos y una dona con los estados limpios; si Mermaid no carga, dibújalo con SVG».",
      "Pide en el chat de la izquierda: «Muestra en una pestaña el bloque SQL encapsulado como CREATE OR REPLACE FUNCTION fn_limpiar_asistencia(p_fecha_carga DATE) listo para copiar a PostgreSQL»; solo se lee y se copia, porque Canvas no ejecuta PostgreSQL.",
      "Verifica todos los puntos con la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "De 14 filas crudas quedan 10 limpias y 4 rechazadas.",
      "Rechazos: 2 duplicados, 1 sin documento y 1 fecha imposible (2026-13-02).",
      "Los estados limpios son: 6 Presente, 2 Ausente, 1 Tarde y 1 Sin registro.",
      "La asistencia (Presente + Tarde) es 70 %.",
      "Las tablas asistencia y rechazos creadas por SQLite tienen 10 y 4 filas, sin errores en la consola.",
      "Los nombres finales coinciden con la tabla maestra.",
      "El diagrama entidad-relación muestra las tablas aprendices, asistencia y rechazos, con la relación por documento."
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
    materials: [{ href: "materiales/gemini_canvas/mesa_ayuda_2026.csv", label: "CSV de la mesa de ayuda" }],
    code: "10A",
    capabilities: ["doc-create", "inline-edit", "file-input", "deep-research", "create-infographic", "create-slides", "export-docs"],
    whyCanvas: "Adjuntas el CSV o partes de Deep Research y, del mismo documento en Canvas, salen la infografía y la presentación para el comité sin copiar cifras.",
    outsideCanvas: "La investigación inicial con Deep Research ocurre en el chat de Gemini y la exportación final abre Presentaciones y Documentos de Google; la edición por sección y «Crear → Infografía» ocurren dentro de Canvas.",
    title: "Informe ejecutivo de mesa de ayuda con infografía y presentación para el comité",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Archivo adjunto CSV + Deep Research a Canvas + Infografía + Presentación",
    goal: "Convertir seis meses de indicadores en un informe ejecutivo con conclusiones prudentes y, desde el mismo documento, generar la infografía y la presentación para el comité.",
    scenario: "La dirección quiere saber si las inversiones de agosto y septiembre mejoraron el servicio y necesita compartirlo con todo el personal.",
    promptParts: {
      role: "auditor de servicios TI que informa a la alta dirección",
      context: "La dirección quiere saber si el portal de autoservicio y el segundo técnico mejoraron el servicio, y compartirá el resultado con todo el personal.",
      data: IN_MESA,
      instruction: "En Canvas, redacta un informe ejecutivo con:",
      task: ["Un resumen de máximo cinco líneas con las tres cifras más importantes.", "Una tabla mensual con la tasa de resolución y el tiempo promedio.", "Una comparación entre mayo-julio y agosto-octubre.", "Qué cambios pueden atribuirse a cada hecho relevante y cuáles podrían ser coincidencia.", "Tres decisiones recomendadas."],
      constraints: ["No afirmes causalidad sin advertir sus límites.", "Cifras con un decimal y formato colombiano."],
      format: "Títulos numerados, una tabla y un cuadro de decisiones.",
      tone: "Ejecutivo y objetivo, con cifras antes que opiniones."
    },
    places: ["canvas", "canvas", "canvas", "gemini", "canvas", "external", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, adjunta desde «+» el archivo `materiales/gemini_canvas/mesa_ayuda_2026.csv` (o usa los datos del prompt) y envíalo.",
      "Selecciona el cuadro de decisiones en el lienzo y escribe: «Separa las conclusiones con evidencia fuerte de las que solo son coincidencias».",
      "Abre «Crear → Infografía» sobre el informe y comprueba que muestre los KPI de los seis meses.",
      "(Opcional) En un chat nuevo, elige «Deep Research», investiga buenas prácticas de mesas de ayuda TI y usa una de ellas para ajustar una de tus tres decisiones.",
      "Abre «Crear → Presentación» sobre el informe; si tu cuenta no lo muestra, pide en el chat de la izquierda: «Convierte este informe en una presentación de 6 diapositivas para el comité». Luego usa «Exportar a Presentaciones de Google».",
      "(Opcional) Exporta el informe con «Compartir y exportar → Exportar a Documentos de Google».",
      "Comprueba todos los criterios con la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "El tiempo promedio baja de 18 a 10 horas (−44,4 %).",
      "La satisfacción sube de 4,1 a 4,6.",
      "El promedio de tiempo antes (mayo-julio) es 18,7 h y después (agosto-octubre) 12,0 h.",
      "Acceso y contraseñas es la principal categoría de octubre (35,2 %).",
      "El informe advierte los límites de atribuir causalidad.",
      "Si hiciste el paso opcional de Deep Research, al menos una decisión cita una buena práctica encontrada.",
      "La infografía y la presentación muestran las mismas cifras del informe."
    ],
    stretch: "Abre en Canvas el informe de Deep Research desde «Crear» y usa «Crear → Página web» para comparar tus seis meses con los referentes del sector.",
    previewSvg: canvasSvgLine("Gráfico de líneas del tiempo promedio de solución en horas de mayo a octubre: 18, 16, 22, 14, 12 y 10", "Tiempo promedio de solución (h)", ["May", "Jun", "Jul", "Ago", "Sep", "Oct"], [
      { name: "Horas", values: [18, 16, 22, 14, 12, 10], cls: "cx-a" }
    ])
  },
  {
    id: "report-b-dictamen-nube",
    code: "10B",
    capabilities: ["doc-create", "inline-edit", "code-preview", "create-audio", "export-docs"],
    whyCanvas: "El dictamen se edita por secciones, se vuelve una app de sensibilidad ejecutable y se escucha como Resumen en audio antes del comité.",
    outsideCanvas: "El documento, la calculadora de sensibilidad y «Crear → Resumen en audio» se ejecutan dentro de Canvas (la opción Resumen en audio puede variar según el idioma o las políticas de tu cuenta institucional); el paso de firma exporta a Documentos de Google.",
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
      format: "Documento con títulos numerados y tablas.",
      tone: "Formal e imparcial, sin favorecer a ningún proveedor."
    },
    places: ["canvas", "canvas", "canvas", "canvas", "canvas", "external", "portal"],
    steps: [
      "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
      "Selecciona la recomendación en el lienzo y escribe: «Agrega una cláusula de salida y portabilidad de datos».",
      "Abre «Crear → Resumen en audio» sobre el dictamen (mientras sigue siendo documento) y escúchalo para revisar si la recomendación se entiende sin leer las tablas; si tu cuenta o configuración de idioma aún no muestra Resumen en audio en el menú Crear, pide en el chat de la izquierda un guion locutado de 2 minutos.",
      "Pide en el chat de la izquierda: «Crea una aplicación web con un control por cada peso (la suma debe ser 100 %), ranking en vivo, un radar de los tres proveedores y un aviso cuando cambie el ganador».",
      "En la «Vista previa», mueve los pesos hasta que cambie el ganador.",
      "(Opcional) Vuelve a la versión del dictamen en documento y expórtalo a Documentos de Google para su firma.",
      "Verifica todos los puntos en la lista «Verifica tu resultado» de esta guía."
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

// 11. Visión Multimodal
const IN_BOCETO_WIRE = `IMAGEN ADJUNTA: boceto_formulario_matricula.png (boceto a mano en una hoja de cuaderno, material de práctica)
Lee en la imagen:
- El título y los tres campos con su asterisco de obligatorio.
- Las anotaciones en azul debajo de cada campo: son las reglas de validación.
- El indicador de seguridad de tres segmentos y el texto del botón.
- Los colores anotados al margen.
Si un trazo no se entiende, dímelo antes de suponer su contenido.`;

const IN_PIZARRA_PQRS = `IMAGEN ADJUNTA: pizarra_pqrs.png (flujo dibujado con marcador en una pizarra, material de práctica)
Lee en la imagen:
- Las tres fases anotadas entre llaves en la parte superior.
- Los nodos en azul (actividades; los redondeados son inicio y fin) y los rombos en rojo (decisiones).
- Las etiquetas de cada flecha y el plazo escrito en rojo.
Si un texto no se lee con claridad, dímelo antes de suponer su contenido.`;

CANVAS_EXERCISES["multimodal-vision"] = [
  {
    id: "mm-a-boceto-formulario",
    materials: [{ href: "materiales/gemini_canvas/boceto_formulario_matricula.png", label: "Imagen del boceto del formulario" }],
    code: "11A",
    capabilities: ["image-input", "code-preview", "select-ask"],
    whyCanvas: "Canvas convierte la foto del boceto en un formulario que funciona en la vista previa y se refina haciendo clic sobre el botón con «Seleccionar y preguntar».",
    outsideCanvas: "Gemini interpreta la fotografía adjunta incluso desde el chat general sin Canvas, pero la ejecución inmediata del formulario y el ajuste visual con «Seleccionar y preguntar» ocurren dentro de Canvas.",
    title: "De boceto en libreta a formulario reactivo con validación institucional",
    level: "Intermedio",
    duration: "30 min",
    canvasFeature: "Visión Multimodal + Vista previa + Seleccionar y preguntar",
    goal: "Adjuntar la fotografía de un wireframe manuscrito y solicitar a Gemini en Canvas la generación de un formulario web reactivo con validaciones institucionales.",
    scenario: "En una sesión de diseño colaborativo, los aprendices dibujaron la pantalla de registro en una libreta. El equipo debe convertir el dibujo en un prototipo funcional antes del comité de sprint.",
    promptParts: {
      role: "desarrollador frontend de interfaces accesibles",
      context: "El equipo dibujó a mano el formulario de matrícula de la convocatoria 2026. Adjunto la imagen del boceto para convertirlo en un prototipo que funcione.",
      data: IN_BOCETO_WIRE,
      instruction: "En Canvas, genera una sola página HTML ejecutable (HTML5, CSS y JavaScript nativo sin dependencias externas) que traduzca fielmente el boceto manuscrito con:",
      task: [
        "El formulario completo con sus 3 campos accesibles (<label> y aria-describedby), el nombre obligatorio de mínimo 3 caracteres y el botón primario con la paleta Verde Salvia #2D5A4C.",
        "Validación reactiva en tiempo real del correo institucional: mensaje verde si termina en @soy.sena.edu.co o @sena.edu.co; en otro caso, un error que diga cuáles dominios se aceptan.",
        "Medidor de seguridad de la contraseña con tres segmentos (Débil, Media, Segura) que se llenan en vivo: Débil si tiene menos de 8 caracteres, Media si tiene 8 o más pero le faltan números o símbolos, Segura si cumple la regla del boceto (mínimo 8 caracteres, con números y símbolos).",
        "Manejo del evento submit sin recargar la página, mostrando una confirmación accesible con el nombre del aprendiz registrado."
      ],
      constraints: [
        "Cero librerías externas o frameworks: todo debe funcionar de manera nativa e inmediata en la vista previa de Canvas.",
        "Conserva exactamente los textos, dominios y reglas anotados en el boceto a lápiz.",
        "Garantiza contraste WCAG 2.2 nivel AA para todos los elementos interactivos y textos."
      ],
      format: "Un único archivo HTML con estilos CSS embebidos, JavaScript reactivo nativo y comentarios breves en español de Colombia.",
      tone: "Cercano y claro en los textos del formulario."
    },
    places: ["gemini", "canvas", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Descarga `materiales/gemini_canvas/boceto_formulario_matricula.png` y adjunta esa imagen (o la foto de tu propio boceto) con «+» en el chat de Gemini, activa Canvas, pega el prompt y envíalo.",
      "Revisa el formulario en la «Vista previa» y compáralo con la imagen: los tres campos, el botón y los colores deben coincidir con lo dibujado.",
      "Escribe un correo con dominio externo (ej. usuario@gmail.com) y comprueba el error con los dominios aceptados; luego cámbialo a @soy.sena.edu.co y verifica el mensaje verde.",
      "Escribe en la contraseña «abc», luego «abcdefgh» y después «Abcdef1!» y observa los tres segmentos: Débil, Media y Segura.",
      "En la «Vista previa», activa «Seleccionar y preguntar», haz clic en el botón [Completar Registro Formativo] y pide: «Muestra un resumen accesible con los datos validados al enviar».",
      "Marca todos los criterios cumplidos en la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "El formulario tiene los 3 campos del boceto: Nombre Completo, Correo Institucional y Contraseña de Acceso.",
      "El botón principal dice «Completar Registro Formativo» y usa el color Verde Salvia #2D5A4C.",
      "Con @soy.sena.edu.co o @sena.edu.co aparece la validación en verde; con otro dominio, un error que nombra los dominios aceptados.",
      "Un nombre de menos de 3 caracteres muestra un mensaje que explica cómo corregirlo.",
      "El medidor marca «abc» como Débil, «abcdefgh» como Media y «Abcdef1!» como Segura.",
      "Al enviar el formulario con datos válidos no se recarga la página y se muestra la confirmación de bienvenida."
    ],
    stretch: "Pide en el chat: «Agrega un selector de tipo de documento (CC, TI, CE) y muestra los datos registrados como JSON en un cuadro de texto, con un botón secundario para copiarlo».",
    previewSvg: canvasSvgMock("Maqueta de formulario web generado desde boceto con campos validados", "Formulario desde boceto", "landing")
  },
  {
    id: "mm-b-pizarra-flujograma",
    materials: [{ href: "materiales/gemini_canvas/pizarra_pqrs.png", label: "Foto de la pizarra PQRS" }],
    code: "11B",
    capabilities: ["image-input", "code-preview", "inline-edit"],
    whyCanvas: "La foto de la pizarra se vuelve un diagrama que se dibuja en la vista previa y se ajusta nodo por nodo con selección.",
    outsideCanvas: "Gemini reconoce los trazos de la pizarra incluso sin activar el lienzo, pero el renderizado del diagrama Mermaid en la «Vista previa», la edición por selección y la copia del SVG ocurren dentro de Canvas.",
    title: "De trazos en pizarra a flujograma interactivo Mermaid de atención PQRS",
    level: "Intermedio",
    duration: "25 min",
    canvasFeature: "Imagen adjunta + página HTML con Mermaid + Vista previa",
    goal: "Digitalizar un diagrama de flujo dibujado con marcador en la pizarra del aula y transformarlo en código Mermaid estándar con bifurcaciones condicionales y subgrafos.",
    scenario: "El instructor explicó el proceso de atención de PQRS en la pizarra. El equipo requiere formalizar el flujograma en el repositorio institucional sin redibujarlo manualmente.",
    promptParts: {
      role: "analista de procesos institucionales",
      context: "El instructor dibujó en la pizarra el flujo de atención de PQRS. Adjunto la foto para formalizarlo en un diagrama Mermaid que se pueda incluir en la documentación.",
      data: IN_PIZARRA_PQRS,
      instruction: "En Canvas, crea una página web que dibuje con Mermaid, cargado desde CDN, un diagrama de flujo que digitalice con exactitud los trazos de la pizarra con:",
      task: [
        "Sintaxis Mermaid flowchart TD limpia y válida, dividida en los 3 subgrafos anotados en la pizarra: Radicación, Gestión y Decisión, y Cierre.",
        "Rombos para las dos decisiones: «¿Formativa o administrativa?» (ramas Formativa y Administrativa) y «¿Requiere plan de mejoramiento?» (ramas Sí y No).",
        "Nodos rectangulares para actividades y redondeados para los eventos de inicio y fin.",
        "Estilos visuales con paleta institucional mediante directivas classDef o style (color primario #2D5A4C)."
      ],
      constraints: [
        "Usa únicamente sintaxis Mermaid estándar para que se dibuje sin errores; si Mermaid no carga, muestra un aviso y el código en un bloque de texto.",
        "Conserva textualmente las etiquetas, plazos y nombres de subgrafos dibujados en la pizarra.",
        "No inventes pasos intermedios ni omitas los plazos de notificación especificados."
      ],
      format: "Un solo archivo HTML ejecutable con el código Mermaid comentado en español de Colombia para cada subgrafo.",
      tone: "Neutral y claro, con etiquetas cortas en los nodos."
    },
    places: ["gemini", "canvas", "canvas", "canvas", "portal"],
    steps: [
      "Descarga `materiales/gemini_canvas/pizarra_pqrs.png` y adjunta esa imagen (o la foto de una pizarra tuya) con «+» en el chat de Gemini, activa Canvas, pega el prompt y envíalo.",
      "Abre la «Vista previa» y comprueba que se dibujen los 3 subgrafos con sus conexiones.",
      "Selecciona el nodo del Comité de Evaluación en el código y escribe: «Agrega una nota indicando que sesiona ordinariamente cada 15 días».",
      "Pide en el chat de la izquierda: «Agrega un botón que muestre el código SVG del diagrama en un cuadro de texto para copiarlo» y pruébalo en la vista previa.",
      "Verifica todos los puntos en la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "El código Mermaid tiene exactamente los 3 subgrafos: Radicación, Gestión y Decisión, y Cierre.",
      "Contiene las dos decisiones: «¿Formativa o administrativa?» con ramas Formativa y Administrativa, y «¿Requiere plan de mejoramiento?» con ramas Sí y No.",
      "La rama Administrativa llega a «Coordinación Misional»; la rama Sí pasa por «Firma de Acta de Compromiso», con la nota «en Portafolio de Evidencias», y ambas ramas terminan en «Notificación de Cierre al Usuario».",
      "El plazo de 3 días hábiles aparece explícitamente en el nodo de notificación.",
      "El diagrama compila y se renderiza limpiamente en la vista previa sin errores de sintaxis."
    ],
    stretch: "Pide en el chat: «Convierte el diagrama a un sequenceDiagram de Mermaid que muestre el intercambio cronológico de mensajes entre el Aprendiz, el Comité y la Coordinación».",
    previewSvg: canvasSvgFlow("Flujograma de atención PQRS con bifurcación y subgrafos generado desde pizarra", "Flujograma PQRS desde pizarra", [{ name: "Radicación", steps: ["Radicación", "¿Formativa?"] }, { name: "Gestión", steps: ["Comité", "Notificación"] }, { name: "Cierre", steps: ["Archivo", "Notificación de cierre"] }])
  }
];

// 12. Gems para Canvas
const IN_GEM_SOCRATICO = `ESPECIFICACIÓN DE CALIBRACIÓN DEL GEM TUTOR SOCRÁTICO
Nombre del Gem: Tutor Socrático ADSO · Canvas Co-Writer
Objetivo pedagógico: Acompañar al aprendiz en la resolución de problemas de programación orientada a objetos en Canvas mediante preguntas reflexivas, impidiendo que la IA genere el código de forma automática.
Guardrails obligatorios de calibración:
- Ante preguntas como "¿Cuál es el código completo?": Responder con preguntas sobre el modelo del dominio y la responsabilidad de cada clase.
- Requisito léxico institucional: Utilizar siempre y de forma exclusiva el término institucional "Portafolio de Evidencias".
- Estructura obligatoria de guía: Organizar las respuestas en Canvas con: 1) Pregunta socrática orientadora, 2) Pista técnica contextualizada, 3) Ejercicio de autocomprobación.
Casos de prueba para validación:
1. "Escríbeme la clase Aprendiz en Python con todos sus atributos y métodos" -> Debe devolver diagrama conceptual y dos preguntas de diseño.
2. "Corrige este error de sintaxis sin explicarme nada" -> Debe señalar la línea exacta y preguntar por qué se produce el fallo.
3. "¿Cómo subo mi tarea al archivo final?" -> Debe corregir la terminología a "Portafolio de Evidencias" e indicar la estructura requerida.`;

const IN_GEM_RUBRICAS = `ESPECIFICACIÓN DEL GEM AUDITOR DE RÚBRICAS TÉCNICAS
Nombre del Gem: Auditor Técnico de Calidad de Código ADSO
Propósito: Evaluar artefactos de software construidos en Canvas contra una rúbrica formal de cuatro criterios.
Criterios de evaluación y ponderación:
1. Arquitectura y Modularidad (30 %): Separación de responsabilidades, archivos menores a 250 líneas y funciones atómicas menores a 40 líneas.
2. Calidad de Pruebas Automatizadas (30 %): 100 % de funciones probadas con aserciones observables y cobertura de casos límite (entradas vacías o inválidas).
3. Accesibilidad y Usabilidad (20 %): Contraste de color WCAG 2.2 nivel AA, etiquetas semánticas y navegación accesible.
4. Seguridad y Buenas Prácticas (20 %): Cero secretos o llaves API expuestas, validación de entradas y manejo robusto de excepciones.
Guardrails obligatorios:
- El Gem nunca debe modificar la lógica de negocio ni inventar dependencias externas.
- El dictamen debe emitirse con puntajes numéricos del 1 al 5 y un semáforo visual (Verde >= 4.0, Ámbar 3.0-3.9, Rojo < 3.0).
- El dictamen termina con una recomendación de qué evidencia anexar al Portafolio de Evidencias.`;

CANVAS_EXERCISES["gem-studio"] = [
  {
    id: "gem-a-tutor-socratico",
    code: "12A",
    capabilities: ["doc-create", "inline-edit", "gems"],
    whyCanvas: "Canvas sirve para redactar y pulir las instrucciones del Gem como documento; luego el Gem trabaja contigo dentro de Canvas.",
    outsideCanvas: "La redacción y el ajuste del System Prompt se hacen en Canvas; la creación en «Explorar Gems → Nuevo Gem» ocurre en el gestor de Gems de Gemini (fuera del lienzo) y luego vuelves a activar Canvas dentro del Gem.",
    title: "Configuración y calibración de un Gem Tutor Socrático para coescritura en Canvas",
    level: "Avanzado",
    duration: "35 min",
    canvasFeature: "Documento en Canvas + Nuevo Gem + coescritura con Canvas activo",
    goal: "Diseñar el System Prompt de un Gem especializado, ponerlo a prueba con preguntas trampa y utilizarlo como asistente de coescritura en un lienzo de Canvas.",
    scenario: "Los aprendices tienden a pedirle a la IA que resuelva los talleres de código por completo. El instructor necesita calibrar un Gem que actúe como tutor socrático en Canvas, guiando con preguntas reflexivas sin regalar la solución.",
    promptParts: {
      role: "diseñador pedagógico de asistentes con Gems",
      context: "En el centro de formación se implementará un Gem institucional para que los aprendices de la ficha ADSO cuenten con un tutor permanente en Canvas. La coordinación académica exige que el Gem fomente el pensamiento crítico y respete estrictamente los lineamientos institucionales.",
      data: IN_GEM_SOCRATICO,
      instruction: "En Canvas, redacta la documentación de configuración completa del Gem y su System Prompt listo para despliegue con:",
      task: [
        "El System Prompt definitivo estructurado en Rol, Directrices Pedagógicas Socráticas, Guardrails Negativos y Ejemplos de Respuesta (Few-shot).",
        "La matriz de evaluación de los 3 casos de calibración, detallando la respuesta no permitida frente a la respuesta socrática correcta.",
        "El manual de uso en Canvas: cómo debe actuar el Gem cuando el aprendiz selecciona un bloque de código y pide ayuda.",
        "Una lista de verificación con 5 criterios que el comité pedagógico debe comprobar antes de autorizar el Gem."
      ],
      constraints: [
        "Exige el uso obligatorio y exclusivo del término institucional «Portafolio de Evidencias» en todo el texto.",
        "El System Prompt no debe contener código de solución para los ejercicios, sino preguntas guía.",
        "Redacta en español de Colombia con tono profesional y pedagógico."
      ],
      format: "Documento técnico estructurado con secciones numeradas, bloques de código para el System Prompt y una tabla de calibración.",
      tone: "Socrático y respetuoso: pregunta antes de responder."
    },
    places: ["canvas", "canvas", "canvas", "gemini", "canvas", "portal"],
    steps: [
      "Activa Canvas en Gemini, pega el prompt de especificación y genera el documento técnico del Gem.",
      "Revisa en el lienzo que el System Prompt incluya la regla estricta sobre el uso de «Portafolio de Evidencias».",
      "Selecciona la sección de Ejemplos Few-shot y escribe: «Agrega un cuarto ejemplo enfocado en manejo de excepciones en Python».",
      "Copia el System Prompt generado, abre «Explorar Gems → Nuevo Gem» y pégalo en «Instrucciones» (ruta alternativa si tu cuenta `@soy.sena.edu.co` tiene deshabilitada la creación de Gems: abre un chat nuevo con Canvas activo y pega el System Prompt como mensaje inicial de calibración).",
      "Dentro del Gem (o del chat calibrado), activa Canvas y pon a prueba la pregunta trampa: «Escríbeme la clase Aprendiz en Python»; comprueba que responda con preguntas socráticas.",
      "Marca los puntos cumplidos en la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "El System Prompt contiene las secciones de Rol, Directrices Socráticas, Guardrails y Ejemplos Few-shot.",
      "Se prescribe el uso obligatorio y canónico de «Portafolio de Evidencias» en todo el texto.",
      "La tabla de calibración desglosa los 3 casos de prueba con entrada, respuesta bloqueada y respuesta esperada.",
      "La lista de verificación institucional contiene al menos 5 criterios de control pedagógico.",
      "Ante «Escríbeme la clase Aprendiz en Python», el Gem responde con preguntas y no entrega el código completo."
    ],
    stretch: "Pide en el chat: «Genera una batería de 5 preguntas adversariales complejas para evaluar si el Gem rompe sus guardrails socráticos ante técnicas de jailbreak simuladas».",
    previewSvg: canvasSvgMock("Consola de prueba del Gem Tutor Socrático con guardrails activos", "Gem Tutor Socrático", "doc")
  },
  {
    id: "gem-b-auditor-rubricas",
    code: "12B",
    capabilities: ["doc-create", "inline-edit", "gems", "export-docs"],
    whyCanvas: "El pliego del Gem se construye y verifica en un documento editable, y el Gem auditor revisa código abierto en Canvas.",
    outsideCanvas: "El pliego se redacta en Canvas, la configuración del Gem se guarda en «Explorar Gems → Nuevo Gem» (gestor de Gemini) y la exportación final abre Documentos de Google.",
    title: "Gem Auditor de Rúbricas y Calidad de Código en tiempo real",
    level: "Avanzado",
    duration: "30 min",
    canvasFeature: "Documento en Canvas + Nuevo Gem + Auditoría de código en Canvas",
    goal: "Crear y calibrar un Gem evaluador que audite el código generado en Canvas contra una rúbrica técnica de 4 criterios sin alterar la lógica de negocio.",
    scenario: "Al evaluar entregas de software, se requiere un asistente que revise que el código cumpla con separación de capas, pruebas con aserciones y contraste accesible, generando un dictamen estructurado.",
    promptParts: {
      role: "líder técnico de calidad de software",
      context: "La coordinación técnica necesita automatizar la auditoría preliminar de los proyectos formativos de desarrollo de software. Se diseñará un Gem que analice los archivos de código creados en Canvas y emita un informe técnico fundamentado.",
      data: IN_GEM_RUBRICAS,
      instruction: "En Canvas, elabora el pliego de especificación y el System Prompt del Gem Auditor Técnico con:",
      task: [
        "El System Prompt del Gem con su matriz de evaluación de 4 criterios ponderados y escala del 1 al 5.",
        "La plantilla estructurada del dictamen de auditoría en formato Markdown que el Gem debe completar al evaluar código.",
        "El protocolo para auditar fragmentos seleccionados dentro de un Canvas de código sin alterar su funcionamiento.",
        "Un ejemplo completo de auditoría simulada para una función de cálculo de promedios, mostrando fortalezas, debilidades y calificación final."
      ],
      constraints: [
        "Los 4 criterios deben sumar exactamente 100 % en su ponderación.",
        "Prohíbe que el Gem aplique refactorizaciones no solicitadas que rompan la compatibilidad del código auditado.",
        "Toda mención al archivo de seguimiento formativo debe usar «Portafolio de Evidencias»."
      ],
      format: "Documento técnico con tablas de ponderación, bloques de código para el System Prompt y plantilla de dictamen.",
      tone: "Técnico, objetivo y constructivo en cada hallazgo."
    },
    places: ["canvas", "canvas", "gemini", "canvas", "external", "portal"],
    steps: [
      "Activa Canvas en Gemini, pega el prompt y genera el pliego de especificación del Gem Auditor.",
      "Selecciona la plantilla de dictamen en el lienzo y escribe: «Incluye un campo para registrar el identificador (hash) del commit evaluado».",
      "Copia el System Prompt y crea el Gem en «Explorar Gems → Nuevo Gem» (o pégalo como prompt de apertura en un chat nuevo si tu cuenta institucional no habilita Gems personalizados).",
      "Con Canvas activo en el Gem, pega el código de la calculadora de promedio del ejercicio 6B (o tu versión corregida) y pídele: «Audítalo con tu rúbrica y genera el radar de calidad en SVG».",
      "(Opcional) Exporta el pliego con «Compartir y exportar → Exportar a Documentos de Google» para el comité curricular.",
      "Comprueba todos los criterios con la lista «Verifica tu resultado» de esta guía."
    ],
    expected: [
      "La tabla de ponderaciones suma exactamente 100 % (30 % + 30 % + 20 % + 20 %).",
      "El System Prompt incluye la directriz de no modificar la lógica de negocio del código analizado.",
      "La plantilla de dictamen cuenta con secciones de identificación, desglose por criterio y semáforo global.",
      "El ejemplo simulado contiene calificaciones numéricas justificadas y recomendaciones observables.",
      "Al auditar la calculadora del 6B, el Gem califica los 4 criterios con semáforo y no cambia la lógica del código."
    ],
    stretch: "Pide en el chat: «Añade al System Prompt una regla para detectar código duplicado y calcular el índice de mantenibilidad según la complejidad ciclomática».",
    previewSvg: canvasSvgRadar("Perfil de evaluación del Gem Auditor en cuatro criterios de calidad", "Auditoría de calidad Gem", ["Arquitectura", "Pruebas", "Accesibilidad", "Seguridad"], [{ name: "Mínimo", values: [4, 4, 3, 4], cls: "cx-m" }, { name: "Entrega", values: [4, 5, 4, 4], cls: "cx-p" }], 5)
  }
];

// 13. Parte C: funciones de Canvas que las partes A y B no practican (recorrido, copia compartida, IA dentro de la app,
// sugerencias de edición, Colab, LaTeX con PDF y foto de una tabla).
const IN_BIENVENIDA = `GUÍA DE BIENVENIDA AL AULA VIRTUAL — FICHA DE PRÁCTICA (datos de práctica)

Grupo: 25 aprendices de primer trimestre. Sesiones: martes y jueves, de 6:00 p. m. a 9:00 p. m.

Reglas de convivencia en las sesiones virtuales:
1. Ingresar 10 minutos antes y dejar el micrófono apagado.
2. Usar el chat para las preguntas; el instructor las responde al final de cada bloque.
3. Entregar las evidencias en la plataforma antes de las 11:59 p. m. del día acordado.
4. Avisar con 24 horas de anticipación si no puede asistir.
5. Cuidar el lenguaje en el chat y en los foros.`;

const IN_AHORRO = `JUEGO «META DE AHORRO» (reglas de práctica)

Duración: 6 semanas. Sueldo semanal: 200.000 COP.
Cada semana el jugador elige ahorrar 0, 25, 50 o 75 % del sueldo.
Meta: terminar con al menos 500.000 COP ahorrados.
Evento fijo de la semana 3: imprevisto de 80.000 COP.
El imprevisto se paga primero con el dinero no ahorrado de esa semana; si no alcanza, lo que falta se toma de lo ahorrado en esa semana.
Pantalla: semana actual, barra de ahorro acumulado, botones 0 %, 25 %, 50 % y 75 %, y botón Reiniciar.`;

const IN_REDACTOR = `APP «REDACTOR DE REPORTES» — INCIDENCIAS DE INFRAESTRUCTURA (contenido de práctica)

Campos del formulario: tipo (Eléctrico, Agua, Mobiliario, Red), ubicación (bloque y salón), prioridad (Baja, Media, Alta) y descripción corta (máximo 120 caracteres, con contador).
Botón «Redactar reporte»: la IA convierte los campos en un reporte formal de máximo 3 líneas para Mantenimiento.
Ejemplo de entrada: Eléctrico · Bloque A-201 · Alta · «se va la luz cuando prendo el proyector».
Reglas: tipo, ubicación y prioridad son obligatorios. El reporte debe repetir exactamente el tipo, la ubicación y la prioridad, no debe inventar causas ni nombres y no debe incluir datos personales.`;

const IN_COMUNICADO = `COMUNICADO — CAMBIO DE HORARIO DE LA SALA DE SISTEMAS (documento de práctica con errores a propósito)

Estimados aprendices:

Les informamos que a partir del lunes 23 de noviembre de 2026 la sala de sistemas abrira de 7:00 a. m. a 5:00 p. m. Los aprendices que necesiten usar los equipos fuera de ese horario deben solicitar autorización con tres dias de anticipación en la coordinación, y la solicitud debe incluir el nombre completo, la ficha, el motivo, el programa de formación y los equipos que van a usar, porque sin esos datos no se puede aprobar el permiso y tampoco se puede garantizar que haiga un instructor disponible en la sala.

El sabado 28 de noviembre la sala estara cerrada por mantenimiento. Los trabajos se haran entre las 8:00 a. m. y las 12:00 m., y el domingo 29 de noviembre se normalizara el servicio.

Cualquier duda, escribir a coordinacion@ejemplo.edu.co.`;

const IN_NOTAS_GRUPO = `NOTAS DEL PROYECTO FINAL — FICHA 2871 (datos de práctica)

aprendiz,nota
A01,4.2
A02,3.8
A03,2.9
A04,4.5
A05,3.1
A06,3.6
A07,4.8
A08,2.5
A09,3.9
A10,4.0
A11,3.3
A12,4.4

Regla: aprueba quien tiene nota mayor o igual a 3.5.
Estadística pedida: promedio, mediana, desviación estándar poblacional y porcentaje de aprobados.`;

const IN_FICHA_FORMULAS = `FICHA DE FÓRMULAS DE CALIFICACIÓN — PROYECTO API REST (datos de práctica)

Criterios y pesos: Diseño 30 %, Validación 25 %, Documentación 20 %, Pruebas 25 %.
Puntajes posibles: de 1 a 5 (se admiten valores intermedios).
Nota final = suma de (puntaje x peso). Aprobado si la nota final es mayor o igual a 3,5.
Regla extra: si algún criterio queda por debajo de 3, se exige plan de mejoramiento.

Aprendiz 2: Diseño 5, Validación 4, Documentación 3, Pruebas 3.
Aprendiz 3: Diseño 3, Validación 3, Documentación 4, Pruebas 2.`;

const IN_INVENTARIO = `IMAGEN ADJUNTA: inventario_laboratorio.png (tabla escrita a mano en una hoja de cuaderno, material de práctica)
Lee en la imagen:
- El título, la fecha del conteo y las tres columnas: Insumo, Cantidad y Mínimo.
- Las seis filas con sus cifras, incluidas las que están encerradas en rojo.
- Las notas al pie sobre cómo se marca lo que está por debajo del mínimo.
Si una cifra no se lee con claridad, dímelo antes de suponer su valor.`;

// 1C: recorrido de la interfaz
CANVAS_EXERCISES["doc-editorial"].push({
  id: "doc-c-recorrido-interfaz",
  code: "1C",
  capabilities: ["doc-create", "length-tone", "versions", "export-pdf"],
  whyCanvas: "Aquí conoces los controles de Canvas en un documento corto: el chat queda a la izquierda, el documento a la derecha, y puedes cambiar longitud y tono, volver a una versión anterior y ver el PDF antes de guardarlo.",
  outsideCanvas: "Todo el recorrido ocurre en Gemini: el documento, los botones de longitud, tono y versiones y la vista previa del PDF. El archivo PDF solo se guarda en tu equipo si decides conservarlo.",
  title: "Recorrido por la interfaz de Canvas con una guía de bienvenida",
  level: "Básico",
  duration: "20 min",
  canvasFeature: "Documento + Ajustar longitud y tono + Versiones + Exportar a PDF",
  goal: "Reconocer las dos zonas de Canvas y usar sus controles básicos sobre un documento corto. Si es tu primera vez en Canvas, haz este ejercicio antes que 1A.",
  scenario: "Vas a dar la bienvenida a un grupo nuevo. Necesitas una guía de una página, con las reglas de convivencia, que puedas acortar, formalizar y guardar como PDF.",
  promptParts: {
    role: "redactor de guías de bienvenida para aprendices",
    context: "Un grupo nuevo de 25 aprendices empieza clases virtuales y necesita conocer las reglas de convivencia el primer día.",
    data: IN_BIENVENIDA,
    instruction: "En Canvas, redacta la guía de bienvenida con:",
    task: ["Un título y un saludo de dos líneas.", "Las cinco reglas numeradas, cada una con una frase que explique para qué sirve.", "Un cierre con el horario de las sesiones."],
    constraints: ["Conserva las horas y los plazos de los datos.", "No agregues reglas nuevas."],
    format: "Documento con título y lista numerada.",
    tone: "Cercano y claro, dirigido a jóvenes aprendices."
  },
  places: ["canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
  steps: [
    "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
    "Ubica las dos zonas: a la izquierda el chat de Gemini y a la derecha el documento de Canvas. Escribe en el chat: «Agrega una sexta regla sobre puntualidad» y observa que el documento cambia.",
    "Usa «Ajustar longitud → Más corto» y después «Cambiar tono → Más formal»; el documento cambia sin que escribas nada.",
    "Abre «Versión anterior» para ver el texto antes del cambio de tono y «Versión siguiente» para volver al más reciente.",
    "Abre «Compartir y exportar → Exportar a PDF» y revisa la vista previa del PDF antes de guardarlo.",
    "Comprueba tu resultado con la lista «Verifica tu resultado» de esta guía."
  ],
  expected: [
    "El documento tiene seis reglas numeradas y una de ellas habla de puntualidad.",
    "Después de «Ajustar longitud → Más corto», el documento es más breve que el original y conserva las seis reglas.",
    "«Versión anterior» muestra el texto previo al cambio de tono y «Versión siguiente» devuelve el más reciente.",
    "Las horas y los plazos siguen igual: 6:00 p. m. a 9:00 p. m., 10 minutos antes, 11:59 p. m. y 24 horas de anticipación.",
    "La vista previa del PDF muestra el título y las seis reglas."
  ],
  stretch: "Pide en el chat: «Agrega al final una tabla con las cinco reglas y quién las vigila: aprendiz, instructor o coordinación».",
  previewSvg: canvasSvgMock("Maqueta de un documento de Canvas con botones de longitud, tono y versiones", "Recorrido de la interfaz", "doc")
});

// 2C: juego, compartir y copiar
CANVAS_EXERCISES["code-prototyping"].push({
  id: "code-c-juego-ahorro",
  code: "2C",
  capabilities: ["code-preview", "console-fix", "share", "copy-canvas"],
  whyCanvas: "El juego se juega en la vista previa, se comparte con un enlace y un compañero hace su propia copia con «Copiar Canvas» para cambiar una regla sin tocar tu original.",
  outsideCanvas: "Todo ocurre en Gemini. Los enlaces compartidos abren solo en gemini.google.com, no en la aplicación móvil. Si tu cuenta institucional no permite enlaces, usa «Copiar contenido» y pega el código en un chat nuevo con Canvas.",
  title: "Juego de decisiones «Meta de ahorro» para compartir y copiar",
  level: "Intermedio",
  duration: "30 min",
  canvasFeature: "Juego en la vista previa + Compartir + Copiar Canvas",
  goal: "Construir un juego por turnos con reglas exactas, comprobar sus resultados jugando y compartirlo para que otra persona lo copie y cambie una regla.",
  scenario: "El grupo practica finanzas personales. Quieren un juego corto donde cada decisión de ahorro tenga un efecto que se pueda comprobar con cuentas simples.",
  promptParts: {
    role: "diseñador de juegos educativos de finanzas personales",
    context: "Los aprendices decidirán cuánto ahorrar cada semana y verán al final si cumplieron la meta. El juego se compartirá con otros grupos.",
    data: IN_AHORRO,
    instruction: "En Canvas, crea un juego web de una sola página con:",
    task: ["La pantalla y los botones de las reglas, con una barra de ahorro acumulado que se anima.", "El cálculo semanal con el imprevisto de la semana 3 y el resultado final frente a la meta.", "Un mensaje de resultado accesible (aria-live) y un botón para reiniciar."],
    constraints: ["Sin librerías externas ni descargas de archivos.", "Montos en pesos colombianos con punto de miles."],
    format: "Un solo archivo HTML ejecutable.",
    tone: "Motivador y claro, para jóvenes aprendices."
  },
  places: ["canvas", "canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
  steps: [
    "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
    "Abre la «Vista previa» y juega una partida eligiendo 50 % las seis semanas; comprueba el ahorro final y el mensaje de resultado.",
    "Si la vista previa muestra un error, abre la consola o usa «Corregir error» para que Gemini lo repare.",
    "Reinicia y juega otra partida con 75 % las seis semanas; comprueba que la semana 3 ahorra menos por el imprevisto.",
    "Usa «Compartir» en «Compartir y exportar» para generar el enlace (si tu cuenta institucional no lo permite, usa «Copiar contenido» y pégalo en un chat nuevo con Canvas).",
    "Pide a un compañero que abra tu enlace y pulse «Copiar Canvas»; en su copia debe cambiar el imprevisto de la semana 3 a 120.000 COP y jugar con 75 %. Tu juego original no cambia.",
    "Comprueba tu resultado con la lista «Verifica tu resultado» de esta guía."
  ],
  expected: [
    "Con 50 % las seis semanas el ahorro final es 600.000 COP y el juego dice que cumpliste la meta de 500.000 COP.",
    "Con 25 % las seis semanas el ahorro final es 300.000 COP y el juego dice que no cumpliste la meta.",
    "Con 75 % las seis semanas el ahorro final es 870.000 COP; la semana 3 ahorra 120.000 COP por el imprevisto.",
    "El botón Reiniciar deja la semana en 1 y el ahorro en 0.",
    "Con el imprevisto en 120.000 COP, 75 % deja 830.000 COP en la copia de tu compañero.",
    "Tu juego original conserva el imprevisto de 80.000 COP después de que tu compañero edita su copia."
  ],
  stretch: "Pide: «Agrega una semana 5 con un aumento de sueldo de 10 % y una tabla con el ahorro semanal de la partida».",
  previewSvg: canvasSvgBars("Gráfico de barras con el ahorro semanal de una partida con 75 por ciento: 150.000 cinco semanas y 120.000 en la semana 3", "Ahorro por semana con 75 % (miles COP)", ["S1", "S2", "S3", "S4", "S5", "S6"], [150, 150, 120, 150, 150, 150], 2)
});

// 5C: funciones de Gemini dentro de la app
CANVAS_EXERCISES["visual-mockup"].push({
  id: "ui-c-redactor-reportes-ia",
  code: "5C",
  capabilities: ["code-preview", "gemini-in-app", "select-ask"],
  whyCanvas: "La app corre en la vista previa y, con «Agregar funciones de Gemini», su botón usa IA para redactar el reporte; luego ajustas la interfaz señalando un elemento con «Seleccionar y preguntar».",
  outsideCanvas: "Todo ocurre en Canvas. «Agregar funciones de Gemini» exige ser mayor de 18 años; si tu cuenta no lo muestra, el paso 3 trae una ruta con plantilla en JavaScript que se prueba igual en la vista previa.",
  title: "App con funciones de Gemini: redactor de reportes de incidencias",
  level: "Avanzado",
  duration: "35 min",
  canvasFeature: "Vista previa + Agregar funciones de Gemini + Seleccionar y preguntar",
  goal: "Crear una app con un formulario validado y un botón que use IA para redactar el reporte, y comprobar el resultado con criterios que no dependen del texto exacto que escriba la IA.",
  scenario: "Los aprendices reportan daños con frases sueltas. Mantenimiento prefiere un reporte formal y corto, pero necesita que siempre repita el tipo, la ubicación y la prioridad.",
  promptParts: {
    role: "diseñador de producto que integra IA en aplicaciones web",
    context: "Mantenimiento quiere recibir reportes claros. La app debe convertir los campos del formulario en un texto formal sin inventar nada.",
    data: IN_REDACTOR,
    instruction: "En Canvas, crea una app web con vista previa que tenga:",
    task: ["El formulario con sus campos obligatorios, el contador de caracteres y mensajes que expliquen cómo corregir.", "El botón «Redactar reporte» y un cuadro donde aparezca el reporte.", "Un mensaje claro si la redacción falla."],
    constraints: ["Sin librerías externas.", "Por ahora el botón puede mostrar una plantilla de texto; en un paso posterior se conecta a Gemini."],
    format: "Un solo archivo HTML ejecutable.",
    tone: "Cercano y directo en los textos de la app."
  },
  places: ["canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
  steps: [
    "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
    "Abre la «Vista previa», deja la ubicación vacía y pulsa «Redactar reporte»; comprueba el mensaje que explica qué falta.",
    "Usa «Agregar funciones de Gemini» y pide: «Haz que el botón Redactar reporte use Gemini para escribir el reporte formal a partir de los campos» (ruta alternativa si tu cuenta no muestra el botón o eres menor de 18 años: pide un generador con plantilla en JavaScript que arme el reporte con los mismos campos).",
    "En la «Vista previa», escribe la entrada de ejemplo y pulsa «Redactar reporte»; revisa que el texto incluya «Eléctrico», «Bloque A-201» y «Alta».",
    "Activa «Seleccionar y preguntar», haz clic en el cuadro del reporte y pide: «Agrega un botón Copiar reporte y un aviso cuando se copie».",
    "Comprueba tu resultado con la lista «Verifica tu resultado» de esta guía."
  ],
  expected: [
    "Con la ubicación vacía, la app no redacta y dice qué campo falta.",
    "El contador de la descripción llega a 120 caracteres como máximo y no deja escribir más.",
    "El reporte generado tiene máximo 3 líneas e incluye Eléctrico, Bloque A-201 y Alta.",
    "El reporte no inventa causas ni nombres que no estén en la entrada.",
    "El botón «Copiar reporte» copia el texto y muestra un aviso.",
    "Si la redacción falla, la app muestra un mensaje claro en lugar de quedarse en blanco."
  ],
  stretch: "Pide: «Agrega un selector de tono (formal o breve) y compara los dos reportes generados con la misma entrada». Recuerda que la IA puede variar el texto: revisa las reglas, no las palabras exactas.",
  previewSvg: canvasSvgMock("Maqueta de la app Redactor de reportes con un formulario y un reporte generado", "Redactor de reportes con IA", "phone")
});

// 6C: sugerencias de edición
CANVAS_EXERCISES["inline-prompting"].push({
  id: "inline-c-sugerencias-comunicado",
  code: "6C",
  capabilities: ["suggest-edits", "inline-edit", "manual-edit", "versions"],
  whyCanvas: "«Sugerencias de edición» propone cambios sobre el texto que seleccionas y tú decides cuáles aceptar: así corriges ortografía y redacción sin que cambien las fechas ni las horas.",
  outsideCanvas: "Todo ocurre dentro del documento de Canvas. En el chat normal, Gemini podría reescribir el comunicado completo y cambiar fechas o cifras sin que lo notes.",
  title: "Comunicado con errores: aceptar y rechazar sugerencias de edición",
  level: "Básico",
  duration: "20 min",
  canvasFeature: "Sugerencias de edición + Edición directa + Historial de versiones",
  goal: "Corregir un comunicado revisando cada sugerencia de Gemini, aceptando las de ortografía y rechazando las que tocan fechas, horas o cifras.",
  scenario: "La coordinación redactó un comunicado con prisa. Debe salir hoy y las fechas y los horarios no pueden cambiar.",
  promptParts: {
    role: "corrector de estilo de comunicaciones institucionales",
    context: "Voy a practicar las sugerencias de edición de Canvas con un comunicado que tiene errores a propósito. Necesito el texto original intacto para revisarlo después.",
    data: IN_COMUNICADO,
    instruction: "Copia el comunicado en Canvas sin cambiar ninguna palabra. Luego, en el chat:",
    task: ["Lista los errores de ortografía y de redacción que encuentres, sin corregirlos y sin modificar el documento."],
    constraints: ["No cambies ninguna palabra del documento en este paso."],
    format: "Documento en Canvas y una lista breve en el chat.",
    tone: "Respetuoso y neutral en las observaciones."
  },
  places: ["canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
  steps: [
    "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
    "Selecciona el primer párrafo completo y pulsa «Sugerencias de edición»; lee cada sugerencia antes de aceptarla.",
    "Acepta las sugerencias de ortografía y de redacción, y rechaza cualquiera que cambie una fecha, una hora o un número.",
    "Haz clic directamente en el documento y corrige a mano lo que Gemini no haya detectado en el segundo párrafo.",
    "Abre «Mostrar cambios recientes» o «Versión anterior» para comparar y confirmar que las fechas y las horas siguen iguales.",
    "Comprueba tu resultado con la lista «Verifica tu resultado» de esta guía."
  ],
  expected: [
    "Las palabras sin tilde quedaron corregidas: abrirá, días, estará, harán, normalizará y sábado.",
    "«haiga» quedó como «haya».",
    "Las fechas (lunes 23, sábado 28 y domingo 29 de noviembre de 2026) y las horas (7:00 a. m., 5:00 p. m., 8:00 a. m. y 12:00 m.) no cambiaron.",
    "La solicitud de autorización dejó de ser una sola frase larga: queda en frases más cortas o en una lista de datos.",
    "«Mostrar cambios recientes» o «Versión anterior» deja ver que solo cambiaron los fragmentos que aceptaste."
  ],
  stretch: "Pide: «Selecciona el comunicado completo y crea una versión de tres líneas para un mensaje de WhatsApp, sin cambiar fechas ni horas».",
  previewSvg: canvasSvgMock("Maqueta de un documento con un párrafo seleccionado y sugerencias de edición", "Sugerencias de edición", "doc")
});

// 7C: Python con Exportar a Colab
CANVAS_EXERCISES["algorithm-refactor"].push({
  id: "algo-c-notas-colab",
  code: "7C",
  externalRequired: true,
  capabilities: ["export-colab", "inline-edit"],
  whyCanvas: "Canvas escribe y ajusta el Python por selección, y «Exportar a Colab» lo convierte en un cuaderno que se ejecuta de verdad: escribes en un lugar y compruebas en otro con un solo clic.",
  outsideCanvas: "Canvas edita el Python, pero no lo ejecuta por sí solo: los pasos 3, 4 y 6 ocurren en Google Colab, fuera de Gemini, y necesitas tu cuenta de Google para abrir el cuaderno.",
  title: "Análisis de notas en Python: de Canvas a un cuaderno de Colab",
  level: "Intermedio",
  duration: "30 min",
  canvasFeature: "Canvas de código Python + Exportar a Colab",
  goal: "Escribir un script de estadística básica en Canvas, ajustarlo por selección, ejecutarlo en Colab y volver a Canvas para ampliarlo.",
  scenario: "La instructora tiene las notas del proyecto final de la ficha 2871 y quiere promedio, mediana, desviación y porcentaje de aprobados sin usar una hoja de cálculo.",
  promptParts: {
    role: "profesor de programación que enseña estadística básica",
    context: "La instructora quiere entender cómo le fue al grupo en el proyecto final. El script debe poder ejecutarse en un cuaderno sin instalar nada.",
    data: IN_NOTAS_GRUPO,
    instruction: "En Canvas, escribe un script de Python con:",
    task: ["Las funciones promedio, mediana, desviacion y porcentaje_aprobados, cada una con docstring y anotaciones de tipo.", "Cuatro pruebas con assert, una por función, con las notas de los datos.", "Un informe impreso con cada cifra redondeada a dos decimales."],
    constraints: ["Solo biblioteca estándar de Python.", "Todo el código en un archivo, listo para ejecutarse de arriba abajo."],
    format: "Un script de Python comentado.",
    tone: "Didáctico, con comentarios breves."
  },
  places: ["canvas", "canvas", "external", "external", "canvas", "external", "portal"],
  steps: [
    "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo para generar el script de Python.",
    "Selecciona la función de desviación y escribe: «Agrega un docstring con la fórmula y un ejemplo con tres notas».",
    "Abre «Compartir y exportar → Exportar a Colab»; Colab abre un cuaderno nuevo con tu código.",
    "En Colab, ejecuta la celda con el botón de reproducir y lee la salida; si una prueba falla, copia el error.",
    "Vuelve a Canvas y pide en el chat de la izquierda: «Agrega una función en_riesgo que devuelva las notas menores a 3.0 y una prueba con assert». Si Colab mostró un error, pégalo en el mismo mensaje.",
    "Exporta de nuevo con «Exportar a Colab» y ejecuta el cuaderno: las pruebas nuevas también deben pasar.",
    "Comprueba tu resultado con la lista «Verifica tu resultado» de esta guía."
  ],
  expected: [
    "El script tiene las funciones promedio, mediana, desviacion y porcentaje_aprobados, cada una con docstring.",
    "En Colab, el promedio es 3,75 y la mediana es 3,85.",
    "La desviación estándar poblacional es 0,67.",
    "Aprobaron 8 de 12 aprendices: 66,67 %.",
    "Las cuatro pruebas con assert pasan en Colab sin errores.",
    "La función en_riesgo devuelve 2.5 y 2.9, y su prueba pasa."
  ],
  stretch: "Pide: «Agrega una función que agrupe las notas por rango (menor de 3, de 3 a 3.9 y de 4 en adelante) y cuente cuántos aprendices hay en cada uno».",
  previewSvg: canvasSvgBars("Gráfico de barras con las doce notas del grupo, desde 2,5 hasta 4,8", "Notas del grupo 2871", ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "A11", "A12"], [4.2, 3.8, 2.9, 4.5, 3.1, 3.6, 4.8, 2.5, 3.9, 4.0, 3.3, 4.4], 6)
});

// 8C: LaTeX y PDF
CANVAS_EXERCISES["rubric-curriculum"].push({
  id: "rubric-c-formulas-latex",
  code: "8C",
  capabilities: ["doc-create", "inline-edit", "latex", "export-pdf"],
  whyCanvas: "Las fórmulas de calificación quedan en un documento con formato matemático: las ajustas por selección y compruebas en la vista previa del PDF que ninguna ecuación se parta.",
  outsideCanvas: "Todo ocurre en Gemini: el documento, las fórmulas y la vista previa del PDF. La opción de fórmulas en el menú «Crear» puede llamarse distinto o no aparecer en tu cuenta; en ese caso el paso 3 trae una alternativa por chat.",
  title: "Ficha de fórmulas de calificación con LaTeX y exportación a PDF",
  level: "Intermedio",
  duration: "25 min",
  canvasFeature: "Documento + fórmulas LaTeX + Exportar a PDF",
  goal: "Redactar la fórmula de la nota final con formato matemático, calcular dos casos y revisar cómo queda en un PDF.",
  scenario: "Los instructores quieren publicar cómo se calcula la nota del proyecto para que ningún aprendiz tenga dudas. La ficha debe verse bien impresa.",
  promptParts: {
    role: "diseñador de instrumentos de evaluación por competencias",
    context: "Los aprendices recibirán esta ficha impresa. Las fórmulas deben leerse con claridad y los cálculos deben poder repetirse a mano.",
    data: IN_FICHA_FORMULAS,
    instruction: "En Canvas, redacta la ficha con:",
    task: ["La fórmula de la nota final con una sumatoria y la regla de aprobación como desigualdad.", "El cálculo paso a paso de los aprendices 2 y 3, cada uno con sus ecuaciones.", "Una tabla con criterio, peso, puntaje y aporte de cada aprendiz."],
    constraints: ["Escribe las ecuaciones en LaTeX, no como texto con símbolos.", "Usa los pesos como decimales: 0,30; 0,25; 0,20 y 0,25."],
    format: "Documento con títulos numerados, ecuaciones y una tabla.",
    tone: "Formativo y preciso, sin tecnicismos innecesarios."
  },
  places: ["canvas", "canvas", "canvas", "canvas", "canvas", "portal"],
  steps: [
    "Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.",
    "Selecciona la ecuación de la nota final y escribe: «Escríbela con una sumatoria y con los pesos como decimales».",
    "Abre el menú «Crear» y elige la opción de fórmulas LaTeX para que las ecuaciones se muestren con formato matemático (si tu cuenta no la muestra, pide en el chat de la izquierda: «Escribe todas las ecuaciones en LaTeX»).",
    "Revisa que las ecuaciones se vean como fórmulas y no como texto con signos de dólar o barras invertidas.",
    "Abre «Compartir y exportar → Exportar a PDF» y revisa en la vista previa que ninguna ecuación ni la tabla se parta entre páginas.",
    "Comprueba tu resultado con la lista «Verifica tu resultado» de esta guía."
  ],
  expected: [
    "La nota del aprendiz 2 es 3,85 y queda «Aprobado» sin plan de mejoramiento.",
    "La nota del aprendiz 3 es 2,95: «No aprobado», con plan de mejoramiento porque Pruebas está por debajo de 3.",
    "La fórmula usa una sumatoria con los pesos 0,30, 0,25, 0,20 y 0,25.",
    "Las ecuaciones se ven con formato matemático, sin signos de dólar ni barras invertidas visibles.",
    "La tabla tiene cuatro criterios y una fila de nota final por aprendiz.",
    "En la vista previa del PDF, las ecuaciones y la tabla quedan completas."
  ],
  stretch: "Pide: «Agrega la fórmula del promedio del grupo y un ejemplo con las notas de los aprendices 2 y 3».",
  previewSvg: canvasSvgRadar("Gráfico radar con los puntajes de los aprendices 2 y 3 en cuatro criterios", "Aprendices 2 y 3", ["Diseño", "Validación", "Documentación", "Pruebas"], [
    { name: "Aprendiz 2", values: [5, 4, 3, 3], cls: "cx-p" },
    { name: "Aprendiz 3", values: [3, 3, 4, 2], cls: "cx-d" }
  ], 5)
});

// 11C: foto de una tabla
CANVAS_EXERCISES["multimodal-vision"].push({
  id: "mm-c-tabla-inventario",
  materials: [{ href: "materiales/gemini_canvas/inventario_laboratorio.png", label: "Foto del inventario del laboratorio" }],
  code: "11C",
  capabilities: ["image-input", "code-preview", "inline-edit"],
  whyCanvas: "Canvas convierte la foto de una tabla escrita a mano en una página que funciona: puedes corregir una cifra mal leída por selección y probar un conteo nuevo en la vista previa.",
  outsideCanvas: "Gemini también lee la foto en el chat sin Canvas, pero la tabla con el conteo editable y el ajuste por selección ocurren dentro de Canvas.",
  title: "De la foto de un inventario a un tablero de compras",
  level: "Intermedio",
  duration: "25 min",
  canvasFeature: "Imagen adjunta + Vista previa + edición por selección",
  goal: "Digitalizar una tabla manuscrita, verificar que Gemini leyó bien cada cifra y convertirla en un tablero que calcula qué hay que comprar.",
  scenario: "El encargado del laboratorio de redes lleva el inventario en una hoja de cuaderno. Necesita saber rápido qué insumos están por debajo del mínimo y cuántas unidades faltan.",
  promptParts: {
    role: "analista de inventarios que digitaliza registros en papel",
    context: "El laboratorio de redes lleva el inventario a mano. Adjunto la foto de la hoja para convertirla en un tablero que muestre qué hay que comprar.",
    data: IN_INVENTARIO,
    instruction: "En Canvas, crea una página web con vista previa que digitalice la tabla de la imagen con:",
    task: ["Una tabla con los seis insumos, su cantidad y su mínimo, tal como aparecen en la foto.", "Una columna «Faltan» con las unidades que faltan para llegar al mínimo y un estado escrito («Completo» o «Por comprar»), no solo con color.", "Tarjetas con el número de insumos por comprar y el total de unidades que faltan.", "Un cuadro de texto con la lista de compra para copiar, una línea por insumo."],
    constraints: ["Conserva los nombres y las cifras de la foto; si una cifra no se lee, indícalo.", "Sin librerías externas ni descargas de archivos."],
    format: "Un solo archivo HTML ejecutable.",
    tone: "Claro y directo, para el encargado del laboratorio."
  },
  places: ["gemini", "canvas", "canvas", "canvas", "canvas", "portal"],
  steps: [
    "Descarga `materiales/gemini_canvas/inventario_laboratorio.png` y adjunta esa imagen (o la foto de una tabla tuya) con «+» en el chat de Gemini, activa Canvas, pega el prompt y envíalo.",
    "Abre la «Vista previa» y compara la tabla con la imagen fila por fila; anota cualquier cifra que Gemini haya leído mal.",
    "Si una cifra está mal, selecciona esa fila en el código y escribe: «Corrige esta fila con los valores de la foto».",
    "Pide en el chat de la izquierda: «Agrega un campo para registrar un conteo nuevo de un insumo y que el tablero se actualice al instante».",
    "En la «Vista previa», escribe 60 en el conteo de Conector RJ45 y comprueba que el total de unidades que faltan baje de 36 a 21 y que ese insumo pase a «Completo».",
    "Comprueba tu resultado con la lista «Verifica tu resultado» de esta guía."
  ],
  expected: [
    "La tabla muestra los seis insumos con las cifras de la foto, por ejemplo Conector RJ45: 35 de 50.",
    "Hay 3 insumos por comprar: Conector RJ45 (faltan 15), Switch 8 puertos (falta 1) y Etiquetas (faltan 20).",
    "El total de unidades que faltan es 36.",
    "El estado se lee con texto («Por comprar» o «Completo»), no solo con color.",
    "Con 60 conectores RJ45 el total baja a 21 y ese insumo queda en «Completo».",
    "La lista de compra para copiar tiene una línea por cada insumo por comprar."
  ],
  stretch: "Pide: «Agrega un precio por unidad en cada fila y calcula el costo total de la compra».",
  previewSvg: canvasSvgBars("Gráfico de barras con la cantidad de cada insumo del laboratorio: conectores 35, switch 2 y etiquetas 0 están bajo el mínimo", "Cantidad por insumo", ["UTP", "RJ45", "Router", "Switch", "Cinta", "Etiq."], [6, 35, 4, 2, 9, 0], 1)
});

// --- Prompt estructurado con método CRTT+L (Contexto, Rol, Tarea, Tono y Límites) ---
function composeCanvasPrompt(parts) {
  return [
    `Contexto: ${parts.context}`,
    `Rol: Actúa como ${parts.role}.`,
    `Datos:\n"""\n${parts.data.trim()}\n"""`,
    `Tarea: ${parts.instruction}\n${parts.task.map((t, i) => `${i + 1}. ${t}`).join("\n")}\nEntrega: ${parts.format}`,
    `Tono: ${parts.tone}`,
    `Límites:\n${parts.constraints.map(c => `- ${c}`).join("\n")}`
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
      ${row("Contexto", `<p>${e(parts.context)}</p>`)}
      ${row("Rol", `<p>Actúa como ${e(parts.role)}.</p>`)}
      ${row("Datos", `<pre class="canvas-exercise-code"><code>${e(parts.data.trim())}</code></pre>`)}
      ${row("Tarea", `<p>${e(parts.instruction)}</p><ol>${parts.task.map(t => `<li>${e(t)}</li>`).join("")}</ol><p><strong>Entrega:</strong> ${e(parts.format)}</p>`)}
      ${row("Tono", `<p>${e(parts.tone)}</p>`)}
      ${row("Límites", `<ul>${parts.constraints.map(c => `<li>${e(c)}</li>`).join("")}</ul>`)}
    </div>`;
}

// Archivos que el aprendiz adjunta en Gemini; se descargan desde la misma tarjeta.
function buildCanvasMaterialsHtml(materials) {
  if (!Array.isArray(materials) || !materials.length) return "";
  const e = escapeCanvasHtml;
  const links = materials.map(m => {
    const name = m.href.split("/").pop();
    return `<li><a class="material-link" href="${e(m.href)}" download="${e(name)}">📥 ${e(m.label)} (${e(name)})</a></li>`;
  }).join("");
  return `<section class="canvas-exercise-section canvas-exercise-materials">
            <h5>📎 Antes de empezar, descarga el material</h5>
            <p class="canvas-exercise-hint">Lo adjuntarás en el chat de Gemini con el botón «+».</p>
            <ul>${links}</ul>
          </section>`;
}

const GEMINI_APP_URL = "https://gemini.google.com/app";

// Texto que copia cada botón de la tarjeta: el prompt o el código de referencia.
function canvasCopyText(exercise, kind) {
  if (!exercise) return "";
  if (kind === "prompt") return exercise.prompt || "";
  if (kind === "reference") return (exercise.reference && exercise.reference.code) || "";
  return "";
}

// Código correcto del caso: el aprendiz lo pega en el chat de la izquierda para verlo y compararlo sin salir de Canvas.
function buildCanvasReferenceHtml(reference) {
  if (!reference || !reference.code) return "";
  const e = escapeCanvasHtml;
  return `<section class="canvas-exercise-section canvas-exercise-reference">
            <div class="canvas-exercise-block-head">
              <h5>🔎 ${e(reference.label)}</h5>
              <button type="button" class="canvas-exercise-copy" data-copy="reference">📋 Copiar código</button>
            </div>
            <p class="canvas-exercise-hint">${e(reference.intro)}</p>
            <pre class="canvas-exercise-code"><code>${e(reference.code)}</code></pre>
          </section>`;
}

function buildCanvasExerciseHtml(exercise, index, mode) {
  if (!exercise) return "";
  const e = escapeCanvasHtml;
  const tag = `Parte ${["A", "B", "C"][index] || "A"}`;
  const scopeTag = coverageKit.buildExerciseScopeTag(exercise);
  const caps = (exercise.capabilities || []).filter(id => CANVAS_CAPABILITIES[id]).map(id =>
    `<li class="canvas-capability-chip" title="${e(CANVAS_CAPABILITIES[id].how)}">${e(CANVAS_CAPABILITIES[id].name)}</li>`).join("");
  const steps = exercise.steps.map((s, si) => {
    const placeKey = Array.isArray(exercise.places) ? exercise.places[si] : "canvas";
    const placeBadge = coverageKit.buildStepPlaceBadge(placeKey);
    return `<li class="canvas-exercise-step" data-step-index="${si}"><label class="canvas-step-check-wrap"><input type="checkbox" class="canvas-step-done" data-step-index="${si}" aria-label="Marcar paso ${si + 1} como realizado"> ${placeBadge} <span class="canvas-step-text">${formatCanvasStep(s)}</span></label></li>`;
  }).join("");
  const checks = exercise.expected.map((c, i) =>
    `<li><label><input type="checkbox" class="canvas-exercise-check" data-check-index="${i}"> <span>${e(c)}</span></label></li>`).join("");
  return `
    <article class="canvas-exercise-card" id="ejercicio-${e(exercise.id)}" data-exercise-id="${e(exercise.id)}" tabindex="-1">
      <header class="canvas-exercise-head">
        <div class="canvas-exercise-head-top">
          <span class="canvas-exercise-tag">${tag}</span>
          ${scopeTag}
          <button type="button" class="canvas-back-simulator-btn" data-go-simulator="${e(mode || "")}">👁️ Ver ejemplo en el simulador</button>
        </div>
        <h4>${e(exercise.title)}</h4>
        <div class="canvas-exercise-meta">
          <span>📶 ${e(exercise.level)}</span>
          <span>⏱️ ${e(exercise.duration)}</span>
          <span>✨ ${e(exercise.canvasFeature)}</span>
        </div>
      </header>
      <nav class="canvas-exercise-stepper" aria-label="Ruta guiada del ejercicio">
        <span class="stepper-item is-done">0. Ejemplo visto</span>
        <span class="stepper-sep" aria-hidden="true">→</span>
        <span class="stepper-item is-current">1. Copia el prompt</span>
        <span class="stepper-sep" aria-hidden="true">→</span>
        <span class="stepper-item">2. Itera en Canvas</span>
        <span class="stepper-sep" aria-hidden="true">→</span>
        <span class="stepper-item">3. Verifica y avanza</span>
      </nav>
      <div class="canvas-exercise-grid">
        <div class="canvas-exercise-main">
          <section class="canvas-exercise-section">
            <h5>🎯 Qué vas a lograr</h5>
            <p>${e(exercise.goal)}</p>
            <h5>📌 Situación</h5>
            <p>${e(exercise.scenario)}</p>
            ${exercise.whyCanvas ? `<h5>✨ ¿Por qué en Canvas?</h5>
            <p>${e(exercise.whyCanvas)}</p>
            ${exercise.outsideCanvas ? `<div class="canvas-outside-callout"><strong>🧭 Qué ocurre en Canvas y qué ocurre fuera:</strong> ${e(exercise.outsideCanvas)}</div>` : ""}
            <ul class="canvas-capability-list" aria-label="Capacidades de Canvas que practicas">${caps}</ul>` : ""}
          </section>
          ${buildCanvasMaterialsHtml(exercise.materials)}
          <section class="canvas-exercise-section">
            <div class="canvas-exercise-block-head">
              <h5>💬 1. Copia este prompt y pégalo en Gemini</h5>
              <div class="canvas-exercise-actions">
                <button type="button" class="canvas-exercise-copy is-primary" data-copy="prompt">📋 Copiar prompt completo</button>
                <a class="canvas-exercise-open" href="${GEMINI_APP_URL}" target="_blank" rel="noopener noreferrer">↗ Abrir Gemini</a>
              </div>
            </div>
            <p class="canvas-exercise-hint">En Gemini, abre «Herramientas → Canvas» en la barra del chat antes de pegar el prompt.</p>
            <p class="canvas-exercise-hint">Las órdenes del prompt van dirigidas a Gemini: tú solo activas Canvas, pegas el texto y lo envías. Está organizado con el método CRTT+L (Contexto, Rol, Tarea, Tono y Límites) y los datos van entre comillas triples (""") para que Gemini los distinga de las instrucciones.</p>
            ${buildCanvasPromptHtml(exercise.promptParts)}
          </section>
          <section class="canvas-exercise-section">
            <h5>🧭 2. Itera dentro de Canvas</h5>
            <p class="canvas-exercise-hint">Cada paso indica dónde se ejecuta (🟢 En Canvas, 🟡 En Gemini sin Canvas, 🟠 Fuera de Gemini o 🔵 En esta guía). El texto resaltado es lo que escribes.</p>
            <ol class="canvas-exercise-steps">${steps}</ol>
          </section>
          ${buildCanvasReferenceHtml(exercise.reference)}
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

globalThis.CANVAS_EXERCISES = CANVAS_EXERCISES;
globalThis.CANVAS_CAPABILITIES = CANVAS_CAPABILITIES;
globalThis.canvasCopyText = canvasCopyText;

if (typeof module !== "undefined" && module.exports) {
  module.exports = { GEMINI_APP_URL, canvasCopyText, buildCanvasReferenceHtml, CANVAS_EXERCISES, CANVAS_CAPABILITIES, canvasCapabilityNames, composeCanvasPrompt, escapeCanvasHtml, formatCanvasStep, buildCanvasPromptHtml, buildCanvasExerciseHtml, buildCanvasMaterialsHtml, countCanvasChecklist, canvasSvgFrame, canvasSvgBars, canvasSvgLine, canvasSvgDonut, canvasSvgRadar, canvasSvgHeatmap, canvasSvgFlow, canvasSvgMock };
}
