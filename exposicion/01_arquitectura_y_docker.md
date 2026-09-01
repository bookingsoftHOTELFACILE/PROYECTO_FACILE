# 🏗️ Parte 1: Arquitectura General y Docker
> Cómo está organizado el proyecto y por qué cada pieza existe.

---

## ¿Qué es la arquitectura del proyecto?

La arquitectura es la **forma en que están organizadas y conectadas las piezas del sistema**. En BookingSoft tenemos 3 capas:

```
┌─────────────────────────────────────────┐
│  CAPA 1: FRONTEND (React + Nginx)       │  ← Lo que ve el usuario
│  Puerto 3000                            │
└──────────────────┬──────────────────────┘
                   │ HTTP/API requests a /api/
┌──────────────────▼──────────────────────┐
│  CAPA 2: BACKEND (FastAPI + Python)     │  ← La lógica del negocio
│  Puerto 4000                            │
└──────────────────┬──────────────────────┘
                   │ SQL con psycopg2
┌──────────────────▼──────────────────────┐
│  CAPA 3: BASE DE DATOS (PostgreSQL 15)  │  ← Los datos persistentes
│  Puerto 5432                            │
└─────────────────────────────────────────┘
```

**¿Por qué 3 capas separadas?**
Porque cada capa tiene una responsabilidad única:
- Si el frontend cambia de diseño, la lógica del backend no se toca.
- Si cambia la base de datos, el frontend no se entera.
- Cada capa puede escalar o reemplazarse de forma independiente.

---

## 📄 `docker-compose.yml` — El orquestador

Este archivo le dice a Docker **qué servicios levantar, en qué orden y cómo conectarlos**.

```yaml
services:
  db:
    image: postgres:15-alpine          # imagen oficial de PostgreSQL versión 15
    container_name: bookingsoft-db
    restart: always                    # si el contenedor muere, Docker lo reinicia solo
    environment:
      POSTGRES_USER: ${POSTGRES_USER}  # usuario de la BD (leído del .env)
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"                    # puerto_maquina:puerto_contenedor
    volumes:
      - postgres_data:/var/lib/postgresql/data   # los datos persisten aunque el contenedor muera
    healthcheck:
      test: ["CMD-SHELL", "pg_isready ..."]      # verifica que la BD esté lista antes de que el backend arranque
      interval: 5s
      retries: 5
```

**¿Por qué `healthcheck`?**
Sin healthcheck, el backend podría intentar conectarse a la BD antes de que PostgreSQL termine de inicializarse, y fallaría. Con healthcheck, Docker espera a que la BD esté "healthy" antes de arrancar el backend.

```yaml
  backend:
    build:
      context: ./backend              # usa el Dockerfile que está en /backend
    container_name: bookingsoft-backend
    environment:
      DB_HOST: db                     # "db" es el nombre del servicio de postgres
      JWT_SECRET: ${JWT_SECRET}       # clave secreta para firmar tokens JWT
    ports:
      - "4000:4000"
    depends_on:
      db:
        condition: service_healthy    # solo arranca cuando la BD esté healthy
```

**¿Por qué `DB_HOST: db`?**
Dentro de la red Docker, los servicios se comunican por su nombre, no por IP. El backend se conecta a `db:5432` (nombre del servicio + puerto interno).

```yaml
  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:80"                     # el puerto 80 del contenedor se expone como 3000
    depends_on:
      backend:
        condition: service_healthy    # solo arranca cuando el backend esté healthy
```

**¿Por qué el frontend espera al backend?**
Para que cuando el usuario abra el navegador, el backend ya esté disponible. Si no, el frontend cargaría pero las llamadas a la API fallarían inmediatamente.

---

## 🐳 `backend/Dockerfile` — Cómo se construye el contenedor del backend

```dockerfile
FROM python:3.11-slim          # imagen base: Python 3.11 mínima (sin extras innecesarios)

# Instalar curl (necesario para el healthcheck de docker-compose)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app                   # todos los comandos siguientes se ejecutan en /app

# Primero copiamos solo requirements.txt (para aprovechar el caché de Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Luego copiamos el resto del código
COPY . .

EXPOSE 4000                    # declara que el contenedor usa el puerto 4000

# Comando que ejecuta el servidor al arrancar el contenedor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4000"]
```

**¿Por qué copiar `requirements.txt` antes que el código?**
Docker construye las imágenes en capas. Si solo cambiamos el código Python (no las dependencias), Docker reutiliza la capa de `pip install` del caché y no reinstala todo. Esto hace el rebuild mucho más rápido.

**¿Por qué `--host 0.0.0.0`?**
Por defecto Uvicorn escucha solo en `localhost` (127.0.0.1), lo que significa "solo acepto conexiones desde dentro del mismo contenedor". Con `0.0.0.0` acepta conexiones de cualquier dirección, incluyendo las que vienen del host o de otros contenedores de Docker.

---

## 🌐 `frontend/Dockerfile` — Construcción en 2 etapas (Multi-stage build)

```dockerfile
# ── ETAPA 1: CONSTRUCCIÓN ──────────────────────────────────
FROM node:20-alpine AS build     # imagen Node para compilar React

WORKDIR /app
RUN npm install -g pnpm@9        # instalar el gestor de paquetes pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile   # instalar dependencias exactas del lockfile

COPY . .
RUN pnpm run build               # compila React → genera /app/dist (archivos estáticos)

# ── ETAPA 2: SERVIDOR ─────────────────────────────────────
FROM nginx:alpine                # imagen Nginx mínima

COPY --from=build /app/dist /usr/share/nginx/html   # copia solo los archivos compilados
COPY nginx.conf /etc/nginx/conf.d/default.conf       # copia la configuración de Nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**¿Por qué 2 etapas?**
La imagen final NO contiene Node.js, pnpm, ni código fuente React. Solo contiene los archivos HTML/CSS/JS compilados + Nginx. Esto hace la imagen de producción mucho más pequeña y segura.

**¿Qué es `--frozen-lockfile`?**
Le dice a pnpm que instale exactamente las versiones del `pnpm-lock.yaml`. Si alguien modificó `package.json` pero no actualizó el lockfile, el build falla. Garantiza builds reproducibles.

---

## ⚙️ `frontend/nginx.conf` — El proxy reverso

```nginx
server {
    listen 80;

    # Sirve los archivos estáticos de React
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;   # SPA routing: siempre devuelve index.html
    }

    # Redirige todas las peticiones /api/ al backend
    location /api/ {
        proxy_pass http://backend:4000/api/;
    }

    # Redirige el health check al backend
    location /health {
        proxy_pass http://backend:4000/health;
    }
}
```

**¿Qué es un proxy reverso?**
Nginx recibe todas las peticiones en el puerto 80. Si la URL empieza con `/api/`, la **reenvía** al backend en `http://backend:4000`. El navegador no sabe que hay un backend separado — solo ve el puerto 3000.

**¿Por qué `try_files $uri $uri/ /index.html`?**
React es una SPA (Single Page Application). Cuando el usuario navega a `/habitaciones`, el servidor no tiene ese archivo — solo existe `index.html`. Con `try_files`, Nginx siempre devuelve `index.html` y React maneja el routing internamente.

**¿Por qué el frontend llama al backend como `http://backend:4000`?**
Porque dentro de la red Docker, el servicio del backend se identifica con el nombre `backend`. Nginx y el backend están en la misma red Docker, así que se comunican directamente por nombre de servicio.

---

## 📄 `.env.example` — Las variables de entorno

```bash
POSTGRES_USER=adso_user
POSTGRES_PASSWORD=tu_password_segura
POSTGRES_DB=bookingsoft
JWT_SECRET=una_clave_secreta_muy_larga
PORT=4000
```

**¿Por qué variables de entorno?**
Para no guardar contraseñas y claves secretas en el código. El archivo `.env` está en `.gitignore` — nunca va al repositorio. El `.env.example` es la plantilla que muestra qué variables necesita el sistema sin revelar los valores reales.

**¿Por qué `JWT_SECRET` es una variable de entorno?**
La clave secreta del JWT es lo que hace que los tokens sean seguros. Si alguien conoce el `JWT_SECRET`, puede fabricar tokens falsos. Nunca debe quedar en el código.

---

## 🗂️ Estructura completa del proyecto

```
PROYECTO_FACILE/
├── .env                    ← Variables reales (NO va a GitHub)
├── .env.example            ← Plantilla de variables (SÍ va a GitHub)
├── docker-compose.yml      ← Orquesta los 3 contenedores
├── backend/
│   ├── Dockerfile          ← Cómo construir el contenedor del backend
│   ├── main.py             ← Punto de entrada de FastAPI
│   ├── dependencies.py     ← JWT: autenticar() y requiere_rol()
│   ├── requirements.txt    ← Dependencias Python pinadas
│   ├── schema.sql          ← Tablas, triggers, funciones y datos seed
│   ├── database/
│   │   └── connection.py   ← Conexión a PostgreSQL con psycopg2
│   ├── models/
│   │   └── schemas.py      ← Validación de datos con Pydantic
│   ├── routes/
│   │   ├── auth.py         ← Registro, login, logout
│   │   ├── empleados.py    ← CRUD de empleados
│   │   ├── habitaciones.py ← Catálogo y disponibilidad
│   │   ├── reservas.py     ← Crear y listar reservas
│   │   └── huespedes.py    ← Huéspedes
│   └── tests/
│       ├── conftest.py     ← Configuración de pruebas
│       ├── test_auth.py    ← 8 pruebas de autenticación
│       ├── test_consultas.py ← 4 pruebas de consultas
│       └── test_reservas.py  ← 3 pruebas de reservas
├── frontend/
│   ├── Dockerfile          ← Multi-stage: build React + Nginx
│   ├── nginx.conf          ← Proxy reverso + SPA routing
│   ├── vite.config.js      ← Configuración de Vite
│   ├── package.json        ← Dependencias pinadas
│   └── src/
│       ├── main.jsx        ← Punto de entrada React
│       ├── App.jsx         ← Toda la lógica y UI del frontend
│       └── index.css       ← Estilos
└── docs/
    ├── requisitos/         ← RFs, RNFs, HUs, restricciones, matriz
    └── AUDITORIA_DEPENDENCIAS.md
```
