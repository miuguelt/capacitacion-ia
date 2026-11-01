# Aula de Inteligencia Artificial · Capacitación Práctica e Intensiva (4 Días)

Portal interactivo y guía metodológica integral para el desarrollo de una capacitación intensiva de cuatro días (7:00 a.m. a 5:00 p.m., 10 horas diarias con pausas y almuerzo) en inteligencia artificial aplicada para instructores y aprendices.

---

## 🚀 Cómo Iniciar la Web

La aplicación es una SPA moderna, accesible y ligera construida sin dependencias complejas. Puede ejecutarse de dos maneras:

1. **Uso directo sin servidor:**
   Haz doble clic sobre [`index.html`](index.html) para abrirla directamente en cualquier navegador moderno (Edge, Chrome, Firefox).
2. **Servidor local liviano:**
   ```powershell
   python -m http.server 34172
   ```
   Luego abre en tu navegador: `http://localhost:34172`.

---

## 🎯 Características Principales

* **Doble Perspectiva (Selector de Rol):**
  * **Modo Participante:** Visualización clara de objetivos, conceptos explicados sin tecnicismos innecesarios, instrucciones paso a paso, retos y botones para copiar prompts y código con un solo clic.
  * **Modo Facilitador (Instructor):** Activa tarjetas metodológicas destacadas en color ámbar con recomendaciones pedagógicas, guion para la pizarra, preguntas detonantes para abrir debate, dinámicas para combatir la fatiga post-almuerzo y criterios de observación rápida.
* **Cronograma Horario Riguroso:** Estructura canónica de 7:00 a.m. a 5:00 p.m., alternando teoría (20%), práctica guiada (80%) y pausas activas programadas.
* **Temporizador de Aula Integrado:** Cronómetro interactivo para controlar sprints de reto (30m/45m) y pausas activas (15m).
* **Módulo Especial Gemini Canvas Lab (10 Posibilidades):** Espacio de trabajo interactivo en pantalla dividida (Split Screen) que cubre las 10 grandes posibilidades de Gemini Canvas:
  1. Documentos y redacción editorial
  2. Prototipado web en vivo (HTML/CSS/JS reactivo)
  3. Matrices de decisión y Sheets exportables
  4. Diagramas de flujo Mermaid
  5. Diseño visual y maquetación UI/UX
  6. Edición quirúrgica por selección (Inline Prompting)
  7. Auditoría y refactorización de algoritmos (Python O(n))
  8. Guías didácticas y rúbricas analíticas de evaluación
  9. Consultas SQL complejas, pipelines ETL y modelado relacional
  10. Informes ejecutivos multifuente y dictámenes técnicos
* **Simuladores Interactivos de Nueva Generación:**
  * **Gem Studio:** Diseñador y consola de prueba en vivo para asistentes personalizados (Gemini Gems / Custom GPTs) con guardrails de sistema, ejemplos pocos disparos (*few-shot*) y modo socrático.
  * **Simulador de Visión Multimodal:** Conversión en directo de bocetos dibujados a mano (cuaderno o tablero) en aplicaciones web funcionales con validación reactiva o flujogramas.
  * **Barra de Calibración Reactiva de Canvas:** Control de longitud de 5 niveles, ajuste de tono (formal, directo, académico, persuasivo) y calibración de audiencia (técnica vs ejecutiva).
* **Visualizadores de Resultados Esperados en Todos los Días:** Tarjetas interactivas con comparativas lado a lado entre el "Estándar de Oro" profesional y el "Antipatrón Deficiente", permitiendo que el aprendiz evalúe de inmediato la calidad de sus resultados.
* **Constructor Interactivo de Prompts R-C-I-R-F:** Herramienta en vivo donde el usuario redacta Rol, Contexto, Instrucción, Restricciones y Formato para generar un prompt profesional listo para copiar.
* **Banco de Materiales Completo:** Todos los scripts de prueba (`.py` y `.ps1`), datasets (`.json`), plantillas web, guías de gobernanza y rúbricas de evaluación organizados en la carpeta `materiales/`.

---

## 📁 Estructura del Proyecto

```text
capacitacion-ia/
├── index.html                      # Portal web interactivo principal (10 modos de Canvas + Gem Studio)
├── css/
│   └── styles.css                  # Paleta de serenidad (verde salvia, pizarra y lino)
├── js/
│   └── app.js                      # Lógica de navegación, simulador de Canvas, Gem Studio y temporizador
├── assets/
│   └── images/canvas/              # 11 capturas de alta fidelidad (>50KB) de resultados en Canvas
├── materiales/                     # Insumos y recursos para la formación
│   ├── dia1_prompting/             # Casos de estudio y banco canónico de prompts con salidas
│   ├── dia2_multimedia/            # Guías para Ideogram, video y guion de microcápsula
│   ├── dia3_agentes_web/           # Generador de 200 archivos, organizador y panel web
│   ├── dia4_agentes_integrador/    # System prompt de tutor socrático y rúbrica Demo Day
│   └── gemini_canvas/              # Guía completa de Canvas y dataset JSON con 10 posibilidades
├── guide.manifest.json             # Manifiesto curricular de DevBrain
├── deliverables.registry.json      # Registro de los entregables
├── tests/                          # Suite automatizada de pruebas con pytest (28 tests al 100%)
└── README.md
```

---

## 🧪 Pruebas Automatizadas

Para ejecutar la suite de pruebas:
```powershell
pytest tests -v
```

---

## 🏛️ Registro en DevBrain
* **Nombre de proyecto:** `capacitacion-ia`
* **Tipo:** `static`
* **Puerto asignado:** `34172`
* **Ruta local:** `c:\Users\Miguel\Documents\Aplicaciones\_projects\capacitacion-ia`
