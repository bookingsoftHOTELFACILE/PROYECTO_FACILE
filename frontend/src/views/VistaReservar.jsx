import {
  UserPlus, ShieldCheck, Mail, Phone, FileText, Briefcase,
  Users, AlertCircle, Calendar, Home, User, CheckCircle2,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const VistaReservar = () => {
  const {
  habitaciones, reservas, espaciosNegocio, reservaNegocioForm,
  setReservaNegocioForm, setActiveTab, formData, habeasData,
  setHabeasData, selectedHuesped, setSelectedHuesped, reservaData,
  setReservaData, cotizacion, calDate, setCalDate,
  loading, alert, reservaAlert, setReservaAlert,
  handleUserChange, handleReservaChange, handleUserSubmit, handleReservaSubmit
  } = useApp();
  return (
        <section className="facile-section">
          <div className="section-title-wrap">
            <h2>{selectedHuesped ? 'Reservar Apartamento' : 'Reservar en Línea'}</h2>
            <p>{selectedHuesped ? 'Seleccione las fechas y confirme su estadía de forma inmediata' : 'Auto-registro de huésped y reserva con cálculo automático de cotización'}</p>
          </div>

          <div className="booking-grid" style={selectedHuesped ? { gridTemplateColumns: '1fr', maxWidth: '850px', margin: '0 auto' } : {}}>
            {/* PASO 1: REGISTRO DE HUÉSPED (Solo se muestra a visitantes no autenticados) */}
            {!selectedHuesped && (
              <div className="clean-card">
                <div className="card-step-badge">Paso 1</div>
                <div className="clean-card-header">
                  <UserPlus size={20} color="var(--color-primary-red)"/>
                  <h3>Registro de Huésped</h3>
                </div>
                <p className="clean-card-desc">
                  Cree su perfil público para habilitar la reserva de su apartamento.
                </p>

                <form onSubmit={handleUserSubmit}>
                  <div className="form-field">
                    <label>Nombre Completo</label>
                    <div className="field-input-wrap">
                      <FileText className="field-icon" size={16}/>
                      <input type="text" name="nombre" value={formData.nombre} onChange={handleUserChange} placeholder="Ej: Liliana Restrepo" required/>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Documento (Solo números)</label>
                      <div className="field-input-wrap">
                        <ShieldCheck className="field-icon" size={16}/>
                        <input type="text" name="documento" value={formData.documento} onChange={handleUserChange} placeholder="Ej: 1017283944" maxLength={15} required/>
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Teléfono de Contacto</label>
                      <div className="field-input-wrap">
                        <Phone className="field-icon" size={16}/>
                        <input type="text" name="telefono" value={formData.telefono} onChange={handleUserChange} placeholder="Ej: 3154449876" maxLength={15} required/>
                      </div>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Correo Electrónico</label>
                      <div className="field-input-wrap">
                        <Mail className="field-icon" size={16}/>
                        <input type="email" name="correo" value={formData.correo} onChange={handleUserChange} placeholder="Ej: correo@ejemplo.com" required/>
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Empresa (Opcional)</label>
                      <div className="field-input-wrap">
                        <Briefcase className="field-icon" size={16}/>
                        <input type="text" name="empresa" value={formData.empresa} onChange={handleUserChange} placeholder="Ej: Bancolombia"/>
                      </div>
                    </div>
                  </div>

                  <label className="checkbox-legal">
                    <input type="checkbox" checked={habeasData} onChange={(e) => setHabeasData(e.target.checked)}/>
                    <span>Autorizo el tratamiento de mis datos personales según la <strong>Ley de Habeas Data (Ley 1581 de 2012)</strong>.</span>
                  </label>

                  <button type="submit" className="btn-submit-red" disabled={loading}>
                    <UserPlus size={16}/> {loading ? 'Registrando...' : 'Registrarme como Huésped'}
                  </button>
                </form>

                {alert && (
                  <div className={`msg-alert msg-${alert.type}`}>
                    <AlertCircle size={18}/>
                    <span>{alert.message}</span>
                  </div>
                )}
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
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <div style={{ width: '32px', height: '32px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={18} color="#e11d48"/>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{selectedHuesped?.nombre || 'Huésped Registrado'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Doc: {selectedHuesped?.documento || 'N/A'} {selectedHuesped?.correo ? `• ${selectedHuesped.correo}` : ''}</div>
                    </div>
                  </div>
                  <button type="button" className="btn-mini" onClick={() => setSelectedHuesped(null)}>Cambiar / Cerrar</button>
                </div>
              ) : (
                <p className="clean-card-desc" style={{ color: '#b45309' }}>
                  ⚠️ Regístrese en el <strong>Paso 1</strong> o seleccione un huésped existente para continuar.
                </p>
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
                    <select name="id_habitacion" value={reservaData.id_habitacion} onChange={handleReservaChange} required disabled={!selectedHuesped}>
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
                              disabled={!selectedHuesped}
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
                              disabled={!selectedHuesped}
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
                              disabled={!selectedHuesped}
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
                            disabled={!selectedHuesped}
                          />
                        </div>
                      </div>

                      <div className="live-quote-box" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.2rem' }}>
                        <h4 style={{ margin: '0 0 0.8rem', color: '#0f172a', fontSize: '0.95rem' }}>Resumen de Cotización — Centro de Negocios</h4>
                        <div className="quote-row"><span>Espacio:</span><strong>{espSel?.nombre || 'Sala / Coworking'} ({espSel?.tipo})</strong></div>
                        <div className="quote-row"><span>Tarifa por Hora:</span><span>${Number(espSel?.precio_hora || 0).toLocaleString('es-CO')} COP / hora</span></div>
                        <div className="quote-row"><span>Horario:</span><span>{reservaNegocioForm.hora_inicio} a {reservaNegocioForm.hora_fin} ({duracion} {duracion === 1 ? 'hora' : 'horas'})</span></div>
                        <div className="quote-row final-total" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', marginTop: '0.6rem', fontWeight: 800, color: '#e11d48', fontSize: '1.1rem' }}>
                          <span>Total a Pagar:</span>
                          <span>${Number(total).toLocaleString('es-CO')} COP</span>
                        </div>
                      </div>

                      <button type="submit" className="btn-submit-red" disabled={loading || !selectedHuesped}>
                        <CheckCircle2 size={16}/> {loading ? 'Confirmando...' : `Confirmar Reserva de ${espSel?.nombre || 'Espacio'}`}
                      </button>
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
                        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                            <button type="button" className="btn-mini" onClick={() => setCalDate(new Date(year, month - 1, 1))}>◀ Mes Ant.</button>
                            <strong style={{ color: '#0f172a', fontSize: '0.92rem', textTransform: 'capitalize' }}>🗓️ Disponibilidad en Calendario: {monthNames[month]} {year}</strong>
                            <button className="btn-mini" type="button" onClick={() => setCalDate(new Date(year, month + 1, 1))}>Mes Sig. ▶</button>
                          </div>

                          <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '0.8rem', fontSize: '0.78rem', justifyContent: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#991b1b', fontWeight: 700 }}>
                              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444', display: 'inline-block' }}/> 🔴 Fechas Ocupadas
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#166534', fontWeight: 700 }}>
                              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#22c55e', display: 'inline-block' }}/> 🟢 Fechas Libres
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#1d4ed8', fontWeight: 700 }}>
                              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2563eb', display: 'inline-block' }}/> 🔵 Tu Selección
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
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
                                    borderRadius: '6px',
                                    padding: '0.45rem 0.2rem',
                                    fontSize: '0.8rem',
                                    cursor: item.isOccupied ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <span>{item.d}</span>
                                  {item.isOccupied && <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', marginTop: '1px' }}>Ocupado</span>}
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
                          <input type="date" name="fecha_entrada" value={reservaData.fecha_entrada} onChange={handleReservaChange} required disabled={!selectedHuesped}/>
                        </div>
                      </div>
                      <div className="form-field">
                        <label>Check-Out</label>
                        <div className="field-input-wrap">
                          <input type="date" name="fecha_salida" value={reservaData.fecha_salida} onChange={handleReservaChange} required disabled={!selectedHuesped}/>
                        </div>
                      </div>
                      <div className="form-field">
                        <label>Personas</label>
                        <div className="field-input-wrap">
                          <Users className="field-icon" size={16}/>
                          <input type="number" name="numero_personas" min="1" max="10" value={reservaData.numero_personas} onChange={handleReservaChange} required disabled={!selectedHuesped}/>
                        </div>
                      </div>
                    </div>

                    {cotizacion && (
                      <div className="live-quote-box">
                        <h4>Resumen de Cotización</h4>
                        <div className="quote-row"><span>Valor por Noche:</span><strong>${Number(cotizacion.precio_noche || 0).toLocaleString('es-CO')} COP / noche</strong></div>
                        <div className="quote-row"><span>Duración de Estadía:</span><span>{cotizacion.noches || 1} {(cotizacion.noches || 1) === 1 ? 'noche' : 'noches'}</span></div>
                        <div className="quote-row"><span>Subtotal Estadía:</span><span>${Number(cotizacion.subtotal || 0).toLocaleString('es-CO')} COP</span></div>
                        {Number(cotizacion.descuento || 0) > 0 && (
                          <div className="quote-row discount">
                            <span>Descuento Larga Estadía ({(cotizacion.noches || 0) >= 15 ? '15%' : '10%'}):</span>
                            <span>-${Number(cotizacion.descuento || 0).toLocaleString('es-CO')} COP</span>
                          </div>
                        )}
                        <div className="quote-row final-total">
                          <span>Total a Pagar:</span>
                          <span>${Number(cotizacion.total || 0).toLocaleString('es-CO')} COP</span>
                        </div>
                      </div>
                    )}

                    <button type="submit" className="btn-submit-red" disabled={loading || !selectedHuesped}>
                      <CheckCircle2 size={16}/> {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                    </button>
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
