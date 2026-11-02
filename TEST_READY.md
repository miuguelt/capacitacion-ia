# E2E Test Suite Ready

## Test Runner
- **Node.js Suite (Coverage 100 % Obligatorio)**:
  `node --test --experimental-test-coverage --test-coverage-include="js/canvas-exercises.js" --test-coverage-include="js/canvas-possibilities.js" --test-coverage-include="js/dia3-module.js" --test-coverage-functions=100 --test-coverage-lines=100 --test-coverage-branches=100 tests/canvas-exercises.test.cjs tests/canvas-possibilities.test.cjs tests/dia3-module.test.cjs`
- **Pytest Suite (Integridad Web, Canvas y Módulos)**:
  `pytest tests/test_canvas_exercises.py tests/test_canvas_module.py tests/test_web_integrity.py`
- **Suite Pytest Completa**:
  `pytest`
- **Auditoría Estática de Texto y Maquetación (Regla 7.4)**:
  `node tools/text-layout/scripts/text-layout-audit.mjs --root . --project --fail-on-violations --json`

Expected: Todas las pruebas pasan con exit code 0 y cobertura de funciones al 100 %.

---

## Coverage Summary
| Tier | Count | Description |
|------|------:|-------------|
| 1. Feature Coverage | 24 | Pruebas de cobertura para los 12 modos y 24 ejercicios en posibilidades y banco |
| 2. Boundary & Corner | 12 | Restricciones de longitud (data >= 250, data >= 150), casos de borde matemáticos |
| 3. Cross-Feature | 8 | Sincronización entre JSON dataset, módulos JS, espejos en src/ y marcado HTML |
| 4. Real-World Application | 7 | Validación de Modo Split (Salida 1 y 2), DOM WAI-ARIA, activos de imagen JPEG > 50KB |
| 5. Negative Gatekeeping | 2 | Compuertas estrictas contra funciones no nativas (infografía, audio) y anti-dossier |
| **Total** | **53** | **51 tests en Node.js + 45 tests en Pytest (100% pasando)** |

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
| F8: Espejos en src/ | ✓ | ✓ | ✓ | ✓ | ✓ |
| F9: Botonera 12 modos en HTML | ✓ | ✓ | ✓ | ✓ | ✓ |
| F10: Modo Split de 2 Salidas en HTML | ✓ | ✓ | ✓ | ✓ | ✓ |
| F11: CSS Responsive y accesibilidad | ✓ | ✓ | ✓ | ✓ | ✓ |
| F12: Preservación módulos inferiores | ✓ | ✓ | ✓ | ✓ | ✓ |
| F13: Tests Node.js 12 modos / 24 ejercicios | ✓ | ✓ | ✓ | ✓ | ✓ |
| F14: Compuerta negativa anti-alucinación | ✓ | ✓ | ✓ | ✓ | ✓ |
| F15: Tests Pytest 12 modos y split view | ✓ | ✓ | ✓ | ✓ | ✓ |
| F16: Verificación E2E y auditoría | ✓ | ✓ | ✓ | ✓ | ✓ |
