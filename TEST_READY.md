# E2E Test Suite Ready

## Test Runner
- **Node.js Suite (Coverage 100 % Obligatorio en Funciones, Líneas y Ramas)**:
  `node --test --experimental-test-coverage --test-coverage-include="js/canvas-exercises.js" --test-coverage-include="js/canvas-possibilities.js" --test-coverage-include="js/dia3-module.js" --test-coverage-include="js/canvas-nav.js" --test-coverage-include="js/canvas-coverage.js" --test-coverage-include="js/canvas-subnav.js" --test-coverage-include="js/canvas-column-dnd.js" --test-coverage-include="js/projects-hub.js" --test-coverage-functions=100 --test-coverage-lines=100 --test-coverage-branches=100 tests/canvas-exercises.test.cjs tests/canvas-possibilities.test.cjs tests/dia3-module.test.cjs tests/canvas-nav.test.cjs tests/canvas-coverage.test.cjs tests/canvas-subnav.test.cjs tests/canvas-column-dnd.test.cjs tests/projects-hub.test.cjs`
- **Pytest Suite (Integridad Web, Canvas, Hub de Proyectos y Módulos)**:
  `pytest tests/test_canvas_exercises.py tests/test_canvas_module.py tests/test_web_integrity.py`
- **Suite Pytest Completa**:
  `pytest`
- **Auditoría Estática de Texto y Maquetación (Regla 7.4)**:
  `node tools/text-layout/scripts/text-layout-audit.mjs --root . --project --fail-on-violations --json`
- **Auditoría en Navegador de Texto y Maquetación (Regla 7.4)**:
  `node tools/text-layout/scripts/text-layout-browser-audit.cjs --root . --project --json`

Expected: Todas las pruebas pasan con exit code 0 y cobertura del 100.00 % en funciones, líneas y ramas.

---

## Coverage Summary
| Tier | Count | Description |
|------|------:|-------------|
| 1. Feature Coverage | 84 | Pruebas de cobertura para los 12 modos, 24 ejercicios, banco JSON y los 28 proyectos del Hub |
| 2. Boundary & Corner | 48 | Restricciones de longitud, casos de borde de filtros, normalización NFD y storage corrupto |
| 3. Cross-Feature | 32 | Sincronización entre JSON dataset, módulos JS, 23 pares espejo en src/ y marcado HTML |
| 4. Real-World Application | 42 | Validación de vistas Kanban/Bento/Lista, Drag & Drop, accesibilidad WCAG por teclado |
| 5. Negative Gatekeeping | 20 | Compuertas estrictas contra funciones no nativas, anti-dossier, cuota excedida y UMD fallback |
| **Total** | **226** | **226 tests en Node.js + 51 tests en Pytest (100% pasando)** |

---

## Feature Checklist
| Feature | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|---------|:------:|:------:|:------:|:------:|:------:|
| F1: Modo 11 en possibilities | ✓ | ✓ | ✓ | ✓ | ✓ |
| F2: Modo 12 en possibilities | ✓ | ✓ | ✓ | ✓ | ✓ |
| F3: Ejercicios 11.A y 11.B | ✓ | ✓ | ✓ | ✓ | ✓ |
| F4: Ejercicios 12.A y 12.B | ✓ | ✓ | ✓ | ✓ | ✓ |
| F5: Erradicación funciones no nativas | ✓ | ✓ | ✓ | ✓ | ✓ |
| F6: Activo gráfico canvas_gem_studio.jpg | ✓ | ✓ | ✓ | ✓ | ✓ |
| F7: Sincronización banco JSON | ✓ | ✓ | ✓ | ✓ | ✓ |
| F8: Espejos en src/ (23 pares SHA-256) | ✓ | ✓ | ✓ | ✓ | ✓ |
| F9: Botonera 12 modos en HTML | ✓ | ✓ | ✓ | ✓ | ✓ |
| F10: Modo Split de 2 Salidas en HTML | ✓ | ✓ | ✓ | ✓ | ✓ |
| F11: CSS Responsive y accesibilidad | ✓ | ✓ | ✓ | ✓ | ✓ |
| F12: Preservación módulos inferiores | ✓ | ✓ | ✓ | ✓ | ✓ |
| F13: Tests Node.js 12 modos / 24 ejercicios | ✓ | ✓ | ✓ | ✓ | ✓ |
| F14: Compuerta negativa anti-alucinación | ✓ | ✓ | ✓ | ✓ | ✓ |
| F15: Tests Pytest 12 modos y split view | ✓ | ✓ | ✓ | ✓ | ✓ |
| F16: Verificación E2E y auditoría | ✓ | ✓ | ✓ | ✓ | ✓ |
| F17: Hub de Proyectos & Entregables (Kanban, Bento, Lista, DnD, 100% Cobertura) | ✓ | ✓ | ✓ | ✓ | ✓ |

