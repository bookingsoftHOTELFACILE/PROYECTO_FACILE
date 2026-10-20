import { describe, it, expect } from 'vitest';
import { calcularCotizacion } from './pricing.js';

describe('calcularCotizacion — Lógica de Tarifas y Descuentos (Semana 2)', () => {
  // ---------------------------------------------------------------------------
  // TEST 1: Partición sin descuento (Menos de 7 noches)
  // ---------------------------------------------------------------------------
  it('debe calcular el total sin descuento para estadías menores a 7 noches', () => {
    // Arrange (Preparar datos)
    const datos = {
      fechaEntrada: '2026-11-01',
      fechaSalida: '2026-11-04', // 3 noches
      precioNoche: 100000
    };

    // Act (Ejecutar la función pura)
    const resultado = calcularCotizacion(datos);

    // Assert (Verificar resultados esperados)
    expect(resultado).not.toBeNull();
    expect(resultado.noches).toBe(3);
    expect(resultado.subtotal).toBe(300000);
    expect(resultado.porcentajeDescuento).toBe(0);
    expect(resultado.descuento).toBe(0);
    expect(resultado.total).toBe(300000);
  });

  // ---------------------------------------------------------------------------
  // TEST 2: Valores Límite con it.each (Particiones y bordes de descuento)
  // ---------------------------------------------------------------------------
  it.each([
    // [noches, entrada, salida, precio, %esperado, descEsperado, totalEsperado, descripcion]
    [6, '2026-11-01', '2026-11-07', 100000, 0, 0, 600000, 'Borde inferior: 6 noches (0% descuento)'],
    [7, '2026-11-01', '2026-11-08', 100000, 0.10, 70000, 630000, 'Borde exacto: 7 noches (10% descuento)'],
    [14, '2026-11-01', '2026-11-15', 100000, 0.10, 140000, 1260000, 'Borde superior: 14 noches (10% descuento)'],
    [15, '2026-11-01', '2026-11-16', 100000, 0.15, 225000, 1275000, 'Borde exacto: 15 noches (15% descuento)'],
    [20, '2026-11-01', '2026-11-21', 100000, 0.15, 300000, 1700000, 'Larga estadía: 20 noches (15% descuento)']
  ])(
    'debe aplicar %s noches correctamente (%s)',
    (noches, fechaEntrada, fechaSalida, precioNoche, porcentajeEsperado, descuentoEsperado, totalEsperado) => {
      // Arrange & Act
      const res = calcularCotizacion({ fechaEntrada, fechaSalida, precioNoche });

      // Assert
      expect(res).not.toBeNull();
      expect(res.noches).toBe(noches);
      expect(res.porcentajeDescuento).toBe(porcentajeEsperado);
      expect(res.descuento).toBe(descuentoEsperado);
      expect(res.total).toBe(totalEsperado);
    }
  );

  // ---------------------------------------------------------------------------
  // TEST 3: Casos de Error y Fechas Inválidas
  // ---------------------------------------------------------------------------
  it.each([
    [{ fechaEntrada: '', fechaSalida: '2026-11-05', precioNoche: 100000 }, 'fecha entrada vacía'],
    [{ fechaEntrada: '2026-11-05', fechaSalida: '', precioNoche: 100000 }, 'fecha salida vacía'],
    [{ fechaEntrada: 'fecha-mala', fechaSalida: '2026-11-05', precioNoche: 100000 }, 'fecha mal formateada'],
    [{ fechaEntrada: '2026-11-10', fechaSalida: '2026-11-05', precioNoche: 100000 }, 'salida anterior a entrada'],
    [{ fechaEntrada: '2026-11-05', fechaSalida: '2026-11-05', precioNoche: 100000 }, 'salida igual a entrada (0 noches)']
  ])('debe retornar null cuando las entradas son inválidas (%s)', (params) => {
    // Act
    const res = calcularCotizacion(params);

    // Assert
    expect(res).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // TEST 4: Valor por defecto de precioNoche (Fallback)
  // ---------------------------------------------------------------------------
  it('debe manejar precioNoche no proporcionado usando 0 por defecto', () => {
    const res = calcularCotizacion({
      fechaEntrada: '2026-11-01',
      fechaSalida: '2026-11-03'
    });
    expect(res).not.toBeNull();
    expect(res.precio_noche).toBe(0);
    expect(res.subtotal).toBe(0);
    expect(res.total).toBe(0);
  });
});


