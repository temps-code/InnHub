# Análisis formal del sistema

## 1. Nombre tentativo del sistema

**HotelFlow ERP/CRM**

O algo similar. Después se puede ajustar.

La idea es que el nombre comunique que no es solo un CRUD de habitaciones, sino un sistema de gestión hotelera.

---

## 2. Descripción general

El sistema será una solución empresarial orientada a la gestión hotelera, diseñada bajo principios de arquitectura limpia, modularidad, reutilización y mantenibilidad.

Permitirá administrar:

- reservas;
- habitaciones;
- clientes/huéspedes;
- limpieza de habitaciones;
- mantenimiento;
- facturación;
- reportes de ocupación.

El sistema se plantea como un **COTS**, es decir, una solución configurable que podría adaptarse a distintos hoteles sin modificar directamente el código fuente.

---

## 3. Problema que resuelve

Los hoteles necesitan coordinar varias operaciones al mismo tiempo:

- saber qué habitaciones están disponibles;
- evitar reservas duplicadas;
- controlar habitaciones en limpieza o mantenimiento;
- registrar clientes;
- generar facturas;
- consultar ocupación e ingresos;
- tener trazabilidad de operaciones.

Si estos procesos se manejan de forma manual o aislada, aparecen problemas como:

- sobreventa de habitaciones;
- errores en fechas de reserva;
- habitaciones asignadas sin limpieza previa;
- falta de control sobre mantenimiento;
- facturación inconsistente;
- poca visibilidad para tomar decisiones.

---

## 4. Objetivo general

Desarrollar un sistema de gestión hotelera tipo ERP/CRM que permita administrar reservas, habitaciones, limpieza, mantenimiento, facturación y reportes de ocupación, aplicando una arquitectura modular, reutilizable y mantenible.

---

## 5. Objetivos específicos

1. Gestionar habitaciones y sus estados operativos.
2. Registrar clientes y huéspedes.
3. Crear, confirmar, cancelar y finalizar reservas.
4. Evitar conflictos de disponibilidad.
5. Administrar tareas de limpieza asociadas a habitaciones.
6. Registrar incidencias y tareas de mantenimiento.
7. Generar facturación básica asociada a reservas.
8. Obtener reportes de ocupación por período.
9. Diseñar el sistema con separación clara de responsabilidades.
10. Permitir configuración para distintos tipos de hoteles.

---

## 6. Alcance del sistema

### Incluido en el MVP profesional

Este sería el alcance ideal: desafiante, útil para CV, pero no ridículamente grande.

### Módulo de habitaciones

Permite:

- registrar habitaciones;
- editar datos de habitaciones;
- consultar habitaciones;
- cambiar estado operativo;
- definir tipo de habitación;
- definir capacidad y precio base.

Estados posibles:

```text
Disponible
Reservada
Ocupada
Pendiente de limpieza
En limpieza
En mantenimiento
Fuera de servicio
```

---

### Módulo de clientes

Permite:

- registrar cliente;
- editar datos;
- consultar historial de reservas;
- asociar cliente a una reserva.

Datos posibles:

```text
Nombre
Apellido
Documento
Email
Teléfono
Nacionalidad
Datos fiscales opcionales
```

---

### Módulo de reservas

Permite:

- crear reserva;
- confirmar reserva;
- cancelar reserva;
- realizar check-in;
- realizar check-out;
- consultar reservas por fecha, cliente o habitación.

Reglas importantes:

- no se puede reservar una habitación en mantenimiento;
- no se puede reservar una habitación fuera de servicio;
- no se puede reservar si hay superposición de fechas;
- la fecha de salida debe ser posterior a la fecha de entrada;
- una reserva cancelada libera disponibilidad;
- un check-out genera una tarea de limpieza.

---

### Módulo de limpieza

Permite:

- generar tareas de limpieza;
- asignar responsable;
- marcar limpieza como pendiente, en proceso o completada;
- impedir que una habitación vuelva a estar disponible si requiere limpieza.

Estados:

```text
Pendiente
En proceso
Completada
Cancelada
```

---

### Módulo de mantenimiento

Permite:

- reportar incidencia;
- clasificar prioridad;
- asignar estado;
- bloquear habitación si corresponde;
- liberar habitación cuando se resuelva.

Estados:

```text
Reportado
En revisión
En reparación
Resuelto
Cancelado
```

Prioridades:

```text
Baja
Media
Alta
Crítica
```

---

### Módulo de facturación

Permite:

- generar factura desde una reserva;
- calcular noches;
- aplicar precio base por habitación;
- aplicar impuestos configurables;
- registrar estado de pago.

Estados:

```text
Pendiente
Pagada
Anulada
```

No metería todavía una contabilidad completa. Eso sería demasiado.

---

### Módulo de reportes

Permite consultar:

- ocupación por rango de fechas;
- habitaciones ocupadas;
- habitaciones disponibles;
- habitaciones en mantenimiento;
- porcentaje de ocupación;
- ingresos por período;
- reservas canceladas.

---

## 7. Fuera de alcance inicial

Esto es importante para mostrar criterio.

No incluiría inicialmente:

- integración con pasarelas de pago;
- contabilidad empresarial completa;
- nómina de empleados;
- inventario de insumos;
- CRM avanzado con campañas;
- multi-sucursal real;
- app móvil;
- integración con Booking/Airbnb;
- sistema de emails automático;
- inteligencia artificial;
- dashboard excesivamente complejo.

Podemos dejarlo como trabajo futuro.

Eso hace que el proyecto sea serio y manejable.

---

## 8. Actores del sistema

### Administrador

Tiene control completo del sistema.

Puede:

- gestionar habitaciones;
- gestionar usuarios;
- configurar tarifas;
- consultar reportes;
- revisar facturación;
- administrar mantenimiento y limpieza.

---

### Recepcionista

Opera la parte diaria del hotel.

Puede:

- registrar clientes;
- crear reservas;
- confirmar reservas;
- cancelar reservas;
- hacer check-in;
- hacer check-out;
- consultar disponibilidad;
- generar facturas.

---

### Personal de limpieza

Gestiona tareas de limpieza.

Puede:

- ver tareas asignadas;
- iniciar limpieza;
- finalizar limpieza;
- reportar observaciones.

---

### Personal de mantenimiento

Gestiona incidencias técnicas.

Puede:

- ver incidencias;
- actualizar estado;
- marcar reparaciones como resueltas.

---

### Gerente

Consulta información estratégica.

Puede:

- ver reportes;
- revisar ocupación;
- revisar ingresos;
- analizar rendimiento operativo.

---

## 9. Requisitos funcionales

### RF-01 Gestión de habitaciones

El sistema debe permitir crear, editar, listar y desactivar habitaciones.

### RF-02 Gestión de tipos de habitación

El sistema debe permitir definir tipos de habitación con capacidad, descripción y precio base.

### RF-03 Gestión de clientes

El sistema debe permitir registrar, modificar y consultar clientes.

### RF-04 Consulta de disponibilidad

El sistema debe permitir consultar habitaciones disponibles para un rango de fechas.

### RF-05 Creación de reservas

El sistema debe permitir crear reservas asociadas a un cliente, una habitación y un rango de fechas.

### RF-06 Validación de reservas

El sistema debe impedir reservas con fechas inválidas o superpuestas.

### RF-07 Cancelación de reservas

El sistema debe permitir cancelar reservas activas.

### RF-08 Check-in

El sistema debe permitir registrar el ingreso del huésped y cambiar el estado de la habitación a ocupada.

### RF-09 Check-out

El sistema debe permitir registrar la salida del huésped y generar una tarea de limpieza.

### RF-10 Gestión de limpieza

El sistema debe permitir crear, asignar y actualizar tareas de limpieza.

### RF-11 Gestión de mantenimiento

El sistema debe permitir registrar y actualizar incidencias de mantenimiento.

### RF-12 Bloqueo de habitaciones

El sistema debe impedir reservar habitaciones en mantenimiento o fuera de servicio.

### RF-13 Facturación

El sistema debe permitir generar una factura asociada a una reserva.

### RF-14 Cálculo de monto

El sistema debe calcular el total según cantidad de noches, precio de habitación, impuestos y descuentos básicos.

### RF-15 Reporte de ocupación

El sistema debe generar reportes de ocupación por rango de fechas.

### RF-16 Reporte de ingresos

El sistema debe permitir consultar ingresos facturados por período.

### RF-17 Gestión de usuarios y roles

El sistema debe restringir acciones según el rol del usuario.

---

## 10. Requisitos no funcionales

### RNF-01 Mantenibilidad

El sistema debe estar organizado en módulos con responsabilidades claras.

### RNF-02 Reutilización

La lógica común debe extraerse en servicios, validadores o componentes reutilizables.

### RNF-03 Escalabilidad moderada

El diseño debe permitir agregar nuevos módulos en el futuro sin reescribir el núcleo.

### RNF-04 Seguridad

El sistema debe manejar autenticación y autorización basada en roles.

### RNF-05 Integridad de datos

El sistema debe evitar estados inconsistentes, como reservas duplicadas o habitaciones disponibles mientras están en mantenimiento.

### RNF-06 Trazabilidad

Las operaciones importantes deben registrar fecha, usuario responsable y estado.

### RNF-07 Testeabilidad

La lógica de negocio debe poder probarse con tests unitarios.

### RNF-08 Legibilidad

El código debe seguir principios de clean code:

- nombres claros;
- funciones pequeñas;
- bajo acoplamiento;
- alta cohesión;
- separación de responsabilidades.

### RNF-09 Configurabilidad

El sistema debe permitir adaptar parámetros como tipos de habitación, impuestos y tarifas.

### RNF-10 Usabilidad

La interfaz debe permitir operar tareas frecuentes con pocos pasos.

---

## 11. Casos de uso principales

### CU-01 Crear reserva

Actor principal:

- Recepcionista.

Flujo:

1. El recepcionista selecciona cliente.
2. Ingresa fecha de entrada y salida.
3. El sistema consulta habitaciones disponibles.
4. El recepcionista selecciona habitación.
5. El sistema valida disponibilidad.
6. El sistema crea la reserva.
7. La reserva queda en estado pendiente o confirmada.

Reglas:

- no debe haber superposición de fechas;
- la habitación debe estar operativa;
- el cliente debe existir;
- las fechas deben ser válidas.

---

### CU-02 Cancelar reserva

Actor:

- Recepcionista.

Flujo:

1. Busca la reserva.
2. Solicita cancelación.
3. El sistema valida que la reserva pueda cancelarse.
4. La reserva cambia a cancelada.
5. Se libera disponibilidad.

---

### CU-03 Realizar check-in

Actor:

- Recepcionista.

Flujo:

1. Busca reserva confirmada.
2. Confirma llegada del huésped.
3. El sistema cambia reserva a activa.
4. El sistema cambia habitación a ocupada.

---

### CU-04 Realizar check-out

Actor:

- Recepcionista.

Flujo:

1. Busca reserva activa.
2. Registra salida.
3. El sistema finaliza reserva.
4. El sistema genera factura si corresponde.
5. El sistema cambia habitación a pendiente de limpieza.

---

### CU-05 Completar limpieza

Actor:

- Personal de limpieza.

Flujo:

1. Consulta tareas pendientes.
2. Inicia tarea.
3. Finaliza tarea.
4. El sistema cambia habitación a disponible, salvo que tenga mantenimiento pendiente.

---

### CU-06 Registrar mantenimiento

Actor:

- Recepcionista, administrador o mantenimiento.

Flujo:

1. Se selecciona habitación.
2. Se describe incidencia.
3. Se define prioridad.
4. El sistema registra mantenimiento.
5. La habitación puede cambiar a mantenimiento o fuera de servicio.

---

### CU-07 Generar factura

Actor:

- Recepcionista.

Flujo:

1. Selecciona reserva.
2. El sistema calcula noches.
3. Calcula precio total.
4. Aplica impuestos o descuentos.
5. Genera factura.
6. Registra estado pendiente o pagada.

---

### CU-08 Consultar reporte de ocupación

Actor:

- Gerente o administrador.

Flujo:

1. Ingresa rango de fechas.
2. El sistema calcula ocupación.
3. Muestra porcentaje de ocupación.
4. Muestra habitaciones ocupadas, disponibles y bloqueadas.

---

## 12. Modelo de dominio inicial

Entidades principales:

```text
User
Role
Customer
Room
RoomType
Reservation
CleaningTask
MaintenanceTicket
Invoice
Payment
OccupancyReport
```

Relaciones principales:

```text
Customer 1 ─── * Reservation
Room 1 ─── * Reservation
RoomType 1 ─── * Room
Reservation 1 ─── 0..1 Invoice
Room 1 ─── * CleaningTask
Room 1 ─── * MaintenanceTicket
User 1 ─── * CleaningTask
User 1 ─── * MaintenanceTicket
```

---

## 13. Estados del dominio

### Estado de habitación

```text
AVAILABLE
RESERVED
OCCUPIED
CLEANING_REQUIRED
CLEANING_IN_PROGRESS
MAINTENANCE
OUT_OF_SERVICE
```

### Estado de reserva

```text
PENDING
CONFIRMED
CHECKED_IN
CHECKED_OUT
CANCELLED
NO_SHOW
```

### Estado de limpieza

```text
PENDING
IN_PROGRESS
COMPLETED
CANCELLED
```

### Estado de mantenimiento

```text
REPORTED
IN_REVIEW
IN_REPAIR
RESOLVED
CANCELLED
```

### Estado de factura

```text
DRAFT
ISSUED
PAID
VOID
```

---

## 14. Reglas de negocio centrales

Estas son muy importantes para que el proyecto no parezca superficial.

### Reserva

1. Una habitación no puede tener dos reservas activas con fechas superpuestas.
2. Una reserva debe tener fecha de entrada anterior a fecha de salida.
3. No se puede reservar una habitación en mantenimiento.
4. No se puede reservar una habitación fuera de servicio.
5. Una reserva cancelada no debe contar como ocupación.
6. Una reserva confirmada bloquea disponibilidad.

### Check-in

1. Solo se puede hacer check-in sobre una reserva confirmada.
2. No se puede hacer check-in si la habitación requiere limpieza.
3. Al hacer check-in, la habitación pasa a ocupada.

### Check-out

1. Solo se puede hacer check-out sobre una reserva con check-in.
2. Al hacer check-out, la reserva finaliza.
3. La habitación queda pendiente de limpieza.
4. Puede generarse una factura.

### Limpieza

1. Una habitación pendiente de limpieza no está disponible para nuevos huéspedes.
2. Al completar limpieza, la habitación vuelve a disponible si no tiene mantenimiento pendiente.

### Mantenimiento

1. Una habitación en mantenimiento no puede reservarse.
2. Una incidencia crítica puede poner la habitación fuera de servicio.
3. Al resolver mantenimiento, la habitación puede volver a disponible o pendiente de limpieza.

### Facturación

1. Una factura debe estar asociada a una reserva.
2. El monto base se calcula por noches.
3. El total puede incluir impuestos y descuentos.
4. Una factura pagada no debería modificarse directamente.

---

## 15. Perfil profesional del proyecto

Para que sirva en GitHub/CV, el proyecto debería demostrar:

- arquitectura limpia;
- separación por módulos;
- autenticación y roles;
- validaciones reales;
- reglas de negocio testeadas;
- documentación clara;
- README profesional;
- diagramas;
- uso de Git con commits prolijos;
- issues o roadmap;
- tests;
- ejemplos de uso;
- decisiones arquitectónicas documentadas.

Esto es lo que lo diferencia de un “CRUD de hotel”.

---

## 16. Nivel de complejidad recomendado

Te propongo este nivel:

### No básico

Porque tendría:

- roles;
- estados;
- reportes;
- reglas de disponibilidad;
- facturación;
- limpieza;
- mantenimiento;
- arquitectura modular;
- tests.

### No excesivo

Porque evitaríamos:

- microservicios;
- pagos reales;
- multi-tenant complejo;
- integración externa;
- contabilidad completa;
- app móvil;
- BI avanzado.

Ese punto medio es ideal para aprender y mostrar criterio.

---

## 17. Próxima decisión importante

Antes de pasar a diseño técnico, hay que decidir el estilo de aplicación.

Mi recomendación para CV sería:

### Opción recomendada

Aplicación web full stack con API backend + frontend separado o integrado.

Arquitectura posible:

```text
Backend API
Frontend Web
Base de datos relacional
```

Pero todavía no elegiría stack sin pensar.

En el próximo paso conviene definir:

1. tecnología backend;
2. tecnología frontend;
3. base de datos;
4. tipo de arquitectura;
5. estrategia de tests;
6. cómo lo vamos a documentar para GitHub.

Mi recomendación inicial sería hacer después un documento tipo:

> Visión del sistema y alcance del MVP

Y recién luego pasar a:

> Diseño arquitectónico.
