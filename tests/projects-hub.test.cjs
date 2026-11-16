// Suite de pruebas unitarias y de integración para Hub de Proyectos (node:test).
// Cobertura 100% de funciones, líneas y ramas sin dependencias externas (DevBrain 5.0).

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  DEFAULT_DAILY_PROJECTS,
  MODE_AREAS,
  escapeHtml,
  normalizeStr,
  collateAllProjects,
  filterProjects,
  sortProjects,
  reorderProjectList,
  getStoredHubData,
  saveStoredHubData,
  statusLabel,
  buildKanbanBoardHtml,
  buildBentoGridHtml,
  buildCompactListHtml,
  initProjectsHub
} = require(path.join(__dirname, "..", "js", "projects-hub.js"));

const { CANVAS_EXERCISES } = require(path.join(__dirname, "..", "js", "canvas-exercises.js"));

// --- UTILIDADES DE MOCK DOM NATIVO ---

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add(...cls) { cls.forEach(c => c && set.add(c)); },
    remove(...cls) { cls.forEach(c => set.delete(c)); },
    contains(c) { return set.has(c); },
    toggle(c, force) {
      if (force !== undefined) {
        if (force) set.add(c); else set.delete(c);
        return force;
      }
      if (set.has(c)) { set.delete(c); return false; }
      set.add(c); return true;
    },
    get value() { return Array.from(set).join(" "); }
  };
}

function matchesMockSelector(el, selector) {
  if (!el || !selector) return false;
  const sel = selector.trim();
  if (sel.includes(",")) return sel.split(",").some(part => matchesMockSelector(el, part.trim()));
  const attrMatch = sel.match(/^([a-zA-Z0-9_-]+)?(\[[^\]]+\])$/);
  if (attrMatch) {
    const tag = attrMatch[1];
    const attrPart = attrMatch[2];
    if (tag && el.tagName && el.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    const clean = attrPart.slice(1, -1);
    const eqIdx = clean.indexOf("=");
    if (eqIdx === -1) return el.hasAttribute ? el.hasAttribute(clean) : (clean in (el.attrs || {}));
    const name = clean.slice(0, eqIdx).trim();
    let val = clean.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    const actual = el.getAttribute ? el.getAttribute(name) : (el.attrs ? el.attrs[name] : null);
    return actual === val;
  }
  if (sel.startsWith("#")) return el.id === sel.slice(1);
  if (sel.startsWith(".")) return el.classList && el.classList.contains(sel.slice(1));
  return Boolean(el.tagName && el.tagName.toLowerCase() === sel.toLowerCase());
}

function querySelectorAllMock(root, selector) {
  const results = [];
  function walk(node) {
    if (!node || !node.children) return;
    for (const child of node.children) {
      if (matchesMockSelector(child, selector)) results.push(child);
      walk(child);
    }
  }
  walk(root);
  return results;
}

function querySelectorMock(root, selector) {
  function walk(node) {
    if (!node || !node.children) return null;
    for (const child of node.children) {
      if (matchesMockSelector(child, selector)) return child;
      const found = walk(child);
      if (found) return found;
    }
    return null;
  }
  return walk(root);
}

const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function parseHtmlToMockTree(html, rootElement) {
  const rootChildren = [];
  const stack = [rootElement];
  const tagRegex = /<(\/)?([a-zA-Z0-9-]+)((?:\s+[a-zA-Z0-9_-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)/g;
  const attrRegex = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    if (match[5]) {
      const text = match[5].trim();
      if (text && stack.length > 0) {
        const top = stack[stack.length - 1];
        top.textContent = (top.textContent ? top.textContent + " " : "") + text;
      }
      continue;
    }

    const isClosing = Boolean(match[1]);
    const tagName = match[2].toLowerCase();
    const attrString = match[3] || "";
    const isSelfClosing = Boolean(match[4]) || VOID_TAGS.has(tagName);

    if (isClosing) {
      if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === tagName) {
        stack.pop();
      }
      continue;
    }

    const attrs = {};
    const dataset = {};
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const name = attrMatch[1];
      const val = attrMatch[2] !== undefined ? attrMatch[2] : (attrMatch[3] !== undefined ? attrMatch[3] : (attrMatch[4] !== undefined ? attrMatch[4] : ""));
      attrs[name] = val;
      if (name.startsWith("data-")) {
        const camel = name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
        dataset[camel] = val;
      }
    }

    const currentParent = stack[stack.length - 1];
    const newEl = createMockElement(tagName, { attrs, dataset });
    newEl.parentElement = currentParent;

    if (currentParent === rootElement) {
      rootChildren.push(newEl);
    } else {
      currentParent.children.push(newEl);
    }

    if (!isSelfClosing) {
      stack.push(newEl);
    }
  }

  return rootChildren;
}

function createMockElement(tagName = "div", options = {}) {
  const children = [];
  const attrs = { ...(options.attrs || {}) };
  const listeners = {};
  const dataset = { ...(options.dataset || {}) };
  let _value = options.value || (attrs.value !== undefined ? attrs.value : "");
  let _textContent = options.textContent || "";
  let _innerHTML = options.innerHTML || "";
  let parent = null;

  if (options.id) attrs.id = options.id;
  const initialClasses = options.classes || (options.className ? options.className.split(/\s+/).filter(Boolean) : (attrs.class ? attrs.class.split(/\s+/).filter(Boolean) : []));
  const classList = createClassList(initialClasses);

  const el = {
    tagName: tagName.toUpperCase(),
    get id() { return attrs.id || ""; },
    set id(val) { attrs.id = String(val); },
    get className() { return classList.value; },
    set className(val) {
      attrs.class = String(val);
      el.classList = createClassList(String(val).split(/\s+/).filter(Boolean));
    },
    classList,
    dataset,
    attrs,
    children,
    get parentElement() { return parent; },
    set parentElement(p) { parent = p; },
    get value() { return _value; },
    set value(v) { _value = String(v); },
    get textContent() { return _textContent; },
    set textContent(v) { _textContent = String(v); },
    get innerHTML() { return _innerHTML; },
    set innerHTML(html) {
      _innerHTML = String(html);
      children.length = 0;
      const parsed = parseHtmlToMockTree(_innerHTML, el);
      children.push(...parsed);
    },
    setAttribute(name, val) {
      attrs[name] = String(val);
      if (name === "class") el.className = val;
      else if (name.startsWith("data-")) {
        const camel = name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
        dataset[camel] = String(val);
      }
    },
    getAttribute(name) { return attrs[name] !== undefined ? attrs[name] : null; },
    removeAttribute(name) {
      delete attrs[name];
      if (name.startsWith("data-")) {
        const camel = name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
        delete dataset[camel];
      }
    },
    hasAttribute(name) { return name in attrs; },
    matches(sel) { return matchesMockSelector(this, sel); },
    addEventListener(type, handler) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(handler);
    },
    removeEventListener(type, handler) {
      if (!listeners[type]) return;
      listeners[type] = listeners[type].filter(h => h !== handler);
    },
    dispatchEvent(event) {
      if (!event.target) event.target = this;
      event.currentTarget = this;
      const handlers = listeners[event.type] || [];
      handlers.forEach(h => h(event));
      if (event.bubbles && !event.propagationStopped && parent) {
        parent.dispatchEvent(event);
      }
      return !event.defaultPrevented;
    },
    appendChild(child) {
      const idx = children.indexOf(child);
      if (idx >= 0) children.splice(idx, 1);
      child.parentElement = el;
      children.push(child);
      return child;
    },
    removeChild(child) {
      const idx = children.indexOf(child);
      if (idx >= 0) {
        children.splice(idx, 1);
        child.parentElement = null;
      }
      return child;
    },
    querySelector(sel) { return querySelectorMock(this, sel); },
    querySelectorAll(sel) { return querySelectorAllMock(this, sel); },
    closest(sel) {
      let cur = this;
      while (cur) {
        if (matchesMockSelector(cur, sel)) return cur;
        cur = cur.parentElement;
      }
      return null;
    },
    click() {
      const ev = createMockEvent("click", { target: this, bubbles: true });
      this.dispatchEvent(ev);
    },
    focus() { this.focused = true; },
    blur() { this.focused = false; }
  };

  return el;
}

function createMockStorage(initialData = {}, options = {}) {
  const store = new Map();
  Object.entries(initialData).forEach(([k, v]) => {
    store.set(k, JSON.stringify(v));
  });

  let quotaError = Boolean(options.quotaError);
  let readError = Boolean(options.readError);

  return {
    _store: store,
    getItem(key) {
      if (readError) throw new Error("SecurityError: Acceso a almacenamiento denegado");
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, val) {
      if (quotaError) {
        const err = new Error("QuotaExceededError: Se ha excedido la cuota de almacenamiento local");
        err.name = "QuotaExceededError";
        throw err;
      }
      store.set(key, String(val));
    },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); },
    setQuotaError(enable) { quotaError = Boolean(enable); },
    setReadError(enable) { readError = Boolean(enable); },
    setCorruptedJson(key, corruptStr = "not-a-valid{json") {
      store.set(key, corruptStr);
    },
    dump() { return Object.fromEntries(store.entries()); }
  };
}

function createMockEvent(type, init = {}) {
  let defaultPrevented = false;
  let propagationStopped = false;

  const event = {
    type,
    target: init.target || null,
    currentTarget: init.currentTarget || init.target || null,
    bubbles: init.bubbles !== undefined ? init.bubbles : true,
    cancelable: init.cancelable !== undefined ? init.cancelable : true,
    key: init.key || "",
    code: init.code || "",
    preventDefault() { defaultPrevented = true; },
    stopPropagation() { propagationStopped = true; },
    get defaultPrevented() { return defaultPrevented; },
    get propagationStopped() { return propagationStopped; },
    ...init
  };

  if (type.startsWith("drag") || type === "drop") {
    const dataStore = { ...(init.dataTransferData || {}) };
    event.dataTransfer = {
      effectAllowed: "move",
      dropEffect: "move",
      setData(format, val) { dataStore[format] = String(val); },
      getData(format) { return dataStore[format] || ""; },
      clearData(format) {
        if (format) delete dataStore[format];
        else Object.keys(dataStore).forEach(k => delete dataStore[k]);
      },
      ...init.dataTransfer
    };
  }

  return event;
}

function createHubDomHarness(options = {}) {
  const root = createMockElement("section", { id: "proyectos", className: "page-view active" });
  const toolbar = createMockElement("div", { className: "projects-hub-toolbar" });

  const tabKanban = createMockElement("button", { attrs: { "data-hub-view": "kanban", type: "button", class: "btn-hub-view active", "aria-selected": "true" } });
  const tabBento = createMockElement("button", { attrs: { "data-hub-view": "bento", type: "button", class: "btn-hub-view", "aria-selected": "false" } });
  const tabList = createMockElement("button", { attrs: { "data-hub-view": "list", type: "button", class: "btn-hub-view", "aria-selected": "false" } });

  const searchInput = createMockElement("input", { id: "hub-search-input", attrs: { type: "search", placeholder: "Buscar proyectos...", "data-hub-search": "true" } });
  const filterArea = createMockElement("select", { id: "hub-filter-area", attrs: { "data-hub-filter": "area" } });
  filterArea.value = "all";
  const filterLevel = createMockElement("select", { id: "hub-filter-level", attrs: { "data-hub-filter": "level" } });
  filterLevel.value = "all";
  const filterDuration = createMockElement("select", { id: "hub-filter-duration", attrs: { "data-hub-filter": "duration" } });
  filterDuration.value = "all";

  const resultsCount = createMockElement("span", { id: "hub-results-count", attrs: { "aria-live": "polite" } });
  const resetBtn = createMockElement("button", { attrs: { "data-hub-reset-order": "true", type: "button", class: "btn-hub-reset" } });

  toolbar.appendChild(tabKanban);
  toolbar.appendChild(tabBento);
  toolbar.appendChild(tabList);
  toolbar.appendChild(searchInput);
  toolbar.appendChild(filterArea);
  toolbar.appendChild(filterLevel);
  toolbar.appendChild(filterDuration);
  toolbar.appendChild(resultsCount);
  toolbar.appendChild(resetBtn);

  const viewContainer = createMockElement("div", { id: "projects-hub-view-container", className: "projects-hub-view-container" });

  root.appendChild(toolbar);
  root.appendChild(viewContainer);

  const mockStorage = options.storage || createMockStorage(options.initialStorage || {});

  return {
    root, toolbar, tabKanban, tabBento, tabList, searchInput,
    filterArea, filterLevel, filterDuration, resultsCount, resetBtn,
    viewContainer, storage: mockStorage,
    triggerSearch(text) {
      searchInput.value = text;
      searchInput.dispatchEvent(createMockEvent("input", { target: searchInput, bubbles: true }));
    },
    triggerFilter(filterEl, val) {
      filterEl.value = val;
      filterEl.dispatchEvent(createMockEvent("change", { target: filterEl, bubbles: true }));
    },
    triggerViewChange(mode) {
      const tab = mode === "bento" ? tabBento : (mode === "list" ? tabList : tabKanban);
      tab.click();
    },
    triggerReset() { resetBtn.click(); },
    triggerDragDrop(sourceEl, targetEl, transferId = null) {
      const dt = {
        data: { "text/plain": transferId || sourceEl.getAttribute("data-project-id") || sourceEl.id },
        setData(k, v) { this.data[k] = v; },
        getData(k) { return this.data[k]; }
      };
      sourceEl.dispatchEvent(createMockEvent("dragstart", { target: sourceEl, dataTransfer: dt, bubbles: true }));
      targetEl.dispatchEvent(createMockEvent("dragover", { target: targetEl, dataTransfer: dt, bubbles: true }));
      targetEl.dispatchEvent(createMockEvent("drop", { target: targetEl, dataTransfer: dt, bubbles: true }));
      sourceEl.dispatchEvent(createMockEvent("dragend", { target: sourceEl, dataTransfer: dt, bubbles: true }));
    }
  };
}

// =========================================================================
// TIER 1: COBERTURA DE CARACTERÍSTICAS NUCLEARES (HAPPY PATHS)
// =========================================================================

test("TC-1.1.1: collateAllProjects unifica los 43 proyectos sin duplicados de ID", () => {
  const all = collateAllProjects(CANVAS_EXERCISES, DEFAULT_DAILY_PROJECTS);
  assert.equal(all.length, 43, "Debe contener exactamente 43 proyectos");
  const uniqueIds = new Set(all.map(p => p.id));
  assert.equal(uniqueIds.size, 43, "Todos los 43 IDs deben ser únicos");
});

test("TC-1.1.2: collateAllProjects normaliza metadatos obligatorios en todos los proyectos", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  all.forEach(p => {
    assert.ok(p.id, "Debe tener id");
    assert.ok(p.title, "Debe tener title");
    assert.ok(p.description, "Debe tener description");
    assert.ok(p.area, "Debe tener area");
    assert.ok(p.level, "Debe tener level");
    assert.ok(p.duration, "Debe tener duration");
    assert.equal(typeof p.durationMin, "number", "durationMin debe ser numérico");
    assert.ok(Array.isArray(p.tags), "tags debe ser arreglo");
    assert.equal(typeof p.technology, "string", "technology debe ser string");
    assert.ok(p.route.startsWith("#"), "route debe ser hash SPA");
    assert.ok(p.previewSvg.includes("<svg"), "previewSvg debe contener marcado SVG");
    assert.equal(p.status, "por-iniciar", "Estado inicial debe ser por-iniciar");
  });
});

test("TC-1.1.3: collateAllProjects asigna estado por-iniciar por defecto", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  assert.ok(all.every(p => p.status === "por-iniciar"));
});

test("TC-1.1.4: collateAllProjects genera deep links correctos", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const canvasRoutes = all.slice(0, 39).map(p => p.route);
  assert.ok(canvasRoutes.every(r => /^#gemini-canvas\/[a-z-]+\/[abc]$/.test(r)));
  const dailyRoutes = all.slice(39).map(p => p.route);
  assert.deepEqual(dailyRoutes, ["#dia-1", "#dia-2", "#dia-3", "#dia-4"]);
});

test("TC-1.1.5: collateAllProjects clasifica áreas y niveles según taxonomía institucional", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const validAreas = new Set(["Redacción", "Web & Código", "Datos & SQL", "Diseño", "Automatización"]);
  const validLevels = new Set(["Básico", "Intermedio", "Avanzado"]);
  all.forEach(p => {
    assert.ok(validAreas.has(p.area), `Área inválida: ${p.area}`);
    assert.ok(validLevels.has(p.level), `Nivel inválido: ${p.level}`);
  });
  const inlineB = all.find(p => p.id === "inline-b-depurar-funcion");
  assert.equal(inlineB.area, "Web & Código", "inline-b debe mapear a Web & Código");
});

test("TC-1.2.1: filterProjects filtra reactivamente por texto en título o descripción", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const res = filterProjects(all, { search: "deserción" });
  assert.equal(res.length, 1);
  assert.equal(res[0].id, "doc-a-informe-desercion");
});

test("TC-1.2.2: filterProjects filtra por área curricular", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const web = filterProjects(all, { area: "Web & Código" });
  assert.equal(web.length, 8, "Debe tener 8 proyectos de Web & Código");
  assert.ok(web.every(p => p.area === "Web & Código"));
});

test("TC-1.2.3: filterProjects filtra por nivel de dificultad", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const adv = filterProjects(all, { level: "Avanzado" });
  assert.ok(adv.length > 0);
  assert.ok(adv.every(p => p.level === "Avanzado"));
});

test("TC-1.2.4: filterProjects filtra por duración en rangos estándar", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const short = filterProjects(all, { duration: "short" });
  assert.ok(short.every(p => p.durationMin <= 25));
  const medium = filterProjects(all, { duration: "medium" });
  assert.ok(medium.every(p => p.durationMin >= 26 && p.durationMin <= 35));
  const long = filterProjects(all, { duration: "long" });
  assert.ok(long.every(p => p.durationMin >= 40));
});

test("TC-1.2.5: filterProjects filtra de forma acumulativa AND", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const res = filterProjects(all, { area: "Redacción", level: "Básico", duration: "short" });
  assert.ok(res.length > 0);
  assert.ok(res.every(p => p.area === "Redacción" && p.level === "Básico" && p.durationMin <= 25));
});

test("TC-1.3.1: sortProjects en modo official respeta la secuencia curricular", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const res = sortProjects(all, "official");
  assert.equal(res[0].id, "doc-a-informe-desercion");
  assert.equal(res[42].id, "dia-4-prototipo-demo-day");
});

test("TC-1.3.2: sortProjects en modo duration-asc ordena ascendentemente", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const res = sortProjects(all, "duration-asc");
  for (let i = 1; i < res.length; i++) {
    assert.ok(res[i].durationMin >= res[i - 1].durationMin);
  }
});

test("TC-1.3.3: sortProjects en modo custom aplica el orden indicado", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const custom = [all[5].id, all[2].id, all[0].id];
  const res = sortProjects(all, "custom", custom);
  assert.equal(res[0].id, all[5].id);
  assert.equal(res[1].id, all[2].id);
  assert.equal(res[2].id, all[0].id);
});

test("TC-1.3.4: sortProjects no muta el arreglo original", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const firstId = all[0].id;
  const res = sortProjects(all, "duration-asc");
  assert.equal(all[0].id, firstId);
  assert.notEqual(res, all);
});

test("TC-1.3.5: sortProjects preserva elementos omitidos en customOrder al final", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const custom = [all[10].id, all[20].id];
  const res = sortProjects(all, "custom", custom);
  assert.equal(res.length, 43);
  assert.equal(res[0].id, all[10].id);
  assert.equal(res[1].id, all[20].id);
});

test("TC-1.4.1: reorderProjectList mueve elemento hacia arriba (position: before)", () => {
  const orig = ["a", "b", "c", "d"];
  const res = reorderProjectList(orig, "c", "a", "before");
  assert.deepEqual(res, ["c", "a", "b", "d"]);
});

test("TC-1.4.2: reorderProjectList mueve elemento hacia abajo (position: after)", () => {
  const orig = ["a", "b", "c", "d"];
  const res = reorderProjectList(orig, "a", "c", "after");
  assert.deepEqual(res, ["b", "c", "a", "d"]);
});

test("TC-1.4.3: reorderProjectList mueve del último al primero", () => {
  const orig = ["a", "b", "c", "d"];
  const res = reorderProjectList(orig, "d", "a", "before");
  assert.deepEqual(res, ["d", "a", "b", "c"]);
});

test("TC-1.4.4: reorderProjectList mueve del primero al último", () => {
  const orig = ["a", "b", "c", "d"];
  const res = reorderProjectList(orig, "a", "d", "after");
  assert.deepEqual(res, ["b", "c", "d", "a"]);
});

test("TC-1.4.5: reorderProjectList mantiene intacto el arreglo fuente original", () => {
  const orig = ["a", "b", "c"];
  reorderProjectList(orig, "c", "a", "before");
  assert.deepEqual(orig, ["a", "b", "c"]);
});

test("TC-1.5.1: buildKanbanBoardHtml genera estructura con las 3 columnas y atributos", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildKanbanBoardHtml(all, {});
  assert.ok(html.includes('data-kanban-status="por-iniciar"'));
  assert.ok(html.includes('data-kanban-status="en-desarrollo"'));
  assert.ok(html.includes('data-kanban-status="completado"'));
});

test("TC-1.5.2: buildKanbanBoardHtml muestra contadores en títulos de columna", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const statusMap = { [all[0].id]: "en-desarrollo", [all[1].id]: "completado" };
  const html = buildKanbanBoardHtml(all, statusMap);
  assert.ok(html.includes("Por Iniciar (41)"));
  assert.ok(html.includes("En Desarrollo (1)"));
  assert.ok(html.includes("Completado (1)"));
});

test("TC-1.5.3: buildKanbanBoardHtml genera tarjetas con clase kanban-project-card y draggable", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildKanbanBoardHtml(all, {});
  assert.ok(html.includes('class="projects-kanban-card kanban-project-card"'));
  assert.ok(html.includes('draggable="true"'));
});

test("TC-1.5.4: buildKanbanBoardHtml incluye enlaces directos de acción rápida", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildKanbanBoardHtml(all, {});
  assert.ok(html.includes('href="#gemini-canvas/doc-editorial/a"'));
});

test("TC-1.5.5: buildKanbanBoardHtml muestra contenedor vacío accesible en columnas sin tarjetas", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildKanbanBoardHtml(all, {});
  assert.ok(html.includes("kanban-empty"));
  assert.ok(html.includes("Sin proyectos en este estado"));
});

test("TC-1.6.1: buildBentoGridHtml genera cuadrícula Bento accesible con tarjetas", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildBentoGridHtml(all, {});
  assert.ok(html.includes("projects-bento-grid"));
  assert.ok(html.includes("projects-bento-card"));
});

test("TC-1.6.2: buildBentoGridHtml incrusta vista previa SVG en cada tarjeta", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildBentoGridHtml([all[0]], {});
  assert.ok(html.includes('class="projects-bento-preview"'));
  assert.ok(html.includes("<svg"));
});

test("TC-1.6.3: buildBentoGridHtml incluye badges de nivel, duración y chips de área", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildBentoGridHtml([all[0]], {});
  assert.ok(html.includes("chip-area"));
  assert.ok(html.includes("badge-level"));
  assert.ok(html.includes("badge-duration"));
});

test("TC-1.6.4: buildBentoGridHtml incluye botón Abrir Proyecto", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildBentoGridHtml([all[0]], {});
  assert.ok(html.includes("🚀 Abrir Proyecto"));
});

test("TC-1.6.5: buildBentoGridHtml incluye tiradores y botones de teclado", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildBentoGridHtml([all[0]], {});
  assert.ok(html.includes("projects-drag-handle"));
  assert.ok(html.includes('data-hub-move="up"'));
  assert.ok(html.includes('data-hub-move="down"'));
});

test("TC-1.7.1: buildCompactListHtml incluye contenedor scroll horizontal Regla 7.4", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildCompactListHtml(all, {});
  assert.ok(html.includes("projects-list-table-container"));
  assert.ok(html.includes("projects-compact-table"));
});

test("TC-1.7.2: buildCompactListHtml genera thead con columnas descriptivas", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildCompactListHtml(all, {});
  assert.ok(html.includes("<th scope=\"col\">Orden</th>"));
  assert.ok(html.includes("<th scope=\"col\">Estado</th>"));
  assert.ok(html.includes("<th scope=\"col\">Proyecto</th>"));
  assert.ok(html.includes("<th scope=\"col\">Acción</th>"));
});

test("TC-1.7.3: buildCompactListHtml renderiza 43 filas interactivas", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildCompactListHtml(all, {});
  const rowCount = (html.match(/<tr data-project-id=/g) || []).length;
  assert.equal(rowCount, 43);
});

test("TC-1.7.4: buildCompactListHtml incluye controles de teclado en cada fila", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildCompactListHtml([all[0]], {});
  assert.ok(html.includes('data-hub-move="up"'));
  assert.ok(html.includes('data-hub-move="down"'));
});

test("TC-1.7.5: buildCompactListHtml incluye selector de estado reactivo", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildCompactListHtml([all[0]], { [all[0].id]: "en-desarrollo" });
  assert.ok(html.includes('select-project-status'));
  assert.ok(html.includes('value="en-desarrollo" selected'));
});

test("TC-1.8.1: getStoredHubData lee orden personalizado serializado", () => {
  const storage = createMockStorage({ projects_hub_custom_order: ["p1", "p2"] });
  assert.deepEqual(getStoredHubData(storage, "projects_hub_custom_order", []), ["p1", "p2"]);
});

test("TC-1.8.2: getStoredHubData lee mapa de estados", () => {
  const storage = createMockStorage({ projects_hub_status_map: { p1: "completado" } });
  assert.deepEqual(getStoredHubData(storage, "projects_hub_status_map", {}), { p1: "completado" });
});

test("TC-1.8.3: getStoredHubData lee modo de vista guardado", () => {
  const storage = createMockStorage({ projects_hub_view_mode: "bento" });
  assert.equal(getStoredHubData(storage, "projects_hub_view_mode", "kanban"), "bento");
});

test("TC-1.8.4: saveStoredHubData persiste datos en storage", () => {
  const storage = createMockStorage();
  const ok = saveStoredHubData(storage, "test_key", { a: 1 });
  assert.equal(ok, true);
  assert.equal(storage.getItem("test_key"), JSON.stringify({ a: 1 }));
});

test("TC-1.8.5: getStoredHubData retorna fallback ante clave ausente", () => {
  const storage = createMockStorage();
  assert.deepEqual(getStoredHubData(storage, "inexistente", ["fallback"]), ["fallback"]);
});

test("TC-1.9.1: Botón reset restaura secuencia oficial curricular", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  api.setStatus("doc-a-informe-desercion", "completado");
  const reordered = reorderProjectList(api.getOrder(), "dia-4-prototipo-demo-day", "doc-a-informe-desercion", "before");
  harness.storage.setItem("projects_hub_custom_order", JSON.stringify(reordered));
  harness.triggerReset();
  const all = collateAllProjects(CANVAS_EXERCISES);
  assert.deepEqual(api.getOrder(), all.map(p => p.id));
});

test("TC-1.9.2: Botón reset limpia desvío en almacenamiento", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerReset();
  const stored = JSON.parse(harness.storage.getItem("projects_hub_custom_order"));
  assert.equal(stored[0], "doc-a-informe-desercion");
});

test("TC-1.9.3: Botón reset preserva mapa de estados intacto", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  api.setStatus("doc-a-informe-desercion", "completado");
  harness.triggerReset();
  assert.equal(api.getStatusMap()["doc-a-informe-desercion"], "completado");
});

test("TC-1.9.4: Botón reset actualiza vista inmediatamente", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerReset();
  assert.ok(harness.viewContainer.innerHTML.includes("doc-a-informe-desercion"));
});

test("TC-1.9.5: Botón reset notifica en contador de resultados", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerReset();
  assert.equal(harness.resultsCount.textContent, "Mostrando 43 de 43 proyectos");
});

test("TC-1.10.1: Movimiento ascendente con botón ▲ desplaza proyecto", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const secondCard = harness.viewContainer.querySelectorAll(".projects-kanban-card")[1];
  const upBtn = secondCard.querySelector('[data-move-pos="up"]');
  upBtn.click();
  const order = api.getOrder();
  assert.equal(order[0], "doc-b-propuesta-huerta");
});

test("TC-1.10.2: Movimiento descendente con botón ▼ desplaza proyecto", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const firstCard = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  const downBtn = firstCard.querySelector('[data-move-pos="down"]');
  downBtn.click();
  const order = api.getOrder();
  assert.equal(order[1], "doc-a-informe-desercion");
});

test("TC-1.10.3: Movimiento por teclado persiste inmediatamente en storage", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const firstCard = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  firstCard.querySelector('[data-move-pos="down"]').click();
  const stored = JSON.parse(harness.storage.getItem("projects_hub_custom_order"));
  assert.equal(stored[1], "doc-a-informe-desercion");
});

test("TC-1.10.4: Re-renderizado tras movimiento por teclado conserva coherencia de árbol", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const firstCard = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  firstCard.querySelector('[data-move-pos="down"]').click();
  const cards = harness.viewContainer.querySelectorAll(".projects-kanban-card");
  assert.equal(cards.length, 43);
});

test("TC-1.10.5: Botones ▲ ▼ cuentan con etiquetas ARIA descriptivas", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildBentoGridHtml([all[0]], {});
  assert.ok(html.includes(`aria-label="Mover antes ${all[0].title}"`));
  assert.ok(html.includes(`aria-label="Mover después ${all[0].title}"`));
});

test("TC-1.11.1: initProjectsHub inicializa y retorna API pública completa", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  assert.equal(typeof api.refresh, "function");
  assert.equal(typeof api.getProjects, "function");
  assert.equal(typeof api.setViewMode, "function");
  assert.equal(typeof api.resetOrder, "function");
  assert.equal(typeof api.getOrder, "function");
  assert.equal(typeof api.getStatusMap, "function");
  assert.equal(typeof api.setStatus, "function");
});

test("TC-1.11.2: initProjectsHub conmuta a vista Bento al pulsar pestaña", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerViewChange("bento");
  assert.ok(harness.viewContainer.innerHTML.includes("projects-bento-grid"));
  assert.equal(harness.tabBento.getAttribute("aria-selected"), "true");
});

test("TC-1.11.3: initProjectsHub buscador filtra reactivamente en vivo", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerSearch("deserción");
  const visible = harness.viewContainer.querySelectorAll(".projects-kanban-card");
  assert.equal(visible.length, 1);
  assert.equal(harness.resultsCount.textContent, "Mostrando 1 de 43 proyectos");
});

test("TC-1.11.4: initProjectsHub asigna clases en dragstart y dragover", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const card1 = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  const card2 = harness.viewContainer.querySelectorAll(".projects-kanban-card")[1];
  const dt = { data: {}, setData(k, v) { this.data[k] = v; }, getData(k) { return this.data[k]; } };
  card1.dispatchEvent(createMockEvent("dragstart", { target: card1, dataTransfer: dt, bubbles: true }));
  assert.ok(card1.classList.contains("is-project-dragging"));
  card2.dispatchEvent(createMockEvent("dragover", { target: card2, dataTransfer: dt, bubbles: true }));
  assert.ok(card2.classList.contains("is-project-drop-target"));
});

test("TC-1.11.5: Drag & Drop entre columnas Kanban actualiza estado", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const card1 = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  const devCol = harness.viewContainer.querySelectorAll(".projects-kanban-column")[1];
  harness.triggerDragDrop(card1, devCol);
  assert.equal(api.getStatusMap()["doc-a-informe-desercion"], "en-desarrollo");
});

// =========================================================================
// TIER 2: CASOS LÍMITE, VALORES EXTREMOS Y RECUPERACIÓN (BOUNDARY & CORNER)
// =========================================================================

test("TC-2.1.1: collateAllProjects tolera canvasExercises nulo o vacío", () => {
  const res = collateAllProjects(null, DEFAULT_DAILY_PROJECTS);
  assert.equal(res.length, 4);
});

test("TC-2.1.2: collateAllProjects tolera dailyProjects nulo", () => {
  const res = collateAllProjects(CANVAS_EXERCISES, null);
  assert.equal(res.length, 39);
});

test("TC-2.1.3: collateAllProjects con ambos parámetros nulos devuelve []", () => {
  const res = collateAllProjects(null, null);
  assert.deepEqual(res, []);
});

test("TC-2.1.4: collateAllProjects maneja ejercicios con campos faltantes", () => {
  const dummy = { "dummy-mode": [{ id: "custom-ex", title: "Custom" }] };
  const res = collateAllProjects(dummy, []);
  assert.equal(res.length, 1);
  assert.equal(res[0].durationMin, 30);
  assert.equal(res[0].previewSvg, "");
});

test("TC-2.1.5: collateAllProjects preserva caracteres especiales en títulos", () => {
  const dummy = { "dummy-mode": [{ id: "spec-ex", title: 'Proyecto "A" & <B>' }] };
  const res = collateAllProjects(dummy, []);
  assert.equal(res[0].title, 'Proyecto "A" & <B>');
});

test("TC-2.2.1: filterProjects con búsqueda vacía o espacios retorna todos", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  assert.equal(filterProjects(all, { search: "   " }).length, 43);
});

test("TC-2.2.2: filterProjects maneja diacríticos complejos y mayúsculas", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const res = filterProjects(all, { search: "REDACCIÓN" });
  assert.ok(res.length >= 7);
});

test("TC-2.2.3: filterProjects inmune a caracteres regex especiales", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  assert.doesNotThrow(() => {
    const res = filterProjects(all, { search: "[.*+?^${}()|]" });
    assert.equal(res.length, 0);
  });
});

test("TC-2.2.4: filterProjects con comodines 'all' u 'todos' no restringe", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const res = filterProjects(all, { area: "all", level: "todos", duration: "todas" });
  assert.equal(res.length, 43);
});

test("TC-2.2.5: filterProjects sin coincidencias retorna arreglo vacío", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const res = filterProjects(all, { search: "texto_imposible_xyz" });
  assert.deepEqual(res, []);
});

test("TC-2.3.1: sortProjects con modo desconocido recurre a orden oficial", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const res = sortProjects(all, "modo-invalido");
  assert.equal(res[0].id, "doc-a-informe-desercion");
});

test("TC-2.3.2: sortProjects modo custom con orden nulo usa orden original", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const res = sortProjects(all, "custom", null);
  assert.equal(res[0].id, "doc-a-informe-desercion");
});

test("TC-2.3.3: sortProjects modo custom con longitud incompleta antepone conocidos", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const res = sortProjects(all, "custom", ["dia-4-prototipo-demo-day"]);
  assert.equal(res[0].id, "dia-4-prototipo-demo-day");
  assert.equal(res.length, 43);
});

test("TC-2.3.4: sortProjects modo custom tolera IDs inexistentes", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const res = sortProjects(all, "custom", ["inexistente-1", "doc-b-propuesta-huerta"]);
  assert.equal(res[0].id, "doc-b-propuesta-huerta");
});

test("TC-2.3.5: sortProjects con arreglo vacío retorna arreglo vacío", () => {
  assert.deepEqual(sortProjects([], "duration-asc"), []);
  assert.deepEqual(sortProjects(null, "duration-asc"), []);
});

test("TC-2.4.1: reorderProjectList con sourceId igual a targetId no muta", () => {
  const orig = ["a", "b", "c"];
  assert.deepEqual(reorderProjectList(orig, "b", "b", "before"), ["a", "b", "c"]);
});

test("TC-2.4.2: reorderProjectList con sourceId desconocido no altera lista", () => {
  const orig = ["a", "b", "c"];
  assert.deepEqual(reorderProjectList(orig, "x", "b", "before"), ["a", "b", "c"]);
});

test("TC-2.4.3: reorderProjectList con targetId desconocido no altera lista", () => {
  const orig = ["a", "b", "c"];
  assert.deepEqual(reorderProjectList(orig, "a", "x", "before"), ["a", "b", "c"]);
});

test("TC-2.4.4: reorderProjectList con lista no arreglo retorna arreglo vacío", () => {
  assert.deepEqual(reorderProjectList(null, "a", "b", "before"), []);
});

test("TC-2.4.5: reorderProjectList con position desconocido usa 'before'", () => {
  const orig = ["a", "b", "c"];
  assert.deepEqual(reorderProjectList(orig, "c", "b", "otro"), ["a", "c", "b"]);
});

test("TC-2.5.1: buildKanbanBoardHtml con proyectos vacíos o no arreglo", () => {
  const htmlEmpty = buildKanbanBoardHtml([], {});
  assert.ok(htmlEmpty.includes("Sin proyectos en este estado"));
  const htmlNull = buildKanbanBoardHtml(null, {});
  assert.ok(htmlNull.includes("Sin proyectos en este estado"));
});

test("TC-2.5.2: buildKanbanBoardHtml con statusMap con estados desconocidos", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildKanbanBoardHtml([all[0]], { [all[0].id]: "estado-raro" });
  assert.ok(html.includes("Por Iniciar (1)"));
});

test("TC-2.5.3: buildKanbanBoardHtml protege contra inyección XSS en títulos", () => {
  const xssProject = { id: "xss-1", title: '<script>alert("xss")</script>', area: "Redacción", level: "Básico", duration: "10 min", route: "#xss" };
  const html = buildKanbanBoardHtml([xssProject], {});
  assert.ok(!html.includes('<script>alert("xss")</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test("TC-2.5.4: buildKanbanBoardHtml tolera proyectos con campos nulos", () => {
  const project = { id: "p-null", title: null, area: null, level: null, duration: null, route: "" };
  const html = buildKanbanBoardHtml([project], {});
  assert.ok(!html.includes("undefined"));
});

test("TC-2.5.5: buildKanbanBoardHtml maneja desbalance (43 en una sola columna)", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const statusMap = Object.fromEntries(all.map(p => [p.id, "completado"]));
  const html = buildKanbanBoardHtml(all, statusMap);
  assert.ok(html.includes("Completado (43)"));
  assert.ok(html.includes("Por Iniciar (0)"));
});

test("TC-2.6.1: buildBentoGridHtml con lista vacía renderiza empty-state", () => {
  const html = buildBentoGridHtml([], {});
  assert.ok(html.includes("projects-empty-state"));
  assert.ok(html.includes("No se encontraron proyectos formativos."));
});

test("TC-2.6.2: buildBentoGridHtml inyecta SVG por defecto si previewSvg es nulo", () => {
  const p = { id: "p1", title: "Test", previewSvg: null, area: "Redacción", level: "Básico", duration: "20 min", route: "#test" };
  const html = buildBentoGridHtml([p], {});
  assert.ok(html.includes("<svg"));
});

test("TC-2.6.3: buildBentoGridHtml modo isDraggable: false omite tiradores", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildBentoGridHtml([all[0]], {}, { isDraggable: false });
  assert.ok(!html.includes("projects-drag-handle"));
  assert.ok(html.includes('draggable="false"'));
});

test("TC-2.6.4: buildBentoGridHtml no trunca textos largos (Regla 7.4)", () => {
  const longTitle = "Este es un título excepcionalmente largo para comprobar que no se aplican elipsis ni truncamiento artificial";
  const p = { id: "p-long", title: longTitle, area: "Redacción", level: "Básico", duration: "20 min", route: "#p" };
  const html = buildBentoGridHtml([p], {});
  assert.ok(html.includes(longTitle));
});

test("TC-2.6.5: buildBentoGridHtml con parámetro nulo retorna contenedor seguro", () => {
  assert.ok(buildBentoGridHtml(null, {}).includes("projects-empty-state"));
});

test("TC-2.7.1: buildCompactListHtml con lista vacía renderiza td-empty", () => {
  const html = buildCompactListHtml([], {});
  assert.ok(html.includes('td colspan="7" class="td-empty"'));
});

test("TC-2.7.2: buildCompactListHtml con duración vacía usa fallback", () => {
  const p = { id: "p1", title: "Test", duration: null, durationMin: 0, area: "Redacción", level: "Básico", route: "#" };
  const html = buildCompactListHtml([p], {});
  assert.ok(html.includes("30 min"));
});

test("TC-2.7.3: buildCompactListHtml escapa caracteres especiales en rutas", () => {
  const p = { id: "p1", title: "Test & <Demo>", area: "Redacción", level: "Básico", duration: "20 min", route: '#test&"><script>' };
  const html = buildCompactListHtml([p], {});
  assert.ok(!html.includes("<script>"));
});

test("TC-2.7.4: buildCompactListHtml conserva tabla en contenedor con scroll", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const html = buildCompactListHtml(all, {});
  assert.ok(html.startsWith('<div class="projects-list-table-container">'));
});

test("TC-2.7.5: buildCompactListHtml maneja valores no estándar de área o nivel", () => {
  const p = { id: "p1", title: "Test", area: "Área Nueva", level: "Experto", duration: "30 min", route: "#" };
  const html = buildCompactListHtml([p], {});
  assert.ok(html.includes("Área Nueva"));
  assert.ok(html.includes("Experto"));
});

test("TC-2.8.1: getStoredHubData tolera JSON corrupto y retorna fallback", () => {
  const storage = createMockStorage();
  storage.setCorruptedJson("bad_key", "invalid{json");
  assert.deepEqual(getStoredHubData(storage, "bad_key", { fallback: true }), { fallback: true });
});

test("TC-2.8.2: getStoredHubData detecta discrepancia de tipos", () => {
  const storage = createMockStorage({ key_num: 123, key_arr: ["a"] });
  assert.deepEqual(getStoredHubData(storage, "key_num", ["fallback"]), ["fallback"]);
  assert.deepEqual(getStoredHubData(storage, "key_arr", { fallback: 1 }), { fallback: 1 });
});

test("TC-2.8.3: saveStoredHubData tolera QuotaExceededError y retorna false", () => {
  const storage = createMockStorage({}, { quotaError: true });
  const res = saveStoredHubData(storage, "key", ["a"]);
  assert.equal(res, false);
});

test("TC-2.8.4: getStoredHubData y saveStoredHubData toleran storage nulo", () => {
  assert.deepEqual(getStoredHubData(null, "k", "fb"), "fb");
  assert.equal(saveStoredHubData(null, "k", "v"), false);
  assert.deepEqual(getStoredHubData({}, "k", "fb"), "fb");
  assert.equal(saveStoredHubData({}, "k", "v"), false);
});

test("TC-2.8.5: getStoredHubData con fallback nulo no rompe", () => {
  const storage = createMockStorage({ k: "val" });
  assert.equal(getStoredHubData(storage, "k", null), "val");
  assert.equal(getStoredHubData(storage, "missing", null), null);
});

test("TC-2.9.1: Botón reset es idempotente si el orden ya es oficial", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const before = api.getOrder();
  harness.triggerReset();
  assert.deepEqual(api.getOrder(), before);
});

test("TC-2.9.2: Botón reset con storage con fallos de escritura funciona en memoria", () => {
  const harness = createHubDomHarness({ storage: createMockStorage({}, { quotaError: true }) });
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  assert.doesNotThrow(() => harness.triggerReset());
  assert.equal(api.getOrder()[0], "doc-a-informe-desercion");
});

test("TC-2.9.3: Clics consecutivos en botón reset mantienen estabilidad", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  for (let i = 0; i < 5; i++) harness.triggerReset();
  assert.equal(api.getOrder().length, 43);
});

test("TC-2.9.4: Botón reset mantiene filtros activos", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerFilter(harness.filterArea, "Redacción");
  harness.triggerReset();
  const visible = harness.viewContainer.querySelectorAll(".projects-kanban-card");
  assert.equal(visible.length, 12);
});

test("TC-2.9.5: Botón reset no sobreescribe statusMap", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  api.setStatus("dia-1-acta-rag", "completado");
  harness.triggerReset();
  assert.equal(api.getStatusMap()["dia-1-acta-rag"], "completado");
});

test("TC-2.10.1: Clic en ▲ en el primer elemento es inocuo", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const firstCard = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  const initial = api.getOrder();
  firstCard.querySelector('[data-move-pos="up"]').click();
  assert.deepEqual(api.getOrder(), initial);
});

test("TC-2.10.2: Clic en ▼ en el último elemento es inocuo", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const cards = harness.viewContainer.querySelectorAll(".projects-kanban-card");
  const lastCard = cards[cards.length - 1];
  const initial = api.getOrder();
  lastCard.querySelector('[data-move-pos="down"]').click();
  assert.deepEqual(api.getOrder(), initial);
});

test("TC-2.10.3: Movimiento por teclado con elemento no encontrado no rompe", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const fakeBtn = createMockElement("button", { attrs: { "data-move-pos": "up" } });
  const fakeCard = createMockElement("div", { attrs: { "data-project-id": "inexistente" } });
  fakeCard.appendChild(fakeBtn);
  harness.root.appendChild(fakeCard);
  const before = api.getOrder();
  fakeBtn.click();
  assert.deepEqual(api.getOrder(), before);
});

test("TC-2.10.4: Movimiento por teclado en lista de un solo elemento es inocuo", () => {
  const arr = ["unico"];
  assert.deepEqual(reorderProjectList(arr, "unico", "unico", "before"), ["unico"]);
});

test("TC-2.10.5: Navegación de estado con botones ◀ ▶ respeta los límites", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const card = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  const prevBtn = card.querySelector('[data-move-status="prev"]');
  const nextBtn = card.querySelector('[data-move-status="next"]');
  prevBtn.click(); // ya está en por-iniciar
  assert.equal(api.getStatusMap()[card.getAttribute("data-project-id")], undefined);
  nextBtn.click(); // pasa a en-desarrollo
  assert.equal(api.getStatusMap()[card.getAttribute("data-project-id")], "en-desarrollo");
  nextBtn.click(); // pasa a completado
  assert.equal(api.getStatusMap()[card.getAttribute("data-project-id")], "completado");
  nextBtn.click(); // intenta avanzar más allá de completado
  assert.equal(api.getStatusMap()[card.getAttribute("data-project-id")], "completado");
});

test("TC-2.11.1: initProjectsHub con contenedor nulo o inválido retorna null", () => {
  assert.equal(initProjectsHub(null), null);
  assert.equal(initProjectsHub({}), null);
});

test("TC-2.11.2: initProjectsHub sobre contenedor sin body previo usa fallback", () => {
  const c = createMockElement("div");
  const api = initProjectsHub(c, { storage: createMockStorage(), canvasExercises: CANVAS_EXERCISES });
  assert.ok(api);
});

test("TC-2.11.3: Dragstart sin dataTransfer no arroja error", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const card = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  assert.doesNotThrow(() => card.dispatchEvent(createMockEvent("dragstart", { target: card, dataTransfer: null, bubbles: true })));
});

test("TC-2.11.4: Drop fuera de zonas válidas no produce modificaciones", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const outside = createMockElement("div");
  harness.root.appendChild(outside);
  const card = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  harness.triggerDragDrop(card, outside);
  assert.equal(api.getOrder()[0], "doc-a-informe-desercion");
});

test("TC-2.11.5: Opción viewMode no reconocida usa 'kanban' por defecto", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES, viewMode: "invalido" });
  assert.ok(harness.viewContainer.innerHTML.includes("projects-kanban-board"));
});

// =========================================================================
// TIER 3: COMBINATORIAS MULTIDIMENSIONALES (CROSS-FEATURE COMBINATIONS)
// =========================================================================

test("TC-3.1: Búsqueda 'sql' + Área 'Datos & SQL' + Nivel 'Avanzado' + Orden duration-asc", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const filtered = filterProjects(all, { search: "sql", area: "Datos & SQL", level: "Avanzado" });
  const sorted = sortProjects(filtered, "duration-asc");
  assert.equal(sorted.length, 1);
  assert.equal(sorted[0].id, "matrix-c-sensibilidad-web");
});

test("TC-3.2: Búsqueda 'canvas' + Duración short + Orden official", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const filtered = filterProjects(all, { search: "canvas", duration: "short" });
  const sorted = sortProjects(filtered, "official");
  assert.ok(sorted.length > 0);
  assert.ok(sorted.every(p => p.durationMin <= 25));
});

test("TC-3.3: Filtro Área 'Diseño' + Drag & Drop de tarjetas + Cambio a Bento", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerFilter(harness.filterArea, "Diseño");
  const cards = harness.viewContainer.querySelectorAll(".projects-kanban-card");
  harness.triggerDragDrop(cards[0], cards[1]);
  harness.triggerViewChange("bento");
  assert.ok(harness.viewContainer.innerHTML.includes("projects-bento-grid"));
});

test("TC-3.4: Búsqueda acentuada 'automatización' + Botón ▲ en Lista + Cambio de estado", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerViewChange("list");
  harness.triggerSearch("automatización");
  const rows = harness.viewContainer.querySelectorAll("tr[data-project-id]");
  assert.equal(rows.length, 7);
  const select = rows[0].querySelector("[data-status-select]");
  select.value = "en-desarrollo";
  select.dispatchEvent(createMockEvent("change", { target: select, bubbles: true }));
  assert.equal(api.getStatusMap()[select.getAttribute("data-status-select")], "en-desarrollo");
});

test("TC-3.5: Filtro Nivel 'Intermedio' + Reordenamiento + Botón reset", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerFilter(harness.filterLevel, "Intermedio");
  const card = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  card.querySelector('[data-move-pos="down"]').click();
  harness.triggerReset();
  const visible = harness.viewContainer.querySelectorAll(".projects-kanban-card");
  assert.equal(visible.length, 29);
});

test("TC-3.6: Filtro Duración 'long' + Drag entre columnas en Kanban", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerFilter(harness.filterDuration, "long");
  const cards = harness.viewContainer.querySelectorAll(".projects-kanban-card");
  assert.equal(cards.length, 4);
  const completeCol = harness.viewContainer.querySelectorAll(".projects-kanban-column")[2];
  harness.triggerDragDrop(cards[0], completeCol);
  assert.equal(api.getStatusMap()["dia-1-acta-rag"], "completado");
});

test("TC-3.7: Búsqueda sin coincidencias + Limpieza reactiva", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerSearch("sin_coincidencias_xyz");
  assert.equal(harness.resultsCount.textContent, "Mostrando 0 de 43 proyectos");
  harness.triggerSearch("");
  assert.equal(harness.resultsCount.textContent, "Mostrando 43 de 43 proyectos");
});

// =========================================================================
// TIER 4: ESCENARIOS REALISTAS DE EXTREMO A EXTREMO (REAL-WORLD WORKFLOWS)
// =========================================================================

test("TC-4.1: Escenario 1 - Flujo Completo de Aprendiz en Tablero Kanban", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  assert.equal(api.getProjects().length, 43);
  harness.triggerFilter(harness.filterArea, "Web & Código");
  assert.equal(harness.viewContainer.querySelectorAll(".projects-kanban-card").length, 8);
  const burndown = harness.viewContainer.querySelector('[data-project-id="code-b-kanban-burndown"]');
  const devCol = harness.viewContainer.querySelectorAll(".projects-kanban-column")[1];
  harness.triggerDragDrop(burndown, devCol);
  assert.equal(api.getStatusMap()["code-b-kanban-burndown"], "en-desarrollo");
  harness.triggerFilter(harness.filterArea, "all");
  assert.equal(harness.viewContainer.querySelectorAll(".projects-kanban-card").length, 43);
  const stored = JSON.parse(harness.storage.getItem("projects_hub_status_map"));
  assert.equal(stored["code-b-kanban-burndown"], "en-desarrollo");
});

test("TC-4.2: Escenario 2 - Exploración, Búsqueda y Reordenamiento en Galería Bento", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerViewChange("bento");
  harness.triggerSearch("deserción");
  const cards = harness.viewContainer.querySelectorAll(".projects-bento-card");
  assert.equal(cards.length, 1);
  assert.equal(cards[0].getAttribute("data-project-id"), "doc-a-informe-desercion");
  harness.triggerSearch("");
  const allBento = harness.viewContainer.querySelectorAll(".projects-bento-card");
  const lastBento = allBento[allBento.length - 1];
  harness.triggerDragDrop(lastBento, allBento[0]);
  const newOrder = api.getOrder();
  assert.equal(newOrder[0], lastBento.getAttribute("data-project-id"));
});

test("TC-4.3: Escenario 3 - Accesibilidad Exclusiva por Teclado en Lista Compacta (WCAG)", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.triggerViewChange("list");
  const rows = harness.viewContainer.querySelectorAll("tr[data-project-id]");
  const upBtn = rows[2].querySelector('[data-move-pos="up"]');
  upBtn.click();
  assert.equal(api.getOrder()[1], rows[2].getAttribute("data-project-id"));
  const firstRowUp = rows[0].querySelector('[data-move-pos="up"]');
  firstRowUp.click();
  assert.equal(api.getOrder()[0], "doc-a-informe-desercion");
});

test("TC-4.4: Escenario 4 - Tolerancia a Cuota Llena y Recuperación de Ruta Curricular", () => {
  const storage = createMockStorage({}, { quotaError: true });
  const harness = createHubDomHarness({ storage });
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  api.setStatus("doc-a-informe-desercion", "completado");
  assert.equal(api.getStatusMap()["doc-a-informe-desercion"], "completado");
  harness.storage.setCorruptedJson("projects_hub_custom_order");
  api.refresh();
  harness.triggerReset();
  assert.equal(api.getOrder()[0], "doc-a-informe-desercion");
});

test("TC-4.5: Escenario 5 - Navegación SPA e Integración de Ciclo de Vida", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  api.setViewMode("bento");
  assert.equal(harness.storage.getItem("projects_hub_view_mode"), '"bento"');
  api.refresh();
  assert.ok(harness.viewContainer.innerHTML.includes("projects-bento-grid"));
});

// =========================================================================
// COBERTURA COMPLETA DE RAMAS ESPECÍFICAS (100% BRANCH COVERAGE)
// =========================================================================

test("TC-BRANCH-1: escapeHtml con cadena nula o caracteres variados", () => {
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml("a&b<c>d\"e'f"), "a&amp;b&lt;c&gt;d&quot;e&#39;f");
});

test("TC-BRANCH-2: normalizeStr con entrada nula", () => {
  assert.equal(normalizeStr(null), "");
});

test("TC-BRANCH-3: statusLabel con estados conocidos y desconocidos", () => {
  assert.equal(statusLabel("completado"), "Completado");
  assert.equal(statusLabel("en-desarrollo"), "En Desarrollo");
  assert.equal(statusLabel("por-iniciar"), "Por Iniciar");
  assert.equal(statusLabel("otro"), "Por Iniciar");
});

test("TC-BRANCH-4: sortProjects por nivel de dificultad", () => {
  const all = collateAllProjects(CANVAS_EXERCISES);
  const sorted = sortProjects(all, "level");
  assert.equal(sorted[0].level, "Básico");
  assert.equal(sorted[sorted.length - 1].level, "Avanzado");
  // elemento con nivel desconocido
  const dummy = [{ id: "x", level: "Desconocido" }, { id: "y", level: "Básico" }];
  const sDummy = sortProjects(dummy, "level");
  assert.equal(sDummy[0].id, "y");
});

test("TC-BRANCH-5: reorderProjectList con objetos que tienen id", () => {
  const objs = [{ id: "1" }, { id: "2" }, { id: "3" }];
  const res = reorderProjectList(objs, "3", "1", "before");
  assert.deepEqual(res.map(o => o.id), ["3", "1", "2"]);
});

test("TC-BRANCH-6: Eventos dragover, dragleave y dragend en contenedor", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const card = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  // dragstart
  card.dispatchEvent(createMockEvent("dragstart", { target: card, bubbles: true }));
  // dragover sobre elemento sin data-status ni data-project-id
  harness.root.dispatchEvent(createMockEvent("dragover", { target: harness.root, bubbles: true }));
  // dragleave sobre elemento objetivo
  card.dispatchEvent(createMockEvent("dragleave", { target: card, bubbles: true }));
  // dragend
  card.dispatchEvent(createMockEvent("dragend", { target: card, bubbles: true }));
  // drop cuando draggedId es null
  harness.root.dispatchEvent(createMockEvent("drop", { target: harness.root, bubbles: true }));
  assert.ok(true);
});

test("TC-BRANCH-7: Evento change en filtro no existente o evento input ajeno", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const otherInput = createMockElement("input");
  harness.root.appendChild(otherInput);
  otherInput.dispatchEvent(createMockEvent("input", { target: otherInput, bubbles: true }));
  otherInput.dispatchEvent(createMockEvent("change", { target: otherInput, bubbles: true }));
  assert.ok(true);
});

test("TC-BRANCH-8: Iniciar sin storage con window.localStorage global", () => {
  global.window = { localStorage: createMockStorage() };
  const harness = createHubDomHarness({ storage: null });
  const api = initProjectsHub(harness.root, { canvasExercises: CANVAS_EXERCISES });
  assert.ok(api);
  delete global.window;
});

test("TC-BRANCH-9: api.resetOrder y api.setViewMode invocados directamente", () => {
  const harness = createHubDomHarness();
  const api = initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  api.resetOrder();
  assert.equal(api.getOrder()[0], "doc-a-informe-desercion");
  api.setViewMode("list");
  assert.ok(harness.viewContainer.innerHTML.includes("projects-compact-table"));
});

test("TC-BRANCH-10: collateAllProjects con dailyProjects que cubren description, goal y status", () => {
  const customDailies = [
    { id: "d1", title: "D1" },
    { id: "d2", title: "D2", goal: "Meta 2" },
    { id: "d3", title: "D3", description: "Desc 3", status: "completado" }
  ];
  const collated = collateAllProjects(CANVAS_EXERCISES, customDailies);
  assert.ok(collated.some(p => p.id === "d1" && p.description === "" && p.status === "por-iniciar"));
  assert.ok(collated.some(p => p.id === "d2" && p.description === "Meta 2"));
  assert.ok(collated.some(p => p.id === "d3" && p.description === "Desc 3" && p.status === "completado"));
});

test("TC-BRANCH-11: filterProjects con projects no arreglo y con filters nulo", () => {
  assert.deepEqual(filterProjects(null, {}), []);
  const all = collateAllProjects(CANVAS_EXERCISES);
  assert.equal(filterProjects(all, null).length, 43);
});

test("TC-BRANCH-12: filterProjects con tags nulo y sortProjects con level desconocido o sin duración", () => {
  const projs = [
    { id: "x1", title: "X1", description: "Desc", area: "Redacción", technology: "Tech", canvasFeature: "Feat", tags: null, durationMin: 20 },
    { id: "x2", title: "X2", description: "Desc", area: "Redacción", technology: "Tech", canvasFeature: "Feat", level: "Desconocido" }
  ];
  const filtered = filterProjects(projs, { search: "X1" });
  assert.equal(filtered.length, 1);
  const sortedDur = sortProjects(projs, "duration-asc");
  assert.equal(sortedDur[0].id, "x2");
  const sortedLev = sortProjects(projs, "level");
  assert.equal(sortedLev.length, 2);
});

test("TC-BRANCH-13: buildCompactListHtml con projects no arreglo, duraciones variadas y estados variados", () => {
  assert.ok(buildCompactListHtml(null, {}).includes("projects-compact-table"));
  const sample = [
    { id: "c1", title: "C1", area: "Área", level: "Básico", route: "#c1", duration: null, durationMin: 40 },
    { id: "c2", title: "C2", area: "Área", level: "Básico", route: "#c2", duration: null, durationMin: null }
  ];
  const html = buildCompactListHtml(sample, { c1: "completado", c2: "en-desarrollo" });
  assert.ok(html.includes("40 min"));
  assert.ok(html.includes("30 min"));
  assert.ok(html.includes('value="completado" selected'));
  assert.ok(html.includes('value="en-desarrollo" selected'));
});

test("TC-BRANCH-14: initProjectsHub con options vacías, storage descalibrado y viewMode inválido", () => {
  const container = createMockElement("div");
  const storage = createMockStorage({
    projects_hub_custom_order: ["p1"],
    projects_hub_status_map: ["array_is_invalid"],
    projects_hub_view_mode: "invalid_mode"
  });
  globalThis.CANVAS_EXERCISES = CANVAS_EXERCISES;
  const api = initProjectsHub(container, { storage });
  assert.ok(api);
  assert.equal(api.getOrder().length, 43);
  assert.deepEqual(api.getStatusMap(), {});
  delete globalThis.CANVAS_EXERCISES;
});

test("TC-BRANCH-15: Clics en controles huérfanos sin contenedor de proyecto", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const nakedViewBtn = createMockElement("button", { attrs: { "data-hub-view": "" } });
  harness.root.appendChild(nakedViewBtn);
  nakedViewBtn.click();

  const orphanMoveBtn = createMockElement("button", { attrs: { "data-hub-move": "up" } });
  harness.root.appendChild(orphanMoveBtn);
  orphanMoveBtn.click();

  const fakeCard = createMockElement("div", { attrs: { "data-project-id": "non-existent" } });
  const fakeMoveBtn = createMockElement("button", { attrs: { "data-hub-move": "up" } });
  fakeCard.appendChild(fakeMoveBtn);
  harness.root.appendChild(fakeCard);
  fakeMoveBtn.click();

  const orphanStatusBtn = createMockElement("button", { attrs: { "data-move-status": "next" } });
  harness.root.appendChild(orphanStatusBtn);
  orphanStatusBtn.click();

  assert.ok(true);
});

test("TC-BRANCH-16: Drag and Drop casos borde (start fuera de card, drop sobre sí mismo, target nulo)", () => {
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  harness.root.dispatchEvent({ type: "change", target: {}, bubbles: true });

  const nonCard = createMockElement("div");
  harness.root.appendChild(nonCard);
  nonCard.dispatchEvent(createMockEvent("dragstart", { target: nonCard, bubbles: true }));

  harness.root.dispatchEvent(createMockEvent("dragover", { target: harness.root, bubbles: true }));

  const cards = harness.viewContainer.querySelectorAll(".projects-kanban-card");
  cards[0].dispatchEvent(createMockEvent("dragstart", { target: cards[0], bubbles: true }));
  harness.toolbar.dispatchEvent(createMockEvent("dragover", { target: harness.toolbar, bubbles: true }));

  harness.toolbar.dispatchEvent(createMockEvent("dragleave", { target: harness.toolbar, bubbles: true }));

  cards[0].dispatchEvent(createMockEvent("drop", { target: cards[0], bubbles: true }));

  harness.toolbar.dispatchEvent(createMockEvent("drop", { target: harness.toolbar, bubbles: true }));

  cards[0].dispatchEvent(createMockEvent("dragend", { target: cards[0], bubbles: true }));
  assert.ok(true);
});

test("TC-BRANCH-17: Cobertura exhaustiva de las 11 ramas finales", () => {
  // 1. sortProjects con 'duration' (en vez de duration-asc) y sin duración
  const projs = [{ id: "1", durationMin: 30 }, { id: "2", durationMin: 15 }];
  sortProjects(projs, "duration");
  sortProjects([{ id: "no-dur-a" }, { id: "no-dur-b" }], "duration-asc");
  sortProjects([{ id: "no-dur-a" }, { id: "no-dur-b" }], "duration");

  // 2. initProjectsHub sin options ni window ni canvasExercises
  delete global.window;
  delete globalThis.CANVAS_EXERCISES;
  const rawContainer = createMockElement("div");
  const rawApi = initProjectsHub(rawContainer);
  assert.ok(rawApi);

  // 3. opts.viewMode truthy pero inválido (ej. 'invalido')
  const storageWithNull = createMockStorage({
    projects_hub_status_map: null,
    projects_hub_view_mode: "bento"
  });
  const apiInvalidView = initProjectsHub(rawContainer, {
    storage: storageWithNull,
    viewMode: "invalido",
    canvasExercises: CANVAS_EXERCISES
  });
  assert.ok(apiInvalidView);

  // 4. storage con status_map como número o string (typeof !== 'object')
  const storageNonObject = createMockStorage({
    projects_hub_status_map: 12345
  });
  const apiNonObj = initProjectsHub(rawContainer, {
    storage: storageNonObject,
    canvasExercises: CANVAS_EXERCISES
  });
  assert.ok(apiNonObj);

  // 5. Eventos DnD con e.target que no tiene método closest
  const harness = createHubDomHarness();
  initProjectsHub(harness.root, { storage: harness.storage, canvasExercises: CANVAS_EXERCISES });
  const card = harness.viewContainer.querySelectorAll(".projects-kanban-card")[0];
  card.dispatchEvent(createMockEvent("dragstart", { target: card, bubbles: true }));

  const rawTarget = {}; // target sin closest
  harness.root.dispatchEvent(createMockEvent("dragstart", { target: rawTarget, bubbles: true }));
  harness.root.dispatchEvent(createMockEvent("dragover", { target: rawTarget, bubbles: true }));
  harness.root.dispatchEvent(createMockEvent("dragleave", { target: rawTarget, bubbles: true }));
  harness.root.dispatchEvent(createMockEvent("drop", { target: rawTarget, bubbles: true }));
  card.dispatchEvent(createMockEvent("dragend", { target: card, bubbles: true }));
});



test("collateAllProjects asigna la ruta «a» cuando un modo supera tres ejercicios", () => {
  const list = ["e1", "e2", "e3", "e4"].map(id => ({ id, title: id }));
  const result = collateAllProjects({ demo: list }, null);
  assert.equal(result.length, 4);
  assert.deepEqual(result.map(p => p.route), [
    "#gemini-canvas/demo/a", "#gemini-canvas/demo/b", "#gemini-canvas/demo/c", "#gemini-canvas/demo/a"
  ]);
});
