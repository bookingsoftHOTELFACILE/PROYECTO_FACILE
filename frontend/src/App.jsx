import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, Mail, Phone, FileText, Briefcase, Users, AlertCircle, Calendar, Home, ListOrdered, Wifi, WifiOff, LogIn, LogOut, Lock, User, Trash2 } from 'lucide-react';

// URL del backend FastAPI
const API_URL = '';


function App() {
  // ---- ESTADO DEL MODO DE CONEXIÓN ----
  const [backendActivo, setBackendActivo] = useState(false);

  // ---- ESTADO DE DATOS (solo desde el backend, sin fallback local) ----
  const [huespedes,    setHuespedes]    = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservas,     setReservas]     = useState([]);

  // ---- ESTADO DEL FORMULARIO DE REGISTRO ----
  const [formData, setFormData] = useState({ nombre: '', documento: '', telefono: '', correo: '', empresa: '' });
  const [habeasData, setHabeasData] = useState(false);
  const [selectedHuesped, setSelectedHuesped] = useState(null);

  // ---- AUXILIAR PARA FORMATEAR ERRORES DE FASTAPI DE FORMA SEGURA EN REACT ----
  const formatErrorMessage = (detail) => {
    if (!detail) return 'Ocurrió un error en la solicitud.';
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(err => (typeof err === 'string' ? err : err.msg || JSON.stringify(err))).join(' | ');
    }
    return JSON.stringify(detail);
  };

  // ---- ESTADO DEL FORMULARIO DE RESERVA ----
  const [reservaData, setReservaData] = useState({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
  const [cotizacion, setCotizacion] = useState(null);
  const [calDate, setCalDate] = useState(new Date(2026, 7, 1));

  // ---- ESTADOS UI ----
  const [loading, setLoading]           = useState(false);
  const [alert, setAlert]               = useState(null);
  const [reservaAlert, setReservaAlert] = useState(null);
  const [filtroHabitaciones, setFiltroHabitaciones] = useState('pendientes'); // 'pendientes' | 'todas'

  // ---- ESTADO DE AUTENTICACIÓN JWT Y SESIÓN ----
  const [authToken, setAuthToken]           = useState(null);
  const [usuarioSesion, setUsuarioSesion]   = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm]           = useState({ usuario: '', contrasena: '' });
  const [loginError, setLoginError]         = useState(null);

  // Iniciar sesión contra /api/auth/login en el backend FastAPI
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: loginForm.usuario.trim(),
          contrasena: loginForm.contrasena,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const token = data.access_token;
        setAuthToken(token);
        // Hallazgo 11: Usar nombre y rol directamente desde el payload JWT, sin nombreMap estático
        let rol = 'Empleado';
        let nombre = loginForm.usuario.trim();
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          rol = payload.rol || 'Empleado';
          nombre = payload.nombre || payload.sub || loginForm.usuario.trim();
        } catch {
          // fallback si no se pudo decodificar
        }

        setUsuarioSesion({ usuario: loginForm.usuario.trim(), nombre, rol });
        setShowLoginModal(false);
        setLoginForm({ usuario: '', contrasena: '' });
        cargarDatosBackend(token);
        setAlert({
          type: 'success',
          message: `¡Sesión iniciada con éxito! Conectado como ${nombre} [${rol}].`,
        });
      } else {
        setLoginError(data.detail || 'Credenciales incorrectas.');
      }
    } catch {
      setLoginError('Error de conexión con el servidor.');
    }
    setLoading(false);
  };

  // Cerrar sesión
  const handleLogout = () => {
    setAuthToken(null);
    setUsuarioSesion(null);
    setAlert({ type: 'success', message: 'Sesión de empleado cerrada correctamente.' });
  };


  // ---- VERIFICAR SI EL BACKEND ESTÁ ACTIVO Y OBTENER TOKEN INICIAL ----
  useEffect(() => {
    const verificarBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          setBackendActivo(true);
          // Hallazgo 10: No hay auto-login con credenciales semilla hardcodeadas
          // El empleado debe autenticarse manualmente mediante el modal de login
        }
      } catch {
        // Hallazgo 10: Sin backend → pantalla en blanco con banner de desconexión,
        // sin simular datos falsos ni duplicar reglas de negocio del PL/pgSQL
        setBackendActivo(false);
      }
    };
    verificarBackend();
  }, []);

  // Cargar datos del backend cuando está activo
  const cargarDatosBackend = async (token = authToken) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const [gRes, hRes, rRes] = await Promise.all([
        fetch(`${API_URL}/api/huespedes`, { headers }),
        fetch(`${API_URL}/api/habitaciones`, { headers }),
        fetch(`${API_URL}/api/reservas`, { headers }),
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
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    if (name === 'documento' || name === 'telefono') {
      // Filtrar estrictamente para permitir solo dígitos (0-9)
      const soloNumeros = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: soloNumeros }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
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

    if (backendActivo && !authToken) {
      setAlert({ type: 'error', message: '🔒 Acceso Restringido: Debe iniciar sesión como Administrador o Recepcionista para registrar huéspedes.' });
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setAlert(null);

    // ---- CON BACKEND (FastAPI) ----
    if (backendActivo) {
      try {
        const headers = { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        };
        const res  = await fetch(`${API_URL}/api/user/registro`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok) {
          setAlert({ type: 'success', message: data.message, data: data.usuario });
          setSelectedHuesped(data.usuario);
          setFormData({ nombre: '', documento: '', telefono: '', correo: '', empresa: '' });
          setHabeasData(false);
          cargarDatosBackend(authToken);
        } else {
          setAlert({ type: 'error', message: formatErrorMessage(data.detail) || 'Error al registrar huésped.' });
        }
      } catch {
        setAlert({ type: 'error', message: 'Error de conexión con el servidor.' });
      }
    } // cierre de if(backendActivo)
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
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        const res  = await fetch(`${API_URL}/api/reservas`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id_huesped:    selectedHuesped.id_huesped,
            id_habitacion: parseInt(reservaData.id_habitacion),
            fecha_entrada: reservaData.fecha_entrada,
            fecha_salida:  reservaData.fecha_salida,
            numero_personas: parseInt(reservaData.numero_personas || 1),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setReservaAlert({ type: 'success', message: '¡Reserva confirmada exitosamente!', data });
          setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
          cargarDatosBackend(authToken);
        } else {
          setReservaAlert({ type: 'error', message: formatErrorMessage(data.detail) || 'Error al crear la reserva.' });
        }
      } catch {
        setReservaAlert({ type: 'error', message: 'Error de conexión con el servidor.' });
      }
      setLoading(false);
      return;
    }

    // Sin backend: mostrar error claro, sin simulación
    setReservaAlert({ type: 'error', message: '🔌 Sin conexión al servidor. No es posible crear reservas en este momento.' });
    setLoading(false);
  };

  // ================================================================
  //  ACTIVAR / DESACTIVAR HUÉSPED
  // ================================================================
  const handleToggleEstadoHuesped = async (h) => {
    const nuevoEstado = h.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const accionTexto = nuevoEstado === 'Activo' ? 'activar' : 'desactivar';
    if (!window.confirm(`¿Está seguro de ${accionTexto} al huésped "${h.nombre}"?`)) return;

    setLoading(true);
    if (backendActivo) {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        };
        const res = await fetch(`${API_URL}/api/huespedes/${h.id_huesped}/estado`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ estado: nuevoEstado }),
        });
        const data = await res.json();
        if (res.ok) {
          setAlert({ type: 'success', message: data.message });
          if (selectedHuesped?.id_huesped === h.id_huesped && nuevoEstado === 'Inactivo') {
            setSelectedHuesped(null);
          }
          cargarDatosBackend(authToken);
        } else {
          setAlert({ type: 'error', message: formatErrorMessage(data.detail) });
        }
      } catch {
        setAlert({ type: 'error', message: 'Error de conexión con el servidor.' });
      }
    } else {
      // Hallazgo 10: Sin backend, mostrar error. No modificar estado local.
      setAlert({ type: 'error', message: '🔌 Sin conexión al servidor. No es posible modificar el estado del huésped.' });
    }
    setLoading(false);
  };

  const handleSelectHuesped = (h) => {
    if (h.estado === 'Inactivo') {
      setAlert({ type: 'error', message: `⚠️ El huésped "${h.nombre}" está Inactivo. Debe ser activado por un Administrador o Recepcionista antes de asignarle una reserva.` });
      return;
    }
    setSelectedHuesped(h);
    setAlert({ type: 'success', message: `Huésped "${h.nombre}" seleccionado para reserva.` });
  };

  // ================================================================
  //  ELIMINAR HUÉSPED
  // ================================================================
  const handleDeleteHuesped = async (id_huesped) => {
    if (!window.confirm('¿Está seguro de eliminar este huésped y sus reservas registradas en la base de datos?')) return;
    setLoading(true);
    if (backendActivo) {
      try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const res = await fetch(`${API_URL}/api/huespedes/${id_huesped}`, { method: 'DELETE', headers });
        const data = await res.json();
        if (res.ok) {
          setAlert({ type: 'success', message: data.message });
          if (selectedHuesped?.id_huesped === id_huesped) setSelectedHuesped(null);
          cargarDatosBackend(authToken);
        } else {
          setAlert({ type: 'error', message: formatErrorMessage(data.detail) });
        }
      } catch {
        setAlert({ type: 'error', message: 'Error al comunicarse con el servidor.' });
      }
    } else {
      // Hallazgo 10: Sin backend, mostrar error. No eliminar en local.
      setAlert({ type: 'error', message: '🔌 Sin conexión al servidor. No es posible eliminar el huésped.' });
    }
    setLoading(false);
  };

  // ================================================================
  //  ELIMINAR / CANCELAR RESERVA
  // ================================================================
  const handleDeleteReserva = async (id_reserva) => {
    if (!window.confirm('¿Está seguro de cancelar/eliminar esta reserva?')) return;
    setLoading(true);
    if (backendActivo) {
      try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const res = await fetch(`${API_URL}/api/reservas/${id_reserva}`, { method: 'DELETE', headers });
        const data = await res.json();
        if (res.ok) {
          setReservaAlert({ type: 'success', message: 'Reserva eliminada exitosamente de PostgreSQL.' });
          cargarDatosBackend(authToken);
        } else {
          setReservaAlert({ type: 'error', message: formatErrorMessage(data.detail) });
        }
      } catch {
        setReservaAlert({ type: 'error', message: 'Error al comunicarse con el servidor.' });
      }
    } else {
      const targetRes = reservas.find(r => r.id_reserva === id_reserva);
      if (targetRes) {
        const esCheckIn = ['Check-In', 'Ocupada', 'Completada'].includes(targetRes.estado);
        const nuevoEstadoHab = esCheckIn ? 'En limpieza' : 'Disponible';
        setHabitaciones(prev => prev.map(h => h.id_habitacion === targetRes.id_habitacion ? { ...h, estado: nuevoEstadoHab } : h));
      }
      setReservas(prev => prev.filter(r => r.id_reserva !== id_reserva));
      setReservaAlert({ type: 'success', message: 'Reserva cancelada/eliminada exitosamente (Modo Simulación).' });
    }
    setLoading(false);
  };

  // ================================================================
  //  CAMBIAR ESTADO DE HABITACIÓN (AMAS DE LLAVES / MANTENIMIENTO)
  // ================================================================
  const handleCambiarEstadoHabitacion = async (id_habitacion, nuevoEstado, detalleMantenimiento = null) => {
    setLoading(true);
    if (backendActivo) {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        };
        const res = await fetch(`${API_URL}/api/habitaciones/${id_habitacion}/estado`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ estado: nuevoEstado, detalle_mantenimiento: detalleMantenimiento }),
        });
        const data = await res.json();
        if (res.ok) {
          setAlert({ type: 'success', message: data.message });
          cargarDatosBackend(authToken);
        } else {
          setAlert({ type: 'error', message: formatErrorMessage(data.detail) });
        }
      } catch {
        setAlert({ type: 'error', message: 'Error de conexión con el servidor.' });
      }
    } else {
      const auditoriaSimulada = `${usuarioSesion?.nombre || 'Empleado'} (${usuarioSesion?.rol || 'Simulación'})`;
      setHabitaciones(prev => prev.map(h => h.id_habitacion === id_habitacion ? { 
        ...h, 
        estado: nuevoEstado,
        modificado_por: auditoriaSimulada,
        detalle_mantenimiento: detalleMantenimiento || (nuevoEstado === 'Disponible' ? '' : h.detalle_mantenimiento)
      } : h));
      setAlert({ type: 'success', message: `Apartamento actualizado a '${nuevoEstado}' por ${auditoriaSimulada}.` });
    }
    setLoading(false);
  };

  const handleReportarDano = (h) => {
    const detalle = window.prompt(`⚠️ Reportar daño o falla técnica para el Apartamento ${h.numero}:\nEj: Fuga de agua en lavamanos, TV sin señal.`, h.detalle_mantenimiento || '');
    if (detalle !== null && detalle.trim() !== '') {
      handleCambiarEstadoHabitacion(h.id_habitacion, 'Mantenimiento', detalle.trim());
    }
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
          <span className="badge-sena" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(165,180,252,0.3)' }}>
            Estándar OPERA PMS: Auditoría de Turnos
          </span>
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
          {backendActivo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {usuarioSesion ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600,
                  padding: '0.25rem 0.7rem', borderRadius: '999px',
                  background: 'rgba(99,102,241,0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(129,140,248,0.3)',
                }}>
                  <ShieldCheck size={13}/>
                  <span>Sesión JWT: <strong>{usuarioSesion.nombre}</strong> ({usuarioSesion.rol})</span>
                  <button
                    onClick={handleLogout}
                    title="Cerrar Sesión"
                    style={{
                      background: 'rgba(239,68,68,0.2)', border: 'none', color: '#f87171',
                      borderRadius: '4px', padding: '0.15rem 0.4rem', cursor: 'pointer', fontSize: '0.7rem',
                      display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.3rem',
                    }}
                  >
                    <LogOut size={11}/> Salir
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700,
                    padding: '0.3rem 0.8rem', borderRadius: '999px',
                    background: 'linear-gradient(135deg, var(--color-gold) 0%, #d89f46 100%)',
                    color: '#130f17', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(231,179,90,0.3)',
                  }}
                >
                  <LogIn size={13}/> Iniciar Sesión Empleado
                </button>
              )}
            </div>
          )}
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
                  <label htmlFor="documento">Documento de Identidad (Solo números)</label>
                  <div className="input-wrapper">
                    <ShieldCheck className="input-icon" size={18} />
                    <input type="text" id="documento" name="documento" value={formData.documento}
                      onChange={handleUserChange} placeholder="Ej: 1017283944" inputMode="numeric" pattern="[0-9]*" maxLength={15} required />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="telefono">Teléfono (Solo números)</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input type="text" id="telefono" name="telefono" value={formData.telefono}
                      onChange={handleUserChange} placeholder="Ej: 3154449876" inputMode="numeric" pattern="[0-9]*" maxLength={15} required />
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

              {backendActivo && !authToken && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={18} />
                  <span>🔒 <strong>Acceso Restringido:</strong> Debe <strong style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setShowLoginModal(true)}>Iniciar Sesión</strong> como Administrador o Recepcionista para poder registrar nuevos huéspedes.</span>
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={loading || (backendActivo && !authToken)}>
                <span>{loading ? 'Registrando...' : (backendActivo && !authToken ? '🔒 Inicie Sesión para Registrar' : 'Registrar Huésped')}</span>
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

              {reservaData.id_habitacion && (() => {
                const year = calDate.getFullYear();
                const month = calDate.getMonth();
                const monthNames = [
                  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ];

                const habReservas = reservas.filter(r => 
                  String(r.id_habitacion) === String(reservaData.id_habitacion) &&
                  (r.estado === 'Confirmada' || r.estado === 'Check-In')
                );

                const firstDayOfMonth = new Date(year, month, 1);
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                let startDayOfWeek = firstDayOfMonth.getDay() - 1;
                if (startDayOfWeek === -1) startDayOfWeek = 6;

                const prevMonth = () => setCalDate(new Date(year, month - 1, 1));
                const nextMonth = () => setCalDate(new Date(year, month + 1, 1));

                const daysGrid = [];
                for (let i = 0; i < startDayOfWeek; i++) daysGrid.push(null);

                for (let d = 1; d <= daysInMonth; d++) {
                  const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const isOccupied = habReservas.some(r => dayStr >= r.fecha_entrada && dayStr <= r.fecha_salida);
                  const isSelectedCheckIn = reservaData.fecha_entrada === dayStr;
                  const isSelectedCheckOut = reservaData.fecha_salida === dayStr;
                  const isInRange = reservaData.fecha_entrada && reservaData.fecha_salida && dayStr >= reservaData.fecha_entrada && dayStr <= reservaData.fecha_salida;

                  daysGrid.push({
                    day: d,
                    dayStr,
                    isOccupied,
                    isSelectedCheckIn,
                    isSelectedCheckOut,
                    isInRange
                  });
                }

                const handleDayClick = (dayObj) => {
                  if (!dayObj || dayObj.isOccupied) return;

                  if (!reservaData.fecha_entrada || (reservaData.fecha_entrada && reservaData.fecha_salida)) {
                    setReservaData(prev => ({ ...prev, fecha_entrada: dayObj.dayStr, fecha_salida: '' }));
                    setCotizacion(null);
                  } else if (reservaData.fecha_entrada && !reservaData.fecha_salida) {
                    if (dayObj.dayStr <= reservaData.fecha_entrada) {
                      setReservaData(prev => ({ ...prev, fecha_entrada: dayObj.dayStr, fecha_salida: '' }));
                      setCotizacion(null);
                    } else {
                      const rangeHasOccupied = habReservas.some(r => 
                        (r.fecha_entrada <= dayObj.dayStr && r.fecha_salida >= reservaData.fecha_entrada)
                      );
                      if (rangeHasOccupied) {
                        setReservaAlert({ type: 'danger', message: 'El rango seleccionado incluye días ocupados en rojo. Elija un período continuo de días en verde.' });
                        return;
                      }

                      const updated = { ...reservaData, fecha_salida: dayObj.dayStr };
                      setReservaData(updated);
                      const sub = calcularCotizacion(updated.id_habitacion, updated.fecha_entrada, updated.fecha_salida);
                      setCotizacion(sub);
                    }
                  }
                };

                return (
                  <div style={{
                    margin: '1.25rem 0',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                  }}>
                    {/* Control de Mes y Año */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <button type="button" onClick={prevMonth} className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}>
                        ◀ Mes Anterior
                      </button>
                      <div style={{ textAlign: 'center' }}>
                        <h4 style={{ margin: 0, color: '#fbbf24', fontSize: '1.05rem', fontWeight: 'bold' }}>
                          📅 {monthNames[month]} {year}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                          Haz clic en los días <strong style={{ color: '#4ade80' }}>Verdes (Libres)</strong> para asignar Check-In y Check-Out
                        </span>
                      </div>
                      <button type="button" onClick={nextMonth} className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}>
                        Mes Siguiente ▶
                      </button>
                    </div>

                    {/* Leyenda de Colores */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '0.75rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444', display: 'inline-block' }}></span>
                        <span style={{ color: '#f87171', fontWeight: '600' }}>🔴 Ocupado (No disponible)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#22c55e', display: 'inline-block' }}></span>
                        <span style={{ color: '#4ade80', fontWeight: '600' }}>🟢 Disponible (Libre)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fbbf24', display: 'inline-block' }}></span>
                        <span style={{ color: '#fbbf24', fontWeight: '600' }}>🟡 Seleccionado</span>
                      </div>
                    </div>

                    {/* Encabezado Días de la Semana */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                      <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
                    </div>

                    {/* Cuadrícula de Días */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                      {daysGrid.map((item, idx) => {
                        if (!item) return <div key={`empty-${idx}`} style={{ padding: '0.4rem' }} />;

                        let bg = 'rgba(34, 197, 94, 0.25)';
                        let border = '1px solid rgba(34, 197, 94, 0.4)';
                        let color = '#4ade80';
                        let cursor = 'pointer';
                        let label = 'Libre';

                        if (item.isOccupied) {
                          bg = 'rgba(239, 68, 68, 0.5)';
                          border = '1px solid #ef4444';
                          color = '#ffffff';
                          cursor = 'not-allowed';
                          label = 'Ocupado';
                        } else if (item.isSelectedCheckIn || item.isSelectedCheckOut) {
                          bg = '#fbbf24';
                          border = '2px solid #f59e0b';
                          color = '#000000';
                          label = item.isSelectedCheckIn ? 'Entrada' : 'Salida';
                        } else if (item.isInRange) {
                          bg = 'rgba(251, 191, 36, 0.35)';
                          border = '1px dashed #fbbf24';
                          color = '#ffffff';
                          label = 'Estancia';
                        }

                        return (
                          <button
                            key={item.dayStr}
                            type="button"
                            onClick={() => handleDayClick(item)}
                            disabled={item.isOccupied}
                            title={item.isOccupied ? `Día ${item.dayStr} ocupado` : `Seleccionar ${item.dayStr}`}
                            style={{
                              background: bg,
                              border: border,
                              color: color,
                              cursor: cursor,
                              padding: '0.35rem 0.15rem',
                              borderRadius: '6px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              minHeight: '42px'
                            }}
                          >
                            <span>{item.day}</span>
                            <span style={{ fontSize: '0.62rem', opacity: 0.9 }}>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

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
                <div className="input-group">
                  <label htmlFor="numero_personas">Huéspedes (Personas)</label>
                  <div className="input-wrapper">
                    <Users className="input-icon" size={18} />
                    <input type="number" id="numero_personas" name="numero_personas" min="1" max="10"
                      value={reservaData.numero_personas || 1} onChange={handleReservaChange}
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
                  <tr><th>Nombre</th><th>Documento</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {huespedes.map(h => (
                    <tr key={h.id_huesped} className="huesped-row" style={{ opacity: h.estado === 'Inactivo' ? 0.75 : 1 }}>
                      <td>
                        <div className="huesped-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className="name">{h.nombre}</span>
                            <span className={`badge-lealtad ${h.estado === 'Activo' ? 'lealtad-gold' : ''}`} style={h.estado === 'Inactivo' ? { background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' } : {}}>
                              {h.estado}
                            </span>
                          </div>
                          <span className="company">{h.empresa || 'Turista'}</span>
                          {h.modificado_por && (
                            <span style={{ fontSize: '0.7rem', color: '#60a5fa', display: 'block', marginTop: '2px' }}>
                              👤 Audit: {h.modificado_por}
                            </span>
                          )}
                        </div>
                      </td>
                      <td><code>{h.documento}</code></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleSelectHuesped(h)}
                            className="btn-select-huesped"
                            style={{ opacity: h.estado === 'Inactivo' ? 0.4 : 1, cursor: h.estado === 'Inactivo' ? 'not-allowed' : 'pointer' }}
                            title={h.estado === 'Inactivo' ? 'Huésped Inactivo' : 'Seleccionar para Reserva'}
                          >
                            Seleccionar
                          </button>
                          <button
                            onClick={() => handleToggleEstadoHuesped(h)}
                            title={h.estado === 'Activo' ? 'Desactivar Huésped' : 'Activar Huésped'}
                            style={{
                              background: h.estado === 'Activo' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                              border: h.estado === 'Activo' ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: '4px',
                              color: h.estado === 'Activo' ? '#fbbf24' : '#4ade80',
                              cursor: 'pointer',
                              padding: '0.25rem 0.45rem',
                              fontSize: '0.72rem',
                              fontWeight: '600',
                            }}
                          >
                            {h.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleDeleteHuesped(h.id_huesped)}
                            title="Eliminar Huésped"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '4px',
                              color: '#f87171',
                              cursor: 'pointer',
                              padding: '0.25rem 0.4rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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
                    <tr><th>Huésped</th><th>Habitación</th><th>Fechas</th><th>Acción</th></tr>
                  </thead>
                  <tbody>
                    {reservas.map(r => (
                      <tr key={r.id_reserva}>
                        <td>
                          <div className="huesped-info">
                            <span className="name">{r.huesped_nombre}</span>
                            <span className="company">{r.huesped_documento}</span>
                            {r.creado_por && (
                              <span style={{ fontSize: '0.7rem', color: '#60a5fa', display: 'block', marginTop: '2px' }}>
                                👤 Audit: {r.creado_por}
                              </span>
                            )}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className="badge-lealtad lealtad-gold">{r.estado}</span>
                            <button
                              onClick={() => handleDeleteReserva(r.id_reserva)}
                              title="Eliminar Reserva"
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '4px',
                                color: '#f87171',
                                cursor: 'pointer',
                                padding: '0.25rem 0.4rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* TABLA ESTADO DE HABITACIONES (AMAS DE LLAVES & MANTENIMIENTO) */}
          <section className="list-section card glass" style={{ marginTop: '1.5rem' }}>
            <div className="card-header" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Home className="icon-gold" size={24} />
                <h2>Gestión de Plantas: Amas de Llaves & Mantenimiento</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setFiltroHabitaciones('amas_llaves')}
                  style={{
                    background: filtroHabitaciones === 'amas_llaves' ? 'rgba(234,179,8,0.3)' : 'transparent',
                    color: filtroHabitaciones === 'amas_llaves' ? '#fbbf24' : '#94a3b8',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🧹 Amas de Llaves (Aseo)
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroHabitaciones('mantenimiento')}
                  style={{
                    background: filtroHabitaciones === 'mantenimiento' ? 'rgba(239,68,68,0.3)' : 'transparent',
                    color: filtroHabitaciones === 'mantenimiento' ? '#f87171' : '#94a3b8',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🔧 Mantenimiento (Daños)
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroHabitaciones('todas')}
                  style={{
                    background: filtroHabitaciones === 'todas' ? 'rgba(99,102,241,0.3)' : 'transparent',
                    color: filtroHabitaciones === 'todas' ? '#a5b4fc' : '#94a3b8',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Ver Todas ({habitaciones.length})
                </button>
              </div>
            </div>

            <div className="huespedes-list-container" style={{ maxHeight: '300px' }}>
              {(() => {
                const habsFiltradas = habitaciones.filter(h => {
                  if (filtroHabitaciones === 'amas_llaves') {
                    return h.estado === 'En limpieza';
                  }
                  if (filtroHabitaciones === 'mantenimiento') {
                    return h.estado === 'Mantenimiento';
                  }
                  return true;
                });

                if (habsFiltradas.length === 0) {
                  const msgMap = {
                    amas_llaves: '🎉 ¡Excelente! No hay habitaciones pendientes por aseo en el panel de Amas de Llaves.',
                    mantenimiento: '🎉 ¡Todo operativo! No hay reportes de daños ni mantenimientos pendientes.',
                    todas: 'No hay habitaciones registradas.'
                  };
                  return (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#4ade80', fontSize: '0.9rem', fontWeight: 500 }}>
                      {msgMap[filtroHabitaciones] || 'No hay habitaciones.'}
                    </div>
                  );
                }

                return (
                  <table className="huespedes-table">
                    <thead>
                      <tr>
                        <th>Apartamento</th>
                        <th>Estado Actual</th>
                        {filtroHabitaciones === 'mantenimiento' && <th>Reporte de Daño</th>}
                        <th>Acción Operativa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {habsFiltradas.map(h => (
                        <tr key={h.id_habitacion}>
                          <td>
                            <div className="huesped-info">
                              <span className="name">Apto {h.numero}</span>
                              <span className="company">{h.tipo} — ${h.precio_noche.toLocaleString('es-CO')}/noche</span>
                              {h.modificado_por && (
                                <span style={{ fontSize: '0.7rem', color: '#a7f3d0', display: 'block', marginTop: '2px' }}>
                                  👤 Última acción por: {h.modificado_por}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="badge-lealtad" style={{
                              background:
                                h.estado === 'Disponible' ? 'rgba(34,197,94,0.2)' :
                                h.estado === 'Ocupada' ? 'rgba(99,102,241,0.2)' :
                                h.estado === 'En limpieza' ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)',
                              color:
                                h.estado === 'Disponible' ? '#4ade80' :
                                h.estado === 'Ocupada' ? '#818cf8' :
                                h.estado === 'En limpieza' ? '#fbbf24' : '#f87171',
                              border: `1px solid ${
                                h.estado === 'Disponible' ? 'rgba(74,222,128,0.3)' :
                                h.estado === 'Ocupada' ? 'rgba(129,140,248,0.3)' :
                                h.estado === 'En limpieza' ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'
                              }`
                            }}>
                              {h.estado}
                            </span>
                          </td>
                          {filtroHabitaciones === 'mantenimiento' && (
                            <td>
                              <span style={{ fontSize: '0.8rem', color: '#fca5a5', fontWeight: 500 }}>
                                ⚠️ {h.detalle_mantenimiento || 'Mantenimiento preventivo'}
                              </span>
                            </td>
                          )}
                          <td>
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                              {/* Botón para Ama de Llaves o Mantenimiento para dar alta Disponible */}
                              <button
                                type="button"
                                onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'Disponible')}
                                title="Marcar como Limpio / Reparado y Habilitado"
                                style={{
                                  background: 'rgba(34, 197, 94, 0.15)',
                                  border: '1px solid rgba(34, 197, 94, 0.3)',
                                  borderRadius: '4px',
                                  color: '#4ade80',
                                  cursor: 'pointer',
                                  padding: '0.2rem 0.4rem',
                                  fontSize: '0.7rem',
                                  fontWeight: '600',
                                }}
                              >
                                {h.estado === 'Mantenimiento' ? '🔧 Marcar Reparado' : '🧹 Marcar Limpio'}
                              </button>

                              {/* Botón para enviar a Limpieza */}
                              {h.estado !== 'En limpieza' && (
                                <button
                                  type="button"
                                  onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'En limpieza')}
                                  title="Enviar a Aseo de Camarera"
                                  style={{
                                    background: 'rgba(234, 179, 8, 0.15)',
                                    border: '1px solid rgba(234, 179, 8, 0.3)',
                                    borderRadius: '4px',
                                    color: '#fbbf24',
                                    cursor: 'pointer',
                                    padding: '0.2rem 0.4rem',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                  }}
                                >
                                  🧼 Enviar a Aseo
                                </button>
                              )}

                              {/* Botón para Reportar Daño y enviar a Mantenimiento */}
                              <button
                                type="button"
                                onClick={() => handleReportarDano(h)}
                                title="Reportar daño o falla técnica a Mantenimiento"
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '4px',
                                  color: '#f87171',
                                  cursor: 'pointer',
                                  padding: '0.2rem 0.4rem',
                                  fontSize: '0.7rem',
                                  fontWeight: '600',
                                }}
                              >
                                ⚠️ Reportar Daño
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 BookingSoft — Apartamentos Facile. Integración Full Stack para ADSO T4.</p>
      </footer>

      {/* ── MODAL DE LOGIN DE EMPLEADOS ── */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-card fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Lock size={22} className="icon-gold"/>
                <span>Iniciar Sesión Empleado</span>
              </div>
              <button className="btn-close-modal" onClick={() => setShowLoginModal(false)}>✕</button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '1.2rem', lineHeight: 1.4 }}>
              Ingresa con tu usuario y contraseña únicos de PostgreSQL para obtener tu token JWT firmado.
            </p>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Usuario</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18}/>
                  <input
                    type="text"
                    placeholder="Ej: sandra_admin o carlos_recep"
                    value={loginForm.usuario}
                    onChange={(e) => setLoginForm({ ...loginForm, usuario: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18}/>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.contrasena}
                    onChange={(e) => setLoginForm({ ...loginForm, contrasena: e.target.value })}
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div style={{ color: '#ef9a9a', fontSize: '0.8rem', background: 'rgba(198,40,40,0.2)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(198,40,40,0.3)' }}>
                  ⚠️ {loginError}
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={loading}>
                <LogIn size={18}/> {loading ? 'Autenticando...' : 'Ingresar al Sistema'}
              </button>
            </form>

            {/* BOTONES DE ACCESO RÁPIDO PARA DEMOSTRACIÓN ACADÉMICA */}
            <div className="preset-users">
              <p>⚡ Credenciales de Prueba (Presiona para autocompletar):</p>
              <button
                type="button"
                className="preset-btn"
                onClick={() => setLoginForm({ usuario: 'sandra_admin', contrasena: 'Admin2026!' })}
              >
                <span>👑 <strong>Sandra Milena</strong> (Administrador)</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>sandra_admin / Admin2026!</span>
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => setLoginForm({ usuario: 'carlos_recep', contrasena: 'Recep2026!' })}
              >
                <span>👤 <strong>Carlos Pérez</strong> (Recepcionista 24h)</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>carlos_recep / Recep2026!</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
