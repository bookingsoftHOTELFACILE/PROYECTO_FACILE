/*
  VistaPms — extraído de App.jsx durante la Fase A de descomposición.
  El estado y los handlers se consumen desde AppContext vía useApp().
*/
import {
  UserPlus, ShieldCheck, Users, Calendar, ListOrdered, Trash2,
  Wrench, Check, Search, Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const VistaPms = () => {
  const {
  huespedes, habitaciones, reservas, espaciosNegocio,
  reservasNegocio, reservaNegocioForm, setReservaNegocioForm, reservaNegocioAlert,
  selectedHuesped, setSelectedHuesped, empleadosList, newEmpleadoForm,
  setNewEmpleadoForm, showCreateEmpleadoModal, setShowCreateEmpleadoModal, empleadoAlert,
  reservaData, setReservaData, cotizacion, calDate,
  setCalDate, loading, reservaAlert, setReservaAlert,
  filtroHabitaciones, setFiltroHabitaciones, usuarioSesion, setShowGuestAuthModal,
  setGuestAuthTab, pmsWalkInGuest, setPmsWalkInGuest, pmsSubTab,
  setPmsSubTab, handleCreateEmpleadoSubmit, handleChangeEmpleadoRol, handleToggleEmpleadoEstado,
  handleReservaChange, handlePmsWalkInGuestChange, handleReservaSubmit, handleToggleEstadoHuesped,
  handleDeleteHuesped, handleDeleteReserva, handleCambiarEstadoHabitacion, handleReportarDano,
  handleCambiarEstadoReserva, walkinCheckinInmediato, setWalkinCheckinInmediato,
  handleCrearReservaNegocio, handleBuscarHuespedPorDocumento, handleCancelarReservaNegocio
  } = useApp();
  return (
        <section className="facile-section">
          <div className="pms-header">
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Panel de Control Hotelero (PMS)</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Módulo interno de gestión por sub-pestañas independientes
              </p>
            </div>
            {usuarioSesion && (
              <span className="pms-badge">
                👤 {usuarioSesion.nombre} — <strong>{usuarioSesion.rol}</strong>
              </span>
            )}
          </div>

          {/* BARRA DE NAVEGACIÓN RÁPIDA DE SUB-PESTAÑAS PMS SEGÚN EL ROL DE EMPLEADO */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.8rem' }}>
            {/* SUB-PESTAÑA ADMINISTRACIÓN DE PERSONAL — Solo para Administrador / Grupo BookingSoft */}
            {(usuarioSesion?.rol === 'Administrador' || usuarioSesion?.rol === 'Grupo BookingSoft') && (
              <button
                className="btn-mini"
                onClick={() => setPmsSubTab('empleados')}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  background: pmsSubTab === 'empleados' ? '#e11d48' : '#334155',
                  color: '#ffffff',
                  border: '1px solid #1e293b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                👑 Personal & Roles ({empleadosList.length})
              </button>
            )}

            {/* SUB-PESTAÑAS OPERATIVAS (RECEPCIÓN, HUÉSPEDES, RESERVAS, COWORKING) */}
            {(usuarioSesion?.rol === 'Administrador' || usuarioSesion?.rol === 'Grupo BookingSoft' || usuarioSesion?.rol === 'Recepcionista 24h') && (
              <>
                <button
                  className="btn-mini"
                  onClick={() => setPmsSubTab('recepcion')}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    background: pmsSubTab === 'recepcion' ? '#e11d48' : '#ffffff',
                    color: pmsSubTab === 'recepcion' ? '#ffffff' : '#475569',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  🛎️ Recepción (Walk-in)
                </button>
                <button
                  className="btn-mini"
                  onClick={() => setPmsSubTab('huespedes')}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    background: pmsSubTab === 'huespedes' ? '#e11d48' : '#ffffff',
                    color: pmsSubTab === 'huespedes' ? '#ffffff' : '#475569',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  👥 Huéspedes ({huespedes.length})
                </button>
                <button
                  className="btn-mini"
                  onClick={() => setPmsSubTab('reservas')}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    background: pmsSubTab === 'reservas' ? '#e11d48' : '#ffffff',
                    color: pmsSubTab === 'reservas' ? '#ffffff' : '#475569',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  📋 Reservas ({reservas.length})
                </button>
              </>
            )}

            {/* MANTENIMIENTO Y ASEO — Acceso para todos los roles de planta */}
            <button
              className="btn-mini"
              onClick={() => {
                setPmsSubTab('planta');
                if (usuarioSesion?.rol === 'Ama de llaves') setFiltroHabitaciones('amas_llaves');
                else if (usuarioSesion?.rol === 'Personal de mantenimiento') setFiltroHabitaciones('mantenimiento');
              }}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.84rem',
                background: pmsSubTab === 'planta' ? '#e11d48' : '#ffffff',
                color: pmsSubTab === 'planta' ? '#ffffff' : '#475569',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              🛠️ Mantenimiento y Aseo
            </button>

            {(usuarioSesion?.rol === 'Administrador' || usuarioSesion?.rol === 'Grupo BookingSoft' || usuarioSesion?.rol === 'Recepcionista 24h') && (
              <button
                className="btn-mini"
                onClick={() => setPmsSubTab('coworking')}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  background: pmsSubTab === 'coworking' ? '#e11d48' : '#ffffff',
                  color: pmsSubTab === 'coworking' ? '#ffffff' : '#475569',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                💼 Salas & Coworking
              </button>
            )}

            {(usuarioSesion?.rol === 'Administrador' || usuarioSesion?.rol === 'Grupo BookingSoft') && (
              <button
                className="btn-mini"
                onClick={() => setPmsSubTab('todos')}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  background: pmsSubTab === 'todos' ? '#0f172a' : '#ffffff',
                  color: pmsSubTab === 'todos' ? '#ffffff' : '#475569',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                📊 Ver Todo
              </button>
            )}
          </div>

          {/* 0. SUB-PESTAÑA 0: MÓDULO EXCLUSIVO DE GESTIÓN DE PERSONAL & ROLES (ADMINISTRADOR / GRUPO BOOKINGSOFT) */}
          {(pmsSubTab === 'empleados' || pmsSubTab === 'todos') && (usuarioSesion?.rol === 'Administrador' || usuarioSesion?.rol === 'Grupo BookingSoft') && (
            <div id="pms-empleados-module" className="clean-card" style={{ marginBottom: '1.5rem', border: '1.5px solid #0f172a', background: '#ffffff', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
              <div className="clean-card-header" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldCheck size={22} color="#0f172a"/>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                      👑 Panel de Superusuario — Gestión de Personal & Roles (Grupo BookingSoft)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                      Control integral de empleados, asignación de roles operativos y estados del personal.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-mini"
                  onClick={() => setShowCreateEmpleadoModal(true)}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.2)'
                  }}
                >
                  <UserPlus size={16}/> + Registrar Nuevo Empleado
                </button>
              </div>

              {empleadoAlert && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: empleadoAlert.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: empleadoAlert.type === 'success' ? '#166534' : '#991b1b',
                  border: `1px solid ${empleadoAlert.type === 'success' ? '#bbf7d0' : '#fecdd3'}`
                }}>
                  {empleadoAlert.message}
                </div>
              )}

              {/* MODAL / FORMULARIO PARA REGISTRAR UN NUEVO EMPLEADO */}
              {showCreateEmpleadoModal && (
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>➕ Registrar Nuevo Empleado del Apartahotel</h4>
                    <button type="button" className="btn-mini" onClick={() => setShowCreateEmpleadoModal(false)} style={{ background: '#e2e8f0', color: '#334155' }}>
                      ✖️ Cerrar
                    </button>
                  </div>
                  <form onSubmit={handleCreateEmpleadoSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        value={newEmpleadoForm.nombre}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, nombre: e.target.value })}
                        placeholder="Ej: Carlos Mendoza"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Usuario de Acceso *</label>
                      <input
                        type="text"
                        required
                        value={newEmpleadoForm.usuario}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, usuario: e.target.value })}
                        placeholder="Ej: cmendoza"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Contraseña Inicial *</label>
                      <input
                        type="password"
                        required
                        value={newEmpleadoForm.contrasena}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, contrasena: e.target.value })}
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Tipo de Documento</label>
                      <select
                        value={newEmpleadoForm.tipo_documento}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, tipo_documento: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      >
                        <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="Cédula de extranjería">Cédula de extranjería</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Número de Documento *</label>
                      <input
                        type="text"
                        required
                        value={newEmpleadoForm.numero_documento}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, numero_documento: e.target.value })}
                        placeholder="1018459201"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Correo Electrónico *</label>
                      <input
                        type="email"
                        required
                        value={newEmpleadoForm.correo}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, correo: e.target.value })}
                        placeholder="empleado@bookingsoft.com"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Rol Operativo Asignado</label>
                      <select
                        value={newEmpleadoForm.rol}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, rol: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, color: '#e11d48' }}
                      >
                        <option value="Recepcionista 24h">Recepcionista 24h</option>
                        <option value="Ama de llaves">Ama de llaves (Limpieza)</option>
                        <option value="Personal de mantenimiento">Personal de mantenimiento (Reparaciones)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        type="submit"
                        className="btn-mini"
                        style={{
                          width: '100%',
                          padding: '0.65rem',
                          background: '#e11d48',
                          color: '#ffffff',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        ✅ Crear Cuenta de Empleado
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TABLA DE EMPLEADOS DEL SISTEMA */}
              <div className="pms-table-wrap">
                <table className="pms-table">
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Usuario</th>
                      <th>Rol en Sistema</th>
                      <th>Estado</th>
                      <th>Documento & Contacto</th>
                      <th>Acción de Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleadosList.map(emp => (
                      <tr key={emp.id_empleado}>
                        <td>
                          <strong>{emp.nombre}</strong>
                        </td>
                        <td>
                          <code style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>@{emp.usuario}</code>
                        </td>
                        <td>
                          {emp.rol === 'Administrador' ? (
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9333ea', background: '#f3e8ff', padding: '0.25rem 0.6rem', borderRadius: '12px', border: '1px solid #d8b4fe' }}>
                              👑 Administrador (Superusuario)
                            </span>
                          ) : (
                            <select
                              value={emp.rol}
                              onChange={e => handleChangeEmpleadoRol(emp.id_empleado, e.target.value)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#1e293b'
                              }}
                            >
                              <option value="Recepcionista 24h">Recepcionista 24h</option>
                              <option value="Ama de llaves">Ama de llaves</option>
                              <option value="Personal de mantenimiento">Personal de mantenimiento</option>
                            </select>
                          )}
                        </td>
                        <td>
                          <span className={`badge-tag ${emp.estado === 'Activo' ? 'badge-avail' : 'badge-maint'}`}>
                            {emp.estado}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {emp.tipo_documento}: {emp.numero_documento}<br/>
                          ✉️ {emp.correo}
                        </td>
                        <td>
                          <button
                            className="btn-mini"
                            onClick={() => handleToggleEmpleadoEstado(emp)}
                            style={{
                              background: emp.estado === 'Activo' ? '#fee2e2' : '#dcfce7',
                              color: emp.estado === 'Activo' ? '#991b1b' : '#166534',
                              border: `1px solid ${emp.estado === 'Activo' ? '#fecdd3' : '#bbf7d0'}`,
                              fontWeight: 700
                            }}
                          >
                            {emp.estado === 'Activo' ? '🚫 Desactivar' : '✅ Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 1. SUB-PESTAÑA 1: MÓDULO DE CREACIÓN DE RESERVAS PRESENCIALES EN RECEPCIÓN (WALK-IN) */}
          {(pmsSubTab === 'recepcion' || pmsSubTab === 'todos') && (
          <div id="pms-reception-reserva-module" className="clean-card" style={{ marginBottom: '1.5rem', border: '1px solid #cbd5e1', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div className="clean-card-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="var(--color-primary-red)"/>
                <h3 style={{ fontSize: '1.15rem', color: '#1e293b', fontWeight: 700 }}>
                  🛎️ Módulo de Recepción — Crear Nueva Reserva Presencial (Walk-in)
                </h3>
              </div>
              <span style={{ fontSize: '0.78rem', background: '#fff1f2', color: '#e11d48', padding: '0.25rem 0.65rem', borderRadius: '20px', fontWeight: 600, border: '1px solid #fecdd3' }}>
                Atención Presencial en Hotel
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '-0.3rem 0 1rem' }}>
              Seleccione un huésped existente o ingrese directamente sus datos de contacto e identidad (Cédula, Pasaporte o C.E.) para confirmar su reserva.
            </p>

            {reservaAlert && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1rem',
                background: reservaAlert.type === 'success' ? '#f0fdf4' : reservaAlert.type === 'info' ? '#eff6ff' : '#fee2e2',
                color: reservaAlert.type === 'success' ? '#166534' : reservaAlert.type === 'info' ? '#1e40af' : '#991b1b',
                border: `1px solid ${reservaAlert.type === 'success' ? '#bbf7d0' : reservaAlert.type === 'info' ? '#bfdbfe' : '#fca5a5'}`
              }}>
                {reservaAlert.type === 'success' ? '🎉 ' : reservaAlert.type === 'info' ? 'ℹ️ ' : '⚠️ '}
                {reservaAlert.message}
              </div>
            )}

            <form onSubmit={handleReservaSubmit}>
              {/* FORMULARIO ÚNICO INTELIGENTE DE RECEPCIÓN PRESENCIAL (WALK-IN) */}
              <div style={{ marginBottom: '1.2rem', background: '#ffffff', padding: '1.2rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={18} color="#e11d48"/> Datos del Huésped Presencial (Walk-in)
                  </h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Digite el número de documento para auto-completar datos de un huésped existente o ingrese la información si es un nuevo registro.
                  </p>
                </div>

                {selectedHuesped ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.4rem 0.8rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                      ✓ Huésped Frecuente Encontrado: {selectedHuesped.nombre}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHuesped(null);
                        setPmsWalkInGuest({ tipo_documento: 'Cédula de Ciudadanía', documento: '', nombre: '', telefono: '', correo: '' });
                      }}
                      style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', marginLeft: '0.3rem' }}
                      title="Limpiar campos"
                    >
                      ✕
                    </button>
                  </div>
                ) : pmsWalkInGuest.documento ? (
                  <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                    ➕ Nuevo Huésped - Complete sus datos
                  </span>
                ) : null}
              </div>

              {/* FILA 1: TIPO DOC, NÚMERO DOC Y BÚSQUEDA INTEGRA, NOMBRE COMPLETO */}
              <div className="form-row-3" style={{ marginBottom: '0.8rem' }}>
                <div className="form-field">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Tipo de Documento</label>
                  <select
                    name="tipo_documento"
                    value={pmsWalkInGuest.tipo_documento}
                    onChange={handlePmsWalkInGuestChange}
                    style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.85rem', background: '#fff' }}
                  >
                    <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                  </select>
                </div>

                <div className="form-field">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Número de Documento *</span>
                    <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>💡 Presione Enter o 🔍</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <input
                      type="text"
                      name="documento"
                      value={pmsWalkInGuest.documento}
                      onChange={(e) => {
                        handlePmsWalkInGuestChange(e);
                        const val = e.target.value.trim();
                        if (val) {
                          const match = huespedes.find(h => h.documento && h.documento.trim() === val);
                          if (match) {
                            setSelectedHuesped(match);
                            setPmsWalkInGuest(prev => ({
                              ...prev,
                              nombre: match.nombre,
                              telefono: match.telefono || prev.telefono,
                              correo: match.correo || prev.correo
                            }));
                          } else {
                            setSelectedHuesped(null);
                          }
                        } else {
                          setSelectedHuesped(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBuscarHuespedPorDocumento(pmsWalkInGuest.documento);
                        }
                      }}
                      placeholder={pmsWalkInGuest.tipo_documento === 'Pasaporte' ? 'Ej: AA1234567' : 'Ej: 1017283944'}
                      maxLength={20}
                      required
                      style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.85rem', background: '#fff' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleBuscarHuespedPorDocumento(pmsWalkInGuest.documento)}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 0.9rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      title="Buscar en base de datos"
                    >
                      <Search size={14}/> Buscar
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={pmsWalkInGuest.nombre}
                    onChange={handlePmsWalkInGuestChange}
                    placeholder="Ej: Carlos Mario Mendoza"
                    required
                    style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.85rem', background: '#fff' }}
                  />
                </div>
              </div>

              {/* FILA 2: CELULAR Y CORREO */}
              <div className="form-row-2">
                <div className="form-field">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Celular / Teléfono *</label>
                  <input
                    type="text"
                    name="telefono"
                    value={pmsWalkInGuest.telefono}
                    onChange={handlePmsWalkInGuestChange}
                    placeholder="Ej: 3154449876"
                    maxLength={15}
                    required
                    style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.85rem', background: '#fff' }}
                  />
                </div>

                <div className="form-field">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Correo Electrónico *</label>
                  <input
                    type="email"
                    name="correo"
                    value={pmsWalkInGuest.correo}
                    onChange={handlePmsWalkInGuestChange}
                    placeholder="Ej: huesped@ejemplo.com"
                    required
                    style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.85rem', background: '#fff' }}
                  />
                </div>
              </div>
            </div>

            {/* SELECCIÓN DE HABITACIÓN Y PERSONAS */}
            <div className="form-row-2" style={{ marginBottom: '1rem' }}>
              <div className="form-field">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                  Apartamento / Habitación
                </label>
                <select
                  name="id_habitacion"
                  value={reservaData.id_habitacion}
                  onChange={handleReservaChange}
                  required
                  style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.88rem', background: '#fff' }}
                >
                  <option value="">-- Seleccionar Unidad Disponible --</option>
                  {habitaciones.map(hab => (
                    <option key={hab.id_habitacion} value={hab.id_habitacion}>
                      Apto {hab.numero} — {hab.tipo} (${hab.precio_noche ? hab.precio_noche.toLocaleString('es-CO') : '0'}/noche) [{hab.estado}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>
                  Número de Personas
                </label>
                <input
                  type="number"
                  name="numero_personas"
                  min="1"
                  max="10"
                  value={reservaData.numero_personas}
                  onChange={handleReservaChange}
                  required
                  style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.88rem', background: '#fff' }}
                />
              </div>
            </div>

              {/* CALENDARIO DE OCUPACIÓN VISUAL EN RECEPCIÓN (FECHAS EN ROJO) */}
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
                        setReservaAlert({ type: 'error', message: 'El rango seleccionado incluye fechas ocupadas en rojo.' });
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

              <div className="form-row-2" style={{ marginBottom: '1rem' }}>
                {/* FECHA DE ENTRADA */}
                <div className="form-field">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Fecha de Entrada (Check-in)
                  </label>
                  <input
                    type="date"
                    name="fecha_entrada"
                    value={reservaData.fecha_entrada}
                    onChange={handleReservaChange}
                    required
                    style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.88rem', background: '#fff' }}
                  />
                </div>

                {/* FECHA DE SALIDA */}
                <div className="form-field">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Fecha de Salida (Check-out)
                  </label>
                  <input
                    type="date"
                    name="fecha_salida"
                    value={reservaData.fecha_salida}
                    onChange={handleReservaChange}
                    required
                    style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.88rem', background: '#fff' }}
                  />
                </div>
              </div>

              {/* TARJETA DE RESUMEN DE COTIZACIÓN EN TIEMPO REAL */}
              {cotizacion && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem', marginBottom: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.92rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Tag size={16} color="#e11d48"/> Resumen de Cotización (Apto {cotizacion.habitacion?.numero})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', color: '#334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Valor por Noche:</span>
                      <strong>${cotizacion.precio_noche ? cotizacion.precio_noche.toLocaleString('es-CO') : '0'} COP / noche</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Duración de Estadía:</span>
                      <strong>{cotizacion.noches} {cotizacion.noches === 1 ? 'noche' : 'noches'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal Estadía:</span>
                      <span>${cotizacion.subtotal.toLocaleString('es-CO')} COP</span>
                    </div>
                    {cotizacion.descuento > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                        <span>Descuento Larga Estadía ({cotizacion.noches >= 15 ? '15%' : '10%'}):</span>
                        <span>-${cotizacion.descuento.toLocaleString('es-CO')} COP</span>
                      </div>
                    )}
                    <div style={{ borderTop: '1.5px solid #cbd5e1', paddingTop: '0.6rem', marginTop: '0.3rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: '#e11d48' }}>
                      <span>TOTAL ESTIMADO:</span>
                      <span>${cotizacion.total.toLocaleString('es-CO')} COP</span>
                    </div>
                  </div>
                </div>
              )}

              {/* HU-005 / CA-005.2: check-in directo para llegadas sin reserva previa (walk-in) */}
              <label
                htmlFor="pms-walkin-checkin"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem',
                  padding: '0.7rem 0.9rem', background: '#f8fafc', border: '1px dashed #cbd5e1',
                  borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <input
                  id="pms-walkin-checkin"
                  type="checkbox"
                  checked={walkinCheckinInmediato}
                  onChange={(e) => setWalkinCheckinInmediato(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#e11d48', cursor: 'pointer' }}
                />
                🚪 Registrar check-in directo (el huésped ya se encuentra en la unidad)
              </label>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1.2rem' }}>
                <button
                  type="button"
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedHuesped(null);
                    setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
                    setPmsWalkInGuest({ tipo_documento: 'Cédula de Ciudadanía', documento: '', nombre: '', telefono: '', correo: '' });
                    setWalkinCheckinInmediato(false);
                  }}
                >
                  Limpiar Formulario
                </button>
                <button
                  type="submit"
                  className="btn-airbnb-primary"
                  style={{ marginTop: 0, padding: '0.65rem 1.5rem', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  disabled={loading}
                >
                  <Calendar size={16}/>
                  {loading ? 'Guardando Reserva...' : 'Confirmar Reserva Presencial (Check-in)'}
                </button>
              </div>
            </form>
          </div>
          )}

          {/* 2. SUB-PESTAÑA 2: HUÉSPEDES REGISTRADOS */}
          {(pmsSubTab === 'huespedes' || pmsSubTab === 'todos') && (
            <div id="pms-huespedes-table" className="clean-card" style={{ marginBottom: '1.5rem' }}>
              <div className="clean-card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={18} color="var(--color-primary-red)"/>
                  <h3 style={{ fontSize: '1.1rem' }}>Huéspedes Registrados ({huespedes.length})</h3>
                </div>
                <button
                  type="button"
                  className="btn-mini"
                  style={{ background: '#e11d48', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', borderRadius: '6px' }}
                  onClick={() => {
                    setShowGuestAuthModal(true);
                    setGuestAuthTab('registro');
                  }}
                >
                  + Nuevo Huésped
                </button>
              </div>
              <div className="pms-table-wrap">
                <table className="pms-table">
                  <thead>
                    <tr><th>Nombre</th><th>Documento</th><th>Acción</th></tr>
                  </thead>
                  <tbody>
                    {huespedes.map(h => (
                      <tr key={h.id_huesped}>
                        <td>
                          <strong>{h.nombre}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>{h.empresa || 'Particular'}</span>
                          {h.modificado_por && <span style={{ fontSize: '0.68rem', color: '#0284c7' }}>Auditoría: {h.modificado_por}</span>}
                        </td>
                        <td><code>{h.documento}</code></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              className="btn-mini"
                              style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', fontWeight: 700 }}
                              onClick={() => {
                                setSelectedHuesped(h);
                                setPmsSubTab('recepcion');
                              }}
                            >
                              + Reservar
                            </button>
                            <button className="btn-mini" onClick={() => handleToggleEstadoHuesped(h)}>
                              {h.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                            </button>
                            <button className="btn-mini" style={{ color: '#ef4444' }} onClick={() => handleDeleteHuesped(h.id_huesped)}>
                              <Trash2 size={11}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. SUB-PESTAÑA 3: RESERVAS ACTIVAS DE APARTAMENTOS */}
          {(pmsSubTab === 'reservas' || pmsSubTab === 'todos') && (
            <div id="pms-reservas-table" className="clean-card" style={{ marginBottom: '1.5rem' }}>
              <div className="clean-card-header">
                <ListOrdered size={18} color="var(--color-primary-red)"/>
                <h3 style={{ fontSize: '1.1rem' }}>Reservas Activas ({reservas.filter(r => r.estado !== 'Cancelada').length})</h3>
              </div>
              {reservaAlert && (
                <div style={{
                  padding: '0.75rem 1rem',
                  margin: '0.8rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: reservaAlert.type === 'success' ? '#f0fdf4' : '#fee2e2',
                  color: reservaAlert.type === 'success' ? '#166534' : '#991b1b',
                  border: `1px solid ${reservaAlert.type === 'success' ? '#bbf7d0' : '#fca5a5'}`
                }}>
                  {reservaAlert.message}
                </div>
              )}
              <div className="pms-table-wrap">
                <table className="pms-table">
                  <thead>
                    <tr><th>Huésped</th><th>Apto</th><th>Fechas</th><th>Estado</th><th>Origen</th><th>Acción</th></tr>
                  </thead>
                  <tbody>
                    {reservas.filter(r => r.estado !== 'Cancelada').map(r => {
                      // HU-005: colores por estado del ciclo de vida (Confirmada / Check-In / Completada).
                      const estadoEstilos = {
                        'Confirmada': { bg: '#fef3c7', fg: '#b45309', icono: '📅' },
                        'Check-In': { bg: '#dcfce7', fg: '#166534', icono: '🚪' },
                        'Completada': { bg: '#e0f2fe', fg: '#0369a1', icono: '✅' }
                      };
                      const est = estadoEstilos[r.estado] || { bg: '#f1f5f9', fg: '#475569', icono: '•' };

                      return (
                      <tr key={r.id_reserva}>
                        <td>
                          <strong>{r.huesped_nombre}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Doc: {r.huesped_documento}</span>
                        </td>
                        <td><span className="badge-tag badge-occup">Apto {r.habitacion_numero}</span></td>
                        <td style={{ fontSize: '0.72rem' }}>
                          In: {r.fecha_entrada}<br/>Out: {r.fecha_salida}
                        </td>
                        <td style={{ fontSize: '0.72rem' }}>
                          <span className="badge-tag" style={{ background: est.bg, color: est.fg, fontSize: '0.7rem' }}>
                            {est.icono} {r.estado}
                          </span>
                          {/* HU-005 (CA-005.1 / CA-005.4): marca temporal física registrada en el backend */}
                          {r.checkin_at && (
                            <span style={{ display: 'block', color: '#166534', fontWeight: 600, marginTop: '0.15rem' }}>
                              Entrada: {r.checkin_at}
                            </span>
                          )}
                          {r.checkout_at && (
                            <span style={{ display: 'block', color: '#0369a1', fontWeight: 600, marginTop: '0.15rem' }}>
                              Salida: {r.checkout_at}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="badge-tag" style={{ background: r.creado_por?.includes('Web') ? '#e0f2fe' : '#fef3c7', color: r.creado_por?.includes('Web') ? '#0369a1' : '#b45309', fontSize: '0.7rem' }}>
                            {r.creado_por?.includes('Web') ? '🌐 Web Pública' : `👨‍💼 ${r.creado_por || 'Recepción'}`}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {/* HU-005: transiciones 'Confirmada -> Check-In -> Completada' */}
                          {r.estado === 'Confirmada' && (
                            <button
                              id={`pms-checkin-${r.id_reserva}`}
                              className="btn-mini"
                              style={{ color: '#166534', fontWeight: 700, marginRight: '0.35rem' }}
                              onClick={() => handleCambiarEstadoReserva(r.id_reserva, 'Check-In')}
                            >
                              🚪 Check-in
                            </button>
                          )}
                          {r.estado === 'Check-In' && (
                            <button
                              id={`pms-checkout-${r.id_reserva}`}
                              className="btn-mini"
                              style={{ color: '#2563eb', fontWeight: 700, marginRight: '0.35rem' }}
                              onClick={() => handleCambiarEstadoReserva(r.id_reserva, 'Completada')}
                            >
                              🚪 Check-out
                            </button>
                          )}
                          {r.estado !== 'Completada' && (
                            <button className="btn-mini" style={{ color: '#ef4444' }} onClick={() => handleDeleteReserva(r.id_reserva)}>
                              Cancelar
                            </button>
                          )}
                          {r.estado === 'Completada' && (
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>✓ Estadía finalizada</span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. SUB-PESTAÑA 4: GESTIÓN DE PLANTAS (AMAS DE LLAVES & MANTENIMIENTO) */}
          {(pmsSubTab === 'planta' || pmsSubTab === 'todos') && (
          <div id="pms-operaciones-planta" className="clean-card" style={{ marginBottom: '1.5rem', border: '1.5px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <div className="clean-card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Wrench size={22} color="var(--color-primary-red)"/>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {usuarioSesion?.rol === 'Ama de llaves' ? '🧹 Tablero de Aseo & Control de Unidades (Ama de Llaves)' :
                     usuarioSesion?.rol === 'Personal de mantenimiento' ? '🔧 Bitácora de Novedades Técnicas y Reparaciones (Mantenimiento)' :
                     '🛠️ Operaciones de Planta: Mantenimiento y Aseo'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    {usuarioSesion?.rol === 'Ama de llaves' ? 'Realice el aseo de apartamentos y reporte inmediatamente cualquier avería técnica detectada al equipo de mantenimiento.' :
                     'Atienda y solucione los reportes de daños enviados por las amas de llaves para liberar las habitaciones a estado Disponible.'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-mini"
                  onClick={() => setFiltroHabitaciones('amas_llaves')}
                  style={{
                    background: filtroHabitaciones === 'amas_llaves' ? '#fef3c7' : '#ffffff',
                    color: filtroHabitaciones === 'amas_llaves' ? '#92400e' : '#475569',
                    border: '1px solid #fcd34d',
                    fontWeight: 700
                  }}
                >
                  🧹 Aseo Pendiente ({habitaciones.filter(h => h.estado === 'En limpieza').length})
                </button>
                <button
                  type="button"
                  className="btn-mini"
                  onClick={() => setFiltroHabitaciones('mantenimiento')}
                  style={{
                    background: filtroHabitaciones === 'mantenimiento' ? '#fee2e2' : '#ffffff',
                    color: filtroHabitaciones === 'mantenimiento' ? '#991b1b' : '#475569',
                    border: '1px solid #fca5a5',
                    fontWeight: 700
                  }}
                >
                  ⚠️ Daños / Mantenimiento ({habitaciones.filter(h => h.estado === 'Mantenimiento').length})
                </button>
                <button
                  type="button"
                  className="btn-mini"
                  onClick={() => setFiltroHabitaciones('todas')}
                  style={{
                    background: filtroHabitaciones === 'todas' ? '#0f172a' : '#ffffff',
                    color: filtroHabitaciones === 'todas' ? '#ffffff' : '#475569',
                    border: '1px solid #cbd5e1',
                    fontWeight: 700
                  }}
                >
                  Ver Todas ({habitaciones.length})
                </button>
              </div>
            </div>

            {/* SECCIÓN DESTACADA DE NOVEDADES REPORTADAS POR AMA DE LLAVES (PARA MANTENIMIENTO) */}
            {habitaciones.some(h => h.estado === 'Mantenimiento') && (
              <div style={{ padding: '1rem', background: '#fff5f5', borderBottom: '1.5px solid #fecdd3' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🚨 Bitácora de Daños Activos para Mantenimiento ({habitaciones.filter(h => h.estado === 'Mantenimiento').length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.8rem' }}>
                  {habitaciones.filter(h => h.estado === 'Mantenimiento').map(h => (
                    <div key={h.id_habitacion} style={{ background: '#ffffff', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '0.85rem', boxShadow: '0 2px 8px rgba(225,29,72,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Apartamento {h.numero}</strong>
                        <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 700 }}>
                          ⚠️ Mantenimiento Requerido
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#7f1d1d', background: '#fff1f2', padding: '0.5rem', borderRadius: '6px', margin: '0.4rem 0', fontWeight: 600 }}>
                        📝 <strong>Descripción del Daño:</strong> {h.detalle_mantenimiento || 'Reporte técnico general'}
                      </p>
                      {h.modificado_por && (
                        <p style={{ fontSize: '0.73rem', color: '#64748b', margin: '0.2rem 0 0.6rem' }}>
                          👤 <strong>Reportado por:</strong> {h.modificado_por}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn-mini"
                          style={{ background: '#166534', color: '#ffffff', border: 'none', fontWeight: 700, flex: 1, padding: '0.45rem' }}
                          onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'Disponible')}
                        >
                          ✅ Reparado / Disponible
                        </button>
                        <button
                          type="button"
                          className="btn-mini"
                          style={{ background: '#d97706', color: '#ffffff', border: 'none', fontWeight: 700, padding: '0.45rem' }}
                          onClick={() => handleReportarDano(h)}
                        >
                          ✏️ Editar Reporte
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TABLA PRINCIPAL DE INVENTARIO DE HABITACIONES */}
            <div className="pms-table-wrap" style={{ maxHeight: '360px' }}>
              <table className="pms-table">
                <thead>
                  <tr>
                    <th>Apartamento</th>
                    <th>Tipo</th>
                    <th>Estado Actual</th>
                    <th>Detalle de Novedad</th>
                    <th>Última Modificación</th>
                    <th>Acciones de Turno</th>
                  </tr>
                </thead>
                <tbody>
                  {habitaciones
                    .filter(h => {
                      if (filtroHabitaciones === 'amas_llaves') return h.estado === 'En limpieza';
                      if (filtroHabitaciones === 'mantenimiento') return h.estado === 'Mantenimiento';
                      return true;
                    })
                    .map(h => (
                      <tr key={h.id_habitacion}>
                        <td><strong>Apto {h.numero}</strong></td>
                        <td>{h.tipo}</td>
                        <td>
                          <span className={`badge-tag ${
                            h.estado === 'Disponible' ? 'badge-avail' :
                            h.estado === 'Ocupada' ? 'badge-occup' :
                            h.estado === 'En limpieza' ? 'badge-clean' : 'badge-maint'
                          }`}>
                            {h.estado}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: h.detalle_mantenimiento ? '#b91c1c' : '#64748b', fontWeight: h.detalle_mantenimiento ? 700 : 400 }}>
                          {h.detalle_mantenimiento || '-'}
                        </td>
                        <td style={{ fontSize: '0.73rem', color: '#64748b' }}>
                          {h.modificado_por || 'Sistema'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            <button
                              className="btn-mini"
                              style={{ color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4', fontWeight: 700 }}
                              onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'Disponible')}
                              title="Marcar Apto Limpio y Listo para Huéspedes"
                            >
                              ✓ Marcar Disponible
                            </button>
                            <button
                              className="btn-mini"
                              style={{ color: '#b45309', borderColor: '#fde68a', background: '#fefce8', fontWeight: 700 }}
                              onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'En limpieza')}
                              title="Iniciar Aseo y Cambio de Lencería"
                            >
                              🧹 En Limpieza
                            </button>
                            <button
                              className="btn-mini"
                              style={{ color: '#b91c1c', borderColor: '#fecdd3', background: '#fff1f2', fontWeight: 700 }}
                              onClick={() => handleReportarDano(h)}
                              title="Reportar Daño a Mantenimiento"
                            >
                              ⚠️ Reportar Daño
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* 5. SUB-PESTAÑA 5: CENTRO DE NEGOCIOS — RESERVAS POR HORAS */}
          {(pmsSubTab === 'coworking' || pmsSubTab === 'todos') && (
          <div id="pms-centro-negocios" className="clean-card" style={{ marginTop: '1.5rem' }}>
            <div className="clean-card-header">
              <span style={{ fontSize: '1.1rem' }}>💼</span>
              <h3 style={{ fontSize: '1.1rem' }}>Centro de Negocios — Reservas por Horas ({reservasNegocio.length})</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1rem' }}>
              {/* FORMULARIO */}
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: '#374151' }}>Nueva Reserva de Sala / Coworking</h4>

                {reservaNegocioAlert && (
                  <div style={{ padding: '0.5rem 0.8rem', borderRadius: '4px', marginBottom: '0.8rem', background: reservaNegocioAlert.type === 'success' ? '#dcfce7' : '#fee2e2', color: reservaNegocioAlert.type === 'success' ? '#166534' : '#991b1b', fontSize: '0.8rem' }}>
                    {reservaNegocioAlert.message}
                  </div>
                )}

                <form onSubmit={handleCrearReservaNegocio}>
                  <div className="form-field">
                    <label>Espacio</label>
                    <select style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                      value={reservaNegocioForm.id_espacio}
                      onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, id_espacio: e.target.value })} required>
                      <option value="">-- Seleccionar espacio --</option>
                      {espaciosNegocio.map(e => (
                        <option key={e.id_espacio} value={e.id_espacio}>
                          {e.nombre} — ${Number(e.precio_hora).toLocaleString('es-CO')} COP/hr
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Tipo de Cliente</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input type="radio" name="tipo_c" value="Huésped Registrado"
                          checked={reservaNegocioForm.tipo_cliente === 'Huésped Registrado'}
                          onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, tipo_cliente: e.target.value })} />{' '}
                        🏨 Huésped de Facile
                      </label>
                      <label style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input type="radio" name="tipo_c" value="Cliente Externo"
                          checked={reservaNegocioForm.tipo_cliente === 'Cliente Externo'}
                          onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, tipo_cliente: e.target.value })} />{' '}
                        🏢 Cliente Externo
                      </label>
                    </div>
                  </div>

                  {reservaNegocioForm.tipo_cliente === 'Huésped Registrado' ? (
                    <div className="form-field">
                      <label>Huésped</label>
                      <select style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                        value={reservaNegocioForm.id_huesped}
                        onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, id_huesped: e.target.value })} required>
                        <option value="">-- Seleccionar huésped --</option>
                        {huespedes.filter(h => h.estado === 'Activo').map(h => (
                          <option key={h.id_huesped} value={h.id_huesped}>{h.nombre} ({h.documento})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div className="form-field">
                        <label>Nombre / Empresa</label>
                        <input type="text" placeholder="Empresa o nombre" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                          value={reservaNegocioForm.nombre_cliente}
                          onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, nombre_cliente: e.target.value })} required />
                      </div>
                      <div className="form-field">
                        <label>NIT / Documento</label>
                        <input type="text" inputMode="numeric" placeholder="Solo números" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                          value={reservaNegocioForm.documento_cliente}
                          onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, documento_cliente: e.target.value.replace(/\D/g, '') })} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div className="form-field">
                      <label>Fecha</label>
                      <input type="date" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                        value={reservaNegocioForm.fecha}
                        onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, fecha: e.target.value })} required />
                    </div>
                    <div className="form-field">
                      <label>Hora Inicio</label>
                      <input type="time" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                        value={reservaNegocioForm.hora_inicio}
                        onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, hora_inicio: e.target.value })} required />
                    </div>
                    <div className="form-field">
                      <label>Hora Fin</label>
                      <input type="time" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                        value={reservaNegocioForm.hora_fin}
                        onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, hora_fin: e.target.value })} required />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Observaciones</label>
                    <input type="text" placeholder="Ej: Video beam, café..." style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                      value={reservaNegocioForm.observaciones}
                      onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, observaciones: e.target.value })} />
                  </div>

                  <button type="submit" className="btn-submit-red" disabled={loading} style={{ marginTop: '0.5rem' }}>
                    {loading ? 'Procesando...' : 'Confirmar Reserva de Espacio'}
                  </button>
                </form>
              </div>

              {/* TABLA DE RESERVAS ACTIVAS */}
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: '#374151' }}>Reservas Activas ({reservasNegocio.length})</h4>
                <div className="pms-table-wrap" style={{ maxHeight: '380px' }}>
                  <table className="pms-table">
                    <thead>
                      <tr><th>Espacio</th><th>Cliente</th><th>Fecha / Horario</th><th>Origen</th><th>Total</th><th>Acción</th></tr>
                    </thead>
                    <tbody>
                      {reservasNegocio.map(rn => (
                        <tr key={rn.id_reserva_negocio}>
                          <td><strong>{rn.espacio}</strong><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>{rn.tipo_espacio}</span></td>
                          <td><strong>{rn.nombre_cliente}</strong><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>{rn.tipo_cliente}</span></td>
                          <td style={{ fontSize: '0.72rem' }}>{rn.fecha}<br/><span style={{ color: '#b45309', fontWeight: 'bold' }}>{rn.hora_inicio} – {rn.hora_fin}</span> ({rn.duracion_horas}h)</td>
                          <td>
                            <span className="badge-tag" style={{ background: rn.creado_por?.includes('Web') ? '#e0f2fe' : '#fef3c7', color: rn.creado_por?.includes('Web') ? '#0369a1' : '#b45309', fontSize: '0.7rem' }}>
                              {rn.creado_por?.includes('Web') ? '🌐 Web Pública' : `👨‍💼 ${rn.creado_por || 'Recepción'}`}
                            </span>
                          </td>
                          <td><strong>${Number(rn.precio_total).toLocaleString('es-CO')}</strong></td>
                          <td>
                            <button className="btn-mini" style={{ color: '#ef4444' }} onClick={() => handleCancelarReservaNegocio(rn.id_reserva_negocio)}>
                              Cancelar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          )}
        </section>
  );
};

export default VistaPms;
