# InnHub — Arquitectura Interna

> Este documento define la estructura frontend interna y los límites que mantienen el MVP mantenible.

📄 Leer en: [English](05-architecture.md) | **Español**

---

## Objetivos

- Mantener el código de features cerca de su contexto de negocio.
- Reutilizar UI compartida sin sobreingeniería.
- Encapsular InsForge detrás de services/hooks.
- Evitar reglas de negocio dentro del JSX.
- Hacer testeables las reglas importantes.

## Vista general

![Arquitectura de InnHub](assets/architecture-overview.png)

## Vista de componentes COTS

![Diagrama de componentes COTS de InnHub](assets/cots-component-diagram.png)

InnHub se diseña como un producto configurable tipo COTS. Módulos de negocio como reservas, habitaciones, facturación, reportes y dashboard se apoyan en componentes técnicos reutilizables como UI compartida, hooks, services, schemas de validación y funciones utilitarias.

## Mapa de arquitectura frontend

![Mapa de arquitectura frontend de InnHub](assets/frontend-architecture-map.png)

El frontend combina tres decisiones arquitectónicas: Feature-Based Architecture organiza capacidades de negocio, Clean Architecture ligera controla la dirección de dependencias dentro de cada feature y Atomic Design mantiene primitivas de UI reutilizables entre módulos.

## Estructura sugerida

```text
src/
├── app/
│   ├── routes/
│   └── providers/
├── features/
│   ├── auth/
│   ├── properties/
│   ├── users/
│   ├── rooms/
│   ├── room-types/
│   ├── guests/
│   ├── reservations/
│   ├── housekeeping/
│   ├── maintenance/
│   ├── billing/
│   ├── reports/
│   └── dashboard/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── types/
└── main.tsx
```

## Reglas de capas

| Regla                                       | Razón                                     |
| ------------------------------------------- | ----------------------------------------- |
| Componentes no llaman InsForge directamente | UI testeable y reemplazable               |
| Services de feature manejan acceso a datos  | Mantiene contexto local                   |
| UI compartida es genérica                   | Evita filtrar dominio en componentes base |
| Reglas puras cuando sea posible             | Facilita unit tests                       |
| Realtime envuelto en hooks/services         | Evita duplicar lógica de suscripción      |

## Uso de Atomic Design

Atomic Design se aplica solo a UI compartida: botones, badges, inputs, cards, modales, tablas y primitivas de layout. Componentes específicos quedan dentro de su feature.

## Estrategia de reutilización y refactorización

InnHub prioriza componentes reutilizables antes de hacer crecer la UI específica de cada feature. Los diagramas de arquitectura y componentes existentes en este documento son la referencia para esta estrategia; no se requiere un diagrama nuevo salvo que la implementación introduzca un nuevo límite arquitectónico.

### Primitivas de UI compartida implementadas

Las primeras primitivas reutilizables de UI compartida ya están implementadas bajo `src/shared/components` y especificadas en `openspec/specs/shared-ui/spec.md`. Son deliberadamente pequeñas, neutrales al dominio y solo de presentación.

| Componente    | Estado actual | Objetivo de reutilización                                                                                          | Justificación técnica                                                                                                   |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `Button`      | Implementado  | Acciones primarias y secundarias en reservas, check-in/check-out, facturación y configuración                      | Centraliza estados de interacción, comportamiento accesible y consistencia visual para acciones repetidas               |
| `StatusBadge` | Implementado  | Estados de habitaciones, reservas, tareas de limpieza, tickets de mantenimiento, facturas y pagos                  | Mantiene consistente la presentación de estados y evita duplicar estilos específicos de dominio en pantallas de feature |
| `MetricCard`  | Implementado  | Indicadores de dashboard, reportes de ocupación, resúmenes de ingresos y alertas operativas                        | Define un patrón visual reutilizable para métricas provistas por quien llama, sin calcular valores de negocio           |
| `ModuleCard`  | Implementado  | Navegación o resúmenes para habitaciones, reservas, huéspedes, facturación, housekeeping, mantenimiento y reportes | Permite exponer distintos módulos de la línea de producto con un patrón de tarjeta consistente y reutilizable           |
| `PageSection` | Implementado  | Espaciado de página, encabezados, descripciones, acciones y secciones responsive compartidas                       | Separa la estructura de sección del contenido de negocio y evita repetir scaffolding en cada feature                    |

`PageSection` se implementó en lugar de un `AppLayout` completo en esta etapa porque las decisiones de routing, autenticación, navegación y layouts protegidos pertenecen a trabajo posterior. Estas primitivas deben mantenerse genéricas: etiquetas específicas de habitaciones, reglas de reservas, cálculos de métricas y decisiones de negocio pertenecen al código de feature, schemas, services o funciones utilitarias.

### Técnicas de refactorización

| Técnica                                   | Problema detectado                                                                                      | Estrategia del proyecto                                                                                                                                                                | Mejora esperada                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Extract Component                         | Las pantallas grandes pueden mezclar JSX, layout, estilos y fragmentos de UI repetidos                  | Mover UI repetida a componentes compartidos solo cuando al menos dos módulos puedan reutilizarla o cuando tenga un rol genérico claro                                                  | Mejora la cohesión, reduce duplicación y sostiene el objetivo de componentes reutilizables en la línea de producto |
| Extract Constants / Replace Magic Strings | Nombres de estados, labels, módulos, rutas y mensajes pueden quedar dispersos como valores hardcodeados | Definir constantes tipadas u objetos de configuración para estados, labels, métricas de dashboard y metadatos de módulos repetidos                                                     | Mejora la consistencia, reduce errores por tipeo y facilita variaciones futuras entre módulos                      |
| Extract Pure Function                     | Las reglas de negocio pueden terminar accidentalmente dentro de JSX o handlers                          | Mover cálculos y decisiones reutilizables, como mapeo de estado a tono visual o validaciones de disponibilidad, a utilidades de feature o compartidas cuando sean neutrales al dominio | Hace las reglas testeables, más fáciles de revisar e independientes del renderizado de UI                          |

La refactorización debe ser incremental. El objetivo no es construir un design system grande de forma temprana, sino extraer patrones estables a medida que crece el MVP.

### Criterios para la presentación académica

Para el entregable de refactorización, el proyecto presentará al menos dos técnicas con evidencia explícita:

1. **Extract Component** se demostrará mediante patrones repetidos de UI como botones, indicadores de estado, cards y secciones de layout.
2. **Extract Constants / Replace Magic Strings** se demostrará mediante configuración compartida para nombres de estado, labels de rutas, metadatos de módulos o métricas de dashboard repetidas.
3. **Extract Pure Function** podrá agregarse cuando las reglas de negocio o los mapeos visuales necesiten lógica testeable fuera del JSX.

La fase de implementación solo debe extraer un componente o regla cuando la duplicación sea visible o el rol reutilizable sea claro. Esto mantiene la documentación alineada con el código y evita refactorizaciones artificiales.

## Documentos relacionados

- [Stack tecnológico](04-tech-stack.es.md)
- [Modelo de dominio](03-domain-model.es.md)
