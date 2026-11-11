# Alcance real de Gemini Canvas y corrección de los ejercicios (2026-11-03)

## Por qué se hizo este cambio

Algunos de los 24 ejercicios no aprovechaban Canvas, porque su resultado era una tabla que el chat normal también entrega. Otros pedían herramientas externas: Google Sheets, mermaid.live, sql.js, pytest local o una supuesta interfaz «Gem Studio». El objetivo de este cambio es que cada ejercicio se resuelva dentro de Gemini Canvas y practique una función que Canvas realmente ofrece.

## Qué se consultó

| Fuente | Qué confirma |
|---|---|
| Ayuda de Google: «Create docs, apps & more with Canvas» (support.google.com/gemini/answer/16047321) | Documentos, apps y código con vista previa; compartir; exportar a Documentos de Google, Presentaciones de Google y PDF; copiar contenido; exportar Python a Colab. **No hay exportación a Sheets.** |
| Documentación de Gemini Enterprise: «Create and edit documents and slides in Canvas» | Presentaciones generadas desde Canvas y exportación a Slides, PowerPoint o PDF. |
| Blog de Google: «New Gemini features: Canvas and Audio Overview» | Resumen en audio a partir del contenido. |
| Guías de terceros (Geeky Gadgets, Coursiv, Kartaca y Apidog, 2026) | Menú «Crear» con página web, infografía y cuestionario; botones «Código», consola y «Agregar funciones de Gemini» (para mayores de 18 años); imagen adjunta como punto de partida. |

**Pendiente de confirmar en una cuenta real:** las etiquetas en español del menú «Crear» (Página web, Infografía, Cuestionario y Resumen en audio) y de «Agregar funciones de Gemini». Sin embargo, las fuentes confirman que esas funciones existen.

## Qué cambió

- **Catálogo único:** `CANVAS_CAPABILITIES`, en `js/canvas-exercises.js`, definía 16 capacidades (hoy son 25; véase `gemini-canvas-revision-2026-11-11.md`). Cada ejercicio declara las suyas en `capabilities` y explica en `whyCanvas` qué aporta Canvas frente al chat.
- **Pruebas** (`tests/canvas-exercises.test.cjs`). Las pruebas exigen que:
  - cada capacidad declarada aparezca en algún paso;
  - los 24 ejercicios cubran el catálogo completo;
  - ningún ejercicio pida herramientas externas.
- **Ejercicios reescritos:**
  - El análisis de ventas y la matriz de riesgos son tableros con vista previa y ya no dependen de Sheets.
  - Las consultas SQL se resuelven con datos en JavaScript y un script `sqlite3` que se ejecuta con «Exportar a Colab».
  - El ejercicio de Mermaid con imagen de pizarra se dibuja en una página con vista previa.
  - En los ejercicios de Gems se crea el asistente en «Explorar Gems → Nuevo Gem».
  - Para el cuestionario, la infografía, la presentación y el resumen en audio se usan las funciones propias de Canvas.
- **Simulador:**
  - El modo 3 pasó a llamarse «Matrices & Tablas de Decisión», sin fórmulas en Sheets.
  - El modo 4 dibuja Mermaid en la vista previa.
  - «Gem Studio» se reemplazó por «Gems».
- **Navegación:**
  - Se crearon rutas profundas `#gemini-canvas/<modo>/<a|b>`, que funcionan con los botones atrás y adelante (`js/canvas-nav.js`).
  - Se agregaron un índice de los 24 ejercicios con marca de completado, botones Anterior y Siguiente entre modos y entradas por modo y ejercicio en la paleta de comandos.
  - La barra del módulo resalta la parte visible y queda fija a partir de 768 px. Antes no quedaba fija porque `.main-wrapper` usaba `overflow-x: hidden`.

## Cómo regenerar los derivados

- `node scripts/export_canvas_possibilities.cjs` regenera el banco JSON.
- `node scripts/build_canvas_guide_exercises.cjs` regenera la sección 7 de la guía Markdown.
- `python scripts/generate_canvas_images.py` regenera las imágenes de referencia.
