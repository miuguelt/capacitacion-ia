/* ==========================================================================
   MATRIZ DE COBERTURA Y FRONTERAS DE EJECUCIÓN — GEMINI CANVAS
   Clasifica dónde ocurre cada paso (En Canvas, En Gemini sin Canvas, Fuera de
   Gemini, En esta guía) y audita las 25 capacidades verificadas del módulo.
   ========================================================================== */

const CANVAS_STEP_PLACES = {
    canvas: {
        id: "canvas",
        icon: "🟢",
        label: "En Canvas",
        summary: "Acción directa dentro del lienzo lateral o su vista previa."
    },
    gemini: {
        id: "gemini",
        icon: "🟡",
        label: "En Gemini sin Canvas",
        summary: "Se ejecuta en el chat general, Deep Research o el gestor de Gems."
    },
    external: {
        id: "external",
        icon: "🟠",
        label: "Fuera de Gemini",
        summary: "Ocurre al abrir o exportar a Documentos, Presentaciones o Google Colab."
    },
    portal: {
        id: "portal",
        icon: "🔵",
        label: "En esta guía",
        summary: "Comprobación del entregable con la lista de verificación del portal."
    }
};

const CANVAS_EXTRA_CAPABILITIES = [
    {
        id: "study-cards",
        name: "Crear → Tarjetas de estudio (Flashcards)",
        status: "por-confirmar",
        detail: "Aparece en algunas cuentas educativas dentro del menú «Crear» junto a Cuestionario; si tu cuenta la muestra, úsala para repasar conceptos clave."
    },
    {
        id: "google-classroom",
        name: "Anexar en Google Classroom",
        status: "condicional",
        detail: "Disponible únicamente en cuentas institucionales Google Workspace for Education con Classroom habilitado por el administrador."
    },
    {
        id: "mobile-canvas",
        name: "Canvas en la aplicación móvil de Gemini",
        status: "informativa",
        detail: "En dispositivos móviles puedes abrir, leer y compartir lienzos existentes, pero la edición lateral y «Seleccionar y preguntar» están diseñados para navegador de escritorio."
    }
];

const CANVAS_VISION_STAGES = [
    {
        id: "stage-inputs",
        step: "Etapa 1",
        title: "Entradas y Fuentes de Contexto",
        summary: "Lo que entregas a Gemini antes de abrir o alimentar el lienzo: prompt estructurado CRTT+L, archivos adjuntos (CSV/PDF), fotos de bocetos o pizarras, informes de Deep Research o un Gem personalizado.",
        capabilityIds: ["doc-create", "file-input", "image-input", "deep-research", "gems"]
    },
    {
        id: "stage-canvas-core",
        step: "Etapa 2",
        title: "Co-creación e Iteración en el Lienzo",
        summary: "Edición quirúrgica sin perder lo que ya funciona: selección con cursor, sugerencias de edición, ajuste de longitud y tono, vista previa en vivo, seleccionar y preguntar, consola de errores, historial de versiones y fórmulas LaTeX.",
        capabilityIds: ["inline-edit", "suggest-edits", "manual-edit", "length-tone", "code-preview", "select-ask", "console-fix", "versions", "latex"]
    },
    {
        id: "stage-transforms",
        step: "Etapa 3",
        title: "Transformación Multipropósito («Crear»)",
        summary: "Un mismo artefacto validado en Canvas se transforma con un clic en página web interactiva, infografía ejecutiva, cuestionario de autoevaluación, resumen en audio dialogado o aplicación con funciones de Gemini.",
        capabilityIds: ["create-webpage", "create-infographic", "create-quiz", "create-audio", "gemini-in-app"]
    },
    {
        id: "stage-governance",
        step: "Etapa 4",
        title: "Salida, Gobernanza y Portafolio de Evidencias",
        summary: "Verificación con lista de chequeo V.E.R.A. y salida limpia hacia Documentos de Google, Presentaciones de Google, cuadernos de Colab, archivo PDF o enlace compartido con «Copiar Canvas».",
        capabilityIds: ["export-docs", "create-slides", "export-colab", "export-pdf", "share", "copy-canvas"]
    }
];

function escapeCoverageHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function summarizeStepPlaces(exercise) {
    const counts = { canvas: 0, gemini: 0, external: 0, portal: 0 };
    const rawPlaces = Array.isArray(exercise?.places) ? exercise.places : [];
    for (const raw of rawPlaces) {
        const key = CANVAS_STEP_PLACES[raw] ? raw : "canvas";
        counts[key] += 1;
    }
    const total = rawPlaces.length;
    const placesUsed = Object.keys(counts).filter((k) => counts[k] > 0);
    return {
        total,
        counts,
        onlyCanvas: total > 0 && counts.canvas > 0 && counts.gemini === 0 && counts.external === 0,
        requiresCanvas: counts.canvas > 0,
        placesUsed
    };
}

function buildStepPlaceBadge(place) {
    const meta = CANVAS_STEP_PLACES[place] || CANVAS_STEP_PLACES.canvas;
    const e = escapeCoverageHtml;
    return `<span class="canvas-step-place canvas-step-place--${e(meta.id)}" title="${e(meta.summary)}">${e(meta.icon)} ${e(meta.label)}</span>`;
}

function buildExerciseScopeTag(exercise) {
    const summary = summarizeStepPlaces(exercise);
    const e = escapeCoverageHtml;
    if (summary.onlyCanvas) {
        return `<span class="canvas-scope-tag canvas-scope-tag--pure" title="Todos los pasos en Gemini se ejecutan dentro del lienzo de Canvas.">🟢 100 % en Canvas (${summary.counts.canvas}/${summary.total} pasos en lienzo)</span>`;
    }
    if (summary.counts.external > 0) {
        return `<span class="canvas-scope-tag canvas-scope-tag--mixed" title="Empieza en Canvas y termina exportando a una aplicación externa de Google.">🟠 Exportación externa (${summary.counts.canvas} en Canvas · ${summary.counts.external} fuera de Gemini)</span>`;
    }
    return `<span class="canvas-scope-tag canvas-scope-tag--mixed" title="Combina pasos dentro del lienzo con el chat general, Deep Research o el gestor de Gems.">🟡 Combina chat/Gems y Canvas (${summary.counts.canvas} en Canvas · ${summary.counts.gemini} en Gemini)</span>`;
}

function buildCoverageMatrix(exercisesByMode, capabilities) {
    if (!exercisesByMode || !capabilities) return [];
    const entries = [];
    for (const [mode, list] of Object.entries(exercisesByMode)) {
        const items = Array.isArray(list) ? list : [];
        items.forEach((ex, idx) => {
            if (!ex) return;
            const code = ex.code || ex.id;
            const slot = ["a", "b", "c"][idx] || "a";
            entries.push({ ex, code, href: `#gemini-canvas/${mode}/${slot}` });
        });
    }
    return Object.entries(capabilities).map(([id, cap]) => {
        const matched = entries.filter(
            (item) => Array.isArray(item.ex.capabilities) && item.ex.capabilities.includes(id)
        );
        const exerciseIds = matched.map((item) => item.code);
        const exerciseLinks = matched.map((item) => ({ code: item.code, href: item.href }));
        return {
            id,
            name: cap.name,
            how: cap.how,
            exerciseIds,
            exerciseLinks,
            count: exerciseIds.length,
            covered: exerciseIds.length > 0
        };
    });
}

function listUncoveredCapabilities(matrix) {
    if (!Array.isArray(matrix)) return [];
    return matrix.filter((row) => !row.covered).map((row) => row.id);
}

function buildCompleteVisionSummaryHtml(exercisesByMode, capabilities, completedIds) {
    const e = escapeCoverageHtml;
    const doneSet = new Set(Array.isArray(completedIds) ? completedIds : []);
    const allEx = Object.values(exercisesByMode || {}).flatMap((list) => (Array.isArray(list) ? list : [])).filter(Boolean);
    const totalEx = allEx.length;
    const doneEx = allEx.filter((ex) => doneSet.has(ex.id)).length;
    const practicedCapSet = new Set(
        allEx.filter((ex) => doneSet.has(ex.id)).flatMap((ex) => (Array.isArray(ex.capabilities) ? ex.capabilities : []))
    );
    const totalCaps = Object.keys(capabilities || {}).length;
    const practicedCaps = Object.keys(capabilities || {}).filter((id) => practicedCapSet.has(id)).length;

    const stagesHtml = CANVAS_VISION_STAGES.map((st) => {
        const chips = st.capabilityIds
            .filter((cid) => capabilities && capabilities[cid])
            .map((cid) => {
                const isDone = practicedCapSet.has(cid);
                return `<span class="vision-cap-chip${isDone ? " is-practiced" : ""}">${isDone ? "✓ " : ""}${e(capabilities[cid].name)}</span>`;
            })
            .join("");
        return `<article class="canvas-vision-stage-card" data-vision-stage="${e(st.id)}">
            <div class="vision-stage-head">
                <span class="vision-stage-badge">${e(st.step)}</span>
                <h4>${e(st.title)}</h4>
            </div>
            <p>${e(st.summary)}</p>
            <div class="vision-stage-chips">${chips}</div>
        </article>`;
    }).join("");

    const masteryBanner = totalEx > 0 && doneEx === totalEx
        ? `<div class="canvas-vision-mastery-banner" data-vision-mastery="complete">🏆 <strong>¡Visión Completa 360° alcanzada!</strong> Completaste los ${totalEx} ejercicios y practicaste las ${totalCaps} capacidades oficiales de Gemini Canvas.</div>`
        : `<div class="canvas-vision-mastery-banner" data-vision-mastery="progress">🧭 <strong>Tu avance hacia la Visión Completa 360°:</strong> ${doneEx} de ${totalEx} ejercicios completados · ${practicedCaps} de ${totalCaps} capacidades oficiales practicadas por ti.</div>`;

    return `<section class="canvas-vision-360-panel" id="canvas-vision-360-panel" aria-label="Mapa de visión completa 360 grados de Gemini Canvas">
        ${masteryBanner}
        <div class="canvas-vision-stages-grid">${stagesHtml}</div>
    </section>`;
}

function buildCoverageTableHtml(exercisesByMode, capabilities, extras, completedIds) {
    const e = escapeCoverageHtml;
    const matrix = buildCoverageMatrix(exercisesByMode, capabilities);
    const coveredCount = matrix.filter((item) => item.covered).length;
    const totalExercises = Object.values(exercisesByMode || {}).reduce((n, list) => n + (Array.isArray(list) ? list.length : 0), 0);
    const extraList = Array.isArray(extras) ? extras : CANVAS_EXTRA_CAPABILITIES;
    const visionHtml = buildCompleteVisionSummaryHtml(exercisesByMode, capabilities, completedIds);

    const placeLegend = Object.values(CANVAS_STEP_PLACES)
        .map(
            (p) =>
                `<div class="canvas-place-legend-item"><span class="canvas-step-place canvas-step-place--${e(p.id)}">${e(p.icon)} ${e(p.label)}</span><p>${e(p.summary)}</p></div>`
        )
        .join("");

    const rowsHtml = matrix
        .map((row, idx) => {
            const badges = row.covered
                ? row.exerciseLinks
                      .map(
                          (link) =>
                              `<a href="${e(link.href)}" class="canvas-cap-code-pill" title="Ir al ejercicio ${e(link.code)}">${e(link.code)}</a>`
                      )
                      .join(" ")
                : `<span class="canvas-cap-code-empty">Sin asignar</span>`;
            return `<tr>
                <td>${idx + 1}</td>
                <td><strong>${e(row.name)}</strong></td>
                <td>${e(row.how)}</td>
                <td><div class="canvas-cap-code-list">${badges}</div></td>
            </tr>`;
        })
        .join("");

    const extrasHtml = extraList
        .map(
            (item) => `<article class="canvas-extra-cap-card">
                <div class="canvas-extra-cap-head">
                    <strong>${e(item.name)}</strong>
                    <span class="canvas-extra-status canvas-extra-status--${e(item.status)}">${e(item.status)}</span>
                </div>
                <p>${e(item.detail)}</p>
            </article>`
        )
        .join("");

    return `${visionHtml}
    <div class="canvas-coverage-summary">
        <div class="canvas-coverage-kpi">
            <strong>${coveredCount}/${matrix.length}</strong>
            <span>Capacidades oficiales practicadas en los ${totalExercises} ejercicios</span>
        </div>
        <div class="canvas-place-legend">${placeLegend}</div>
    </div>
    <div class="canvas-coverage-table-wrap">
        <table class="canvas-coverage-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Capacidad de Gemini Canvas</th>
                    <th>Cómo se utiliza</th>
                    <th>Ejercicios donde se practica</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    </div>
    <div class="canvas-extra-caps-block">
        <h4>Funciones condicionales o informativas según tipo de cuenta y dispositivo</h4>
        <div class="canvas-extra-caps-grid">${extrasHtml}</div>
    </div>`;
}

if (typeof globalThis !== "undefined") {
    globalThis.CANVAS_STEP_PLACES = CANVAS_STEP_PLACES;
    globalThis.CANVAS_EXTRA_CAPABILITIES = CANVAS_EXTRA_CAPABILITIES;
    globalThis.CANVAS_VISION_STAGES = CANVAS_VISION_STAGES;
    globalThis.escapeCoverageHtml = escapeCoverageHtml;
    globalThis.summarizeStepPlaces = summarizeStepPlaces;
    globalThis.buildStepPlaceBadge = buildStepPlaceBadge;
    globalThis.buildExerciseScopeTag = buildExerciseScopeTag;
    globalThis.buildCoverageMatrix = buildCoverageMatrix;
    globalThis.listUncoveredCapabilities = listUncoveredCapabilities;
    globalThis.buildCompleteVisionSummaryHtml = buildCompleteVisionSummaryHtml;
    globalThis.buildCoverageTableHtml = buildCoverageTableHtml;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        CANVAS_STEP_PLACES,
        CANVAS_EXTRA_CAPABILITIES,
        CANVAS_VISION_STAGES,
        escapeCoverageHtml,
        summarizeStepPlaces,
        buildStepPlaceBadge,
        buildExerciseScopeTag,
        buildCoverageMatrix,
        listUncoveredCapabilities,
        buildCompleteVisionSummaryHtml,
        buildCoverageTableHtml
    };
}
