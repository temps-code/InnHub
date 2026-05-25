# InnHub — Modelo de Dominio

> Este documento define las entidades principales, relaciones y reglas de negocio del MVP.

📄 Leer en: [English](03-domain-model.md) | **Español**

---

## Resumen ejecutivo

InnHub se organiza alrededor de una entidad raíz `Property`. Todo registro operativo pertenece a una propiedad para simplificar permisos, reportes, reservas y visibilidad de datos en el MVP.

## Diagrama de modelo de dominio

![Modelo de dominio de InnHub](assets/domain-model.png)

El diagrama muestra `Property` como raíz operativa. El ERD a nivel base de datos expande este modelo con ítems de reserva, estadías y huéspedes por estadía para separar reservas planificadas de ocupación real.

## Entidades principales

| Entidad             | Propósito                                                                    |
| ------------------- | ---------------------------------------------------------------------------- |
| `Property`          | Configuración del alojamiento y raíz operativa                                |
| `Profile`           | Perfil interno de staff vinculado a auth y asignado a una propiedad          |
| `RoomType`          | Categoría/plantilla de habitaciones similares                                 |
| `Room`              | Habitación/unidad física con identificador flexible                           |
| `Guest`             | Persona/cliente usado como contacto, ocupante, receptor de factura o pagador |
| `Reservation`       | Cabecera comercial de reserva con fechas planificadas y contacto principal   |
| `ReservationItem`   | Una habitación/categoría solicitada dentro de una reserva                     |
| `Stay`              | Ocupación real de habitación, desde reserva o walk-in                         |
| `StayGuest`         | Ocupante vinculado a una estadía                                              |
| `HousekeepingTask`  | Tarea de limpieza, usualmente luego del check-out                             |
| `MaintenanceTicket` | Incidencia operativa que puede bloquear habitaciones                          |
| `Invoice`           | Documento de facturación para seña, estadía o cargo manual                    |
| `Payment`           | Registro manual de pago vinculado a una factura                               |

## Relaciones

Para ver las relaciones físicas a nivel de base de datos y las restricciones detalladas de las tablas, consulte el [ERD de base de datos](08-database-erd.es.md).

## Modelos derivados

Pueden calcularse bajo demanda:

- `OccupancyReport`
- `RevenueReport`
- `DashboardSummary`
- `OperationalAlert`

## Reglas de negocio

| Regla                                      | Explicación                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| Operación separada por propiedad           | Los registros operativos incluyen `property_id` para aislamiento de datos      |
| Sin estado físico `reserved`               | Los compromisos futuros viven en ítems de reserva, no en `rooms.state`         |
| Ítems de reserva confirmados bloquean      | Solo los ítems confirmados reservan disponibilidad futura                      |
| Estadías activas bloquean ocupación actual | La ocupación real se representa con estadías activas                           |
| Check-out genera limpieza                  | Luego del check-out, la habitación entra al flujo de limpieza                  |
| Mantenimiento bloquea disponibilidad       | Habitaciones en mantenimiento no deben asignarse                               |
| Facturas pagadas se protegen               | No se modifican libremente                                                     |
| Reportes derivados                         | Resumen de datos operativos; no requieren persistencia inicial                 |

## Decisión de nombres

Se usa `Property` como raíz amplia porque InnHub no es solo para hoteles. Se mantiene `Room` en el MVP porque el producto sigue siendo basado en habitaciones y conviene mantenerlo simple.

## Documentos relacionados

- [ERD de base de datos](08-database-erd.es.md)
- [Alcance MVP](02-mvp-scope.es.md)
- [Especificación funcional](07-functional-specification.es.md)
- [Arquitectura](05-architecture.es.md)
