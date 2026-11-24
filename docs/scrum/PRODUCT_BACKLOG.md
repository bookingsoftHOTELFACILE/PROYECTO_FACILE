# 📋 Product Backlog — Apartahotel Facile (BookingSoft PMS)

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Metodología:** SCRUM / Metodologías Ágiles de Desarrollo de Software  
**Escala de Estimación:** Serie de Fibonacci (1, 2, 3, 5, 8, 13, 21 Story Points)  
**Equipo de Desarrollo ADSO (Equipo Multidisciplinario y Colaborativo):**
- **Product Owner (Requisitos, HUs y Trazabilidad):** Ashly Echeverri
- **Scrum Master & Desarrollador Full-Stack:** David López
- **Diseñador UI/UX & Desarrollador Frontend Lead:** José Miguel Chico
- **Desarrollador Backend Lead, Lógica & QA:** Maicol Mayor
- **Desarrollador Base de Datos Inicial, Seguridad & Docker:** Sebastián Parada

---

## 1. Visión General del Backlog

El **Product Backlog** consolida las 15 Historias de Usuario (HUs) del sistema PMS hotelero, priorizadas por valor para el negocio hotelero (MoSCoW: *Must have, Should have, Could have, Won't have*) y estimadas mediante la técnica de **Planning Poker** con el equipo de desarrollo.

Total de puntos estimados: **93 Story Points (SP)** distribuidos en 3 Sprints de desarrollo de 2 semanas cada uno.

---

## 2. Matriz Consolidada de Historias de Usuario Puntuadas

| Código | Título de la Historia de Usuario | Prioridad MoSCoW | Story Points | Sprint Asignado | Responsable Principal | Estado |
|---|---|---|:---:|:---:|---|:---:|
| **HU-001** | Registro de nuevos usuarios y colaboradores con asignación de rol | MUST | **3 SP** | Sprint 1 | José Chico / Ashly E. | ✅ Terminado |
| **HU-002** | Inicio de sesión seguro con JWT y control de acceso RBAC | MUST | **5 SP** | Sprint 1 | Sebastián Parada | ✅ Terminado |
| **HU-003** | Consulta y listado administrativo de usuarios y colaboradores | SHOULD | **2 SP** | Sprint 1 | Maicol Mayor | ✅ Terminado |
| **HU-004** | Consulta detallada y edición de perfil de colaborador | SHOULD | **3 SP** | Sprint 1 | David López | ✅ Terminado |
| **HU-006** | Configuración de tarifas dinámicas por tipo de unidad y temporadas | MUST | **5 SP** | Sprint 2 | Maicol Mayor | ✅ Terminado |
| **HU-009** | Catálogo y registro de unidades habitacionales (Dúplex, Suites) | MUST | **8 SP** | Sprint 2 | David López / José Chico | ✅ Terminado |
| **HU-005** | Motor de reservas presenciales Walk-In, Check-In y Check-Out | MUST | **13 SP** | Sprint 2 | José Chico / David López | ✅ Terminado |
| **HU-014** | Disponibilidad en vivo 24/7 y validación de overbooking | MUST | **3 SP** | Sprint 2 | Maicol Mayor | ✅ Terminado |
| **HU-007** | Registro de consumos extras, minibar y servicios adicionales al folio | SHOULD | **8 SP** | Sprint 3 | Maicol Mayor | ✅ Terminado |
| **HU-008** | Módulo operativo de limpieza, ama de llaves y mantenimiento | SHOULD | **5 SP** | Sprint 3 | Sebastián Parada | ✅ Terminado |
| **HU-010** | Gestión financiera, liquidación de depósitos y folios contables | MUST | **13 SP** | Sprint 3 | José Chico | ✅ Terminado |
| **HU-011** | Control de inventario operativo y alertas de reposición | COULD | **5 SP** | Sprint 3 | Ashly Echeverri | ✅ Terminado |
| **HU-012** | Notificaciones automáticas de confirmación y claves digitales | COULD | **8 SP** | Sprint 3 | Sebastián Parada | ✅ Terminado |
| **HU-013** | Módulo de reservas de salas de juntas y espacios de Coworking | SHOULD | **8 SP** | Sprint 3 | David López | ✅ Terminado |
| **HU-015** | Dashboard gerencial, métricas de ocupación y reportes PMS | SHOULD | **7 SP** | Sprint 3 | David López / José Chico | ✅ Terminado |

**Totales por Sprint:**
- **Sprint 1 (Fundamentos, Autenticación y Modelado):** 13 Story Points
- **Sprint 2 (Inventario Habitacional, Reservas y Check-In/Out):** 29 Story Points
- **Sprint 3 (Folio Contable, Coworking, Mantenimiento y Cierre):** 51 Story Points (con 2 desarrolladores dedicados en paralelo)

---

## 3. Criterios de Aceptación Globales (Definition of Done - DoD)

Para que una Historia de Usuario se considere formalmente **Done (Terminada)**, debe cumplir:
1. **Código fuente limpio:** Cumplir lineamientos de PEP 8 (Python) y ESLint/Prettier (React).
2. **Pruebas automatizadas:** El backend debe pasar sus tests unitarios en Pytest con aserciones sobre estados HTTP y lógica de negocio.
3. **Persistencia verificada:** Operaciones CRUD ejecutadas contra PostgreSQL sin errores de integridad referencial.
4. **Seguridad RBAC:** Endpoints protegidos según la matriz de roles (Administrador, Recepcionista, Ama de llaves, Mantenimiento).
5. **Interfaz responsiva:** Pantallas funcionales en desktop y móvil sin scroll horizontal indeseado y con diseño cohesivo.
6. **Revisión por pares (Code Review):** Aprobación mediante Pull Request en la rama `develop` antes de integración.
