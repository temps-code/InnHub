# InnHub — Especificación Funcional

> Este documento consolida requisitos, actores, reglas y criterios de aceptación del MVP.

📄 Leer en: [English](07-functional-specification.md) | **Español**

---

## Actores

| Actor | Responsabilidades |
|---|---|
| Administrador | Configuración de propiedad, usuarios, roles y habitaciones |
| Gerente | Reportes, dashboard y monitoreo operativo |
| Recepcionista | Huéspedes, reservas, check-ins, check-outs, facturación y pagos |
| Personal de limpieza | Ejecución de tareas de limpieza |
| Personal de mantenimiento | Ejecución de tickets de mantenimiento |

## Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-01 | Gestionar perfil y configuración de propiedad |
| RF-02 | Gestionar usuarios y permisos por rol |
| RF-03 | Gestionar tipos de habitación |
| RF-04 | Gestionar habitaciones y estados físicos |
| RF-05 | Gestionar huéspedes/clientes |
| RF-06 | Crear, actualizar y cancelar reservas |
| RF-07 | Validar disponibilidad por rango de fechas |
| RF-08 | Ejecutar check-in y check-out |
| RF-09 | Generar tareas de limpieza luego del check-out |
| RF-10 | Registrar y resolver tickets de mantenimiento |
| RF-11 | Generar facturas |
| RF-12 | Registrar pagos manuales |
| RF-13 | Generar reportes de ocupación e ingresos |
| RF-14 | Mostrar métricas del dashboard |
| RF-15 | Usar realtime selectivo para cambios operativos |
| RF-16 | Preservar aislamiento de datos por propiedad |

## Requisitos no funcionales

| Área | Requisito |
|---|---|
| Mantenibilidad | Organización por features y límites claros |
| Seguridad | Acceso autenticado y permisos por rol |
| Integridad | Evitar reservas superpuestas y proteger facturas pagadas |
| Usabilidad | Pantallas operativas claras y estados legibles |
| Testeabilidad | Reglas de negocio como funciones testeables |
| Despliegue | MVP desplegable para demo/defensa |

## Reglas de negocio

- Cada usuario pertenece a una sola propiedad en el MVP.
- Los registros operativos se filtran por propiedad.
- Una habitación no puede tener reservas activas superpuestas.
- Para los estados físicos de habitación y sus reglas de transición, consulte el [Alcance del MVP](02-mvp-scope.es.md#estados-de-habitacion). Una reserva futura no cambia el estado físico a `reserved`.
- El check-out dispara el flujo de limpieza.
- Mantenimiento bloquea la disponibilidad de la habitación.
- Las facturas pagadas no se pueden modificar.

## Flujo de aceptación

```text
Configurar propiedad
→ crear usuario
→ crear tipo de habitación
→ crear habitación
→ crear huésped
→ crear reserva
→ validar disponibilidad
→ check-in
→ check-out
→ crear tarea de limpieza
→ generar factura
→ registrar pago
→ ver reporte/dashboard
```

## Documentos relacionados

- [Product Overview](01-product-overview.es.md)
- [MVP Scope](02-mvp-scope.es.md)
- [Domain Model](03-domain-model.es.md)
