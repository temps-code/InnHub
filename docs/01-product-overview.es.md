# InnHub — Visión del Producto

> Este documento define qué es InnHub, a quién sirve y por qué existe el proyecto.

📄 Leer en: [English](01-product-overview.md) | **Español**

---

## Propósito del documento

Explicar la visión del producto y el contexto de negocio antes de entrar en detalles técnicos.

## Resumen ejecutivo

InnHub es un sistema configurable de gestión de alojamientos para hoteles, hostales, residenciales, posadas y negocios similares basados en habitaciones. El MVP se enfoca en claridad operativa: reservas, habitaciones, huéspedes, limpieza, mantenimiento, facturación, pagos, reportes de ocupación y dashboard.

## Problema

Muchos alojamientos pequeños y medianos operan con herramientas fragmentadas: planillas, WhatsApp, notas en papel y coordinación informal. Esto genera poca trazabilidad, confusión sobre estado de habitaciones, choques de reservas, retrasos en limpieza/mantenimiento y reportes limitados.

## Solución propuesta

InnHub centraliza el flujo operativo en una aplicación web. Cada propiedad gestiona sus usuarios, habitaciones, huéspedes, reservas, tareas, facturas, pagos y reportes dentro de un contexto aislado.

## Usuarios objetivo

| Actor | Necesidad principal |
|---|---|
| Administrador | Configurar propiedad, usuarios, roles, habitaciones y ajustes |
| Gerente | Monitorear ocupación, ingresos, operaciones y reportes |
| Recepcionista | Gestionar huéspedes, reservas, check-ins, check-outs, facturas y pagos |
| Personal de limpieza | Seguir y completar tareas de limpieza |
| Personal de mantenimiento | Registrar y resolver incidencias de habitaciones |

## Flujo principal

![Flujo de negocio de InnHub](assets/business-workflow.png)

```text
Consulta del huésped → Reserva → Check-in → Gestión de estadía
      → Limpieza / Mantenimiento → Facturación → Check-out → Reportes
```

## Objetivos

- Construir un MVP académico serio con documentación profesional.
- Mantener alcance realista sin perder valor de negocio.
- Usar stack frontend conocido e InsForge para reducir carga backend.
- Demostrar arquitectura limpia, modularidad y reglas testeables.
- Presentar el proyecto como caso de producto apto para GitHub/CV.

## Fuera de alcance

- Contabilidad completa.
- Nómina o inventario.
- Integraciones con Booking/Airbnb.
- Pasarela de pagos real.
- App móvil.
- BI/IA avanzado.
- Complejidad SaaS multi-tenant empresarial.

## Documentos relacionados

- [MVP Scope](02-mvp-scope.es.md)
- [Domain Model](03-domain-model.es.md)
- [Functional Specification](07-functional-specification.es.md)
