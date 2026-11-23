# Informe de Sprint 1 — Arranque, Base de Datos y Acceso

**Objetivo del Sprint:** Dejar andando el proyecto en Docker, crear las tablas en PostgreSQL y tener listo el registro e inicio de sesión con roles.

---

## 1. Qué planeamos y quién hizo qué

- **Meta en puntos:** 13 puntos (`HU-001`, `HU-002`, `HU-003`, `HU-004`).

| Tarea | Qué se hizo | Responsable | Estado |
|---|---|---|:---:|
| **T-1.1** | Armar el `docker-compose.yml` con PostgreSQL, FastAPI, React y pgAdmin | Sebastián Parada | Listo |
| **T-1.2** | Escribir el script `schema.sql` con las tablas iniciales y usuarios de prueba | Sebastián Parada | Listo |
| **T-1.3** | Endpoints `/api/auth/login` y `/api/auth/registro` cifrando claves con `bcrypt` | Maicol Mayor / David López | Listo |
| **T-1.4** | Guardas de seguridad JWT (`autenticar` y `requiere_rol`) | Sebastián Parada | Listo |
| **T-1.5** | Primeras pruebas automáticas de autenticación y permisos en Pytest | Maicol Mayor | Listo |
| **T-1.6** | Pantalla de login administrativo y manejo de errores en React | José Miguel Chico | Listo |
| **T-1.7** | Vista de administración de empleados y cambio de roles en el PMS | José Miguel Chico | Listo |
| **T-1.8** | Documentar los RF, RNF, HUs y matriz de trazabilidad | Ashly Echeverri | Listo |

---

## 2. Problemas que salieron en el camino y cómo los resolvimos

1. **Conexión entre contenedores Docker:** Al principio el backend intentaba conectarse a `localhost:5432` y fallaba dentro de Docker. Lo arreglamos usando el nombre del servicio `db` en el archivo `.env` (`DB_HOST=db`).
2. **Códigos HTTP incorrectos en login:** Vimos que cuando alguien metía mal la contraseña o un usuario no existía, había casos donde devolvía `200` o mensajes diferentes que permitían adivinar usuarios. Lo estandarizamos a `HTTP 401` con el mismo mensaje `"Credenciales incorrectas."`.
3. **Pérdida de sesión al recargar:** Si presionábamos `F5`, el panel sacaba al usuario. Se guardó el token y la pestaña activa en `localStorage` para mantener la sesión abierta.

---

## 3. Cierre y qué mejoramos para el Sprint 2

- **Qué nos funcionó bien:** Usar `/docs` (Swagger) de FastAPI nos dejó probar los endpoints antes de conectarlos con React.
- **Qué nos falló:** No nos pusimos de acuerdo rápido en los nombres de los campos (si usar `snake_case` o `camelCase`) y al comienzo probábamos con las contraseñas sin recordar actualizar el archivo `.env.example`.
- **Compromiso:** Dejar fijo `snake_case` para base de datos y backend, y documentar cualquier variable nueva en `.env.example`.
