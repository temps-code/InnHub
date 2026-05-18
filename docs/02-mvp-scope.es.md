# InnHub — Alcance MVP

> Este documento define qué incluye el MVP, qué excluye intencionalmente y qué decisiones protegen el alcance de entrega.

📄 Leer en: [English](02-mvp-scope.md) | **Español**

---

## Objetivo del MVP

Construir un MVP funcional de gestión de alojamientos que soporte la operación central de una o más propiedades registradas, manteniendo cada usuario asociado a una única propiedad.

## Resumen de alcance

![Mapa de alcance MVP de InnHub](assets/mvp-scope-map.png)

El alcance del MVP se limita intencionalmente a los módulos necesarios para construir un producto de gestión de alojamientos funcional, desplegable y defendible.

| Módulo               | Incluido | Notas                                              |
| -------------------- | -------: | -------------------------------------------------- |
| Propiedades          |       Sí | Raíz operativa para configuración y aislamiento    |
| Usuarios / Roles     |       Sí | Admin, gerente, recepción, limpieza, mantenimiento |
| Habitaciones / Tipos |       Sí | Inventario físico y base de configuración/precios  |
| Huéspedes / Clientes |       Sí | Registros pertenecen a una propiedad               |
| Reservas             |       Sí | Reserva por rango de fechas y validación           |
| Check-in / Check-out |       Sí | Acciones del ciclo operativo                       |
| Limpieza             |       Sí | Tareas, especialmente después del check-out        |
| Mantenimiento        |       Sí | Tickets que pueden bloquear habitaciones           |
| Facturación / Pagos  |       Sí | Facturas y pagos manuales                          |
| Reportes / Dashboard |       Sí | Ocupación, ingresos, alertas, resumen operativo    |
| Realtime selectivo   |       Sí | Acotado por propiedad y solo donde aporte valor    |

## Decisiones clave

| Área                  | Decisión                                                                   |
| --------------------- | -------------------------------------------------------------------------- |
| Contexto de propiedad | Todo registro operativo pertenece a una propiedad                          |
| Usuarios              | Cada usuario pertenece a una sola propiedad en el MVP                      |
| Huéspedes/clientes    | Se aíslan por propiedad                                                    |
| Estado de habitación  | No existe estado físico `reserved`; disponibilidad se calcula por reservas |
| Pagos                 | Solo seguimiento manual, sin pasarela                                      |
| Reportes              | Pueden calcularse bajo demanda                                             |
| Realtime              | Opt-in y acotado por propiedad                                             |

## Estados de habitación

```text
available → occupied → cleaning → available
available → maintenance → available
available → inactive
```

Una reserva futura no cambia el estado físico de la habitación a `reserved`; se gestiona por calendario/disponibilidad.

## Fuera de alcance

- SaaS avanzado con billing/organizaciones complejas.
- Usuarios multi-propiedad.
- Integraciones OTA externas.
- Pasarelas de pago reales.
- Contabilidad, nómina e inventario completos.
- App móvil nativa.
- CRM/BI/IA/microservicios avanzados.

## Criterios de éxito

- Configurar propiedad y habitaciones.
- Crear huésped, reserva, check-in, check-out, factura y pago.
- Limpieza y mantenimiento afectan disponibilidad.
- Dashboard/reportes dan visibilidad operativa.
- El sistema es desplegable y defendible como MVP profesional.

## Documentos relacionados

- [Product Overview](01-product-overview.es.md)
- [Domain Model](03-domain-model.es.md)
- [Functional Specification](07-functional-specification.es.md)
