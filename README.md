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
* **Constructor Interactivo de Prompts R-C-I-R-F:** Herramienta en vivo donde el usuario redacta Rol, Contexto, Instrucción, Restricciones y Formato para generar un prompt profesional listo para copiar.
* **Banco de Materiales Completo:** Todos los scripts de prueba (`.py` y `.ps1`), datasets (`.json`), plantillas web y rúbricas de evaluación organizados en la carpeta `materiales/`.

---

## 📁 Estructura del Proyecto

```text
capacitacion-ia/
├── index.html                      # Portal web interactivo principal
├── css/
│   └── styles.css                  # Paleta de serenidad (verde salvia, pizarra y lino)
├── js/
│   └── app.js                      # Lógica de navegación, temporizador y constructor
├── materiales/                     # Insumos y recursos para los 4 días
│   ├── dia1_prompting/             # Casos de estudio y banco canónico de prompts
│   ├── dia2_multimedia/            # Guías para Ideogram, video y guion de microcápsula
│   ├── dia3_agentes_web/           # Generador de 200 archivos, organizador y panel web
│   └── dia4_agentes_integrador/    # System prompt de tutor socrático y rúbrica Demo Day
├── guide.manifest.json             # Manifiesto curricular de DevBrain
├── deliverables.registry.json      # Registro de los 4 entregables
├── tests/                          # Suite automatizada de pruebas con pytest
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
