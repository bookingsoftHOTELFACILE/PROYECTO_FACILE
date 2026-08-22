"""
backend/routes/empleados.py
Sprint 1 — Gestión de empleados (rol y estado)

RF-006 / HU-004 CA-004.5: Modificación de rol de empleado (solo Administrador)
RF-009 / RF-010 / HU-004 CA-004.4: Cambio de estado activo/inactivo (solo Administrador)

Notas de implementación:
- RF-006 / RN-006.2: el documento lista 4 roles asignables (excluye 'Administrador'),
  pero el CHECK constraint de la BD define 5 roles válidos incluyendo 'Administrador'.
  Se implementa contra los 5 roles del CHECK (fuente de verdad del sistema) para no
  crear inconsistencia entre la API y la BD. La discrepancia fue reportada al desarrollador.
- Caso límite no documentado en HUs: se impide que el único administrador activo del
  sistema se quite a sí mismo el rol de Administrador (salvaguarda básica implementada
  como medida preventiva, documentada explícitamente).
"""
from fastapi import APIRouter, Depends, HTTPException, status

from database import connection
from dependencies import UsuarioActual, autenticar, requiere_rol

router = APIRouter(prefix="/api/empleados", tags=["empleados"])

# Roles válidos según el CHECK constraint de la tabla empleado (schema.sql línea 24)
_ROLES_CHECK = ("Administrador", "Recepcionista 24h", "Ama de llaves", "Personal de mantenimiento", "Conserje")


# ── PATCH /api/empleados/{id}/rol ─────────────────────────────────────────────
@router.patch("/{id_empleado}/rol", dependencies=[Depends(requiere_rol("Administrador"))])
def modificar_rol(
    id_empleado: int,
    body: dict,
    admin: UsuarioActual = Depends(autenticar),
):
    """
    RF-006 / HU-004 CA-004.5 — Cambia el rol de un empleado.

    RN-006.1: solo el Administrador puede modificar roles.
    RN-006.2: el nuevo rol debe ser uno de los valores del CHECK constraint.
    Salvaguarda adicional: si el administrador intenta quitarse su propio rol
    y es el único administrador activo, la operación se rechaza (no documentado
    en HUs pero implementado como medida de seguridad básica).
    """
    nuevo_rol = body.get("rol", "").strip()

    # Validar que el rol sea uno de los permitidos
    if nuevo_rol not in _ROLES_CHECK:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rol inválido. Los roles permitidos son: {', '.join(_ROLES_CHECK)}.",
        )

    try:
        conn = connection.obtener_conexion()
        cur = conn.cursor()

        # Verificar que el empleado existe
        cur.execute(
            "SELECT id_empleado, nombre, rol, estado FROM empleado WHERE id_empleado = %s",
            (id_empleado,),
        )
        fila = cur.fetchone()
        if not fila:
            cur.close(); conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No existe ningún empleado con id {id_empleado}.",
            )
        _, nombre_emp, rol_actual, estado_emp = fila

        # Salvaguarda: impedir que el único administrador activo se quite su propio rol
        if (
            admin.id_empleado == id_empleado
            and rol_actual == "Administrador"
            and nuevo_rol != "Administrador"
        ):
            cur.execute(
                "SELECT COUNT(*) FROM empleado WHERE rol = 'Administrador' AND estado = 'Activo'",
            )
            total_admins = cur.fetchone()[0]
            if total_admins <= 1:
                cur.close(); conn.close()
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "No es posible quitarse el rol de Administrador: "
                        "usted es el único administrador activo del sistema. "
                        "Asigne el rol a otro empleado primero."
                    ),
                )

        # Aplicar el cambio
        cur.execute(
            "UPDATE empleado SET rol = %s WHERE id_empleado = %s RETURNING id_empleado, nombre, rol",
            (nuevo_rol, id_empleado),
        )
        res = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return {
            "message": f"Rol de '{nombre_emp}' actualizado exitosamente.",
            "empleado": {
                "id_empleado": res[0],
                "nombre": res[1],
                "rol_anterior": rol_actual,
                "rol_nuevo": res[2],
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al modificar rol: {e}",
        )


# ── PATCH /api/empleados/{id}/estado ─────────────────────────────────────────
@router.patch("/{id_empleado}/estado", dependencies=[Depends(requiere_rol("Administrador"))])
def modificar_estado(
    id_empleado: int,
    body: dict,
):
    """
    RF-010 / HU-004 CA-004.4 — Cambia el estado de un empleado entre 'Activo' e 'Inactivo'.

    RN-010.1: solo el Administrador puede modificar el estado.
    RN-010.2: los estados válidos son exclusivamente 'Activo' e 'Inactivo'.
    RN-010.3: un usuario Inactivo no puede iniciar sesión (se aplica en el endpoint de login).
    """
    nuevo_estado = body.get("estado", "").strip()

    _ESTADOS_VALIDOS = ("Activo", "Inactivo")
    if nuevo_estado not in _ESTADOS_VALIDOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estado inválido. Los valores permitidos son: {', '.join(_ESTADOS_VALIDOS)}.",
        )

    try:
        conn = connection.obtener_conexion()
        cur = conn.cursor()

        # Verificar que el empleado existe
        cur.execute(
            "SELECT id_empleado, nombre, estado FROM empleado WHERE id_empleado = %s",
            (id_empleado,),
        )
        fila = cur.fetchone()
        if not fila:
            cur.close(); conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No existe ningún empleado con id {id_empleado}.",
            )
        _, nombre_emp, estado_actual = fila

        # Aplicar el cambio
        cur.execute(
            "UPDATE empleado SET estado = %s WHERE id_empleado = %s RETURNING id_empleado, nombre, estado",
            (nuevo_estado, id_empleado),
        )
        res = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return {
            "message": f"Estado de '{nombre_emp}' actualizado exitosamente.",
            "empleado": {
                "id_empleado": res[0],
                "nombre": res[1],
                "estado_anterior": estado_actual,
                "estado_nuevo": res[2],
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al modificar estado: {e}",
        )
