# Matriz de Roles vs. Endpoints (BookingSoft RBAC)

<!--
  ¿Qué? Matriz detallada de Control de Acceso Basado en Roles (RBAC) para cada endpoint de la API REST.
  ¿Para qué? Demostrar el cumplimiento de RF-009 y RS-003 garantizando que cada rol operativo
             tenga acceso estrictamente limitado a sus funciones autorizadas.
  ¿Impacto? Sin este documento, la validación de permisos requeriría inspeccionar manualmente
             las dependencias FastAPI de cada ruta backend.
-->

> **Mecanismo de seguridad:** Los permisos se garantizan mediante la guarda de FastAPI `Depends(requiere_rol([...]))` inyectada en las rutas.

---

## 🛡️ Matriz General de Permisos

| Método HTTP | Ruta / Endpoint | Descripción Funcional | Público | Administrador | Recepcionista 24h | Recepcionista Noche | Ama de Llaves | Mantenimiento |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `POST` | `/api/auth/login` | Autenticación y generación JWT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST` | `/api/auth/registro` | Registro de nuevos empleados | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET` | `/health` | Chequeo de estado del sistema | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET` | `/api/empleados` | Listado general de empleados | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET` | `/api/empleados/{id}` | Consultar detalle de un empleado | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH` | `/api/empleados/{id}/rol` | Cambiar rol de un empleado | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH` | `/api/empleados/{id}/estado` | Cambiar estado (Activo/Inactivo) | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET` | `/api/huespedes` | Listar huéspedes registrados | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `POST` | `/api/user/registro` | Registrar nuevo huésped | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `PATCH` | `/api/huespedes/{id}/estado` | Cambiar estado de huésped | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `DELETE` | `/api/huespedes/{id}` | Baja lógica de huésped | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET` | `/api/habitaciones` | Listar habitaciones y estados | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST` | `/api/habitaciones` | Crear nueva habitación | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PUT` | `/api/habitaciones/{id}` | Actualizar datos de habitación | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH` | `/api/habitaciones/{id}/estado` | Cambiar estado de habitación | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `DELETE` | `/api/habitaciones/{id}` | Baja lógica de habitación | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET` | `/api/reservas` | Listar reservas activas | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `POST` | `/api/reservas` | Crear nueva reserva (Atómica) | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `PATCH` | `/api/reservas/{id}/estado` | Cambiar estado de reserva | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `DELETE` | `/api/reservas/{id}` | Cancelar reserva (Baja lógica) | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🔍 Reglas Específicas por Rol Operativo (RS-003)

1. **Ama de Llaves:**
   * **Permiso concedido:** Únicamente puede consultar el mapa de habitaciones (`GET /api/habitaciones`) y cambiar su estado operativo (`PATCH /api/habitaciones/{id}/estado`) para transicionar habitaciones de `'En Limpieza'` a `'Disponible'`.
   * **Restricción:** No tiene acceso a datos personales de huéspedes, tarifas ni creación/modificación de reservas.

2. **Mantenimiento:**
   * **Permiso concedido:** Consulta de habitaciones (`GET /api/habitaciones`) y actualización de estado (`PATCH /api/habitaciones/{id}/estado`) para marcar habitaciones como `'En Mantenimiento'` o retornarlas a `'Disponible'`.

3. **Recepcionista 24h vs. Recepcionista Noche:**
   * **Recepcionista 24h:** Posee permisos completos para gestión de la operación diurna (Registro de Huéspedes, Creación de Reservas, Cancelación de Reservas y Cambio de Estado de Huéspedes).
   * **Recepcionista Noche:** Posee un perfil de lectura y creación (Consulta de Disponibilidad, Registro de Huéspedes y Creación de Reservas), pero tiene restringida la cancelación de reservas o la baja de huéspedes para evitar alteraciones operativas nocturnas no auditadas.

4. **Administrador:**
   * Posee el perfil de superusuario (`Administrador`). Es el único rol capacitado para crear empleados (`POST /api/auth/registro`), modificar sus roles/estados y realizar bajas físicas o lógicas destructivas.
