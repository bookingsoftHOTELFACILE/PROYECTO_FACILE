import {
  UserPlus, ShieldCheck, Mail, Phone, FileText, Briefcase,
  Users, AlertCircle, Calendar, Home, User, CheckCircle2,
  Check, UserCheck, Sparkles, Search, Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const VistaReservar = () => {
  const {
    habitaciones, reservas, espaciosNegocio, reservaNegocioForm,
    setReservaNegocioForm, setActiveTab, formData, habeasData,
    setHabeasData, selectedHuesped, setSelectedHuesped, reservaData,
    setReservaData, cotizacion, calDate, setCalDate,
    loading, alert, reservaAlert, setReservaAlert,
    handleUserChange, handleReservaChange, handleUserSubmit, handleReservaSubmit,
    setShowGuestAuthModal, setGuestAuthTab, guestSearchQuery, setGuestSearchQuery,
    guestSearchError, handleGuestSearchSubmit, handleGuestLogout
  } = useApp();
  return (
        <section className="facile-section">
          <div className="section-title-wrap">
            <h2>{selectedHuesped ? 'Reservar Apartamento' : 'Reservar en Línea'}</h2>
            <p>{selectedHuesped ? 'Seleccione las fechas y confirme su estadía de forma inmediata' : 'Auto-registro de huésped y reserva con cálculo automático de cotización'}</p>
          </div>

          <div className="booking-grid" style={selectedHuesped ? { gridTemplateColumns: '1fr', maxWidth: '850px', margin: '0 auto' } : {}}>
            {/* PASO 1: IDENTIFICACIÓN UNIFICADA DE HUÉSPED */}
            {!selectedHuesped && (
              <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="card-step-badge">Paso 1</div>
                  <div className="clean-card-header">
                    <UserCheck size={20} color="var(--color-primary-red)"/>
                    <h3>Identificación del Huésped</h3>
                  </div>
                  <p className="clean-card-desc">
                    Inicia sesión o regístrate para confirmar tu reserva con tarifas oficiales de Apartamentos Facile, facturación electrónica DIAN y soporte para huéspedes extranjeros.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.2rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setGuestAuthTab('login');
                        setShowGuestAuthModal(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1.2rem',
                        backgroundColor: '#d91a2a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(217, 26, 42, 0.25)',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <User size={16} /> Iniciar Sesión con mi Cuenta
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setGuestAuthTab('registro');
                        setShowGuestAuthModal(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1.2rem',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#d91a2a'; e.currentTarget.style.color = '#d91a2a'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#0f172a'; }}
                    >
                      <Sparkles size={16} color="#d91a2a" /> Crear Cuenta Nueva (Nacional o Extranjero)
                    </button>
                  </div>

                  {/* Acceso Rápido por Documento / Correo para huéspedes registrados */}
                  <div style={{ marginTop: '1.6rem', paddingTop: '1.2rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Search size={14} /> Acceso rápido con documento o correo:
                    </div>
                    <form onSubmit={handleGuestSearchSubmit}>
                      <div className="form-field" style={{ marginBottom: '0.5rem' }}>
                        <div className="field-input-wrap">
                          <FileText className="field-icon" size={16} />
                          <input
                            type="text"
                            placeholder="Ej: 1017283944 o correo@ejemplo.com"
                            value={guestSearchQuery}
                            onChange={(e) => setGuestSearchQuery(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '0.55rem',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#334155',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                      >
                        {loading ? 'Consultando...' : 'Identificarme en 1 Clic →'}
                      </button>
                    </form>
                    {guestSearchError && (
                      <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', marginTop: '0.6rem' }}>
                        ⚠️ {guestSearchError}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <span>Exención de IVA del 19% disponible para pasaportes extranjeros según Decreto 297 de 2016.</span>
                </div>
              </div>
            )}

            {/* CREACIÓN DE RESERVA */}
            <div className="clean-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('apartamentos');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}
                >
                  ◀ Volver a Alojamientos
                </button>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Apartamentos Facile • Bogotá</span>
              </div>

              {!selectedHuesped && <div className="card-step-badge">Paso 2</div>}
              <div className="clean-card-header">
                <Calendar size={20} color="var(--color-primary-red)"/>
                <h3>{selectedHuesped ? 'Confirmar Nueva Reserva' : 'Crear Reserva'}</h3>
              </div>

              {selectedHuesped ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <div style={{ width: '36px', height: '36px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#14532d' }}>{selectedHuesped?.nombre || 'Huésped Registrado'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                        Doc: {selectedHuesped?.documento || 'N/A'} {selectedHuesped?.correo ? `• ${selectedHuesped.correo}` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('perfil')}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-pill)', padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                    >
                      Mi Perfil
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGuestLogout()}
                      style={{ background: '#fee2e2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-pill)', padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, color: '#b91522', cursor: 'pointer' }}
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.65rem 0.95rem', borderRadius: '10px', marginBottom: '1.2rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>
                    💡 Selecciona tu alojamiento y fechas deseadas. Al finalizar, podrás identificarte para confirmar tu estadía.
                  </span>
                </div>
              )}

              <form onSubmit={handleReservaSubmit}>
                <div className="form-field">
                  <label>Seleccionar Apartamento o Espacio de Coworking</label>
                  <div className="field-input-wrap">
                    {String(reservaData.id_habitacion).startsWith('coworking-') ? (
                      <Briefcase className="field-icon" size={16}/>
                    ) : (
                      <Home className="field-icon" size={16}/>
                    )}
                    <select name="id_habitacion" value={reservaData.id_habitacion} onChange={handleReservaChange} required>
                      <option value="">-- Elija un apartamento o espacio de coworking --</option>
                      <optgroup label="🏨 Apartamentos / Unidades">
                        {habitaciones.map(h => (
                          <option key={h.id_habitacion || h.numero} value={String(h.id_habitacion || h.numero)} disabled={h.estado === 'Mantenimiento'}>
                            Apto {h.numero} — {h.tipo} • {h.zona || h.piso || 'Torre Facile'} • Capacidad: {h.capacidad || 2} pers. • ${Number(h.precio_noche || 0).toLocaleString('es-CO')} COP/noche ({h.estado || 'Disponible'})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="💼 Salas de Juntas & Coworking (Por Horas)">
                        {espaciosNegocio.map(e => (
                          <option key={`coworking-${e.id_espacio}`} value={`coworking-${e.id_espacio}`} disabled={e.estado === 'Mantenimiento'}>
                            💼 {e.nombre} ({e.tipo}) • Capacidad: {e.capacidad} pers. • ${Number(e.precio_hora).toLocaleString('es-CO')} COP/hora ({e.estado || 'Disponible'})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {String(reservaData.id_habitacion).startsWith('coworking-') ? (() => {
                  const espId = parseInt(String(reservaData.id_habitacion).replace('coworking-', ''));
                  const espSel = espaciosNegocio.find(e => e.id_espacio === espId);
                  const [hI, mI] = (reservaNegocioForm.hora_inicio || '09:00').split(':').map(Number);
                  const [hF, mF] = (reservaNegocioForm.hora_fin || '11:00').split(':').map(Number);
                  const duracion = Math.max(1, Math.round(((hF * 60 + (mF || 0)) - (hI * 60 + (mI || 0))) / 60));
                  const precioHora = espSel ? Number(espSel.precio_hora) : 0;
                  let total = duracion * precioHora;
                  if (espSel?.tipo === 'Sala de Juntas') {
                    if (duracion >= 8) total = 450000;
                    else if (duracion >= 4) total = 250000;
                  } else {
                    if (duracion >= 8) total = 100000;
                    else if (duracion >= 4) total = 70000;
                  }

                  return (
                    <div style={{ marginTop: '1.2rem' }}>
                      <div className="form-row-3" style={{ marginBottom: '1rem' }}>
                        <div className="form-field">
                          <label>Fecha de Reserva *</label>
                          <div className="field-input-wrap">
                            <input
                              type="date"
                              value={reservaNegocioForm.fecha}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, fecha: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-field">
                          <label>Hora Inicio *</label>
                          <div className="field-input-wrap">
                            <input
                              type="time"
                              value={reservaNegocioForm.hora_inicio}
                              onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, hora_inicio: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-field">
                          <label>Hora Fin *</label>
                          <div className="field-input-wrap">
                            <input
                              type="time"
                              value={reservaNegocioForm.hora_fin}
                              onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, hora_fin: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-field" style={{ marginBottom: '1rem' }}>
                        <label>Observaciones / Requerimientos Especiales</label>
                        <div className="field-input-wrap">
                          <input
                            type="text"
                            placeholder="Ej: Video beam, estación de café gourmet, tomas de corriente..."
                            value={reservaNegocioForm.observaciones}
                            onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, observaciones: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        marginBottom: '1.2rem'
                      }}>
                        {/* Cabecera Espacio y Tarifa */}
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                              ${Number(espSel?.precio_hora || 0).toLocaleString('es-CO')}
                            </span>
                            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginLeft: '5px' }}>
                              COP / hora
                            </span>
                          </div>

                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '9999px',
                            border: '1px solid #e2e8f0'
                          }}>
                            {duracion} {duracion === 1 ? 'hora' : 'horas'} de reserva
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.75rem' }}>
                          {espSel?.nombre || 'Sala / Coworking'} ({espSel?.tipo})
                        </div>

                        {/* Desglose */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                            <span>Horario reservado:</span>
                            <span style={{ fontWeight: 600 }}>{reservaNegocioForm.hora_inicio} a {reservaNegocioForm.hora_fin}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                            <span>Subtotal ({duracion}h × ${Number(espSel?.precio_hora || 0).toLocaleString('es-CO')}):</span>
                            <span style={{ fontWeight: 600 }}>${Number(total).toLocaleString('es-CO')} COP</span>
                          </div>

                          {/* Total final */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            borderTop: '1px solid #e2e8f0',
                            paddingTop: '12px',
                            marginTop: '6px'
                          }}>
                            <div>
                              <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                                Total a pagar
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                Acceso a internet de alta velocidad y café de cortesía
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#d91a2a' }}>
                                ${Number(total).toLocaleString('es-CO')}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px', fontWeight: 700 }}>COP</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!selectedHuesped ? (
                        <button
                          type="button"
                          onClick={() => {
                            setGuestAuthTab('login');
                            setShowGuestAuthModal(true);
                          }}
                          className="btn-submit-red"
                          style={{ background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)' }}
                        >
                          <Lock size={16}/> Iniciar Sesión para Confirmar {espSel?.nombre || 'Espacio'}
                        </button>
                      ) : (
                        <button type="submit" className="btn-submit-red" disabled={loading}>
                          <CheckCircle2 size={16}/> {loading ? 'Confirmando...' : `Confirmar Reserva de ${espSel?.nombre || 'Espacio'}`}
                        </button>
                      )}
                    </div>
                  );
                })() : (
                  <>
                    {/* CALENDARIO DE OCUPACIÓN */}
                    {reservaData.id_habitacion && (() => {
                      const year = calDate.getFullYear();
                      const month = calDate.getMonth();
                      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                      const habReservas = reservas.filter(r => String(r.id_habitacion) === String(reservaData.id_habitacion) && (r.estado === 'Confirmada' || r.estado === 'Check-In'));

                      const firstDay = new Date(year, month, 1);
                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                      let startDay = firstDay.getDay() - 1;
                      if (startDay === -1) startDay = 6;

                      const daysGrid = [];
                      for (let i = 0; i < startDay; i++) daysGrid.push(null);
                      for (let d = 1; d <= daysInMonth; d++) {
                        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const isOccupied = habReservas.some(r => dayStr >= r.fecha_entrada && dayStr <= r.fecha_salida);
                        const isSelectedIn = reservaData.fecha_entrada === dayStr;
                        const isSelectedOut = reservaData.fecha_salida === dayStr;
                        const inRange = reservaData.fecha_entrada && reservaData.fecha_salida && dayStr >= reservaData.fecha_entrada && dayStr <= reservaData.fecha_salida;
                        daysGrid.push({ d, dayStr, isOccupied, isSelectedIn, isSelectedOut, inRange });
                      }

                      const handleDayClick = (item) => {
                        if (!item || item.isOccupied) return;
                        if (!reservaData.fecha_entrada || (reservaData.fecha_entrada && reservaData.fecha_salida)) {
                          setReservaData(prev => ({ ...prev, fecha_entrada: item.dayStr, fecha_salida: '' }));
                        } else if (reservaData.fecha_entrada && !reservaData.fecha_salida) {
                          if (item.dayStr <= reservaData.fecha_entrada) {
                            setReservaData(prev => ({ ...prev, fecha_entrada: item.dayStr, fecha_salida: '' }));
                          } else {
                            const hasBlock = habReservas.some(r => r.fecha_entrada <= item.dayStr && r.fecha_salida >= reservaData.fecha_entrada);
                            if (hasBlock) {
                              setReservaAlert({ type: 'error', message: 'El rango incluye fechas ya reservadas en rojo.' });
                              return;
                            }
                            setReservaData(prev => ({ ...prev, fecha_salida: item.dayStr }));
                          }
                        }
                      };

                      return (
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '1.2rem' }}>
                          
                          {/* Header interactivo del Calendario */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                            <button 
                              type="button" 
                              onClick={() => setCalDate(new Date(year, month - 1, 1))}
                              title="Mes Anterior"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', cursor: 'pointer', fontSize: '0.75rem', padding: '5px 9px', borderRadius: '8px', fontWeight: 700, transition: 'all 0.15s ease' }}
                            >
                              <span>◀ Mes Ant.</span>
                            </button>

                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                              🗓️ Disponibilidad: {monthNames[month]} {year}
                            </span>

                            <button 
                              type="button" 
                              onClick={() => setCalDate(new Date(year, month + 1, 1))}
                              title="Mes Siguiente"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', cursor: 'pointer', fontSize: '0.75rem', padding: '5px 9px', borderRadius: '8px', fontWeight: 700, transition: 'all 0.15s ease' }}
                            >
                              <span>Mes Sig. ▶</span>
                            </button>
                          </div>

                          {/* Leyenda Explicativa de Tres Estados */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '12px', margin: '10px 0', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                              <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', display: 'inline-block' }} />
                              <span>Disponible</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#ef4444' }}>
                              <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#94a3b8', textDecoration: 'line-through 2px #ef4444', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                ✕
                              </span>
                              <span>Ocupado (No disponible)</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#d91a2a' }}>
                              <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#d91a2a', color: '#ffffff', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                ✓
                              </span>
                              <span>Tu Selección</span>
                            </div>
                          </div>

                          {/* Encabezado Días Semanales */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                            <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                          </div>

                          {/* Grilla Interactiva de Días */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                            {daysGrid.map((item, idx) => {
                              if (!item) return <div key={`empty-${idx}`} style={{ height: '36px' }} />;

                              // 1. DÍA OCUPADO (No disponible)
                              if (item.isOccupied) {
                                return (
                                  <div
                                    key={item.dayStr}
                                    title={`Fecha ${item.dayStr} ocupada (No disponible)`}
                                    style={{
                                      height: '36px',
                                      borderRadius: '8px',
                                      backgroundColor: '#f1f5f9',
                                      border: '1px solid #e2e8f0',
                                      color: '#94a3b8',
                                      fontSize: '0.82rem',
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
                                      height: '36px',
                                      borderRadius: '8px',
                                      backgroundColor: esExtremo ? '#d91a2a' : '#fee2e2',
                                      color: esExtremo ? '#ffffff' : '#b91522',
                                      fontSize: '0.82rem',
                                      fontWeight: 800,
                                      border: esExtremo ? 'none' : '1px dashed #fca5a5',
                                      boxShadow: esExtremo ? '0 2px 8px rgba(217, 26, 42, 0.35)' : 'none',
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
                                    height: '36px',
                                    borderRadius: '8px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    color: '#0f172a',
                                    fontSize: '0.82rem',
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
                      );
                    })()}

                    <div className="form-row-3">
                      <div className="form-field">
                        <label>Check-In</label>
                        <div className="field-input-wrap">
                          <input type="date" name="fecha_entrada" value={reservaData.fecha_entrada} onChange={handleReservaChange} required/>
                        </div>
                      </div>
                      <div className="form-field">
                        <label>Check-Out</label>
                        <div className="field-input-wrap">
                          <input type="date" name="fecha_salida" value={reservaData.fecha_salida} onChange={handleReservaChange} required/>
                        </div>
                      </div>
                      <div className="form-field">
                        <label>Personas</label>
                        <div className="field-input-wrap">
                          <Users className="field-icon" size={16}/>
                          <input type="number" name="numero_personas" min="1" max="10" value={reservaData.numero_personas} onChange={handleReservaChange} required/>
                        </div>
                      </div>
                    </div>

                    {cotizacion && (
                      <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        marginBottom: '1.2rem',
                        marginTop: '1.2rem'
                      }}>
                        {/* Cabecera con Tarifa por Noche y Badge de Noches */}
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                              ${Number(cotizacion.precio_noche || 0).toLocaleString('es-CO')}
                            </span>
                            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginLeft: '5px' }}>
                              COP / noche
                            </span>
                          </div>

                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '9999px',
                            border: '1px solid #e2e8f0'
                          }}>
                            {cotizacion.noches || 1} {(cotizacion.noches || 1) === 1 ? 'noche' : 'noches'} seleccionadas
                          </span>
                        </div>

                        {/* Rango de Fechas */}
                        {reservaData.fecha_entrada && reservaData.fecha_salida && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="#94a3b8" />
                            <span>
                              <strong>{reservaData.fecha_entrada.split('-').reverse().join('/')}</strong> al <strong>{reservaData.fecha_salida.split('-').reverse().join('/')}</strong>
                            </span>
                          </div>
                        )}

                        {/* Desglose de Cálculo */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                            <span>{cotizacion.noches || 1} {(cotizacion.noches || 1) === 1 ? 'noche' : 'noches'} × ${Number(cotizacion.precio_noche || 0).toLocaleString('es-CO')} COP</span>
                            <span style={{ fontWeight: 600 }}>${Number(cotizacion.subtotal || 0).toLocaleString('es-CO')} COP</span>
                          </div>

                          {/* Descuento si aplica */}
                          {Number(cotizacion.descuento || 0) > 0 ? (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: '#ecfdf5',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              color: '#065f46',
                              fontWeight: 700,
                              border: '1px solid #a7f3d0'
                            }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span>🎉 Descuento Larga Estadía ({(cotizacion.noches || 0) >= 15 ? '15%' : '10%'})</span>
                              </span>
                              <span>-${Number(cotizacion.descuento || 0).toLocaleString('es-CO')} COP</span>
                            </div>
                          ) : (
                            <div style={{
                              backgroundColor: '#f8fafc',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.72rem',
                              color: '#64748b',
                              border: '1px dashed #cbd5e1'
                            }}>
                              💡 <strong>Ahorro disponible:</strong> Reserva 7 o más noches para obtener un <strong>10% de descuento automático</strong>.
                            </div>
                          )}

                          {/* Total final destacado */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            borderTop: '1px solid #e2e8f0',
                            paddingTop: '12px',
                            marginTop: '6px'
                          }}>
                            <div>
                              <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                                Total a pagar
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                Impuestos incluidos • Sin cargos sorpresa
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#d91a2a' }}>
                                ${Number(cotizacion.total || 0).toLocaleString('es-CO')}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px', fontWeight: 700 }}>COP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!selectedHuesped ? (
                      <button
                        type="button"
                        onClick={() => {
                          setGuestAuthTab('login');
                          setShowGuestAuthModal(true);
                        }}
                        className="btn-submit-red"
                        style={{ background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)' }}
                      >
                        <Lock size={16}/> Iniciar Sesión / Registrarme para Confirmar
                      </button>
                    ) : (
                      <button type="submit" className="btn-submit-red" disabled={loading}>
                        <CheckCircle2 size={16}/> {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                      </button>
                    )}
                  </>
                )}
              </form>

              {reservaAlert && (
                <div className={`msg-alert msg-${reservaAlert.type}`}>
                  <AlertCircle size={18}/>
                  <span>{reservaAlert.message}</span>
                </div>
              )}
            </div>
          </div>
        </section>
  );
};

export default VistaReservar;
