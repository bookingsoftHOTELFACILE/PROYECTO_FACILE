/**
 * frontend/src/utils/pricing.js
 *
 * Única fuente del frontend para la política de descuento por larga estadía.
 * Debe coincidir exactamente con:
 *   - backend/services/reservas_service.py :: calcular_costo_estadia
 *   - backend/schema.sql :: fn_calcular_noches_y_precio
 *
 * Política publicada (ModalLegal / ModalDetalle):
 *   - >= 15 noches  -> 15%
 *   - 7 a 14 noches -> 10%
 *   - < 7 noches    -> 0%
 *
 * El backend sigue siendo la autoridad: la cotización definitiva es la que
 * devuelve `POST /api/reservas` en `cotizacion`. Esta utilidad alimenta sólo
 * el preview en tiempo real (feedback inmediato antes de confirmar).
 */

const round2 = (valor) => Math.round((Number(valor) || 0) * 100) / 100;

/** Porcentaje de descuento (0, 10 o 15) para una cantidad de noches. */
export function porcentajeDescuentoEstadia(noches) {
  const n = Number(noches) || 0;
  if (n >= 15) return 15;
  if (n >= 7) return 10;
  return 0;
}

/** Etiqueta legible del descuento aplicable ("15%", "10%" o "0%"). */
export function etiquetaDescuentoEstadia(noches) {
  return `${porcentajeDescuentoEstadia(noches)}%`;
}

/**
 * Cotización completa de una estadía.
 * @param {number} noches     cantidad de noches
 * @param {number} precioNoche precio por noche
 * @returns {{noches:number, subtotal:number, descuento:number, total:number}}
 */
export function cotizarEstadia(noches, precioNoche) {
  const n = Math.max(0, Math.round(Number(noches) || 0));
  const precio = Math.max(0, Number(precioNoche) || 0);
  const subtotal = round2(n * precio);
  const descuento = round2(subtotal * (porcentajeDescuentoEstadia(n) / 100));
  return { noches: n, subtotal, descuento, total: round2(subtotal - descuento) };
}
