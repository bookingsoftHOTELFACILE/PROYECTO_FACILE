"""
backend/services/pasarela.py

Adaptador de pasarela de pagos (patrón Adapter).
"""
from __future__ import annotations

import logging
import os
import uuid
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger("bookingsoft.pasarela")

# Prefijo de referencia que la pasarela simulada interpreta como "tarjeta declinada".
# Permite probar el camino de rechazo sin ningún proveedor externo.
MARCADOR_RECHAZO = "RECHAZO"


@dataclass(frozen=True)
class ResultadoCobro:
    """Resultado uniforme de cualquier pasarela (simulada o real)."""
    aprobado: bool
    referencia_gateway: str
    mensaje: str
    gateway: str = "simulado"


class PasarelaSimulada:
    """
    Pasarela en modo simulado (desarrollo / CI / demostración).

    Reglas deterministas:
    - Si la referencia comienza con ``RECHAZO`` -> cobro rechazado (simula tarjeta
      declinada). Sirve para ejercitar el camino de error sin proveedor real.
    - En cualquier otro caso -> cobro aprobado con referencia ``SIM-XXXXXXXX``.

    Nunca toca red, ni claves, ni tarjetas reales: no cuesta nada y funciona en
    cualquier entorno (incluido CI sin secretos).
    """
    nombre = "simulado"

    def cobrar(
        self,
        *,
        monto: float,
        metodo: str,
        referencia: Optional[str] = None,
        id_reserva: Optional[int] = None,
    ) -> ResultadoCobro:
        referencia = (referencia or "").strip()

        if referencia.upper().startswith(MARCADOR_RECHAZO):
            logger.info(
                "[Pasarela simulada] Cobro rechazado (marcador %s) — reserva %s, monto %s %s",
                MARCADOR_RECHAZO, id_reserva, monto, metodo,
            )
            return ResultadoCobro(
                aprobado=False,
                referencia_gateway=f"SIM-R-{uuid.uuid4().hex[:12].upper()}",
                mensaje="Cobro rechazado por la pasarela (tarjeta declinada).",
                gateway=self.nombre,
            )

        referencia_gateway = f"SIM-{uuid.uuid4().hex[:16].upper()}"
        logger.info(
            "[Pasarela simulada] Cobro aprobado — reserva %s, monto %s %s, ref %s",
            id_reserva, monto, metodo, referencia_gateway,
        )
        return ResultadoCobro(
            aprobado=True,
            referencia_gateway=referencia_gateway,
            mensaje="Cobro aprobado (pasarela simulada).",
            gateway=self.nombre,
        )


def obtener_pasarela() -> PasarelaSimulada:
    """
    Factoría de la pasarela activa.

    Por defecto: simulada. La variable ``PASARELA`` deja el punto de conexión
    para futuros proveedores (p. ej. ``PASARELA=stripe``); mientras no exista una
    implementación registrada se mantiene la simulada y se avisa en el log.
    """
    nombre = (os.getenv("PASARELA", "") or "").strip().lower()
    if nombre and nombre != "simulado":
        logger.warning(
            "[Pasarela] PASARELA=%r no tiene implementación registrada; "
            "se usa la pasarela simulada. Implementar la clase en services/pasarela.py "
            "y registrarla en obtener_pasarela().",
            nombre,
        )
    return PasarelaSimulada()
