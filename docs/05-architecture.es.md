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

## Convención de service layer

Las features respaldadas por backend deben exponer el acceso a datos mediante hooks y services, no desde componentes JSX. Los services deben devolver valores tipados estilo `ServiceResult<T>`, normalizar fallas backend en errores locales seguros antes de llegar a callers de UI y mantener objetos raw del SDK/backend detrás de límites de servicio.

## Acceso a datos limitado por propiedad

Los services operativos deben derivar el scope de propiedad desde la sesión autenticada, no desde props de componentes, formularios, rutas, URLs ni payloads provistos por quien llama. Las lecturas y mutaciones de records asociados a una propiedad deben usar los helpers compartidos de property scope antes de construir queries de InsForge.

Usar filtros por `property_id` para tablas operativas asociadas a propiedad y limitar la raíz `properties` con `id = session.propertyId`. Si un payload incluye un `property_id` diferente al scope de sesión, los services deben rechazarlo en lugar de confiar en input de UI.

Estos helpers de repositorio son el patrón requerido en frontend/services, pero no equivalen a aislamiento completo a nivel base de datos. Las policies remotas de InsForge/PostgreSQL requieren un slice separado, aprobado, versionado y validado.

## Uso de Atomic Design

Atomic Design se aplica solo a UI compartida: botones, badges, inputs, cards, modales, tablas y primitivas de layout. Componentes específicos quedan dentro de su feature.

## Estrategia de reutilización y refactorización

InnHub prioriza componentes reutilizables antes de hacer crecer la UI específica de cada feature. Los diagramas de arquitectura y componentes existentes en este documento son la referencia para esta estrategia; no se requiere un diagrama nuevo salvo que la implementación introduzca un nuevo límite arquitectónico.

Para el marco académico, los criterios de presentación y las técnicas de refactorización, consulte [Objetivos Académicos y Criterios de Refactorización](ACADEMIC.es.md).

### Primitivas de UI compartida implementadas

Las primeras primitivas reutilizables de UI compartida ya están implementadas bajo `src/shared/components` y especificadas en `openspec/specs/shared-ui/spec.md`. Son deliberadamente pequeñas, neutrales al dominio y solo de presentación.

| Componente    | Estado actual | Objetivo de reutilización                                                                                          | Justificación técnica                                                                                                   |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `Button`      | Implementado  | Acciones primarias y secundarias en reservas, check-in/check-out, facturación y configuración                      | Centraliza estados de interacción, comportamiento accesible y consistencia visual para acciones repetidas               |
| `StatusBadge` | Implementado  | Estados de habitaciones, reservas, tareas de limpieza, tickets de mantenimiento, facturas y pagos                  | Mantiene consistente la presentación de estados y evita duplicar estilos específicos de dominio en pantallas de feature |
| `MetricCard`  | Implementado  | Indicadores de dashboard, reportes de ocupación, resúmenes de ingresos y alertas operativas                        | Define un patrón visual reutilizable para métricas provistas por quien llama, sin calcular valores de negocio           |
| `ModuleCard`  | Implementado  | Navegación o resúmenes para habitaciones, reservas, huéspedes, facturación, housekeeping, mantenimiento y reportes | Permite exponer distintos módulos de la línea de producto con un patrón de tarjeta consistente y reutilizable           |
| `PageSection` | Implementado  | Espaciado de página, encabezados, descripciones, acciones y secciones responsive compartidas                       | Separa la estructura de sección del contenido de negocio y evita repetir scaffolding en cada feature                    |

`PageSection` se implementó antes de que el routing protegido estuviera finalizado porque el patrón de sección es independiente del layout. Estas primitivas deben mantenerse genéricas: etiquetas específicas de habitaciones, reglas de reservas, cálculos de métricas y decisiones de negocio pertenecen al código de feature, schemas, services o funciones utilitarias.

## Arquitectura de rutas protegidas

Las rutas protegidas están organizadas en tres grupos con visibilidad basada en rol:

| Grupo | Rutas | Rol mínimo | Descripción |
|-------|-------|------------|-------------|
| `operations` | dashboard, rooms, room-types, guests, reservations, housekeeping, maintenance, billing | `receptionist` (la mayoría), `housekeeping`, `maintenance` | Workflows operativos diarios y acceso a módulos |
| `reports` | reports | `manager` | Reportes de ocupación, ingresos y operaciones |
| `settings` | property profile, users | `administrator` | Configuración de propiedad y gestión de personal |

Las rutas de configuración anidan bajo `/app/settings/*` (ej: `/app/settings/property`). La metadata de rutas define claves de etiquetas, paths, grupos, mapeo de íconos, visibilidad por rol y orden explícito por grupo mediante el campo `order`. El filtrado en el sidebar es solo a nivel de UI — el acceso por URL directa no está restringido. Jerarquía de roles: `administrator > manager > receptionist > (housekeeping = maintenance)`.

## Documentos relacionados

- [Criterios Académicos](ACADEMIC.es.md)
- [Stack tecnológico](04-tech-stack.es.md)
- [Modelo de dominio](03-domain-model.es.md)
