# Matriz de Trazabilidad de Requisitos (BookingSoft)

Este documento cruza los Requerimientos Funcionales (RF) con las Historias de Usuario (HU), Requerimientos No Funcionales (RNF), los endpoints reales implementados en el backend, su estado actual de desarrollo y la prueba automatizada específica que garantiza su cumplimiento.

| RF | HU relacionada | RNF relacionado | Endpoint(s) real(es) | Estado | Prueba automatizada que lo cubre |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RF-001** (Registro) | HU-001 | RNF-001, RNF-010 | `POST /api/auth/registro` | Implementado y probado | `test_registro_exitoso`<br>`test_registro_usuario_duplicado` |
| **RF-002** (Consulta Usuarios) | HU-003 | N/A | Ninguno | Pendiente | Ninguna |
| **RF-003** (Consulta Específica) | HU-004 | N/A | Ninguno | Pendiente | Ninguna |
| **RF-004** (Inicio de Sesión) | HU-002 | RNF-001 | `POST /api/auth/login` | Implementado y probado | `test_login_valido` |
| **RF-005** (Cierre de Sesión) | HU-002 | N/A | `POST /api/auth/logout` | Implementado sin prueba automatizada | Ninguna |
| **RF-006** (Modificación de Rol) | HU-004 | N/A | `PATCH /api/empleados/{id}/rol` | Implementado sin prueba automatizada | Ninguna explícita |
| **RF-007** (Validar Credenciales) | HU-002 | N/A | `POST /api/auth/login` | Implementado y probado | `test_login_credenciales_incorrectas` |
| **RF-008** (Cifrado Contraseñas)| HU-001, HU-002 | RNF-001 | `POST /api/auth/registro`<br>`POST /api/auth/login` | Implementado y probado | Validado en `test_registro_exitoso` y `test_login_valido` |
| **RF-009** (Validar Permisos) | HU-002, HU-003, HU-004 | RNF-009 | Decorador `Depends(requiere_rol)` | Implementado y probado | `test_control_acceso_rol_sin_permiso`<br>`test_control_acceso_sin_token`<br>`test_control_acceso_firma_manipulada` |
| **RF-010** (Gestión de Estado) | HU-001, HU-004 | RNF-010 | `PATCH /api/empleados/{id}/estado`<br>`POST /api/auth/login` | Implementado sin prueba automatizada | El rechazo del login se prueba en `test_login_usuario_inactivo`, pero el `PATCH` no tiene prueba propia |
| **RF-011** (Creación de Reserva) | HU-005 | RNF-009, RNF-011 | `POST /api/reservas` | Implementado y probado | `test_reserva_descuento`<br>`test_reserva_supera_capacidad`<br>`test_reserva_concurrencia_double_booking` |
| **RF-012** (Consulta Disponibilidad)| HU-005, HU-009 | N/A | Ninguno | Pendiente | Ninguna |
| **RF-013** (Modificar Reserva) | HU-005 | N/A | Ninguno | Fase 2 - fuera del alcance comprometido | Ninguna |
| **RF-014** (Cancelar Reserva) | HU-005 | N/A | Ninguno | Fase 2 - fuera del alcance comprometido | Ninguna |
| **RF-015** (Reserva Coworking) | HU-013 | N/A | Ninguno | Fase 2 - fuera del alcance comprometido | Ninguna |

---
**Nota Técnica:**
- Los requisitos marcados como **"Pendiente"** forman parte del Sprint 1, pero su desarrollo de API o pruebas aún no ha sido concluido.
- Los requisitos marcados como **"Fase 2 - fuera del alcance comprometido"** corresponden a características de gestión avanzada que fueron diferidas para no bloquear el flujo crítico (Core) establecido para la fase de estabilización del Sprint 2.
