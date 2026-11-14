import { describe, it, expect } from 'vitest';
import {
  splitDateParts,
  toUtcTimestamp,
  calcularNochesAgnostico,
  iterarFechasRango,
  rangoTieneOcupados,
  formatearFechaDisplay,
  formatearFechaCorta
} from './dateUtils.js';

describe('Utilidades de Calendario Agnósticas de Zona Horaria (dateUtils)', () => {
  it('descompone correctamente fechas sin desfase horario', () => {
    const parts = splitDateParts('2026-11-09');
    expect(parts).toEqual({ year: 2026, month: 11, day: 9 });
  });

  it('calcula exactamente 11 noches entre el 9 y el 20 de noviembre', () => {
    const noches = calcularNochesAgnostico('2026-11-09', '2026-11-20');
    expect(noches).toBe(11);
  });

  it('itera día a día con total exactitud matemática en UTC', () => {
    const dias = iterarFechasRango('2026-11-09', '2026-11-12');
    expect(dias).toEqual([
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
      '2026-11-12'
    ]);
  });

  it('verifica que entre el 9 y el 20 de noviembre no hay ocupación cuando solo 7, 8, 21, 22 están ocupados', () => {
    const ocupados = new Set(['2026-11-07', '2026-11-08', '2026-11-21', '2026-11-22']);
    const tieneOcupados = rangoTieneOcupados('2026-11-09', '2026-11-20', ocupados);
    expect(tieneOcupados).toBe(false);
  });

  it('detecta correctamente si un rango cruza una fecha ocupada', () => {
    const ocupados = new Set(['2026-11-15']);
    const tieneOcupados = rangoTieneOcupados('2026-11-09', '2026-11-20', ocupados);
    expect(tieneOcupados).toBe(true);
  });

  it('formatea fechas de display y cortas correctamente', () => {
    expect(formatearFechaDisplay('2026-11-09')).toBe('09 / 11 / 2026');
    expect(formatearFechaCorta('2026-11-09')).toBe('9 de Noviembre');
  });
});
