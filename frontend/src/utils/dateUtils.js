/**
 * dateUtils.js - Utilidades de Calendario Hotelero Agnósticas de Zona Horaria
 * 
 * En sistemas hoteleros internacionales (OTA / Hoteles como Facile Apartamentos Bogotá),
 * una noche de estancia es una FECHA DE CALENDARIO PURA (Local al Hotel en Bogotá).
 * 
 * Huéspedes que reservan desde Australia (UTC+11), Japón (UTC+9), Europa (UTC+1),
 * EE.UU. (UTC-5 a UTC-8) o Sudamérica deben ver y operar exactamente sobre los mismos
 * días calendario, sin que la zona horaria del navegador cliente mueva o altere fechas.
 */

/**
 * Convierte cualquier string de fecha YYYY-MM-DD o timestamp a componentes numéricos limpios.
 */
export function splitDateParts(dateStr) {
  if (!dateStr) return null;
  const clean = String(dateStr).split('T')[0];
  const parts = clean.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return {
      year: parts[0],
      month: parts[1], // 1-12
      day: parts[2]    // 1-31
    };
  }
  return null;
}

/**
 * Retorna la marca de tiempo UTC pura a medianoche para una fecha YYYY-MM-DD.
 * No depende de la zona horaria local del navegador.
 */
export function toUtcTimestamp(dateStr) {
  const parts = splitDateParts(dateStr);
  if (!parts) return 0;
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

/**
 * Calcula el número exacto de noches entre dos fechas de calendario.
 * Inmune a desfases de husos horarios y cambios de horario de verano.
 */
export function calcularNochesAgnostico(inicioStr, finStr) {
  if (!inicioStr || !finStr) return 1;
  const t1 = toUtcTimestamp(inicioStr);
  const t2 = toUtcTimestamp(finStr);
  if (t2 <= t1) return 1;
  const diffDays = Math.round((t2 - t1) / 86400000);
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Itera día por día entre una fecha inicial y una final de forma agnóstica de zona horaria.
 */
export function iterarFechasRango(inicioStr, finStr) {
  const t1 = toUtcTimestamp(inicioStr);
  const t2 = toUtcTimestamp(finStr);
  if (!t1 || !t2 || t2 < t1) return [];

  const fechas = [];
  let curr = t1;
  while (curr <= t2) {
    const d = new Date(curr);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    fechas.push(`${y}-${m}-${day}`);
    curr += 86400000; // Exactamente 1 día calendario (24h UTC)
  }
  return fechas;
}

/**
 * Verifica si un rango de fechas contiene algún día ocupado.
 */
export function rangoTieneOcupados(inicioStr, finStr, diasOcupadosSet) {
  if (!diasOcupadosSet || diasOcupadosSet.size === 0) return false;
  const fechas = iterarFechasRango(inicioStr, finStr);
  return fechas.some(f => diasOcupadosSet.has(f));
}

/**
 * Formatea una fecha YYYY-MM-DD para visualización en UI (DD / MM / YYYY).
 */
export function formatearFechaDisplay(dateStr) {
  if (!dateStr) return 'Seleccionar fecha';
  const parts = splitDateParts(dateStr);
  if (!parts) return String(dateStr);
  const d = String(parts.day).padStart(2, '0');
  const m = String(parts.month).padStart(2, '0');
  return `${d} / ${m} / ${parts.year}`;
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Formatea una fecha YYYY-MM-DD a formato corto legible (ej: "9 de Noviembre").
 */
export function formatearFechaCorta(dateStr) {
  if (!dateStr) return '';
  const parts = splitDateParts(dateStr);
  if (!parts) return String(dateStr);
  const mesNombre = NOMBRES_MESES[parts.month - 1] || '';
  return `${parts.day} de ${mesNombre}`;
}
