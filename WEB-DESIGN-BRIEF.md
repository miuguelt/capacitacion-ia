# Contrato de diseño web · Aula de Inteligencia Artificial

## Propósito
Portal de una sola página (SPA estática) para 4 jornadas intensivas de IA aplicada a la productividad. Funciona abierto desde `file://`, sin servidor ni herramientas de compilación.

## Paleta de descanso visual activa: Verde Salvia
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-primary` | `#2d5a4c` | `#2d5a4c` | Acciones y acentos |
| `--bg-app` | `#f8faf9` | `#121816` | Fondo general |
| `--bg-subtle` | `#f1f5f3` | `#16201c` | Tarjetas y resultados |
| `--color-instructor` | `#92400e` | `#f59e0b` | Modo facilitador y advertencias |
| `--text-main` | `#1e293b` | `#e2e8f0` | Texto principal |

Los colores se definen como tokens en `css/styles.css`; ningún componente nuevo usa colores fijos.

## Tipografía
Pila del sistema (`--font-sans`) y monoespaciada para prompts y código (`--font-mono`). Los tamaños se expresan en `rem`.

## Componentes reutilizables
- `tool-container`: herramienta interactiva.
- `prompt-box` + `copy-btn`: prompt listo para copiar.
- `comparison-grid` con `col-good` y `col-bad`: Estándar de Oro frente a Antipatrón.
- `instructor-guide-card`: visible solo en modo facilitador.

## Reglas
- Prosa a todo el ancho de su región (regla 7.4); tablas con desplazamiento propio (`table-responsive`).
- Interacciones deterministas con cuatro estados: válido, inválido, vacío y reinicio.
- Prompts enseñados solo con CRTT+L y revisados con V.E.R.A.
