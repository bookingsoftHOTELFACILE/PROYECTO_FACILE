import { describe, it, expect } from 'vitest';
import {
  porcentajeDescuentoEstadia,
  etiquetaDescuentoEstadia,
  cotizarEstadia,
} from './pricing.js';

/**
 * P1-1.2 — Regla de descuento por larga estadía (fuente única del frontend).
 * Debe coincidir con backend/services/reservas_service.py y con
 * backend/schema.sql :: fn_calcular_noches_y_precio.
 */
describe('política de descuento por larga estadía', () => {
  it('aplica 0% por debajo de 7 noches y 10% desde 7 hasta 14', () => {
    expect(porcentajeDescuentoEstadia(1)).toBe(0);
    expect(porcentajeDescuentoEstadia(6)).toBe(0);
    expect(porcentajeDescuentoEstadia(7)).toBe(10);
    expect(porcentajeDescuentoEstadia(14)).toBe(10);
  });

  it('aplica 15% desde 15 noches en adelante', () => {
    expect(porcentajeDescuentoEstadia(15)).toBe(15);
    expect(porcentajeDescuentoEstadia(16)).toBe(15);
    expect(porcentajeDescuentoEstadia(60)).toBe(15);
  });

  it('etiqueta el descuento como lo muestra la interfaz', () => {
    expect(etiquetaDescuentoEstadia(7)).toBe('10%');
    expect(etiquetaDescuentoEstadia(15)).toBe('15%');
    expect(etiquetaDescuentoEstadia(3)).toBe('0%');
  });

  it('cotiza subtotal, descuento y total consistentemente', () => {
    expect(cotizarEstadia(5, 100000)).toEqual({
      noches: 5,
      subtotal: 500000,
      descuento: 0,
      total: 500000,
    });
    expect(cotizarEstadia(7, 100000)).toEqual({
      noches: 7,
      subtotal: 700000,
      descuento: 70000,
      total: 630000,
    });
    expect(cotizarEstadia(15, 100000)).toEqual({
      noches: 15,
      subtotal: 1500000,
      descuento: 225000,
      total: 1275000,
    });
  });
});
