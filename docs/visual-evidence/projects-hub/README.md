# Evidencias Visuales: Hub de Proyectos & Entregables (`#proyectos`)

Este directorio contiene las capturas de pantalla de validación visual generadas automáticamente mediante Microsoft Edge en modo headless a través del Chrome DevTools Protocol (CDP), en estricto cumplimiento de la Regla 7.4 y los estándares de aseguramiento de calidad de DevBrain v8.10.

## Metadatos de la Ejecución
- **Motor de renderizado**: Microsoft Edge (Chromium / CDP nativo)
- **Modo**: Headless (`--headless=new`)
- **Fecha de generación**: 2026-11-09
- **Script generador**: `scripts/capture-projects-hub-visuals.cjs`
- **Total de capturas**: 18 imágenes PNG (3 vistas × 6 viewports responsive)

## Matriz de Capturas

| Vista | Viewport | Archivo | Descripción |
|---|---|---|---|
| **Kanban** | 320 px | `kanban-320px.png` | Móvil estrecho: columnas apiladas verticalmente, controles de tarjeta fluidos |
| **Kanban** | 390 px | `kanban-390px.png` | Móvil estándar: espaciado adaptativo y legibilidad de texto |
| **Kanban** | 768 px | `kanban-768px.png` | Tableta: rejilla kanban fluida de 3 columnas |
| **Kanban** | 1440 px | `kanban-1440px.png` | Escritorio HD: distribución balanceada, tiradores y badges |
| **Kanban** | 1920 px | `kanban-1920px.png` | Full HD: aprovechamiento total del ancho disponible (inline-size: 100%) |
| **Kanban** | 2560 px | `kanban-2560px.png` | Monitor 2K / QHD: renderizado nítido sin espacios vacíos arbitrarios |
| **Bento** | 320 px | `bento-320px.png` | Móvil estrecho: tarjetas bento en columna única |
| **Bento** | 390 px | `bento-390px.png` | Móvil estándar: previsualización SVG y badges responsive |
| **Bento** | 768 px | `bento-768px.png` | Tableta: cuadrícula visual de 2 columnas |
| **Bento** | 1440 px | `bento-1440px.png` | Escritorio HD: cuadrícula fluida auto-fit minmax(20rem, 1fr) |
| **Bento** | 1920 px | `bento-1920px.png` | Full HD: tarjetas bento expandidas proporcionalmente |
| **Bento** | 2560 px | `bento-2560px.png` | Monitor 2K / QHD: cuadrícula multiculumna amplia |
| **Lista** | 320 px | `lista-320px.png` | Móvil estrecho: tabla contenida con `overflow-x: auto` sin romper la pantalla |
| **Lista** | 390 px | `lista-390px.png` | Móvil estándar: controles ▲ ▼ y selector de estado accesibles |
| **Lista** | 768 px | `lista-768px.png` | Tableta: visualización tabular completa |
| **Lista** | 1440 px | `lista-1440px.png` | Escritorio HD: tabla alineada con metadatos completos y botón de apertura rápida |
| **Lista** | 1920 px | `lista-1920px.png` | Full HD: tabla con ancho completo y contraste WCAG |
| **Lista** | 2560 px | `lista-2560px.png` | Monitor 2K / QHD: alineación precisa y padding fluido |

## Criterios de Aceptación Verificados
1. **Regla 7.4 (Ancho y composición del texto)**: 0 desbordamientos horizontales en la página global; la tabla compacta encapsula su scroll horizontal dentro de `.projects-list-table-container`.
2. **Prosa sin truncamiento**: Títulos, descripciones y metas se leen completos sin elipsis forzadas (`text-overflow: ellipsis` deshabilitado en contenido natural).
3. **Persistencia y reactividad**: Alternancia instantánea entre Kanban, Bento y Lista con sincronización del selector en la barra de herramientas.
