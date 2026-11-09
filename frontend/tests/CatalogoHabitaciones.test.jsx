import { render, screen, within, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CatalogoHabitaciones from '../src/components/CatalogoHabitaciones.jsx';
import { obtenerHabitacionesCatalogo } from '../src/api.js';

vi.mock('../src/api.js');

describe('CatalogoHabitaciones — HU-009 Filtros y catálogo de unidades habitacionales', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('debe renderizar las tarjetas de las 4 categorías de apartamentos inicialmente', () => {
    // Arrange & Act
    render(<CatalogoHabitaciones />);

    // Assert: Prioridad 1 (getByRole) para verificar el encabezado de la sección y las 4 tarjetas
    expect(
      screen.getByRole('heading', { name: 'Nuestros Alojamientos' })
    ).toBeInTheDocument();

    const tarjetas = screen.getAllByRole('article');
    expect(tarjetas).toHaveLength(4);

    expect(screen.getByRole('heading', { name: 'Dúplex' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dobles' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Familiares' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Habitaciones' })).toBeInTheDocument();

    // Uso de queryByRole para comprobar ausencia del mensaje de alerta/vacío en el estado inicial
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('debe mostrar únicamente la categoría Dúplex y sus unidades al hacer clic en el filtro "Dúplex"', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CatalogoHabitaciones />);

    // Act: Interacción real de usuario haciendo clic en el botón de filtro "Dúplex"
    const botonFiltroDuplex = screen.getByRole('button', { name: /Dúplex/i });
    await user.click(botonFiltroDuplex);

    // Assert: Permanece visible la tarjeta de Dúplex y sus 14 unidades asignables
    expect(screen.getByRole('heading', { name: 'Dúplex' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Unidades asignables de Dúplex \(14 disponibles\)/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Apto D101')).toBeInTheDocument();
    expect(screen.getByText('Apto D114')).toBeInTheDocument();

    // Assert: queryByRole se usa para verificar que las demás tarjetas YA NO existen en el DOM
    expect(screen.queryByRole('heading', { name: 'Dobles' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Familiares' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Habitaciones' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  it('debe mostrar el mensaje de estado vacío cuando un filtro no arroja resultados y permitir restablecerlo', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CatalogoHabitaciones />);

    // Act: Filtrar por categoría "Dúplex" (capacidad 3) y por capacidad "Hasta 6 personas" (combinación sin resultados)
    await user.click(screen.getByRole('button', { name: /Dúplex/i }));
    // Prioridad 2 (getByLabelText) para seleccionar en el campo de formulario asociado a <label>
    await user.selectOptions(screen.getByLabelText(/Filtrar por capacidad/i), '6');

    // Assert: Se muestra el estado vacío accesible con role="alert" y ninguna tarjeta de apartamento
    const alertaVacio = screen.getByRole('alert');
    expect(alertaVacio).toBeInTheDocument();
    expect(alertaVacio).toHaveTextContent(
      'No se encontraron apartamentos disponibles para el filtro seleccionado.'
    );
    expect(screen.queryAllByRole('article')).toHaveLength(0);

    // Act: Restablecer los filtros desde el botón de estado vacío
    await user.click(screen.getByRole('button', { name: 'Restablecer filtros' }));

    // Assert: Vuelven a mostrarse las 4 categorías y desaparece la alerta
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

  it('debe cargar las unidades asíncronamente desde el API y mostrar las tarjetas disponibles', async () => {
    // Arrange: Mock del cliente HTTP devolviendo solo unidades Dúplex
    obtenerHabitacionesCatalogo.mockResolvedValue([
      { id_habitacion: 1, numero: 'D101', tipo: 'Dúplex', capacidad: 3, precio_noche: 250000, estado: 'Disponible' }
    ]);

    // Act
    render(<CatalogoHabitaciones cargarDesdeApi={true} />);

    // Assert: Primero aparece el estado de carga y luego desaparece cuando resuelve la promesa
    expect(screen.getByText('Cargando catálogo de apartamentos…')).toBeInTheDocument();
    await waitForElementToBeRemoved(() =>
      screen.queryByText('Cargando catálogo de apartamentos…')
    );

    // findByRole se usa para elementos asíncronos que aparecen después de resolver el API
    expect(await screen.findByRole('heading', { name: 'Dúplex' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Dobles' })).not.toBeInTheDocument();
  });

  it('debe invocar onReservarTipo con la categoría seleccionada al hacer clic en Reservar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onReservarTipo = vi.fn();
    render(<CatalogoHabitaciones onReservarTipo={onReservarTipo} />);

    // Act: Usar within para acotar la búsqueda del botón "Reservar" dentro de la tarjeta de Dúplex
    const tarjetaDuplex = screen.getByRole('article', { name: /Categoría Dúplex/i });
    await user.click(within(tarjetaDuplex).getByRole('button', { name: 'Reservar' }));

    // Assert
    expect(onReservarTipo).toHaveBeenCalledWith('Dúplex');
  });
});

