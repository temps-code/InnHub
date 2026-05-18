# MVP pulido de HotelFlow ERP/CRM

## Tipo de sistema

**HotelFlow ERP/CRM** será un sistema **COTS configurable para gestión hotelera**.

No será todavía un SaaS multi-tenant avanzado, pero sí permitirá registrar/configurar distintos hoteles dentro del sistema.

La regla base será:

```text
Cada hotel opera sus propios datos.
Cada usuario pertenece a un solo hotel.
Todas las operaciones se filtran por hotel.
```

---

# Módulos del MVP

## 1. Hoteles / Propiedades

Permite configurar la unidad operativa principal.

Incluye:

- nombre del hotel;
- dirección;
- teléfono;
- email;
- datos fiscales;
- moneda;
- impuesto por defecto;
- hora estándar de check-in;
- hora estándar de check-out;
- estado del hotel.

Relaciones:

```text
Hotel 1 ─── * Usuarios
Hotel 1 ─── * Habitaciones
Hotel 1 ─── * Tipos de habitación
Hotel 1 ─── * Reservas
Hotel 1 ─── * Facturas
Hotel 1 ─── * Tareas de limpieza
Hotel 1 ─── * Tickets de mantenimiento
```

---

## 2. Usuarios y roles

Permite controlar acceso al sistema.

Regla:

```text
Un usuario pertenece a un único hotel.
Un usuario tiene un rol principal.
```

Roles iniciales:

```text
ADMIN
MANAGER
RECEPTIONIST
HOUSEKEEPING
MAINTENANCE
```

Responsabilidades:

- `ADMIN`: configura hotel, usuarios, habitaciones, tarifas y parámetros.
- `MANAGER`: consulta dashboard, reportes e ingresos.
- `RECEPTIONIST`: gestiona clientes, reservas, check-in, check-out y facturación.
- `HOUSEKEEPING`: gestiona tareas de limpieza.
- `MAINTENANCE`: gestiona tickets de mantenimiento.

---

## 3. Habitaciones

Permite administrar el inventario físico del hotel.

Incluye:

- número/código de habitación;
- piso;
- tipo de habitación;
- capacidad;
- precio base;
- estado operativo;
- descripción;
- si está activa o no.

Estados:

```text
AVAILABLE
OCCUPIED
CLEANING_REQUIRED
CLEANING_IN_PROGRESS
MAINTENANCE
OUT_OF_SERVICE
```

Nota importante:

No usaría `RESERVED` como estado de habitación.

La reserva bloquea disponibilidad por fecha, pero la habitación sigue siendo físicamente `AVAILABLE` hasta el check-in.

---

## 4. Tipos de habitación

Módulo soporte de habitaciones.

Incluye:

- nombre;
- descripción;
- capacidad base;
- precio base;
- cantidad de camas;
- estado activo/inactivo.

Ejemplos:

```text
Single
Double
Suite
Family
```

---

## 5. Clientes / Huéspedes

Permite registrar personas que realizan reservas o se hospedan.

Incluye:

- nombre;
- apellido;
- documento;
- email;
- teléfono;
- nacionalidad;
- datos fiscales opcionales;
- historial de reservas.

Regla:

```text
Un cliente puede tener múltiples reservas.
```

Por ahora no haría portal de cliente ni login de huésped.

---

## 6. Reservas

Módulo central del sistema.

Incluye:

- crear reserva;
- confirmar reserva;
- cancelar reserva;
- check-in;
- check-out;
- consultar reservas por fecha, habitación, cliente o estado;
- validar disponibilidad;
- evitar solapamiento de fechas.

Estados:

```text
PENDING
CONFIRMED
CHECKED_IN
CHECKED_OUT
CANCELLED
NO_SHOW
```

Reglas:

- una reserva pertenece a un hotel;
- una reserva pertenece a un cliente;
- una reserva usa una habitación;
- no puede haber reservas activas superpuestas para la misma habitación;
- no se puede reservar habitación en mantenimiento;
- no se puede reservar habitación fuera de servicio;
- fecha de salida > fecha de entrada;
- check-in solo sobre reserva confirmada;
- check-out solo sobre reserva con check-in.

---

## 7. Limpieza

Incluye:

- generar tarea al hacer check-out;
- listar tareas pendientes;
- asignar responsable;
- iniciar tarea;
- completar tarea;
- registrar observaciones.

Estados:

```text
PENDING
IN_PROGRESS
COMPLETED
CANCELLED
```

Reglas:

- al hacer check-out, la habitación pasa a `CLEANING_REQUIRED`;
- al iniciar limpieza, pasa a `CLEANING_IN_PROGRESS`;
- al completar limpieza, vuelve a `AVAILABLE` si no hay mantenimiento activo.

---

## 8. Mantenimiento

Incluye:

- reportar incidencia;
- definir prioridad;
- asignar responsable;
- cambiar estado;
- bloquear habitación;
- resolver incidencia;
- registrar observaciones.

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

Reglas:

- habitación con mantenimiento activo no puede reservarse;
- incidencia crítica puede poner habitación `OUT_OF_SERVICE`;
- al resolver mantenimiento, la habitación puede volver a `AVAILABLE` o `CLEANING_REQUIRED`.

---

## 9. Facturación

Incluye:

- generar factura desde reserva;
- calcular noches;
- tomar precio base de la habitación/tipo;
- aplicar impuesto del hotel;
- aplicar descuento básico;
- registrar estado de pago.

Estados:

```text
DRAFT
ISSUED
PAID
VOID
```

Reglas:

- una factura pertenece a una reserva;
- una reserva puede tener una factura;
- factura pagada no se modifica directamente;
- factura anulada no cuenta como ingreso.

---

## 10. Reportes de ocupación

Incluye:

- ocupación por rango de fechas;
- habitaciones disponibles;
- habitaciones ocupadas;
- habitaciones bloqueadas;
- habitaciones en limpieza;
- porcentaje de ocupación;
- reservas canceladas;
- ingresos facturados por período.

---

## 11. Dashboard operativo

Será la vista principal del sistema.

Debe mostrar:

```text
Ocupación actual %
Reservas de hoy
Check-ins pendientes
Check-outs pendientes
Habitaciones disponibles
Habitaciones ocupadas
Habitaciones en limpieza
Habitaciones en mantenimiento
Facturas pendientes
Ingresos del día/mes
Alertas operativas
```

Este dashboard no es BI avanzado. Es un panel operativo para gestión diaria.

---

# Definición final de MVP hasta ahora

```text
HotelFlow ERP/CRM

Sistema COTS configurable para gestión hotelera, orientado a múltiples hoteles registrados en la plataforma, donde cada hotel gestiona sus propios usuarios, habitaciones, reservas, limpieza, mantenimiento, facturación, reportes y dashboard operativo.

Cada usuario pertenece a un único hotel.
Cada operación se ejecuta dentro del contexto de ese hotel.
```

Este alcance queda como base viva para seguir puliendo el sistema antes de pasar al diseño técnico.
