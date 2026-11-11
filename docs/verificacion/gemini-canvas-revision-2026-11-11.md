# Revisión de los ejercicios de Gemini Canvas y cobertura de funciones (2026-11-11)

## Qué se revisó

Los 24 ejercicios originales (`js/canvas-exercises.js`), las imágenes de `materiales/gemini_canvas/`, el catálogo de capacidades y la ayuda oficial de Google ([Create docs, apps & more with Canvas](https://support.google.com/gemini/answer/16047321)). Las cifras de cada criterio se recalcularon desde los datos del prompt; ahora las comprueba `tests/canvas-exercise-facts.test.cjs`.

Cifras que ya eran correctas: 1A, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 8A, 9A, 9B, 10A y 10B.

## Correcciones a los ejercicios existentes

| Ejercicio | Problema | Cambio |
|---|---|---|
| 9A y 9B | El SQL nunca se ejecutaba; las pruebas repetían el cálculo en JavaScript. | La vista previa carga Pyodide y ejecuta el SQL con `sqlite3`. El SQL se pide válido en SQLite y PostgreSQL. La función de PostgreSQL de 9B solo se copia. |
| 1B | El criterio no daba cifras y el punto de equilibrio (≈ 889 kg) supera lo que produce el proyecto (440 kg). | El criterio trae 36.364 COP/kg y 889 kg, y exige concluir que la inversión no se recupera en 16 semanas. |
| 2A, 2B | Chart.js desde CDN y descarga de CSV. | Gráficos con SVG puro; el CSV y el JSON se muestran en un cuadro de texto para copiar. |
| 4A, 4B, 11B | Mermaid sin plan B; 11B pedía descargar el SVG. | Plan B si Mermaid no carga; el SVG se muestra para copiarlo. |
| 6A | Fechas ya vencidas (6 y 5 de noviembre). | Viernes 4 y jueves 3 de diciembre de 2026. |
| 4B | Cronograma de noviembre ya vencido. | Desde el lunes 16 de noviembre; hito el 11 de diciembre. |
| 6B | El promedio daba `4.1000000000000005` y el redondeo estaba en el reto extra. | `toFixed(1)` es un paso y un criterio. |
| 7A | Un paso juntaba tres acciones. | Se dividió en dos. |
| 7B | «Merge sort ≤ 64 comparaciones». | El valor real es 47. |
| 8B | Mencionaba «Tarjetas de estudio», no confirmada. | Se quitó del ejercicio. |
| 10A | Deep Research era obligatorio de hecho; la presentación se pedía solo por chat. | Deep Research es opcional con criterio condicional; se usa «Crear → Presentación» con el chat como alternativa. |
| 11A | El prompt pedía una barra con porcentajes y advertencia ámbar; la imagen muestra tres segmentos (Débil, Media, Segura), nombre de mínimo 3 caracteres, clave de mínimo 8 con números y símbolos, y dominios exclusivos. | Prompt y criterios alineados con la imagen. |
| 11B | Describía mal la segunda decisión y omitía nodos de la pizarra. | Criterios con «¿Requiere plan de mejoramiento?», «Coordinación Misional», «Firma de Acta de Compromiso» y la nota «en Portafolio de Evidencias». |
| Todos | «Chat del lienzo» no existe como nombre en Gemini. | «Chat de la izquierda». |

En el laboratorio: el Caso A del simulador de visión coincide ahora con 11A; se quitó el selector de «Temperatura / Rigor» del constructor de Gems (los Gems no lo tienen) y la afirmación sobre «Imagen 3 dentro de Gemini Canvas».

## Ejercicios nuevos (parte C): 31 ejercicios y 25 capacidades

| Código | Ejercicio | Capacidades nuevas |
|---|---|---|
| 1C | Recorrido por la interfaz con una guía de bienvenida | `export-pdf` |
| 2C | Juego «Meta de ahorro» para compartir y copiar | `copy-canvas` |
| 5C | App con funciones de Gemini: redactor de reportes | — (refuerza `gemini-in-app`) |
| 6C | Comunicado con errores: sugerencias de edición | `suggest-edits` |
| 7C | Análisis de notas en Python con Exportar a Colab (paso obligatorio) | — (refuerza `export-colab`) |
| 8C | Ficha de fórmulas con LaTeX y PDF | `latex` |
| 11C | De la foto de un inventario a un tablero de compras (material `inventario_laboratorio.png`) | — |

Mecánica: `CANVAS_EXERCISE_LETTERS` admite `a|b|c`; el botón «Parte C» solo aparece en los siete modos que la tienen; los contadores, el hub de proyectos (35) y la matriz de capacidades (25/25) se recalculan desde los datos.

## Pendiente de confirmar en una cuenta real de Gemini

No hubo una sesión de Gemini disponible para estas comprobaciones. Si alguna falla, se aplica el plan B ya escrito en el ejercicio.

1. Que la vista previa de Canvas cargue Mermaid 10 (4A, 4B, 9B, 11B) y Pyodide con `sqlite3` (7A, 9A, 9B) desde `cdn.jsdelivr.net`.
2. Las etiquetas en español: «Seleccionar y preguntar», «Mostrar consola», «Sugerencias de edición», «Copiar Canvas», «Exportar a PDF», la opción de fórmulas LaTeX y «Crear → Presentación». La ayuda oficial las lista en inglés (Select & ask, Suggest edits, Copy Canvas, LaTeX y slide show en el menú Create).
3. Que «Agregar funciones de Gemini» (5C, 8A) esté disponible; exige ser mayor de 18 años.
4. Funciones sin confirmar y fuera de los ejercicios: «Tarjetas de estudio» y «visual o app personalizada» del menú «Crear».

## Fuera de alcance

`tests/harness_m1_stress_suite.cjs` conserva dos fallos que ya existían: considera «Crear →» un término no nativo, contrario a la ayuda oficial de Google.
