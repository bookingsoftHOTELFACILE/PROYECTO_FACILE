import os
import sys
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Hallazgo 02 - Fail Fast: Verificar que JWT_SECRET esté adecuadamente configurado y no sea vacío ni por defecto
jwt_secret_val = os.getenv("JWT_SECRET", "").strip()
if not jwt_secret_val or jwt_secret_val == "CHANGE_ME" or jwt_secret_val == "CHANGE_ME_FOR_SECURITY_OR_USE_GENERATE_KEYS":
    print("❌ ERROR CRÍTICO DE SEGURIDAD: JWT_SECRET no está configurado o contiene el valor inseguro por defecto ('CHANGE_ME').", file=sys.stderr)
    print("Abortando el inicio del servidor para prevenir firma de tokens vulnerables (Hallazgo 02).", file=sys.stderr)
    sys.exit(1)

from database import connection
from routes import huespedes, habitaciones, reservas, auth, empleados, centro_negocios

from contextlib import asynccontextmanager

# Hallazgo 15: Manejador lifespan de FastAPI (reemplaza a @app.on_event("startup") obsoleto)
@asynccontextmanager
async def lifespan(app_inst: FastAPI):
    connection.inicializar_base_de_datos()
    yield

app = FastAPI(
    title="BookingSoft API - FastAPI",
    description="Servidor REST Backend modular en Python para Registro, Reservas y Centro de Negocios",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS para permitir peticiones del cliente React
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
cors_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar los módulos de rutas
app.include_router(huespedes.router)
app.include_router(habitaciones.router)
app.include_router(reservas.router)
app.include_router(auth.router)
app.include_router(empleados.router)
app.include_router(centro_negocios.router)

# Ruta de diagnóstico de salud de la API
@app.get("/health")
def health_check():
    try:
        conn = connection.obtener_conexion()
        connection.liberar_conexion(conn)
        return {
            "status": "OK",
            "message": "Servidor de BookingSoft (FastAPI) funcionando correctamente.",
            "modo": "Físico (PostgreSQL)"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Fallo de conexión con la base de datos PostgreSQL: {e}"
        )

