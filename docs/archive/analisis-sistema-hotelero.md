# Análisis formal del sistema — Gestión Hotelera ERP/CRM

## 1. Contexto del proyecto

El proyecto corresponde al enunciado:

> Sistema de gestión empresarial ERP/CRM  
> 8. Sistema de gestión hotelera — Vargas Urzagaste Diego  
> Módulos de reservas, mantenimiento y limpieza de las habitaciones, facturación y reportes de ocupación.

El objetivo no es construir solamente una aplicación CRUD, sino un sistema de gestión hotelera con enfoque profesional, reutilizable y presentable como proyecto de portfolio en GitHub.

La intención del proyecto es aplicar conceptos de:

- arquitectura de software;
- reutilización;
- refactorización;
- código limpio;
- separación de responsabilidades;
- reglas de negocio reales;
- documentación técnica clara.

---

## 2. Enfoque general

El sistema será planteado como un **COTS vertical para gestión hotelera**.

Un COTS, en este contexto, significa que el sistema no estará diseñado únicamente para un hotel específico, sino como una solución configurable y adaptable a distintos establecimientos hoteleros.

Ejemplos de configuración:

- tipos de habitaciones;
- precios base;
- impuestos;
- estados operativos;
- roles de usuario;
- políticas de reserva;
- criterios de reportes.

Esto permite que el proyecto sea más profesional y defendible, ya que no queda limitado a una implementación rígida o académica demasiado simple.

---

## 3. Descripción general del sistema

El sistema será una solución empresarial orientada a la gestión hotelera, diseñada bajo principios de arquitectura limpia, modularidad, reutilización y mantenibilidad.

Permitirá administrar:

- reservas;
- habitaciones;
- clientes/huéspedes;
- limpieza de habitaciones;
- mantenimiento;
- facturación;
- reportes de ocupación.

El sistema busca coordinar procesos operativos importantes de un hotel, evitando errores como reservas duplicadas, habitaciones asignadas sin limpieza, falta de control de mantenimiento o facturación inconsistente.

---

## 4. Problema que resuelve

Los hoteles necesitan coordinar varias operaciones al mismo tiempo:

- saber qué habitaciones están disponibles;
- evitar reservas duplicadas;
- controlar habitaciones en limpieza o mantenimiento;
- registrar clientes;
- generar facturas;
- consultar ocupación e ingresos;
- tener trazabilidad de operaciones.

Cuando estos procesos se manejan de forma manual o aislada, aparecen problemas como:

- sobreventa de habitaciones;
- errores en fechas de reserva;
- habitaciones asignadas sin limpieza previa;
- falta de control sobre mantenimiento;
- facturación inconsistente;
- poca visibilidad para tomar decisiones.

---

## 5. Objetivo general

Desarrollar un sistema de gestión hotelera tipo ERP/CRM que permita administrar reservas, habitaciones, limpieza, mantenimiento, facturación y reportes de ocupación, aplicando una arquitectura modular, reutilizable y mantenible.

---

## 6. Objetivos específicos

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

## 7. Alcance del sistema

### 7.1 Incluido en el MVP profesional

El sistema tendrá un alcance desafiante, útil para aprendizaje y portfolio, pero sin caer en una complejidad excesiva.

#### Módulo de habitaciones

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

#### Módulo de clientes

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

#### Módulo de reservas

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

#### Módulo de limpieza

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

#### Módulo de mantenimiento

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

#### Módulo de facturación

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

No se incluirá inicialmente una contabilidad empresarial completa, para mantener el alcance controlado.

#### Módulo de reportes

Permite consultar:

- ocupación por rango de fechas;
- habitaciones ocupadas;
- habitaciones disponibles;
- habitaciones en mantenimiento;
- porcentaje de ocupación;
- ingresos por período;
- reservas canceladas.

---

## 8. Fuera de alcance inicial

Para mantener el proyecto profesional pero viable, no se incluirá inicialmente:

- integración con pasarelas de pago;
- contabilidad empresarial completa;
- nómina de empleados;
- inventario de insumos;
- CRM avanzado con campañas;
- multi-sucursal real;
- aplicación móvil;
- integración con Booking, Airbnb u otros canales externos;
- sistema automático de emails;
- inteligencia artificial;
- dashboard de business intelligence avanzado.

Estos elementos pueden quedar documentados como posibles mejoras futuras.

---

## 9. Actores del sistema

### Administrador

Tiene control completo del sistema.

Puede:

- gestionar habitaciones;
- gestionar usuarios;
- configurar tarifas;
- consultar reportes;
- revisar facturación;
- administrar mantenimiento y limpieza.

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

### Personal de limpieza

Gestiona tareas de limpieza.

Puede:

- ver tareas asignadas;
- iniciar limpieza;
- finalizar limpieza;
- reportar observaciones.

### Personal de mantenimiento

Gestiona incidencias técnicas.

Puede:

- ver incidencias;
- actualizar estado;
- marcar reparaciones como resueltas.

### Gerente

Consulta información estratégica.

Puede:

- ver reportes;
- revisar ocupación;
- revisar ingresos;
- analizar rendimiento operativo.

---

## 10. Requisitos funcionales

| Código | Requisito                                                                                                         |
| ------ | ----------------------------------------------------------------------------------------------------------------- |
| RF-01  | El sistema debe permitir crear, editar, listar y desactivar habitaciones.                                         |
| RF-02  | El sistema debe permitir definir tipos de habitación con capacidad, descripción y precio base.                    |
| RF-03  | El sistema debe permitir registrar, modificar y consultar clientes.                                               |
| RF-04  | El sistema debe permitir consultar habitaciones disponibles para un rango de fechas.                              |
| RF-05  | El sistema debe permitir crear reservas asociadas a un cliente, una habitación y un rango de fechas.              |
| RF-06  | El sistema debe impedir reservas con fechas inválidas o superpuestas.                                             |
| RF-07  | El sistema debe permitir cancelar reservas activas.                                                               |
| RF-08  | El sistema debe permitir registrar el ingreso del huésped y cambiar el estado de la habitación a ocupada.         |
| RF-09  | El sistema debe permitir registrar la salida del huésped y generar una tarea de limpieza.                         |
| RF-10  | El sistema debe permitir crear, asignar y actualizar tareas de limpieza.                                          |
| RF-11  | El sistema debe permitir registrar y actualizar incidencias de mantenimiento.                                     |
| RF-12  | El sistema debe impedir reservar habitaciones en mantenimiento o fuera de servicio.                               |
| RF-13  | El sistema debe permitir generar una factura asociada a una reserva.                                              |
| RF-14  | El sistema debe calcular el total según cantidad de noches, precio de habitación, impuestos y descuentos básicos. |
| RF-15  | El sistema debe generar reportes de ocupación por rango de fechas.                                                |
| RF-16  | El sistema debe permitir consultar ingresos facturados por período.                                               |
| RF-17  | El sistema debe restringir acciones según el rol del usuario.                                                     |

---

## 11. Requisitos no funcionales

| Código | Requisito                                                                                                                           |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| RNF-01 | El sistema debe estar organizado en módulos con responsabilidades claras.                                                           |
| RNF-02 | La lógica común debe extraerse en servicios, validadores o componentes reutilizables.                                               |
| RNF-03 | El diseño debe permitir agregar nuevos módulos en el futuro sin reescribir el núcleo.                                               |
| RNF-04 | El sistema debe manejar autenticación y autorización basada en roles.                                                               |
| RNF-05 | El sistema debe evitar estados inconsistentes, como reservas duplicadas o habitaciones disponibles mientras están en mantenimiento. |
| RNF-06 | Las operaciones importantes deben registrar fecha, usuario responsable y estado.                                                    |
| RNF-07 | La lógica de negocio debe poder probarse con tests unitarios.                                                                       |
| RNF-08 | El código debe seguir principios de clean code: nombres claros, funciones pequeñas, bajo acoplamiento y alta cohesión.              |
| RNF-09 | El sistema debe permitir adaptar parámetros como tipos de habitación, impuestos y tarifas.                                          |
| RNF-10 | La interfaz debe permitir operar tareas frecuentes con pocos pasos.                                                                 |

---

## 12. Casos de uso principales

### CU-01 Crear reserva

Actor principal: Recepcionista.

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

### CU-02 Cancelar reserva

Actor principal: Recepcionista.

Flujo:

1. Busca la reserva.
2. Solicita cancelación.
3. El sistema valida que la reserva pueda cancelarse.
4. La reserva cambia a cancelada.
5. Se libera disponibilidad.

### CU-03 Realizar check-in

Actor principal: Recepcionista.

Flujo:

1. Busca una reserva confirmada.
2. Confirma la llegada del huésped.
3. El sistema cambia la reserva a activa.
4. El sistema cambia la habitación a ocupada.

### CU-04 Realizar check-out

Actor principal: Recepcionista.

Flujo:

1. Busca una reserva activa.
2. Registra la salida del huésped.
3. El sistema finaliza la reserva.
4. El sistema genera factura si corresponde.
5. El sistema cambia la habitación a pendiente de limpieza.

### CU-05 Completar limpieza

Actor principal: Personal de limpieza.

Flujo:

1. Consulta tareas pendientes.
2. Inicia una tarea.
3. Finaliza la tarea.
4. El sistema cambia la habitación a disponible, salvo que tenga mantenimiento pendiente.

### CU-06 Registrar mantenimiento

Actor principal: Recepcionista, administrador o personal de mantenimiento.

Flujo:

1. Se selecciona habitación.
2. Se describe la incidencia.
3. Se define prioridad.
4. El sistema registra mantenimiento.
5. La habitación puede cambiar a mantenimiento o fuera de servicio.

### CU-07 Generar factura

Actor principal: Recepcionista.

Flujo:

1. Selecciona reserva.
2. El sistema calcula noches.
3. Calcula precio total.
4. Aplica impuestos o descuentos.
5. Genera factura.
6. Registra estado pendiente o pagada.

### CU-08 Consultar reporte de ocupación

Actor principal: Gerente o administrador.

Flujo:

1. Ingresa rango de fechas.
2. El sistema calcula ocupación.
3. Muestra porcentaje de ocupación.
4. Muestra habitaciones ocupadas, disponibles y bloqueadas.

---

## 13. Modelo de dominio inicial

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

## 14. Estados del dominio

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

## 15. Reglas de negocio centrales

### Reservas

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

## 16. Oportunidades de reutilización

El sistema puede reutilizar conceptos comunes en varios módulos.

### Estados y transiciones

Reservas, mantenimiento, limpieza y facturación tienen estados. Se puede aplicar un modelo común de:

- estado actual;
- transición válida;
- validación antes del cambio;
- trazabilidad del cambio.

### Repositorios

Cada módulo puede usar una interfaz de repositorio:

```text
ReservationRepository
RoomRepository
CustomerRepository
InvoiceRepository
```

Esto permite separar la lógica de negocio de la persistencia.

### Validadores

Validadores reutilizables:

- validador de fechas;
- validador de disponibilidad;
- validador de datos obligatorios;
- validador de transición de estado.

### Servicios de dominio

Servicios reutilizables:

- AvailabilityService;
- InvoiceCalculator;
- OccupancyReportService;
- RoomStatusService.

---

## 17. Patrones de diseño recomendados

No se deben usar patrones solo por apariencia. Se recomiendan únicamente donde aporten claridad.

### Repository

Para separar el dominio de la infraestructura de persistencia.

### Service Layer / Use Cases

Para organizar operaciones como:

- crear reserva;
- cancelar reserva;
- registrar limpieza;
- generar factura.

### Strategy

Para cálculo de tarifas:

- tarifa normal;
- tarifa por temporada alta;
- tarifa con descuento;
- tarifa corporativa.

### Factory

Para crear objetos complejos como facturas o reservas con reglas iniciales.

### State

Puede aplicarse a estados de habitación o reserva si el modelo crece lo suficiente.

---

## 18. Arquitectura recomendada

Para este proyecto se recomienda una arquitectura modular con inspiración en Clean Architecture.

División conceptual:

```text
Presentación
↓
Aplicación / Casos de uso
↓
Dominio
↓
Infraestructura / Persistencia
```

Ejemplo:

```text
ReservationController
↓
CreateReservationUseCase
↓
Reservation, Room, Customer
↓
ReservationRepository, RoomRepository
```

Ventajas:

- las reglas de negocio no dependen directamente de la base de datos;
- la lógica principal es más testeable;
- se favorece la reutilización;
- se reduce el acoplamiento;
- se facilita la refactorización;
- el proyecto es más defendible académica y profesionalmente.

---

## 19. Perfil profesional del proyecto

Para que el proyecto sea útil en GitHub y en un CV, debería demostrar:

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

Esto diferencia el proyecto de un CRUD básico de hotel.

---

## 20. Nivel de complejidad recomendado

### No básico

Porque incluirá:

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

Porque se evitará inicialmente:

- microservicios;
- pagos reales;
- multi-tenant complejo;
- integración externa;
- contabilidad completa;
- aplicación móvil;
- business intelligence avanzado.

Este punto medio permite aprender conceptos importantes sin convertir el proyecto en algo inmanejable.

---

## 21. Próximos pasos recomendados

Antes de implementar, conviene avanzar en este orden:

1. Definir el alcance exacto del MVP.
2. Elegir stack tecnológico.
3. Diseñar la arquitectura técnica.
4. Definir estructura de carpetas.
5. Diseñar el modelo de datos.
6. Definir estrategia de testing.
7. Crear documentación base para GitHub.
8. Recién después iniciar la implementación.

---

## 22. Decisión pendiente

La próxima decisión importante será elegir el tipo de aplicación y stack tecnológico.

Una opción profesional recomendable sería:

```text
Backend API
Frontend Web
Base de datos relacional
```

Pero la elección final debe considerar:

- tecnologías que el estudiante quiera aprender;
- tecnologías útiles para empleabilidad;
- tiempo disponible;
- complejidad aceptable;
- facilidad para documentar y desplegar el proyecto.
