# InnHub — Stack Tecnológico

> Este documento explica las tecnologías seleccionadas y sus razones.

📄 Leer en: [English](04-tech-stack.md) | **Español**

---

## Resumen del stack

| Capa           | Tecnología                  | Razón                                                                        |
| -------------- | --------------------------- | ---------------------------------------------------------------------------- |
| Frontend       | Vite + React + TypeScript   | SPA rápida, conocida y tipada                                                |
| Estilos        | Tailwind CSS                | Iteración visual rápida y sistema consistente                                |
| Routing        | React Router                | Enrutamiento estándar del cliente                                            |
| Formularios    | React Hook Form + Zod       | Validación tipada y manejo limpio                                            |
| Gráficos       | Recharts                    | Visualización de dashboard/reportes                                          |
| Iconos         | Lucide React                | Tree-shakeable, set de iconos consistente para navegación y acciones UI       |
| Testing        | Vitest                      | Tests rápidos para reglas y utilidades                                       |
| Backend / BaaS | InsForge                    | PostgreSQL, Auth, APIs, Realtime selectivo y Storage futuro con menor carga  |
| Base de datos  | PostgreSQL                  | Modelo relacional adecuado para reservas, facturas, habitaciones y reportes  |
| Deploy         | Vercel / Netlify + InsForge | Camino simple para demo y defensa                                            |

## Por qué este stack

El proyecto tiene tiempo limitado y debe priorizar un MVP funcional y desplegable. InsForge reduce trabajo backend repetitivo sin perder PostgreSQL. React/TypeScript/Tailwind coinciden con experiencia previa y permiten una UI pulida.

## Estrategia de estilos

Tailwind CSS está configurado mediante el plugin de Vite e importado desde `src/index.css`. El CSS global debe limitarse a valores base del documento, variables semánticas de color y resets mínimos; los estilos de features y UI compartida deben usar utilidades de Tailwind.

Los modos claro y oscuro quedan preparados para un cambio manual futuro mediante el atributo `data-theme` en el elemento raíz `<html>`. Usar `data-theme="light"` o `data-theme="dark"` en lugar de depender solo de la preferencia del sistema operativo.

## Sistema de íconos

InnHub usa **Lucide React** como librería de íconos global. Se eligió Lucide por ser tree-shakeable, tener una cuadrícula de diseño consistente de 24px, soporte TypeScript y compatibilidad con React 19.

Convenciones:

- **Íconos de navegación**: 20px, `aria-hidden="true"`, antes de la etiqueta en el sidebar.
- **Íconos en botones**: 16px, antes de la etiqueta, opcionales.
- **Íconos de estado**: según el tono semántico del StatusBadge, decorativos con `aria-hidden`.
- **Íconos de estado vacío**: 48px+, decorativos, acompañados de un mensaje de texto descriptivo.
- **Accesibilidad**: íconos decorativos usan `aria-hidden="true"`; íconos solitarios requieren `aria-label` o `title`.

Cada ruta protegida en `ProtectedRouteMeta` referencia un componente de ícono de Lucide. El mapeo sigue el dominio del módulo (ej: `LayoutDashboard` para dashboard, `Building2` para propiedades, `CalendarCheck` para reservas).

## Configuración de autenticación demo

La pantalla de login incluye un selector de cuentas demo con 5 roles pre-configurados (administrator, manager, receptionist, housekeeping, maintenance). Las credenciales demo están hardcodeadas en `src/features/auth/services/demoCredentials.ts` y no requieren variables de entorno.

El login demo sigue usando el flujo normal de autenticación de InsForge. Para que funcione, el entorno backend debe contener previamente:

- usuarios de InsForge Auth para cada rol demo;
- filas activas en `profiles` cuyo `auth_user_id` coincida con esos usuarios Auth;
- valores de `property_id` válidos en esos perfiles que referencien una propiedad existente.

El código del repositorio no provisiona los usuarios Auth externos ni crea seed data de producción como parte del login demo.

## Estrategia de storage

InsForge Storage forma parte de la capacidad backend seleccionada, pero queda diferido para la implementación actual del MVP hasta que un flujo concreto de archivos lo necesite.

Usos futuros probables:

- comprobantes de pagos manuales;
- adjuntos de tickets de mantenimiento;
- PDFs de facturas;
- logos de propiedades o fotos de habitaciones.

No agregar buckets de storage, UI de carga ni tablas de metadata de archivos como parte del schema core salvo que una issue acotada lo pida explícitamente. Cuando se incorpore, storage debe definir nombres de buckets, rutas filtradas por `property_id`, reglas de acceso y referencias de metadata en PostgreSQL antes de implementarse.

## Estrategia realtime

Realtime es selectivo, no global. Usarlo donde aporte visibilidad operativa:

- alertas del dashboard;
- cambios de estado de habitaciones;
- tareas de limpieza;
- tickets de mantenimiento;
- reservas recientes.

Las suscripciones deben filtrar por `property_id` y montarse solo mientras la pantalla correspondiente está activa.

## Objetivos de testing

- cálculo de noches;
- validación de rangos;
- detección de solapamientos;
- disponibilidad de habitaciones;
- total de factura;
- reglas de check-in/check-out;
- porcentaje de ocupación.

## Documentos relacionados

- [Arquitectura](05-architecture.es.md)
- [Especificación funcional](07-functional-specification.es.md)
