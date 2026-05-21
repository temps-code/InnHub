# Prototipo visual de InnHub

Este directorio guarda el prototipo visual externo generado con Google Stitch AI.

El prototipo es **solo una referencia visual**. Debe guiar el layout, la composición de pantallas, la presentación de estados y la dirección de UI, pero no debe portarse directamente a la aplicación React.

📄 Leer en: [English](README.md) | **Español**

---

## Origen

- Herramienta: Google Stitch AI
- Propósito: explorar la interfaz interna SaaS de InnHub antes de implementar backend y funcionalidades reales
- Identidad de referencia: identidad violeta de InnHub definida en `docs/templates/visual-identity-plan.md`

## Contenido

| Ruta                            | Propósito                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `stitch-ai-export/DESIGN.md`    | Notas y tokens de diseño generados por Stitch                                         |
| `stitch-ai-export/*/screen.png` | Mockups de pantalla exportados desde Stitch                                           |
| `stitch-ai-export/*/code.html`  | Exportaciones HTML estáticas conservadas solo para inspección visual                  |
| `evaluation.md`                 | Evaluación del proyecto: qué conservar, qué rechazar e implicancias de implementación |
| `evaluation.es.md`              | Versión en español de la evaluación                                                   |

## Pantallas incluidas

- Resumen de dashboard
- Tablero de estado de habitaciones
- Gestión de reservas
- Directorio de huéspedes
- Operaciones y mantenimiento
- Facturación e invoices

## Reglas de uso

- Usar capturas y `DESIGN.md` como material de referencia.
- Reconstruir la UI en React + TypeScript + Tailwind CSS.
- Mantener la UI compartida genérica y solo de presentación.
- No copiar el HTML exportado dentro de `src/`.
- No usar Tailwind por CDN, scripts inline ni Chart.js desde el export.
- Preferir dependencias ya existentes del proyecto, como Recharts para gráficos.
- Preservar las reglas de negocio de InnHub, especialmente los estados físicos de habitación: `available`, `occupied`, `cleaning`, `maintenance`, `inactive`.
