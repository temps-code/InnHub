# Stack y arquitectura — HotelFlow ERP/CRM

Este documento fue dividido para que sea más fácil de leer y mantener.

Consultar:

```text
STACK_HOTELFLOW.md
ARQUITECTURA_HOTELFLOW.md
```

## Documentos

- `STACK_HOTELFLOW.md`: tecnologías elegidas, InsForge, realtime, testing y deploy.
- `ARQUITECTURA_HOTELFLOW.md`: estructura de carpetas, Feature-Sliced Architecture, Clean Architecture ligera, Atomic Design pragmático, services, hooks y reutilización.

## Decisión sobre realtime

Realtime no se usará como mecanismo global para toda la aplicación.

Se usará de forma selectiva, por hotel y por pantalla, para evitar sobrecargar el sistema:

```text
hotel:<hotel_id>:dashboard
hotel:<hotel_id>:rooms
hotel:<hotel_id>:reservations
hotel:<hotel_id>:cleaning
hotel:<hotel_id>:maintenance
hotel:<hotel_id>:billing
```

La regla será:

```text
Usar realtime donde aporte valor operativo.
No usar realtime para pantallas estáticas o de configuración simple.
```
