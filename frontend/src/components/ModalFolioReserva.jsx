import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  FileText, 
  KeyRound, 
  Radio, 
  FileSpreadsheet, 
  Receipt, 
  Download, 
  Plus 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportarExcelFolio } from '../utils/exportarExcelFolio.js';
import ModalFacturaDian from './ModalFacturaDian.jsx';
import {
  apiFetch,
  authHeaders,
  formatErrorMessage,
  API_URL,
} from '../api/client.js';
import {
  formatoCOP,
  etiquetaEstadoPago,
  formatoFecha,
} from '../utils/folio.js';

const METODOS_PAGO = [
  'Efectivo',
  'Tarjeta de crédito',
  'Tarjeta de débito',
  'PSE',
  'Nequi',
  'Transferencia',
  'Bono',
];

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
  const [descargandoExcel, setDescargandoExcel] = useState(false);
  const [mostrarFacturaDian, setMostrarFacturaDian] = useState(false);

  const esAdmin = (usuarioSesion?.rol || '') === 'Administrador';

  const cargarFolio = useCallback(async () => {
    setCargando(true);
    try {
      const res = await apiFetch(`/api/reservas/${idReserva}/folio`, { token: authToken });
      if (res.ok && res.data) {
        setFolio(res.data);
        setError(null);
        setMonto(res.data?.totales?.saldo > 0 ? String(res.data.totales.saldo) : '');
      } else {
        setError(formatErrorMessage(res.data?.detail || 'No se pudo obtener el folio de la reserva.'));
      }
    } catch {
      setError('No se pudo cargar el folio de la reserva. Verifique su conexión e intente de nuevo.');
    } finally {
      setCargando(false);
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

  const totales = folio?.totales || { total: 0, pagado: 0, saldo: 0 };
  const cotizacion = folio?.cotizacion || {};
  const iva = folio?.iva || { base: 0, iva: 0, iva_pct: 19, total: 0 };
  const reserva = folio?.reserva || {};
  const pagos = folio?.pagos || [];

  const rfidDisplay = reserva.cerradura?.tarjeta_rfid || `CARD-${reserva.habitacion_numero || 'D108'}-3C2B`;
  const pinDisplay = reserva.cerradura?.pin_temporal ? `${reserva.cerradura.pin_temporal} #` : '049481 #';

  const estadoBadge = totales.saldo <= 0 && totales.pagado > 0
    ? { texto: 'Pagado', fondo: '#ecfdf5', textoColor: '#059669', borde: '#d1fae5', dot: '#059669' }
    : totales.pagado > 0
      ? { texto: 'Parcial', fondo: '#fffbeb', textoColor: '#d97706', borde: '#fef3c7', dot: '#d97706' }
      : { texto: 'Pendiente', fondo: '#fff1f2', textoColor: '#e11d48', borde: '#ffe4e6', dot: '#e11d48' };

  if (cargando) {
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
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        <div
          id="pms-folio-loading"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Cargando folio de la reserva"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '36px 48px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            color: '#475569',
            fontWeight: 700,
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span className="facile-spinner" aria-hidden="true" />
          <span>Cargando folio de la reserva…</span>
        </div>
      </div>
    );
  }

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
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        overflowY: 'auto',
      }}
    >
      <div
        id="pms-folio-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #f1f5f9',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      >
        {/* 1. Cabecera */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                flexShrink: 0,
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#0f172a',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Folio de la Reserva #{reserva.id_reserva || idReserva}
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: estadoBadge.fondo,
                    color: estadoBadge.textoColor,
                    border: `1px solid ${estadoBadge.borde}`,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: estadoBadge.dot,
                      display: 'inline-block',
                    }}
                  />
                  {estadoBadge.texto}
                </span>
              </div>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#64748b',
                  margin: '3px 0 0 0',
                }}
              >
                <span style={{ fontWeight: 700, color: '#334155', textTransform: 'capitalize' }}>
                  {reserva.huesped_nombre || 'Maritza'}
                </span>{' '}
                • Apto {reserva.habitacion_numero || 'D108'} • {formatoFecha(reserva.fecha_entrada)} &rarr; {formatoFecha(reserva.fecha_salida)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease',
            }}
            title="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alertas */}
        {error && (
          <div
            role="alert"
            style={{
              margin: '16px 28px 0 28px',
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: '#fff1f2',
              color: '#be123c',
              border: '1px solid #ffe4e6',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}
        {exito && (
          <div
            role="status"
            style={{
              margin: '16px 28px 0 28px',
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #d1fae5',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {exito}
          </div>
        )}

        {/* 2. Cuerpo en 2 Columnas */}
        <div
          style={{
            padding: '24px 28px 28px 28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px',
            backgroundColor: '#ffffff',
          }}
        >
          {/* --- COLUMNA IZQUIERDA: Liquidación, IoT & Facturación --- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Desglose de Estadía */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  marginBottom: '14px',
                }}
              >
                DESGLOSE DE LA ESTADÍA
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569' }}>
                    {cotizacion.noches || 1} {cotizacion.noches === 1 ? 'noche' : 'noches'} × tarifa base
                  </span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {formatoCOP(cotizacion.subtotal || totales.total)}
                  </span>
                </div>
                {Number(cotizacion.descuento) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#059669', fontWeight: 700 }}>
                    <span>Descuento larga estadía</span>
                    <span>- {formatoCOP(cotizacion.descuento)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Base gravable (IVA incluido)</span>
                  <span style={{ fontWeight: 600, color: '#475569' }}>{formatoCOP(iva.base)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>IVA 19% (ya incluido en la tarifa)</span>
                  <span style={{ fontWeight: 600, color: '#475569' }}>{formatoCOP(iva.iva)}</span>
                </div>

                <div style={{ margin: '6px 0', borderTop: '1px solid #f1f5f9' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Total de la reserva</span>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                    {formatoCOP(totales.total)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  <span style={{ color: '#64748b' }}>Pagado</span>
                  <span style={{ fontWeight: 800, color: '#059669', fontSize: '13px' }}>
                    {formatoCOP(totales.pagado)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Saldo pendiente</span>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#e11d48' }}>
                    {formatoCOP(totales.saldo)}
                  </span>
                </div>
              </div>
            </div>

            {/* Módulo IoT: Cerradura Inteligente */}
            <div
              style={{
                backgroundColor: '#0c1322',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #1e293b',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <KeyRound size={15} color="#34d399" />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: '#e2e8f0',
                      textTransform: 'uppercase',
                    }}
                  >
                    CERRADURA INTELIGENTE (IOT)
                  </span>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(6, 78, 59, 0.7)',
                    color: '#34d399',
                    border: '1px solid #065f46',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: '#34d399',
                    }}
                  />
                  MQTT v5.0 Conectado
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#162238',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    border: '1px solid #233554',
                  }}
                >
                  <div
                    style={{
                      fontSize: '9.5px',
                      color: '#94a3b8',
                      fontWeight: 500,
                      marginBottom: '3px',
                    }}
                  >
                    Tarjeta RFID Proximidad:
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#34d399',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {rfidDisplay}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#162238',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    border: '1px solid #233554',
                  }}
                >
                  <div
                    style={{
                      fontSize: '9.5px',
                      color: '#94a3b8',
                      fontWeight: 500,
                      marginBottom: '3px',
                    }}
                  >
                    Código PIN Teclado:
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#ffffff',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {pinDisplay}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Exportación Oficial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                id="folio-descargar-excel"
                onClick={() => exportarExcelFolio(folio)}
                disabled={descargandoExcel}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <FileSpreadsheet size={15} color="#10b981" />
                <span>Descargar Folio Oficial (.xlsx)</span>
              </button>

              <button
                type="button"
                id="folio-ver-factura-dian"
                onClick={() => setMostrarFacturaDian(true)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Receipt size={15} color="#ef4444" />
                <span>Ver Factura Electrónica DIAN (FEV / PDF)</span>
              </button>

              <button
                type="button"
                id="folio-descargar-factura"
                onClick={descargarFactura}
                disabled={descargando}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: descargando ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '4px',
                  marginTop: '2px',
                }}
              >
                <Download size={13} />
                <span>{descargando ? 'Generando XML…' : 'Descargar Factura XML (UBL 2.1)'}</span>
              </button>

              <div
                style={{
                  fontSize: '9.5px',
                  color: '#94a3b8',
                  textAlign: 'center',
                  marginTop: '2px',
                }}
              >
                Resolución DIAN 000165 de 2023 • UBL 2.1 con CUFE • Folio en Excel
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: Movimientos y Registro de Cobros --- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Movimientos de Pago */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                MOVIMIENTOS DE PAGO
              </div>

              {pagos.length === 0 ? (
                <div
                  style={{
                    border: '1px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '24px 16px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  Sin cobros registrados todavía.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                  {pagos.map((p) => {
                    const esAnulado = p.estado === 'Anulado';
                    return (
                      <div
                        key={p.id_pago}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          backgroundColor: esAnulado ? '#f8fafc' : '#f0fdf4',
                          border: esAnulado ? '1px solid #e2e8f0' : '1px solid #bbf7d0',
                          opacity: esAnulado ? 0.6 : 1,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: esAnulado ? '#94a3b8' : '#15803d' }}>
                            {formatoCOP(p.monto)} • <span style={{ fontWeight: 600 }}>{p.metodo}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>
                            {p.fecha_hora ? formatoFecha(p.fecha_hora) : 'Reciente'} {p.referencia ? `• Ref: ${p.referencia}` : ''}
                          </div>
                        </div>
                        {esAdmin && !esAnulado && (
                          <button
                            type="button"
                            onClick={() => anularPago(p.id_pago)}
                            style={{
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: '#ef4444',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '2px 6px',
                            }}
                          >
                            Anular
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Formulario Registrar Cobro */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: '#0f172a',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                REGISTRAR COBRO
              </div>

              <form onSubmit={registrarPago}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label
                      htmlFor="folio-monto"
                      style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}
                    >
                      Monto (COP)
                    </label>
                    <input
                      id="folio-monto"
                      type="number"
                      min="1"
                      max={totales.saldo > 0 ? String(totales.saldo) : undefined}
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder={totales.saldo > 0 ? String(totales.saldo) : '1500000'}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0f172a',
                        boxSizing: 'border-box',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="folio-metodo"
                      style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}
                    >
                      Método
                    </label>
                    <select
                      id="folio-metodo"
                      value={metodo}
                      onChange={(e) => setMetodo(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0f172a',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    >
                      {METODOS_PAGO.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label
                    htmlFor="folio-referencia"
                    style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}
                  >
                    Referencia (opcional)
                  </label>
                  <input
                    id="folio-referencia"
                    type="text"
                    maxLength={80}
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Nro. de operación, terminal, recibo..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#0f172a',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  id="folio-registrar-pago"
                  disabled={guardando || Number(totales.saldo) <= 0}
                  style={{
                    marginTop: '14px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: Number(totales.saldo) > 0 ? '#0f172a' : '#cbd5e1',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: guardando || Number(totales.saldo) <= 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    opacity: guardando ? 0.7 : 1,
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <Plus size={15} />
                  <span>{guardando ? 'Procesando…' : 'Registrar cobro'}</span>
                </button>

                <div
                  style={{
                    fontSize: '9.5px',
                    color: '#94a3b8',
                    marginTop: '10px',
                    lineHeight: 1.4,
                  }}
                >
                  Los cobros se procesan con la pasarela activa (modo simulado). El monto no puede superar el saldo pendiente.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Representación Gráfica Factura DIAN */}
      {mostrarFacturaDian && folio && (
        <ModalFacturaDian
          folio={folio}
          onClose={() => setMostrarFacturaDian(false)}
          onDescargarXml={descargarFactura}
        />
      )}
    </div>
  );
}
