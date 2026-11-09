/**
 * frontend/tests/apiClient.test.js
 *
 * Semana 5 — Pruebas del Cliente HTTP (`src/api.js`) con Dobles de Red
 * Integrante: Maicol Mayor (@maicolmayor23-code) — Capa Front
 *
 * Verifica los 4 escenarios requeridos para el cliente HTTP en la Capa Front:
 *   1. Caso feliz (200 OK con JSON válido).
 *   2. Error del servidor (500 Internal Server Error).
 *   3. Error de validación (422 Unprocessable Content).
 *   4. Respuesta no JSON (HTML devuelto por un proxy caído).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { obtenerHabitacionesCatalogo } from '../src/api.js';

describe('Semana 5 — Cliente HTTP obtenerHabitacionesCatalogo (src/api.js)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe retornar la lista de habitaciones cuando el servidor responde 200 OK con JSON válido', async () => {
    // Tipo de doble: STUB sobre globalThis.fetch (`vi.spyOn`).
    // ¿Por qué?: Reemplaza la red real para devolver un Response HTTP 200 controlado.
    const datosEsperados = [{ id_habitacion: 1, numero: 'D101', tipo: 'Dúplex' }];
    const fetchStub = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json; charset=utf-8' },
      json: async () => datosEsperados,
    });

    const resultado = await obtenerHabitacionesCatalogo();

    expect(resultado).toEqual(datosEsperados);
    expect(fetchStub).toHaveBeenCalledWith('/api/habitaciones');
  });

  it('debe lanzar un error controlado cuando el servidor responde 500 Internal Server Error', async () => {
    // Tipo de doble: STUB sobre globalThis.fetch que simula un fallo HTTP 500.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      json: async () => ({ detail: 'Internal Server Error' }),
    });

    await expect(obtenerHabitacionesCatalogo()).rejects.toThrow(
      'No se pudieron cargar las unidades habitacionales'
    );
  });

  it('debe propagar el detalle de validación cuando el servidor responde 422 Unprocessable Content', async () => {
    // Tipo de doble: STUB sobre globalThis.fetch que simula un error HTTP 422 con detail en JSON.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 422,
      headers: { get: () => 'application/json' },
      json: async () => ({ detail: 'Rango de capacidad inválido en la consulta.' }),
    });

    await expect(obtenerHabitacionesCatalogo()).rejects.toThrow(
      'Rango de capacidad inválido en la consulta.'
    );
  });

  it('debe lanzar error de formato cuando el servidor devuelve una respuesta no JSON (text/html)', async () => {
    // Tipo de doble: STUB sobre globalThis.fetch que devuelve HTML en lugar de application/json.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/html; charset=utf-8' },
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON at position 0');
      },
    });

    await expect(obtenerHabitacionesCatalogo()).rejects.toThrow(
      'Respuesta inválida del servidor: se esperaba formato JSON'
    );
  });
});

