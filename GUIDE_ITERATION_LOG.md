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

## 2026-11-17 · Gemini Canvas: un recorrido por modo
- Motivo: el aprendiz no sabía en qué modo estaba al bajar por la página, y el material que seguía a los ejercicios parecía un paso más del recorrido.
- Barra fija `#canvas-journey-bar`: dice siempre «Modo N de 13 · nombre · Ejemplo o Parte», abre un menú con los 13 modos y sus 39 ejercicios, muestra los pasos del modo (Ejemplo, A, B y C) y el avance global. Reemplaza la navegación por secciones, la brújula, las estaciones y la barra de enfoque.
- Espacio de trabajo `#canvas-mode-workspace`: ① ejemplo en el simulador, ② ejercicios del mismo modo y ③ qué sigue (otra parte, el ejemplo del modo siguiente o el cierre con enlace al Hub de proyectos).
- Los laboratorios de visión multimodal y de Gems pasaron a su modo (11 y 12) como contenido opcional plegado; el mapa de las 28 funciones y la guía descargable quedaron en «Recursos complementarios», al final.
- Se retiraron los filtros por área y las pestañas visibles de los 13 modos (siguen ocultas porque el simulador las usa).
- Corrección: al completar un ejercicio, `writeCanvasCompleted` usaba una variable inexistente y cortaba la actualización del progreso.
- Funciones nuevas con pruebas: `buildModeStations`, `buildModeWrapUp` y `stationAtScroll`; se retiró `computeLearnerGuideState`.
- Orden libre: la barra tiene un selector visible «Simulador» con los 13 modos y su avance, para abrir cualquiera con un clic. El menú aclara que el orden lo elige el aprendiz, el ciclo dice «③ Elige otro modo» y cada cierre ofrece «Elegir otro simulador» junto al modo siguiente de la lista.

## 2026-11-17 · Gemini Canvas: revisar el resultado sin trámites
- Motivo: cada ejercicio pedía unas 12 casillas (pasos y criterios). El último paso repetía la lista de verificación y el ejemplo del simulador tenía su propia lista, aunque el aprendiz no lo hizo.
- «2. Itera dentro de Canvas»: los pasos se leen, no se marcan. El texto que se escribe en Canvas tiene botón 📋 y la tarjeta no repite el paso «Comprueba tu resultado…».
- «3. Revisa tu resultado»: va después de los pasos, en una sola columna, con los criterios agrupados en «Cifras y datos» y «Lo que debes ver». Cada criterio tiene «✓ Cumple» y «✗ No cumple»; al marcar «No cumple» aparece un prompt de corrección listo para copiar. «✓ Todo cumple» marca todo de un clic.
- El simulador ya no tiene casillas: la pestaña «🔎 Qué fijarte en el resultado» muestra los criterios y cómo comprobarlos.
- El avance a medias se guarda por índice del criterio, así que los grupos no alteran lo ya marcado.
- Funciones nuevas con pruebas: `buildCriterionFixPrompt` y `groupCanvasCriteria`.
