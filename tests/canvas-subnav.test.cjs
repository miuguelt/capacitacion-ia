const test = require("node:test");
const assert = require("node:assert/strict");

const subnav = require("../js/canvas-subnav.js");
const { CANVAS_EXERCISES } = require("../js/canvas-exercises.js");

test("pickActiveSection elige la sección visible con mayor intersección o cercanía superior", () => {
    assert.equal(subnav.pickActiveSection(null), null);
    assert.equal(subnav.pickActiveSection([]), null);
    assert.equal(
        subnav.pickActiveSection([
            null,
            { isIntersecting: false, intersectionRatio: 0, target: { id: "sec-1" } }
        ]),
        null
    );

    const chosen = subnav.pickActiveSection([
        {
            isIntersecting: true,
            intersectionRatio: 0.25,
            boundingClientRect: { top: 120 },
            target: { getAttribute: (attr) => (attr === "data-canvas-section" ? "sec-a" : null), id: "fallback-a" }
        },
        {
            isIntersecting: true,
            intersectionRatio: 0.65,
            boundingClientRect: { top: 40 },
            target: { getAttribute: () => null, id: "sec-b" }
        },
        {
            isIntersecting: true,
            intersectionRatio: 0.65,
            boundingClientRect: { top: 10 },
            target: { getAttribute: () => "sec-c" }
        }
    ]);
    assert.equal(chosen, "sec-c");

    const withoutRect = subnav.pickActiveSection([
        { isIntersecting: true, target: {} },
        { isIntersecting: true, intersectionRatio: 0.5, target: { id: "sec-only" } }
    ]);
    assert.equal(withoutRect, "sec-only");

    const tieWithoutRatioB = subnav.pickActiveSection([
        { isIntersecting: true, intersectionRatio: 0.5, boundingClientRect: { top: 20 }, target: { id: "sec-top" } },
        { isIntersecting: true, target: {} }
    ]);
    assert.equal(tieWithoutRatioB, "sec-top");

    const tieWithoutRectB = subnav.pickActiveSection([
        { isIntersecting: true, intersectionRatio: 0.5, boundingClientRect: { top: 20 }, target: { id: "sec-top" } },
        { isIntersecting: true, intersectionRatio: 0.5, target: {} }
    ]);
    assert.equal(tieWithoutRectB, "sec-top");

    const tieWithoutRectA = subnav.pickActiveSection([
        { isIntersecting: true, intersectionRatio: 0.5, target: {} },
        { isIntersecting: true, intersectionRatio: 0.5, boundingClientRect: { top: 10 }, target: { id: "sec-b-wins" } }
    ]);
    assert.equal(tieWithoutRectA, "sec-b-wins");

    const noIdOrAttr = subnav.pickActiveSection([
        { isIntersecting: true, intersectionRatio: 0.5, target: {} }
    ]);
    assert.equal(noIdOrAttr, null);
});

test("countCompletedExercises y formatProgressLabel calculan avance global y por modo sin errores", () => {
    const emptyStats = subnav.countCompletedExercises(null, null);
    assert.equal(emptyStats.done, 0);
    assert.equal(emptyStats.total, 0);
    assert.deepEqual(emptyStats.byMode, {});

    const nullCompletedStats = subnav.countCompletedExercises(null, CANVAS_EXERCISES);
    assert.equal(nullCompletedStats.done, 0);
    assert.equal(nullCompletedStats.total, 36);

    const stats = subnav.countCompletedExercises(
        ["doc-a-informe-desercion", "code-a-simulador-presupuesto", "id-inexistente"],
        CANVAS_EXERCISES
    );
    assert.equal(stats.done, 2);
    assert.equal(stats.total, 36);
    assert.deepEqual(stats.byMode["doc-editorial"], { done: 1, total: 3 });
    assert.deepEqual(stats.byMode["code-prototyping"], { done: 1, total: 3 });
    assert.deepEqual(stats.byMode["visual-mockup"], { done: 0, total: 3 });

    const nonArrayMode = subnav.countCompletedExercises(["x"], { broken: null });
    assert.deepEqual(nonArrayMode.byMode.broken, { done: 0, total: 0 });

    assert.equal(subnav.formatProgressLabel(0, 0), "0/0");
    assert.equal(subnav.formatProgressLabel(undefined, undefined), "0/0");
    assert.equal(subnav.formatProgressLabel(0, 24), "0/24");
    assert.equal(subnav.formatProgressLabel(7, 24), "7/24");
    assert.equal(subnav.formatProgressLabel(30, 24), "24/24");
    assert.equal(subnav.formatProgressLabel(-3, 24), "0/24");
});

test("nextTabIndex calcula navegación por teclado accesible (ArrowRight, ArrowLeft, Home, End)", () => {
    assert.equal(subnav.nextTabIndex(0, "ArrowRight", 0), -1);
    assert.equal(subnav.nextTabIndex(0, "Enter", 5), -1);
    assert.equal(subnav.nextTabIndex(0, "ArrowRight", 4), 1);
    assert.equal(subnav.nextTabIndex(3, "ArrowRight", 4), 0);
    assert.equal(subnav.nextTabIndex(0, "ArrowLeft", 4), 3);
    assert.equal(subnav.nextTabIndex(2, "ArrowLeft", 4), 1);
    assert.equal(subnav.nextTabIndex(2, "Home", 4), 0);
    assert.equal(subnav.nextTabIndex(1, "End", 4), 3);
    assert.equal(subnav.nextTabIndex(0, "ArrowDown", 3), 1);
    assert.equal(subnav.nextTabIndex(0, "ArrowUp", 3), 2);
});

test("bindTablistKeyboard e initCanvasSubnav sincronizan píldoras, pestañas, progreso y observador", () => {
    assert.equal(subnav.bindTablistKeyboard(null), false);
    assert.equal(subnav.initCanvasSubnav(null, null), null);

    const makeClassList = (initial = []) => {
        const set = new Set(initial);
        return {
            add: (c) => set.add(c),
            remove: (c) => set.delete(c),
            toggle: (c, force) => (force ? set.add(c) : set.delete(c)),
            contains: (c) => set.has(c)
        };
    };

    const createButton = (attrs = {}) => {
        const listeners = {};
        const children = [];
        let text = attrs.text || "";
        return {
            attrs: { ...attrs },
            dataset: { ...(attrs.dataset || {}) },
            classList: makeClassList(attrs.classes || []),
            listeners,
            children,
            focused: false,
            clicked: false,
            get textContent() {
                return text;
            },
            set textContent(v) {
                text = v;
            },
            getAttribute(k) {
                return this.attrs[k] ?? null;
            },
            setAttribute(k, v) {
                this.attrs[k] = String(v);
            },
            addEventListener(type, fn) {
                listeners[type] = fn;
            },
            querySelector(sel) {
                if (sel === ".canvas-tab-progress") {
                    return children.find((c) => c.className === "canvas-tab-progress") || null;
                }
                return null;
            },
            appendChild(child) {
                children.push(child);
                return child;
            },
            focus() {
                this.focused = true;
            },
            click() {
                this.clicked = true;
            }
        };
    };

    const pill1 = createButton({ href: "#sec-1", classes: ["quick-nav-pill", "active"] });
    const pill2 = createButton({ href: "#sec-2", classes: ["quick-nav-pill"] });
    const pillEmpty = createButton({ classes: ["quick-nav-pill"] });
    const pillMissingTarget = createButton({ href: "#sec-inexistente", classes: ["quick-nav-pill"] });

    const tabDoc = createButton({ "data-mode": "doc-editorial", classes: ["canvas-tab", "active"] });
    const tabCode = createButton({ "data-mode": "code-prototyping", classes: ["canvas-tab"] });
    const tabCustom = createButton({ "data-mode": "unknown", classes: ["canvas-tab"] });
    const tabUnregistered = createButton({ "data-mode": "unregistered", classes: ["canvas-tab"] });

    const tablist = {
        listeners: {},
        querySelectorAll(sel) {
            if (sel.includes("canvas-tab")) return [tabDoc, tabCode, tabCustom, tabUnregistered];
            return [];
        },
        addEventListener(type, fn) {
            this.listeners[type] = fn;
        }
    };

    const countBadge = { textContent: "", setAttribute(k, v) { this[k] = v; } };
    const sec1 = {
        id: "sec-1",
        scrolled: false,
        getAttribute: () => "sec-1",
        scrollIntoView() {
            this.scrolled = true;
        }
    };
    const sec2 = {
        id: "sec-2",
        scrolled: false,
        getAttribute: () => "sec-2",
        scrollIntoView() {
            this.scrolled = true;
        }
    };

    let observerCallback = null;
    const observed = [];
    class FakeIntersectionObserver {
        constructor(cb) {
            observerCallback = cb;
        }
        observe(el) {
            observed.push(el);
        }
    }

    const fakeDoc = {
        createElement(tag) {
            return {
                tagName: tag.toUpperCase(),
                className: "",
                textContent: "",
                attrs: {},
                classList: makeClassList(),
                setAttribute(k, v) {
                    this.attrs[k] = String(v);
                }
            };
        },
        getElementById(id) {
            if (id === "canvas-nav-exercises-count") return countBadge;
            if (id === "sec-1") return sec1;
            if (id === "sec-2") return sec2;
            return null;
        },
        querySelectorAll(sel) {
            if (sel === "#gemini-canvas .quick-nav-pill") return [pill1, pill2, pillEmpty, pillMissingTarget];
            if (sel === "#gemini-canvas [data-canvas-section]") return [sec1, sec2];
            if (sel === "#gemini-canvas .canvas-tab-bar, #gemini-canvas .canvas-exercises-switch") return [tablist];
            if (sel === "#gemini-canvas .canvas-tab[data-mode]") return [tabDoc, tabCode, tabCustom, tabUnregistered];
            return [];
        }
    };

    const fakeWin = {
        CANVAS_EXERCISES: { ...CANVAS_EXERCISES, unknown: [] },
        IntersectionObserver: FakeIntersectionObserver,
        localStorage: {
            getItem(key) {
                if (key === "canvas_exercises_completed_v1") {
                    return JSON.stringify(["doc-a-informe-desercion", "doc-b-propuesta-huerta", "doc-c-recorrido-interfaz"]);
                }
                return null;
            }
        }
    };

    const api = subnav.initCanvasSubnav(fakeDoc, fakeWin);
    assert.ok(api);
    assert.equal(typeof api.refreshProgress, "function");
    assert.equal(countBadge.textContent, "3/36");
    assert.equal(observed.length, 2);

    const docProgress = tabDoc.querySelector(".canvas-tab-progress");
    assert.ok(docProgress);
    assert.equal(docProgress.textContent, "3/3");
    assert.equal(docProgress.classList.contains("is-complete"), true);

    const unknownProgress = tabCustom.querySelector(".canvas-tab-progress");
    assert.ok(unknownProgress);
    assert.equal(unknownProgress.textContent, "0/0");
    assert.equal(unknownProgress.classList.contains("is-complete"), false);

    // Click en pill2 activa sec-2 y hace scroll suave
    let prevented = false;
    pill2.listeners.click({
        preventDefault() {
            prevented = true;
        }
    });
    assert.equal(prevented, true);
    assert.equal(sec2.scrolled, true);
    assert.equal(pill2.classList.contains("active"), true);
    assert.equal(pill2.getAttribute("aria-current"), "true");
    assert.equal(pill1.classList.contains("active"), false);

    // Click en pill sin destino válido o inexistente no rompe
    pillEmpty.listeners.click({ preventDefault() {} });
    pillMissingTarget.listeners.click({ preventDefault() {} });

    // IntersectionObserver actualiza píldora activa a sec-1
    observerCallback([
        { isIntersecting: true, intersectionRatio: 0.8, boundingClientRect: { top: 0 }, target: sec1 }
    ]);
    assert.equal(pill1.classList.contains("active"), true);

    // IntersectionObserver sin intersección no cambia estado
    observerCallback([
        { isIntersecting: false, intersectionRatio: 0, target: sec2 }
    ]);
    assert.equal(pill1.classList.contains("active"), true);

    // Teclado en tablist: ArrowRight mueve de tabDoc (0) a tabCode (1) y actualiza roving tabindex
    assert.equal(tabDoc.getAttribute("tabindex"), "0");
    assert.equal(tabCode.getAttribute("tabindex"), "-1");
    let keyPrevented = false;
    tablist.listeners.keydown({
        key: "ArrowRight",
        target: tabDoc,
        preventDefault() {
            keyPrevented = true;
        }
    });
    assert.equal(keyPrevented, true);
    assert.equal(tabCode.focused, true);
    assert.equal(tabCode.clicked, true);
    assert.equal(tabCode.getAttribute("tabindex"), "0");
    assert.equal(tabCode.getAttribute("aria-selected"), "true");
    assert.equal(tabDoc.getAttribute("tabindex"), "-1");
    assert.equal(tabDoc.getAttribute("aria-selected"), "false");

    // Click en tablist actualiza roving tabindex
    tablist.listeners.click({ target: tabCustom });
    assert.equal(tabCustom.getAttribute("tabindex"), "0");
    tablist.listeners.click({ target: {} });
    assert.equal(tabCustom.getAttribute("tabindex"), "0");

    // Tablist de botones Ejercicio A / Ejercicio B (.canvas-exercises-switch-btn) y sin clase active inicial
    const btnExA = createButton({ classes: ["canvas-exercises-switch-btn"] });
    const btnExB = { focus() {}, click() {} };
    const switchList = {
        listeners: {},
        querySelectorAll() {
            return [btnExA, btnExB];
        },
        addEventListener(type, fn) {
            this.listeners[type] = fn;
        }
    };
    subnav.bindTablistKeyboard(switchList);
    assert.equal(btnExA.getAttribute("tabindex"), "0");

    const emptyTablist = {
        querySelectorAll() {
            return [];
        },
        addEventListener() {}
    };
    assert.equal(subnav.bindTablistKeyboard(emptyTablist), true);

    // Tecla no manejada o target fuera de la lista no hace nada
    tablist.listeners.keydown({ key: "Tab", target: tabDoc, preventDefault() {} });
    tablist.listeners.keydown({ key: "ArrowRight", target: {}, preventDefault() {} });

    // setActivePill con valor vacío no modifica el estado
    api.setActivePill("");
    assert.equal(pill1.classList.contains("active"), true);

    // Si localStorage devuelve un objeto que no es arreglo, usa lista vacía
    fakeWin.localStorage.getItem = () => '{"no":"array"}';
    assert.equal(api.refreshProgress().done, 0);

    // Si localStorage devuelve JSON inválido, refreshProgress usa lista vacía sin lanzar error
    fakeWin.localStorage.getItem = () => "{invalido";
    const fallbackStats = api.refreshProgress();
    assert.equal(fallbackStats.done, 0);

    // Sin IntersectionObserver, sin localStorage, sin secciones y sin #canvas-nav-exercises-count también funciona
    assert.equal(subnav.initCanvasSubnav(fakeDoc, null), null);
    const docWithoutCountOrSections = {
        ...fakeDoc,
        getElementById(id) {
            if (id === "canvas-nav-exercises-count") return null;
            return fakeDoc.getElementById(id);
        },
        querySelectorAll(sel) {
            if (sel === "#gemini-canvas [data-canvas-section]") return [];
            return fakeDoc.querySelectorAll(sel);
        }
    };
    const minimalApi = subnav.initCanvasSubnav(docWithoutCountOrSections, {
        CANVAS_EXERCISES,
        IntersectionObserver: FakeIntersectionObserver
    });
    assert.equal(minimalApi.refreshProgress().done, 0);
});
