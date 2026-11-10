import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RegistroHuespedForm from '../components/RegistroHuespedForm';

describe('RegistroHuespedForm', () => {
  it('renderiza todos los campos obligatorios, el checkbox de datos y el botón de envío', () => {
    // Arrange & Act
    render(<RegistroHuespedForm onSubmit={vi.fn()} />);

    // Assert
    expect(screen.getByLabelText('Nombre(s)')).toBeInTheDocument();
    expect(screen.getByLabelText('Apellido(s)')).toBeInTheDocument();
    expect(screen.getByLabelText('Documento (Cédula/Pasaporte)')).toBeInTheDocument();
    expect(screen.getByLabelText('Teléfono de contacto')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: /autorizo expresamente el tratamiento de mis datos personales/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aceptar y continuar/i })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('permite completar el formulario, marcar el checkbox de habeas data y enviar los datos', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();
    render(<RegistroHuespedForm onSubmit={onSubmitMock} />);

    // Act
    await user.type(screen.getByLabelText('Nombre(s)'), 'David');
    await user.type(screen.getByLabelText('Apellido(s)'), 'López');
    await user.type(screen.getByLabelText('Documento (Cédula/Pasaporte)'), '1017283944');
    await user.type(screen.getByLabelText('Teléfono de contacto'), '3154449876');
    await user.type(screen.getByLabelText('Correo electrónico'), 'david@facile.com');

    const checkboxHabeas = screen.getByRole('checkbox', {
      name: /autorizo expresamente el tratamiento de mis datos personales/i,
    });
    await user.click(checkboxHabeas);
    await user.click(screen.getByRole('button', { name: /aceptar y continuar/i }));

    // Assert: el checkbox quedó marcado y onSubmit fue llamado con el payload esperado
    expect(checkboxHabeas).toBeChecked();
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(onSubmitMock).toHaveBeenCalledWith({
      nombre: 'David López',
      documento: '1017283944',
      telefono: '3154449876',
      correo: 'david@facile.com',
      habeasData: true,
    });
  });

  it('bloquea el envío y muestra alerta de error cuando faltan campos obligatorios', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();
    render(<RegistroHuespedForm onSubmit={onSubmitMock} />);

    // Act
    await user.click(screen.getByRole('button', { name: /aceptar y continuar/i }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Nombre, apellidos, documento, teléfono y correo electrónico son obligatorios.'
    );
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('bloquea el envío si no se marca la autorización de tratamiento de datos personales', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();
    render(<RegistroHuespedForm onSubmit={onSubmitMock} />);

    // Act
    await user.type(screen.getByLabelText('Nombre(s)'), 'David');
    await user.type(screen.getByLabelText('Apellido(s)'), 'López');
    await user.type(screen.getByLabelText('Documento (Cédula/Pasaporte)'), '1017283944');
    await user.type(screen.getByLabelText('Teléfono de contacto'), '3154449876');
    await user.type(screen.getByLabelText('Correo electrónico'), 'david@facile.com');
    await user.click(screen.getByRole('button', { name: /aceptar y continuar/i }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Debe aceptar los Términos del Servicio y la Política de Protección de Datos'
    );
    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});