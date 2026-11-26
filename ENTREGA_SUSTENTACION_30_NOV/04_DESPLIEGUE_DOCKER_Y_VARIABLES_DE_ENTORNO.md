# 🚀 Criterio 4: Despliegue de Infraestructura, Contenedores Docker y Variables de Entorno

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Tecnología:** Docker Compose + Nginx + Python FastAPI + PostgreSQL 15 + PgAdmin 4  
**Fecha:** Noviembre 2026  
**Criterio Oficial:** Buen manejo de las variables de entorno usadas para el despliegue del proyecto, despliegue apropiado (back, front).

---

## 1. Arquitectura de Despliegue Multicontenedor (Docker Compose)

El sistema se orquesta mediante un archivo `docker-compose.yml` que encapsula cuatro servicios desacoplados en una red virtual aislada:

```
+-----------------------------------------------------------------------------------+
|                            RED DOCKER: bookingsoft_net                            |
|                                                                                   |
|   +--------------------+     +--------------------+     +---------------------+   |
|   | bookingsoft-front  |     |  bookingsoft-back  |     |   bookingsoft-db    |   |
|   |    (Nginx :80)     |     |  (FastAPI :4000)   |     |  (Postgres :5432)   |   |
|   +---------+----------+     +---------+----------+     +----------+----------+   |
|             |                          |                           |              |
+-------------|--------------------------|---------------------------|--------------+
              |                          |                           |
        Puerto Host: 3001          Puerto Host: 4001           Puerto Host: 5433
       (Navegador / SPA)            (API Gateway)              (DB Persistencia)
```

### Servicios Desplegados:
1. **`bookingsoft-db` (Motor Relacional):**
   - Imagen: `postgres:15-alpine`
   - Puerto expuesto: `5433:5432`
   - Volumen persistente: `postgres_data:/var/lib/postgresql/data` (los datos sobreviven al reinicio de contenedores).
   - Healthcheck: `pg_isready -U bookingsof4 -d bookingsoft` con intervalo de 5s y 5 reintentos.
2. **`bookingsoft-backend` (Lógica de Negocio):**
   - Dockerfile con Python 3.11-slim y dependencias instaladas vía Pipenv.
   - Puerto expuesto: `4001:4000`
   - Dependencia estricta: `condition: service_healthy` sobre `bookingsoft-db`.
   - Healthcheck: Comprobación con `curl -f http://localhost:4000/health`.
3. **`bookingsoft-frontend` (Capa de Presentación):**
   - Construcción multi-etapa (*multi-stage build*): Node 20 Alpine para el build de Vite y Nginx Alpine para servir los archivos estáticos de la SPA con compresión y caché.
   - Puerto expuesto: `3001:80`
   - Reverse Proxy configurado para evitar bloqueos por CORS y enrutar `/api/` hacia el backend.
4. **`bookingsoft-pgadmin` (Administración Visual de BD):**
   - Interfaz web en puerto `5050` para auditoría directa de tablas por parte del equipo evaluador.

---

## 2. Gestión Segura de Variables de Entorno

El proyecto implementa la metodología *12-Factor App* (Factor III: Configuración en el entorno):

| Variable | Propósito | Valor por Defecto Seguro (Dev) | Producción / CI |
|---|---|---|---|
| `DB_HOST` | Nombre del host del motor de BD | `db` (alias en red Docker) | `localhost` en GitHub Actions |
| `DB_PORT` | Puerto de escucha interno | `5432` | Configurable |
| `DB_USER` | Usuario de PostgreSQL | `bookingsof4` | Inyectado vía Secret / Env |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `BooKingSoft` | Inyectado vía Secret / Env |
| `DB_NAME` | Base de datos principal | `bookingsoft` | `bookingsoft_test` en CI |
| `PORT` | Puerto del servidor ASGI | `4000` | Configurable |
| `JWT_SECRET` | Clave criptográfica para firmas JWT | Token aleatorio de 64 caracteres | Secreto de entorno |
| `DATABASE_URL` | URI de conexión unificada para tests | Formato `postgresql://...` | Utilizado en suite transaccional |

### Buenas Prácticas Aplicadas:
- El archivo `.env` con credenciales reales está excluido en `.gitignore` para evitar fugas en repositorios públicos.
- Se provee una plantilla de referencia `.env.example` para que cualquier compañero levante el entorno en un solo comando.

---

## 3. Comandos de Despliegue Rápido para el Evaluador

```bash
# 1. Clonar el repositorio y ubicarse en la raíz
cd PROYECTO_FACILE

# 2. Levantar la infraestructura completa en segundo plano
docker compose up -d --build

# 3. Verificar el estado saludable de los contenedores
docker compose ps

# 4. URLs de Acceso Inmediato:
# - Frontend (SPA Huésped & PMS): http://localhost:3001
# - Backend (FastAPI Swagger Docs): http://localhost:4001/docs
# - Healthcheck API: http://localhost:4001/health
# - PgAdmin 4: http://localhost:5050
```
