# 📖 Criterio 11: README Maestro y Catálogo Completo de la API REST (4.º Backend)

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Tecnología del 4.º Backend:** Python 3.11 + FastAPI + PostgreSQL (Precedido por Spring Boot Java, Node.js Express y MongoDB NoSQL)  
**Fecha:** Noviembre 2026  
**Criterio Oficial:** README actualizado con sección de pruebas; API del 4.º backend documentada.

---

## 1. Visión General del 4.º Backend

En el proceso formativo del programa ADSO, el equipo desarrolló soluciones en tres tecnologías previas:
1. Java con Spring Boot (Trimestre 3).
2. Node.js con Express (Trimestre 5).
3. Node.js con MongoDB NoSQL (Trimestre 5).
4. **Python con FastAPI (Trimestre 6 - Proyecto Actual):** Elegido como el backend definitivo para BookingSoft por su alto rendimiento asíncrono, generación nativa de documentación interactiva OpenAPI/Swagger (`/docs`) y tipado estricto mediante Pydantic.

---

## 2. Catálogo Completo de Endpoints REST (API)

A continuación se documentan los grupos de endpoints disponibles en `http://localhost:4001`:

### A. Módulo de Autenticación y Cuentas (`/api/auth` y `/api/user`)
- `POST /api/auth/login`: Autenticación de colaboradores PMS con usuario/contraseña, retornando JWT Bearer y rol RBAC.
- `POST /api/auth/registro`: Registro de nuevos empleados (exclusivo para Administrador / Grupo BookingSoft).
- `POST /api/user/login`: Inicio de sesión de huéspedes con documento/correo y contraseña.
- `POST /api/user/registro`: Registro autónomo de nuevos huéspedes desde el portal público.
- `POST /api/user/recuperar-contrasena` & `POST /api/user/restablecer-contrasena`: Flujo de recuperación de credenciales mediante token seguro.

### B. Módulo de Empleados y Control de Roles (`/api/empleados`)
- `GET /api/empleados`: Listado paginado de empleados con filtros de nombre, usuario, rol y estado.
- `PATCH /api/empleados/{id}/rol`: Modificación de rol operativo (protección contra alteración del rol inmutable `Grupo BookingSoft`).
- `PATCH /api/empleados/{id}/estado`: Activación/desactivación de cuenta (el Superadministrador creador del software está blindado contra desactivación).

### C. Módulo de Huéspedes (`/api/huespedes`)
- `GET /api/huespedes`: Consulta administrativa de huéspedes con búsqueda reactiva por documento o nombre.
- `POST /api/huespedes`: Creación de ficha de huésped para reservas Walk-In presenciales.
- `PATCH /api/huespedes/{id}/estado`: Baja lógica y suspensión de perfiles según normas de auditoría DIAN y SIRE.

### D. Módulo de Habitaciones y Unidades (`/api/habitaciones`)
- `GET /api/habitaciones`: Catálogo completo de unidades con amenidades, tipología y tarifas vigentes.
- `GET /api/habitaciones/disponibles`: Consulta de disponibilidad en tiempo real por rango de fechas `[fecha_entrada, fecha_salida]` con prevención de overbooking.
- `PATCH /api/habitaciones/{id}/estado`: Cambio de estado operativo (`Disponible`, `Ocupada`, `En limpieza`, `Mantenimiento`).

### E. Módulo de Reservas y Transacciones (`/api/reservas`)
- `GET /api/reservas`: Listado general de reservas con relaciones de habitación y huésped.
- `POST /api/reservas`: Creación transaccional de reserva (bloqueo ACID y validación de disponibilidad).
- `PUT /api/reservas/{id}`: Edición de fechas, habitación asignada o notas especiales.
- `PATCH /api/reservas/{id}/estado`: Transición de ciclo de vida (`Confirmada` ➔ `Check-In` ➔ `Completada` ➔ `Cancelada`).
- `DELETE /api/reservas/{id}`: Cancelación segura con liberación inmediata de inventario.

### F. Módulo de Folio Contable y Facturación (`/api/reservas/{id}/folio` y `/api/reservas/{id}/pagos`)
- `GET /api/reservas/{id}/folio`: Liquidación financiera detallada (días, tarifa base, base gravable, IVA 19%, total, abonos registrados y saldo pendiente).
- `POST /api/reservas/{id}/pagos`: Registro de cobros con pasarela activa y método de pago.
- `POST /api/reservas/{id}/pagos/{id_pago}/anular`: Anulación justificada de cobro con reapertura de saldo.
- `GET /api/reservas/{id}/factura.xml`: Generación de borrador de Factura Electrónica UBL 2.1 con CUFE.

### G. Módulo de Salas de Juntas y Coworking (`/api/centro-negocios`)
- `GET /api/centro-negocios/espacios`: Listado de salas y puestos con capacidad y tarifas por hora.
- `POST /api/centro-negocios/reservas`: Reserva de espacio por bloque horario con prevención de colisiones.
- `PATCH /api/centro-negocios/reservas/{id}/liberar`: Liberación y entrega de espacio.

---

## 3. Sección de Ejecución de Pruebas Automatizadas

El archivo `README.md` principal incorpora la sección de pruebas para reproducir los resultados en cualquier máquina:

```bash
# Ejecución de Suite Backend (133 tests con 83.68% de cobertura)
cd backend
pipenv run pytest --cov=routes --cov=services --cov=dependencies --cov-fail-under=80 -rs

# Ejecución de Suite Frontend (35 tests con 100% de cobertura en líneas)
cd frontend
npm test

# Ejecución de Suite E2E con Playwright (9 specs)
cd E2E
pnpm test
```
