import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/LoginForm';

describe('LoginForm (Componente React - Semana 3 - José Chico)', () => {
  // 1. Render inicial
  it('debe renderizar los campos de Usuario, Contraseña y el botón "Entrar al Sistema"', () => {
    // Arrange
    render(<LoginForm isOpen={true} />);

    // Assert
    expect(
      screen.getByRole('heading', { name: /iniciar sesión empleado/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /entrar al sistema/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeEnabled();

    // Comprobar ausencia de error inicial con queryBy
    expect(screen.queryByRole('alert')).toBeNull();
  });

  // 2. Interacción con user-event
  it('debe permitir escribir credenciales y enviarlas al hacer clic en submit', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<LoginForm isOpen={true} onSubmit={handleSubmit} />);

    const usuarioInput = screen.getByLabelText(/usuario/i);
    const contrasenaInput = screen.getByLabelText(/contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /entrar al sistema/i });

    // Act
    await user.type(usuarioInput, 'admin_pms');
    await user.type(contrasenaInput, 'Secret123*');
    await user.click(submitBtn);

    // Assert
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({
      usuario: 'admin_pms',
      contrasena: 'Secret123*',
    });
  });

  // 3. Estado de error
  it('debe mostrar mensaje de alerta accesible cuando las credenciales no son válidas', () => {
    // Arrange
    const mensajeError = 'Credenciales incorrectas. Verifique usuario y contraseña.';
    render(<LoginForm isOpen={true} error={mensajeError} />);

    // Assert
    const alerta = screen.getByRole('alert');
    expect(alerta).toBeInTheDocument();
    expect(alerta).toHaveTextContent(mensajeError);
  });

  // 4. Estado de carga (Loading)
  it('debe deshabilitar el botón y mostrar "Validando..." cuando loading es true', () => {
    // Arrange
    render(<LoginForm isOpen={true} loading={true} />);

    // Assert
    const submitBtn = screen.getByRole('button', { name: /validando\.\.\./i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  // 5. Interacción de cierre de modal
  it('debe llamar a onClose cuando el usuario hace clic en el botón de cerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<LoginForm isOpen={true} onClose={handleClose} />);

    // Act
    const closeBtn = screen.getByRole('button', { name: /cerrar modal/i });
    await user.click(closeBtn);

    // Assert
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  // 6. Comprobación cuando isOpen es false
  it('no debe renderizar nada en el DOM cuando isOpen es false', () => {
    // Arrange
    const { container } = render(<LoginForm isOpen={false} />);

    // Assert
    expect(container).toBeEmptyDOMElement();
  });
});
