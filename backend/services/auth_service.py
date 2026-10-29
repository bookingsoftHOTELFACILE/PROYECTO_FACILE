from datetime import datetime, timedelta, timezone
import jwt
import bcrypt 



def crear_token_jwt(id_empleado: int, rol: str, nombre: str, secret_key: str, expira_minutos: int = 480) -> str:

    if not secret_key:
        raise ValueError ("la clave secreta (secret_key) no puede estar vacia ")

    fecha_expiracion = datetime.now(tz=timezone.utc) + timedelta(minutes=expira_minutos)

    payload = {
        "sub": str (id_empleado),
        "rol" : rol,
        "nombre" : nombre,
        "exp" : fecha_expiracion,
    } 

    return jwt.encode (payload, secret_key,
    algorithm= "HS256")

def verificar_contrasena(contrasena_plana: str, hash_almacenado: str) -> bool:
    if not contrasena_plana or not hash_almacenado: 
        return False 

    password_bytes = contrasena_plana.encode("utf-8")
    hash_bytes = hash_almacenado.encode("utf-8")

    try: 
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except ValueError:
        return False 


def extraer_token_bearer(cabecera_auth: str) -> str:

    if not cabecera_auth or not cabecera_auth.strip():
        raise ValueError ("La cabecera de autorización no pude estar vacia")

    partes = cabecera_auth.strip().split(" ")

    if len (partes) != 2 or partes [0] !="Bearer":
        raise ValueError("formato de cabecera invalido, deber ser : 'Bearer <token>' ")

    return partes[1]


    