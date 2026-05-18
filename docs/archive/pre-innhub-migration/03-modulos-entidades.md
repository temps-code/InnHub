# Diseño inicial de módulos y entidades — HotelFlow ERP/CRM

Este documento toma como base `MVP_HOTELFLOW.md` y define una primera versión del modelo modular y del modelo de dominio del sistema.

---

# 1. Criterio de diseño

HotelFlow será un sistema COTS configurable para gestión hotelera.

Para mantener el MVP profesional pero manejable, se adopta esta regla:

```text
Cada hotel opera sus propios datos.
Cada usuario pertenece a un único hotel.
Todas las entidades operativas relevantes pertenecen a un hotel.
```

Esto permite que el sistema sea reutilizable por varios hoteles sin implementar todavía un SaaS multi-tenant avanzado.

---

# 2. Módulos principales

## 2.1. Módulo de hoteles

Responsabilidad:

- configurar la unidad operativa principal del sistema;
- definir parámetros generales del hotel;
- actuar como raíz de datos operativos.

Entidad principal:

```text
Hotel
```

Entidades relacionadas:

```text
User
Room
RoomType
Reservation
CleaningTask
MaintenanceTicket
Invoice
```

---

## 2.2. Módulo de usuarios y roles

Responsabilidad:

- autenticar usuarios;
- autorizar acciones según rol;
- separar responsabilidades operativas.

Entidades principales:

```text
User
Role
```

Roles iniciales:

```text
ADMIN
MANAGER
RECEPTIONIST
HOUSEKEEPING
MAINTENANCE
```

Regla clave:

```text
Un usuario pertenece a un único hotel.
Un usuario tiene un rol principal.
```

---

## 2.3. Módulo de habitaciones

Responsabilidad:

- administrar el inventario físico del hotel;
- controlar estados operativos;
- servir como base para reservas, limpieza y mantenimiento.

Entidades principales:

```text
Room
RoomType
```

Regla clave:

```text
La reserva bloquea disponibilidad por fecha, pero no cambia la habitación a RESERVED.
```

---

## 2.4. Módulo de clientes / huéspedes

Responsabilidad:

- registrar personas que reservan o se hospedan;
- mantener datos de contacto e historial.

Entidad principal:

```text
Customer
```

Regla clave:

```text
Un cliente puede tener múltiples reservas.
```

---

## 2.5. Módulo de reservas

Responsabilidad:

- gestionar el ciclo de vida de una estadía;
- validar disponibilidad;
- coordinar cambios operativos derivados del check-in y check-out.

Entidad principal:

```text
Reservation
```

Entidades relacionadas:

```text
Hotel
Customer
Room
Invoice
CleaningTask
```

Regla clave:

```text
No puede existir más de una reserva activa superpuesta para la misma habitación.
```

---

## 2.6. Módulo de limpieza

Responsabilidad:

- administrar tareas de limpieza;
- bloquear disponibilidad cuando una habitación requiere limpieza;
- liberar habitación luego de completar limpieza si no hay mantenimiento activo.

Entidad principal:

```text
CleaningTask
```

Entidades relacionadas:

```text
Hotel
Room
Reservation
User
```

---

## 2.7. Módulo de mantenimiento

Responsabilidad:

- registrar incidencias técnicas;
- bloquear habitaciones cuando corresponda;
- gestionar resolución de problemas operativos.

Entidad principal:

```text
MaintenanceTicket
```

Entidades relacionadas:

```text
Hotel
Room
User
```

---

## 2.8. Módulo de facturación

Responsabilidad:

- generar facturas asociadas a reservas;
- calcular importes básicos;
- registrar estado de pago.

Entidades principales:

```text
Invoice
Payment
```

Regla clave:

```text
Una factura pagada no debe modificarse directamente.
```

---

## 2.9. Módulo de reportes

Responsabilidad:

- calcular indicadores de ocupación;
- calcular ingresos facturados;
- entregar información por rango de fechas.

Entidades / modelos de lectura:

```text
OccupancyReport
RevenueReport
```

Nota:

Estos reportes pueden implementarse como consultas calculadas, no necesariamente como tablas persistidas.

---

## 2.10. Módulo de dashboard

Responsabilidad:

- mostrar resumen operativo del hotel;
- centralizar indicadores diarios;
- alertar tareas pendientes o situaciones críticas.

Modelo de lectura:

```text
DashboardSummary
```

Nota:

El dashboard no necesita ser una entidad persistida. Puede ser una respuesta calculada a partir de reservas, habitaciones, facturas, limpieza y mantenimiento.

---

# 3. Entidades del dominio

## 3.1. Hotel

Representa un hotel o propiedad configurada dentro del sistema.

Campos sugeridos:

```text
id
name
address
phone
email
tax_id
currency
default_tax_rate
standard_check_in_time
standard_check_out_time
status
created_at
updated_at
```

Estado sugerido:

```text
ACTIVE
INACTIVE
```

Relaciones:

```text
Hotel 1 ─── * User
Hotel 1 ─── * RoomType
Hotel 1 ─── * Room
Hotel 1 ─── * Customer
Hotel 1 ─── * Reservation
Hotel 1 ─── * CleaningTask
Hotel 1 ─── * MaintenanceTicket
Hotel 1 ─── * Invoice
```

Decisión importante:

```text
Customer también pertenece a Hotel.
```

Motivo: simplifica el MVP y evita compartir huéspedes entre hoteles, lo cual requeriría reglas de privacidad y permisos más complejas.

---

## 3.2. User

Representa un usuario interno del hotel.

Campos sugeridos:

```text
id
hotel_id
first_name
last_name
email
password_hash
role
status
created_at
updated_at
```

Roles:

```text
ADMIN
MANAGER
RECEPTIONIST
HOUSEKEEPING
MAINTENANCE
```

Estados:

```text
ACTIVE
INACTIVE
```

Relaciones:

```text
Hotel 1 ─── * User
User 1 ─── * CleaningTask assigned_to
User 1 ─── * MaintenanceTicket assigned_to
```

---

## 3.3. RoomType

Representa una categoría comercial de habitación.

Campos sugeridos:

```text
id
hotel_id
name
description
base_capacity
base_price
bed_count
status
created_at
updated_at
```

Estados:

```text
ACTIVE
INACTIVE
```

Relaciones:

```text
Hotel 1 ─── * RoomType
RoomType 1 ─── * Room
```

---

## 3.4. Room

Representa una habitación física del hotel.

Campos sugeridos:

```text
id
hotel_id
room_type_id
number
floor
capacity
base_price
status
description
is_active
created_at
updated_at
```

Estados:

```text
AVAILABLE
OCCUPIED
CLEANING_REQUIRED
CLEANING_IN_PROGRESS
MAINTENANCE
OUT_OF_SERVICE
```

Relaciones:

```text
Hotel 1 ─── * Room
RoomType 1 ─── * Room
Room 1 ─── * Reservation
Room 1 ─── * CleaningTask
Room 1 ─── * MaintenanceTicket
```

Regla importante:

```text
Room.status representa el estado físico/operativo actual, no la disponibilidad futura por fechas.
```

---

## 3.5. Customer

Representa a un cliente o huésped.

Campos sugeridos:

```text
id
hotel_id
first_name
last_name
document_type
document_number
email
phone
nationality
tax_details
created_at
updated_at
```

Relaciones:

```text
Hotel 1 ─── * Customer
Customer 1 ─── * Reservation
```

Decisión de MVP:

```text
El cliente no inicia sesión en el sistema.
```

---

## 3.6. Reservation

Representa una reserva/estadía.

Campos sugeridos:

```text
id
hotel_id
customer_id
room_id
check_in_date
check_out_date
status
guests_count
notes
created_by_user_id
checked_in_at
checked_out_at
cancelled_at
created_at
updated_at
```

Estados:

```text
PENDING
CONFIRMED
CHECKED_IN
CHECKED_OUT
CANCELLED
NO_SHOW
```

Relaciones:

```text
Hotel 1 ─── * Reservation
Customer 1 ─── * Reservation
Room 1 ─── * Reservation
User 1 ─── * Reservation created_by
Reservation 1 ─── 0..1 Invoice
Reservation 1 ─── 0..1 CleaningTask generated_after_checkout
```

Reglas principales:

- `check_out_date` debe ser posterior a `check_in_date`.
- No puede haber reservas activas superpuestas para la misma habitación.
- Una reserva cancelada no cuenta como ocupación.
- Una reserva `CONFIRMED` bloquea disponibilidad para el rango de fechas.
- El check-in solo se permite sobre reservas `CONFIRMED`.
- El check-out solo se permite sobre reservas `CHECKED_IN`.

---

## 3.7. CleaningTask

Representa una tarea de limpieza de habitación.

Campos sugeridos:

```text
id
hotel_id
room_id
reservation_id
assigned_to_user_id
status
notes
started_at
completed_at
created_at
updated_at
```

Estados:

```text
PENDING
IN_PROGRESS
COMPLETED
CANCELLED
```

Relaciones:

```text
Hotel 1 ─── * CleaningTask
Room 1 ─── * CleaningTask
Reservation 1 ─── 0..1 CleaningTask
User 1 ─── * CleaningTask assigned_to
```

Reglas principales:

- Al hacer check-out se genera una tarea `PENDING`.
- La habitación pasa a `CLEANING_REQUIRED`.
- Al iniciar limpieza, la habitación pasa a `CLEANING_IN_PROGRESS`.
- Al completar limpieza, la habitación vuelve a `AVAILABLE` si no hay mantenimiento activo.

---

## 3.8. MaintenanceTicket

Representa una incidencia o tarea de mantenimiento.

Campos sugeridos:

```text
id
hotel_id
room_id
reported_by_user_id
assigned_to_user_id
title
description
priority
status
blocks_room
reported_at
resolved_at
created_at
updated_at
```

Estados:

```text
REPORTED
IN_REVIEW
IN_REPAIR
RESOLVED
CANCELLED
```

Prioridades:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Relaciones:

```text
Hotel 1 ─── * MaintenanceTicket
Room 1 ─── * MaintenanceTicket
User 1 ─── * MaintenanceTicket reported_by
User 1 ─── * MaintenanceTicket assigned_to
```

Reglas principales:

- Si `blocks_room = true`, la habitación no puede reservarse.
- Una incidencia crítica puede poner la habitación `OUT_OF_SERVICE`.
- Al resolver mantenimiento, la habitación puede volver a `AVAILABLE` o `CLEANING_REQUIRED`.

---

## 3.9. Invoice

Representa una factura asociada a una reserva.

Campos sugeridos:

```text
id
hotel_id
reservation_id
invoice_number
status
subtotal
tax_rate
tax_amount
discount_amount
total
issued_at
paid_at
voided_at
created_at
updated_at
```

Estados:

```text
DRAFT
ISSUED
PAID
VOID
```

Relaciones:

```text
Hotel 1 ─── * Invoice
Reservation 1 ─── 0..1 Invoice
Invoice 1 ─── * Payment
```

Reglas principales:

- Una factura pertenece a una reserva.
- Una reserva puede tener como máximo una factura activa.
- El total se calcula según noches, precio base, impuestos y descuentos básicos.
- Una factura `PAID` no debe modificarse directamente.
- Una factura `VOID` no cuenta como ingreso.

---

## 3.10. Payment

Representa un pago registrado sobre una factura.

Campos sugeridos:

```text
id
hotel_id
invoice_id
amount
method
status
paid_at
created_at
updated_at
```

Métodos iniciales:

```text
CASH
CARD
TRANSFER
OTHER
```

Estados:

```text
PENDING
COMPLETED
CANCELLED
```

Relaciones:

```text
Hotel 1 ─── * Payment
Invoice 1 ─── * Payment
```

Decisión de MVP:

```text
Payment registra pagos manuales. No integra pasarelas de pago reales.
```

---

# 4. Modelos de lectura / consultas calculadas

Estas estructuras no necesariamente deben persistirse como tablas. Pueden ser respuestas de servicios o consultas agregadas.

## 4.1. OccupancyReport

Campos sugeridos:

```text
hotel_id
from_date
to_date
total_rooms
occupied_rooms
available_rooms
cleaning_rooms
maintenance_rooms
out_of_service_rooms
occupancy_percentage
cancelled_reservations
invoiced_revenue
```

---

## 4.2. DashboardSummary

Campos sugeridos:

```text
hotel_id
date
current_occupancy_percentage
today_reservations
today_pending_check_ins
today_pending_check_outs
available_rooms
occupied_rooms
cleaning_rooms
maintenance_rooms
pending_invoices
today_revenue
month_revenue
operational_alerts
```

Alertas posibles:

```text
Habitaciones pendientes de limpieza
Habitaciones fuera de servicio
Check-ins atrasados
Check-outs pendientes
Facturas vencidas o pendientes
Mantenimientos críticos
```

---

# 5. Relaciones generales del dominio

```text
Hotel 1 ─── * User
Hotel 1 ─── * RoomType
Hotel 1 ─── * Room
Hotel 1 ─── * Customer
Hotel 1 ─── * Reservation
Hotel 1 ─── * CleaningTask
Hotel 1 ─── * MaintenanceTicket
Hotel 1 ─── * Invoice
Hotel 1 ─── * Payment

RoomType 1 ─── * Room
Customer 1 ─── * Reservation
Room 1 ─── * Reservation
Reservation 1 ─── 0..1 Invoice
Invoice 1 ─── * Payment
Reservation 1 ─── 0..1 CleaningTask
Room 1 ─── * CleaningTask
Room 1 ─── * MaintenanceTicket
User 1 ─── * CleaningTask
User 1 ─── * MaintenanceTicket
```

---

# 6. Entidades núcleo vs. modelos derivados

## Entidades persistentes recomendadas

```text
Hotel
User
RoomType
Room
Customer
Reservation
CleaningTask
MaintenanceTicket
Invoice
Payment
```

## Modelos derivados / no necesariamente persistentes

```text
OccupancyReport
RevenueReport
DashboardSummary
OperationalAlert
```

---

# 7. Decisiones importantes tomadas

## 7.1. Usuario de un solo hotel

```text
Un usuario pertenece a un único hotel.
```

Motivo:

- simplifica permisos;
- evita contexto activo multi-hotel;
- reduce errores de acceso;
- mantiene el MVP entendible.

---

## 7.2. Cliente pertenece a hotel

```text
Un cliente pertenece a un hotel.
```

Motivo:

- simplifica privacidad y permisos;
- evita compartir historial entre hoteles;
- mantiene separación clara de datos.

---

## 7.3. Sin estado RESERVED en habitación

```text
RESERVED no es estado físico de Room.
```

Motivo:

- una habitación puede estar disponible físicamente hoy pero reservada para una fecha futura;
- la disponibilidad debe calcularse con reservas por rango de fechas;
- evita inconsistencias entre estado físico y agenda.

---

## 7.4. Dashboard y reportes como consultas

```text
DashboardSummary y OccupancyReport pueden calcularse bajo demanda.
```

Motivo:

- evita duplicar datos;
- reduce complejidad del MVP;
- permite mostrar valor sin crear tablas innecesarias.

---

# 8. Próximo paso recomendado

El siguiente paso es elegir el stack tecnológico y tipo de arquitectura.

Decisiones pendientes:

```text
Backend
Frontend
Base de datos
ORM
Autenticación
Estrategia de tests
Estructura modular del proyecto
```
