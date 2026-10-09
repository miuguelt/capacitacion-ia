# Guía Estratégica: Dilemas Éticos, Gobernanza y Sesgos Algorítmicos

Esta guía proporciona el marco analítico para auditar la equidad de las soluciones con IA y establecer lineamientos de gobernanza corporativa en organizaciones y centros educativos.

---

## 1. Análisis de Sesgos Algorítmicos

Los modelos de lenguaje reproducen y amplifican los patrones culturales, históricos y estadísticos de sus datos de entrenamiento:

* **Sesgo de Representación y Geográfico:**
  * Respuestas sesgadas hacia contextos norteamericanos o anglosajones en legislación, terminología pedagógica o ejemplos culturales, ignorando el contexto normativo latinoamericano o colombiano.
* **Sesgo en Procesos de Selección y Evaluación:**
  * Si se utiliza un modelo para prefiltrar hojas de vida o evaluar evidencias de aprendices, el modelo puede favorecer ciertos estilos de redacción o penalizar involuntariamente regionalismos o trayectorias no convencionales.
* **Protocolo de Detección y Mitigación:**
  * **Pruebas a ciegas:** Evaluar el mismo contenido variando únicamente el nombre, género o región del postulante para verificar si la calificación cambia.
  * **Temperatura controlada:** Usar temperatura baja (0.0 a 0.2) para tareas evaluativas, reduciendo la variabilidad aleatoria.
  * **Revisión humana obligatoria (*Human-in-the-loop*):** Ninguna decisión que afecte los derechos, notas o contratación de una persona puede ser tomada al 100 % por un modelo automatizado.

---

## 2. Gobernanza y Privacidad de Datos Corporativos

* **Clasificación de la Información según Riesgo:**
  * *Datos Públicos:* Temarios, normativas abiertas, información de libre consulta (pueden enviarse a cualquier modelo).
  * *Datos Internos:* Minutas operativas, actas de planeación sin secretos comerciales (requieren modelos con contrato empresarial donde no se use la data para entrenamiento).
  * *Datos Confidenciales / Sensibles:* Información médica, financiera, calificaciones individuales de aprendices, contraseñas o datos de menores de edad (PROHIBIDO cargarlos a modelos públicos en la nube; se deben anonimizar o procesar con modelos locales tipo Ollama/LM Studio).
* **Política de Uso Aceptable (AUP):**
  * Toda entidad debe publicar un decálogo claro: qué herramientas están autorizadas, qué datos está prohibido subir y cómo debe declararse la autoría o asistencia de la IA en los informes finales.

---

## 3. El Futuro del Rol Profesional y del Desarrollo

* **Del "Escribiente de Código" al "Auditor y Diseñador de Sistemas":**
  * La IA asume la sintaxis repetitiva (*boilerplate*); el valor humano se traslada a la formulación del problema, la verificación de seguridad, la arquitectura de datos y la empatía pedagógica o comercial.
* **Pensamiento Crítico como Competencia Clave:**
  * La habilidad más demandada no es saber teclear un prompt, sino saber cuándo la IA está equivocada, qué supuestos invisibles está haciendo y cómo garantizar que el producto final sea seguro y legal.
