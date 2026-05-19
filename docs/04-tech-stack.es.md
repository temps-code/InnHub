# InnHub — Stack Tecnológico

> Este documento explica las tecnologías seleccionadas y sus razones.

📄 Leer en: [English](04-tech-stack.md) | **Español**

---

## Resumen del stack

| Capa           | Tecnología                  | Razón                                                                       |
| -------------- | --------------------------- | --------------------------------------------------------------------------- |
| Frontend       | Vite + React + TypeScript   | SPA rápida, conocida y tipada                                               |
| Estilos        | Tailwind CSS                | Iteración visual rápida y sistema consistente                               |
| Routing        | React Router                | Enrutamiento estándar del cliente                                           |
| Formularios    | React Hook Form + Zod       | Validación tipada y manejo limpio                                           |
| Gráficos       | Recharts                    | Visualización de dashboard/reportes                                         |
| Testing        | Vitest                      | Tests rápidos para reglas y utilidades                                      |
| Backend / BaaS | InsForge                    | PostgreSQL, Auth, Storage, APIs y Realtime con menos carga backend          |
| Base de datos  | PostgreSQL                  | Modelo relacional adecuado para reservas, facturas, habitaciones y reportes |
| Deploy         | Vercel / Netlify + InsForge | Camino simple para demo y defensa                                           |

## Por qué este stack

El proyecto tiene tiempo limitado y debe priorizar un MVP funcional y desplegable. InsForge reduce trabajo backend repetitivo sin perder PostgreSQL. React/TypeScript/Tailwind coinciden con experiencia previa y permiten una UI pulida.

## Estrategia de estilos

Tailwind CSS está configurado mediante el plugin de Vite e importado desde `src/index.css`. El CSS global debe limitarse a valores base del documento, variables semánticas de color y resets mínimos; los estilos de features y UI compartida deben usar utilidades de Tailwind.

Los modos claro y oscuro quedan preparados para un cambio manual futuro mediante el atributo `data-theme` en el elemento raíz `<html>`. Usar `data-theme="light"` o `data-theme="dark"` en lugar de depender solo de la preferencia del sistema operativo.

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
