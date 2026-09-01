# Registro Oficial de Rotación de Secretos y Credenciales (BookingSoft)

**Fecha de Rotación:** 31 de agosto de 2026  
**Proyecto:** BookingSoft (Proyecto Facile) — SENA ADSO  
**Motivo:** Declaración formal ante hallazgos de seguridad en historial inicial de control de versiones Git (Commit `c29571f`).

---

## 1. Declaración del Hallazgo

En la etapa inicial del desarrollo (commit `c29571f`), se versionaron accidentalmente claves temporales de prueba local en el archivo `backend/.env`. Aunque el archivo fue removido del seguimiento del repositorio en el commit `f4aab18`, los valores antiguos permanecían legibles en el historial de Git para cualquier persona que clonara el proyecto.

---

## 2. Registro de Claves Rotadas

| Variable | Estado en Historial Git (Antiguo) | Estado Actual en Producción / Entorno Real | Acción Realizada |
| :--- | :--- | :--- | :--- |
| `JWT_SECRET` | `super_secret_bookingsoft_token_key_adso_2026` | Clave criptográfica aleatoria de 256 bits (`openssl rand -hex 32`) | **ROTADA.** La clave anterior fue invalidada por completo. |
| `DB_PASSWORD` | `adso_password` | Contraseña segura parametrizada por variable de entorno | **PARAMETRIZADA Y ROTADA.** |
| `POSTGRES_PASSWORD` | `adso_password` | Contraseña de base de datos aislada en contenedor | **PARAMETRIZADA Y ROTADA.** |

---

## 3. Controles Técnicos de Prevención Implementados

1. **Inclusión en `.gitignore`:** El archivo `.env` está estrictamente incluido en `.gitignore`.
2. **Plantilla de Referencia `.env.example`:** Solo se proporciona `.env.example` con valores de marcador `CHANGE_ME`.
3. **Mecanismo Fail-Fast al iniciar el Backend (`backend/main.py`):**
   Si la variable `JWT_SECRET` está vacía o conserva el valor `CHANGE_ME`, el backend aborta su ejecución (`sys.exit(1)`), impidiendo que la aplicación corra con credenciales no seguras.
