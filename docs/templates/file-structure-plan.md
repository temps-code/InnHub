# InnHub Documentation File Structure Plan

Approved documentation naming strategy.

## Language Policy

- English is the primary documentation language.
- Every public or technical document should have a Spanish counterpart.
- Convention:
  - English: `<name>.md`
  - Spanish: `<name>.es.md`

## Root Files

```txt
README.md
README.es.md
```

| File           | Purpose                             |
| -------------- | ----------------------------------- |
| `README.md`    | Main English showcase for GitHub/CV |
| `README.es.md` | Spanish version of the showcase     |

## Docs Folder

```txt
docs/
├── README.md
├── README.es.md
├── 01-product-overview.md
├── 01-product-overview.es.md
├── 02-mvp-scope.md
├── 02-mvp-scope.es.md
├── 03-domain-model.md
├── 03-domain-model.es.md
├── 04-tech-stack.md
├── 04-tech-stack.es.md
├── 05-architecture.md
├── 05-architecture.es.md
├── 06-git-workflow.md
├── 06-git-workflow.es.md
├── 07-functional-specification.md
├── 07-functional-specification.es.md
└── archive/
```

## Migration Map

| Current                          | New EN                           | New ES                              |
| -------------------------------- | -------------------------------- | ----------------------------------- |
| `docs/README.md`                 | `docs/README.md`                 | `docs/README.es.md`                 |
| `01-analisis-formal.md`          | `01-product-overview.md`         | `01-product-overview.es.md`         |
| `02-mvp.md`                      | `02-mvp-scope.md`                | `02-mvp-scope.es.md`                |
| `03-modulos-entidades.md`        | `03-domain-model.md`             | `03-domain-model.es.md`             |
| `04-stack-tecnologico.md`        | `04-tech-stack.md`               | `04-tech-stack.es.md`               |
| `05-arquitectura-interna.md`     | `05-architecture.md`             | `05-architecture.es.md`             |
| `06-flujo-github.md`             | `06-git-workflow.md`             | `06-git-workflow.es.md`             |
| `07-especificacion-funcional.md` | `07-functional-specification.md` | `07-functional-specification.es.md` |
