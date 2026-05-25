# InnHub — Objetivos Académicos y Criterios de Refactorización

> Este documento centraliza los objetivos académicos, criterios de presentación y técnicas de refactorización establecidos para la evaluación de InnHub.

📄 Leer en: [English](ACADEMIC.md) | **Español**

---

## Objetivos Académicos

Como parte de la materia de Ingeniería de Software II, InnHub está diseñado para cumplir con los siguientes objetivos académicos de alto nivel:

- **Documentación Profesional**: Construir un MVP académico serio respaldado por documentación rigurosa, bilingüe y orientada a especificaciones (Specification-Driven).
- **Arquitectura Limpia y Modularidad**: Demostrar una clara separación de conceptos, límites de dependencia estrictos y contextos de características aislados para exhibir disciplina de diseño.
- **Reglas de Negocio Testeables**: Asegurar que las reglas clave de negocio (como la validación de estados de habitación y las políticas de superposición de reservas) estén desacopladas de la interfaz de usuario y totalmente cubiertas por pruebas automatizadas.
- **Caso de Estudio de Producto**: Presentar el proyecto completo como un caso de estudio profesional apto para GitHub/CV, ilustrando un flujo de trabajo estándar desde la planificación hasta la implementación.

---

## Criterios de Presentación Académica

Para la evaluación académica, el proyecto debe demostrar la aplicación explícita y evidenciada de refactorización de software. La refactorización se maneja de forma incremental: los patrones se extraen solo cuando la duplicación es visible o se identifica una responsabilidad reutilizable clara, manteniendo el código y la arquitectura alineados sin ingeniería artificial.

La evaluación requiere presentar al menos dos técnicas de refactorización distintas con evidencia explícita:

1. **Extract Component**: Demostrado a través de patrones repetidos de UI (como botones, indicadores de estado, tarjetas y secciones de diseño) consolidados en componentes de presentación neutrales al dominio.
2. **Extract Constants / Replace Magic Strings**: Demostrado mediante objetos de configuración centralizados y tipados o constantes para estados repetidos, etiquetas de rutas, metadatos de módulos y métricas de dashboard.
3. **Extract Pure Function**: Ilustrado al mover las reglas de negocio, cálculos de mapeo visual o lógica de validación fuera de JSX hacia funciones puras y fácilmente testeables.

---

## Técnicas y Estrategia de Refactorización

La siguiente tabla asocia los "smells" o problemas de código detectados con su correspondiente estrategia de proyecto y la mejora de calidad esperada:

| Técnica | Problema Detectado | Estrategia del Proyecto | Mejora Esperada |
| :--- | :--- | :--- | :--- |
| **Extract Component** | Pantallas grandes que mezclan JSX, diseño, estilos y fragmentos de UI repetidos. | Mover UI repetida a componentes compartidos solo cuando al menos dos módulos puedan reutilizarla o cuando tenga un rol genérico claro. | Mejora la cohesión, reduce la duplicación y sostiene el objetivo de componentes reutilizables en la línea de producto. |
| **Extract Constants / Replace Magic Strings** | Nombres de estado, etiquetas, nombres de módulo, rutas y mensajes de UI dispersos como valores literales de cadena hardcodeados. | Definir constantes tipadas u objetos de configuración para estados repetidos, etiquetas, métricas de dashboard y metadatos de módulos. | Mejora la consistencia, reduce errores de tipeo y facilita variaciones o configuraciones futuras. |
| **Extract Pure Function** | Reglas de negocio o mapeos de presentación embebidos accidentalmente dentro de elementos JSX o manejadores de eventos. | Mover cálculos y decisiones reutilizables (como el mapeo de estado a tono visual o validaciones de disponibilidad) a funciones utilitarias. | Hace las reglas altamente testeables, más fáciles de revisar e independientes del ciclo de renderizado de la UI. |

---

## Documentos Relacionados

- [Visión del Producto](01-product-overview.es.md)
- [Alcance del MVP](02-mvp-scope.es.md)
- [Arquitectura Interna](05-architecture.es.md)
- [Especificación Funcional](07-functional-specification.es.md)
