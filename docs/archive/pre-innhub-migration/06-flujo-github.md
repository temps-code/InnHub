# Flujo de trabajo GitHub — HotelFlow ERP/CRM

Este documento define la forma de trabajo con GitHub para el desarrollo individual del MVP de **HotelFlow ERP/CRM**.

El objetivo es mantener un flujo profesional, ordenado y defendible, pero sin agregar ramas temporales ni carga administrativa innecesaria por el plazo disponible.

---

# 1. Principios de trabajo

El proyecto se desarrollará siguiendo estos principios:

```text
Cada cambio importante nace desde una issue.
Cada PR corresponde a una issue concreta.
Cada PR puede tener varios commits relacionados.
Solo se usarán cuatro ramas: main, qa, features y refactor.
features se usa para desarrollar funcionalidades.
qa se usa para validar integración.
refactor se usa para corregir o reorganizar trabajo que falló en qa.
main representa la versión estable/desplegable.
```

Decisión importante:

```text
No se usarán ramas temporales tipo feature/*, bugfix/* o docs/*.
```

Motivo:

- el proyecto es individual;
- queda poco tiempo;
- se busca mantener trazabilidad sin sobredimensionar el flujo;
- las issues y PRs serán suficientes para mostrar orden profesional.

---

# 2. Ramas del proyecto

El flujo utilizará únicamente cuatro ramas permanentes:

```text
main
qa
features
refactor
```

---

## 2.1. Rama main

Propósito:

```text
Contener la versión estable del sistema.
```

Uso:

- representa el estado listo para demo o defensa;
- debe estar siempre funcional;
- se usa como base para despliegue estable;
- solo recibe cambios validados desde `qa`.

Regla:

```text
No se trabaja directamente sobre main.
```

---

## 2.2. Rama qa

Propósito:

```text
Validar funcionalidades integradas antes de pasarlas a main.
```

Uso:

- recibe cambios desde `features`;
- se usa para pruebas manuales;
- se usa para revisar que los módulos funcionen en conjunto;
- permite detectar errores antes de afectar main.

Regla:

```text
Todo lo que llegue a main debe haber pasado antes por qa.
```

---

## 2.3. Rama features

Propósito:

```text
Desarrollar e integrar funcionalidades del MVP.
```

Uso:

- es la rama principal de desarrollo;
- cada issue se trabaja en esta rama;
- cada conjunto de commits relacionados se envía por PR hacia `qa`;
- permite acumular avances antes de validarlos.

Regla:

```text
No se crean ramas feature/*.
El desarrollo funcional se realiza directamente en features.
```

Ejemplos de trabajo en `features`:

```text
Issue #12: Configurar autenticación
Issue #18: Crear gestión de habitaciones
Issue #25: Crear flujo de reservas
Issue #31: Crear módulo de limpieza
Issue #36: Crear dashboard operativo
```

---

## 2.4. Rama refactor

Propósito:

```text
Corregir, reorganizar o simplificar trabajo que no funcionó correctamente en qa.
```

Uso:

- se usa cuando algo validado en `qa` requiere corrección estructural;
- permite refactorizar sin ensuciar `main`;
- una vez corregido, vuelve a `qa` mediante PR.

Regla:

```text
refactor no es una rama de desarrollo normal.
Se usa cuando algo no funcionó correctamente en qa o necesita reorganización antes de llegar a main.
```

Ejemplos de uso:

```text
Una funcionalidad funciona aislada pero rompe el flujo integrado.
Una estructura de carpetas quedó confusa.
Una validación quedó duplicada en varios módulos.
Un componente quedó demasiado grande y necesita dividirse.
Una integración con InsForge quedó acoplada directamente a muchas pantallas.
```

---

# 3. Flujo general

## 3.1. Desarrollo normal

```text
Issue en GitHub
  ↓
Trabajo en rama features
  ↓
Varios commits claros relacionados con la issue
  ↓
Pull Request de features hacia qa
  ↓
Validación en qa
  ↓
Pull Request de qa hacia main
```

---

## 3.2. Si algo falla en qa

```text
qa detecta problema
  ↓
Se trabaja la corrección en refactor
  ↓
Pull Request de refactor hacia qa
  ↓
Nueva validación en qa
  ↓
Pull Request de qa hacia main
```

---

## 3.3. Flujo resumido

```text
features
  ↓ PR por issue
qa
  ↓ si falla o requiere rediseño
refactor
  ↓ PR corregido
qa
  ↓ PR validado
main
```

---

# 4. Pull Requests

Cada PR debe cumplir:

```text
Corresponder a una issue.
Tener título claro.
Explicar qué se hizo.
Incluir pruebas realizadas.
Incluir capturas si cambia la UI.
No mezclar funcionalidades grandes no relacionadas.
```

---

## 4.1. PR de features hacia qa

Este es el PR más frecuente.

Uso:

```text
features → qa
```

Representa:

```text
Una funcionalidad terminada o una unidad de trabajo asociada a una issue.
```

Ejemplo:

```text
Issue #25: Crear flujo de reservas
PR: features → qa
Commits incluidos:
- feat(reservations): add reservation form
- feat(reservations): add availability validation
- feat(reservations): add reservation list
- test(reservations): add date validation tests
```

---

## 4.2. PR de refactor hacia qa

Uso:

```text
refactor → qa
```

Representa:

```text
Corrección estructural o reorganización de algo que falló en qa.
```

Ejemplo:

```text
Issue #41: Refactorizar lógica de reservas luego de QA
PR: refactor → qa
Commits incluidos:
- refactor(reservations): extract date validation helpers
- refactor(reservations): centralize reservation status rules
- fix(reservations): prevent check-in from invalid status
```

---

## 4.3. PR de qa hacia main

Uso:

```text
qa → main
```

Representa:

```text
Promoción de una versión validada hacia la rama estable.
```

Este PR debe hacerse cuando el sistema esté probado y listo para demo/despliegue.

---

# 5. Formato recomendado de PR

```md
## Resumen

Describe brevemente qué cambia.

## Issue relacionada

Closes #<numero>

## Cambios realizados

- Cambio 1
- Cambio 2
- Cambio 3

## Pruebas realizadas

- [ ] Probado manualmente
- [ ] Tests unitarios ejecutados, si aplica
- [ ] No rompe navegación principal

## Capturas

Agregar si cambia la interfaz.

## Notas

Riesgos, pendientes o decisiones importantes.
```

---

# 6. Commits

Cada PR puede tener varios commits, pero deben ser claros y relacionados con la issue.

Formato recomendado:

```text
type(scope): descripción corta
```

Tipos sugeridos:

```text
feat
fix
docs
refactor
test
style
chore
```

Ejemplos:

```text
feat(reservations): add reservation creation form
feat(rooms): add room status selector
fix(billing): correct invoice total calculation
docs(readme): add local setup instructions
refactor(cleaning): extract room status update helper
test(utils): add invoice calculation tests
```

---

# 7. Issues

Cada issue representa una unidad de trabajo clara.

Tipos de issue:

```text
Feature
Bug
Documentation
Refactor
Test
Task
```

---

## 7.1. Formato recomendado de issue

```md
## Descripción

Qué se necesita implementar o corregir.

## Objetivo

Qué resultado debe lograrse.

## Alcance

- Incluido
- Incluido

## Fuera de alcance

- No incluido
- No incluido

## Criterios de aceptación

- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

## Módulo relacionado

Reservas / Habitaciones / Limpieza / Mantenimiento / Facturación / Dashboard / etc.
```

---

# 8. Labels recomendados

## Tipo

```text
type:feature
type:bug
type:docs
type:refactor
type:test
type:task
```

## Prioridad

```text
priority:high
priority:medium
priority:low
```

## Módulo

```text
module:auth
module:hotels
module:rooms
module:customers
module:reservations
module:cleaning
module:maintenance
module:billing
module:reports
module:dashboard
module:docs
```

## Estado

```text
status:backlog
status:ready
status:in-progress
status:review
status:qa
status:blocked
status:done
```

---

# 9. GitHub Projects

Se recomienda usar GitHub Projects en lugar de Jira para este MVP.

Motivo:

- menor carga administrativa;
- integración directa con issues y PRs;
- más visible en GitHub;
- suficiente para un proyecto individual con poco tiempo.

Columnas sugeridas:

```text
Backlog
Ready
In Progress
Review
QA
Done
```

---

# 10. Milestones sugeridos

```text
MVP-01 Foundation
MVP-02 Hotels Rooms Users
MVP-03 Customers Reservations
MVP-04 Cleaning Maintenance
MVP-05 Billing Reports
MVP-06 Dashboard Deploy
MVP-07 Documentation Defense
```

---

# 11. Relación entre issue, commits y PR

Regla principal:

```text
1 issue = 1 PR principal
```

Una issue puede tener varios commits, pero no debería mezclar funcionalidades grandes no relacionadas.

Ejemplo correcto:

```text
Issue #25: Crear flujo de reservas
Rama de trabajo: features
PR: features → qa
Commits:
- feat(reservations): add reservation form
- feat(reservations): add availability validation
- feat(reservations): add reservation list
- test(reservations): add date validation tests
```

Ejemplo incorrecto:

```text
Issue #25: Crear flujo de reservas
Incluye también dashboard, facturación y usuarios.
```

---

# 12. Recomendación práctica para trabajar solo con features

Como no habrá ramas temporales, se recomienda trabajar así:

```text
1. Elegir una issue.
2. Cambiar a rama features.
3. Hacer commits relacionados solo con esa issue.
4. Abrir PR features → qa.
5. Validar y mergear.
6. Sincronizar features con qa antes de seguir con la siguiente issue.
```

Esto mantiene la rama `features` alineada con lo ya validado y evita arrastrar cambios viejos sin revisar.

---

# 13. Estrategia para la defensa final

Antes de la defensa, `main` debe contener:

```text
MVP funcional
README actualizado
instrucciones de instalación
capturas o demo
link al deploy
modelo de datos documentado
stack y arquitectura documentados
flujo de trabajo documentado
issues y PRs representativos
```

La rama `main` debe ser la versión estable que se muestre como entrega final.

---

# 14. Decisión final

El proyecto usará únicamente estas ramas:

```text
main      → estable / deploy / defensa
qa        → validación funcional integrada
features  → desarrollo de funcionalidades y PRs por issue hacia qa
refactor  → correcciones estructurales de trabajo que falló en qa
```

No se usarán ramas temporales.

Este flujo mantiene orden profesional sin volverse pesado para un MVP individual de dos semanas.
