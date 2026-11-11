// Pruebas unitarias y de integración de arrastrar y soltar columnas (node:test).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  getStoredOrder,
  saveStoredOrder,
  reorderIds,
  applyContainerOrder,
  buildDragHandleHtml,
  initColumnDnD
} = require(path.join(__dirname, "..", "js", "canvas-column-dnd.js"));

test("getStoredOrder lee de storage y valida contra los identificadores conocidos", () => {
  const valid = ["col-a", "col-b"];
  const memStore = { "test-order": JSON.stringify(["col-b", "col-a"]) };
  const mockStorage = {
    getItem(k) { return memStore[k] || null; },
    setItem(k, v) { memStore[k] = v; }
  };

  assert.deepEqual(getStoredOrder(mockStorage, "test-order", valid), ["col-b", "col-a"]);
  assert.deepEqual(getStoredOrder(mockStorage, "non-existent", valid), valid, "usa fallback si no existe");

  memStore["corrupt"] = "not-json";
  assert.deepEqual(getStoredOrder(mockStorage, "corrupt", valid), valid, "usa fallback ante JSON corrupto");

  memStore["mismatch"] = JSON.stringify(["col-x", "col-y"]);
  assert.deepEqual(getStoredOrder(mockStorage, "mismatch", valid), valid, "usa fallback si los IDs no coinciden");

  memStore["diff-len"] = JSON.stringify(["col-a"]);
  assert.deepEqual(getStoredOrder(mockStorage, "diff-len", valid), valid, "usa fallback si la longitud difiere");

  memStore["not-arr"] = JSON.stringify({ a: 1 });
  assert.deepEqual(getStoredOrder(mockStorage, "not-arr", valid), valid, "usa fallback si no es arreglo");

  assert.deepEqual(getStoredOrder(null, "any", valid), valid, "soporta storage nulo");
  assert.deepEqual(getStoredOrder({}, "any", null), [], "soporta fallback nulo");
});

test("saveStoredOrder guarda orden validado en storage de forma segura", () => {
  let stored = null;
  const mockStorage = {
    setItem(k, v) { stored = v; }
  };

  saveStoredOrder(mockStorage, "my-key", ["col-1", "col-2"]);
  assert.equal(stored, JSON.stringify(["col-1", "col-2"]));

  // No debe lanzar error con storage nulo o defectuoso
  assert.doesNotThrow(() => saveStoredOrder(null, "key", ["a"]));
  assert.doesNotThrow(() => saveStoredOrder(mockStorage, "key", "no-array"));
  const throwingStorage = {
    setItem() { throw new Error("QuotaExceeded"); }
  };
  assert.doesNotThrow(() => saveStoredOrder(throwingStorage, "key", ["a"]));
});

test("reorderIds mueve un elemento antes o después de otro de forma inmutable", () => {
  const original = ["col-1", "col-2", "col-3"];

  // Mover col-3 antes de col-1 (hacia arriba)
  const up = reorderIds(original, "col-3", "col-1", "before");
  assert.deepEqual(up, ["col-3", "col-1", "col-2"]);

  // Mover col-1 después de col-3 (hacia abajo)
  const down = reorderIds(original, "col-1", "col-3", "after");
  assert.deepEqual(down, ["col-2", "col-3", "col-1"]);

  // Si no se encuentra origen o destino, devuelve una copia sin cambios
  assert.deepEqual(reorderIds(original, "inexistente", "col-2", "before"), original);
  assert.deepEqual(reorderIds(original, "col-1", "inexistente", "before"), original);
  assert.deepEqual(reorderIds(original, "col-1", "col-1", "before"), original);
  assert.deepEqual(reorderIds(null, "col-1", "col-2", "before"), []);
});

test("applyContainerOrder reordena hijos del contenedor según el arreglo de identificadores", () => {
  const children = [
    { id: "col-1", parent: null },
    { id: "col-2", parent: null },
    { id: "col-3", parent: null }
  ];
  const container = {
    children: [...children],
    querySelector(sel) {
      const id = sel.replace(/^#/, "");
      return this.children.find(c => c.id === id) || null;
    },
    appendChild(child) {
      const idx = this.children.indexOf(child);
      if (idx >= 0) this.children.splice(idx, 1);
      this.children.push(child);
    }
  };

  applyContainerOrder(container, ["col-3", "col-1", "col-2"]);
  assert.deepEqual(container.children.map(c => c.id), ["col-3", "col-1", "col-2"]);

  // Soporta contenedor nulo o selector que no encuentra
  assert.doesNotThrow(() => applyContainerOrder(null, ["a"]));
  assert.doesNotThrow(() => applyContainerOrder({ querySelector() { return null; } }, ["a"]));
});

test("buildDragHandleHtml genera marcado accesible con icono y botones de teclado", () => {
  const html = buildDragHandleHtml("Salida 2: Interacción & Refinamiento");
  assert.match(html, /class="canvas-col-drag-handle"/);
  assert.match(html, /draggable="true"/);
  assert.match(html, /aria-label="Arrastrar para organizar: Salida 2: Interacción &amp; Refinamiento"/);
  assert.match(html, /data-col-move="up"/);
  assert.match(html, /data-col-move="down"/);

  const emptyHtml = buildDragHandleHtml(null);
  assert.match(emptyHtml, /aria-label="Arrastrar para organizar: "/);
});

test("initColumnDnD enlaza eventos y permite reordenar con teclado y ratón", () => {
  const listeners = {};
  function makeMockCol(id) {
    return {
      id,
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      setAttribute(k, v) { this[k] = v; },
      removeAttribute(k) { delete this[k]; },
      addEventListener(evt, fn) { listeners[this.id + ":" + evt] = fn; }
    };
  }

  const mockChat = makeMockCol("canvas-output-refinement");
  const mockEditor = makeMockCol("canvas-output-primary");

  const containerChildren = [mockChat, mockEditor];
  const container = {
    id: "canvas-split-container",
    children: containerChildren,
    querySelectorAll() { return [mockChat, mockEditor]; },
    querySelector(sel) {
      const id = sel.replace(/^#/, "");
      return containerChildren.find(c => c.id === id) || null;
    },
    appendChild(child) {
      const idx = containerChildren.indexOf(child);
      if (idx >= 0) containerChildren.splice(idx, 1);
      containerChildren.push(child);
    }
  };

  let savedStorage = {};
  const mockStorage = {
    getItem(k) { return savedStorage[k] || null; },
    setItem(k, v) { savedStorage[k] = v; }
  };

  let notifiedOrder = null;
  const api = initColumnDnD(container, {
    storage: mockStorage,
    storageKey: "test_split_order",
    columns: [mockChat, mockEditor],
    onReorder(o) { notifiedOrder = o; }
  });

  assert.ok(api);
  assert.deepEqual(api.getOrder(), ["canvas-output-refinement", "canvas-output-primary"]);

  // Mover columna hacia arriba cuando ya está arriba: no cambia nada
  api.moveColumn("canvas-output-refinement", "up");
  assert.deepEqual(api.getOrder(), ["canvas-output-refinement", "canvas-output-primary"]);

  // Mover columna inexistente: no cambia nada
  api.moveColumn("no-existe", "up");
  assert.deepEqual(api.getOrder(), ["canvas-output-refinement", "canvas-output-primary"]);

  // Mover la columna primaria arriba usando la API
  api.moveColumn("canvas-output-primary", "up");
  assert.deepEqual(api.getOrder(), ["canvas-output-primary", "canvas-output-refinement"]);
  assert.deepEqual(notifiedOrder, ["canvas-output-primary", "canvas-output-refinement"]);

  // Mover hacia abajo cuando ya está abajo: no cambia nada
  api.moveColumn("canvas-output-refinement", "down");
  assert.deepEqual(api.getOrder(), ["canvas-output-primary", "canvas-output-refinement"]);

  // Mover la columna primaria abajo
  api.moveColumn("canvas-output-primary", "down");
  assert.deepEqual(api.getOrder(), ["canvas-output-refinement", "canvas-output-primary"]);

  // Reset restablece el orden original
  api.moveColumn("canvas-output-primary", "up");
  api.reset();
  assert.deepEqual(api.getOrder(), ["canvas-output-refinement", "canvas-output-primary"]);

  // Simular evento dragover y drop
  const mockDataTransfer = {
    data: {},
    setData(k, v) { this.data[k] = v; },
    getData(k) { return this.data[k]; },
    effectAllowed: "move",
    dropEffect: "move"
  };

  // dragover sin haber iniciado dragstart: no hace nada
  const earlyOverFn = listeners["canvas-output-refinement:dragover"];
  earlyOverFn({});

  // dragstart en mockEditor
  const dragStartFn = listeners["canvas-output-primary:dragstart"];
  dragStartFn({ dataTransfer: mockDataTransfer });

  // dragover sobre sí mismo: no hace nada
  const selfOverFn = listeners["canvas-output-primary:dragover"];
  selfOverFn({ preventDefault() {} });

  // dragover en mockChat
  const dragOverFn = listeners["canvas-output-refinement:dragover"];
  dragOverFn({ preventDefault() {}, dataTransfer: mockDataTransfer });
  assert.ok(mockChat.classList.contains("is-drop-target"));

  // dragleave en mockChat
  const dragLeaveFn = listeners["canvas-output-refinement:dragleave"];
  dragLeaveFn();
  assert.ok(!mockChat.classList.contains("is-drop-target"));

  // dragover de nuevo
  dragOverFn({ preventDefault() {}, dataTransfer: mockDataTransfer });

  // drop sobre sí mismo: no hace nada
  const selfDropFn = listeners["canvas-output-primary:drop"];
  selfDropFn({ preventDefault() {}, stopPropagation() {}, dataTransfer: mockDataTransfer });

  // drop sin sourceId
  selfDropFn({ preventDefault() {}, stopPropagation() {}, dataTransfer: { getData() { return ""; } } });

  // dragend
  const dragEndFn = listeners["canvas-output-primary:dragend"];
  dragEndFn();

  // drop cuando draggedId es null y transferId trae el id
  const dropWithTransferOnly = listeners["canvas-output-refinement:drop"];
  dropWithTransferOnly({
    preventDefault() {},
    stopPropagation() {},
    dataTransfer: { getData() { return "canvas-output-primary"; } }
  });

  // dragstart sin dataTransfer
  dragStartFn({});

  // dragover sin dataTransfer y sin preventDefault
  dragOverFn({});

  // drop sin dataTransfer y sin draggedId
  selfDropFn({});

  // drop en mockChat desde mockEditor
  const dropFn = listeners["canvas-output-refinement:drop"];
  dropFn({
    preventDefault() {},
    stopPropagation() {},
    dataTransfer: mockDataTransfer
  });
  assert.deepEqual(api.getOrder(), ["canvas-output-primary", "canvas-output-refinement"]);

  // dragend final
  dragEndFn();
  dragEndFn();

  // Comprobar manejo seguro ante container nulo o sin children
  assert.equal(initColumnDnD(null), null);
  assert.ok(initColumnDnD({ querySelectorAll() { return []; }, querySelector() { return null; }, children: null }));

  // Comprobar inicialización con window.localStorage global disponible
  global.window = { localStorage: mockStorage };
  const winApi = initColumnDnD(container, { columns: [mockChat, mockEditor] });
  assert.ok(winApi);
  delete global.window;

  // Comprobar inicialización por defecto (sin options, sin ID)
  const defaultContainer = {
    children: [makeMockCol("c1"), makeMockCol("c2")],
    querySelectorAll() { return this.children; },
    querySelector(sel) { return this.children.find(c => "#" + c.id === sel) || null; },
    appendChild() {}
  };
  const defaultApi = initColumnDnD(defaultContainer);
  assert.ok(defaultApi);
});
