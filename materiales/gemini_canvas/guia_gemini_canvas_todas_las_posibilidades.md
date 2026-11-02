# Guía Metodológica: Gemini Canvas y Todas sus Posibilidades Prácticas

**Formación en Inteligencia Artificial Aplicada · Modo Participante y Facilitador**
**Autoría Curricular: DevBrain v8.10 · Regional Colombia (es-CO)**

---

## 1. ¿Qué es Gemini Canvas y por qué revoluciona el aprendizaje con IA?

Tradicionalmente, la interacción con un modelo de lenguaje ocurre mediante un **chat lineal**: envías una pregunta, la IA produce una respuesta extensa y esta se desplaza verticalmente hacia arriba. Si necesitas cambiar un solo párrafo o pedir una corrección menor, el chat suele reescribir todo el texto desde cero o fragmentar la conversación.

**Gemini Canvas** (Lienzo de Gemini) transforma esta experiencia en un **espacio de trabajo bidireccional y colaborativo en pantalla dividida (Split Screen)**:
* **Panel Izquierdo (Chat de Instrucciones):** Tu canal de diálogo para formular requerimientos, pedir ajustes o aclarar dudas.
* **Panel Derecho (Lienzo de Trabajo Activo):** Un editor dinámico donde vive tu artefacto (un informe técnico, un prototipo de código, una tabla de decisión o un diagrama). El artefacto no desaparece ni se oculta; permanece visible mientras tú y la IA trabajan sobre él.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE GEMINI WORKSPACE                         │
├──────────────────────────────┬─────────────────────────────────────────┤
│    CHAT CONVERSACIONAL       │          LIENZO (CANVAS ACTIVO)         │
│   (Instrucción y Diálogo)    │   [Longitud] [Tono] [Previsualizar]     │
│                              │                                         │
│ 👤 Aprendiz:                  │ # INFORME TÉCNICO DE GESTIÓN            │
│ "Genera una propuesta..."    │                                         │
│                              │ 1. Resumen Ejecutivo                    │
│ 🤖 Gemini:                   │ Texto estructurado editable en vivo... │
│ "He abierto el borrador      │                                         │
│ en el Canvas de la derecha.  │ [Párrafo seleccionado con cursor]       │
│ Puedes editarlo o pedirme    │ ↳ ✏️ "Cambiar tono a formal"           │
│ ajustes por sección."        │                                         │
└──────────────────────────────┴─────────────────────────────────────────┘
```

---

## 2. Cómo Activar y Abrir Gemini Canvas

1. **Activación Automática por Intención:** Cuando solicitas un documento extenso (superior a 300 palabras), una tabla compleja o una aplicación de código en HTML/JS/Python, Gemini abre automáticamente el panel lateral de Canvas.
2. **Activación desde el prompt:** Si no activaste el botón, indica en el prompt que el trabajo debe quedar en Canvas. Escríbelo como una orden para Gemini, no como un paso tuyo:
   > *"En Canvas, redacta..."* o *"Crea este proyecto en Canvas..."*
3. **Botón en Interfaz:** En la respuesta de Gemini, haz clic en el icono **"Abrir en Canvas"** (icono de lienzo o ventana dividida).
4. **Flujo Multimodal:** Al adjuntar una fotografía de una pizarra o un boceto dibujado a mano y solicitar *"Genera el código web de este diseño en Canvas"*, el lienzo se inicializa con la aplicación renderizada en directo.

---

## 3. Las Diez Grandes Posibilidades de Gemini Canvas

Cada posibilidad trae un prompt autosuficiente: los datos van dentro del prompt, entre comillas triples, para que Gemini no tenga que inventar cifras. Después del prompt está la lista con la que el aprendiz comprueba su propio resultado en Canvas. Las imágenes del simulador son reconstrucciones del resultado esperado, dibujadas con esos mismos datos; el diseño de cada Canvas puede variar, pero las cifras y el contenido no.

---

### Posibilidad 1: Redacción Editorial y Documentos Extensos

* **Propósito:** Estructurar propuestas técnicas, actas complejas y términos de referencia sin perder coherencia entre secciones.
* **Controles del simulador:** 📏 Ajustar longitud · 📄 Exportar a Google Docs
* **Prompt maestro (R-C-I-R-F, con datos):**

```text
Actúa como profesional de infraestructura tecnológica que redacta términos de referencia para compras públicas.

Contexto: El centro de formación publicará una invitación abierta para comprar estaciones de trabajo. El comité de compras necesita un documento técnico que cualquier proveedor pueda cumplir sin favorecer una marca.

Datos:
"""
Necesidad: Laboratorio de Inteligencia Artificial y Multimedia (ambiente 305). Lo usan 40 aprendices por jornada para entrenar modelos pequeños, practicar visión artificial y editar video. Los equipos actuales no tienen GPU dedicada.
Cantidad: 20 estaciones de trabajo.
Valor unitario de referencia (estudio de mercado, IVA incluido): COP 9.800.000.

Requisitos mínimos (componente | requisito mínimo | tolerancia aceptada):
Procesador | 14 núcleos y 20 hilos; frecuencia base de 2,5 GHz o superior | Equivalente o superior, de cualquier fabricante
Memoria RAM | 32 GB DDR5 a 5600 MHz en doble canal | Ampliable a 64 GB
GPU dedicada | 12 GB de VRAM GDDR6, compatible con PyTorch y TensorFlow | Equivalente o superior
Almacenamiento | SSD NVMe PCIe 4.0 de 1 TB; lectura de 5.000 MB/s o más | Una ranura M.2 adicional libre
Pantalla | 27 pulgadas, 2560 × 1440, panel IPS | Hasta 32 pulgadas

Cronograma (plazo | actividad):
Semanas 1 y 2 | Entrega de los equipos en el ambiente 305
Semana 3 | Instalación y configuración
Semana 4 | Pruebas de rendimiento y recibo a satisfacción

Garantía mínima: 36 meses en sitio, con atención de fallas críticas en máximo 24 horas hábiles.
"""

Instrucción: En Canvas, redacta los términos de referencia con estas cuatro secciones numeradas:
1. Resumen ejecutivo y justificación de la necesidad formativa, en máximo 120 palabras.
2. Especificaciones técnicas mínimas: una tabla con las columnas Componente, Requisito mínimo y Tolerancia aceptada, con las 5 filas de los datos.
3. Presupuesto y cronograma: calcula el presupuesto total (cantidad × valor unitario) y presenta el cronograma en una tabla de 3 filas.
4. Criterios de aceptación y garantía: una lista de verificación que el comité pueda marcar al recibir los equipos.

Restricciones:
- Copia los requisitos y valores tal como aparecen en los datos; no agregues componentes ni cambies cifras.
- No menciones marcas ni modelos comerciales.
- Escribe los valores en pesos colombianos con punto de miles, por ejemplo COP 1.000.000.

Formato: Documento formal en español de Colombia, con títulos numerados del 1 al 4 y dos tablas.
```

* **Cómo verificar el resultado:**
  * [ ] El documento tiene exactamente 4 secciones numeradas: resumen ejecutivo, especificaciones técnicas, presupuesto y cronograma, y aceptación y garantía. *Cómo comprobarlo:* Revisa los títulos del Canvas de arriba abajo.
  * [ ] La tabla de especificaciones tiene 5 filas (Procesador, Memoria RAM, GPU dedicada, Almacenamiento y Pantalla) con los mismos valores de los datos. *Cómo comprobarlo:* Compara fila por fila con el bloque de datos del prompt.
  * [ ] El presupuesto total es COP 196.000.000 (20 × COP 9.800.000). *Cómo comprobarlo:* Busca «196.000.000» con Ctrl+F en el Canvas.
  * [ ] El cronograma tiene 3 filas: semanas 1 y 2, semana 3 y semana 4. *Cómo comprobarlo:* Cuenta las filas de la segunda tabla.
  * [ ] La garantía dice 36 meses en sitio y atención de fallas críticas en máximo 24 horas hábiles. *Cómo comprobarlo:* Lee la sección 4.
  * [ ] No aparece ninguna marca ni modelo comercial de procesadores, tarjetas gráficas o pantallas. *Cómo comprobarlo:* Busca nombres de fabricantes con Ctrl+F; no debe haber resultados.
  * [ ] El resumen ejecutivo tiene 120 palabras o menos. *Cómo comprobarlo:* Si se pasa, selecciónalo y usa «Ajustar longitud» → «Más corto».

---

### Posibilidad 2: Desarrollo y Prototipado Web en Vivo

* **Propósito:** Construir aplicaciones interactivas en HTML/CSS/JS ejecutables directamente dentro de Gemini Canvas con previsualización en vivo.
* **Controles del simulador:** ▶ Vista previa · 🧮 Regla de estado
* **Prompt maestro (R-C-I-R-F, con datos):**

```text
Actúa como desarrollador frontend que construye prototipos accesibles para equipos docentes.

Contexto: La coordinación quiere probar un tablero sencillo antes de pedir un desarrollo formal. Lo usarán instructores sin conocimientos técnicos.

Datos:
"""
Ficha 2871 · Seguimiento semanal (porcentajes de 0 a 100)
Aprendiz | Asistencia | Evidencias entregadas
Ana María García | 95 | 100
Carlos Andrés Pérez | 88 | 90
Julián David Torres | 70 | 65
Laura Sofía Mendoza | 92 | 80
Diego Alejandro Ruiz | 64 | 72
Valentina Ríos Cárdenas | 86 | 95

Regla de estado:
- Requiere apoyo: asistencia o evidencias por debajo de 70.
- Al día: asistencia y evidencias de 85 o más.
- En progreso: cualquier otro caso.
"""

Instrucción: En Canvas, crea una sola página HTML, con CSS y JavaScript, que incluya:
1. Dos tarjetas KPI calculadas con JavaScript a partir de los datos: asistencia promedio y evidencias promedio, con un decimal.
2. Una tabla con los 6 aprendices y una columna Estado calculada con la regla de los datos.
3. Un buscador por nombre que no distinga mayúsculas y un filtro por estado que funcionen al mismo tiempo.
4. Una gráfica de barras en SVG con las evidencias de cada aprendiz.

Restricciones:
- No uses librerías externas, CDN ni npm: todo debe funcionar en la vista previa de Canvas.
- Guarda los datos en un arreglo de JavaScript; no escribas los resultados a mano.
- Usa el color #2D5A4C para los elementos principales y conserva un contraste AA.

Formato: Un único archivo HTML con comentarios breves en español.
```

* **Cómo verificar el resultado:**
  * [ ] La tarjeta de asistencia muestra 82,5 % y la de evidencias 83,7 % (también vale con punto decimal). *Cómo comprobarlo:* Abre la vista previa del Canvas.
  * [ ] La tabla tiene 6 filas y la columna Estado suma 3 Al día, 1 En progreso y 2 Requiere apoyo. *Cómo comprobarlo:* Cuenta los estados en la vista previa.
  * [ ] Al filtrar «Requiere apoyo» quedan 2 filas: Julián David Torres y Diego Alejandro Ruiz. *Cómo comprobarlo:* Usa el filtro por estado.
  * [ ] Al escribir «ana» en el buscador queda 1 fila (Ana María García); al borrar el texto vuelven las 6. *Cómo comprobarlo:* Escribe en el buscador de la vista previa.
  * [ ] La gráfica tiene 6 barras; la más alta es Ana María García (100) y la más baja Julián David Torres (65). *Cómo comprobarlo:* Observa la gráfica en la vista previa.
  * [ ] El código no contiene etiquetas script con src, sentencias import ni enlaces a CDN. *Cómo comprobarlo:* Pasa a la vista de código y busca «src=» e «import».

---

### Posibilidad 3: Análisis Estructurado, Matrices y Tablas

* **Propósito:** Evaluar propuestas de oferentes o comparar alternativas complejas con fórmulas matemáticas y exportación transparente a Google Sheets.
* **Controles del simulador:** 🧮 Ver fórmula · 📊 Exportar a Google Sheets
* **Prompt maestro (R-C-I-R-F, con datos):**

```text
Actúa como analista de compras públicas que prepara matrices de decisión para comités evaluadores.

Contexto: El comité de compras debe elegir un proveedor de internet dedicado para el campus y necesita una matriz cuantitativa que cualquier integrante pueda recalcular.

Datos:
"""
Proceso: servicio de internet dedicado para el campus durante 36 meses.
Escala de calificación: de 1 (no cumple) a 10 (cumple de forma sobresaliente).

Criterio | Peso | Proveedor A (fibra) | Proveedor B (híbrido) | Proveedor C (satelital)
C1 Ancho de banda garantizado | 25 % | 9,5 | 8 | 6
C2 Disponibilidad SLA del 99,8 % | 20 % | 9 | 8,5 | 7
C3 Soporte técnico 24/7 en sitio | 15 % | 8,5 | 7 | 6
C4 Costo mensual por Mbps | 25 % | 8 | 9 | 5
C5 Experiencia certificada | 15 % | 9 | 8 | 6

Fórmula: puntaje sobre 100 = suma de (calificación × peso) ÷ 10.
Estados: Recomendado si el puntaje es 85 o más; Admisible con observaciones entre 70 y 84,9; No cumple por debajo de 70.
"""

Instrucción: En Canvas, construye la matriz ponderada con:
1. Una tabla con los 5 criterios, su peso y la calificación de cada proveedor, tal como aparecen en los datos.
2. Una columna de aporte por proveedor (calificación × peso ÷ 10) en cada criterio.
3. Una fila final con el puntaje sobre 100 de cada proveedor, con un decimal, y su estado según los umbrales.
4. Una conclusión de dos frases que nombre al proveedor recomendado y la diferencia de puntos con el segundo.

Restricciones:
- Usa solo las calificaciones y los pesos de los datos, y muestra la fórmula que aplicaste.
- Si exportas a Hojas de cálculo, los totales deben ser fórmulas, no valores escritos a mano.

Formato: Tabla con encabezados claros, estados en verde, ámbar y rojo, y cifras con coma decimal.
```

* **Cómo verificar el resultado:**
  * [ ] Los pesos suman 100 % (25 + 20 + 15 + 25 + 15). *Cómo comprobarlo:* Suma la columna Peso.
  * [ ] El aporte del Proveedor A en C1 es 23,75 (9,5 × 25 ÷ 10). *Cómo comprobarlo:* Busca la celda en la columna de aportes de A.
  * [ ] Puntaje final: Proveedor A = 88,0; Proveedor B = 82,0; Proveedor C = 59,5. *Cómo comprobarlo:* Recalcula al menos uno con tu calculadora.
  * [ ] Estados: A Recomendado (verde), B Admisible con observaciones (ámbar) y C No cumple (rojo). *Cómo comprobarlo:* Compara cada puntaje con los umbrales de los datos.
  * [ ] La conclusión recomienda al Proveedor A y menciona la diferencia de 6,0 puntos con el Proveedor B. *Cómo comprobarlo:* Lee el texto debajo de la tabla.
  * [ ] Al exportar a Hojas de cálculo, la celda del total contiene una fórmula (por ejemplo, =SUMAPRODUCTO). *Cómo comprobarlo:* Haz clic en la celda del total en Google Sheets y mira la barra de fórmulas.

---

### Posibilidad 4: Diagramación de Procesos y Flujogramas

* **Propósito:** Mapear flujos de trabajo institucionales, protocolos de soporte técnico y ciclos de vida de software con sintaxis visual Mermaid.
* **Controles del simulador:** 📝 Ver código Mermaid · 📥 Descargar SVG
* **Prompt maestro (R-C-I-R-F, con datos):**

```text
Actúa como analista de procesos de soporte de TI.

Contexto: La mesa de ayuda del centro necesita un diagrama que el personal nuevo entienda en un minuto y que se pueda guardar en el repositorio de documentación.

Datos:
"""
Responsables y pasos (identificador | responsable | paso):
P1 | Usuario solicitante | Reporta la falla (inicio o fin)
P2 | Mesa de ayuda Nivel 1 | Registra el ticket y diagnostica
D1 | Mesa de ayuda Nivel 1 | ¿Resuelto en 15 minutos o menos? (decisión)
P3 | Mesa de ayuda Nivel 1 | Documenta la solución
P4 | Mesa de ayuda Nivel 1 | Clasifica la severidad y escala
P5 | Soporte especializado Nivel 2 | Interviene en sitio o reemplaza el hardware
P6 | Soporte especializado Nivel 2 | Actualiza la base de conocimiento
P7 | Usuario solicitante | Verifica la solución y responde la encuesta
P8 | Mesa de ayuda Nivel 1 | Cierra el ticket (inicio o fin)

Conexiones:
P1 → P2
P2 → D1
D1 → P3 (respuesta «Sí»)
D1 → P4 (respuesta «No»)
P4 → P5
P5 → P6
P3 → P7
P6 → P7
P7 → P8
"""

Instrucción: En Canvas, genera el diagrama en Mermaid con:
1. Sintaxis flowchart TD.
2. Un subgrafo por responsable, con el nombre exacto de los datos.
3. Los 9 pasos con sus identificadores: D1 como rombo, y P1 y P8 como cápsulas de inicio y fin.
4. Las 9 conexiones de los datos; las dos salidas de D1 rotuladas «Sí» y «No».

Restricciones:
- No agregues pasos, responsables ni conexiones que no estén en los datos.
- El código debe dibujarse sin errores en cualquier visor de Mermaid, por ejemplo mermaid.live.

Formato: Solo el bloque de código Mermaid, seguido de una línea que explique cómo leer el diagrama.
```

* **Cómo verificar el resultado:**
  * [ ] El código se dibuja sin mensajes de error de sintaxis. *Cómo comprobarlo:* Copia el código del Canvas y pégalo en mermaid.live; Canvas puede mostrarlo como texto sin dibujarlo.
  * [ ] Hay 3 carriles (subgrafos): Usuario solicitante, Mesa de ayuda Nivel 1 y Soporte especializado Nivel 2. *Cómo comprobarlo:* Cuenta los recuadros con título en el diagrama.
  * [ ] Aparecen los 9 pasos (P1 a P8 y D1), cada uno en el carril de su responsable. *Cómo comprobarlo:* Compara cada nodo con la tabla de datos.
  * [ ] D1 es un rombo con dos salidas: «Sí» hacia P3 y «No» hacia P4. *Cómo comprobarlo:* Sigue las flechas que salen del rombo.
  * [ ] Hay 9 flechas en total y los dos caminos llegan a P7 y luego a P8. *Cómo comprobarlo:* Cuenta las líneas «-->» en el código.
  * [ ] El código empieza con «flowchart TD». *Cómo comprobarlo:* Pasa a la vista de código.

---

### Posibilidad 5: Diseño Visual y Mockups de Interfaz (UI)

* **Propósito:** Definir sistemas de diseño accesibles y generar maquetas conceptuales de interfaces antes de la fase de codificación.
* **Controles del simulador:** 👁️ Validar contraste · 🖼️ Prompt de imagen · 🎨 Copiar tokens CSS
* **Prompt maestro (R-C-I-R-F, con datos):**

```text
Actúa como diseñador de interfaces con experiencia en accesibilidad WCAG 2.2.

Contexto: El equipo quiere validar la paleta y la pantalla de inicio antes de diseñar el resto de la aplicación móvil.

Datos:
"""
Producto: aplicación móvil «Mi Portafolio SENA» para aprendices.
Pantalla: inicio del aprendiz, 360 px de ancho.
Contenido de la pantalla:
- Encabezado: «Mi Portafolio SENA» y «Tecnología en ADSO · Ficha 2871».
- Tarjeta 1: Evidencias entregadas, 18 de 20.
- Tarjeta 2: Asistencia, 96 %.
- Tarjeta 3: Próxima entrega, «Diagrama de procesos», vence el 14 de noviembre.
- Botón principal: «Subir evidencia».

Paleta (token | HEX | uso):
--color-primario | #2D5A4C | encabezado y botón
--color-texto | #1E293B | texto
--color-fondo | #F8FAF9 | fondo
--color-alerta | #D97706 | íconos y avisos grandes
--color-alerta-texto | #B45309 | texto de avisos

Pares de contraste que se deben comprobar (texto sobre fondo):
1. #2D5A4C sobre #F8FAF9
2. #1E293B sobre #F8FAF9
3. #FFFFFF sobre #2D5A4C
4. #D97706 sobre #FFFFFF
5. #B45309 sobre #FFFFFF
"""

Instrucción: En Canvas, crea una página HTML con:
1. Una sección de tokens con una muestra de color por cada fila de la paleta.
2. Una tabla que calcule con JavaScript la razón de contraste de los 5 pares con la fórmula de WCAG 2.2, con dos decimales, y el nivel que cumple: AAA, AA, AA texto grande o No cumple.
3. Una maqueta de la pantalla de inicio de 360 px de ancho con el contenido de los datos; el botón debe mostrar un contorno real con :focus-visible al llegar con la tecla Tab, no un contorno fijo.
4. Al final de la página, un bloque de texto en inglés que describa la maqueta con los HEX de la paleta; lo copiaré después como descripción de diseño.

Restricciones:
- Calcula los contrastes en el código; no los escribas a mano.
- Usa solo los colores de la paleta y no uses librerías externas.

Formato: Un único archivo HTML; la tabla de contraste con las columnas Par, Razón y Nivel.
```

* **Cómo verificar el resultado:**
  * [ ] La tabla de contraste muestra #2D5A4C sobre #F8FAF9 = 7,48:1 (AAA); #1E293B sobre #F8FAF9 = 13,96:1 (AAA); #FFFFFF sobre #2D5A4C = 7,84:1 (AAA). *Cómo comprobarlo:* Compáralo con «Validar contraste» de este simulador (también vale con punto decimal).
  * [ ] #D97706 sobre #FFFFFF = 3,19:1 (AA texto grande): solo sirve para íconos o texto grande. *Cómo comprobarlo:* Revisa la fila 4 de la tabla.
  * [ ] #B45309 sobre #FFFFFF = 5,02:1 (AA): sirve para el texto de los avisos. *Cómo comprobarlo:* Revisa la fila 5 de la tabla.
  * [ ] La maqueta muestra Evidencias 18 de 20, Asistencia 96 % y la próxima entrega «Diagrama de procesos». *Cómo comprobarlo:* Abre la vista previa del Canvas.
  * [ ] El botón «Subir evidencia» muestra un contorno solo al llegar a él con la tecla Tab, y el CSS usa :focus-visible. *Cómo comprobarlo:* Haz clic en la vista previa, presiona Tab y busca «focus-visible» en el código.
  * [ ] El bloque en inglés del final describe la maqueta e incluye #2D5A4C, #1E293B y #F8FAF9. *Cómo comprobarlo:* Busca los tres HEX en ese bloque; luego puedes pegarlo en un chat nuevo de Gemini para generar la imagen.

---

### Posibilidad 6: Edición Quirúrgica por Selección (Inline)

* **Propósito:** Aislar párrafos, cláusulas o funciones de código para pedir mejoras puntuales manteniendo intacto el resto del documento.
* **Controles del simulador:** 🔄 Comparar antes y después · 🕒 Historial de versiones
* **Prompt maestro (R-C-I-R-F, con datos):**

```text
Actúa como secretario técnico que transcribe las actas del comité académico.

Contexto: Necesitas el acta en un Canvas para corregir después solo el punto 3, que el comité consideró confuso y punitivo.

Datos:
"""
ACTA DE CONCERTACIÓN · Ficha 2879123 (Técnico en Programación de Software)
1. Objeto: acordar las condiciones de la evaluación final del módulo de bases de datos.
2. Fecha de la prueba final: 14 de noviembre de 2026, 8:00 a. m., ambiente 204.
3. Inasistencia: Los aprendices que no asistan perderán la oportunidad de presentar la prueba final a menos que tengan una excusa válida de un médico u otra autoridad y deben presentarla antes de dos días hábiles.
4. Compromisos: el instructor publica la rúbrica el 7 de noviembre; los aprendices confirman su asistencia en la plataforma del curso.
"""

Instrucción: En Canvas, haz lo siguiente:
1. Transcribe el acta exactamente como aparece en los datos, con su título y los 4 puntos numerados.
2. No corrijas ni resumas nada todavía; la edición del punto 3 se hará en el paso 2.
3. Al final, confirma en el chat cuántos puntos tiene el acta.

Restricciones:
- Conserva sin cambios las fechas, la hora y los números de ficha y de ambiente.

Formato: Documento con el título en negrita y los puntos numerados del 1 al 4.
```

* **Paso 2 · Selecciona solo el punto 3 en el Canvas y escribe en el cuadro de edición:**

```text
Reescribe este punto en tono respetuoso y claro, en dos viñetas: 1) cómo y en qué plazo se entrega el soporte de la inasistencia; 2) qué ocurre si el soporte es válido. Conserva el plazo de dos días hábiles y no agregues requisitos, correos ni fechas nuevas.
```

* **Cómo verificar el resultado:**
  * [ ] Después del paso 1, el Canvas tiene el acta completa con 4 puntos idénticos a los datos. *Cómo comprobarlo:* Compara el Canvas con el bloque de datos antes de editar.
  * [ ] Después del paso 2, solo cambió el punto 3: ahora tiene exactamente 2 viñetas. *Cómo comprobarlo:* Compara con la versión anterior (deshacer o historial de versiones del Canvas).
  * [ ] Los puntos 1, 2 y 4 siguen iguales: 14 de noviembre de 2026, 8:00 a. m., ambiente 204 y rúbrica el 7 de noviembre. *Cómo comprobarlo:* Lee los tres puntos sin editar.
  * [ ] El punto 3 conserva «dos días hábiles» y el soporte de un médico u otra autoridad. *Cómo comprobarlo:* Busca «dos días hábiles» con Ctrl+F.
  * [ ] La segunda viñeta dice que, con un soporte válido, el aprendiz conserva la oportunidad de presentar la prueba final. *Cómo comprobarlo:* Lee la segunda viñeta.
  * [ ] No aparecen requisitos nuevos (correos, formatos, fechas o sanciones) y ya no dice «perderán». *Cómo comprobarlo:* Busca «correo», «formato» y «perderán»; no debe haber resultados.

---

### Posibilidad 7: Auditoría, Explicación y Refactorización de Algoritmos

* **Propósito:** Depurar cuellos de botella de rendimiento, optimizar la complejidad asintótica de funciones críticas y generar documentación técnica verificable.
* **Controles del simulador:** ⚡ Solución de referencia · 🧪 Pruebas de referencia
* **Prompt maestro (R-C-I-R-F, con datos):**

```text
Actúa como ingeniero de software que revisa el rendimiento de código Python.

Contexto: La función agrupa las entregas de cada corte (10.000 registros) y se volvió lenta. Se necesita una versión eficiente que devuelva exactamente el mismo resultado.

Datos:
"""
Función actual (Python 3.11):

def agrupar_por_estado(entregas):
    resumen = {"al_dia": [], "en_progreso": [], "apoyo": []}
    vistos = []
    for e in entregas:
        if e["documento"] in vistos:  # se ignora el documento repetido
            continue
        vistos.append(e["documento"])
        if e["puntaje"] >= 70:
            resumen["al_dia"].append(e["nombre"])
        elif e["puntaje"] >= 50:
            resumen["en_progreso"].append(e["nombre"])
        else:
            resumen["apoyo"].append(e["nombre"])
    return resumen

Entrada de ejemplo:
entregas = [
    {"documento": "101", "nombre": "Ana", "puntaje": 70.0},
    {"documento": "102", "nombre": "Luis", "puntaje": 69.9},
    {"documento": "103", "nombre": "Marta", "puntaje": 50.0},
    {"documento": "104", "nombre": "Jorge", "puntaje": 49.9},
    {"documento": "101", "nombre": "Ana", "puntaje": 95.0},
    {"documento": "105", "nombre": "Sara", "puntaje": 0.0},
    {"documento": "106", "nombre": "Iván", "puntaje": 100.0},
]
"""

Instrucción: En Canvas, entrega:
1. Una explicación de dos frases de por qué la función actual es O(n²), señalando la línea responsable.
2. La función refactorizada en O(n), con el mismo nombre, type hints y docstring en español.
3. Un archivo de pruebas con pytest que cubra la lista vacía, un documento repetido y los límites 0, 49.9, 50, 69.9 y 70.
4. Un bloque final que imprima el resultado con la entrada de ejemplo.

Restricciones:
- Conserva el comportamiento: si un documento se repite, cuenta su primer registro.
- Usa solo la biblioteca estándar de Python.

Formato: La explicación primero y después dos bloques de código: la función y las pruebas.
```

* **Cómo verificar el resultado:**
  * [ ] La explicación señala la línea «if e["documento"] in vistos»: buscar en una lista recorre sus elementos, y eso ocurre dentro del ciclo. *Cómo comprobarlo:* Lee la explicación antes del código.
  * [ ] La versión nueva usa un set (conjunto) para vistos y conserva el nombre agrupar_por_estado. *Cómo comprobarlo:* Busca «set(» en el código.
  * [ ] Con la entrada de ejemplo imprime {'al_dia': ['Ana', 'Iván'], 'en_progreso': ['Luis', 'Marta'], 'apoyo': ['Jorge', 'Sara']}. *Cómo comprobarlo:* Copia el código a tu equipo o a Google Colab y ejecútalo.
  * [ ] Las pruebas cubren la lista vacía, el documento repetido y los 5 límites, y «python -m pytest» termina sin fallos. *Cómo comprobarlo:* Guarda la función como clasificador.py y las pruebas como test_clasificador.py, y ejecuta pytest. Si Gemini entrega todo en un solo archivo, ejecuta pytest sobre ese archivo.
  * [ ] La función tiene type hints y un docstring en español que menciona la complejidad O(n). *Cómo comprobarlo:* Lee la firma y el docstring.

---

### Posibilidad 8: Guías Didácticas y Rúbricas Analíticas de Evaluación

* **Propósito:** Co-diseñar guías de aprendizaje completas, criterios observables y rúbricas analíticas estructuradas para formación técnica por competencias.
* **Controles del simulador:** 💬 Preguntas de referencia · 📄 Exportar a Google Docs
* **Prompt maestro (R-C-I-R-F, con datos):**

```text
Actúa como diseñador curricular que construye instrumentos de evaluación por competencias.

Contexto: El equipo instructor necesita una rúbrica que dos evaluadores apliquen al mismo repositorio y obtengan la misma nota.

Datos:
"""
Programa: Tecnólogo en Análisis y Desarrollo de Software (datos de práctica).
Competencia: Construir el sistema que cumpla con los requisitos de la solución informática.
Resultado de aprendizaje: Codificar los módulos del backend según la arquitectura definida y verificarlos con pruebas automatizadas.
Evidencia de producto: repositorio del backend con su informe de pruebas.

Criterios y pesos:
C1 Separación de capas (dominio, aplicación e infraestructura) | 30 %
C2 Pruebas automatizadas con aserciones | 35 %
C3 Manejo de errores HTTP con el formato de RFC 9457 | 35 %

Niveles de desempeño (nota de 0,0 a 5,0):
Excelente: de 4,5 a 5,0
Bueno: de 3,8 a 4,4
En desarrollo: de 3,0 a 3,7
Requiere refuerzo: menos de 3,0

Nota final = suma de (nota del criterio × peso).
Caso para calibrar: un aprendiz obtiene 4,8 en C1; 3,5 en C2; 4,0 en C3.
"""

Instrucción: En Canvas, redacta la guía de evaluación con:
1. La identificación curricular copiada de los datos.
2. Una rúbrica en una tabla: 3 filas (C1, C2 y C3, con su peso) y 4 columnas de nivel con el rango de nota en el encabezado.
3. La calificación del caso para calibrar, con la operación paso a paso y el nivel que resulta.
4. Tres preguntas de retroalimentación, una por criterio, que el instructor le haga al aprendiz.

Restricciones:
- Cada descriptor debe nombrar algo observable en el repositorio o en el informe (archivos, pruebas, códigos HTTP), no adjetivos como «bueno» o «adecuado».
- Los pesos deben sumar 100 %.

Formato: Documento con títulos numerados y la rúbrica en una sola tabla.
```

* **Cómo verificar el resultado:**
  * [ ] La rúbrica tiene 3 criterios × 4 niveles = 12 descriptores. *Cómo comprobarlo:* Cuenta las celdas de la tabla.
  * [ ] Los pesos 30 %, 35 % y 35 % suman 100 %. *Cómo comprobarlo:* Suma la columna de pesos.
  * [ ] Cada descriptor nombra algo que se puede comprobar: archivos, importaciones, pruebas, fallos o códigos HTTP. *Cómo comprobarlo:* Lee cada celda y pregúntate cómo lo verificarías en el repositorio.
  * [ ] La nota del caso es 4,8 × 0,30 + 3,5 × 0,35 + 4,0 × 0,35 = 1,44 + 1,225 + 1,40 = 4,065 ≈ 4,1 (Bueno). *Cómo comprobarlo:* Repite la operación con tu calculadora.
  * [ ] Hay 3 preguntas abiertas, una por criterio, que no se responden con «sí» o «no». *Cómo comprobarlo:* Lee la última sección.
  * [ ] La competencia y el resultado de aprendizaje coinciden palabra por palabra con los datos. *Cómo comprobarlo:* Compara con el bloque de datos.

---

### Posibilidad 9: Consultas SQL Complejas, ETL y Modelado Relacional

* **Propósito:** Construir consultas analíticas de alto rendimiento, diseñar pipelines de transformación de datos relacionales y optimizar planes de ejecución.
* **Controles del simulador:** 🗄️ Consulta de referencia · 📋 Resultado esperado
* **Prompt maestro (R-C-I-R-F, con datos):**

```text
Actúa como analista de bases de datos PostgreSQL.

Contexto: El reporte mensual por ficha tarda demasiado con 5.000 aprendices. Antes de llevar la nueva consulta a producción, se valida con la muestra de los datos.

Datos:
"""
CREATE TABLE aprendices (id INT PRIMARY KEY, nombre TEXT NOT NULL, ficha_id INT NOT NULL);
CREATE TABLE entregas (aprendiz_id INT REFERENCES aprendices(id), calificacion NUMERIC(2,1));
CREATE TABLE registro_asistencia (aprendiz_id INT REFERENCES aprendices(id), fecha DATE, asistio BOOLEAN);

INSERT INTO aprendices VALUES (1,'Ana',2871),(2,'Luis',2871),(3,'Marta',2871),(4,'Jorge',2872),(5,'Sara',2872);
INSERT INTO entregas VALUES (1,4.5),(1,4.1),(2,3.8),(2,4.2),(3,4.6),(4,3.0),(4,3.4),(5,4.9);
INSERT INTO registro_asistencia VALUES
(1,'2026-10-05',true),(1,'2026-10-12',true),(1,'2026-10-19',true),(1,'2026-10-26',true),
(2,'2026-10-05',true),(2,'2026-10-12',false),(2,'2026-10-19',true),(2,'2026-10-26',true),
(3,'2026-10-05',true),(3,'2026-10-12',true),(3,'2026-10-19',true),(3,'2026-10-26',true),
(4,'2026-10-05',true),(4,'2026-10-12',false),(4,'2026-10-19',false),(4,'2026-10-26',true);
-- Sara (id 5) no tiene registros de asistencia en octubre.
"""

Instrucción: En Canvas, escribe en SQL:
1. Una consulta con dos CTE: una para el promedio de notas y otra para la asistencia del 2026-10-01 al 2026-10-31.
2. El puesto de cada aprendiz dentro de su ficha con ROW_NUMBER(), ordenado por promedio de mayor a menor.
3. El porcentaje de asistencia con un decimal; si un aprendiz no tiene registros, debe aparecer con NULL y sin error de división por cero.
4. La sentencia que crea un índice compuesto en registro_asistencia (aprendiz_id, fecha) que incluya asistio.
5. La tabla de resultado que esperas con los datos de muestra.

Restricciones:
- No uses subconsultas correlacionadas.
- Usa ROUND(…, 1) para el promedio y el porcentaje, y ordena por ficha y puesto.

Formato: Un bloque SQL comentado y, debajo, la tabla de resultado esperada.
```

* **Cómo verificar el resultado:**
  * [ ] La consulta usa WITH con dos CTE y ROW_NUMBER() OVER (PARTITION BY ficha_id ORDER BY promedio DESC). *Cómo comprobarlo:* Lee el bloque SQL.
  * [ ] Usa LEFT JOIN y NULLIF (o CASE) para que Sara aparezca con NULL en asistencia. *Cómo comprobarlo:* Busca «LEFT JOIN» y «NULLIF» en el código.
  * [ ] Resultado con la muestra: 2871 → 1 Marta 4,6 · 100,0; 2 Ana 4,3 · 100,0; 3 Luis 4,0 · 75,0. 2872 → 1 Sara 4,9 · NULL; 2 Jorge 3,2 · 50,0. *Cómo comprobarlo:* Ejecuta el esquema y la consulta en PostgreSQL (local o en un editor en línea) y compara fila por fila.
  * [ ] El índice es CREATE INDEX … ON registro_asistencia (aprendiz_id, fecha) INCLUDE (asistio). *Cómo comprobarlo:* Lee la sentencia del índice.
  * [ ] No hay subconsultas dentro de SELECT ni de WHERE. *Cómo comprobarlo:* Busca «(SELECT» en el código; solo debe aparecer dentro de las CTE.

---

### Posibilidad 10: Informes Ejecutivos Multifuente y Dictamen Técnico

* **Propósito:** Cruzar múltiples auditorías e informes densos para extraer conclusiones directivas, matrices de riesgo y planes de acción con valor legal y técnico.
* **Controles del simulador:** ⚖️ Ver regla del semáforo · 📄 Exportar a Google Docs
* **Prompt maestro (R-C-I-R-F, con datos):**

```text
Actúa como auditor de sistemas que redacta dictámenes para comités directivos.

Contexto: El comité directivo decide el lunes si libera el pago final del contrato. Necesita un dictamen de una página basado solo en los extractos de los informes.

Datos:
"""
Contrato: CT-2026-014, plataforma de gestión académica (datos de práctica).
Fecha de corte: 30 de octubre de 2026.
Avance certificado por la interventoría: 94 %.
Pagos: 80 % desembolsado; 20 % final pendiente.

Extractos de los informes:
[INF-1, p. 12] Interventoría técnica: Los tokens JWT de acceso no expiran y no existe un mecanismo de revocación. Impacto: Alto. Probabilidad: Media.
[INF-2, p. 31] Rendimiento: La tabla bitacora_auditoria tiene 2,1 millones de filas sin índices; la consulta de auditoría tarda 6,8 s. Impacto: Medio. Probabilidad: Media.
[INF-3, p. 7] Protección de datos: La autorización de tratamiento de datos está implementada; falta publicar el aviso de privacidad en el formulario de inscripción. Impacto: Medio. Probabilidad: Baja.

Regla del semáforo: Bajo o Baja = 1; Medio o Media = 2; Alto o Alta = 3. Puntaje = impacto × probabilidad. De 1 a 2: VERDE; de 3 a 4: ÁMBAR; de 6 a 9: ROJO.
Regla de decisión: si hay al menos un riesgo ROJO, el pago final queda retenido hasta que se subsane; si no, se aprueba con observaciones.
Plazo de subsanación: 10 días hábiles desde la notificación.
"""

Instrucción: En Canvas, redacta el dictamen técnico con:
1. Encabezado con el contrato, el objeto, la fecha de corte, el avance certificado y el estado de los pagos.
2. Síntesis en tres párrafos cortos: cumplimiento general, hallazgos y decisión.
3. Matriz de riesgos con las columnas Hallazgo, Fuente, Impacto, Probabilidad, Puntaje y Semáforo, calculada con la regla de los datos.
4. Decisión y plazo de subsanación según la regla de decisión, con una acción recomendada por hallazgo.

Restricciones:
- Usa solo los hechos de los extractos, cita la fuente de cada uno (por ejemplo [INF-1, p. 12]) y presenta las acciones como recomendaciones.
- Calcula la matriz antes de redactar la síntesis: los colores que mencione la síntesis deben coincidir con la matriz.
- Escribe los porcentajes como texto normal (94 %), sin notación matemática, y no pases de una página (unas 450 palabras).

Formato: Documento formal en español de Colombia, con la matriz en una tabla.
```

* **Cómo verificar el resultado:**
  * [ ] El encabezado dice CT-2026-014, 30 de octubre de 2026, avance del 94 % y pagos: 80 % desembolsado y 20 % pendiente, con el signo % visible. *Cómo comprobarlo:* Lee el encabezado; si ves «94» sin «%», Gemini usó notación matemática y debes pedirle que la quite.
  * [ ] La síntesis menciona los mismos colores que la matriz: 1 ROJO, 1 ÁMBAR y 1 VERDE. *Cómo comprobarlo:* Compara el segundo y el tercer párrafo de la síntesis con la columna Semáforo.
  * [ ] La matriz tiene 3 filas: Tokens JWT sin expiración ni revocación = 3 × 2 = 6 · ROJO; Bitácora de auditoría sin índices = 2 × 2 = 4 · ÁMBAR; Aviso de privacidad (Ley 1581 de 2012) = 2 × 1 = 2 · VERDE. *Cómo comprobarlo:* Recalcula cada puntaje con la regla del semáforo.
  * [ ] Cada hallazgo cita su fuente: [INF-1, p. 12], [INF-2, p. 31], [INF-3, p. 7]. *Cómo comprobarlo:* Busca «INF-» con Ctrl+F; deben aparecer las tres fuentes.
  * [ ] La decisión aplica la regla: El pago final del 20 % queda retenido hasta que se subsane el riesgo ROJO. Plazo de subsanación: 10 días hábiles desde la notificación. *Cómo comprobarlo:* Lee el último párrafo y la sección de decisión.
  * [ ] No aparecen hechos que no estén en los extractos (otras tecnologías, cifras, normas o fechas). *Cómo comprobarlo:* Subraya cada cifra del dictamen y búscala en los datos.
  * [ ] Cabe en una página: unas 450 palabras o menos. *Cómo comprobarlo:* Exporta a Google Docs y revisa el número de páginas.

---

## 4. Asistentes Personalizados a Medida: Gemini Gems (Gem Studio)

Los **Gems** son versiones personalizadas de Google Gemini que combinan instrucciones de sistema persistentes (*System Prompts*), fuentes de conocimiento exclusivas (documentos PDF, guías o reglamentos) y tono calibrado para tareas especializadas.

### Diferencia Operativa: Gemini Canvas vs. Gemini Gems

| Característica | Gemini Canvas | Gemini Gems |
| :--- | :--- | :--- |
| **Enfoque Principal** | Lienzo dinámico para co-crear un artefacto (documento, código, tabla). | Asistente persistente con rol y restricciones predefinidas. |
| **Memoria de Rol** | Dura lo que dura la sesión de trabajo sobre ese artefacto. | Permanente en tu cuenta de Gemini; disponible en cualquier chat. |
| **Modo de Interacción** | Split Screen (Chat a la izquierda + Lienzo interactivo a la derecha). | Chat conversacional asistido con directrices fijas. |
| **Exportación** | Google Docs, Sheets, código fuente o SVG vectorial. | Respuestas guiadas, evaluaciones y asesoría continua. |
| **Combinación Ideal** | Puedes usar un **Gem de Arquitectura** para abrir un **Canvas de código**. | El Gem define la política; el Canvas ejecuta el artefacto. |

### Presets Canónicos para el Aula Técnica:

1. 🎓 **Gem Tutor Socrático:**
   * *System Prompt:* "Actúa como docente socrático de programación. Cuando el estudiante pida código o la solución a un ejercicio, jamás entregues el código resuelto. Formula dos preguntas orientadoras que le permitan analizar el flujo de datos y encontrar su propio error."
2. ⚖️ **Gem Auditor de Rúbricas:**
   * *System Prompt:* "Actúa como evaluador técnico. Coteja el código o evidencia entregada contra los criterios de la rúbrica oficial. Genera una tabla con 3 columnas: Criterio, Nivel de Cumplimiento (1 a 5) y Observación Constructiva."
3. 📋 **Gem Redactor de Actas y Pliegos:**
   * *System Prompt:* "Actúa como secretario técnico institucional. Transforma notas desordenadas en actas formales con numeración decimal, compromisos con fecha límite y tono neutro en español de Colombia."

---

## 5. Flujos Multimodales: De Boceto / Pizarra a Prototipo Web en Canvas

Gemini cuenta con capacidades de visión artificial de última generación. Puedes fotografiar un dibujo hecho en una libreta o en la pizarra del aula y pedirle que lo traduzca a una aplicación web funcional en Canvas:

1. **Captura:** Dibuja la pantalla a mano alzada en una hoja de papel, rotulando los campos (ejemplo: "Nombre", "Correo", "Botón Enviar").
2. **Carga:** Adjunta la imagen al chat de Gemini con el botón de archivo (📷 o 📎).
3. **Prompt Multimodal:**
   > *"Analiza este boceto a mano alzada. En Canvas, genera una aplicación web en HTML, CSS y JavaScript que implemente exactamente la distribución dibujada, aplicando una paleta verde salvia y validaciones en tiempo real."*
4. **Lienzo Activo:** Gemini interpreta la jerarquía visual de tu dibujo y abre el Canvas con el código fuente y el interruptor de previsualización en vivo listo para probar.

---

## 6. Guía de Atajos y Buenas Prácticas en el Aula

1. **Uso de la tecla Tab:** En el editor de código de Canvas, la tecla Tab indentará correctamente tu código sin enviar el mensaje.
2. **Historial de Versiones:** En la esquina superior derecha de Canvas, haz clic en el icono de reloj para retroceder a cualquier versión previa si una modificación no te satisface.
3. **Control de Longitud Reactivo:** Usa el slider superior de Canvas para mover el documento entre versión de síntesis (1 párrafo) y versión extendida (4 páginas).
4. **Seguridad y Cero Secretos:** Recuerda la regla canónica: nunca pegues contraseñas reales, tokens de autenticación institucional ni datos de aprendices protegidos por la Ley 1581 de 2012 en el chat de Gemini. Emplea siempre datos representativos de prueba.

---

## 7. Ejercicios prácticos por modo

Cada modo de Canvas tiene dos ejercicios completos. Las personas, cifras y documentos se prepararon para aprender y no contienen registros reales. Cada prompt sigue la fórmula R-C-I-R-F y trae los datos entre comillas triples, así que basta con copiarlo una vez, activar Canvas en Gemini y pegarlo. Después se itera dentro de Canvas con los pasos indicados.

### 1. Redacción Editorial y Documentos Extensos

#### Ejercicio A: Informe de deserción con tablero interactivo en Canvas

- **Nivel:** Básico · **Duración:** 25 min · **Función de Canvas:** Documento + Selección con cursor + Transformación a tablero web en Canvas
- **Qué vas a lograr:** Convertir una tabla de deserción en un informe ejecutivo claro y, desde el mismo Canvas, transformar el documento en un tablero web interactivo con tarjetas KPI y gráfico de barras para presentar al comité.
- **Situación:** La coordinación académica debe presentar el lunes cómo bajó la deserción durante 2025 y qué acciones funcionaron. Solo tienes la tabla trimestral y la encuesta de salida.

**1. Prompt para pegar en Gemini:**

```text
Actúa como analista de calidad educativa que prepara informes para comités directivos.

Contexto: El comité académico se reúne el lunes para decidir qué acciones contra la deserción mantener en 2026. Leerá el informe en cinco minutos.

Datos:
"""
DATOS DE DESERCIÓN 2025 — Centro de Gestión Empresarial (datos de práctica)

Trimestre,Matriculados,Desertores,Tasa
2025-T1,420,38,9.0%
2025-T2,395,31,7.8%
2025-T3,402,22,5.5%
2025-T4,388,14,3.6%

Causas reportadas en la encuesta de salida (105 desertores):
- Dificultad económica: 41
- Cruce con horario laboral: 27
- Problemas de conectividad: 19
- Salud o situación familiar: 10
- Otras causas: 8

Acciones aplicadas desde el T2:
- Apoyo de sostenimiento para 60 aprendices (desde abril).
- Franja nocturna nueva en dos programas (desde julio).
- Préstamo de 35 portátiles con módem (desde septiembre).
"""

Instrucción: En Canvas, redacta un informe ejecutivo con:
1. Un resumen de máximo cinco líneas con la conclusión principal.
2. Una tabla con la tasa de cada trimestre y su variación en puntos frente al trimestre anterior.
3. Las causas de deserción ordenadas de mayor a menor, con su porcentaje.
4. Tres recomendaciones para 2026, cada una con un responsable sugerido y un indicador.

Restricciones:
- Usa solo estos datos; si una acción no se puede relacionar con certeza con un resultado, dilo.
- No inventes cifras ni nombres de personas.

Formato: Títulos numerados, una tabla y frases cortas en español de Colombia.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.
3. Selecciona la sección de recomendaciones y escribe en el cuadro de edición: «Agrega una meta numérica para 2026 a cada recomendación».
4. Usa «Ajustar longitud → Más corto» y comprueba que la tabla se conserve.
5. Pide en el chat: «En Canvas, transforma este informe en un tablero web interactivo de una página en HTML/CSS/JS con tarjetas KPI y gráfico de barras».
6. Exporta el informe con «Compartir y exportar → Exportar a Documentos de Google».

**3. Verifica tu resultado:**

- [ ] El resumen menciona la caída de 9,0 % a 3,6 % (5,4 puntos).
- [ ] La tabla muestra las cuatro tasas y la variación entre trimestres.
- [ ] La dificultad económica aparece como primera causa (39 % de 105).
- [ ] Cada recomendación tiene responsable, fecha e indicador.
- [ ] El tablero web interactivo muestra la caída de deserción (9,0 % a 3,6 %) y las tres tarjetas de acción.
- [ ] El documento quedó guardado en Google Docs.

**Reto extra:** Pide en el chat: «Crea una página web a partir de este informe con un gráfico de líneas animado y tarjetas para cada acción». Compara la página con la versión en documento.

#### Ejercicio B: Propuesta de proyecto productivo con cuestionario de repaso

- **Nivel:** Intermedio · **Duración:** 30 min · **Función de Canvas:** Exportar a Docs + Generación de evaluación interactiva en Canvas
- **Qué vas a lograr:** Redactar una propuesta formal de proyecto productivo con presupuesto y cronograma, y generar un cuestionario para que el equipo de aprendices domine la propuesta.
- **Situación:** Un equipo quiere financiar una huerta hidropónica con recursos del centro. La propuesta debe convencer al comité y el equipo debe sustentarla sin leer.

**1. Prompt para pegar en Gemini:**

```text
Actúa como formulador de proyectos productivos para convocatorias institucionales.

Contexto: Un equipo de aprendices presentará esta propuesta al comité de proyectos del centro para obtener financiación. El comité decide por viabilidad, costos y valor formativo.

Datos:
"""
PROYECTO PRODUCTIVO: HUERTA HIDROPÓNICA ESCOLAR (datos de práctica)

Equipo: 12 aprendices del programa Producción Agropecuaria Ecológica y 1 instructor líder.
Espacio: terraza de 60 m² con punto de agua y energía.
Duración: 16 semanas.
Meta de producción: 180 kg de lechuga y 40 kg de cilantro por ciclo de 8 semanas.

Presupuesto (COP):
Estructura y canales NFT,3.200.000
Bomba y temporizador,850.000
Semillas y plántulas,420.000
Solución nutritiva 12 meses,960.000
Sensores de pH y conductividad,1.150.000
Capacitación y certificación BPA,1.420.000
TOTAL,8.000.000

Cronograma:
Semanas 1-3: diseño e instalación de la estructura.
Semanas 4-5: siembra y calibración de sensores.
Semanas 6-13: dos ciclos de cultivo con registro diario.
Semanas 14-16: venta en la feria del centro y evaluación.

Indicadores: kg cosechados, costo por kg, % de plántulas perdidas, ingresos por venta.
"""

Instrucción: En Canvas, redacta la propuesta con:
1. El problema, la justificación pedagógica y el objetivo general.
2. Tres objetivos específicos medibles, cada uno ligado a un indicador de los datos.
3. El presupuesto con el porcentaje de cada rubro y el cronograma por fases.
4. El costo por kilogramo si toda la inversión se carga al primer ciclo y los kilos que hay que vender a 9.000 COP para recuperarla.
5. Tres riesgos con su medida de mitigación.

Restricciones:
- Muestra los cálculos paso a paso.
- Montos en pesos colombianos con punto de miles.

Formato: Documento formal con títulos numerados y dos tablas.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.
3. Selecciona el párrafo de justificación y escribe: «Relaciónalo con las competencias del programa de formación».
4. Usa «Cambiar tono → Más formal» para la versión que irá al comité.
5. Pide en el chat: «En Canvas, crea una evaluación interactiva de 5 preguntas de opción múltiple en HTML/JS con retroalimentación inmediata sobre esta propuesta».
6. Exporta la propuesta a Documentos de Google desde «Compartir y exportar».

**3. Verifica tu resultado:**

- [ ] La tabla de presupuesto suma 8.000.000 COP y la estructura NFT pesa 40 %.
- [ ] Los tres objetivos específicos tienen un indicador medible.
- [ ] El cálculo de costo por kilogramo y punto de equilibrio aparece paso a paso.
- [ ] El cronograma cubre las 16 semanas sin huecos.
- [ ] La evaluación web interactiva incluye 5 preguntas con validación inmediata sobre presupuesto, cronograma e indicadores.
- [ ] Existe una copia de la propuesta en Google Docs.

**Reto extra:** Pide: «Agrega un escenario optimista con dos ciclos más y compáralo en una tabla con el escenario base».

### 2. Desarrollo y Prototipado Web en Vivo

#### Ejercicio A: Simulador de presupuesto con sliders y gráfico de dona en vivo

- **Nivel:** Intermedio · **Duración:** 30 min · **Función de Canvas:** Canvas de código + Vista previa ejecutable
- **Qué vas a lograr:** Construir una aplicación web que recalcula en tiempo real un presupuesto, con controles deslizantes, alertas de negocio y un gráfico animado.
- **Situación:** El comité de la feria necesita jugar con la distribución del presupuesto en la reunión, ver el impacto en pesos y detectar de inmediato una distribución riesgosa.

**1. Prompt para pegar en Gemini:**

```text
Actúa como desarrollador frontend que crea herramientas de decisión para equipos no técnicos.

Contexto: El comité de la feria repartirá su presupuesto en una reunión en vivo y quiere ver al instante el efecto de cada cambio.

Datos:
"""
PRESUPUESTO DE LA FERIA DE PROYECTOS (datos de práctica)

Presupuesto total: 12.000.000 COP

Categoría,Porcentaje inicial,Mínimo permitido
Logística y montaje,35,25
Alimentación,25,15
Publicidad,15,5
Premios,15,10
Imprevistos,10,5

Reglas de negocio:
1. La suma de porcentajes siempre debe ser 100.
2. Si una categoría queda por debajo de su mínimo, se muestra una alerta roja con el nombre de la categoría.
3. Si imprevistos baja de 8 %, se muestra una advertencia amarilla: "Riesgo financiero alto".
4. Cada categoría muestra su valor en pesos (porcentaje x 12.000.000).
"""

Instrucción: En Canvas, crea una aplicación web de una sola página que permita:
1. Ajustar el porcentaje de cada categoría con un control deslizante y ver su valor en pesos.
2. Mantener la suma en 100 % repartiendo la diferencia entre las demás categorías.
3. Ver la distribución en un gráfico de dona que se actualice en vivo (Chart.js desde CDN).
4. Recibir las alertas de las reglas de negocio.
5. Restablecer los valores iniciales.

Restricciones:
- Formato de moneda colombiano.
- Diseño responsivo y accesible: contraste AA y controles con etiqueta.

Formato: Un solo archivo HTML con CSS y JavaScript.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.
3. Sube «Logística» a 50 % y observa cómo se redistribuyen las demás categorías.
4. Baja «Imprevistos» a 6 % y comprueba que aparezca la advertencia.
5. Si la vista previa muestra un error, escribe en el chat: «Corrige el error que aparece en la consola».
6. Pide en el chat: «Agrega un botón para descargar la distribución en CSV y un interruptor de modo oscuro».

**3. Verifica tu resultado:**

- [ ] La app abre en la vista previa sin errores.
- [ ] Los valores iniciales en pesos son 4.200.000 / 3.000.000 / 1.800.000 / 1.800.000 / 1.200.000.
- [ ] La suma de porcentajes se mantiene en 100 al mover cualquier control.
- [ ] La dona cambia en vivo con animación.
- [ ] Las alertas roja y amarilla aparecen según las reglas.
- [ ] El CSV descargado contiene las cinco categorías y el modo oscuro funciona.

**Reto extra:** Pide: «Agrega un segundo escenario guardado y un gráfico de barras que compare ambos escenarios lado a lado».

#### Ejercicio B: Tablero Kanban arrastrable con gráfico de avance del sprint

- **Nivel:** Avanzado · **Duración:** 35 min · **Función de Canvas:** Canvas de código + Vista previa + iteración por selección
- **Qué vas a lograr:** Crear un tablero Kanban funcional con arrastrar y soltar, contadores por columna y un gráfico burndown que compara el avance ideal y el real.
- **Situación:** El equipo del sprint 3 quiere ver en una sola pantalla qué tareas faltan y si va atrasado frente a la línea ideal.

**1. Prompt para pegar en Gemini:**

```text
Actúa como desarrollador frontend con experiencia en herramientas ágiles.

Contexto: El equipo del sprint 3 necesita ver en una sola pantalla qué falta y si va atrasado frente al plan.

Datos:
"""
TAREAS DEL SPRINT 3 — APP DE CITAS DEL CENTRO (datos de práctica)

id,titulo,responsable,puntos,estado
T1,Diseñar pantalla de login,Ana,3,Hecho
T2,Conectar API de usuarios,Luis,5,Hecho
T3,Validar formulario de cita,Marta,3,En curso
T4,Calendario de disponibilidad,Jorge,8,En curso
T5,Notificación por correo,Sara,5,Por hacer
T6,Pruebas unitarias del backend,Iván,5,Por hacer
T7,Panel del instructor,Ana,8,Por hacer
T8,Accesibilidad y contraste,Marta,3,Hecho

Sprint de 10 días con 40 puntos.
Puntos pendientes reales por día (corte del día 10): 40,40,37,37,34,34,32,29,29,29
"""

Instrucción: En Canvas, crea un tablero Kanban web que:
1. Muestre las tareas en las columnas Por hacer, En curso y Hecho.
2. Permita mover las tarjetas arrastrándolas y también con el teclado.
3. Sume los puntos de cada columna y muestre el avance del sprint.
4. Incluya un gráfico burndown con la línea ideal y la real (Chart.js desde CDN).
5. Filtre las tarjetas por responsable.

Restricciones:
- Sin frameworks: solo HTML, CSS y JavaScript.
- Cada tarjeta debe poder enfocarse y tener una etiqueta para lectores de pantalla.

Formato: Un solo archivo HTML ejecutable.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.
3. Arrastra la tarea T3 a «Hecho» y observa los contadores y la barra de avance.
4. Filtra por «Ana» y comprueba qué tarjetas quedan.
5. En el código, selecciona la función del gráfico y escribe: «Marca los días en que la línea real supera a la ideal».
6. Pide en el chat: «Guarda el estado del tablero en localStorage» y recarga la vista previa.

**3. Verifica tu resultado:**

- [ ] Al inicio, Hecho suma 11 puntos (T1, T2, T8) y el progreso es 27,5 %.
- [ ] Las tarjetas se mueven con ratón y con teclado.
- [ ] El burndown muestra la línea ideal y la real; la real queda por encima desde el día 2 y cierra con 29 puntos pendientes.
- [ ] El filtro por responsable funciona sin recargar.
- [ ] Los contadores se actualizan al soltar una tarjeta.
- [ ] El estado persiste al recargar la vista previa.

**Reto extra:** Pide: «Agrega una columna Bloqueado con límite WIP de 2 tarjetas y una alerta visual cuando se supere».

### 3. Análisis Estructurado, Matrices y Tablas

#### Ejercicio A: Análisis de ventas anuales con exportación a Sheets y tablero

- **Nivel:** Intermedio · **Duración:** 30 min · **Función de Canvas:** Tabla en Canvas + Exportar a Hojas de cálculo + página web
- **Qué vas a lograr:** Transformar 12 meses de ventas en una matriz con totales, participación y crecimiento, llevarla a Google Sheets y convertirla en un tablero visual.
- **Situación:** La tienda del centro debe decidir qué producto promocionar en 2026 y en qué meses reforzar inventario.

**1. Prompt para pegar en Gemini:**

```text
Actúa como analista comercial de pequeñas unidades productivas.

Contexto: La tienda del centro debe decidir qué producto promocionar en 2026 y en qué meses reforzar el inventario.

Datos:
"""
VENTAS 2025 — TIENDA AGROINDUSTRIAL DEL CENTRO (miles de COP, datos de práctica)

Mes,Cafe,Panela,Queso
Ene,4200,2100,1800
Feb,3900,2000,1750
Mar,4500,2300,1900
Abr,4800,2250,2000
May,5100,2400,2100
Jun,4700,2600,2050
Jul,5300,2500,2200
Ago,5600,2700,2300
Sep,5200,2650,2250
Oct,5800,2900,2400
Nov,6200,3100,2600
Dic,7400,3600,3100
"""

Instrucción: En Canvas, prepara un análisis con:
1. Una tabla con el total de cada mes y su variación porcentual frente al mes anterior.
2. Los totales anuales y la participación de cada producto.
3. El mes pico, el mes más bajo y el producto que más creció de enero a diciembre.
4. Tres recomendaciones de inventario y promoción basadas en esas cifras.

Restricciones:
- Cifras en miles de COP con separador de miles y porcentajes con un decimal.
- Si haces una proyección, declara el supuesto.

Formato: Tabla principal, tabla de resumen y recomendaciones en viñetas.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.
3. Usa «Compartir y exportar → Exportar a Hojas de cálculo» para abrir la tabla en Google Sheets.
4. En Sheets, aplica formato condicional de escala de color a la columna de totales.
5. Vuelve a Gemini y pide: «Crea un tablero web con barras apiladas por mes y tarjetas con los totales anuales».
6. En el tablero, selecciona las tarjetas y escribe: «Agrega la participación anual de cada producto».

**3. Verifica tu resultado:**

- [ ] El total anual es 120.250 (café 62.700, panela 31.100, queso 26.450).
- [ ] El café concentra cerca de 52 % de las ventas.
- [ ] Diciembre aparece como pico y febrero como mes más bajo.
- [ ] Las recomendaciones citan cifras de la tabla.
- [ ] La tabla abre correctamente en Google Sheets.
- [ ] La página web muestra barras apiladas y tarjetas KPI.

**Reto extra:** Pide: «Agrega un filtro por trimestre y una línea de tendencia sobre el total mensual».

#### Ejercicio B: Matriz de riesgos con mapa de calor interactivo

- **Nivel:** Intermedio · **Duración:** 25 min · **Función de Canvas:** Tabla + aplicación web con mapa de calor
- **Qué vas a lograr:** Calcular el nivel de cada riesgo, priorizarlos y visualizarlos en un mapa de calor 5 × 5 donde se pueda consultar cada celda.
- **Situación:** Antes del comité de seguimiento, el líder del proyecto debe mostrar qué riesgos atender primero y con qué plan.

**1. Prompt para pegar en Gemini:**

```text
Actúa como gestor de proyectos de software con experiencia en gestión de riesgos.

Contexto: El líder del proyecto presentará al comité de seguimiento qué riesgos atender primero y cómo hacerlo.

Datos:
"""
RIESGOS DEL PROYECTO "APP DE CITAS DEL CENTRO" (datos de práctica)
Escala: probabilidad 1-5 e impacto 1-5. Nivel = probabilidad x impacto.
Crítico >= 15 | Alto 8-14 | Medio 4-7 | Bajo <= 3

id,riesgo,probabilidad,impacto
R1,Rotación del líder técnico,2,5
R2,Retraso en la entrega de requisitos,4,4
R3,Falla del servidor de pruebas,3,3
R4,Fuga de datos personales,2,5
R5,Cambios de alcance sin control,4,3
R6,Baja adopción por parte de usuarios,3,4
R7,Dependencia de una API externa,3,5
R8,Errores de estimación,5,3
R9,Falta de pruebas automatizadas,4,5
R10,Corte de energía en el centro,2,2
"""

Instrucción: En Canvas, construye la matriz de riesgos:
1. Calcula el nivel de cada riesgo y clasifícalo con los umbrales de los datos.
2. Ordena los riesgos de mayor a menor nivel.
3. Asigna a cada riesgo una respuesta (evitar, mitigar, transferir o aceptar) y una acción concreta.

Restricciones:
- Usa exactamente los umbrales entregados.
- Propón acciones realistas para un equipo de cinco personas.

Formato: Tabla con las columnas id, riesgo, probabilidad, impacto, nivel, clasificación, respuesta y acción.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.
3. Selecciona la columna de acciones y escribe: «Agrega un responsable y una fecha límite a cada acción».
4. Exporta la tabla con «Exportar a Hojas de cálculo» para el seguimiento semanal.
5. Pide en el chat: «Crea una aplicación web con un mapa de calor 5 x 5 de estos riesgos; al hacer clic en una celda, muestra sus riesgos y acciones».
6. En la vista previa, haz clic en la celda de probabilidad 2 e impacto 5.

**3. Verifica tu resultado:**

- [ ] Hay 4 riesgos críticos: R9 (20), R2 (16), R7 (15) y R8 (15).
- [ ] Hay 5 riesgos altos: R5 y R6 (12), R1 y R4 (10) y R3 (9).
- [ ] R10 (4) es el único riesgo medio y ninguno queda en Bajo.
- [ ] El mapa muestra 2 riesgos en la celda probabilidad 2 / impacto 5.
- [ ] Al hacer clic en una celda aparece la lista con acciones.
- [ ] La tabla se exportó a Hojas de cálculo.

**Reto extra:** Pide: «Calcula el riesgo residual suponiendo que cada acción baja un punto la probabilidad y muestra ambos mapas lado a lado».

### 4. Diagramación de Procesos y Flujogramas

#### Ejercicio A: Flujograma de matrícula por carriles con Mermaid

- **Nivel:** Intermedio · **Duración:** 25 min · **Función de Canvas:** Código Mermaid renderizado en vista previa
- **Qué vas a lograr:** Convertir un procedimiento escrito en un diagrama de flujo por carriles, con decisiones y tiempos, que se pueda exportar como imagen.
- **Situación:** Bienestar y coordinación tienen versiones distintas del proceso de matrícula. Un diagrama único evita confusiones.

**1. Prompt para pegar en Gemini:**

```text
Actúa como analista de procesos que documenta con diagramas Mermaid.

Contexto: Bienestar y coordinación académica tienen versiones distintas del proceso de matrícula. Se necesita un diagrama único para proyectarlo en la reunión de alineación.

Datos:
"""
PROCESO DE MATRÍCULA DE APRENDICES (descripción de práctica)

Actores (carriles): Aspirante | Plataforma de inscripción | Bienestar | Coordinación académica

1. El aspirante se registra en la plataforma de inscripción y elige el programa.
2. La plataforma valida que el documento no tenga otra matrícula activa.
   - Si ya tiene matrícula activa: se notifica al aspirante y el proceso termina.
3. El aspirante presenta la prueba de conocimientos.
4. Coordinación académica revisa el puntaje.
   - Puntaje >= 60: pasa a entrevista.
   - Puntaje < 60: queda en lista de espera y recibe un correo.
5. Bienestar realiza la entrevista y verifica documentos.
6. Si faltan documentos, el aspirante tiene 3 días hábiles para cargarlos; si no lo hace, se libera el cupo.
7. Coordinación académica asigna ficha y horario.
8. La plataforma envía el correo de bienvenida y el aspirante pasa a ser aprendiz.

Tiempos promedio: registro 1 día, prueba 2 días, revisión 1 día, entrevista 3 días, asignación 1 día.
"""

Instrucción: En Canvas, crea una página web que muestre el proceso como diagrama de flujo con:
1. Un carril por actor.
2. Rombos para las decisiones y nodos de inicio y fin diferenciados.
3. El camino feliz resaltado.
4. Una tabla con la duración de cada etapa y el tiempo total del camino feliz.

Restricciones:
- Usa Mermaid cargado desde CDN.
- Máximo seis palabras por nodo para que se lea en el proyector.

Formato: Un solo archivo HTML ejecutable.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.
3. Si Mermaid muestra un error, escribe en el chat: «Corrige este error de Mermaid» y pega el mensaje.
4. En el código, selecciona el nodo de la entrevista y escribe: «Agrega una nota con su duración».
5. Pide en el chat: «Agrega un botón para descargar el diagrama en SVG» y prueba la descarga.
6. Pide: «Genera una versión vertical para imprimir en tamaño carta».

**3. Verifica tu resultado:**

- [ ] Hay cuatro carriles con nombre visible.
- [ ] Aparecen tres decisiones: matrícula activa, puntaje ≥ 60 y documentos completos.
- [ ] El camino feliz está resaltado y termina en «Aprendiz matriculado».
- [ ] La tabla muestra un tiempo total de 8 días en el camino feliz.
- [ ] El botón descarga un archivo SVG válido.
- [ ] La versión vertical cabe en una hoja tamaño carta.

**Reto extra:** Pide: «Agrega indicadores de cuello de botella: colorea en ámbar la etapa más lenta».

#### Ejercicio B: Diagrama de secuencia JWT y cronograma Gantt en una sola página

- **Nivel:** Avanzado · **Duración:** 30 min · **Función de Canvas:** Mermaid (sequenceDiagram + gantt) en vista previa
- **Qué vas a lograr:** Documentar el flujo de autenticación con tokens y el plan de implementación en dos diagramas conectados.
- **Situación:** El equipo de desarrollo debe explicar en la revisión técnica cómo funciona el login y cuándo estará listo.

**1. Prompt para pegar en Gemini:**

```text
Actúa como arquitecto de software que documenta flujos de autenticación.

Contexto: El equipo explicará en la revisión técnica cómo funciona el inicio de sesión y cuándo estará listo.

Datos:
"""
INICIO DE SESIÓN CON JWT Y PLAN DEL PROYECTO (datos de práctica)

Participantes: Usuario, App web, API de autenticación, Base de datos, API de citas

Flujo:
1. Usuario escribe correo y contraseña en la App web.
2. App web envía POST /auth/login a la API de autenticación.
3. API consulta el usuario en la Base de datos y compara el hash de la contraseña.
4. Si es inválido: responde 401 y la App muestra "Credenciales incorrectas".
5. Si es válido: firma un access token (15 min) y un refresh token (7 días) y responde 200.
6. App web llama GET /citas a la API de citas con el header Authorization: Bearer <token>.
7. API de citas valida la firma y la expiración; responde 200 con las citas.
8. Si el access token expiró: responde 401, la App llama POST /auth/refresh y repite la petición.

Plan del proyecto (año 2026):
Tarea,Inicio,Duración
Diseño del flujo,2026-11-02,5 días
Endpoint de login,2026-11-09,4 días
Middleware de validación,2026-11-13,3 días
Refresh token,2026-11-18,3 días
Pruebas de seguridad,2026-11-23,4 días
Despliegue,2026-11-27,1 día
"""

Instrucción: En Canvas, crea una página web con dos diagramas Mermaid en pestañas:
1. Secuencia: el inicio de sesión con sus dos caminos de error (credenciales inválidas y token vencido) y la vigencia de cada token.
2. Cronograma: un diagrama de Gantt con las tareas, sus fechas y el despliegue como hito.

Restricciones:
- Los códigos HTTP y las fechas deben coincidir con los datos.
- Las pestañas deben funcionar con teclado.

Formato: Un solo archivo HTML con Mermaid cargado desde CDN.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.
3. Revisa la pestaña de secuencia y ubica los dos caminos de error.
4. En el código, selecciona el bloque gantt y escribe: «Marca como crítica la tarea de pruebas de seguridad».
5. Pide en el chat: «Agrega una pestaña de glosario con JWT, access token, refresh token, firma y código 401, cada uno en una frase».
6. Usa «Compartir» para enviar el enlace al equipo.

**3. Verifica tu resultado:**

- [ ] El diagrama de secuencia muestra los cinco participantes en orden.
- [ ] Existen las ramas 401 por credenciales y 401 por token expirado con refresh.
- [ ] Las notas indican 15 minutos y 7 días.
- [ ] El Gantt muestra seis tareas sin solapamiento y termina el 27/11/2026.
- [ ] Las pestañas funcionan con teclado.
- [ ] El glosario explica los cinco términos en una frase cada uno.

**Reto extra:** Pide: «Agrega un diagrama de estados del token: emitido, vigente, expirado, renovado y revocado».

### 5. Diseño Visual y Mockups de Interfaz (UI)

#### Ejercicio A: Landing de reservas con modo oscuro y ocupación en vivo

- **Nivel:** Intermedio · **Duración:** 30 min · **Función de Canvas:** Canvas de código + Vista previa responsiva
- **Qué vas a lograr:** Diseñar y construir una página de aterrizaje completa, accesible y con modo oscuro, que muestre la ocupación por franja con un gráfico.
- **Situación:** La biblioteca quiere lanzar las reservas en línea la próxima semana y necesita una página atractiva y clara para los aprendices.

**1. Prompt para pegar en Gemini:**

```text
Actúa como diseñador UI/UX que también desarrolla frontend.

Contexto: La biblioteca lanzará la próxima semana las reservas en línea de cubículos. La página debe invitar a reservar y ser fácil de usar desde el celular.

Datos:
"""
LANDING "BIBLIOTURNOS" — RESERVA DE CUBÍCULOS DE ESTUDIO (contenido de práctica)

Marca: BiblioTurnos · Biblioteca del Centro de Formación
Lema: "Tu espacio de estudio, reservado en un minuto"
Colores: verde salvia #2d5a4c, arena #f5efe6, azul acento #2563eb
Tipografía: sistema (sans-serif)

Secciones:
1. Encabezado con logo textual y enlaces: Cómo funciona, Horarios, Preguntas.
2. Héroe con lema, botón "Reservar ahora" y contador de cubículos libres hoy.
3. Tres pasos: Elige franja, Confirma con tu documento, Llega 10 minutos antes.
4. Ocupación de hoy por franja (cupos de 20 por franja):
   08:00-10:00: 12 ocupados
   10:00-12:00: 17 ocupados
   14:00-16:00: 8 ocupados
   16:00-18:00: 19 ocupados
5. Formulario: documento (solo números, 6 a 10 dígitos), franja (lista), aceptar normas.
6. Preguntas frecuentes (3) en acordeón:
   - ¿Cuánto dura la reserva? 2 horas.
   - ¿Puedo cancelar? Sí, hasta 30 minutos antes.
   - ¿Qué pasa si no llego? La reserva se libera a los 15 minutos.
7. Pie con horario: lunes a viernes 8:00-18:00.
"""

Instrucción: En Canvas, construye la landing con el contenido de los datos, incluyendo:
1. Un gráfico de ocupación por franja: verde por debajo de 75 %, ámbar entre 75 % y 89 % y rojo desde 90 %.
2. Un contador de cubículos libres calculado con esos datos.
3. Un formulario con validación en vivo y mensajes que expliquen cómo corregir.
4. Un interruptor de modo oscuro.

Restricciones:
- Contraste WCAG AA, foco visible y uso completo con teclado.
- Responsiva desde 360 px y sin librerías externas.

Formato: Un solo archivo HTML con colores definidos en variables CSS.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.
3. Escribe un documento con letras en el formulario y lee el mensaje de error.
4. Activa el modo oscuro y revisa que el gráfico siga legible.
5. En el código, selecciona la sección principal (héroe) y escribe: «Agrega una ilustración SVG sencilla de un escritorio con libros».
6. Pide en el chat: «Muestra cómo se ve a 390 px y corrige lo que no quepa».

**3. Verifica tu resultado:**

- [ ] La franja 16:00-18:00 aparece en rojo (95 %) y 10:00-12:00 en ámbar (85 %).
- [ ] El contador del héroe muestra 24 cubículos libres.
- [ ] El formulario rechaza documentos fuera de 6 a 10 dígitos con mensaje claro.
- [ ] El formulario válido muestra una confirmación con la franja elegida.
- [ ] El modo oscuro cambia todos los colores sin perder contraste.
- [ ] El acordeón abre y cierra con teclado.

**Reto extra:** Pide: «Agrega una vista de calendario semanal con la ocupación de cada día como mapa de calor».

#### Ejercicio B: Prototipo móvil navegable de reporte de incidencias

- **Nivel:** Avanzado · **Duración:** 35 min · **Función de Canvas:** Canvas de código + prototipo multipantalla
- **Qué vas a lograr:** Construir un prototipo móvil con cuatro pantallas navegables, estados visuales y un panel de estadísticas calculado con los datos de ejemplo.
- **Situación:** Mantenimiento quiere validar con aprendices una app para reportar daños antes de contratar el desarrollo.

**1. Prompt para pegar en Gemini:**

```text
Actúa como diseñador de producto móvil.

Contexto: Mantenimiento quiere validar la idea con aprendices antes de contratar el desarrollo, así que necesita un prototipo que se sienta real.

Datos:
"""
APP MÓVIL "REPORTA YA" — INCIDENCIAS DE INFRAESTRUCTURA (contenido de práctica)

Pantallas:
1. Inicio: saludo, botón grande "Reportar incidencia" y lista de mis reportes.
2. Nuevo reporte: tipo (Eléctrico, Agua, Mobiliario, Red), ubicación (bloque y salón), descripción, foto (simulada), prioridad (Baja, Media, Alta).
3. Detalle: estado con línea de tiempo (Recibido, Asignado, En reparación, Resuelto).
4. Estadísticas: gráfico de dona por tipo y tiempo promedio de solución.

Reportes de ejemplo:
id,tipo,ubicación,prioridad,estado,horas_solución
INC-01,Eléctrico,Bloque A-201,Alta,Resuelto,6
INC-02,Red,Bloque C-105,Media,En reparación,
INC-03,Agua,Baños bloque B,Alta,Resuelto,4
INC-04,Mobiliario,Biblioteca,Baja,Asignado,
INC-05,Red,Sala de sistemas 3,Alta,Resuelto,9
INC-06,Eléctrico,Auditorio,Media,Recibido,
"""

Instrucción: En Canvas, crea un prototipo web con apariencia de teléfono que:
1. Implemente las cuatro pantallas con una barra de navegación inferior.
2. Cargue los reportes de ejemplo con un indicador de estado legible.
3. Permita crear un reporte nuevo que aparezca de inmediato en Inicio.
4. Calcule en Estadísticas la distribución por tipo y el tiempo promedio de solución.

Restricciones:
- Botones de al menos 44 px de alto y texto de al menos 16 px.
- El estado se comunica con texto, no solo con color.

Formato: Un solo archivo HTML ejecutable, sin frameworks.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.
3. Navega por las cuatro pantallas con la barra inferior.
4. Crea un reporte de tipo Agua en «Bloque D-110» con prioridad Alta y búscalo en Inicio.
5. En el código, selecciona la línea de tiempo del detalle y escribe: «Agrega la fecha y hora de cada cambio de estado».
6. Pide en el chat: «Agrega un filtro por prioridad en Inicio».

**3. Verifica tu resultado:**

- [ ] Las cuatro pantallas navegan sin recargar.
- [ ] Inicio muestra los seis reportes con chip de estado legible.
- [ ] El nuevo reporte aparece con estado Recibido.
- [ ] La dona muestra 2 Eléctrico, 2 Red, 1 Agua y 1 Mobiliario (antes de crear reportes nuevos).
- [ ] El promedio de solución es (6 + 4 + 9) / 3 = 6,3 horas.
- [ ] Los botones cumplen el tamaño mínimo táctil.

**Reto extra:** Pide: «Agrega un filtro por prioridad y una insignia con el número de reportes de prioridad Alta abiertos».

### 6. Edición Quirúrgica por Selección (Inline)

#### Ejercicio A: Correo a acudientes: corregir tono párrafo por párrafo

- **Nivel:** Básico · **Duración:** 20 min · **Función de Canvas:** Selección de texto + ventanita de edición + Cambiar tono
- **Qué vas a lograr:** Practicar la edición quirúrgica: corregir solo los fragmentos problemáticos de un correo sin que Canvas reescriba el resto.
- **Situación:** La coordinación redactó un correo con tono amenazante. Debe salir hoy, pero los datos de fecha, hora y lugar no pueden cambiar.

**1. Prompt para pegar en Gemini:**

```text
Actúa como editor de comunicaciones institucionales.

Contexto: Voy a practicar la edición por selección en Canvas con un correo que tiene problemas de tono. Necesito el texto original intacto para corregirlo fragmento por fragmento.

Datos:
"""
ASUNTO: Reunión obligatoria de acudientes

Señores acudientes:

Les informamos que el rendimiento del grupo es muy malo y que varios aprendices no están cumpliendo con nada. Si no asisten a la reunión, no nos hacemos responsables de lo que pase con la matrícula.

La reunión será el jueves 6 de noviembre de 2026 a las 6:00 p. m. en el auditorio principal. También se puede asistir por videollamada con el enlace que se enviará el miércoles.

Los temas son: resultados del trimestre, inasistencias, plan de mejoramiento, uso del celular en clase, salida pedagógica de diciembre.

Es obligatorio confirmar. El que no confirme se entiende que no le interesa.

Atentamente,
Coordinación académica
"""

Instrucción: Copia el correo en Canvas sin cambiar ninguna palabra. Luego, en el chat:
1. Señala los tres fragmentos con más problemas de tono y explica cada uno en una línea, sin reescribirlos.

Restricciones:
- No cambies ninguna palabra del documento en este paso.

Formato: Documento en Canvas y una lista breve en el chat.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Selecciona solo el párrafo que empieza «Les informamos…» y escribe: «Reescríbelo con tono empático y propositivo, sin culpar a nadie».
3. Selecciona la lista de temas y escribe: «Conviértela en viñetas ordenadas por prioridad».
4. Selecciona la línea «Es obligatorio confirmar…» y escribe: «Pide la confirmación con amabilidad y fija como plazo el miércoles 5 de noviembre».
5. Usa «Ajustar longitud → Más corto» y observa qué cambia.
6. Compara con el original: la fecha, la hora y el lugar deben seguir iguales.

**3. Verifica tu resultado:**

- [ ] Solo cambiaron los fragmentos seleccionados.
- [ ] El párrafo inicial ya no contiene juicios como «muy malo» ni amenazas.
- [ ] Los temas aparecen como lista con viñetas.
- [ ] La solicitud de confirmación es amable e incluye el miércoles 5 de noviembre.
- [ ] Fecha (jueves 6 de noviembre de 2026), hora (6:00 p. m.) y lugar quedaron intactos.
- [ ] El correo final se lee en menos de un minuto.

**Reto extra:** Selecciona el correo completo y pide: «Crea una versión corta para WhatsApp de máximo 400 caracteres».

#### Ejercicio B: Depurar una app seleccionando solo la función con error

- **Nivel:** Intermedio · **Duración:** 25 min · **Función de Canvas:** Canvas de código + selección de función + Vista previa
- **Qué vas a lograr:** Corregir tres errores de una calculadora de promedios seleccionando cada función por separado y comprobando el resultado en la vista previa.
- **Situación:** Un aprendiz entregó una calculadora que muestra «NaN». Debes corregirla sin reescribir toda la aplicación.

**1. Prompt para pegar en Gemini:**

```text
Actúa como instructor de programación que enseña a depurar.

Contexto: Un aprendiz entregó una calculadora de promedios que muestra «NaN». Quiero practicar la corrección función por función usando la selección de Canvas.

Datos:
"""
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Calculadora de promedio</title></head>
<body>
  <h1>Calculadora de promedio</h1>
  <label for="notas">Notas separadas por coma</label>
  <input id="notas" value="3.8,4.5,4.0">
  <button id="calcular">Calcular</button>
  <p id="resultado"></p>
  <script>
    function leerNotas(texto) {
      return texto.split(",");
    }

    function calcularPromedio(notas) {
      let suma = 0;
      for (let i = 0; i <= notas.length; i++) {
        suma += notas[i];
      }
      return suma / notas.length;
    }

    function estado(promedio) {
      if (promedio > 3.5) return "Aprobado";
      return "Plan de mejoramiento";
    }

    document.getElementById("calcular").addEventListener("click", function () {
      const notas = leerNotas(document.getElementById("notas").value);
      const promedio = calcularPromedio(notas);
      document.getElementById("resultado").textContent =
        "Promedio: " + promedio + " - " + estado(promedio);
    });
  </script>
</body>
</html>

Casos de prueba esperados:
"3.8,4.5,4.0" -> Promedio 4.1 - Aprobado
"3.5,3.5"     -> Promedio 3.5 - Aprobado
"2.0,3.0,4.0" -> Promedio 3.0 - Plan de mejoramiento
"""

Instrucción: Copia el código en Canvas sin cambiar ninguna línea. Luego, en el chat:
1. Describe en tres viñetas los síntomas que veré en la vista previa, sin revelar la solución.

Restricciones:
- No modifiques el código en este paso.

Formato: Código HTML ejecutable en Canvas y viñetas en el chat.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Abre la «Vista previa», presiona «Calcular» y observa el resultado.
3. Selecciona solo la función calcularPromedio y escribe: «Corrige el error del ciclo sin tocar nada más».
4. Selecciona solo leerNotas y escribe: «Convierte cada nota a número y descarta los valores vacíos».
5. Selecciona solo estado y escribe: «Un promedio de 3.5 debe quedar Aprobado».
6. Prueba en la vista previa los tres casos de prueba de los datos.

**3. Verifica tu resultado:**

- [ ] El ciclo usa i < notas.length.
- [ ] leerNotas devuelve números (Number o parseFloat) y filtra vacíos.
- [ ] estado usa promedio >= 3.5.
- [ ] Los tres casos dan ≈ 4.1, 3.5 y 3.0 con el estado correcto (si ves 4.1000000000000005, resuélvelo con el reto extra).
- [ ] Las líneas que no seleccionaste quedaron iguales.
- [ ] El gráfico muestra cada nota y la línea de aprobación.

**Reto extra:** Pide: «Muestra el promedio con un decimal usando toFixed y agrega validación para notas fuera de 1.0 a 5.0».

### 7. Auditoría, Explicación y Refactorización de Algoritmos

#### Ejercicio A: De O(n²) a O(n): refactorizar y visualizar la diferencia

- **Nivel:** Intermedio · **Duración:** 30 min · **Función de Canvas:** Canvas de código Python + página HTML con gráfico
- **Qué vas a lograr:** Refactorizar una búsqueda de duplicados cuadrática a lineal, explicarla y demostrar la mejora con un gráfico interactivo.
- **Situación:** El script que detecta documentos duplicados en la base de aprendices tarda demasiado. Hay que justificar el cambio ante el equipo.

**1. Prompt para pegar en Gemini:**

```text
Actúa como ingeniero de software que enseña complejidad algorítmica.

Contexto: Esta función detecta documentos duplicados, pero con la base real de 10.000 registros tarda varios segundos. Necesito una versión eficiente y entender por qué lo es.

Datos:
"""
def documentos_duplicados(documentos):
    duplicados = []
    for i in range(len(documentos)):
        for j in range(i + 1, len(documentos)):
            if documentos[i] == documentos[j] and documentos[i] not in duplicados:
                duplicados.append(documentos[i])
    return duplicados


muestra = ["1001", "1002", "1003", "1002", "1004", "1001", "1005", "1002"]
print(documentos_duplicados(muestra))  # Salida esperada: ['1001', '1002']
"""

Instrucción: En Canvas, entrega:
1. Una versión en Python con complejidad O(n) que conserve el orden de primera aparición.
2. Tres pruebas con assert: la muestra, una lista vacía y una lista sin duplicados.
3. Una explicación breve de por qué la versión original es O(n²) y la nueva O(n).

Restricciones:
- Solo biblioteca estándar de Python.
- Explica para un aprendiz de primer trimestre, sin fórmulas innecesarias.

Formato: Código Python con docstring, anotaciones de tipo y comentarios breves.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.
3. Selecciona el bloque de pruebas y escribe: «Agrega una medición de tiempo con 10.000 elementos usando time.perf_counter».
4. Pide en el chat: «Crea una página web con un gráfico de operaciones contra n para ambas versiones, con escala logarítmica y un control para elegir n».
5. Abre la «Vista previa», mueve el control hasta 10.000 y activa la escala logarítmica.
6. Explica con tus palabras por qué las curvas se separan tanto.

**3. Verifica tu resultado:**

- [ ] La función refactorizada devuelve ['1001', '1002'] con la muestra.
- [ ] La lista vacía y la lista sin duplicados devuelven [].
- [ ] Para n = 10.000, la versión original hace 49.995.000 comparaciones y la nueva cerca de 10.000.
- [ ] El gráfico muestra ambas curvas y la escala logarítmica funciona.
- [ ] El control de n actualiza el número de comparaciones al instante.
- [ ] La explicación es comprensible sin conocimientos previos de notación O.

**Reto extra:** Pide: «Agrega una tercera versión con collections.Counter y compárala en la misma tabla».

#### Ejercicio B: Visualizador animado: burbuja contra merge sort

- **Nivel:** Avanzado · **Duración:** 35 min · **Función de Canvas:** Canvas de código + animación en vista previa
- **Qué vas a lograr:** Crear un visualizador que ejecuta dos algoritmos de ordenamiento lado a lado, con contadores en vivo, para comprender su eficiencia.
- **Situación:** En la clase de algoritmia, los aprendices entienden mejor viendo las comparaciones que leyendo pseudocódigo.

**1. Prompt para pegar en Gemini:**

```text
Actúa como desarrollador de material educativo interactivo para algoritmia.

Contexto: Los aprendices entienden mejor un algoritmo cuando ven cada comparación. Quiero comparar burbuja y merge sort con el mismo arreglo.

Datos:
"""
ARREGLO DE PRUEBA (16 valores):
[38, 27, 43, 3, 9, 82, 10, 55, 21, 64, 17, 49, 70, 5, 33, 91]

Resultado ordenado esperado:
[3, 5, 9, 10, 17, 21, 27, 33, 38, 43, 49, 55, 64, 70, 82, 91]

Algoritmos a comparar:
1. Burbuja, sin parada temprana.
2. Merge sort.

Colores sugeridos:
- Barra normal: gris pizarra
- Barras comparándose: ámbar
- Barras ya ordenadas: verde salvia
"""

Instrucción: En Canvas, crea un visualizador web que:
1. Muestre los dos algoritmos lado a lado, con barras proporcionales a los valores.
2. Permita iniciar, pausar, avanzar paso a paso y reiniciar, con control de velocidad.
3. Cuente las comparaciones de cada algoritmo en vivo.
4. Use los colores sugeridos para el estado de cada barra.
5. Al terminar, indique cuántas veces más comparaciones hizo burbuja.

Restricciones:
- Implementa los algoritmos como generadores de JavaScript.
- Anuncia los contadores con aria-live y no uses librerías externas.

Formato: Un solo archivo HTML ejecutable.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Cuando termine, abre la «Vista previa» del Canvas para usar la aplicación.
3. Presiona «Iniciar» con velocidad media y espera a que ambos terminen.
4. Reinicia y usa «Paso a paso» en merge sort; explica en voz alta qué mezcla en cada paso.
5. En el código, selecciona la función de burbuja y escribe: «Agrega parada temprana y muestra cuántas comparaciones ahorra».
6. Pide en el chat: «Agrega un botón que genere un arreglo aleatorio de 16 valores».

**3. Verifica tu resultado:**

- [ ] Ambos paneles terminan con el arreglo ordenado esperado.
- [ ] Burbuja registra 120 comparaciones sin parada temprana.
- [ ] Merge sort registra 64 comparaciones o menos.
- [ ] Los colores cambian según el estado de cada barra.
- [ ] Pausa, paso a paso y reinicio funcionan.
- [ ] El botón de arreglo aleatorio genera una nueva ejecución que termina ordenada.

**Reto extra:** Pide: «Agrega un modo carrera con 100 barras y un gráfico final de comparaciones por algoritmo».

### 8. Guías Didácticas y Rúbricas Analíticas de Evaluación

#### Ejercicio A: Rúbrica analítica con calculadora de nota y gráfico radar

- **Nivel:** Intermedio · **Duración:** 30 min · **Función de Canvas:** Tabla de rúbrica + aplicación web + Exportar a Hojas de cálculo
- **Qué vas a lograr:** Redactar una rúbrica con descriptores observables y convertirla en una calculadora que muestre la nota y el perfil del aprendiz en un radar.
- **Situación:** Tres instructores califican el mismo proyecto y obtienen notas distintas. Una rúbrica precisa y una calculadora común reducen la diferencia.

**1. Prompt para pegar en Gemini:**

```text
Actúa como especialista en evaluación por competencias en formación técnica.

Contexto: Tres instructores califican el mismo proyecto y obtienen notas distintas. Necesitamos una rúbrica que cualquiera aplique de la misma forma.

Datos:
"""
RÚBRICA DE PROYECTO: API REST DE GESTIÓN DE CITAS (datos de práctica)

Criterios y pesos:
1. Diseño de endpoints y recursos: 30 %
2. Validación de datos y manejo de errores: 25 %
3. Documentación OpenAPI: 20 %
4. Pruebas automatizadas: 25 %

Niveles y puntaje (se admiten valores intermedios):
Excelente = 5 | Bueno = 4 | Aceptable = 3 | Insuficiente = 1

Regla de resultado:
Nota final = suma(puntaje x peso). Aprobado si la nota final >= 3,5.
Si algún criterio queda por debajo de 3, se exige plan de mejoramiento aunque la nota apruebe.

Evaluación del aprendiz 1:
Diseño 4, Validación 3, Documentación 5, Pruebas 2
"""

Instrucción: En Canvas, construye:
1. La rúbrica de 4 criterios por 4 niveles, con un descriptor observable en cada celda.
2. El cálculo paso a paso de la nota del aprendiz 1 y su resultado según la regla.
3. Una retroalimentación de tres líneas para el aprendiz 1, centrada en su criterio más bajo.

Restricciones:
- Cada descriptor nombra una evidencia verificable en el código o la entrega; evita adjetivos como «bueno» o «adecuado».
- Tono respetuoso y orientado a la mejora.

Formato: Tabla de rúbrica, seguida del cálculo y la retroalimentación.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.
3. Selecciona una celda que te parezca ambigua y escribe: «Hazla verificable con una evidencia concreta».
4. Exporta la rúbrica con «Exportar a Hojas de cálculo».
5. Pide en el chat: «Crea una calculadora web: elijo el nivel de cada criterio, veo la nota en vivo y un radar del perfil frente al nivel esperado de 4».
6. En la vista previa, carga los valores del aprendiz 1 y luego sube Pruebas a 4.

**3. Verifica tu resultado:**

- [ ] La rúbrica tiene 16 descriptores observables.
- [ ] La nota del aprendiz 1 es 3,45 y el resultado es «Plan de mejoramiento».
- [ ] Con Pruebas en 4, la nota sube a 3,95 y el resultado pasa a «Aprobado».
- [ ] El radar muestra el perfil del aprendiz y la serie esperada.
- [ ] La retroalimentación del aprendiz 1 se enfoca en Pruebas, su criterio más bajo.
- [ ] La rúbrica quedó en Google Sheets.

**Reto extra:** Pide: «Permite registrar 5 aprendices y muestra un radar promedio del grupo con el criterio más débil resaltado».

#### Ejercicio B: Guía didáctica de Git con cuestionario autocalificable

- **Nivel:** Básico · **Duración:** 30 min · **Función de Canvas:** Documento + Cuestionario web interactivo en Canvas
- **Qué vas a lograr:** Producir una guía didáctica estructurada por momentos y un cuestionario interactivo con retroalimentación inmediata.
- **Situación:** Mañana inicia la competencia de control de versiones y el instructor necesita guía, actividad práctica y evaluación diagnóstica.

**1. Prompt para pegar en Gemini:**

```text
Actúa como diseñador instruccional para formación en desarrollo de software.

Contexto: Mañana inicia la competencia de control de versiones con 25 aprendices de primer trimestre que nunca han usado Git.

Datos:
"""
GUÍA DIDÁCTICA: FUNDAMENTOS DE GIT (contenido de práctica)

Resultado de aprendizaje: Versionar el código fuente de un proyecto con Git aplicando un flujo de ramas básico.
Duración: 4 horas. Grupo: 25 aprendices de primer trimestre.

Conceptos clave:
1. Repositorio: carpeta cuyo historial controla Git.
2. git init: crea un repositorio nuevo.
3. git add: agrega cambios al área de preparación (staging).
4. git commit -m: guarda una instantánea con un mensaje.
5. git status: muestra el estado de los archivos.
6. git log --oneline: lista el historial resumido.
7. Rama (branch): línea de trabajo independiente.
8. git switch -c: crea una rama y cambia a ella.
9. git merge: integra una rama en la actual.
10. Conflicto: dos cambios en la misma línea que Git no puede unir solo.

Producto esperado: repositorio con 5 commits, una rama "feature/login" integrada y un conflicto resuelto.
"""

Instrucción: En Canvas, redacta la guía didáctica con:
1. Los cinco momentos de la sesión con su duración: reflexión inicial, contextualización, apropiación, transferencia y evaluación.
2. Una práctica paso a paso que lleve al producto esperado, incluido un conflicto y su resolución.
3. Una tabla de errores frecuentes con su causa y su solución.
4. Una lista de chequeo de la evidencia.

Restricciones:
- Usa comandos reales y vigentes de Git (git switch en lugar de git checkout).
- Explica cada término técnico la primera vez que aparezca.

Formato: Guía con un título por momento y la práctica en bloques de comandos.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.
3. Selecciona la práctica y escribe: «Agrega la salida esperada de la terminal después de cada comando».
4. Selecciona la sección de errores frecuentes y escribe: «Agrega un ejemplo de mensaje de error real de la terminal a cada fila».
5. Pide en el chat: «Crea un cuestionario web de 10 preguntas con retroalimentación inmediata, puntaje en un gráfico de dona y opción de reiniciar con las preguntas mezcladas».
6. Responde el cuestionario web con dos errores a propósito y revisa el puntaje.
7. Exporta la guía a Documentos de Google.

**3. Verifica tu resultado:**

- [ ] Los cinco momentos suman 240 minutos.
- [ ] La práctica produce 5 commits, la rama feature/login y un conflicto resuelto.
- [ ] La tabla de errores tiene al menos 4 filas con causa y solución.
- [ ] El cuestionario tiene 10 preguntas con retroalimentación.
- [ ] Con dos errores, el puntaje es 8/10 y la dona lo refleja.
- [ ] El botón reiniciar mezcla las preguntas.

**Reto extra:** Pide: «Agrega un simulador visual de ramas que dibuje los commits como círculos conectados al ejecutar comandos escritos».

### 9. Consultas SQL Complejas, ETL y Modelado Relacional

#### Ejercicio A: Consultas SQL de biblioteca ejecutadas en el navegador con tablero

- **Nivel:** Avanzado · **Duración:** 35 min · **Función de Canvas:** Canvas de código SQL + página HTML con sql.js y gráficos
- **Qué vas a lograr:** Escribir consultas con JOIN, agregaciones y funciones de ventana, y ejecutarlas en el navegador para alimentar un tablero visual.
- **Situación:** La biblioteca necesita saber qué libros rotan más, quién tiene préstamos vencidos y qué programa usa más el servicio.

**1. Prompt para pegar en Gemini:**

```text
Actúa como ingeniero de datos que enseña SQL.

Contexto: La biblioteca necesita saber qué libros rotan más, quién tiene préstamos vencidos y qué programa usa más el servicio. La fecha de corte es el 30 de octubre de 2026.

Datos:
"""
-- BASE DE DATOS DE PRÉSTAMOS DE BIBLIOTECA (datos de práctica, PostgreSQL)
CREATE TABLE usuarios (id INT PRIMARY KEY, nombre VARCHAR(60), programa VARCHAR(40));
CREATE TABLE libros (id INT PRIMARY KEY, titulo VARCHAR(80), categoria VARCHAR(40));
CREATE TABLE prestamos (
  id INT PRIMARY KEY,
  libro_id INT REFERENCES libros(id),
  usuario_id INT REFERENCES usuarios(id),
  fecha_prestamo DATE NOT NULL,
  fecha_limite DATE NOT NULL,
  fecha_devolucion DATE
);

INSERT INTO usuarios VALUES
(1,'Ana Torres','ADSO'),(2,'Luis Pérez','ADSO'),(3,'Marta Gil','Contabilidad'),
(4,'Jorge Ríos','Contabilidad'),(5,'Sara Mejía','Multimedia'),(6,'Iván Cruz','Multimedia');

INSERT INTO libros VALUES
(1,'Código limpio','Programación'),(2,'Bases de datos relacionales','Programación'),
(3,'Contabilidad básica','Finanzas'),(4,'Diseño de experiencia de usuario','Diseño'),
(5,'Python para todos','Programación');

INSERT INTO prestamos VALUES
(1,1,1,'2026-09-01','2026-09-15','2026-09-08'),
(2,1,2,'2026-09-10','2026-09-24','2026-09-20'),
(3,1,5,'2026-10-01','2026-10-15',NULL),
(4,2,1,'2026-09-03','2026-09-17','2026-09-12'),
(5,2,2,'2026-10-05','2026-10-19',NULL),
(6,3,3,'2026-09-02','2026-09-16','2026-09-30'),
(7,3,4,'2026-10-02','2026-10-16','2026-10-10'),
(8,4,5,'2026-09-15','2026-09-29','2026-09-25'),
(9,4,6,'2026-10-08','2026-10-22',NULL),
(10,5,1,'2026-10-12','2026-10-26','2026-10-20'),
(11,5,2,'2026-10-14','2026-10-28',NULL),
(12,1,6,'2026-10-16','2026-10-30','2026-10-24');
"""

Instrucción: En Canvas, escribe consultas PostgreSQL que respondan:
1. ¿Qué libros se prestan más? Usa RANK().
2. ¿Qué préstamos están vencidos y con cuántos días de atraso?
3. ¿Cuántos préstamos tiene cada programa?
4. ¿Cuál es el promedio de días de préstamo de los libros devueltos, en general y por programa?
5. ¿Qué préstamos se devolvieron después de la fecha límite?

Restricciones:
- Antes de cada consulta, escribe un comentario con la pregunta de negocio.
- Usa JOIN explícitos y alias legibles.

Formato: Un script .sql comentado.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.
3. Selecciona la consulta de vencidos y escribe: «Agrega el nombre del usuario y ordena por días de atraso».
4. Pide en el chat: «Crea una página web que cargue sql.js desde CDN, cree esta base adaptada a SQLite, ejecute las consultas y muestre tarjetas, un gráfico por programa y un área para probar consultas propias».
5. Abre la «Vista previa» y ejecuta en el área de consultas: SELECT COUNT(*) FROM prestamos;
6. Si la página no carga, escribe: «Corrige la carga de sql.js» y pega el error.

**3. Verifica tu resultado:**

- [ ] El ranking pone «Código limpio» en 1 (4 préstamos) y los otros cuatro libros empatan en 2 (2 préstamos).
- [ ] Hay 4 préstamos vencidos con 15, 11, 8 y 2 días de atraso.
- [ ] Por programa: ADSO 6, Multimedia 4 y Contabilidad 2.
- [ ] El promedio general de días de los devueltos es 11,0.
- [ ] Solo el préstamo 6 se devolvió con retraso (14 días).
- [ ] El tablero ejecuta consultas propias y muestra el resultado en tabla.

**Reto extra:** Pide: «Agrega una vista materializada de indicadores mensuales y un gráfico de líneas de préstamos por semana».

#### Ejercicio B: Pipeline de limpieza de asistencia con diagrama entidad-relación

- **Nivel:** Avanzado · **Duración:** 35 min · **Función de Canvas:** Canvas de código SQL + Mermaid erDiagram + tablero de calidad
- **Qué vas a lograr:** Diseñar un pipeline ETL que limpia un archivo con errores reales, documentarlo con un diagrama entidad-relación y medir la calidad antes y después.
- **Situación:** El reporte de asistencia llega de varias sedes con formatos distintos y la coordinación no confía en los porcentajes.

**1. Prompt para pegar en Gemini:**

```text
Actúa como ingeniero de datos especializado en calidad de datos.

Contexto: El reporte de asistencia llega de varias sedes con formatos distintos y la coordinación no confía en los porcentajes.

Datos:
"""
ARCHIVO asistencia_cruda.csv (14 filas, datos de práctica con errores a propósito)
documento,nombre,fecha,estado
1001, ana torres ,2026-10-01,P
1001,Ana Torres,01/10/2026,presente
1002,LUIS PÉREZ,2026-10-01,A
1003,marta gil,2026/10/01,Presente
1004,Jorge Ríos,2026-10-01,
1005,Sara Mejía,2026-10-01,tarde
1001,Ana Torres,2026-10-02,P
1002,Luis Pérez,02-10-2026,P
1003,Marta Gil,2026-10-02,ausente
1004,jorge rios,2026-10-02,P
1005,Sara Mejía,2026-10-02,P
,Sin Documento,2026-10-02,P
1006,Iván Cruz,2026-13-02,P
1003,Marta Gil,2026-10-02,A

TABLA MAESTRA aprendices (nombres oficiales):
1001,Ana Torres | 1002,Luis Pérez | 1003,Marta Gil | 1004,Jorge Ríos | 1005,Sara Mejía | 1006,Iván Cruz

REGLAS DE LIMPIEZA:
1. Fechas válidas en formatos AAAA-MM-DD, AAAA/MM/DD, DD/MM/AAAA y DD-MM-AAAA; una fecha imposible se descarta.
2. Filas sin documento se descartan.
3. El nombre se toma de la tabla maestra.
4. Estados: P, presente, Presente -> Presente | A, ausente -> Ausente | tarde -> Tarde | vacío -> Sin registro.
5. Un mismo documento y fecha cuenta una sola vez (se conserva la primera fila).
"""

Instrucción: En Canvas, escribe en PostgreSQL un pipeline de limpieza por etapas:
1. Carga del archivo crudo en una tabla de staging con todas las columnas como texto.
2. Limpieza según las reglas: fechas, nombres desde la tabla maestra y estados.
3. Deduplicación por documento y fecha con ROW_NUMBER().
4. Tabla final de asistencia y tabla de rechazos con su motivo.
5. Porcentaje de asistencia: Presente más Tarde sobre el total limpio.

Restricciones:
- Cada etapa debe poder ejecutarse de nuevo sin duplicar datos.
- Un comentario por cada regla aplicada.

Formato: Script .sql dividido por etapas.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.
3. Selecciona la consulta que normaliza fechas y escribe: «Agrega una prueba por cada formato admitido».
4. Pide en el chat: «Crea una página web con el diagrama entidad-relación en Mermaid y un tablero de calidad: filas crudas, limpias, rechazadas por motivo y una dona de estados».
5. Abre la «Vista previa» y compara el tablero con tus resultados.
6. Pide: «Convierte el pipeline en una función almacenada que reciba la fecha de carga».

**3. Verifica tu resultado:**

- [ ] De 14 filas crudas quedan 10 limpias y 4 rechazadas.
- [ ] Rechazos: 2 duplicados, 1 sin documento y 1 fecha imposible (2026-13-02).
- [ ] Los estados limpios son: 6 Presente, 2 Ausente, 1 Tarde y 1 Sin registro.
- [ ] La asistencia (Presente + Tarde) es 70 %.
- [ ] Los nombres finales coinciden con la tabla maestra.
- [ ] El diagrama entidad-relación muestra las tres tablas y sus relaciones.

**Reto extra:** Pide: «Agrega una regla para detectar aprendices con dos ausencias seguidas y muéstralos en una alerta del tablero».

### 10. Informes Ejecutivos Multifuente y Dictamen Técnico

#### Ejercicio A: Informe ejecutivo de mesa de ayuda con tablero web interactivo y exportación a Docs

- **Nivel:** Intermedio · **Duración:** 30 min · **Función de Canvas:** Documento + Selección con cursor + Tablero interactivo en Canvas + Exportación
- **Qué vas a lograr:** Convertir seis meses de indicadores en un informe ejecutivo con conclusiones causales y transformarlo en un tablero web interactivo con exportación formal a Google Docs.
- **Situación:** La dirección quiere saber si las inversiones de agosto y septiembre mejoraron el servicio y necesita compartirlo con todo el personal.

**1. Prompt para pegar en Gemini:**

```text
Actúa como auditor de servicios TI que informa a la alta dirección.

Contexto: La dirección quiere saber si el portal de autoservicio y el segundo técnico mejoraron el servicio, y compartirá el resultado con todo el personal.

Datos:
"""
MESA DE AYUDA TIC — MAYO A OCTUBRE DE 2026 (datos de práctica)

Mes,Abiertos,Resueltos,Tiempo_promedio_horas,Satisfaccion_1a5
May,120,110,18,4.1
Jun,135,128,16,4.2
Jul,160,140,22,3.8
Ago,150,149,14,4.4
Sep,142,140,12,4.5
Oct,128,127,10,4.6

Categorías de octubre:
Acceso y contraseñas,45
Red y wifi,30
Equipos,25
Software,20
Otros,8

Hechos relevantes:
- Julio: inicio de trimestre con 300 aprendices nuevos y caída del servidor de autenticación (2 días).
- Agosto: se publicó un portal de autoservicio para restablecer contraseñas.
- Septiembre: se contrató un segundo técnico de soporte.
"""

Instrucción: En Canvas, redacta un informe ejecutivo con:
1. Un resumen de máximo cinco líneas con las tres cifras más importantes.
2. Una tabla mensual con la tasa de resolución y el tiempo promedio.
3. Una comparación entre mayo-julio y agosto-octubre.
4. Qué cambios pueden atribuirse a cada hecho relevante y cuáles podrían ser coincidencia.
5. Tres decisiones recomendadas.

Restricciones:
- No afirmes causalidad sin advertir sus límites.
- Cifras con un decimal y formato colombiano.

Formato: Títulos numerados, una tabla y un cuadro de decisiones.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.
3. Selecciona la sección de hechos relevantes y escribe: «Separa la evidencia fuerte de las coincidencias en dos columnas».
4. Pide en el chat: «En Canvas, genera un tablero web interactivo con tarjetas KPI de los 6 meses y un gráfico de barras del tiempo de solución».
5. Usa «Compartir y exportar → Exportar a Documentos de Google» para archivar la versión oficial del dictamen.
6. Exporta el informe a Documentos de Google.

**3. Verifica tu resultado:**

- [ ] El tiempo promedio baja de 18 a 10 horas (−44,4 %).
- [ ] La satisfacción sube de 4,1 a 4,6.
- [ ] El promedio de tiempo antes (mayo-julio) es 18,7 h y después (agosto-octubre) 12,0 h.
- [ ] Acceso y contraseñas es la principal categoría de octubre (35,2 %).
- [ ] El informe advierte los límites de atribuir causalidad.
- [ ] El informe cuenta con su tablero web interactivo en Canvas y su copia guardada en Google Docs.

**Reto extra:** Pide: «Crea una página web con un tablero de los seis meses, un gráfico combinado de barras y líneas y un filtro por periodo».

#### Ejercicio B: Dictamen técnico de proveedores con matriz ponderada y análisis de sensibilidad

- **Nivel:** Avanzado · **Duración:** 35 min · **Función de Canvas:** Documento + aplicación web con radar y pesos ajustables
- **Qué vas a lograr:** Emitir un dictamen técnico defendible con una matriz ponderada y demostrar con una herramienta interactiva cómo cambia la decisión si cambian los pesos.
- **Situación:** El comité de compras debe elegir proveedor de nube. Los puntajes son muy cercanos y alguien preguntará qué pasa si la seguridad pesa más.

**1. Prompt para pegar en Gemini:**

```text
Actúa como consultor de arquitectura en la nube con experiencia en contratación pública.

Contexto: El comité de compras elegirá proveedor de nube. Los puntajes son cercanos y el comité preguntará qué pasa si la seguridad pesa más.

Datos:
"""
EVALUACIÓN DE PROVEEDORES DE NUBE PARA LA PLATAFORMA DE FORMACIÓN (datos de práctica)
Los nombres se anonimizan como Proveedor A, B y C.

Criterio,Peso,Proveedor A,Proveedor B,Proveedor C
Costo anual,30%,4,5,3
Soporte en español,15%,3,4,5
Seguridad y certificaciones,25%,5,3,4
Facilidad de administración,15%,4,4,3
Región de datos y latencia,15%,3,4,5

Escala: 1 (muy deficiente) a 5 (excelente).
Costo anual estimado (COP): A 96.000.000 | B 78.000.000 | C 110.000.000
Requisito no negociable: los datos personales deben cumplir la Ley 1581 de 2012 de Colombia.
"""

Instrucción: En Canvas, redacta el dictamen técnico con:
1. La metodología y la matriz ponderada con el cálculo de cada proveedor.
2. Un análisis de sensibilidad con Seguridad en 35 % y Costo en 20 %, sin cambiar los demás pesos.
3. El costo anual por punto de calidad de cada proveedor.
4. La recomendación final con las condiciones contractuales mínimas para cumplir la Ley 1581 de 2012.

Restricciones:
- Muestra cada cálculo.
- No uses marcas comerciales reales.

Formato: Documento con títulos numerados y tablas.
```

**2. Itera dentro de Canvas:**

1. Activa Canvas en la barra del chat de Gemini, pega el prompt y envíalo.
2. Revisa el resultado con la lista «Verifica tu resultado» y marca lo que ya cumple.
3. Selecciona la recomendación y escribe: «Agrega una cláusula de salida y portabilidad de datos».
4. Pide en el chat: «Crea una aplicación web con un control por cada peso (la suma debe ser 100 %), ranking en vivo, un radar de los tres proveedores y un aviso cuando cambie el ganador».
5. En la vista previa, mueve los pesos hasta que cambie el ganador.
6. Exporta el dictamen a Documentos de Google para su firma.

**3. Verifica tu resultado:**

- [ ] La matriz base da B 4,05, A 3,95 y C 3,85.
- [ ] Con Seguridad 35 % y Costo 20 %: A 4,05, C 3,95 y B 3,85.
- [ ] El costo por punto es menor en B (≈ 19,3 millones por punto).
- [ ] La recomendación incluye condiciones de la Ley 1581 de 2012.
- [ ] La app recalcula el ranking y el radar al mover los pesos.
- [ ] La app avisa cuando cambia el proveedor ganador.

**Reto extra:** Pide: «Agrega una simulación de Monte Carlo que varíe los pesos ±5 puntos y muestre en qué porcentaje de casos gana cada proveedor».


---

### Posibilidad 11: Visión Multimodal (De boceto a Canvas en vivo)

Actúa como desarrollador frontend con experiencia en visión artificial e interfaces accesibles.

Contexto: El equipo docente dibujó a mano en una libreta de apuntes el wireframe del formulario de matrícula de aprendices para la convocatoria 2026. Se requiere que Gemini analice la fotografía del boceto manuscrito y genere directamente en Canvas el artefacto web ejecutable y reactivo.

Datos:
"""
FOTOGRAFÍA ADJUNTA: Boceto a lápiz en libreta de apuntes (datos de práctica)
Título del boceto: Formulario de Inscripción y Matrícula · Convocatoria 2026
Campos dibujados a lápiz:
1. Nombre Completo del Aprendiz: campo de texto obligatorio (mínimo 3 caracteres).
2. Correo Institucional: campo de correo con anotación a mano: "Solo correos @soy.sena.edu.co o @sena.edu.co".
3. Contraseña de Acceso: campo password con anotación: "Mínimo 8 caracteres, incluir números y símbolos".
4. Indicador de seguridad: barra dibujada con tres segmentos (Débil, Media, Segura).
5. Botón principal tipo píldora rotulado a mano: [Completar Registro Formativo].

Paleta institucional anotada al margen: Verde Salvia (#2D5A4C) para el botón primario y acentos, fondo suave (#F8FAF9), texto pizarra (#1E293B) y borde (#CBD5E1).
"""

Instrucción: En Canvas, genera una sola página HTML ejecutable (HTML5, CSS y JavaScript nativo sin dependencias externas) que traduzca fielmente el boceto manuscrito con:
1. El formulario completo con sus 3 campos accesibles (<label> y aria-describedby) y el botón primario con la paleta Verde Salvia #2D5A4C.
2. Validación reactiva en tiempo real del correo institucional: mensaje verde si contiene @soy.sena.edu.co o @sena.edu.co, y advertencia ámbar en caso contrario.
3. Medidor dinámico de seguridad de contraseña con barra de progreso que cambie de color (rojo < 50 %, ámbar 50-79 %, verde ≥ 80 %) según longitud, números y caracteres especiales.
4. Manejo del evento submit sin recargar la página, mostrando una confirmación accesible con el nombre del aprendiz registrado.

Restricciones:
- Cero librerías externas o frameworks: todo debe funcionar de manera nativa e inmediata en la vista previa de Canvas.
- Conserva exactamente los textos, dominios y reglas anotados en el boceto a lápiz.
- Garantiza contraste WCAG 2.2 nivel AA para todos los elementos interactivos y textos.

Formato: Un único archivo HTML con estilos CSS embebidos, JavaScript reactivo nativo y comentarios breves en español de Colombia.

#### Ejercicios prácticos del modo:
- **De boceto en libreta a formulario reactivo con validación institucional**: Adjuntar la fotografía de un wireframe manuscrito y solicitar a Gemini en Canvas la generación de un formulario web reactivo con validaciones institucionales.
- **De trazos en pizarra a flujograma interactivo Mermaid de atención PQRS**: Digitalizar un diagrama de flujo dibujado con marcador en la pizarra del aula y transformarlo en código Mermaid estándar con bifurcaciones condicionales y subgrafos.

---

### Posibilidad 12: Gem Studio para Canvas (Asistente especializado de coescritura en Canvas)

Actúa como arquitecto de inteligencia artificial y diseñador de asistentes personalizados (Gemini Gems).

Contexto: La coordinación académica del centro requiere configurar un Gem especializado (asistente a medida) que actúe como coescritor pedagógico dentro de Gemini Canvas. El Gem debe asistir a los instructores en la redacción de guías de aprendizaje y rúbricas técnicas sin escribir el trabajo por ellos, aplicando el método socrático y las normas institucionales.

Datos:
"""
ESPECIFICACIÓN DEL GEM: Coescritor Pedagógico de Guías Técnicas ADSO
Propósito: Asistir a instructores y aprendices en la estructuración de guías de aprendizaje en Canvas.
Guardrails obligatorios (Restricciones del System Prompt):
1. Método socrático: cuando el usuario pida una solución completa, formula preguntas guía en lugar de dar el producto terminado.
2. Alineación curricular: referenciar siempre resultados de aprendizaje (RAP) y competencias del programa ADSO.
3. Tono y estilo: redacción en español de Colombia (es-CO), respetuoso, claro y técnico; cero uso de extranjerismos o términos ajenos (usar siempre "Portafolio de Evidencias").
4. Estructura de salida en Canvas: organizar todo artefacto técnico en 4 secciones canónicas: 1) Identificación, 2) Planteamiento didáctico, 3) Criterios observables de evaluación, 4) Tareas de verificación.
Temperatura configurada: 0.2 (rigor pedagógico determinista).
"""

Instrucción: En Canvas, redacta la ficha técnica y de configuración completa del Gem en un documento formal con:
1. El System Prompt exhaustivo listo para copiar y pegar en la configuración de Gemini Gems, estructurado con Rol, Misión, Guardrails y Ejemplos de Interacción (Few-shot).
2. Una matriz de prueba con 3 casos de calibración (Pregunta del usuario | Respuesta incorrecta del Gem | Respuesta esperada conforme a guardrails).
3. El protocolo de interacción en vivo dentro de Canvas: cómo debe comportarse el Gem al refinar textos seleccionados con el cursor.
4. La lista de verificación de cumplimiento de políticas pedagógicas e institucionales para autorizar la publicación del Gem.

Restricciones:
- El System Prompt debe exigir el uso obligatorio de «Portafolio de Evidencias» erradicando cualquier extranjerismo o término no institucional en todo el texto.
- No uses nombres de modelos comerciales ni enlaces externos no institucionales.
- Redacta en español de Colombia con lenguaje técnico accesible y riguroso.

Formato: Documento técnico con títulos numerados, bloques de texto de sistema destacados y dos tablas comparativas.

#### Ejercicios prácticos del modo:
- **Configuración y calibración de un Gem Tutor Socrático para coescritura en Canvas**: Diseñar el System Prompt de un Gem especializado, ponerlo a prueba con preguntas trampa y utilizarlo como asistente de coescritura en un lienzo de Canvas.
- **Gem Auditor de Rúbricas y Calidad de Código en tiempo real**: Crear y calibrar un Gem evaluador que audite el código generado en Canvas contra una rúbrica técnica de 4 criterios sin alterar la lógica de negocio.
