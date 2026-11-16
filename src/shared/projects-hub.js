// Hub de Proyectos & Entregables: consolidación de 35 proyectos formativos (31 Canvas + 4 Días).
// Módulo desacoplado de funciones puras, persistencia tolerante y accesibilidad (WCAG).

const DEFAULT_DAILY_PROJECTS = [
  { id: "dia-1-acta-rag", title: "Acta Formal de Comité y Libreta RAG (NotebookLM)", area: "Redacción", level: "Básico", duration: "45 min", durationMin: 45, goal: "Redactar el acta formal de un comité aplicando CRTT+L y transferir fuentes a NotebookLM con citas exactas.", description: "Redactar el acta formal de un comité aplicando CRTT+L y transferir fuentes a NotebookLM con citas exactas.", route: "#dia-1", tags: ["NotebookLM", "RAG", "CRTT+L", "Actas", "Comité"], technology: "NotebookLM + Gemini", canvasFeature: "Prompting Canónico CRTT+L + RAG", status: "por-iniciar", previewSvg: '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Acta formal y libreta RAG"><rect class="cx-bg" width="320" height="180" rx="10"/><rect class="cx-lane" x="24" y="24" width="272" height="132" rx="6"/><text class="cx-t" x="40" y="50" font-size="11" font-weight="700">Acta RAG &amp; NotebookLM</text><rect class="cx-p" x="40" y="66" width="180" height="8" rx="2"/><rect class="cx-p" x="40" y="82" width="220" height="8" rx="2"/><rect class="cx-a" x="40" y="116" width="90" height="20" rx="4"/><text class="cx-on" x="85" y="130" font-size="8" font-weight="700" text-anchor="middle">CRTT+L</text></svg>' },
  { id: "dia-2-capsula-multimedia", title: "Cápsula Formativa Multimedia con Locución Neuronal", area: "Diseño", level: "Intermedio", duration: "45 min", durationMin: 45, goal: "Crear una pieza audiovisual formativa con guión estructurado, imágenes generativas y locución neuronal sintetizada.", description: "Crear una pieza audiovisual formativa con guión estructurado, imágenes generativas y locución neuronal sintetizada.", route: "#dia-2", tags: ["Ideogram", "Gamma", "Canva", "TTS", "Audio"], technology: "Ideogram AI + Gamma + TTS", canvasFeature: "Generación Visual + Locución Neuronal", status: "por-iniciar", previewSvg: '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cápsula multimedia con locución"><rect class="cx-bg" width="320" height="180" rx="10"/><rect class="cx-lane" x="24" y="24" width="272" height="132" rx="6"/><text class="cx-t" x="40" y="50" font-size="11" font-weight="700">Cápsula Multimedia</text><circle class="cx-a" cx="70" cy="95" r="22"/><polygon class="cx-on" points="66,86 80,95 66,104"/><rect class="cx-p" x="110" y="80" width="150" height="8" rx="2"/><rect class="cx-p" x="110" y="96" width="110" height="8" rx="2"/></svg>' },
  { id: "dia-3-panel-web-telemetria", title: "Panel de Telemetría Web en 3 Archivos y Clasificación Agéntica", area: "Web & Código", level: "Avanzado", duration: "60 min", durationMin: 60, goal: "Construir un dashboard web reactivo en 3 archivos con visualización de telemetría y clasificación agéntica por CLI.", description: "Construir un dashboard web reactivo en 3 archivos con visualización de telemetría y clasificación agéntica por CLI.", route: "#dia-3", tags: ["HTML", "CSS", "JavaScript", "Chart.js", "CLI", "Telemetría"], technology: "Vanilla JS + Chart.js", canvasFeature: "Arquitectura 3 Archivos + CLI", status: "por-iniciar", previewSvg: '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Panel de telemetría web"><rect class="cx-bg" width="320" height="180" rx="10"/><rect class="cx-lane" x="24" y="24" width="272" height="132" rx="6"/><text class="cx-t" x="40" y="50" font-size="11" font-weight="700">Dashboard Telemetría</text><rect class="cx-a" x="40" y="66" width="55" height="28" rx="4"/><rect class="cx-p" x="105" y="66" width="55" height="28" rx="4"/><polyline class="cx-d-s" fill="none" stroke-width="2" points="180,126 205,105 230,115 255,80 275,90"/></svg>' },
  { id: "dia-4-prototipo-demo-day", title: "Prototipo Funcional Integrador y Sustentación en Demo Day", area: "Automatización", level: "Avanzado", duration: "60 min", durationMin: 60, goal: "Consolidar un Gem especializado con tutoría socrática y presentar el prototipo validado en el Demo Day.", description: "Consolidar un Gem especializado con tutoría socrática y presentar el prototipo validado en el Demo Day.", route: "#dia-4", tags: ["Gemini Gems", "Gobernanza", "Demo Day", "Socrático", "Prototipo"], technology: "Gemini Studio + Gems", canvasFeature: "Gems Personalizados + Auditoría Ética", status: "por-iniciar", previewSvg: '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Prototipo Gem y Demo Day"><rect class="cx-bg" width="320" height="180" rx="10"/><rect class="cx-lane" x="24" y="24" width="272" height="132" rx="6"/><text class="cx-t" x="40" y="50" font-size="11" font-weight="700">Gem Studio &amp; Demo Day</text><polygon class="cx-a" points="160,65 180,105 140,105"/><circle class="cx-p" cx="160" cy="92" r="6"/><rect class="cx-lane" x="40" y="118" width="240" height="20" rx="4"/></svg>' }
];
const MODE_AREAS = {
  "doc-editorial": "Redacción", "code-prototyping": "Web & Código", "data-matrix": "Datos & SQL", "flowchart-diagram": "Diseño", "visual-mockup": "Diseño", "inline-prompting": "Redacción",
  "algorithm-refactor": "Web & Código", "rubric-curriculum": "Redacción", "sql-pipeline": "Datos & SQL", "executive-report": "Redacción", "multimodal-vision": "Diseño", "gem-studio": "Automatización", "interactive-apps": "Automatización"
};

function escapeHtml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function normalizeStr(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function collateAllProjects(canvasExercises, dailyProjects) {
  const result = [], exercises = canvasExercises && typeof canvasExercises === "object" ? canvasExercises : {};
  for (const [mode, list] of Object.entries(exercises)) {
    if (Array.isArray(list)) list.forEach((ex, idx) => {
      const area = ex.id === "inline-b-depurar-funcion" ? "Web & Código" : (MODE_AREAS[mode] || "Redacción");
      result.push({ id: ex.id, title: ex.title, description: ex.goal || ex.description || "", goal: ex.goal || "", area, level: ex.level || "Intermedio", duration: ex.duration || "30 min", durationMin: parseInt(ex.duration, 10) || 30, canvasFeature: ex.canvasFeature || "", technology: Array.isArray(ex.capabilities) ? ex.capabilities.slice(0, 3).join(", ") : "", tags: Array.isArray(ex.capabilities) ? [...ex.capabilities] : [], route: `#gemini-canvas/${mode}/${["a", "b", "c"][idx] || "a"}`, previewSvg: ex.previewSvg || "", status: "por-iniciar" });
    });
  }
  const dailies = Array.isArray(dailyProjects) ? dailyProjects : (dailyProjects === null ? [] : DEFAULT_DAILY_PROJECTS);
  dailies.forEach(d => result.push({ ...d, description: d.description || d.goal || "", status: d.status || "por-iniciar" }));
  return result;
}

function filterProjects(projects, filters) {
  if (!Array.isArray(projects)) return [];
  if (!filters) return [...projects];
  const q = normalizeStr(filters.search), area = filters.area && filters.area !== "all" && filters.area !== "todas" ? filters.area : null, level = filters.level && filters.level !== "all" && filters.level !== "todos" ? filters.level : null, dur = filters.duration && filters.duration !== "all" && filters.duration !== "todas" ? filters.duration : null;
  return projects.filter(p => {
    if (area && p.area !== area) return false;
    if (level && p.level !== level) return false;
    if (dur === "short" && p.durationMin > 25) return false;
    if (dur === "medium" && (p.durationMin < 26 || p.durationMin > 35)) return false;
    if (dur === "long" && p.durationMin < 40) return false;
    return !q || normalizeStr(`${p.title} ${p.description} ${p.area} ${p.technology} ${p.canvasFeature} ${(p.tags || []).join(" ")}`).includes(q);
  });
}

function sortProjects(projects, sortMode, customOrder) {
  const list = Array.isArray(projects) ? [...projects] : [];
  if (sortMode === "custom" && Array.isArray(customOrder) && customOrder.length > 0) {
    const map = new Map(customOrder.map((id, i) => [id, i]));
    return list.sort((a, b) => (map.has(a.id) ? map.get(a.id) : 999) - (map.has(b.id) ? map.get(b.id) : 999));
  }
  if (sortMode === "duration-asc" || sortMode === "duration") return list.sort((a, b) => (a.durationMin || 0) - (b.durationMin || 0));
  if (sortMode === "level") { const w = { "Básico": 1, "Intermedio": 2, "Avanzado": 3 }; return list.sort((a, b) => (w[a.level] || 2) - (w[b.level] || 2)); }
  return list;
}

function reorderProjectList(list, sourceId, targetId, position) {
  const arr = Array.isArray(list) ? [...list] : [], getId = x => (x && typeof x === "object" ? x.id : x);
  const fromIdx = arr.findIndex(x => getId(x) === sourceId), toIdx = arr.findIndex(x => getId(x) === targetId);
  if (fromIdx < 0 || toIdx < 0 || sourceId === targetId) return arr;
  const [moved] = arr.splice(fromIdx, 1);
  arr.splice(position === "after" ? arr.findIndex(x => getId(x) === targetId) + 1 : arr.findIndex(x => getId(x) === targetId), 0, moved);
  return arr;
}

function getStoredHubData(storage, key, fallback) {
  if (!storage || typeof storage.getItem !== "function") return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (fallback != null) {
      if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
      if (typeof fallback === "object" && !Array.isArray(fallback) && (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))) return fallback;
    }
    return parsed;
  } catch (_) { return fallback; }
}

function saveStoredHubData(storage, key, data) {
  if (!storage || typeof storage.setItem !== "function") return false;
  try { storage.setItem(key, JSON.stringify(data)); return true; } catch (_) { return false; }
}

function statusLabel(s) { return s === "completado" ? "Completado" : (s === "en-desarrollo" ? "En Desarrollo" : "Por Iniciar"); }
function getProjectStatus(p, m) { const s = m && m[p.id]; return ["por-iniciar", "en-desarrollo", "completado"].includes(s) ? s : (p.status || "por-iniciar"); }

function buildKanbanBoardHtml(projects, statusMap) {
  const cols = [{ id: "por-iniciar", label: "Por Iniciar" }, { id: "en-desarrollo", label: "En Desarrollo" }, { id: "completado", label: "Completado" }], items = Array.isArray(projects) ? projects : [];
  return `<div class="projects-kanban-board" role="grid" aria-label="Tablero Kanban de Proyectos">` +
    cols.map(c => {
      const colItems = items.filter(p => getProjectStatus(p, statusMap) === c.id);
      const cards = colItems.length ? colItems.map(p =>
        `<div class="projects-kanban-card kanban-project-card" draggable="true" data-project-id="${p.id}" tabindex="0" role="article" aria-label="${escapeHtml(p.title)}">` +
          `<div class="kanban-card-top"><span class="projects-drag-handle" aria-hidden="true">⋮⋮</span><span class="chip-area">${escapeHtml(p.area)}</span></div><h5>${escapeHtml(p.title)}</h5>` +
          `<div class="kanban-card-meta"><span class="badge-level">${escapeHtml(p.level)}</span><span class="badge-duration">⏱ ${escapeHtml(p.duration)}</span></div>` +
          `<div class="kanban-card-actions"><a href="${escapeHtml(p.route)}" class="btn-open-project" data-project-link>🚀 Abrir</a><div class="projects-card-nav" role="group" aria-label="Mover proyecto">` +
            `<button type="button" class="btn-card-move" data-move-status="prev" aria-label="Estado anterior">◀</button><button type="button" class="btn-card-move" data-move-pos="up" data-hub-move="up" aria-label="Subir ${escapeHtml(p.title)}">▲</button>` +
            `<button type="button" class="btn-card-move" data-move-pos="down" data-hub-move="down" aria-label="Bajar ${escapeHtml(p.title)}">▼</button><button type="button" class="btn-card-move" data-move-status="next" aria-label="Siguiente estado">▶</button>` +
          `</div></div></div>`
      ).join("") : `<div class="projects-empty-dropzone kanban-empty"><p>Sin proyectos en este estado</p></div>`;
      return `<div class="projects-kanban-column" data-status="${c.id}" data-kanban-status="${c.id}" role="region" aria-label="${c.label}"><div class="projects-kanban-col-head"><h4>${c.label} (${colItems.length})</h4><span class="projects-badge count" aria-label="${colItems.length} proyectos">${colItems.length}</span></div><div class="projects-kanban-dropzone" data-status="${c.id}">${cards}</div></div>`;
    }).join("") + `</div>`;
}

function buildBentoGridHtml(projects, statusMap, options) {
  const items = Array.isArray(projects) ? projects : [];
  if (!items.length) return `<div class="projects-empty-state"><p>No se encontraron proyectos formativos.</p></div>`;
  const isDraggable = !options || options.isDraggable !== false;
  return `<div class="projects-bento-grid" role="list" aria-label="Galería Bento de Proyectos">` +
    items.map(p => {
      const st = getProjectStatus(p, statusMap), drag = isDraggable ? `<span class="projects-drag-handle" aria-hidden="true" title="Arrastrar">⋮⋮</span>` : ``;
      return `<div class="projects-bento-card" draggable="${isDraggable ? "true" : "false"}" data-project-id="${p.id}" role="listitem" tabindex="0">` +
        `<div class="bento-card-header">${drag}<span class="chip-area">${escapeHtml(p.area)}</span><span class="chip-status ${st}">${statusLabel(st)}</span></div><div class="projects-bento-preview" aria-hidden="true">${p.previewSvg || '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img"><rect class="cx-bg" width="320" height="180" rx="10"/></svg>'}</div>` +
        `<h4>${escapeHtml(p.title)}</h4><p class="bento-desc">${escapeHtml(p.goal || p.description)}</p><div class="bento-meta"><span class="badge-level">${escapeHtml(p.level)}</span><span class="badge-duration">⏱ ${escapeHtml(p.duration)}</span></div>` +
        `<div class="bento-card-actions"><a href="${escapeHtml(p.route)}" class="btn-open-project" data-project-link>🚀 Abrir Proyecto</a><div class="projects-keyboard-controls"><button type="button" class="btn-card-move" data-move-pos="up" data-hub-move="up" aria-label="Mover antes ${escapeHtml(p.title)}">▲</button><button type="button" class="btn-card-move" data-move-pos="down" data-hub-move="down" aria-label="Mover después ${escapeHtml(p.title)}">▼</button></div></div></div>`;
    }).join("") + `</div>`;
}

function buildCompactListHtml(projects, statusMap) {
  const items = Array.isArray(projects) ? projects : [];
  const rows = items.length ? items.map(p => {
    const st = getProjectStatus(p, statusMap);
    return `<tr data-project-id="${p.id}" draggable="true">` +
      `<td><span class="projects-drag-handle" aria-hidden="true">⋮⋮</span> <button type="button" class="btn-row-move" data-move-pos="up" data-hub-move="up" aria-label="Subir ${escapeHtml(p.title)}">▲</button><button type="button" class="btn-row-move" data-move-pos="down" data-hub-move="down" aria-label="Bajar ${escapeHtml(p.title)}">▼</button></td>` +
      `<td><select class="select-project-status" data-status-select="${p.id}" aria-label="Estado de ${escapeHtml(p.title)}"><option value="por-iniciar"${st === "por-iniciar" ? " selected" : ""}>Por Iniciar</option><option value="en-desarrollo"${st === "en-desarrollo" ? " selected" : ""}>En Desarrollo</option><option value="completado"${st === "completado" ? " selected" : ""}>Completado</option></select></td>` +
      `<td><strong><a href="${escapeHtml(p.route)}">${escapeHtml(p.title)}</a></strong></td><td><span class="chip-area">${escapeHtml(p.area)}</span></td><td><span class="badge-level">${escapeHtml(p.level)}</span></td><td>⏱ ${escapeHtml(p.duration || (p.durationMin ? p.durationMin + " min" : "30 min"))}</td><td><a href="${escapeHtml(p.route)}" class="btn-open-project compact" data-project-link>🚀 Abrir</a></td></tr>`;
  }).join("") : `<tr><td colspan="7" class="td-empty">No se encontraron proyectos formativos.</td></tr>`;
  return `<div class="projects-list-table-container"><table class="projects-compact-table" role="table" aria-label="Lista compacta de proyectos"><thead><tr><th scope="col">Orden</th><th scope="col">Estado</th><th scope="col">Proyecto</th><th scope="col">Área</th><th scope="col">Dificultad</th><th scope="col">Duración</th><th scope="col">Acción</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function initProjectsHub(container, options) {
  if (!container || typeof container.querySelector !== "function") return null;
  const opts = options || {}, storage = opts.storage !== undefined ? opts.storage : (typeof window !== "undefined" ? window.localStorage : null);
  const canvasSrc = opts.canvasExercises || (typeof globalThis !== "undefined" && globalThis.CANVAS_EXERCISES ? globalThis.CANVAS_EXERCISES : {});
  const allProjects = collateAllProjects(canvasSrc, opts.dailyProjects), officialIds = allProjects.map(p => p.id);
  let customOrder = getStoredHubData(storage, "projects_hub_custom_order", officialIds);
  if (!Array.isArray(customOrder) || customOrder.length !== officialIds.length) customOrder = [...officialIds];
  let statusMap = getStoredHubData(storage, "projects_hub_status_map", {});
  let viewMode = opts.viewMode || getStoredHubData(storage, "projects_hub_view_mode", "kanban");
  if (!["kanban", "bento", "list"].includes(viewMode)) viewMode = "kanban";
  let filters = { search: "", area: "all", level: "all", duration: "all" }, draggedId = null;

  function render() {
    const sorted = sortProjects(allProjects, "custom", customOrder), filtered = filterProjects(sorted, filters);
    const bodyEl = container.querySelector("#projects-hub-view-container, [data-hub-body]") || container;
    bodyEl.innerHTML = viewMode === "bento" ? buildBentoGridHtml(filtered, statusMap) : (viewMode === "list" ? buildCompactListHtml(filtered, statusMap) : buildKanbanBoardHtml(filtered, statusMap));
    const counter = container.querySelector("#hub-results-count, [data-hub-counter]");
    if (counter) counter.textContent = `Mostrando ${filtered.length} de ${allProjects.length} proyectos`;
    container.querySelectorAll("[data-hub-view]").forEach(btn => {
      const active = btn.getAttribute("data-hub-view") === viewMode;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }
  function saveOrder(order) { customOrder = order; saveStoredHubData(storage, "projects_hub_custom_order", customOrder); render(); }
  function setStatus(id, st) { statusMap[id] = st; saveStoredHubData(storage, "projects_hub_status_map", statusMap); render(); }

  container.addEventListener("click", e => {
    const viewBtn = e.target.closest("[data-hub-view]");
    if (viewBtn) { viewMode = viewBtn.getAttribute("data-hub-view") || "kanban"; saveStoredHubData(storage, "projects_hub_view_mode", viewMode); return render(); }
    if (e.target.closest("[data-hub-reset-order]")) return saveOrder([...officialIds]);
    const moveBtn = e.target.closest("[data-move-pos], [data-hub-move]");
    if (moveBtn) {
      const card = moveBtn.closest("[data-project-id]");
      if (!card) return;
      const pid = card.getAttribute("data-project-id"), dir = moveBtn.getAttribute("data-move-pos") || moveBtn.getAttribute("data-hub-move"), idx = customOrder.indexOf(pid);
      if (idx >= 0) {
        const targetIdx = dir === "up" ? idx - 1 : idx + 1;
        if (targetIdx >= 0 && targetIdx < customOrder.length) saveOrder(reorderProjectList(customOrder, pid, customOrder[targetIdx], dir === "up" ? "before" : "after"));
      }
      return;
    }
    const statusBtn = e.target.closest("[data-move-status]");
    if (statusBtn) {
      const card = statusBtn.closest("[data-project-id]");
      if (!card) return;
      const pid = card.getAttribute("data-project-id"), dir = statusBtn.getAttribute("data-move-status"), statuses = ["por-iniciar", "en-desarrollo", "completado"];
      const curIdx = statuses.indexOf(statusMap[pid] || "por-iniciar"), nextIdx = dir === "next" ? Math.min(2, curIdx + 1) : Math.max(0, curIdx - 1);
      if (nextIdx !== curIdx) setStatus(pid, statuses[nextIdx]);
    }
  });

  container.addEventListener("input", e => {
    if (e.target && e.target.matches && e.target.matches("[data-hub-search], #hub-search-input")) { filters.search = e.target.value; render(); }
  });
  container.addEventListener("change", e => {
    if (!e.target || !e.target.getAttribute) return;
    const filterType = e.target.getAttribute("data-hub-filter");
    if (filterType) { filters[filterType] = e.target.value; render(); }
    else if (e.target.matches && e.target.matches("[data-status-select]")) setStatus(e.target.getAttribute("data-status-select"), e.target.value);
  });

  container.addEventListener("dragstart", e => {
    const card = e.target && e.target.closest ? e.target.closest("[data-project-id]") : null;
    if (!card) return;
    draggedId = card.getAttribute("data-project-id");
    if (card.classList && card.classList.add) card.classList.add("is-project-dragging");
    if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move"; if (typeof e.dataTransfer.setData === "function") e.dataTransfer.setData("text/plain", draggedId); }
  });
  container.addEventListener("dragover", e => {
    if (!draggedId) return;
    const target = e.target && e.target.closest ? e.target.closest("[data-project-id], [data-status]") : null;
    if (target) {
      if (typeof e.preventDefault === "function") e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      if (target.classList && target.classList.add) target.classList.add("is-project-drop-target");
    }
  });
  container.addEventListener("dragleave", e => {
    const target = e.target && e.target.closest ? e.target.closest("[data-project-id], [data-status]") : null;
    if (target && target.classList && target.classList.remove) target.classList.remove("is-project-drop-target");
  });
  container.addEventListener("drop", e => {
    if (!draggedId) return;
    if (typeof e.preventDefault === "function") e.preventDefault();
    container.querySelectorAll(".is-project-drop-target").forEach(el => { if (el.classList && el.classList.remove) el.classList.remove("is-project-drop-target"); });
    const targetCard = e.target && e.target.closest ? e.target.closest("[data-project-id]") : null;
    const targetCol = e.target && e.target.closest ? e.target.closest("[data-status]") : null;
    if (targetCard) {
      const targetId = targetCard.getAttribute("data-project-id");
      if (targetId && targetId !== draggedId) saveOrder(reorderProjectList(customOrder, draggedId, targetId, "before"));
    }
    if (targetCol && viewMode === "kanban") {
      const newStatus = targetCol.getAttribute("data-status");
      if (newStatus && ["por-iniciar", "en-desarrollo", "completado"].includes(newStatus)) setStatus(draggedId, newStatus);
    }
  });
  container.addEventListener("dragend", () => {
    draggedId = null;
    container.querySelectorAll(".is-project-dragging, .is-project-drop-target").forEach(el => { if (el.classList && el.classList.remove) el.classList.remove("is-project-dragging", "is-project-drop-target"); });
  });
  render();
  return {
    refresh: render, getProjects: () => [...allProjects], resetOrder: () => saveOrder([...officialIds]),
    setViewMode: mode => { viewMode = mode; saveStoredHubData(storage, "projects_hub_view_mode", mode); render(); },
    getOrder: () => [...customOrder], getStatusMap: () => ({ ...statusMap }), setStatus
  };
}

const ProjectsHub = { DEFAULT_DAILY_PROJECTS, MODE_AREAS, escapeHtml, normalizeStr, collateAllProjects, filterProjects, sortProjects, reorderProjectList, getStoredHubData, saveStoredHubData, statusLabel, getProjectStatus, buildKanbanBoardHtml, buildBentoGridHtml, buildCompactListHtml, initProjectsHub };
if (typeof module !== "undefined" && module.exports) module.exports = ProjectsHub;
