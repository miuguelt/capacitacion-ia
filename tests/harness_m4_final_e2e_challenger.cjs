/**
 * Harness Adversarial E2E Challenger - Milestone 4
 * Verificación Adversarial Definitiva del Módulo Gemini Canvas Lab
 * Capacitación IA - SENA CGAO Vélez
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const { CANVAS_POSSIBILITIES } = require(path.join(ROOT_DIR, 'js', 'canvas-possibilities.js'));
const { CANVAS_EXERCISES } = require(path.join(ROOT_DIR, 'js', 'canvas-exercises.js'));

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: err.message });
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

console.log('================================================================================');
console.log('  FINAL E2E ADVERSARIAL CHALLENGER SUITE - MILESTONE 4');
console.log('================================================================================\n');

// --- TIER 1: 12 MODES & 24 EXERCISES CANONICAL INTEGRITY ---
console.log('--- TIER 1: 12 MODES & 24 EXERCISES CANONICAL INTEGRITY ---');

const CANONICAL_MODES = [
  'doc-editorial',
  'code-prototyping',
  'data-matrix',
  'flowchart-diagram',
  'visual-mockup',
  'inline-prompting',
  'algorithm-refactor',
  'rubric-curriculum',
  'sql-pipeline',
  'executive-report',
  'multimodal-vision',
  'gem-studio'
];

test('1.1 Exactamente 12 modos en CANVAS_POSSIBILITIES en orden canónico', () => {
  const keys = Object.keys(CANVAS_POSSIBILITIES);
  assert.strictEqual(keys.length, 12, `Se esperaban 12 modos, encontrados ${keys.length}`);
  assert.deepStrictEqual(keys, CANONICAL_MODES, 'El orden o claves de modos no coinciden con la secuencia canónica');
});

test('1.2 Cada modo posee todos los campos requeridos, R-C-I-R-F y límites de datos', () => {
  for (const [id, mode] of Object.entries(CANVAS_POSSIBILITIES)) {
    assert.ok(typeof mode.name === 'string' && mode.name.trim().length > 0, `${id}: falta name`);
    assert.ok(typeof mode.docTitle === 'string' && mode.docTitle.trim().length > 0, `${id}: falta docTitle`);
    assert.ok(typeof mode.docIcon === 'string' && mode.docIcon.trim().length > 0, `${id}: falta docIcon`);
    assert.ok(typeof mode.aiResponse === 'string' && mode.aiResponse.trim().length > 0, `${id}: falta aiResponse`);
    assert.ok(typeof mode.interactiveHtml === 'string' && mode.interactiveHtml.trim().length > 0, `${id}: falta interactiveHtml`);
    assert.ok(typeof mode.insightsHtml === 'string' && mode.insightsHtml.trim().length > 0, `${id}: falta insightsHtml`);
    assert.ok(typeof mode.variationTip === 'string' && mode.variationTip.trim().length > 0, `${id}: falta variationTip`);
    
    // R-C-I-R-F prompt parts
    assert.ok(mode.promptParts, `${id}: falta promptParts`);
    assert.ok(mode.promptParts.role && mode.promptParts.role.trim().length > 0, `${id}: falta role`);
    assert.ok(mode.promptParts.context && mode.promptParts.context.trim().length > 0, `${id}: falta context`);
    assert.ok(mode.promptParts.instruction && mode.promptParts.instruction.startsWith('En Canvas, '), `${id}: instruction debe iniciar con 'En Canvas, '`);
    assert.ok(mode.promptParts.format && mode.promptParts.format.trim().length > 0, `${id}: falta format`);
    assert.ok(Array.isArray(mode.promptParts.task) && mode.promptParts.task.length >= 3 && mode.promptParts.task.length <= 5, `${id}: task debe tener entre 3 y 5 items`);
    assert.ok(Array.isArray(mode.promptParts.constraints) && mode.promptParts.constraints.length >= 1 && mode.promptParts.constraints.length <= 3, `${id}: constraints debe tener entre 1 y 3 items`);
    assert.ok(typeof mode.promptParts.data === 'string' && mode.promptParts.data.trim().length >= 250, `${id}: data debe tener >= 250 caracteres (actual: ${mode.promptParts.data.trim().length})`);

    // Expected criteria (>= 5)
    assert.ok(Array.isArray(mode.expected) && mode.expected.length >= 5, `${id}: expected debe tener >= 5 items`);
    for (const exp of mode.expected) {
      assert.ok(exp.criterion && exp.criterion.trim().length > 0, `${id}: criterion vacío`);
      assert.ok(exp.how && exp.how.trim().length > 0, `${id}: how vacío`);
    }

    // QuickActions (>= 2)
    assert.ok(Array.isArray(mode.quickActions) && mode.quickActions.length >= 2, `${id}: quickActions debe tener >= 2 items`);

    // FollowUps (si está presente, debe ser array)
    if (mode.followUps) {
      assert.ok(Array.isArray(mode.followUps), `${id}: followUps debe ser array`);
    }

    // Image reference > 50 KB
    assert.ok(typeof mode.image === 'string', `${id}: falta image`);
    const imgPath = path.resolve(ROOT_DIR, mode.image);
    assert.ok(fs.existsSync(imgPath), `${id}: la imagen ${mode.image} no existe en disco`);
    const stat = fs.statSync(imgPath);
    assert.ok(stat.size > 50000, `${id}: la imagen ${mode.image} debe tener tamaño > 50 KB (actual: ${stat.size} bytes)`);
  }
});

const allExercisesList = Object.values(CANVAS_EXERCISES).flat();

test('1.3 Exactamente 24 ejercicios en CANVAS_EXERCISES (2 por modo: A y B)', () => {
  const modes = Object.keys(CANVAS_EXERCISES);
  assert.strictEqual(modes.length, 12, `Se esperaban 12 claves en CANVAS_EXERCISES, encontradas ${modes.length}`);
  assert.deepStrictEqual(modes.sort(), [...CANONICAL_MODES].sort(), 'Las claves de CANVAS_EXERCISES no coinciden con los 12 modos');

  for (const modeId of CANONICAL_MODES) {
    const list = CANVAS_EXERCISES[modeId];
    assert.ok(Array.isArray(list), `${modeId}: debe ser un array`);
    assert.strictEqual(list.length, 2, `El modo ${modeId} debe tener exactamente 2 ejercicios (tiene ${list.length})`);
  }

  assert.strictEqual(allExercisesList.length, 24, `Se esperaban 24 ejercicios en total, encontrados ${allExercisesList.length}`);
});

test('1.4 Cada ejercicio tiene R-C-I-R-F, pasos nativos, criterios observables y SVG válido', () => {
  const ids = new Set();
  const INSTRUCTION_REGEX = /^(En Canvas, |Copia (el|la) \S+ en Canvas sin cambiar )/;

  for (const ex of allExercisesList) {
    assert.ok(ex.id && ex.id.length > 0, 'Ejercicio sin ID');
    assert.ok(!ids.has(ex.id), `ID duplicado de ejercicio: ${ex.id}`);
    ids.add(ex.id);

    assert.ok(ex.title && ex.title.length > 0, `${ex.id}: sin title`);
    assert.ok(ex.goal && ex.goal.length > 0, `${ex.id}: sin goal`);
    assert.ok(ex.scenario && ex.scenario.length > 0, `${ex.id}: sin scenario`);

    // R-C-I-R-F
    assert.ok(ex.promptParts, `${ex.id}: sin promptParts`);
    assert.ok(ex.promptParts.role, `${ex.id}: sin role`);
    assert.ok(ex.promptParts.context, `${ex.id}: sin context`);
    assert.ok(ex.promptParts.instruction && INSTRUCTION_REGEX.test(ex.promptParts.instruction), `${ex.id}: instruction inválida (${ex.promptParts.instruction})`);
    assert.ok(ex.promptParts.format, `${ex.id}: sin format`);
    assert.ok(Array.isArray(ex.promptParts.task) && ex.promptParts.task.length >= 1, `${ex.id}: task debe tener >= 1 items`);
    assert.ok(Array.isArray(ex.promptParts.constraints) && ex.promptParts.constraints.length >= 1, `${ex.id}: constraints debe tener >= 1 item`);
    assert.ok(typeof ex.promptParts.data === 'string' && ex.promptParts.data.trim().length >= 150, `${ex.id}: data debe tener >= 150 caracteres (actual: ${ex.promptParts.data.trim().length})`);

    // Steps (>= 4)
    assert.ok(Array.isArray(ex.steps) && ex.steps.length >= 4, `${ex.id}: steps debe tener >= 4 items`);

    // Expected (>= 4)
    assert.ok(Array.isArray(ex.expected) && ex.expected.length >= 4, `${ex.id}: expected debe tener >= 4 items`);

    // previewSvg
    assert.ok(typeof ex.previewSvg === 'string' && ex.previewSvg.includes('<svg') && ex.previewSvg.includes('</svg>'), `${ex.id}: previewSvg no es SVG válido`);
    assert.ok(!ex.previewSvg.includes('NaN'), `${ex.id}: el SVG contiene valores NaN`);
    assert.ok(!ex.previewSvg.includes('undefined'), `${ex.id}: el SVG contiene valores undefined`);
  }
});

// --- TIER 2: NEGATIVE GATEKEEPING & LEXICAL SANITIZATION ---
console.log('\n--- TIER 2: NEGATIVE GATEKEEPING & LEXICAL INTEGRITY ---');

test('2.1 Cero extranjerismos no permitidos (dossier) en código y plantillas', () => {
  const targetFiles = [
    'index.html',
    'src/index.html',
    'js/canvas-possibilities.js',
    'js/canvas-exercises.js',
    'js/dia3-module.js',
    'js/app.js',
    'src/js/app.js',
    'src/shared/canvas-possibilities.js',
    'src/shared/canvas-exercises.js',
    'materiales/gemini_canvas/banco_prompts_canvas.json'
  ];

  for (const rel of targetFiles) {
    const full = path.join(ROOT_DIR, rel);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, 'utf8');
    const match = content.match(/\bdossier\b/i);
    assert.strictEqual(match, null, `Prohibición violada: se encontró 'dossier' en ${rel}`);
  }
});

test('2.2 Cero funciones no nativas o experimentales (Infografía, Resumen en audio, Crear →)', () => {
  const prohibited = [
    /infograf[ií]a/i,
    /resumen\s+en\s+audio/i,
    /crear\s*→/i,
    /crear\s*->/i
  ];

  const targetFiles = [
    'js/canvas-possibilities.js',
    'js/canvas-exercises.js',
    'src/shared/canvas-possibilities.js',
    'src/shared/canvas-exercises.js',
    'materiales/gemini_canvas/banco_prompts_canvas.json'
  ];

  for (const rel of targetFiles) {
    const full = path.join(ROOT_DIR, rel);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, 'utf8');
    for (const pattern of prohibited) {
      const match = content.match(pattern);
      assert.strictEqual(match, null, `Función no nativa detectada en ${rel}: ${match ? match[0] : ''}`);
    }
  }
});

test('2.3 Cero temporizadores simulados (setTimeout/setInterval) en módulos de posibilidades y ejercicios', () => {
  const targetFiles = [
    'js/canvas-possibilities.js',
    'js/canvas-exercises.js',
    'js/dia3-module.js'
  ];

  for (const rel of targetFiles) {
    const full = path.join(ROOT_DIR, rel);
    const content = fs.readFileSync(full, 'utf8');
    assert.strictEqual(content.includes('setTimeout'), false, `setTimeout detectado en ${rel}`);
    assert.strictEqual(content.includes('setInterval'), false, `setInterval detectado en ${rel}`);
  }
});

// --- TIER 3: DOM, BOTONERA 12 MODOS Y MODO SPLIT DE 2 SALIDAS ---
console.log('\n--- TIER 3: DOM STRUCTURE, 12 MODES TAB BAR & SPLIT VIEW ---');

const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

test('3.1 Botonera .canvas-tab-bar contiene exactamente los 12 modos en orden', () => {
  const tabRegex = /<button[^>]*class="canvas-tab[^"]*"[^>]*data-possibility="([^"]+)"[^>]*>/g;
  const modesFound = [];
  let m;
  while ((m = tabRegex.exec(indexHtml)) !== null) {
    if (modesFound.length < 12) {
      modesFound.push(m[1]);
    }
  }
  assert.strictEqual(modesFound.length, 12, `Se esperaban 12 pestañas, encontradas ${modesFound.length}`);
  assert.deepStrictEqual(modesFound, CANONICAL_MODES, 'El orden de las pestañas en el HTML no es canónico');
  
  // Validar presencia explícita de modos 11 y 12
  assert.ok(modesFound.includes('multimodal-vision'), 'Falta pestaña Modo 11 multimodal-vision');
  assert.ok(modesFound.includes('gem-studio'), 'Falta pestaña Modo 12 gem-studio');
});

test('3.2 Modo Split de 2 salidas en index.html con rotulado y badges distintivos', () => {
  assert.ok(indexHtml.includes('canvas-split-container'), 'Falta contenedor .canvas-split-container');
  
  // Salida 1: Lienzo Principal
  const hasSalida1Label = indexHtml.includes('Salida 1: Lienzo Principal') || indexHtml.includes('Salida 1:');
  const hasSalida1Pane = indexHtml.includes('canvas-editor-pane') || indexHtml.includes('canvas-output-primary');
  assert.ok(hasSalida1Label, 'Falta rotulado de Salida 1: Lienzo Principal');
  assert.ok(hasSalida1Pane, 'Falta panel para Salida 1');

  // Salida 2: Interacción y Refinamiento
  const hasSalida2Label = indexHtml.includes('Salida 2: Interacción y Refinamiento') || indexHtml.includes('Salida 2:');
  const hasSalida2Pane = indexHtml.includes('canvas-chat-pane') || indexHtml.includes('canvas-output-refinement');
  assert.ok(hasSalida2Label, 'Falta rotulado de Salida 2: Interacción y Refinamiento');
  assert.ok(hasSalida2Pane, 'Falta panel para Salida 2');

  // Badges y controles complementarios
  assert.ok(indexHtml.includes('canvas-badge-output-primary') || indexHtml.includes('Salida 1'), 'Falta badge de Salida 1');
  assert.ok(indexHtml.includes('canvas-badge-output-refinement') || indexHtml.includes('Salida 2'), 'Falta badge de Salida 2');
});

test('3.3 Preservación de módulos inferiores de index.html', () => {
  assert.ok(indexHtml.includes('id="multimodal-simulator-module"'), 'Falta #multimodal-simulator-module');
  assert.ok(indexHtml.includes('id="gem-studio-module"'), 'Falta #gem-studio-module');

  // Orden estricto no invertido
  const posCanvasSim = indexHtml.indexOf('id="canvas-simulator-module"');
  const posCanvasEx = indexHtml.indexOf('id="canvas-exercises-module"');
  const posMmSim = indexHtml.indexOf('id="multimodal-simulator-module"');
  const posGemStudio = indexHtml.indexOf('id="gem-studio-module"');

  assert.ok(posCanvasSim > 0, '#canvas-simulator-module no encontrado');
  assert.ok(posCanvasEx > posCanvasSim, '#canvas-exercises-module debe estar después de #canvas-simulator-module');
  assert.ok(posMmSim > posCanvasEx, '#multimodal-simulator-module debe estar después de #canvas-exercises-module');
  assert.ok(posGemStudio > posMmSim, '#gem-studio-module debe estar después de #multimodal-simulator-module');
});

// --- TIER 4: MIRROR REPLICATION INTEGRITY ---
console.log('\n--- TIER 4: EXACT MIRROR REPLICATION INTEGRITY (SHA-256) ---');

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

test('4.1 Paridad exacta index.html <-> src/index.html', () => {
  const rootHash = sha256File(path.join(ROOT_DIR, 'index.html'));
  const srcHash = sha256File(path.join(ROOT_DIR, 'src', 'index.html'));
  assert.strictEqual(rootHash, srcHash, 'index.html y src/index.html difieren');
});

test('4.2 Paridad exacta css/styles.css <-> src/css/styles.css', () => {
  const rootHash = sha256File(path.join(ROOT_DIR, 'css', 'styles.css'));
  const srcHash = sha256File(path.join(ROOT_DIR, 'src', 'css', 'styles.css'));
  assert.strictEqual(rootHash, srcHash, 'css/styles.css y src/css/styles.css difieren');
});

test('4.3 Paridad exacta canvas-possibilities.js en sus 3 ubicaciones', () => {
  const h1 = sha256File(path.join(ROOT_DIR, 'js', 'canvas-possibilities.js'));
  const h2 = sha256File(path.join(ROOT_DIR, 'src', 'shared', 'canvas-possibilities.js'));
  const h3 = sha256File(path.join(ROOT_DIR, 'src', 'js', 'canvas-possibilities.js'));
  assert.strictEqual(h1, h2, 'js/ y src/shared/ canvas-possibilities difieren');
  assert.strictEqual(h1, h3, 'js/ y src/js/ canvas-possibilities difieren');
});

test('4.4 Paridad exacta canvas-exercises.js en sus 3 ubicaciones', () => {
  const h1 = sha256File(path.join(ROOT_DIR, 'js', 'canvas-exercises.js'));
  const h2 = sha256File(path.join(ROOT_DIR, 'src', 'shared', 'canvas-exercises.js'));
  const h3 = sha256File(path.join(ROOT_DIR, 'src', 'js', 'canvas-exercises.js'));
  assert.strictEqual(h1, h2, 'js/ y src/shared/ canvas-exercises difieren');
  assert.strictEqual(h1, h3, 'js/ y src/js/ canvas-exercises difieren');
});

test('4.5 Activo gráfico canvas_gem_studio.jpg existe y coincide en root y src/', () => {
  const p1 = path.join(ROOT_DIR, 'assets', 'images', 'canvas', 'canvas_gem_studio.jpg');
  const p2 = path.join(ROOT_DIR, 'src', 'assets', 'images', 'canvas', 'canvas_gem_studio.jpg');
  assert.ok(fs.existsSync(p1), 'assets/images/canvas/canvas_gem_studio.jpg no existe');
  assert.ok(fs.existsSync(p2), 'src/assets/images/canvas/canvas_gem_studio.jpg no existe');
  assert.strictEqual(sha256File(p1), sha256File(p2), 'Los archivos de imagen de gem studio difieren');
  const stat = fs.statSync(p1);
  assert.ok(stat.size > 50000, `Tamaño menor a 50KB: ${stat.size} bytes`);
});

// --- TIER 5: DATASET JSON SYNCHRONIZATION ---
console.log('\n--- TIER 5: DATASET JSON SYNCHRONIZATION ---');

test('5.1 banco_prompts_canvas.json sincronizado con 12 posibilidades y 24 ejercicios', () => {
  const jsonPath = path.join(ROOT_DIR, 'materiales', 'gemini_canvas', 'banco_prompts_canvas.json');
  assert.ok(fs.existsSync(jsonPath), 'No existe banco_prompts_canvas.json');
  const dataset = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  assert.strictEqual(dataset.totalPossibilities, 12, 'totalPossibilities debe ser 12');
  assert.strictEqual(dataset.totalExercises, 24, 'totalExercises debe ser 24');
  assert.strictEqual(dataset.possibilities.length, 12, 'possibilities array debe tener 12 elementos');

  // Comprobar que todos los IDs de posibilidades coinciden
  const possIds = dataset.possibilities.map(p => p.id);
  assert.deepStrictEqual(possIds, CANONICAL_MODES, 'IDs de posibilidades en JSON no coinciden con los canónicos');

  // Comprobar que cada posibilidad contiene exactamente 2 ejercicios y el total suma 24
  let countEx = 0;
  for (const p of dataset.possibilities) {
    assert.ok(Array.isArray(p.exercises), `${p.id}: falta exercises array`);
    assert.strictEqual(p.exercises.length, 2, `${p.id}: debe tener 2 ejercicios`);
    countEx += p.exercises.length;
  }
  assert.strictEqual(countEx, 24, 'El total de ejercicios en banco_prompts_canvas.json debe ser 24');
});

// --- TIER 6: ADVERSARIAL STRESS & CORNER CASES ---
console.log('\n--- TIER 6: ADVERSARIAL STRESS & CORNER CASES ---');

test('6.1 Inyección de caracteres especiales y tags HTML en helpers', () => {
  const { escapeCanvasHtml, formatCanvasStep } = require(path.join(ROOT_DIR, 'js', 'canvas-exercises.js'));
  const dangerous = '<script>alert("xss")</script>&"\'';
  const escaped = escapeCanvasHtml(dangerous);
  assert.ok(!escaped.includes('<script>'), 'XSS no neutralizado');
  assert.ok(escaped.includes('&lt;script&gt;'), 'Falta escape de <');
  assert.ok(escaped.includes('&quot;'), 'Falta escape de "');
  assert.ok(escaped.includes('&#39;'), 'Falta escape de comilla simple');

  const formatted = formatCanvasStep('Seleccione el texto y escriba: «aprobado sin reservas»');
  assert.ok(formatted.includes('<span class="canvas-exercise-followup">«aprobado sin reservas»</span>'), 'Followup span no generado');
});

test('6.2 Robustez y límites en funciones matemáticas de canvas-possibilities', () => {
  const {
    canvasRound,
    canvasFormatNumber,
    canvasSum,
    canvasAverage,
    canvasWeightedScore,
    canvasMatrixStatus,
    canvasContrastRatio,
    canvasWcagLevel,
    canvasRiskLevel,
    canvasReportDecision
  } = require(path.join(ROOT_DIR, 'js', 'canvas-possibilities.js'));

  // Round edge cases
  assert.strictEqual(canvasRound(1.005, 2), 1.01);
  assert.strictEqual(canvasRound(-1.005, 2), -1.01);

  // Format number (es-CO)
  assert.strictEqual(canvasFormatNumber(1234567.89, 2), '1.234.567,89');
  assert.strictEqual(canvasFormatNumber(0, 0), '0');

  // Sum & Average
  assert.strictEqual(canvasSum([10, 20, 30]), 60);
  assert.strictEqual(canvasSum([]), 0);
  assert.strictEqual(canvasAverage([10, 20, 30]), 20);
  assert.throws(() => canvasAverage([]), /No se puede promediar una lista vacía/);

  // Weighted score (100% total weight)
  const scores = [90, 80];
  const weights = [40, 60];
  assert.strictEqual(canvasWeightedScore(scores, weights), 84);
  assert.throws(() => canvasWeightedScore([90], [40, 60]), /misma cantidad/);
  assert.throws(() => canvasWeightedScore([90, 80], [30, 60]), /sumar 100/);

  // Matrix status boundaries
  assert.strictEqual(canvasMatrixStatus(85), 'Recomendado');
  assert.strictEqual(canvasMatrixStatus(84.99), 'Admisible con observaciones');
  assert.strictEqual(canvasMatrixStatus(70), 'Admisible con observaciones');
  assert.strictEqual(canvasMatrixStatus(69.99), 'No cumple');

  // Contrast ratio
  assert.strictEqual(canvasRound(canvasContrastRatio('#000000', '#ffffff'), 1), 21);
  assert.strictEqual(canvasRound(canvasContrastRatio('#ffffff', '#ffffff'), 1), 1);
  assert.strictEqual(canvasWcagLevel(7.5), 'AAA');
  assert.strictEqual(canvasWcagLevel(4.6), 'AA');
  assert.strictEqual(canvasWcagLevel(3.2), 'AA texto grande');
  assert.strictEqual(canvasWcagLevel(2.5), 'No cumple');

  // Risk & Decision
  assert.deepStrictEqual(canvasRiskLevel('Alto', 'Media'), { score: 6, color: 'ROJO' });
  assert.deepStrictEqual(canvasRiskLevel('Medio', 'Baja'), { score: 2, color: 'VERDE' });
  assert.throws(() => canvasRiskLevel('Crítico', 'Media'), /nivel desconocido/);

  assert.match(canvasReportDecision([{ risk: { color: 'ROJO' } }]), /^El pago final del 20 % queda retenido/);
  assert.match(canvasReportDecision([{ risk: { color: 'VERDE' } }]), /^Se aprueba el pago final con observaciones/);
});

console.log('\n================================================================================');
console.log(`TOTAL TESTS: ${results.passed + results.failed} | PASSED: ${results.passed} | FAILED: ${results.failed}`);
console.log('================================================================================');

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
