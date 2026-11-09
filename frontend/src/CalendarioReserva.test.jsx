import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarioReserva } from './CalendarioReserva';

describe('CalendarioReserva — Pruebas con RTL (Semana 3)', () => {
  const habitacionMock = {
    id_habitacion: 101,
    numero: 'D101',
    tipo: 'Dúplex',
    precio_noche: 200000
  };

  const fechaFija = new Date(2026, 10, 1); // 1 de Noviembre de 2026

  // 1. RENDER: Verificar botones de navegacion
  it('1. Render: debe renderizar los botones de navegacion de mes (Mes sig. ▶ y Mes Ant. ◀)', () => {
    // [Arrange]
    render(<CalendarioReserva habitacion={habitacionMock} initialDate={fechaFija} />);

    // [Act]
    const btnSiguiente = screen.getByRole('button', { name: /Mes Sig\./i });
    const btnAnterior = screen.getByRole('button', { name: /Mes Ant\./i });

    // [Assert]
    expect(btnSiguiente).toBeDefined();
    expect(btnAnterior).toBeDefined();

    // Verificamos que al hacer clic en "Mes Sig." avanza a Diciembre
    fireEvent.click(btnSiguiente);
    expect(screen.getByText(/Diciembre 2026/i)).toBeDefined();
  });

  // 2. INTERACCIÓN: Selección de fechas de entrada y salida
  it('2. Interacción: debe permitir seleccionar día de entrada y día de salida', () => {
    const mockCallback = vi.fn();

    // [Arrange]
    render(
      <CalendarioReserva
        habitacion={habitacionMock}
        initialDate={fechaFija}
        onFechasSeleccionadas={mockCallback}
      />
    );

    // [Act]: Clic en el día 10 y luego en el día 13
    fireEvent.click(screen.getByTestId('dia-10'));
    fireEvent.click(screen.getByTestId('dia-13'));

    // [Assert]
    expect(screen.getByText(/2026-11-10/i)).toBeDefined();
    expect(screen.getByText(/2026-11-13/i)).toBeDefined();
    expect(mockCallback).toHaveBeenCalledWith({
      entrada: '2026-11-10',
      salida: '2026-11-13'
    });
  });

  // 3. ASERCIÓN ASÍNCRONA: Comprobar resumen de cotización y subtotal con findByText
  it('3. Aserción asíncrona: debe calcular y mostrar el resumen de cotización con findByText', async () => {
    // [Arrange]
    render(<CalendarioReserva habitacion={habitacionMock} initialDate={fechaFija} />);

    // [Act]: 3 noches (del 10 al 13) x $200.000 = $600.000 COP
    fireEvent.click(screen.getByTestId('dia-10'));
    fireEvent.click(screen.getByTestId('dia-13'));

    // [Assert Asíncrono con findByText]: espera que el useEffect actualice el DOM
    const resumen = await screen.findByText('Resumen de Cotización');
    expect(resumen).toBeDefined();

    const subtotalLabel = await screen.findByText(/Subtotal Estadía:/i);
    expect(subtotalLabel).toBeDefined();

    // Comprobamos el valor del subtotal
    const subtotalValor = screen.getByTestId('subtotal-val');
    expect(subtotalValor.textContent).toContain('600.000');
  });
});
