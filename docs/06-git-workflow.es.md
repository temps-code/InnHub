# InnHub — Flujo Git

> Este documento define ramas, issues, commits y pull requests para un proyecto individual académico/profesional.

📄 Leer en: [English](06-git-workflow.md) | **Español**

---

## Seguimiento del trabajo

InnHub usa GitHub Projects para monitorear estado de issues, avance de PRs, validación en QA y flujo de entrega. Todo trabajo significativo empieza como issue antes de integrar cambios de código o documentación.

![Flujo Git de InnHub](assets/git-workflow.png)

El flujo mantiene trazabilidad explícita: issue, trabajo en `features`, commits, pull request, validación en QA y merge final a `main`.

## Estrategia de ramas

Se usan solo cuatro ramas permanentes:

| Rama       | Propósito                                         |
| ---------- | ------------------------------------------------- |
| `main`     | Versión estable, desplegable y lista para defensa |
| `qa`       | Validación antes de producción/main               |
| `features` | Desarrollo normal de funcionalidades              |
| `refactor` | Correcciones estructurales antes de volver a QA   |

No se usan ramas temporales `feature/*`, `bugfix/*` o `docs/*` para este proyecto individual.

## Flujo normal

```text
GitHub Project → Issue → trabajo en features → commits → PR a qa → validación → PR a main
```

Cada PR debe referenciar su issue relacionada. Un PR puede contener varios commits siempre que pertenezcan a la misma unidad revisable de trabajo.

Si QA detecta problemas estructurales:

```text
qa → refactor → fixes/cleanup → PR a qa → PR a main
```

## Regla issue-first

Todo cambio significativo debe estar vinculado a una issue concreta con alcance, criterios de aceptación y evidencia esperada.

## Formato de commits

```text
type(scope): descripción corta
```

Tipos sugeridos: `feat`, `fix`, `docs`, `refactor`, `test`, `style`, `chore`.

Ejemplos:

```text
feat(reservations): add date overlap validation
docs(readme): add product overview section
refactor(rooms): extract availability calculation
```

## Reglas de PR

- Vincular issue relacionada.
- Explicar qué cambió y por qué.
- Incluir capturas si hay cambios UI.
- Incluir evidencia de test/build cuando exista.
- Evitar mezclar cambios grandes no relacionados.

## Checklist para defensa

- Rama `main` estable.
- README actualizado.
- Instrucciones de instalación/ejecución.
- Capturas o demo.
- Link de despliegue si existe.
- Modelo de datos, stack, arquitectura y workflow documentados.
- Issues y PRs representativos.

## Documentos relacionados

- [Architecture](05-architecture.es.md)
- [Tech Stack](04-tech-stack.es.md)
