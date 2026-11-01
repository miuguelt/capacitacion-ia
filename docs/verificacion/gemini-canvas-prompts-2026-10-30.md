# Verificación de los prompts del simulador en Gemini Canvas

- **Fecha:** 30 de octubre de 2026.
- **Dónde:** gemini.google.com, con la herramienta Canvas activa, desde el navegador integrado de Claude Code.
- **Modelos:** Gemini 3.8 Flash para los modos 1, 2 y el segundo intento del modo 5. Los demás se ejecutaron con Gemini 4 Argon, que la interfaz selecciona por defecto en cada chat nuevo.
- **Fuente de los prompts:** `js/canvas-possibilities.js`. Cada prompt se pegó completo, tal como lo copia el aprendiz.
- **Método:** en cada modo se revisó la lista «Verifica el resultado de tu Canvas» del simulador contra lo que produjo Gemini.
  - Documentos: se leyó el texto del Canvas.
  - Código: se extrajo el código del editor del Canvas para revisarlo.
  - Python: el código de Gemini se ejecutó localmente con `python` y `pytest`.
  - SQL: la consulta de Gemini se ejecutó sobre los datos de muestra en SQLite, adaptando la sintaxis exclusiva de PostgreSQL.
  - Mermaid: el código se dibujó en mermaid.live.

## Resumen

| Modo | Resultado | Ajuste aplicado al prompt o a la lista |
|---|---|---|
| 1. Documento (términos de referencia) | 7/7 | Ninguno |
| 2. Código (tablero) | 6/6 | Ninguno |
| 3. Matriz ponderada | 6/6 (exportación a Sheets no probada) | Ninguno |
| 4. Diagrama Mermaid | 5/6 en el primer intento | El dibujo se comprueba en mermaid.live, porque Canvas mostró el código como texto |
| 5. UI/UX (tokens y contraste) | Rechazado dos veces; luego 5/6; después del ajuste, 6/6 | Tarea 4 y foco `:focus-visible` (ver detalle) |
| 6. Edición por selección | 6/6 (paso 2 enviado por chat) | Ninguno |
| 7. Python O(n) | 5/5 | La forma de comprobar acepta función y pruebas en un solo archivo |
| 8. Rúbrica | 6/6 | Redacción del caso para calibrar |
| 9. SQL | 5/5 | Ninguno |
| 10. Dictamen | Matriz correcta, pero síntesis contradictoria y «%» perdido; después del ajuste, correcto | Dos restricciones y un criterio nuevos (ver detalle) |

## Detalle por modo

### 1. Términos de referencia

Las cuatro secciones son correctas. La tabla tiene las 5 filas con los mismos valores de los datos. El presupuesto es «COP 196.000.000», el cronograma tiene 3 filas y la garantía dice 36 meses en sitio y 24 horas hábiles. No aparece ninguna marca, y el resumen tiene 110 palabras.

### 2. Tablero de seguimiento

- **KPI:** 82.5 % y 83.7 %.
- **Estados:** 3 Al día, 1 En progreso y 2 Requiere apoyo.
- **Código:** sin `src`, `import` ni CDN, y con la gráfica en SVG.
- **Filtros:** se verificaron por lectura del código. El filtro por estado compara exactamente «Requiere apoyo» y deja 2 filas. La búsqueda usa `toLowerCase().includes()`, así que «ana» deja 1 fila.
- **Límite de la prueba:** no se pudo escribir dentro de la vista previa, porque corre en un iframe aislado.

### 3. Matriz ponderada

Pesos al 100 %; aporte de A en C1 = 23,75; totales 88,0 · 82,0 · 59,5; estados verde, ámbar y rojo, y diferencia de 6,0 puntos. Gemini entregó las fórmulas `=SUMA.PRODUCTO(...)` para la hoja, pero no se probó la exportación real a Google Sheets.

### 4. Diagrama Mermaid

`flowchart TD`, 3 subgrafos con los nombres exactos, 9 nodos, rombo D1 con «Sí» y «No» y 9 flechas. Canvas abrió el resultado como documento de texto, sin dibujarlo. En mermaid.live, tanto el código de Gemini como el de referencia se dibujan sin errores: 9 nodos y 3 carriles.

**Ajuste:**
- La restricción y el primer criterio piden comprobar el dibujo en mermaid.live.
- Se actualizó el aviso de «Descargar SVG».

### 5. Tokens, contraste y maqueta

- **Primer intento:** dos rechazos genéricos («Soy un modelo de lenguaje…»), uno en Argon y otro en Flash. La causa fue la tarea 4, que pedía «un prompt para un generador de imágenes» dentro de Canvas.
- **Ajuste 1:** la tarea 4 ahora pide un bloque de texto en inglés que describa la maqueta. Con ese cambio, Gemini generó el Canvas:
  - Contraste calculado con la fórmula sRGB (umbral 0,04045, `toFixed(2)`); para estos colores da los mismos valores que la lista.
  - Niveles con «AA texto grande».
  - Contenido completo de la maqueta y los tres HEX en el bloque en inglés.
- **Fallo pendiente en ese intento:** el foco era un contorno fijo «simulado».
- **Ajuste 2:** la tarea 3 exige `:focus-visible` real, y el criterio pide buscarlo en el código.
- **Repetición:** el CSS trae `.btn-primary:focus-visible`. Resultado: 6/6.

### 6. Edición por selección

- **Paso 1:** el acta quedó literal, con 4 puntos en una lista numerada.
- **Paso 2:** en este ancho de ventana Gemini no mostró el cuadro flotante de selección, así que la misma instrucción se envió por el chat, limitada al punto 3.
- **Resultado:** solo cambió el punto 3, ahora con 2 viñetas. Se conservan «dos días hábiles» y «médico u otra autoridad», no hay requisitos nuevos ni aparece «perderán», y los puntos 1, 2 y 4 quedaron iguales.
- **Pendiente:** la mecánica de selección dentro de Canvas debe probarse en una ventana de escritorio ancha.

### 7. Python de O(n²) a O(n)

La explicación señala `if e["documento"] in vistos`. La versión nueva usa un `set` y conserva el nombre, los type hints y el docstring con O(n). Al ejecutarlo localmente:

```text
{'al_dia': ['Ana', 'Iván'], 'en_progreso': ['Luis', 'Marta'], 'apoyo': ['Jorge', 'Sara']}
3 passed
```

Gemini puso la función y las pruebas en un solo archivo; la forma de comprobar ahora lo contempla.

### 8. Rúbrica

Hay 12 descriptores observables: carpetas, `assert` o `expect`, `application/problem+json` y claves de RFC 9457. Los pesos suman 100 %. La operación da 1,440 + 1,225 + 1,400 = 4,065 ≈ 4,1 (Bueno), y hay tres preguntas abiertas, una por criterio.

**Ajuste de redacción:** «4,8 en C1; 3,5 en C2; 4,0 en C3». La versión anterior unía las notas solo con comas y era ambigua por la coma decimal.

### 9. SQL

Hay dos CTE, `ROW_NUMBER() OVER (PARTITION BY a.ficha_id …)`, `LEFT JOIN`, `NULLIF`, el índice `INCLUDE (asistio)` y ninguna subconsulta correlacionada. La tabla esperada de Gemini coincide con el simulador, y su consulta, ejecutada sobre la muestra, devuelve las mismas 5 filas:

```text
(2871, 1, 'Marta', 4.6, 100.0)
(2871, 2, 'Ana', 4.3, 100.0)
(2871, 3, 'Luis', 4.0, 75.0)
(2872, 1, 'Sara', 4.9, None)
(2872, 2, 'Jorge', 3.2, 50.0)
```

### 10. Dictamen técnico

- **Primer intento:**
  - Correcto: la matriz (6 ROJO, 4 ÁMBAR, 2 VERDE), las fuentes citadas, la retención del 20 % y los 10 días hábiles.
  - Error 1: la síntesis dijo «dos en nivel ÁMBAR (4 y 2)», lo que contradice su propia matriz.
  - Error 2: Gemini convirtió los porcentajes en notación matemática y se perdió el signo; el Canvas mostraba «94» y «80 desembolsado».
- **Ajuste:**
  - Una restricción pide calcular la matriz antes de la síntesis y hacer coincidir los colores.
  - Otra pide escribir los porcentajes como texto normal.
  - Se añadieron dos criterios: el signo «%» visible en el encabezado y la coincidencia de colores entre la síntesis y la matriz.
- **Repetición:**
  - «94 %», «80 %» y «20 %» aparecen visibles.
  - La síntesis dice 1 ROJO, 1 ÁMBAR y 1 VERDE, igual que la matriz.
  - El texto completo, con la tabla, suma unas 535 palabras. Conviene confirmar en Google Docs que cabe en una página.

## Lo que queda por comprobar a mano

- Escribir en el buscador y en el filtro dentro de la vista previa del modo 2.
- Exportar la matriz a Google Sheets (modo 3) y la guía o el dictamen a Google Docs (modos 8 y 10).
- Probar la edición por selección del modo 6 con el cuadro flotante, en una ventana ancha.
- Repetir los modos con Flash y con Argon: Gemini varía el diseño entre ejecuciones, aunque las cifras se mantuvieron.
