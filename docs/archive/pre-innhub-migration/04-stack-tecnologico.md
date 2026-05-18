# Stack tecnológico — HotelFlow ERP/CRM

Este documento define las tecnologías seleccionadas para construir el MVP de **HotelFlow ERP/CRM** en un plazo aproximado de dos semanas.

---

# 1. Criterio de selección

El stack se elige considerando:

- proyecto individual;
- plazo corto;
- necesidad de despliegue para defensa final;
- experiencia previa con React, TypeScript y Tailwind;
- reducción de trabajo backend mediante BaaS;
- necesidad de demostrar buenas prácticas sin sobredimensionar.

---

# 2. Stack seleccionado

```text
Frontend:
Vite + React + TypeScript

Estilos:
Tailwind CSS

Routing:
React Router

Formularios:
React Hook Form

Validación:
Zod

Gráficos:
Recharts

Testing:
Vitest

Backend/BaaS:
InsForge

Base de datos:
PostgreSQL gestionado por InsForge

Auth:
InsForge Auth

Storage:
InsForge Storage

Realtime:
InsForge Realtime

Deploy:
Vercel o Netlify para frontend
InsForge Cloud o self-hosted simple para backend/BaaS
```

---

# 3. Frontend

## 3.1. Vite + React + TypeScript

Se elige porque permite construir una SPA administrativa rápida, clara y mantenible.

Motivos:

- React + TypeScript ya es conocido;
- Vite reduce configuración;
- TypeScript mejora seguridad y mantenibilidad;
- es adecuado para dashboards, formularios, tablas y módulos privados.

---

## 3.2. Tailwind CSS

Se usa para construir una interfaz limpia sin exceso de CSS manual.

Motivos:

- rapidez de desarrollo;
- consistencia visual;
- facilidad para crear layouts responsive;
- buena integración con componentes reutilizables.

---

## 3.3. React Router

Se usará para manejar rutas públicas y privadas.

Rutas previstas:

```text
/login
/dashboard
/hotels
/rooms
/room-types
/customers
/reservations
/cleaning
/maintenance
/billing
/reports
/users
```

---

## 3.4. React Hook Form + Zod

Se usarán para formularios y validación.

Ejemplos de validaciones:

```text
fecha de salida > fecha de entrada
cantidad de huéspedes > 0
email válido
precio base >= 0
impuesto entre 0 y 100
```

---

## 3.5. Recharts

Se usará para gráficos del dashboard y reportes.

Ejemplos:

```text
ocupación actual
ocupación por período
ingresos por período
reservas por estado
habitaciones por estado
```

---

# 4. Backend/BaaS

## 4.1. InsForge

InsForge será la plataforma backend principal.

Responsabilidades:

```text
PostgreSQL
Auth
Storage
APIs automáticas
Realtime con WebSocket/pub-sub
Notificaciones de cambios de base de datos
Funciones backend si son necesarias
```

Motivo:

- reduce trabajo backend repetitivo;
- permite llegar a un MVP funcional;
- facilita despliegue;
- ofrece capacidades modernas similares a Supabase;
- permite enfocarse en el dominio hotelero.

---

## 4.2. PostgreSQL

La base de datos será PostgreSQL gestionada por InsForge.

Entidades principales:

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

---

## 4.3. Auth

Se usará InsForge Auth para login y sesión.

Regla del sistema:

```text
Cada usuario pertenece a un único hotel.
Cada operación se ejecuta dentro del hotel del usuario autenticado.
```

---

## 4.4. Storage

Uso posible:

```text
logos de hoteles
imágenes de habitaciones
comprobantes
PDFs de facturas
adjuntos de mantenimiento
```

Para el MVP, storage es útil pero no debe bloquear módulos principales.

---

# 5. Realtime

InsForge Realtime ofrece WebSocket/Socket.IO con:

```text
canales pub-sub
eventos personalizados
presencia
historial de mensajes
notificaciones de INSERT, UPDATE y DELETE
```

## 5.1. Veredicto sobre peso y escalabilidad

Realtime **no debe activarse para todo**.

Si cada pantalla se suscribe a muchos canales o a cambios globales de todos los hoteles, sí puede volver el sistema más pesado.

Para HotelFlow se usará realtime de forma selectiva:

```text
solo en pantallas donde aporte valor operativo;
solo en canales filtrados por hotel;
solo mientras la pantalla esté montada;
con unsubscribe al salir;
sin escuchar canales globales innecesarios.
```

## 5.2. Canales sugeridos

```text
hotel:<hotel_id>:dashboard
hotel:<hotel_id>:rooms
hotel:<hotel_id>:reservations
hotel:<hotel_id>:cleaning
hotel:<hotel_id>:maintenance
hotel:<hotel_id>:billing
```

Esto evita que un hotel reciba eventos de otro.

## 5.3. Uso recomendado

Usar realtime para:

```text
dashboard operativo
estado de habitaciones
tareas de limpieza
tickets críticos de mantenimiento
alertas operativas
```

No usar realtime inicialmente para:

```text
pantallas de configuración poco usadas
catálogos simples
reportes históricos pesados
formularios estáticos
listados que no requieren actualización inmediata
```

## 5.4. Decisión

```text
Realtime será una mejora operativa selectiva, no el mecanismo por defecto de toda la aplicación.
```

Esto mantiene el sistema liviano y defendible para varios hoteles.

---

# 6. Testing

Herramienta principal:

```text
Vitest
```

Funciones a testear:

```text
calculateNights
calculateInvoiceTotal
validateDateRange
detectReservationOverlap
calculateOccupancyPercentage
canCheckInReservation
canCheckOutReservation
```

Además, se documentarán pruebas manuales para flujos principales.

---

# 7. Deploy

Objetivo:

```text
Tener el sistema desplegado para la defensa final.
```

Opciones:

```text
Frontend: Vercel o Netlify
Backend/BaaS: InsForge Cloud o self-hosted simple
```

Recomendación:

```text
Usar la opción más simple y estable disponible.
```

---

# 8. Justificación académica

Se elige InsForge como BaaS para acelerar persistencia, autenticación, storage y realtime. La decisión es coherente con un MVP de dos semanas: reduce infraestructura repetitiva y permite concentrarse en reglas de negocio, interfaz operativa, reportes y dashboard.

El proyecto no pretende ser un COTS empresarial completo en esta etapa, sino un MVP funcional, configurable, desplegable y defendible.
