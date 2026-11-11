/* ==========================================================================
   SUBNAVEGACIÓN INTELIGENTE, PROGRESO Y ACCESIBILIDAD — GEMINI CANVAS
   Sincroniza la barra rápida (.canvas-quick-nav), contadores de ejercicios
   completados por modo y navegación por teclado WAI-ARIA en tablists.
   ========================================================================== */

function pickActiveSection(entries) {
    if (!Array.isArray(entries) || entries.length === 0) return null;
    const visible = entries.filter((entry) => Boolean(entry) && Boolean(entry.isIntersecting));
    if (visible.length === 0) return null;

    visible.sort((a, b) => {
        const ratioA = typeof a.intersectionRatio === "number" ? a.intersectionRatio : 0;
        const ratioB = typeof b.intersectionRatio === "number" ? b.intersectionRatio : 0;
        const ratioDiff = ratioB - ratioA;
        if (Math.abs(ratioDiff) > 0.01) return ratioDiff;
        const topA = Math.abs(a.boundingClientRect ? a.boundingClientRect.top : 9999);
        const topB = Math.abs(b.boundingClientRect ? b.boundingClientRect.top : 9999);
        return topA - topB;
    });

    const target = visible[0].target;
    const sectionAttr = typeof target.getAttribute === "function" ? target.getAttribute("data-canvas-section") : null;
    return sectionAttr || target.id || null;
}

function countCompletedExercises(completedIds, exercisesByMode) {
    if (!exercisesByMode || typeof exercisesByMode !== "object") {
        return { done: 0, total: 0, byMode: {} };
    }
    const completedSet = new Set(Array.isArray(completedIds) ? completedIds : []);
    let done = 0;
    let total = 0;
    const byMode = {};

    for (const [mode, list] of Object.entries(exercisesByMode)) {
        const items = Array.isArray(list) ? list : [];
        const modeDone = items.filter((ex) => completedSet.has(ex.id)).length;
        byMode[mode] = { done: modeDone, total: items.length };
        done += modeDone;
        total += items.length;
    }

    return { done, total, byMode };
}

function formatProgressLabel(done, total) {
    const safeTotal = Math.max(0, Number(total ?? 0));
    const safeDone = Math.min(safeTotal, Math.max(0, Number(done ?? 0)));
    return `${safeDone}/${safeTotal}`;
}

function nextTabIndex(current, key, total) {
    if (!Number.isInteger(total) || total <= 0) return -1;
    if (key === "ArrowRight" || key === "ArrowDown") {
        return (current + 1) % total;
    }
    if (key === "ArrowLeft" || key === "ArrowUp") {
        return (current - 1 + total) % total;
    }
    if (key === "Home") return 0;
    if (key === "End") return total - 1;
    return -1;
}

function syncRovingTabindex(tabs, activeTab) {
    tabs.forEach((tab) => {
        const isCurrent = tab === activeTab;
        if (typeof tab.setAttribute === "function") {
            tab.setAttribute("role", "tab");
            tab.setAttribute("tabindex", isCurrent ? "0" : "-1");
            tab.setAttribute("aria-selected", isCurrent ? "true" : "false");
        }
    });
}

function bindTablistKeyboard(tablist) {
    if (!tablist || typeof tablist.addEventListener !== "function") return false;
    const getTabs = () =>
        Array.from(
            tablist.querySelectorAll(".canvas-tab, .canvas-exercises-switch-btn, .canvas-exercise-case-btn")
        ).filter((tab) => !tab.hidden);
    const initialTabs = getTabs();
    const initialActive =
        initialTabs.find((t) => t.classList && t.classList.contains("active")) || initialTabs[0];
    if (initialActive) syncRovingTabindex(initialTabs, initialActive);

    tablist.addEventListener("click", (event) => {
        const tabs = getTabs();
        if (tabs.includes(event.target)) {
            syncRovingTabindex(tabs, event.target);
        }
    });

    tablist.addEventListener("keydown", (event) => {
        const tabs = getTabs();
        const currentIndex = tabs.indexOf(event.target);
        if (currentIndex === -1) return;
        const targetIndex = nextTabIndex(currentIndex, event.key, tabs.length);
        if (targetIndex === -1) return;
        event.preventDefault();
        const nextTab = tabs[targetIndex];
        syncRovingTabindex(tabs, nextTab);
        nextTab.focus();
        nextTab.click();
    });
    return true;
}

function readCompletedIdsFromStorage(win) {
    try {
        const storage = win.localStorage;
        const raw = storage ? storage.getItem("canvas_exercises_completed_v1") : null;
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
        return [];
    }
}

function initCanvasSubnav(doc, win) {
    if (!doc || !win) return null;

    const pills = Array.from(doc.querySelectorAll("#gemini-canvas .quick-nav-pill"));
    const setActivePill = (sectionId) => {
        if (!sectionId) return;
        const targetHash = `#${sectionId}`;
        pills.forEach((pill) => {
            const isMatch = pill.getAttribute("href") === targetHash;
            pill.classList.toggle("active", isMatch);
            pill.setAttribute("aria-current", isMatch ? "true" : "false");
        });
    };

    pills.forEach((pill) => {
        pill.addEventListener("click", (event) => {
            const href = pill.getAttribute("href") || "";
            const id = href.replace(/^#/, "");
            const section = id ? doc.getElementById(id) : null;
            if (section) {
                event.preventDefault();
                setActivePill(id);
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    const sections = Array.from(doc.querySelectorAll("#gemini-canvas [data-canvas-section]"));
    if (typeof win.IntersectionObserver === "function" && sections.length > 0) {
        const observer = new win.IntersectionObserver(
            (entries) => {
                const activeId = pickActiveSection(entries);
                if (activeId) setActivePill(activeId);
            },
            { threshold: [0.15, 0.35, 0.65], rootMargin: "-80px 0px -45% 0px" }
        );
        sections.forEach((sec) => observer.observe(sec));
    }

    const tablists = Array.from(
        doc.querySelectorAll("#gemini-canvas .canvas-tab-bar, #gemini-canvas .canvas-exercises-switch")
    );
    tablists.forEach((list) => bindTablistKeyboard(list));

    const refreshProgress = () => {
        const completed = readCompletedIdsFromStorage(win);
        const stats = countCompletedExercises(completed, win.CANVAS_EXERCISES);
        const countEl = doc.getElementById("canvas-nav-exercises-count");
        if (countEl) {
            countEl.textContent = formatProgressLabel(stats.done, stats.total);
            countEl.setAttribute("title", `${stats.done} de ${stats.total} ejercicios completados`);
        }

        const modeTabs = Array.from(doc.querySelectorAll("#gemini-canvas .canvas-tab[data-mode]"));
        modeTabs.forEach((tab) => {
            const mode = tab.getAttribute("data-mode");
            const modeStat = stats.byMode[mode];
            if (!modeStat) return;
            let badge = tab.querySelector(".canvas-tab-progress");
            if (!badge) {
                badge = doc.createElement("span");
                badge.className = "canvas-tab-progress";
                tab.appendChild(badge);
            }
            badge.textContent = formatProgressLabel(modeStat.done, modeStat.total);
            badge.classList.toggle("is-complete", modeStat.done === modeStat.total && modeStat.total > 0);
        });

        return stats;
    };

    refreshProgress();
    win.refreshCanvasSubnavProgress = refreshProgress;
    return { refreshProgress, setActivePill };
}

if (typeof module !== "undefined") {
    module.exports = {
        pickActiveSection,
        countCompletedExercises,
        formatProgressLabel,
        nextTabIndex,
        bindTablistKeyboard,
        initCanvasSubnav
    };
}
