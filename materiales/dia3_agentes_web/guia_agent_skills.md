# Guía práctica de Agent Skills · Día 3

> Los ejemplos de esta guía se prepararon para aprender. No incluya en una skill contraseñas, claves de API ni datos personales.

## 1. Qué es una skill

Una skill es una **carpeta** que enseña a un agente de IA a hacer una tarea repetible. Su archivo principal se llama `SKILL.md` y puede ir acompañado de plantillas, datos de ejemplo o scripts.

```text
acta-de-comite/
├── SKILL.md          ← obligatorio
├── plantilla.md      ← opcional
└── ejemplo.txt       ← opcional
```

El agente lee primero solo el **nombre** y la **descripción** de cada skill instalada. Si la tarea coincide con la descripción, carga el resto del archivo. Por eso la descripción debe decir qué hace la skill y **cuándo** usarla.

## 2. Estructura del SKILL.md

```markdown
---
name: acta-de-comite
description: Convierte notas de reunión en un acta con compromisos. Úsala cuando recibas notas de comité.
---

# Acta de comité

## Contexto
## Rol
## Tarea
## Tono
## Límites
## Recursos
```

Reglas que valida el constructor del portal:

| Campo | Regla |
|---|---|
| `name` | Minúsculas, números y guiones; máximo 64 caracteres; sin las palabras «claude» ni «anthropic». |
| `description` | Obligatoria, una sola línea, máximo 1024 caracteres, sin los signos `<` `>`; explica cuándo usarla. |
| Instrucciones | Redactadas con el método CRTT+L; la Tarea es obligatoria y los Límites son muy recomendados. |

## 3. Prompt, Gem, skill o agente

| Herramienta | Úsela cuando |
|---|---|
| Prompt | La tarea es única o cambia cada vez. |
| Gem o GPT personalizado | Necesita un rol estable para conversar. |
| Skill | Repite un procedimiento con plantillas, datos o scripts propios. |
| Agente | La tarea exige varios pasos y actuar sobre archivos u otras herramientas. |

## 4. Práctica (45 minutos)

1. Abra el constructor de skills del Día 3 en el portal.
2. Elija una tarea que repita cada semana y complete nombre, descripción y las secciones CRTT+L.
3. Corrija los errores que marque el validador hasta obtener «SKILL.md válido».
4. Copie el resultado, guárdelo como `SKILL.md` dentro de una carpeta con el mismo nombre.
5. Pruébelo en su herramienta de agentes autorizada con un caso del material de práctica y revise la salida con V.E.R.A.

Ejemplos listos en `materiales/dia3_agentes_web/skills/`: `acta-de-comite`, `respuesta-correo-institucional` e `informe-mesa-ayuda`.

## 5. Antes de instalar una skill ajena

- Conozca su origen y quién la mantiene.
- Lea el `SKILL.md` y todos sus scripts.
- Verifique que no contiene secretos ni datos personales.
- Confirme que los scripts no borran archivos ni envían datos a sitios desconocidos.
- Revise con V.E.R.A. cada resultado antes de usarlo.
