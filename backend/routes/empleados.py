import logging
logger = logging.getLogger("bookingsoft.empleados")
"""
backend/routes/empleados.py
Sprint 1 & Sprint 3 — Gestión y consulta de empleados del sistema

RF-002 / HU-003: Consulta general de usuarios del sistema (Administrador, Recepcionista 24h)
RF-003 / HU-004: Consulta de usuario específico por id (Administrador, Recepcionista 24h)
RF-006 / HU-004 CA-004.5: Modificación de rol de empleado (Administrador, Recepcionista 24h)
RF-009 / RF-010 / HU-004 CA-004.4: Cambio de estado activo/inactivo (Administrador, Recepcionista 24h)

Notas de implementación:
- Tanto el Administrador como el Recepcionista 24h poseen permisos de gestión de personal.
- La contraseña se excluye explícitamente de todos los endpoints de consulta (RF-002, RF-003).
- Salvaguarda: se impide desactivar o cambiar el rol del último usuario activo con permisos de gestión
  (Administrador o Recepcionista 24h) para evitar dejar el sistema sin personal administrativo.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import UsuarioActual, autenticar, requiere_rol
from repositories import cursor_escritura, cursor_lectura

router = APIRouter(prefix="/api/empleados", tags=["empleados"])

# Roles asignables vía API — RN-006.2 excluye explícitamente 'Administrador'.
# RF-006 / RN-006.2: roles que un Administrador puede reasignar (el rol
# 'Administrador' no se reasigna desde este endpoint).
_ROLES_ASIGNABLES = ("Recepcionista 24h", "Ama de llaves", "Personal de mantenimiento")

# Roles con capacidad de gestión administrativa sobre el personal del apartahotel
_ROLES_GESTION = ("Administrador", "Recepcionista 24h")


# ── GET /api/empleados (RF-002) ───────────────────────────────────────────────
@router.get("", dependencies=[Depends(requiere_rol(*_ROLES_GESTION))])
def listar_empleados(
    estado: Optional[str] = None,
    rol: Optional[str] = None,
):
    """
    RF-002 / HU-003 — Consulta el listado completo de empleados del sistema.

    - Acceso restringido a Administrador y Recepcionista 24h.
    - Soporta filtros opcionales por estado ('Activo'/'Inactivo') y rol.
    - Excluye explícitamente la contraseña de la respuesta por seguridad.
    """
    try:
        with cursor_lectura() as cur:
            query = """
                SELECT id_empleado, nombre, usuario, rol, estado, tipo_documento, numero_documento, correo
                FROM empleado
                WHERE 1=1
            """
            params = []

            if estado:
                query += " AND estado = %s"
                params.append(estado.strip())

            if rol:
                query += " AND rol = %s"
                params.append(rol.strip())

            query += " ORDER BY id_empleado ASC"

            cur.execute(query, params)
            filas = cur.fetchall()

        # M-06: se lee por nombre de columna en lugar de por posición.
        return [
            {
                "id_empleado": f["id_empleado"],
                "nombre": f["nombre"],
                "usuario": f["usuario"],
                "rol": f["rol"],
                "estado": f["estado"],
                "tipo_documento": f["tipo_documento"],
                "numero_documento": f["numero_documento"],
                "correo": f["correo"],
            }
            for f in filas
        ]

    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("GET /api/empleados — fallo al consultar el listado (estado=%s, rol=%s)", estado, rol)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg técnico en logger, no en HTTP,
        )


# ── GET /api/empleados/{id_empleado} (RF-003) ─────────────────────────────────
@router.get("/{id_empleado}", dependencies=[Depends(requiere_rol(*_ROLES_GESTION))])
def obtener_empleado(id_empleado: int):
    """
    RF-003 / HU-004 — Consulta la información de un empleado específico por ID.

    - Acceso restringido a Administrador y Recepcionista 24h.
    - Excluye explícitamente la contraseña de la respuesta.
    - Retorna 404 si el ID especificado no existe.
    """
    try:
        with cursor_lectura() as cur:
            cur.execute(
                """
                SELECT id_empleado, nombre, usuario, rol, estado, tipo_documento, numero_documento, correo
                FROM empleado
                WHERE id_empleado = %s
                """,
                (id_empleado,),
            )
            fila = cur.fetchone()

        if not fila:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró ningún empleado con id {id_empleado}.",
            )

        # M-06: acceso por nombre de columna.
        return {
            "id_empleado": fila["id_empleado"],
            "nombre": fila["nombre"],
            "usuario": fila["usuario"],
            "rol": fila["rol"],
            "estado": fila["estado"],
            "tipo_documento": fila["tipo_documento"],
            "numero_documento": fila["numero_documento"],
            "correo": fila["correo"],
        }

    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("GET /api/empleados/%s — fallo al consultar el empleado", id_empleado)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg técnico en logger, no en HTTP,
        )


# ── PATCH /api/empleados/{id}/rol ─────────────────────────────────────────────
@router.patch("/{id_empleado}/rol", dependencies=[Depends(requiere_rol(*_ROLES_GESTION))])
def modificar_rol(
    id_empleado: int,
    body: dict,
    usuario_actual: UsuarioActual = Depends(autenticar),
):
    """
    RF-006 / HU-004 CA-004.5 — Cambia el rol de un empleado.

    RN-006.1: Administrador y Recepcionista 24h pueden modificar roles.
    RN-006.2: los roles asignables son exclusivamente: Recepcionista 24h, Ama de llaves
              y Personal de mantenimiento. El rol 'Administrador' no puede
              asignarse a través de este endpoint.
    Salvaguarda: si se intenta quitar el rol de gestión a un usuario y este es el único
                 usuario con rol de gestión activo, la operación se rechaza con 409 Conflict.
    """
    nuevo_rol = body.get("rol", "").strip()

    # RN-006.2: 'Administrador' no es asignable a través de este endpoint.
    if nuevo_rol == "Administrador":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No se puede asignar el rol 'Administrador' a través de este endpoint "
                "(RN-006.2). Los roles asignables son: "
                f"{', '.join(_ROLES_ASIGNABLES)}."
            ),
        )

    # Validar que el rol sea uno de los 4 operativos permitidos
    if nuevo_rol not in _ROLES_ASIGNABLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rol inválido. Los roles asignables son: {', '.join(_ROLES_ASIGNABLES)}.",
        )

    try:
        # M-05: commit/rollback vive en la capa de repositorios.
        with cursor_escritura() as cur:

            # Verificar que el empleado existe
            cur.execute(
                "SELECT id_empleado, nombre, rol, estado FROM empleado WHERE id_empleado = %s",
                (id_empleado,),
            )
            fila = cur.fetchone()
            if not fila:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe ningún empleado con id {id_empleado}.",
                )
            nombre_emp = fila["nombre"]
            rol_actual = fila["rol"]

            # Salvaguarda: si el cambio remueve un rol de gestión (Administrador o Recepcionista 24h),
            # verificar que quede al menos un usuario activo con rol de gestión en el sistema.
            if rol_actual in _ROLES_GESTION and nuevo_rol not in _ROLES_GESTION:
                cur.execute(
                    "SELECT COUNT(*) AS total FROM empleado WHERE rol IN ('Administrador', 'Recepcionista 24h') AND estado = 'Activo'",
                )
                total_gestion = cur.fetchone()["total"]
                if total_gestion <= 1:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=(
                            "No es posible modificar el rol: este empleado es el único usuario "
                            "activo con permisos de gestión (Administrador o Recepcionista 24h) "
                            "en el sistema."
                        ),
                    )

            # Aplicar el cambio
            cur.execute(
                "UPDATE empleado SET rol = %s WHERE id_empleado = %s RETURNING id_empleado, nombre, rol",
                (nuevo_rol, id_empleado),
            )
            res = cur.fetchone()

        # M-06: se lee por nombre de columna.
        return {
            "message": f"Rol de '{nombre_emp}' actualizado exitosamente.",
            "empleado": {
                "id_empleado": res["id_empleado"],
                "nombre": res["nombre"],
                "rol_anterior": rol_actual,
                "rol_nuevo": res["rol"],
            },
        }

    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("PATCH /api/empleados/%s/rol — fallo al asignar el rol %r", id_empleado, nuevo_rol)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg técnico en logger, no en HTTP,
        )


# ── PATCH /api/empleados/{id}/estado ─────────────────────────────────────────
@router.patch("/{id_empleado}/estado", dependencies=[Depends(requiere_rol(*_ROLES_GESTION))])
def modificar_estado(
    id_empleado: int,
    body: dict,
):
    """
    RF-010 / HU-004 CA-004.4 — Cambia el estado de un empleado entre 'Activo' e 'Inactivo'.

    RN-010.1: Administrador y Recepcionista 24h pueden modificar el estado.
    RN-010.2: los estados válidos son exclusivamente 'Activo' e 'Inactivo'.
    RN-010.3: un usuario Inactivo no puede iniciar sesión.
    Salvaguarda: no se permite desactivar al único usuario con rol de gestión activo.
    """
    nuevo_estado = body.get("estado", "").strip()

    _ESTADOS_VALIDOS = ("Activo", "Inactivo")
    if nuevo_estado not in _ESTADOS_VALIDOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estado inválido. Los valores permitidos son: {', '.join(_ESTADOS_VALIDOS)}.",
        )

    try:
        # M-05: commit/rollback vive en la capa de repositorios.
        with cursor_escritura() as cur:

            # Verificar que el empleado existe
            cur.execute(
                "SELECT id_empleado, nombre, rol, estado FROM empleado WHERE id_empleado = %s",
                (id_empleado,),
            )
            fila = cur.fetchone()
            if not fila:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe ningún empleado con id {id_empleado}.",
                )
            nombre_emp = fila["nombre"]
            rol_emp = fila["rol"]
            estado_actual = fila["estado"]

            # Salvaguarda: si se intenta desactivar a un usuario con rol de gestión, verificar que quede otro activo.
            if nuevo_estado == "Inactivo" and estado_actual == "Activo" and rol_emp in _ROLES_GESTION:
                cur.execute(
                    "SELECT COUNT(*) AS total FROM empleado WHERE rol IN ('Administrador', 'Recepcionista 24h') AND estado = 'Activo'",
                )
                total_gestion = cur.fetchone()["total"]
                if total_gestion <= 1:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=(
                            "No es posible desactivar este empleado: es el único usuario "
                            "activo con permisos de gestión (Administrador o Recepcionista 24h) "
                            "en el sistema."
                        ),
                    )

            # Aplicar el cambio
            cur.execute(
                "UPDATE empleado SET estado = %s WHERE id_empleado = %s RETURNING id_empleado, nombre, estado",
                (nuevo_estado, id_empleado),
            )
            res = cur.fetchone()

        # M-06: se lee por nombre de columna.
        return {
            "message": f"Estado de '{nombre_emp}' actualizado exitosamente.",
            "empleado": {
                "id_empleado": res["id_empleado"],
                "nombre": res["nombre"],
                "estado_anterior": estado_actual,
                "estado_nuevo": res["estado"],
            },
        }

    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("PATCH /api/empleados/%s/estado — fallo al asignar el estado %r", id_empleado, nuevo_estado)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg técnico en logger, no en HTTP,
        )
