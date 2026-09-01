import React, { useState, useEffect } from 'react';
import { 
  UserPlus, ShieldCheck, Mail, Phone, FileText, Briefcase, Users, 
  AlertCircle, Calendar, Home, ListOrdered, Wifi, WifiOff, LogIn, 
  LogOut, Lock, User, Trash2, CheckCircle2, Wrench, Sparkles, MapPin, 
  Clock, ArrowRight, MessageCircle, Building2, Coffee
} from 'lucide-react';

// URL del backend FastAPI
const API_URL = '';

function App() {
  // ---- ESTADO DEL MODO DE CONEXIÓN ----
  const [backendActivo, setBackendActivo] = useState(false);

  // ---- ESTADO DE DATOS ----
  const [huespedes, setHuespedes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [espaciosNegocio, setEspaciosNegocio] = useState([]);
  const [reservasNegocio, setReservasNegocio] = useState([]);

  // ---- NAVEGACIÓN Y VISTAS ----
  // Vistas Públicas: 'inicio' | 'apartamentos' | 'centro_negocios_publico' | 'servicios' | 'reservar'
  // Vista PMS Interno: 'pms'
  const [activeTab, setActiveTab] = useState('inicio');
  const [pmsSubTab, setPmsSubTab] = useState('planta'); // 'planta' | 'reservas_noche' | 'centro_negocios' | 'huespedes'

  // ---- ESTADO DEL FORMULARIO DE REGISTRO ----
  const [formData, setFormData] = useState({ nombre: '', documento: '', telefono: '', correo: '', empresa: '' });
  const [habeasData, setHabeasData] = useState(false);
  const [selectedHuesped, setSelectedHuesped] = useState(null);

  // ---- ESTADO DEL FORMULARIO DE RESERVA DE ALOJAMIENTO ----
  const [reservaData, setReservaData] = useState({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
  const [cotizacion, setCotizacion] = useState(null);

  // ---- ESTADO DEL FORMULARIO DE RESERVA DEL CENTRO DE NEGOCIOS ----
  const [reservaNegocioForm, setReservaNegocioForm] = useState({
    id_espacio: '',
    tipo_cliente: 'Huésped Registrado',
    id_huesped: '',
    nombre_cliente: '',
    documento_cliente: '',
    correo_cliente: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '09:00',
    hora_fin: '11:00',
    observaciones: ''
  });

  // ---- ESTADOS UI ----
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [reservaAlert, setReservaAlert] = useState(null);
  const [reservaNegocioAlert, setReservaNegocioAlert] = useState(null);
  const [filtroHabitaciones, setFiltroHabitaciones] = useState('todas'); // 'todas' | 'amas_llaves' | 'mantenimiento'

  // ---- ESTADO DE AUTENTICACIÓN JWT Y SESIÓN EMPLEADOS ----
  const [authToken, setAuthToken] = useState(null);
  const [usuarioSesion, setUsuarioSesion] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ usuario: '', contrasena: '' });
  const [loginError, setLoginError] = useState(null);

  // Formatear errores de FastAPI
  const formatErrorMessage = (detail) => {
    if (!detail) return 'Ocurrió un error en la solicitud.';
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(err => (typeof err === 'string' ? err : err.msg || JSON.stringify(err))).join(' | ');
    }
    return JSON.stringify(detail);
  };

  // Iniciar sesión contra /api/auth/login
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
        let rol = 'Empleado';
        let nombre = loginForm.usuario.trim();
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          rol = payload.rol || 'Empleado';
          nombre = payload.nombre || payload.sub || loginForm.usuario.trim();
        } catch {
          // fallback
        }

        setUsuarioSesion({ usuario: loginForm.usuario.trim(), nombre, rol });
        setShowLoginModal(false);
        setLoginForm({ usuario: '', contrasena: '' });
        cargarDatosBackend(token);
        setActiveTab('pms');
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
    setActiveTab('inicio');
    setAlert({ type: 'success', message: 'Sesión de empleado cerrada correctamente.' });
  };

  // Verificar backend al cargar
  useEffect(() => {
    const verificarBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          setBackendActivo(true);
        }
      } catch {
        setBackendActivo(false);
      }
    };
    verificarBackend();
  }, []);

  // Cargar datos del sistema
  const cargarDatosBackend = async (token = authToken) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const [gRes, hRes, rRes, eRes, rnRes] = await Promise.all([
        fetch(`${API_URL}/api/huespedes`, { headers }),
        fetch(`${API_URL}/api/habitaciones`, { headers }),
        fetch(`${API_URL}/api/reservas`, { headers }),
        fetch(`${API_URL}/api/centro-negocios/espacios`),
        fetch(`${API_URL}/api/centro-negocios/reservas`)
      ]);
      if (gRes.ok) setHuespedes(await gRes.json());
      if (hRes.ok) setHabitaciones(await hRes.json());
      if (rRes.ok) setReservas(await rRes.json());
      if (eRes.ok) setEspaciosNegocio(await eRes.json());
      if (rnRes.ok) setReservasNegocio(await rnRes.json());
    } catch (e) {
      console.error('Error al cargar datos del backend:', e);
    }
  };

  useEffect(() => {
    if (backendActivo) {
      cargarDatosBackend(authToken);
    }
  }, [backendActivo, authToken]);

  // Registro de Huésped
  const handleRegisterHuesped = async (e) => {
    e.preventDefault();
    if (!habeasData) {
      setAlert({ type: 'error', message: 'Debe aceptar la política de tratamiento de datos personales.' });
      return;
    }
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${API_URL}/api/huespedes/registro`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Huésped registrado exitosamente.' });
        setFormData({ nombre: '', documento: '', telefono: '', correo: '', empresa: '' });
        setHabeasData(false);
        cargarDatosBackend();
      } else {
        setAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setAlert({ type: 'error', message: 'Error de conexión al registrar huésped.' });
    }
    setLoading(false);
  };

  // Creación de Reserva de Alojamiento
  const handleCrearReserva = async (e) => {
    e.preventDefault();
    if (!selectedHuesped) {
      setReservaAlert({ type: 'error', message: 'Debe seleccionar o registrar un huésped en el Paso 1.' });
      return;
    }
    if (!reservaData.id_habitacion || !reservaData.fecha_entrada || !reservaData.fecha_salida) {
      setReservaAlert({ type: 'error', message: 'Por favor complete todos los campos de la reserva.' });
      return;
    }

    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${API_URL}/api/reservas`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id_huesped: selectedHuesped.id_huesped,
          id_habitacion: parseInt(reservaData.id_habitacion),
          fecha_entrada: reservaData.fecha_entrada,
          fecha_salida: reservaData.fecha_salida
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReservaAlert({ type: 'success', message: data.message || '¡Reserva confirmada exitosamente!' });
        setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
        setCotizacion(null);
        cargarDatosBackend();
      } else {
        setReservaAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setReservaAlert({ type: 'error', message: 'Error al conectar con el servidor para la reserva.' });
    }
    setLoading(false);
  };

  // Cancelar Reserva de Alojamiento
  const handleDeleteReserva = async (id_reserva) => {
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/reservas/${id_reserva}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Reserva cancelada exitosamente.' });
        cargarDatosBackend();
      } else {
        setAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setAlert({ type: 'error', message: 'Error al cancelar la reserva.' });
    }
  };

  // Cambiar estado de habitación
  const handleCambiarEstadoHabitacion = async (id_habitacion, nuevoEstado, detalle = '') => {
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/habitaciones/${id_habitacion}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ estado: nuevoEstado, detalle_mantenimiento: detalle })
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message || `Habitación actualizada a ${nuevoEstado}.` });
        cargarDatosBackend();
      } else {
        setAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setAlert({ type: 'error', message: 'Error al actualizar estado de la habitación.' });
    }
  };

  // Reportar daño en habitación
  const handleReportarDano = (h) => {
    const detalle = window.prompt(`Describa la falla o mantenimiento requerido para el Apto ${h.numero}:`, h.detalle_mantenimiento || '');
    if (detalle !== null && detalle.trim() !== '') {
      handleCambiarEstadoHabitacion(h.id_habitacion, 'Mantenimiento', detalle.trim());
    }
  };

  // Cambiar estado de huésped (Baja Lógica Opera PMS)
  const handleCambiarEstadoHuesped = async (id_huesped, nuevoEstado) => {
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/huespedes/${id_huesped}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message || `Estado del huésped cambiado a ${nuevoEstado}.` });
        cargarDatosBackend();
      } else {
        setAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setAlert({ type: 'error', message: 'Error al actualizar el estado del huésped.' });
    }
  };

  // Crear Reserva del Centro de Negocios (por horas)
  const handleCrearReservaNegocio = async (e) => {
    e.preventDefault();
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }

    if (!reservaNegocioForm.id_espacio) {
      setReservaNegocioAlert({ type: 'error', message: 'Por favor seleccione una Sala de Juntas o espacio de Coworking.' });
      return;
    }

    setLoading(true);
    setReservaNegocioAlert(null);

    let nombreCliente = reservaNegocioForm.nombre_cliente;
    let docCliente = reservaNegocioForm.documento_cliente;
    let mailCliente = reservaNegocioForm.correo_cliente;
    let idHuespedVal = null;

    if (reservaNegocioForm.tipo_cliente === 'Huésped Registrado') {
      const hSel = huespedes.find(h => h.id_huesped === parseInt(reservaNegocioForm.id_huesped));
      if (!hSel) {
        setReservaNegocioAlert({ type: 'error', message: 'Debe seleccionar un huésped registrado de la lista.' });
        setLoading(false);
        return;
      }
      nombreCliente = hSel.nombre;
      docCliente = hSel.documento;
      mailCliente = hSel.correo;
      idHuespedVal = hSel.id_huesped;
    }

    try {
      const res = await fetch(`${API_URL}/api/centro-negocios/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id_espacio: parseInt(reservaNegocioForm.id_espacio),
          tipo_cliente: reservaNegocioForm.tipo_cliente,
          id_huesped: idHuespedVal,
          nombre_cliente: nombreCliente,
          documento_cliente: docCliente,
          correo_cliente: mailCliente,
          fecha: reservaNegocioForm.fecha,
          hora_inicio: reservaNegocioForm.hora_inicio,
          hora_fin: reservaNegocioForm.hora_fin,
          observaciones: reservaNegocioForm.observaciones
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReservaNegocioAlert({ type: 'success', message: data.message || '¡Reserva de espacio empresarial confirmada!' });
        setReservaNegocioForm({
          id_espacio: '',
          tipo_cliente: 'Huésped Registrado',
          id_huesped: '',
          nombre_cliente: '',
          documento_cliente: '',
          correo_cliente: '',
          fecha: new Date().toISOString().split('T')[0],
          hora_inicio: '09:00',
          hora_fin: '11:00',
          observaciones: ''
        });
        cargarDatosBackend();
      } else {
        setReservaNegocioAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setReservaNegocioAlert({ type: 'error', message: 'Error de conexión al reservar el espacio del Centro de Negocios.' });
    }
    setLoading(false);
  };

  // Cancelar Reserva de Centro de Negocios
  const handleCancelarReservaNegocio = async (id_reserva_negocio) => {
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/centro-negocios/reservas/${id_reserva_negocio}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Reserva cancelada.' });
        cargarDatosBackend();
      } else {
        setAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setAlert({ type: 'error', message: 'Error al cancelar la reserva.' });
    }
  };

  return (
    <div className="app-container">
      {/* =========================================================================
          SISTEMA PMS INDEPENDIENTE (PORTAL EMPLEADOS Y GESTIÓN HOTELERA)
          ========================================================================= */}
      {activeTab === 'pms' && usuarioSesion ? (
        <div className="pms-standalone-wrapper" style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc' }}>
          {/* HEADER EXCLUSIVO PMS */}
          <header style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ background: 'var(--color-primary-red)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                BookingSoft PMS
              </div>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Sistema Integral de Gestión Hotelera & Centro de Negocios</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#334155', padding: '0.35rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} color="#38bdf8"/>
                <span>{usuarioSesion.nombre}</span>
                <span style={{ background: 'var(--color-primary-red)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {usuarioSesion.rol}
                </span>
              </div>
              
              <button 
                onClick={() => setActiveTab('inicio')}
                style={{ background: '#475569', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                🌐 Web Pública
              </button>

              <button 
                onClick={handleLogout}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}
              >
                <LogOut size={14}/> Salir
              </button>
            </div>
          </header>

          {/* NAVBAR SUBTABS DEL PMS */}
          <nav style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '0.5rem 1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            <button 
              className={`pms-nav-tab ${pmsSubTab === 'planta' ? 'active' : ''}`}
              onClick={() => setPmsSubTab('planta')}
              style={{ background: pmsSubTab === 'planta' ? 'var(--color-primary-red)' : '#1e293b', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
            >
              🏨 Operaciones de Planta ({habitaciones.length} Unidades)
            </button>
            <button 
              className={`pms-nav-tab ${pmsSubTab === 'reservas_noche' ? 'active' : ''}`}
              onClick={() => setPmsSubTab('reservas_noche')}
              style={{ background: pmsSubTab === 'reservas_noche' ? 'var(--color-primary-red)' : '#1e293b', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
            >
              📅 Reservas de Hospedaje ({reservas.length})
            </button>
            <button 
              className={`pms-nav-tab ${pmsSubTab === 'centro_negocios' ? 'active' : ''}`}
              onClick={() => setPmsSubTab('centro_negocios')}
              style={{ background: pmsSubTab === 'centro_negocios' ? 'var(--color-primary-red)' : '#1e293b', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
            >
              🏢 Centro de Negocios / Horas ({reservasNegocio.length})
            </button>
            <button 
              className={`pms-nav-tab ${pmsSubTab === 'huespedes' ? 'active' : ''}`}
              onClick={() => setPmsSubTab('huespedes')}
              style={{ background: pmsSubTab === 'huespedes' ? 'var(--color-primary-red)' : '#1e293b', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
            >
              👥 Directorio de Huéspedes ({huespedes.length})
            </button>
          </nav>

          {/* CONTENIDO DEL PANEL PMS */}
          <main style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            {alert && (
              <div style={{ padding: '0.8rem 1rem', borderRadius: '6px', marginBottom: '1.2rem', background: alert.type === 'success' ? '#166534' : '#991b1b', color: '#fff', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{alert.type === 'success' ? '✅' : '⚠️'} {alert.message}</span>
                <button onClick={() => setAlert(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
            )}

            {/* SUBTAB 1: OPERACIONES DE PLANTA */}
            {pmsSubTab === 'planta' && (
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1.5rem', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#f8fafc' }}>
                    🏨 Operaciones de Planta: Control en Tiempo Real de Alojamientos
                  </h2>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn-mini" onClick={() => setFiltroHabitaciones('amas_llaves')} style={{ background: filtroHabitaciones === 'amas_llaves' ? '#f59e0b' : '#334155', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' }}>
                      🧹 Aseo Pendiente ({habitaciones.filter(h => h.estado === 'En limpieza').length})
                    </button>
                    <button className="btn-mini" onClick={() => setFiltroHabitaciones('mantenimiento')} style={{ background: filtroHabitaciones === 'mantenimiento' ? '#ef4444' : '#334155', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' }}>
                      🔧 Mantenimiento ({habitaciones.filter(h => h.estado === 'Mantenimiento').length})
                    </button>
                    <button className="btn-mini" onClick={() => setFiltroHabitaciones('todas')} style={{ background: filtroHabitaciones === 'todas' ? 'var(--color-primary-red)' : '#334155', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' }}>
                      Ver Todas ({habitaciones.length})
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <thead>
                      <tr style={{ background: '#0f172a', textAlign: 'left', borderBottom: '2px solid #334155' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Apto / Unidad</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Categoría</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Capacidad</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Precio / Noche</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Estado</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Detalle</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Acciones de Turno</th>
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
                          <tr key={h.id_habitacion} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#f8fafc' }}>Apto {h.numero}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{h.tipo}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{h.capacidad} personas (Cama Queen)</td>
                            <td style={{ padding: '0.75rem 1rem' }}>${Number(h.precio_noche).toLocaleString('es-CO')} COP</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{
                                padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                background: h.estado === 'Disponible' ? '#166534' : h.estado === 'Ocupada' ? '#1e40af' : h.estado === 'En limpieza' ? '#b45309' : '#991b1b',
                                color: '#fff'
                              }}>
                                {h.estado}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#fca5a5', fontSize: '0.8rem' }}>{h.detalle_mantenimiento || '-'}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ display: 'flex', gap: '0.3rem' }}>
                                <button onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'Disponible')} style={{ background: '#15803d', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem' }}>
                                  ✓ Disponible
                                </button>
                                <button onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'En limpieza')} style={{ background: '#b45309', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem' }}>
                                  🧹 Aseo
                                </button>
                                <button onClick={() => handleReportarDano(h)} style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem' }}>
                                  ⚠️ Daño
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

            {/* SUBTAB 2: RESERVAS DE HOSPEDAJE */}
            {pmsSubTab === 'reservas_noche' && (
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1.5rem', border: '1px solid #334155' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.2rem', color: '#f8fafc' }}>
                  📅 Gestión de Reservas de Hospedaje (Noches Continuas)
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <thead>
                      <tr style={{ background: '#0f172a', textAlign: 'left', borderBottom: '2px solid #334155' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Huésped</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Apartamento</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Check-In / Check-Out</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Estado</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservas.map(r => (
                        <tr key={r.id_reserva} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <strong style={{ color: '#f8fafc', display: 'block' }}>{r.huesped_nombre}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Doc: {r.huesped_documento}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#38bdf8' }}>Apto {r.habitacion_numero}</td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                            In: {r.fecha_entrada} | Out: {r.fecha_salida}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: r.estado === 'Confirmada' ? '#166534' : '#991b1b', color: '#fff' }}>
                              {r.estado}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <button onClick={() => handleDeleteReserva(r.id_reserva)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                              Cancelar Reserva
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBTAB 3: CENTRO DE NEGOCIOS (POR HORAS) */}
            {pmsSubTab === 'centro_negocios' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* FORMULARIO DE RESERVA DE SALAS / COWORKING */}
                <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1.5rem', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={18}/> Reservar Espacio Empresarial (Por Horas)
                  </h3>

                  {reservaNegocioAlert && (
                    <div style={{ padding: '0.6rem 0.8rem', borderRadius: '4px', marginBottom: '1rem', background: reservaNegocioAlert.type === 'success' ? '#166534' : '#991b1b', color: '#fff', fontSize: '0.8rem' }}>
                      {reservaNegocioAlert.message}
                    </div>
                  )}

                  <form onSubmit={handleCrearReservaNegocio}>
                    <div style={{ marginBottom: '0.8rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Espacio Empresarial</label>
                      <select 
                        style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                        value={reservaNegocioForm.id_espacio}
                        onChange={(e) => setReservaNegocioForm({ ...reservaNegocioForm, id_espacio: e.target.value })}
                        required
                      >
                        <option value="">-- Seleccionar Sala de Juntas o Coworking --</option>
                        {espaciosNegocio.map(e => (
                          <option key={e.id_espacio} value={e.id_espacio}>
                            {e.nombre} ({e.tipo}) - ${Number(e.precio_hora).toLocaleString('es-CO')} COP/hora
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '0.8rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Tipo de Cliente</label>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#e2e8f0', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="tipo_cliente" 
                            value="Huésped Registrado"
                            checked={reservaNegocioForm.tipo_cliente === 'Huésped Registrado'}
                            onChange={(e) => setReservaNegocioForm({ ...reservaNegocioForm, tipo_cliente: e.target.value })}
                          /> 🏨 Huésped de Facile
                        </label>
                        <label style={{ fontSize: '0.85rem', color: '#e2e8f0', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="tipo_cliente" 
                            value="Cliente Externo"
                            checked={reservaNegocioForm.tipo_cliente === 'Cliente Externo'}
                            onChange={(e) => setReservaNegocioForm({ ...reservaNegocioForm, tipo_cliente: e.target.value })}
                          /> 🏢 Cliente / Empresa Externa
                        </label>
                      </div>
                    </div>

                    {reservaNegocioForm.tipo_cliente === 'Huésped Registrado' ? (
                      <div style={{ marginBottom: '0.8rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Seleccionar Huésped Hospedado</label>
                        <select
                          style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                          value={reservaNegocioForm.id_huesped}
                          onChange={(e) => setReservaNegocioForm({ ...reservaNegocioForm, id_huesped: e.target.value })}
                          required
                        >
                          <option value="">-- Seleccionar Huésped --</option>
                          {huespedes.map(h => (
                            <option key={h.id_huesped} value={h.id_huesped}>
                              {h.nombre} (Doc: {h.documento}) {h.empresa ? `- ${h.empresa}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: '0.8rem' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Nombre Completo / Empresa Externa</label>
                          <input 
                            type="text" 
                            placeholder="Ej: Empresa XYZ / Dr. Roberto Gómez"
                            style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                            value={reservaNegocioForm.nombre_cliente}
                            onChange={(e) => setReservaNegocioForm({ ...reservaNegocioForm, nombre_cliente: e.target.value })}
                            required
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>NIT / Documento</label>
                            <input 
                              type="text" 
                              placeholder="900.123.456-7"
                              style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                              value={reservaNegocioForm.documento_cliente}
                              onChange={(e) => setReservaNegocioForm({ ...reservaNegocioForm, documento_cliente: e.target.value })}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Correo Contacto</label>
                            <input 
                              type="email" 
                              placeholder="contacto@empresa.com"
                              style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                              value={reservaNegocioForm.correo_cliente}
                              onChange={(e) => setReservaNegocioForm({ ...reservaNegocioForm, correo_cliente: e.target.value })}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Fecha</label>
                        <input 
                          type="date"
                          style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                          value={reservaNegocioForm.fecha}
                          onChange={(e) => setReservaNegocioForm({ ...reservaNegocioForm, fecha: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Hora Inicio</label>
                        <input 
                          type="time"
                          style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                          value={reservaNegocioForm.hora_inicio}
                          onChange={(e) => setReservaNegocioForm({ ...reservaNegocioForm, hora_inicio: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Hora Fin</label>
                        <input 
                          type="time"
                          style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                          value={reservaNegocioForm.hora_fin}
                          onChange={(e) => setReservaNegocioForm({ ...reservaNegocioForm, hora_fin: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Observaciones / Requerimientos Especiales</label>
                      <input 
                        type="text"
                        placeholder="Ej: Video Beam HDMI y servicio de café"
                        style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                        value={reservaNegocioForm.observaciones}
                        onChange={(e) => setReservaNegocioForm({ ...reservaNegocioForm, observaciones: e.target.value })}
                      />
                    </div>

                    <button 
                      type="submit" 
                      style={{ width: '100%', padding: '0.7rem', background: 'var(--color-primary-red)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                      disabled={loading}
                    >
                      {loading ? 'Procesando...' : 'Confirmar Reserva de Espacio'}
                    </button>
                  </form>
                </div>

                {/* TABLA DE RESERVAS DEL CENTRO DE NEGOCIOS */}
                <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1.5rem', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#f8fafc' }}>
                    📋 Reservas Activas del Centro de Negocios ({reservasNegocio.length})
                  </h3>

                  <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <thead>
                        <tr style={{ background: '#0f172a', textAlign: 'left', borderBottom: '2px solid #334155' }}>
                          <th style={{ padding: '0.6rem' }}>Espacio</th>
                          <th style={{ padding: '0.6rem' }}>Cliente</th>
                          <th style={{ padding: '0.6rem' }}>Fecha & Horario</th>
                          <th style={{ padding: '0.6rem' }}>Total</th>
                          <th style={{ padding: '0.6rem' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservasNegocio.map(rn => (
                          <tr key={rn.id_reserva_negocio} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '0.6rem', fontWeight: 'bold', color: '#38bdf8' }}>{rn.espacio}</td>
                            <td style={{ padding: '0.6rem' }}>
                              <strong style={{ color: '#f8fafc', display: 'block' }}>{rn.nombre_cliente}</strong>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{rn.tipo_cliente}</span>
                            </td>
                            <td style={{ padding: '0.6rem' }}>
                              {rn.fecha}<br/>
                              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{rn.hora_inicio} - {rn.hora_fin}</span> ({rn.duracion_horas}h)
                            </td>
                            <td style={{ padding: '0.6rem', fontWeight: 'bold', color: '#4ade80' }}>
                              ${Number(rn.precio_total).toLocaleString('es-CO')}
                            </td>
                            <td style={{ padding: '0.6rem' }}>
                              <button onClick={() => handleCancelarReservaNegocio(rn.id_reserva_negocio)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.2rem 0.4rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>
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
            )}

            {/* SUBTAB 4: DIRECTORIO DE HUÉSPEDES (BAJA LÓGICA OPERA PMS) */}
            {pmsSubTab === 'huespedes' && (
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1.5rem', border: '1px solid #334155' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.2rem', color: '#f8fafc' }}>
                  👥 Directorio de Huéspedes & Control de Estado (Estándar Opera PMS)
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <thead>
                      <tr style={{ background: '#0f172a', textAlign: 'left', borderBottom: '2px solid #334155' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Huésped</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Documento</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Contacto</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Empresa</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Estado</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Acciones (Baja Lógica)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {huespedes.map(h => (
                        <tr key={h.id_huesped} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#f8fafc' }}>{h.nombre}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{h.documento}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{h.telefono} | {h.correo}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{h.empresa || 'Particular'}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: h.estado === 'Activo' ? '#166534' : '#991b1b', color: '#fff' }}>
                              {h.estado}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {h.estado === 'Activo' ? (
                              <button onClick={() => handleCambiarEstadoHuesped(h.id_huesped, 'Inactivo')} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                🚫 Desactivar
                              </button>
                            ) : (
                              <button onClick={() => handleCambiarEstadoHuesped(h.id_huesped, 'Activo')} style={{ background: '#166534', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                 Activar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      ) : (
        /* =========================================================================
           PÁGINA PÚBLICA COMERCIAL (APARTAMENTOS FACILE - WEB DE HUÉSPEDES)
           ========================================================================= */
        <>
          {/* 1. TOPBAR OFICIAL ROJA */}
          <div className="facile-topbar">
            <div className="facile-topbar-content">
              <div className="topbar-left">
                <MapPin size={14}/>
                <span>Calle 97 #21-62, Chicó, Bogotá</span>
              </div>
              <div className="topbar-right">
                <a href="tel:3153512085" className="topbar-phone">
                  <Phone size={14}/>
                  <span>315 351 2085</span>
                </a>
                <div className="topbar-social">
                  <a href="https://www.facebook.com/apartamentosfacile/" target="_blank" rel="noreferrer">Facebook</a>
                  <a href="https://www.instagram.com/apartamentosfacile/" target="_blank" rel="noreferrer">Instagram</a>
                </div>
              </div>
            </div>
          </div>

          {/* 2. HEADER ROJO OFICIAL PÚBLICO (SIN BOTÓN DE EMPLEADOS) */}
          <header className="facile-header">
            <div className="facile-header-content">
              <div className="facile-logo" onClick={() => setActiveTab('inicio')}>
                <span className="facile-logo-script">Facile</span>
                <span className="facile-logo-sub">APARTAMENTOS</span>
              </div>

              <nav className="facile-nav">
                <button className={`facile-nav-link ${activeTab === 'inicio' ? 'active' : ''}`} onClick={() => setActiveTab('inicio')}>
                  Inicio
                </button>
                <button className={`facile-nav-link ${activeTab === 'apartamentos' ? 'active' : ''}`} onClick={() => setActiveTab('apartamentos')}>
                  Alojamientos (38 Unidades)
                </button>
                <button className={`facile-nav-link ${activeTab === 'centro_negocios_publico' ? 'active' : ''}`} onClick={() => setActiveTab('centro_negocios_publico')}>
                  Centro de Negocios
                </button>
                <button className={`facile-nav-link ${activeTab === 'servicios' ? 'active' : ''}`} onClick={() => setActiveTab('servicios')}>
                  Servicios
                </button>
                <button className={`facile-nav-link ${activeTab === 'reservar' ? 'active' : ''}`} onClick={() => setActiveTab('reservar')}>
                  Reservar Online
                </button>
              </nav>
            </div>
          </header>

          {/* HERO PRINCIPAL */}
          {activeTab === 'inicio' && (
            <>
              <section className="facile-hero">
                <div className="facile-hero-container">
                  <div className="facile-hero-card">
                    <h1>Hola Bienvenidos!</h1>
                    <p>
                      Apartamentos amoblados para largas estadías con los servicios completos de un hotel 5 estrellas y centro de negocios. Estamos ubicados en la mejor zona del norte de Bogotá, Barrio Chicó.
                    </p>
                    <button className="btn-whatsapp-blue" onClick={() => setActiveTab('reservar')}>
                      AQUÍ INFORMACIÓN POR WHATSAPP
                    </button>
                  </div>
                </div>
              </section>

              {/* SECCIÓN DESTACADOS */}
              <div className="facile-section">
                <div className="section-title-wrap">
                  <h2>Apartamentos Facile Bogotá</h2>
                  <p>Confort, elegancia y centro de negocios en la mejor ubicación de la capital</p>
                </div>

                <div className="services-card-grid">
                  <div className="service-card">
                    <div className="service-card-icon">🏢</div>
                    <h3>38 Unidades Amobladas</h3>
                    <p>Dúplex, Dobles, Familiares y Habitaciones con camas Queen y máximo confort.</p>
                  </div>
                  <div className="service-card">
                    <div className="service-card-icon">💼</div>
                    <h3>Centro de Negocios</h3>
                    <p>Salas de Juntas y espacios Coworking por horas para huéspedes y clientes externos.</p>
                  </div>
                  <div className="service-card">
                    <div className="service-card-icon">🛡️</div>
                    <h3>Recepción & Seguridad 24/7</h3>
                    <p>Personal operativo en portería y circuito de vigilancia permanente.</p>
                  </div>
                  <div className="service-card">
                    <div className="service-card-icon">✨</div>
                    <h3>15% Descuento Larga Estadía</h3>
                    <p>Descuento automático para todas las reservas superiores a 15 noches continuas.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VISTA: CATÁLOGO REAL DE ALOJAMIENTOS (38 UNIDADES) */}
          {(activeTab === 'apartamentos' || activeTab === 'inicio') && (
            <section className="facile-section" style={{ borderTop: activeTab === 'inicio' ? '1px solid #e2e8f0' : 'none' }}>
              <div className="section-title-wrap">
                <h2>Inventario de Alojamientos (38 Unidades)</h2>
                <p>Todas nuestras habitaciones cuentan con <strong>Cama QUEEN</strong> y acabados de lujo</p>
              </div>

              <div className="apto-grid">
                {/* DÚPLEX */}
                <div className="apto-item">
                  <div className="apto-header">
                    <h3>Dúplex (14 Unidades)</h3>
                    <span className="badge-red-num">56 m²</span>
                  </div>
                  <div className="apto-body">
                    <p className="apto-text">
                      1 Habitación con Cama Queen + Sofá-cama. Capacidad 3 personas. 2 Baños, sala, cocina equipada, TV, Wi-Fi 5G y lavadora.
                    </p>
                    <div className="apto-specs">
                      <span className="spec-pill"><Users size={12}/> Capacidad: 3 personas</span>
                      <span className="spec-pill"><Home size={12}/> 1 Hab + 2 Baños</span>
                      <span className="spec-pill"><Wifi size={12}/> Wi-Fi 5G</span>
                    </div>
                    <div className="apto-footer">
                      <div className="price-text">
                        $250.000 <span>COP/noche (ref)</span>
                      </div>
                      <button className="btn-book-red" onClick={() => setActiveTab('reservar')}>
                        Reservar
                      </button>
                    </div>
                  </div>
                </div>

                {/* DOBLE */}
                <div className="apto-item">
                  <div className="apto-header">
                    <h3>Doble (11 Unidades)</h3>
                    <span className="badge-red-num">2 Habitaciones</span>
                  </div>
                  <div className="apto-body">
                    <p className="apto-text">
                      2 Habitaciones con Cama Queen en cada una + opción de Sofá-cama. Capacidad 5 personas. Sala de estar, cocina equipada, TV y Wi-Fi.
                    </p>
                    <div className="apto-specs">
                      <span className="spec-pill"><Users size={12}/> Capacidad: 5 personas</span>
                      <span className="spec-pill"><Home size={12}/> 2 Hab (Camas Queen)</span>
                      <span className="spec-pill"><Wifi size={12}/> Wi-Fi 5G</span>
                    </div>
                    <div className="apto-footer">
                      <div className="price-text">
                        $320.000 <span>COP/noche (ref)</span>
                      </div>
                      <button className="btn-book-red" onClick={() => setActiveTab('reservar')}>
                        Reservar
                      </button>
                    </div>
                  </div>
                </div>

                {/* FAMILIAR */}
                <div className="apto-item">
                  <div className="apto-header">
                    <h3>Familiar (2 Unidades)</h3>
                    <span className="badge-red-num">3 Habitaciones</span>
                  </div>
                  <div className="apto-body">
                    <p className="apto-text">
                      3 Habitaciones con 3 Camas Queen + opción de Sofá-cama. Capacidad hasta 7 personas. Sala, comedor independiente, cocina y zona de ropas.
                    </p>
                    <div className="apto-specs">
                      <span className="spec-pill"><Users size={12}/> Capacidad: 7 personas</span>
                      <span className="spec-pill"><Home size={12}/> 3 Hab (3 Camas Queen)</span>
                      <span className="spec-pill"><Wifi size={12}/> Wi-Fi 5G</span>
                    </div>
                    <div className="apto-footer">
                      <div className="price-text">
                        $390.000 <span>COP/noche (ref)</span>
                      </div>
                      <button className="btn-book-red" onClick={() => setActiveTab('reservar')}>
                        Reservar
                      </button>
                    </div>
                  </div>
                </div>

                {/* HABITACIÓN */}
                <div className="apto-item">
                  <div className="apto-header">
                    <h3>Habitación (11 Unidades)</h3>
                    <span className="badge-red-num">Suite 17 m²</span>
                  </div>
                  <div className="apto-body">
                    <p className="apto-text">
                      1 Habitación con Cama Queen. Capacidad 2 personas. Baño privado, TV, Wi-Fi 5G y secador de pelo. Ideal para viajes ejecutivos.
                    </p>
                    <div className="apto-specs">
                      <span className="spec-pill"><Users size={12}/> Capacidad: 2 personas</span>
                      <span className="spec-pill"><Home size={12}/> Baño Privado</span>
                      <span className="spec-pill"><Wifi size={12}/> Wi-Fi 5G</span>
                    </div>
                    <div className="apto-footer">
                      <div className="price-text">
                        $180.000 <span>COP/noche (ref)</span>
                      </div>
                      <button className="btn-book-red" onClick={() => setActiveTab('reservar')}>
                        Reservar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* VISTA PÚBLICA: CENTRO DE NEGOCIOS */}
          {activeTab === 'centro_negocios_publico' && (
            <section className="facile-section">
              <div className="section-title-wrap">
                <h2>Centro de Negocios Apartamentos Facile</h2>
                <p>Espacios corporativos modernos por horas para huéspedes y empresas externas</p>
              </div>

              <div className="apto-grid">
                <div className="apto-item">
                  <div className="apto-header">
                    <h3>Salas de Juntas (2 Salas)</h3>
                    <span className="badge-red-num">Empresarial</span>
                  </div>
                  <div className="apto-body">
                    <p className="apto-text">
                      Salas de reuniones equipadas con tecnología de proyección, fibra óptica y capacidad para 10 personas. Reservas por horas o día completo.
                    </p>
                    <div className="price-text" style={{ marginBottom: '1rem' }}>
                      $70.000 <span>COP/hora (ref)</span>
                    </div>
                    <ul style={{ fontSize: '0.85rem', color: '#475569', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                      <li>1 Hora: $70.000 COP</li>
                      <li>2 Horas: $140.000 COP</li>
                      <li>4 Horas (Bloque): $250.000 COP</li>
                      <li>Día Completo: $450.000 COP</li>
                    </ul>
                  </div>
                </div>

                <div className="apto-item">
                  <div className="apto-header">
                    <h3>Espacios Coworking / Flex</h3>
                    <span className="badge-red-num">Conectividad 5G</span>
                  </div>
                  <div className="apto-body">
                    <p className="apto-text">
                      Puestos de trabajo flexibles con conectividad por fibra óptica, ambiente tranquilo y estación de café.
                    </p>
                    <div className="price-text" style={{ marginBottom: '1rem' }}>
                      $20.000 <span>COP/hora (ref)</span>
                    </div>
                    <ul style={{ fontSize: '0.85rem', color: '#475569', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                      <li>1 Hora: $20.000 COP</li>
                      <li>4 Horas: $70.000 COP</li>
                      <li>Día Completo: $100.000 COP</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* VISTA: REGISTRO Y RESERVAS ONLINE */}
          {activeTab === 'reservar' && (
            <section className="facile-section">
              <div className="section-title-wrap">
                <h2>Portal de Registro y Reservas</h2>
                <p>Complete sus datos de huésped para solicitar su reserva en Facile</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* FORMULARIO HUÉSPED */}
                <div className="clean-card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-primary-red)' }}>
                    1. Datos del Huésped
                  </h3>
                  <form onSubmit={handleRegisterHuesped}>
                    <div className="form-field">
                      <label>Nombre Completo</label>
                      <input type="text" placeholder="Ej: Juan Pérez" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required/>
                    </div>
                    <div className="form-field">
                      <label>Documento de Identidad</label>
                      <input type="text" placeholder="Cédula o Pasaporte" value={formData.documento} onChange={(e) => setFormData({...formData, documento: e.target.value})} required/>
                    </div>
                    <div className="form-field">
                      <label>Teléfono Movil</label>
                      <input type="tel" placeholder="310 000 0000" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} required/>
                    </div>
                    <div className="form-field">
                      <label>Correo Electrónico</label>
                      <input type="email" placeholder="correo@ejemplo.com" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} required/>
                    </div>
                    <div className="form-field">
                      <label>Empresa (Opcional)</label>
                      <input type="text" placeholder="Nombre de la empresa" value={formData.empresa} onChange={(e) => setFormData({...formData, empresa: e.target.value})}/>
                    </div>

                    <div style={{ margin: '1rem 0' }}>
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={habeasData} onChange={(e) => setHabeasData(e.target.checked)}/>
                        Autorizo el tratamiento de datos personales conforme a la Ley 1581.
                      </label>
                    </div>

                    <button type="submit" className="btn-submit-red" disabled={loading}>
                      {loading ? 'Guardando...' : 'Registrar Huésped'}
                    </button>
                  </form>
                </div>

                {/* FORMULARIO RESERVA */}
                <div className="clean-card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-primary-red)' }}>
                    2. Seleccionar Alojamiento & Fechas
                  </h3>

                  {reservaAlert && (
                    <div style={{ padding: '0.5rem', background: reservaAlert.type === 'success' ? '#dcfce7' : '#fee2e2', color: reservaAlert.type === 'success' ? '#166534' : '#991b1b', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                      {reservaAlert.message}
                    </div>
                  )}

                  <form onSubmit={handleCrearReserva}>
                    <div className="form-field">
                      <label>Huésped Titular</label>
                      <select onChange={(e) => {
                        const h = huespedes.find(x => x.id_huesped === parseInt(e.target.value));
                        setSelectedHuesped(h || null);
                      }} required>
                        <option value="">-- Seleccionar Huésped --</option>
                        {huespedes.map(h => (
                          <option key={h.id_huesped} value={h.id_huesped}>{h.nombre} ({h.documento})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Unidad de Alojamiento</label>
                      <select value={reservaData.id_habitacion} onChange={(e) => setReservaData({...reservaData, id_habitacion: e.target.value})} required>
                        <option value="">-- Seleccionar Apartamento --</option>
                        {habitaciones.map(h => (
                          <option key={h.id_habitacion} value={h.id_habitacion}>
                            Apto {h.numero} - {h.tipo} (${Number(h.precio_noche).toLocaleString('es-CO')} COP/noche)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-field">
                        <label>Fecha Entrada (Check-In)</label>
                        <input type="date" value={reservaData.fecha_entrada} onChange={(e) => setReservaData({...reservaData, fecha_entrada: e.target.value})} required/>
                      </div>
                      <div className="form-field">
                        <label>Fecha Salida (Check-Out)</label>
                        <input type="date" value={reservaData.fecha_salida} onChange={(e) => setReservaData({...reservaData, fecha_salida: e.target.value})} required/>
                      </div>
                    </div>

                    <button type="submit" className="btn-submit-red" disabled={loading} style={{ marginTop: '1rem' }}>
                      {loading ? 'Confirmando...' : 'Confirmar Reserva de Hospedaje'}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          )}

          {/* WHATSAPP WIDGET FLOATING */}
          <div className="whatsapp-float-wrap">
            <span className="whatsapp-bubble">¿En qué podemos servirle?</span>
            <a href="https://wa.me/573153512085" target="_blank" rel="noreferrer" className="whatsapp-circle-btn" title="Contactar por WhatsApp">
              <MessageCircle size={28}/>
            </a>
          </div>

          {/* FOOTER PÚBLICO CON ENLACE DISCRETO AL PORTAL PMS DE EMPLEADOS */}
          <footer className="facile-footer">
            <div className="facile-footer-grid">
              <div className="footer-section">
                <h4>Apartamentos Facile</h4>
                <p>Apartamentos amoblados para largas estadías en Bogotá con servicios de hotel y centro de negocios.</p>
                <p><strong>PBX:</strong> +57 315 351 2085</p>
              </div>
              <div className="footer-section">
                <h4>Ubicación & Contacto</h4>
                <p>Calle 97 #21-62, Barrio Chicó</p>
                <p>Bogotá D.C., Colombia</p>
                <p>Recepción 24 Horas</p>
              </div>
              <div className="footer-section">
                <h4>BookingSoft System</h4>
                <p>Sistema de Administración Hotelera Integral ADSO 2026.</p>
                <button 
                  onClick={() => {
                    if (usuarioSesion) {
                      setActiveTab('pms');
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Lock size={12}/> Acceso Personal Autorizado (PMS BookingSoft)
                </button>
              </div>
            </div>
            <div className="footer-copy">
              <p>© 2026 Apartamentos Facile — Todos los derechos reservados.</p>
            </div>
          </footer>
        </>
      )}

      {/* MODAL DE LOGIN DE EMPLEADOS */}
      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>
                <Lock size={18}/> Iniciar Sesión en BookingSoft PMS
              </h3>
              <button className="btn-x" onClick={() => setShowLoginModal(false)}>✕</button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.2rem' }}>
              Ingrese con sus credenciales de empleado para acceder al sistema interno de gestión hotelera.
            </p>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-field">
                <label>Usuario</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18}/>
                  <input
                    type="text"
                    placeholder="bookingsoft_admin o carlos_recep"
                    value={loginForm.usuario}
                    onChange={(e) => setLoginForm({ ...loginForm, usuario: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Contraseña</label>
                <div className="field-input-wrap">
                  <Lock className="field-icon" size={16}/>
                  <input type="password" placeholder="••••••••" value={loginForm.contrasena} onChange={(e) => setLoginForm({ ...loginForm, contrasena: e.target.value })} required/>
                </div>
              </div>

              {loginError && (
                <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px', fontSize: '0.78rem', marginBottom: '0.8rem' }}>
                  ⚠️ {loginError}
                </div>
              )}

              <button type="submit" className="btn-submit-red" disabled={loading}>
                <LogIn size={16}/> {loading ? 'Validando...' : 'Acceder al Sistema PMS'}
              </button>
            </form>

            <div className="preset-users">
              <p>⚡ Credenciales de Prueba (Presiona para autocompletar):</p>
              <button
                type="button"
                className="preset-btn"
                onClick={() => setLoginForm({ usuario: 'bookingsoft_admin', contrasena: 'Admin2026!' })}
              >
                <span>👑 <strong>Equipo BookingSoft</strong> (Administrador)</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>bookingsoft_admin / Admin2026!</span>
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
