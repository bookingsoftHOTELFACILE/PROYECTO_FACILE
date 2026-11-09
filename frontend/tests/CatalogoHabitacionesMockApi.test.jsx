/**
 * frontend/tests/CatalogoHabitacionesMockApi.test.jsx
 *
 * Semana 5 — Dobles de Prueba en Frontend (Capa Front)
 * Integrante: Maicol Mayor (@maicolmayor23-code)
 * Rama: test/front-mock-api
 *
 * Misión:
 *   Usar `vi.mock('../src/api.js')` en Vitest para probar el componente
 *   `CatalogoHabitaciones` sin tocar el backend:
 *   1. Simular respuesta exitosa del catálogo de habitaciones con datos falsos.
 *   2. Simular respuesta con retardo para evaluar el spinner de carga.
 *   3. Verificar estado y comportamiento usando Stubs y Spies documentados.
 *   4. Evaluar resiliencia y detección del mutante cuando el mock devuelve `null`.
 */
import { render, screen, within, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CatalogoHabitaciones from '../src/components/CatalogoHabitaciones.jsx';
import { obtenerHabitacionesCatalogo } from '../src/api.js';

// Reemplaza a nivel de módulo todas las exportaciones de '../src/api.js' por funciones dobles vi.fn()
vi.mock('../src/api.js');

const HABITACIONES_FALSAS_MOCK = [
  {
    id_habitacion: 101,
    numero: 'D101',
    tipo: 'Dúplex',
    capacidad: 3,
    precio_noche: 250000,
    estado: 'Disponible',
  },
  {
    id_habitacion: 301,
    numero: 'F301',
    tipo: 'Familiares',
    capacidad: 6,
    precio_noche: 450000,
    estado: 'Disponible',
  },
];

describe('Semana 5 — CatalogoHabitaciones con vi.mock("../src/api.js") (Maicol Mayor)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('1. debe renderizar el catálogo cuando el API responde exitosamente con datos falsos', async () => {
    // Tipo de doble: STUB (y SPY de módulo).
    // ¿Por qué?: `obtenerHabitacionesCatalogo.mockResolvedValue(...)` actúa como STUB porque
    // controla lo que entra al componente entregando una respuesta preparada en memoria sin tocar
    // el backend ni la red; además registramos que fue invocado exactamente una vez.
    // Verificación: ESTADO (tarjetas renderizadas en el DOM) y COMPORTAMIENTO (llamada única al API).

    // Arrange
    obtenerHabitacionesCatalogo.mockResolvedValue(HABITACIONES_FALSAS_MOCK);

    // Act
    render(<CatalogoHabitaciones cargarDesdeApi={true} />);

    // Assert (Estado): Se muestran únicamente las 2 categorías presentes en los datos falsos (Dúplex y Familiares)
    expect(await screen.findByRole('heading', { name: 'Dúplex' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Familiares' })).toBeInTheDocument();

    const tarjetas = screen.getAllByRole('article');
    expect(tarjetas).toHaveLength(2);

    // Las categorías ausentes en el payload falso no deben renderizarse
    expect(screen.queryByRole('heading', { name: 'Dobles' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Habitaciones' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Assert (Comportamiento): El cliente del API fue invocado exactamente una vez al montar
    expect(obtenerHabitacionesCatalogo).toHaveBeenCalledOnce();
  });

  it('2. debe mostrar el spinner de carga durante una respuesta con retardo y ocultarlo al resolver', async () => {
    // Tipo de doble: STUB asíncrono con promesa diferida controlada.
    // ¿Por qué?: Permite congelar en el tiempo el estado de red pendiente (latencia del backend)
    // para inspeccionar de forma determinista el spinner de carga antes y después de que llegue el JSON.
    // Verificación: ESTADO transicional (spinner visible durante el retardo -> tarjetas visibles al resolver).

    // Arrange: Creamos una promesa cuya resolución controlamos manualmente para simular el retardo de red
    let resolverPeticionConRetardo;
    obtenerHabitacionesCatalogo.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolverPeticionConRetardo = resolve;
        })
    );

    // Act 1: Renderizar mientras la petición sigue en vuelo (con retardo)
    render(<CatalogoHabitaciones cargarDesdeApi={true} />);

    // Assert 1: El spinner accesible (`role="status"`) está visible y aún no hay alojamientos renderizados
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveTextContent('Cargando catálogo de apartamentos…');
    expect(screen.queryAllByRole('article')).toHaveLength(0);

    // Act 2: Resolver la petición simulada tras el retardo
    resolverPeticionConRetardo(HABITACIONES_FALSAS_MOCK);

    // Assert 2: El spinner desaparece del DOM y aparecen las tarjetas del catálogo
    await waitForElementToBeRemoved(() =>
      screen.queryByText('Cargando catálogo de apartamentos…')
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Dúplex' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('3. debe mostrar una alerta de error y no invocar callbacks de reserva cuando el API falla (500)', async () => {
    // Tipo de doble: STUB que lanza error (`mockRejectedValue`) + SPY (`onReservarTipo = vi.fn()`).
    // ¿Por qué?: El Stub fuerza una caída del servidor (difícil de provocar con el backend real) y
    // el Spy verifica que ninguna acción de reserva se dispare cuando la carga falla.
    // Verificación: ESTADO (alerta de error visible) y COMPORTAMIENTO (`not.toHaveBeenCalled()`).

    // Arrange
    const onReservarTipoSpy = vi.fn();
    obtenerHabitacionesCatalogo.mockRejectedValue(
      new Error('No se pudieron cargar las unidades habitacionales')
    );

    // Act
    render(
      <CatalogoHabitaciones
        cargarDesdeApi={true}
        onReservarTipo={onReservarTipoSpy}
      />
    );

    // Assert (Estado): El spinner desaparece y se presenta el mensaje de error en un role="alert"
    const alertaError = await screen.findByRole('alert');
    expect(alertaError).toHaveTextContent(
      'No se pudieron cargar las unidades habitacionales'
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);

    // Assert (Comportamiento): No se emitió ninguna reserva
    expect(onReservarTipoSpy).not.toHaveBeenCalled();
  });

  it('4. debe emitir los datos exactos de la unidad falsa al reservar desde una categoría cargada por el mock', async () => {
    // Tipo de doble: STUB (`obtenerHabitacionesCatalogo`) + SPY (`onReservarUnidad = vi.fn()`).
    // ¿Por qué?: El Stub alimenta las unidades habitacionales falsas y el Spy registra qué
    // argumento exacto sale del componente cuando la persona usuaria hace clic en "Reservar".
    // Verificación: COMPORTAMIENTO hacia afuera (`toHaveBeenCalledOnce` y `toHaveBeenCalledWith`).

    // Arrange
    const user = userEvent.setup();
    const onReservarUnidadSpy = vi.fn();
    obtenerHabitacionesCatalogo.mockResolvedValue(HABITACIONES_FALSAS_MOCK);

    render(
      <CatalogoHabitaciones
        cargarDesdeApi={true}
        onReservarUnidad={onReservarUnidadSpy}
      />
    );

    // Esperar a que termine la carga inicial del catálogo
    await screen.findByRole('heading', { name: 'Dúplex' });

    // Act: Filtrar por la categoría "Dúplex" y reservar la unidad específica Apto D101
    await user.click(screen.getByRole('button', { name: /Dúplex/i }));
    const botonesReservar = screen.getAllByRole('button', { name: 'Reservar' });
    await user.click(botonesReservar[0]);

    // Assert (Comportamiento): El Spy recibió exactamente la unidad D101 proveniente del Stub
    expect(onReservarUnidadSpy).toHaveBeenCalledOnce();
    expect(onReservarUnidadSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 101,
        numero: 'D101',
        tipo: 'Dúplex',
        capacidad: 3,
        precio: 250000,
      })
    );
  });

  it('5. debe degradar de forma segura al estado vacío sin lanzar excepción si el mock devuelve un arreglo nulo (null)', async () => {
    // Tipo de doble: STUB de caso borde (`mockResolvedValue(null)`).
    // ¿Por qué?: Simula una respuesta anómala donde el backend o el mock retorna `null` en vez de Array.
    // Verificación: ESTADO de resiliencia (muestra alerta de vacío sin romper el árbol de React).

    // Arrange
    obtenerHabitacionesCatalogo.mockResolvedValue(null);

    // Act
    render(<CatalogoHabitaciones cargarDesdeApi={true} />);

    // Assert: El componente no colapsa; oculta el spinner y muestra el estado vacío accesible
    const alertaVacio = await screen.findByRole('alert');
    expect(alertaVacio).toHaveTextContent(
      'No se encontraron apartamentos disponibles para el filtro seleccionado.'
    );
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});

