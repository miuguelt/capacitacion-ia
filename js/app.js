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

  // Leer hash inicial si existe
  if (window.location.hash) {
    const hashTarget = window.location.hash.substring(1);
    if (document.getElementById(hashTarget)) {
      switchPage(hashTarget);
    }
  }
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
  const viewModeBtns = document.querySelectorAll(".view-mode-btn");
  const viewPanels = {
    image: document.getElementById("panel-image-view"),
    interactive: document.getElementById("panel-interactive-view"),
    insights: document.getElementById("panel-insights-view")
  };

  if (!tabs.length || !userPromptEl) return;

  function loadPossibility(id) {
    const data = CANVAS_POSSIBILITIES[id];
    if (!data) return;

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

    // Actualizar contenido interactivo
    if (interactiveContentEl) {
      interactiveContentEl.innerHTML = data.interactiveHtml;
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

    // Actualizar ejercicios prácticos del modo
    renderCanvasExercises(id);
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
    card.classList.toggle("is-complete", checks.length > 0 && done === checks.length);
  }

  function renderCanvasExercises(id) {
    if (!exercisesContentEl || typeof CANVAS_EXERCISES === "undefined") return;
    const list = CANVAS_EXERCISES[id];
    if (!list) return;
    if (id !== currentExerciseMode) {
      currentExerciseMode = id;
      currentExerciseIndex = 0;
    }
    const exercise = list[currentExerciseIndex];
    if (exercisesModeLabelEl && CANVAS_POSSIBILITIES[id]) {
      exercisesModeLabelEl.textContent = CANVAS_POSSIBILITIES[id].name;
    }
    exerciseSwitchBtns.forEach(btn => {
      const active = Number(btn.getAttribute("data-exercise-index")) === currentExerciseIndex;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    exercisesContentEl.innerHTML = buildCanvasExerciseHtml(exercise, currentExerciseIndex);

    const card = exercisesContentEl.querySelector(".canvas-exercise-card");
    if (!card) return;
    const copyBtn = card.querySelector(".canvas-exercise-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(exercise.prompt).then(() => {
          showCanvasToast("📋 Prompt copiado: pégalo en Gemini con Canvas activo.");
        });
      });
    }
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
    updateExerciseProgress(card);
  }

  exerciseSwitchBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentExerciseIndex = Number(btn.getAttribute("data-exercise-index"));
      renderCanvasExercises(currentExerciseMode);
    });
  });

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
        const simMod = document.getElementById("canvas-simulator-module");
        if (simMod && simMod.classList.contains("is-fullscreen")) {
          toggleFullscreen();
        }
      }
    }
  });

  // --- Modo Inmersivo / Pantalla Completa ---
  const btnFullscreen = document.getElementById("btn-toggle-canvas-fullscreen");
  const simModule = document.getElementById("canvas-simulator-module");

  function toggleFullscreen() {
    if (!simModule) return;
    const isFull = simModule.classList.toggle("is-fullscreen");
    if (btnFullscreen) {
      btnFullscreen.innerHTML = isFull ? "✕ Salir de Modo Inmersivo" : "⛶ Modo Inmersivo";
      btnFullscreen.style.background = isFull ? "var(--color-primary)" : "";
      btnFullscreen.style.color = isFull ? "#ffffff" : "";
    }
    document.body.style.overflow = isFull ? "hidden" : "";
    showCanvasToast(isFull ? "⛶ Modo inmersivo activado: vista de lienzo completa." : "Restaurada vista normal del simulador.");
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener("click", toggleFullscreen);
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
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const pId = tab.getAttribute("data-possibility");
      if (pId) {
        loadPossibility(pId);
      }
    });
  });

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

  // Cargar primera posibilidad por defecto
  loadPossibility("doc-editorial");

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
      desc: "Fundamentos, tokenización, R-C-I-R-F y constructor interactivo de prompts.",
      keywords: ["dia 1", "modelos", "documentos", "prompts", "rcirf", "tokenizacion"],
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
      title: "Practicar los 6 Ejercicios Guiados R-C-I-R-F del Día 3",
      desc: "2 ejercicios por bloque (Agentes y Archivos, Web de 3 Archivos, Seguridad y APIs) con vista previa SVG.",
      keywords: ["ejercicios", "dia 3", "practica", "rcirf", "agentes", "svg"],
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
      title: "Ir a Banco Maestro de Prompts R-C-I-R-F",
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
      title: "Ver Desglose de Prompt Imagen 3 (5 Bloques)",
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

  if (!slider || !label) return;

  const lengthLabels = {
    "1": "Síntesis (1/5)",
    "2": "Conciso (2/5)",
    "3": "Estándar (3/5)",
    "4": "Detallado (4/5)",
    "5": "Exhaustivo (5/5)"
  };

  function updateLength(val) {
    label.textContent = lengthLabels[val] || `Nivel ${val}/5`;
    const summary = document.getElementById("doc-executive-summary");
    const variants = CANVAS_POSSIBILITIES["doc-editorial"].lengthVariants;
    if (summary) {
      summary.innerHTML = `<strong>1. Resumen ejecutivo (${lengthLabels[val]})</strong>
        <p style="margin:0.25rem 0 0 0; font-size:0.86rem; color:var(--text-main);">${variants[Number(val) - 1]}</p>`;
    }
  }

  slider.addEventListener("input", e => {
    updateLength(e.target.value);
  });

  tonePills.forEach(pill => {
    pill.addEventListener("click", () => {
      tonePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      showCanvasToast(`🎭 Tono de Canvas calibrado: ${pill.textContent}`);
    });
  });

  audPills.forEach(pill => {
    pill.addEventListener("click", () => {
      audPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      showCanvasToast(`🎯 Audiencia de Canvas calibrada: ${pill.textContent}`);
    });
  });
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
            <div style="margin-top:0.4rem;">[Campo Email] Correo Institucional (debe ser @sena.edu.co)</div>
            <div style="margin-top:0.4rem;">[Campo Pass] Contraseña de acceso (mínimo 8 caracteres)</div>
            <div style="margin-top:0.6rem; display:inline-block; background:#ca8a04; color:#fff; padding:0.25rem 0.6rem; border-radius:4px;">[ BOTÓN: REGISTRARSE ]</div>
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
              ✓ Registrarse en Plataforma
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

    setTimeout(() => {
      const reply = generateAssistantResponse(text);
      appendAssistantMessage(reply);
    }, 450);
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
}

// 12. Módulo Interactivo del Día 3: Ejemplos en Vivo, Laboratorio de Seguridad y 6 Ejercicios R-C-I-R-F
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
  }

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

    exContainer.innerHTML = buildCanvasExerciseHtml(exercise, currentExIndex);
    const card = exContainer.querySelector(".canvas-exercise-card");
    if (!card) return;
    const copyBtn = card.querySelector(".canvas-exercise-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(exercise.prompt);
        }
        copyBtn.textContent = "✓ Prompt copiado al portapapeles";
      });
    }
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
