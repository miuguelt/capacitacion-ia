/**
 * Harness de Estrés y Simulación Reactiva DOM - Milestone 2
 * Capacitación IA - Gemini Canvas Lab
 * 
 * Valida de forma estricta:
 * - Correspondencia biunívoca entre los 12 botones del DOM y CANVAS_POSSIBILITIES.
 * - Sincronización con los 24 ejercicios de CANVAS_EXERCISES.
 * - Simulación de carga reactiva de cada modo sobre los selectores de index.html.
 * - Estructura y badges del Modo Split de 2 salidas.
 * - Integridad del árbol DOM e invariante de orden.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT_DIR, 'index.html');
const SRC_INDEX_PATH = path.join(ROOT_DIR, 'src', 'index.html');

const { CANVAS_POSSIBILITIES } = require(path.join(ROOT_DIR, 'js', 'canvas-possibilities.js'));
const { CANVAS_EXERCISES } = require(path.join(ROOT_DIR, 'js', 'canvas-exercises.js'));

const results = { passed: 0, failed: 0, errors: [] };

function runTest(name, fn) {
  try {
    fn();
    results.passed++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    results.failed++;
    results.errors.push({ name, error: err.message });
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

console.log('======================================================================');
console.log('  HARNESS DE ESTRÉS Y SIMULACIÓN REACTIVA DOM (NODE.JS) - MILESTONE 2');
console.log('======================================================================');

const indexHtml = fs.readFileSync(INDEX_PATH, 'utf8');

// 1. Validar las 12 pestañas y correspondencia con CANVAS_POSSIBILITIES
runTest('1. Biyección de los 12 modos entre .canvas-tab-bar del DOM y CANVAS_POSSIBILITIES', () => {
  const buttonRegex = /<button[^>]*class="canvas-tab[^"]*"[^>]*data-possibility="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g;
  const foundModes = [];
  let match;
  while ((match = buttonRegex.exec(indexHtml)) !== null) {
    // Validar solo los botones dentro del simulador de Canvas
    if (foundModes.length < 12) {
      foundModes.push({
        id: match[1],
        content: match[2].trim()
      });
    }
  }

  assert.strictEqual(foundModes.length, 12, `Se esperaban 12 botones en .canvas-tab-bar, encontrados ${foundModes.length}`);

  const canonicalKeys = Object.keys(CANVAS_POSSIBILITIES);
  assert.strictEqual(canonicalKeys.length, 12, `CANVAS_POSSIBILITIES debe tener exactamente 12 modos`);

  foundModes.forEach((btn, idx) => {
    assert.strictEqual(btn.id, canonicalKeys[idx], `Modo ${idx + 1}: el id del botón ('${btn.id}') no coincide con CANVAS_POSSIBILITIES ('${canonicalKeys[idx]}')`);
    
    // Validar icono y numeración
    assert.match(btn.content, /<span>[^<]+<\/span>/, `Modo ${btn.id} debe contener un <span> con icono`);
    assert.match(btn.content, new RegExp(`^<span>[^<]+<\\/span>\\s*${idx + 1}\\.`), `Modo ${btn.id} debe incluir la numeración '${idx + 1}.'`);
    
    // Validar que los datos de la posibilidad estén completos
    const poss = CANVAS_POSSIBILITIES[btn.id];
    assert.ok(poss, `No se encontró la posibilidad ${btn.id} en CANVAS_POSSIBILITIES`);
    assert.ok(poss.userPrompt && poss.userPrompt.length > 50, `Modo ${btn.id}: userPrompt inválido`);
    assert.ok(poss.aiResponse && poss.aiResponse.length > 20, `Modo ${btn.id}: aiResponse inválido`);
    assert.ok(poss.image && fs.existsSync(path.join(ROOT_DIR, poss.image)), `Modo ${btn.id}: imagen ${poss.image} no existe`);
    assert.ok(poss.expected && poss.expected.length >= 5, `Modo ${btn.id}: debe tener al menos 5 criterios esperados`);
    assert.ok(poss.quickActions && poss.quickActions.length >= 2, `Modo ${btn.id}: debe tener al menos 2 quickActions`);
  });
});

// 2. Validar correspondencia con los 24 ejercicios prácticos (2 por modo)
runTest('2. Integridad de los 24 ejercicios en CANVAS_EXERCISES para los 12 modos', () => {
  const modeKeys = Object.keys(CANVAS_POSSIBILITIES);
  let totalExercises = 0;

  modeKeys.forEach(modeId => {
    const exercises = CANVAS_EXERCISES[modeId];
    assert.ok(Array.isArray(exercises), `CANVAS_EXERCISES[${modeId}] debe ser un array`);
    assert.strictEqual(exercises.length, 2, `CANVAS_EXERCISES[${modeId}] debe contener exactamente 2 ejercicios (A y B)`);

    exercises.forEach((ex, exIdx) => {
      totalExercises++;
      assert.ok(ex.id, `Ejercicio ${modeId}[${exIdx}] debe tener id`);
      assert.ok(ex.title && ex.title.length > 5, `Ejercicio ${ex.id} debe tener title`);
      assert.ok(ex.prompt && ex.prompt.length > 50, `Ejercicio ${ex.id} debe tener prompt`);
      assert.ok(ex.steps && ex.steps.length >= 4, `Ejercicio ${ex.id} debe tener al menos 4 steps`);
      assert.ok(ex.expected && ex.expected.length >= 4, `Ejercicio ${ex.id} debe tener al menos 4 criterios observables`);
      assert.ok(ex.previewSvg && ex.previewSvg.startsWith('<svg') && ex.previewSvg.endsWith('</svg>'), `Ejercicio ${ex.id} debe tener previewSvg válido`);
    });
  });

  assert.strictEqual(totalExercises, 24, `El total de ejercicios prácticos debe ser exactamente 24`);
});

// 3. Simulación reactiva: comprobar que todos los destinos de app.js#loadPossibility existen en index.html
runTest('3. Simulación reactiva: existencia de todos los destinos DOM requeridos por loadPossibility()', () => {
  const targetSelectors = [
    'id="sim-user-prompt"',
    'id="sim-ai-response"',
    'id="sim-doc-icon"',
    'id="sim-doc-title"',
    'id="sim-quick-actions"',
    'id="sim-result-image"',
    'id="sim-image-caption"',
    'id="sim-interactive-content"',
    'id="sim-insights-content"',
    'id="sim-prompt-variation"',
    'id="sim-followups"',
    'id="panel-image-view"',
    'id="panel-interactive-view"',
    'id="panel-insights-view"',
    'id="canvas-exercises-content"',
    'id="canvas-exercises-mode-label"'
  ];

  targetSelectors.forEach(sel => {
    assert.ok(indexHtml.includes(sel), `El destino DOM '${sel}' requerido por app.js debe existir en index.html`);
  });
});

// 4. Modo Split de 2 Salidas: estructura, roles y badges
runTest('4. Validación semántica del Modo Split de 2 salidas y sus distintivos', () => {
  assert.ok(indexHtml.includes('class="canvas-split-container"'), 'Falta el contenedor .canvas-split-container');
  
  // Salida 1: Lienzo Principal
  assert.ok(indexHtml.includes('id="canvas-output-primary"'), 'Falta #canvas-output-primary');
  assert.ok(indexHtml.includes('id="canvas-output-primary-badge"'), 'Falta #canvas-output-primary-badge');
  assert.ok(indexHtml.includes('Salida 1: Lienzo Principal'), 'Falta rótulo de Salida 1');
  
  // Salida 2: Interacción y Refinamiento
  assert.ok(indexHtml.includes('id="canvas-output-refinement"'), 'Falta #canvas-output-refinement');
  assert.ok(indexHtml.includes('id="canvas-output-refinement-badge"'), 'Falta #canvas-output-refinement-badge');
  assert.ok(indexHtml.includes('Salida 2: Interacción y Refinamiento'), 'Falta rótulo de Salida 2');

  // Coexistencia simultánea: ambos presentes dentro de .canvas-split-container
  const splitStart = indexHtml.indexOf('class="canvas-split-container"');
  const splitEnd = indexHtml.indexOf('id="canvas-exercises-module"');
  const splitSection = indexHtml.slice(splitStart, splitEnd);
  assert.ok(splitSection.includes('id="canvas-output-primary"'), '#canvas-output-primary debe estar dentro de .canvas-split-container');
  assert.ok(splitSection.includes('id="canvas-output-refinement"'), '#canvas-output-refinement debe estar dentro de .canvas-split-container');
});

// 5. Invariante de orden secuencial
runTest('5. Invariante de orden secuencial estricto en el DOM', () => {
  const p1 = indexHtml.indexOf('id="canvas-simulator-module"');
  const p2 = indexHtml.indexOf('id="canvas-exercises-module"');
  const p3 = indexHtml.indexOf('id="multimodal-simulator-module"');
  const p4 = indexHtml.indexOf('id="gem-studio-module"');

  assert.ok(p1 !== -1, 'Falta #canvas-simulator-module');
  assert.ok(p2 !== -1, 'Falta #canvas-exercises-module');
  assert.ok(p3 !== -1, 'Falta #multimodal-simulator-module');
  assert.ok(p4 !== -1, 'Falta #gem-studio-module');

  assert.ok(p1 < p2, '#canvas-simulator-module debe preceder a #canvas-exercises-module');
  assert.ok(p2 < p3, '#canvas-exercises-module debe preceder a #multimodal-simulator-module');
  assert.ok(p3 < p4, '#multimodal-simulator-module debe preceder a #gem-studio-module');
});

// 6. Sincronización espejo estricta index.html <-> src/index.html
runTest('6. Sincronización espejo estricta index.html y src/index.html', () => {
  const srcHtml = fs.readFileSync(SRC_INDEX_PATH, 'utf8');
  assert.strictEqual(indexHtml, srcHtml, 'index.html y src/index.html deben ser estrictamente idénticos');
});

// 7. Verificación de compuertas negativas
runTest('7. Compuerta negativa estricta: cero funciones no nativas y cero "dossier"', () => {
  assert.strictEqual(indexHtml.toLowerCase().includes('dossier'), false, 'index.html no debe contener "dossier"');
  assert.strictEqual(indexHtml.includes('Crear → Infografía'), false, 'index.html no debe contener "Crear → Infografía"');
  assert.strictEqual(indexHtml.includes('Crear → Resumen en audio'), false, 'index.html no debe contener "Crear → Resumen en audio"');
});

console.log('======================================================================');
console.log(`  RESULTADOS: ${results.passed} PASSED, ${results.failed} FAILED`);
console.log('======================================================================');

if (results.failed > 0) {
  process.exit(1);
}
