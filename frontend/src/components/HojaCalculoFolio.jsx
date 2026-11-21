import React from 'react';
import { Printer, Download, X, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { formatoCOP } from '../utils/folio.js';

export default function HojaCalculoFolio({ folio, onClose, onDescargarCsv }) {
  if (!folio) return null;

  const reserva = folio.reserva || {};
  const cotizacion = folio.cotizacion || {};
  const iva = folio.iva || {};
  const totales = folio.totales || {};
  const pagos = Array.isArray(folio.pagos) ? folio.pagos : [];

  const idReserva = reserva.id_reserva || '';
  const numApto = reserva.habitacion_numero || 'D102';
  const tipoApto = reserva.habitacion_tipo ? `${reserva.habitacion_tipo} Ejecutivo` : 'Dúplex Ejecutivo 2 Niveles';
  const noches = cotizacion.noches || 0;
  const precioNoche = Number(reserva.precio_noche || (noches > 0 ? (cotizacion.subtotal || 0) / noches : 250000));
  const descPct = noches >= 15 ? '15%' : (noches >= 7 ? '10%' : '0%');
  const descuentoVal = Number(cotizacion.descuento || 0);

  const handlePrint = () => {
    window.print();
  };

  const estadoBadgeClass = reserva.estado === 'Check-In'
    ? 'bg-purple-100 text-purple-800 border-purple-200'
    : reserva.estado === 'Completada'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  const estadoBadgeTexto = reserva.estado === 'Check-In'
    ? 'Check-In Activo'
    : reserva.estado || 'Confirmada';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-300 flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">

        {/* 1. BARRA SUPERIOR DE ACCIONES (SE OCULTA AL IMPRIMIR) */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white rounded-t-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Volver al cobro rápido"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  VISTA PREVIA DE EXPORTACIÓN XLSX / PDF
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-800 text-slate-300 border border-slate-700">
                  Folio #{idReserva}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                Hoja de Cálculo: Folio Oficial de Reserva — Apto {numApto}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
            >
              <Printer size={15} />
              Imprimir
            </button>
            <button
              type="button"
              onClick={onDescargarCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d91a2a] hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Download size={15} />
              Descargar XLSX / CSV
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. BARRA DE COORDENADAS / FÓRMULA DE HOJA DE CÁLCULO (EXACTA A IMAGEN) */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-300 flex items-center gap-3 text-xs text-slate-600 print:hidden font-mono">
          <span className="px-2 py-0.5 rounded bg-white border border-slate-300 font-bold text-slate-800 shadow-2xs">
            A1:F28
          </span>
          <span className="font-serif italic font-bold text-slate-500">
            fx
          </span>
          <div className="flex-1 bg-white px-2.5 py-1 rounded border border-slate-300 text-[11px] text-slate-700 truncate shadow-2xs">
            ="FACILE APARTAMENTOS BOGOTÁ — FOLIO OFICIAL DE RESERVA #{idReserva}"
          </div>
          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500 font-sans font-medium">
            <span>Escala: 100%</span>
            <span>•</span>
            <span>Moneda: COP ($)</span>
          </div>
        </div>

        {/* 3. CONTENEDOR DE LA CUADRÍCULA DE HOJA DE CÁLCULO */}
        <div className="flex-1 overflow-auto bg-slate-50 p-2 sm:p-6 print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden font-sans max-w-5xl mx-auto print:border-none print:shadow-none print:max-w-none">
            
            {/* ENCABEZADOS DE COLUMNA DE LA HOJA (A, B, C, D, E, F) */}
            <div className="grid grid-cols-[36px_repeat(6,1fr)] bg-slate-200 border-b border-slate-300 text-[11px] font-mono font-bold text-slate-600 text-center select-none print:hidden">
              <div className="py-1 border-r border-slate-300 bg-slate-300/60"></div>
              <div className="py-1 border-r border-slate-300">A</div>
              <div className="py-1 border-r border-slate-300">B</div>
              <div className="py-1 border-r border-slate-300">C</div>
              <div className="py-1 border-r border-slate-300">D</div>
              <div className="py-1 border-r border-slate-300">E</div>
              <div className="py-1">F</div>
            </div>

            {/* TABLA PRINCIPAL QUE SIMULA LA HOJA DE CÁLCULO */}
            <div className="text-xs text-slate-800">

              {/* FILA 1: BANNER CORPORATIVO PRINCIPAL */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-900 bg-slate-950 text-white">
                <div className="py-3 bg-slate-900 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-800 select-none print:hidden">
                  1
                </div>
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-4 border-[#d91a2a]">
                  <div>
                    <h1 className="text-base sm:text-lg font-black tracking-wide text-white uppercase">
                      FACILE APARTAMENTOS BOGOTÁ — FOLIO OFICIAL DE RESERVA #{idReserva}
                    </h1>
                  </div>
                  <div className="shrink-0">
                    <span className="px-3 py-1 rounded-md bg-[#d91a2a] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                      DOCUMENTO OFICIAL
                    </span>
                  </div>
                </div>
              </div>

              {/* FILA 2: SUBTÍTULO RADICADO DIAN Y SEDE */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-300 bg-slate-900 text-slate-300 text-[11px]">
                <div className="py-2 bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-700 select-none print:hidden">
                  2
                </div>
                <div className="px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>Sistema de Gestión Hotelera (PMS) • Radicado DIAN / SIRE</span>
                  <span className="text-slate-400">Sede Chicó • Calle 93 #12-40, Bogotá D.C.</span>
                </div>
              </div>

              {/* FILA 3: SEPARADOR VACÍO */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-200 bg-white">
                <div className="py-1 bg-slate-100 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-300 select-none print:hidden">
                  3
                </div>
                <div className="h-2"></div>
              </div>

              {/* FILA 4: ENCABEZADOS DE SECCIÓN INFO Y ALOJAMIENTO */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-300 bg-slate-100">
                <div className="py-2 bg-slate-200 text-slate-500 font-mono text-[10px] flex items-center justify-center border-r border-slate-300 select-none print:hidden">
                  4
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300">
                  <div className="px-4 py-2 font-black text-slate-700 text-[11px] uppercase tracking-wider">
                    INFORMACIÓN DE LA RESERVA
                  </div>
                  <div className="px-4 py-2 font-black text-slate-700 text-[11px] uppercase tracking-wider">
                    DETALLE DEL ALOJAMIENTO
                  </div>
                </div>
              </div>

              {/* FILAS 5-9: DATOS DE RESERVA Y ALOJAMIENTO */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-200">
                <div className="bg-slate-100 text-slate-400 font-mono text-[10px] flex flex-col divide-y divide-slate-200 border-r border-slate-300 select-none print:hidden">
                  <span className="py-2 text-center">5</span>
                  <span className="py-2 text-center">6</span>
                  <span className="py-2 text-center">7</span>
                  <span className="py-2 text-center">8</span>
                  <span className="py-2 text-center">9</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                  {/* Columna Izquierda (Cols A-C) */}
                  <div className="divide-y divide-slate-100">
                    <div className="px-4 py-2 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Folio Nro:</span>
                      <span className="font-extrabold text-slate-900">#{idReserva}</span>
                    </div>
                    <div className="px-4 py-2 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Huésped Titular:</span>
                      <span className="font-bold text-slate-900">{reserva.huesped_nombre || 'N/A'}</span>
                    </div>
                    <div className="px-4 py-2 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Documento:</span>
                      <span className="font-semibold text-slate-700">C.C. {reserva.huesped_documento || 'N/A'}</span>
                    </div>
                    <div className="px-4 py-2 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Estado:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${estadoBadgeClass}`}>
                        • {estadoBadgeTexto}
                      </span>
                    </div>
                    <div className="px-4 py-2 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Plazo de Estadía:</span>
                      <span className="font-extrabold text-slate-900">{noches} Noches</span>
                    </div>
                  </div>

                  {/* Columna Derecha (Cols D-F) */}
                  <div className="divide-y divide-slate-100">
                    <div className="px-4 py-2 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Apartamento:</span>
                      <span className="font-black text-[#d91a2a]">Apto {numApto}</span>
                    </div>
                    <div className="px-4 py-2 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Tipo de Unidad:</span>
                      <span className="font-semibold text-slate-700">{tipoApto}</span>
                    </div>
                    <div className="px-4 py-2 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Fecha de Llegada:</span>
                      <span className="font-semibold text-slate-700">{reserva.fecha_entrada || 'N/A'} (15:00 COT)</span>
                    </div>
                    <div className="px-4 py-2 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Fecha de Salida:</span>
                      <span className="font-semibold text-slate-700">{reserva.fecha_salida || 'N/A'} (11:00 COT)</span>
                    </div>
                    <div className="px-4 py-2 flex justify-between items-center bg-slate-50/50">
                      <span className="text-slate-400 text-[11px]">Tarifa estándar por noche:</span>
                      <span className="font-semibold text-slate-600 text-[11px]">{formatoCOP(precioNoche)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FILA 10: SEPARADOR VACÍO */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-200 bg-white">
                <div className="py-1 bg-slate-100 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-300 select-none print:hidden">
                  10
                </div>
                <div className="h-2"></div>
              </div>

              {/* FILA 11: SECCIÓN LIQUIDACIÓN DE ESTADÍA Y BASE TRIBUTARIA */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-800 bg-slate-900 text-white">
                <div className="py-1.5 bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-700 select-none print:hidden">
                  11
                </div>
                <div className="px-4 py-1.5 font-black text-[11px] uppercase tracking-wider">
                  LIQUIDACIÓN DE ESTADÍA Y BASE TRIBUTARIA
                </div>
              </div>

              {/* FILA 12: ENCABEZADOS DE LA TABLA DE CONCEPTOS */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-300 bg-slate-800 text-slate-200 text-[10px] font-extrabold uppercase">
                <div className="py-2 bg-slate-700 text-slate-400 font-mono flex items-center justify-center border-r border-slate-600 select-none print:hidden">
                  12
                </div>
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-2">
                  <div>CONCEPTO / DESCRIPCIÓN</div>
                  <div className="text-center">CANTIDAD</div>
                  <div className="text-right">VALOR UNITARIO</div>
                  <div className="text-right">VALOR TOTAL (COP)</div>
                </div>
              </div>

              {/* FILA 13: ITEM ESTADÍA */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-200 bg-white">
                <div className="py-2.5 bg-slate-100 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-300 select-none print:hidden">
                  13
                </div>
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-2.5 items-center">
                  <div className="font-bold text-slate-900">Estadía en Apto {numApto}</div>
                  <div className="text-center text-slate-600">{noches} noches</div>
                  <div className="text-right text-slate-600">{formatoCOP(precioNoche)}</div>
                  <div className="text-right font-black text-slate-900">{formatoCOP(cotizacion.subtotal || 0)}</div>
                </div>
              </div>

              {/* FILA 14: ITEM DESCUENTO LARGA ESTADÍA */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-200 bg-slate-50/50">
                <div className="py-2.5 bg-slate-100 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-300 select-none print:hidden">
                  14
                </div>
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-2.5 items-center">
                  <div className="font-semibold text-emerald-800">
                    Descuento Larga Estadía {noches >= 7 ? '(Beneficio aplicada por política)' : '(Sin beneficio)'}
                  </div>
                  <div className="text-center text-emerald-700 font-bold">{descPct}</div>
                  <div className="text-right text-emerald-700 font-bold">-{descPct}</div>
                  <div className="text-right font-black text-emerald-700">
                    {descuentoVal > 0 ? `-${formatoCOP(descuentoVal)}` : '$0'}
                  </div>
                </div>
              </div>

              {/* FILA 15: SEPARADOR VACÍO */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-200 bg-white">
                <div className="py-1 bg-slate-100 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-300 select-none print:hidden">
                  15
                </div>
                <div className="h-2"></div>
              </div>

              {/* FILA 16: ENCABEZADOS SUBSECCIÓN DESGLOSE FISCAL & BALANCE */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-300 bg-slate-100">
                <div className="py-2 bg-slate-200 text-slate-500 font-mono text-[10px] flex items-center justify-center border-r border-slate-300 select-none print:hidden">
                  16
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300">
                  <div className="px-4 py-2 font-black text-slate-700 text-[11px] uppercase tracking-wider">
                    DESGLOSE FISCAL (ART. 468 ET)
                  </div>
                  <div className="px-4 py-2 font-black text-slate-700 text-[11px] uppercase tracking-wider">
                    BALANCE Y ESTADO DE CUENTA
                  </div>
                </div>
              </div>

              {/* FILAS 17-20: CÁLCULOS TRIBUTARIOS Y TOTALES */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-200">
                <div className="bg-slate-100 text-slate-400 font-mono text-[10px] flex flex-col divide-y divide-slate-200 border-r border-slate-300 select-none print:hidden">
                  <span className="py-2.5 text-center">17</span>
                  <span className="py-2.5 text-center">18</span>
                  <span className="py-2.5 text-center">19</span>
                  <span className="py-2.5 text-center">20</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                  {/* Desglose Fiscal (A-C) */}
                  <div className="divide-y divide-slate-100">
                    <div className="px-4 py-2.5 flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Base Gravable (IVA incluido):</span>
                      <span className="font-extrabold text-slate-900">{formatoCOP(iva.base || 0)}</span>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between items-center">
                      <span className="text-slate-600 font-medium">IVA Hotelero Generado ({iva.iva_pct || 19}%):</span>
                      <span className="font-extrabold text-slate-900">{formatoCOP(iva.iva || 0)}</span>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between items-center text-[11px] text-slate-500 italic">
                      <span>Régimen Común • Facturación Electrónica DIAN</span>
                      <span className="font-semibold text-slate-600">Tarifa Legal 19%</span>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between items-center text-[11px] text-slate-400">
                      <span>Estándar UBL 2.1</span>
                      <span className="font-mono">COP</span>
                    </div>
                  </div>

                  {/* Balance y Estado de Cuenta (D-F) */}
                  <div className="divide-y divide-slate-100">
                    <div className="px-4 py-2.5 flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Total Liquidado de la Reserva:</span>
                      <span className="font-black text-slate-900 text-sm">{formatoCOP(totales.total || 0)}</span>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Total Pagado / Anticipos:</span>
                      <span className="font-black text-emerald-700">{formatoCOP(totales.pagado || 0)}</span>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between items-center bg-red-50/90 border-y border-red-200">
                      <span className="text-red-950 font-black text-xs uppercase tracking-wide">
                        SALDO PENDIENTE EXIGIBLE:
                      </span>
                      <span className="font-black text-red-600 text-base">
                        {formatoCOP(totales.saldo || 0)}
                      </span>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-semibold">Estado del Recaudo:</span>
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${totales.saldo > 0 ? 'bg-orange-100 text-orange-900 border border-orange-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'}`}>
                        {totales.saldo > 0 ? 'PENDIENTE DE PAGO' : 'PAGADO EN TOTALIDAD'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FILA 21: SEPARADOR VACÍO */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-200 bg-white">
                <div className="py-1 bg-slate-100 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-300 select-none print:hidden">
                  21
                </div>
                <div className="h-2"></div>
              </div>

              {/* FILA 22: ENCABEZADO MOVIMIENTOS DE PAGO */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-800 bg-slate-900 text-white">
                <div className="py-1.5 bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-700 select-none print:hidden">
                  22
                </div>
                <div className="px-4 py-1.5 font-black text-[11px] uppercase tracking-wider">
                  REGISTRO DE TRANSACCIONES Y MEDIOS DE PAGO
                </div>
              </div>

              {/* FILA 23: COLUMNAS DE PAGOS */}
              <div className="grid grid-cols-[36px_1fr] border-b border-slate-300 bg-slate-800 text-slate-200 text-[10px] font-extrabold uppercase">
                <div className="py-2 bg-slate-700 text-slate-400 font-mono flex items-center justify-center border-r border-slate-600 select-none print:hidden">
                  23
                </div>
                <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr_1fr_1.5fr] px-4 py-2 text-center sm:text-left">
                  <div>FECHA</div>
                  <div>MÉTODO DE PAGO</div>
                  <div>REFERENCIA</div>
                  <div className="text-right">MONTO APLICADO</div>
                  <div className="text-center">ESTADO</div>
                  <div className="text-right">REGISTRADO POR</div>
                </div>
              </div>

              {/* FILA 24 EN ADELANTE: REGISTROS DE PAGO */}
              {pagos.length === 0 ? (
                <div className="grid grid-cols-[36px_1fr] border-b border-slate-200 bg-white">
                  <div className="py-3 bg-slate-100 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-300 select-none print:hidden">
                    24
                  </div>
                  <div className="p-4 text-center text-slate-400 italic text-xs">
                    -- Sin pagos registrados aún --
                  </div>
                </div>
              ) : (
                pagos.map((pago, idx) => (
                  <div key={pago.id_pago || idx} className="grid grid-cols-[36px_1fr] border-b border-slate-200 bg-white text-xs">
                    <div className="py-2.5 bg-slate-100 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-300 select-none print:hidden">
                      {24 + idx}
                    </div>
                    <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr_1fr_1.5fr] px-4 py-2.5 items-center">
                      <div className="text-slate-600 font-mono text-[11px]">{pago.creado_en ? String(pago.creado_en).replace('T', ' ').slice(0, 16) : 'N/A'}</div>
                      <div className="font-bold text-slate-800">{pago.metodo || 'Efectivo'}</div>
                      <div className="font-mono text-[11px] text-slate-500 truncate">{pago.referencia || pago.referencia_gateway || '-'}</div>
                      <div className="text-right font-black text-slate-900">{formatoCOP(pago.monto || 0)}</div>
                      <div className="text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${pago.estado === 'Confirmado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                          {pago.estado || 'Confirmado'}
                        </span>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 truncate">{pago.creado_por || 'Sistema'}</div>
                    </div>
                  </div>
                ))
              )}

              {/* FILA 28: PIE DE PÁGINA FORMAL */}
              <div className="grid grid-cols-[36px_1fr] bg-slate-50 border-t border-slate-300">
                <div className="py-2 bg-slate-200 text-slate-400 font-mono text-[10px] flex items-center justify-center border-r border-slate-300 select-none print:hidden">
                  28
                </div>
                <div className="px-4 py-2 text-[10px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>Generado automáticamente por Facile PMS v4.2 • Todos los valores expresados en Pesos Colombianos (COP)</span>
                  <span className="font-semibold text-slate-600">Apartahotel Facile • Ibagué, Tolima</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 4. PESTAÑAS DE HOJA DE CÁLCULO INFERIORES (EXACTO A EXCEL) */}
        <div className="px-4 py-1.5 bg-slate-200 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600 print:hidden select-none">
          <div className="flex items-center gap-1">
            <span className="px-3 py-1 bg-white border-t-2 border-[#d91a2a] text-slate-900 font-extrabold text-[11px] shadow-2xs rounded-t">
              Folio_{idReserva}_{numApto}
            </span>
            <span className="px-3 py-1 text-slate-500 font-medium text-[11px] hover:text-slate-800 cursor-pointer">
              Resumen_DIAN
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
            Listo para exportar
          </span>
        </div>

      </div>
    </div>
  );
}
