import React, { useState } from 'react';
import { ListOrdered } from 'lucide-react';

/**
 * Componente de tabla administrativa del PMS con el listado de reservas activas.
 * Semana 3 - Sebastián Parada (@sebasparada)
 */
export default function TablaGestionReservas({
  reservas = [],
  onCancelar = () => {},
  reservaAlert = null,
}) {
  const [confirmacionLocal, setConfirmacionLocal] = useState(null);

  // Filtramos únicamente las reservas activas (no canceladas)
  const reservasActivas = reservas.filter((r) => r.estado !== 'Cancelada');

  // Alerta a mostrar: prioriza la alerta externa del PMS o la confirmación local al cancelar
  const alertaActiva = reservaAlert || confirmacionLocal;

  const manejarClickCancelar = (reserva) => {
    onCancelar(reserva.id_reserva);
    setConfirmacionLocal({
      type: 'success',
      message: `✓ Reserva #${reserva.id_reserva} de ${reserva.huesped_nombre} cancelada exitosamente.`,
    });
  };

  return (
    <div id="pms-reservas-table" className="clean-card" style={{ marginBottom: '1.5rem' }}>
      <div className="clean-card-header">
        <ListOrdered size={18} color="var(--color-primary-red)" aria-hidden="true" />
        <h3 style={{ fontSize: '1.1rem' }}>
          Reservas Activas ({reservasActivas.length})
        </h3>
      </div>

      {/* Confirmación visual de cancelación o alerta del sistema */}
      {alertaActiva && (
        <div
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            margin: '0.8rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: alertaActiva.type === 'success' ? '#f0fdf4' : '#fee2e2',
            color: alertaActiva.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${alertaActiva.type === 'success' ? '#bbf7d0' : '#fca5a5'}`,
          }}
        >
          {alertaActiva.message}
        </div>
      )}

      <div className="pms-table-wrap">
        <table className="pms-table">
          <thead>
            <tr>
              <th>Reserva</th>
              <th>Huésped</th>
              <th>Apto</th>
              <th>Fechas</th>
              <th>Origen</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {reservasActivas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                  No hay reservas activas registradas.
                </td>
              </tr>
            ) : (
              reservasActivas.map((r) => (
                <tr key={r.id_reserva}>
                  <td>
                    <strong>#{r.id_reserva}</strong>
                  </td>
                  <td>
                    <strong>{r.huesped_nombre}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                      Doc: {r.huesped_documento}
                    </span>
                  </td>
                  <td>
                    <span className="badge-tag badge-occup">Apto {r.habitacion_numero}</span>
                  </td>
                  <td style={{ fontSize: '0.72rem' }}>
                    In: {r.fecha_entrada}
                    <br />
                    Out: {r.fecha_salida}
                  </td>
                  <td>
                    <span
                      className="badge-tag"
                      style={{
                        background: r.creado_por?.includes('Web') ? '#e0f2fe' : '#fef3c7',
                        color: r.creado_por?.includes('Web') ? '#0369a1' : '#b45309',
                        fontSize: '0.7rem',
                      }}
                    >
                      {r.creado_por?.includes('Web')
                        ? '🌐 Web Pública'
                        : `👨‍💼 ${r.creado_por || 'Recepción'}`}
                    </span>
                  </td>
                  <td>
                    {/* MUTANTE SEMANA 3: Cambiar el texto "Cancelar" por "Archivar" o comentar este botón para que fallen los tests */}
                    <button
                      type="button"
                      className="btn-mini"
                      style={{ color: '#ef4444' }}
                      onClick={() => manejarClickCancelar(r)}
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

