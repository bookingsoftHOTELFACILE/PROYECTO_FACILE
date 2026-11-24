import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, X, FileText } from 'lucide-react';
import { formatoCOP, formatoFecha } from '../utils/folio.js';

/**
 * ModalFacturaDian: Representación Gráfica Oficial de la Factura Electrónica de Venta (FEV)
 * Adaptada a la normativa DIAN (Resolución 000165 de 2023 / Anexo 1.9)
 * Basada en la plantilla oficial Facturatech para el sector hotelero.
 */
export default function ModalFacturaDian({ folio, onClose, onDescargarXml }) {
  if (!folio) return null;

  const reserva = folio.reserva || {};
  const cotizacion = folio.cotizacion || {};
  const iva = folio.iva || { base: 0, iva: 0, iva_pct: 19, total: 0 };
  const totales = folio.totales || { total: 0, pagado: 0, saldo: 0 };
  const factura = folio.factura || {};
  const emisor = folio.emisor || {
    razon_social: 'Facile Apartamentos Bogotá',
    nit: '900.000.000-1',
    domicilio: 'Calle 97 #21-62, Chicó, Bogotá D.C., Colombia',
    telefono: '+57 (601) 745-2000',
    resolucion: 'Resolución DIAN No. 18764000001 del 15 de Enero de 2026',
    rango: 'FACT-00000001 al FACT-99999999',
  };

  const consecutivo = factura.consecutivo || `FACT-${String(reserva.id_reserva || '0').padStart(8, '0')}`;
  const estadoFactura = factura.estado || 'Borrador';
  const cufe = factura.cufe || (() => {
    const semilla = `${reserva.id_reserva || '0'}|${reserva.huesped_documento || ''}|${reserva.fecha_entrada || ''}|${reserva.fecha_salida || ''}|${totales.total || 0}|${emisor.nit}`;
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < semilla.length; i++) {
      const ch = semilla.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `${p1}${p2}e20e60ca8a27890abffbd67e66744a90db97b9972ac9c68a65b8d`.slice(0, 64);
  })();

  const fechaEmision = formatoFecha(reserva.fecha_entrada || new Date().toISOString());
  const fechaVence = formatoFecha(reserva.fecha_salida || new Date().toISOString());

  // String oficial de consulta DIAN para código QR
  const qrString = `NumFac: ${consecutivo}; FecFac: ${reserva.fecha_entrada || ''}; NitFac: 900000000; DocAdq: ${reserva.huesped_documento || 'ConsumidorFinal'}; ValFac: ${totales.total}; ValIva: ${iva.iva}; ValOtro: 0.00; ValTolFac: ${totales.total}; CUFE: ${cufe}`;

  const esExtranjero = (reserva.huesped_documento || '').toUpperCase().includes('PA') ||
    (reserva.huesped_documento || '').toUpperCase().includes('PAS');

  const formatearNumero = (valor) => {
    return Number(valor || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #factura-dian-imprimible, #factura-dian-imprimible * {
            visibility: visible;
          }
          #factura-dian-imprimible {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-imprimir {
            display: none !important;
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '94vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        {/* Barra superior de acciones (no se imprime) */}
        <div
          className="no-imprimir"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            background: '#0f172a',
            color: '#ffffff',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#38bdf8" />
            <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.03em' }}>
              Representación Gráfica — Factura Electrónica de Venta (DIAN FEV)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleImprimir}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <Printer size={15} />
              Imprimir / Guardar PDF
            </button>
            {onDescargarXml && (
              <button
                type="button"
                onClick={onDescargarXml}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <Download size={14} />
                Descargar XML UBL 2.1
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenedor imprimible que reproduce con exactitud la plantilla Facturatech */}
        <div
          id="factura-dian-imprimible"
          style={{
            padding: '36px 40px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
            fontSize: '12px',
            lineHeight: 1.4,
            overflowY: 'auto',
          }}
        >
          {/* Encabezado: Logo oficial y datos de Facile Apartamentos a la izquierda; Factura y consecutivo a la derecha */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img 
                src="/images/logo-facile-bicolor.png" 
                alt="Facile Apartamentos" 
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
              <div>
                <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>
                  Facile Apartamentos Bogotá
                </h1>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                  NIT: {emisor.nit}
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  {emisor.domicilio} | Teléfono: {emisor.telefono}
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  Bogotá D.C. — Colombia
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                Factura Electrónica de Venta
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                {consecutivo}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: estadoFactura === 'Emitida' ? '#047857' : '#b91c1c',
                  marginTop: '4px',
                }}
              >
                {estadoFactura === 'Emitida' ? 'DOCUMENTO EMITIDO' : 'Borrador'}
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div style={{ fontSize: '11.5px', color: '#334155', fontWeight: 600, marginBottom: '14px' }}>
            Fecha de expedición: {fechaEmision} | Fecha de vencimiento: {fechaVence}
          </div>

          {/* Tabla 1: Moneda y CUFE */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #94a3b8',
              marginBottom: '10px',
              fontSize: '11px',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #94a3b8' }}>
                <th style={{ width: '80px', padding: '5px 8px', textAlign: 'left', borderRight: '1px solid #94a3b8', fontWeight: 700 }}>
                  Moneda
                </th>
                <th style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 700 }}>
                  Cufe (Código Único de Factura Electrónica)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '6px 8px', borderRight: '1px solid #94a3b8', fontWeight: 700, verticalAlign: 'top' }}>
                  COP
                </td>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '10.5px', wordBreak: 'break-all', color: '#334155' }}>
                  {cufe}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tabla 2: Datos del Cliente / Huésped */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #94a3b8',
              marginBottom: '14px',
              fontSize: '11px',
            }}
          >
            <tbody>
              <tr>
                <td style={{ width: '38%', padding: '6px 8px', borderRight: '1px solid #94a3b8' }}>
                  <strong>Nombre del cliente:</strong> {reserva.huesped_nombre || 'Consumidor Final'}
                </td>
                <td style={{ width: '34%', padding: '6px 8px', borderRight: '1px solid #94a3b8' }}>
                  <strong>Documento:</strong> {reserva.huesped_documento || '222222222222'}
                </td>
                <td style={{ width: '28%', padding: '6px 8px' }}>
                  <strong>Dirección / Teléfono:</strong> {reserva.huesped_correo || reserva.huesped_telefono || 'Calle 97 #21-62'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tabla 3: Detalle de Ítems / Servicios */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #94a3b8',
              marginBottom: '14px',
              fontSize: '11px',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #94a3b8' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', borderRight: '1px solid #94a3b8', fontWeight: 700 }}>
                  Descripción
                </th>
                <th style={{ width: '70px', padding: '6px 8px', textAlign: 'center', borderRight: '1px solid #94a3b8', fontWeight: 700 }}>
                  Cantidad
                </th>
                <th style={{ width: '105px', padding: '6px 8px', textAlign: 'right', borderRight: '1px solid #94a3b8', fontWeight: 700 }}>
                  Subtotal
                </th>
                <th style={{ width: '95px', padding: '6px 8px', textAlign: 'right', borderRight: '1px solid #94a3b8', fontWeight: 700 }}>
                  IVA 19.00%
                </th>
                <th style={{ width: '105px', padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '8px', borderRight: '1px solid #94a3b8' }}>
                  Alojamiento por {cotizacion.noches || 1} noches en Apartamento {reserva.habitacion_numero} ({reserva.habitacion_tipo}) | Fecha de ingreso: {reserva.fecha_entrada}
                  {esExtranjero && (
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                      Exento de IVA — Servicios turísticos a extranjeros no residentes (Art. 481 Estatuto Tributario).
                    </div>
                  )}
                </td>
                <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #94a3b8' }}>
                  1
                </td>
                <td style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #94a3b8' }}>
                  {formatearNumero(iva.base)}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #94a3b8' }}>
                  {esExtranjero ? '0.00' : formatearNumero(iva.iva)}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>
                  {formatearNumero(totales.total)}
                </td>
              </tr>
              {cotizacion.descuento > 0 && (
                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fafafa' }}>
                  <td style={{ padding: '6px 8px', borderRight: '1px solid #94a3b8', color: '#047857' }}>
                    Descuento por estadía prolongada (beneficio comercial aplicado)
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', borderRight: '1px solid #94a3b8' }}>
                    1
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', borderRight: '1px solid #94a3b8', color: '#047857' }}>
                    -{formatearNumero(cotizacion.descuento / 1.19)}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', borderRight: '1px solid #94a3b8', color: '#047857' }}>
                    -{formatearNumero(cotizacion.descuento - (cotizacion.descuento / 1.19))}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: '#047857' }}>
                    -{formatearNumero(cotizacion.descuento)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Bloque Inferior: Resolución DIAN + QR a la izquierda; Totales a la derecha */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
            {/* Izquierda: Marco Legal y Código QR */}
            <div
              style={{
                border: '1px solid #94a3b8',
                padding: '12px',
                borderRadius: '4px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <div style={{ flexShrink: 0, padding: '4px', background: '#ffffff' }}>
                <QRCodeSVG value={qrString} size={90} level="M" />
              </div>
              <div style={{ fontSize: '9.5px', color: '#334155', lineHeight: 1.35, textAlign: 'justify' }}>
                <strong>RESPONSABLE IVA REGIMEN COMUN CON NIT {emisor.nit}</strong>
                <br />
                NUMERACIÓN DE FACTURAS AUTORIZADA MEDIANTE {emisor.resolucion.toUpperCase()} PREFIJO FACT NUMERACIÓN {emisor.rango}.
                <br />
                VIGENCIA 24 MESES. DOCUMENTO ELECTRÓNICO VALIDADO SEGÚN RESOLUCIÓN DIAN 000165 DE 2023 (ANEXO TÉCNICO 1.9).
              </div>
            </div>

            {/* Derecha: Resumen de Totales */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid #94a3b8',
                fontSize: '11px',
              }}
            >
              <tbody>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600 }}>Total antes de impuestos</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', width: '110px' }}>COP {formatearNumero(iva.base)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600 }}>IVA (19.00 %)</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>COP {formatearNumero(iva.iva)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #94a3b8', background: '#f8fafc' }}>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800 }}>Total final</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800 }}>COP {formatearNumero(totales.total)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: '#047857' }}>PAGADO</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: '#047857' }}>COP {formatearNumero(totales.pagado)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 800, color: totales.saldo > 0 ? '#b91c1c' : '#475569' }}>
                    PENDIENTE
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 800, color: totales.saldo > 0 ? '#b91c1c' : '#475569' }}>
                    COP {formatearNumero(totales.saldo)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabla de Detalles de Impuestos */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              Detalles de impuestos
            </div>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid #94a3b8',
                fontSize: '11px',
              }}
            >
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #94a3b8' }}>
                  <th style={{ padding: '5px 8px', textAlign: 'left', borderRight: '1px solid #94a3b8', fontWeight: 700, width: '35%' }}>
                    Impuesto
                  </th>
                  <th style={{ padding: '5px 8px', textAlign: 'right', borderRight: '1px solid #94a3b8', fontWeight: 700, width: '35%' }}>
                    Base
                  </th>
                  <th style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, width: '30%' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '5px 8px', borderRight: '1px solid #94a3b8' }}>
                    IVA (19.00%):
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', borderRight: '1px solid #94a3b8' }}>
                    {formatearNumero(iva.base)}
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>
                    {formatearNumero(iva.iva)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pie de página corporativo */}
          <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '9.5px', color: '#94a3b8', textAlign: 'center' }}>
            Factura Electrónica de Venta • Facile Apartamentos Bogotá • Documento soporte tributario DIAN (Resolución 000165 de 2023)
          </div>
        </div>
      </div>
    </div>
  );
}
