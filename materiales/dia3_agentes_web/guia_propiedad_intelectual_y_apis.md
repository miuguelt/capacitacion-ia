# Guía Práctica: Propiedad Intelectual, Licenciamiento y Seguridad en APIs

Esta guía aborda los aspectos legales, regulatorios y de seguridad técnica indispensables al construir software asistido por IA generativa y consumir APIs comerciales.

---

## 1. Propiedad Intelectual del Código Generado por IA

* **¿Quién es el autor legal del código?**
  * La jurisprudencia internacional (incluyendo la Oficina de Derechos de Autor de EE. UU. y lineamientos de la DNDA en Colombia) establece que **solo las obras creadas por seres humanos son susceptibles de protección por derecho de autor**.
  * Si un código es generado al 100 % por un modelo mediante un prompt simple, dicho código cae en el dominio público o carece de titularidad de autoría protegible.
  * **El aporte humano protegible:** La protección legal recae sobre la arquitectura global, las adaptaciones humanas sustanciales, las integraciones, la lógica de negocio y la documentación propia escrita por el desarrollador.

* **Riesgo de Contaminación por Licencias (Copyleft):**
  * Los modelos de IA fueron entrenados con millones de repositorios públicos, algunos bajo licencias restrictivas (GPL, AGPL).
  * Si un asistente autocompleta un algoritmo protegido por GPL dentro de un software propietario o comercial de una entidad, existe riesgo de **contaminación viral de licencia**, obligando contractualmente a liberar el código fuente de toda la aplicación.
  * **Buenas prácticas:** Activar el filtro de coincidencia con código público (*Public Code Match Filter*) en herramientas como GitHub Copilot, o inspeccionar dependencias antes de pasarlas a producción.

---

## 2. Protección y Gobierno en el Consumo de APIs Comerciales

Al conectar modelos de lenguaje a aplicaciones mediante APIs (OpenAI, Anthropic, Google Gemini):

1. **Cero Secretos en el Frontend o Repositorios:**
   * **Prohibición absoluta:** Nunca quemar (*hardcodear*) una clave de API (`sk-...` o `AIza...`) dentro de archivos `index.html`, `app.js` o scripts rastreados por Git.
   * **Mecanismo seguro:** Las claves deben residir en variables de entorno del servidor o en el administrador de credenciales del sistema operativo (Windows Credential Manager / Keychain).
2. **Control de Presupuesto y Límite de Consumo (*Cost Guardrails*):**
   * Configurar siempre techos de gasto mensual (*Hard Limits* y *Soft Alerts*) en las consolas de nube (Google Cloud / OpenAI).
   * Implementar límites de tasa (*rate-limiting*) para evitar que un bucle infinito en el código consuma cientos de dólares en segundos.
3. **Privacidad de Entrada (Términos de Servicio de API vs. Web):**
   * A diferencia de las interfaces gratuitas de chat web, las APIs empresariales comerciales garantizan por contrato que **los datos y prompts enviados a través de la API no se utilizan para entrenar los modelos públicos**.
