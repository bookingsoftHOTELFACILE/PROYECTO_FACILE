import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  KeyRound, 
  Radio, 
  FileSpreadsheet, 
  Receipt, 
  Download, 
  Plus, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

/**
 * Modal Folio de Reserva con Cerradura IoT, Fiscalidad DIAN y Pasarela de Cobros
 * Diseño oficial Facile Apartamentos Bogotá
 */
export const ModalFolioReservaIoT = ({ 
  isOpen = true, 
  onClose = () => {},
  folioData = {
    numero: '1218',
    huesped: 'Maritza',
    apartamento: 'Apto D108',
    checkIn: '20/11/2026',
    checkOut: '26/11/2026',
    noches: 6,
    tarifaBaseNoche: 250000,
    totalReserva: 1500000,
    baseGravable: 1260504,
    iva19: 239496,
    pagado: 0,
    saldoPendiente: 1500000,
    rfidTarjeta: 'CARD-D108-3C2B',
    pinTeclado: '049481 #'
  },
  movimientosIniciales = [],
  onRegistrarCobro = null,
  onAnularCobro = null,
  esAdmin = false,
  onDescargarExcel = () => console.log('Descargando Excel Folio...'),
  onVerFacturaDian = () => console.log('Abriendo Factura DIAN...'),
  onDescargarXml = () => console.log('Descargando XML UBL 2.1...'),
  alertaExito = null,
  alertaError = null,
  descargandoXml = false
}) => {
  // Estados para registro de cobros
  const [monto, setMonto] = useState(folioData.saldoPendiente || '');
  const [metodo, setMetodo] = useState('Efectivo');
  const [referencia, setReferencia] = useState('');
  const [movimientos, setMovimientos] = useState(movimientosIniciales);
  const [procesandoCobro, setProcesandoCobro] = useState(false);

  React.useEffect(() => {
    if (movimientosIniciales && movimientosIniciales.length > 0) {
      setMovimientos(movimientosIniciales);
    }
  }, [movimientosIniciales]);

  React.useEffect(() => {
    if (folioData.saldoPendiente != null) {
      setMonto(folioData.saldoPendiente > 0 ? String(folioData.saldoPendiente) : '');
    }
  }, [folioData.saldoPendiente]);

  if (!isOpen) return null;

  // Handler para agregar cobro
  const handleRegistrarCobro = async (e) => {
    e.preventDefault();
    const val = Number(monto);
    if (!val || val <= 0) return;

    if (onRegistrarCobro) {
      setProcesandoCobro(true);
      await onRegistrarCobro({ monto: val, metodo, referencia: referencia.trim() });
      setReferencia('');
      setProcesandoCobro(false);
      return;
    }

    setProcesandoCobro(true);
    setTimeout(() => {
      const nuevoMovimiento = {
        id: Date.now(),
        fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        monto: val,
        metodo,
        referencia: referencia || 'Pago en recepción',
        estado: 'Confirmado'
      };
      setMovimientos([nuevoMovimiento, ...movimientos]);
      setReferencia('');
      setProcesandoCobro(false);
    }, 400);
  };

  // Formato de moneda colombiana COP
  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const estadoSaldo = folioData.saldoPendiente <= 0 && folioData.pagado > 0
    ? { texto: 'Pagado', fondo: 'bg-emerald-50', textoColor: 'text-emerald-600', borde: 'border-emerald-200/80', dot: 'bg-emerald-500' }
    : folioData.pagado > 0
      ? { texto: 'Parcial', fondo: 'bg-amber-50', textoColor: 'text-amber-600', borde: 'border-amber-200/80', dot: 'bg-amber-500' }
      : { texto: 'Pendiente', fondo: 'bg-rose-50', textoColor: 'text-rose-600', borde: 'border-rose-200/80', dot: 'bg-rose-500 animate-pulse' };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Contenedor Modal */}
      <div 
        id="pms-folio-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* 1. Cabecera del Modal */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Folio de la Reserva #{folioData.numero}
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${estadoSaldo.fondo} ${estadoSaldo.textoColor} border ${estadoSaldo.borde}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${estadoSaldo.dot}`}></span>
                  {estadoSaldo.texto}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700 capitalize">{folioData.huesped}</span> • {folioData.apartamento} • {folioData.checkIn} &rarr; {folioData.checkOut}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alertas */}
        {alertaError && (
          <div className="mx-8 mt-4 p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
            {alertaError}
          </div>
        )}
        {alertaExito && (
          <div className="mx-8 mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            {alertaExito}
          </div>
        )}

        {/* 2. Cuerpo en 2 Columnas */}
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
                  <span>{folioData.noches} noches × tarifa base</span>
                  <span className="font-bold text-slate-900">{formatCOP(folioData.totalReserva)}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Base gravable (IVA incluido)</span>
                  <span className="font-medium text-slate-700">{formatCOP(folioData.baseGravable)}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">IVA 19% (ya incluido en la tarifa)</span>
                  <span className="font-medium text-slate-700">{formatCOP(folioData.iva19)}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Total de la reserva</span>
                  <span>{formatCOP(folioData.totalReserva)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 text-xs">
                  <span className="text-slate-500 font-medium">Pagado</span>
                  <span className="font-bold text-emerald-600">{formatCOP(folioData.pagado)}</span>
                </div>

                <div className="flex justify-between items-center pt-1 text-sm font-black">
                  <span className="text-slate-800">Saldo pendiente</span>
                  <span className="text-base text-rose-600">{formatCOP(folioData.saldoPendiente)}</span>
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
                    {folioData.rfidTarjeta}
                  </span>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block mb-1 font-medium">Código PIN Teclado:</span>
                  <span className="font-mono font-bold text-white text-xs tracking-widest bg-slate-900/90 px-2 py-0.5 rounded">
                    {folioData.pinTeclado}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de Exportación Oficial */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                id="folio-descargar-excel"
                onClick={onDescargarExcel}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Descargar Folio Oficial (.xlsx)</span>
              </button>

              <button
                type="button"
                id="folio-ver-factura-dian"
                onClick={onVerFacturaDian}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-rose-500" />
                <span>Ver Factura Electrónica DIAN (FEV / PDF)</span>
              </button>

              <button
                type="button"
                id="folio-descargar-xml"
                disabled={descargandoXml}
                onClick={onDescargarXml}
                className="text-center text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 pt-1 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{descargandoXml ? 'Descargando XML...' : 'Descargar Factura XML (UBL 2.1)'}</span>
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

              {movimientos.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl py-6 px-4 text-center">
                  <p className="text-xs text-slate-400 font-medium">
                    Sin cobros registrados todavía.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {movimientos.map((item) => (
                    <div 
                      key={item.id || item.id_pago} 
                      className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {item.metodo} ({formatCOP(item.monto)})
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {item.referencia || 'Pago en recepción'} • {item.fecha || (item.creado_en ? new Date(item.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hoy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {item.estado === 'Confirmado' ? 'Aplicado' : (item.estado || 'Aplicado')}
                        </span>
                        {esAdmin && onAnularCobro && (item.id_pago || item.id) && (
                          <button
                            type="button"
                            onClick={() => onAnularCobro(item.id_pago || item.id)}
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
            <form onSubmit={handleRegistrarCobro} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4">
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
                    placeholder={String(folioData.saldoPendiente || '')}
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
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta de crédito">Tarjeta (Datáfono)</option>
                    <option value="Transferencia">Transferencia Bancolombia</option>
                    <option value="PSE">Wompi / PSE</option>
                    <option value="Nequi">Nequi</option>
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
                disabled={procesandoCobro || folioData.saldoPendiente <= 0}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                <span>{procesandoCobro ? 'Registrando...' : 'Registrar cobro'}</span>
              </button>

              <p className="text-[10px] text-slate-400 leading-tight">
                Los cobros se procesan con la pasarela activa (modo simulado). El monto no puede superar el saldo pendiente.
              </p>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ModalFolioReservaIoT;
