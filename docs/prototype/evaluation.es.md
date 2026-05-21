# Evaluación del prototipo de Stitch

## Veredicto

El prototipo de Stitch es útil como referencia visual para InnHub. Valida la dirección de una interfaz SaaS interna, limpia y operativa, con navegación fija, dashboards operacionales, cards, tablas, filtros y badges de estado.

No debe tratarse como código de producción ni copiarse directamente dentro de la app.

📄 Leer en: [English](evaluation.md) | **Español**

---

## Qué conservar

- Shell de aplicación con sidebar fijo y topbar.
- Área de trabajo clara con cards blancas y acentos violetas sutiles.
- Cards de métricas para indicadores del dashboard.
- Tablero de habitaciones con cards y acentos laterales por estado.
- Badges de estado con indicador circular pequeño.
- Tablas densas para reservas, huéspedes, mantenimiento y facturación.
- Separación clara entre dashboard, habitaciones, reservas, huéspedes, operaciones y facturación.
- Tono general del producto: profesional, calmo, operativo y no turístico.

## Qué rechazar o ajustar

- No portar directamente el HTML estático.
- No conservar la configuración Tailwind por CDN ni scripts inline.
- No introducir Chart.js; el proyecto ya depende de Recharts.
- Corregir la semántica de colores de estados:
  - `occupied` debe usar violeta/activo, no rojo/error.
  - rojo debe reservarse para estados urgentes o de error.
  - mantenimiento debe usar ámbar/warning.
  - limpieza debe usar teal/info.
- Tratar glitches visuales como artefactos del export, no como decisiones de diseño.
- Reemplazar acciones solo con íconos por controles React accesibles y etiquetados.
- Evitar depender únicamente del color para comunicar estados.

## Implicancias de implementación

El export sugiere que probablemente se necesiten estas piezas reutilizables de UI:

- `AppShell`
- `SidebarNav`
- `TopBar`
- `DataTable`
- `FilterBar`
- `RoomCard`
- `StatusBadge` mejorado con indicador circular opcional

Las pantallas de features deben reconstruirse dentro de la arquitectura React existente en vez de importar HTML generado.

## Próximo paso recomendado

Continuar con la issue #3 (`chore(foundation): define routing and protected layout structure`) y usar este prototipo como referencia visual para:

- shell de aplicación;
- organización de rutas;
- pantallas placeholder por módulo;
- primera estructura visual de pantallas.

El primer slice visual concreto debería ser el **Room Status Board**, porque ejercita estados de habitación, cards, filtros, badges y reglas del dominio MVP sin requerir integración backend.

## No objetivos de esta referencia

- No integración backend.
- No enforcement real de autenticación/sesión.
- No persistencia.
- No validación de solapamiento de reservas.
- No port directo del código fuente HTML de Stitch.
