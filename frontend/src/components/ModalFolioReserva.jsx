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
  const estadoPago = etiquetaEstadoPago(folio?.estado_pago);

  const rfidDisplay = reserva.cerradura?.tarjeta_rfid || `CARD-${reserva.habitacion_numero || 'D108'}-3C2B`;
  const pinDisplay = reserva.cerradura?.pin_temporal ? `${reserva.cerradura.pin_temporal} #` : '049481 #';

  const estadoBadge = totales.saldo <= 0 && totales.pagado > 0
    ? { texto: 'Pagado', fondo: 'bg-emerald-50', textoColor: 'text-emerald-600', borde: 'border-emerald-200/80', dot: 'bg-emerald-500' }
    : totales.pagado > 0
      ? { texto: 'Parcial', fondo: 'bg-amber-50', textoColor: 'text-amber-600', borde: 'border-amber-200/80', dot: 'bg-amber-500' }
      : { texto: 'Pendiente', fondo: 'bg-rose-50', textoColor: 'text-rose-600', borde: 'border-rose-200/80', dot: 'bg-rose-500 animate-pulse' };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    >
      <div
        id="pms-folio-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* 1. Cabecera */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Folio de la Reserva #{reserva.id_reserva || idReserva}
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${estadoBadge.fondo} ${estadoBadge.textoColor} border ${estadoBadge.borde}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${estadoBadge.dot}`}></span>
                  {estadoBadge.texto}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700 capitalize">{reserva.huesped_nombre || 'Maritza'}</span> • Apto {reserva.habitacion_numero || 'D108'} • {formatoFecha(reserva.fecha_entrada)} &rarr; {formatoFecha(reserva.fecha_salida)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alertas */}
        {error && (
          <div role="alert" className="mx-8 mt-4 p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
            {error}
          </div>
        )}
        {exito && (
          <div role="status" className="mx-8 mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            {exito}
          </div>
        )}

        {/* 2. Cuerpo en 2 Columnas */}
        {cargando ? (
          <div className="p-16 text-center text-slate-500 font-bold text-sm">
            Cargando folio de la reserva…
          </div>
        ) : (
          <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/40">
            
            {/* --- COLUMNA IZQUIERDA: Liquidación, IoT & Facturación --- */}
            <div className="flex flex-col gap-5">
              
              {/* Tarjeta Desglose de Estadía */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
                  Desglose de la Estadía
                </h3>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center py-0.5">
                    <span>{cotizacion.noches || 0} {cotizacion.noches === 1 ? 'noche' : 'noches'} × tarifa base</span>
                    <span className="font-bold text-slate-900">{formatoCOP(cotizacion.subtotal || totales.total)}</span>
                  </div>
                  {Number(cotizacion.descuento) > 0 && (
                    <div className="flex justify-between items-center py-0.5 text-emerald-600 font-bold">
                      <span>Descuento larga estadía</span>
                      <span>- {formatoCOP(cotizacion.descuento)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Base gravable (IVA incluido)</span>
                    <span className="font-medium text-slate-700">{formatoCOP(iva.base)}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">IVA {iva.iva_pct}% (ya incluido en la tarifa)</span>
                    <span className="font-medium text-slate-700">{formatoCOP(iva.iva)}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                    <span>Total de la reserva</span>
                    <span>{formatoCOP(totales.total)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-xs">
                    <span className="text-slate-500 font-medium">Pagado</span>
                    <span className="font-bold text-emerald-600">{formatoCOP(totales.pagado)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-sm font-black">
                    <span className="text-slate-800">Saldo pendiente</span>
                    <span className={`text-base ${totales.saldo > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatoCOP(totales.saldo)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Módulo IoT: Cerradura Inteligente */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black tracking-wide uppercase text-slate-200">
                      Cerradura Inteligente (IoT)
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    MQTT v5.0 Conectado
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block mb-1 font-medium">Tarjeta RFID Proximidad:</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs tracking-wider">
                      {rfidDisplay}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block mb-1 font-medium">Código PIN Teclado:</span>
                    <span className="font-mono font-bold text-white text-xs tracking-widest bg-slate-900/90 px-2 py-0.5 rounded">
                      {pinDisplay}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Exportación Oficial */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  id="folio-descargar-excel"
                  onClick={async () => {
                    if (!folio) return;
                    try {
                      setDescargandoExcel(true);
                      setError(null);
                      await exportarExcelFolio(folio);
                      setExito('Folio oficial descargado en Excel (.xlsx) exitosamente.');
                    } catch (e) {
                      console.error('Error al exportar Excel:', e);
                      setError('No se pudo generar el archivo Excel.');
                    } finally {
                      setDescargandoExcel(false);
                    }
                  }}
                  disabled={descargandoExcel}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>{descargandoExcel ? 'Generando Excel…' : 'Descargar Folio Oficial (.xlsx)'}</span>
                </button>

                <button
                  type="button"
                  id="folio-ver-factura-dian"
                  onClick={() => setMostrarFacturaDian(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-rose-500" />
                  <span>Ver Factura Electrónica DIAN (FEV / PDF)</span>
                </button>

                <button
                  type="button"
                  id="folio-descargar-xml"
                  disabled={descargando}
                  onClick={descargarFactura}
                  className="text-center text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 pt-1 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{descargando ? 'Descargando XML…' : 'Descargar Factura XML (UBL 2.1)'}</span>
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-400">
                Resolución DIAN 000165 de 2023 • UBL 2.1 con CUFE • Folio en Excel
              </p>
            </div>

            {/* --- COLUMNA DERECHA: Movimientos y Registro de Cobros --- */}
            <div className="flex flex-col gap-5">
              
              {/* Movimientos de Pago */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                  Movimientos de Pago
                </h3>

                {pagos.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl py-6 px-4 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                      Sin cobros registrados todavía.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {pagos.map((p) => (
                      <div
                        key={p.id_pago}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {p.metodo} ({formatoCOP(p.monto)})
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {p.referencia || 'Pago en recepción'} • {p.creado_en ? new Date(p.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hoy'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            {p.estado === 'Confirmado' ? 'Aplicado' : p.estado}
                          </span>
                          {esAdmin && p.estado === 'Confirmado' && (
                            <button
                              type="button"
                              onClick={() => anularPago(p.id_pago)}
                              className="text-[10px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                              title="Anular pago"
                            >
                              Anular
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formulario Registrar Cobro */}
              <form onSubmit={registrarPago} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Registrar Cobro
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Monto */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Monto (COP)
                    </label>
                    <input
                      type="number"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                      placeholder={totales.saldo > 0 ? String(totales.saldo) : '0'}
                      required
                    />
                  </div>

                  {/* Método */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Método
                    </label>
                    <select
                      value={metodo}
                      onChange={(e) => setMetodo(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all cursor-pointer"
                    >
                      {METODOS_PAGO.map((m) => (
                        <option key={m} value={m}>
                          {m === 'Tarjeta de crédito' ? 'Tarjeta (Datáfono)' : m === 'Transferencia' ? 'Transferencia Bancolombia' : m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Referencia */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Referencia <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                    placeholder="Nro. de operación, terminal, recibo..."
                  />
                </div>

                {/* Botón Registrar Cobro */}
                <button
                  type="submit"
                  disabled={guardando || totales.saldo <= 0}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  <span>{guardando ? 'Registrando...' : 'Registrar cobro'}</span>
                </button>

                <p className="text-[10px] text-slate-400 leading-tight">
                  Los cobros se procesan con la pasarela activa (modo simulado). El monto no puede superar el saldo pendiente.
                </p>
              </form>

            </div>

          </div>
        )}
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
