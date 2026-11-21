import React, { useState, useEffect, useCallback } from 'react';
import { X, Receipt, Download, Plus, FileSpreadsheet } from 'lucide-react';
import HojaCalculoFolio from './HojaCalculoFolio.jsx';
import { useApp } from '../context/AppContext';
import {
  apiFetch,
  authHeaders,
  formatErrorMessage,
  API_URL,
} from '../api/client.js';
import {
  formatoCOP,
  etiquetaEstadoPago,
  etiquetaEstadoMovimiento,
  formatoFecha,
  generarCsvFolio,
} from '../utils/folio.js';

/**
 * ModalFolioReserva (Fase 2 — módulo financiero).
 *
 * Muestra el folio de una reserva: estadía, desglose de IVA 19% (incluido en la
 * tarifa), movimientos de pago, saldo y estado. Permite registrar cobros (vía la
 * pasarela activa, simulada por defecto), anularlos (sólo Administrador) y
 * descargar la factura electrónica SIMULADA en XML UBL 2.1 (borrador DIAN).
 */
const METODOS_PAGO = [
  'Efectivo',
  'Tarjeta de crédito',
  'Tarjeta de débito',
  'PSE',
  'Nequi',
  'Transferencia',
  'Bono',
];

const filaResumen = (etiqueta, valor, { fuerte = false, color = '#0f172a' } = {}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: fuerte ? '10px 0' : '6px 0',
      borderTop: fuerte ? '2px solid #e2e8f0' : 'none',
      fontSize: fuerte ? '15px' : '13px',
      fontWeight: fuerte ? 900 : 600,
      color,
    }}
  >
    <span style={{ color: fuerte ? '#0f172a' : '#475569' }}>{etiqueta}</span>
    <span>{valor}</span>
  </div>
);

export default function ModalFolioReserva({ idReserva, onClose }) {
  const { authToken, usuarioSesion } = useApp();

  const [folio, setFolio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('Efectivo');
  const [referencia, setReferencia] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [verHojaCalculo, setVerHojaCalculo] = useState(false);

  const esAdmin = (usuarioSesion?.rol || '') === 'Administrador';

  const cargarFolio = useCallback(async () => {
    const res = await apiFetch(`/api/reservas/${idReserva}/folio`, { token: authToken });
    setCargando(false);
    if (res.ok) {
      setFolio(res.data);
      setError(null);
      setMonto(res.data?.totales?.saldo > 0 ? String(res.data.totales.saldo) : '');
    } else {
      setError(formatErrorMessage(res.data?.detail));
    }
  }, [idReserva, authToken]);

  useEffect(() => {
    cargarFolio();
  }, [cargarFolio]);

  const registrarPago = async (e) => {
    e.preventDefault();
    const valor = Number(monto);
    if (!(valor > 0)) {
      setError('Ingrese un monto mayor a cero.');
      return;
    }
    setGuardando(true);
    setError(null);
    setExito(null);
    const res = await apiFetch(`/api/reservas/${idReserva}/pagos`, {
      method: 'POST',
      token: authToken,
      body: { monto: valor, metodo, referencia: referencia.trim() || undefined },
    });
    setGuardando(false);

    if (res.ok) {
      setFolio(res.data.folio);
      if (res.data.aprobado) {
        setExito(res.data.message);
        setReferencia('');
        setMonto(res.data.folio?.totales?.saldo > 0 ? String(res.data.folio.totales.saldo) : '');
      } else {
        // Cobro rechazado por la pasarela: queda registrado como intento.
        setError(res.data.message);
      }
    } else {
      setError(formatErrorMessage(res.data?.detail));
    }
  };

  const anularPago = async (idPago) => {
    if (!window.confirm(`¿Anular el pago #${idPago}? El saldo volverá a estar disponible.`)) {
      return;
    }
    setError(null);
    setExito(null);
    const res = await apiFetch(`/api/reservas/${idReserva}/pagos/${idPago}/anular`, {
      method: 'POST',
      token: authToken,
    });
    if (res.ok) {
      setFolio(res.data.folio);
      setExito(res.data.message);
      setMonto(res.data.folio?.totales?.saldo > 0 ? String(res.data.folio.totales.saldo) : '');
    } else {
      setError(formatErrorMessage(res.data?.detail));
    }
  };

  // Fase 3 — exportación del folio a CSV (para Excel / contabilidad).
  const descargarCsv = () => {
    if (!folio) return;
    const csv = generarCsvFolio(folio);
    // BOM para que Excel abra los acentos correctamente.
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `FOLIO-${folio.reserva?.id_reserva || idReserva}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
    setExito('Folio exportado en CSV (compatible con Excel).');
  };

  const descargarFactura = async () => {
    setDescargando(true);
    setError(null);
    setExito(null);
    try {
      const respuesta = await fetch(`${API_URL}/api/reservas/${idReserva}/factura.xml`, {
        headers: authHeaders(authToken),
      });
      if (!respuesta.ok) {
        let detalle = null;
        try {
          detalle = await respuesta.json();
        } catch {
          detalle = null;
        }
        setError(formatErrorMessage(detalle?.detail));
        return;
      }
      const blob = await respuesta.blob();
      const disposition = respuesta.headers.get('Content-Disposition') || '';
      const coincidencia = /filename="([^"]+)"/.exec(disposition);
      const nombre = coincidencia ? coincidencia[1] : `FACTURA-${idReserva}.xml`;
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
      setExito(
        `Factura ${nombre} descargada. Documento SIMULADO en borrador: sin valor fiscal (pendiente de habilitación DIAN).`
      );
    } catch {
      setError('No se pudo descargar la factura. Verifique la conexión con el servidor.');
    } finally {
      setDescargando(false);
    }
  };

  const estadoPago = etiquetaEstadoPago(folio?.estado_pago);
  const totales = folio?.totales || { total: 0, pagado: 0, saldo: 0 };
  const cotizacion = folio?.cotizacion || {};
  const iva = folio?.iva || { base: 0, iva: 0, iva_pct: 19, total: 0 };
  const reserva = folio?.reserva || {};
  const pagos = folio?.pagos || [];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(9, 14, 26, 0.78)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
    >
      <div
        id="pms-folio-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '980px',
          maxHeight: '94vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          margin: 'auto',
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            position: 'sticky',
            top: 0,
            backgroundColor: '#ffffff',
            zIndex: 5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <Receipt size={20} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                Folio de la Reserva #{reserva.id_reserva || idReserva}
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                {reserva.huesped_nombre || '—'} · Apto {reserva.habitacion_numero || '—'} ·{' '}
                {formatoFecha(reserva.fecha_entrada)} → {formatoFecha(reserva.fecha_salida)}
              </span>
              {reserva.observaciones && (
                <div style={{ fontSize: '11.5px', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                  📝 {reserva.observaciones}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                backgroundColor: estadoPago.fondo,
                color: estadoPago.color,
                fontSize: '11px',
                fontWeight: 800,
                border: `1px solid ${estadoPago.color}22`,
              }}
            >
              {estadoPago.texto}
            </span>
            <button
              type="button"
              onClick={onClose}
              title="Cerrar folio"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                border: 'none',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {cargando ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
            Cargando folio…
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            {/* Alertas */}
            {error && (
              <div
                role="alert"
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}
            {exito && (
              <div
                role="status"
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#047857',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                {exito}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* ---------------- Columna izquierda: desglose ---------------- */}
              <div>
                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#64748b',
                      marginBottom: '8px',
                    }}
                  >
                    Desglose de la estadía
                  </div>

                  {filaResumen(
                    `${cotizacion.noches || 0} ${cotizacion.noches === 1 ? 'noche' : 'noches'} × tarifa base`,
                    formatoCOP(cotizacion.subtotal)
                  )}
                  {Number(cotizacion.descuento) > 0 &&
                    filaResumen('Descuento larga estadía', `- ${formatoCOP(cotizacion.descuento)}`, {
                      color: '#047857',
                    })}
                  {filaResumen('Base gravable (IVA incluido)', formatoCOP(iva.base))}
                  {filaResumen(`IVA ${iva.iva_pct}% (ya incluido en la tarifa)`, formatoCOP(iva.iva))}
                  {filaResumen('Total de la reserva', formatoCOP(totales.total), { fuerte: true })}
                </div>

                <div
                  style={{
                    marginTop: '16px',
                    padding: '16px 18px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {filaResumen('Pagado', formatoCOP(totales.pagado), { color: '#047857' })}
                  {filaResumen('Saldo pendiente', formatoCOP(totales.saldo), { fuerte: true, color: '#b91c1c' })}
                </div>

                <button
                  type="button"
                  id="folio-descargar-factura"
                  onClick={descargarFactura}
                  disabled={descargando}
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: descargando ? 'wait' : 'pointer',
                  }}
                >
                  <Download size={16} />
                  {descargando ? 'Generando factura…' : 'Descargar factura XML (simulada)'}
                </button>
                <button
                  type="button"
                  id="folio-ver-hoja-calculo"
                  onClick={() => setVerHojaCalculo(true)}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <FileSpreadsheet size={16} />
                  Ver Folio Oficial / Imprimir (XLSX / PDF)
                </button>
                <button
                  type="button"
                  id="folio-descargar-csv"
                  onClick={descargarCsv}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <FileSpreadsheet size={16} />
                  Exportar folio en CSV
                </button>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>
                  Borrador UBL 2.1 sin valor fiscal — pendiente de habilitación ante la DIAN.
                </div>
              </div>

              {/* ---------------- Columna derecha: movimientos + cobro ---------------- */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#64748b',
                    marginBottom: '8px',
                  }}
                >
                  Movimientos de pago
                </div>

                {pagos.length === 0 ? (
                  <div
                    style={{
                      padding: '18px',
                      borderRadius: '16px',
                      border: '1px dashed #cbd5e1',
                      color: '#64748b',
                      fontSize: '13px',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    Sin cobros registrados todavía.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pagos.map((p) => {
                      const etiqueta = etiquetaEstadoMovimiento(p.estado);
                      return (
                        <div
                          key={p.id_pago}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                              {formatoCOP(p.monto)} · {p.metodo}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                              {formatoFecha(p.creado_en)}
                              {p.referencia ? ` · Ref: ${p.referencia}` : ''}
                              {p.referencia_gateway ? ` · GW: ${p.referencia_gateway}` : ''}
                              {p.creado_por ? ` · ${p.creado_por}` : ''}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <span
                              style={{
                                padding: '3px 9px',
                                borderRadius: '999px',
                                backgroundColor: etiqueta.fondo,
                                color: etiqueta.color,
                                fontSize: '10px',
                                fontWeight: 800,
                              }}
                            >
                              {etiqueta.texto}
                            </span>
                            {esAdmin && p.estado === 'Confirmado' && (
                              <button
                                type="button"
                                onClick={() => anularPago(p.id_pago)}
                                title="Anular este cobro (restaura el saldo)"
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid #fecaca',
                                  backgroundColor: '#fef2f2',
                                  color: '#b91c1c',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Anular
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Formulario de cobro */}
                <form
                  onSubmit={registrarPago}
                  style={{
                    marginTop: '16px',
                    padding: '16px 18px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#64748b',
                      marginBottom: '10px',
                    }}
                  >
                    Registrar cobro
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Monto (COP)
                      <input
                        id="folio-monto"
                        type="number"
                        min="1"
                        step="1"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        placeholder="0"
                        required
                        style={{
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontWeight: 700,
                        }}
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Método
                      <select
                        id="folio-metodo"
                        value={metodo}
                        onChange={(e) => setMetodo(e.target.value)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontWeight: 700,
                          backgroundColor: '#ffffff',
                        }}
                      >
                        {METODOS_PAGO.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#334155',
                      marginTop: '10px',
                    }}
                  >
                    Referencia (opcional)
                    <input
                      id="folio-referencia"
                      type="text"
                      maxLength={80}
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Nro. de operación, terminal, recibo…"
                      style={{
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    />
                  </label>

                  <button
                    type="submit"
                    id="folio-registrar-pago"
                    disabled={guardando || Number(totales.saldo) <= 0}
                    style={{
                      marginTop: '14px',
                      width: '100%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '11px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: Number(totales.saldo) > 0 ? '#0f172a' : '#cbd5e1',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor:
                        guardando || Number(totales.saldo) <= 0 ? 'not-allowed' : 'pointer',
                      opacity: guardando ? 0.7 : 1,
                    }}
                  >
                    <Plus size={16} />
                    {guardando ? 'Procesando…' : 'Registrar cobro'}
                  </button>

                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', fontWeight: 600 }}>
                    Los cobros se procesan con la pasarela activa (modo simulado). El monto no
                    puede superar el saldo pendiente.
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {verHojaCalculo && folio && (
        <HojaCalculoFolio
          folio={folio}
          onClose={() => setVerHojaCalculo(false)}
          onDescargarCsv={descargarCsv}
        />
      )}
    </div>
  );
}
