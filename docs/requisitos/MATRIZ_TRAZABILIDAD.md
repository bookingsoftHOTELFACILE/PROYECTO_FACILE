# Matriz de Trazabilidad de Requisitos (BookingSoft)

<!--
  ¿Qué? Matriz de trazabilidad entre Requisitos Funcionales (RF), Historias de Usuario (HU),
        Requisitos No Funcionales (RNF), Endpoints de la API REST y Pruebas Automatizadas.
  ¿Para qué? Garantizar que cada funcionalidad requerida tenga un endpoint implementado,
             un control de acceso (RBAC) verificado y una prueba de integración que la certifique.
  ¿Impacto? Sin este documento, no es posible auditar la cobertura funcional del sistema.
-->

> **Fecha de actualización:** 2026-08-31
> **Estado global:** 12 Requisitos Funcionales Implementados y Probados | 3 Requisitos Diferidos a Fase 2 (Alcance Delimitado)

---

## 📊 Matriz Principal de Trazabilidad

| RF | Historia de Usuario | RNF Relacionado | Endpoint(s) REST | Estado | Cobertura / Prueba Automatizada |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RF-001** (Registro de Empleado) | HU-001 | RNF-001, RNF-010 | `POST /api/auth/registro` | ✅ Implementado y probado | `test_registro_exitoso`<br>`test_registro_usuario_duplicado` |
| **RF-002** (Consulta Lista Empleados) | HU-003 | RNF-009 | `GET /api/empleados` | ✅ Implementado y probado | `test_rf002_consulta_listado_empleados` |
| **RF-003** (Consulta Empleado Específico) | HU-004 | RNF-009 | `GET /api/empleados/{id}` | ✅ Implementado y probado | `test_rf003_consulta_empleado_especifico` |
| **RF-004** (Inicio de Sesión / Autenticación) | HU-002 | RNF-001 | `POST /api/auth/login` | ✅ Implementado y probado | `test_login_valido` |
| **RF-005** (Cierre de Sesión / Invalidation) | HU-002 | RNF-001 | Client-side Token Purge | ✅ Implementado | Destrucción de token Bearer en cliente |
| **RF-006** (Modificación de Rol de Empleado) | HU-004 | RNF-009 | `PATCH /api/empleados/{id}/rol` | ✅ Implementado y probado | `test_recepcionista_gestion_rol_y_estado` |
| **RF-007** (Validación de Credenciales) | HU-002 | RNF-001 | `POST /api/auth/login` | ✅ Implementado y probado | `test_login_credenciales_incorrectas` |
| **RF-008** (Cifrado de Contraseñas) | HU-001, HU-002 | RNF-001 | `POST /api/auth/registro`<br>`POST /api/auth/login` | ✅ Implementado y probado | Validado con `bcrypt` (cost factor 12) en `test_registro_exitoso` y `test_login_valido` |
| **RF-009** (Control de Acceso / RBAC) | HU-002, HU-003, HU-004 | RNF-009 | Decorador `requiere_rol()` | ✅ Implementado y probado | `test_control_acceso_rol_sin_permiso`<br>`test_control_acceso_sin_token`<br>`test_control_acceso_firma_manipulada` |
| **RF-010** (Gestión de Estado Activo/Inactivo) | HU-001, HU-004 | RNF-010 | `PATCH /api/empleados/{id}/estado`<br>`POST /api/auth/login` | ✅ Implementado y probado | `test_login_usuario_inactivo`<br>`test_recepcionista_gestion_rol_y_estado` |
| **RF-011** (Creación de Reserva Atómica) | HU-005 | RNF-009, RNF-011 | `POST /api/reservas` | ✅ Implementado y probado | `test_reserva_descuento`<br>`test_reserva_supera_capacidad`<br>`test_reserva_concurrencia_double_booking` |
| **RF-012** (Consulta Disponibilidad Habitaciones) | HU-005, HU-009 | RNF-011 | `GET /api/habitaciones` | ✅ Implementado y probado | `test_rf012_consulta_disponibilidad` |
| **RF-013** (Modificación de Reserva) | HU-005 | N/A | N/A | ⏳ Fase 2 (Diferido) | Ver Sección de Decisiones de Alcance |
| **RF-014** (Cancelación de Reserva) | HU-005 | RNF-009, RNF-010 | `DELETE /api/reservas/{id}` | ✅ Implementado y probado | `test_borrar_reserva`<br>`test_recepcionista_cancela_reserva` (baja lógica: `estado = 'Cancelada'`) |
| **RF-015** (Reserva Espacios Coworking) | HU-013 | N/A | N/A | ⏳ Fase 2 (Diferido) | Ver Sección de Decisiones de Alcance |

---

## 🎯 Justificación Técnica de Decisiones de Alcance (Fase 2)

Las siguientes funcionalidades fueron catalogadas y documentadas intencionalmente para la **Fase 2** del proyecto:

| Requisito | Descripción | Justificación Técnica / Argumento para Sustentación |
| :--- | :--- | :--- |
| **RF-013** | Modificación de fechas/habitaciones en reserva existente | Para garantizar la integridad referencial y prevenir condiciones de carrera (Double-Booking), el flujo de modificación exige la atomicidad de una cancelación (`DELETE`) seguida de una nueva creación (`POST`). La edición in-situ requeriría re-evaluar la exclusión GiST de PostgreSQL sobre rangos solapados en una misma transacción. Se priorizó la atomicidad de la creación (RF-011) e inmutabilidad de la reserva creada. |
| **RF-015** | Alquiler de salas de coworking / reuniones | El núcleo de negocio (Core PMS) del Apartahotel Facile se concentra en la pernoctación y gestión de habitaciones. Las salas de coworking representan una unidad de negocio secundaria cuyo esquema de tarificación (por hora) difiere del esquema por noche de la hotelería. |
| **HU-005 (Check-in / Check-out)** | Registro de entrada y salida física de huéspedes | El sistema administra el ciclo de vida operativo de la reserva (Confirmada / Cancelada) y el estado de limpieza/mantenimiento de la habitación. El proceso de entrega de llaves (Check-in/out) se difiere para integración con cerraduras electrónicas en Fase 2. |

---

## 📌 Notas de Auditoría y Verificación
1. **Atomicidad en DB (RF-011):** La prevención de Double-Booking no se delega a la capa de aplicación sino a la base de datos PostgreSQL mediante el constraint de exclusión GiST sobre el rango de fechas `tsrange(fecha_inicio, fecha_fin)`.
2. **Baja Lógica (RNF-010):** Ningún endpoint ejecuta sentencias `DELETE` destructivas físicas sobre huéspedes o reservas; en su lugar, se actualiza el campo `estado` a `'Inactivo'` o `'Cancelada'` preservando la trazabilidad de auditoría.
