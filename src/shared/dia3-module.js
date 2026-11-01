// Módulo interactivo del Día 3: IA Agéntica, Construcción Web en 3 Archivos,
// Propiedad Intelectual, Licencias y Seguridad de APIs.
// Incluye funciones deterministas de clasificación, KPIs, auditoría estática de código,
// cálculo de presupuesto de tokens, 4 ejemplos con vista previa en vivo y 6 ejercicios R-C-I-R-F.

let dia3Kit = globalThis;
if (typeof module !== "undefined" && module.exports) {
  dia3Kit = require("./canvas-exercises.js");
}

// --- 1. Datos canónicos y funciones puras deterministas ---

const DIA3_CATEGORIES = {
  "Documentos": [".pdf", ".docx", ".txt", ".xlsx", ".pptx"],
  "Imágenes": [".png", ".jpg", ".svg", ".webp", ".jpeg"],
  "Código y Scripts": [".html", ".css", ".js", ".py", ".sql", ".ps1"],
  "Datos y Tablas": [".csv", ".json", ".xml"],
  "Comprimidos y Backups": [".zip", ".bak", ".tar.gz", ".rar"]
};

const DIA3_LEARNERS = [
  { id: 1, nombre: "Andrés Gómez", ficha: "ADSO-2871", evidencias_entregadas: 8, total_evidencias: 8, asistencia_porcentaje: 95, estado: "Al día" },
  { id: 2, nombre: "Laura Morales", ficha: "ADSO-2871", evidencias_entregadas: 7, total_evidencias: 8, asistencia_porcentaje: 88, estado: "En progreso" },
  { id: 3, nombre: "Carlos Rojas", ficha: "ADSO-2871", evidencias_entregadas: 4, total_evidencias: 8, asistencia_porcentaje: 72, estado: "Requiere apoyo" },
  { id: 4, nombre: "Diana Castillo", ficha: "ADSO-2872", evidencias_entregadas: 8, total_evidencias: 8, asistencia_porcentaje: 100, estado: "Al día" },
  { id: 5, nombre: "Miguel Vélez", ficha: "ADSO-2872", evidencias_entregadas: 6, total_evidencias: 8, asistencia_porcentaje: 85, estado: "En progreso" },
  { id: 6, nombre: "Valentina Duarte", ficha: "ADSO-2872", evidencias_entregadas: 8, total_evidencias: 8, asistencia_porcentaje: 98, estado: "Al día" },
  { id: 7, nombre: "Julián Parra", ficha: "ADSO-2871", evidencias_entregadas: 3, total_evidencias: 8, asistencia_porcentaje: 65, estado: "Requiere apoyo" },
  { id: 8, nombre: "Sofía Cárdenas", ficha: "ADSO-2872", evidencias_entregadas: 7, total_evidencias: 8, asistencia_porcentaje: 92, estado: "En progreso" }
];

const DIA3_HARDWARE_PROFILES = {
  "sala3-lenta": {
    id: "sala3-lenta",
    name: "Estación Sala 3 (Equipo Lento)",
    cpuModel: "Procesador 4 núcleos · 2,1 GHz",
    cpuUsage: 94,
    ramUsedGb: 7.6,
    ramTotalGb: 8,
    diskFreeGb: 9,
    diskType: "HDD Mecánico 5400 RPM",
    topProcess: "Antivirus + Indexador de búsqueda (62 % CPU)"
  },
  "portatil-optimo": {
    id: "portatil-optimo",
    name: "Portátil Instructor (Óptimo)",
    cpuModel: "Procesador 12 núcleos · 3,4 GHz",
    cpuUsage: 28,
    ramUsedGb: 9.2,
    ramTotalGb: 32,
    diskFreeGb: 410,
    diskType: "SSD NVMe PCIe 4.0",
    topProcess: "Editor de código + Navegador (18 % CPU)"
  },
  "servidor-alerta": {
    id: "servidor-alerta",
    name: "Estación Sala 4 (Carga Moderada)",
    cpuModel: "Procesador 8 núcleos · 2,8 GHz",
    cpuUsage: 76,
    ramUsedGb: 13.4,
    ramTotalGb: 16,
    diskFreeGb: 26,
    diskType: "SSD SATA III",
    topProcess: "Contenedores de práctica web (49 % CPU)"
  }
};

function dia3CategorizeExtension(ext) {
  const lower = String(ext).toLowerCase().trim();
  for (const [category, extensions] of Object.entries(DIA3_CATEGORIES)) {
    if (extensions.includes(lower)) return category;
  }
  return "Otros";
}

function dia3ComputeFileInventory(files) {
  const byCategory = {
    "Documentos": 0,
    "Imágenes": 0,
    "Código y Scripts": 0,
    "Datos y Tablas": 0,
    "Comprimidos y Backups": 0,
    "Otros": 0
  };
  const seenNames = new Set();
  const collisions = [];
  let totalSizeKb = 0;

  for (const file of files) {
    const dotIndex = file.name.lastIndexOf(".");
    const ext = dotIndex >= 0 ? file.name.slice(dotIndex) : "";
    const cat = dia3CategorizeExtension(ext);
    byCategory[cat] += 1;
    totalSizeKb += file.sizeKb;
    if (seenNames.has(file.name)) {
      collisions.push(file.name);
    } else {
      seenNames.add(file.name);
    }
  }

  return {
    totalFiles: files.length,
    totalSizeKb: Math.round(totalSizeKb * 100) / 100,
    byCategory,
    collisions
  };
}

function dia3ComputeInstructorKpis(learners) {
  if (!learners.length) {
    return { total: 0, alDia: 0, enProgreso: 0, requiereApoyo: 0, promedioAsistencia: 0, promedioEvidenciasPct: 0 };
  }
  const total = learners.length;
  const alDia = learners.filter(l => l.estado === "Al día").length;
  const enProgreso = learners.filter(l => l.estado === "En progreso").length;
  const requiereApoyo = learners.filter(l => l.estado === "Requiere apoyo").length;
  const sumAsistencia = learners.reduce((acc, l) => acc + l.asistencia_porcentaje, 0);
  const sumEvidenciasPct = learners.reduce((acc, l) => acc + (l.evidencias_entregadas / l.total_evidencias) * 100, 0);

  return {
    total,
    alDia,
    enProgreso,
    requiereApoyo,
    promedioAsistencia: Math.round((sumAsistencia / total) * 10) / 10,
    promedioEvidenciasPct: Math.round((sumEvidenciasPct / total) * 10) / 10
  };
}

function dia3FilterLearners(learners, query, status) {
  const q = String(query).toLowerCase().trim();
  return learners.filter(l => {
    const matchText = !q || l.nombre.toLowerCase().includes(q) || l.ficha.toLowerCase().includes(q);
    const matchStatus = status === "todos" || l.estado === status;
    return matchText && matchStatus;
  });
}

function dia3EvaluateHardwareProfile(profile) {
  const bottlenecks = [];
  const ramPct = Math.round((profile.ramUsedGb / profile.ramTotalGb) * 100);

  if (profile.cpuUsage >= 85) {
    bottlenecks.push(`CPU saturada (${profile.cpuUsage} %): cerrar procesos pesados en segundo plano.`);
  }
  if (ramPct >= 85) {
    bottlenecks.push(`Memoria RAM al límite (${ramPct} % en uso): ampliar a 16 GB o superior.`);
  }
  if (profile.diskFreeGb < 15 || profile.diskType.includes("HDD")) {
    bottlenecks.push(`Almacenamiento crítico (${profile.diskFreeGb} GB libres en ${profile.diskType}): migrar a SSD NVMe.`);
  }

  let status = "ÓPTIMO";
  if (bottlenecks.length >= 2) {
    status = "CRÍTICO";
  } else if (bottlenecks.length === 1 || profile.cpuUsage >= 70 || ramPct >= 75) {
    status = "ADVERTENCIA";
  }

  return { status, ramPct, bottlenecks };
}

// --- 2. Auditor estático determinista de seguridad de código, licencias y APIs ---

const DIA3_SECURITY_PRESETS = {
  vulnerable: {
    label: "❌ Código Vulnerable (Clave quemada + GPL + Bucle infinito)",
    code: `// Lizenz: Copiado de repositorio GPL-3.0 sin atribución
const API_KEY = "AIzaSyD9...";

async function ejecutarAgenteSinLimite(promptUsuario) {
  while (true) {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini:generateContent?key=" + API_KEY, {
      method: "POST",
      body: JSON.stringify({ contents: [{ parts: [{ text: promptUsuario }] }] })
    });
    const data = await res.json();
    if (data.listo) return data;
  }
}`
  },
  warning: {
    label: "⚠️ Código Incompleto (Sin clave quemada, pero sin límite de iteraciones)",
    code: `// Módulo propio bajo licencia permisiva MIT
async function consultarPasarelaBackend(promptUsuario) {
  let pasos = 0;
  while (pasos >= 0) {
    const res = await fetch("/api/ia/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptUsuario })
    });
    const data = await res.json();
    if (data.completado) return data;
    pasos++;
  }
}`
  },
  secure: {
    label: "✓ Arquitectura BFF Segura (Estándar de Oro)",
    code: `// Autoría humana documentada · Licencia MIT permisiva
// El frontend llama a su propio backend (/api/ia/generar); la clave vive en variable de entorno del servidor.
const MAX_ITERATIONS = 5;

async function consultarAgenteSeguro(promptUsuario) {
  for (let intento = 1; intento <= MAX_ITERATIONS; intento++) {
    const res = await fetch("/api/ia/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptUsuario, maxTokens: 600 })
    });
    if (!res.ok) throw new Error("Error controlado del servidor BFF: " + res.status);
    const data = await res.json();
    if (data.completado) return data;
  }
  throw new Error("Disyuntor activado: se alcanzó el límite máximo de 5 iteraciones.");
}`
  }
};

function dia3AuditCodeSecurity(snippet) {
  const clean = String(snippet).trim();
  if (!clean) {
    return {
      status: "VACÍO",
      summary: "Entrada vacía: escribe o carga una plantilla de código para ejecutar la auditoría estática.",
      findings: [],
      remediation: "Selecciona uno de los tres casos de prueba rápidos o pega tu propio script para analizar credenciales, bucles y licencias."
    };
  }

  const findings = [];

  if (/(AIza[0-9A-Za-z_-]{10,}|sk-[0-9A-Za-z_-]{10,}|api_key\s*=\s*["'][^"']+["']|API_KEY\s*=\s*["'][^"']+["'])/i.test(clean)) {
    findings.push({
      id: "hardcoded-key",
      severity: "CRÍTICO",
      title: "Credencial o clave de API quemada en el código (Hardcoded Secret)",
      detail: "Se detectó un literal de clave (AIza... / sk-... / API_KEY). Si se sube a Git o se sirve al navegador, bots automatizados comprometerán la cuenta en segundos."
    });
  }

  if (/googleapis\.com|api\.openai\.com|api\.anthropic\.com/i.test(clean)) {
    findings.push({
      id: "direct-frontend-call",
      severity: "CRÍTICO",
      title: "Llamada directa al proveedor de IA desde el cliente sin pasarela BFF",
      detail: "El navegador no debe invocar directamente la URL del proveedor comercial. Canaliza la petición por un endpoint propio (/api/...) que custodie la credencial en el servidor."
    });
  }

  if (/while\s*\(\s*true\s*\)|while\s*\(\s*pasos\s*>=\s*0\s*\)/i.test(clean) && !/MAX_ITERATIONS|max_iterations/i.test(clean)) {
    findings.push({
      id: "infinite-loop",
      severity: "ADVERTENCIA",
      title: "Bucle agéntico sin disyuntor (Circuit Breaker / Max Iterations)",
      detail: "Un bucle sin tope estricto de iteraciones puede entrar en recursión infinita ante un error del modelo y agotar el presupuesto mensual de tokens."
    });
  }

  if (/\b(GPL-3\.0|GPL-2\.0|AGPL-3\.0|AGPL)\b/i.test(clean)) {
    findings.push({
      id: "copyleft-license",
      severity: "ADVERTENCIA",
      title: "Riesgo de contaminación por licencia Copyleft fuerte (GPL / AGPL)",
      detail: "Incorporar fragmentos literales licenciados bajo GPL/AGPL obliga legalmente a liberar el código fuente completo de la solución derivada."
    });
  }

  const hasCritical = findings.some(f => f.severity === "CRÍTICO");
  const status = hasCritical ? "CRÍTICO" : findings.length > 0 ? "ADVERTENCIA" : "SEGURO";

  const summary = status === "SEGURO"
    ? "Código conforme al estándar: utiliza ruta BFF, define disyuntor de iteraciones, gestiona errores y declara licencia permisiva."
    : `Se detectaron ${findings.length} hallazgo(s) de seguridad, licenciamiento o control de costos que deben corregirse antes de producción.`;

  return {
    status,
    summary,
    findings,
    remediation: DIA3_SECURITY_PRESETS.secure.code
  };
}

function dia3EstimateTokenBudget(requestsPerDay, avgInputTokens, avgOutputTokens) {
  if (requestsPerDay <= 0 || avgInputTokens <= 0 || avgOutputTokens <= 0) {
    throw new Error("Todos los parámetros de consumo deben ser valores positivos");
  }
  const monthlyRequests = Math.round(requestsPerDay * 30);
  const monthlyInputTokens = monthlyRequests * avgInputTokens;
  const monthlyOutputTokens = monthlyRequests * avgOutputTokens;

  // Tarifa de referencia educativa: USD $0.30 por 1M tokens entrada y USD $1.20 por 1M tokens salida
  const inputCostUsd = (monthlyInputTokens / 1_000_000) * 0.30;
  const outputCostUsd = (monthlyOutputTokens / 1_000_000) * 1.20;
  const estimatedUsd = Math.round((inputCostUsd + outputCostUsd) * 100) / 100;
  const hardLimitUsd = Math.max(5, Math.ceil(estimatedUsd * 1.3));
  const softAlertUsd = Math.round(hardLimitUsd * 0.75 * 100) / 100;
  const estimatedCop = Math.round(estimatedUsd * 4200);

  return {
    monthlyRequests,
    monthlyInputTokens,
    monthlyOutputTokens,
    estimatedUsd,
    estimatedCop,
    softAlertUsd,
    hardLimitUsd
  };
}

// --- 3. Los 4 Ejemplos Interactivos con Vista Previa en Vivo ---

const DIA3_EXAMPLES = {
  "diagnostico-pc": {
    id: "diagnostico-pc",
    badge: "Ejemplo 1 · Agente Local",
    title: "Diagnóstico Agéntico de Hardware y Salud del PC",
    summary: "Descubre cómo un agente inspecciona CPU, memoria RAM y almacenamiento para detectar por qué los equipos de una sala de cómputo están lentos.",
    prompt: `Actúa como ingeniero de soporte e infraestructura TI.

Contexto: Las salas de cómputo 3 y 4 presentan lentitud al abrir entornos de desarrollo web.

Instrucción: Escribe un script en Python y su equivalente en PowerShell que consulte uso de CPU, memoria RAM disponible, espacio libre en disco y tipo de unidad, y clasifique cada estación en ÓPTIMO, ADVERTENCIA o CRÍTICO con recomendaciones accionables.

Restricciones:
- Usa únicamente librerías estándar o comandos nativos de Windows.
- No modifiques configuraciones del sistema ni detengas procesos automáticamente.`,
    codeLang: "PowerShell / Python",
    code: `# Diagnóstico rápido de estación en PowerShell nativo (Windows 11)
$os = Get-CimInstance Win32_OperatingSystem
$cpu = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"

$ramTotalGb = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
$ramFreeGb  = [math]::Round($os.FreePhysicalMemory / 1MB, 1)
$ramUsedGb  = [math]::Round($ramTotalGb - $ramFreeGb, 1)
$diskFreeGb = [math]::Round($disk.FreeSpace / 1GB, 1)

Write-Host "CPU: $cpu% | RAM: $ramUsedGb / $ramTotalGb GB | Disco libre: $diskFreeGb GB"`,
    goodPractice: "El agente ejecuta comandos de solo lectura, resume métricas clave y entrega un semáforo claro para que el humano tome decisiones.",
    badPractice: "Ejecutar scripts descargados a ciegas con permisos de Administrador que borran carpetas temporales del sistema sin confirmar."
  },
  "clasificador-200": {
    id: "clasificador-200",
    badge: "Ejemplo 2 · Automatización",
    title: "Clasificador de 200 Archivos con Prevención de Colisiones y Reporte HTML",
    summary: "Observa cómo el script agrupa 200 archivos desordenados en 5 carpetas temáticas sin sobrescribir entregas con el mismo nombre y genera un tablero HTML.",
    prompt: `Actúa como desarrollador de automatización en Python.

Contexto: Tenemos una carpeta 'archivos_desordenados' con 200 entregas mezcladas (.pdf, .docx, .png, .py, .csv, .zip) de aprendices.

Instrucción: Crea el script 'organizador_archivos.py' que clasifique los archivos en 5 subcarpetas dentro de 'archivos_organizados', evite sobrescribir archivos duplicados agregando un sufijo incremental y genere 'resumen_clasificacion.html' con el conteo por categoría.

Restricciones:
- Usa pathlib.Path y shutil.copy2 para conservar los originales intactos.
- Codificación UTF-8 explícita al escribir el reporte HTML.`,
    codeLang: "Python 3 (pathlib + shutil)",
    code: `from pathlib import Path
import shutil

def copiar_sin_colision(origen: Path, carpeta_destino: Path) -> Path:
    carpeta_destino.mkdir(parents=True, exist_ok=True)
    destino = carpeta_destino / origen.name
    contador = 1
    while destino.exists():
        destino = carpeta_destino / f"{origen.stem}_v{contador}{origen.suffix}"
        contador += 1
    shutil.copy2(origen, destino)
    return destino`,
    goodPractice: "Usa shutil.copy2 sobre una carpeta de salida nueva, verifica si el nombre ya existe antes de copiar y genera un reporte HTML de auditoría.",
    badPractice: "Usar os.rename directo sobre la carpeta original sin respaldo ni validación de nombres repetidos, perdiendo evidencias homónimas."
  },
  "panel-3-archivos": {
    id: "panel-3-archivos",
    badge: "Ejemplo 3 · Regla de 3 Archivos",
    title: "Panel de Instructores en 3 Archivos (index.html + styles.css + app.js)",
    summary: "Explora la separación limpia de responsabilidades: estructura semántica en HTML, diseño visual en CSS y filtrado reactivo con gráficas en JavaScript.",
    prompt: `Actúa como desarrollador frontend senior especialista en interfaces educativas.

Contexto: Los instructores del centro necesitan consultar el avance de evidencias y asistencia de 8 aprendices de las fichas ADSO-2871 y ADSO-2872 sin depender de servidores complejos.

Instrucción: Construye una aplicación web en 3 archivos (index.html, styles.css, app.js) con 4 tarjetas KPI, gráfica comparativa de barras y tabla interactiva con buscador instantáneo y filtro por estado.

Restricciones:
- Debe abrir con doble clic sobre index.html (compatibilidad local file://).
- Usa paleta de descanso visual Verde Salvia (#2D5A4C) y alto contraste WCAG AA.`,
    codeLang: "HTML5 + CSS3 + JS Vanilla",
    code: `// Separación en 3 archivos:
// 1. index.html -> Define <section class="kpi-grid"> y <table id="aprendicesTable">
// 2. styles.css -> Define variables :root (--color-primary: #2d5a4c) y layout responsive
// 3. app.js     -> Escucha eventos 'input' y 'change' para filtrar sin recargar la página:
function filtrarDatos() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const est = document.getElementById("statusFilter").value;
  const filtrados = aprendices.filter(a =>
    (a.nombre.toLowerCase().includes(q) || a.ficha.toLowerCase().includes(q)) &&
    (est === "todos" || a.estado === est)
  );
  renderizarTabla(filtrados);
}`,
    goodPractice: "Mantener HTML, CSS y JS en archivos separados permite que el agente actualice el diseño o la lógica sin romper la estructura.",
    badPractice: "Mezclar 1.500 líneas de estilos inline, HTML y lógica desordenada en un solo archivo imposible de depurar ni mantener."
  },
  "pasarela-bff-segura": {
    id: "pasarela-bff-segura",
    badge: "Ejemplo 4 · APIs & Legal",
    title: "Arquitectura Backend-for-Frontend (BFF), Presupuesto de Tokens y Licencias",
    summary: "Comprende cómo conectar una aplicación web a una API comercial sin exponer la clave en el navegador y cómo proteger la autoría humana.",
    prompt: `Actúa como arquitecto de seguridad de software y consultor legal TI.

Contexto: Un equipo de aprendices desea integrar la API de Gemini en su proyecto formativo web sin arriesgar su clave ni infringir derechos de autor.

Instrucción: Diseña el flujo Backend-for-Frontend (BFF) donde el navegador consulta un endpoint local, el servidor lee GEMINI_API_KEY desde variables de entorno, aplica un límite de 5 iteraciones y documenta la autoría humana de la arquitectura.

Restricciones:
- Cero claves en archivos HTML/JS públicos ni en el historial de Git (.env en .gitignore).
- Solo librerías con licencia permisiva (MIT, Apache 2.0, BSD).`,
    codeLang: "Arquitectura BFF + .gitignore",
    code: `# Archivo .gitignore obligatorio en todo proyecto con APIs:
.env
.env.local
__pycache__/
node_modules/

# En el servidor Backend (Python / Node):
# La clave se lee del entorno seguro del sistema operativo, NUNCA del código fuente:
import os
API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("Configura GEMINI_API_KEY en las variables de entorno.")`,
    goodPractice: "El navegador solo conversa con tu backend (/api/...); el servidor custodia la clave, controla la cuota por usuario y registra la trazabilidad.",
    badPractice: "Pegar 'const API_KEY = \"AIza...\"' en el archivo app.js del navegador creyendo que nadie abrirá las herramientas de desarrollador (F12)."
  }
};

// --- 4. Los 6 Ejercicios Prácticos del Día 3 (2 por bloque temático) ---

const DIA3_BLOCKS = [
  { id: "agentes-archivos", number: "Bloque 1", name: "1. Agentes y Automatización de Archivos (Mañana)" },
  { id: "web-tres-archivos", number: "Bloque 2", name: "2. Web en 3 Archivos y Visualización (Tarde)" },
  { id: "propiedad-apis", number: "Bloque 3", name: "3. Propiedad Intelectual, Licencias y APIs (Tarde)" }
];

const IN_DIA3_INVENTARIO_SALAS = `INVENTARIO DE EQUIPOS DE CÓMPUTO — SALAS 3 Y 4 (datos de práctica)

Equipo,Sala,Nucleos_CPU,RAM_GB,Disco_Libre_GB,Tipo_Disco,Uso_CPU_Promedio
PC-S3-01,Sala 3,4,8,11,HDD,92%
PC-S3-02,Sala 3,4,8,14,HDD,89%
PC-S3-03,Sala 3,6,16,120,SSD,45%
PC-S4-01,Sala 4,8,16,95,SSD,38%
PC-S4-02,Sala 4,4,8,9,HDD,95%
PC-S4-03,Sala 4,12,32,380,NVMe,24%

Reglas técnicas de clasificación del centro:
- APTO IA Y WEB: RAM >= 16 GB, Disco_Libre_GB >= 50 y Tipo_Disco en (SSD, NVMe).
- REQUIERE ACTUALIZACIÓN: RAM == 8 GB o Disco_Libre_GB < 20 o Tipo_Disco == HDD.`;

const IN_DIA3_LOTES_ARCHIVOS = `MUESTRA DE ENTREGAS DESORDENADAS EN LA CARPETA DE RECOLECCIÓN (datos de práctica)

Nombre_Archivo,Tamano_KB,Aprendiz,Ficha
acta_comite_andres_gomez_101.pdf,240,Andrés Gómez,ADSO-2871
acta_comite_andres_gomez_101.pdf,245,Andrés Gómez,ADSO-2871
captura_ui_laura_morales_204.png,680,Laura Morales,ADSO-2871
script_validador_carlos_rojas_309.py,18,Carlos Rojas,ADSO-2871
metricas_diana_castillo_412.json,42,Diana Castillo,ADSO-2872
respaldo_final_miguel_velez_501.zip,1850,Miguel Vélez,ADSO-2872
informe_valentina_duarte_615.docx,310,Valentina Duarte,ADSO-2872
diagrama_arquitectura_sofia_702.svg,95,Sofía Cárdenas,ADSO-2872

Regla de organización:
- Carpetas destino: Documentos, Imágenes, Código y Scripts, Datos y Tablas, Comprimidos y Backups.
- Si un nombre de archivo aparece repetido, conservar ambos agregando '_copia_2' antes de la extensión.`;

const IN_DIA3_PRESTAMO_LAB = `REGISTRO DE EQUIPOS PARA PRÉSTAMO EN LABORATORIO (datos de práctica)

Codigo,Equipo,Ambiente,Estado,Responsable
PORT-01,Portátil Workstation 32GB,Ambiente 305,Disponible,Inventario Lab
PORT-02,Portátil Workstation 32GB,Ambiente 305,Prestado,Andrés Gómez (ADSO-2871)
PORT-03,Portátil Desarrollo 16GB,Ambiente 201,Prestado,Laura Morales (ADSO-2871)
PORT-04,Portátil Desarrollo 16GB,Ambiente 201,Disponible,Inventario Lab
KIT-ARD-01,Kit Sensores IoT SENNOVA,Ambiente 108,En mantenimiento,Soporte Técnico
PORT-05,Portátil Workstation 32GB,Ambiente 305,Disponible,Inventario Lab
TAB-01,Tableta Gráfica UI/UX,Ambiente 204,Prestado,Diana Castillo (ADSO-2872)
PORT-06,Portátil Desarrollo 16GB,Ambiente 201,En mantenimiento,Soporte Técnico`;

const IN_DIA3_SEGUIMIENTO_8 = `DATOS DE SEGUIMIENTO DE APRENDICES — FICHAS ADSO-2871 Y ADSO-2872 (datos de práctica)

ID,Nombre,Ficha,Evidencias_Entregadas,Total_Evidencias,Asistencia_Pct,Estado
1,Andrés Gómez,ADSO-2871,8,8,95%,Al día
2,Laura Morales,ADSO-2871,7,8,88%,En progreso
3,Carlos Rojas,ADSO-2871,4,8,72%,Requiere apoyo
4,Diana Castillo,ADSO-2872,8,8,100%,Al día
5,Miguel Vélez,ADSO-2872,6,8,85%,En progreso
6,Valentina Duarte,ADSO-2872,8,8,98%,Al día
7,Julián Parra,ADSO-2871,3,8,65%,Requiere apoyo
8,Sofía Cárdenas,ADSO-2872,7,8,92%,En progreso

Meta mínima de asistencia institucional: 80%.`;

const IN_DIA3_AUDITORIA_BFF = `CÓDIGO CON DEUDA DE SEGURIDAD DETECTADO EN REVISIÓN DE PARES (datos de práctica)

Archivo: frontend/app.js
1: const GEMINI_KEY = "AIzaSyB89...";
2: async function evaluarEvidencia(textoAprendiz) {
3:   while (true) {
4:     const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_KEY, {
5:       method: "POST",
6:       body: JSON.stringify({ contents: [{ parts: [{ text: textoAprendiz }] }] })
7:     });
8:     const json = await r.json();
9:     if (json.candidates) return json.candidates[0].content.parts[0].text;
10:  }
11: }

Parámetros operativos del centro:
- Usuarios concurrentes: 50 aprendices realizando 4 consultas diarias cada uno (200 peticiones/día).
- Promedio por consulta: 1.000 tokens de entrada y 500 tokens de salida.
- Límite máximo de reintentos permitidos (disyuntor): 3 intentos.`;

const IN_DIA3_DICTAMEN_LEGAL = `INVENTARIO DE MÓDULOS DEL PROYECTO INTEGRADOR PARA AUDITORÍA LEGAL (datos de práctica)

Modulo,Origen_del_Codigo,Licencia_Detectada,Intervencion_Humana
1. Motor de Reglas de Evaluación,Escrito por los aprendices y refactorizado con IA,MIT,Alta (arquitectura, validaciones y casos de borde propios)
2. Generador de PDF de Certificados,Copiado íntegro de librería pública sin cambios,AGPL-3.0,Nula (copia literal de repositorio AGPL-3.0)
3. Texto de bienvenida del sitio,Generado 100% por un prompt simple sin edición,Sin licencia,Nula (salida cruda de un prompt de 1 línea)
4. Conector Backend BFF de API,Diseñado y programado por el equipo sobre FastAPI,Apache-2.0,Alta (esquemas, control de cuota y pruebas propias)

Marco legal de referencia:
- Ley 23 de 1982 (Colombia) / DNDA: solo existe derecho de autor donde hay creación intelectual humana original.
- Política del proyecto: conservar el código institucional sin contaminación viral Copyleft.`;

const DIA3_EXERCISES = {
  "agentes-archivos": [
    {
      id: "dia3-1a-diagnostico-salas",
      title: "Diagnóstico automatizado de las salas 3 y 4 con semáforo de actualización",
      level: "Básico",
      duration: "25 min",
      canvasFeature: "Agente de código / Script Python + Reporte HTML",
      goal: "Construir con ayuda del agente un script que procese el inventario de 6 equipos de las salas 3 y 4, identifique los cuellos de botella de hardware y genere una tabla HTML con semáforo técnico.",
      scenario: "La instructora Andrea necesita demostrar con cifras exactas por qué 3 equipos de las salas 3 y 4 no soportan las prácticas que inician el 22 de marzo.",
      promptParts: {
        role: "ingeniero de infraestructura TI y automatización en Python",
        context: "Necesitamos auditar los equipos de las salas 3 y 4 antes del inicio del módulo de desarrollo web e inteligencia artificial.",
        data: IN_DIA3_INVENTARIO_SALAS,
        instruction: "En Canvas, escribe un script en Python que procese estos datos y entregue:",
        task: [
          "El conteo exacto de equipos clasificados en 'APTO IA Y WEB' y en 'REQUIERE ACTUALIZACIÓN'.",
          "Una tabla HTML con las 6 estaciones, resaltando en rojo los equipos con disco HDD o RAM de 8 GB.",
          "El cálculo del promedio de uso de CPU en los equipos con HDD frente a los equipos con SSD/NVMe.",
          "La lista de repuestos exactos requeridos para dejar las 6 estaciones en mínimo 16 GB de RAM y unidad SSD."
        ],
        constraints: [
          "Usa únicamente los datos suministrados; no inventes modelos ni precios que no estén en la tabla.",
          "Muestra los porcentajes con un decimal en formato colombiano."
        ],
        format: "Script funcional en Python con salida de reporte HTML autocontenido y resumen ejecutivo."
      },
      steps: [
        "Copia el prompt completo con el botón superior y ejecútalo en tu agente de código o en Gemini Canvas.",
        "Verifica en la salida que los 3 equipos con HDD (PC-S3-01, PC-S3-02 y PC-S4-02) queden marcados como «REQUIERE ACTUALIZACIÓN».",
        "Pide al agente la siguiente mejora: «Agrega una tarjeta resumen que compare el uso promedio de CPU entre discos HDD (92,0 %) y unidades SSD/NVMe (35,7 %)».",
        "Comprueba que la lista de repuestos contabilice exactamente 3 módulos adicionales de 8 GB de RAM y 3 unidades SSD."
      ],
      expected: [
        "Clasifica 3 equipos como APTO IA Y WEB (PC-S3-03, PC-S4-01 y PC-S4-03).",
        "Clasifica 3 equipos como REQUIERE ACTUALIZACIÓN (PC-S3-01, PC-S3-02 y PC-S4-02).",
        "El uso promedio de CPU en los equipos con HDD es 92,0 % frente a 35,7 % en SSD/NVMe.",
        "El plan de actualización solicita 3 ampliaciones de RAM a 16 GB y 3 cambios de HDD a SSD."
      ],
      stretch: "Pide al agente: «Añade una función en PowerShell que lea en vivo la RAM y el espacio libre del computador donde estoy trabajando y lo agregue como fila 7 del reporte».",
      previewSvg: dia3Kit.canvasSvgBars(
        "Gráfico de barras del uso de CPU por estación: PC-S3-01 92%, PC-S3-02 89%, PC-S3-03 45%, PC-S4-01 38%, PC-S4-02 95%, PC-S4-03 24%",
        "Uso de CPU por equipo (%)",
        ["S3-01", "S3-02", "S3-03", "S4-01", "S4-02", "S4-03"],
        [92, 89, 45, 38, 95, 24],
        4
      )
    },
    {
      id: "dia3-1b-clasificador-colisiones",
      title: "Clasificación masiva de entregas con control de duplicados y reporte HTML",
      level: "Intermedio",
      duration: "30 min",
      canvasFeature: "Script Python pathlib + Tablero HTML de trazabilidad",
      goal: "Programar un agente organizador de archivos que separe las entregas por categoría documental, preserve archivos con nombres repetidos mediante versionado automático y construya el tablero HTML de auditoría.",
      scenario: "Al cierre de la semana se recolectaron cientos de archivos en una sola carpeta compartida. Dos entregas de Andrés Gómez se llaman igual pero pesan distinto (240 KB y 245 KB) y ninguna puede perderse.",
      promptParts: {
        role: "desarrollador especialista en automatización de sistemas de archivos con Python",
        context: "Debemos organizar la carpeta de entregas de las fichas ADSO-2871 y ADSO-2872 sin perder ningún archivo por sobrescritura.",
        data: IN_DIA3_LOTES_ARCHIVOS,
        instruction: "En Canvas, escribe el código de 'organizador_seguro.py' junto con la vista previa del reporte HTML que:",
        task: [
          "Clasifique los 8 archivos de la muestra en las 5 carpetas canónicas según su extensión.",
          "Detecte la colisión de 'acta_comite_andres_gomez_101.pdf' y renombre la segunda ocurrencia como 'acta_comite_andres_gomez_101_copia_2.pdf'.",
          "Calcule el peso total en KB por cada carpeta y el total general (3.480 KB).",
          "Genere el código de 'resumen_clasificacion.html' con tarjetas de conteo y una alerta visible indicando qué archivo tuvo colisión resuelta."
        ],
        constraints: [
          "Prohibido sobrescribir o eliminar archivos originales.",
          "Usa únicamente los 8 archivos y tamaños de los datos."
        ],
        format: "Código Python comentado y vista previa HTML con tabla de trazabilidad."
      },
      steps: [
        "Pega el prompt en tu entorno agéntico o en Gemini Canvas y revisa la lógica de detección de colisiones.",
        "Ejecuta también en tu computador `python materiales/dia3_agentes_web/generar_archivos_prueba.py` y luego `python materiales/dia3_agentes_web/organizador_archivos.py` para ver el proceso sobre 200 archivos reales.",
        "Pide al agente: «Agrega una columna con el hash SHA-256 simulado o calculado con hashlib para certificar que el archivo copiado es íntegro».",
        "Verifica que el peso total reportado sume exactamente 3.480 KB sin perder la segunda acta de 245 KB."
      ],
      expected: [
        "Contabiliza 3 archivos en Documentos (dos PDF y un DOCX) por 795 KB.",
        "Contabiliza 2 archivos en Imágenes (PNG y SVG) por 775 KB.",
        "Contabiliza 1 archivo en Código (18 KB), 1 en Datos (42 KB) y 1 en Comprimidos (1.850 KB).",
        "Conserva las dos actas de Andrés Gómez renombrando la segunda como '_copia_2.pdf'.",
        "El peso total procesado es de 3.480 KB en los 8 archivos."
      ],
      stretch: "Pide: «Agrega un filtro de búsqueda instantánea en JavaScript dentro de resumen_clasificacion.html para filtrar los archivos procesados por ficha (ADSO-2871 o ADSO-2872)».",
      previewSvg: dia3Kit.canvasSvgDonut(
        "Gráfico de dona de los 8 archivos clasificados: Documentos 3, Imágenes 2, Código 1, Datos 1, Comprimidos 1",
        "Distribución por carpeta",
        [
          { name: "Documentos (3)", value: 3, cls: "cx-p" },
          { name: "Imágenes (2)", value: 2, cls: "cx-a" },
          { name: "Código (1)", value: 1, cls: "cx-w" },
          { name: "Datos/Zip (2)", value: 2, cls: "cx-d" }
        ],
        "8 arch."
      )
    }
  ],
  "web-tres-archivos": [
    {
      id: "dia3-2a-tablero-prestamo",
      title: "Aplicación web en 3 archivos para el préstamo de portátiles del laboratorio",
      level: "Básico",
      duration: "30 min",
      canvasFeature: "Arquitectura HTML + CSS + JS con vista previa en vivo",
      goal: "Construir un tablero web interactivo aplicando la regla de los 3 archivos (estructura, estilos y lógica) con tarjetas KPI, filtro por estado y buscador por ambiente.",
      scenario: "El almacenista del laboratorio lleva el préstamo de portátiles en una hoja de papel tachada. Necesita un tablero web local que abra sin internet y muestre al instante qué equipos están disponibles.",
      promptParts: {
        role: "desarrollador frontend educativo especialista en HTML5, CSS3 y JavaScript sin dependencias",
        context: "El laboratorio requiere un panel web local que funcione abriendo index.html directamente desde una memoria USB o carpeta del computador.",
        data: IN_DIA3_PRESTAMO_LAB,
        instruction: "En Canvas, construye el tablero de préstamo estructurado en 3 bloques claramente delimitados (index.html, styles.css y app.js) con:",
        task: [
          "Cuatro tarjetas KPI superiores: Total equipos (8), Disponibles (3), Prestados (3) y En mantenimiento (2).",
          "Un buscador por texto (código, equipo o responsable) y un selector por estado (Todos, Disponible, Prestado, En mantenimiento).",
          "Una tabla interactiva con distintivos de color según el estado y un botón 'Cambiar estado' en cada fila que alterne entre Disponible y Prestado recalculando las tarjetas KPI en vivo.",
          "Un gráfico de barras en SVG nativo que muestre la cantidad de equipos por cada estado."
        ],
        constraints: [
          "Cero dependencias externas ni CDNs que fallen sin internet.",
          "Paleta Verde Salvia (#2D5A4C) sobre fondo claro (#F8FAF9) con contraste accesible."
        ],
        format: "Aplicación web interactiva lista para ejecutar en la vista previa y separar en 3 archivos."
      },
      steps: [
        "Copia el prompt y ejecútalo en Gemini Canvas o pídele a tu agente local que cree la carpeta con los 3 archivos.",
        "En la vista previa interactiva, filtra por el estado «Disponible» y comprueba que aparezcan exactamente PORT-01, PORT-04 y PORT-05.",
        "Haz clic en el botón «Cambiar estado» de PORT-01 y verifica que el KPI de Disponibles baje a 2 y Prestados suba a 4 automáticamente.",
        "Escribe «Ambiente 305» en el buscador y confirma que se listen las 3 estaciones Workstation de 32 GB."
      ],
      expected: [
        "Las 4 tarjetas KPI iniciales muestran: Total 8, Disponibles 3, Prestados 3 y En mantenimiento 2.",
        "El filtro por estado y el buscador por ambiente actualizan la tabla sin recargar la página.",
        "El botón de acción en cada fila actualiza el estado del equipo y recalcula los KPIs en tiempo real.",
        "El código separa limpiamente el marcado HTML, las reglas CSS y las funciones JavaScript."
      ],
      stretch: "Pide: «Guarda los cambios de estado en localStorage para que no se pierdan al recargar el navegador y añade un botón 'Restaurar inventario inicial'».",
      previewSvg: dia3Kit.canvasSvgMock(
        "Maqueta visual del tablero de préstamo de equipos con barra superior, 3 tarjetas KPI y gráfico de estado",
        "Tablero de Préstamo (3 Archivos)",
        "landing"
      )
    },
    {
      id: "dia3-2b-panel-instructores-alertas",
      title: "Evolución del Panel de Instructores: alertas tempranas y comparativa por ficha",
      level: "Intermedio",
      duration: "35 min",
      canvasFeature: "Panel Web Reactivo + Gráfica Comparativa + Exportación CSV",
      goal: "Extender el Panel de Instructores de 8 aprendices para calcular alertas automáticas de riesgo académico, comparar el rendimiento entre las fichas ADSO-2871 y ADSO-2872 y exportar el reporte en CSV.",
      scenario: "El coordinador académico revisa el Panel de Instructores de Carlos Gómez y pide identificar de inmediato qué ficha tiene menor asistencia promedio y descargar la lista de aprendices que requieren plan de mejoramiento.",
      promptParts: {
        role: "arquitecto frontend y analista de datos académicos",
        context: "Partimos de la plantilla de 3 archivos del Panel de Instructores con 8 aprendices de las fichas ADSO-2871 y ADSO-2872.",
        data: IN_DIA3_SEGUIMIENTO_8,
        instruction: "En Canvas, genera la versión mejorada del Panel de Instructores con:",
        task: [
          "Las 4 tarjetas KPI exactas: Total aprendices (8), Al día (3), Requieren apoyo (2) y Asistencia promedio general (86,9 %).",
          "Un cuadro comparativo entre ADSO-2871 (asistencia promedio 80,0 % y 5,5 evidencias promedio) y ADSO-2872 (asistencia promedio 93,8 % y 7,25 evidencias promedio).",
          "Resaltado visual automático en la tabla para cualquier aprendiz con asistencia menor al 80 % (Carlos Rojas 72 % y Julián Parra 65 %).",
          "Un botón 'Exportar filtrados a CSV' que descargue las filas visibles con separador punto y coma (;)."
        ],
        constraints: [
          "Usa únicamente los 8 aprendices de los datos de práctica.",
          "Los cálculos deben hacerse dinámicamente en JavaScript a partir del arreglo de datos."
        ],
        format: "Aplicación web interactiva con gráfica de barras comparativa, filtros y descarga CSV."
      },
      steps: [
        "Abre también la demostración local en `materiales/dia3_agentes_web/plantilla_3_archivos/index.html` para conocer la línea base de los 3 archivos.",
        "Pega el prompt en Gemini Canvas o en tu agente de código para generar la versión con comparativa por ficha.",
        "Filtra por «Requiere apoyo» y comprueba que queden únicamente Carlos Rojas (72 %) y Julián Parra (65 %), ambos de la ficha ADSO-2871.",
        "Pide en el chat: «Agrega un contador que muestre qué porcentaje de evidencias le falta entregar a cada aprendiz para llegar a 8/8»."
      ],
      expected: [
        "Muestra los KPIs: 8 aprendices en total, 3 Al día, 3 En progreso, 2 Requiere apoyo y 86,9 % de asistencia media.",
        "Calcula correctamente la asistencia por ficha: ADSO-2871 con 80,0 % y ADSO-2872 con 93,8 %.",
        "Destaca con alerta a Carlos Rojas (4/8 evidencias, 72 %) y Julián Parra (3/8 evidencias, 65 %).",
        "El buscador y el selector de estado actualizan tanto la tabla como el resumen visible."
      ],
      stretch: "Pide: «Añade un simulador de meta en cada fila en riesgo que calcule a cuántas sesiones seguidas debe asistir el aprendiz para subir su asistencia al 80 %».",
      previewSvg: dia3Kit.canvasSvgLine(
        "Comparativa de asistencia (%) y evidencias (%) de los 8 aprendices de ADSO-2871 y ADSO-2872",
        "Asistencia vs. Evidencias (%)",
        ["And", "Lau", "Car", "Dia", "Mig", "Val", "Jul", "Sof"],
        [
          { name: "Asist.", values: [95, 88, 72, 100, 85, 98, 65, 92], cls: "cx-p" },
          { name: "Evid.", values: [100, 88, 50, 100, 75, 100, 38, 88], cls: "cx-a" }
        ]
      )
    }
  ],
  "propiedad-apis": [
    {
      id: "dia3-3a-refactor-bff-seguro",
      title: "Refactorización de clave quemada a arquitectura Backend-for-Frontend (BFF) y control de costos",
      level: "Intermedio",
      duration: "25 min",
      canvasFeature: "Auditoría de Seguridad + Arquitectura BFF + Presupuesto de Tokens",
      goal: "Erradicar una clave de API expuesta en el navegador y un bucle infinito riesgoso, reemplazándolos por un cliente frontend limpio, un endpoint de servidor con variables de entorno y techos financieros de consumo.",
      scenario: "Durante la revisión previa al Demo Day descubres que un grupo dejó su clave 'AIzaSy...' dentro de frontend/app.js y programó un 'while(true)' para reintentar llamadas a la API.",
      promptParts: {
        role: "arquitecto de ciberseguridad de aplicaciones y gobierno de APIs de IA",
        context: "Debemos corregir de inmediato una vulnerabilidad crítica antes de subir el proyecto al repositorio institucional.",
        data: IN_DIA3_AUDITORIA_BFF,
        instruction: "En Canvas, entrega el plan de remediación técnica con:",
        task: [
          "La explicación de los 3 riesgos críticos del código original (exposición de clave en cliente, llamada directa sin BFF y bucle while(true) de denegación de billetera).",
          "El nuevo archivo 'frontend/app.js' que llama únicamente a '/api/evaluar-evidencia' sin ninguna credencial.",
          "El endpoint de servidor (Python FastAPI o Node Express) que lee 'os.environ[\"GEMINI_API_KEY\"]', limita la entrada y aplica un disyuntor de máximo 3 intentos.",
          "El cálculo del consumo mensual para las 200 peticiones diarias (6.000 peticiones/mes = 6M tokens entrada + 3M tokens salida) y la recomendación de Hard Limit y Soft Alert."
        ],
        constraints: [
          "Nunca incluyas claves reales ni fallbacks con secretos en el código.",
          "Muestra las cifras exactas de tokens mensuales."
        ],
        format: "Informe de auditoría con comparativa Antes vs. Después en bloques de código y tabla de presupuesto."
      },
      steps: [
        "Prueba primero el código defectuoso en el «Laboratorio Auditor de Seguridad de APIs» de esta misma página para observar el diagnóstico automático.",
        "Copia el prompt completo y ejecútalo en Gemini Canvas.",
        "Verifica que el código refactorizado reemplace el `while (true)` por un bucle acotado a máximo 3 intentos (`MAX_RETRIES = 3`).",
        "Comprueba que el cálculo mensual arroje exactamente 6.000 peticiones, 6.000.000 de tokens de entrada y 3.000.000 de tokens de salida."
      ],
      expected: [
        "Elimina por completo la constante GEMINI_KEY del archivo frontend/app.js.",
        "Implementa la llamada a través de un endpoint propio (/api/evaluar-evidencia) con lectura de variable de entorno en el servidor.",
        "Sustituye el bucle infinito por un disyuntor de máximo 3 intentos y manejo de errores HTTP 429.",
        "Calcula 6.000 peticiones al mes (6M tokens de entrada y 3M tokens de salida) y define techo duro (Hard Limit)."
      ],
      stretch: "Pide: «Agrega un archivo .gitignore canónico y un hook pre-commit en bash/PowerShell que bloquee cualquier commit si encuentra los patrones 'AIza' o 'sk-' en los archivos».",
      previewSvg: dia3Kit.canvasSvgFlow(
        "Diagrama de carriles de la arquitectura BFF segura: Navegador -> Servidor BFF -> API IA con disyuntor",
        "Flujo Seguro BFF (Cero Claves en UI)",
        [
          { name: "Navegador", steps: ["UI Web", "POST /api", "Render UI"] },
          { name: "Servidor BFF", steps: ["Valida Sesión", "Lee .env", "¿Intento<=3?"] },
          { name: "Proveedor IA", steps: ["Verifica Key", "Procesa LLM", "JSON Seguro"] }
        ]
      )
    },
    {
      id: "dia3-3b-dictamen-propiedad-licencias",
      title: "Dictamen de derechos de autor (Ley 23/1982) y desinfección de licencia Copyleft AGPL",
      level: "Avanzado",
      duration: "30 min",
      canvasFeature: "Dictamen Técnico-Jurídico + Matriz de Licencias",
      goal: "Auditar los 4 módulos de un proyecto de software asistido por IA para distinguir qué componentes gozan de protección por derechos de autor humano y cómo reemplazar una dependencia contaminante AGPL-3.0.",
      scenario: "El equipo va a registrar su proyecto integrador ante la coordinación y la DNDA, pero incluyó un módulo copiado bajo licencia AGPL-3.0 y pretende reclamar derechos exclusivos sobre un texto generado sin intervención humana.",
      promptParts: {
        role: "auditor de propiedad intelectual de software y cumplimiento de licencias Open Source (SCA)",
        context: "Debemos emitir el dictamen de titularidad y cumplimiento de licencias antes de publicar y registrar el proyecto integrador.",
        data: IN_DIA3_DICTAMEN_LEGAL,
        instruction: "En Canvas, redacta el dictamen de auditoría de software con:",
        task: [
          "Una tabla de evaluación para los 4 módulos indicando: Estatus de Autoría (Protegible por autoría humana vs. Dominio público), Compatibilidad de Licencia (Compatible vs. Contaminación Copyleft) y Acción Requerida.",
          "La explicación jurídica bajo la Ley 23 de 1982 de por qué los módulos 1 y 4 sí son protegibles y por qué el módulo 3 pasa a dominio público.",
          "El análisis del riesgo viral del módulo 2 (AGPL-3.0) y el plan para sustituirlo por una alternativa con licencia permisiva (MIT, Apache 2.0 o BSD).",
          "Una bitácora modelo de atribución de autoría humana (qué diseñó el equipo y en qué asistió la IA) lista para anexar al Portafolio de Evidencias."
        ],
        constraints: [
          "Fundamenta el análisis en la doctrina de autoría humana (DNDA / Ley 23 de 1982) y en las condiciones de las licencias MIT, Apache 2.0 y AGPL-3.0.",
          "No utilices el extranjerismo prohibido; usa siempre 'Portafolio de Evidencias'."
        ],
        format: "Dictamen estructurado con matriz de cumplimiento, plan de remediación y plantilla de bitácora."
      },
      steps: [
        "Consulta la guía rápida en `materiales/dia3_agentes_web/guia_propiedad_intelectual_y_apis.md` o el módulo estratégico de esta vista.",
        "Copia el prompt y pégalo en Gemini Canvas para generar el dictamen completo.",
        "Verifica que el Módulo 2 (AGPL-3.0) quede clasificado en estado ROJO / Crítico con instrucción de reemplazo inmediato por una librería MIT o Apache 2.0.",
        "Comprueba que el Módulo 3 se declare no protegible como obra exclusiva (dominio público) a menos que reciba edición y estructuración creativa humana."
      ],
      expected: [
        "Declara los módulos 1 (MIT) y 4 (Apache-2.0) como protegibles por contar con arquitectura y lógica de negocio humana sustancial.",
        "Identifica la contaminación viral Copyleft en el módulo 2 (AGPL-3.0) y ordena su sustitución por una librería permisiva.",
        "Explica que el módulo 3 (salida cruda de un prompt de 1 línea) carece de titularidad de derechos de autor bajo la Ley 23 de 1982.",
        "Entrega la plantilla de bitácora de autoría humana para el Portafolio de Evidencias."
      ],
      stretch: "Pide: «Genera un script en Python que lea un archivo requirements.txt o package.json y marque alerta si alguna dependencia declarada usa licencia GPL o AGPL».",
      previewSvg: dia3Kit.canvasSvgHeatmap(
        "Mapa de calor de riesgo legal de los 4 módulos: 1 crítico (AGPL), 1 medio (prompt crudo) y 2 bajos (MIT/Apache con autoría humana)",
        "Riesgo Legal y Licencias",
        { "5-5": 1, "3-3": 1, "1-2": 2 }
      )
    }
  ]
};

Object.values(DIA3_EXERCISES).flat().forEach(ex => {
  ex.prompt = dia3Kit.composeCanvasPrompt(ex.promptParts);
});

// --- 5. Constructores HTML para las vistas previas en vivo y el laboratorio ---

function buildDia3ExamplePreviewHtml(exampleId) {
  const e = dia3Kit.escapeCanvasHtml;
  if (exampleId === "diagnostico-pc") {
    const prof = DIA3_HARDWARE_PROFILES["sala3-lenta"];
    const diag = dia3EvaluateHardwareProfile(prof);
    return `
      <div class="dia3-live-widget" id="dia3-hw-widget">
        <div class="dia3-widget-toolbar">
          <span style="font-size:0.82rem; font-weight:700; color:var(--text-main);">Simular perfil de estación:</span>
          <div class="dia3-pill-group">
            <button type="button" class="dia3-profile-btn active" data-hw-profile="sala3-lenta">🔴 Sala 3 (Lenta · HDD)</button>
            <button type="button" class="dia3-profile-btn" data-hw-profile="servidor-alerta">🟡 Sala 4 (Carga Media)</button>
            <button type="button" class="dia3-profile-btn" data-hw-profile="portatil-optimo">🟢 Portátil Instructor (NVMe)</button>
          </div>
        </div>
        <div id="dia3-hw-body">
          ${buildDia3HardwareCardHtml(prof, diag)}
        </div>
      </div>`;
  }

  if (exampleId === "clasificador-200") {
    const sampleFiles = [
      { name: "acta_andres_gomez_101.pdf", sizeKb: 240, cat: "Documentos" },
      { name: "acta_andres_gomez_101.pdf", sizeKb: 245, cat: "Documentos (renombrado _v1)" },
      { name: "captura_laura_204.png", sizeKb: 680, cat: "Imágenes" },
      { name: "validador_carlos_309.py", sizeKb: 18, cat: "Código y Scripts" },
      { name: "metricas_diana_412.json", sizeKb: 42, cat: "Datos y Tablas" },
      { name: "respaldo_miguel_501.zip", sizeKb: 1850, cat: "Comprimidos y Backups" }
    ];
    const inv = dia3ComputeFileInventory(sampleFiles);
    return `
      <div class="dia3-live-widget">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
          <div>
            <strong style="color:var(--color-primary); font-size:0.95rem;">📊 Vista Previa Renderizada: <code>resumen_clasificacion.html</code></strong>
            <small style="display:block; color:var(--text-muted); font-size:0.78rem;">Simulación sobre lote de 200 archivos (muestra verificable con control de colisiones)</small>
          </div>
          <span class="badge badge-success">✓ 0 Archivos Sobrescritos</span>
        </div>
        <div class="dia3-mini-kpi-row">
          <div class="dia3-mini-kpi"><strong>48</strong><span>📄 Documentos</span></div>
          <div class="dia3-mini-kpi"><strong>52</strong><span>🖼️ Imágenes</span></div>
          <div class="dia3-mini-kpi"><strong>45</strong><span>💻 Código y Scripts</span></div>
          <div class="dia3-mini-kpi"><strong>35</strong><span>📊 Datos (.csv/.json)</span></div>
          <div class="dia3-mini-kpi"><strong>20</strong><span>🗜️ Comprimidos</span></div>
        </div>
        <div style="margin-top:0.75rem; padding:0.6rem 0.85rem; background:var(--bg-subtle); border-left:3px solid var(--color-primary); border-radius:6px; font-size:0.82rem;">
          <strong>🛡️ Colisión detectada y resuelta en lote de prueba (${inv.totalFiles} archivos · ${inv.totalSizeKb} KB):</strong>
          El archivo duplicado <code>${e(inv.collisions[0])}</code> se preservó automáticamente como <code>acta_andres_gomez_101_v1.pdf</code>.
        </div>
      </div>`;
  }

  if (exampleId === "panel-3-archivos") {
    const kpis = dia3ComputeInstructorKpis(DIA3_LEARNERS);
    const rowsHtml = DIA3_LEARNERS.map(l => {
      const pctEv = Math.round((l.evidencias_entregadas / l.total_evidencias) * 100);
      const badgeCls = l.estado === "Al día" ? "badge-success" : l.estado === "En progreso" ? "badge-info" : "badge-warning";
      return `<tr data-dia3-learner-row data-nombre="${e(l.nombre.toLowerCase())}" data-ficha="${e(l.ficha.toLowerCase())}" data-estado="${e(l.estado)}">
        <td><strong>${e(l.nombre)}</strong></td>
        <td><code>${e(l.ficha)}</code></td>
        <td>${l.evidencias_entregadas}/${l.total_evidencias} (${pctEv} %)</td>
        <td>${l.asistencia_porcentaje} %</td>
        <td><span class="badge ${badgeCls}">${e(l.estado)}</span></td>
      </tr>`;
    }).join("");

    return `
      <div class="dia3-live-widget" id="dia3-embedded-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
          <div>
            <strong style="color:var(--color-primary); font-size:0.95rem;">📊 Panel de Instructores Ejecutándose en Vivo (3 Archivos)</strong>
            <small style="display:block; color:var(--text-muted); font-size:0.78rem;">Prueba el buscador y el selector de estado directamente aquí o abre la ventana independiente</small>
          </div>
          <a href="materiales/dia3_agentes_web/plantilla_3_archivos/index.html" target="_blank" class="material-link" style="font-size:0.78rem; padding:0.3rem 0.7rem;">
            🚀 Abrir en pestaña nueva
          </a>
        </div>
        <div class="dia3-mini-kpi-row" style="margin-bottom:0.75rem;">
          <div class="dia3-mini-kpi"><strong>${kpis.total}</strong><span>Total Aprendices</span></div>
          <div class="dia3-mini-kpi"><strong style="color:#15803d;">${kpis.alDia}</strong><span>Al Día (100 %)</span></div>
          <div class="dia3-mini-kpi"><strong style="color:#b45309;">${kpis.requiereApoyo}</strong><span>Requieren Apoyo</span></div>
          <div class="dia3-mini-kpi"><strong>${kpis.promedioAsistencia} %</strong><span>Asistencia Media</span></div>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.65rem;">
          <input type="text" id="dia3-live-search" placeholder="Buscar por nombre o ficha (ej. 2871, Diana)..." aria-label="Buscar aprendiz en vista previa" style="flex:1 1 14rem; padding:0.45rem 0.65rem; border:1px solid var(--border-light); border-radius:6px; background:var(--bg-surface); color:var(--text-main); font-size:0.82rem;">
          <select id="dia3-live-status" aria-label="Filtrar por estado en vista previa" style="padding:0.45rem 0.65rem; border:1px solid var(--border-light); border-radius:6px; background:var(--bg-surface); color:var(--text-main); font-size:0.82rem;">
            <option value="todos">Todos los estados (8)</option>
            <option value="Al día">Al día (3)</option>
            <option value="En progreso">En progreso (3)</option>
            <option value="Requiere apoyo">Requiere apoyo (2)</option>
          </select>
        </div>
        <div style="overflow-x:auto;">
          <table class="schedule-table" style="font-size:0.8rem;" id="dia3-live-table">
            <thead>
              <tr><th>Aprendiz</th><th>Ficha</th><th>Evidencias</th><th>Asistencia</th><th>Estado</th></tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>`;
  }

  return `
    <div class="dia3-live-widget">
      <strong style="color:var(--color-primary); display:block; margin-bottom:0.5rem; font-size:0.95rem;">🔒 Comparativa de Tráfico de Red: Petición Insegura vs. Pasarela BFF</strong>
      <div class="comparison-grid">
        <div class="comparison-col col-bad">
          <div class="col-title">❌ Petición Directa desde el Navegador (Insegura)</div>
          <pre class="dia3-code-snippet"><code>GET / POST https://generativelanguage.googleapis.com/...?key=AIzaSyD9_EXPUESTA
Visible en Pestaña Red (F12) para cualquier usuario.
Riesgo: Robo inmediato de cuota y bloqueo de cuenta.</code></pre>
        </div>
        <div class="comparison-col col-good">
          <div class="col-title">✓ Petición vía Backend-for-Frontend (Segura)</div>
          <pre class="dia3-code-snippet"><code>POST https://mi-centro.edu.co/api/ia/generar
Headers: Cookie de sesión autenticada (Sin API Key)
Servidor BFF: Lee process.env.GEMINI_API_KEY + aplica límite de 5 pasos.</code></pre>
        </div>
      </div>
    </div>`;
}

function buildDia3HardwareCardHtml(prof, diag) {
  const e = dia3Kit.escapeCanvasHtml;
  const badgeCls = diag.status === "ÓPTIMO" ? "badge-success" : diag.status === "ADVERTENCIA" ? "badge-warning" : "badge-danger";
  const items = diag.bottlenecks.length
    ? diag.bottlenecks.map(b => `<li>${e(b)}</li>`).join("")
    : "<li>✓ Todos los indicadores se encuentran dentro de los parámetros recomendados para desarrollo web y agentes locales.</li>";
  return `
    <div class="dia3-hw-card">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.65rem;">
        <div>
          <strong style="font-size:0.95rem; color:var(--text-main);">${e(prof.name)}</strong>
          <small style="display:block; color:var(--text-muted); font-size:0.78rem;">${e(prof.cpuModel)} · Proceso activo: ${e(prof.topProcess)}</small>
        </div>
        <span class="badge ${badgeCls}">Diagnóstico: ${e(diag.status)}</span>
      </div>
      <div class="dia3-mini-kpi-row" style="margin-bottom:0.75rem;">
        <div class="dia3-mini-kpi"><strong>${prof.cpuUsage} %</strong><span>Uso de CPU</span></div>
        <div class="dia3-mini-kpi"><strong>${prof.ramUsedGb} / ${prof.ramTotalGb} GB (${diag.ramPct} %)</strong><span>Memoria RAM</span></div>
        <div class="dia3-mini-kpi"><strong>${prof.diskFreeGb} GB libres</strong><span>${e(prof.diskType)}</span></div>
      </div>
      <div style="font-size:0.82rem; background:var(--bg-subtle); padding:0.65rem 0.85rem; border-radius:6px;">
        <strong>Dictamen del Agente de Diagnóstico:</strong>
        <ul style="margin:0.35rem 0 0 1.2rem; padding:0;">${items}</ul>
      </div>
    </div>`;
}

function buildDia3ExampleHtml(exampleId, activeTab) {
  const ex = DIA3_EXAMPLES[exampleId];
  if (!ex) return "";
  const e = dia3Kit.escapeCanvasHtml;

  let bodyHtml = "";
  if (activeTab === "code") {
    bodyHtml = `
      <div class="dia3-code-pane">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <span class="badge badge-info">${e(ex.codeLang)}</span>
          <button type="button" class="canvas-exercise-copy" data-dia3-copy-code="${e(ex.id)}">📋 Copiar código de referencia</button>
        </div>
        <pre class="canvas-exercise-code"><code>${e(ex.code)}</code></pre>
      </div>`;
  } else if (activeTab === "prompt") {
    bodyHtml = `
      <div class="dia3-prompt-pane">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <span style="font-size:0.82rem; font-weight:700; color:var(--color-primary);">Prompt R-C-I-R-F que construye este ejemplo</span>
          <button type="button" class="canvas-exercise-copy is-primary" data-dia3-copy-prompt="${e(ex.id)}">📋 Copiar prompt</button>
        </div>
        <pre class="canvas-exercise-code" style="white-space:pre-wrap;"><code>${e(ex.prompt)}</code></pre>
      </div>`;
  } else if (activeTab === "compare") {
    bodyHtml = `
      <div class="comparison-grid">
        <div class="comparison-col col-good">
          <div class="col-title">✓ Estándar de Oro Profesional</div>
          <p style="font-size:0.84rem; margin:0;">${e(ex.goodPractice)}</p>
        </div>
        <div class="comparison-col col-bad">
          <div class="col-title">❌ Antipatrón Frecuente (Qué evitar)</div>
          <p style="font-size:0.84rem; margin:0;">${e(ex.badPractice)}</p>
        </div>
      </div>`;
  } else {
    bodyHtml = buildDia3ExamplePreviewHtml(exampleId);
  }

  return `
    <div class="dia3-example-card" data-example-id="${e(ex.id)}">
      <div class="dia3-example-header">
        <div>
          <span class="canvas-exercise-tag">${e(ex.badge)}</span>
          <h4 style="margin:0.35rem 0 0.25rem 0; font-size:1.08rem; color:var(--text-main);">${e(ex.title)}</h4>
          <p style="margin:0; font-size:0.88rem; color:var(--text-muted);">${e(ex.summary)}</p>
        </div>
      </div>
      <div class="dia3-example-body">${bodyHtml}</div>
    </div>`;
}

function buildDia3AuditResultHtml(auditResult) {
  const e = dia3Kit.escapeCanvasHtml;
  if (auditResult.status === "VACÍO") {
    return `
      <div class="dia3-audit-box is-empty" role="status">
        <strong style="display:block; margin-bottom:0.25rem; color:#b45309;">⚠️ ${e(auditResult.summary)}</strong>
        <p style="margin:0; font-size:0.84rem; color:var(--text-muted);">${e(auditResult.remediation)}</p>
      </div>`;
  }

  const badgeCls = auditResult.status === "SEGURO" ? "badge-success" : auditResult.status === "ADVERTENCIA" ? "badge-warning" : "badge-danger";
  const findingsHtml = auditResult.findings.length
    ? `<ul class="dia3-findings-list">${auditResult.findings.map(f => `
        <li>
          <span class="badge ${f.severity === "CRÍTICO" ? "badge-danger" : "badge-warning"}">${e(f.severity)}</span>
          <strong>${e(f.title)}:</strong> ${e(f.detail)}
        </li>`).join("")}</ul>`
    : `<p style="margin:0.4rem 0 0 0; font-size:0.84rem; color:#15803d;">✓ Cero credenciales expuestas, arquitectura BFF verificada y bucle con límite de seguridad.</p>`;

  return `
    <div class="dia3-audit-box status-${auditResult.status.toLowerCase()}" role="region" aria-label="Resultado de auditoría">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
        <strong>Dictamen del Auditor Estático:</strong>
        <span class="badge ${badgeCls}">${e(auditResult.status)}</span>
      </div>
      <p style="margin:0 0 0.5rem 0; font-size:0.86rem;">${e(auditResult.summary)}</p>
      ${findingsHtml}
    </div>`;
}

function buildDia3BudgetResultHtml(budget) {
  const fmt = n => n.toLocaleString("es-CO");
  return `
    <div class="dia3-mini-kpi-row" style="margin-top:0.75rem;">
      <div class="dia3-mini-kpi"><strong>${fmt(budget.monthlyRequests)}</strong><span>Peticiones / mes</span></div>
      <div class="dia3-mini-kpi"><strong>${fmt(budget.monthlyInputTokens)} / ${fmt(budget.monthlyOutputTokens)}</strong><span>Tokens Entrada / Salida</span></div>
      <div class="dia3-mini-kpi"><strong>USD $${budget.estimatedUsd} (≈ COP ${fmt(budget.estimatedCop)})</strong><span>Costo Mensual Estimado</span></div>
      <div class="dia3-mini-kpi"><strong style="color:var(--color-primary);">Alerta: USD $${budget.softAlertUsd} · Hard Limit: USD $${budget.hardLimitUsd}</strong><span>Guardrails Recomendados</span></div>
    </div>`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DIA3_CATEGORIES,
    DIA3_LEARNERS,
    DIA3_HARDWARE_PROFILES,
    DIA3_SECURITY_PRESETS,
    DIA3_EXAMPLES,
    DIA3_EXERCISES,
    DIA3_BLOCKS,
    dia3CategorizeExtension,
    dia3ComputeFileInventory,
    dia3ComputeInstructorKpis,
    dia3FilterLearners,
    dia3AuditCodeSecurity,
    dia3EstimateTokenBudget,
    dia3EvaluateHardwareProfile,
    buildDia3HardwareCardHtml,
    buildDia3ExamplePreviewHtml,
    buildDia3ExampleHtml,
    buildDia3AuditResultHtml,
    buildDia3BudgetResultHtml
  };
}

