import React, { useMemo, useState } from 'react';
import { X, CalendarDays, Save } from 'lucide-react';
import { formatoCOP } from '../utils/folio.js';
import { cotizarEstadia, etiquetaDescuentoEstadia } from '../utils/pricing.js';

export default function ModalEditarReserva({
  reserva,
  habitaciones = [],
  onGuardar,
  onClose,
}) {
  const [fechaEntrada, setFechaEntrada] = useState(reserva?.fecha_entrada || '');
  const [fechaSalida, setFechaSalida] = useState(reserva?.fecha_salida || '');
  const [idHabitacion, setIdHabitacion] = useState(
    String(reserva?.id_habitacion ?? '')
  );
  const [observaciones, setObservaciones] = useState(reserva?.observaciones || '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const habitacionSeleccionada = useMemo(
    () => habitaciones.find((h) => String(h.id_habitacion) === String(idHabitacion)),
    [habitaciones, idHabitacion]
  );

  const noches = useMemo(() => {
    if (!fechaEntrada || !fechaSalida) return 0;
    const entrada = new Date(`${fechaEntrada}T00:00:00`);
    const salida = new Date(`${fechaSalida}T00:00:00`);
    return Math.round((salida - entrada) / 86400000);
  }, [fechaEntrada, fechaSalida]);

  const cotizacion = cotizarEstadia(
    noches > 0 ? noches : 0,
    habitacionSeleccionada?.precio_noche || 0
  );

  const guardar = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fechaEntrada || !fechaSalida) {
      setError('Indique la fecha de entrada y la de salida.');
      return;
    }
    if (noches <= 0) {
      setError('La fecha de salida debe ser posterior a la fecha de entrada.');
      return;
    }
    if (!habitacionSeleccionada) {
      setError('Seleccione una unidad.');
      return;
    }

    setGuardando(true);
    const cambios = {
      fecha_entrada: fechaEntrada,
      fecha_salida: fechaSalida,
      id_habitacion: Number(idHabitacion),
      observaciones: observaciones.trim(),
    };
    const ok = await onGuardar(cambios);
    setGuardando(false);
    if (ok) onClose();
  };

  const unidades = habitaciones.filter((h) => h.estado !== 'Mantenimiento');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(9, 14, 26, 0.78)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
    >
      <form
        id="pms-editar-reserva-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={guardar}
        style={{
          width: '100%',
          maxWidth: '560px',
          margin: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarDays size={20} color="#0284c7" />
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                Editar reserva #{reserva?.id_reserva}
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                {reserva?.huesped_nombre || 'Huésped'} · {reserva?.habitacion_numero || '—'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={17} />
          </button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div
              role="alert"
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '12.5px',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
            Unidad
            <select
              id="editar-reserva-habitacion"
              value={idHabitacion}
              onChange={(e) => setIdHabitacion(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                fontWeight: 700,
                backgroundColor: '#ffffff',
              }}
            >
              {unidades.map((h) => (
                <option key={h.id_habitacion} value={h.id_habitacion}>
                  {h.numero} · {h.tipo} · {formatoCOP(h.precio_noche)}/noche
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Entrada
              <input
                id="editar-reserva-entrada"
                type="date"
                value={fechaEntrada}
                onChange={(e) => setFechaEntrada(e.target.value)}
                required
                style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  fontWeight: 600,
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Salida
              <input
                id="editar-reserva-salida"
                type="date"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                required
                style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  fontWeight: 600,
                }}
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
            Observaciones
            <textarea
              id="editar-reserva-observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Llegada tarde, cuna, requerimientos especiales…"
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 500,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </label>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>
              {cotizacion.noches} {cotizacion.noches === 1 ? 'noche' : 'noches'}
              {cotizacion.descuento > 0 && (
                <span style={{ color: '#047857' }}> · descuento {etiquetaDescuentoEstadia(cotizacion.noches)}</span>
              )}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
              {formatoCOP(cotizacion.total)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '16px 22px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#fcfdff',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            id="editar-reserva-guardar"
            disabled={guardando}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 18px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: guardando ? 'wait' : 'pointer',
              opacity: guardando ? 0.75 : 1,
            }}
          >
            <Save size={15} />
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
