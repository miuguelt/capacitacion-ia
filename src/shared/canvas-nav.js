// Rutas profundas del módulo Gemini Canvas: #gemini-canvas/<modo>/<a|b|c>.
// Funciones puras: app.js las usa para navegar y las pruebas las comprueban sin DOM.
const CANVAS_ROUTE_PAGE = "gemini-canvas";
const CANVAS_EXERCISE_LETTERS = ["a", "b", "c"];

function parseCanvasRoute(hash, modes) {
  const clean = String(hash || "").replace(/^#/, "");
  if (!clean) return { page: null, mode: null, exercise: null };
  const [page, mode, letter] = clean.split("/");
  const known = Array.isArray(modes) && modes.includes(mode);
  const index = CANVAS_EXERCISE_LETTERS.indexOf(letter);
  return {
    page,
    mode: known ? mode : null,
    exercise: known && index >= 0 ? index : null
  };
}

function buildCanvasRoute(mode, exercise) {
  if (!mode) return `#${CANVAS_ROUTE_PAGE}`;
  const letter = CANVAS_EXERCISE_LETTERS[exercise];
  return `#${CANVAS_ROUTE_PAGE}/${mode}${letter ? `/${letter}` : ""}`;
}

function neighborCanvasMode(modes, current, direction) {
  const index = modes.indexOf(current);
  if (index < 0) return null;
  return modes[index + direction] || null;
}

// Recorrido lineal de los ejercicios: modo 1 A, modo 1 B, modo 2 A...
function listExerciseSequence(modes, bank) {
  const seq = [];
  modes.forEach(mode => {
    (bank[mode] || []).forEach((ex, exercise) => seq.push({ mode, exercise, id: ex.id }));
  });
  return seq;
}

function findStep(seq, mode, exercise) {
  return seq.findIndex(step => step.mode === mode && step.exercise === exercise);
}

function neighborExercise(seq, mode, exercise, direction) {
  const index = findStep(seq, mode, exercise);
  if (index < 0) return null;
  return seq[index + direction] || null;
}

function firstPendingExercise(seq, completedIds) {
  const done = Array.isArray(completedIds) ? completedIds : [];
  return seq.find(step => !done.includes(step.id)) || null;
}

function exercisePosition(seq, mode, exercise) {
  const index = findStep(seq, mode, exercise);
  return index < 0 ? null : { number: index + 1, total: seq.length };
}

// Casillas marcadas a medias: se guardan como índices.
function serializeChecks(states) {
  return states.reduce((acc, on, i) => (on ? acc.concat(i) : acc), []);
}

function parseChecks(saved, count) {
  const list = Array.isArray(saved) ? saved : [];
  return Array.from({ length: count }, (_, i) => list.includes(i));
}

function modeExerciseProgress(mode, bank, completedIds) {
  const list = bank && Array.isArray(bank[mode]) ? bank[mode] : [];
  if (!list.length) return { done: 0, total: 0, nextIndex: 0, allDone: false };
  const completed = new Set(Array.isArray(completedIds) ? completedIds : []);
  const done = list.filter(ex => completed.has(ex.id)).length;
  const pendingIdx = list.findIndex(ex => !completed.has(ex.id));
  return {
    done,
    total: list.length,
    nextIndex: pendingIdx >= 0 ? pendingIdx : 0,
    allDone: done === list.length
  };
}

function isModeTransition(prevMode, nextMode) {
  return Boolean(prevMode && nextMode && prevMode !== nextMode);
}

const SPECIALIZED_MODE_LABS = {
  "multimodal-vision": {
    labId: "multimodal-simulator-module",
    title: "Simulador de Visión Multimodal (Boceto a Canvas)",
    cases: [
      { index: 0, caseId: "form", label: "Caso A: Boceto de Formulario (11A)" },
      { index: 1, caseId: "flow", label: "Caso B: Pizarra de Flujograma (11B)" }
    ]
  },
  "gem-studio": {
    labId: "gem-studio-module",
    title: "Constructor y Calibrador de Gems en Vivo",
    cases: [
      { index: 0, preset: "socratic", label: "Plantilla Tutor Socrático (12A)" },
      { index: 1, preset: "auditor", label: "Plantilla Auditor de Rúbricas (12B)" }
    ]
  }
};

function getSpecializedLabForMode(mode) {
  if (!mode || typeof mode !== "string") return null;
  return SPECIALIZED_MODE_LABS[mode] || null;
}

const IMMERSIVE_FOCUS_MODES = ["all", "split", "simulator", "exercises"];

function resolveImmersiveFocus(currentFocus, requestedSection) {
  const safeCurrent = IMMERSIVE_FOCUS_MODES.includes(currentFocus) ? currentFocus : "all";
  if (!requestedSection) return safeCurrent;
  if (requestedSection === "labs") return "all";
  if (safeCurrent === "all" || safeCurrent === "split") return safeCurrent;
  if (requestedSection === "exercises" && safeCurrent === "simulator") return "exercises";
  if (requestedSection === "simulator" && safeCurrent === "exercises") return "simulator";
  return safeCurrent;
}

function computeLearnerGuideState(params) {
  const p = params && typeof params === "object" ? params : {};
  const mode = p.mode || "doc-editorial";
  const modeName = p.modeName || "1. Redacción & Documentos";
  const exIndex = Number.isInteger(p.exerciseIndex) ? p.exerciseIndex : 0;
  const letter = ["A", "B", "C"][exIndex] || "A";
  const ex = p.exercise && typeof p.exercise === "object" ? p.exercise : null;
  const exCode = ex && ex.code ? ex.code : `${exIndex + 1}${letter}`;
  const exTitle = ex && ex.title ? ex.title : `Parte ${letter}`;
  const stepsDone = Math.max(0, Number(p.stepsDone) || 0);
  const stepsTotal = Math.max(0, Number(p.stepsTotal) || 0);
  const checksDone = Math.max(0, Number(p.checksDone) || 0);
  const checksTotal = Math.max(0, Number(p.checksTotal) || 0);
  const labInfo = getSpecializedLabForMode(mode);

  if (!ex) {
    return {
      phase: "1-explore",
      phaseNumber: 1,
      totalPhases: 4,
      headline: `Paso 1 de 4 · Explora el ejemplo resuelto de ${modeName} en el simulador.`,
      hint: "Revisa el prompt CRTT+L y luego pasa a los ejercicios prácticos de este modo.",
      ctaLabel: `🧪 Ir a Ejercicios Prácticos →`,
      ctaAction: "go-exercises",
      labInfo
    };
  }

  // Fase 4: Ejercicio completado (todos los criterios verificados)
  if (checksTotal > 0 && checksDone >= checksTotal) {
    const nextStep = p.nextStep || null;
    if (!nextStep) {
      return {
        phase: "4-advance",
        phaseNumber: 4,
        totalPhases: 4,
        headline: `🎉 ¡Felicitaciones! Completaste el ejercicio ${exCode} y finalizaste la ruta de Gemini Canvas.`,
        hint: "Ahora puedes organizar y sustentar tus entregables en el Hub de Proyectos.",
        ctaLabel: "🗂️ Abrir Hub de Proyectos →",
        ctaAction: "open-projects-hub",
        labInfo
      };
    }
    if (isModeTransition(mode, nextStep.mode)) {
      return {
        phase: "4-advance",
        phaseNumber: 4,
        totalPhases: 4,
        headline: `✅ Ejercicio ${exCode} completado · Terminaste las prácticas de ${modeName}.`,
        hint: "Avanza al siguiente modo para explorar primero su ejemplo resuelto en el simulador.",
        ctaLabel: "🆕 Siguiente modo en el simulador →",
        ctaAction: "next-mode",
        labInfo
      };
    }
    const nextLetter = ["A", "B", "C"][nextStep.exercise] || "B";
    return {
      phase: "4-advance",
      phaseNumber: 4,
      totalPhases: 4,
      headline: `✅ Ejercicio ${exCode} (${exTitle}) completado con todos sus criterios.`,
      hint: `Continúa ahora con la Parte ${nextLetter} de este mismo modo para afianzar la habilidad.`,
      ctaLabel: `➡️ Continuar con Parte ${nextLetter} →`,
      ctaAction: "next-exercise",
      labInfo
    };
  }

  // Fase 3: Todos los pasos de iteración en Canvas marcados, falta verificar criterios
  if (stepsTotal > 0 && stepsDone >= stepsTotal) {
    return {
      phase: "3-verify",
      phaseNumber: 3,
      totalPhases: 4,
      headline: `Paso 3 de 4 · Verifica tu resultado en el Ejercicio ${exCode} (${checksDone}/${checksTotal} criterios cumplidos).`,
      hint: "Compara tu artefacto de Gemini Canvas con la vista de referencia y marca cada criterio cumplido.",
      ctaLabel: "✅ Ir a la lista de verificación →",
      ctaAction: "focus-checks",
      labInfo
    };
  }

  // Fase 2: Iteración en curso (al menos 1 paso marcado o al menos 1 criterio marcado)
  if (stepsDone > 0 || checksDone > 0) {
    const nextStepNum = Math.min(stepsTotal, stepsDone + 1);
    return {
      phase: "2-iterate",
      phaseNumber: 2,
      totalPhases: 4,
      headline: `Paso 2 de 4 · Ejercicio ${exCode}: Ejecuta el Paso ${nextStepNum} de ${stepsTotal} en Gemini Canvas.`,
      hint: "Sigue la instrucción resaltada en comillas latinas («…») y marca la casilla del paso al realizarlo.",
      ctaLabel: `🧭 Ir al Paso ${nextStepNum} de ${stepsTotal} →`,
      ctaAction: "focus-steps",
      labInfo
    };
  }

  // Fase 1: Inicio del ejercicio
  return {
    phase: "1-explore",
    phaseNumber: 1,
    totalPhases: 4,
    headline: `Paso 1 de 4 · Ejercicio ${exCode} (${exTitle}): Revisa el ejemplo y copia el prompt CRTT+L.`,
    hint: "Primero observa el resultado esperado en el simulador o copia el prompt del ejercicio para abrirlo en Gemini Canvas.",
    ctaLabel: `📋 Copiar prompt de ${exCode} e iniciar →`,
    ctaAction: "copy-prompt",
    labInfo
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseCanvasRoute, buildCanvasRoute, neighborCanvasMode, listExerciseSequence,
    neighborExercise, firstPendingExercise, exercisePosition, serializeChecks, parseChecks,
    modeExerciseProgress, isModeTransition, SPECIALIZED_MODE_LABS, getSpecializedLabForMode,
    IMMERSIVE_FOCUS_MODES, resolveImmersiveFocus, computeLearnerGuideState
  };
}
