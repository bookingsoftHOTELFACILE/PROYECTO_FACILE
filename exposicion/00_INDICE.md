# 📁 Índice de la Guía de Exposición — BookingSoft
> Léelos en orden. Cada archivo explica una parte del proyecto con detalle.

## Archivos de esta carpeta

| Archivo | Qué explica |
|:---|:---|
| `01_arquitectura_y_docker.md` | Cómo está organizado el proyecto y por qué, Docker, docker-compose, Dockerfiles, Nginx |
| `02_base_de_datos.md` | El schema SQL completo: tablas, constraints, triggers, función de precios, datos seed |
| `03_backend_auth_y_seguridad.md` | main.py, dependencies.py, auth.py — autenticación JWT, bcrypt, control de acceso |
| `04_backend_empleados_y_habitaciones.md` | empleados.py, habitaciones.py, schemas.py — gestión de personal y consulta de disponibilidad |
| `05_backend_reservas.md` | reservas.py — creación de reservas, doble booking, deadlock, función PL/pgSQL |
| `06_frontend.md` | App.jsx completo — React, modo simulación, modo backend, formularios, cotización |
| `07_como_se_conecta_todo.md` | Explicación detallada de los `import`, flujo de peticiones y comunicación frontend-backend-BD |
| `08_checklist_dia_expo.md` | Checklist paso a paso para el día de la expo + Guía de emergencia para liberar puertos ocupados |

## Cómo usar esta guía

1. **Para entender el proyecto completo:** Lee los 6 archivos en orden.
2. **Para preparar una parte específica:** Ve directo al archivo que necesitas.
3. **Durante la expo:** Ten este índice abierto para navegar rápido.

## Resumen ultra-rápido del proyecto

```
[Navegador / React]  →  puerto 3000 (Nginx)
       ↓ (peticiones /api/)
[Nginx]  →  proxy reverso a puerto 4000
       ↓
[FastAPI / Python]  →  puerto 4000 (Uvicorn)
       ↓ (SQL directo con psycopg2)
[PostgreSQL 15]  →  puerto 5432
```

Todo corre en Docker. Un solo comando lo levanta todo:
```bash
docker compose up --build -d
```
