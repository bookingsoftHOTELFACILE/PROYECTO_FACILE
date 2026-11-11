/*
  api/client.js — Cliente HTTP central de BookingSoft (Fase A).

  ¿Para qué? Concentrar URL base, encabezados de autenticación y lectura
             de respuestas en un solo lugar, en lugar de repetir el patrón
             de `fetch` en cada handler.
*/

// URL del backend FastAPI (vacía = mismo origen; usa el proxy de Vite/Nginx)
export const API_URL = '';

/** Encabezados JSON con Bearer token cuando el usuario tiene sesión. */
export function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Normaliza `detail` de FastAPI (string | array Pydantic | objeto).
 *  Comportamiento idéntico al original de App.jsx. */
export function formatErrorMessage(detail) {
  if (!detail) return 'Ocurrió un error en la solicitud.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((err) => (typeof err === 'string' ? err : err.msg || JSON.stringify(err)))
      .join(' | ');
  }
  return JSON.stringify(detail);
}

/**
 * Petición JSON estandarizada.
 * @param {string} path     ruta relativa, ej. "/api/reservas"
 * @param {Object} opciones { method, token, body, timeoutMs }
 * @returns {Promise<{ok: boolean, status: number, data: any, headers: Headers}>}
 */
export async function apiFetch(path, {
  method = 'GET',
  token = null,
  body,
  timeoutMs = 15000,
} = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: authHeaders(token),
    signal: AbortSignal.timeout(timeoutMs),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data, headers: res.headers };
}
