# InnHub — Visión del Producto

> Este documento define qué es InnHub, a quién sirve y por qué existe el proyecto.  
> Para el marco académico y las pautas de evaluación, consulte [Objetivos Académicos y Criterios de Refactorización](ACADEMIC.es.md).

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

Consulte la [Especificación Funcional](07-functional-specification.es.md#actores) para ver la lista detallada de actores del proyecto y sus necesidades operativas específicas.

## Flujo principal

![Flujo de negocio de InnHub](assets/business-workflow.png)

```text
Consulta del huésped → Reserva → Check-in → Gestión de estadía
      → Limpieza / Mantenimiento → Facturación → Check-out → Reportes
```

## Objetivos

- Mantener alcance realista sin perder valor de negocio.
- Usar stack frontend conocido e InsForge para reducir carga backend.
- Para los objetivos específicos de la evaluación académica, consulte [Objetivos Académicos y Criterios de Refactorización](ACADEMIC.es.md).

## Fuera de alcance

Consulte el [Alcance del MVP](02-mvp-scope.es.md#fuera-de-alcance) para ver los límites, restricciones y definiciones de fuera de alcance del proyecto.

## Documentos relacionados

- [Criterios Académicos](ACADEMIC.es.md)
- [MVP Scope](02-mvp-scope.es.md)
- [Domain Model](03-domain-model.es.md)
- [Functional Specification](07-functional-specification.es.md)
