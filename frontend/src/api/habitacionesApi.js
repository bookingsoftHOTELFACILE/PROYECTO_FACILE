const API_URL = '';

export async function obtenerHabitacionesCatalogo() {
  const res = await fetch(`${API_URL}/api/habitaciones`);
  if (!res.ok) {
    throw new Error('No se pudieron cargar las unidades habitacionales');
  }
  return res.json();
}

