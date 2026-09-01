FROM python:3.11-slim

# Instalar curl para healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar Pipenv
RUN pip install --no-cache-dir pipenv

# Copiar archivos de dependencias Pipfile e instalar en el sistema
COPY Pipfile ./
RUN pipenv install --system --skip-lock --dev

# Copiar código del backend
COPY . .

# Exponer el puerto del servidor uvicorn
EXPOSE 4000

# Comando para ejecutar FastAPI con Uvicorn en el puerto 4000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4000"]
