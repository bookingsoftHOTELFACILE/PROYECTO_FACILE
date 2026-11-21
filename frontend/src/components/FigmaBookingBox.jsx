import { useState } from 'react';
import {
  Check
} from 'lucide-react';
import HuespedesPicker from './HuespedesPicker.jsx';

// COMPONENTE DE RESERVA PARA EL MODAL DE FIGMA CON CALENDARIO VISUAL DE OCUPACIÓN (ROJO/VERDE)
const FigmaBookingBox = ({ selectedApto, reservas = [], onReservar }) => {
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [calDate, setCalDate] = useState(new Date());

  // Filtrar reservas activas para esta categoría de apartamento
  const catReservas = reservas.filter(r => 
    (r.tipo_habitacion === selectedApto.tipo || String(r.id_habitacion).startsWith(selectedApto.tipo)) &&
    (r.estado === 'Confirmada' || r.estado === 'Check-In' || r.estado === 'Ocupada')
  );

  const todayObj = new Date();
  const todayStr = todayObj.toLocaleDateString('en-CA');
  const todayYear = todayObj.getFullYear();
  const todayMonth = todayObj.getMonth();

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
    const isPast = dayStr < todayStr;
    const isOccupied = catReservas.some(r => dayStr >= r.fecha_entrada && dayStr <= r.fecha_salida);
    const isSelectedIn = fechaEntrada === dayStr;
    const isSelectedOut = fechaSalida === dayStr;
    const inRange = fechaEntrada && fechaSalida && dayStr >= fechaEntrada && dayStr <= fechaSalida;
    daysGrid.push({ d, dayStr, isPast, isOccupied, isSelectedIn, isSelectedOut, inRange });
  }

  const handleDayClick = (item) => {
    if (!item || item.isOccupied || item.isPast) return;
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

  const isPrevMonthDisabled = year < todayYear || (year === todayYear && month <= todayMonth);

  return (
    <>
      <div className="figma-dates-box">
        <div className="figma-dates-row">
          <div className="figma-date-field">
            <label className="figma-date-label">LLEGADA</label>
            <input
              type="date"
              className="figma-date-input"
              min={todayStr}
              value={fechaEntrada}
              onChange={e => {
                const val = e.target.value;
                if (val && val < todayStr) return;
                setFechaEntrada(val);
                if (fechaSalida && fechaSalida <= val) setFechaSalida('');
              }}
            />
          </div>
          <div className="figma-date-field">
            <label className="figma-date-label">SALIDA</label>
            <input
              type="date"
              className="figma-date-input"
              min={fechaEntrada || todayStr}
              value={fechaSalida}
              onChange={e => {
                const val = e.target.value;
                if (val && val <= (fechaEntrada || todayStr)) return;
                setFechaSalida(val);
              }}
            />
          </div>
        </div>
        <div className="figma-date-field">
          <label className="figma-date-label">HUÉSPEDES</label>
          <HuespedesPicker maxCapacidad={selectedApto?.tipo === 'Familiares' ? 6 : selectedApto?.tipo === 'Dobles' ? 4 : 3} />
        </div>
      </div>

      {/* CALENDARIO DE OCUPACIÓN Y DISPONIBILIDAD ESTILIZADO DE TRES ESTADOS */}
      <div style={{ marginTop: '0.8rem', backgroundColor: '#ffffff', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        
        {/* Header interactivo del Calendario */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
          <button
            type="button"
            disabled={isPrevMonthDisabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '4px 8px',
              fontSize: '0.74rem',
              background: isPrevMonthDisabled ? '#f1f5f9' : '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: isPrevMonthDisabled ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              color: isPrevMonthDisabled ? '#94a3b8' : '#334155',
              opacity: isPrevMonthDisabled ? 0.5 : 1,
              transition: 'all 0.15s ease'
            }}
            onClick={() => setCalDate(new Date(year, month - 1, 1))}
          >
            ◀ Mes Ant.
          </button>
          <span style={{ color: '#0f172a', fontSize: '0.84rem', fontWeight: 800 }}>
            🗓️ Disponibilidad: {monthNames[month]} {year}
          </span>
          <button
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '4px 8px', fontSize: '0.74rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, color: '#334155', transition: 'all 0.15s ease' }}
            onClick={() => setCalDate(new Date(year, month + 1, 1))}
          >
            Mes Sig. ▶
          </button>
        </div>

        {/* Leyenda Explicativa de Tres Estados */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '4px 6px', backgroundColor: '#f8fafc', borderRadius: '8px', margin: '6px 0', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', fontWeight: 600, color: '#475569' }}>
            <span style={{ width: '11px', height: '11px', borderRadius: '3px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', display: 'inline-block' }} />
            <span>Disponible</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', fontWeight: 600, color: '#ef4444' }}>
            <span style={{ width: '11px', height: '11px', borderRadius: '3px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#94a3b8', textDecoration: 'line-through 2px #ef4444', fontSize: '8px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </span>
            <span>Ocupado</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', fontWeight: 700, color: '#d91a2a' }}>
            <span style={{ width: '11px', height: '11px', borderRadius: '3px', backgroundColor: '#d91a2a', color: '#ffffff', fontSize: '8px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✓
            </span>
            <span>Tu Selección</span>
          </div>
        </div>

        {/* Encabezado Días Semanales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.66rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px' }}>
          <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
        </div>

        {/* Grilla Interactiva de Días */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {daysGrid.map((item, idx) => {
            if (!item) return <div key={`empty-${idx}`} style={{ height: '28px' }} />;

            // 1. DÍA OCUPADO (No disponible)
            if (item.isOccupied) {
              return (
                <div
                  key={item.dayStr}
                  title={`Día ${item.d} Ocupado (No disponible)`}
                  style={{
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#94a3b8',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    textDecoration: 'line-through 2px #ef4444',
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none'
                  }}
                >
                  {item.d}
                </div>
              );
            }

            // 1.1 DÍA EN EL PASADO (No permitido reservar antes de hoy)
            if (item.isPast) {
              return (
                <div
                  key={item.dayStr}
                  title={`Día ${item.d} pasado (No disponible)`}
                  style={{
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    color: '#cbd5e1',
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    opacity: 0.5
                  }}
                >
                  {item.d}
                </div>
              );
            }

            // 2. DÍA EN SELECCIÓN (Entrada, Salida o en Rango)
            const esExtremo = item.isSelectedIn || item.isSelectedOut;
            if (esExtremo || item.inRange) {
              return (
                <button
                  key={item.dayStr}
                  type="button"
                  onClick={() => handleDayClick(item)}
                  title={`${item.isSelectedIn ? 'Llegada: ' : item.isSelectedOut ? 'Salida: ' : ''}${item.dayStr}`}
                  style={{
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: esExtremo ? '#d91a2a' : '#fee2e2',
                    color: esExtremo ? '#ffffff' : '#b91522',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    border: esExtremo ? 'none' : '1px dashed #fca5a5',
                    boxShadow: esExtremo ? '0 2px 6px rgba(217, 26, 42, 0.35)' : 'none',
                    transform: esExtremo ? 'scale(1.05)' : 'scale(1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.d}
                </button>
              );
            }

            // 3. DÍA DISPONIBLE
            return (
              <button
                key={item.dayStr}
                type="button"
                onClick={() => handleDayClick(item)}
                title={`Seleccionar fecha ${item.dayStr}`}
                style={{
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.borderColor = '#d91a2a'; e.currentTarget.style.color = '#d91a2a'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#0f172a'; }}
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
