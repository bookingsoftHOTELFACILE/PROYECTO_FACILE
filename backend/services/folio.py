"""
backend/services/folio.py

Lógica de negocio del folio de la reserva (módulo financiero).
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, List, Union

# Mismo tipo de error de dominio que el resto de servicios (lo reexporta el folio).
from services.reservas_service import ValidationError

IVA_PCT = 19

# Estados de pago que descuentan del saldo.
_PAGOS_QUE_DESCUENTAN = ("Confirmado",)

# Estados posibles del saldo de la reserva.
ESTADOS_PAGO = ("Pendiente", "Parcial", "Pagado")


def _dos_decimales(valor: Union[float, int, Decimal]) -> float:
    """Redondea a 2 decimales con criterio comercial (half-up)."""
    return float(Decimal(str(valor)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def desglose_iva(total_incluido: Union[float, int, Decimal]) -> Dict[str, float]:
    """
    Desglosa un total con IVA 19% ya incluido.

    >>> desglose_iva(119000)
    {'base': 100000.0, 'iva_pct': 19, 'iva': 19000.0, 'total': 119000.0}
    """
    total = _dos_decimales(total_incluido)
    base = _dos_decimales(total / (1 + IVA_PCT / 100.0))
    iva = _dos_decimales(total - base)
    return {"base": base, "iva_pct": IVA_PCT, "iva": iva, "total": total}


def pagado_confirmado(pagos: List[Dict[str, Any]]) -> float:
    """Suma sólo los pagos en estado 'Confirmado' (rechazados/anulados no suman)."""
    return _dos_decimales(
        sum(float(p.get("monto") or 0) for p in pagos if p.get("estado") in _PAGOS_QUE_DESCUENTAN)
    )


def construir_folio(
    reserva: Dict[str, Any],
    cotizacion: Dict[str, Any],
    pagos: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Arma el folio completo de la reserva.

    :param reserva:    fila de la reserva (id, huésped, habitación, fechas, estado).
    :param cotizacion: {noches, subtotal, descuento, total} calculados con
                       `calcular_costo_estadia` / `fn_calcular_noches_y_precio`.
    :param pagos:      lista de movimientos de pago de la reserva.
    :return:           folio con desglose de IVA, movimientos, totales y estado de pago.
    """
    total = _dos_decimales(cotizacion.get("total") or 0)
    pagado = pagado_confirmado(pagos)
    saldo = _dos_decimales(max(0.0, total - pagado))

    if pagado <= 0:
        estado = ESTADOS_PAGO[0]
    elif saldo <= 0:
        estado = ESTADOS_PAGO[2]
    else:
        estado = ESTADOS_PAGO[1]

    return {
        "reserva": reserva,
        "cotizacion": {
            "noches": cotizacion.get("noches"),
            "subtotal": _dos_decimales(cotizacion.get("subtotal") or 0),
            "descuento": _dos_decimales(cotizacion.get("descuento") or 0),
            "total": total,
        },
        # IVA 19% incluido en la tarifa: sólo desglose (el total NO se incrementa).
        "iva": desglose_iva(total),
        "pagos": pagos,
        "totales": {
            "total": total,
            "pagado": pagado,
            "saldo": saldo,
        },
        "estado_pago": estado,
    }


def validar_monto_pago(monto: Union[float, int], saldo: Union[float, int]) -> float:
    """
    Valida un monto de pago contra el saldo pendiente.

    - Debe ser un número > 0.
    - No puede superar el saldo (evita cobros duplicados por doble clic o doble
      captura de recepción).
    """
    try:
        valor = _dos_decimales(monto)
    except (ValueError, TypeError):
        raise ValidationError("El monto del pago debe ser un número válido.")

    if valor <= 0:
        raise ValidationError("El monto del pago debe ser mayor a cero.")

    if valor > _dos_decimales(saldo):
        raise ValidationError(
            f"El monto ${valor:,.2f} supera el saldo pendiente de ${_dos_decimales(saldo):,.2f}."
        )
    return valor
