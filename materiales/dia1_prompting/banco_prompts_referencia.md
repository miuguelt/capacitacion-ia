# Banco Canónico de Prompts y Resultados Esperados — Día 1: Productividad y Documentos

Este documento contiene las plantillas canónicas de ingeniería de instrucciones basadas en el **Método Canónico CRTT+L** (Contexto, Rol, Tarea, Tono y Límites — adaptado con la estructura mnemotécnica R-C-I-R-F):
* **Contexto (C):** Establece el escenario, los antecedentes, el público y la fuente documental cerrada.
* **Rol (R):** Define la identidad técnica o institucional y el marco de especialidad del modelo.
* **Tarea (T / Instrucción):** Declara la acción operativa principal con verbos directos y fases observables.
* **Tono y Formato (T / Formato):** Exige una estructura exacta de salida (tablas Markdown, listas) y lenguaje claro en `es-CO`.
* **Límites (+ L / Restricciones):** Delimita lo estrictamente prohibido, penaliza suposiciones y obliga a usar marcas como `[Pendiente]` (evita alucinaciones).

Para cada caso se incluye el **Prompt Profesional**, el **Resultado Esperado Observable** (estándar de oro) y la **Comparativa con Enfoque Deficiente** para que el aprendiz compruebe la diferencia.

---

## 1. Posibilidad 1: Extracción de Actas, Tareas y Compromisos de Reunión

### A. Prompt Profesional Canónico (CRTT+L / R-C-I-R-F)
```markdown
Actúa como secretario técnico y relator de comités académicos.

Contexto:
A continuación te proporciono las notas desordenadas tomadas durante una reunión de coordinación de centro de formación técnica. El objetivo es formalizar el acta y asegurar que cada compromiso tenga un responsable y una fecha clara.

Instrucción:
Analiza el texto y genera:
1. Resumen ejecutivo de la reunión (máximo 4 oraciones).
2. Tabla de compromisos y tareas acordadas.
3. Lista de puntos pendientes por definir o que quedaron aplazados.

Restricciones estrictas:
- No inventes nombres, presupuestos, cargos ni acuerdos que no aparezcan de forma explícita en el texto.
- Si una tarea no tiene fecha límite clara en las notas, escribe exactamente "[Pendiente de asignación]" en la columna de fecha.
- Excluye comentarios informales, bromas o fallas técnicas del inicio.

Formato de salida:
- Resumen en un párrafo continuo.
- Tabla Markdown con las columnas: | ID | Tarea / Compromiso | Responsable | Fecha Límite | Estado |
- Lista con viñetas para los puntos pendientes.

Texto de entrada:
"""
[PEGAR AQUÍ LAS NOTAS DE LA REUNIÓN]
"""
```

### B. Resultado Esperado Observable (Estándar de Oro)
```markdown
### Resumen Ejecutivo
El Comité de Coordinación Académica y Técnica sesionó para revisar el estado del transporte de aprendices de la ficha 2871, la adecuación técnica de las salas de cómputo 3 y 4 antes del inicio de formación en desarrollo web, y la gestión de apoyos de sostenimiento. Asimismo, se aprobó gestionar la compra de 15 tarjetas de desarrollo con cargo al rubro SENNOVA. Se establecieron responsables inmediatos para evitar retrasos en el calendario formativo de marzo de 2026.

### Tabla de Compromisos Acordados
| ID | Tarea / Compromiso | Responsable | Fecha Límite | Estado |
|:---|:-------------------|:------------|:-------------|:-------|
| 01 | Insistir ante la empresa de transporte sobre el horario de ruta de la ficha 2871 | María Fernanda | Antes del viernes 20 de marzo | En gestión |
| 02 | Revisar fuentes de poder y optimizar equipos de salas de cómputo 3 y 4 | Carlos Gómez | Martes 17 de marzo | Asignado |
| 03 | Enviar listas filtradas de aprendices para convocatoria de apoyo de sostenimiento | Carlos Gómez y Andrea Patiño | Lunes 16 de marzo, 2:00 p.m. | Asignado |
| 04 | Conseguir 3 cotizaciones para compra de 15 tarjetas de desarrollo ($1.800.000 COP SENNOVA) | Carlos Gómez | Miércoles 18 de marzo | En gestión |

### Puntos Pendientes o Aplazados
* Respuesta oficial de la empresa de transporte público frente a los desvíos de ruta matutinos.
* Cronograma definitivo de apertura de salas de cómputo para la jornada nocturna.
```

### C. Antipatrón (Prompt Deficiente) y Consecuencias
* **Prompt Deficiente:** *"Hazme un resumen del acta de la reunión de hoy."*
* **Resultado Deficiente:** La IA incluye las quejas por problemas de audio de Carlos, inventa que se compraron computadores nuevos, olvida las horas exactas de entrega de las listas de bienestar y no genera tabla de compromisos.

---

## 2. Posibilidad 2: Auditoría Curricular y Citas Exactas con NotebookLM

### A. Prompt Profesional Canónico
```markdown
Actúa como asesor pedagógico y auditor curricular institucional.

Contexto:
Estoy analizando las normas y lineamientos de formación para asegurar el debido proceso en la evaluación de evidencias de aprendizaje.

Instrucción:
Con base exclusivamente en los documentos cargados en la libreta, responde a la siguiente consulta:
"¿Cuál es el procedimiento paso a paso que debe seguir un instructor cuando un aprendiz no entrega una evidencia en los plazos fijados y qué garantías de reposición tiene el aprendiz?"

Restricciones:
- Limita tus afirmaciones únicamente a lo estipulado en los documentos adjuntos.
- Por cada afirmación o paso procesal, incluye la cita textual y el número de página o capítulo entre corchetes, por ejemplo: [Capítulo IV, Artículo 12, Pág. 18].
- Si el documento no especifica un plazo en días hábiles, indica expresamente: "El documento no precisa el término en días hábiles".

Formato de salida:
1. Procedimiento del instructor (pasos ordenados cronológicamente).
2. Garantías y derechos del aprendiz.
3. Tabla de citas y fuentes de respaldo con referencia exacta de página.
```

### B. Resultado Esperado Observable
```markdown
### 1. Procedimiento del Instructor ante No Entrega de Evidencias
1. **Registro inicial:** El instructor debe reportar la no entrega en la plataforma dentro de los dos días hábiles posteriores al vencimiento [Reglamento del Aprendiz, Art. 22, Pág. 14].
2. **Concertación de plan de mejoramiento:** Se citará al aprendiz a una sesión de retroalimentación para acordar una actividad complementaria con plazo no superior a cinco días hábiles [Cap. V, Art. 24, Pág. 16].
3. **Registro de juicio evaluativo:** Si cumplido el plan de mejoramiento no se presenta la evidencia, se registrará la calificación de 'No Aprobado' [Cap. VI, Art. 28, Pág. 19].

### 2. Garantías y Derechos del Aprendiz
* Derecho a ser notificado formalmente por correo institucional [Art. 23, Pág. 15].
* Derecho a presentar recurso de reposición dentro de los tres días hábiles siguientes a la notificación de la calificación [Art. 30, Pág. 21].

### 3. Tabla de Fuentes de Respaldo
| Afirmación Procesal | Documento Fuente | Sección / Artículo | Página Citada |
|:--------------------|:-----------------|:-------------------|:--------------|
| Término de reporte de no entrega | Reglamento del Aprendiz 2024 | Capítulo IV, Art. 22 | Página 14 |
| Término de plan de mejoramiento | Lineamiento de Formación Integral | Capítulo V, Art. 24 | Página 16 |
| Recurso de reposición | Procedimiento de Evaluación SENA | Capítulo VII, Art. 30 | Página 21 |
```

---

## 3. Posibilidad 3: Comunicación Institucional Asertiva con Control de Tono

### A. Prompt Profesional Canónico
```markdown
Actúa como coordinador de formación y redactor institucional.

Contexto:
Debo comunicar a los instructores del área técnica el cronograma de cierre de trimestre. Es necesario recordar la importancia de registrar los juicios evaluativos a tiempo para no perjudicar la matrícula del siguiente ciclo.

Instrucción:
Redacta un correo electrónico institucional formal, respetuoso y motivador.

Restricciones:
- Tono: Profesional, empático y orientado a la colaboración.
- Longitud máxima: 250 palabras.
- Incluye un llamado a la acción claro con fecha límite del 25 de marzo a las 11:59 p.m.
- Menciona que la mesa de ayuda técnica estará habilitada en caso de bloqueos en la plataforma.

Formato de salida:
- Asunto: Claro y con corchetes identificadores, por ejemplo: [Importante] Recordatorio de cierre...
- Cuerpo del mensaje estructurado con saludo, contexto, fechas clave en lista destacada y despedida formal.
```

### B. Resultado Esperado Observable
```markdown
Asunto: [Coordinación Académica] Fechas clave y registro de juicios evaluativos – Cierre I Trimestre 2026

Estimado equipo de instructores:

Les extiendo un cordial saludo y mi sincero reconocimiento por el compromiso demostrado a lo largo de este primer trimestre. Sus orientaciones han sido fundamentales para el avance de nuestros aprendices.

Con el fin de garantizar una transición fluida hacia el segundo trimestre y proteger la continuidad de las matrículas y apoyos de sostenimiento, les recordamos las fechas críticas para el reporte final:

* Fecha límite de registro de juicios evaluativos: Miércoles 25 de marzo de 2026, hasta las 11:59 p.m.
* Cierre definitivo de actas en plataforma: Jueves 26 de marzo de 2026, 5:00 p.m.

Si presentan inconsistencias técnicas o bloqueos en el sistema, la Mesa de Ayuda de Soporte Técnico estará operando en jornada continua a través de la extensión 104 y el correo soporte.centro@institucion.edu.co.

Agradecemos de antemano su puntualidad y dedicación, la cual asegura el debido proceso para toda nuestra comunidad educativa.

Atentamente,

Coordinación de Formación Profesional Integral
Centro de Tecnologías de la Información
```
