# Arquitectura interna — HotelFlow ERP/CRM

Este documento define cómo se organizará internamente el proyecto **HotelFlow ERP/CRM** para demostrar criterios de Ingeniería de Software II:

- modularidad;
- reutilización;
- separación de responsabilidades;
- código limpio;
- buenas prácticas;
- reglas de negocio aisladas;
- componentes reutilizables.

---

# 1. Enfoque arquitectónico

La arquitectura interna combinará tres ideas de forma pragmática:

```text
Feature-Sliced Architecture
Clean Architecture ligera
Atomic Design pragmático
```

No son tres arquitecturas separadas. Son tres criterios aplicados en niveles distintos:

```text
Feature-Sliced Architecture → organiza por módulos del negocio.
Clean Architecture ligera   → separa responsabilidades dentro de cada módulo.
Atomic Design pragmático    → organiza componentes UI reutilizables.
```

---

# 2. Estructura general de carpetas

```text
hotelflow/
├── public/
│   └── logo.svg
│
├── src/
│   ├── main.tsx
│   │
│   ├── app/
│   │   ├── router/
│   │   │   └── AppRouter.tsx
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx
│   │   │   └── RealtimeProvider.tsx
│   │   └── layouts/
│   │       ├── AuthLayout.tsx
│   │       └── DashboardLayout.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── hotels/
│   │   ├── rooms/
│   │   ├── room-types/
│   │   ├── customers/
│   │   ├── reservations/
│   │   ├── cleaning/
│   │   ├── maintenance/
│   │   ├── billing/
│   │   ├── reports/
│   │   ├── dashboard/
│   │   └── users/
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   ├── organisms/
│   │   │   └── templates/
│   │   ├── hooks/
│   │   │   ├── useCurrentUser.ts
│   │   │   └── useRealtimeChannel.ts
│   │   ├── lib/
│   │   │   └── insforgeClient.ts
│   │   ├── services/
│   │   │   └── realtimeService.ts
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants/
│   │
│   └── tests/
│       └── setup.ts
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

# 3. Aplicación de cada enfoque

## 3.1. Feature-Sliced Architecture

Se aplica en:

```text
src/features/
```

Cada módulo del negocio tiene su propia carpeta:

```text
auth
hotels
rooms
room-types
customers
reservations
cleaning
maintenance
billing
reports
dashboard
users
```

Motivo:

- el código queda alineado con los módulos del sistema;
- cada funcionalidad tiene su propio espacio;
- facilita mantenimiento;
- evita mezclar reservas, facturación, limpieza y dashboard en carpetas globales.

---

## 3.2. Clean Architecture ligera

Se aplica dentro de cada feature.

Estructura base:

```text
features/reservations/
├── pages/
├── components/
├── hooks/
├── services/
├── schemas/
├── types/
├── utils/
└── index.ts
```

Equivalencia de capas:

```text
pages/components → presentación
hooks            → aplicación / casos de uso
utils/schemas    → dominio / reglas puras
services         → infraestructura / acceso a InsForge
```

Regla importante:

```text
Los componentes no deberían llamar directamente a InsForge.
Deben usar hooks o services.
```

---

## 3.3. Atomic Design pragmático

Se aplica en:

```text
src/shared/components/
```

Estructura:

```text
shared/components/
├── atoms/
├── molecules/
├── organisms/
└── templates/
```

Ejemplos:

```text
atoms      → Button, Input, Label, Badge, Spinner
molecules  → FormField, SearchInput, StatusBadge, MetricCard
organisms  → DataTable, Sidebar, Topbar, ConfirmDialog
templates  → ModuleLayout, AuthLayout, DashboardLayout
```

Decisión:

```text
Atomic Design se usa solo para componentes compartidos.
Los componentes específicos de un módulo viven dentro de features/<modulo>/components.
```

---

# 4. Ejemplo con el módulo de reservas

```text
features/reservations/
├── pages/
│   ├── ReservationsPage.tsx
│   └── ReservationDetailPage.tsx
├── components/
│   ├── ReservationForm.tsx
│   ├── ReservationTable.tsx
│   └── ReservationStatusBadge.tsx
├── hooks/
│   ├── useReservations.ts
│   ├── useCreateReservation.ts
│   ├── useCheckInReservation.ts
│   ├── useCheckOutReservation.ts
│   └── useReservationRealtime.ts
├── services/
│   └── reservationService.ts
├── schemas/
│   └── reservation.schema.ts
├── types/
│   └── reservation.types.ts
├── utils/
│   ├── validateDateRange.ts
│   ├── detectReservationOverlap.ts
│   └── canCheckInReservation.ts
└── index.ts
```

Flujo de creación de reserva:

```text
ReservationForm.tsx
  ↓
useCreateReservation.ts
  ↓
validateDateRange.ts / detectReservationOverlap.ts
  ↓
reservationService.ts
  ↓
insforgeClient.ts
  ↓
InsForge PostgreSQL
```

Flujo realtime:

```text
ReservationsPage.tsx
  ↓
useReservationRealtime.ts
  ↓
realtimeService.ts
  ↓
insforge.realtime.subscribe("hotel:<hotel_id>:reservations")
```

---

# 5. Realtime dentro de la arquitectura

Realtime se encapsula en:

```text
shared/services/realtimeService.ts
shared/hooks/useRealtimeChannel.ts
features/*/hooks/use<Feature>Realtime.ts
```

Esto permite usar InsForge Realtime sin acoplar toda la UI al SDK.

Regla:

```text
Componente → hook realtime → realtimeService → insforge.realtime
```

Ejemplo para dashboard:

```text
DashboardPage.tsx
  ↓
useDashboardRealtime.ts
  ↓
realtimeService.ts
  ↓
insforge.realtime.subscribe("hotel:<hotel_id>:dashboard")
  ↓
WebSocket update
  ↓
DashboardSummary actualizado
```

---

# 6. Reutilización esperada

Se buscará reutilización en:

```text
componentes de UI
layouts
formularios base
badges de estado
tablas simples
validaciones Zod
funciones de cálculo
servicios de acceso a datos
hooks de carga y mutación
hooks realtime
constantes de estados
helpers de fechas y moneda
```

Ejemplos:

```text
MetricCard se reutiliza en dashboard y reportes.
StatusBadge se reutiliza en reservas, limpieza, mantenimiento y facturación.
DataTable se reutiliza en habitaciones, clientes, reservas y facturas.
FormField se reutiliza en todos los formularios.
formatCurrency se reutiliza en facturación, reportes y dashboard.
```

---

# 7. Buenas prácticas de código limpio

Reglas generales:

```text
Componentes pequeños y enfocados.
Nombres claros y descriptivos.
Evitar lógica de negocio compleja dentro del JSX.
Evitar duplicación de validaciones.
Centralizar constantes de estados.
Separar UI, datos y reglas.
Preferir funciones puras para cálculos.
Evitar archivos demasiado grandes.
Evitar imports cruzados innecesarios entre features.
Encapsular InsForge en services/hooks.
```

Convenciones:

```text
PascalCase para componentes.
camelCase para funciones y variables.
kebab-case para nombres de carpetas.
*.types.ts para tipos.
*.schema.ts para esquemas Zod.
*.service.ts para acceso a datos.
*.test.ts para tests.
```

---

# 8. Reglas de negocio

Las reglas críticas deben quedar en funciones o servicios claros, no dispersas en pantallas.

Ejemplos:

```text
validateDateRange
canCheckInReservation
canCheckOutReservation
calculateNights
calculateInvoiceTotal
calculateOccupancyPercentage
getRoomAvailabilityStatus
```

Reglas principales:

```text
No puede haber reservas activas superpuestas para la misma habitación.
No se puede reservar una habitación en mantenimiento.
No se puede reservar una habitación fuera de servicio.
La fecha de salida debe ser posterior a la fecha de entrada.
Check-in solo sobre reserva confirmada.
Check-out solo sobre reserva con check-in.
Check-out genera tarea de limpieza.
Una habitación pendiente de limpieza no debe estar disponible para nuevos huéspedes.
Una factura pagada no debe modificarse directamente.
Una factura anulada no cuenta como ingreso.
```

---

# 9. Justificación académica

Esta arquitectura permite demostrar:

```text
modularidad
reutilización
separación de responsabilidades
código limpio
validaciones centralizadas
componentes reutilizables
reglas de negocio testeables
buenas prácticas de organización
```

La arquitectura evita que el proyecto sea solo una interfaz conectada a un BaaS. Aunque InsForge acelera el backend, el frontend mantiene una organización profesional y defendible.
