# 🌿 Criterio 12: Manejo Apropiado del Repositorio, Ramas, Commits Semánticos y Pull Requests

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Plataforma:** GitHub (`bookingsoftHOTELFACILE/PROYECTO_FACILE`)  
**Fecha:** Noviembre 2026  
**Criterio Oficial:** Manejo apropiado del repositorio con ramas y commits.

---

## 1. Estrategia de Ramificación (Git Flow Adaptado)

El equipo implementó una disciplina estricta de branching para evitar la corrupción de código y permitir el trabajo simultáneo de los cinco integrantes sin colisiones:

```
[main]          ●───────────────────────────────────● (v1.0 Producción Estable)
                ▲                                   ▲
[develop]       ●────────●────────●────────●────────● (Integración Continua)
                │        ▲        │        ▲
[feature/*]     └────────┘        │        │          (Nuevas Funcionalidades)
[test/*]                          └────────┘          (Suites de Prueba y CI)
```

### Reglas de Ramas:
1. **`main`:** Contiene exclusivamente código desplegable y probado en producción. Está protegida mediante **GitHub Rulesets** (requiere PR, 1 aprobación y paso obligatorio de los 4 checks de CI; prohibido el borrado y `git push --force`).
2. **`develop`:** Rama de integración continua donde convergen las características y pruebas aprobadas.
3. **Ramas de Tarea (`feature/*` y `test/*`):** Ramas de ciclo de vida corto creadas por cada desarrollador según la historia de usuario o capa semanal (ej. `test/api-contract-auth`, `feat/test-component-login`).

---

## 2. Convención Semántica de Commits (Conventional Commits)

Todos los commits del repositorio siguen el estándar de la industria:

`tipo(alcance): descripción clara en presente y minúsculas sin emojis`

| Tipo | Propósito | Ejemplo Real en el Repositorio |
|---|---|---|
| **`feat`** | Nueva funcionalidad | `feat(auth): unificar cuenta unica y rol Grupo BookingSoft con correo bookingsoft4@gmail.com` |
| **`test`** | Pruebas unitarias, integración o E2E | `test(api): implementar pruebas de contrato HTTP para auth con status codes y mutante manual` |
| **`fix`** | Corrección de defecto o bug | `fix(folio): omitir cedula para cuenta creadora Grupo BookingSoft y mantener solo correo` |
| **`docs`** | Documentación y diagramas | `docs: estandarizar matriz de rotacion con enlaces y numeros de PRs #XX para todo el equipo` |
| **`ci`** | Configuración de pipelines y GitHub Actions | `ci(backend): optimizar pipeline con cache de pip y forzar umbral estricto del 80% de cobertura` |
| **`merge`** | Fusión controlada de ramas | `merge: sincronizar pull request #56 aprobado en develop remoto` |

---

## 3. Catálogo y Trazabilidad de Pull Requests (PRs Oficiales)

El repositorio registra 28 Pull Requests en GitHub con revisión entre pares (*peer review*), checklists de cumplimiento y mutantes manuales documentados:

| PR # | Autor | Rama Origen | Rama Base | Estado | Descripción Técnica |
|:---:|---|---|:---:|:---:|---|
| **#47** | `@jocmiguelchicoc` | `test/semana-01` | `main` | **Merged** | Suite E2E inicial con Playwright y línea base de cobertura (S1). |
| **#48** | `@xiomaraecheverry` | `feature/HU-009-catalogo` | `main` | **Merged** | Catálogo de unidades y navegación general. |
| **#50** | `@jocmiguelchicoc` | `test/cotizacion-front` | `develop` | **Abierto / Integrable** | Función pura de cotización con `it.each` y mutante (S2). |
| **#51** | `@jocmiguelchicoc` | `test/e2e-habitaciones` | `main` | **Merged** | Suite E2E de registro de huésped y reserva de unidades (S1). |
| **#52** | `@maicolmayor23-code` | `test/api-reservas-service` | `develop` | **Merged** | Pruebas unitarias para reglas de negocio en `reservas_service` (S2). |
| **#53** | `@xiomaraecheverry` | `test/bd-model-huesped` | `develop` | **Merged** | Validaciones de modelo Huésped y restricciones relacionales (S2). |
| **#54** | `@Davidlopez2204` | `test/api-auth-service` | `develop` | **Abierto / Integrable** | Pruebas unitarias de `auth_service` con patrón AAA (S2). |
| **#55** | `@jocmiguelchicoc` | `feat/test-component-login` | `develop` | **Abierto / Integrable** | Pruebas RTL y user-event para LoginForm PMS (S3). |
| **#56** | `@jocmiguelchicoc` | `test/api-contract-auth` | `develop` | **Merged** | Pruebas de contrato HTTP para autenticación (S4). |
| **#57** | `@jocmiguelchicoc` | `test/bd-mock-repositories` | `develop` | **Abierto / Integrable** | Dobles de prueba para repositorios con rollback (S5). |
| **#58** | `@jocmiguelchicoc` | `test/e2e-real-db-persistence` | `develop` | **Abierto / Integrable** | Persistencia real en PostgreSQL y reactividad UI (S6). |
| **#59** | `@jocmiguelchicoc` | `test/e2e-double-click-protection` | `develop` | **Merged** | Remediación integral y protección contra doble clic (S7). |
| **#60** | `@Davidlopez2204` | `feat/test-component-registro` | `develop` | **Abierto / Integrable** | Pruebas RTL para formulario de registro (S3). |
| **#61** | `@Davidlopez2204` | `test/bd-consultas-disponibilidad` | `develop` | **Abierto / Integrable** | Consultas SQL de disponibilidad por rango y mutante (S4). |
| **#62** | `@Davidlopez2204` | `test/e2e-network-mocking` | `develop` | **Abierto / Integrable** | Intercepción de red `page.route()` ante HTTP 500 (S5). |
| **#63** | `@xiomaraecheverry` | `feat/test-component-calendario` | `develop` | **Abierto / Integrable** | Componente CalendarioReserva con pruebas unitarias RTL (S3). |
| **#64** | `@maicolmayor23-code` | `feat/test-component-catalogo` | `develop` | **Abierto / Integrable** | Pruebas de componente CatalogoHabitaciones (S3). |
| **#65** | `@maicolmayor23-code` | `test/e2e-api-monitoring` | `develop` | **Abierto / Integrable** | Monitoreo de contrato HTTP con `waitForResponse` (S4). |
| **#66** | `@maicolmayor23-code` | `test/front-mock-api` | `develop` | **Abierto / Integrable** | Dobles de prueba con `vi.mock()` para cliente HTTP (S5). |
| **#67** | `@xiomaraecheverry` | `test/front-http-client` | `develop` | **Merged** | Pruebas unitarias de cliente HTTP fetch (S4). |
| **#68** | `@xiomaraecheverry` | `test/api-mock-email-service` | `develop` | **Abierto / Integrable** | Mock del servicio de confirmación por correo (S5). |
| **#69** | `@xiomaraecheverry` | `test/bd-real-constraints` | `develop` | **Merged** | Validación de llaves foráneas y límites VARCHAR (S6). |
| **#71** | `@maicolmayor23-code` | `test/api-db-transactions` | `develop` | **Abierto / Integrable** | Transacciones atómicas contra PostgreSQL y concurrencia (S6). |
| **#72** | `@Davidlopez2204` | `docs/alineacion-final-codigo` | `develop` | **Merged** | Alineación final de documentación y diagramas con código (S8). |
| **#73** | `@maicolmayor23-code` | `test/e2e-network-throttling` | `develop` | **Merged** | Conexión lenta 3G, skeleton accesible y sin pantallas en blanco (S7). |
| **#74** | `@Davidlopez2204` | `test/front-real-data-errors` | `develop` | **Abierto / Integrable** | Manejo de errores reales de BD en modal y cliente (S6). |
