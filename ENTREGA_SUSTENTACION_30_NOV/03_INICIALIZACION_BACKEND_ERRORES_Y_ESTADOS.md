# ⚙️ Criterio 3: Inicialización del Backend, Manejo de Errores y Códigos de Estado HTTP

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Tecnología del Servidor:** Python 3.11 + FastAPI + Uvicorn ASGI  
**Fecha:** Noviembre 2026  
**Criterio Oficial:** Inicialización del Back-end sin errores, no secciones pendientes (Mensajes de error, estados, manejo de variables de entorno).

---

## 1. Verificación de Inicialización y Salud del Servidor

El backend de BookingSoft se inicializa limpiamente sin advertencias ni secciones incompletas mediante **FastAPI**, levantando el servidor ASGI con Uvicorn. Cuenta con un endpoint nativo de verificación de salud (`/health`) que comprueba la conectividad activa con el motor PostgreSQL:

### Petición HTTP:
```http
GET /health HTTP/1.1
Host: localhost:4001
```

### Respuesta del Servidor:
```json
{
  "status": "OK",
  "message": "Servidor de BookingSoft (FastAPI) funcionando correctamente.",
  "modo": "Físico (PostgreSQL)"
}
```

### Arranque Seguro y Pool de Conexiones:
1. **ThreadedConnectionPool:** Al arrancar el servidor (`backend/main.py`), se crea un pool de conexiones multihilo (`minconn=1`, `maxconn=20`) administrado por `backend/database/connection.py`.
2. **Ciclo de Vida (Lifespan Context Manager):** Se gestiona el inicio y cierre seguro del pool (`cerrar_pool()`), liberando los recursos de PostgreSQL de manera determinista al detener el contenedor.
3. **Cero Secciones Pendientes:** Ninguna ruta o endpoint devuelve `NotImplementedError` o respuestas vacías; todos los flujos de negocio cuentan con implementación funcional.

---

## 2. Catálogo Estandarizado de Códigos de Estado HTTP

El backend aplica rigurosamente las convenciones RESTful para comunicar el resultado de cada transacción:

| Código HTTP | Nombre Oficial | Caso de Uso en BookingSoft PMS |
|---|---|---|
| **200 OK** | Éxito | Consultas exitosas de catálogo, perfil, inventario, disponibilidad y folios. |
| **201 Created** | Creado | Registro de nuevo huésped, creación de reserva Walk-In y registro de cobros. |
| **400 Bad Request** | Petición Inválida | Fechas de reserva incoherentes (salida anterior a entrada), colisión de reserva (intento de overbooking) o montos menores a cero. |
| **401 Unauthorized** | No Autenticado | Token JWT ausente, expirado o firma criptográfica inválida; credenciales incorrectas en login. |
| **403 Forbidden** | Acceso Prohibido | Violación de permisos RBAC (ej. Ama de llaves intentando liquidar cobros contables) o intento de desactivar la cuenta del Superadministrador creador del software. |
| **404 Not Found** | No Encontrado | Habitación, huésped, reserva o folio no existente en la base de datos. |
| **422 Unprocessable Entity** | Error de Validación | Carga útil (payload JSON) con tipos incorrectos, campos requeridos faltantes según los modelos Pydantic o identificadores fuera del rango `INTEGER` de PostgreSQL. |
| **500 Internal Server Error** | Error Interno Controlado | Captura defensiva de fallos no previstos con mensaje amigable al cliente y registro detallado en logs internos. |

---

## 3. Formato y Manejo Defensivo de Mensajes de Error

Para proteger la infraestructura y ofrecer una experiencia de usuario clara, todos los errores se emiten en un esquema JSON uniforme:

```json
{
  "detail": "Mensaje de error claro en español orientado al usuario o colaborador"
}
```

### Principios de Seguridad Implementados:
- **No Fuga de Stack Traces:** Jamás se filtran consultas SQL crudas, nombres de tablas internas ni volcados de excepciones de Python al frontend.
- **Rollback Transaccional Obligatorio:** Todo bloque `try...except` que interactúe con la base de datos ejecuta `conn.rollback()` antes de devolver la respuesta de error, impidiendo que transacciones incompletas queden abiertas o bloqueen tablas en PostgreSQL.
- **Protección de Datos Sensibles:** Los hashes de contraseña (Bcrypt) y las claves maestras de cifrado nunca forman parte del payload de respuesta.
