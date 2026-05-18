# Especificación funcional — HotelFlow ERP/CRM

> Nombre tentativo: **HotelFlow ERP/CRM**. El nombre final de la plataforma todavía está pendiente de definición.

---

# 1. Introducción

HotelFlow ERP/CRM es un sistema COTS configurable para gestión hotelera. Su objetivo es centralizar la operación diaria de hoteles mediante módulos de reservas, limpieza, mantenimiento, facturación, reportes de ocupación y dashboard operativo.

El sistema no pretende ser un SaaS multi-tenant avanzado en esta etapa. Para el MVP, permitirá registrar/configurar distintos hoteles, pero cada usuario pertenecerá a un único hotel y todas las operaciones se ejecutarán dentro del contexto de ese hotel.

---

# 2. Objetivo general

Desarrollar un MVP funcional de un sistema ERP/CRM hotelero que permita administrar reservas, habitaciones, limpieza, mantenimiento, facturación y reportes de ocupación, aplicando buenas prácticas de Ingeniería de Software, reutilización, modularidad y código limpio.

---

# 3. Objetivos específicos

1. Gestionar hoteles o propiedades configurables.
2. Administrar usuarios y roles internos.
3. Gestionar habitaciones y tipos de habitación.
4. Registrar clientes o huéspedes.
5. Crear, confirmar, cancelar y finalizar reservas.
6. Validar disponibilidad y evitar reservas superpuestas.
7. Gestionar tareas de limpieza asociadas a habitaciones.
8. Gestionar incidencias de mantenimiento.
9. Generar facturación básica asociada a reservas.
10. Consultar reportes de ocupación.
11. Mostrar un dashboard operativo con indicadores clave.
12. Mantener una arquitectura interna modular, reutilizable y mantenible.

---

# 4. Alcance del MVP

El MVP incluirá los siguientes módulos:

```text
Hoteles / Propiedades
Usuarios y roles
Habitaciones
Tipos de habitación
Clientes / Huéspedes
Reservas
Limpieza
Mantenimiento
Facturación
Reportes de ocupación
Dashboard operativo
```

---

# 5. Actores del sistema

## 5.1. Administrador

Responsable de la configuración general del hotel.

Puede:

- configurar datos del hotel;
- gestionar usuarios;
- gestionar habitaciones;
- gestionar tipos de habitación;
- consultar reportes;
- revisar facturación.

## 5.2. Gerente

Responsable de supervisar la operación.

Puede:

- consultar dashboard;
- consultar reportes de ocupación;
- revisar ingresos;
- supervisar estado operativo del hotel.

## 5.3. Recepcionista

Responsable de la operación diaria de reservas.

Puede:

- registrar clientes;
- crear reservas;
- confirmar reservas;
- cancelar reservas;
- hacer check-in;
- hacer check-out;
- generar facturas.

## 5.4. Personal de limpieza

Responsable de tareas de limpieza.

Puede:

- ver tareas asignadas;
- iniciar limpieza;
- completar limpieza;
- registrar observaciones.

## 5.5. Personal de mantenimiento

Responsable de incidencias técnicas.

Puede:

- ver tickets asignados;
- actualizar estado de tickets;
- registrar reparaciones;
- marcar incidencias como resueltas.

---

# 6. Requisitos funcionales

## RF-01 Gestión de hoteles

El sistema debe permitir registrar y configurar hoteles o propiedades.

Datos mínimos:

```text
nombre
dirección
teléfono
email
datos fiscales
moneda
impuesto por defecto
hora estándar de check-in
hora estándar de check-out
estado
```

---

## RF-02 Gestión de usuarios y roles

El sistema debe permitir gestionar usuarios internos asociados a un hotel.

Roles iniciales:

```text
ADMIN
MANAGER
RECEPTIONIST
HOUSEKEEPING
MAINTENANCE
```

Reglas:

- un usuario pertenece a un único hotel;
- un usuario tiene un rol principal;
- las acciones se restringen según rol.

---

## RF-03 Gestión de tipos de habitación

El sistema debe permitir crear, editar, listar y desactivar tipos de habitación.

Datos mínimos:

```text
nombre
descripción
capacidad base
precio base
cantidad de camas
estado
```

---

## RF-04 Gestión de habitaciones

El sistema debe permitir crear, editar, listar y desactivar habitaciones.

Datos mínimos:

```text
hotel
tipo de habitación
número/código
piso
capacidad
precio base
estado operativo
descripción
activo/inactivo
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

---

## RF-05 Gestión de clientes / huéspedes

El sistema debe permitir registrar, editar y consultar clientes.

Datos mínimos:

```text
nombre
apellido
tipo de documento
número de documento
email
teléfono
nacionalidad
datos fiscales opcionales
```

Regla:

```text
Un cliente puede tener múltiples reservas dentro de un hotel.
```

---

## RF-06 Gestión de reservas

El sistema debe permitir:

- crear reservas;
- confirmar reservas;
- cancelar reservas;
- hacer check-in;
- hacer check-out;
- consultar reservas por fecha, cliente, habitación o estado.

Estados:

```text
PENDING
CONFIRMED
CHECKED_IN
CHECKED_OUT
CANCELLED
NO_SHOW
```

---

## RF-07 Validación de disponibilidad

El sistema debe impedir reservas inválidas.

Reglas:

- no puede haber reservas activas superpuestas para la misma habitación;
- la fecha de salida debe ser posterior a la fecha de entrada;
- no se puede reservar una habitación en mantenimiento;
- no se puede reservar una habitación fuera de servicio;
- una reserva cancelada no cuenta como ocupación.

---

## RF-08 Check-in

El sistema debe permitir hacer check-in sobre una reserva confirmada.

Reglas:

- solo se puede hacer check-in sobre reservas `CONFIRMED`;
- no se puede hacer check-in si la habitación requiere limpieza;
- al hacer check-in, la habitación pasa a `OCCUPIED`.

---

## RF-09 Check-out

El sistema debe permitir hacer check-out sobre una reserva activa.

Reglas:

- solo se puede hacer check-out sobre reservas `CHECKED_IN`;
- al hacer check-out, la reserva pasa a `CHECKED_OUT`;
- la habitación pasa a `CLEANING_REQUIRED`;
- se genera una tarea de limpieza;
- puede generarse una factura asociada.

---

## RF-10 Gestión de limpieza

El sistema debe permitir:

- generar tareas de limpieza;
- listar tareas pendientes;
- asignar responsable;
- iniciar limpieza;
- completar limpieza;
- registrar observaciones.

Estados:

```text
PENDING
IN_PROGRESS
COMPLETED
CANCELLED
```

Reglas:

- al iniciar limpieza, la habitación pasa a `CLEANING_IN_PROGRESS`;
- al completar limpieza, la habitación vuelve a `AVAILABLE` si no hay mantenimiento activo.

---

## RF-11 Gestión de mantenimiento

El sistema debe permitir:

- reportar incidencias;
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

---

## RF-12 Facturación

El sistema debe permitir generar facturas asociadas a reservas.

Debe calcular:

```text
cantidad de noches
subtotal
impuesto
descuento básico
total
```

Estados:

```text
DRAFT
ISSUED
PAID
VOID
```

Reglas:

- una factura pertenece a una reserva;
- una reserva puede tener como máximo una factura activa;
- una factura pagada no debe modificarse directamente;
- una factura anulada no cuenta como ingreso.

---

## RF-13 Pagos

El sistema debe permitir registrar pagos manuales sobre una factura.

Métodos iniciales:

```text
CASH
CARD
TRANSFER
OTHER
```

No se incluirá integración con pasarelas de pago reales en el MVP.

---

## RF-14 Reportes de ocupación

El sistema debe permitir consultar reportes por rango de fechas.

Datos mínimos:

```text
total de habitaciones
habitaciones ocupadas
habitaciones disponibles
habitaciones en limpieza
habitaciones en mantenimiento
habitaciones fuera de servicio
porcentaje de ocupación
reservas canceladas
ingresos facturados
```

---

## RF-15 Dashboard operativo

El sistema debe mostrar un dashboard con indicadores clave.

Indicadores:

```text
ocupación actual %
reservas de hoy
check-ins pendientes
check-outs pendientes
habitaciones disponibles
habitaciones ocupadas
habitaciones en limpieza
habitaciones en mantenimiento
facturas pendientes
ingresos del día/mes
alertas operativas
```

---

## RF-16 Realtime selectivo

El sistema podrá utilizar realtime para actualizar información operativa relevante.

Uso recomendado:

```text
dashboard operativo
estado de habitaciones
tareas de limpieza
tickets críticos de mantenimiento
alertas operativas
```

Reglas:

- realtime se filtrará por hotel;
- no se usarán canales globales innecesarios;
- las suscripciones deben cerrarse al salir de la pantalla;
- realtime no será obligatorio para pantallas estáticas.

---

# 7. Requisitos no funcionales

## RNF-01 Modularidad

El sistema debe organizarse por módulos funcionales.

## RNF-02 Reutilización

El sistema debe reutilizar componentes, hooks, servicios, validaciones y utilidades comunes.

## RNF-03 Mantenibilidad

El código debe ser claro, legible y fácil de modificar.

## RNF-04 Separación de responsabilidades

La UI, la lógica de aplicación, las reglas de negocio y el acceso a datos deben estar separados.

## RNF-05 Seguridad

El sistema debe manejar autenticación y autorización por roles.

## RNF-06 Aislamiento por hotel

Cada operación debe ejecutarse dentro del contexto del hotel del usuario autenticado.

## RNF-07 Integridad de datos

El sistema debe evitar estados inconsistentes, como reservas superpuestas o habitaciones disponibles mientras requieren limpieza.

## RNF-08 Usabilidad

La interfaz debe permitir operar tareas frecuentes con pocos pasos.

## RNF-09 Testeabilidad

Las reglas de negocio críticas deben poder probarse con tests unitarios.

## RNF-10 Despliegue

El sistema debe poder desplegarse para una demostración funcional en la defensa final.

---

# 8. Fuera de alcance inicial

No se incluirá en el MVP:

```text
SaaS multi-tenant avanzado
usuarios asociados a múltiples hoteles
pasarelas de pago reales
contabilidad completa
nómina de empleados
inventario de insumos
integración con Booking/Airbnb
app móvil
campañas CRM avanzadas
BI avanzado
microservicios
backend propio completo
```

---

# 9. Criterios de aceptación del MVP

El MVP será aceptable si permite demostrar el siguiente flujo:

```text
crear/configurar hotel
crear usuario
iniciar sesión
crear tipo de habitación
crear habitación
crear cliente
crear reserva
confirmar reserva
hacer check-in
hacer check-out
generar tarea de limpieza
completar limpieza
generar factura
registrar pago básico
consultar reporte de ocupación
ver dashboard operativo actualizado
```

Además:

- el proyecto debe estar documentado;
- el sistema debe estar desplegado o preparado para despliegue;
- la arquitectura interna debe ser clara;
- debe existir evidencia de issues/PRs o flujo de trabajo;
- debe haber al menos algunos tests unitarios sobre reglas críticas.

---

# 10. Documentos relacionados

```text
docs/01-analisis-formal.md
docs/02-mvp.md
docs/03-modulos-entidades.md
docs/04-stack-tecnologico.md
docs/05-arquitectura-interna.md
docs/06-flujo-github.md
```
