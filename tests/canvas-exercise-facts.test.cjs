// Hechos de los ejercicios de Gemini Canvas Lab: recalcula desde los datos del prompt cada cifra
// que el criterio de verificación promete, para que una cifra mal escrita falle en CI.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { CANVAS_EXERCISES } = require(path.join(__dirname, "..", "js", "canvas-exercises.js"));

const all = () => Object.values(CANVAS_EXERCISES).flat();
const byId = id => {
  const ex = all().find(e => e.id === id);
  assert.ok(ex, `no existe el ejercicio ${id}`);
  return ex;
};
const expectedText = ex => ex.expected.join("\n");
const fullText = ex => JSON.stringify([ex.title, ex.goal, ex.scenario, ex.promptParts, ex.steps, ex.expected, ex.stretch, ex.outsideCanvas]);

// Formato colombiano: punto de miles y coma decimal.
const co = (n, decimals = 0) => n.toLocaleString("es-CO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function csvRows(text, header) {
  const lines = text.split("\n").map(l => l.trim());
  const start = lines.findIndex(l => l.startsWith(header));
  assert.ok(start >= 0, `no se encontró la cabecera ${header}`);
  const rows = [];
  for (let i = start + 1; i < lines.length && lines[i]; i++) rows.push(lines[i].split(","));
  return rows;
}

test("3A: totales anuales, participación y meses extremos coinciden con la tabla", () => {
  const ex = byId("data-a-ventas-tienda");
  const rows = csvRows(ex.promptParts.data, "Mes,Cafe").map(r => ({ mes: r[0], cafe: +r[1], panela: +r[2], queso: +r[3] }));
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  const total = sum("cafe") + sum("panela") + sum("queso");
  const exp = expectedText(ex);
  assert.ok(exp.includes(`${co(total)} (café ${co(sum("cafe"))}, panela ${co(sum("panela"))}, queso ${co(sum("queso"))})`));
  assert.ok(exp.includes(`${Math.round((sum("cafe") / total) * 100)} %`));
  const monthly = rows.map(r => ({ mes: r.mes, t: r.cafe + r.panela + r.queso }));
  assert.equal(monthly.reduce((a, b) => (b.t > a.t ? b : a)).mes, "Dic");
  assert.equal(monthly.reduce((a, b) => (b.t < a.t ? b : a)).mes, "Feb");
});

test("1B: el criterio de costo y punto de equilibrio trae las cifras y la conclusión", () => {
  const ex = byId("doc-b-propuesta-huerta");
  const data = ex.promptParts.data;
  const total = Number(/TOTAL,([\d.]+)/.exec(data)[1].replace(/\./g, ""));
  const kg = Number(/(\d+) kg de lechuga/.exec(data)[1]) + Number(/(\d+) kg de cilantro/.exec(data)[1]);
  const exp = expectedText(ex);
  assert.ok(exp.includes(co(Math.round(total / kg))), "falta el costo por kg del primer ciclo");
  assert.ok(exp.includes(co(Math.round(total / 9000))), "falta el punto de equilibrio en kg");
  assert.match(exp, /no se recupera/i, "debe concluir que la inversión no se recupera en 16 semanas");
});

test("7B: las comparaciones de burbuja y merge sort son las reales", () => {
  const ex = byId("algo-b-visualizador-ordenamiento");
  const arr = JSON.parse(/ARREGLO DE PRUEBA[^\n]*\n(\[[^\]]+\])/.exec(ex.promptParts.data)[1]);
  let comps = 0;
  const merge = (a) => {
    if (a.length < 2) return a;
    const m = a.length >> 1, l = merge(a.slice(0, m)), r = merge(a.slice(m));
    const out = []; let i = 0, j = 0;
    while (i < l.length && j < r.length) { comps++; out.push(l[i] <= r[j] ? l[i++] : r[j++]); }
    return out.concat(l.slice(i), r.slice(j));
  };
  merge(arr);
  const exp = expectedText(ex);
  assert.ok(exp.includes(`${(arr.length * (arr.length - 1)) / 2} comparaciones`), "burbuja sin parada temprana");
  assert.ok(new RegExp(`\\b${comps}\\b`).test(exp), `merge sort hace ${comps} comparaciones y el criterio debe decirlo`);
});

test("8A: nota del aprendiz 1 con la rúbrica y con Pruebas en 4", () => {
  const ex = byId("rubric-a-calculadora-radar");
  const d = ex.promptParts.data;
  const pesos = [...d.matchAll(/^\d\. [^:]+: (\d+) %/gm)].map(m => Number(m[1]) / 100);
  const puntajes = [.../Diseño (\d), Validación (\d), Documentación (\d), Pruebas (\d)/.exec(d)].slice(1).map(Number);
  const nota = p => p.reduce((a, v, i) => a + v * pesos[i], 0);
  const exp = expectedText(ex);
  assert.ok(exp.includes(co(nota(puntajes), 2)), "nota base");
  assert.ok(exp.includes(co(nota([puntajes[0], puntajes[1], puntajes[2], 4]), 2)), "nota con Pruebas en 4");
});

test("10B: ranking base y con sensibilidad", () => {
  const ex = byId("report-b-dictamen-nube");
  const rows = csvRows(ex.promptParts.data, "Criterio,Peso").map(r => ({ w: parseInt(r[1], 10) / 100, v: [+r[2], +r[3], +r[4]] }));
  const score = (w) => [0, 1, 2].map(p => rows.reduce((a, r, i) => a + r.v[p] * w[i], 0));
  const fmt = (s) => ["A", "B", "C"].map((n, i) => ({ n, s: s[i] })).sort((a, b) => b.s - a.s).map(x => `${x.n} ${co(x.s, 2)}`);
  const base = fmt(score(rows.map(r => r.w)));
  const sens = fmt(score([0.20, 0.15, 0.35, 0.15, 0.15]));
  const exp = expectedText(ex);
  assert.ok(exp.includes(`${base[0]}, ${base[1]} y ${base[2]}`), `base: ${base.join(", ")}`);
  assert.ok(exp.includes(`${sens[0]}, ${sens[1]} y ${sens[2]}`), `sensibilidad: ${sens.join(", ")}`);
});

test("9A: el SQL se ejecuta de verdad en la vista previa y las cifras salen de los datos", () => {
  const ex = byId("sql-a-biblioteca-dashboard");
  const d = ex.promptParts.data;
  const loans = [...d.matchAll(/\((\d+),(\d+),(\d+),'([\d-]+)','([\d-]+)',(NULL|'[\d-]+')\)/g)]
    .map(m => ({ id: +m[1], libro: +m[2], user: +m[3], pre: m[4], lim: m[5], dev: m[6] === "NULL" ? null : m[6].replace(/'/g, "") }));
  assert.equal(loans.length, 12);
  const dias = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
  const venc = loans.filter(l => !l.dev && l.lim < "2026-10-30").map(l => dias(l.lim, "2026-10-30")).sort((a, b) => b - a);
  const exp = expectedText(ex);
  assert.ok(exp.includes(`${venc.slice(0, -1).join(", ")} y ${venc[venc.length - 1]} días`), `vencidos ${venc}`);
  const dev = loans.filter(l => l.dev);
  const prom = dev.reduce((a, l) => a + dias(l.pre, l.dev), 0) / dev.length;
  assert.ok(exp.includes(co(prom, 1)), `promedio ${prom}`);
  const tarde = dev.filter(l => l.dev > l.lim);
  assert.equal(tarde.length, 1);
  assert.ok(exp.includes(`${dias(tarde[0].lim, tarde[0].dev)} días`));
  const text = fullText(ex);
  assert.match(text, /Pyodide/, "debe ejecutar el SQL con Pyodide y sqlite3");
  assert.match(text, /sqlite3/);
  assert.doesNotMatch(text, /prueba en JavaScript/i, "las pruebas deben ejecutar el SQL, no repetir el cálculo en JavaScript");
});

test("9B: el pipeline de limpieza deja 10 filas limpias, 4 rechazos y 70 % de asistencia", () => {
  const ex = byId("sql-b-limpieza-asistencia");
  const rows = csvRows(ex.promptParts.data, "documento,nombre").map(r => r.map(c => c.trim()));
  const fecha = (s) => {
    let m;
    if ((m = /^(\d{4})[-/](\d{2})[-/](\d{2})$/.exec(s))) return valid(+m[1], +m[2], +m[3]);
    if ((m = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(s))) return valid(+m[3], +m[2], +m[1]);
    return null;
  };
  const valid = (y, mo, d) => (mo >= 1 && mo <= 12 && d >= 1 && d <= new Date(y, mo, 0).getDate() ? `${y}-${mo}-${d}` : null);
  const estado = (e) => (/^(p|presente)$/i.test(e) ? "Presente" : /^(a|ausente)$/i.test(e) ? "Ausente" : /^tarde$/i.test(e) ? "Tarde" : "Sin registro");
  const seen = new Set(); const limpias = []; const rech = { duplicado: 0, sinDoc: 0, fecha: 0 };
  for (const [doc, , f, e] of rows) {
    if (!doc) { rech.sinDoc++; continue; }
    const nf = fecha(f);
    if (!nf) { rech.fecha++; continue; }
    const k = `${doc}|${nf}`;
    if (seen.has(k)) { rech.duplicado++; continue; }
    seen.add(k); limpias.push(estado(e));
  }
  const cuenta = (s) => limpias.filter(x => x === s).length;
  const exp = expectedText(ex);
  assert.equal(rows.length, 14);
  assert.ok(exp.includes(`De ${rows.length} filas crudas quedan ${limpias.length} limpias y ${rows.length - limpias.length} rechazadas`));
  assert.ok(exp.includes(`${rech.duplicado} duplicados, ${rech.sinDoc} sin documento y ${rech.fecha} fecha imposible`));
  assert.ok(exp.includes(`${cuenta("Presente")} Presente, ${cuenta("Ausente")} Ausente, ${cuenta("Tarde")} Tarde y ${cuenta("Sin registro")} Sin registro`));
  assert.ok(exp.includes(`${Math.round(((cuenta("Presente") + cuenta("Tarde")) / limpias.length) * 100)} %`));
  assert.match(fullText(ex), /Pyodide/, "el SQL debe ejecutarse de verdad con Pyodide y sqlite3");
});

test("6B: el redondeo a un decimal es parte de la solución, no del reto extra", () => {
  const ex = byId("inline-b-depurar-funcion");
  assert.match(ex.steps.join("\n"), /toFixed/);
  assert.match(expectedText(ex), /toFixed|un decimal/);
});

test("fechas: tienen el día de la semana correcto y son posteriores a la fecha de revisión", () => {
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const re = /\b(lunes|martes|miércoles|jueves|viernes|sábado|domingo) (\d{1,2}) de (\w+)(?: de (\d{4}))?/g;
  let vistas = 0;
  for (const ex of all()) {
    for (const m of fullText(ex).matchAll(re)) {
      const mes = meses.indexOf(m[3]);
      if (mes < 0) continue;
      const anio = m[4] ? +m[4] : 2026;
      assert.equal(dias[new Date(Date.UTC(anio, mes, +m[2])).getUTCDay()], m[1], `${ex.id}: «${m[0]}» no cae en ${m[1]}`);
      vistas++;
    }
  }
  assert.ok(vistas >= 3, "debe haber fechas con día de la semana que verificar");
  const correo = byId("inline-a-correo-acudientes");
  assert.doesNotMatch(fullText(correo), /6 de noviembre|5 de noviembre/, "la fecha de la reunión ya pasó");
  const jwt = byId("flow-b-secuencia-jwt-gantt");
  const fechasIso = [...jwt.promptParts.data.matchAll(/(\d{4}-\d{2}-\d{2})/g)].map(m => m[1]);
  assert.ok(fechasIso.length >= 6 && fechasIso.every(f => f >= "2026-11-16"), "el cronograma debe iniciar después de la fecha de revisión");
});

test("consistencia: sin descargas de archivos, sin Chart.js y con plan B cuando se usa un CDN", () => {
  for (const ex of all()) {
    const text = fullText(ex);
    assert.doesNotMatch(text, /CSV descargado|descargable|bot[oó]n para descargar|descargar (la distribuci|el diagrama)/i, `${ex.id}: Canvas puede bloquear descargas; usa «Copiar» con un cuadro de texto`);
    assert.doesNotMatch(text, /Chart\.js/, `${ex.id}: dibuja los gráficos con SVG, sin CDN`);
    assert.doesNotMatch(text, /chat del lienzo/i, `${ex.id}: el chat queda a la izquierda; no existe un «chat del lienzo»`);
    if (/cdn\.jsdelivr\.net|desde CDN/i.test(text)) {
      assert.match(text, /no carga|no se carga|si falla la carga/i, `${ex.id}: debe traer un plan B si la librería no carga`);
    }
  }
  assert.doesNotMatch(fullText(byId("rubric-b-guia-quiz-git")), /Tarjetas de estudio/);
});

test("11A y 11B: el prompt y los criterios reflejan lo que muestran las imágenes", () => {
  const a = fullText(byId("mm-a-boceto-formulario"));
  for (const frag of ["Débil", "Media", "Segura", "mínimo 3 caracteres", "8 caracteres"]) assert.ok(a.includes(frag), `11A debe mencionar «${frag}»`);
  assert.doesNotMatch(JSON.stringify(byId("mm-a-boceto-formulario").promptParts.task), /ámbar en caso contrario/);
  const b = fullText(byId("mm-b-pizarra-flujograma"));
  for (const frag of ["Coordinación Misional", "Firma de Acta de Compromiso", "¿Requiere plan de mejoramiento?", "Portafolio de Evidencias"]) assert.ok(b.includes(frag), `11B debe mencionar «${frag}»`);
});

// --- Parte C ---------------------------------------------------------------------------------

test("2C: el juego «Meta de ahorro» da los ahorros finales que prometen los criterios", () => {
  const ex = byId("code-c-juego-ahorro");
  const d = ex.promptParts.data;
  const num = (re) => Number(re.exec(d)[1].replace(/\./g, ""));
  const sueldo = num(/Sueldo semanal: ([\d.]+) COP/);
  const imprevisto = num(/imprevisto de ([\d.]+) COP/);
  const meta = num(/al menos ([\d.]+) COP/);
  const semanas = Number(/Duración: (\d+) semanas/.exec(d)[1]);
  const juego = (pct, imp) => {
    let total = 0;
    for (let w = 1; w <= semanas; w++) {
      let ahorro = sueldo * pct;
      if (w === 3) ahorro -= Math.max(0, imp - (sueldo - ahorro));
      total += ahorro;
    }
    return total;
  };
  const exp = expectedText(ex);
  assert.equal(juego(0.5, imprevisto), 600000);
  assert.ok(juego(0.5, imprevisto) >= meta && juego(0.25, imprevisto) < meta);
  assert.ok(exp.includes(`${co(juego(0.5, imprevisto))} COP`) && exp.includes(`${co(juego(0.25, imprevisto))} COP`) && exp.includes(`${co(juego(0.75, imprevisto))} COP`));
  assert.ok(exp.includes(`${co(juego(0.75, 120000))} COP`), "el imprevisto de 120.000 cambia el resultado con 75 %");
  assert.ok(exp.includes(`${co(sueldo * 0.75 - Math.max(0, imprevisto - sueldo * 0.25))} COP`), "ahorro de la semana 3 con 75 %");
  assert.equal(ex.capabilities.includes("copy-canvas"), true);
});

test("7C: las cifras del análisis de notas salen de los datos y el ejercicio declara Colab como obligatorio", () => {
  const ex = byId("algo-c-notas-colab");
  const notas = csvRows(ex.promptParts.data, "aprendiz,nota").map(r => Number(r[1]));
  assert.equal(notas.length, 12);
  const prom = notas.reduce((a, b) => a + b, 0) / notas.length;
  const orden = [...notas].sort((a, b) => a - b);
  const mediana = (orden[5] + orden[6]) / 2;
  const desv = Math.sqrt(notas.reduce((a, n) => a + (n - prom) ** 2, 0) / notas.length);
  const aprobados = notas.filter(n => n >= 3.5).length;
  const exp = expectedText(ex);
  assert.ok(exp.includes(`promedio es ${co(prom, 2)}`) && exp.includes(`mediana es ${co(mediana, 2)}`));
  assert.ok(exp.includes(co(desv, 2)), `desviación ${desv}`);
  assert.ok(exp.includes(`${aprobados} de ${notas.length} aprendices: ${co((aprobados / notas.length) * 100, 2)} %`));
  const riesgo = notas.filter(n => n < 3).sort((a, b) => b - a);
  assert.ok(exp.includes(`${riesgo[0].toFixed(1)} y ${riesgo[1].toFixed(1)}`) || exp.includes(`${riesgo[1].toFixed(1)} y ${riesgo[0].toFixed(1)}`));
  assert.equal(ex.externalRequired, true);
  assert.ok(ex.places.includes("external"));
});

test("8C: las notas de los aprendices 2 y 3 y la regla de plan de mejoramiento", () => {
  const ex = byId("rubric-c-formulas-latex");
  const d = ex.promptParts.data;
  const pesos = [...d.matchAll(/(Diseño|Validación|Documentación|Pruebas) (\d+) %/g)].map(m => Number(m[2]) / 100);
  assert.equal(pesos.reduce((a, b) => a + b, 0).toFixed(2), "1.00");
  const puntajes = n => [...new RegExp(`Aprendiz ${n}: Diseño (\\d), Validación (\\d), Documentación (\\d), Pruebas (\\d)`).exec(d)].slice(1).map(Number);
  const nota = n => puntajes(n).reduce((a, v, i) => a + v * pesos[i], 0);
  const exp = expectedText(ex);
  assert.ok(exp.includes(`aprendiz 2 es ${co(nota(2), 2)}`) && nota(2) >= 3.5 && Math.min(...puntajes(2)) >= 3);
  assert.ok(exp.includes(`aprendiz 3 es ${co(nota(3), 2)}`) && nota(3) < 3.5 && Math.min(...puntajes(3)) < 3);
  const [p1, p2, p3, p4] = pesos.map(p => co(p, 2));
  assert.ok(exp.includes(`${p1}, ${p2}, ${p3} y ${p4}`));
});

test("11C: el inventario de la imagen y los criterios dicen lo mismo", () => {
  const fs = require("node:fs");
  const ex = byId("mm-c-tabla-inventario");
  const script = fs.readFileSync(path.join(__dirname, "..", "scripts", "generate_canvas_material_inventario.py"), "utf8");
  const filas = [...script.matchAll(/\("([^"]+)", (\d+), (\d+)\)/g)].map(m => ({ nombre: m[1], cantidad: +m[2], minimo: +m[3] }));
  assert.equal(filas.length, 6);
  const bajo = filas.filter(f => f.cantidad < f.minimo);
  const faltan = bajo.reduce((a, f) => a + (f.minimo - f.cantidad), 0);
  const exp = expectedText(ex);
  assert.ok(exp.includes(`Hay ${bajo.length} insumos por comprar`));
  assert.ok(exp.includes(`total de unidades que faltan es ${faltan}`));
  for (const f of bajo) assert.ok(exp.includes(f.nombre.replace(" (rollos)", "")), `falta ${f.nombre}`);
  const rj45 = filas.find(f => f.nombre === "Conector RJ45");
  assert.ok(exp.includes(`baja a ${faltan - (rj45.minimo - rj45.cantidad)}`), "total después de contar 60 conectores");
  assert.ok(60 >= rj45.minimo);
});

test("6C: los errores de ortografía a propósito están en el texto y las fechas son futuras", () => {
  const ex = byId("inline-c-sugerencias-comunicado");
  const d = ex.promptParts.data;
  for (const mala of ["abrira", "dias", "estara", "haran", "normalizara", "sabado", "haiga"]) assert.match(d, new RegExp(`\\b${mala}\\b`), `falta el error «${mala}»`);
  assert.match(expectedText(ex), /lunes 23, sábado 28 y domingo 29 de noviembre de 2026/);
});
