import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from database import connection
from routes import huespedes, habitaciones, reservas, auth, empleados

app = FastAPI(
    title="BookingSoft API - FastAPI",
    description="Servidor REST Backend modular en Python para Registro y Reservas",
    version="1.0.0"
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


# Evento de inicio del servidor: ejecuta la detección de base de datos
@app.on_event("startup")
def startup_event():
    connection.inicializar_base_de_datos()

# Registrar los módulos de rutas
app.include_router(huespedes.router)
app.include_router(habitaciones.router)
app.include_router(reservas.router)
app.include_router(auth.router)
app.include_router(empleados.router)

# Ruta de diagnóstico de salud de la API
@app.get("/health")
def health_check():
    try:
        conn = connection.obtener_conexion()
        conn.close()
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

