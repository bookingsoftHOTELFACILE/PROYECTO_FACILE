import React, { useState, useEffect } from 'react';
import { 
  UserPlus, ShieldCheck, Mail, Phone, FileText, Briefcase, Users, 
  AlertCircle, Calendar, Home, ListOrdered, Wifi, WifiOff, LogIn, 
  LogOut, Lock, User, Trash2, CheckCircle2, Wrench, Sparkles, MapPin, 
  Clock, ArrowRight
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

  // ---- NAVEGACIÓN Y VISTAS ----
  const [activeTab, setActiveTab] = useState('inicio'); // 'inicio' | 'apartamentos' | 'servicios' | 'reservar' | 'pms'

  // ---- ESTADO DEL FORMULARIO DE REGISTRO ----
  const [formData, setFormData] = useState({ nombre: '', documento: '', telefono: '', correo: '', empresa: '' });
  const [habeasData, setHabeasData] = useState(false);
  const [selectedHuesped, setSelectedHuesped] = useState(null);

  // ---- ESTADO DEL FORMULARIO DE RESERVA ----
  const [reservaData, setReservaData] = useState({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
  const [cotizacion, setCotizacion] = useState(null);
  const [calDate, setCalDate] = useState(new Date(2026, 7, 1));

  // ---- ESTADOS UI ----
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [reservaAlert, setReservaAlert] = useState(null);
  const [filtroHabitaciones, setFiltroHabitaciones] = useState('todas'); // 'todas' | 'amas_llaves' | 'mantenimiento'

  // ---- ESTADO DE AUTENTICACIÓN JWT Y SESIÓN ----
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

  // Cargar datos
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

  // Cargar habitaciones públicas inicialmente
  useEffect(() => {
    if (backendActivo) {
      cargarDatosBackend(authToken);
    }
  }, [backendActivo, authToken]);

  // Cotización en tiempo real
  useEffect(() => {
    if (reservaData.id_habitacion && reservaData.fecha_entrada && reservaData.fecha_salida) {
      const eDt = new Date(reservaData.fecha_entrada);
      const sDt = new Date(reservaData.fecha_salida);
      const hab = habitaciones.find(h => h.id_habitacion === parseInt(reservaData.id_habitacion));
      if (sDt > eDt && hab) {
        const noches = Math.ceil(Math.abs(sDt - eDt) / (1000 * 60 * 60 * 24));
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

  // Formulario Huésped
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    if (name === 'documento' || name === 'telefono') {
      const soloNumeros = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: soloNumeros }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleReservaChange = (e) => setReservaData({ ...reservaData, [e.target.name]: e.target.value });

  // Registrar Huésped (PÚBLICO)
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!habeasData) {
      setAlert({ type: 'error', message: 'Debe autorizar el tratamiento de datos personales (Habeas Data).' });
      return;
    }
    if (!formData.nombre.trim() || !formData.documento.trim() || !formData.telefono.trim() || !formData.correo.trim()) {
      setAlert({ type: 'error', message: 'Nombre, documento, teléfono y correo son obligatorios.' });
      return;
    }

    setLoading(true);
    setAlert(null);

    if (backendActivo) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        const res = await fetch(`${API_URL}/api/user/registro`, {
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
    }
    setLoading(false);
  };

  // Crear Reserva
  const handleReservaSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHuesped) {
      setReservaAlert({ type: 'error', message: 'Debe registrar o seleccionar un huésped primero.' });
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

    if (backendActivo) {
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
            fecha_salida: reservaData.fecha_salida,
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
    }
    setLoading(false);
  };

  // Seleccionar apartamento desde el catálogo
  const handleSelectApartamentoCatalog = (hab) => {
    setReservaData(prev => ({ ...prev, id_habitacion: String(hab.id_habitacion) }));
    setActiveTab('reservar');
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  // Activar / Desactivar Huésped
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
    }
    setLoading(false);
  };

  const handleSelectHuesped = (h) => {
    if (h.estado === 'Inactivo') {
      setAlert({ type: 'error', message: `⚠️ El huésped "${h.nombre}" está Inactivo. Debe ser activado por un Administrador o Recepcionista antes de asignarle una reserva.` });
      return;
    }
    setSelectedHuesped(h);
    setActiveTab('reservar');
    setAlert({ type: 'success', message: `Huésped "${h.nombre}" seleccionado para reserva.` });
  };

  // Eliminar Huésped
  const handleDeleteHuesped = async (id_huesped) => {
    if (!window.confirm('¿Está seguro de desactivar/eliminar este huésped del sistema?')) return;
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
    }
    setLoading(false);
  };

  // Cancelar Reserva
  const handleDeleteReserva = async (id_reserva) => {
    if (!window.confirm('¿Está seguro de cancelar esta reserva?')) return;
    setLoading(true);
    if (backendActivo) {
      try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const res = await fetch(`${API_URL}/api/reservas/${id_reserva}`, { method: 'DELETE', headers });
        const data = await res.json();
        if (res.ok) {
          setReservaAlert({ type: 'success', message: data.message || 'Reserva cancelada exitosamente.' });
          cargarDatosBackend(authToken);
        } else {
          setReservaAlert({ type: 'error', message: formatErrorMessage(data.detail) });
        }
      } catch {
        setReservaAlert({ type: 'error', message: 'Error al comunicarse con el servidor.' });
      }
    }
    setLoading(false);
  };

  // Cambiar Estado Habitación
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
    }
    setLoading(false);
  };

  const handleReportarDano = (h) => {
    const detalle = window.prompt(`⚠️ Reportar daño técnico para el Apto ${h.numero}:`, h.detalle_mantenimiento || '');
    if (detalle !== null && detalle.trim() !== '') {
      handleCambiarEstadoHabitacion(h.id_habitacion, 'Mantenimiento', detalle.trim());
    }
  };

  return (
    <div className="app-container">
      <div className="bg-overlay"></div>

      {/* TOPBAR (Datos de Contacto Oficiales) */}
      <div className="top-bar">
        <div className="top-bar-content">
          <div className="top-contact">
            <a href="tel:3153512085"><Phone size={13}/> +57 315 351 2085</a>
            <span><MapPin size={13}/> Calle 97 #21-62, Chicó, Bogotá D.C.</span>
            <span><Clock size={13}/> Atención 24 Horas</span>
          </div>
          <div className="top-social">
            <span>SENA ADSO 2026</span>
            <span>•</span>
            <span style={{ color: backendActivo ? '#4ade80' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {backendActivo ? <Wifi size={12}/> : <WifiOff size={12}/>}
              {backendActivo ? 'FastAPI Conectado' : 'Sin Conexión'}
            </span>
          </div>
        </div>
      </div>

      {/* NAVBAR PRINCIPAL */}
      <header className="main-navbar">
        <div className="nav-content">
          <div className="brand-logo" onClick={() => setActiveTab('inicio')}>
            <span className="brand-logo-icon">🏨</span>
            <div className="brand-title">
              APARTAMENTOS FACILE
              <span>Apartamentos Amoblados & Hotel</span>
            </div>
          </div>

          <nav className="nav-links">
            <button className={`nav-btn ${activeTab === 'inicio' ? 'active' : ''}`} onClick={() => setActiveTab('inicio')}>
              <Home size={15}/> Inicio
            </button>
            <button className={`nav-btn ${activeTab === 'apartamentos' ? 'active' : ''}`} onClick={() => setActiveTab('apartamentos')}>
              <Home size={15}/> Apartamentos
            </button>
            <button className={`nav-btn ${activeTab === 'servicios' ? 'active' : ''}`} onClick={() => setActiveTab('servicios')}>
              <Sparkles size={15}/> Servicios
            </button>
            <button className={`nav-btn ${activeTab === 'reservar' ? 'active' : ''}`} onClick={() => setActiveTab('reservar')}>
              <Calendar size={15}/> Reservar Online
            </button>
            
            {usuarioSesion ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button className={`nav-btn ${activeTab === 'pms' ? 'active' : ''}`} onClick={() => setActiveTab('pms')}>
                  <ListOrdered size={15}/> Panel PMS ({usuarioSesion.rol})
                </button>
                <button onClick={handleLogout} className="btn-mini-clear" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                  <LogOut size={12}/> Salir
                </button>
              </div>
            ) : (
              <button className="nav-btn-staff" onClick={() => setShowLoginModal(true)}>
                <Lock size={13}/> Portal Empleados
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* =========================================================================
          VISTA 1: INICIO & HERO
          ========================================================================= */}
      {activeTab === 'inicio' && (
        <>
          <section className="hero-section">
            <div className="hero-content">
              <span className="hero-tag">Exclusividad & Confort en Bogotá</span>
              <h1 className="hero-title">
                Bienvenidos a <span>Apartamentos Facile</span>
              </h1>
              <p className="hero-desc">
                Apartamentos amoblados para largas estadías que le ofrecen en Bogotá lo mejor de un hotel y centro de negocios.
                Ubicados en el exclusivo sector del Chicó con la más alta seguridad y comodidades de lujo.
              </p>
              <div className="hero-actions">
                <button className="btn-gold" onClick={() => setActiveTab('reservar')}>
                  <Calendar size={16}/> Reservar en Línea <ArrowRight size={15}/>
                </button>
                <button className="btn-outline" onClick={() => setActiveTab('apartamentos')}>
                  <Home size={16}/> Ver Tipos de Apartamento
                </button>
              </div>
            </div>
          </section>

          {/* Destacados rápidos */}
          <div className="section-container">
            <div className="section-header">
              <h2>¿Por qué elegir Apartamentos Facile?</h2>
              <p>Diseñados para familias, turistas y estadías corporativas de negocios en la capital</p>
            </div>

            <div className="services-grid">
              <div className="service-box">
                <div className="service-icon">🏢</div>
                <h3 className="service-title">Apartamentos de Lujo</h3>
                <p className="service-text">Dúplex y suites totalmente amobladas con acabados modernos y cocina integral.</p>
              </div>
              <div className="service-box">
                <div className="service-icon">💼</div>
                <h3 className="service-title">Centro de Negocios</h3>
                <p className="service-text">Salas de juntas y espacios coworking con conexión Wi-Fi de alta velocidad.</p>
              </div>
              <div className="service-box">
                <div className="service-icon">🛡️</div>
                <h3 className="service-title">Recepción 24/7</h3>
                <p className="service-text">Atención permanente con control de acceso y seguridad las 24 horas.</p>
              </div>
              <div className="service-box">
                <div className="service-icon">✨</div>
                <h3 className="service-title">Descuento 15%</h3>
                <p className="service-text">Aplica automáticamente en reservas de larga estadía (más de 15 noches).</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          VISTA 2: CATÁLOGO DE APARTAMENTOS
          ========================================================================= */}
      {(activeTab === 'apartamentos' || activeTab === 'inicio') && (
        <section className="section-container" style={{ borderTop: activeTab === 'inicio' ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          <div className="section-header">
            <h2>Apartamentos a su Disposición</h2>
            <p>Seleccione la unidad que mejor se adapte a su estadía en Bogotá</p>
          </div>

          <div className="apartamentos-grid">
            {/* Apartamento 1 Habitación */}
            <div className="apto-card">
              <div className="apto-card-header">
                <div>
                  <h3 className="apto-title">Apartamento 1 Habitación</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-gold-light)' }}>Tipo Dúplex</span>
                </div>
                <span className="apto-badge-num">Apto 101</span>
              </div>
              <div className="apto-card-body">
                <p className="apto-desc">
                  Apartamento dúplex con capacidad hasta 3 personas. Incluye cama Queen, sala de estar, cocina equipada y baño privado.
                </p>
                <div className="apto-features">
                  <span className="feature-tag"><Users size={12}/> Hasta 3 personas</span>
                  <span className="feature-tag"><Wifi size={12}/> Wi-Fi 5G</span>
                  <span className="feature-tag"><Home size={12}/> Cocina Integral</span>
                </div>
                <div className="apto-price-row">
                  <div className="apto-price">
                    $190.000 <span>COP / noche</span>
                  </div>
                  <button className="btn-gold" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={() => handleSelectApartamentoCatalog({ id_habitacion: 1 })}>
                    Reservar
                  </button>
                </div>
              </div>
            </div>

            {/* Apartamento 2 Habitaciones */}
            <div className="apto-card">
              <div className="apto-card-header">
                <div>
                  <h3 className="apto-title">Apartamento 2 Habitaciones</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-gold-light)' }}>Familiar / Corporativo</span>
                </div>
                <span className="apto-badge-num">Apto 201</span>
              </div>
              <div className="apto-card-body">
                <p className="apto-desc">
                  Capacidad para 5 personas. Una excelente opción para grupos familiares y empresas con 2 habitaciones independientes.
                </p>
                <div className="apto-features">
                  <span className="feature-tag"><Users size={12}/> Hasta 5 personas</span>
                  <span className="feature-tag"><Wifi size={12}/> Wi-Fi 5G</span>
                  <span className="feature-tag"><Home size={12}/> 2 Baños</span>
                </div>
                <div className="apto-price-row">
                  <div className="apto-price">
                    $243.000 <span>COP / noche</span>
                  </div>
                  <button className="btn-gold" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={() => handleSelectApartamentoCatalog({ id_habitacion: 2 })}>
                    Reservar
                  </button>
                </div>
              </div>
            </div>

            {/* Apartamento 3 Habitaciones */}
            <div className="apto-card">
              <div className="apto-card-header">
                <div>
                  <h3 className="apto-title">Apartamento 3 Habitaciones</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-gold-light)' }}>Suite Ejecutiva</span>
                </div>
                <span className="apto-badge-num">Apto 301</span>
              </div>
              <div className="apto-card-body">
                <p className="apto-desc">
                  Capacidad para 7 personas. Amplios espacios, sala comedor, zona de trabajo y máxima comodidad para largas estadías.
                </p>
                <div className="apto-features">
                  <span className="feature-tag"><Users size={12}/> Hasta 7 personas</span>
                  <span className="feature-tag"><Wifi size={12}/> Wi-Fi 5G</span>
                  <span className="feature-tag"><Home size={12}/> Balcón / Terraza</span>
                </div>
                <div className="apto-price-row">
                  <div className="apto-price">
                    $320.000 <span>COP / noche</span>
                  </div>
                  <button className="btn-gold" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={() => handleSelectApartamentoCatalog({ id_habitacion: 3 })}>
                    Reservar
                  </button>
                </div>
              </div>
            </div>

            {/* Salas de Juntas & Oficinas */}
            <div className="apto-card">
              <div className="apto-card-header">
                <div>
                  <h3 className="apto-title">Sala de Juntas / Coworking</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-gold-light)' }}>Centro de Negocios</span>
                </div>
                <span className="apto-badge-num">Sala A</span>
              </div>
              <div className="apto-card-body">
                <p className="apto-desc">
                  Equipada con pantalla para presentaciones, internet de alta velocidad y café de cortesía para sus reuniones de negocios.
                </p>
                <div className="apto-features">
                  <span className="feature-tag"><Users size={12}/> Hasta 10 personas</span>
                  <span className="feature-tag"><Briefcase size={12}/> Pantalla 65"</span>
                  <span className="feature-tag"><Wifi size={12}/> Fibra Óptica</span>
                </div>
                <div className="apto-price-row">
                  <div className="apto-price">
                    $120.000 <span>COP / sesión</span>
                  </div>
                  <button className="btn-gold" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('reservar')}>
                    Consultar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          VISTA 3: SERVICIOS
          ========================================================================= */}
      {activeTab === 'servicios' && (
        <section className="section-container">
          <div className="section-header">
            <h2>Nuestros Servicios</h2>
            <p>Todo lo que necesita para una estadía productiva y placentera</p>
          </div>

          <div className="services-grid">
            <div className="service-box">
              <div className="service-icon">🧹</div>
              <h3 className="service-title">Servicio de Amas de Llaves</h3>
              <p className="service-text">Limpieza programada y desinfección integral con cambio de sábanas y toallas de alta calidad.</p>
            </div>
            <div className="service-box">
              <div className="service-icon">🚗</div>
              <h3 className="service-title">Parqueadero Privado</h3>
              <p className="service-text">Estacionamiento cubierto y vigilado dentro del edificio para huéspedes y visitantes.</p>
            </div>
            <div className="service-box">
              <div className="service-icon">📶</div>
              <h3 className="service-title">Wi-Fi de Alta Velocidad</h3>
              <p className="service-text">Internet por fibra óptica en todos los apartamentos y zonas comunes para trabajo remoto.</p>
            </div>
            <div className="service-box">
              <div className="service-icon">☕</div>
              <h3 className="service-title">Cocina Totalmente Equipada</h3>
              <p className="service-text">Refrigerador, microondas, estufa, licuadora, cafetera y menaje completo en cada unidad.</p>
            </div>
            <div className="service-box">
              <div className="service-icon">👔</div>
              <h3 className="service-title">Lavandería & Planchado</h3>
              <p className="service-text">Zona de lavado dentro del apartamento y servicio de lavandería externa bajo solicitud.</p>
            </div>
            <div className="service-box">
              <div className="service-icon">🛡️</div>
              <h3 className="service-title">Vigilancia & Control 24 Horas</h3>
              <p className="service-text">Circuito cerrado de televisión (CCTV) y personal de conserjería disponible las 24 horas.</p>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          VISTA 4: MOTOR DE RESERVAS (PÚBLICO)
          ========================================================================= */}
      {activeTab === 'reservar' && (
        <section className="section-container">
          <div className="section-header">
            <h2>Motor de Reservas en Línea</h2>
            <p>Regístrese como huésped y seleccione las fechas para su reserva con cotización automática</p>
          </div>

          <div className="main-grid">
            {/* PASO 1: REGISTRO DE HUÉSPED (PÚBLICO) */}
            <div className="card">
              <div className="step-badge">Paso 1</div>
              <div className="card-header">
                <UserPlus className="icon-gold" size={20}/>
                <h3>Registro de Huésped</h3>
              </div>
              <p className="card-desc">
                Cree su perfil público para habilitar la reserva de su apartamento.
              </p>

              <form onSubmit={handleUserSubmit}>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <div className="input-wrap">
                    <FileText className="input-icon" size={16}/>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleUserChange} placeholder="Ej: Laura Gómez" required/>
                  </div>
                </div>

                <div className="input-row-2">
                  <div className="form-group">
                    <label>Documento de Identidad (Solo números)</label>
                    <div className="input-wrap">
                      <ShieldCheck className="input-icon" size={16}/>
                      <input type="text" name="documento" value={formData.documento} onChange={handleUserChange} placeholder="Ej: 1020304050" maxLength={15} required/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Teléfono de Contacto</label>
                    <div className="input-wrap">
                      <Phone className="input-icon" size={16}/>
                      <input type="text" name="telefono" value={formData.telefono} onChange={handleUserChange} placeholder="Ej: 3105559988" maxLength={15} required/>
                    </div>
                  </div>
                </div>

                <div className="input-row-2">
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <div className="input-wrap">
                      <Mail className="input-icon" size={16}/>
                      <input type="email" name="correo" value={formData.correo} onChange={handleUserChange} placeholder="Ej: cliente@correo.com" required/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Empresa (Opcional)</label>
                    <div className="input-wrap">
                      <Briefcase className="input-icon" size={16}/>
                      <input type="text" name="empresa" value={formData.empresa} onChange={handleUserChange} placeholder="Ej: Ecopetrol"/>
                    </div>
                  </div>
                </div>

                <label className="checkbox-wrap">
                  <input type="checkbox" checked={habeasData} onChange={(e) => setHabeasData(e.target.checked)}/>
                  <span>Autorizo el tratamiento de mis datos personales según la <strong>Ley de Habeas Data (Ley 1581 de 2012)</strong>.</span>
                </label>

                <button type="submit" className="btn-submit" disabled={loading}>
                  <UserPlus size={16}/> {loading ? 'Registrando...' : 'Registrarme como Huésped'}
                </button>
              </form>

              {alert && (
                <div className={`alert-box alert-${alert.type}`}>
                  <AlertCircle size={18}/>
                  <span>{alert.message}</span>
                </div>
              )}
            </div>

            {/* PASO 2: CREACIÓN DE RESERVA */}
            <div className="card">
              <div className="step-badge">Paso 2</div>
              <div className="card-header">
                <Calendar className="icon-gold" size={20}/>
                <h3>Crear Reserva de Habitación</h3>
              </div>

              {selectedHuesped ? (
                <div className="guest-selected-tag">
                  <span>Huésped Seleccionado: <strong>{selectedHuesped.nombre}</strong> (Doc: {selectedHuesped.documento})</span>
                  <button className="btn-mini-clear" onClick={() => setSelectedHuesped(null)}>Cambiar</button>
                </div>
              ) : (
                <p className="card-desc" style={{ color: '#fbbf24' }}>
                  ⚠️ Regístrese en el <strong>Paso 1</strong> o seleccione un huésped existente para continuar.
                </p>
              )}

              <form onSubmit={handleReservaSubmit}>
                <div className="form-group">
                  <label>Seleccionar Apartamento / Unidad</label>
                  <div className="input-wrap">
                    <Home className="input-icon" size={16}/>
                    <select name="id_habitacion" value={reservaData.id_habitacion} onChange={handleReservaChange} required disabled={!selectedHuesped}>
                      <option value="">-- Elija un apartamento --</option>
                      {habitaciones.map(h => (
                        <option key={h.id_habitacion} value={h.id_habitacion} disabled={h.estado === 'Mantenimiento'}>
                          Apto {h.numero} - {h.tipo} ({h.estado}) - ${h.precio_noche.toLocaleString('es-CO')} COP/noche
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CALENDARIO MENSUAL INTERACTIVO */}
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
                    <div style={{ background: '#090d16', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <button type="button" className="btn-mini-clear" onClick={() => setCalDate(new Date(year, month - 1, 1))}>◀</button>
                        <strong style={{ color: 'var(--color-gold-light)', fontSize: '0.85rem' }}>{monthNames[month]} {year}</strong>
                        <button className="btn-mini-clear" type="button" onClick={() => setCalDate(new Date(year, month + 1, 1))}>▶</button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>
                        <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                        {daysGrid.map((item, idx) => {
                          if (!item) return <div key={`empty-${idx}`}/>;
                          let bg = 'rgba(34, 197, 94, 0.2)';
                          let color = '#4ade80';
                          if (item.isOccupied) { bg = 'rgba(239, 68, 68, 0.5)'; color = '#fff'; }
                          else if (item.isSelectedIn || item.isSelectedOut) { bg = '#c59b27'; color = '#000'; }
                          else if (item.inRange) { bg = 'rgba(197, 155, 39, 0.35)'; color = '#fff'; }

                          return (
                            <button
                              key={item.dayStr}
                              type="button"
                              onClick={() => handleDayClick(item)}
                              disabled={item.isOccupied}
                              style={{
                                background: bg,
                                color: color,
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.25rem',
                                fontSize: '0.75rem',
                                cursor: item.isOccupied ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold'
                              }}
                            >
                              {item.d}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <div className="input-row-3">
                  <div className="form-group">
                    <label>Check-In</label>
                    <div className="input-wrap">
                      <input type="date" name="fecha_entrada" value={reservaData.fecha_entrada} onChange={handleReservaChange} required disabled={!selectedHuesped}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Check-Out</label>
                    <div className="input-wrap">
                      <input type="date" name="fecha_salida" value={reservaData.fecha_salida} onChange={handleReservaChange} required disabled={!selectedHuesped}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Personas</label>
                    <div className="input-wrap">
                      <Users className="input-icon" size={16}/>
                      <input type="number" name="numero_personas" min="1" max="10" value={reservaData.numero_personas} onChange={handleReservaChange} required disabled={!selectedHuesped}/>
                    </div>
                  </div>
                </div>

                {cotizacion && (
                  <div className="cotizacion-card">
                    <h4>Cotización Automática</h4>
                    <div className="cot-item"><span>Estancia:</span><span>{cotizacion.noches} noches</span></div>
                    <div className="cot-item"><span>Subtotal:</span><span>${cotizacion.subtotal.toLocaleString('es-CO')} COP</span></div>
                    {cotizacion.descuento > 0 && (
                      <div className="cot-item descuento">
                        <span>Descuento Larga Estadía (15%):</span>
                        <span>-${cotizacion.descuento.toLocaleString('es-CO')} COP</span>
                      </div>
                    )}
                    <div className="cot-item total">
                      <span>Total a Pagar:</span>
                      <span>${cotizacion.total.toLocaleString('es-CO')} COP</span>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-submit" disabled={loading || !selectedHuesped}>
                  <CheckCircle2 size={16}/> {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                </button>
              </form>

              {reservaAlert && (
                <div className={`alert-box alert-${reservaAlert.type}`}>
                  <AlertCircle size={18}/>
                  <span>{reservaAlert.message}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          VISTA 5: PORTAL EMPLEADOS / PMS (SISTEMA DE GESTIÓN HOTELERA)
          ========================================================================= */}
      {activeTab === 'pms' && (
        <section className="section-container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2>Panel de Control Hotelero (PMS)</h2>
              <p>Módulo interno para Administración, Recepción, Amas de Llaves y Mantenimiento</p>
            </div>
            {usuarioSesion && (
              <span className="badge-status badge-blue" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                👤 {usuarioSesion.nombre} — <strong>{usuarioSesion.rol}</strong>
              </span>
            )}
          </div>

          <div className="main-grid" style={{ marginBottom: '1.5rem' }}>
            {/* BASE DE DATOS DE HUÉSPEDES */}
            <div className="card">
              <div className="card-header">
                <Users className="icon-gold" size={20}/>
                <h3>Huéspedes Registrados ({huespedes.length})</h3>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr><th>Nombre</th><th>Documento</th><th>Acción</th></tr>
                  </thead>
                  <tbody>
                    {huespedes.map(h => (
                      <tr key={h.id_huesped}>
                        <td>
                          <strong>{h.nombre}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{h.empresa || 'Particular'}</span>
                          {h.modificado_por && <span style={{ fontSize: '0.68rem', color: '#60a5fa' }}>Auditoría: {h.modificado_por}</span>}
                        </td>
                        <td><code>{h.documento}</code></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button className="btn-mini-clear" onClick={() => handleSelectHuesped(h)}>Elegir</button>
                            <button className="btn-mini-clear" style={{ background: h.estado === 'Activo' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)', color: h.estado === 'Activo' ? '#fbbf24' : '#4ade80' }} onClick={() => handleToggleEstadoHuesped(h)}>
                              {h.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                            </button>
                            <button className="btn-mini-clear" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }} onClick={() => handleDeleteHuesped(h.id_huesped)}>
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

            {/* BASE DE DATOS DE RESERVAS */}
            <div className="card">
              <div className="card-header">
                <ListOrdered className="icon-gold" size={20}/>
                <h3>Reservas Activas ({reservas.length})</h3>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr><th>Huésped</th><th>Apto</th><th>Fechas</th><th>Acción</th></tr>
                  </thead>
                  <tbody>
                    {reservas.map(r => (
                      <tr key={r.id_reserva}>
                        <td>
                          <strong>{r.huesped_nombre}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Doc: {r.huesped_documento}</span>
                        </td>
                        <td><span className="badge-status badge-gold">Apto {r.habitacion_numero}</span></td>
                        <td style={{ fontSize: '0.72rem' }}>
                          In: {r.fecha_entrada}<br/>Out: {r.fecha_salida}
                        </td>
                        <td>
                          <button className="btn-mini-clear" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }} onClick={() => handleDeleteReserva(r.id_reserva)}>
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

          {/* GESTIÓN DE PLANTAS (AMAS DE LLAVES & MANTENIMIENTO) */}
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench className="icon-gold" size={20}/>
                <h3>Operaciones: Amas de Llaves & Mantenimiento</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button className="btn-mini-clear" onClick={() => setFiltroHabitaciones('amas_llaves')} style={{ background: filtroHabitaciones === 'amas_llaves' ? 'rgba(197,155,39,0.3)' : 'transparent' }}>
                  🧹 Aseo Pendiente
                </button>
                <button className="btn-mini-clear" onClick={() => setFiltroHabitaciones('mantenimiento')} style={{ background: filtroHabitaciones === 'mantenimiento' ? 'rgba(239,68,68,0.3)' : 'transparent' }}>
                  🔧 Daños / Falla
                </button>
                <button className="btn-mini-clear" onClick={() => setFiltroHabitaciones('todas')} style={{ background: filtroHabitaciones === 'todas' ? 'rgba(99,102,241,0.3)' : 'transparent' }}>
                  Ver Todas ({habitaciones.length})
                </button>
              </div>
            </div>

            <div className="table-responsive" style={{ maxHeight: '320px' }}>
              <table className="custom-table">
                <thead>
                  <tr><th>Apartamento</th><th>Tipo</th><th>Estado</th><th>Detalle</th><th>Acciones de Turno</th></tr>
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
                          <span className={`badge-status ${
                            h.estado === 'Disponible' ? 'badge-green' :
                            h.estado === 'Ocupada' ? 'badge-blue' :
                            h.estado === 'En limpieza' ? 'badge-yellow' : 'badge-red'
                          }`}>
                            {h.estado}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#fca5a5' }}>
                          {h.detalle_mantenimiento || '-'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button className="btn-mini-clear" style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }} onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'Disponible')}>
                              ✓ Disponible
                            </button>
                            <button className="btn-mini-clear" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }} onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'En limpieza')}>
                              🧹 Aseo
                            </button>
                            <button className="btn-mini-clear" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }} onClick={() => handleReportarDano(h)}>
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
        </section>
      )}

      {/* FOOTER CORPORATIVO */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-col">
            <h4>Apartamentos Facile</h4>
            <p>Apartamentos amoblados para largas estadías en Bogotá que combinan los servicios de un hotel y un moderno centro de negocios.</p>
            <p><strong>PBX:</strong> +57 315 351 2085</p>
          </div>
          <div className="footer-col">
            <h4>Ubicación</h4>
            <p>Calle 97 #21-62, Barrio Chicó</p>
            <p>Bogotá D.C., Colombia</p>
            <p>Recepción y Seguridad: 24/7</p>
          </div>
          <div className="footer-col">
            <h4>Proyecto Formativo</h4>
            <p><strong>BookingSoft</strong> — Sistema de Gestión Integral Hotelera.</p>
            <p>SENA Centro de Formación — ADSO 2026.</p>
            <p>Equipo: José Chico, Maicol Mayor, Ashly Echeverri, Sebastián Parada, David López.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Apartamentos Facile & BookingSoft. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* MODAL DE LOGIN PARA EMPLEADOS */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontSize: '1.15rem' }}>
                <Lock className="icon-gold" size={18}/> Iniciar Sesión Empleado
              </h3>
              <button className="btn-close" onClick={() => setShowLoginModal(false)}>✕</button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              Ingrese con sus credenciales de empleado para acceder al sistema de gestión PMS.
            </p>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Usuario</label>
                <div className="input-wrap">
                  <User className="input-icon" size={16}/>
                  <input type="text" placeholder="Ej: sandra_admin" value={loginForm.usuario} onChange={(e) => setLoginForm({ ...loginForm, usuario: e.target.value })} required/>
                </div>
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <div className="input-wrap">
                  <Lock className="input-icon" size={16}/>
                  <input type="password" placeholder="••••••••" value={loginForm.contrasena} onChange={(e) => setLoginForm({ ...loginForm, contrasena: e.target.value })} required/>
                </div>
              </div>

              {loginError && (
                <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.15)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.78rem', marginBottom: '0.8rem' }}>
                  ⚠️ {loginError}
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={loading}>
                <LogIn size={16}/> {loading ? 'Validando...' : 'Entrar al Sistema'}
              </button>
            </form>

            <div className="preset-users-box">
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                ⚡ Acceso rápido para sustentación académica:
              </p>
              <button type="button" className="preset-btn" onClick={() => setLoginForm({ usuario: 'sandra_admin', contrasena: 'Admin2026!' })}>
                <span>👑 <strong>Sandra Milena</strong> (Administrador)</span>
                <span style={{ color: 'var(--color-gold)' }}>Admin2026!</span>
              </button>
              <button type="button" className="preset-btn" onClick={() => setLoginForm({ usuario: 'carlos_recep', contrasena: 'Recep2026!' })}>
                <span>👤 <strong>Carlos Pérez</strong> (Recepcionista 24h)</span>
                <span style={{ color: 'var(--color-gold)' }}>Recep2026!</span>
              </button>
              <button type="button" className="preset-btn" onClick={() => setLoginForm({ usuario: 'marta_limpieza', contrasena: 'marta123' })}>
                <span>🧹 <strong>Marta Limpieza</strong> (Ama de llaves)</span>
                <span style={{ color: 'var(--color-gold)' }}>marta123</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
