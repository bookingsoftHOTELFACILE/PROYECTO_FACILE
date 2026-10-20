/**
 * =============================================================================
 * Lógica pura de cálculo de cotización y descuentos de estadía
 * =============================================================================
 * Reglas de negocio del Apartahotel BookingSoft:
 * - Menos de 7 noches: 0% de descuento.
 * - De 7 a 14 noches continuas: 10% de descuento sobre el subtotal.
 * - 15 noches o más continuas: 15% de descuento sobre el subtotal.
 *
 * Principio FIRST:
 * - Función pura y determinista (mismas entradas -> misma salida).
 * - Aislada de React, DOM y red.
 * =============================================================================
 */

/**
 * Calcula la cotización de una estadía según las fechas y el precio por noche.
 *
 * @param {Object} params
 * @param {string} params.fechaEntrada - Fecha de check-in en formato 'YYYY-MM-DD'
 * @param {string} params.fechaSalida  - Fecha de check-out en formato 'YYYY-MM-DD'
 * @param {number|string} params.precioNoche - Valor por noche en COP
 * @returns {Object|null} Objeto con noches, subtotal, descuento y total, o null si fechas inválidas
 */
export function calcularCotizacion({ fechaEntrada, fechaSalida, precioNoche }) {
  if (!fechaEntrada || !fechaSalida) {
    return null;
  }

  const eDt = new Date(fechaEntrada + 'T00:00:00');
  const sDt = new Date(fechaSalida + 'T00:00:00');

  // Validar que las fechas sean válidas y que la salida sea posterior a la entrada
  if (isNaN(eDt.getTime()) || isNaN(sDt.getTime()) || sDt <= eDt) {
    return null;
  }

  const diffMs = sDt.getTime() - eDt.getTime();
  const noches = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const precio = Number(precioNoche) || 0;
  const subtotal = noches * precio;

  // Regla de descuentos por volumen de noches
  let porcentajeDescuento = 0;
  if (noches >= 15) {
    porcentajeDescuento = 0.15;
  } else if (noches >= 7) {
    porcentajeDescuento = 0.10;
  }

  const descuento = subtotal * porcentajeDescuento;
  const total = Math.max(0, subtotal - descuento);

  return {
    noches,
    precio_noche: precio,
    subtotal,
    descuento,
    total,
    porcentajeDescuento
  };
}
