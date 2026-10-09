# Guía Estratégica: Propiedad Intelectual, Licenciamiento y Seguridad en APIs

Esta guía detalla el marco legal, los riesgos contractuales de licenciamiento de software y las directrices técnicas indispensables para proteger la propiedad intelectual y custodiar credenciales al consumir APIs comerciales en proyectos de software y automatización.

---

## 1. Propiedad Intelectual del Código Generado por IA

La integración masiva de asistentes de código (GitHub Copilot, Cursor, Gemini Code Assist, ChatGPT) plantea desafíos jurídicos inéditos sobre la titularidad y los derechos de autor de las aplicaciones de software.

### 1.1 Doctrina de la Autoría Exclusivamente Humana
* **Marco Jurídico Internacional y Nacional:**
  * La jurisprudencia consolidada de la Oficina de Derechos de Autor de los Estados Unidos (*US Copyright Office*), los tribunales de la Unión Europea y las directrices de la Dirección Nacional de Derecho de Autor (DNDA) en Colombia bajo la Ley 23 de 1982 coinciden en un principio uniforme: **únicamente las creaciones emanadas del intelecto humano gozan de protección por derechos de autor**.
  * Las máquinas, los algoritmos y los modelos generativos carecen de personalidad jurídica y no pueden ser considerados autores de ninguna obra intelectual.
* **El Estatus del Código Generado 100 % por Prompts:**
  * Si un bloque de código, función o script es generado de forma automatizada mediante una instrucción simple sin modificación sustantiva humana, dicho código **no califica para protección de derechos de autor y pasa a ser de dominio público**. Cualquier tercero puede reutilizarlo sin incurrir en infracción legal.
* **El Aporte Humano Protegible (*Threshold of Originality*):**
  * La protección jurídica recae exclusivamente sobre la **selección, ensamblaje, arquitectura global y adaptación creativa sustancial** realizada por el desarrollador humano.
  * Para reclamar titularidad sobre un software que utilizó asistencia de IA, la organización debe demostrar que la estructura global, la integración de capas, la lógica de negocio especializada y la documentación técnica reflejan la labor intelectual y de diseño de sus ingenieros.

### 1.2 Derechos Morales y Derechos Patrimoniales en Colombia
* **Derechos Morales:**
  * Son inalienables, intransferibles, irrenunciables y perpetuos (artículo 30 de la Ley 23 de 1982). Incluyen el derecho de paternidad (ser reconocido como creador) y de integridad de la obra. Un modelo algorítmico no puede ostentar derechos morales ni figurar como autor en registros oficiales de software.
* **Derechos Patrimoniales y Obras por Encargo:**
  * Facultan la reproducción, modificación, comercialización y distribución económica del software. En los contratos laborales o de prestación de servicios, los derechos patrimoniales sobre las creaciones desarrolladas por el empleado en cumplimiento de sus funciones se presumen transferidos a la entidad empleadora. La organización debe normar internamente qué grado de asistencia de IA está permitido en la construcción de activos estratégicos.

---

## 2. Licenciamiento de Software y Riesgo de Contaminación por Copyleft

Uno de los mayores riesgos corporativos al utilizar asistentes generativos de código es la infracción involuntaria de licencias de software libre y código abierto (FOSS).

### 2.1 Taxonomía de Licencias de Software
1. **Licencias Permisivas (MIT, Apache 2.0, BSD):**
   * Autorizan el uso, modificación, distribución e incorporación en software comercial cerrado o propietario con un único requisito indispensable: conservar la atribución original del autor y el texto de la licencia.
2. **Licencias Recíprocas / Fuertes con Copyleft (GPL v2, GPL v3, AGPL):**
   * Establecen una condición viral o recíproca: cualquier obra derivada o software que enlace o integre componentes bajo GPL debe ser distribuido obligatoriamente bajo los mismos términos de la licencia GPL, exigiendo la apertura completa de su código fuente.

### 2.2 El Fenómeno de Regurgitación y Contaminación Viral
* **Regurgitación de Código:**
  * Los modelos de lenguaje de código fueron entrenados indexando millones de repositorios públicos de plataformas como GitHub o GitLab, muchos de los cuales están licenciados bajo GPL o AGPL.
  * En determinados contextos (algoritmos matemáticos específicos, controladores de hardware o funciones de cifrado), los modelos pueden autocompletar fragmentos idénticos (*verbatim*) al código original con el que fueron entrenados, omitiendo el encabezado de licencia y la atribución obligatoria.
* **Impacto de la Contaminación Viral en Software Propietario:**
  * Si un desarrollador incorpora un fragmento regurgitado de GPL dentro de una solución propietaria de la empresa, la organización queda expuesta a reclamos legales que pueden forzarla judicialmente a liberar el código fuente de toda la plataforma o retirar el producto comercial del mercado.

### 2.3 Medidas de Blindaje y Auditoría Técnica
Para mitigar el riesgo de contaminación por licencias, los equipos de tecnología deben implementar tres controles obligatorios:
1. **Activación de Filtros de Coincidencia de Código Público (*Public Code Match Filters*):**
   * Habilitar en los entornos de desarrollo (por ejemplo, en GitHub Copilot o Cursor) la política que bloquea o advierte cuando una sugerencia coincida con fragmentos de más de 150 caracteres en repositorios públicos.
2. **Auditoría Continua de Dependencias y Análisis de Composición de Software (SCA):**
   * Integrar herramientas de escaneo estático (como Snyk, FOSSA, trivy o pip-audit) en los flujos de integración continua (CI/CD) para detectar automáticamente licencias incompatibles antes de cada despliegue.
3. **Registro y Trazabilidad del Código:**
   * Mantener bitácoras de desarrollo y revisiones de código por pares (*pull requests*) donde se verifique que los algoritmos complejos respondan a implementaciones propias y no a copias indiscriminadas del modelo.

---

## 3. Protección y Gobierno en el Consumo de APIs Comerciales

Conectar aplicaciones locales o web a proveedores de modelos fundacionales (OpenAI API, Google Cloud Vertex / Gemini API, Anthropic API) transforma un asistente de chat en un servicio programable, pero introduce vectores de riesgo financiero y de ciberseguridad.

### 3.1 Seguridad Absoluta de Credenciales y Claves de API
* **Prohibición Radical de Quemar Claves (*Hardcoding*):**
  * Bajo ninguna circunstancia se debe escribir una clave de API (`sk-...`, `AIza...`) dentro de archivos frontend (`index.html`, `app.js`), clientes móviles o scripts subidos a repositorios Git.
  * Los robots automatizados escanean repositorios públicos en plataformas como GitHub en cuestión de segundos tras un commit; una clave expuesta es interceptada de inmediato y explotada para minería o reventa de cuotas.
* **Patrón Arquitectónico Obligatorio: Backend-for-Frontend (BFF) / API Gateway:**
  * Las aplicaciones cliente (navegador web o app móvil) nunca deben comunicarse directamente con la API del proveedor de IA.
  * **Flujo seguro:**
    1. El usuario interactúa con la interfaz web.
    2. El frontend realiza una petición HTTP al servidor propio de la organización (backend en Python, Node o Go).
    3. El backend autentica la sesión del usuario, aplica validaciones y consulta la credencial almacenada de forma segura (variables de entorno protegidas o Windows Credential Manager / Secret Manager en la nube).
    4. El backend realiza la llamada a la API comercial y retorna únicamente la respuesta depurada al frontend.

### 3.2 Control Presupuestario y Barandas de Costo (*Cost Guardrails*)
El cobro en las APIs de modelos de lenguaje se calcula por volumen de tokens consumidos (tanto en la entrada o prompt como en la salida generada). Un error de programación puede ocasionar consumos exorbitantes en minutos.
* **Límites Presupuestarios en Consola de Nube:**
  * **Límite Duro (*Hard Limit*):** Suspende automáticamente todas las llamadas de la API cuando el consumo mensual alcanza el tope financiero asignado para el proyecto.
  * **Alertas Blandas (*Soft Alerts*):** Notificaciones automáticas vía correo electrónico o canales de mensajería (Slack/Teams) al alcanzar el 50 %, 75 % y 90 % del presupuesto mensual estimado.
* **Límites de Tasa (*Rate Limiting*):**
  * Configurar restricciones de frecuencia en el backend (máximo N peticiones por minuto por usuario o dirección IP) para impedir ataques de denegación de billetera (*Denial of Wallet*).
* **Disyuntores y Control de Recursión (*Circuit Breakers*):**
  * En arquitecturas con agentes autónomos que ejecutan bucles reflexivos o llamadas sucesivas de herramientas, fijar siempre un número máximo de iteraciones (por ejemplo, máximo 5 llamadas por tarea) para neutralizar bucles infinitos no detectados.

### 3.3 Diferencias Contractuales: API Comercial vs. Interfaz Web de Consumo
Comprender la diferencia jurídica entre usar el chat web gratuito y la API comercial es vital para la toma de decisiones organizacionales:

| Criterio | Chat Web Gratuito de Consumo | API Comercial Empresarial |
|---|---|---|
| **Uso de Datos para Entrenamiento** | Los prompts y conversaciones pueden ser utilizados por el proveedor para reentrenar futuros modelos públicos. | **Cero reentrenamiento.** Los términos de servicio comercial garantizan por contrato que los datos y prompts no entrenan modelos base. |
| **Revisión Humana por Terceros** | Empleados o contratistas del proveedor pueden leer fragmentos para calibrar el servicio. | Excluida por contrato, salvo investigación explícita de abuso reportado bajo salvaguardas legales. |
| **Garantía de Servicio (SLA)** | Sin compromiso de disponibilidad ni tiempo de respuesta garantizado. | Acuerdos de Nivel de Servicio formales con compromisos de tiempo de actividad (99.9 %+). |
| **Residencia y Cifrado de Datos** | Servidores genéricos globales sin control de soberanía. | Cifrado en tránsito (TLS 1.3) y en reposo (AES-256), con opción de seleccionar la región geográfica de procesamiento. |

---

## 4. Lista de Verificación Operativa para Equipos Técnicos

Antes de publicar cualquier integración de software asistida por IA:
- [ ] ¿El repositorio carece de claves de API, tokens o credenciales visibles en el historial de Git?
- [ ] ¿Las llamadas a servicios de IA se canalizan a través de un backend seguro y nunca desde el navegador?
- [ ] ¿Se activaron techos de gasto financiero (*Hard Limits*) en la consola del proveedor de la API?
- [ ] ¿Se cuenta con un disyuntor o límite máximo de iteraciones en los scripts agénticos?
- [ ] ¿El entorno de desarrollo tiene activado el filtro contra coincidencia de código público?
- [ ] ¿Las licencias de las librerías generadas o importadas fueron auditadas para descartar contaminación por Copyleft no deseada?
- [ ] ¿La organización documentó la autoría humana sobre la arquitectura y la lógica central de la solución?
