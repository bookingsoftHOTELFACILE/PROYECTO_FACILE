const API_URL = '';

/**
 * Cliente HTTP del catálogo de unidades habitacionales.
 * Maneja caso feliz (200 JSON), errores del servidor (500),
 * errores de validación (422) y respuestas no JSON (HTML/texto).
 */
export async function obtenerHabitacionesCatalogo() {
  const res = await fetch(`${API_URL}/api/habitaciones`);
  const contentType = res.headers?.get?.('content-type') || '';

  if (!res.ok) {
    if (res.status === 422 && contentType.includes('application/json')) {
      const errBody = await res.json();
      const detail = typeof errBody?.detail === 'string'
        ? errBody.detail
        : 'Parámetros de consulta inválidos (422)';
      throw new Error(detail);
    }
    throw new Error('No se pudieron cargar las unidades habitacionales');
  }

  if (contentType && !contentType.includes('application/json')) {
    throw new Error('Respuesta inválida del servidor: se esperaba formato JSON');
  }

  return res.json();
}

