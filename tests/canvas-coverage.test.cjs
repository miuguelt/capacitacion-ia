const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const coverage = require("../js/canvas-coverage.js");
const exercisesMod = require("../js/canvas-exercises.js");

test("CANVAS_STEP_PLACES define los 4 lugares verificables y CANVAS_EXTRA_CAPABILITIES las 2 fronteras", () => {
    assert.deepEqual(Object.keys(coverage.CANVAS_STEP_PLACES), ["canvas", "gemini", "external", "portal"]);
    for (const [key, item] of Object.entries(coverage.CANVAS_STEP_PLACES)) {
        assert.equal(item.id, key);
        assert.ok(item.icon.length > 0);
        assert.ok(item.label.length > 0);
        assert.ok(item.summary.length > 0);
    }
    assert.equal(coverage.CANVAS_EXTRA_CAPABILITIES.length, 2);
    const statuses = coverage.CANVAS_EXTRA_CAPABILITIES.map((c) => c.status);
    assert.deepEqual(statuses, ["condicional", "informativa"]);
});

test("escapeCoverageHtml y buildStepPlaceBadge manejan entradas normales, nulas y desconocidas", () => {
    assert.equal(coverage.escapeCoverageHtml(null), "");
    assert.equal(coverage.escapeCoverageHtml(undefined), "");
    assert.equal(coverage.escapeCoverageHtml("<a&\"'>"), "&lt;a&amp;&quot;&#39;&gt;");

    const badgeCanvas = coverage.buildStepPlaceBadge("canvas");
    assert.match(badgeCanvas, /canvas-step-place--canvas/);
    assert.match(badgeCanvas, /En Canvas/);

    const badgeFallback = coverage.buildStepPlaceBadge("inexistente");
    assert.match(badgeFallback, /canvas-step-place--canvas/);
    assert.match(badgeFallback, /En Canvas/);
});

test("summarizeStepPlaces y buildExerciseScopeTag distinguen ejercicios 100 % Canvas de ejercicios mixtos y vacíos", () => {
    const emptySummary = coverage.summarizeStepPlaces(null);
    assert.equal(emptySummary.total, 0);
    assert.equal(emptySummary.onlyCanvas, false);
    assert.equal(emptySummary.requiresCanvas, false);
    assert.deepEqual(emptySummary.placesUsed, []);

    const invalidPlaceSummary = coverage.summarizeStepPlaces({ places: ["desconocido", "canvas", "portal"] });
    assert.equal(invalidPlaceSummary.total, 3);
    assert.equal(invalidPlaceSummary.counts.canvas, 2);
    assert.equal(invalidPlaceSummary.counts.portal, 1);
    assert.equal(invalidPlaceSummary.onlyCanvas, true);
    assert.equal(invalidPlaceSummary.requiresCanvas, true);

    const pureScope = coverage.buildExerciseScopeTag({ places: ["canvas", "canvas", "portal"] });
    assert.match(pureScope, /canvas-scope-tag--pure/);
    assert.match(pureScope, /100 % en Canvas/);

    const externalScope = coverage.buildExerciseScopeTag({ places: ["canvas", "external", "portal"] });
    assert.match(externalScope, /canvas-scope-tag--mixed/);
    assert.match(externalScope, /Exportación externa/);

    const geminiScope = coverage.buildExerciseScopeTag({ places: ["gemini", "canvas", "portal"] });
    assert.match(geminiScope, /canvas-scope-tag--mixed/);
    assert.match(geminiScope, /Combina chat\/Gems y Canvas/);
});

test("Los 39 ejercicios declaran places alineados con steps, outsideCanvas claro y cubren las 28 capacidades", () => {
    const allExercises = Object.values(exercisesMod.CANVAS_EXERCISES).flat();
    assert.equal(allExercises.length, 39);

    for (const ex of allExercises) {
        assert.ok(Array.isArray(ex.places), `${ex.id} debe incluir arreglo places`);
        assert.equal(ex.places.length, ex.steps.length, `${ex.id} debe tener tantos places como steps`);
        for (const place of ex.places) {
            assert.ok(coverage.CANVAS_STEP_PLACES[place], `${ex.id} usa place inválido: ${place}`);
        }
        assert.equal(ex.places.at(-1), "portal", `${ex.id} debe cerrar su último paso en 'portal'`);
        assert.equal(typeof ex.outsideCanvas, "string", `${ex.id} debe declarar outsideCanvas`);
        assert.ok(ex.outsideCanvas.trim().length >= 30, `${ex.id} debe explicar qué ocurre fuera de Canvas`);
    }

    const capKeys = Object.keys(exercisesMod.CANVAS_CAPABILITIES);
    assert.equal(capKeys.length, 28);
    for (const required of ["select-ask", "versions", "manual-edit", "file-input", "deep-research"]) {
        assert.ok(exercisesMod.CANVAS_CAPABILITIES[required], `Falta capacidad ${required}`);
    }

    const matrix = coverage.buildCoverageMatrix(exercisesMod.CANVAS_EXERCISES, exercisesMod.CANVAS_CAPABILITIES);
    assert.equal(matrix.length, 28);
    assert.deepEqual(coverage.listUncoveredCapabilities(matrix), []);

    const emptyMatrix = coverage.buildCoverageMatrix(null, null);
    assert.deepEqual(emptyMatrix, []);
    assert.deepEqual(coverage.listUncoveredCapabilities(null), []);

    const partialMatrix = coverage.buildCoverageMatrix(
        { doc: [null, { code: "1A", capabilities: ["activate"] }, { id: "sin-caps" }], brokenMode: null },
        {
            activate: { name: "Activar", how: "Botón" },
            missing: { name: "Faltante", how: "N/A" }
        }
    );
    assert.deepEqual(coverage.listUncoveredCapabilities(partialMatrix), ["missing"]);
    assert.deepEqual(partialMatrix[0].exerciseLinks, [{ code: "1A", href: "#gemini-canvas/doc/b" }]);
});

test("buildCoverageTableHtml renderiza la matriz verificable con enlaces profundos, leyenda de lugares y fronteras condicionales", () => {
    const html = coverage.buildCoverageTableHtml(
        exercisesMod.CANVAS_EXERCISES,
        exercisesMod.CANVAS_CAPABILITIES,
        coverage.CANVAS_EXTRA_CAPABILITIES
    );
    assert.match(html, /canvas-coverage-summary/);
    assert.match(html, /28\/28/);
    assert.match(html, /Seleccionar y preguntar en la vista previa/);
    assert.match(html, /De Deep Research a Canvas/);
    assert.match(html, /Tarjetas de estudio/);
    assert.match(html, /Google Classroom/);
    assert.match(html, /<a href="#gemini-canvas\/doc-editorial\/a" class="canvas-cap-code-pill"/);
    assert.match(html, /<a href="#gemini-canvas\/executive-report\/a" class="canvas-cap-code-pill"/);

    const ex5A = exercisesMod.CANVAS_EXERCISES["visual-mockup"][0];
    assert.doesNotMatch(ex5A.steps.join(" "), /Muestra cómo se ve a 390 px/);
    assert.match(ex5A.steps[4], /conmutador Vista móvil \(390 px\)/);

    const ex9B = exercisesMod.CANVAS_EXERCISES["sql-pipeline"][1];
    assert.doesNotMatch(ex9B.steps.join(" "), /Agrega una prueba por cada formato admitido/);
    assert.match(ex9B.steps[2], /Pyodide[\s\S]*sqlite3/);
    assert.match(ex9B.steps[5], /CREATE OR REPLACE FUNCTION/);

    const ex11A = exercisesMod.CANVAS_EXERCISES["multimodal-vision"][0];
    const ex11B = exercisesMod.CANVAS_EXERCISES["multimodal-vision"][1];
    assert.equal(ex11A.places[0], "gemini");
    assert.equal(ex11B.places[0], "gemini");
    assert.match(coverage.buildExerciseScopeTag(ex11A), /Combina chat\/Gems y Canvas/);

    const fallbackHtml = coverage.buildCoverageTableHtml(
        { doc: [{ id: "1A", capabilities: ["testCap"] }] },
        {
            testCap: { name: "Capacidad cubierta", how: "Uso directo" },
            uncoveredCap: { name: "Capacidad pendiente", how: "Sin ejercicio" }
        },
        null
    );
    assert.match(fallbackHtml, /1\/2/);
    assert.match(fallbackHtml, /Sin asignar/);
});

test("El archivo de práctica mesa_ayuda_2026.csv existe y contiene las filas del caso 10A", () => {
    const csvPath = path.join(__dirname, "..", "materiales", "gemini_canvas", "mesa_ayuda_2026.csv");
    assert.ok(fs.existsSync(csvPath), "Debe existir materiales/gemini_canvas/mesa_ayuda_2026.csv");
    const content = fs.readFileSync(csvPath, "utf8");
    assert.match(content, /Seccion,Mes_o_Categoria,Abiertos_o_Casos/);
    assert.match(content, /Mensual,Jul,160,140,22,3\.8/);
    assert.match(content, /Categoria_Octubre,Acceso y contraseñas,45/);
    assert.doesNotMatch(content, /contrasenas|tecnico|autenticacion/, "el CSV conserva las tildes");
});

test("buildCoverageMatrix y buildCoverageTableHtml cubren índices >= 3 y entradas nulas", () => {
    const matrix = coverage.buildCoverageMatrix(
        {
            doc: [
                { id: "d1", capabilities: [] },
                { id: "d2", capabilities: [] },
                { id: "d3", capabilities: [] },
                { id: "d4", capabilities: ["capA"] }
            ]
        },
        { capA: { name: "Cap A", how: "Uso" } }
    );
    assert.deepEqual(matrix[0].exerciseLinks, [{ code: "d4", href: "#gemini-canvas/doc/a" }]);

    const htmlNull = coverage.buildCoverageTableHtml(null, null, null);
    assert.match(htmlNull, /0\/0/);

    const htmlBrokenList = coverage.buildCoverageTableHtml({ broken: null }, {}, null);
    assert.match(htmlBrokenList, /en los 0 ejercicios/);
});

test("CANVAS_VISION_STAGES y buildCompleteVisionSummaryHtml cubren las 28 capacidades en 4 etapas y calculan el dominio 360", () => {
    assert.equal(coverage.CANVAS_VISION_STAGES.length, 4);
    const stageCaps = coverage.CANVAS_VISION_STAGES.flatMap((s) => s.capabilityIds);
    assert.deepEqual([...stageCaps].sort(), Object.keys(exercisesMod.CANVAS_CAPABILITIES).sort());

    const partialHtml = coverage.buildCompleteVisionSummaryHtml(
        exercisesMod.CANVAS_EXERCISES,
        exercisesMod.CANVAS_CAPABILITIES,
        ["doc-a-informe-desercion"]
    );
    assert.match(partialHtml, /data-vision-mastery="progress"/);
    assert.match(partialHtml, /1 de 39 ejercicios completados/);
    assert.match(partialHtml, /is-practiced/);

    const allIds = Object.values(exercisesMod.CANVAS_EXERCISES).flat().map((ex) => ex.id);
    const completeHtml = coverage.buildCompleteVisionSummaryHtml(
        exercisesMod.CANVAS_EXERCISES,
        exercisesMod.CANVAS_CAPABILITIES,
        allIds
    );
    assert.match(completeHtml, /data-vision-mastery="complete"/);
    assert.match(completeHtml, /Recorrido completo/);

    const nullHtml = coverage.buildCompleteVisionSummaryHtml(null, null, null);
    assert.match(nullHtml, /0 de 0 ejercicios completados/);
});

test("buildCompleteVisionSummaryHtml tolera ejercicios completados sin lista de capacidades", () => {
    const html = coverage.buildCompleteVisionSummaryHtml(
        { demo: [{ id: "sin-capacidades" }, { id: "con-capacidades", capabilities: ["no-existe"] }] },
        {},
        ["sin-capacidades", "con-capacidades"]
    );
    assert.match(html, /Completaste los 2 ejercicios y practicaste las 0 funciones/);
});
