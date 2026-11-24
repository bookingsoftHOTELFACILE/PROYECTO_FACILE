import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiRequest, buildFriendlyAlertMessage } from './httpClient.js';

describe('cliente HTTP Frontend (apiRequest) - pruebas unitarias (semana 4)', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });


    it('1. debe procesar y retornar correctamente la respuesta JSON cuando el backend responde HTTP 200', async () => {
        // Arrange
        const mockHabitaciones = [
            { id_habitacion: 1, numero: 'D101', tipo: 'Duplex', precio_noche: 250000, estado: 'Disponible' },
            { id_habitacion: 2, numero: 'F301', tipo: 'Familiares', precio_noche: 450000, estado: 'Disponible' },
        ];

        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockHabitaciones,
        });

        //Act
        const resultado = await apiRequest('/api/habitaciones');

        //Assert
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith('/api/habitaciones', {
            headers: { 'Content-Type': 'application/json' },
        });
        expect(resultado).toEqual(mockHabitaciones);
        expect(resultado).toHaveLength(2);
    });

    it('2. debe capturar y manejar el error cuando el backend responde HTTP 500 sin exponer detalles técnicos', async () => {
        // Arrange
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ detail: 'psycopg2.OperationalError: FATAL database crash' }),
        });
        // Act & Assert
        await expect(apiRequest('/api/reservas', { method: 'POST' })).rejects.toThrow(
            'El servidor presenta inconvenientes en este momento. Por favor, intenta de nuevo más tarde.'
        );
    });

    it('3. debe disparar una alerta amigable al usuario mediante el callback onAlert ante un error HTTP 500 o de red', async () => {
        // Arrange
        const onAlertMock = vi.fn();
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ detail: 'Internal Server Error' }),
        });
        // Act
        await expect(
            apiRequest('/api/user/registro', { method: 'POST' }, onAlertMock)
        ).rejects.toThrow();
        // Assert
        expect(onAlertMock).toHaveBeenCalledTimes(1);
        expect(onAlertMock).toHaveBeenCalledWith({
            type: 'error',
            message: 'El servidor presenta inconvenientes en este momento. Por favor, intenta de nuevo más tarde.',
        });
        expect(buildFriendlyAlertMessage('Credenciales incorrectas.', 401)).toBe('Credenciales incorrectas.');
    });

    it('4. debe manejar fallo de red o caída de servidor llamando al callback onAlert', async () => {
        const onAlertMock = vi.fn();
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Failed to fetch'));

        await expect(apiRequest('/api/test', {}, onAlertMock)).rejects.toThrow(
            'Error de conexion con el servidor. verifica tu conexion a internet.'
        );
        expect(onAlertMock).toHaveBeenCalledWith({
            type: 'error',
            message: 'Error de conexion con el servidor. verifica tu conexion a internet.',
        });
    });

    it('5. debe formatear errores estructurados y casos límite en buildFriendlyAlertMessage', () => {
        // Sin detail
        expect(buildFriendlyAlertMessage(null, 400)).toBe('Ocurrió un error al procesar tu solicitud.');
        expect(buildFriendlyAlertMessage('', 400)).toBe('Ocurrió un error al procesar tu solicitud.');

        // Lista de errores Pydantic o mixtos
        const pydanticErrors = [
            { msg: 'El correo no tiene formato válido' },
            'Contraseña requerida',
            { campo: 'valor' },
        ];
        const resLista = buildFriendlyAlertMessage(pydanticErrors, 422);
        expect(resLista).toContain('El correo no tiene formato válido');
        expect(resLista).toContain('Contraseña requerida');

        // Tipo no estándar
        expect(buildFriendlyAlertMessage(12345, 400)).toBe('ocurrio un error al procesar tu solicitud.');
    });

    it('6. debe tolerar respuestas no-JSON en errores HTTP 400', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => { throw new Error('Not JSON'); },
        });

        await expect(apiRequest('/api/raw-error')).rejects.toThrow(
            'Ocurrió un error al procesar tu solicitud.'
        );
    });
});
