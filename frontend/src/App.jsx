import React, { useState, useEffect } from 'react';
import { 
  UserPlus, ShieldCheck, Mail, Phone, FileText, Briefcase, Users, 
  AlertCircle, Calendar, Home, ListOrdered, Wifi, WifiOff, LogIn, 
  LogOut, Lock, User, Trash2, CheckCircle2, Wrench, Sparkles, MapPin, 
  Clock, ArrowRight, MessageCircle
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
      {/* 1. TOPBAR OFICIAL ROJA */}
      <div className="facile-topbar">
        <div className="facile-topbar-content">
          <div className="topbar-left">
            <MapPin size={14}/>
            <span>Calle 97 #21-62</span>
          </div>
          <div className="topbar-right">
            <a href="tel:3153512085" className="topbar-phone">
              <Phone size={14}/>
              <span>315 351 2085</span>
            </a>
            <div className="topbar-social">
              <a href="https://www.facebook.com/apartamentosfacile/" target="_blank" rel="noreferrer">Facebook</a>
              <a href="https://www.instagram.com/apartamentosfacile/" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">YouTube</a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HEADER ROJO OFICIAL CON LOGO FACILE BLANCO EN CURSIVA */}
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
              Apartamentos
            </button>
            <button className={`facile-nav-link ${activeTab === 'servicios' ? 'active' : ''}`} onClick={() => setActiveTab('servicios')}>
              Servicios
            </button>
            <button className={`facile-nav-link ${activeTab === 'reservar' ? 'active' : ''}`} onClick={() => setActiveTab('reservar')}>
              Reservar Online
            </button>
            
            {usuarioSesion ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                <button className={`facile-nav-link ${activeTab === 'pms' ? 'active' : ''}`} onClick={() => setActiveTab('pms')}>
                  Panel PMS ({usuarioSesion.rol})
                </button>
                <button onClick={handleLogout} className="btn-staff-pill" style={{ background: '#0f172a', color: '#fff' }}>
                  <LogOut size={12}/> Salir
                </button>
              </div>
            ) : (
              <button className="btn-staff-pill" onClick={() => setShowLoginModal(true)}>
                <Lock size={12}/> Portal Empleados
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* =========================================================================
          VISTA 1: HERO OFICIAL (FOTO NOCTURNA + TARJETA AZUL TRANSLÚCIDA)
          ========================================================================= */}
      {activeTab === 'inicio' && (
        <>
          <section className="facile-hero">
            <div className="facile-hero-container">
              <div className="facile-hero-card">
                <h1>Hola Bienvenidos!</h1>
                <p>
                  Apartamentos amoblados para largas estadías con los servicios completos de un hotel 5 estrellas! Estamos ubicados en la mejor zona del norte de Bogotá el Chicó.
                </p>
                <button className="btn-whatsapp-blue" onClick={() => setActiveTab('reservar')}>
                  AQUI INFORMACION POR WHATSAPP
                </button>
              </div>
            </div>
          </section>

          {/* Destacados rápidos */}
          <div className="facile-section">
            <div className="section-title-wrap">
              <h2>Apartamentos Facile Bogotá</h2>
              <p>Confort, elegancia y centro de negocios en la mejor ubicación de la capital</p>
            </div>

            <div className="services-card-grid">
              <div className="service-card">
                <div className="service-card-icon">🏢</div>
                <h3>Apartamentos Amoblados</h3>
                <p>Unidades dúplex y suites ejecutivas totalmente equipadas para estadías cortas y largas.</p>
              </div>
              <div className="service-card">
                <div className="service-card-icon">💼</div>
                <h3>Centro de Negocios</h3>
                <p>Salas de reuniones y conectividad por fibra óptica para profesionales y empresas.</p>
              </div>
              <div className="service-card">
                <div className="service-card-icon">🛡️</div>
                <h3>Recepción & Seguridad 24/7</h3>
                <p>Personal operativo en portería y circuito de cámaras de vigilancia permanente.</p>
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

      {/* =========================================================================
          VISTA 2: CATÁLOGO DE APARTAMENTOS (Tarjetas Blancas con Acentos Rojos)
          ========================================================================= */}
      {(activeTab === 'apartamentos' || activeTab === 'inicio') && (
        <section className="facile-section" style={{ borderTop: activeTab === 'inicio' ? '1px solid #e2e8f0' : 'none' }}>
          <div className="section-title-wrap">
            <h2>Apartamentos a su Disposición</h2>
            <p>Conozca nuestras opciones de hospedaje y reserve directamente</p>
          </div>

          <div className="apto-grid">
            {/* Apartamento 1 Habitación */}
            <div className="apto-item">
              <div className="apto-header">
                <h3>Apartamento 1 Habitación</h3>
                <span className="badge-red-num">Apto 101</span>
              </div>
              <div className="apto-body">
                <p className="apto-text">
                  Apartamento dúplex con capacidad hasta (3) personas. Cama Queen, cocina integral totalmente equipada y sala de estar.
                </p>
                <div className="apto-specs">
                  <span className="spec-pill"><Users size={12}/> Hasta 3 personas</span>
                  <span className="spec-pill"><Wifi size={12}/> Wi-Fi 5G</span>
                  <span className="spec-pill"><Home size={12}/> Dúplex</span>
                </div>
                <div className="apto-footer">
                  <div className="price-text">
                    $190.000 <span>COP/noche</span>
                  </div>
                  <button className="btn-book-red" onClick={() => handleSelectApartamentoCatalog({ id_habitacion: 1 })}>
                    Reservar
                  </button>
                </div>
              </div>
            </div>

            {/* Apartamento 2 Habitaciones */}
            <div className="apto-item">
              <div className="apto-header">
                <h3>Apartamento 2 Habitaciones</h3>
                <span className="badge-red-num">Apto 201</span>
              </div>
              <div className="apto-body">
                <p className="apto-text">
                  Capacidad (5) personas. Una excelente opción para grupos familiares y empresas con dos habitaciones y baño privado.
                </p>
                <div className="apto-specs">
                  <span className="spec-pill"><Users size={12}/> Hasta 5 personas</span>
                  <span className="spec-pill"><Wifi size={12}/> Wi-Fi 5G</span>
                  <span className="spec-pill"><Home size={12}/> 2 Baños</span>
                </div>
                <div className="apto-footer">
                  <div className="price-text">
                    $243.000 <span>COP/noche</span>
                  </div>
                  <button className="btn-book-red" onClick={() => handleSelectApartamentoCatalog({ id_habitacion: 2 })}>
                    Reservar
                  </button>
                </div>
              </div>
            </div>

            {/* Apartamento 3 Habitaciones */}
            <div className="apto-item">
              <div className="apto-header">
                <h3>Apartamento 3 Habitaciones</h3>
                <span className="badge-red-num">Apto 301</span>
              </div>
              <div className="apto-body">
                <p className="apto-text">
                  Capacidad (7) personas. Amplios espacios, sala comedor, zona de trabajo y máximo confort para grupos y directivos.
                </p>
                <div className="apto-specs">
                  <span className="spec-pill"><Users size={12}/> Hasta 7 personas</span>
                  <span className="spec-pill"><Wifi size={12}/> Wi-Fi 5G</span>
                  <span className="spec-pill"><Home size={12}/> Balcón</span>
                </div>
                <div className="apto-footer">
                  <div className="price-text">
                    $320.000 <span>COP/noche</span>
                  </div>
                  <button className="btn-book-red" onClick={() => handleSelectApartamentoCatalog({ id_habitacion: 3 })}>
                    Reservar
                  </button>
                </div>
              </div>
            </div>

            {/* Salas de Juntas & Coworking */}
            <div className="apto-item">
              <div className="apto-header">
                <h3>Oficina / Sala de Juntas</h3>
                <span className="badge-red-num">Sala A</span>
              </div>
              <div className="apto-body">
                <p className="apto-text">
                  Espacio coworking equipado con pantalla para presentaciones, internet dedicado y café de cortesía para reuniones.
                </p>
                <div className="apto-specs">
                  <span className="spec-pill"><Users size={12}/> Hasta 10 personas</span>
                  <span className="spec-pill"><Briefcase size={12}/> Pantalla 65"</span>
                  <span className="spec-pill"><Wifi size={12}/> Fibra</span>
                </div>
                <div className="apto-footer">
                  <div className="price-text">
                    $120.000 <span>COP/sesión</span>
                  </div>
                  <button className="btn-book-red" onClick={() => setActiveTab('reservar')}>
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
        <section className="facile-section">
          <div className="section-title-wrap">
            <h2>Nuestros Servicios</h2>
            <p>Todo lo que necesita para una estadía placentera y productiva</p>
          </div>

          <div className="services-card-grid">
            <div className="service-card">
              <div className="service-card-icon">🧹</div>
              <h3>Servicio de Amas de Llaves</h3>
              <p>Aseo profesional, cambio de lencería y toallas de alta calidad con protocolos de desinfección.</p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">🚗</div>
              <h3>Parqueadero Privado</h3>
              <p>Estacionamiento vigilado dentro del edificio las 24 horas para huéspedes y visitantes.</p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">📶</div>
              <h3>Wi-Fi de Alta Velocidad</h3>
              <p>Conexión por fibra óptica en todos los apartamentos y zonas de coworking.</p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">🍳</div>
              <h3>Cocina Totalmente Equipada</h3>
              <p>Nevera, microondas, estufa, vajilla completa y electrodomésticos en cada apartamento.</p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">👔</div>
              <h3>Zona de Lavandería</h3>
              <p>Área de lavado y planchado para mayor comodidad durante largas estadías.</p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">🛡️</div>
              <h3>Vigilancia & Control 24 Horas</h3>
              <p>Monitoreo constante por CCTV y personal de recepción disponible permanentemente.</p>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          VISTA 4: MOTOR DE RESERVAS (PÚBLICO - HUÉSPEDES)
          ========================================================================= */}
      {activeTab === 'reservar' && (
        <section className="facile-section">
          <div className="section-title-wrap">
            <h2>Reservar en Línea</h2>
            <p>Auto-registro de huésped y reserva con cálculo automático de cotización</p>
          </div>

          <div className="booking-grid">
            {/* PASO 1: REGISTRO DE HUÉSPED */}
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

            {/* PASO 2: CREACIÓN DE RESERVA */}
            <div className="clean-card">
              <div className="card-step-badge">Paso 2</div>
              <div className="clean-card-header">
                <Calendar size={20} color="var(--color-primary-red)"/>
                <h3>Crear Reserva</h3>
              </div>

              {selectedHuesped ? (
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.6rem 0.8rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem' }}>Huésped: <strong>{selectedHuesped.nombre}</strong> (Doc: {selectedHuesped.documento})</span>
                  <button className="btn-mini" onClick={() => setSelectedHuesped(null)}>Cambiar</button>
                </div>
              ) : (
                <p className="clean-card-desc" style={{ color: '#b45309' }}>
                  ⚠️ Regístrese en el <strong>Paso 1</strong> o seleccione un huésped existente para continuar.
                </p>
              )}

              <form onSubmit={handleReservaSubmit}>
                <div className="form-field">
                  <label>Seleccionar Apartamento / Unidad</label>
                  <div className="field-input-wrap">
                    <Home className="field-icon" size={16}/>
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
                    <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <button type="button" className="btn-mini" onClick={() => setCalDate(new Date(year, month - 1, 1))}>◀</button>
                        <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>{monthNames[month]} {year}</strong>
                        <button className="btn-mini" type="button" onClick={() => setCalDate(new Date(year, month + 1, 1))}>▶</button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', textAlign: 'center', fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>
                        <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                        {daysGrid.map((item, idx) => {
                          if (!item) return <div key={`empty-${idx}`}/>;
                          let bg = '#dcfce7';
                          let color = '#166534';
                          if (item.isOccupied) { bg = '#fee2e2'; color = '#991b1b'; }
                          else if (item.isSelectedIn || item.isSelectedOut) { bg = '#cc0000'; color = '#fff'; }
                          else if (item.inRange) { bg = '#fef08a'; color = '#854d0e'; }

                          return (
                            <button
                              key={item.dayStr}
                              type="button"
                              onClick={() => handleDayClick(item)}
                              disabled={item.isOccupied}
                              style={{
                                background: bg,
                                color: color,
                                border: '1px solid rgba(0,0,0,0.05)',
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
                    <div className="quote-row"><span>Noches de estadía:</span><span>{cotizacion.noches} noches</span></div>
                    <div className="quote-row"><span>Subtotal:</span><span>${cotizacion.subtotal.toLocaleString('es-CO')} COP</span></div>
                    {cotizacion.descuento > 0 && (
                      <div className="quote-row discount">
                        <span>Descuento Larga Estadía (15%):</span>
                        <span>-${cotizacion.descuento.toLocaleString('es-CO')} COP</span>
                      </div>
                    )}
                    <div className="quote-row final-total">
                      <span>Total a Pagar:</span>
                      <span>${cotizacion.total.toLocaleString('es-CO')} COP</span>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-submit-red" disabled={loading || !selectedHuesped}>
                  <CheckCircle2 size={16}/> {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                </button>
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
      )}

      {/* =========================================================================
          VISTA 5: PORTAL EMPLEADOS / PMS (SISTEMA DE GESTIÓN HOTELERA)
          ========================================================================= */}
      {activeTab === 'pms' && (
        <section className="facile-section">
          <div className="pms-header">
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Panel de Control Hotelero (PMS)</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Módulo interno para Administración, Recepción, Amas de Llaves y Mantenimiento</p>
            </div>
            {usuarioSesion && (
              <span className="pms-badge">
                👤 {usuarioSesion.nombre} — <strong>{usuarioSesion.rol}</strong>
              </span>
            )}
          </div>

          <div className="booking-grid" style={{ marginBottom: '1.5rem' }}>
            {/* BASE DE DATOS DE HUÉSPEDES */}
            <div className="clean-card">
              <div className="clean-card-header">
                <Users size={18} color="var(--color-primary-red)"/>
                <h3 style={{ fontSize: '1.1rem' }}>Huéspedes Registrados ({huespedes.length})</h3>
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
                            <button className="btn-mini" onClick={() => handleSelectHuesped(h)}>Elegir</button>
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

            {/* BASE DE DATOS DE RESERVAS */}
            <div className="clean-card">
              <div className="clean-card-header">
                <ListOrdered size={18} color="var(--color-primary-red)"/>
                <h3 style={{ fontSize: '1.1rem' }}>Reservas Activas ({reservas.length})</h3>
              </div>
              <div className="pms-table-wrap">
                <table className="pms-table">
                  <thead>
                    <tr><th>Huésped</th><th>Apto</th><th>Fechas</th><th>Acción</th></tr>
                  </thead>
                  <tbody>
                    {reservas.map(r => (
                      <tr key={r.id_reserva}>
                        <td>
                          <strong>{r.huesped_nombre}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Doc: {r.huesped_documento}</span>
                        </td>
                        <td><span className="badge-tag badge-occup">Apto {r.habitacion_numero}</span></td>
                        <td style={{ fontSize: '0.72rem' }}>
                          In: {r.fecha_entrada}<br/>Out: {r.fecha_salida}
                        </td>
                        <td>
                          <button className="btn-mini" style={{ color: '#ef4444' }} onClick={() => handleDeleteReserva(r.id_reserva)}>
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
          <div className="clean-card">
            <div className="clean-card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={18} color="var(--color-primary-red)"/>
                <h3 style={{ fontSize: '1.1rem' }}>Operaciones de Planta: Amas de Llaves & Mantenimiento</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button className="btn-mini" onClick={() => setFiltroHabitaciones('amas_llaves')} style={{ background: filtroHabitaciones === 'amas_llaves' ? '#fef3c7' : '#fff' }}>
                  🧹 Aseo Pendiente
                </button>
                <button className="btn-mini" onClick={() => setFiltroHabitaciones('mantenimiento')} style={{ background: filtroHabitaciones === 'mantenimiento' ? '#fee2e2' : '#fff' }}>
                  🔧 Daños / Falla
                </button>
                <button className="btn-mini" onClick={() => setFiltroHabitaciones('todas')} style={{ background: filtroHabitaciones === 'todas' ? '#e0e7ff' : '#fff' }}>
                  Ver Todas ({habitaciones.length})
                </button>
              </div>
            </div>

            <div className="pms-table-wrap" style={{ maxHeight: '320px' }}>
              <table className="pms-table">
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
                          <span className={`badge-tag ${
                            h.estado === 'Disponible' ? 'badge-avail' :
                            h.estado === 'Ocupada' ? 'badge-occup' :
                            h.estado === 'En limpieza' ? 'badge-clean' : 'badge-maint'
                          }`}>
                            {h.estado}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                          {h.detalle_mantenimiento || '-'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn-mini" style={{ color: '#15803d' }} onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'Disponible')}>
                              ✓ Disponible
                            </button>
                            <button className="btn-mini" style={{ color: '#b45309' }} onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'En limpieza')}>
                              🧹 Aseo
                            </button>
                            <button className="btn-mini" style={{ color: '#b91c1c' }} onClick={() => handleReportarDano(h)}>
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

      {/* WHATSAPP FLOATING WIDGET (COMO EN APARTAMENTOSFACILE.COM) */}
      <div className="whatsapp-float-wrap">
        <span className="whatsapp-bubble">¿En qué podemos servirle?</span>
        <a href="https://wa.me/573153512085" target="_blank" rel="noreferrer" className="whatsapp-circle-btn" title="Contactar por WhatsApp">
          <MessageCircle size={28}/>
        </a>
      </div>

      {/* FOOTER CORPORATIVO OFICIAL */}
      <footer className="facile-footer">
        <div className="facile-footer-grid">
          <div className="footer-section">
            <h4>Apartamentos Facile</h4>
            <p>Apartamentos amoblados para largas estadías en Bogotá con los servicios completos de un hotel y centro de negocios.</p>
            <p><strong>PBX:</strong> +57 315 351 2085</p>
          </div>
          <div className="footer-section">
            <h4>Ubicación & Contacto</h4>
            <p>Calle 97 #21-62, Barrio Chicó</p>
            <p>Bogotá D.C., Colombia</p>
            <p>Recepción 24 Horas</p>
          </div>
          <div className="footer-section">
            <h4>Proyecto Formativo</h4>
            <p><strong>BookingSoft</strong> — Sistema de Gestión Integral Hotelera.</p>
            <p>SENA Centro de Formación — ADSO 2026.</p>
            <p>José Chico, Maicol Mayor, Ashly Echeverri, Sebastián Parada, David López.</p>
          </div>
        </div>
        <div className="footer-copy">
          <p>© 2026 Apartamentos Facile — Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* MODAL DE LOGIN PARA EMPLEADOS */}
      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>
                <Lock size={18}/> Iniciar Sesión Empleado
              </h3>
              <button className="btn-x" onClick={() => setShowLoginModal(false)}>✕</button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.2rem' }}>
              Ingrese con sus credenciales de empleado para acceder al sistema de gestión PMS.
            </p>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-field">
                <label>Usuario</label>
                <div className="field-input-wrap">
                  <User className="field-icon" size={16}/>
                  <input type="text" placeholder="Ej: sandra_admin" value={loginForm.usuario} onChange={(e) => setLoginForm({ ...loginForm, usuario: e.target.value })} required/>
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
                <LogIn size={16}/> {loading ? 'Validando...' : 'Entrar al Sistema'}
              </button>
            </form>

            <div style={{ marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.4rem' }}>
                ⚡ Acceso rápido para sustentación académica:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <button type="button" className="btn-mini" style={{ textAlign: 'left', padding: '0.4rem 0.6rem' }} onClick={() => setLoginForm({ usuario: 'sandra_admin', contrasena: 'Admin2026!' })}>
                  👑 <strong>Sandra Milena</strong> (Administrador) — <code>sandra_admin / Admin2026!</code>
                </button>
                <button type="button" className="btn-mini" style={{ textAlign: 'left', padding: '0.4rem 0.6rem' }} onClick={() => setLoginForm({ usuario: 'carlos_recep', contrasena: 'Recep2026!' })}>
                  👤 <strong>Carlos Pérez</strong> (Recepcionista 24h) — <code>carlos_recep / Recep2026!</code>
                </button>
                <button type="button" className="btn-mini" style={{ textAlign: 'left', padding: '0.4rem 0.6rem' }} onClick={() => setLoginForm({ usuario: 'marta_limpieza', contrasena: 'marta123' })}>
                  🧹 <strong>Marta Limpieza</strong> (Ama de llaves) — <code>marta_limpieza / marta123</code>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
