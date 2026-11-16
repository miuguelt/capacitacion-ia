# Aprendizajes de diseño e interacción

- **Funciones puras separadas del DOM.** Los módulos (`dia3-module.js`, `productivity-module.js`) exponen funciones deterministas probadas con `node:test`; el enlace con el DOM vive en `app.js`. Así se alcanza 100 % de cobertura sin navegador.
- **Cuatro estados visibles.** Cada herramienta devuelve un objeto con `state` (`empty`, `invalid`, `valid`) y el HTML lo refleja en `data-state`, lo que facilita pruebas y estilos.
- **Sin temporizadores simulados.** Un retardo para «parecer que piensa» confunde y viola la regla 10.3; solo se usan temporizadores para retroalimentación visual breve (por ejemplo, «¡Copiado!»).
- **Espejos `src/`.** Cada archivo fuente tiene réplicas en `src/`; `scripts/verify-mirror-sync.py` comprueba la paridad SHA-256 y debe incluir todo módulo nuevo.
- **Impresión acotada.** El kit de bolsillo se imprime activando la clase `printing-kit` solo durante la impresión, sin afectar la impresión del resto del portal.
- **Escapado obligatorio.** Todo texto insertado con `innerHTML` pasa por una función de escapado probada.
