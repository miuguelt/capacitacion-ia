/**
 * Capacitación Práctica en Inteligencia Artificial (4 Días)
 * Lógica de la SPA: Navegación, Modo Instructor/Aprendiz, Constructor de Prompts,
 * Temporizador de Aula, Laboratorio de Gemini Canvas y Resultados Esperados.
 */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initRoleSwitcher();
  initThemeToggle();
  initCopyButtons();
  initPromptBuilder();
  initClassroomTimer();
  initCanvasLab();
  initCanvasCalibrationBar();
  initMultimodalSimulator();
  initGemStudio();
  initDia3Module();
  initExpectedResultsToggles();
  const proyectosEl = document.getElementById("proyectos");
  if (proyectosEl && typeof initProjectsHub === "function") {
    window.projectsHubInstance = initProjectsHub(proyectosEl);
  }
  initCommandPalette();
});

// 1. Navegación SPA
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const pages = document.querySelectorAll(".page-view");
  const breadcrumbCurrent = document.getElementById("current-page-label");
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");

  function switchPage(targetId) {
    pages.forEach(page => {
      if (page.id === targetId) {
        page.classList.add("active");
      } else {
        page.classList.remove("active");
      }
    });

    navLinks.forEach(link => {
      if (link.getAttribute("data-target") === targetId) {
        link.classList.add("active");
        if (breadcrumbCurrent) {
          const navText = link.querySelector(".nav-text");
          if (navText) {
            breadcrumbCurrent.textContent = navText.textContent;
          }
        }
      } else {
        link.classList.remove("active");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Cerrar sidebar en móviles tras clic
    if (sidebar && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
    }
  }

  // Exponer para la paleta de comandos y accesos directos
  window.switchPage = switchPage;

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetId = link.getAttribute("data-target");
      switchPage(targetId);
      window.location.hash = targetId;
    });
  });

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // Soporte de navegación directa para enlaces internos al Hub de Proyectos
  document.addEventListener("click", e => {
    const hubLink = e.target.closest('a[href="#proyectos"]');
    if (hubLink && !hubLink.classList.contains("nav-link")) {
      e.preventDefault();
      switchPage("proyectos");
      window.location.hash = "proyectos";
    }
  });

  // Rutas: #<sección> o #gemini-canvas/<modo>/<a|b|c>. Atrás y adelante vuelven a aplicarlas.
  function applyHashRoute() {
    const modes = typeof CANVAS_POSSIBILITIES !== "undefined" ? Object.keys(CANVAS_POSSIBILITIES) : [];
    const route = parseCanvasRoute(window.location.hash, modes);
    if (!route.page) return;
    const page = document.getElementById(route.page);
    if (!page || !page.classList.contains("page-view")) return;
    if (!page.classList.contains("active")) switchPage(route.page);
    if (route.mode && typeof window.openCanvasRoute === "function") {
      window.openCanvasRoute(route.mode, route.exercise);
    }
  }
  window.applyHashRoute = applyHashRoute;
  window.addEventListener("hashchange", applyHashRoute);
  window.addEventListener("popstate", applyHashRoute);
  applyHashRoute();
}

// 2. Conmutador de Rol (Aprendiz vs Instructor)
function initRoleSwitcher() {
  const btnLearner = document.getElementById("role-learner");
  const btnInstructor = document.getElementById("role-instructor");
  const statusPill = document.getElementById("status-pill");

  if (!btnLearner || !btnInstructor) return;

  function setRole(role) {
    if (role === "instructor") {
      document.body.classList.add("instructor-mode");
      btnLearner.classList.remove("active");
      btnInstructor.classList.add("active", "instructor-active");
      if (statusPill) {
        statusPill.className = "status-pill teaching";
        statusPill.innerHTML = "👨‍🏫 <span>Modo Facilitador Activo</span>";
      }
      localStorage.setItem("capacitacion_role", "instructor");
    } else {
      document.body.classList.remove("instructor-mode");
      btnInstructor.classList.remove("active", "instructor-active");
      btnLearner.classList.add("active");
      if (statusPill) {
        statusPill.className = "status-pill learning";
        statusPill.innerHTML = "🎓 <span>Modo Participante</span>";
      }
      localStorage.setItem("capacitacion_role", "learner");
    }
  }

  btnLearner.addEventListener("click", () => setRole("learner"));
  btnInstructor.addEventListener("click", () => setRole("instructor"));

  // Cargar preferencia guardada
  const savedRole = localStorage.getItem("capacitacion_role") || "learner";
  setRole(savedRole);
}

// 3. Tema Claro / Oscuro
function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  const currentTheme = localStorage.getItem("capacitacion_theme") || "light";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (toggleBtn) {
      toggleBtn.innerHTML = theme === "dark" ? "☀️ <span>Modo Claro</span>" : "🌙 <span>Modo Oscuro</span>";
    }
    localStorage.setItem("capacitacion_theme", theme);
  }

  applyTheme(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const active = document.documentElement.getAttribute("data-theme");
      applyTheme(active === "dark" ? "light" : "dark");
    });
  }
}

// 4. Copiado rápido de prompts y código
function initCopyButtons() {
  document.addEventListener("click", e => {
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
      const targetId = copyBtn.getAttribute("data-copy-target");
      let textToCopy = "";

      if (targetId) {
        const elementToCopy = document.getElementById(targetId);
        if (elementToCopy) {
          textToCopy = elementToCopy.innerText || elementToCopy.textContent;
        }
      } else if (copyBtn.id === "sim-copy-prompt-btn") {
        const promptEl = document.getElementById("sim-user-prompt");
        if (promptEl) {
          textToCopy = promptEl.innerText || promptEl.textContent;
        }
      }

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy.trim()).then(() => {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = "✓ ¡Copiado!";
          copyBtn.style.backgroundColor = "var(--color-primary)";
          copyBtn.style.color = "white";

          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = "";
            copyBtn.style.color = "";
          }, 2000);
        });
      }
    }
  });
}

// 5. Constructor Interactivo de Prompts CRTT+L
function initPromptBuilder() {
  const form = document.getElementById("prompt-builder-form");
  const outputText = document.getElementById("generated-prompt-output");

  if (!form || !outputText) return;

  function updatePromptHealth(rol, contexto, instruccion, restricciones, formato) {
    const healthScoreEl = document.getElementById("prompt-health-score");
    const healthFillEl = document.getElementById("prompt-health-fill");
    const healthTipEl = document.getElementById("prompt-health-tip");

    const reqR = document.getElementById("req-r");
    const reqC = document.getElementById("req-c");
    const reqI = document.getElementById("req-i");
    const reqRes = document.getElementById("req-res");
    const reqF = document.getElementById("req-f");

    if (!healthScoreEl || !healthFillEl) return;

    const hasR = rol.length > 5 && !rol.startsWith("[");
    const hasC = contexto.length > 10 && !contexto.startsWith("[");
    const hasI = instruccion.length > 10 && !instruccion.startsWith("[");
    const hasRes = restricciones.length > 8 && !restricciones.startsWith("[");
    const hasF = formato.length > 5 && !formato.startsWith("[");

    if (reqR) reqR.classList.toggle("active", hasR);
    if (reqC) reqC.classList.toggle("active", hasC);
    if (reqI) reqI.classList.toggle("active", hasI);
    if (reqRes) reqRes.classList.toggle("active", hasRes);
    if (reqF) reqF.classList.toggle("active", hasF);

    const passed = [hasR, hasC, hasI, hasRes, hasF].filter(Boolean).length;
    const percent = passed * 20;

    healthScoreEl.textContent = `${percent}% Completo`;
    healthFillEl.style.width = `${percent}%`;

    if (percent < 40) {
      healthFillEl.style.backgroundColor = "#ef4444";
      healthScoreEl.style.color = "#ef4444";
      if (healthTipEl) healthTipEl.textContent = "⚠️ Nivel Crítico: El prompt es ambiguo y provocará respuestas genéricas o alucinadas.";
    } else if (percent < 80) {
      healthFillEl.style.backgroundColor = "#f59e0b";
      healthScoreEl.style.color = "#f59e0b";
      if (healthTipEl) healthTipEl.textContent = "⚡ Buen avance: Asegúrate de incluir restricciones estrictas y el formato tabular para cerrar ambigüedades.";
    } else {
      healthFillEl.style.backgroundColor = "var(--color-primary)";
      healthScoreEl.style.color = "var(--color-primary)";
      if (healthTipEl) healthTipEl.textContent = "✓ Estándar Canónico CRTT+L (Contexto, Rol, Tarea, Tono y Límites): Instrucción blindada contra alucinaciones con delimitación de formato inequívoca.";
    }
  }

  function updateGeneratedPrompt() {
    const rol = document.getElementById("p-rol").value.trim() || "[Definir rol]";
    const contexto = document.getElementById("p-contexto").value.trim() || "[Definir contexto del problema]";
    const instruccion = document.getElementById("p-instruccion").value.trim() || "[Definir instrucción directa]";
    const restricciones = document.getElementById("p-restricciones").value.trim() || "No inventes información ajena al texto.";
    const formato = document.getElementById("p-formato").value.trim() || "Tabla estructurada y lista de viñetas.";

    const promptFinal = `Actúa como ${rol}.

Contexto:
${contexto}

Instrucción:
${instruccion}

Restricciones estrictas:
- ${restricciones}

Formato de salida:
- ${formato}`;

    outputText.textContent = promptFinal;
    updatePromptHealth(rol, contexto, instruccion, restricciones, formato);
  }

  form.addEventListener("input", updateGeneratedPrompt);
  updateGeneratedPrompt();
}

// 6. Temporizador de Aula
function initClassroomTimer() {
  const display = document.getElementById("timer-display");
  const btnToggle = document.getElementById("timer-toggle-btn");
  const btnReset = document.getElementById("timer-reset-btn");
  const presetBtns = document.querySelectorAll(".preset-btn");

  if (!display || !btnToggle || !btnReset) return;

  let totalSeconds = 25 * 60; // 25 min por defecto
  let remainingSeconds = totalSeconds;
  let timerInterval = null;
  let isRunning = false;

  function renderDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function tick() {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      renderDisplay();
    } else {
      pauseTimer();
      display.style.color = "#ef4444";
      alert("¡Tiempo cumplido para este bloque de trabajo o pausa!");
    }
  }

  function startTimer() {
    if (!isRunning) {
      isRunning = true;
      btnToggle.textContent = "⏸ Pausar";
      display.style.color = "";
      timerInterval = setInterval(tick, 1000);
    }
  }

  function pauseTimer() {
    if (isRunning) {
      isRunning = false;
      btnToggle.textContent = "▶ Reanudar";
      clearInterval(timerInterval);
    }
  }

  function resetTimer() {
    pauseTimer();
    remainingSeconds = totalSeconds;
    btnToggle.textContent = "▶ Iniciar";
    display.style.color = "";
    renderDisplay();
  }

  btnToggle.addEventListener("click", () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  btnReset.addEventListener("click", resetTimer);

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const minutes = parseInt(btn.getAttribute("data-minutes"), 10);
      totalSeconds = minutes * 60;
      resetTimer();
    });
  });

  renderDisplay();
}

// 7. Módulo Especial: Simulador de Gemini Canvas Lab (Todas las Posibilidades)
// Los 12 modos (prompts, datos y criterios) viven en js/canvas-possibilities.js.

function initCanvasLab() {
  const tabs = document.querySelectorAll(".canvas-tab[data-possibility]");
  const userPromptEl = document.getElementById("sim-user-prompt");
  const aiResponseEl = document.getElementById("sim-ai-response");
  const docIconEl = document.getElementById("sim-doc-icon");
  const docTitleEl = document.getElementById("sim-doc-title");
  const quickActionsEl = document.getElementById("sim-quick-actions");
  const resultImgEl = document.getElementById("sim-result-image");
  const imgCaptionEl = document.getElementById("sim-image-caption");
  const interactiveContentEl = document.getElementById("sim-interactive-content");
  const insightsContentEl = document.getElementById("sim-insights-content");
  const promptVariationEl = document.getElementById("sim-prompt-variation");
  const followUpsEl = document.getElementById("sim-followups");
  const calibrationLiveSlotEl = document.getElementById("sim-calibration-live-slot");
  const variationLiveSlotEl = document.getElementById("sim-variation-live-slot");
  const btnApplyVariation = document.getElementById("btn-sim-apply-variation");
  const btnCopyVariation = document.getElementById("btn-sim-copy-variation");
  const transformBtns = document.querySelectorAll("[data-sim-transform]");
  const viewModeBtns = document.querySelectorAll(".view-mode-btn");
  const viewPanels = {
    image: document.getElementById("panel-image-view"),
    interactive: document.getElementById("panel-interactive-view"),
    insights: document.getElementById("panel-insights-view")
  };
  let currentSimulatorMode = "doc-editorial";
  let currentTransformType = "artifact";
  let isVariationApplied = false;

  if (!tabs.length || !userPromptEl) return;

  function wireSimulatorInteractiveControls(modeId) {
    if (!interactiveContentEl) return;

    // Modo 3: Sensibilidad de Matriz
    interactiveContentEl.querySelectorAll("[data-sim-matrix-scenario]").forEach(btn => {
      btn.addEventListener("click", () => {
        interactiveContentEl.querySelectorAll("[data-sim-matrix-scenario]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const sc = btn.getAttribute("data-sim-matrix-scenario");
        const statusEl = document.getElementById("demo-matrix-live-status");
        if (statusEl) {
          statusEl.innerHTML = sc === "variation"
            ? "<strong>Variación activa (Soporte B = 9):</strong> Proveedor A = <strong>88,0 (Recomendado)</strong> · Proveedor B sube a <strong>85,0 (Recomendado)</strong> · Diferencia reducida a 3,0 puntos."
            : "Fórmula: suma de (calificación × peso) ÷ 10. Se recomienda el Proveedor A, que supera al Proveedor B por 6,0 puntos.";
        }
      });
    });

    // Modo 4: Recorrido de Flujograma
    interactiveContentEl.querySelectorAll("[data-sim-flow-path]").forEach(btn => {
      btn.addEventListener("click", () => {
        interactiveContentEl.querySelectorAll("[data-sim-flow-path]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const pathKey = btn.getAttribute("data-sim-flow-path");
        const activeNodes = pathKey === "no"
          ? ["P1", "P2", "D1", "P4", "P5", "P6", "P7", "P8"]
          : ["P1", "P2", "D1", "P3", "P7", "P8"];
        const traceEl = document.getElementById("demo-flow-trace-output");
        if (traceEl) {
          traceEl.textContent = pathKey === "no"
            ? "Ruta activa: Escalado a Nivel 2 (P1 → P2 → D1 [No] → P4 → P5 → P6 → P7 → P8 · 8 nodos visitados)."
            : "Ruta activa: Resuelto en Nivel 1 (P1 → P2 → D1 [Sí] → P3 → P7 → P8 · 6 nodos visitados).";
        }
        interactiveContentEl.querySelectorAll("[data-flow-node]").forEach(badge => {
          const nid = badge.getAttribute("data-flow-node");
          badge.style.opacity = activeNodes.includes(nid) ? "1" : "0.35";
        });
      });
    });

    // Modo 6: Edición por Selección e Historial
    interactiveContentEl.querySelectorAll("[data-sim-inline-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        interactiveContentEl.querySelectorAll("[data-sim-inline-view]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const view = btn.getAttribute("data-sim-inline-view");
        const col1 = document.getElementById("demo-inline-col-v1");
        const col2 = document.getElementById("demo-inline-col-v2");
        const noteEl = document.getElementById("demo-inline-live-note");
        if (col1) col1.style.display = view === "v2" ? "none" : "";
        if (col2) col2.style.display = view === "v1" ? "none" : "";
        if (noteEl) {
          noteEl.textContent = view === "v1"
            ? "Versión 1 (Original): el punto 3 tiene una sola oración punitiva antes de usar la edición por selección."
            : view === "v2"
              ? "Versión 2 (Editada): solo el punto 3 cambió a 2 viñetas claras conservando los dos días hábiles."
              : "Mostrando comparativa: los puntos 1, 2 y 4 permanecen intactos; solo cambia el Punto 3.";
        }
      });
    });

    // Modo 7: Lotes de prueba en Python O(n)
    interactiveContentEl.querySelectorAll("[data-sim-algo-case]").forEach(btn => {
      btn.addEventListener("click", () => {
        interactiveContentEl.querySelectorAll("[data-sim-algo-case]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const caseKey = btn.getAttribute("data-sim-algo-case");
        const outEl = document.getElementById("demo-algo-live-output");
        if (!outEl || typeof canvasClassifyDeliveries !== "function") return;
        if (caseKey === "empty") {
          outEl.innerHTML = `<strong>Salida con lista vacía []:</strong><br><code>{'al_dia': [], 'en_progreso': [], 'apoyo': []}</code>`;
        } else if (caseKey === "boundaries") {
          const bRes = canvasClassifyDeliveries([
            { documento: "1", nombre: "N0", puntaje: 0.0 },
            { documento: "2", nombre: "N49_9", puntaje: 49.9 },
            { documento: "3", nombre: "N50", puntaje: 50.0 },
            { documento: "4", nombre: "N69_9", puntaje: 69.9 },
            { documento: "5", nombre: "N70", puntaje: 70.0 }
          ]);
          outEl.innerHTML = `<strong>Salida con los 5 límites exactos:</strong><br><code>{'al_dia': ['${bRes.al_dia.join("', '")}'], 'en_progreso': ['${bRes.en_progreso.join("', '")}'], 'apoyo': ['${bRes.apoyo.join("', '")}']}</code>`;
        } else {
          outEl.innerHTML = `<strong>Salida esperada con la entrada de ejemplo:</strong><br><code>{'al_dia': ['Ana', 'Iván'], 'en_progreso': ['Luis', 'Marta'], 'apoyo': ['Jorge', 'Sara']}</code>`;
        }
      });
    });

    // Modo 8: Calibración de Rúbrica
    interactiveContentEl.querySelectorAll("[data-sim-rubric-case]").forEach(btn => {
      btn.addEventListener("click", () => {
        interactiveContentEl.querySelectorAll("[data-sim-rubric-case]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const rKey = btn.getAttribute("data-sim-rubric-case");
        const calcEl = document.getElementById("demo-rubric-live-calc");
        if (!calcEl) return;
        const map = {
          calibration: "<strong>Caso para calibrar:</strong> 4,8 × 0,30 + 3,5 × 0,35 + 4,0 × 0,35 = 1,44 + 1,225 + 1,40 = 4,065 ≈ 4,1 (Bueno)",
          excellent: "<strong>Caso sobresaliente:</strong> 5,0 × 0,30 + 4,6 × 0,35 + 4,8 × 0,35 = 1,50 + 1,61 + 1,68 = 4,790 ≈ 4,8 (Excelente)",
          support: "<strong>Caso con refuerzo:</strong> 2,5 × 0,30 + 2,8 × 0,35 + 3,0 × 0,35 = 0,75 + 0,98 + 1,05 = 2,780 ≈ 2,8 (Requiere refuerzo)"
        };
        calcEl.innerHTML = map[rKey] || map.calibration;
      });
    });

    // Modo 9: Simulador de JOIN y NULLIF en SQL
    interactiveContentEl.querySelectorAll("[data-sim-sql-mode]").forEach(btn => {
      btn.addEventListener("click", () => {
        interactiveContentEl.querySelectorAll("[data-sim-sql-mode]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const sKey = btn.getAttribute("data-sim-sql-mode");
        const fbEl = document.getElementById("demo-sql-live-feedback");
        if (!fbEl) return;
        if (sKey === "inner-join") {
          fbEl.textContent = "⚠️ Con INNER JOIN: Sara desaparece del reporte (quedan solo 4 filas) porque no tiene registros en registro_asistencia.";
        } else if (sKey === "no-nullif") {
          fbEl.textContent = "❌ Sin NULLIF: la consulta lanza ERROR: division by zero al calcular el porcentaje de Sara (total = 0).";
        } else {
          fbEl.textContent = "Estado: LEFT JOIN conserva a Sara (puesto 1 en ficha 2872 con promedio 4,9) y NULLIF devuelve NULL sin fallar.";
        }
      });
    });

    // Modo 10: Simulador de Decisión del Comité
    interactiveContentEl.querySelectorAll("[data-sim-report-state]").forEach(btn => {
      btn.addEventListener("click", () => {
        interactiveContentEl.querySelectorAll("[data-sim-report-state]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const stKey = btn.getAttribute("data-sim-report-state");
        const decEl = document.getElementById("demo-report-live-decision");
        if (!decEl || typeof canvasReportDecision !== "function") return;
        if (stKey === "remediated") {
          decEl.innerHTML = `<strong>Decisión tras subsanar INF-1 (VERDE):</strong> ${canvasReportDecision([{ risk: { color: "VERDE" } }, { risk: { color: "ÁMBAR" } }])}`;
        } else {
          decEl.innerHTML = `<strong>Decisión:</strong> ${canvasReportDecision([{ risk: { color: "ROJO" } }])}`;
        }
      });
    });

    // Cuestionario interactivo en vivo (Vista Cuestionario)
    interactiveContentEl.querySelectorAll("[data-sim-quiz-answer]").forEach(btn => {
      btn.addEventListener("click", () => {
        const fb = btn.getAttribute("data-sim-quiz-feedback");
        const fbEl = document.getElementById("sim-quiz-live-feedback");
        if (fbEl && fb) fbEl.textContent = fb;
      });
    });
  }

  function renderInteractiveTransform(modeId, transformType) {
    currentTransformType = transformType || "artifact";
    transformBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-sim-transform") === currentTransformType);
    });
    if (interactiveContentEl) {
      interactiveContentEl.innerHTML = typeof buildCanvasTransformPreviewHtml === "function"
        ? buildCanvasTransformPreviewHtml(modeId, currentTransformType)
        : (CANVAS_POSSIBILITIES[modeId] ? CANVAS_POSSIBILITIES[modeId].interactiveHtml : "");
      wireSimulatorInteractiveControls(modeId);
    }
    if (typeof window.refreshCanvasCalibration === "function") {
      window.refreshCanvasCalibration();
    }
  }

  transformBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tType = btn.getAttribute("data-sim-transform");
      renderInteractiveTransform(currentSimulatorMode, tType);
    });
  });

  if (btnApplyVariation) {
    btnApplyVariation.addEventListener("click", () => {
      if (typeof simulateVariationForMode !== "function") return;
      const data = CANVAS_POSSIBILITIES[currentSimulatorMode];
      const sim = simulateVariationForMode(currentSimulatorMode);
      isVariationApplied = !isVariationApplied;
      if (isVariationApplied) {
        if (variationLiveSlotEl) variationLiveSlotEl.innerHTML = sim.deltaHtml;
        if (aiResponseEl) aiResponseEl.textContent = sim.aiFollowUp;
        btnApplyVariation.textContent = "↺ Restaurar estado original";
        const interactiveTabBtn = document.querySelector('.view-mode-btn[data-mode="interactive"]');
        if (interactiveTabBtn && !interactiveTabBtn.classList.contains("active")) {
          interactiveTabBtn.click();
        }
        showCanvasToast("⚡ Variación simulada en el lienzo interactivo.");
      } else {
        if (variationLiveSlotEl) variationLiveSlotEl.innerHTML = "";
        if (aiResponseEl && data) aiResponseEl.textContent = data.aiResponse;
        btnApplyVariation.textContent = "⚡ Simular variación en el lienzo";
        showCanvasToast("↺ Lienzo restaurado al estado original del prompt.");
      }
    });
  }

  if (btnCopyVariation) {
    btnCopyVariation.addEventListener("click", () => {
      if (typeof simulateVariationForMode !== "function") return;
      const sim = simulateVariationForMode(currentSimulatorMode);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(sim.promptCommand).then(() => {
          showCanvasToast("📋 Instrucción de variación copiada al portapapeles.");
        });
      }
    });
  }

  function loadPossibility(id) {
    const data = CANVAS_POSSIBILITIES[id];
    if (!data) return;
    currentSimulatorMode = id;
    isVariationApplied = false;
    if (variationLiveSlotEl) variationLiveSlotEl.innerHTML = "";
    if (btnApplyVariation) btnApplyVariation.textContent = "⚡ Simular variación en el lienzo";

    // Actualizar chat
    userPromptEl.textContent = data.userPrompt;
    aiResponseEl.textContent = data.aiResponse;
    if (followUpsEl) {
      followUpsEl.innerHTML = buildCanvasFollowUpsHtml(data.followUps);
    }
    if (promptVariationEl) {
      promptVariationEl.textContent = data.variationTip;
    }

    // Actualizar título de documento
    if (docIconEl) docIconEl.textContent = data.docIcon;
    if (docTitleEl) docTitleEl.textContent = data.docTitle;

    // Renderizar botones de acción rápida
    if (quickActionsEl) {
      quickActionsEl.innerHTML = "";
      data.quickActions.forEach(act => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `canvas-action-pill ${act.class || ""}`;
        btn.id = act.id;
        btn.textContent = act.label;
        btn.addEventListener("click", () => handleQuickAction(act, id));
        quickActionsEl.appendChild(btn);
      });
    }

    // Actualizar imagen y caption
    if (resultImgEl) {
      resultImgEl.src = data.image;
      resultImgEl.alt = data.name;
    }
    if (imgCaptionEl) {
      imgCaptionEl.textContent = data.imageCaption;
    }

    // Actualizar contenido interactivo y controles en vivo
    renderInteractiveTransform(id, "artifact");
    if (calibrationLiveSlotEl && typeof window.refreshCanvasCalibration === "function") {
      window.refreshCanvasCalibration();
    }

    // Actualizar lista de verificación y claves de éxito
    if (insightsContentEl) {
      insightsContentEl.innerHTML = buildCanvasChecklistHtml(data.expected) + data.insightsHtml;
      const checklist = insightsContentEl.querySelector(".sim-checklist");
      if (checklist) {
        checklist.querySelectorAll(".canvas-exercise-check").forEach(check => {
          check.addEventListener("change", () => updateExerciseProgress(checklist));
        });
        checklist.querySelector("[data-exercise-reset]").addEventListener("click", () => {
          checklist.querySelectorAll(".canvas-exercise-check").forEach(c => { c.checked = false; });
          updateExerciseProgress(checklist);
        });
      }
    }

    // Actualizar ejercicios prácticos del modo y el puente ejemplo <-> ejercicios
    renderCanvasExercises(id);
    renderCanvasSimBridge(id);
    updateCanvasTabBadges();
  }

  const simBridgeEl = document.getElementById("canvas-sim-bridge");
  const modeTransitionBannerEl = document.getElementById("canvas-mode-transition-banner");

  function updateCanvasTabBadges() {
    if (typeof CANVAS_EXERCISES === "undefined" || typeof modeExerciseProgress !== "function") return;
    const completed = readCanvasCompleted();
    tabs.forEach(tab => {
      const pId = tab.getAttribute("data-possibility");
      if (!pId) return;
      const stats = modeExerciseProgress(pId, CANVAS_EXERCISES, completed);
      if (!stats.total) return;
      let badge = tab.querySelector(".canvas-tab-progress");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "canvas-tab-progress";
        tab.appendChild(badge);
      }
      badge.textContent = stats.allDone ? "✓" : `${stats.done}/${stats.total}`;
      badge.classList.toggle("is-complete", stats.allDone);
      badge.title = `${stats.done} de ${stats.total} ejercicios completados`;
    });
  }

  function renderCanvasSimBridge(id) {
    if (!simBridgeEl || typeof CANVAS_EXERCISES === "undefined" || typeof modeExerciseProgress !== "function") return;
    const list = CANVAS_EXERCISES[id] || [];
    const data = CANVAS_POSSIBILITIES[id];
    if (!list.length || !data) {
      simBridgeEl.innerHTML = "";
      return;
    }
    const completed = readCanvasCompleted();
    const stats = modeExerciseProgress(id, CANVAS_EXERCISES, completed);
    const nextLetter = "ABC"[stats.nextIndex] || "A";
    const nextEx = list[stats.nextIndex] || list[0];
    const partBtns = list.map((ex, idx) => {
      const letter = "ABC"[idx] || "A";
      const isDone = completed.includes(ex.id);
      return `<button type="button" class="canvas-bridge-part-btn${isDone ? " is-done" : ""}" data-bridge-mode="${escapeCanvasHtml(id)}" data-bridge-index="${idx}">${isDone ? "✓ " : ""}Parte ${letter}: ${escapeCanvasHtml(ex.title)}</button>`;
    }).join("");

    const ctaLabel = stats.allDone
      ? `🔁 Repasar Parte A de este modo →`
      : `🧪 Practicar ahora: Parte ${nextLetter} (${escapeCanvasHtml(nextEx.code)}) →`;

    const labInfo = typeof getSpecializedLabForMode === "function" ? getSpecializedLabForMode(id) : null;
    const labBtnHtml = labInfo
      ? `<button type="button" class="canvas-bridge-part-btn" data-bridge-lab="${escapeCanvasHtml(labInfo.targetId)}">${escapeCanvasHtml(labInfo.label)} →</button>`
      : "";

    simBridgeEl.innerHTML = `
      <div class="canvas-sim-bridge-info">
        <span class="canvas-sim-bridge-tag">Paso siguiente · Del ejemplo a tu práctica</span>
        <p class="canvas-sim-bridge-text">Ya viste cómo funciona <strong>${escapeCanvasHtml(data.name)}</strong> en el simulador. Completa los ejercicios de este modo (${stats.done} de ${stats.total} hechos):</p>
        <div class="canvas-sim-bridge-parts">${partBtns}${labBtnHtml}</div>
      </div>
      <div class="canvas-sim-bridge-cta">
        <button type="button" class="canvas-mode-pager-btn is-primary" data-bridge-mode="${escapeCanvasHtml(id)}" data-bridge-index="${stats.nextIndex}">${ctaLabel}</button>
      </div>
    `;

    simBridgeEl.querySelectorAll("[data-bridge-mode]").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetMode = btn.getAttribute("data-bridge-mode");
        const targetIdx = Number(btn.getAttribute("data-bridge-index"));
        if (modeTransitionBannerEl) modeTransitionBannerEl.hidden = true;
        openCanvasRoute(targetMode, targetIdx);
      });
    });

    simBridgeEl.querySelectorAll("[data-bridge-lab]").forEach(btn => {
      btn.addEventListener("click", () => {
        const labTargetId = btn.getAttribute("data-bridge-lab");
        applyImmersiveFocus(currentImmersiveFocus, "labs");
        setActiveGuidedStation("labs");
        const labEl = document.getElementById(labTargetId);
        if (labEl) requestAnimationFrame(() => labEl.scrollIntoView({ behavior: "smooth", block: "start" }));
      });
    });
  }

  function showSimulatorForModeTransition(step) {
    if (!step || !CANVAS_POSSIBILITIES[step.mode]) return;
    selectMode(step.mode);
    currentExerciseIndex = step.exercise;
    renderCanvasExercises(step.mode);
    const ex = (CANVAS_EXERCISES[step.mode] || [])[step.exercise];
    const modeInfo = CANVAS_POSSIBILITIES[step.mode];
    const letter = "ABC"[step.exercise] || "A";
    if (modeTransitionBannerEl && ex && modeInfo) {
      modeTransitionBannerEl.hidden = false;
      modeTransitionBannerEl.innerHTML = `
        <div class="canvas-transition-copy">
          <span class="canvas-transition-badge">🆕 Nuevo modo</span>
          <p>Pasaste a <strong>${escapeCanvasHtml(modeInfo.name)}</strong>. Revisa primero este ejemplo resuelto en el simulador y luego pasa al ejercicio <strong>${escapeCanvasHtml(ex.code)} (Parte ${letter})</strong>.</p>
        </div>
        <div class="canvas-transition-actions">
          <button type="button" class="canvas-mode-pager-btn is-primary" id="btn-transition-go-exercise">🧪 Practicar ${escapeCanvasHtml(ex.code)} →</button>
          <button type="button" class="canvas-exercise-reset" id="btn-transition-dismiss" aria-label="Ocultar aviso">Entendido</button>
        </div>
      `;
      const goBtn = document.getElementById("btn-transition-go-exercise");
      if (goBtn) {
        goBtn.addEventListener("click", () => {
          modeTransitionBannerEl.hidden = true;
          openCanvasRoute(step.mode, step.exercise);
        });
      }
      const dismissBtn = document.getElementById("btn-transition-dismiss");
      if (dismissBtn) {
        dismissBtn.addEventListener("click", () => {
          modeTransitionBannerEl.hidden = true;
        });
      }
    }
    const simEl = document.getElementById("canvas-simulator-module");
    if (simEl) requestAnimationFrame(() => simEl.scrollIntoView({ behavior: "smooth", block: "start" }));
    const route = buildCanvasRoute(step.mode, step.exercise);
    if (window.location.hash !== route) history.replaceState(null, "", route);
  }

  // --- Ejercicios prácticos por modo (datos en js/canvas-exercises.js) ---
  const exercisesContentEl = document.getElementById("canvas-exercises-content");
  const exercisesModeLabelEl = document.getElementById("canvas-exercises-mode-label");
  const exerciseSwitchBtns = document.querySelectorAll(".canvas-exercises-switch-btn");
  let currentExerciseMode = "doc-editorial";
  let currentExerciseIndex = 0;

  function updateExerciseProgress(card) {
    const checks = card.querySelectorAll(".canvas-exercise-check");
    const done = Array.from(checks).filter(c => c.checked).length;
    const progressEl = card.querySelector("[data-exercise-progress]");
    const barEl = card.querySelector("[data-exercise-bar]");
    if (progressEl) {
      progressEl.textContent = done === checks.length ? `${done}/${checks.length} · ¡Resultado completo!` : `${done}/${checks.length}`;
    }
    if (barEl) barEl.style.width = `${checks.length ? (done / checks.length) * 100 : 0}%`;
    const complete = checks.length > 0 && done === checks.length;
    card.classList.toggle("is-complete", complete);
    const exId = card.getAttribute("data-exercise-id");
    if (exId) {
      const partial = readCanvasStore("canvasPartialChecks", {});
      const store = partial && typeof partial === "object" ? partial : {};
      store[exId] = serializeChecks(Array.from(checks).map(c => c.checked));
      writeCanvasStore("canvasPartialChecks", store);
      const saved = readCanvasCompleted();
      const had = saved.includes(exId);
      if (complete && !had) writeCanvasCompleted(saved.concat(exId));
      if (!complete && had) writeCanvasCompleted(saved.filter(x => x !== exId));
      renderCanvasExerciseIndex();
      updateExercisePosition();
      renderCanvasSimBridge(currentExerciseMode);
      updateCanvasTabBadges();
    }
    if (exerciseDoneEl) exerciseDoneEl.hidden = !complete || !exerciseNextStep();
    if (typeof updateLearnerGuideHud === "function") updateLearnerGuideHud();
  }

  // Preferencias por navegador: modo visitado y ejercicios completados. Sin almacenamiento, todo sigue funcionando.
  function readCanvasStore(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }
  function writeCanvasStore(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (err) { /* sin almacenamiento */ }
  }
  function readCanvasCompleted() {
    const list = readCanvasStore("canvasCompletedExercises", []);
    return Array.isArray(list) ? list : [];
  }
  function writeCanvasCompleted(list) {
    writeCanvasStore("canvasCompletedExercises", list);
    writeCanvasStore("canvas_exercises_completed_v1", list);
    if (typeof window.refreshCanvasSubnavProgress === "function") {
      window.refreshCanvasSubnavProgress();
    }
    const covEl = document.getElementById("canvas-coverage-content");
    if (covEl && typeof buildCoverageTableHtml === "function") {
      covEl.innerHTML = buildCoverageTableHtml(
        CANVAS_EXERCISES,
        CANVAS_CAPABILITIES,
        typeof CANVAS_EXTRA_CAPABILITIES !== "undefined" ? CANVAS_EXTRA_CAPABILITIES : [],
        done
      );
    }
  }

  const exerciseIndexListEl = document.getElementById("canvas-exercise-index-list");
  const exerciseIndexCountEl = document.getElementById("canvas-exercise-index-count");
  function renderCanvasExerciseIndex() {
    if (!exerciseIndexListEl || typeof CANVAS_EXERCISES === "undefined") return;
    const done = readCanvasCompleted();
    writeCanvasStore("canvas_exercises_completed_v1", done);
    if (typeof window.refreshCanvasSubnavProgress === "function") {
      window.refreshCanvasSubnavProgress();
    }
    const covEl = document.getElementById("canvas-coverage-content");
    if (covEl && typeof buildCoverageTableHtml === "function") {
      covEl.innerHTML = buildCoverageTableHtml(
        CANVAS_EXERCISES,
        CANVAS_CAPABILITIES,
        typeof CANVAS_EXTRA_CAPABILITIES !== "undefined" ? CANVAS_EXTRA_CAPABILITIES : [],
        done
      );
    }
    const total = Object.values(CANVAS_EXERCISES).reduce((n, list) => n + list.length, 0);
    if (exerciseIndexCountEl) exerciseIndexCountEl.textContent = `(${done.length}/${total} completados)`;
    exerciseIndexListEl.innerHTML = Object.keys(CANVAS_POSSIBILITIES).map(mode => {
      const items = (CANVAS_EXERCISES[mode] || []).map((ex, i) => {
        const current = mode === currentExerciseMode && i === currentExerciseIndex;
        const mark = done.includes(ex.id) ? '<span class="canvas-index-done" aria-label="completado">✓</span> ' : "";
        return `<li><a href="${buildCanvasRoute(mode, i)}"${current ? ' aria-current="true"' : ""}>${mark}${"ABC"[i] || "A"}. ${escapeCanvasHtml(ex.title)}</a></li>`;
      }).join("");
      return `<li><span class="canvas-index-mode">${escapeCanvasHtml(CANVAS_POSSIBILITIES[mode].name)}</span><ul>${items}</ul></li>`;
    }).join("");
  }

  function renderCanvasExercises(id) {
    if (!exercisesContentEl || typeof CANVAS_EXERCISES === "undefined") return;
    const list = CANVAS_EXERCISES[id];
    if (!list) return;
    if (id !== currentExerciseMode) {
      currentExerciseMode = id;
      currentExerciseIndex = 0;
    }
    if (!list[currentExerciseIndex]) currentExerciseIndex = 0;
    const exercise = list[currentExerciseIndex];
    if (exercisesModeLabelEl && CANVAS_POSSIBILITIES[id]) {
      exercisesModeLabelEl.textContent = CANVAS_POSSIBILITIES[id].name;
    }
    exerciseSwitchBtns.forEach(btn => {
      const btnIndex = Number(btn.getAttribute("data-exercise-index"));
      btn.hidden = btnIndex >= list.length;
      const active = btnIndex === currentExerciseIndex;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    exercisesContentEl.innerHTML = buildCanvasExerciseHtml(exercise, currentExerciseIndex, id);

    const card = exercisesContentEl.querySelector(".canvas-exercise-card");
    if (!card) return;
    const goSimBtn = card.querySelector("[data-go-simulator]");
    if (goSimBtn) {
      goSimBtn.addEventListener("click", () => {
        const targetMode = goSimBtn.getAttribute("data-go-simulator") || currentExerciseMode;
        if (targetMode && CANVAS_POSSIBILITIES[targetMode]) {
          selectMode(targetMode);
        }
        applyImmersiveFocus(currentImmersiveFocus, "simulator");
        setActiveGuidedStation("simulator");
        const simEl = document.getElementById("canvas-simulator-module");
        if (simEl) requestAnimationFrame(() => simEl.scrollIntoView({ behavior: "smooth", block: "start" }));
      });
    }
    const stepperItems = card.querySelectorAll(".canvas-exercise-stepper .stepper-item");
    const stepChecks = card.querySelectorAll(".canvas-step-done");
    const syncStepper = () => {
      const doneSteps = Array.from(stepChecks).filter(c => c.checked).length;
      const allStepsDone = stepChecks.length > 0 && doneSteps === stepChecks.length;
      if (stepperItems.length >= 4) {
        stepperItems[1].classList.toggle("is-done", doneSteps > 0);
        stepperItems[1].classList.toggle("is-current", doneSteps === 0);
        stepperItems[2].classList.toggle("is-done", allStepsDone);
        stepperItems[2].classList.toggle("is-current", doneSteps > 0 && !allStepsDone);
        stepperItems[3].classList.toggle("is-current", allStepsDone);
      }
      if (typeof updateLearnerGuideHud === "function") updateLearnerGuideHud();
    };
    stepChecks.forEach(sc => {
      sc.addEventListener("change", () => {
        const li = sc.closest(".canvas-exercise-step");
        if (li) li.classList.toggle("is-step-done", sc.checked);
        syncStepper();
      });
    });
    card.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", () => {
        const kind = btn.getAttribute("data-copy");
        navigator.clipboard.writeText(canvasCopyText(exercise, kind)).then(() => {
          showCanvasToast(kind === "reference"
            ? "📋 Código copiado: pégalo en el chat de la izquierda para verlo en la vista previa."
            : "📋 Prompt copiado: pégalo en Gemini con Canvas activo.");
        });
      });
    });
    card.querySelectorAll(".canvas-exercise-check").forEach(check => {
      check.addEventListener("change", () => updateExerciseProgress(card));
    });
    const resetBtn = card.querySelector("[data-exercise-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        card.querySelectorAll(".canvas-exercise-check").forEach(c => { c.checked = false; });
        updateExerciseProgress(card);
      });
    }
    const cardChecks = Array.from(card.querySelectorAll(".canvas-exercise-check"));
    const partialStore = readCanvasStore("canvasPartialChecks", {}) || {};
    const restored = readCanvasCompleted().includes(exercise.id)
      ? cardChecks.map(() => true)
      : parseChecks(partialStore[exercise.id], cardChecks.length);
    cardChecks.forEach((c, i) => { c.checked = restored[i]; });
    updateExerciseProgress(card);
    updateExercisePager();
  }

  exerciseSwitchBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentExerciseIndex = Number(btn.getAttribute("data-exercise-index"));
      renderCanvasExercises(currentExerciseMode);
      history.replaceState(null, "", buildCanvasRoute(currentExerciseMode, currentExerciseIndex));
    });
  });

  // --- Recorrido lineal de todos los ejercicios: anterior, siguiente, posición y retomar ---
  const exerciseSequence = listExerciseSequence(Object.keys(CANVAS_POSSIBILITIES), CANVAS_EXERCISES);
  const pagerBtns = document.querySelectorAll("#canvas-exercise-prev, #canvas-exercise-next");
  const exerciseDoneEl = document.getElementById("canvas-exercise-done");
  const exerciseDoneNextBtn = document.getElementById("canvas-exercise-done-next");
  const positionEl = document.getElementById("canvas-exercise-position");
  const continueBtn = document.getElementById("canvas-continue-btn");

  function stepLabel(step) {
    const pos = exercisePosition(exerciseSequence, step.mode, step.exercise);
    return `${pos.number}. ${CANVAS_EXERCISES[step.mode][step.exercise].title}`;
  }
  function exerciseNextStep() {
    return neighborExercise(exerciseSequence, currentExerciseMode, currentExerciseIndex, 1);
  }
  function updateExercisePosition() {
    if (!positionEl) return;
    const pos = exercisePosition(exerciseSequence, currentExerciseMode, currentExerciseIndex);
    if (!pos) return;
    const done = readCanvasCompleted().length;
    positionEl.querySelector("[data-position-label]").textContent = `Ejercicio ${pos.number} de ${pos.total} · ${CANVAS_POSSIBILITIES[currentExerciseMode].name} · Parte ${"ABC"[currentExerciseIndex] || "A"}`;
    positionEl.querySelector("[data-position-bar]").style.width = `${(done / pos.total) * 100}%`;
    positionEl.querySelector("[data-position-done]").textContent = `${done} de ${pos.total} completados`;
    if (continueBtn) {
      const pending = firstPendingExercise(exerciseSequence, readCanvasCompleted());
      continueBtn.hidden = !pending;
      continueBtn.title = pending ? `Abre: ${stepLabel(pending)}` : "";
    }
  }
  function updateExercisePager() {
    pagerBtns.forEach(btn => {
      const target = neighborExercise(exerciseSequence, currentExerciseMode, currentExerciseIndex, Number(btn.getAttribute("data-direction")));
      btn.disabled = !target;
      const label = btn.querySelector("span");
      if (label) label.textContent = target ? stepLabel(target) : (btn.id === "canvas-exercise-prev" ? "Es el primer ejercicio" : "Es el último ejercicio");
      btn.dataset.target = target ? `${target.mode}|${target.exercise}` : "";
    });
    updateExercisePosition();
  }
  function goToStep(step) {
    if (!step) return;
    if (typeof isModeTransition === "function" && isModeTransition(currentExerciseMode, step.mode)) {
      showSimulatorForModeTransition(step);
      return;
    }
    openCanvasRoute(step.mode, step.exercise);
  }
  pagerBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (!btn.dataset.target) return;
      const [mode, exercise] = btn.dataset.target.split("|");
      goToStep({ mode, exercise: Number(exercise) });
    });
  });
  if (exerciseDoneNextBtn) exerciseDoneNextBtn.addEventListener("click", () => goToStep(exerciseNextStep()));
  if (continueBtn) {
    continueBtn.addEventListener("click", () => goToStep(firstPendingExercise(exerciseSequence, readCanvasCompleted())));
  }

  // --- Control de Modales Accesibles (WAI-ARIA Dialog) ---
  const modalBackdrops = document.querySelectorAll(".canvas-modal-backdrop");
  let lastActiveElement = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    lastActiveElement = document.activeElement;
    modal.removeAttribute("hidden");
    void modal.offsetWidth; // Forzar reflow para animación
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";

    const focusable = modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if (focusable.length) {
      focusable[0].focus();
    }
  }

  function closeModal(modalId) {
    const modal = typeof modalId === "string" ? document.getElementById(modalId) : modalId;
    if (!modal) return;
    modal.classList.remove("is-open");
    setTimeout(() => {
      modal.setAttribute("hidden", "");
      const anyOpen = document.querySelector(".canvas-modal-backdrop.is-open");
      const isFullscreen = document.getElementById("canvas-simulator-module")?.classList.contains("is-fullscreen");
      if (!anyOpen && !isFullscreen) {
        document.body.style.overflow = "";
      }
      if (lastActiveElement && typeof lastActiveElement.focus === "function") {
        lastActiveElement.focus();
      }
    }, 200);
  }

  // Cerrar modales con clic en fondo o botón ✕
  modalBackdrops.forEach(backdrop => {
    backdrop.addEventListener("click", e => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
    const closeBtn = backdrop.querySelector(".canvas-modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => closeModal(backdrop));
    }
  });

  // Tecla Escape para modales y modo inmersivo
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      const openModalEl = document.querySelector(".canvas-modal-backdrop.is-open");
      if (openModalEl) {
        closeModal(openModalEl);
      } else {
        const canvasSec = document.getElementById("gemini-canvas");
        const simMod = document.getElementById("canvas-simulator-module");
        const dia3Sec = document.getElementById("dia-3");
        if ((canvasSec && canvasSec.classList.contains("is-immersive")) || (simMod && simMod.classList.contains("is-fullscreen"))) {
          toggleFullscreen({ forceState: false });
        } else if (dia3Sec && dia3Sec.classList.contains("is-immersive")) {
          const exitDia3 = document.getElementById("btn-dia3-hud-exit");
          if (exitDia3) exitDia3.click();
        }
      }
    }
  });

  // --- Modo Inmersivo Unificado (Simulador + Ejercicios Prácticos + Laboratorios) y Ruta Guiada ---
  const canvasPageSection = document.getElementById("gemini-canvas");
  const btnFullscreen = document.getElementById("btn-toggle-canvas-fullscreen");
  const btnExercisesFullscreen = document.getElementById("btn-toggle-exercises-fullscreen");
  const btnHudImmersive = document.getElementById("btn-hud-toggle-immersive");
  const btnMmFullscreen = document.getElementById("btn-toggle-mm-fullscreen");
  const btnGemFullscreen = document.getElementById("btn-toggle-gem-fullscreen");
  const simModule = document.getElementById("canvas-simulator-module");
  const exModule = document.getElementById("canvas-exercises-module");
  const focusBtns = document.querySelectorAll("[data-immersive-focus]");
  const stationBtns = document.querySelectorAll("[data-guide-target]");
  const immersiveModeSelectEl = document.getElementById("immersive-mode-select");
  const btnImmersiveToggleTools = document.getElementById("btn-immersive-toggle-tools");
  let currentImmersiveFocus = "all";

  if (immersiveModeSelectEl) {
    immersiveModeSelectEl.addEventListener("change", () => {
      const nextMode = immersiveModeSelectEl.value;
      if (nextMode && CANVAS_POSSIBILITIES[nextMode]) {
        selectMode(nextMode);
        history.replaceState(null, "", buildCanvasRoute(nextMode));
      }
    });
  }

  if (btnImmersiveToggleTools && canvasPageSection) {
    btnImmersiveToggleTools.addEventListener("click", () => {
      const shown = canvasPageSection.classList.toggle("show-immersive-tools");
      btnImmersiveToggleTools.classList.toggle("active", shown);
      btnImmersiveToggleTools.setAttribute("aria-pressed", String(shown));
    });
  }

  function syncImmersiveButtons(isFull) {
    [btnFullscreen, btnExercisesFullscreen, btnHudImmersive, btnMmFullscreen, btnGemFullscreen].forEach(btn => {
      if (!btn) return;
      btn.innerHTML = isFull ? "✕ Salir de Modo Inmersivo" : "⛶ Modo Inmersivo";
      btn.style.background = isFull ? "var(--color-primary)" : "";
      btn.style.color = isFull ? "#ffffff" : "";
    });
  }

  function setActiveGuidedStation(sectionName) {
    stationBtns.forEach(btn => {
      const active = btn.getAttribute("data-guide-target") === sectionName;
      btn.classList.toggle("is-active", active);
    });
  }

  function applyImmersiveFocus(requestedFocus, targetSection) {
    const resolved = typeof resolveImmersiveFocus === "function"
      ? resolveImmersiveFocus(requestedFocus, targetSection)
      : (requestedFocus || "all");
    currentImmersiveFocus = resolved;
    if (canvasPageSection) {
      canvasPageSection.setAttribute("data-immersive-focus", resolved);
    }
    focusBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-immersive-focus") === resolved);
    });
  }

  function toggleFullscreen(options) {
    const opts = options && typeof options === "object" && !("target" in options) ? options : {};
    if (!simModule) return;
    const currentlyFull = simModule.classList.contains("is-fullscreen") ||
      Boolean(canvasPageSection && canvasPageSection.classList.contains("is-immersive"));
    const isFull = typeof opts.forceState === "boolean" ? opts.forceState : !currentlyFull;

    simModule.classList.toggle("is-fullscreen", isFull);
    if (exModule) exModule.classList.toggle("is-fullscreen", isFull);
    if (canvasPageSection) {
      canvasPageSection.classList.toggle("is-immersive", isFull);
      if (!isFull) {
        canvasPageSection.classList.remove("show-immersive-tools");
        if (btnImmersiveToggleTools) {
          btnImmersiveToggleTools.classList.remove("active");
          btnImmersiveToggleTools.setAttribute("aria-pressed", "false");
        }
      }
    }
    syncImmersiveButtons(isFull);
    document.body.style.overflow = isFull ? "hidden" : "";

    if (opts.focusMode || opts.targetSection) {
      applyImmersiveFocus(opts.focusMode || currentImmersiveFocus, opts.targetSection);
    }
    if (opts.targetSection) {
      setActiveGuidedStation(opts.targetSection);
    }
    if (opts.scrollTargetId) {
      const scrollEl = document.getElementById(opts.scrollTargetId);
      if (scrollEl) requestAnimationFrame(() => scrollEl.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    showCanvasToast(isFull
      ? "⛶ Modo inmersivo limpio activado: enfocado en lo esencial (pulsa Esc para salir)."
      : "Restaurada vista normal de la guía.");
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener("click", () => toggleFullscreen({ focusMode: "simulator", targetSection: "simulator", scrollTargetId: "canvas-simulator-module" }));
  }
  if (btnExercisesFullscreen) {
    btnExercisesFullscreen.addEventListener("click", () => toggleFullscreen({ focusMode: "exercises", targetSection: "exercises", scrollTargetId: "canvas-exercises-module" }));
  }
  if (btnHudImmersive) {
    btnHudImmersive.addEventListener("click", () => toggleFullscreen({ focusMode: currentImmersiveFocus === "all" ? "simulator" : currentImmersiveFocus }));
  }
  if (btnMmFullscreen) {
    btnMmFullscreen.addEventListener("click", () => {
      if (currentExerciseMode !== "multimodal-vision") selectMode("multimodal-vision");
      toggleFullscreen({ forceState: true, targetSection: "labs", scrollTargetId: "multimodal-simulator-module" });
    });
  }
  if (btnGemFullscreen) {
    btnGemFullscreen.addEventListener("click", () => {
      if (currentExerciseMode !== "gem-studio") selectMode("gem-studio");
      toggleFullscreen({ forceState: true, targetSection: "labs", scrollTargetId: "gem-studio-module" });
    });
  }

  focusBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const focusVal = btn.getAttribute("data-immersive-focus");
      applyImmersiveFocus(focusVal);
      if (focusVal === "simulator") setActiveGuidedStation("simulator");
      if (focusVal === "exercises") setActiveGuidedStation("exercises");
    });
  });

  stationBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetSec = btn.getAttribute("data-guide-target");
      applyImmersiveFocus(currentImmersiveFocus, targetSec);
      setActiveGuidedStation(targetSec);
      if (targetSec === "simulator" && simModule) {
        requestAnimationFrame(() => simModule.scrollIntoView({ behavior: "smooth", block: "start" }));
      } else if (targetSec === "exercises" && exModule) {
        requestAnimationFrame(() => exModule.scrollIntoView({ behavior: "smooth", block: "start" }));
      } else if (targetSec === "labs") {
        const labInfo = typeof getSpecializedLabForMode === "function" ? getSpecializedLabForMode(currentExerciseMode) : null;
        const labEl = document.getElementById(labInfo ? labInfo.targetId : "canvas-advanced-labs-anchor");
        if (labEl) requestAnimationFrame(() => labEl.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    });
  });

  // --- Brújula del Aprendiz y Barra de Ruta Guiada (HUD) ---
  const hudModeBadgeEl = document.getElementById("immersive-hud-mode-badge");
  const hudTitleEl = document.getElementById("immersive-hud-title");
  const hudProgressEl = document.getElementById("immersive-hud-progress");
  const stationExBadgeEl = document.getElementById("guide-station-ex-badge");
  const stationLabBtnEl = document.getElementById("btn-guide-station-lab");
  const compassPhaseEl = document.getElementById("canvas-compass-phase");
  const compassTextEl = document.getElementById("canvas-compass-text");
  const compassCtaEl = document.getElementById("canvas-compass-cta");

  function updateLearnerGuideHud() {
    if (typeof computeLearnerGuideState !== "function" || typeof CANVAS_EXERCISES === "undefined") return;
    const modeKeys = Object.keys(CANVAS_POSSIBILITIES);
    const modeIndex = Math.max(0, modeKeys.indexOf(currentExerciseMode));
    const list = CANVAS_EXERCISES[currentExerciseMode] || [];
    const ex = list[currentExerciseIndex] || list[0];
    if (!ex) return;

    const card = exercisesContentEl ? exercisesContentEl.querySelector(".canvas-exercise-card") : null;
    const stepChecks = card ? Array.from(card.querySelectorAll(".canvas-step-done")) : [];
    const critChecks = card ? Array.from(card.querySelectorAll(".canvas-exercise-check")) : [];
    const stepsDone = stepChecks.filter(c => c.checked).length;
    const checksDone = critChecks.filter(c => c.checked).length;

    const guideState = computeLearnerGuideState({
      mode: currentExerciseMode,
      modeIndex,
      totalModes: modeKeys.length,
      modeName: CANVAS_POSSIBILITIES[currentExerciseMode].name,
      exerciseIndex: currentExerciseIndex,
      totalExercisesInMode: list.length,
      exerciseCode: ex.code,
      exerciseTitle: ex.title,
      stepsDone,
      stepsTotal: stepChecks.length || (ex.steps ? ex.steps.length : 0),
      checksDone,
      checksTotal: critChecks.length || (ex.criteria ? ex.criteria.length : 0)
    });

    const completedCount = readCanvasCompleted().length;
    const totalCount = exerciseSequence.length;
    if (hudModeBadgeEl) hudModeBadgeEl.textContent = guideState.modeBadge;
    if (immersiveModeSelectEl) immersiveModeSelectEl.value = currentExerciseMode;
    if (hudTitleEl) hudTitleEl.textContent = `${CANVAS_POSSIBILITIES[currentExerciseMode].name} · Parte ${guideState.letter} (${ex.code})`;
    if (hudProgressEl) hudProgressEl.textContent = `${completedCount}/${totalCount} completados`;
    if (stationExBadgeEl) stationExBadgeEl.textContent = `Parte ${guideState.letter} (${ex.code})`;

    if (stationLabBtnEl) {
      if (guideState.specializedLab) {
        stationLabBtnEl.hidden = false;
        stationLabBtnEl.textContent = guideState.specializedLab.label;
      } else {
        stationLabBtnEl.hidden = true;
      }
    }

    if (compassPhaseEl) compassPhaseEl.textContent = `Fase ${guideState.phaseIndex} de ${guideState.totalPhases}`;
    if (compassTextEl) compassTextEl.textContent = guideState.headline;
    if (compassCtaEl) {
      compassCtaEl.textContent = guideState.ctaLabel;
      compassCtaEl.dataset.compassAction = guideState.ctaTarget;
    }
  }

  if (compassCtaEl) {
    compassCtaEl.addEventListener("click", () => {
      const action = compassCtaEl.dataset.compassAction;
      const list = CANVAS_EXERCISES[currentExerciseMode] || [];
      const ex = list[currentExerciseIndex] || list[0];
      if (action === "copy-and-practice" && ex) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(canvasCopyText(ex, "prompt")).then(() => {
            showCanvasToast(`📋 Prompt de ${ex.code} copiado. Sigue los pasos en el ejercicio.`);
          });
        }
        applyImmersiveFocus(currentImmersiveFocus, "exercises");
        setActiveGuidedStation("exercises");
        if (exModule) requestAnimationFrame(() => exModule.scrollIntoView({ behavior: "smooth", block: "start" }));
      } else if (action === "focus-steps" || action === "focus-checklist") {
        applyImmersiveFocus(currentImmersiveFocus, "exercises");
        setActiveGuidedStation("exercises");
        const selector = action === "focus-checklist" ? ".canvas-exercise-checklist" : ".canvas-exercise-steps";
        const target = (exercisesContentEl && exercisesContentEl.querySelector(selector)) || exModule;
        if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "start" }));
      } else if (action === "next-exercise") {
        goToStep(exerciseNextStep());
      }
    });
  }

  // --- Lightbox de Alta Resolución ---
  const imageWrapper = document.getElementById("sim-image-wrapper");
  const btnOpenLightbox = document.getElementById("btn-open-lightbox");
  const lightboxImg = document.getElementById("lightbox-image");
  const lightboxCaptionText = document.getElementById("lightbox-caption-text");
  const lightboxModalTitle = document.getElementById("lightbox-modal-title");
  const zoomIndicator = document.getElementById("lightbox-zoom-level");
  let currentZoom = 1.0;

  function updateZoom(newZoom) {
    currentZoom = Math.min(3.0, Math.max(0.5, newZoom));
    if (lightboxImg) {
      lightboxImg.style.transform = `scale(${currentZoom})`;
    }
    if (zoomIndicator) {
      zoomIndicator.textContent = `${Math.round(currentZoom * 100)}%`;
    }
  }

  function openLightbox() {
    if (!resultImgEl || !lightboxImg) return;
    lightboxImg.src = resultImgEl.src;
    lightboxImg.alt = resultImgEl.alt;
    if (lightboxCaptionText && imgCaptionEl) {
      lightboxCaptionText.textContent = imgCaptionEl.textContent;
    }
    if (lightboxModalTitle && docTitleEl) {
      lightboxModalTitle.textContent = `Captura en Detalle: ${docTitleEl.textContent}`;
    }
    updateZoom(1.0);
    openModal("modal-canvas-lightbox");
  }

  if (imageWrapper) {
    imageWrapper.addEventListener("click", openLightbox);
    imageWrapper.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox();
      }
    });
  }
  if (btnOpenLightbox) {
    btnOpenLightbox.addEventListener("click", openLightbox);
  }

  const btnZoomIn = document.getElementById("lightbox-zoom-in");
  const btnZoomOut = document.getElementById("lightbox-zoom-out");
  const btnZoomReset = document.getElementById("lightbox-zoom-reset");

  if (btnZoomIn) btnZoomIn.addEventListener("click", () => updateZoom(currentZoom + 0.25));
  if (btnZoomOut) btnZoomOut.addEventListener("click", () => updateZoom(currentZoom - 0.25));
  if (btnZoomReset) btnZoomReset.addEventListener("click", () => updateZoom(1.0));

  // --- Validador de Contraste WCAG 2.2 AA ---
  const fgColorInput = document.getElementById("calc-fg-color");
  const fgTextInput = document.getElementById("calc-fg-text");
  const bgColorInput = document.getElementById("calc-bg-color");
  const bgTextInput = document.getElementById("calc-bg-text");
  const contrastSample = document.getElementById("contrast-preview-sample");
  const contrastRatioText = document.getElementById("calc-contrast-ratio");
  const badgeAaNormal = document.getElementById("badge-aa-normal");
  const badgeAaLarge = document.getElementById("badge-aa-large");
  const badgeAaaNormal = document.getElementById("badge-aaa-normal");

  function hexToRgb(hex) {
    let clean = (hex || "").replace("#", "").trim();
    if (clean.length === 3) clean = clean.split("").map(c => c + c).join("");
    if (clean.length !== 6) return [0, 0, 0];
    const num = parseInt(clean, 16);
    return isNaN(num) ? [0, 0, 0] : [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  function getLuminance(rgb) {
    const a = rgb.map(v => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  function calcContrast(hex1, hex2) {
    const l1 = getLuminance(hexToRgb(hex1));
    const l2 = getLuminance(hexToRgb(hex2));
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  function updateContrastCalculation() {
    if (!fgColorInput || !bgColorInput || !contrastRatioText) return;
    const fg = fgColorInput.value;
    const bg = bgColorInput.value;
    const ratio = calcContrast(fg, bg);
    const formatted = ratio.toFixed(2);

    contrastRatioText.textContent = `${formatted} : 1`;

    if (contrastSample) {
      contrastSample.style.color = fg;
      contrastSample.style.backgroundColor = bg;
    }

    if (badgeAaNormal) {
      const pass = ratio >= 4.5;
      badgeAaNormal.className = `badge ${pass ? "badge-success" : "badge-danger"}`;
      badgeAaNormal.textContent = `${pass ? "✓" : "❌"} AA Normal (≥4.5)`;
    }
    if (badgeAaLarge) {
      const pass = ratio >= 3.0;
      badgeAaLarge.className = `badge ${pass ? "badge-success" : "badge-danger"}`;
      badgeAaLarge.textContent = `${pass ? "✓" : "❌"} AA Grande (≥3.0)`;
    }
    if (badgeAaaNormal) {
      const pass = ratio >= 7.0;
      badgeAaaNormal.className = `badge ${pass ? "badge-success" : "badge-warning"}`;
      badgeAaaNormal.textContent = `${pass ? "✓" : "⚠️"} AAA (≥7.0)`;
    }
  }

  if (fgColorInput && fgTextInput) {
    fgColorInput.addEventListener("input", () => {
      fgTextInput.value = fgColorInput.value.toUpperCase();
      updateContrastCalculation();
    });
    fgTextInput.addEventListener("input", () => {
      let v = fgTextInput.value.trim();
      if (!v.startsWith("#")) v = "#" + v;
      if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
        fgColorInput.value = v;
        updateContrastCalculation();
      }
    });
  }

  if (bgColorInput && bgTextInput) {
    bgColorInput.addEventListener("input", () => {
      bgTextInput.value = bgColorInput.value.toUpperCase();
      updateContrastCalculation();
    });
    bgTextInput.addEventListener("input", () => {
      let v = bgTextInput.value.trim();
      if (!v.startsWith("#")) v = "#" + v;
      if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
        bgColorInput.value = v;
        updateContrastCalculation();
      }
    });
  }

  // Copiar el prompt de imagen del modo 5 (el mismo que pide el prompt del simulador)
  const btnCopyImagen3 = document.getElementById("btn-copy-imagen3-full");
  if (btnCopyImagen3) {
    btnCopyImagen3.addEventListener("click", () => {
      navigator.clipboard.writeText(CANVAS_POSSIBILITIES["visual-mockup"].imagePrompt).then(() => {
        showCanvasToast("📋 Prompt de imagen copiado al portapapeles.");
      });
    });
  }

  // Copiar código en modal de código
  const btnCopyModalCode = document.getElementById("btn-copy-modal-code");
  if (btnCopyModalCode) {
    btnCopyModalCode.addEventListener("click", () => {
      const codeEl = document.getElementById("code-modal-content");
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent).then(() => {
          showCanvasToast("📋 Código copiado al portapapeles.");
        });
      }
    });
  }

  function openCodeModal(modal) {
    const codeTitle = document.getElementById("code-modal-title");
    const codeContent = document.getElementById("code-modal-content");
    const codeBadge = document.getElementById("code-modal-lang-badge");
    if (!codeContent) return;
    if (codeTitle) codeTitle.textContent = modal.title;
    if (codeBadge) codeBadge.textContent = modal.badge;
    codeContent.textContent = modal.content;
    openModal("modal-canvas-code");
  }

  // Las acciones rápidas se describen en js/canvas-possibilities.js: abren un modal con
  // material de referencia, muestran un aviso o ejecutan una acción especial del modo.
  function handleQuickAction(act, possibilityId) {
    const data = CANVAS_POSSIBILITIES[possibilityId];
    if (act.modal) {
      openCodeModal(act.modal);
    } else if (act.id === "act-mm-preview" || act.id === "act-gem-test") {
      const interactiveBtn = document.querySelector('.view-mode-btn[data-mode="interactive"]');
      if (interactiveBtn) {
        interactiveBtn.click();
      }
      showCanvasToast(act.toast);
    } else if (act.id === "act-gem-prompt") {
      const gemPrompt = (CANVAS_POSSIBILITIES["gem-studio"] && CANVAS_POSSIBILITIES["gem-studio"].userPrompt) || "";
      if (gemPrompt && navigator.clipboard) {
        navigator.clipboard.writeText(gemPrompt).then(() => {
          showCanvasToast("📋 System Prompt del Gem copiado al portapapeles.");
        });
      } else {
        showCanvasToast(act.toast);
      }
    } else if (act.action === "toggle-doc-length") {
      const summary = document.getElementById("doc-executive-summary");
      if (summary) {
        const isShort = summary.getAttribute("data-short") === "true";
        summary.toggleAttribute("data-short", !isShort);
        summary.innerHTML = `<strong>1. Resumen ejecutivo</strong>
          <p style="margin:0.3rem 0 0 0; font-size:0.88rem;">${data.lengthVariants[isShort ? 2 : 1]}</p>`;
        showCanvasToast(isShort ? "📏 Resumen en longitud estándar." : "📏 Resumen acortado, con las mismas cifras.");
      }
    } else if (act.action === "prompt-imagen3") {
      openModal("modal-canvas-imagen3");
    } else if (act.action === "check-contrast") {
      updateContrastCalculation();
      openModal("modal-canvas-contrast");
    } else if (act.action === "copy-css-tokens") {
      navigator.clipboard.writeText(data.cssTokens).then(() => {
        showCanvasToast("🎨 Tokens CSS de la paleta copiados al portapapeles.");
      });
    } else {
      showCanvasToast(act.toast);
    }
  }

  function showCanvasToast(msg) {
    let toast = document.getElementById("canvas-live-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "canvas-live-toast";
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--color-primary);
        color: white;
        padding: 10px 18px;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
    }, 2500);
  }

  // --- Filtrado por Categoría Funcional de Posibilidades ---
  const categoryFilterBtns = document.querySelectorAll('.category-pill[data-category]');
  categoryFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selectedCat = btn.getAttribute('data-category');
      
      tabs.forEach(tab => {
        const tabCat = tab.getAttribute('data-category');
        if (selectedCat === 'all' || tabCat === selectedCat) {
          tab.style.display = 'inline-flex';
        } else {
          tab.style.display = 'none';
        }
      });
    });
  });

  // Event listeners para pestañas de posibilidad
  function selectMode(pId) {
    tabs.forEach(t => {
      const active = t.getAttribute("data-possibility") === pId;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", String(active));
      if (active) t.style.display = "inline-flex";
    });
    loadPossibility(pId);
    writeCanvasStore("canvasLastMode", pId);
  }

  // Abre un modo y, si se indica, un ejercicio; lo usan las rutas profundas, el índice y el paginador.
  function openCanvasRoute(mode, exercise) {
    if (!CANVAS_POSSIBILITIES[mode]) return;
    if (mode !== currentExerciseMode || !document.querySelector(`.canvas-tab.active[data-possibility="${mode}"]`)) selectMode(mode);
    const hasExercise = Number.isInteger(exercise) && exercise >= 0 && exercise < (CANVAS_EXERCISES[mode] || []).length;
    if (hasExercise && exercise !== currentExerciseIndex) {
      currentExerciseIndex = exercise;
      renderCanvasExercises(mode);
    }
    const targetSection = hasExercise ? "exercises" : "simulator";
    applyImmersiveFocus(currentImmersiveFocus, targetSection);
    setActiveGuidedStation(targetSection);
    updateLearnerGuideHud();
    const target = document.getElementById(hasExercise ? "canvas-exercises-module" : "canvas-simulator-module");
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "start" }));
    const route = buildCanvasRoute(mode, hasExercise ? exercise : undefined);
    if (window.location.hash !== route) history.replaceState(null, "", route);
  }
  window.openCanvasRoute = openCanvasRoute;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const pId = tab.getAttribute("data-possibility");
      if (pId) {
        if (modeTransitionBannerEl) modeTransitionBannerEl.hidden = true;
        selectMode(pId);
        history.replaceState(null, "", buildCanvasRoute(pId));
      }
    });
  });

  // --- Matriz de Cobertura 100 % y Subnavegación Accesible ---
  const coverageContentEl = document.getElementById("canvas-coverage-content");
  if (coverageContentEl && typeof buildCoverageTableHtml === "function") {
    coverageContentEl.innerHTML = buildCoverageTableHtml(
      CANVAS_EXERCISES,
      CANVAS_CAPABILITIES,
      typeof CANVAS_EXTRA_CAPABILITIES !== "undefined" ? CANVAS_EXTRA_CAPABILITIES : [],
      readCanvasCompleted()
    );
  }
  if (typeof initCanvasSubnav === "function") {
    initCanvasSubnav(document, window);
  }

  // Reorganización de columnas arrastrando (Drag & Drop) y selector de disposición
  const splitContainerEl = document.querySelector(".canvas-split-container");
  if (splitContainerEl && typeof initColumnDnD === "function") {
    const splitDndApi = initColumnDnD(splitContainerEl, {
      storage: window.localStorage,
      storageKey: "canvas_split_columns_order",
      columns: Array.from(splitContainerEl.children)
    });

    const moveBtns = document.querySelectorAll(".btn-col-move");
    moveBtns.forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const targetId = btn.getAttribute("data-col-target");
        const dir = btn.getAttribute("data-col-move");
        if (splitDndApi && targetId && dir) splitDndApi.moveColumn(targetId, dir);
      });
    });

    const layoutSideBtn = document.getElementById("btn-split-layout-side");
    const layoutStackedBtn = document.getElementById("btn-split-layout-stacked");
    const storedLayout = readCanvasStore("canvasSplitLayout") || "side";

    function applyLayout(mode) {
      const isStacked = mode === "stacked";
      splitContainerEl.classList.toggle("is-stacked", isStacked);
      if (layoutSideBtn) layoutSideBtn.classList.toggle("active", !isStacked);
      if (layoutStackedBtn) layoutStackedBtn.classList.toggle("active", isStacked);
      writeCanvasStore("canvasSplitLayout", mode);
    }

    applyLayout(storedLayout);

    if (layoutSideBtn) layoutSideBtn.addEventListener("click", () => applyLayout("side"));
    if (layoutStackedBtn) layoutStackedBtn.addEventListener("click", () => applyLayout("stacked"));
  }

  // Event listeners para pestañas de modo de vista
  viewModeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      viewModeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const mode = btn.getAttribute("data-mode");

      Object.keys(viewPanels).forEach(key => {
        if (viewPanels[key]) {
          if (key === mode) {
            viewPanels[key].classList.add("active");
          } else {
            viewPanels[key].classList.remove("active");
          }
        }
      });
    });
  });

  // Cargar la posibilidad de la ruta, la última visitada o la primera
  const lastMode = readCanvasStore("canvasLastMode", null);
  selectMode(CANVAS_POSSIBILITIES[lastMode] ? lastMode : "doc-editorial");
  renderCanvasExerciseIndex();
  if (typeof window.applyHashRoute === "function") window.applyHashRoute();

  // Exponer a window para la Paleta de Comandos y pruebas
  window.openCanvasModal = openModal;
  window.closeCanvasModal = closeModal;
  window.openCanvasLightbox = openLightbox;
  window.toggleCanvasFullscreen = toggleFullscreen;
}

// Función global para filtrar la tabla de prueba en el demo de código
window.filterDemoTable = function() {
  const table = document.getElementById("demo-learners-table");
  if (!table) return;
  const query = (document.getElementById("demo-filter-input")?.value || "").toLowerCase().trim();
  const estado = document.getElementById("demo-filter-estado")?.value || "";
  let visible = 0;
  table.querySelectorAll("tbody tr").forEach(row => {
    const name = row.cells[0].textContent.toLowerCase();
    const show = name.includes(query) && (!estado || row.getAttribute("data-estado") === estado);
    row.style.display = show ? "" : "none";
    if (show) visible++;
  });
  const countEl = document.getElementById("demo-visible-count");
  if (countEl) countEl.textContent = String(visible);
};

// 8. Acordeón para Resultados Esperados en los Días
function initExpectedResultsToggles() {
  document.addEventListener("click", e => {
    const header = e.target.closest(".expected-result-header");
    if (header) {
      const card = header.closest(".expected-result-card");
      if (card) {
        card.classList.toggle("open");
      }
    }
  });
}

// 9. Paleta de Comandos Accesible (Ctrl + K)
function initCommandPalette() {
  const modal = document.getElementById("modal-command-palette");
  const input = document.getElementById("cmd-palette-input");
  const results = document.getElementById("cmd-palette-results");
  const btnOpen = document.getElementById("btn-open-command-palette");
  const btnClose = document.getElementById("btn-close-cmd-palette");

  if (!modal || !input || !results) return;

  let activeIndex = 0;
  let currentFiltered = [];
  let lastActiveElement = null;

  const commands = [
    // --- NAVEGACIÓN PRINCIPAL ---
    {
      category: "Navegación",
      icon: "🗺️",
      title: "Ir a Mapa & Cronograma General",
      desc: "Ruta intensiva de 4 días, horarios de aula y pilares pedagógicos.",
      keywords: ["inicio", "mapa", "cronograma", "horario", "agenda", "introduccion", "dia 0"],
      action: () => window.switchPage && window.switchPage("inicio")
    },
    {
      category: "Navegación",
      icon: "📄",
      title: "Ir a Día 1: Modelos & Documentos Técnicos",
      desc: "Fundamentos, tokenización, CRTT+L y constructor interactivo de prompts.",
      keywords: ["dia 1", "modelos", "documentos", "prompts", "crttl", "tokenizacion"],
      action: () => window.switchPage && window.switchPage("dia-1")
    },
    {
      category: "Navegación",
      icon: "🎨",
      title: "Ir a Gemini Canvas Lab (Simulador Interactivo)",
      desc: "Lienzo de trabajo dinámico con 6 posibilidades prácticas y modo inmersivo.",
      keywords: ["canvas", "laboratorio", "simulador", "interactivo", "codigo", "diseño"],
      action: () => window.switchPage && window.switchPage("gemini-canvas")
    },
    {
      category: "Navegación",
      icon: "🗂️",
      title: "Ir a Hub de Proyectos & Entregables",
      desc: "Catálogo unificado de los 35 proyectos formativos con vistas Kanban, Bento y Lista.",
      keywords: ["proyectos", "entregables", "hub", "kanban", "bento", "lista", "catalogo", "dnd", "tareas"],
      action: () => {
        if (window.switchPage) window.switchPage("proyectos");
        window.location.hash = "proyectos";
      }
    },
    {
      category: "Hub de Proyectos",
      icon: "📋",
      title: "Ver Proyectos en Tablero Kanban",
      desc: "Organizar los 35 proyectos por estado (Por Iniciar, En Desarrollo, Completado) con arrastrar y soltar.",
      keywords: ["kanban", "tablero", "estados", "proyectos", "arrastrar", "columnas"],
      action: () => {
        if (window.switchPage) window.switchPage("proyectos");
        window.location.hash = "proyectos";
        if (window.projectsHubInstance && typeof window.projectsHubInstance.setViewMode === "function") {
          window.projectsHubInstance.setViewMode("kanban");
        } else {
          const btn = document.querySelector('[data-hub-view="kanban"]');
          if (btn) btn.click();
        }
      }
    },
    {
      category: "Hub de Proyectos",
      icon: "🍱",
      title: "Ver Proyectos en Galería Bento",
      desc: "Explorar los 35 proyectos con vistas previas interactivas y tarjetas adaptables.",
      keywords: ["bento", "galeria", "cuadricula", "proyectos", "tarjetas", "visual"],
      action: () => {
        if (window.switchPage) window.switchPage("proyectos");
        window.location.hash = "proyectos";
        if (window.projectsHubInstance && typeof window.projectsHubInstance.setViewMode === "function") {
          window.projectsHubInstance.setViewMode("bento");
        } else {
          const btn = document.querySelector('[data-hub-view="bento"]');
          if (btn) btn.click();
        }
      }
    },
    {
      category: "Hub de Proyectos",
      icon: "📑",
      title: "Ver Proyectos en Lista Compacta",
      desc: "Visualización tabular accesible con controles de teclado y ordenación rápida.",
      keywords: ["lista", "tabla", "compacta", "proyectos", "teclado", "filas"],
      action: () => {
        if (window.switchPage) window.switchPage("proyectos");
        window.location.hash = "proyectos";
        if (window.projectsHubInstance && typeof window.projectsHubInstance.setViewMode === "function") {
          window.projectsHubInstance.setViewMode("list");
        } else {
          const btn = document.querySelector('[data-hub-view="list"]');
          if (btn) btn.click();
        }
      }
    },
    {
      category: "Navegación",
      icon: "🎬",
      title: "Ir a Día 2: Multimedia & Video Generativo",
      desc: "Imagen 3, Veo 2, Storyboards, guiones técnicos y derechos de autor.",
      keywords: ["dia 2", "multimedia", "video", "imagen3", "veo2", "storyboard"],
      action: () => window.switchPage && window.switchPage("dia-2")
    },
    {
      category: "Navegación",
      icon: "🤖",
      title: "Ir a Día 3: Agentes, Código & APIs",
      desc: "Ciclo ReAct, 4 ejemplos con vista previa en vivo, auditor de seguridad y 6 ejercicios.",
      keywords: ["dia 3", "agentes", "codigo", "apis", "web", "bff", "seguridad", "ejercicios"],
      action: () => window.switchPage && window.switchPage("dia-3")
    },
    {
      category: "Día 3: Agentes & Web",
      icon: "🖼️",
      title: "Explorar 4 Ejemplos Interactivos con Vista Previa (Día 3)",
      desc: "Diagnóstico de hardware, clasificador de 200 archivos, arquitectura de 3 archivos y pasarela BFF.",
      keywords: ["dia 3", "ejemplos", "vista previa", "hardware", "clasificador", "bff", "tablero"],
      action: () => {
        if (window.switchPage) window.switchPage("dia-3");
        const el = document.getElementById("dia3-examples-module");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    },
    {
      category: "Día 3: Agentes & Web",
      icon: "🛡️",
      title: "Abrir Laboratorio de Seguridad de APIs y Costo de Tokens (Día 3)",
      desc: "Auditor estático determinista de vulnerabilidades OWASP LLM y calculadora mensual de tokens.",
      keywords: ["seguridad", "auditor", "api key", "tokens", "presupuesto", "owasp", "dia 3"],
      action: () => {
        if (window.switchPage) window.switchPage("dia-3");
        const el = document.getElementById("dia3-security-lab");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    },
    {
      category: "Día 3: Agentes & Web",
      icon: "🏋️",
      title: "Practicar los 6 Ejercicios Guiados CRTT+L del Día 3",
      desc: "2 ejercicios por bloque (Agentes y Archivos, Web de 3 Archivos, Seguridad y APIs) con vista previa SVG.",
      keywords: ["ejercicios", "dia 3", "practica", "crttl", "agentes", "svg"],
      action: () => {
        if (window.switchPage) window.switchPage("dia-3");
        const el = document.getElementById("dia3-exercises-module");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    },
    {
      category: "Navegación",
      icon: "🚀",
      title: "Ir a Día 4: Software, Gobernanza & Proyecto",
      desc: "Prototipado web, ética, IA Act de la UE y sustentación de proyectos.",
      keywords: ["dia 4", "software", "gobernanza", "proyecto", "etica", "sustentacion"],
      action: () => window.switchPage && window.switchPage("dia-4")
    },
    {
      category: "Navegación",
      icon: "📚",
      title: "Ir a Banco Maestro de Prompts CRTT+L",
      desc: "Colección curada de 8+ prompts profesionales listos para el aula.",
      keywords: ["banco", "prompts", "plantillas", "copiar", "ejemplos", "biblioteca"],
      action: () => window.switchPage && window.switchPage("prompts")
    },
    {
      category: "Navegación",
      icon: "🧰",
      title: "Ir a Caja de Herramientas y Recursos",
      desc: "Directorio de utilidades oficiales, documentación y enlaces de soporte.",
      keywords: ["recursos", "herramientas", "caja", "enlaces", "documentacion", "links"],
      action: () => window.switchPage && window.switchPage("recursos")
    },

    // --- HERRAMIENTAS DE GEMINI CANVAS ---
    {
      category: "Gemini Canvas Lab",
      icon: "🔍",
      title: "Abrir Inspector de Imagen en Alta Resolución (Lightbox)",
      desc: "Examina los artefactos visuales generados con zoom dinámico de 50% a 300%.",
      keywords: ["lightbox", "imagen", "zoom", "detalle", "resolucion", "captura", "canvas"],
      action: () => {
        if (window.switchPage) window.switchPage("gemini-canvas");
        setTimeout(() => {
          if (window.openCanvasLightbox) window.openCanvasLightbox();
        }, 80);
      }
    },
    {
      category: "Gemini Canvas Lab",
      icon: "⚖️",
      title: "Abrir Calculadora de Contraste WCAG 2.2 AA",
      desc: "Validador interactivo de ratio de luminancia relativa y accesibilidad para UI.",
      keywords: ["contraste", "wcag", "accesibilidad", "color", "ratio", "luminancia", "aa", "aaa"],
      action: () => {
        if (window.switchPage) window.switchPage("gemini-canvas");
        setTimeout(() => {
          if (window.openCanvasModal) window.openCanvasModal("modal-canvas-contrast");
        }, 80);
      }
    },
    {
      category: "Gemini Canvas Lab",
      icon: "✨",
      title: "Ver Desglose de Prompt de Imagen (5 Bloques)",
      desc: "Estructura pedagógica: Sujeto, Entorno, Iluminación, Estilo y Restricciones Negativas.",
      keywords: ["imagen3", "desglose", "prompt", "fotografia", "estilo", "bloques"],
      action: () => {
        if (window.switchPage) window.switchPage("gemini-canvas");
        setTimeout(() => {
          if (window.openCanvasModal) window.openCanvasModal("modal-canvas-imagen3");
        }, 80);
      }
    },
    {
      category: "Gemini Canvas Lab",
      icon: "💻",
      title: "Ver Código e Historial de Versiones de Canvas",
      desc: "Inspección de sintaxis ECMAScript, diagramas Mermaid e historial de cambios inline.",
      keywords: ["codigo", "historial", "versiones", "mermaid", "javascript", "inspeccionar"],
      action: () => {
        if (window.switchPage) window.switchPage("gemini-canvas");
        setTimeout(() => {
          if (window.openCanvasModal) window.openCanvasModal("modal-canvas-code");
        }, 80);
      }
    },
    {
      category: "Gemini Canvas Lab",
      icon: "⛶",
      title: "Alternar Modo Inmersivo de Pantalla Completa",
      desc: "Expande el simulador de Gemini Canvas a la totalidad del monitor.",
      keywords: ["inmersivo", "pantalla completa", "fullscreen", "maximizar", "expandir"],
      action: () => {
        if (window.switchPage) window.switchPage("gemini-canvas");
        setTimeout(() => {
          if (window.toggleCanvasFullscreen) window.toggleCanvasFullscreen();
        }, 80);
      }
    },

    // --- GESTIÓN DE AULA Y TEMA ---
    {
      category: "Gestión de Aula",
      icon: "👨‍🏫",
      title: "Cambiar a Perfil: Facilitador / Instructor",
      desc: "Activa guiones de pizarra, advertencias de fatiga y notas metodológicas en color ámbar.",
      keywords: ["facilitador", "instructor", "profesor", "docente", "modo instructor"],
      action: () => {
        const btn = document.querySelector('.role-btn[data-role="instructor"]');
        if (btn) btn.click();
      }
    },
    {
      category: "Gestión de Aula",
      icon: "🎓",
      title: "Cambiar a Perfil: Participante / Aprendiz",
      desc: "Modo enfocado en la práctica directa y guías paso a paso sin notas pedagógicas.",
      keywords: ["participante", "aprendiz", "estudiante", "alumno", "modo aprendiz"],
      action: () => {
        const btn = document.querySelector('.role-btn[data-role="aprendiz"]');
        if (btn) btn.click();
      }
    },
    {
      category: "Gestión de Aula",
      icon: "🌓",
      title: "Alternar Tema Visual (Modo Oscuro / Claro)",
      desc: "Conmuta entre la paleta diurna de serenidad visual y el modo oscuro descansado.",
      keywords: ["tema", "oscuro", "claro", "dark mode", "light mode", "colores", "apariencia"],
      action: () => {
        const btn = document.getElementById("theme-toggle");
        if (btn) btn.click();
      }
    },
    {
      category: "Gestión de Aula",
      icon: "⏱️",
      title: "Iniciar Temporizador de Práctica (15 Minutos)",
      desc: "Configura el reloj de aula y activa el conteo regresivo de 15 minutos.",
      keywords: ["temporizador", "timer", "15 minutos", "reloj", "practica", "tiempo"],
      action: () => {
        const preset15 = Array.from(document.querySelectorAll(".preset-btn")).find(b => b.textContent.includes("15"));
        if (preset15) preset15.click();
        const toggleBtn = document.getElementById("timer-toggle-btn");
        if (toggleBtn && toggleBtn.textContent.includes("Iniciar")) toggleBtn.click();
      }
    },
    {
      category: "Gestión de Aula",
      icon: "☕",
      title: "Temporizador de Pausa Activa / Descanso (10 Minutos)",
      desc: "Ajusta el reloj de aula a 10 minutos para receso matutino o vespertino.",
      keywords: ["descanso", "pausa", "receso", "cafe", "timer", "10 minutos"],
      action: () => {
        const preset10 = Array.from(document.querySelectorAll(".preset-btn")).find(b => b.textContent.includes("10"));
        if (preset10) preset10.click();
      }
    }
  ];

  // Cada modo y cada ejercicio de Gemini Canvas tiene su propia entrada con enlace directo.
  if (typeof CANVAS_POSSIBILITIES !== "undefined" && typeof CANVAS_EXERCISES !== "undefined") {
    Object.keys(CANVAS_POSSIBILITIES).forEach(mode => {
      const name = CANVAS_POSSIBILITIES[mode].name;
      commands.push({
        category: "Modos de Gemini Canvas",
        icon: CANVAS_POSSIBILITIES[mode].docIcon,
        title: `Modo ${name}`,
        desc: "Abre este modo en el simulador.",
        keywords: ["modo", "canvas", mode, name.toLowerCase()],
        action: () => { window.location.hash = buildCanvasRoute(mode); }
      });
      (CANVAS_EXERCISES[mode] || []).forEach((ex, i) => {
        commands.push({
          category: "Ejercicios de Gemini Canvas",
          icon: "🧪",
          title: `${i === 0 ? "A" : "B"}. ${ex.title}`,
          desc: name,
          keywords: ["ejercicio", "canvas", ex.id, ex.canvasFeature.toLowerCase()],
          action: () => { window.location.hash = buildCanvasRoute(mode, i); }
        });
      });
    });
  }

  function openPalette() {
    lastActiveElement = document.activeElement;
    modal.removeAttribute("hidden");
    void modal.offsetWidth;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    input.value = "";
    activeIndex = 0;
    renderResults("");
    input.focus();
  }

  function closePalette() {
    modal.classList.remove("is-open");
    setTimeout(() => {
      modal.setAttribute("hidden", "");
      const anyModalOpen = document.querySelector(".canvas-modal-backdrop.is-open");
      const isFullscreen = document.getElementById("canvas-simulator-module")?.classList.contains("is-fullscreen");
      if (!anyModalOpen && !isFullscreen) {
        document.body.style.overflow = "";
      }
      if (lastActiveElement && typeof lastActiveElement.focus === "function") {
        lastActiveElement.focus();
      }
    }, 180);
  }

  function renderResults(query) {
    const q = (query || "").toLowerCase().trim();
    if (!q) {
      currentFiltered = commands;
    } else {
      currentFiltered = commands.filter(cmd => {
        const titleMatch = cmd.title.toLowerCase().includes(q);
        const descMatch = cmd.desc.toLowerCase().includes(q);
        const catMatch = cmd.category.toLowerCase().includes(q);
        const kwMatch = cmd.keywords.some(k => k.toLowerCase().includes(q));
        return titleMatch || descMatch || catMatch || kwMatch;
      });
    }

    results.innerHTML = "";

    if (currentFiltered.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;";
      empty.innerHTML = `<span>🔍</span> No se encontraron comandos para "<strong>${escapeHtml(query)}</strong>"`;
      results.appendChild(empty);
      return;
    }

    if (activeIndex >= currentFiltered.length) {
      activeIndex = 0;
    }

    let lastCategory = "";
    currentFiltered.forEach((cmd, idx) => {
      if (cmd.category !== lastCategory) {
        lastCategory = cmd.category;
        const groupTitle = document.createElement("div");
        groupTitle.className = "command-group-title";
        groupTitle.textContent = cmd.category;
        results.appendChild(groupTitle);
      }

      const item = document.createElement("div");
      item.className = `command-item ${idx === activeIndex ? "active" : ""}`;
      item.setAttribute("role", "option");
      item.setAttribute("data-index", String(idx));
      item.innerHTML = `
        <div class="command-item-left">
          <span class="command-icon">${cmd.icon}</span>
          <div>
            <div style="font-weight: 600; line-height: 1.25;">${escapeHtml(cmd.title)}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">${escapeHtml(cmd.desc)}</div>
          </div>
        </div>
        <span class="command-item-badge">${escapeHtml(cmd.category)}</span>
      `;

      item.addEventListener("mouseenter", () => {
        activeIndex = idx;
        updateActiveItem();
      });

      item.addEventListener("click", () => {
        executeCommand(idx);
      });

      results.appendChild(item);
    });

    scrollActiveIntoView();
  }

  function updateActiveItem() {
    const items = results.querySelectorAll(".command-item");
    items.forEach((item, idx) => {
      if (idx === activeIndex) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  function scrollActiveIntoView() {
    const activeEl = results.querySelector(".command-item.active");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }

  function executeCommand(index) {
    const cmd = currentFiltered[index];
    if (cmd && typeof cmd.action === "function") {
      closePalette();
      cmd.action();
    }
  }

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Event Listeners
  input.addEventListener("input", e => {
    activeIndex = 0;
    renderResults(e.target.value);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (currentFiltered.length > 0) {
        activeIndex = (activeIndex + 1) % currentFiltered.length;
        updateActiveItem();
        scrollActiveIntoView();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (currentFiltered.length > 0) {
        activeIndex = (activeIndex - 1 + currentFiltered.length) % currentFiltered.length;
        updateActiveItem();
        scrollActiveIntoView();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentFiltered.length > 0) {
        executeCommand(activeIndex);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    }
  });

  if (btnOpen) {
    btnOpen.addEventListener("click", openPalette);
  }

  if (btnClose) {
    btnClose.addEventListener("click", closePalette);
  }

  modal.addEventListener("click", e => {
    if (e.target === modal) {
      closePalette();
    }
  });

  // Atajo global Ctrl + K / Cmd + K
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (modal.classList.contains("is-open")) {
        closePalette();
      } else {
        openPalette();
      }
    }
  });

  // Exponer a window para pruebas
  window.openCommandPalette = openPalette;
  window.closeCommandPalette = closePalette;
}


// 9. Barra de Calibración Reactiva de Canvas
function initCanvasCalibrationBar() {
  const slider = document.getElementById("canvas-length-slider");
  const label = document.getElementById("canvas-length-label");
  const tonePills = document.querySelectorAll("#canvas-tone-group .calibration-pill");
  const audPills = document.querySelectorAll("#canvas-audience-group .calibration-pill");
  const liveSlot = document.getElementById("sim-calibration-live-slot");

  if (!slider || !label) return;

  function getActiveModeId() {
    const activeTab = document.querySelector(".canvas-tab.active[data-possibility]");
    return (activeTab && activeTab.getAttribute("data-possibility")) || "doc-editorial";
  }

  function getActiveTone() {
    const active = document.querySelector("#canvas-tone-group .calibration-pill.active");
    return (active && active.getAttribute("data-tone")) || "formal";
  }

  function getActiveAudience() {
    const active = document.querySelector("#canvas-audience-group .calibration-pill.active");
    return (active && active.getAttribute("data-audience")) || "adso";
  }

  function applyCalibrationState(triggerToastMsg) {
    const modeId = getActiveModeId();
    const lengthVal = Number(slider.value) || 3;
    const toneVal = getActiveTone();
    const audVal = getActiveAudience();
    if (typeof computeCalibratedSimulation === "function") {
      const cal = computeCalibratedSimulation(modeId, { length: lengthVal, tone: toneVal, audience: audVal });
      label.textContent = cal.lengthLabel;
      if (liveSlot) {
        liveSlot.innerHTML = cal.summaryHtml;
      }
      const summary = document.getElementById("doc-executive-summary");
      if (summary && modeId === "doc-editorial") {
        summary.innerHTML = `<strong>1. Resumen ejecutivo (${cal.lengthLabel} · Tono ${cal.toneLabel})</strong>
          <p style="margin:0.25rem 0 0 0; font-size:0.86rem; color:var(--text-main);">${cal.docSummaryText}</p>`;
      }
    }
    if (triggerToastMsg) {
      const interactiveTabBtn = document.querySelector('.view-mode-btn[data-mode="interactive"]');
      if (interactiveTabBtn && !interactiveTabBtn.classList.contains("active")) {
        interactiveTabBtn.click();
      }
    }
  }

  window.refreshCanvasCalibration = () => applyCalibrationState(false);

  slider.addEventListener("input", () => {
    applyCalibrationState(true);
  });

  tonePills.forEach(pill => {
    pill.addEventListener("click", () => {
      tonePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      applyCalibrationState(true);
    });
  });

  audPills.forEach(pill => {
    pill.addEventListener("click", () => {
      audPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      applyCalibrationState(true);
    });
  });

  applyCalibrationState(false);
}

// 10. Simulador de Visión Multimodal (De Boceto a Canvas en Vivo)
function initMultimodalSimulator() {
  const btnCaseForm = document.getElementById("btn-case-form");
  const btnCaseFlow = document.getElementById("btn-case-flow");
  const sourceTitle = document.getElementById("mm-source-title");
  const sourceBadge = document.getElementById("mm-source-badge");
  const sketchBox = document.getElementById("mm-sketch-box");
  const ocrList = document.getElementById("mm-ocr-list");
  const userPrompt = document.getElementById("mm-user-prompt");
  const canvasTitle = document.getElementById("mm-canvas-title");
  const interactiveResult = document.getElementById("mm-interactive-result");

  if (!btnCaseForm || !btnCaseFlow || !interactiveResult) return;

  function loadCase(caseId) {
    if (caseId === "form") {
      btnCaseForm.classList.add("active");
      btnCaseFlow.classList.remove("active");
      if (sourceTitle) sourceTitle.textContent = "1. Entrada: Fotografía de Boceto Manuscrito (Libreta)";
      if (sourceBadge) { sourceBadge.textContent = "Boceto a Lápiz"; sourceBadge.className = "badge badge-warning"; }
      if (sketchBox) {
        sketchBox.innerHTML = `
          <div style="background:#fefce8; border:2px dashed #ca8a04; border-radius:6px; padding:1.25rem; font-family:var(--font-mono); color:#713f12; text-align:left;">
            <div style="font-weight:700; margin-bottom:0.5rem; border-bottom:1px solid #eab308; padding-bottom:0.25rem;">[Boceto en Libreta: Formulario Matrícula]</div>
            <div>[Campo Texto] Nombre Completo __________________</div>
            <div style="margin-top:0.4rem;">[Campo Email] Correo Institucional (solo @soy.sena.edu.co o @sena.edu.co)</div>
            <div style="margin-top:0.4rem;">[Campo Pass] Contraseña de acceso (mín. 8 caracteres, con números y símbolos)</div>
            <div style="margin-top:0.6rem; display:inline-block; background:#ca8a04; color:#fff; padding:0.25rem 0.6rem; border-radius:4px;">[ BOTÓN: Completar Registro Formativo ]</div>
          </div>
        `;
      }
      if (ocrList) {
        ocrList.innerHTML = `
          <strong>🔍 Inferencia Espacial de Gemini Vision:</strong>
          <ul>
            <li>Detectó 3 campos de entrada con etiquetas manuscritas.</li>
            <li>Identificó regla de negocio escrita a lápiz: <em>dominio institucional obligatorio</em>.</li>
            <li>Generó arquitectura HTML5 con semántica y atributos <code>required</code>.</li>
          </ul>
        `;
      }
      if (userPrompt) {
        userPrompt.textContent = "Analiza este boceto a mano en mi libreta. En Canvas, genera el formulario web responsivo en HTML/CSS/JS con validación de correo institucional (@soy.sena.edu.co) y medidor dinámico de contraseña.";
      }
      if (canvasTitle) canvasTitle.textContent = "2. Prototipo Web Ejecutable en Canvas (Formulario Reactivo)";
      interactiveResult.innerHTML = `
        <div style="padding:0.75rem; background:var(--bg-app); border-radius:8px;">
          <form id="mm-demo-form" onsubmit="event.preventDefault(); window.submitMultimodalDemo();" style="display:flex; flex-direction:column; gap:0.65rem;">
            <div>
              <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--text-main); margin-bottom:0.2rem;">Nombre Completo:</label>
              <input type="text" id="mm-input-name" placeholder="Ej: Carlos Gómez" required style="width:100%; padding:0.45rem 0.65rem; font-size:0.82rem; border:1px solid var(--border-light); border-radius:4px; background:var(--bg-surface); color:var(--text-main);">
            </div>
            <div>
              <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--text-main); margin-bottom:0.2rem;">Correo Institucional:</label>
              <input type="email" id="mm-input-email" placeholder="usuario@soy.sena.edu.co" oninput="window.validateInstitutionalEmail(this.value)" required style="width:100%; padding:0.45rem 0.65rem; font-size:0.82rem; border:1px solid var(--border-light); border-radius:4px; background:var(--bg-surface); color:var(--text-main);">
              <small id="mm-email-feedback" style="display:block; margin-top:0.2rem; font-size:0.74rem; color:var(--text-muted);">Debe incluir el dominio @soy.sena.edu.co</small>
            </div>
            <div>
              <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--text-main); margin-bottom:0.2rem;">Contraseña de Acceso:</label>
              <input type="password" id="mm-input-pass" placeholder="••••••••" oninput="window.checkPasswordStrength(this.value)" required style="width:100%; padding:0.45rem 0.65rem; font-size:0.82rem; border:1px solid var(--border-light); border-radius:4px; background:var(--bg-surface); color:var(--text-main);">
              <div style="height:4px; background:var(--border-light); border-radius:2px; margin-top:0.3rem; overflow:hidden;">
                <div id="mm-pass-bar" style="height:100%; width:0%; transition:width 0.3s, background-color 0.3s;"></div>
              </div>
            </div>
            <button type="submit" class="copy-btn" style="margin-top:0.35rem; padding:0.5rem; width:100%; font-size:0.84rem;">
              ✓ Completar Registro Formativo
            </button>
          </form>
        </div>
      `;
    } else {
      btnCaseFlow.classList.add("active");
      btnCaseForm.classList.remove("active");
      if (sourceTitle) sourceTitle.textContent = "1. Entrada: Fotografía de Pizarra de Aula (Flujograma PQRS)";
      if (sourceBadge) { sourceBadge.textContent = "Pizarra Escolar"; sourceBadge.className = "badge badge-info"; }
      if (sketchBox) {
        sketchBox.innerHTML = `
          <div style="background:#1e293b; border:2px dashed #38bdf8; border-radius:6px; padding:1.25rem; font-family:var(--font-mono); color:#f8faf9; text-align:left;">
            <div style="color:#38bdf8; font-weight:700; margin-bottom:0.4rem; border-bottom:1px solid #334155; padding-bottom:0.25rem;">[Trazos de Marcador en Pizarra]</div>
            <div>(Inicio) → [1. Radicación PQRS]</div>
            <div style="margin-left:1.5rem;">↓</div>
            <div>[2. Triaje mesa de ayuda] → {¿Es queja formativa?}</div>
            <div style="margin-left:4rem;">├─ Sí ──→ [Comité de Evaluación]</div>
            <div style="margin-left:4rem;">└─ No ──→ [Soporte Técnico Nivel 1]</div>
          </div>
        `;
      }
      if (ocrList) {
        ocrList.innerHTML = `
          <strong>🔍 Inferencia Espacial de Gemini Vision:</strong>
          <ul>
            <li>Identificó flechas direccionales y bifurcación condicional.</li>
            <li>Tradujo los cuadros y rombos a sintaxis canónica Mermaid (flowchart TD).</li>
            <li>Asignó carriles de responsabilidad a Coordinación Académica y Soporte.</li>
          </ul>
        `;
      }
      if (userPrompt) {
        userPrompt.textContent = "Extrae el flujograma dibujado con marcador en esta pizarra y genera el diagrama vectorial Mermaid interactivo en Canvas con subgrafos y tiempos de respuesta.";
      }
      if (canvasTitle) canvasTitle.textContent = "2. Diagrama Vectorial Ejecutable en Canvas (Mermaid / SVG)";
      interactiveResult.innerHTML = `
        <div style="padding:1rem; background:var(--bg-app); border-radius:8px; text-align:center;">
          <svg viewBox="0 0 520 230" style="width:100%; max-width:500px; height:auto;">
            <rect x="180" y="10" width="160" height="34" rx="17" fill="#e8f2ee" stroke="#2d5a4c" stroke-width="2"/>
            <text x="260" y="32" font-size="12" font-weight="700" fill="#2d5a4c" text-anchor="middle">Inicio: Radicación PQRS</text>
            <line x1="260" y1="44" x2="260" y2="70" stroke="#2d5a4c" stroke-width="2"/>
            <polygon points="260,70 340,95 260,120 180,95" fill="#fffbeb" stroke="#f59e0b" stroke-width="2"/>
            <text x="260" y="99" font-size="11" font-weight="700" fill="#92400e" text-anchor="middle">¿Es novedad formativa?</text>
            <line x1="340" y1="95" x2="410" y2="95" stroke="#2d5a4c" stroke-width="2"/>
            <text x="375" y="88" font-size="10" font-weight="700" fill="#15803d">Sí</text>
            <rect x="360" y="140" width="150" height="36" rx="6" fill="#e8f2ee" stroke="#2d5a4c" stroke-width="1.5"/>
            <text x="435" y="162" font-size="11" fill="#2d5a4c" text-anchor="middle">Comité Académico</text>
            <line x1="410" y1="95" x2="410" y2="140" stroke="#2d5a4c" stroke-width="2"/>
            <line x1="260" y1="120" x2="260" y2="150" stroke="#b91c1c" stroke-width="2"/>
            <text x="270" y="138" font-size="10" font-weight="700" fill="#b91c1c">No</text>
            <rect x="185" y="150" width="150" height="36" rx="6" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>
            <text x="260" y="172" font-size="11" fill="#1e293b" text-anchor="middle">Mesa de Ayuda Nivel 1</text>
          </svg>
        </div>
      `;
    }
  }

  btnCaseForm.addEventListener("click", () => loadCase("form"));
  btnCaseFlow.addEventListener("click", () => loadCase("flow"));

  loadCase("form");

  const mmBridgeEl = document.getElementById("mm-sim-bridge");
  if (mmBridgeEl && typeof CANVAS_EXERCISES !== "undefined" && CANVAS_EXERCISES["multimodal-vision"]) {
    const mmList = CANVAS_EXERCISES["multimodal-vision"];
    mmBridgeEl.innerHTML = `
      <div class="canvas-sim-bridge-info">
        <span class="canvas-sim-bridge-tag">Puente del Laboratorio · Modo 11: Visión Multimodal</span>
        <p class="canvas-sim-bridge-text">Aplica lo que experimentaste con los bocetos manuscritos y pizarras en los 3 ejercicios prácticos de Visión Multimodal:</p>
        <div class="canvas-sim-bridge-parts">
          ${mmList.map((ex, i) => `<button type="button" class="canvas-bridge-part-btn" data-mm-go-exercise="${i}">🧪 Parte ${"ABC"[i] || "A"} (${ex.code}): ${ex.title}</button>`).join("")}
        </div>
      </div>
      <div class="canvas-sim-bridge-cta">
        <button type="button" class="canvas-mode-pager-btn is-primary" data-mm-go-exercise="0">🧪 Ir a Ejercicio 11A →</button>
      </div>
    `;
    mmBridgeEl.querySelectorAll("[data-mm-go-exercise]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-mm-go-exercise")) || 0;
        if (typeof window.openCanvasRoute === "function") {
          window.openCanvasRoute("multimodal-vision", idx);
        }
      });
    });
  }
}

window.validateInstitutionalEmail = function(val) {
  const fb = document.getElementById("mm-email-feedback");
  if (!fb) return;
  if (val.toLowerCase().includes("@soy.sena.edu.co") || val.toLowerCase().includes("@sena.edu.co")) {
    fb.textContent = "✓ Dominio institucional válido reconocido por Gemini.";
    fb.style.color = "#15803d";
  } else {
    fb.textContent = "⚠️ Ingrese un correo que contenga @soy.sena.edu.co";
    fb.style.color = "#b45309";
  }
};

window.checkPasswordStrength = function(val) {
  const bar = document.getElementById("mm-pass-bar");
  if (!bar) return;
  if (!val) { bar.style.width = "0%"; return; }
  let score = 0;
  if (val.length >= 8) score += 40;
  if (/[0-9]/.test(val)) score += 30;
  if (/[^A-Za-z0-9]/.test(val)) score += 30;
  bar.style.width = `${score}%`;
  bar.style.backgroundColor = score < 50 ? "#ef4444" : score < 80 ? "#f59e0b" : "#22c55e";
};

window.submitMultimodalDemo = function() {
  const name = document.getElementById("mm-input-name")?.value || "Aprendiz";
  alert(`¡Formulario validado con éxito!\nBienvenido/a, ${name}. La aplicación generada por Gemini Canvas procesó el registro sin recargar la página.`);
};

// 11. Gem Studio: Constructor y Calibrador de Asistentes Gems
function initGemStudio() {
  const nameInput = document.getElementById("gem-name-input");
  const instructionsInput = document.getElementById("gem-instructions-input");
  const consoleName = document.getElementById("gem-console-name");
  const chatScroll = document.getElementById("gem-chat-scroll");
  const userInput = document.getElementById("gem-user-input");
  const btnSend = document.getElementById("btn-send-gem");
  const btnClear = document.getElementById("btn-clear-gem-chat");
  const btnCopyPrompt = document.getElementById("btn-copy-gem-system-prompt");
  const presetBtns = document.querySelectorAll(".gem-preset-btn");
  const chips = [
    document.getElementById("chip-q1"),
    document.getElementById("chip-q2"),
    document.getElementById("chip-q3")
  ];

  if (!nameInput || !instructionsInput || !chatScroll) return;

  const GEM_PRESETS = {
    "socratic": {
      name: "Tutor Socrático de Programación ADSO",
      instructions: `Actúa como tutor socrático del SENA para aprendices de desarrollo de software.
Cuando un aprendiz pida el código resuelto de una tarea o un algoritmo, NUNCA proporciones la solución directa.
Formula exactamente dos preguntas reflexivas orientadas a que el estudiante analice el problema, revise la documentación oficial y construya su propia lógica paso a paso.
Mantén un tono empático, pedagógico y cercano en español de Colombia.`,
      welcome: "Hola. Soy tu Tutor Socrático de programación. Cuéntame qué reto o ejercicio estás desarrollando hoy y lo resolveremos paso a paso sin atajos."
    },
    "auditor": {
      name: "Gem Auditor de Rúbricas y Calidad de Código",
      instructions: `Actúa como auditor técnico de arquitectura y calidad de software del SENA.
Evalúa las entregas de los aprendices contra los criterios de Clean Architecture, cobertura de pruebas del 100% y accesibilidad WCAG.
Genera siempre una tabla con 3 columnas: Criterio, Nivel de Cumplimiento (Excelente, Bueno, En desarrollo, Requiere apoyo) y Recomendación Constructiva.
Si el código mezcla persistencia en el controlador o carece de pruebas unitarias con aserciones, clasifícalo en 'Requiere apoyo' y señala la violación arquitectónica.`,
      welcome: "Buen día. Soy el Gem Auditor de Rúbricas. Comparte tu código, ruta o arquitectura para emitir el dictamen técnico formativo."
    },
    "redactor": {
      name: "Gem Redactor de Pliegos y Actas Técnicas",
      instructions: `Actúa como secretario técnico y asesor de contratación tecnológica del SENA.
Redacta actas, memorandos y especificaciones técnicas con estilo formal, imparcial y riguroso.
Prohíbe marcas propietarias únicas en licitaciones y exige siempre estándares abiertos, garantías mínimas de 3 años y trazabilidad documental bajo la normatividad de la Ley 1581 de 2012.`,
      welcome: "Estimado facilitador o aprendiz. Estoy listo para estructurar actas formales, términos de referencia o acuerdos formativos."
    }
  };

  let activePresetKey = "socratic";

  function applyPreset(key) {
    const data = GEM_PRESETS[key];
    if (!data) return;
    activePresetKey = key;
    nameInput.value = data.name;
    instructionsInput.value = data.instructions;
    if (consoleName) consoleName.textContent = data.name;

    chatScroll.innerHTML = "";
    appendAssistantMessage(data.welcome);
  }

  function appendUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "gem-msg user";
    msg.textContent = text;
    chatScroll.appendChild(msg);
    chatScroll.scrollTop = chatScroll.scrollHeight;
  }

  function appendAssistantMessage(text) {
    const msg = document.createElement("div");
    msg.className = "gem-msg assistant";
    msg.innerHTML = text.replace(/\n/g, "<br>");
    chatScroll.appendChild(msg);
    chatScroll.scrollTop = chatScroll.scrollHeight;
  }

  function generateAssistantResponse(prompt) {
    const lower = prompt.toLowerCase();
    if (activePresetKey === "socratic") {
      if (lower.includes("código") || lower.includes("resuelto") || lower.includes("dame")) {
        return "Comprendo que quieras ver el resultado pronto, pero recuerda nuestro pacto pedagógico: para que el aprendizaje se consolide, el código debe nacer de tu propio análisis.\n\nReflexionemos con estas dos preguntas:\n1. ¿Cuál es la entrada exacta del problema y cuál debe ser la salida esperada?\n2. Si tuvieras que explicarle a un compañero cómo resolverlo usando lápiz y papel antes de programar, ¿cuál sería el primer paso?";
      } else if (lower.includes("sum") || lower.includes("número") || lower.includes("lista")) {
        return "¡Excelente ejercicio para entender estructuras de datos!\n\n1. En Python, ¿recuerdas qué función nativa suma todos los elementos de un iterable sin necesidad de escribir un bucle for?\n2. Si decides usar un bucle tradicional, ¿con qué valor debes inicializar la variable acumuladora antes de la primera iteración?";
      } else {
        return "Interesante planteamiento. Antes de avanzar con la sintaxis técnica:\n1. ¿Qué estructura de datos consideras más eficiente para este requerimiento?\n2. ¿Cómo podrías validar que los datos ingresados no contengan valores nulos o vacíos?";
      }
    } else if (activePresetKey === "auditor") {
      return `<strong>Dictamen Técnico de Auditoría:</strong><br><br>
<table class="schedule-table" style="font-size:0.75rem;">
  <tr><th>Criterio</th><th>Cumplimiento</th><th>Observación</th></tr>
  <tr><td>Clean Architecture</td><td><span class="badge badge-warning">En desarrollo</span></td><td>Separar la lógica de negocio del controlador.</td></tr>
  <tr><td>Pruebas Automatizadas</td><td><span class="badge badge-danger">Requiere apoyo</span></td><td>Faltan aserciones en los casos de borde.</td></tr>
  <tr><td>Accesibilidad WCAG</td><td><span class="badge badge-success">Excelente</span></td><td>Contraste 5.4:1 verificado en paleta.</td></tr>
</table>`;
    } else {
      return "Conforme al procedimiento institucional vigente (Reglamento del Aprendiz, Capítulo V, Artículo 22): Las solicitudes y novedades deben radicarse mediante memorando oficial dentro de los dos (2) días hábiles siguientes. Se anexa constancia para su correspondiente registro en el acta de seguimiento formativo.";
    }
  }

  function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;
    appendUserMessage(text);
    userInput.value = "";

    // Respuesta determinista e inmediata: sin retardos que simulen procesamiento.
    appendAssistantMessage(generateAssistantResponse(text));
  }

  if (btnSend) btnSend.addEventListener("click", handleSend);
  if (userInput) {
    userInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      presetBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const pKey = btn.getAttribute("data-preset");
      applyPreset(pKey);
    });
  });

  chips.forEach(chip => {
    if (chip) {
      chip.addEventListener("click", () => {
        const text = chip.textContent.replace(/^"|"$/g, "");
        userInput.value = text;
        handleSend();
      });
    }
  });

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      chatScroll.innerHTML = "";
      appendAssistantMessage("Chat reiniciado. Formula tu consulta de prueba.");
    });
  }

  if (btnCopyPrompt) {
    btnCopyPrompt.addEventListener("click", () => {
      navigator.clipboard.writeText(instructionsInput.value.trim()).then(() => {
        const originalText = btnCopyPrompt.textContent;
        btnCopyPrompt.textContent = "✓ ¡System Prompt Copiado!";
        setTimeout(() => {
          btnCopyPrompt.textContent = originalText;
        }, 2000);
      });
    });
  }

  applyPreset("socratic");

  const gemBridgeEl = document.getElementById("gem-sim-bridge");
  if (gemBridgeEl && typeof CANVAS_EXERCISES !== "undefined" && CANVAS_EXERCISES["gem-studio"]) {
    const gemList = CANVAS_EXERCISES["gem-studio"];
    gemBridgeEl.innerHTML = `
      <div class="canvas-sim-bridge-info">
        <span class="canvas-sim-bridge-tag">Puente del Laboratorio · Modo 12: Gems para Canvas</span>
        <p class="canvas-sim-bridge-text">Ahora que probaste las plantillas oficiales y los límites del System Prompt, completa los ejercicios prácticos de diseño y calibración de Gems:</p>
        <div class="canvas-sim-bridge-parts">
          ${gemList.map((ex, i) => `<button type="button" class="canvas-bridge-part-btn" data-gem-go-exercise="${i}">🧪 Parte ${"ABC"[i] || "A"} (${ex.code}): ${ex.title}</button>`).join("")}
        </div>
      </div>
      <div class="canvas-sim-bridge-cta">
        <button type="button" class="canvas-mode-pager-btn is-primary" data-gem-go-exercise="0">🧪 Ir a Ejercicio 12A →</button>
      </div>
    `;
    gemBridgeEl.querySelectorAll("[data-gem-go-exercise]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-gem-go-exercise")) || 0;
        if (typeof window.openCanvasRoute === "function") {
          window.openCanvasRoute("gem-studio", idx);
        }
      });
    });
  }
}

// 12. Módulo Interactivo del Día 3: Ejemplos en Vivo, Laboratorio de Seguridad y 6 Ejercicios CRTT+L
function initDia3Module() {
  if (typeof DIA3_EXAMPLES === "undefined" || typeof DIA3_EXERCISES === "undefined") return;

  const exampleViewer = document.getElementById("dia3-example-viewer");
  const exampleSelectBtns = document.querySelectorAll("[data-dia3-example-select]");
  const exampleModeBtns = document.querySelectorAll("[data-dia3-example-mode]");
  let currentExampleId = "diagnostico-pc";
  let currentExampleMode = "preview";

  function wireExampleInnerControls() {
    if (!exampleViewer) return;

    exampleViewer.querySelectorAll("[data-hw-profile]").forEach(btn => {
      btn.addEventListener("click", () => {
        exampleViewer.querySelectorAll("[data-hw-profile]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const profKey = btn.getAttribute("data-hw-profile");
        const prof = DIA3_HARDWARE_PROFILES[profKey];
        const hwBody = document.getElementById("dia3-hw-body");
        if (prof && hwBody) {
          hwBody.innerHTML = buildDia3HardwareCardHtml(prof, dia3EvaluateHardwareProfile(prof));
        }
      });
    });

    const liveSearch = document.getElementById("dia3-live-search");
    const liveStatus = document.getElementById("dia3-live-status");
    function filterLearnersTable() {
      const q = (liveSearch ? liveSearch.value : "").toLowerCase().trim();
      const st = liveStatus ? liveStatus.value : "todos";
      exampleViewer.querySelectorAll("[data-dia3-learner-row]").forEach(row => {
        const matchName = row.getAttribute("data-nombre").includes(q) || row.getAttribute("data-ficha").includes(q);
        const matchStatus = !st || st === "todos" || row.getAttribute("data-estado") === st;
        row.style.display = matchName && matchStatus ? "" : "none";
      });
    }
    if (liveSearch) liveSearch.addEventListener("input", filterLearnersTable);
    if (liveStatus) liveStatus.addEventListener("change", filterLearnersTable);

    const copyCodeBtn = exampleViewer.querySelector("[data-dia3-copy-code]");
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener("click", () => {
        const ex = DIA3_EXAMPLES[copyCodeBtn.getAttribute("data-dia3-copy-code")];
        if (ex && navigator.clipboard) {
          navigator.clipboard.writeText(ex.code);
          copyCodeBtn.textContent = "✓ Código copiado";
        }
      });
    }

    const copyPromptBtn = exampleViewer.querySelector("[data-dia3-copy-prompt]");
    if (copyPromptBtn) {
      copyPromptBtn.addEventListener("click", () => {
        const ex = DIA3_EXAMPLES[copyPromptBtn.getAttribute("data-dia3-copy-prompt")];
        if (ex && navigator.clipboard) {
          navigator.clipboard.writeText(ex.prompt);
          copyPromptBtn.textContent = "✓ Prompt copiado";
        }
      });
    }
  }

  function renderExample() {
    if (!exampleViewer) return;
    exampleViewer.innerHTML = buildDia3ExampleHtml(currentExampleId, currentExampleMode);
    exampleSelectBtns.forEach(btn => {
      const active = btn.getAttribute("data-dia3-example-select") === currentExampleId;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    exampleModeBtns.forEach(btn => {
      const active = btn.getAttribute("data-dia3-example-mode") === currentExampleMode;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    wireExampleInnerControls();
    renderDia3Bridge();
  }

  const dia3BridgeMap = {
    "diagnostico-pc": { block: "agentes-archivos", index: 0, label: "Bloque 1 · Ejercicio A (Inventario de Hardware)" },
    "clasificador-200": { block: "agentes-archivos", index: 1, label: "Bloque 1 · Ejercicio B (Clasificador con Dry-Run)" },
    "panel-3-archivos": { block: "web-tres-archivos", index: 0, label: "Bloque 2 · Ejercicio A (Tablero Web en 3 Archivos)" },
    "pasarela-bff-segura": { block: "propiedad-apis", index: 0, label: "Bloque 3 · Ejercicio A (Auditoría y Pasarela BFF)" }
  };

  function renderDia3Bridge() {
    const bridgeEl = document.getElementById("dia3-sim-bridge");
    if (!bridgeEl) return;
    const mapping = dia3BridgeMap[currentExampleId] || dia3BridgeMap["diagnostico-pc"];
    const exData = DIA3_EXAMPLES[currentExampleId];
    bridgeEl.innerHTML = `
      <div class="canvas-sim-bridge-info">
        <span class="canvas-sim-bridge-tag">Paso siguiente en el Día 3 · Del ejemplo resuelto a tu ejercicio</span>
        <p class="canvas-sim-bridge-text">Ya exploraste <strong>${exData ? exData.title : currentExampleId}</strong>. Pasa directamente al ejercicio práctico correspondiente para construir y verificar tu entregable:</p>
      </div>
      <div class="canvas-sim-bridge-cta">
        <button type="button" class="canvas-mode-pager-btn is-primary" id="btn-dia3-bridge-go">🧪 Practicar ${mapping.label} →</button>
      </div>
    `;
    const goBtn = document.getElementById("btn-dia3-bridge-go");
    if (goBtn) {
      goBtn.addEventListener("click", () => {
        currentBlock = mapping.block;
        currentExIndex = mapping.index;
        renderDia3Exercise();
        const exMod = document.getElementById("dia3-exercises-module");
        if (exMod) requestAnimationFrame(() => exMod.scrollIntoView({ behavior: "smooth", block: "start" }));
      });
    }
  }

  // Modo inmersivo del Día 3 (Ejemplos + Laboratorio + Ejercicios)
  const dia3Section = document.getElementById("dia-3");
  const dia3ImmersiveBar = document.getElementById("dia3-immersive-bar");
  const btnDia3Full = document.getElementById("btn-toggle-dia3-fullscreen");
  const btnDia3ExFull = document.getElementById("btn-toggle-dia3-ex-fullscreen");
  const btnDia3HudExit = document.getElementById("btn-dia3-hud-exit");
  const dia3StationBtns = document.querySelectorAll("[data-dia3-immersive-target]");

  function toggleDia3Immersive(scrollTargetId, forceState) {
    if (!dia3Section) return;
    const currentlyFull = dia3Section.classList.contains("is-immersive");
    const isFull = typeof forceState === "boolean" ? forceState : !currentlyFull;
    dia3Section.classList.toggle("is-immersive", isFull);
    if (dia3ImmersiveBar) dia3ImmersiveBar.hidden = !isFull;
    [btnDia3Full, btnDia3ExFull].forEach(btn => {
      if (!btn) return;
      btn.innerHTML = isFull ? "✕ Salir de Modo Inmersivo" : "⛶ Modo Inmersivo";
      btn.style.background = isFull ? "var(--color-primary)" : "";
      btn.style.color = isFull ? "#ffffff" : "";
    });
    document.body.style.overflow = isFull ? "hidden" : "";
    if (scrollTargetId) {
      dia3StationBtns.forEach(b => b.classList.toggle("is-active", b.getAttribute("data-dia3-immersive-target") === scrollTargetId));
      const targetEl = document.getElementById(scrollTargetId);
      if (targetEl) requestAnimationFrame(() => targetEl.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  if (btnDia3Full) btnDia3Full.addEventListener("click", () => toggleDia3Immersive("dia3-examples-module"));
  if (btnDia3ExFull) btnDia3ExFull.addEventListener("click", () => toggleDia3Immersive("dia3-exercises-module"));
  if (btnDia3HudExit) btnDia3HudExit.addEventListener("click", () => toggleDia3Immersive(null, false));
  dia3StationBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-dia3-immersive-target");
      dia3StationBtns.forEach(b => b.classList.toggle("is-active", b === btn));
      const el = targetId ? document.getElementById(targetId) : null;
      if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    });
  });

  exampleSelectBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentExampleId = btn.getAttribute("data-dia3-example-select");
      renderExample();
    });
  });

  exampleModeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentExampleMode = btn.getAttribute("data-dia3-example-mode");
      renderExample();
    });
  });

  renderExample();

  // --- Laboratorio Determinista de Auditoría de Seguridad y Tokens ---
  const secInput = document.getElementById("dia3-security-input");
  const secOutput = document.getElementById("dia3-audit-output");
  const btnAuditRun = document.getElementById("btn-dia3-run-audit");
  const btnAuditReset = document.getElementById("btn-dia3-reset-audit");
  const presetSecBtns = document.querySelectorAll("[data-dia3-security-preset]");

  function runSecurityAudit() {
    if (!secInput || !secOutput) return;
    const res = dia3AuditCodeSecurity(secInput.value);
    secOutput.innerHTML = buildDia3AuditResultHtml(res);
  }

  if (btnAuditRun) btnAuditRun.addEventListener("click", runSecurityAudit);
  if (btnAuditReset) {
    btnAuditReset.addEventListener("click", () => {
      if (secInput) secInput.value = "";
      runSecurityAudit();
    });
  }
  presetSecBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      presetSecBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const key = btn.getAttribute("data-dia3-security-preset");
      if (secInput && DIA3_SECURITY_PRESETS[key]) {
        secInput.value = DIA3_SECURITY_PRESETS[key].code;
        runSecurityAudit();
      }
    });
  });
  if (secInput && secOutput && DIA3_SECURITY_PRESETS.vulnerable) {
    secInput.value = DIA3_SECURITY_PRESETS.vulnerable.code;
    runSecurityAudit();
  }

  // Calculadora de Tokens
  const reqInput = document.getElementById("dia3-budget-requests");
  const inTokInput = document.getElementById("dia3-budget-in-tokens");
  const outTokInput = document.getElementById("dia3-budget-out-tokens");
  const budgetOutput = document.getElementById("dia3-budget-output");

  function updateBudgetCalc() {
    if (!reqInput || !inTokInput || !outTokInput || !budgetOutput) return;
    const r = Math.max(1, Number(reqInput.value) || 1);
    const i = Math.max(1, Number(inTokInput.value) || 1);
    const o = Math.max(1, Number(outTokInput.value) || 1);
    const res = dia3EstimateTokenBudget(r, i, o);
    budgetOutput.innerHTML = buildDia3BudgetResultHtml(res);
  }
  [reqInput, inTokInput, outTokInput].forEach(el => {
    if (el) el.addEventListener("input", updateBudgetCalc);
  });
  updateBudgetCalc();

  // --- Ejercicios Prácticos Guiados del Día 3 (6 ejercicios: 2 por bloque) ---
  const exContainer = document.getElementById("dia3-exercises-content");
  const exBlockLabel = document.getElementById("dia3-exercises-block-label");
  const exBlockBtns = document.querySelectorAll("[data-dia3-block]");
  const exIndexBtns = document.querySelectorAll("[data-dia3-exercise-index]");
  let currentBlock = "agentes-archivos";
  let currentExIndex = 0;

  const blockNames = {
    "agentes-archivos": "Bloque 1 · Agentes de Consola y Archivos",
    "web-tres-archivos": "Bloque 2 · Arquitectura Web de 3 Archivos",
    "propiedad-apis": "Bloque 3 · Propiedad Intelectual y Seguridad de APIs"
  };

  function updateDia3ExerciseProgress(card) {
    const checks = card.querySelectorAll(".canvas-exercise-check");
    const done = Array.from(checks).filter(c => c.checked).length;
    const progressEl = card.querySelector("[data-exercise-progress]");
    const barEl = card.querySelector("[data-exercise-bar]");
    if (progressEl) {
      progressEl.textContent = done === checks.length ? `${done}/${checks.length} · ¡Resultado completo!` : `${done}/${checks.length}`;
    }
    if (barEl) barEl.style.width = `${checks.length ? (done / checks.length) * 100 : 0}%`;
    card.classList.toggle("is-complete", checks.length > 0 && done === checks.length);
  }

  function renderDia3Exercise() {
    if (!exContainer || typeof buildCanvasExerciseHtml !== "function") return;
    const list = DIA3_EXERCISES[currentBlock];
    if (!list) return;
    const exercise = list[currentExIndex] || list[0];
    if (exBlockLabel) exBlockLabel.textContent = blockNames[currentBlock] || currentBlock;

    exBlockBtns.forEach(btn => {
      const active = btn.getAttribute("data-dia3-block") === currentBlock;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    exIndexBtns.forEach(btn => {
      const active = Number(btn.getAttribute("data-dia3-exercise-index")) === currentExIndex;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });

    exContainer.innerHTML = buildCanvasExerciseHtml(exercise, currentExIndex, currentBlock);
    const card = exContainer.querySelector(".canvas-exercise-card");
    if (!card) return;
    const goSimBtn = card.querySelector("[data-go-simulator]");
    if (goSimBtn) {
      goSimBtn.addEventListener("click", () => {
        const blockToExample = {
          "agentes-archivos": currentExIndex === 1 ? "clasificador-200" : "diagnostico-pc",
          "web-tres-archivos": "panel-3-archivos",
          "propiedad-apis": "pasarela-bff-segura"
        };
        currentExampleId = blockToExample[currentBlock] || "diagnostico-pc";
        renderExample();
        const exMod = document.getElementById("dia3-examples-module");
        if (exMod) requestAnimationFrame(() => exMod.scrollIntoView({ behavior: "smooth", block: "start" }));
      });
    }
    const stepperItems = card.querySelectorAll(".canvas-exercise-stepper .stepper-item");
    const stepChecks = card.querySelectorAll(".canvas-step-done");
    stepChecks.forEach(sc => {
      sc.addEventListener("change", () => {
        const li = sc.closest(".canvas-exercise-step");
        if (li) li.classList.toggle("is-step-done", sc.checked);
        const doneSteps = Array.from(stepChecks).filter(c => c.checked).length;
        const allStepsDone = stepChecks.length > 0 && doneSteps === stepChecks.length;
        if (stepperItems.length >= 4) {
          stepperItems[1].classList.toggle("is-done", doneSteps > 0);
          stepperItems[1].classList.toggle("is-current", doneSteps === 0);
          stepperItems[2].classList.toggle("is-done", allStepsDone);
          stepperItems[2].classList.toggle("is-current", doneSteps > 0 && !allStepsDone);
          stepperItems[3].classList.toggle("is-current", allStepsDone);
        }
      });
    });
    card.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(canvasCopyText(exercise, btn.getAttribute("data-copy")));
        }
        btn.textContent = "✓ Copiado al portapapeles";
      });
    });
    card.querySelectorAll(".canvas-exercise-check").forEach(check => {
      check.addEventListener("change", () => updateDia3ExerciseProgress(card));
    });
    const resetBtn = card.querySelector("[data-exercise-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        card.querySelectorAll(".canvas-exercise-check").forEach(c => { c.checked = false; });
        updateDia3ExerciseProgress(card);
      });
    }
    updateDia3ExerciseProgress(card);
  }

  exBlockBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentBlock = btn.getAttribute("data-dia3-block");
      currentExIndex = 0;
      renderDia3Exercise();
    });
  });

  exIndexBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentExIndex = Number(btn.getAttribute("data-dia3-exercise-index"));
      renderDia3Exercise();
    });
  });

  renderDia3Exercise();
}

// ==========================================
// 13. Módulo de Productividad con IA: estaciones, calculadora, V.E.R.A. y kit de bolsillo
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof PRODUCTIVITY_STATIONS === "undefined") return;

  document.querySelectorAll(".prod-station-slot").forEach(slot => {
    const station = getStationByDay(slot.dataset.prodDay);
    if (station) slot.innerHTML = buildStationHtml(station);
  });

  const form = document.getElementById("prod-savings-form");
  const output = document.getElementById("prod-savings-output");
  if (form && output) {
    const readForm = () => ({
      minutesBefore: document.getElementById("prod-min-before").value,
      minutesAfter: document.getElementById("prod-min-after").value,
      timesPerWeek: document.getElementById("prod-times-week").value
    });
    const render = () => { output.innerHTML = buildSavingsResultHtml(computeTimeSavings(readForm())); };
    form.addEventListener("submit", event => { event.preventDefault(); render(); });
    // El evento reset ocurre antes de limpiar los campos; se calcula con entradas vacías.
    form.addEventListener("reset", () => { output.innerHTML = buildSavingsResultHtml(computeTimeSavings({})); });
    render();
  }

  const vera = document.getElementById("prod-vera-checklist");
  const veraStatus = document.getElementById("prod-vera-status");
  if (vera && veraStatus) {
    VERA_CHECKLIST.forEach(item => {
      const label = document.createElement("label");
      label.className = "prod-vera-item";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.value = item.key;
      label.append(box, ` ${item.key} · ${item.label}: ${item.question}`);
      vera.appendChild(label);
    });
    const messages = {
      empty: "Aún no has revisado la respuesta. No la uses todavía.",
      partial: "Revisión incompleta: termina las verificaciones pendientes.",
      ready: "Revisión V.E.R.A. completa: puedes usar la respuesta bajo tu responsabilidad."
    };
    const update = () => {
      const marks = {};
      vera.querySelectorAll("input[type=checkbox]").forEach(b => { marks[b.value] = b.checked; });
      const r = evaluateVeraChecklist(marks);
      veraStatus.textContent = messages[r.state];
      veraStatus.dataset.state = r.state;
    };
    vera.addEventListener("change", update);
    update();
  }

  const kitFilter = document.getElementById("prod-kit-filter");
  const kitList = document.getElementById("prod-kit-list");
  if (kitFilter && kitList) {
    const renderKit = () => { kitList.innerHTML = buildPocketKitHtml(filterPocketKit(kitFilter.value)); };
    kitFilter.addEventListener("change", renderKit);
    renderKit();
    const printBtn = document.getElementById("btn-prod-kit-print");
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        kitList.querySelectorAll("details").forEach(d => { d.open = true; });
        document.body.classList.add("printing-kit");
        window.addEventListener("afterprint", () => document.body.classList.remove("printing-kit"), { once: true });
        window.print();
      });
    }
  }

  const noAi = document.getElementById("prod-no-ai-body");
  if (noAi) {
    noAi.innerHTML = NO_AI_MATRIX.map(row =>
      `<tr><td>${escapeProdHtml(row.situation)}</td><td>${escapeProdHtml(row.risk)}</td><td>${escapeProdHtml(row.alternative)}</td></tr>`
    ).join("");
  }
});

// ==========================================
// 14. IA en suites ofimáticas y módulo de Agent Skills
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const officeTable = document.getElementById("office-ai-table");
  if (officeTable && typeof OFFICE_AI_TASKS !== "undefined") {
    officeTable.innerHTML = buildOfficeAiTableHtml(OFFICE_AI_TASKS);
  }

  if (typeof SKILL_EXAMPLES === "undefined") return;

  const comparison = document.getElementById("skills-comparison");
  if (comparison) comparison.innerHTML = buildSkillComparisonHtml(SKILL_COMPARISON);

  const examples = document.getElementById("skills-examples");
  if (examples) examples.innerHTML = buildSkillExamplesHtml(SKILL_EXAMPLES);

  const security = document.getElementById("skills-security-list");
  if (security) {
    security.innerHTML = SKILL_SECURITY_CHECKLIST.map(item => `<li>${escapeSkillHtml(item)}</li>`).join("");
  }

  const form = document.getElementById("skill-builder-form");
  const status = document.getElementById("skill-builder-status");
  const output = document.getElementById("skill-md-output");
  if (!form || !status || !output) return;

  const fields = ["name", "description", "contexto", "rol", "tarea", "tono", "limites", "resources"];
  const readParts = () => {
    const parts = {};
    fields.forEach(f => { parts[f] = document.getElementById(`skill-${f}`).value; });
    return parts;
  };
  const render = parts => {
    const result = evaluateSkill(parts);
    status.innerHTML = buildSkillResultHtml(result);
    // Solo se ofrece el SKILL.md para copiar cuando es válido.
    output.textContent = result.state === "valid" ? composeSkillMd(parts) : "";
  };

  form.addEventListener("submit", event => { event.preventDefault(); render(readParts()); });
  // El evento reset ocurre antes de limpiar los campos; se muestra el estado vacío.
  form.addEventListener("reset", () => render({}));
  const exampleBtn = document.getElementById("btn-skill-example");
  if (exampleBtn) {
    exampleBtn.addEventListener("click", () => {
      const ex = SKILL_EXAMPLES[0];
      fields.forEach(f => { document.getElementById(`skill-${f}`).value = ex[f] || ""; });
      render(readParts());
    });
  }
  render({});
});
