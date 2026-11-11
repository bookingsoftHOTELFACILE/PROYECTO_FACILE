import React, { useState } from 'react';

/**
 * Componente de tarjeta de apartamento con sincronización de estado y concurrencia en tiempo real.
 * Semana 6 - Capa FRONT - Sebastián Parada (@sebasparada).
 *
 * Muestra el estado del apartamento ('Disponible', 'Ocupada' / 'Ocupado', 'En limpieza', 'Mantenimiento')
 * y bloquea la interacción en tiempo real ante colisiones concurrentes (Double Booking).
 */
export default function ApartamentoEstadoCard({
  apartamento,
  onReservar = () => {},
  alertaConcurrencia = null,
}) {
  const [errorLocal, setErrorLocal] = useState(null);

  if (!apartamento) return null;

  const {
    numero = '101',
    tipo = 'Dúplex',
    capacidad = 3,
    precio_noche = 250000,
    estado = 'Disponible',
  } = apartamento;

  const esOcupado = estado === 'Ocupada' || estado === 'Ocupado';
  const esDisponible = estado === 'Disponible';

  // Alerta visible: externa por sincronización o local por intento de reserva en estado no disponible
  const mensajeAlerta = alertaConcurrencia || errorLocal;

  const manejarClickReservar = () => {
    // Si al hacer clic el estado cambió concurrentemente a Ocupado
    if (!esDisponible) {
      setErrorLocal('⚠️ El apartamento ya fue ocupado en tiempo real por otro huésped.');
      return;
    }
    onReservar(apartamento);
  };

  return (
    <div
      className="clean-card apto-concurrencia-card"
      data-testid={`card-apto-${numero}`}
      style={{
        border: esOcupado ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
        borderRadius: '12px',
        padding: '1.2rem',
        background: esOcupado ? '#fff5f5' : '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
          Apto {numero}
        </h3>

        {/* Insignia reactiva de estado en tiempo real */}
        <span
          data-testid="badge-estado-apto"
          className={`badge-tag ${
            esDisponible
              ? 'badge-avail'
              : esOcupado
              ? 'badge-occup'
              : estado === 'En limpieza'
              ? 'badge-clean'
              : 'badge-maint'
          }`}
          style={{
            padding: '0.3rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: esDisponible ? '#dcfce7' : esOcupado ? '#fee2e2' : '#fef3c7',
            color: esDisponible ? '#15803d' : esOcupado ? '#b91c1c' : '#b45309',
            border: `1px solid ${esDisponible ? '#86efac' : esOcupado ? '#fca5a5' : '#fde68a'}`,
          }}
        >
          {esOcupado ? 'Ocupado' : estado}
        </span>
      </div>

      <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem', color: '#64748b' }}>
        Categoría: <strong>{tipo}</strong> · Capacidad: <strong>{capacidad} personas</strong>
      </p>

      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e11d48', marginBottom: '1rem' }}>
        ${Number(precio_noche).toLocaleString('es-CO')} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>COP / noche</span>
      </div>

      {/* Alerta accesible de concurrencia */}
      {mensajeAlerta && (
        <div
          role="alert"
          style={{
            padding: '0.6rem 0.8rem',
            borderRadius: '8px',
            background: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fca5a5',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '0.8rem',
          }}
        >
          {mensajeAlerta}
        </div>
      )}

      {/* Botón de reserva con protección de concurrencia */}
      {/* MUTANTE SEMANA 6: Quitar disabled={!esDisponible} para permitir reservas en aptos ocupados */}
      <button
        type="button"
        className={esDisponible ? 'btn-submit-red' : 'btn-disabled'}
        disabled={!esDisponible}
        onClick={manejarClickReservar}
        style={{
          width: '100%',
          padding: '0.6rem',
          borderRadius: '8px',
          fontWeight: 700,
          cursor: esDisponible ? 'pointer' : 'not-allowed',
          background: esDisponible ? '#e11d48' : '#94a3b8',
          color: '#ffffff',
          border: 'none',
          transition: 'background 0.2s ease',
        }}
      >
        {esDisponible ? 'Reservar Apartamento' : 'Apartamento Ocupado'}
      </button>
    </div>
  );
}

