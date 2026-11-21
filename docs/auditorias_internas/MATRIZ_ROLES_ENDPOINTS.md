# Matriz de Roles vs. Endpoints (BookingSoft RBAC)

<!--
  ¿Qué? Matriz detallada de Control de Acceso Basado en Roles (RBAC) para cada endpoint de la API REST.
  ¿Para qué? Demostrar el cumplimiento de RF-009 y RS-003 garantizando que cada rol operativo
             tenga acceso estrictamente limitado a sus funciones autorizadas.
  ¿Impacto? Sin este documento, la validación de permisos requeriría inspeccionar manualmente
             las dependencias FastAPI de cada ruta backend.

  Fuente de verdad: el árbol de rutas expuesto por FastAPI (`GET /openapi.json`), que en la
  remediación arroja 33 operaciones. Toda fila de esta matriz debe corresponderse
  con una operación real: no existen endpoints de alta/baja de habitaciones ni rutas "guest-*".
-->

> **Mecanismo de seguridad:** los permisos se garantizan con la guarda de FastAPI
> `Depends(requiere_rol([...]))` inyectada en cada ruta. Las rutas marcadas ✅ en *Público*
> usan `autenticar_opcional` o no tienen dependencia de autenticación, por lo que cualquier
> rol (incluido el acceso sin sesión) también puede invocarlas.

---

## 🛡️ Matriz General de Permisos (33 endpoints)

| Método HTTP | Ruta / Endpoint | Descripción Funcional | Público | Administrador | Recepcionista 24h | Ama de Llaves | Mantenimiento |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `POST` | `/api/auth/login` | Autenticación y generación JWT | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST` | `/api/auth/logout` | Cierre de sesión (stateless) | ❌ | ✅ | ✅ | ✅ | ✅ |
| `POST` | `/api/auth/registro` | Registro de nuevos empleados | ❌ | ✅ | ❌ | ❌ | ❌ |
| `GET` | `/api/empleados` | Listado general de empleados | ❌ | ✅ | ✅ | ❌ | ❌ |
| `GET` | `/api/empleados/{id}` | Consultar detalle de un empleado | ❌ | ✅ | ✅ | ❌ | ❌ |
| `PATCH` | `/api/empleados/{id}/rol` | Cambiar rol de un empleado | ❌ | ✅ | ✅ | ❌ | ❌ |
| `PATCH` | `/api/empleados/{id}/estado` | Cambiar estado (Activo/Inactivo) | ❌ | ✅ | ✅ | ❌ | ❌ |
| `GET` | `/api/huespedes` | Listar huéspedes registrados | ❌ | ✅ | ✅ | ❌ | ❌ |
| `PATCH` | `/api/huespedes/{id}/estado` | Cambiar estado de huésped | ❌ | ✅ | ✅ | ❌ | ❌ |
| `DELETE` | `/api/huespedes/{id}` | Baja lógica de huésped | ❌ | ✅ | ❌ | ❌ | ❌ |
| `POST` | `/api/user/registro` | Registrar nuevo huésped (portal/PMS) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST` | `/api/user/login` | Login de huésped (sin token JWT) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST` | `/api/user/recuperar-password` | Solicitud de recuperación de clave | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST` | `/api/user/restablecer-password` | Restablecimiento de clave de huésped | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST` | `/api/user/auth-social` | Autenticación federada con Google | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET` | `/api/habitaciones` | Inventario completo de unidades | ❌ | ✅ | ✅ | ✅ | ✅ |
| `GET` | `/api/habitaciones/publicas` | Catálogo mínimo para el portal | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET` | `/api/habitaciones/disponibilidad` | Disponibilidad por rango de fechas (RF-012) | ❌ | ✅ | ✅ | ❌ | ❌ |
| `PATCH` | `/api/habitaciones/{id}/estado` | Cambio de estado operativo | ❌ | ✅ | ✅ | ✅ | ✅ |
| `GET` | `/api/reservas` | Listado de reservas | ❌ | ✅ | ✅ | ❌ | ❌ |
| `POST` | `/api/reservas` | Crear reserva atómica (GiST) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PATCH` | `/api/reservas/{id}` | Editar fechas, unidad y notas de una reserva confirmada (RF-013, Fase 3) | ❌ | ✅ | ✅ | ❌ | ❌ |
| `PATCH` | `/api/reservas/{id}/estado` | Check-in / check-out de reserva (HU-005) | ❌ | ✅ | ✅ | ❌ | ❌ |
| `DELETE` | `/api/reservas/{id}` | Cancelación de reserva | ❌ | ✅ | ✅ | ❌ | ❌ |
| `GET` | `/api/reservas/{id}/folio` | Folio financiero: IVA desglosado, pagos y saldo (Fase 2) | ❌ | ✅ | ✅ | ❌ | ❌ |
| `POST` | `/api/reservas/{id}/pagos` | Registrar cobro vía pasarela (Fase 2) | ❌ | ✅ | ✅ | ❌ | ❌ |
| `POST` | `/api/reservas/{id}/pagos/{pago}/anular` | Anular cobro y restaurar el saldo (Fase 2) | ❌ | ✅ | ❌ | ❌ | ❌ |
| `GET` | `/api/reservas/{id}/factura.xml` | Factura electrónica **simulada** UBL 2.1 en borrador (Fase 2) | ❌ | ✅ | ✅ | ❌ | ❌ |
| `GET` | `/api/centro-negocios/espacios` | Catálogo de salas y coworking | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET` | `/api/centro-negocios/reservas` | Listar reservas de negocio | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST` | `/api/centro-negocios/reservas` | Reservar salón o coworking por horas | ✅ | ✅ | ✅ | ✅ | ✅ |
| `DELETE` | `/api/centro-negocios/reservas/{id}` | Cancelar reserva de negocio | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET` | `/health` | Chequeo de estado del sistema | ✅ | ✅ | ✅ | ✅ | ✅ |

## 📋 Notas de Implementación

1. **Control de Exclusión GiST:** `POST /api/reservas` valida el rango de fechas y los
   aforos en base a datos de PostgreSQL, protegido por una constraint de exclusión
   (`EXCLUDE USING gist (fecha_entrada WITH &&) WHERE estado = 'Confirmada'`), lo que
   garantiza atomicidad ante concurrencia de doble booking.
2. **Baja Lógica:** Los endpoints de `DELETE` no borran filas físicas, actualizan su estado
   (`estado = 'Inactivo'`) preservando la integridad histórica y el rastro de auditoría
   (`modificado_por`).
3. **Roles del negocio:** `Administrador`, `Recepcionista 24h`, `Ama de llaves` y
   `Personal de mantenimiento` son los únicos roles que pueden obtener JWT (verificado por
   la constante `ROLES_VALIDOS` de `models/schemas.py` y por el `CHECK` `empleado_rol_check`
   de `schema.sql`). El quinto rol del modelo de negocio, **Huésped**, no tiene token: opera
   sin sesión a través de los endpoints `/api/user/*` y del catálogo público
   `/api/habitaciones/publicas`.
4. **Detalle del check-in:** `POST /api/reservas` admite el flag `checkin_inmediato`
   (HU-005), que devuelve **403** a un rol sin permiso operativo (Ama de Llaves /
   Mantenimiento), aunque el resto del cuerpo de la reserva sea público.
5. **Salud del sistema:** `GET /health` responde siempre `{"status": "ok"}` sin filtrar
   detalles técnicos del error de base de datos (hallazgo B-05, resuelto en la Fase D).
6. **Módulo financiero (Fase 2):** el cobro comparte el par de roles de las reservas
   (Administrador + Recepcionista 24 h), pero la **anulación de un cobro es exclusiva
   del Administrador**, porque restaura el saldo disponible de la reserva. Ninguna de
   estas rutas es pública: siempre exige JWT con el rol indicado. El Ama de llaves y el
   Personal de mantenimiento quedan fuera por diseño (verificado en
   `backend/tests/test_pagos.py::test_cobros_restringidos_a_roles`).
7. **Edición de reservas (Fase 3, RF-013):** `PATCH /api/reservas/{id}` sólo admite
   reservas en estado `Confirmada` (una estancia en curso o cerrada es inmutable) y
   comparte los roles de creación (Administrador + Recepcionista 24 h). Actualiza
   fechas, unidad y observaciones en una sola transacción: si el nuevo rango choca
   con otra reserva, el constraint GiST aborta y se responde `409` sin dejar cambios
   parciales. Verificado en `backend/tests/test_reservas_update.py`.
