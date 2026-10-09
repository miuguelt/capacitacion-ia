# Banco Canónico de Prompts — Día 1: Productividad y Documentos

Este documento contiene las plantillas canónicas de ingeniería de prompts basadas en la fórmula **R-C-I-R-F**:
* **Rol:** Define la identidad y el marco de especialidad del modelo.
* **Contexto:** Establece el escenario, los antecedentes y el público objetivo.
* **Instrucción:** Declara la acción principal con verbos directos y medibles.
* **Restricciones:** Delimita lo que está estrictamente prohibido o condicionado (evita alucinaciones).
* **Formato:** Exige una estructura exacta de salida (tablas Markdown, listas JSON, esquemas enumerados).

---

## 1. Prompt para Extracción de Actas y Compromisos

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

---

## 2. Prompt para Análisis Documental Profundo (para usar con Gemini o NotebookLM)

```markdown
Actúa como asesor pedagógico y auditor curricular institucional.

Contexto:
Estoy analizando las normas y lineamientos de formación para asegurar el debido proceso en la evaluación de evidencias de aprendizaje.

Instrucción:
Con base exclusivamente en los documentos adjuntos, responde a la siguiente consulta:
"¿Cuál es el procedimiento paso a paso que debe seguir un instructor cuando un aprendiz no entrega una evidencia en los plazos fijados y qué recursos de reposición tiene el aprendiz?"

Restricciones:
- Limita tus afirmaciones únicamente a lo estipulado en los documentos adjuntos.
- Por cada afirmación o paso procesal, incluye la cita textual y el número de página o capítulo entre corchetes, por ejemplo: [Capítulo IV, Artículo 12, Pág. 18].
- Si el documento no especifica un plazo en días hábiles, indica expresamente: "El documento no precisa el término en días hábiles".

Formato de salida:
1. Procedimiento del instructor (pasos 1 al N ordenados cronológicamente).
2. Garantías y derechos del aprendiz.
3. Lista de citas y fuentes de respaldo con referencia de página.
```

---

## 3. Prompt para Redacción de Correo Institucional Asertivo

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
