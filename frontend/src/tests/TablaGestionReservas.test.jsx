import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TablaGestionReservas from '../components/TablaGestionReservas';

const reservasDePrueba = [
  {
    id_reserva: 101,
    huesped_nombre: 'Juan Pérez',
    huesped_documento: '10203040',
    habitacion_numero: '201A',
    fecha_entrada: '2026-11-15',
    fecha_salida: '2026-11-18',
    estado: 'Confirmada',
    creado_por: 'Web Pública',
  },
  {
    id_reserva: 102,
    huesped_nombre: 'Sofía Restrepo',
    huesped_documento: '98765432',
    habitacion_numero: 'D101',
    fecha_entrada: '2026-11-20',
    fecha_salida: '2026-11-25',
    estado: 'Confirmada',
    creado_por: 'Recepción',
  },
];

describe('TablaGestionReservas (Componente React - Semana 3 - Sebastián Parada)', () => {
  // 1. Render con datos
  it('debe renderizar las filas mostrando número de reserva, huésped y fechas', () => {
    // Arrange & Act
    render(<TablaGestionReservas reservas={reservasDePrueba} />);

    // Assert: encabezado con cantidad de reservas activas
    expect(
      screen.getByRole('heading', { name: /reservas activas \(2\)/i })
    ).toBeInTheDocument();

    // Assert: números de reserva
    expect(screen.getByText('#101')).toBeInTheDocument();
    expect(screen.getByText('#102')).toBeInTheDocument();

    // Assert: nombres de los huéspedes
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Sofía Restrepo')).toBeInTheDocument();

    // Assert: fechas de entrada y salida visibles en la tabla
    expect(screen.getByText(/2026-11-15/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-11-18/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-11-20/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-11-25/i)).toBeInTheDocument();

    // Assert: botones "Cancelar" presentes para cada fila activa
    const botonesCancelar = screen.getAllByRole('button', { name: /cancelar/i });
    expect(botonesCancelar).toHaveLength(2);

    // Comprobar ausencia de alerta inicial con queryByRole
    expect(screen.queryByRole('alert')).toBeNull();
  });

  // 2. Interacción con user-event
  it('debe ejecutar la función onCancelar con el id de la reserva al hacer clic en el botón "Cancelar"', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCancelarMock = vi.fn();
    render(
      <TablaGestionReservas
        reservas={reservasDePrueba}
        onCancelar={onCancelarMock}
      />
    );

    const botonesCancelar = screen.getAllByRole('button', { name: /cancelar/i });

    // Act: clic en el botón "Cancelar" de la primera fila (#101)
    await user.click(botonesCancelar[0]);

    // Assert
    expect(onCancelarMock).toHaveBeenCalledTimes(1);
    expect(onCancelarMock).toHaveBeenCalledWith(101);
  });

  // 3. Estado de confirmación visual de cancelación
  it('debe mostrar la confirmación visual de cancelación luego de hacer clic en "Cancelar"', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TablaGestionReservas reservas={reservasDePrueba} />);

    const botonesCancelar = screen.getAllByRole('button', { name: /cancelar/i });

    // Act
    await user.click(botonesCancelar[0]);

    // Assert: aparece la alerta visual de confirmación en pantalla
    const alertaConfirmacion = screen.getByRole('alert');
    expect(alertaConfirmacion).toBeInTheDocument();
    expect(alertaConfirmacion).toHaveTextContent(
      /reserva #101 de juan pérez cancelada exitosamente/i
    );
  });

  // 4. Estado vacío cuando no hay reservas activas
  it('debe mostrar mensaje de estado vacío cuando no existen reservas activas', () => {
    // Arrange & Act
    render(<TablaGestionReservas reservas={[]} />);

    // Assert
    expect(
      screen.getByText(/no hay reservas activas registradas/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancelar/i })).toBeNull();
  });
});

