# InnHub — Academic Goals & Refactoring Criteria

> This document centralizes the academic objectives, presentation criteria, and refactoring techniques established for the evaluation of InnHub.

📄 Read this in: **English** | [Español](ACADEMIC.es.md)

---

## Academic Goals

As part of the software engineering curriculum, InnHub is designed to meet the following high-level academic goals:

- **Professional Documentation**: Build a serious academic MVP supported by rigorous, bilingual, specification-driven documentation.
- **Clean Architecture & Modularity**: Demonstrate clean separation of concerns, strict dependency boundaries, and isolated feature contexts to show design discipline.
- **Testable Business Rules**: Ensure key business rules (such as room state validation and booking overlapping policies) are decoupled from the UI and fully covered by automated tests.
- **Product Case Study**: Present the complete project as a GitHub/CV-ready professional case study, illustrating a standard workflow from planning to implementation.

---

## Academic Presentation Criteria

For the academic evaluation, the project must demonstrate explicit application and evidence of software refactoring. Refactoring is handled incrementally: patterns are extracted only when duplication becomes clear or a specific reusable responsibility is identified, keeping code and architecture aligned without artificial engineering.

The evaluation requires presenting at least two distinct refactoring techniques with explicit evidence:

1. **Extract Component**: Demonstrated through repeated UI patterns (such as buttons, status indicators, cards, and layout sections) consolidated into domain-neutral presentation components.
2. **Extract Constants / Replace Magic Strings**: Demonstrated through centralized, typed configuration objects or constants for repeated states, route labels, module metadata, and dashboard metrics.
3. **Extract Pure Function**: Illustrated by moving business rules, visual mapping calculations, or validation logic out of JSX and into pure, easily testable functions.

---

## Refactoring Techniques & Strategy

The following table maps detected code smells/problems to their corresponding project strategy and expected quality improvements:

| Technique | Problem Detected | Project Strategy | Expected Improvement |
| :--- | :--- | :--- | :--- |
| **Extract Component** | Large screens mixing JSX, layout, styling, and repeated UI fragments. | Move repeated UI into shared components only when at least two modules can reuse it or when a component has a clear generic role. | Improves cohesion, reduces duplication, and supports the product-line goal of reusable building blocks. |
| **Extract Constants / Replace Magic Strings** | Status names, labels, module names, routes, and UI messages scattered as hard-coded string literals. | Define typed constants or configuration objects for repeated states, labels, dashboard metrics, and module metadata. | Improves consistency, reduces typo-prone changes, and makes future module variation easier. |
| **Extract Pure Function** | Business rules or presentation mappings accidentally embedded inside JSX elements or event handlers. | Move reusable calculations and decisions (such as status-to-tone mapping or reservation overlap checks) into utility functions. | Makes rules highly testable, easier to review, and independent from UI rendering cycles. |

---

## Related Documents

- [Product Overview](01-product-overview.md)
- [MVP Scope](02-mvp-scope.md)
- [Internal Architecture](05-architecture.md)
- [Functional Specification](07-functional-specification.md)
