# Bitácora de iteraciones

## 2026-11-15 · Productividad y cumplimiento del canon
- Se reemplazaron las menciones del marco R-C-I-R-F por el método CRTT+L en el portal, los módulos, el README, el registro de evidencias y el banco de prompts.
- Se retiró el retardo de 450 ms que simulaba procesamiento en la consola de Gem Studio; la respuesta ahora es inmediata.
- Se creó `js/productivity-module.js` con cuatro estaciones de productividad (correo y actas, presentación express, hojas de cálculo, sistema personal), calculadora de tiempo ahorrado, lista V.E.R.A., kit de bolsillo de 15 prompts y matriz de uso responsable.
- Materiales nuevos: `bandeja_correos_practica.md` (Día 1) y `biblioteca_personal_prompts.md` (Día 4).
- Pruebas: `tests/productivity-module.test.cjs` con 100 % de funciones, líneas y ramas; incluidas en el flujo de CI.
- Se crearon los artefactos de gobernanza faltantes y la ADR-0001.

## 2026-11-16 · Agent Skills e IA en suites ofimáticas
- Día 3: módulo de Agent Skills (`js/skills-module.js`) con comparación prompt/Gem/skill/agente, constructor y validador de SKILL.md (cuatro estados), tres skills de ejemplo y lista de seguridad.
- Materiales: `guia_agent_skills.md` y `materiales/dia3_agentes_web/skills/` (los SKILL.md se generan desde el módulo y una prueba verifica que coincidan).
- Día 1: tabla de IA en Google Workspace (Gemini) y Microsoft 365 (Copilot) con prompts CRTT+L por tarea.
- Se corrigieron fallas previas de CI: cobertura de ramas al 100 % y harness alineados con el banco de 36 ejercicios.

## 2026-11-16 · Gemini Canvas: apps con datos y revisión de claridad
- Posibilidad 13 «Apps interactivas» con simulador de reservas (cuatro estados: válida, inválida, vacía y reinicio) e imagen `canvas_apps_interactivas.jpg`.
- Ejercicios 13A (Crear → Tarjetas de estudio), 13B (app que guarda datos entre sesiones) y 13C (app con datos compartidos, con advertencia sobre quién ve los registros). Total: 39 ejercicios y 28 capacidades.
- Fuentes consultadas: notas de versión y ayuda oficial de Gemini sobre apps que guardan y comparten datos; las tarjetas de estudio pasan de «por confirmar» a capacidad practicada, con alternativa si la cuenta no muestra la opción.
- Claridad: títulos de 10 palabras o menos, `canvasFeature` con una sola función, `whyCanvas` y `outsideCanvas` sin repetir ideas, paso final único (`CANVAS_VERIFY_STEP`), retos sin relleno y sin la jerga «Visión Completa 360°».
- Redacción del portal: se retiraron expresiones como «edición quirúrgica», «alta fidelidad», «canónico» y «en caliente».
- Pruebas nuevas que vigilan esas reglas de redacción, el modo 13 y `canvasSlotBooking`; conteos del Hub de Proyectos actualizados a 43.
