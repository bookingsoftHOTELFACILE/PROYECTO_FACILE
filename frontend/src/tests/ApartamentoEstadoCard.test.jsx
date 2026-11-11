import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApartamentoEstadoCard from '../components/ApartamentoEstadoCard';

describe('ApartamentoEstadoCard (Concurrencia en Tiempo Real - Semana 6 - Sebastián Parada)', () => {
  const aptoDisponible = {
    id_habitacion: 101,
    numero: '201A',
    tipo: 'Dúplex',
    capacidad: 3,
    precio_noche: 250000,
    estado: 'Disponible',
  };

  // 1. Render inicial en estado Disponible
  it('debe renderizar el apartamento con insignia "Disponible" y botón de reserva habilitado', () => {
    // Arrange & Act
    render(<ApartamentoEstadoCard apartamento={aptoDisponible} />);

    // Assert
    expect(screen.getByRole('heading', { name: /apto 201a/i })).toBeInTheDocument();
    expect(screen.getByTestId('badge-estado-apto')).toHaveTextContent(/disponible/i);

    const botonReservar = screen.getByRole('button', { name: /reservar apartamento/i });
    expect(botonReservar).toBeInTheDocument();
    expect(botonReservar).toBeEnabled();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  // 2. Render cuando el apartamento está Ocupado
  it('debe renderizar el apartamento con insignia "Ocupado" y botón deshabilitado', () => {
    // Arrange
    const aptoOcupado = { ...aptoDisponible, estado: 'Ocupada' };

    // Act
    render(<ApartamentoEstadoCard apartamento={aptoOcupado} />);

    // Assert
    expect(screen.getByTestId('badge-estado-apto')).toHaveTextContent(/ocupado/i);

    const boton = screen.getByRole('button', { name: /apartamento ocupado/i });
    expect(boton).toBeInTheDocument();
    expect(boton).toBeDisabled();
  });

  // 3. Sincronización en tiempo real: cambio de Disponible a Ocupado
  it('debe actualizarse en tiempo real reflejando el cambio de estado a "Ocupado" y deshabilitando el botón', () => {
    // Arrange: el usuario ve inicialmente el apartamento disponible
    const { rerender } = render(<ApartamentoEstadoCard apartamento={aptoDisponible} />);

    const botonInicial = screen.getByRole('button', { name: /reservar apartamento/i });
    expect(botonInicial).toBeEnabled();

    // Act: llega una actualización en tiempo real (otro usuario completó la reserva en BD)
    const aptoActualizado = { ...aptoDisponible, estado: 'Ocupada' };
    rerender(<ApartamentoEstadoCard apartamento={aptoActualizado} />);

    // Assert: la interfaz reacciona inmediatamente al nuevo estado concurrente
    expect(screen.getByTestId('badge-estado-apto')).toHaveTextContent(/ocupado/i);

    const botonActualizado = screen.getByRole('button', { name: /apartamento ocupado/i });
    expect(botonActualizado).toBeDisabled();
  });

  // 4. Protección de concurrencia: bloqueo de reservas concurrentes
  it('no debe disparar onReservar cuando el apartamento está ocupado', async () => {
    // Arrange
    const user = userEvent.setup();
    const onReservarMock = vi.fn();
    const aptoOcupado = { ...aptoDisponible, estado: 'Ocupada' };

    render(<ApartamentoEstadoCard apartamento={aptoOcupado} onReservar={onReservarMock} />);

    // Act: intento de clic en botón deshabilitado
    const boton = screen.getByRole('button', { name: /apartamento ocupado/i });
    await user.click(boton);

    // Assert: la función de reserva NUNCA se ejecuta
    expect(onReservarMock).not.toHaveBeenCalled();
  });

  // 5. Alerta de colisión concurrente en la interfaz
  it('debe mostrar una alerta accesible (role="alert") cuando ocurre una colisión concurrente', () => {
    // Arrange
    const mensajeError = '⚠️ Este apartamento acaba de ser ocupado por otra reserva.';

    // Act
    render(
      <ApartamentoEstadoCard
        apartamento={{ ...aptoDisponible, estado: 'Ocupada' }}
        alertaConcurrencia={mensajeError}
      />
    );

    // Assert
    const alerta = screen.getByRole('alert');
    expect(alerta).toBeInTheDocument();
    expect(alerta).toHaveTextContent(mensajeError);
  });
});

