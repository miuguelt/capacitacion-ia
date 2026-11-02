# Project: Gemini Canvas Lab Upgrade (12 Modos, Modo Split, R-C-I-R-F)

## Architecture
El módulo de Gemini Canvas Lab (`#gemini-canvas`) es una aplicación web SPA offline-first (`file://`), reactiva y modular, integrada en `index.html` (con réplica exacta en `src/index.html`).

### Capas del Sistema:
1. **Capa de Datos y Especificaciones**:
   - `js/canvas-possibilities.js` (espejos en `src/shared/` y `src/js/`): Catálogo canónico de posibilidades del Canvas con promptParts (R-C-I-R-F), imágenes de referencia, expected criteria (5+), quickActions, followUps y vistas interactivas.
   - `js/canvas-exercises.js` (espejos en `src/shared/` y `src/js/`): Banco de ejercicios prácticos A y B (2 por modo) con prompts R-C-I-R-F autosuficientes, pasos nativos de réplica, criterios observables y generadores SVG vectoriales puros.
   - `materiales/gemini_canvas/banco_prompts_canvas.json`: Dataset estructurado de posibilidades y ejercicios exportado automáticamente.
2. **Capa de Interfaz y Experiencia de Usuario**:
   - `index.html` / `src/index.html`: Botonera de 12 modos `.canvas-tab-bar`, simulador split `.canvas-split-container` con delimitación explícita de **Salida 1: Lienzo Principal** y **Salida 2: Interacción y Refinamiento**, toolbar de calibración reactiva y contenedor de ejercicios.
   - `css/styles.css` / `src/css/styles.css`: Estilos visuales acordes a `.antigravityrules`, CSS Grid responsivo (1fr / 1.35fr en escritorio, 1fr en móvil), paleta institucional y diseño accesible WAI-ARIA.
   - `js/app.js` / `src/js/app.js`: Controlador reactivo que vincula pestañas, eventos de clic, carga de posibilidades y conmutación de ejercicios.
3. **Capa de Verificación y Pruebas Automatizadas**:
   - `tests/canvas-possibilities.test.cjs` y `tests/canvas-exercises.test.cjs`: Suites Node.js con compuertas de cobertura estricta del 100 % en funciones, líneas y ramas.
   - `tests/test_canvas_exercises.py` y `tests/test_canvas_module.py`: Suites Pytest que validan DOM, réplicas duales, banco JSON, imágenes e invariantes léxicas.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Modo 11: Visión Multimodal en posibilidades | Definición canónica de `multimodal-vision` en `canvas-possibilities.js` con prompt R-C-I-R-F, formulario reactivo HTML5 con validación de correo institucional y medidor de contraseña | M1 | ORIGINAL_REQUEST §R2 |
| F2 | Modo 12: Gem Studio para Canvas en posibilidades | Definición canónica de `gem-studio` en `canvas-possibilities.js` con prompt R-C-I-R-F, System Prompt socrático, consola de prueba interactiva y criterios | M1 | ORIGINAL_REQUEST §R2 |
| F3 | Ejercicios 11.A y 11.B en canvas-exercises | `mm-a-boceto-formulario` y `mm-b-pizarra-flujograma` con prompts R-C-I-R-F, datos embebidos y generadores SVG | M1 | ORIGINAL_REQUEST §R2 |
| F4 | Ejercicios 12.A y 12.B en canvas-exercises | `gem-a-tutor-socratico` y `gem-b-auditor-rubricas` con prompts R-C-I-R-F, datos embebidos y generadores SVG | M1 | ORIGINAL_REQUEST §R2 |
| F5 | Erradicación de funciones no nativas en ejercicios | Reemplazar "Crear → Infografía", "Crear → Cuestionario" y "Crear → Resumen en audio" en ejercicios doc-a, doc-b, rubric-b y report-a por acciones nativas de Gemini Canvas | M1 | ORIGINAL_REQUEST §R4 |
| F6 | Generación de activo gráfico Modo 12 | Imagen `canvas_gem_studio.jpg` (> 50 KB) en `assets/images/canvas/` y espejo en `src/` | M1 | ORIGINAL_REQUEST §R2 |
| F7 | Sincronización de dataset banco_prompts_canvas.json | Exportar las 12 posibilidades y 24 ejercicios mediante `scripts/export_canvas_possibilities.cjs` | M1 | ORIGINAL_REQUEST §R2 |
| F8 | Sincronización de réplicas en src/ para datos | Garantizar que `src/shared/` y `src/js/` tengan copias idénticas de `canvas-possibilities.js` y `canvas-exercises.js` | M1 | test_src_mirrors_are_exact |
| F9 | Botonera de 12 Modos en index.html | Incorporar botones `<button class="canvas-tab" data-possibility="multimodal-vision">` y `data-possibility="gem-studio"` en `index.html` y `src/index.html` | M2 | ORIGINAL_REQUEST §R2 |
| F10 | Visualización en Modo Split de 2 salidas | Delimitar y rotular semánticamente en `.canvas-split-container`: Salida 1 (Lienzo Principal) y Salida 2 (Interacción y Refinamiento) con controles contextuales | M2 | ORIGINAL_REQUEST §R3 |
| F11 | Estilos responsivos y accesibilidad CSS | Adaptación de la botonera de 12 modos y tarjetas del Modo Split en `css/styles.css` y `src/css/styles.css` | M2 | ORIGINAL_REQUEST §R3, §R5 |
| F12 | Conservación de módulos inferiores de index.html | Preservar `#multimodal-simulator-module` y `#gem-studio-module` para cumplir invariantes de Pytest | M2 | tests/test_canvas_module.py |
| F13 | Actualización de suites de prueba Node.js | Ajustar MODES a 12 y ejercicios a 24 en `canvas-possibilities.test.cjs` y `canvas-exercises.test.cjs` manteniendo 100 % cobertura | M3 | ORIGINAL_REQUEST §R2, §R5 |
| F14 | Compuerta negativa anti-funciones experimentales | Incorporar en `canvas-exercises.test.cjs` validación negativa estricta que prohíba "Infografía" y "Resumen en audio" | M3 | ORIGINAL_REQUEST §R4 |
| F15 | Actualización de suites de prueba Pytest | Ajustar MODES (12) y conteos en `test_canvas_exercises.py` y `test_canvas_module.py`, añadiendo prueba del Modo Split | M3 | ORIGINAL_REQUEST §R3, §R5 |
| F16 | Verificación final y auditoría forense | Comprobación integral de ejecución sin errores (`pytest` 100%, `node:test` 100%), es-CO, cero 'dossier', coherencia matemática | M4 | ORIGINAL_REQUEST §R5 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Capa de Datos, Prompts R-C-I-R-F y Erradicación No Nativa | F1, F2, F3, F4, F5, F6, F7, F8 (`canvas-possibilities.js`, `canvas-exercises.js`, `canvas_gem_studio.jpg`, `banco_prompts_canvas.json`, réplicas `src/`) | none | DONE |
| M2 | Capa UI, Botonera de 12 Modos y Modo Split de 2 Salidas | F9, F10, F11, F12 (`index.html`, `src/index.html`, `css/styles.css`, `src/css/styles.css`, `js/app.js`) | M1 | DONE |
| M3 | Sincronización y Blindaje de Suites de Prueba (Dual Track) | F13, F14, F15 (`tests/test_canvas_*.py`, `tests/canvas-*.test.cjs`) | M1, M2 | DONE |
| M4 | Verificación E2E, Endurecimiento Adversarial y Auditoría Forense | F16 (Verificación integral, Challenger stress tests, Forensic Auditor CLEAN) | M3 | DONE |

---

## Interface Contracts

### 1. `CANVAS_POSSIBILITIES` ↔ `js/app.js` & `index.html`
- Claves canónicas del objeto (12 en total):
  1. `"doc-editorial"`
  2. `"code-prototyping"`
  3. `"data-matrix"`
  4. `"flowchart-diagram"`
  5. `"visual-mockup"`
  6. `"inline-prompting"`
  7. `"algorithm-refactor"`
  8. `"rubric-curriculum"`
  9. `"sql-pipeline"`
  10. `"executive-report"`
  11. `"multimodal-vision"`
  12. `"gem-studio"`
- Cada modo debe tener:
  - `promptParts.instruction`: debe iniciar con `"En Canvas, "`
  - `promptParts.data.trim().length >= 250`
  - `expected.length >= 5`
  - `quickActions.length >= 2`
  - `image`: ruta a archivo existente con tamaño > 50 KB.

### 2. `CANVAS_EXERCISES` ↔ `js/app.js` & `tests/`
- Exactamente 2 ejercicios por cada uno de los 12 modos (24 ejercicios en total).
- Cada ejercicio debe tener:
  - `promptParts.data.trim().length >= 150`
  - `steps.length >= 4`
  - `expected.length >= 4`
  - Cero menciones de `"Infografía"`, `"Resumen en audio"` o `"Crear →"`.
  - Cero menciones de `"dossier"` (usar `"Portafolio de Evidencias"`).

### 3. Modo Split de 2 Salidas en `index.html` ↔ `tests/test_canvas_module.py`
- Selector contenedor: `.canvas-split-container` (CSS Grid responsivo).
- **Salida 1: Lienzo Principal**:
  - Elemento semántico con identificador o clase representativa (ej. `#canvas-output-primary` / `.canvas-editor-pane`) con rótulo visible "Salida 1: Lienzo Principal" o badge representativo del artefacto generado.
- **Salida 2: Interacción y Refinamiento**:
  - Elemento semántico complementario (ej. `#canvas-output-refinement` / `.canvas-chat-pane`) con rótulo visible "Salida 2: Interacción y Refinamiento", con prompt listo para copiar, followUps, selector inline y exportación.

---

## Code Layout
- `js/canvas-possibilities.js`: Definición de los 12 modos principales.
- `js/canvas-exercises.js`: Definición de los 24 ejercicios A y B.
- `src/shared/canvas-possibilities.js`: Réplica espejo exacta de possibilities.
- `src/js/canvas-possibilities.js`: Réplica espejo exacta de possibilities.
- `src/shared/canvas-exercises.js`: Réplica espejo exacta de exercises.
- `src/js/canvas-exercises.js`: Réplica espejo exacta de exercises.
- `materiales/gemini_canvas/banco_prompts_canvas.json`: Dataset JSON compilado de posibilidades y ejercicios.
- `index.html`: Estructura HTML con botonera de 12 pestañas y Modo Split de 2 salidas.
- `src/index.html`: Réplica espejo exacta de `index.html`.
- `css/styles.css`: Estilos visuales del módulo Canvas y contenedor Split.
- `src/css/styles.css`: Réplica espejo exacta de `css/styles.css`.
- `assets/images/canvas/`: Activos gráficos (incluyendo `canvas_gem_studio.jpg`).
- `src/assets/images/canvas/`: Réplica espejo exacta de imágenes.
- `tests/test_canvas_exercises.py`: Pruebas de ejercicios en Pytest.
- `tests/test_canvas_module.py`: Pruebas de integración del módulo en Pytest.
- `tests/canvas-exercises.test.cjs`: Pruebas unitarias de ejercicios en Node.js.
- `tests/canvas-possibilities.test.cjs`: Pruebas unitarias de posibilidades en Node.js.
