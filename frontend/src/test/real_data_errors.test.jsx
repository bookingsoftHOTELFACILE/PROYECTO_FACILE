import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppProvider } from '../context/AppContext.jsx';
import { useAppState } from '../state/useAppState.js';
import ModalGuestAuth from '../components/ModalGuestAuth.jsx';

function ModalConEstadoReal() {
  const appState = useAppState();
  return (
    <AppProvider value={appState}>
      <ModalGuestAuth />
    </AppProvider>
  );
}

function mockFetchRegistroError({ status, detail, invalidJson = false }) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options = {}) => {
    const headers = new Headers({ 'content-type': 'application/json' });

    if (url === '/health') {
      return { ok: true, status: 200, headers, json: async () => ({ status: 'OK' }) };
    }

    if (url === '/api/user/registro' && options.method === 'POST') {
      return {
        ok: false,
        status,
        headers,
        json: async () => {
          if (invalidJson) throw new SyntaxError('Unexpected end of JSON');
          return { detail };
        },
      };
    }

    return { ok: true, status: 200, headers, json: async () => [] };
  });
}

async function llenarYEnviarRegistro(user) {
  await waitFor(() => {
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/huespedes', expect.anything());
  });

  await user.click(screen.getByRole('button', { name: /Regístrate aquí/i }));
  await user.type(screen.getByLabelText('Nombre(s)'), 'David');
  await user.type(screen.getByLabelText('Apellido(s)'), 'López');
  await user.type(screen.getByLabelText('Documento'), '1017283944');
  await user.type(screen.getByLabelText(/Fecha de Nacimiento/i), '1995-05-20');
  await user.type(screen.getByLabelText(/Correo Electrónico/i), 'david@ejemplo.com');
  await user.type(screen.getByLabelText('Teléfono de contacto'), '3001234567');
  await user.type(screen.getByLabelText(/Contraseña de la Cuenta/i), 'Clave2026!');
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: /Aceptar y continuar/i }));
}

describe('Semana 6 - Errores reales de BD en registro de huésped', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra alerta accesible y conserva documento ante HTTP 400 por cédula duplicada', async () => {
    const user = userEvent.setup();
    mockFetchRegistroError({
      status: 400,
      detail: 'Ya existe un usuario registrado con este número de documento. Inicie sesión con su contraseña.',
    });

    render(<ModalConEstadoReal />);
    await llenarYEnviarRegistro(user);

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent(/este número de documento/i);
    expect(screen.getByRole('button', { name: /Iniciar Sesión con mis datos/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Documento')).toHaveValue('1017283944');
  });

  it('muestra alerta accesible ante HTTP 400 por correo duplicado', async () => {
    const user = userEvent.setup();
    mockFetchRegistroError({
      status: 400,
      detail: 'Ya existe un usuario registrado con este correo electrónico. Inicie sesión con su contraseña.',
    });

    render(<ModalConEstadoReal />);
    await llenarYEnviarRegistro(user);

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent(/este correo electrónico/i);
  });

  it('traduce error SQL crudo de psycopg2/PostgreSQL sin filtrarlo al usuario', async () => {
    const user = userEvent.setup();
    mockFetchRegistroError({
      status: 500,
      detail: 'psycopg2.errors.UniqueViolation: duplicate key value violates unique constraint "huesped_correo_key"',
    });

    render(<ModalConEstadoReal />);
    await llenarYEnviarRegistro(user);

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent(/Ya existe un registro con ese documento o correo electrónico/i);
    expect(alerta.textContent.toLowerCase()).not.toContain('psycopg2');
    expect(alerta.textContent.toLowerCase()).not.toContain('unique constraint');
  });

  it('no enmascara como fallo de red cuando HTTP 500 llega sin JSON (data null)', async () => {
    const user = userEvent.setup();
    mockFetchRegistroError({ status: 500, invalidJson: true });

    render(<ModalConEstadoReal />);
    await llenarYEnviarRegistro(user);

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('Ocurrió un error en la solicitud.');
    expect(alerta.textContent).not.toContain('Error de conexión');
  });
});