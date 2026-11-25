import pytest
import jwt 
import bcrypt

from services.auth_service import ( 
    crear_token_jwt,
    verificar_contrasena,
    extraer_token_bearer

)


def test_crear_token_jwt_con_claims_correctos():
    # Arrange: datos del empleado y clave secreta de prueba
    id_empleado = 1
    rol = "administrador"
    nombre = "david lopez"
    secret_key = "clave_secreta_para_pruebas_2026"

    # Act: generar el token y decodificarlo para leer sus datos
    token = crear_token_jwt(id_empleado, rol, nombre, secret_key, expira_minutos=60)
    datos_decodificados = jwt.decode(token, secret_key, algorithms=["HS256"])

    # Assert: el token guarda el id, el rol, el nombre y la expiracion
    assert datos_decodificados["sub"] == "1"
    assert datos_decodificados["rol"] == "administrador"
    assert datos_decodificados["nombre"] == "david lopez"
    assert "exp" in datos_decodificados



def test_verificar_contrasena_acepta_correcta_y_rechaza_incorrecta():
    # Arrange: una clave real, una falsa y el hash bcrypt de la real
    clave_real = "admin2026!"
    clave_falsa = "admin2028!"
    hash_seguro = bcrypt.hashpw(clave_real.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Act: comparar ambas claves contra el hash
    es_valida = verificar_contrasena(clave_real, hash_seguro)
    es_invalida = verificar_contrasena(clave_falsa, hash_seguro)

    # Assert: la real se acepta y la falsa se rechaza
    assert es_valida is True
    assert es_invalida is False


def test_crear_token_expirado_es_rechazado():
    # Arrange: valor limite, un token que vencio hace 1 minuto
    secret_key = "clave_secreta_test"
    token_vencido = crear_token_jwt(2, "recepcionista 24h", "carlos", secret_key,expira_minutos=-1)

    # Act & Assert: al decodificarlo debe lanzar error de expiracion
    with pytest.raises(jwt.ExpiredSignatureError):
        jwt.decode(token_vencido, secret_key, algorithms=["HS256"])



def test_extraer_token_bearer_formato_correcto():
    # Arrange: cabecera de autorizacion con formato 'Bearer <token>'
    cabecera = "Bearer mi_token_secreto_xyz_123"

    # Act: extraer solo el token
    token_extraido = extraer_token_bearer(cabecera)

    # Assert: se obtiene el token sin la palabra 'Bearer'
    assert token_extraido == "mi_token_secreto_xyz_123"


