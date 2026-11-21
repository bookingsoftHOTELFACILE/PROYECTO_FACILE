import { describe, it, expect } from 'vitest';
import {
  formatoCOP,
  etiquetaEstadoPago,
  etiquetaEstadoMovimiento,
  formatoFecha,
  generarCsvFolio,
} from './folio.js';

/** Fase 2 — formato y etiquetas del folio financiero. */
describe('formatoCOP', () => {
  it('agrupa miles con punto como en Colombia', () => {
    expect(formatoCOP(0)).toBe('$0');
    expect(formatoCOP(150000)).toBe('$150.000');
    expect(formatoCOP(1234567)).toBe('$1.234.567');
    expect(formatoCOP(-2500)).toBe('-$2.500');
  });

  it('es tolerante a valores no numéricos y redondea a pesos enteros', () => {
    expect(formatoCOP('abc')).toBe('$0');
    expect(formatoCOP(undefined)).toBe('$0');
    expect(formatoCOP(1500000.6)).toBe('$1.500.001');
  });
});

describe('etiquetas de estado', () => {
  it('describe el estado del saldo del folio', () => {
    expect(etiquetaEstadoPago('Pagado').texto).toBe('Pagado');
    expect(etiquetaEstadoPago('Parcial').texto).toBe('Pago parcial');
    expect(etiquetaEstadoPago('Pendiente').texto).toBe('Pendiente');
    expect(etiquetaEstadoPago(undefined).texto).toBe('Pendiente');
  });

  it('describe cada tipo de movimiento de pago', () => {
    expect(etiquetaEstadoMovimiento('Confirmado').texto).toBe('Confirmado');
    expect(etiquetaEstadoMovimiento('Rechazado').texto).toBe('Rechazado');
    expect(etiquetaEstadoMovimiento('Anulado').texto).toBe('Anulado');
    expect(etiquetaEstadoMovimiento('Reembolsado').texto).toBe('Reembolsado');
  });
});

describe('formatoFecha', () => {
  it('convierte ISO a DD/MM/AAAA y tolera vacíos', () => {
    expect(formatoFecha('2026-11-15')).toBe('15/11/2026');
    expect(formatoFecha('2026-11-15T10:30:00')).toBe('15/11/2026');
    expect(formatoFecha(null)).toBe('—');
    expect(formatoFecha('')).toBe('—');
  });
});

describe('generarCsvFolio', () => {
  const folio = {
    reserva: {
      id_reserva: 7,
      huesped_nombre: 'John Doe',
      huesped_documento: '12345678',
      habitacion_numero: '101A',
      fecha_entrada: '2026-11-20',
      fecha_salida: '2026-11-22',
      estado: 'Confirmada',
      observaciones: 'Llegada tarde; cuna',
    },
    cotizacion: { noches: 2, subtotal: 300000, descuento: 0, total: 300000 },
    iva: { base: 252100.84, iva: 47899.16, iva_pct: 19, total: 300000 },
    totales: { total: 300000, pagado: 100000, saldo: 200000 },
    estado_pago: 'Parcial',
    pagos: [
      {
        creado_en: '2026-11-15T10:00:00',
        metodo: 'Nequi',
        referencia: 'REF; 01',
        monto: 100000,
        estado: 'Confirmado',
        creado_por: 'Ana (Recepcionista 24h)',
      },
    ],
  };

  it('incluye cabecera, desglose, totales y movimientos', () => {
    const csv = generarCsvFolio(folio);
    expect(csv).toContain('FOLIO DE RESERVA;#7');
    expect(csv).toContain('Estadía (2 noches);300000');
    expect(csv).toContain('TOTAL;300000');
    expect(csv).toContain('Saldo pendiente;200000');
    expect(csv).toContain('Nequi');
    expect(csv).toContain('Ana (Recepcionista 24h)');
  });

  it('escapa separadores, comillas internas y saltos de línea', () => {
    const csv = generarCsvFolio({
      ...folio,
      pagos: [{ ...folio.pagos[0], referencia: 'REF; "especial"\nlinea2' }],
    });
    expect(csv).toContain('"REF; ""especial""\nlinea2"');
  });

  it('tolera folios vacíos o incompletos', () => {
    expect(generarCsvFolio(null)).toBe('');
    expect(generarCsvFolio({})).toContain('TOTAL;0');
  });
});
