import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, Mail, Phone, FileText, Briefcase, Users, AlertCircle, Calendar, Home, ListOrdered, Wifi, WifiOff } from 'lucide-react';

// ============================================================
// DATOS INICIALES (Modo Simulación - sin necesidad de backend)
// ============================================================
const HUESPEDES_INICIALES = [
  { id_huesped: 1, nombre: "John Doe",        documento: "12345678",  telefono: "3115551234", correo: "john.doe@example.com",          empresa: null,          lealtad: "Silver",   estado: "Activo" },
  { id_huesped: 2, nombre: "Sofía Restrepo",  documento: "98765432",  telefono: "3126667890", correo: "sofia.restrepo@bancolombia.com", empresa: "Bancolombia",  lealtad: "Gold",     estado: "Activo" },
  { id_huesped: 3, nombre: "Thomas Miller",   documento: "PP998877",  telefono: "+155589012", correo: "thomas.miller@siemens.com",      empresa: "Siemens",      lealtad: "Platinum", estado: "Activo" },
];

const HABITACIONES_INICIALES = [
  { id_habitacion: 1, numero: "101A", tipo: "Habitaciones", capacidad: 2, precio_noche: 243000, estado: "Disponible"   },
  { id_habitacion: 2, numero: "102A", tipo: "Habitaciones", capacidad: 2, precio_noche: 243000, estado: "Disponible"   },
  { id_habitacion: 3, numero: "201D", tipo: "Dúplex",       capacidad: 3, precio_noche: 350000, estado: "Disponible"   },
  { id_habitacion: 4, numero: "202D", tipo: "Dúplex",       capacidad: 3, precio_noche: 350000, estado: "Mantenimiento"},
  { id_habitacion: 5, numero: "301F", tipo: "Familiar",     capacidad: 5, precio_noche: 480000, estado: "Disponible"   },
];

const RESERVAS_INICIALES = [
  { id_reserva: 1, id_huesped: 1, huesped_nombre: "John Doe",       huesped_documento: "12345678", id_habitacion: 1, habitacion_numero: "101A", habitacion_tipo: "Habitaciones", fecha_entrada: "2026-06-15", fecha_salida: "2026-06-18", estado: "Confirmada" },
  { id_reserva: 2, id_huesped: 2, huesped_nombre: "Sofía Restrepo", huesped_documento: "98765432", id_habitacion: 3, habitacion_numero: "201D", habitacion_tipo: "Dúplex",       fecha_entrada: "2026-06-20", fecha_salida: "2026-06-25", estado: "Confirmada" },
];

// URL del backend FastAPI (cuando esté corriendo)
const API_URL = 'http://localhost:4000';

function App() {
  // ---- ESTADO DEL MODO DE CONEXIÓN ----
  const [backendActivo, setBackendActivo] = useState(false);

  // ---- ESTADO DE DATOS (simulación local) ----
  const [huespedes,    setHuespedes]    = useState(HUESPEDES_INICIALES);
  const [habitaciones, setHabitaciones] = useState(HABITACIONES_INICIALES);
  const [reservas,     setReservas]     = useState(RESERVAS_INICIALES);

  // ---- ESTADO DEL FORMULARIO DE REGISTRO ----
  const [formData, setFormData] = useState({ nombre: '', documento: '', telefono: '', correo: '', empresa: '' });
  const [habeasData, setHabeasData] = useState(false);
  const [selectedHuesped, setSelectedHuesped] = useState(null);

  // ---- ESTADO DEL FORMULARIO DE RESERVA ----
  const [reservaData, setReservaData] = useState({ id_habitacion: '', fecha_entrada: '', fecha_salida: '' });
  const [cotizacion, setCotizacion] = useState(null);

  // ---- ESTADOS UI ----
  const [loading, setLoading]           = useState(false);
  const [alert, setAlert]               = useState(null);
  const [reservaAlert, setReservaAlert] = useState(null);

  // ---- VERIFICAR SI EL BACKEND ESTÁ ACTIVO ----
  useEffect(() => {
    const verificarBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          setBackendActivo(true);
          cargarDatosBackend();
        }
      } catch {
        setBackendActivo(false); // Sin backend → usa simulación
      }
    };
    verificarBackend();
  }, []);

  // Cargar datos del backend cuando está activo
  const cargarDatosBackend = async () => {
    try {
      const [gRes, hRes, rRes] = await Promise.all([
        fetch(`${API_URL}/api/huespedes`),
        fetch(`${API_URL}/api/habitaciones`),
        fetch(`${API_URL}/api/reservas`),
      ]);
      if (gRes.ok) setHuespedes(await gRes.json());
      if (hRes.ok) setHabitaciones(await hRes.json());
      if (rRes.ok) setReservas(await rRes.json());
    } catch (e) {
      console.error('Error al cargar datos del backend:', e);
    }
  };

  // ---- COTIZACIÓN EN TIEMPO REAL ----
  useEffect(() => {
    if (reservaData.id_habitacion && reservaData.fecha_entrada && reservaData.fecha_salida) {
      const eDt = new Date(reservaData.fecha_entrada);
      const sDt = new Date(reservaData.fecha_salida);
      const hab = habitaciones.find(h => h.id_habitacion === parseInt(reservaData.id_habitacion));
      if (sDt > eDt && hab) {
        const noches   = Math.ceil(Math.abs(sDt - eDt) / (1000 * 60 * 60 * 24));
        const subtotal = noches * hab.precio_noche;
        const descuento = noches > 15 ? subtotal * 0.15 : 0;
        setCotizacion({ noches, subtotal, descuento, total: subtotal - descuento });
      } else {
        setCotizacion(null);
      }
    } else {
      setCotizacion(null);
    }
  }, [reservaData, habitaciones]);

  // ---- MANEJADORES DE CAMBIO EN FORMULARIOS ----
  const handleUserChange    = (e) => setFormData    ({ ...formData,    [e.target.name]: e.target.value });
  const handleReservaChange = (e) => setReservaData ({ ...reservaData, [e.target.name]: e.target.value });

  // ================================================================
  //  REGISTRAR HUÉSPED
  // ================================================================
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!habeasData) {
      setAlert({ type: 'error', message: 'Debe autorizar el tratamiento de datos personales (Habeas Data).' });
      return;
    }

    // Validar campos vacíos
    if (!formData.nombre.trim() || !formData.documento.trim() || !formData.telefono.trim() || !formData.correo.trim()) {
      setAlert({ type: 'error', message: 'Nombre, documento, teléfono y correo son obligatorios.' });
      return;
    }

    setLoading(true);
    setAlert(null);

    // ---- CON BACKEND (FastAPI) ----
    if (backendActivo) {
      try {
        const res  = await fetch(`${API_URL}/api/user/registro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok) {
          setAlert({ type: 'success', message: data.message, data: data.usuario });
          setSelectedHuesped(data.usuario);
          setFormData({ nombre: '', documento: '', telefono: '', correo: '', empresa: '' });
          setHabeasData(false);
          cargarDatosBackend();
        } else {
          setAlert({ type: 'error', message: data.detail || 'Error al registrar huésped.' });
        }
      } catch {
        setAlert({ type: 'error', message: 'Error de conexión con el servidor.' });
      }
      setLoading(false);
      return;
    }

    // ---- SIN BACKEND (Modo Simulación en React) ----
    // Validar documento duplicado
    const existe = huespedes.find(h => h.documento === formData.documento.trim());
    if (existe) {
      setAlert({ type: 'error', message: 'Este número de documento ya está registrado.' });
      setLoading(false);
      return;
    }

    // Crear nuevo huésped en memoria
    const nuevoId = Math.max(...huespedes.map(h => h.id_huesped), 0) + 1;
    const nuevoHuesped = {
      id_huesped: nuevoId,
      nombre:     formData.nombre.trim(),
      documento:  formData.documento.trim(),
      telefono:   formData.telefono.trim(),
      correo:     formData.correo.trim(),
      empresa:    formData.empresa.trim() || null,
      lealtad:    'Silver',
      estado:     'Activo',
    };

    setHuespedes(prev => [...prev, nuevoHuesped]);
    setSelectedHuesped(nuevoHuesped);
    setAlert({
      type: 'success',
      message: `¡Huésped "${nuevoHuesped.nombre}" registrado exitosamente! (Modo Simulación)`,
      data: nuevoHuesped,
    });
    setFormData({ nombre: '', documento: '', telefono: '', correo: '', empresa: '' });
    setHabeasData(false);
    setLoading(false);
  };

  // ================================================================
  //  CREAR RESERVA
  // ================================================================
  const handleReservaSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHuesped) {
      setReservaAlert({ type: 'error', message: 'Debe seleccionar un huésped primero.' });
      return;
    }

    const eDt = new Date(reservaData.fecha_entrada);
    const sDt = new Date(reservaData.fecha_salida);
    if (sDt <= eDt) {
      setReservaAlert({ type: 'error', message: 'La fecha de salida debe ser posterior a la de entrada.' });
      return;
    }

    setLoading(true);
    setReservaAlert(null);

    // ---- CON BACKEND (FastAPI) ----
    if (backendActivo) {
      try {
        const res  = await fetch(`${API_URL}/api/reservas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_huesped:    selectedHuesped.id_huesped,
            id_habitacion: parseInt(reservaData.id_habitacion),
            fecha_entrada: reservaData.fecha_entrada,
            fecha_salida:  reservaData.fecha_salida,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setReservaAlert({ type: 'success', message: '¡Reserva confirmada!', data });
          setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '' });
          cargarDatosBackend();
        } else {
          setReservaAlert({ type: 'error', message: data.detail || 'Error al crear la reserva.' });
        }
      } catch {
        setReservaAlert({ type: 'error', message: 'Error de conexión con el servidor.' });
      }
      setLoading(false);
      return;
    }

    // ---- SIN BACKEND (Modo Simulación en React) ----
    const habId  = parseInt(reservaData.id_habitacion);
    const habObj = habitaciones.find(h => h.id_habitacion === habId);

    if (!habObj) {
      setReservaAlert({ type: 'error', message: 'Habitación no encontrada.' });
      setLoading(false);
      return;
    }
    if (habObj.estado === 'Mantenimiento') {
      setReservaAlert({ type: 'error', message: `La habitación ${habObj.numero} está en Mantenimiento.` });
      setLoading(false);
      return;
    }

    // Verificar solapamiento de fechas (Double Booking)
    const colision = reservas.find(r => {
      if (r.id_habitacion !== habId) return false;
      if (!['Confirmada', 'Check-In'].includes(r.estado)) return false;
      const rE = new Date(r.fecha_entrada);
      const rS = new Date(r.fecha_salida);
      return eDt < rS && sDt > rE; // Fórmula de solapamiento
    });

    if (colision) {
      setReservaAlert({
        type: 'error',
        message: `⚠️ Double Booking: El apartamento ${habObj.numero} ya está reservado del ${colision.fecha_entrada} al ${colision.fecha_salida}.`,
      });
      setLoading(false);
      return;
    }

    // Calcular cotización
    const noches    = Math.ceil(Math.abs(sDt - eDt) / (1000 * 60 * 60 * 24));
    const subtotal  = noches * habObj.precio_noche;
    const descuento = noches > 15 ? subtotal * 0.15 : 0;
    const total     = subtotal - descuento;

    const nuevaReserva = {
      id_reserva:         Math.max(...reservas.map(r => r.id_reserva), 0) + 1,
      id_huesped:         selectedHuesped.id_huesped,
      huesped_nombre:     selectedHuesped.nombre,
      huesped_documento:  selectedHuesped.documento,
      id_habitacion:      habId,
      habitacion_numero:  habObj.numero,
      habitacion_tipo:    habObj.tipo,
      fecha_entrada:      reservaData.fecha_entrada,
      fecha_salida:       reservaData.fecha_salida,
      estado:             'Confirmada',
    };

    setReservas(prev => [...prev, nuevaReserva]);
    setReservaAlert({
      type: 'success',
      message: `✅ ¡Reserva confirmada para ${selectedHuesped.nombre} en Apto ${habObj.numero}! (Modo Simulación)`,
      data: { cotizacion: { noches, subtotal, descuento, total } },
    });
    setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '' });
    setLoading(false);
  };

  // ================================================================
  //  RENDER
  // ================================================================
  return (
    <div className="app-container">
      <div className="bg-overlay"></div>

      <header className="app-header">
        <div className="logo-container">
          <span className="logo-icon">🏨</span>
          <h1>BookingSoft</h1>
        </div>
        <p className="subtitle">Apartamentos Facile — Calle 97 #21-62, Bogotá Chicó</p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="badge-sena">Integración: Registro y Reservas (FastAPI & React)</span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600,
            padding: '0.3rem 0.8rem', borderRadius: '999px',
            background: backendActivo ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
            color: backendActivo ? '#4ade80' : '#fbbf24',
            border: `1px solid ${backendActivo ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`,
          }}>
            {backendActivo ? <Wifi size={13}/> : <WifiOff size={13}/>}
            {backendActivo ? 'Backend FastAPI conectado' : 'Modo Simulación (sin backend)'}
          </span>
        </div>
      </header>

      <main className="main-content">
        {/* COLUMNA IZQUIERDA: FORMULARIOS */}
        <div className="column-flow">

          {/* ── PASO 1: REGISTRO ── */}
          <section className="form-section card glass">
            <div className="step-badge">Paso 1</div>
            <div className="card-header">
              <UserPlus className="icon-gold" size={24} />
              <h2>Registro de Huésped</h2>
            </div>
            <p className="card-description">
              Crea tu perfil en la base de datos de Apartamentos Facile para habilitar el motor de reservas.
            </p>

            <form onSubmit={handleUserSubmit} className="register-form">
              <div className="input-group">
                <label htmlFor="nombre">Nombre Completo</label>
                <div className="input-wrapper">
                  <FileText className="input-icon" size={18} />
                  <input type="text" id="nombre" name="nombre" value={formData.nombre}
                    onChange={handleUserChange} placeholder="Ej: Liliana Restrepo" required />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="documento">Documento de Identidad</label>
                  <div className="input-wrapper">
                    <ShieldCheck className="input-icon" size={18} />
                    <input type="text" id="documento" name="documento" value={formData.documento}
                      onChange={handleUserChange} placeholder="Ej: 1017283944" required />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input type="tel" id="telefono" name="telefono" value={formData.telefono}
                      onChange={handleUserChange} placeholder="Ej: 3154449876" required />
                  </div>
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="correo">Correo Electrónico</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input type="email" id="correo" name="correo" value={formData.correo}
                      onChange={handleUserChange} placeholder="Ej: correo@gmail.com" required />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="empresa">Empresa (Opcional)</label>
                  <div className="input-wrapper">
                    <Briefcase className="input-icon" size={18} />
                    <input type="text" id="empresa" name="empresa" value={formData.empresa}
                      onChange={handleUserChange} placeholder="Ej: Bancolombia" />
                  </div>
                </div>
              </div>

              <div className="habeas-data-group">
                <label className="checkbox-container">
                  <input type="checkbox" checked={habeasData} onChange={(e) => setHabeasData(e.target.checked)} />
                  <span className="checkmark"></span>
                  <span className="label-text">
                    Autorizo el tratamiento de mis datos personales según la <strong>Ley de Habeas Data (Ley 1581 de 2012)</strong>.
                  </span>
                </label>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                <span>{loading ? 'Registrando...' : 'Registrar Huésped'}</span>
              </button>
            </form>

            {alert && (
              <div className={`alert-box alert-${alert.type} fade-in`}>
                <div className="alert-content">
                  <AlertCircle size={20} className="alert-icon" />
                  <p className="alert-message">{alert.message}</p>
                </div>
              </div>
            )}
          </section>

          {/* ── PASO 2: RESERVA ── */}
          <section className="form-section card glass" style={{ marginTop: '1.5rem' }}>
            <div className="step-badge">Paso 2</div>
            <div className="card-header">
              <Calendar className="icon-gold" size={24} />
              <h2>Crear Reserva de Habitación</h2>
            </div>

            {selectedHuesped ? (
              <div className="selected-guest-tag fade-in">
                <span>Huésped Activo: <strong>{selectedHuesped.nombre}</strong> (ID: #{selectedHuesped.id_huesped})</span>
                <button onClick={() => setSelectedHuesped(null)} className="btn-clear-guest">Cambiar</button>
              </div>
            ) : (
              <p className="guest-warning">
                ⚠️ Registre un huésped arriba o haga clic en <strong>"Seleccionar"</strong> en la lista de huéspedes para iniciar la reserva.
              </p>
            )}

            <form onSubmit={handleReservaSubmit} className="register-form">
              <div className="input-group">
                <label htmlFor="id_habitacion">Seleccionar Apartamento / Unidad</label>
                <div className="input-wrapper">
                  <Home className="input-icon" size={18} />
                  <select id="id_habitacion" name="id_habitacion" value={reservaData.id_habitacion}
                    onChange={handleReservaChange} required disabled={!selectedHuesped}>
                    <option value="">-- Elija un apartamento --</option>
                    {habitaciones.map(h => (
                      <option key={h.id_habitacion} value={h.id_habitacion} disabled={h.estado === 'Mantenimiento'}>
                        Apto {h.numero} - {h.tipo} ({h.estado}) - ${h.precio_noche.toLocaleString('es-CO')}/noche
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="fecha_entrada">Fecha de Entrada (Check-In)</label>
                  <div className="input-wrapper">
                    <input type="date" id="fecha_entrada" name="fecha_entrada"
                      value={reservaData.fecha_entrada} onChange={handleReservaChange}
                      required disabled={!selectedHuesped} />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="fecha_salida">Fecha de Salida (Check-Out)</label>
                  <div className="input-wrapper">
                    <input type="date" id="fecha_salida" name="fecha_salida"
                      value={reservaData.fecha_salida} onChange={handleReservaChange}
                      required disabled={!selectedHuesped} />
                  </div>
                </div>
              </div>

              {cotizacion && (
                <div className="cotizacion-box fade-in">
                  <h4>Desglose de Cotización</h4>
                  <div className="cot-row"><span>Noches de Estancia:</span><span>{cotizacion.noches} noches</span></div>
                  <div className="cot-row"><span>Precio Subtotal:</span><span>${cotizacion.subtotal.toLocaleString('es-CO')} COP</span></div>
                  {cotizacion.descuento > 0 && (
                    <div className="cot-row discount-row">
                      <span>Descuento (15% Larga Estadía):</span>
                      <span>-${cotizacion.descuento.toLocaleString('es-CO')} COP</span>
                    </div>
                  )}
                  <div className="cot-row total-row">
                    <span>Total Neto:</span>
                    <span>${cotizacion.total.toLocaleString('es-CO')} COP</span>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={loading || !selectedHuesped}>
                <span>{loading ? 'Procesando...' : 'Cotizar y Confirmar Reserva'}</span>
              </button>
            </form>

            {reservaAlert && (
              <div className={`alert-box alert-${reservaAlert.type} fade-in`}>
                <div className="alert-content">
                  <AlertCircle size={20} className="alert-icon" />
                  <div>
                    <p className="alert-message">{reservaAlert.message}</p>
                    {reservaAlert.type === 'success' && reservaAlert.data?.cotizacion && (
                      <div className="guest-details">
                        <strong>Noches:</strong> {reservaAlert.data.cotizacion.noches} |&nbsp;
                        <strong>Total:</strong> ${reservaAlert.data.cotizacion.total.toLocaleString('es-CO')} COP
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* COLUMNA DERECHA: DATOS EN TIEMPO REAL */}
        <div className="column-db">

          {/* TABLA HUÉSPEDES */}
          <section className="list-section card glass">
            <div className="card-header">
              <Users className="icon-gold" size={24} />
              <h2>Base de Datos: Huéspedes</h2>
            </div>
            <div className="huespedes-list-container" style={{ maxHeight: '250px' }}>
              <table className="huespedes-table">
                <thead>
                  <tr><th>Nombre</th><th>Documento</th><th>Acción</th></tr>
                </thead>
                <tbody>
                  {huespedes.map(h => (
                    <tr key={h.id_huesped} className="huesped-row">
                      <td>
                        <div className="huesped-info">
                          <span className="name">{h.nombre}</span>
                          <span className="company">{h.empresa || 'Turista'}</span>
                        </div>
                      </td>
                      <td><code>{h.documento}</code></td>
                      <td>
                        <button onClick={() => setSelectedHuesped(h)} className="btn-select-huesped">
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* TABLA RESERVAS */}
          <section className="list-section card glass" style={{ marginTop: '1.5rem' }}>
            <div className="card-header">
              <ListOrdered className="icon-gold" size={24} />
              <h2>Base de Datos: Reservas</h2>
            </div>
            <div className="huespedes-list-container" style={{ maxHeight: '300px' }}>
              {reservas.length === 0 ? (
                <p className="empty-message">No hay reservas registradas.</p>
              ) : (
                <table className="huespedes-table">
                  <thead>
                    <tr><th>Huésped</th><th>Habitación</th><th>Fechas</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {reservas.map(r => (
                      <tr key={r.id_reserva}>
                        <td>
                          <div className="huesped-info">
                            <span className="name">{r.huesped_nombre}</span>
                            <span className="company">{r.huesped_documento}</span>
                          </div>
                        </td>
                        <td>Apto {r.habitacion_numero}</td>
                        <td>
                          <div className="contact-info">
                            <span className="phone">In: {r.fecha_entrada}</span>
                            <span className="phone">Out: {r.fecha_salida}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge-lealtad lealtad-gold">{r.estado}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 BookingSoft — Apartamentos Facile. Integración Full Stack para ADSO T4.</p>
      </footer>
    </div>
  );
}

export default App;
