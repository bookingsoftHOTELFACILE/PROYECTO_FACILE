"""
backend/routes/pagos.py

Módulo financiero de BookingSoft:

- ``GET  /api/reservas/{id}/folio``          folio con desglose de IVA 19% (incluido en la tarifa), movimientos y saldo.
- ``POST /api/reservas/{id}/pagos``          cobro a través de la pasarela.
- ``POST /api/reservas/{id}/pagos/{p}/anular`` anulación de un cobro (sólo Administrador).
- ``GET  /api/reservas/{id}/factura.xml``    factura electrónica simulada UBL 2.1 en borrador.

RBAC: cobro restringido a ``Administrador`` y ``Recepcionista 24h``; la
anulación exige además ``Administrador``.
"""
import hashlib
import logging
from datetime import datetime
from typing import Any, Dict, Optional, Tuple
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from dependencies import autenticar, requiere_rol, UsuarioActual
from models.schemas import PagoCreate
from repositories import cursor_escritura, cursor_lectura
from services.folio import construir_folio, validar_monto_pago
from services.pasarela import obtener_pasarela
from services.reservas_service import (
    calcular_costo_estadia,
    ValidationError as ServiceValidationError,
)

logger = logging.getLogger("bookingsoft.pagos")

# RF-009: roles autorizados para el módulo de cobros / folio.
_ROLES_COBRO = ("Administrador", "Recepcionista 24h")

# Datos del emisor de la factura SIMULADA (demostración; no es un NIT real).
_EMISOR = {
    "razon_social": "BookingSoft Apartahotel Facile Bogotá",
    "nit": "900.000.000-1",
    "domicilio": "Calle 97 #21-62, Chicó, Bogotá D.C., Colombia",
    "telefono": "+57 (601) 745-2000",
    "regimen": "Responsable de IVA - Régimen Común",
    "resolucion": "Resolución DIAN No. 18764000001 del 15 de Enero de 2026",
    "rango": "FACT-00000001 al FACT-99999999",
}

router = APIRouter(prefix="/api/reservas", tags=["pagos"])


# ==============================================================================
# Utilidades internas
# ==============================================================================

def _consultar_folio(cur, id_reserva: int) -> Optional[Tuple[Dict[str, Any], Dict[str, Any], list, Dict[str, Any]]]:
    """
    Carga reserva + cotización + movimientos y arma el folio.

    Retorna ``None`` si la reserva no existe. Lanza ``ServiceValidationError``
    si las fechas o la tarifa de la reserva no son válidas.
    """
    cur.execute(
        """
        SELECT r.id_reserva, r.fecha_entrada, r.fecha_salida, r.estado,
               r.checkin_at, r.checkout_at, r.creado_por,
               h.id_huesped, h.nombre AS huesped_nombre, h.documento AS huesped_documento,
               h.correo AS huesped_correo,
               hab.id_habitacion, hab.numero AS habitacion_numero, hab.tipo AS habitacion_tipo,
               hab.precio_noche
        FROM reserva_habitacion r
        JOIN huesped h    ON h.id_huesped    = r.id_huesped
        JOIN habitacion hab ON hab.id_habitacion = r.id_habitacion
        WHERE r.id_reserva = %s
        """,
        (id_reserva,),
    )
    fila = cur.fetchone()
    if not fila:
        return None

    reserva = {
        "id_reserva": fila["id_reserva"],
        "fecha_entrada": fila["fecha_entrada"].isoformat() if fila["fecha_entrada"] else None,
        "fecha_salida": fila["fecha_salida"].isoformat() if fila["fecha_salida"] else None,
        "estado": fila["estado"],
        "checkin_at": fila["checkin_at"].isoformat() if fila["checkin_at"] else None,
        "checkout_at": fila["checkout_at"].isoformat() if fila["checkout_at"] else None,
        "creado_por": fila["creado_por"],
        "id_huesped": fila["id_huesped"],
        "huesped_nombre": fila["huesped_nombre"],
        "huesped_documento": fila["huesped_documento"],
        "huesped_correo": fila["huesped_correo"],
        "id_habitacion": fila["id_habitacion"],
        "habitacion_numero": fila["habitacion_numero"],
        "habitacion_tipo": fila["habitacion_tipo"],
        "precio_noche": float(fila["precio_noche"]),
    }

    # Misma regla de precio que al crear la reserva (política única de descuento).
    cotizacion = calcular_costo_estadia(
        reserva["fecha_entrada"], reserva["fecha_salida"], reserva["precio_noche"]
    )

    cur.execute(
        """
        SELECT id_pago, monto, metodo, estado, referencia, referencia_gateway,
               gateway, creado_por, modificado_por, creado_en, modificado_en
        FROM pago
        WHERE id_reserva = %s
        ORDER BY creado_en, id_pago
        """,
        (id_reserva,),
    )
    pagos = [dict(p) for p in cur.fetchall()]

    folio = construir_folio(reserva, cotizacion, pagos)

    cur.execute(
        "SELECT consecutivo, cufe, estado FROM factura WHERE id_reserva = %s",
        (id_reserva,),
    )
    factura_fila = cur.fetchone()
    if factura_fila:
        folio["factura"] = dict(factura_fila)
    else:
        folio["factura"] = {
            "consecutivo": f"FACT-{id_reserva:08d}",
            "cufe": _calcular_cufe(reserva, folio),
            "estado": "Borrador",
        }
    folio["emisor"] = _EMISOR

    return reserva, cotizacion, pagos, folio


def _recalcular_folio(cur, id_reserva: int) -> Dict[str, Any]:
    """Vuelve a armar el folio dentro de la MISMA transacción (ver movimientos recién insertados)."""
    resultado = _consultar_folio(cur, id_reserva)
    if resultado is None:
        raise HTTPException(status_code=404, detail="La reserva especificada no existe.")
    return resultado[3]


def _audit(usuario: UsuarioActual) -> str:
    return f"{usuario.nombre or 'Empleado'} ({usuario.rol})"


# ==============================================================================
# Factura electrónica SIMULADA (UBL 2.1 / borrador DIAN)
# ==============================================================================

def _calcular_cufe(reserva: Dict[str, Any], folio: Dict[str, Any]) -> str:
    """
    CUFE simulado: hash SHA-256 de los datos de la operación.

    En el ambiente real de la DIAN el CUFE se firma con el certificado digital del
    emisor; aquí se usa un hash determinista para que el documento sea trazable.
    """
    semilla = "|".join(
        [
            str(reserva["id_reserva"]),
            str(reserva.get("huesped_documento") or ""),
            str(reserva.get("fecha_entrada") or ""),
            str(reserva.get("fecha_salida") or ""),
            f"{folio['totales']['total']:.2f}",
            _EMISOR["nit"],
            "SIMULADO",
        ]
    )
    return hashlib.sha256(semilla.encode("utf-8")).hexdigest()


def _generar_factura_xml(
    reserva: Dict[str, Any],
    folio: Dict[str, Any],
    consecutivo: str,
    cufe: str,
    fecha: datetime,
) -> str:
    """Genera la factura electrónica SIMULADA en UBL 2.1 (borrador descargable)."""
    iva = folio["iva"]
    totales = folio["totales"]
    nombre = escape(str(reserva.get("huesped_nombre") or "Huésped"))
    documento = escape(str(reserva.get("huesped_documento") or ""))
    detalle = escape(
        f"Alojamiento Apto {reserva['habitacion_numero']} ({reserva['habitacion_tipo']}) — "
        f"{folio['cotizacion']['noches']} noches"
    )
    fecha_iso = fecha.date().isoformat()

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>1.0</cbc:CustomizationID>
  <cbc:ID>{escape(consecutivo)}</cbc:ID>
  <cbc:IssueDate>{fecha_iso}</cbc:IssueDate>
  <cbc:DueDate>{fecha_iso}</cbc:DueDate>
  <cbc:InvoiceTypeCode>01</cbc:InvoiceTypeCode>
  <cbc:Note>DOCUMENTO SIMULADO SIN VALOR FISCAL — Pendiente de habilitación ante la DIAN.</cbc:Note>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>{escape(_EMISOR['razon_social'])}</cbc:Name></cac:PartyName>
      <cac:PostalAddress><cbc:CityName>{escape(_EMISOR['domicilio'])}</cbc:CityName></cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>{escape(_EMISOR['nit'])}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>01</cbc:ID><cbc:Name>IVA</cbc:Name></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>{escape(_EMISOR['razon_social'])}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>{nombre}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>{documento}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>01</cbc:ID><cbc:Name>IVA</cbc:Name></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity><cbc:RegistrationName>{nombre}</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:Delivery>
    <cbc:ActualDeliveryDate>{fecha_iso}</cbc:ActualDeliveryDate>
    <cac:DeliveryLocation>
      <cac:Address><cbc:CityName>Ibagué</cbc:CityName>
        <cbc:CountrySubentity>Tolima</cbc:CountrySubentity>
      </cac:Address>
    </cac:DeliveryLocation>
  </cac:Delivery>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>10</cbc:PaymentMeansCode>
    <cac:PayeeFinancialAccount><cbc:ID>{escape(consecutivo)}</cbc:ID></cac:PayeeFinancialAccount>
  </cac:PaymentMeans>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="COP">{iva['iva']:.2f}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="COP">{iva['base']:.2f}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="COP">{iva['iva']:.2f}</cbc:TaxAmount>
      <cac:TaxCategory><cbc:Percent>{iva['iva_pct']}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>01</cbc:ID><cbc:Name>IVA</cbc:Name></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">{iva['base']:.2f}</cbc:LineExtensionAmount>
    <cbc:TaxInclusiveAmount currencyID="COP">{totales['total']:.2f}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="COP">{totales['total']:.2f}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">{iva['base']:.2f}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>{detalle}</cbc:Description>
      <cac:SellersItemIdentification><cbc:ID>APT-{escape(str(reserva['habitacion_numero']))}</cbc:ID></cac:SellersItemIdentification>
    </cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="COP">{totales['total']:.2f}</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
  <cac:AdditionalDocumentReference>
    <cbc:ID>CUFE</cbc:ID>
    <cbc:UUID schemeID="20">{cufe}</cbc:UUID>
  </cac:AdditionalDocumentReference>
</Invoice>
"""


# ==============================================================================
# Endpoints
# ==============================================================================

@router.get("/{id_reserva}/folio", dependencies=[Depends(requiere_rol(*_ROLES_COBRO))])
def obtener_folio(id_reserva: int):
    """
    Folio financiero de la reserva: estadía, descuento, desglose de IVA 19%
    (incluido en la tarifa), movimientos de pago, saldo y estado de pago.
    """
    try:
        with cursor_lectura() as cur:
            resultado = _consultar_folio(cur, id_reserva)
    except ServiceValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        logger.exception("GET /api/reservas/%s/folio — fallo al construir el folio", id_reserva)
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")

    if resultado is None:
        raise HTTPException(status_code=404, detail="La reserva especificada no existe.")
    return resultado[3]


@router.post("/{id_reserva}/pagos", status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(requiere_rol(*_ROLES_COBRO))])
def registrar_pago(id_reserva: int, pago: PagoCreate, usuario: UsuarioActual = Depends(autenticar)):
    """
    Registra un cobro sobre el folio de la reserva.

    El cobro pasa por la pasarela activa (simulada por defecto). Un intento
    rechazado **también se persiste** (estado ``Rechazado``) para dejar rastro
    de auditoría; sólo los pagos ``Confirmado`` descuentan del saldo.
    """
    audit_str = _audit(usuario)
    pasarela = obtener_pasarela()

    try:
        with cursor_escritura() as cur:
            resultado = _consultar_folio(cur, id_reserva)
            if resultado is None:
                raise HTTPException(status_code=404, detail="La reserva especificada no existe.")

            reserva, _cot, _pagos, folio = resultado

            if reserva["estado"] == "Cancelada":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se pueden registrar pagos sobre una reserva cancelada.",
                )

            saldo = folio["totales"]["saldo"]
            try:
                monto = validar_monto_pago(pago.monto, saldo)
            except ServiceValidationError as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

            cobro = pasarela.cobrar(
                monto=monto,
                metodo=pago.metodo,
                referencia=pago.referencia,
                id_reserva=id_reserva,
            )
            estado = "Confirmado" if cobro.aprobado else "Rechazado"

            cur.execute(
                """
                INSERT INTO pago
                    (id_reserva, monto, metodo, estado, referencia, referencia_gateway,
                     gateway, creado_por, modificado_por)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id_pago, monto, metodo, estado, referencia, referencia_gateway,
                          gateway, creado_por, modificado_por, creado_en, modificado_en
                """,
                (
                    id_reserva,
                    monto,
                    pago.metodo,
                    estado,
                    (pago.referencia or "").strip() or None,
                    cobro.referencia_gateway,
                    cobro.gateway,
                    audit_str,
                    audit_str,
                ),
            )
            nuevo_pago = dict(cur.fetchone())
            folio_actualizado = _recalcular_folio(cur, id_reserva)

    except ServiceValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        logger.exception("POST /api/reservas/%s/pagos — fallo al registrar el cobro", id_reserva)
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")

    return {
        "message": cobro.mensaje,
        "aprobado": cobro.aprobado,
        "pago": nuevo_pago,
        "folio": folio_actualizado,
    }


@router.post("/{id_reserva}/pagos/{id_pago}/anular",
             dependencies=[Depends(requiere_rol("Administrador"))])
def anular_pago(id_reserva: int, id_pago: int, usuario: UsuarioActual = Depends(autenticar)):
    """Anula un cobro confirmado (sólo Administrador). El saldo vuelve a estar disponible."""
    audit_str = _audit(usuario)

    try:
        with cursor_escritura() as cur:
            cur.execute(
                "SELECT * FROM pago WHERE id_pago = %s AND id_reserva = %s",
                (id_pago, id_reserva),
            )
            fila = cur.fetchone()
            if not fila:
                raise HTTPException(status_code=404, detail="El pago especificado no existe en esta reserva.")
            if fila["estado"] != "Confirmado":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Sólo se pueden anular pagos confirmados (estado actual: {fila['estado']}).",
                )

            cur.execute(
                """
                UPDATE pago
                SET estado = 'Anulado', modificado_por = %s, modificado_en = now()
                WHERE id_pago = %s
                RETURNING id_pago, monto, metodo, estado, referencia, referencia_gateway,
                          gateway, creado_por, modificado_por, creado_en, modificado_en
                """,
                (audit_str, id_pago),
            )
            pago_anulado = dict(cur.fetchone())
            folio_actualizado = _recalcular_folio(cur, id_reserva)

    except HTTPException:
        raise
    except Exception:
        logger.exception("POST /api/reservas/%s/pagos/%s/anular — fallo al anular el cobro", id_reserva, id_pago)
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")

    return {
        "message": f"Pago #{id_pago} anulado por {audit_str}. El saldo fue restaurado.",
        "pago": pago_anulado,
        "folio": folio_actualizado,
    }


@router.get("/{id_reserva}/factura.xml", dependencies=[Depends(requiere_rol(*_ROLES_COBRO))])
def obtener_factura(id_reserva: int, emitir: bool = False, usuario: UsuarioActual = Depends(autenticar)):
    """
    Factura electrónica **simulada** en UBL 2.1 (borrador descargable).

    - Primera llamada: genera y persiste la factura (estado ``Borrador``).
    - ``?emitir=true``: marca la factura como ``Emitida`` (sigue siendo simulada).
    - Sin envío real a la DIAN: queda documentado en el propio XML.
    """
    audit_str = _audit(usuario)

    try:
        with cursor_escritura() as cur:
            cur.execute("SELECT * FROM factura WHERE id_reserva = %s", (id_reserva,))
            existente = cur.fetchone()

            if existente is None:
                resultado = _consultar_folio(cur, id_reserva)
                if resultado is None:
                    raise HTTPException(status_code=404, detail="La reserva especificada no existe.")
                reserva, cotizacion, _pagos, folio = resultado

                if reserva["estado"] == "Cancelada":
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="No se puede facturar una reserva cancelada.",
                    )

                consecutivo = f"FACT-{id_reserva:08d}"
                cufe = _calcular_cufe(reserva, folio)
                xml = _generar_factura_xml(reserva, folio, consecutivo, cufe, datetime.now())

                cur.execute(
                    """
                    INSERT INTO factura (id_reserva, consecutivo, cufe, estado, xml, creado_por)
                    VALUES (%s, %s, %s, 'Borrador', %s, %s)
                    RETURNING *
                    """,
                    (id_reserva, consecutivo, cufe, xml, audit_str),
                )
                fila = dict(cur.fetchone())
            else:
                fila = dict(existente)
                if emitir and fila["estado"] == "Borrador":
                    cur.execute(
                        "UPDATE factura SET estado = 'Emitida' WHERE id_factura = %s RETURNING *",
                        (fila["id_factura"],),
                    )
                    fila = dict(cur.fetchone())

    except HTTPException:
        raise
    except Exception:
        logger.exception("GET /api/reservas/%s/factura.xml — fallo al generar la factura", id_reserva)
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")

    return Response(
        content=fila["xml"],
        media_type="application/xml",
        headers={
            "Content-Disposition": f'attachment; filename="{fila["consecutivo"]}.xml"',
            "X-Factura-Estado": fila["estado"],
            "X-Factura-Simulada": "true",
            "X-CUFE": fila["cufe"],
        },
    )
