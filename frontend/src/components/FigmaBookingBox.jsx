/*
  FigmaBookingBox — componente original de App.jsx, extraído en la Fase A.
*/
import { useState } from 'react';
import {
  Check
} from 'lucide-react';
import HuespedesPicker from './HuespedesPicker.jsx';

// COMPONENTE DE RESERVA PARA EL MODAL DE FIGMA CON CALENDARIO VISUAL DE OCUPACIÓN (ROJO/VERDE)
const FigmaBookingBox = ({ selectedApto, reservas = [], onReservar }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [fechaEntrada, setFechaEntrada] = useState(todayStr);
  const [fechaSalida, setFechaSalida] = useState(tomorrowStr);
  const [calDate, setCalDate] = useState(new Date());

  // Filtrar reservas activas para esta categoría de apartamento
  const catReservas = reservas.filter(r => 
    (r.tipo_habitacion === selectedApto.tipo || String(r.id_habitacion).startsWith(selectedApto.tipo)) &&
    (r.estado === 'Confirmada' || r.estado === 'Check-In' || r.estado === 'Ocupada')
  );

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDay = firstDay.getDay() - 1;
  if (startDay === -1) startDay = 6;

  const daysGrid = [];
  for (let i = 0; i < startDay; i++) daysGrid.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isOccupied = catReservas.some(r => dayStr >= r.fecha_entrada && dayStr <= r.fecha_salida);
    const isSelectedIn = fechaEntrada === dayStr;
    const isSelectedOut = fechaSalida === dayStr;
    const inRange = fechaEntrada && fechaSalida && dayStr >= fechaEntrada && dayStr <= fechaSalida;
    daysGrid.push({ d, dayStr, isOccupied, isSelectedIn, isSelectedOut, inRange });
  }

  const handleDayClick = (item) => {
    if (!item || item.isOccupied) return;
    if (!fechaEntrada || (fechaEntrada && fechaSalida)) {
      setFechaEntrada(item.dayStr);
      setFechaSalida('');
    } else if (fechaEntrada && !fechaSalida) {
      if (item.dayStr <= fechaEntrada) {
        setFechaEntrada(item.dayStr);
        setFechaSalida('');
      } else {
        const hasBlock = catReservas.some(r => r.fecha_entrada <= item.dayStr && r.fecha_salida >= fechaEntrada);
        if (hasBlock) {
          alert('El rango seleccionado incluye fechas ocupadas en rojo.');
          return;
        }
        setFechaSalida(item.dayStr);
      }
    }
  };

  return (
    <>
      <div className="figma-dates-box">
        <div className="figma-dates-row">
          <div className="figma-date-field">
            <label className="figma-date-label">LLEGADA</label>
            <input
              type="date"
              className="figma-date-input"
              value={fechaEntrada}
              onChange={e => setFechaEntrada(e.target.value)}
            />
          </div>
          <div className="figma-date-field">
            <label className="figma-date-label">SALIDA</label>
            <input
              type="date"
              className="figma-date-input"
              value={fechaSalida}
              onChange={e => setFechaSalida(e.target.value)}
            />
          </div>
        </div>
        <div className="figma-date-field">
          <label className="figma-date-label">HUÉSPEDES</label>
          <HuespedesPicker maxCapacidad={selectedApto?.tipo === 'Familiares' ? 6 : selectedApto?.tipo === 'Dobles' ? 4 : 3} />
        </div>
      </div>

      {/* CALENDARIO DE OCUPACIÓN Y DISPONIBILIDAD ESTILO RECEPCIÓN */}
      <div style={{ marginTop: '0.8rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <button
            type="button"
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.74rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => setCalDate(new Date(year, month - 1, 1))}
          >
            ◀ Mes Ant.
          </button>
          <strong style={{ color: '#0f172a', fontSize: '0.84rem' }}>
            🗓️ Disponibilidad: {monthNames[month]} {year}
          </strong>
          <button
            type="button"
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.74rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => setCalDate(new Date(year, month + 1, 1))}
          >
            Mes Sig. ▶
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.5rem', fontSize: '0.72rem', justifyContent: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#991b1b', fontWeight: 700 }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}/> Ocupado
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#166534', fontWeight: 700 }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}/> Disponible
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#1d4ed8', fontWeight: 700 }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }}/> Tu Selección
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
          <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
          {daysGrid.map((item, idx) => {
            if (!item) return <div key={`empty-${idx}`}/>;
            let bg = '#dcfce7';
            let color = '#166534';
            let borderColor = '#86efac';

            if (item.isOccupied) {
              bg = '#fee2e2';
              color = '#991b1b';
              borderColor = '#fca5a5';
            } else if (item.isSelectedIn || item.isSelectedOut) {
              bg = '#2563eb';
              color = '#ffffff';
              borderColor = '#1d4ed8';
            } else if (item.inRange) {
              bg = '#dbeafe';
              color = '#1e40af';
              borderColor = '#93c5fd';
            }

            return (
              <button
                key={item.dayStr}
                type="button"
                onClick={() => handleDayClick(item)}
                disabled={item.isOccupied}
                title={item.isOccupied ? `Día ${item.d} Ocupado` : `Seleccionar fecha ${item.dayStr}`}
                style={{
                  background: bg,
                  color: color,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '5px',
                  padding: '0.3rem 0.1rem',
                  fontSize: '0.76rem',
                  cursor: item.isOccupied ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  transition: 'all 0.15s ease'
                }}
              >
                {item.d}
              </button>
            );
          })}
        </div>
      </div>

      <button
        className="btn-figma-reserve"
        onClick={() => onReservar(fechaEntrada, fechaSalida)}
        style={{ marginTop: '1.2rem' }}
      >
        Reservar este apartamento
      </button>
    </>
  );
};

export default FigmaBookingBox;
