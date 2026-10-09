/**
 * Capacitación Práctica en Inteligencia Artificial (4 Días)
 * Lógica de la SPA: Navegación, Modo Instructor/Aprendiz, Constructor de Prompts y Temporizador
 */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initRoleSwitcher();
  initThemeToggle();
  initCopyButtons();
  initPromptBuilder();
  initClassroomTimer();
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
          breadcrumbCurrent.textContent = link.querySelector(".nav-text").textContent;
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
    if (e.target && e.target.classList.contains("copy-btn")) {
      const targetId = e.target.getAttribute("data-copy-target");
      const elementToCopy = document.getElementById(targetId);

      if (elementToCopy) {
        const text = elementToCopy.innerText || elementToCopy.textContent;
        navigator.clipboard.writeText(text.trim()).then(() => {
          const originalText = e.target.textContent;
          e.target.textContent = "✓ ¡Copiado!";
          e.target.style.backgroundColor = "var(--color-primary)";
          e.target.style.color = "white";

          setTimeout(() => {
            e.target.textContent = originalText;
            e.target.style.backgroundColor = "";
            e.target.style.color = "";
          }, 2000);
        });
      }
    }
  });
}

// 5. Constructor Interactivo de Prompts R-C-I-R-F
function initPromptBuilder() {
  const form = document.getElementById("prompt-builder-form");
  const outputText = document.getElementById("generated-prompt-output");

  if (!form || !outputText) return;

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
