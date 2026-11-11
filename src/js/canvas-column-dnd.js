// Soporte de reorganización de columnas arrastrando (Drag & Drop) y por teclado (WCAG).
// Funciones puras e inicializador ligero para el contenedor split de Gemini Canvas.

function getStoredOrder(storage, key, fallbackIds) {
  const safeFallback = Array.isArray(fallbackIds) ? [...fallbackIds] : [];
  if (!storage || typeof storage.getItem !== "function") return safeFallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return safeFallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== safeFallback.length) return safeFallback;
    const hasAll = safeFallback.every(id => parsed.includes(id));
    return hasAll ? parsed : safeFallback;
  } catch (_) {
    return safeFallback;
  }
}

function saveStoredOrder(storage, key, order) {
  if (!storage || typeof storage.setItem !== "function" || !Array.isArray(order)) return;
  try {
    storage.setItem(key, JSON.stringify(order));
  } catch (_) {
    // QuotaExceeded o modo incógnito restringido; no interrumpe el flujo.
  }
}

function reorderIds(order, fromId, toId, position) {
  const list = Array.isArray(order) ? [...order] : [];
  const fromIdx = list.indexOf(fromId);
  const toIdx = list.indexOf(toId);
  if (fromIdx < 0 || toIdx < 0 || fromId === toId) return list;
  list.splice(fromIdx, 1);
  const newToIdx = list.indexOf(toId);
  const insertIdx = position === "after" ? newToIdx + 1 : newToIdx;
  list.splice(insertIdx, 0, fromId);
  return list;
}

function applyContainerOrder(container, order) {
  if (!container || !Array.isArray(order) || typeof container.querySelector !== "function") return;
  order.forEach(id => {
    const el = container.querySelector("#" + id);
    if (el && typeof container.appendChild === "function") {
      container.appendChild(el);
    }
  });
}

function escapeHandleLabel(label) {
  return String(label || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildDragHandleHtml(label) {
  const safe = escapeHandleLabel(label);
  return `<div class="canvas-col-drag-handle" draggable="true" role="toolbar" aria-label="Arrastrar para organizar: ${safe}" title="Arrastra de arriba a abajo para organizar las columnas">` +
    `<span class="drag-grip" aria-hidden="true">⋮⋮</span>` +
    `<span class="drag-label">Reorganizar</span>` +
    `<div class="drag-btn-group" role="group" aria-label="Reordenar columna">` +
      `<button type="button" class="btn-col-move" data-col-move="up" title="Mover columna hacia arriba" aria-label="Subir ${safe}">▲</button>` +
      `<button type="button" class="btn-col-move" data-col-move="down" title="Mover columna hacia abajo" aria-label="Bajar ${safe}">▼</button>` +
    `</div>` +
  `</div>`;
}

function initColumnDnD(container, options) {
  if (!container || typeof container.querySelectorAll !== "function") return null;
  const opts = options || {};
  const storage = opts.storage !== undefined ? opts.storage : (typeof window !== "undefined" ? window.localStorage : null);
  const containerId = container.id || "split";
  const storageKey = opts.storageKey || "canvas_column_order_" + containerId;
  const columnElements = Array.isArray(opts.columns) ? opts.columns : Array.from(container.children || []);
  const initialIds = columnElements.map(c => c.id).filter(Boolean);

  let currentOrder = getStoredOrder(storage, storageKey, initialIds);
  applyContainerOrder(container, currentOrder);

  let draggedId = null;

  function updateOrder(newOrder) {
    currentOrder = newOrder;
    applyContainerOrder(container, currentOrder);
    saveStoredOrder(storage, storageKey, currentOrder);
    if (typeof opts.onReorder === "function") opts.onReorder(currentOrder);
  }

  function move(colId, direction) {
    const idx = currentOrder.indexOf(colId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;
    const targetId = currentOrder[targetIdx];
    const pos = direction === "up" ? "before" : "after";
    updateOrder(reorderIds(currentOrder, colId, targetId, pos));
  }

  columnElements.forEach(col => {
    col.setAttribute("draggable", "true");

    col.addEventListener("dragstart", e => {
      draggedId = col.id;
      if (col.classList && typeof col.classList.add === "function") {
        col.classList.add("is-col-dragging");
      }
      if (e && e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", col.id);
      }
    });

    col.addEventListener("dragover", e => {
      if (!draggedId || draggedId === col.id) return;
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      if (e && e.dataTransfer) e.dataTransfer.dropEffect = "move";
      if (col.classList && typeof col.classList.add === "function") {
        col.classList.add("is-drop-target");
      }
    });

    col.addEventListener("dragleave", () => {
      if (col.classList && typeof col.classList.remove === "function") {
        col.classList.remove("is-drop-target");
      }
    });

    col.addEventListener("drop", e => {
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      if (e && typeof e.stopPropagation === "function") e.stopPropagation();
      if (col.classList && typeof col.classList.remove === "function") {
        col.classList.remove("is-drop-target");
      }
      const transferId = e && e.dataTransfer && typeof e.dataTransfer.getData === "function" ? e.dataTransfer.getData("text/plain") : null;
      const sourceId = draggedId || transferId;
      if (!sourceId || sourceId === col.id) return;
      updateOrder(reorderIds(currentOrder, sourceId, col.id, "before"));
    });

    col.addEventListener("dragend", () => {
      draggedId = null;
      columnElements.forEach(c => {
        if (c.classList && typeof c.classList.remove === "function") {
          c.classList.remove("is-col-dragging");
          c.classList.remove("is-drop-target");
        }
      });
    });
  });

  return {
    getOrder() { return [...currentOrder]; },
    moveColumn(colId, dir) { move(colId, dir); },
    reset() { updateOrder([...initialIds]); }
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getStoredOrder,
    saveStoredOrder,
    reorderIds,
    applyContainerOrder,
    buildDragHandleHtml,
    initColumnDnD
  };
}
