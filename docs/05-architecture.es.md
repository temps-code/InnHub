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

## Documentos relacionados

- [Stack tecnológico](04-tech-stack.es.md)
- [Modelo de dominio](03-domain-model.es.md)
