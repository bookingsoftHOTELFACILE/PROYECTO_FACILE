/**
 * frontend/src/utils/folio.js
 *
 * Fase 2 — Utilidades del folio financiero (formato monetario y estados).
 *
 * El desglose de IVA lo calcula el backend (`services/folio.py`); aquí sólo se
 * formatea y se derivan las etiquetas visuales para no duplicar reglas de
 * presentación en el componente.
 */

/**
 * Formato COP con separador de miles punto (ej. $1.234.567).
 * Determinístico: no depende del ICU del navegador ni de la configuración regional.
 */
export function formatoCOP(valor) {
  const numero = Math.round(Number(valor) || 0);
  const negativo = numero < 0;
  const texto = Math.abs(numero)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negativo ? '-' : ''}$${texto}`;
}

/** Etiqueta visual del estado del folio (saldo). */
export function etiquetaEstadoPago(estado) {
  switch (estado) {
    case 'Pagado':
      return { texto: 'Pagado', color: '#047857', fondo: '#ecfdf5' };
    case 'Parcial':
      return { texto: 'Pago parcial', color: '#b45309', fondo: '#fffbeb' };
    case 'Pendiente':
    default:
      return { texto: 'Pendiente', color: '#b91c1c', fondo: '#fef2f2' };
  }
}

/** Etiqueta visual de un movimiento de pago (fila de la tabla). */
export function etiquetaEstadoMovimiento(estado) {
  switch (estado) {
    case 'Confirmado':
      return { texto: 'Confirmado', color: '#047857', fondo: '#ecfdf5' };
    case 'Rechazado':
      return { texto: 'Rechazado', color: '#b91c1c', fondo: '#fef2f2' };
    case 'Anulado':
      return { texto: 'Anulado', color: '#64748b', fondo: '#f1f5f9' };
    case 'Reembolsado':
      return { texto: 'Reembolsado', color: '#1d4ed8', fondo: '#eff6ff' };
    case 'Pendiente':
    default:
      return { texto: estado || 'Pendiente', color: '#b45309', fondo: '#fffbeb' };
  }
}

/** Fecha ISO (AAAA-MM-DD o ISO completo) a DD/MM/AAAA. */
export function formatoFecha(iso) {
  if (!iso) return '—';
  const parte = String(iso).slice(0, 10);
  const [anio, mes, dia] = parte.split('-');
  if (!anio || !mes || !dia) return '—';
  return `${dia}/${mes}/${anio}`;
}

/**
 * Fase 3 — Exporta el folio a CSV (compatible con Excel en español).
 *
 * - Separador `;` (el estándar de Excel es-CO) y sin BOM (lo añade la descarga).
 * - Entrecomilla los campos con `;`, comillas o saltos de línea y duplica las
 *   comillas internas (RFC 4180).
 * - Incluye cabecera, desglose, totales y el detalle de movimientos con el
 *   usuario que registró cada cobro (auditoría).
 */
export function generarCsvFolio(folio) {
  if (!folio) return '';

  const reserva = folio.reserva || {};
  const cotizacion = folio.cotizacion || {};
  const iva = folio.iva || {};
  const totales = folio.totales || {};
  const pagos = Array.isArray(folio.pagos) ? folio.pagos : [];

  const idRes = reserva.id_reserva ?? '';
  const apto = reserva.habitacion_numero ?? '';
  const tipoHab = reserva.habitacion_tipo ? `${reserva.habitacion_tipo} Ejecutivo` : 'Suite';
  const noches = cotizacion.noches ?? 0;
  const precioNoche = Number(reserva.precio_noche || (noches > 0 ? (cotizacion.subtotal || 0) / noches : 0));
  const descPorc = noches >= 15 ? '15%' : (noches >= 7 ? '10%' : '0%');
  const estadoStr = reserva.estado === 'Check-In' ? 'Check-In Activo' : (reserva.estado || 'Confirmada');

  const filas = [
    ['FOLIO DE RESERVA', `#${idRes}`, '', '', '', 'DOCUMENTO OFICIAL'],
    ['Sistema de Gestión Hotelera (PMS) • Radicado DIAN / SIRE', '', '', '', '', 'Sede Chicó • Calle 93 #12-40, Bogotá D.C.'],
    ['', '', '', '', '', ''],
    ['INFORMACIÓN DE LA RESERVA', '', '', 'DETALLE DEL ALOJAMIENTO', '', ''],
    ['Huésped', reserva.huesped_nombre || '', '', 'Apartamento', `Apto ${apto}`, ''],
    ['Documento', reserva.huesped_documento || '', '', 'Tipo de Unidad', tipoHab, ''],
    ['Entrada', reserva.fecha_entrada || '', '', 'Fecha de Llegada', `${reserva.fecha_entrada || ''} (15:00 COT)`, ''],
    ['Salida', reserva.fecha_salida || '', '', 'Fecha de Salida', `${reserva.fecha_salida || ''} (11:00 COT)`, ''],
    ['Estado de la reserva', estadoStr, '', 'Plazo de Estadía', `${noches} Noches`, ''],
    ['Observaciones', reserva.observaciones || '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['LIQUIDACIÓN DE ESTADÍA Y BASE TRIBUTARIA', '', '', '', '', ''],
    ['CONCEPTO', 'VALOR (COP)', '', 'CANTIDAD', 'VALOR UNITARIO', 'VALOR TOTAL (COP)'],
    [`Estadía (${noches} noches)`, cotizacion.subtotal ?? 0, '', `${noches} noches`, precioNoche, cotizacion.subtotal ?? 0],
    ['Descuento larga estadía', -Number(cotizacion.descuento || 0), '', descPorc, `-${descPorc}`, -Number(cotizacion.descuento || 0)],
    ['', '', '', '', '', ''],
    ['DESGLOSE FISCAL (ART. 468 ET)', '', '', 'BALANCE Y ESTADO DE CUENTA', '', ''],
    ['Base gravable (IVA incluido)', iva.base ?? 0, '', 'Total Liquidado de la Reserva', '', totales.total ?? 0],
    [`IVA ${iva.iva_pct ?? 19}% (incluido en la tarifa)`, iva.iva ?? 0, '', 'Total Pagado / Anticipos', '', totales.pagado ?? 0],
    ['TOTAL', totales.total ?? 0, '', 'SALDO PENDIENTE EXIGIBLE', '', totales.saldo ?? 0],
    ['Saldo pendiente', totales.saldo ?? 0, '', 'Estado del Recaudo', '', (folio.estado_pago || 'Pendiente').toUpperCase()],
    ['Estado del pago', folio.estado_pago || '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['REGISTRO DE TRANSACCIONES Y MEDIOS DE PAGO', '', '', '', '', ''],
    ['FECHA', 'MÉTODO', 'REFERENCIA', 'MONTO', 'ESTADO', 'REGISTRADO POR'],
    ...(pagos.length > 0
      ? pagos.map((p) => [
          p.creado_en || '',
          p.metodo || '',
          p.referencia || p.referencia_gateway || '-',
          p.monto ?? 0,
          p.estado || '',
          p.creado_por || '',
        ])
      : [['-- Sin pagos registrados aún --', '', '', '', '', '']]),
    ['', '', '', '', '', ''],
    ['Generado automáticamente por Facile PMS v4.2 • Todos los valores expresados en Pesos Colombianos (COP)', '', '', '', '', ''],
  ];

  const escapar = (valor) => {
    const texto = String(valor ?? '');
    return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };

  return filas.map((fila) => fila.map(escapar).join(';')).join('\r\n');
}
