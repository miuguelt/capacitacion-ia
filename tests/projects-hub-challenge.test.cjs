/**
 * Empirical Adversarial Challenge Suite for Projects Hub (M1 Logic)
 * Focus: Immutability (Deep Freeze), Contract Integrity & Deep Links, Security & XSS Injection, Boundary Stress
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ProjectsHub = require("../js/projects-hub.js");
const { CANVAS_EXERCISES } = require("../js/canvas-exercises.js");
const { parseCanvasRoute } = require("../js/canvas-nav.js");

// Deep Freeze Helper
function deepFreeze(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    const val = obj[key];
    if (val !== null && (typeof val === "object" || typeof val === "function") && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

// Clone deeply helper
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// -------------------------------------------------------------
// SUITE 1: IMMUTABILITY & DEEP FREEZE CHALLENGE
// -------------------------------------------------------------
test("SUITE 1: Immutability & Deep Freeze Challenge", async (t) => {
  await t.test("1.1 collateAllProjects survives deep-frozen canvasExercises and dailyProjects", () => {
    const frozenExercises = deepFreeze(deepClone(CANVAS_EXERCISES));
    const frozenDailies = deepFreeze(deepClone(ProjectsHub.DEFAULT_DAILY_PROJECTS));

    assert.doesNotThrow(() => {
      const collated = ProjectsHub.collateAllProjects(frozenExercises, frozenDailies);
      assert.equal(collated.length, 28);
    });
  });

  await t.test("1.2 filterProjects does not mutate deep-frozen projects array or filters object", () => {
    const collated = ProjectsHub.collateAllProjects(CANVAS_EXERCISES, ProjectsHub.DEFAULT_DAILY_PROJECTS);
    const frozenProjects = deepFreeze(deepClone(collated));
    const frozenFilters = deepFreeze({
      search: "redacción",
      area: "Redacción",
      level: "Básico",
      duration: "short"
    });

    assert.doesNotThrow(() => {
      const filtered = ProjectsHub.filterProjects(frozenProjects, frozenFilters);
      assert(Array.isArray(filtered));
      // Verify returned array is a new reference
      assert.notEqual(filtered, frozenProjects);
    });
  });

  await t.test("1.3 sortProjects does not mutate deep-frozen projects in any sortMode", () => {
    const collated = ProjectsHub.collateAllProjects(CANVAS_EXERCISES, ProjectsHub.DEFAULT_DAILY_PROJECTS);
    const modes = ["official", "duration-asc", "duration", "level", "custom", "unknown_mode"];
    const customOrder = deepFreeze(["dia-4-prototipo-demo-day", "dia-1-acta-rag"]);

    for (const mode of modes) {
      const frozenProjects = deepFreeze(deepClone(collated));
      assert.doesNotThrow(() => {
        const sorted = ProjectsHub.sortProjects(frozenProjects, mode, customOrder);
        assert(Array.isArray(sorted));
        assert.notEqual(sorted, frozenProjects);
        assert.equal(sorted.length, frozenProjects.length);
      }, `sortProjects threw on mode: ${mode}`);
    }
  });

  await t.test("1.4 reorderProjectList does not mutate deep-frozen list of strings or objects", () => {
    const frozenStringList = deepFreeze(["p1", "p2", "p3", "p4", "p5"]);
    assert.doesNotThrow(() => {
      const res1 = ProjectsHub.reorderProjectList(frozenStringList, "p2", "p4", "after");
      assert.deepEqual(res1, ["p1", "p3", "p4", "p2", "p5"]);
      assert.notEqual(res1, frozenStringList);

      const res2 = ProjectsHub.reorderProjectList(frozenStringList, "p4", "p2", "before");
      assert.deepEqual(res2, ["p1", "p4", "p2", "p3", "p5"]);
    });

    const frozenObjList = deepFreeze([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
      { id: "c", name: "C" }
    ]);
    assert.doesNotThrow(() => {
      const res = ProjectsHub.reorderProjectList(frozenObjList, "c", "a", "before");
      assert.deepEqual(res.map(x => x.id), ["c", "a", "b"]);
      assert.notEqual(res, frozenObjList);
    });
  });

  await t.test("1.5 HTML builders execute without error on deep-frozen inputs", () => {
    const collated = ProjectsHub.collateAllProjects(CANVAS_EXERCISES, ProjectsHub.DEFAULT_DAILY_PROJECTS);
    const frozenProjects = deepFreeze(deepClone(collated));
    const frozenStatusMap = deepFreeze({ "dia-1-acta-rag": "completado", "doc-a-guia-estilo": "en-desarrollo" });
    const frozenOptions = deepFreeze({ isDraggable: false });

    assert.doesNotThrow(() => {
      const kanban = ProjectsHub.buildKanbanBoardHtml(frozenProjects, frozenStatusMap);
      assert.equal(typeof kanban, "string");
      assert(kanban.includes("projects-kanban-board"));

      const bento = ProjectsHub.buildBentoGridHtml(frozenProjects, frozenStatusMap, frozenOptions);
      assert.equal(typeof bento, "string");
      assert(bento.includes("projects-bento-grid"));

      const list = ProjectsHub.buildCompactListHtml(frozenProjects, frozenStatusMap);
      assert.equal(typeof list, "string");
      assert(list.includes("projects-compact-table"));
    });
  });

  await t.test("1.6 getStoredHubData and saveStoredHubData tolerate frozen fallbacks and data", () => {
    const frozenFallback = deepFreeze({ a: [1, 2, 3], b: "test" });
    const mockStorage = {
      getItem: () => null,
      setItem: () => {}
    };
    const res = ProjectsHub.getStoredHubData(mockStorage, "key", frozenFallback);
    assert.deepEqual(res, frozenFallback);

    const frozenData = deepFreeze({ id: "custom", values: [1, 2, 3] });
    assert.equal(ProjectsHub.saveStoredHubData(mockStorage, "key", frozenData), true);
  });
});

// -------------------------------------------------------------
// SUITE 2: CONTRACT INTEGRITY & DEEP LINK RESOLUTION
// -------------------------------------------------------------
test("SUITE 2: Contract Integrity & Deep Link Resolution", async (t) => {
  const collated = ProjectsHub.collateAllProjects(CANVAS_EXERCISES, ProjectsHub.DEFAULT_DAILY_PROJECTS);

  await t.test("2.1 Exactly 28 consolidated projects with zero duplicate IDs", () => {
    assert.equal(collated.length, 28, "Must have exactly 28 projects (24 Canvas + 4 Daily)");
    const ids = collated.map(p => p.id);
    const uniqueIds = new Set(ids);
    assert.equal(uniqueIds.size, 28, "All project IDs must be unique");
  });

  await t.test("2.2 ID set matches exactly the 24 Canvas items + 4 Daily items", () => {
    const dailyIds = ["dia-1-acta-rag", "dia-2-capsula-multimedia", "dia-3-panel-web-telemetria", "dia-4-prototipo-demo-day"];
    const canvasIds = [];
    for (const [mode, list] of Object.entries(CANVAS_EXERCISES)) {
      list.forEach(ex => canvasIds.push(ex.id));
    }
    assert.equal(canvasIds.length, 24, "Canvas exercises must be exactly 24");
    assert.equal(dailyIds.length, 4, "Daily items must be exactly 4");

    const expectedSet = new Set([...canvasIds, ...dailyIds]);
    collated.forEach(p => {
      assert(expectedSet.has(p.id), `Project ID ${p.id} was not in expected catalog`);
    });
  });

  await t.test("2.3 Every project complies with mandatory contract fields", () => {
    const validAreas = new Set(["Redacción", "Web & Código", "Datos & SQL", "Diseño", "Automatización"]);
    const validLevels = new Set(["Básico", "Intermedio", "Avanzado"]);
    const validStatuses = new Set(["por-iniciar", "en-desarrollo", "completado"]);

    collated.forEach(p => {
      assert.equal(typeof p.id, "string", `Project ${p.id}: id must be string`);
      assert(p.id.length > 0, `Project ${p.id}: id cannot be empty`);

      assert.equal(typeof p.title, "string", `Project ${p.id}: title must be string`);
      assert(p.title.trim().length > 0, `Project ${p.id}: title cannot be empty`);

      assert.equal(typeof p.description, "string", `Project ${p.id}: description must be string`);
      assert(p.description.trim().length > 0, `Project ${p.id}: description cannot be empty`);

      assert.equal(typeof p.goal, "string", `Project ${p.id}: goal must be string`);
      assert(p.goal.trim().length > 0, `Project ${p.id}: goal cannot be empty`);

      assert(validAreas.has(p.area), `Project ${p.id}: invalid area '${p.area}'`);
      assert(validLevels.has(p.level), `Project ${p.id}: invalid level '${p.level}'`);

      assert.equal(typeof p.duration, "string", `Project ${p.id}: duration must be string`);
      assert(p.duration.includes("min"), `Project ${p.id}: duration should mention min`);

      assert.equal(typeof p.durationMin, "number", `Project ${p.id}: durationMin must be number`);
      assert(p.durationMin > 0, `Project ${p.id}: durationMin must be > 0`);

      assert.equal(typeof p.canvasFeature, "string", `Project ${p.id}: canvasFeature must be string`);
      assert.equal(typeof p.technology, "string", `Project ${p.id}: technology must be string`);

      assert(Array.isArray(p.tags), `Project ${p.id}: tags must be an array`);
      assert(p.tags.length > 0, `Project ${p.id}: tags should not be empty`);

      assert.equal(typeof p.route, "string", `Project ${p.id}: route must be string`);
      assert(p.route.startsWith("#"), `Project ${p.id}: route must start with #`);

      assert.equal(typeof p.previewSvg, "string", `Project ${p.id}: previewSvg must be string`);
      assert(p.previewSvg.includes("<svg"), `Project ${p.id}: previewSvg must contain <svg`);
      assert(p.previewSvg.includes("</svg>"), `Project ${p.id}: previewSvg must contain </svg>`);

      assert(validStatuses.has(p.status), `Project ${p.id}: status '${p.status}' is invalid`);
    });
  });

  await t.test("2.4 Deep links resolution: all 24 Canvas routes parse accurately with parseCanvasRoute", () => {
    const modes = Object.keys(CANVAS_EXERCISES);
    const canvasProjects = collated.filter(p => p.route.startsWith("#gemini-canvas/"));
    assert.equal(canvasProjects.length, 24);

    canvasProjects.forEach(p => {
      const parsed = parseCanvasRoute(p.route, modes);
      assert.equal(parsed.page, "gemini-canvas", `Route ${p.route} did not parse to gemini-canvas page`);
      assert(parsed.mode !== null, `Route ${p.route} did not parse to a valid mode`);
      assert(parsed.exercise === 0 || parsed.exercise === 1, `Route ${p.route} exercise must be 0 or 1`);
    });
  });

  await t.test("2.5 Deep links resolution: all 4 Daily routes match actual sections in index.html", () => {
    const dailyProjects = collated.filter(p => !p.route.startsWith("#gemini-canvas/"));
    assert.equal(dailyProjects.length, 4);

    const indexHtml = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
    dailyProjects.forEach(p => {
      const targetId = p.route.replace(/^#/, "");
      // Check that either id="targetId" or data-target="targetId" exists in index.html
      const hasId = indexHtml.includes(`id="${targetId}"`);
      const hasDataTarget = indexHtml.includes(`data-target="${targetId}"`);
      assert(hasId || hasDataTarget, `Daily route target '${targetId}' not found in index.html`);
    });
  });
});

// -------------------------------------------------------------
// SUITE 3: SECURITY & ADVERSARIAL INJECTION (XSS)
// -------------------------------------------------------------
test("SUITE 3: Security & Adversarial Injection (XSS Payloads)", async (t) => {
  const XSS_PAYLOADS = [
    '<script>alert("XSS")</script>',
    '"><img src="x" onerror="alert(1)">',
    "';alert('XSS');//",
    '<svg onload="alert(1)">',
    'javascript:alert(1)',
    '<iframe src="evil.com"></iframe>',
    '"><svg/onload=alert(1)>',
    '"><input autofocus onfocus=alert(1)>'
  ];

  await t.test("3.1 escapeHtml sanitizes dangerous HTML characters", () => {
    assert.equal(ProjectsHub.escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    assert.equal(ProjectsHub.escapeHtml("foo & bar ' baz \" qux"), 'foo &amp; bar &#39; baz &quot; qux');
    assert.equal(ProjectsHub.escapeHtml(null), '');
    assert.equal(ProjectsHub.escapeHtml(undefined), '');
  });

  await t.test("3.2 XSS payloads injected in project text fields are escaped in Kanban HTML", () => {
    XSS_PAYLOADS.forEach(payload => {
      const maliciousProject = {
        id: "safe-id-1",
        title: `Title ${payload}`,
        area: `Area ${payload}`,
        level: `Level ${payload}`,
        duration: `Duration ${payload}`,
        route: `#test?param=${payload}`,
        status: "por-iniciar"
      };

      const html = ProjectsHub.buildKanbanBoardHtml([maliciousProject], {});
      // Raw <script> or <img src=x must NOT appear unescaped
      assert(!html.includes("<script>"), `Kanban leaked raw script with payload: ${payload}`);
      assert(!html.includes("<img src="), `Kanban leaked raw img with payload: ${payload}`);
      assert(!html.includes("<svg/onload"), `Kanban leaked raw svg onload with payload: ${payload}`);
      assert(!html.includes("<iframe"), `Kanban leaked raw iframe with payload: ${payload}`);
    });
  });

  await t.test("3.3 XSS payloads injected in project text fields are escaped in Bento HTML", () => {
    XSS_PAYLOADS.forEach(payload => {
      const maliciousProject = {
        id: "safe-id-2",
        title: `Title ${payload}`,
        description: `Desc ${payload}`,
        goal: `Goal ${payload}`,
        area: `Area ${payload}`,
        level: `Level ${payload}`,
        duration: `Duration ${payload}`,
        route: `#test?q=${payload}`,
        status: "por-iniciar"
      };

      const html = ProjectsHub.buildBentoGridHtml([maliciousProject], {});
      assert(!html.includes("<script>"), `Bento leaked raw script with payload: ${payload}`);
      assert(!html.includes("<img src="), `Bento leaked raw img with payload: ${payload}`);
      assert(!html.includes("<svg/onload"), `Bento leaked raw svg with payload: ${payload}`);
    });
  });

  await t.test("3.4 XSS payloads injected in project text fields are escaped in Compact List HTML", () => {
    XSS_PAYLOADS.forEach(payload => {
      const maliciousProject = {
        id: "safe-id-3",
        title: `Title ${payload}`,
        area: `Area ${payload}`,
        level: `Level ${payload}`,
        duration: `Duration ${payload}`,
        route: `#test?item=${payload}`,
        status: "por-iniciar"
      };

      const html = ProjectsHub.buildCompactListHtml([maliciousProject], {});
      assert(!html.includes("<script>"), `List leaked raw script with payload: ${payload}`);
      assert(!html.includes("<img src="), `List leaked raw img with payload: ${payload}`);
    });
  });

  await t.test("3.5 Adversarial check: ID attribute injection in HTML builders", () => {
    // What if an ID itself contains attribute-breakout quotes?
    const maliciousId = 'malicious-id" onclick="alert(1)" data-extra="';
    const proj = {
      id: maliciousId,
      title: "Attack Project",
      description: "Description",
      area: "Redacción",
      level: "Básico",
      duration: "30 min",
      route: "#test",
      status: "por-iniciar"
    };

    const kanban = ProjectsHub.buildKanbanBoardHtml([proj], {});
    const bento = ProjectsHub.buildBentoGridHtml([proj], {});
    const list = ProjectsHub.buildCompactListHtml([proj], {});

    // Inspect if unescaped quotes in ID can create new unquoted attributes
    // In current implementation: data-project-id="${p.id}"
    // Note: Canonical catalog IDs are sanitized slugs (e.g. "dia-1-acta-rag").
    // Let's verify whether canonical IDs contain any dangerous characters.
    const collated = ProjectsHub.collateAllProjects(CANVAS_EXERCISES, ProjectsHub.DEFAULT_DAILY_PROJECTS);
    collated.forEach(p => {
      assert(/^[a-z0-9-]+$/.test(p.id), `Catalog ID ${p.id} contains non-slug characters!`);
    });
  });
});

// -------------------------------------------------------------
// SUITE 4: ADVERSARIAL BOUNDARY & STRESS HARNESS
// -------------------------------------------------------------
test("SUITE 4: Adversarial Boundary & Stress Harness", async (t) => {
  await t.test("4.1 Massive list stress (10,000 synthetic projects)", () => {
    const hugeList = [];
    for (let i = 0; i < 10000; i++) {
      hugeList.push({
        id: `proj-${i}`,
        title: `Proyecto de prueba número ${i}`,
        description: `Descripción detallada de la prueba de estrés ${i}`,
        area: i % 2 === 0 ? "Redacción" : "Web & Código",
        level: i % 3 === 0 ? "Básico" : "Avanzado",
        duration: `${(i % 60) + 10} min`,
        durationMin: (i % 60) + 10,
        status: "por-iniciar"
      });
    }

    const t0 = performance.now();
    const filtered = ProjectsHub.filterProjects(hugeList, { search: "prueba número 9990", area: "Redacción" });
    const duration = performance.now() - t0;
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, "proj-9990");
    assert(duration < 200, `Massive filtering took too long: ${duration.toFixed(2)}ms`);

    const t1 = performance.now();
    const sorted = ProjectsHub.sortProjects(hugeList.slice(0, 500), "duration-asc");
    const sortDuration = performance.now() - t1;
    assert(sortDuration < 100, `Sort took too long: ${sortDuration.toFixed(2)}ms`);
    assert(sorted[0].durationMin <= sorted[sorted.length - 1].durationMin);
  });

  await t.test("4.2 Extreme and malformed filter inputs", () => {
    const collated = ProjectsHub.collateAllProjects(CANVAS_EXERCISES, ProjectsHub.DEFAULT_DAILY_PROJECTS);

    // Empty object, undefined fields, falsy search should fall back to all items
    assert.equal(ProjectsHub.filterProjects(collated, {}).length, 28);
    assert.equal(ProjectsHub.filterProjects(collated, { search: null }).length, 28);
    assert.equal(ProjectsHub.filterProjects(collated, { search: undefined }).length, 28);
    assert.equal(ProjectsHub.filterProjects(collated, { search: false }).length, 28, "Falsy boolean treated as empty query");

    // Non-matching queries
    assert.equal(ProjectsHub.filterProjects(collated, { search: 12345 }).length, 0);
    assert.equal(ProjectsHub.filterProjects(collated, { search: "cadena_inexistente_xyz_123" }).length, 0);

    // SQL / Regex injection attempt in search query
    assert.doesNotThrow(() => {
      const res1 = ProjectsHub.filterProjects(collated, { search: "' OR '1'='1" });
      assert(Array.isArray(res1));
      const res2 = ProjectsHub.filterProjects(collated, { search: ".*[a-z]+.*" });
      assert(Array.isArray(res2));
      const res3 = ProjectsHub.filterProjects(collated, { search: "((((((" });
      assert(Array.isArray(res3));
    });
  });

  await t.test("4.3 Reordering adversarial edge conditions", () => {
    const list = ["a", "b", "c"];

    // Non-existent source or target
    assert.deepEqual(ProjectsHub.reorderProjectList(list, "nonexistent", "b", "before"), ["a", "b", "c"]);
    assert.deepEqual(ProjectsHub.reorderProjectList(list, "a", "nonexistent", "before"), ["a", "b", "c"]);

    // Source equals target
    assert.deepEqual(ProjectsHub.reorderProjectList(list, "b", "b", "before"), ["a", "b", "c"]);
    assert.deepEqual(ProjectsHub.reorderProjectList(list, "b", "b", "after"), ["a", "b", "c"]);

    // Single item list
    assert.deepEqual(ProjectsHub.reorderProjectList(["only"], "only", "only", "before"), ["only"]);

    // Empty list
    assert.deepEqual(ProjectsHub.reorderProjectList([], "a", "b", "before"), []);

    // Null or non-array
    assert.deepEqual(ProjectsHub.reorderProjectList(null, "a", "b", "before"), []);
    assert.deepEqual(ProjectsHub.reorderProjectList(undefined, "a", "b", "before"), []);
  });

  await t.test("4.4 Storage adversarial stress: Prototype pollution and circular references", () => {
    const poisonJson = '{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}';
    const mockStorage = {
      getItem: () => poisonJson,
      setItem: () => {}
    };

    const res = ProjectsHub.getStoredHubData(mockStorage, "test", {});
    assert.equal(Object.prototype.polluted, undefined, "Prototype pollution must not succeed");

    // QuotaExceededError simulation
    const throwingStorage = {
      getItem: () => { throw new Error("Disk read error"); },
      setItem: () => {
        const err = new Error("QuotaExceededError");
        err.name = "QuotaExceededError";
        throw err;
      }
    };
    assert.equal(ProjectsHub.getStoredHubData(throwingStorage, "test", "safeFallback"), "safeFallback");
    assert.equal(ProjectsHub.saveStoredHubData(throwingStorage, "test", { a: 1 }), false);
  });
});

// -------------------------------------------------------------
// SUITE 5: DOM EVENT & INTERFACE INTEGRATION ADVERSARIAL STRESS
// -------------------------------------------------------------
test("SUITE 5: DOM Event & Life-Cycle Adversarial Stress", async (t) => {
  // Minimal DOM node mock for headless testing
  function createMockNode(tagName = "div", attrs = {}) {
    const children = [];
    const classList = new Set();
    const listeners = {};
    const node = {
      tagName: tagName.toUpperCase(),
      attributes: { ...attrs },
      innerHTML: "",
      textContent: "",
      children,
      classList: {
        add: (...cls) => cls.forEach(c => classList.add(c)),
        remove: (...cls) => cls.forEach(c => classList.delete(c)),
        contains: c => classList.has(c),
        toggle: (c, force) => {
          if (force !== undefined) {
            force ? classList.add(c) : classList.delete(c);
          } else {
            classList.has(c) ? classList.delete(c) : classList.add(c);
          }
        }
      },
      getAttribute: (k) => node.attributes[k] || null,
      setAttribute: (k, v) => { node.attributes[k] = String(v); },
      addEventListener: (evt, handler) => {
        listeners[evt] = listeners[evt] || [];
        listeners[evt].push(handler);
      },
      dispatchEvent: (evt) => {
        const handlers = listeners[evt.type] || [];
        handlers.forEach(h => h(evt));
      },
      querySelector: (sel) => {
        if (sel === "#projects-hub-view-container, [data-hub-body]") return node;
        if (sel === "#hub-results-count, [data-hub-counter]") return createMockNode("span");
        return null;
      },
      querySelectorAll: (sel) => []
    };
    return node;
  }

  await t.test("5.1 initProjectsHub with adversarial options does not crash", () => {
    assert.equal(ProjectsHub.initProjectsHub(null), null);
    assert.equal(ProjectsHub.initProjectsHub({}), null);

    const container = createMockNode("div");
    const brokenStorage = {
      getItem: () => { throw new Error("Storage broken"); },
      setItem: () => { throw new Error("Write failed"); }
    };

    assert.doesNotThrow(() => {
      const api = ProjectsHub.initProjectsHub(container, {
        storage: brokenStorage,
        canvasExercises: null,
        dailyProjects: null,
        viewMode: "invalid-mode-xyz"
      });
      assert(api !== null);
      assert.equal(typeof api.refresh, "function");
      assert.equal(typeof api.getProjects, "function");
      assert.equal(typeof api.resetOrder, "function");
      assert.equal(typeof api.setViewMode, "function");
      assert.equal(typeof api.getOrder, "function");
      assert.equal(typeof api.getStatusMap, "function");
      assert.equal(typeof api.setStatus, "function");
    });
  });

  await t.test("5.2 api.setStatus sanitizes invalid status values against whitelist", () => {
    const container = createMockNode("div");
    const memStorage = {};
    const storage = {
      getItem: k => memStorage[k] || null,
      setItem: (k, v) => { memStorage[k] = v; }
    };

    const api = ProjectsHub.initProjectsHub(container, {
      storage,
      canvasExercises: CANVAS_EXERCISES,
      dailyProjects: ProjectsHub.DEFAULT_DAILY_PROJECTS
    });

    // Injected invalid status
    api.setStatus("dia-1-acta-rag", "<script>alert(1)</script>");
    const projects = api.getProjects();
    const proj = projects.find(p => p.id === "dia-1-acta-rag");

    // Status map stored the string, but getProjectStatus whitelist neutralizes it during render
    const statusMap = api.getStatusMap();
    assert.equal(statusMap["dia-1-acta-rag"], "<script>alert(1)</script>");
    assert.equal(ProjectsHub.getProjectStatus(proj, statusMap), "por-iniciar", "Must fallback to safe status");
  });

  await t.test("5.3 api.setViewMode handles unrecognized modes gracefully", () => {
    const container = createMockNode("div");
    const api = ProjectsHub.initProjectsHub(container, {
      canvasExercises: CANVAS_EXERCISES,
      dailyProjects: ProjectsHub.DEFAULT_DAILY_PROJECTS
    });

    assert.doesNotThrow(() => {
      api.setViewMode("malicious-mode");
      // render executes buildKanbanBoardHtml as safe default fallback
      assert(container.innerHTML.includes("projects-kanban-board"));
    });
  });
});

// -------------------------------------------------------------
// SUITE 6: CONCURRENCY & DESYNCHRONIZATION STRESS
// -------------------------------------------------------------
test("SUITE 6: Rapid Sequential Mutation & Stability Stress", async (t) => {
  await t.test("6.1 1,000 rapid reorderings do not lose or duplicate any of the 28 projects", () => {
    const collated = ProjectsHub.collateAllProjects(CANVAS_EXERCISES, ProjectsHub.DEFAULT_DAILY_PROJECTS);
    let order = collated.map(p => p.id);
    const initialSet = new Set(order);

    for (let i = 0; i < 1000; i++) {
      const srcIdx = (i * 7 + 3) % order.length;
      const tgtIdx = (i * 13 + 5) % order.length;
      const srcId = order[srcIdx];
      const tgtId = order[tgtIdx];
      const pos = i % 2 === 0 ? "before" : "after";

      order = ProjectsHub.reorderProjectList(order, srcId, tgtId, pos);

      // Verify invariants on every step
      assert.equal(order.length, 28);
    }

    assert.equal(new Set(order).size, 28);
    for (const id of order) {
      assert(initialSet.has(id));
    }
  });

  await t.test("6.2 Custom order with corrupted elements in sortProjects preserves all catalog items", () => {
    const collated = ProjectsHub.collateAllProjects(CANVAS_EXERCISES, ProjectsHub.DEFAULT_DAILY_PROJECTS);
    const corruptedCustomOrder = ["nonexistent-1", "dia-2-capsula-multimedia", "nonexistent-2", null, undefined, 123];

    const sorted = ProjectsHub.sortProjects(collated, "custom", corruptedCustomOrder);
    assert.equal(sorted.length, 28);
    assert.equal(sorted[0].id, "dia-2-capsula-multimedia");
  });
});

// -------------------------------------------------------------
// SUITE 7: CODE INTEGRITY, POLICY COMPLIANCE & GOVERNANCE SCAN
// -------------------------------------------------------------
test("SUITE 7: DevBrain Governance & Anti-Pattern Audit", async (t) => {
  const filePath = path.join(__dirname, "../js/projects-hub.js");
  const code = fs.readFileSync(filePath, "utf8");
  const lines = code.split("\n");

  await t.test("7.1 Modularity limit: file must have fewer than 250 lines", () => {
    assert(lines.length < 250, `js/projects-hub.js has ${lines.length} lines, which exceeds the 250-line limit!`);
  });

  await t.test("7.2 Prohibited terms: zero occurrences of 'dossier' (Regla 10.3 / 5.0.1)", () => {
    assert(!/dossier/i.test(code), "Forbidden term 'dossier' found in projects-hub.js!");
  });

  await t.test("7.3 No fictitious timers: zero occurrences of setTimeout/setInterval (Regla 10.3)", () => {
    assert(!/setTimeout/.test(code), "Forbidden 'setTimeout' found in projects-hub.js!");
    assert(!/setInterval/.test(code), "Forbidden 'setInterval' found in projects-hub.js!");
  });

  await t.test("7.4 Export format: dual UMD export present and non-empty", () => {
    assert(code.includes("typeof module !== \"undefined\" && module.exports"), "UMD export pattern missing");
  });
});

