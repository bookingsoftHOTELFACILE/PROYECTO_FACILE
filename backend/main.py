from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import connection
from routes import huespedes, habitaciones, reservas

app = FastAPI(
    title="BookingSoft API - FastAPI",
    description="Servidor REST Backend modular en Python para Registro y Reservas",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones del cliente React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# Ruta de diagnóstico de salud de la API
@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "message": "Servidor de BookingSoft (FastAPI) funcionando correctamente.",
        "modo": "Simulación" if connection.es_modo_simulacion() else "Físico (PostgreSQL)"
    }
