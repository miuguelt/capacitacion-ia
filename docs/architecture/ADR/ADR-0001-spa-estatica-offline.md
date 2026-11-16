# ADR-0001: Portal SPA estático, offline y sin compilación

- **Estado:** aceptada
- **Fecha:** 2026-11-15

## Contexto
La capacitación se dicta en aulas con redes institucionales que bloquean CDN y sin permisos para instalar herramientas. El instructor debe poder abrir el portal con doble clic.

## Decisión
- HTML, CSS y JavaScript nativos, sin Vite, Webpack ni dependencias de Node.js en tiempo de ejecución.
- Scripts clásicos cargados en orden en `index.html`; cada módulo publica sus funciones como globales y, en Node.js, mediante `module.exports` para las pruebas.
- Lógica pura en módulos (`js/*-module.js`); enlace con el DOM en `js/app.js`.
- Réplicas en `src/` verificadas por `scripts/verify-mirror-sync.py`.

## Consecuencias
- El portal funciona desde `file://` y en cualquier navegador moderno.
- Las pruebas corren con `node --test` y `pytest` sin navegador.
- Cada módulo nuevo debe agregarse a `index.html`, a los espejos y al flujo de CI.
