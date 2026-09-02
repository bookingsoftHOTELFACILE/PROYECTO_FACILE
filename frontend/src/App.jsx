import React, { useState, useEffect } from 'react';
import { 
  UserPlus, ShieldCheck, Mail, Phone, FileText, Briefcase, Users, 
  AlertCircle, Calendar, Home, ListOrdered, Wifi, WifiOff, LogIn, 
  LogOut, Lock, User, Trash2, CheckCircle2, Wrench, Sparkles, MapPin, 
  Clock, ArrowRight, MessageCircle, Menu, Check, Search, Eye, EyeOff, KeyRound, Tag,
  ChevronLeft, ChevronRight, X, Maximize2, Filter, Camera
} from 'lucide-react';

// URL del backend FastAPI
const API_URL = '';

// COMPONENTE SHOWCASE DE FOTOS ESTILO BOOKING.COM (FOTO DESTACADA HÉROE + COLLAGE)
const BookingShowcase = ({ photos, onOpenLightbox, title }) => {
  if (!photos || photos.length === 0) return null;

  const heroPhoto = photos[0];
  const topPhotos = photos.slice(1, 3);
  const bottomPhotos = photos.slice(3, 5);
  const totalCount = photos.length;

  return (
    <div style={{ marginBottom: '2.5rem', padding: '0 1rem' }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Camera size={22} color="#e11d48" /> {title}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenLightbox(0)}
            style={{
              background: '#e11d48',
              border: 'none',
              color: '#ffffff',
              padding: '0.6rem 1.2rem',
              borderRadius: '25px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(225,29,72,0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <Maximize2 size={15} /> Ver Álbum ({totalCount})
          </button>
        </div>
      )}

      {/* COLLAGE TIPO BOOKING.COM */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr 1fr',
          gridTemplateRows: '230px 160px',
          gap: '10px',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(0,0,0,0.12)',
          background: '#0f172a'
        }}
      >
        {/* FOTO DESTACADA HÉROE (IZQUIERDA - ALTO COMPLETO) */}
        <div
          style={{
            gridColumn: '1 / 2',
            gridRow: '1 / 3',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
          onClick={() => onOpenLightbox(0)}
        >
          <img
            src={heroPhoto.url}
            alt={heroPhoto.titulo || 'Foto Destacada'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div style={{ position: 'absolute', bottom: '14px', left: '14px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', color: '#ffffff', padding: '0.45rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Sparkles size={14} color="#e11d48" /> {heroPhoto.titulo || 'Instalaciones Destacadas'}
          </div>
        </div>

        {/* FOTO SECUNDARIA DERECHA TOP 1 */}
        {topPhotos[0] && (
          <div
            style={{ gridColumn: '2 / 3', gridRow: '1 / 2', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => onOpenLightbox(1)}
          >
            <img
              src={topPhotos[0].url}
              alt="Vista Secundario 1"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        )}

        {/* FOTO SECUNDARIA DERECHA TOP 2 */}
        {topPhotos[1] && (
          <div
            style={{ gridColumn: '3 / 4', gridRow: '1 / 2', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => onOpenLightbox(2)}
          >
            <img
              src={topPhotos[1].url}
              alt="Vista Secundario 2"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        )}

        {/* FOTO SECUNDARIA DERECHA BOTTOM 1 */}
        {bottomPhotos[0] && (
          <div
            style={{ gridColumn: '2 / 3', gridRow: '2 / 3', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => onOpenLightbox(3)}
          >
            <img
              src={bottomPhotos[0].url}
              alt="Miniatura"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        )}

        {/* ÚLTIMA CASILLA CON SUPERPOSICIÓN (+X FOTOS MÁS) */}
        {bottomPhotos[1] && (
          <div
            style={{ gridColumn: '3 / 4', gridRow: '2 / 3', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => onOpenLightbox(4)}
          >
            <img
              src={bottomPhotos[1].url}
              alt="Más fotos"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(225, 29, 72, 0.88)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)'}
            >
              <Camera size={26} color="#ffffff" />
              <span style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.4rem' }}>
                +{totalCount - 4} fotos
              </span>
              <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                Ver Galería
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  // ---- ESTADO DEL MODO DE CONEXIÓN ----
  const [backendActivo, setBackendActivo] = useState(false);

  // ---- ESTADO DE DATOS ----
  const [huespedes, setHuespedes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [espaciosNegocio, setEspaciosNegocio] = useState([]);
  const [reservasNegocio, setReservasNegocio] = useState([]);

  // ---- ESTADO FORMULARIO CENTRO DE NEGOCIOS ----
  const [reservaNegocioForm, setReservaNegocioForm] = useState({
    id_espacio: '',
    tipo_cliente: 'Huésped Registrado',
    id_huesped: '',
    nombre_cliente: '',
    documento_cliente: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '09:00',
    hora_fin: '11:00',
    observaciones: ''
  });
  const [reservaNegocioAlert, setReservaNegocioAlert] = useState(null);

  // ---- NAVEGACIÓN Y VISTAS ----
  const [activeTab, setActiveTab] = useState('inicio'); // 'inicio' | 'apartamentos' | 'centro_negocios_pub' | 'servicios' | 'galeria' | 'reservar' | 'pms'

  // ---- ESTADO DEL FORMULARIO DE REGISTRO ----
  const [formData, setFormData] = useState({ nombre: '', documento: '', telefono: '', correo: '', empresa: '' });
  const [habeasData, setHabeasData] = useState(false);
  const [selectedHuesped, setSelectedHuesped] = useState(null);

  // ---- ESTADO DE EMPLEADOS & GESTIÓN DE PERSONAL (ADMINISTRADOR / GRUPO BOOKINGSOFT) ----
  const [empleadosList, setEmpleadosList] = useState([]);
  const [newEmpleadoForm, setNewEmpleadoForm] = useState({
    nombre: '',
    usuario: '',
    contrasena: '',
    numero_documento: '',
    correo: '',
    rol: 'Recepcionista 24h',
    tipo_documento: 'Cédula de ciudadanía'
  });
  const [showCreateEmpleadoModal, setShowCreateEmpleadoModal] = useState(false);
  const [empleadoAlert, setEmpleadoAlert] = useState(null);

  // ---- ESTADO DEL FORMULARIO DE RESERVA ----
  const [reservaData, setReservaData] = useState({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
  const [cotizacion, setCotizacion] = useState(null);
  const [calDate, setCalDate] = useState(new Date(2026, 7, 1));

  // ---- ESTADOS UI ----
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [reservaAlert, setReservaAlert] = useState(null);
  const [filtroHabitaciones, setFiltroHabitaciones] = useState('todas'); // 'todas' | 'amas_llaves' | 'mantenimiento'
  const [galleryFilter, setGalleryFilter] = useState('todas'); // 'todas' | 'zonas' | 'apartamentos' | 'oficinas'
  const [lightboxIdx, setLightboxIdx] = useState(null); // visor de imágenes de la galería
  const [aptoLightboxPhoto, setAptoLightboxPhoto] = useState(null); // { photos: [...], index: n } o photo object
  const [aptoActivePhoto, setAptoActivePhoto] = useState({}); // { [aptoTipo]: activeIndex }
  const [selectedAptoFigma, setSelectedAptoFigma] = useState(null); // apartamento seleccionado para la vista de detalle Figma

  // NAVEGACIÓN TECLADO PARA LIGHTBOX (FLECHA IZQUIERDA, FLECHA DERECHA, ESCAPE)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!aptoLightboxPhoto) return;
      const photosList = aptoLightboxPhoto.photos || [aptoLightboxPhoto];
      const currentIndex = aptoLightboxPhoto.index || 0;

      if (e.key === 'ArrowLeft' && photosList.length > 1) {
        const newIdx = (currentIndex - 1 + photosList.length) % photosList.length;
        setAptoLightboxPhoto({ photos: photosList, index: newIdx });
      } else if (e.key === 'ArrowRight' && photosList.length > 1) {
        const newIdx = (currentIndex + 1) % photosList.length;
        setAptoLightboxPhoto({ photos: photosList, index: newIdx });
      } else if (e.key === 'Escape') {
        setAptoLightboxPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aptoLightboxPhoto]);

  // ---- ESTADO DE AUTENTICACIÓN JWT Y SESIÓN ----
  const [authToken, setAuthToken] = useState(null);
  const [usuarioSesion, setUsuarioSesion] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ usuario: '', contrasena: '' });
  const [loginError, setLoginError] = useState(null);

  // ---- ESTADO DEL MODAL HUÉSPED TIPO AIRBNB ("Inicia sesión o regístrate") ----
  const [showGuestAuthModal, setShowGuestAuthModal] = useState(false);
  const [guestAuthTab, setGuestAuthTab] = useState('login'); // 'login' | 'registro' | 'recuperar'
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [guestLoginPassword, setGuestLoginPassword] = useState('');
  const [showGuestPassword, setShowGuestPassword] = useState(false);
  const [guestSearchError, setGuestSearchError] = useState(null);
  const [guestRegJustCreated, setGuestRegJustCreated] = useState(false);
  const [guestRecuperarQuery, setGuestRecuperarQuery] = useState('');
  const [guestRecuperarSuccess, setGuestRecuperarSuccess] = useState(null);
  const [guestNuevaPassword, setGuestNuevaPassword] = useState('');

  // ---- NUEVOS ESTADOS AIRBNB (COMPROMISO DE LA COMUNIDAD Y DATOS LEGALES) ----
  const [showCommunityCommitmentModal, setShowCommunityCommitmentModal] = useState(false);
  const [nombreLegal, setNombreLegal] = useState('');
  const [apellidoLegal, setApellidoLegal] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [marketingOptOut, setMarketingOptOut] = useState(false);
  const [showGuestMenuDropdown, setShowGuestMenuDropdown] = useState(false);
  const [modalLegalTipo, setModalLegalTipo] = useState(null); // null | 'terminos' | 'pagos' | 'discriminacion' | 'ley1581' | 'privacidad'


  // ---- ESTADO PARA RESERVA PRESENCIAL EN RECEPCIÓN (WALK-IN PMS) ----
  const [pmsWalkInMode, setPmsWalkInMode] = useState('existente'); // 'existente' | 'nuevo'
  const [pmsWalkInGuest, setPmsWalkInGuest] = useState({
    tipo_documento: 'Cédula de Ciudadanía',
    documento: '',
    nombre: '',
    telefono: '',
    correo: ''
  });

  // ---- ESTADO DE SUB-PESTAÑAS INDIVIDUALES EN EL PANEL PMS ----
  const [pmsSubTab, setPmsSubTab] = useState('recepcion'); // 'recepcion' | 'huespedes' | 'reservas' | 'planta' | 'coworking' | 'todos'

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

        // Adaptar vista inicial PMS según el rol autenticado
        if (rol === 'Ama de llaves') {
          setPmsSubTab('planta');
          setFiltroHabitaciones('amas_llaves');
        } else if (rol === 'Personal de mantenimiento') {
          setPmsSubTab('planta');
          setFiltroHabitaciones('mantenimiento');
        } else if (rol === 'Administrador' || rol === 'Grupo BookingSoft') {
          setPmsSubTab('empleados');
          setFiltroHabitaciones('todas');
        } else {
          setPmsSubTab('recepcion');
          setFiltroHabitaciones('todas');
        }

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
      const [gRes, hRes, rRes, eRes, rnRes, empRes] = await Promise.all([
        fetch(`${API_URL}/api/huespedes`, { headers }),
        fetch(`${API_URL}/api/habitaciones`, { headers }),
        fetch(`${API_URL}/api/reservas`, { headers }),
        fetch(`${API_URL}/api/centro-negocios/espacios`),
        fetch(`${API_URL}/api/centro-negocios/reservas`),
        token ? fetch(`${API_URL}/api/empleados`, { headers }) : Promise.resolve(null),
      ]);
      if (gRes.ok) setHuespedes(await gRes.json());
      if (hRes.ok) setHabitaciones(await hRes.json());
      if (rRes.ok) setReservas(await rRes.json());
      if (eRes.ok) setEspaciosNegocio(await eRes.json());
      if (rnRes.ok) setReservasNegocio(await rnRes.json());
      if (empRes && empRes.ok) setEmpleadosList(await empRes.json());
    } catch (e) {
      console.error('Error al cargar datos del backend:', e);
    }
  };

  useEffect(() => {
    if (backendActivo) {
      cargarDatosBackend(authToken);
    }
  }, [backendActivo, authToken]);

  // Cotización en tiempo real a prueba de fallos
  useEffect(() => {
    if (reservaData.id_habitacion && reservaData.fecha_entrada && reservaData.fecha_salida) {
      const eDt = new Date(reservaData.fecha_entrada + 'T00:00:00');
      const sDt = new Date(reservaData.fecha_salida + 'T00:00:00');
      const hab = habitaciones.find(h => String(h.id_habitacion) === String(reservaData.id_habitacion));
      if (!isNaN(eDt.getTime()) && !isNaN(sDt.getTime()) && sDt > eDt && hab) {
        const diffMs = sDt.getTime() - eDt.getTime();
        const noches = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        const precio_noche = Number(hab.precio_noche) || 0;
        const subtotal = noches * precio_noche;
        const descuento = noches >= 15 ? subtotal * 0.15 : (noches >= 7 ? subtotal * 0.10 : 0);
        const total = Math.max(0, subtotal - descuento);
        setCotizacion({
          precio_noche,
          noches,
          subtotal,
          descuento,
          total,
          habitacion: hab
        });
        return;
      }
    }
    setCotizacion(null);
  }, [reservaData, habitaciones]);

  // ---- FUNCIONES DE GESTIÓN DE EMPLEADOS (ADMINISTRADOR / GRUPO BOOKINGSOFT) ----
  const handleCreateEmpleadoSubmit = async (e) => {
    e.preventDefault();
    setEmpleadoAlert(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newEmpleadoForm)
      });
      const data = await res.json();
      if (res.ok) {
        setEmpleadoAlert({ type: 'success', message: `✅ Empleado ${newEmpleadoForm.nombre} registrado con éxito.` });
        setNewEmpleadoForm({ nombre: '', usuario: '', contrasena: '', numero_documento: '', correo: '', rol: 'Recepcionista 24h', tipo_documento: 'Cédula de ciudadanía' });
        setShowCreateEmpleadoModal(false);
        cargarDatosBackend(authToken);
      } else {
        setEmpleadoAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setEmpleadoAlert({ type: 'error', message: 'Error de conexión al registrar empleado.' });
    }
  };

  const handleChangeEmpleadoRol = async (idEmpleado, nuevoRol) => {
    try {
      const res = await fetch(`${API_URL}/api/empleados/${idEmpleado}/rol`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ rol: nuevoRol })
      });
      const data = await res.json();
      if (res.ok) {
        setEmpleadoAlert({ type: 'success', message: `✅ Rol actualizado correctamente.` });
        cargarDatosBackend(authToken);
      } else {
        setEmpleadoAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setEmpleadoAlert({ type: 'error', message: 'Error de conexión al actualizar rol.' });
    }
  };

  const handleToggleEmpleadoEstado = async (emp) => {
    const nuevoEstado = emp.estado === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const res = await fetch(`${API_URL}/api/empleados/${emp.id_empleado}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();
      if (res.ok) {
        setEmpleadoAlert({ type: 'success', message: `✅ Estado de ${emp.nombre} cambiado a ${nuevoEstado}.` });
        cargarDatosBackend(authToken);
      } else {
        setEmpleadoAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setEmpleadoAlert({ type: 'error', message: 'Error de conexión al actualizar estado.' });
    }
  };

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

    // Nombre completo consolidado de los campos legales estilo Airbnb
    const nombreCompletoFinal = (nombreLegal || apellidoLegal)
      ? `${nombreLegal} ${apellidoLegal}`.trim()
      : formData.nombre.trim();

    if (!habeasData) {
      const msg = 'Debe aceptar los Términos del Servicio y la Política de Protección de Datos (Ley 1581 de 2012 de Colombia).';
      setAlert({ type: 'error', message: msg });
      setGuestSearchError(msg);
      return;
    }
    if (!nombreCompletoFinal || !formData.documento.trim() || !formData.telefono.trim() || !formData.correo.trim()) {
      const msg = 'Nombre, apellidos, documento, teléfono y correo electrónico son obligatorios.';
      setAlert({ type: 'error', message: msg });
      setGuestSearchError(msg);
      return;
    }

    // Validación de Edad (Debes tener al menos 18 años para registrarte en BookingSoft/Airbnb)
    if (fechaNacimiento) {
      const hoy = new Date();
      const fechaNac = new Date(fechaNacimiento);
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const m = hoy.getMonth() - fechaNac.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      if (edad < 18) {
        const msg = 'Debes tener al menos 18 años para registrarte en BookingSoft Apartamentos Facile.';
        setAlert({ type: 'error', message: msg });
        setGuestSearchError(msg);
        return;
      }
    }

    setLoading(true);
    setAlert(null);
    setGuestSearchError(null);

    const payload = {
      ...formData,
      nombre: nombreCompletoFinal
    };

    if (backendActivo) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        const res = await fetch(`${API_URL}/api/user/registro`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          const nuevoUsuario = data.usuario;
          setSelectedHuesped(nuevoUsuario);
          setGuestRegJustCreated(true);
          setShowGuestAuthModal(false); // Cierra modal de login/registro
          setShowCommunityCommitmentModal(true); // Despliega el Compromiso de la Comunidad (Airbnb)


          // Si el usuario ya había seleccionado apartamento y fechas, crear la reserva automáticamente
          if (reservaData.id_habitacion && reservaData.fecha_entrada && reservaData.fecha_salida) {
            try {
              const resReserva = await fetch(`${API_URL}/api/reservas`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  id_huesped: nuevoUsuario.id_huesped,
                  id_habitacion: parseInt(reservaData.id_habitacion),
                  fecha_entrada: reservaData.fecha_entrada,
                  fecha_salida: reservaData.fecha_salida,
                  numero_personas: parseInt(reservaData.numero_personas || 1)
                })
              });
              const dataReserva = await resReserva.json();
              if (resReserva.ok) {
                if (dataReserva.reserva) {
                  setReservas(prev => [dataReserva.reserva, ...prev]);
                }
                setAlert({
                  type: 'success',
                  message: `¡Registro y Reserva confirmados exitosamente para ${nuevoUsuario.nombre}! Verifique en el módulo de Reservas.`
                });
                setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
              } else {
                setAlert({
                  type: 'success',
                  message: `¡Usuario ${nuevoUsuario.nombre} registrado! (Atención: ${formatErrorMessage(dataReserva.detail)})`
                });
              }
            } catch {
              setAlert({
                type: 'success',
                message: `¡Usuario ${nuevoUsuario.nombre} registrado exitosamente!`
              });
            }
          } else {
            const successMsg = data.message || `¡Usuario registrado exitosamente! Notificación enviada a ${formData.correo}.`;
            setAlert({ type: 'success', message: successMsg, data: nuevoUsuario });
          }

          setFormData({ nombre: '', documento: '', telefono: '', correo: '', empresa: '' });
          setHabeasData(false);
          cargarDatosBackend(authToken);
          setLoading(false);
          return true;
        } else {
          const errMsg = formatErrorMessage(data.detail) || 'Error al registrar huésped.';
          setAlert({ type: 'error', message: errMsg });
          setGuestSearchError(errMsg);
          setLoading(false);
          return false;
        }
      } catch {
        const errMsg = 'Error de conexión con el servidor.';
        setAlert({ type: 'error', message: errMsg });
        setGuestSearchError(errMsg);
        setLoading(false);
        return false;
      }
    }
    setLoading(false);
    return false;
  };

  // Buscar e Iniciar Sesión de Huésped con Documento/Correo + Contraseña
  const handleGuestSearchSubmit = async (e) => {
    e.preventDefault();
    setGuestSearchError(null);
    const q = guestSearchQuery.trim();
    if (!q) {
      setGuestSearchError('Ingrese su número de documento o correo electrónico.');
      return;
    }

    setLoading(true);

    if (backendActivo) {
      try {
        const res = await fetch(`${API_URL}/api/user/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documento_o_correo: q,
            password: guestLoginPassword.trim() || undefined
          })
        });
        const data = await res.json();
        if (res.ok) {
          setSelectedHuesped(data.usuario);
          setShowGuestAuthModal(false);
          setGuestSearchQuery('');
          setGuestLoginPassword('');
          setAlert({ type: 'success', message: data.message || `¡Bienvenido de nuevo, ${data.usuario.nombre}!` });
        } else {
          setGuestSearchError(formatErrorMessage(data.detail) || 'Error al iniciar sesión.');
        }
      } catch {
        setGuestSearchError('Error de conexión con el servidor.');
      }
    } else {
      // Fallback local
      const encontrado = huespedes.find(h => 
        (h.documento && h.documento.toLowerCase() === q.toLowerCase()) ||
        (h.correo && h.correo.toLowerCase() === q.toLowerCase()) ||
        (h.telefono && h.telefono.toLowerCase() === q.toLowerCase())
      );

      if (encontrado) {
        if (encontrado.estado === 'Inactivo') {
          setGuestSearchError(`El perfil de "${encontrado.nombre}" se encuentra inactivo. Comuníquese con recepción.`);
          setLoading(false);
          return;
        }
        setSelectedHuesped(encontrado);
        setShowGuestAuthModal(false);
        setGuestSearchQuery('');
        setGuestLoginPassword('');
      } else {
        setGuestSearchError('No encontramos un registro con estos datos. Regístrese en la opción "Crear cuenta nueva".');
      }
    }
    setLoading(false);
  };

  // Solicitar recuperación de contraseña por correo
  const handleGuestRecuperarSubmit = async (e) => {
    e.preventDefault();
    setGuestSearchError(null);
    setGuestRecuperarSuccess(null);
    const q = guestRecuperarQuery.trim();
    if (!q) {
      setGuestSearchError('Ingrese su número de documento o correo electrónico registrado.');
      return;
    }

    setLoading(true);
    if (backendActivo) {
      try {
        const res = await fetch(`${API_URL}/api/user/recuperar-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo_o_documento: q })
        });
        const data = await res.json();
        if (res.ok) {
          setGuestRecuperarSuccess(data.message);
        } else {
          setGuestSearchError(formatErrorMessage(data.detail));
        }
      } catch {
        setGuestSearchError('Error de conexión al procesar la solicitud.');
      }
    } else {
      setGuestRecuperarSuccess(`Hemos enviado las instrucciones para restablecer tu contraseña al correo registrado.`);
    }
    setLoading(false);
  };

  // Restablecer contraseña con clave nueva
  const handleGuestRestablecerSubmit = async (e) => {
    e.preventDefault();
    setGuestSearchError(null);
    if (!guestNuevaPassword || guestNuevaPassword.length < 4) {
      setGuestSearchError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    setLoading(true);
    if (backendActivo) {
      try {
        const res = await fetch(`${API_URL}/api/user/restablecer-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            correo_o_documento: guestRecuperarQuery.trim(),
            nueva_password: guestNuevaPassword.trim()
          })
        });
        const data = await res.json();
        if (res.ok) {
          setAlert({ type: 'success', message: data.message });
          setGuestAuthTab('login');
          setGuestSearchQuery(guestRecuperarQuery);
          setGuestLoginPassword(guestNuevaPassword);
          setGuestRecuperarSuccess(null);
          setGuestNuevaPassword('');
        } else {
          setGuestSearchError(formatErrorMessage(data.detail));
        }
      } catch {
        setGuestSearchError('Error de conexión al actualizar contraseña.');
      }
    } else {
      setGuestAuthTab('login');
      setGuestSearchQuery(guestRecuperarQuery);
      setGuestRecuperarSuccess(null);
      setAlert({ type: 'success', message: 'Contraseña actualizada exitosamente.' });
    }
    setLoading(false);
  };

  // Seleccionar tipo de habitación y activar flujo de reserva
  const handleReservarTipo = (tipoNombre) => {
    const habDispo = habitaciones.find(h => h.tipo === tipoNombre && h.estado === 'Disponible');
    if (habDispo) {
      setReservaData(prev => ({ ...prev, id_habitacion: String(habDispo.id_habitacion) }));
    }
    if (!selectedHuesped) {
      setShowGuestAuthModal(true);
    } else {
      setActiveTab('reservar');
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
  };

  // Crear Reserva
  // Manejar cambios en el formulario del Huésped Presencial (Walk-in PMS)
  const handlePmsWalkInGuestChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefono') {
      setPmsWalkInGuest(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    } else if (name === 'documento' && pmsWalkInGuest.tipo_documento === 'Cédula de Ciudadanía') {
      setPmsWalkInGuest(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    } else {
      setPmsWalkInGuest(prev => ({ ...prev, [name]: value }));
    }
  };

  // Crear Reserva (Tanto Web como Recepción Presencial Walk-in)
  const handleReservaSubmit = async (e) => {
    e.preventDefault();

    if (!reservaData.id_habitacion) {
      setReservaAlert({ type: 'error', message: 'Debe seleccionar un apartamento o habitación.' });
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

    let huespedDestino = selectedHuesped;

    // Procesar detección/registro de huésped presencial de forma inteligente
    if (!huespedDestino || (pmsWalkInGuest.documento && huespedDestino.documento !== pmsWalkInGuest.documento.trim())) {
      const q = pmsWalkInGuest.documento ? pmsWalkInGuest.documento.trim() : '';
      const existente = huespedes.find(h => 
        (q && h.documento && h.documento.trim() === q) || 
        (pmsWalkInGuest.correo && h.correo && h.correo.toLowerCase() === pmsWalkInGuest.correo.trim().toLowerCase())
      );
      if (existente) {
        huespedDestino = existente;
        setSelectedHuesped(existente);
      } else if (pmsWalkInGuest.nombre.trim() && pmsWalkInGuest.documento.trim()) {
        if (!pmsWalkInGuest.telefono.trim() || !pmsWalkInGuest.correo.trim()) {
          setReservaAlert({ type: 'error', message: 'Nombre, documento, teléfono y correo son obligatorios para registrar al nuevo huésped.' });
          setLoading(false);
          return;
        }
        if (backendActivo) {
          try {
            const resReg = await fetch(`${API_URL}/api/user/registro`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nombre: pmsWalkInGuest.nombre.trim(),
                documento: pmsWalkInGuest.documento.trim(),
                telefono: pmsWalkInGuest.telefono.trim(),
                correo: pmsWalkInGuest.correo.trim(),
                empresa: `Walk-in (${pmsWalkInGuest.tipo_documento || 'Cédula'})`,
                password: pmsWalkInGuest.documento.trim()
              })
            });
            const dataReg = await resReg.json();
            if (resReg.ok) {
              huespedDestino = dataReg.usuario;
              setSelectedHuesped(huespedDestino);
            } else {
              // Si el usuario ya existía en backend por documento/correo
              const qStr = pmsWalkInGuest.documento.trim() || pmsWalkInGuest.correo.trim();
              const existenteBk = huespedes.find(h => 
                (h.documento && h.documento === qStr) || 
                (h.correo && h.correo.toLowerCase() === qStr.toLowerCase())
              );
              if (existenteBk) {
                huespedDestino = existenteBk;
                setSelectedHuesped(existenteBk);
              } else {
                setReservaAlert({ type: 'error', message: formatErrorMessage(dataReg.detail) });
                setLoading(false);
                return;
              }
            }
          } catch {
            setReservaAlert({ type: 'error', message: 'Error de conexión al registrar los datos del huésped.' });
            setLoading(false);
            return;
          }
        } else {
          // Modo local fallback
          const nuevoH = {
            id_huesped: Date.now(),
            nombre: pmsWalkInGuest.nombre.trim(),
            documento: pmsWalkInGuest.documento.trim(),
            telefono: pmsWalkInGuest.telefono.trim(),
            correo: pmsWalkInGuest.correo.trim(),
            empresa: `Walk-in (${pmsWalkInGuest.tipo_documento || 'Cédula'})`,
            lealtad: 'Silver',
            estado: 'Activo'
          };
          setHuespedes(prev => [nuevoH, ...prev]);
          huespedDestino = nuevoH;
          setSelectedHuesped(nuevoH);
        }
      }
    }

    if (!huespedDestino) {
      setReservaAlert({ type: 'error', message: 'Debe seleccionar un huésped o ingresar sus datos primero.' });
      setLoading(false);
      return;
    }

    if (backendActivo) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        const res = await fetch(`${API_URL}/api/reservas`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id_huesped: huespedDestino.id_huesped,
            id_habitacion: parseInt(reservaData.id_habitacion),
            fecha_entrada: reservaData.fecha_entrada,
            fecha_salida: reservaData.fecha_salida,
            numero_personas: parseInt(reservaData.numero_personas || 1),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          if (data.reserva) {
            setReservas(prev => [data.reserva, ...prev]);
          }
          setReservaAlert({
            type: 'success',
            message: `¡Reserva presencial confirmada exitosamente para ${huespedDestino.nombre} (Doc: ${huespedDestino.documento})!`,
            data
          });
          setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
          setPmsWalkInGuest({ tipo_documento: 'Cédula de Ciudadanía', documento: '', nombre: '', telefono: '', correo: '' });
          cargarDatosBackend(authToken);
        } else {
          setReservaAlert({ type: 'error', message: formatErrorMessage(data.detail) || 'Error al crear la reserva.' });
        }
      } catch {
        setReservaAlert({ type: 'error', message: 'Error de conexión con el servidor.' });
      }
    } else {
      setReservaAlert({
        type: 'success',
        message: `¡Reserva presencial confirmada exitosamente para ${huespedDestino.nombre}!`
      });
      setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
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

  // Cancelar Reserva de Habitación
  const handleDeleteReserva = async (id_reserva) => {
    if (!window.confirm('⚠️ ¿Está seguro que desea cancelar esta reserva? Esta acción liberará la habitación y el horario inmediatamente.')) return;
    setLoading(true);
    if (backendActivo) {
      try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const res = await fetch(`${API_URL}/api/reservas/${id_reserva}`, { method: 'DELETE', headers });
        const data = await res.json();
        if (res.ok) {
          setReservas(prev => prev.filter(r => r.id_reserva !== id_reserva));
          setReservaAlert({ type: 'success', message: data.message || '✓ Reserva cancelada exitosamente.' });
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

  // Centro de Negocios — Crear Reserva por Horas
  const handleCrearReservaNegocio = async (e) => {
    e.preventDefault();
    if (!reservaNegocioForm.id_espacio) {
      setReservaNegocioAlert({ type: 'error', message: 'Seleccione un espacio del Centro de Negocios.' });
      return;
    }
    let nombre_cliente = reservaNegocioForm.nombre_cliente;
    let id_huesped_val = null;
    if (reservaNegocioForm.tipo_cliente === 'Huésped Registrado') {
      const hSel = huespedes.find(h => h.id_huesped === parseInt(reservaNegocioForm.id_huesped));
      if (!hSel) {
        setReservaNegocioAlert({ type: 'error', message: 'Seleccione un huésped de la lista.' });
        return;
      }
      nombre_cliente = hSel.nombre;
      id_huesped_val = hSel.id_huesped;
    }
    setLoading(true);
    setReservaNegocioAlert(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(`${API_URL}/api/centro-negocios/reservas`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id_espacio: parseInt(reservaNegocioForm.id_espacio),
          tipo_cliente: reservaNegocioForm.tipo_cliente,
          id_huesped: id_huesped_val,
          nombre_cliente,
          documento_cliente: reservaNegocioForm.documento_cliente || null,
          correo_cliente: null,
          fecha: reservaNegocioForm.fecha,
          hora_inicio: reservaNegocioForm.hora_inicio,
          hora_fin: reservaNegocioForm.hora_fin,
          observaciones: reservaNegocioForm.observaciones || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReservaNegocioAlert({ type: 'success', message: data.message || '¡Reserva del Centro de Negocios confirmada!' });
        setReservaNegocioForm({ id_espacio: '', tipo_cliente: 'Huésped Registrado', id_huesped: '', nombre_cliente: '', documento_cliente: '', fecha: new Date().toISOString().split('T')[0], hora_inicio: '09:00', hora_fin: '11:00', observaciones: '' });
        cargarDatosBackend(authToken);
      } else {
        setReservaNegocioAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setReservaNegocioAlert({ type: 'error', message: 'Error de conexión al reservar espacio.' });
    }
    setLoading(false);
  };

  // Buscar Huésped por Documento (Cédula / Pasaporte / Extranjería) y auto-completar datos
  const handleBuscarHuespedPorDocumento = (docValue) => {
    const query = docValue ? docValue.trim() : pmsWalkInGuest.documento.trim();
    if (!query) return;
    const found = huespedes.find(h => h.documento && h.documento.trim() === query);
    if (found) {
      setPmsWalkInGuest(prev => ({
        ...prev,
        nombre: found.nombre,
        telefono: found.telefono || prev.telefono,
        correo: found.correo || prev.correo,
        documento: found.documento
      }));
      setSelectedHuesped(found);
      setReservaAlert({ type: 'success', message: `✓ Huésped registrado encontrado: ${found.nombre} (${found.correo || 'Sin correo'})` });
    } else {
      setReservaAlert({ type: 'info', message: `Documento '${query}' no registrado previamente. Ingrese los datos para crear el registro.` });
    }
  };

  // Centro de Negocios — Cancelar Reserva
  const handleCancelarReservaNegocio = async (id_reserva_negocio) => {
    if (!window.confirm('¿Desea cancelar esta reserva de espacio y liberar el horario?')) return;
    setLoading(true);
    try {
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
      const res = await fetch(`${API_URL}/api/centro-negocios/reservas/${id_reserva_negocio}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (res.ok) {
        setReservasNegocio(prev => prev.filter(r => r.id_reserva_negocio !== id_reserva_negocio));
        setReservaNegocioAlert({ type: 'success', message: '✓ Reserva de espacio cancelada y horario liberado exitosamente.' });
        cargarDatosBackend(authToken);
      } else {
        setReservaNegocioAlert({ type: 'error', message: formatErrorMessage(data.detail) });
      }
    } catch {
      setReservaNegocioAlert({ type: 'error', message: 'Error al cancelar la reserva.' });
    }
    setLoading(false);
  };

  // ---- COMPONENTE MODAL LEGAL INTERACTIVO (TÉRMINOS Y POLÍTICAS PROPIAS FACILE & BOOKINGSOFT) ----
  const renderModalLegal = () => {
    if (!modalLegalTipo) return null;

    let titulo = '';
    let contenido = null;

    if (modalLegalTipo === 'terminos') {
      titulo = '📜 Términos del Servicio de Hospedaje — Apartahotel Facile';
      contenido = (
        <>
          <p>Los presentes Términos del Servicio de Hospedaje regulan la relación jurídica y contractual entre el usuario o huésped (en adelante, "el Huésped") y <strong>Apartahotel Facile S.A.S.</strong> (ubicado en Bogotá D.C., Colombia) gestionado a través de la plataforma tecnológica <strong>BookingSoft PMS</strong>. Al realizar una reserva, registrarse en la plataforma o hacer uso de nuestras instalaciones, usted declara haber leído, comprendido y aceptado en su totalidad los siguientes términos y condiciones:</p>
          
          <h4>1. Naturaleza del Contrato de Alojamiento</h4>
          <p>El contrato de hospedaje suscrito es de naturaleza civil y comercial de arrendamiento de servicio de alojamiento por días, regulado por la Ley General de Turismo (Ley 300 de 1996, Ley 1558 de 2012 y Ley 2068 de 2020 de la República de Colombia). La admisión a las instalaciones está supeditada al registro legal completo de cada ocupante en la recepción o en el canal digital del sistema.</p>

          <h4>2. Registro, Identificación Obligatoria y Edades</h4>
          <p>Todo huésped titular y acompañante debe presentar al momento del ingreso o en el registro digital un documento de identidad oficial físico y vigente (Cédula de Ciudadanía para nacionales colombianos, Cédula de Extranjería o Pasaporte original con sello de ingreso vigente para extranjeros). Queda estrictamente prohibido el ingreso de menores de edad que no estén acompañados por sus padres o por un tutor legal debidamente acreditado con autorización notariada y registro civil de nacimiento, en cumplimiento estricto de la Ley 679 de 2001 y Ley 1336 de 2009 sobre prevención de la explotación sexual de niños, niñas y adolescentes (ESCNNA).</p>

          <h4>3. Horarios de Check-In, Check-Out y Salida Tardía</h4>
          <p>El horario oficial de ingreso (Check-In) es a partir de las <strong>3:00 PM (15:00 horas)</strong>. El horario oficial de salida (Check-Out) y entrega del apartamento es como máximo a las <strong>11:00 AM (11:00 horas)</strong> del día de finalización de su reserva. El incumplimiento del horario de salida sin previa autorización de la recepción generará un cobro automático por recargo de salida tardía (Late Check-Out) equivalente al 50% de la tarifa diaria si la salida se realiza antes de las 3:00 PM, o del 100% de la tarifa diaria si se realiza posterior a las 3:00 PM.</p>

          <h4>4. Capacidad de Alojamiento y Política de Visitas</h4>
          <p>Cada tipo de apartamento (Sencillo, Doble, Suite) posee un límite máximo de ocupantes estrictamente regulado. Queda rotundamente prohibido superar el número de personas declaradas en la reserva. Las visitas externas únicamente están permitidas en el área del lobby y Business Center de 8:00 AM a 8:00 PM. No se autoriza el acceso de visitantes a los apartamentos ni a las áreas privadas sin previo registro en recepción con documento de identidad y pago de la tarifa por huésped adicional.</p>

          <h4>5. Convivencia, Silencio y Sustancias Prohibidas</h4>
          <p>Para garantizar el descanso y bienestar de todos los huéspedes, se establece una <strong>franja estricta de silencio obligatorio desde las 10:00 PM hasta las 7:00 AM</strong>. Queda totalmente prohibida la realización de fiestas, eventos masivos, reproductores de audio a alto volumen, el consumo de cigarrillos o vapeadores dentro de los apartamentos (espacio 100% libre de humo Ley 1335 de 2009), así como el consumo o porte de sustancias psicoactivas ilícitas o armas de cualquier índole.</p>

          <h4>6. Custodia, Daños e Inventario del Inmueble</h4>
          <p>El Huésped titular es el responsable directo de la conservación y buen estado de la planta física, mobiliario, electrodomésticos, lencería y llaves/tarjetas de acceso entregadas. Al ingresar, el huésped dispone de dos (2) horas para reportar cualquier anomalía previa. Todo daño, mancha indeleble, rotura de elementos o pérdida de activos será facturado directamente a la cuenta del huésped con base en la lista de reposición oficial de Apartahotel Facile.</p>
        </>
      );
    } else if (modalLegalTipo === 'pagos') {
      titulo = '💳 Términos de Pago, Tarifas y Políticas de Cancelación — BookingSoft';
      contenido = (
        <>
          <p>Los presentes Términos de Pago regulan la gestión financiera, cobranza, aplicación de tarifas y políticas de cancelación administradas por la plataforma <strong>BookingSoft Payments</strong> para las reservas efectuadas en <strong>Apartahotel Facile</strong> (Bogotá, Colombia):</p>

          <h4>1. Moneda, Tasas e Impuestos</h4>
          <p>Todas las tarifas de alojamiento, servicios de coworking y consumos adicionales se expresan y liquidan en <strong>Pesos Colombianos (COP)</strong>. Las tarifas publicadas en la web incluyen los impuestos de ley vigentes en Colombia, incluyendo el Impuesto al Valor Agregado (IVA) para residentes nacionales conforme a la normativa de la DIAN y la exención tributaria de IVA en alojamiento exclusivamente para turistas extranjeros no residentes que presenten pasaporte con sello de entrada PIP-3, PIP-5, PIP-6, TP-7, TP-11 o V (Visa de Turismo).</p>

          <h4>2. Descuentos Automatizados por Larga Estadía</h4>
          <p>BookingSoft PMS aplica un motor de liquidación tarifaria inteligente que incentiva la permanencia prolongada. Los descuentos se aplican automáticamente sobre la tarifa base del alojamiento:</p>
          <ul>
            <li><strong>Descuento del 10%:</strong> Aplicable a reservas continuas de 7 a 14 noches.</li>
            <li><strong>Descuento del 15%:</strong> Aplicable a reservas continuas de 15 noches o más.</li>
          </ul>
          <p>Si una reserva con descuento de larga estadía es modificada o acortada por el huésped antes de cumplir el periodo mínimo exigido, el descuento acumulado se recalculará retroactivamente y la diferencia tarifaria será cobrada al momento del saldo final.</p>

          <h4>3. Medios de Pago Autorizados</h4>
          <p>Aceptamos pagos electrónicos mediante tarjetas de crédito o débito (Visa, Mastercard, American Express), transferencias bancarias directas, pasarelas de pago PSE / Wompi y pagos en efectivo o terminal datáfono al momento del registro presencial en recepción. Toda reserva web queda sujeta a la validación de fondos o confirmación de comprobante bancario.</p>

          <h4>4. Política de Cancelación y Reembolsos</h4>
          <p>Comprendemos que los planes de viaje pueden cambiar. Nuestra política de cancelación estandarizada establece lo siguiente:</p>
          <ul>
            <li><strong>Cancelación Gratuita (Más de 48 Horas antes):</strong> El huésped puede cancelar su reserva de manera totalmente gratuita y sin penalidad hasta 48 horas antes de las 3:00 PM del día oficial de check-in. Los reembolsos de depósitos previos se procesarán en un plazo de 3 a 5 días hábiles a la misma cuenta o tarjeta de origen.</li>
            <li><strong>Cancelación Tardía (Menos de 48 Horas antes):</strong> Toda cancelación efectuada dentro de las 48 horas previas al check-in estará sujeta al cobro de una penalidad administrativa equivalente al 100% del valor de la primera noche de estancia.</li>
            <li><strong>No Presentación (No-Show):</strong> Si el huésped no se presenta antes de las 11:59 PM del día de llegada sin notificación escrita previa, la reserva será declarada "No-Show". Se cobrará el valor de la primera noche y las noches posteriores quedarán liberadas automáticamente en el PMS.</li>
          </ul>
        </>
      );
    } else if (modalLegalTipo === 'discriminacion') {
      titulo = '🤝 Política Inclusiva y Contra la Discriminación — Apartahotel Facile';
      contenido = (
        <>
          <p>En <strong>Apartahotel Facile</strong> y <strong>BookingSoft</strong> creemos que la hospitalidad auténtica exige un entorno fundamentado en el respeto, la dignidad humana, la equidad y la plena inclusión. Esta política establece nuestras pautas obligatorias de convivencia y servicio:</p>

          <h4>1. Declaración de Tolerancia Cero</h4>
          <p>Queda rotundamente prohibida cualquier conducta, comentario, sesgo, restricción de acceso o trato diferenciado de carácter discriminatorio dirigido contra cualquier huésped, visitante, colaborador o proveedor de servicios. Esta prohibición abarca motivos fundados en etnia, raza, origen nacional o regional, religión, creencia filosófica, sexo, orientación sexual, identidad de género, expresión de género, edad, estado civil, condición socioeconómica, discapacidad física, sensorial o cognitiva.</p>

          <h4>2. Garantía de Acceso Equitativo y Trato Digno</h4>
          <p>Todos los usuarios de Apartahotel Facile tienen derecho a acceder a los servicios de alojamiento, áreas comunes, salones de negocios y servicios de recepción en igualdad de condiciones. Nuestro equipo de trabajo está capacitado para brindar una atención empática, respetuosa y libre de prejuicios a toda la comunidad nacional e internacional.</p>

          <h4>3. Mascotas de Asistencia y Accesibilidad</h4>
          <p>En cumplimiento de las leyes colombianas de accesibilidad, los perros guía y animales de asistencia debidamente certificados para personas con discapacidad tienen acceso libre y garantizado a las instalaciones del apartahotel sin costo adicional.</p>

          <h4>4. Procedimiento de Denuncia y Sanciones</h4>
          <p>Cualquier incidente discriminatorio reportado será investigado de manera prioritaria por la administración de Apartahotel Facile. El incumplimiento de esta política por parte de un huésped o visitante dará lugar a la cancelación inmediata de su contrato de hospedaje sin derecho a reembolso, la expulsión de las instalaciones y el correspondiente reporte ante la Policía Nacional de Colombia en virtud de la Ley 1482 de 2011 (Ley Antidiscriminación) y el Código Nacional de Seguridad y Convivencia Ciudadana.</p>
        </>
      );
    } else if (modalLegalTipo === 'ley1581') {
      titulo = '🛡️ Tratamiento de Datos Personales (Ley 1581 de 2012 de Colombia)';
      contenido = (
        <>
          <p>En cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong>, el Decreto Reglamentario 1377 de 2013 y demás normas concordantes de la República de Colombia, <strong>Apartahotel Facile S.A.S.</strong> y <strong>BookingSoft PMS</strong> informan a sus huéspedes, usuarios y clientes el tratamiento que se le da a sus datos personales:</p>

          <h4>1. Identificación de los Responsables del Tratamiento</h4>
          <p><strong>Responsable principal:</strong> Apartahotel Facile S.A.S., con domicilio en Bogotá D.C., Colombia.<br />
          <strong>Encargado tecnológico del procesamiento:</strong> Plataforma BookingSoft PMS.</p>

          <h4>2. Finalidades Específicas de la Recolección</h4>
          <p>Los datos personales solicitados (nombre completo, tipo y número de documento de identidad, nacionalidad, dirección de correo electrónico, número telefónico, fecha de nacimiento y datos de tarjeta de crédito/débito) son recolectados con las siguientes finalidades explícitas:</p>
          <ul>
            <li>Validar y procesar la reserva de alojamiento y la confirmación del servicio.</li>
            <li>Cumplir con las obligaciones legales de registro hotelero nacional expedidas por el Ministerio de Comercio, Industria y Turismo y la Policía Nacional (Tarjeta de Registro de Alojamiento - TRA / RNT).</li>
            <li>Emitir facturas electrónicas de venta y comprobantes de contabilidad conforme a los requerimientos de la DIAN.</li>
            <li>Garantizar la seguridad de las instalaciones a través de controles de acceso en recepción y sistemas de videovigilancia en áreas comunes.</li>
            <li>Enviar notificaciones operativas de confirmación, claves de acceso Wi-Fi y encuestas de satisfacción del servicio.</li>
          </ul>

          <h4>3. Derechos del Titular de la Información (Hábeas Data)</h4>
          <p>De conformidad con el Artículo 8 de la Ley 1581 de 2012, el titular de los datos personales cuenta con los siguientes derechos inalienables:</p>
          <ul>
            <li><strong>Conocer, actualizar y rectificar</strong> sus datos personales frente a los Responsables del Tratamiento.</li>
            <li><strong>Solicitar prueba de la autorización</strong> otorgada para el tratamiento de sus datos.</li>
            <li><strong>Ser informado</strong> previa solicitud respecto al uso que se le ha dado a sus datos personales.</li>
            <li><strong>Revocar la autorización y/o solicitar la supresión</strong> de sus datos cuando en el tratamiento no se respeten los principios, derechos y garantías constitucionales.</li>
          </ul>

          <h4>4. Canal Oficial para el Ejercicio de Derechos ARCO</h4>
          <p>Para ejercer sus derechos de acceso, rectificación, cancelación u oposición (ARCO), el titular puede enviar una comunicación formal al correo electrónico oficial de la administración de Apartahotel Facile o radicar su solicitud directamente en la recepción del establecimiento.</p>
        </>
      );
    } else if (modalLegalTipo === 'privacidad') {
      titulo = '🔒 Política de Privacidad y Seguridad Tecnológica — BookingSoft PMS';
      contenido = (
        <>
          <p>La plataforma <strong>BookingSoft PMS</strong> ha sido diseñada bajo estrictos criterios de arquitectura segura, privacidad por diseño y confidencialidad de la información para la operación de <strong>Apartahotel Facile</strong>:</p>

          <h4>1. Cifrado Criptográfico de Contraseñas (bcrypt)</h4>
          <p>La seguridad de las credenciales de acceso de nuestros huéspedes y empleados es absoluta. Todas las contraseñas guardadas en la base de datos de BookingSoft se procesan mediante algoritmos de cifrado unidireccional de alto rendimiento <strong>bcrypt</strong> con salado dinámico. Esto garantiza que las claves de usuario jamás se almacenen en texto plano y sean computacionalmente imposibles de descifrar, protegiendo su cuenta incluso ante intentos no autorizados de lectura.</p>

          <h4>2. Autenticación Cifrada mediante JSON Web Tokens (JWT)</h4>
          <p>El acceso a las funciones del PMS y a la zona de gestión de reservas de huéspedes utiliza tokens de sesión autenticados e intransferibles (JWT). Estos tokens expiran de forma automática y viajan cifrados bajo protocolos seguros HTTPS para evitar la interceptación de credenciales en redes públicas o Wi-Fi.</p>

          <h4>3. Compromiso de No Divulgación a Terceros</h4>
          <p>En BookingSoft asumimos un compromiso férreo con la privacidad. <strong>No vendemos, comercializamos, alquilamos ni compartimos</strong> bajo ninguna modalidad la información personal, correos electrónicos o historiales de reserva de nuestros huéspedes con empresas de publicidad, brokers de datos ni terceros ajenos a la prestación directa del servicio de alojamiento.</p>

          <h4>4. Resguardo de la Información y Servidores</h4>
          <p>La infraestructura tecnológica de BookingSoft opera sobre servidores virtualizados y protegidos en contenedores aislados Docker, con cortafuegos activos y copias de respaldo automatizadas para prevenir pérdidas accidentales de datos o fallos en el sistema.</p>
        </>
      );
    }

    return (
      <div className="modal-legal-overlay" onClick={() => setModalLegalTipo(null)}>
        <div className="modal-legal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-legal-header">
            <h3>{titulo}</h3>
            <button className="btn-close-mini" onClick={() => setModalLegalTipo(null)}>✕</button>
          </div>
          <div className="modal-legal-body">
            {contenido}
          </div>
          <div className="modal-legal-footer">
            <button className="btn-submit-red" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }} onClick={() => setModalLegalTipo(null)}>
              Entendido y Aceptar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* =========================================================================
          ENCABEZADOS CONDICIONALES: PMS INTERNO DEDICADO vs WEB PÚBLICA DE HUÉSPEDES
          ========================================================================= */}
      {activeTab === 'pms' ? (
        /* HEADER DEDICADO PARA EMPLEADOS (PANEL DE CONTROL PMS) */
        <header className="pms-dedicated-header">
          <div className="pms-dedicated-header-content">
            <div className="pms-logo-brand" onClick={() => setActiveTab('pms')}>
              <span className="pms-logo-title">BookingSoft</span>
              <span className="pms-logo-badge">PMS HOTELERO</span>
            </div>



            <div className="pms-user-actions">
              {usuarioSesion && (
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                  👤 {usuarioSesion.nombre} <strong style={{ color: '#f43f5e' }}>({usuarioSesion.rol})</strong>
                </span>
              )}
              <button
                className="btn-pms-switch-web"
                onClick={() => setActiveTab('inicio')}
                title="Ir al sitio web comercial de huéspedes"
              >
                🌐 Ver Web Pública
              </button>
              <button className="btn-pms-logout" onClick={handleLogout} title="Cerrar Sesión">
                <LogOut size={13}/> Salir
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* HEADER PÚBLICO OFICIAL PARA HUÉSPEDES */
        <>
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
                <button className={`facile-nav-link ${activeTab === 'centro_negocios_pub' ? 'active' : ''}`} onClick={() => setActiveTab('centro_negocios_pub')}>
                  Centro de Negocios
                </button>
                <button className={`facile-nav-link ${activeTab === 'servicios' ? 'active' : ''}`} onClick={() => setActiveTab('servicios')}>
                  Servicios
                </button>
                <button className={`facile-nav-link ${activeTab === 'galeria' ? 'active' : ''}`} onClick={() => setActiveTab('galeria')}>
                  Galería
                </button>

                {/* Botón de Empleado o Airbnb para huéspedes */}
                {usuarioSesion && usuarioSesion.rol !== 'Huésped' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                    <button className="facile-nav-link" onClick={() => setActiveTab('pms')} style={{ background: '#0f172a', color: '#fff', borderRadius: '20px', padding: '0.35rem 0.85rem' }}>
                      🏢 Ir a Panel PMS ({usuarioSesion.rol})
                    </button>
                  </div>
                ) : selectedHuesped ? (
                  <div className="guest-profile-container">
                    <button
                      className="btn-airbnb-user active-guest-pill"
                      onClick={() => setShowGuestMenuDropdown(!showGuestMenuDropdown)}
                      title="Menú de Perfil de Huésped"
                    >
                      <Menu size={16} />
                      <div style={{ width: '26px', height: '26px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={15} color="#e11d48"/>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                        {selectedHuesped.nombre.split(' ')[0]}
                      </span>
                    </button>

                    {showGuestMenuDropdown && (
                      <div className="guest-dropdown-menu" onClick={() => setShowGuestMenuDropdown(false)}>
                        <div style={{ padding: '0.6rem 1.1rem', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                          <p style={{ margin: 0, fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                            {selectedHuesped.nombre}
                          </p>
                          <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                            {selectedHuesped.correo}
                          </p>
                        </div>
                        <button className="guest-dropdown-item" onClick={() => { setActiveTab('reservar'); }}>
                          <Calendar size={16} color="#e11d48" /> Mis Reservas de Apartamento
                        </button>
                        <button className="guest-dropdown-item" onClick={() => { setShowCommunityCommitmentModal(true); }}>
                          <Heart size={16} color="#e11d48" /> Compromiso de la Comunidad
                        </button>
                        <button
                          className="guest-dropdown-item"
                          onClick={() => { setModalLegalTipo('ley1581'); setShowGuestMenuDropdown(false); }}
                        >
                          <ShieldCheck size={16} color="#2563eb" /> Privacidad Colombia (Ley 1581)
                        </button>
                        <div className="guest-dropdown-divider"></div>
                        <button
                          className="guest-dropdown-item"
                          style={{ color: '#dc2626' }}
                          onClick={() => {
                            setSelectedHuesped(null);
                            setGuestRegJustCreated(false);
                            setShowGuestMenuDropdown(false);
                            setAlert({ type: 'success', message: 'Sesión de huésped cerrada.' });
                          }}
                        >
                          <LogOut size={16} color="#dc2626" /> Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="btn-airbnb-user"
                    onClick={() => setShowGuestAuthModal(true)}
                    title="Inicia sesión o regístrate como Huésped"
                  >
                    <Menu size={16}/>
                    <User size={18}/>
                  </button>
                )}
              </nav>
            </div>
          </header>
        </>
      )}

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
      {/* =========================================================================
          VISTA 2: CATÁLOGO DE APARTAMENTOS CON FOTOS REALES Y GALERÍAS
          ========================================================================= */}
      {(activeTab === 'apartamentos' || activeTab === 'inicio') && (() => {
        const alojamientosData = [
          {
            tipo: 'Dúplex',
            unidades: '14 unidades',
            desc: '1 habitación, 1.5 baños, cocina totalmente equipada, sala, sofá cama, comedor, cuarto de lavado, lavadora-secadora, 2 televisores, Wi-Fi y balcón. Cama King o 2 camas sencillas.',
            personas: 'Hasta 3 personas',
            ambientes: '1 Hab. + 1.5 Baños',
            precio: '$250.000',
            precioSub: 'COP/noche',
            fotos: [
              { url: '/images/apartamentos/duplex IMG_9483-HDR.jpg', titulo: 'Dúplex — Vista Nivel Superior', desc: 'Diseño en doble altura con escaleras flotantes' },
              { url: '/images/apartamentos/duplex IMG_9486-HDR.jpg', titulo: 'Dúplex — Alcoba en Altillo', desc: 'Habitación privada con vista panorámica' },
              { url: '/images/apartamentos/IMG_9408-HDR.jpg', titulo: 'Dúplex — Sala Principal', desc: 'Amplitud, televisión HD y sofá cama' },
              { url: '/images/apartamentos/duplex IMG_9492-HDR.jpg', titulo: 'Dúplex — Detalles de Diseño', desc: 'Iluminación ambiental y gran confort' }
            ]
          },
          {
            tipo: 'Dobles',
            unidades: '11 unidades',
            desc: '2 habitaciones, 2 baños, capacidad 4 personas. Habitación principal con cama King y vestier, habitación auxiliar con 2 camas sencillas o doble, sala, comedor, sofá cama, cocina equipada y 3 televisores.',
            personas: 'Hasta 4 personas',
            ambientes: '2 Hab. + 2 Baños',
            precio: '$350.000',
            precioSub: 'COP/noche',
            fotos: [
              { url: '/images/apartamentos/IMG_9417-HDR.jpg', titulo: 'Dobles — Habitación Master King', desc: 'Cama King size con ropa de cama premium' },
              { url: '/images/apartamentos/IMG_9420-HDR.jpg', titulo: 'Dobles — Habitación Auxiliar', desc: 'Dos camas sencillas o doble auxiliar' },
              { url: '/images/apartamentos/IMG_9411-HDR.jpg', titulo: 'Dobles — Cocina Integral & Comedor', desc: 'Cocina totalmente equipada' },
              { url: '/images/apartamentos/IMG_9438-HDR.jpg', titulo: 'Dobles — Sala Social', desc: 'Espacio integrado para 4 personas' }
            ]
          },
          {
            tipo: 'Familiares',
            unidades: '2 unidades',
            desc: '3 habitaciones, 2 baños, capacidad 6 personas. Habitación principal con cama King y vestier, 2 habitaciones auxiliares con cama nido, comedor de 6 puestos, sofá cama, cocina y 4 televisores.',
            personas: 'Hasta 6 personas',
            ambientes: '3 Hab. + 2 Baños',
            precio: '$450.000',
            precioSub: 'COP/noche',
            fotos: [
              { url: '/images/apartamentos/IMG_9459-HDR.jpg', titulo: 'Familiares — Comedor de 6 Puestos & Sala', desc: 'Amplitud única para familias y grupos corporativos' },
              { url: '/images/apartamentos/IMG_9462-HDR.jpg', titulo: 'Familiares — Habitaciones Auxiliares', desc: 'Camas nido para máximo aprovechamiento' },
              { url: '/images/apartamentos/IMG_9465-HDR.jpg', titulo: 'Familiares — Cocina Abierta', desc: 'Cocina espaciosa con menaje completo' },
              { url: '/images/apartamentos/IMG_9426-HDR.jpg', titulo: 'Familiares — Zona de Lavandería Privada', desc: 'Lavadora y secadora en la unidad' }
            ]
          },
          {
            tipo: 'Habitaciones',
            unidades: '11 unidades',
            desc: 'Habitación individual con baño privado, capacidad 2 personas, Wi-Fi y TV. Ideal para ejecutivos y viajeros de negocios en estadías cortas.',
            personas: 'Hasta 2 personas',
            ambientes: 'Baño privado',
            precio: 'Consultar',
            precioSub: 'tarifa',
            fotos: [
              { url: '/images/apartamentos/IMG_9495-HDR.jpg', titulo: 'Habitación — Alcoba Ejecutiva', desc: 'Cama confort, escritorio de trabajo y TV' },
              { url: '/images/apartamentos/IMG_9498-HDR.jpg', titulo: 'Habitación — Vista Interna', desc: 'Entorno silencioso para descanso o teletrabajo' },
              { url: '/images/apartamentos/IMG_9423-HDR.jpg', titulo: 'Habitación — Baño Privado En-Suite', desc: 'Acabados en cerámica y ducha tipo lluvia' },
              { url: '/images/apartamentos/IMG_9351-HDR.jpg', titulo: 'Habitación — Detalles de Confort', desc: 'Wi-Fi de alta velocidad incluido' }
            ]
          }
        ];

        return (
          <section className="facile-section" style={{ borderTop: activeTab === 'inicio' ? '1px solid #e2e8f0' : 'none' }}>
            <div className="section-title-wrap">
              <h2>Nuestros Alojamientos</h2>
              <p>38 unidades disponibles en 4 categorías — Reserve directamente con nosotros</p>
            </div>

            <div className="apto-grid">
              {alojamientosData.map((apto) => {
                const activePhotoIndex = aptoActivePhoto[apto.tipo] || 0;
                const currentPhoto = apto.fotos[activePhotoIndex] || apto.fotos[0];

                return (
                  <div key={apto.tipo} className="apto-item">
                    {/* ENCABEZADO ORIGINAL DE LA TARJETA CON NOMBRE VISIBLE */}
                    <div className="apto-header">
                      <h3>{apto.tipo}</h3>
                      <span className="badge-red-num">{apto.unidades}</span>
                    </div>

                    {/* IMAGEN DE BANNER PRINCIPAL DE LA TARJETA */}
                    <div
                      style={{ position: 'relative', width: '100%', height: '195px', overflow: 'hidden', background: '#0f172a', cursor: 'pointer' }}
                      onClick={() => setSelectedAptoFigma(apto)}
                      title="Haz clic para ver el detalle en el diseño de Figma"
                    >
                      <img
                        src={currentPhoto.url}
                        alt={currentPhoto.titulo}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />

                      {/* INSIGNIA VER DETALLE FIGMA */}
                      <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '0.35rem 0.75rem', borderRadius: '15px', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Maximize2 size={13}/> Ver Detalle Figma
                      </div>
                    </div>

                    {/* MINI CARRUSEL DE MINIATURAS FOTOGRÁFICAS */}
                    <div style={{ display: 'flex', gap: '0.4rem', padding: '0.5rem 0.8rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', overflowX: 'auto' }}>
                      {apto.fotos.map((f, i) => (
                        <div
                          key={i}
                          onClick={() => setAptoActivePhoto(prev => ({ ...prev, [apto.tipo]: i }))}
                          style={{
                            width: '52px',
                            height: '38px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: activePhotoIndex === i ? '2px solid #e11d48' : '1.5px solid #cbd5e1',
                            opacity: activePhotoIndex === i ? 1 : 0.65,
                            transition: 'all 0.2s ease',
                            flexShrink: 0
                          }}
                        >
                          <img src={f.url} alt="Vista" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>

                    {/* CUERPO Y DETALLES */}
                    <div className="apto-body">
                      <p className="apto-text">
                        {apto.desc}
                      </p>
                      <div className="apto-specs">
                        <span className="spec-pill"><Users size={12}/> {apto.personas}</span>
                        <span className="spec-pill"><Wifi size={12}/> Wi-Fi</span>
                        <span className="spec-pill"><Home size={12}/> {apto.ambientes}</span>
                      </div>
                      <div className="apto-footer">
                        <div className="price-text">
                          {apto.precio} <span>{apto.precioSub}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn-book-red"
                            style={{ background: '#0f172a', color: '#fff', padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
                            onClick={() => setSelectedAptoFigma(apto)}
                            title="Ver vista interactiva de Figma"
                          >
                            Detalle
                          </button>
                          <button className="btn-book-red" onClick={() => handleReservarTipo(apto.tipo)}>
                            Reservar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MODAL DETALLE DE APARTAMENTO IDENTICO AL MOCKUP DE FIGMA */}
            {selectedAptoFigma && (() => {
              const activeFigmaIdx = aptoActivePhoto[selectedAptoFigma.tipo] || 0;
              const mainPhoto = selectedAptoFigma.fotos[activeFigmaIdx] || selectedAptoFigma.fotos[0];

              return (
                <div className="figma-modal-backdrop" onClick={() => setSelectedAptoFigma(null)}>
                  <div className="figma-modal-card" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedAptoFigma(null)}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '20px',
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#334155',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ✕
                    </button>

                    <div className="figma-breadcrumb">
                      <span className="link" onClick={() => { setSelectedAptoFigma(null); setActiveTab('inicio'); }}>Inicio</span>
                      <span>&gt;</span>
                      <span className="link" onClick={() => { setSelectedAptoFigma(null); setActiveTab('apartamentos'); }}>Apartamentos</span>
                      <span>&gt;</span>
                      <span className="active">Apartamento {selectedAptoFigma.tipo} — {selectedAptoFigma.ambientes}</span>
                    </div>

                    <div className="figma-detail-grid">
                      <div>
                        <div
                          className="figma-main-img-wrap"
                          onClick={() => {
                            setAptoLightboxPhoto({ photos: selectedAptoFigma.fotos, index: activeFigmaIdx });
                          }}
                          title="Haz clic para ampliar en pantalla completa"
                        >
                          <img src={mainPhoto.url} alt={mainPhoto.titulo} />
                          <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(15,23,42,0.85)', color: '#fff', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                            🔍 Ampliar Fotografía Real
                          </div>
                        </div>

                        <div className="figma-thumbs-row">
                          {selectedAptoFigma.fotos.slice(0, 4).map((f, i) => (
                            <div
                              key={i}
                              className={`figma-thumb-item ${activeFigmaIdx === i ? 'active' : ''}`}
                              onClick={() => setAptoActivePhoto(prev => ({ ...prev, [selectedAptoFigma.tipo]: i }))}
                            >
                              <img src={f.url} alt={f.titulo} />
                            </div>
                          ))}
                          <div
                            className="figma-thumb-item"
                            onClick={() => setAptoLightboxPhoto({ photos: selectedAptoFigma.fotos, index: 0 })}
                          >
                            <img src={selectedAptoFigma.fotos[0]?.url} alt="Más fotos" />
                            <div className="figma-thumb-more">
                              +{selectedAptoFigma.fotos.length} fotos
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="figma-right-card">
                        <span className="figma-badge-pill">APARTAMENTO</span>
                        <h2 className="figma-title">{selectedAptoFigma.tipo} — {selectedAptoFigma.ambientes}</h2>
                        <p className="figma-subtitle">
                          Apartamento amoblado de lujo en El Chicó, Bogotá. Ideal para estadías individuales o en pareja.
                        </p>

                        <div className="figma-price-box">
                          <div className="figma-price-label">TARIFA POR NOCHE</div>
                          <div className="figma-price-amount">
                            {selectedAptoFigma.precio} <span className="figma-price-unit">{selectedAptoFigma.precioSub}</span>
                          </div>
                          <div className="figma-price-tax">Impuestos aplican según perfil del huésped</div>
                        </div>

                        <div className="figma-specs-grid">
                          <div className="figma-spec-card">
                            <div className="figma-spec-icon">👥</div>
                            <div className="figma-spec-text">
                              <span className="figma-spec-label">CAPACIDAD</span>
                              <span className="figma-spec-value">{selectedAptoFigma.personas}</span>
                            </div>
                          </div>
                          <div className="figma-spec-card">
                            <div className="figma-spec-icon">🛏️</div>
                            <div className="figma-spec-text">
                              <span className="figma-spec-label">HABITACIONES</span>
                              <span className="figma-spec-value">{selectedAptoFigma.ambientes}</span>
                            </div>
                          </div>
                          <div className="figma-spec-card">
                            <div className="figma-spec-icon">🛋️</div>
                            <div className="figma-spec-text">
                              <span className="figma-spec-label">FORMATO</span>
                              <span className="figma-spec-value">{selectedAptoFigma.tipo}</span>
                            </div>
                          </div>
                          <div className="figma-spec-card">
                            <div className="figma-spec-icon">🚿</div>
                            <div className="figma-spec-text">
                              <span className="figma-spec-label">BAÑOS & SERVICIOS</span>
                              <span className="figma-spec-value">Privados en suite</span>
                            </div>
                          </div>
                        </div>

                        <div className="figma-dates-box">
                          <div className="figma-dates-row">
                            <div className="figma-date-field">
                              <label className="figma-date-label">LLEGADA</label>
                              <input type="date" className="figma-date-input" defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="figma-date-field">
                              <label className="figma-date-label">SALIDA</label>
                              <input type="date" className="figma-date-input" defaultValue={new Date(Date.now() + 86400000).toISOString().split('T')[0]} />
                            </div>
                          </div>
                          <div className="figma-date-field">
                            <label className="figma-date-label">HUÉSPEDES</label>
                            <select className="figma-date-input">
                              <option value="2">2 adultos</option>
                              <option value="1">1 adulto</option>
                              <option value="3">3 adultos</option>
                              <option value="4">4 adultos</option>
                            </select>
                          </div>
                        </div>

                        <button
                          className="btn-figma-reserve"
                          onClick={() => {
                            setSelectedAptoFigma(null);
                            handleReservarTipo(selectedAptoFigma.tipo);
                          }}
                        >
                          Reservar este apartamento
                        </button>

                        <a
                          href="https://wa.me/573153512085?text=Hola,%20quisiera%20consultar%20disponibilidad%20para%20el%20Apartamento%20Facile"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-figma-whatsapp"
                          style={{ textDecoration: 'none' }}
                        >
                          <span style={{ color: '#10b981', fontSize: '1.2rem', lineHeight: 1 }}>•</span> Consultar por WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* LIGHTBOX MODAL NAVEGABLE A PANTALLA COMPLETA CON BOTONES IZQUIERDA / DERECHA */}
            {aptoLightboxPhoto && (() => {
              const photosList = aptoLightboxPhoto.photos || [aptoLightboxPhoto];
              const currentIndex = aptoLightboxPhoto.index || 0;
              const activePhoto = photosList[currentIndex] || photosList[0];

              const goPrev = (e) => {
                if (e) e.stopPropagation();
                const newIdx = (currentIndex - 1 + photosList.length) % photosList.length;
                setAptoLightboxPhoto({ photos: photosList, index: newIdx });
              };

              const goNext = (e) => {
                if (e) e.stopPropagation();
                const newIdx = (currentIndex + 1) % photosList.length;
                setAptoLightboxPhoto({ photos: photosList, index: newIdx });
              };

              return (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(15, 23, 42, 0.96)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem'
                  }}
                  onClick={() => setAptoLightboxPhoto(null)}
                >
                  {/* BOTÓN CERRAR (X) */}
                  <button
                    type="button"
                    onClick={() => setAptoLightboxPhoto(null)}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '25px',
                      background: 'rgba(255,255,255,0.15)',
                      border: 'none',
                      color: '#ffffff',
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 100000,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e11d48'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    title="Cerrar (Esc)"
                  >
                    <X size={26}/>
                  </button>

                  {/* NAVEGACIÓN FLECHA IZQUIERDA */}
                  {photosList.length > 1 && (
                    <button
                      type="button"
                      onClick={goPrev}
                      style={{
                        position: 'absolute',
                        left: '25px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.18)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        color: '#ffffff',
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        zIndex: 100000,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#e11d48';
                        e.currentTarget.style.borderColor = '#e11d48';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      }}
                      title="Fotografía Anterior (Flecha Izquierda)"
                    >
                      <ChevronLeft size={32}/>
                    </button>
                  )}

                  {/* NAVEGACIÓN FLECHA DERECHA */}
                  {photosList.length > 1 && (
                    <button
                      type="button"
                      onClick={goNext}
                      style={{
                        position: 'absolute',
                        right: '25px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.18)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        color: '#ffffff',
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        zIndex: 100000,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#e11d48';
                        e.currentTarget.style.borderColor = '#e11d48';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      }}
                      title="Siguiente Fotografía (Flecha Derecha)"
                    >
                      <ChevronRight size={32}/>
                    </button>
                  )}

                  {/* CONTENEDOR DE LA FOTO EN ALTA RESOLUCIÓN */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      maxWidth: '88vw',
                      maxHeight: '82vh',
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
                      background: '#0f172a',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <img
                      src={activePhoto.url}
                      alt={activePhoto.titulo || 'Fotografía'}
                      style={{ maxHeight: '72vh', maxWidth: '88vw', objectFit: 'contain', display: 'block' }}
                    />
                    <div style={{ width: '100%', background: '#0f172a', padding: '1rem 1.5rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div>
                        {activePhoto.titulo && (
                          <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.15rem', fontWeight: 800 }}>
                            {activePhoto.titulo}
                          </h3>
                        )}
                        {activePhoto.desc && (
                          <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.86rem' }}>
                            {activePhoto.desc}
                          </p>
                        )}
                      </div>

                      {/* CONTADOR DE FOTOS */}
                      {photosList.length > 1 && (
                        <div style={{ background: '#e11d48', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0 }}>
                          {currentIndex + 1} de {photosList.length}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>
        );
      })()}

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
          </div>
        </section>
      )}

      {/* =========================================================================
          VISTA: CENTRO DE NEGOCIOS PÚBLICO CON SHOWCASE BOOKING.COM EN CADA OPCIÓN
          ========================================================================= */}
      {activeTab === 'centro_negocios_pub' && (() => {
        const oficinasData = [
          {
            id: 'sala_1',
            tipo: 'Sala de Juntas 1',
            capacidad: 'Hasta 10 personas',
            desc: 'Sala ejecutiva de reuniones totalmente equipada con pantalla de 65" para presentaciones, conexión a internet por fibra óptica, climatización e insonorización acústica.',
            precio: '$70.000',
            precioSub: 'COP/hora',
            fotos: [
              { url: '/images/oficinas/IMG_9272-HDR.jpg', titulo: 'Sala de Juntas 1 — Vista Principal Mesa Directiva', desc: 'Mesa corporativa en madera con 10 sillas ergonómicas' },
              { url: '/images/oficinas/IMG_9275-HDR.jpg', titulo: 'Sala de Juntas 1 — Pantalla 65" & Audiovisual', desc: 'Conectividad HDMI, USB-C y sonido envolvente' },
              { url: '/images/oficinas/IMG_9366-HDR.jpg', titulo: 'Sala de Juntas 1 — Proyección & Climatización', desc: 'Clima individualizado y excelente acústica' },
              { url: '/images/oficinas/IMG_9378-HDR.jpg', titulo: 'Sala de Juntas 1 — Iluminación & Panorámica', desc: 'Luz natural con cortinas de graduación' },
              { url: '/images/oficinas/IMG_9281-HDR.jpg', titulo: 'Sala de Juntas 1 — Soporte Ejecutivo', desc: 'Estación de apoyo insonorizada' },
              { url: '/images/oficinas/IMG_9290-HDR.jpg', titulo: 'Sala de Juntas 1 — Vista Lateral', desc: 'Mobiliario corporativo moderno' }
            ]
          },
          {
            id: 'sala_2',
            tipo: 'Sala de Juntas 2',
            capacidad: 'Hasta 10 personas',
            desc: 'Segunda sala de juntas ejecutiva con equipamiento VIP completo. Ideal para reuniones directivas simultáneas, capacitaciones de equipos y firmas corporativas.',
            precio: '$70.000',
            precioSub: 'COP/hora',
            fotos: [
              { url: '/images/oficinas/IMG_9369-HDR.jpg', titulo: 'Sala de Juntas 2 — Área Directiva VIP', desc: 'Mesa ejecutiva con climatización de precisión' },
              { url: '/images/oficinas/IMG_9375-HDR.jpg', titulo: 'Sala de Juntas 2 — Conexiones Integradas', desc: 'Puertos de energía y red directos en mesa' },
              { url: '/images/oficinas/IMG_9381-HDR.jpg', titulo: 'Sala de Juntas 2 — Sillas Ergonómicas', desc: 'Asientos ergonómicos ajustables' },
              { url: '/images/oficinas/IMG_9387-HDR.jpg', titulo: 'Sala de Juntas 2 — Insonorización Acústica', desc: 'Privacidad total para llamadas y negociaciones' },
              { url: '/images/oficinas/IMG_9396-HDR.jpg', titulo: 'Sala de Juntas 2 — Zona Lounge de Pausas', desc: 'Sillones ejecutivos confortables' }
            ]
          },
          {
            id: 'sala_3',
            tipo: 'Sala de Juntas 3',
            capacidad: 'Hasta 15 personas',
            desc: 'Espacio flexible de reuniones y trabajo colaborativo (Coworking flex) con internet dedicado por fibra óptica, estaciones de café gourmet y ambiente profesional.',
            precio: '$20.000',
            precioSub: 'COP/hora',
            fotos: [
              { url: '/images/oficinas/IMG_9278-HDR.jpg', titulo: 'Sala de Juntas 3 — Puestos de Trabajo Flex', desc: 'Puestos libres con iluminación LED y fibra óptica' },
              { url: '/images/oficinas/IMG_9287-HDR.jpg', titulo: 'Sala de Juntas 3 — Puesto Individual Privado', desc: 'Insonorización y aislamiento para videollamadas' },
              { url: '/images/oficinas/IMG_9296-HDR.jpg', titulo: 'Sala de Juntas 3 — Impresiones & Copiado', desc: 'Multifuncional para huéspedes y profesionales' },
              { url: '/images/oficinas/IMG_9308-HDR.jpg', titulo: 'Sala de Juntas 3 — Estación de Café & Lounge', desc: 'Café gourmet ilimitado y zona de networking' },
              { url: '/images/oficinas/IMG_9311-HDR.jpg', titulo: 'Sala de Juntas 3 — Espacio Colaborativo', desc: 'Mobiliario adaptable para equipos' },
              { url: '/images/oficinas/IMG_9399-HDR.jpg', titulo: 'Sala de Juntas 3 — Panorama Centro de Negocios', desc: 'Entorno de alto desempeño profesional' }
            ]
          }
        ];

        return (
          <section className="facile-section">
            <div className="section-title-wrap">
              <h2>Centro de Negocios & Salas de Juntas</h2>
              <p>Salas de reuniones ejecutivas y espacios de coworking con la mejor infraestructura en El Chicó</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', marginTop: '1rem' }}>
              {oficinasData.map((oficina) => (
                <div
                  key={oficina.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    padding: '1.8rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {/* CABECERA DEL ESPACIO */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                          {oficina.tipo}
                        </h3>
                        <span style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800 }}>
                          {oficina.capacidad}
                        </span>
                      </div>
                      <p style={{ margin: '0.4rem 0 0', color: '#64748b', fontSize: '0.92rem' }}>
                        {oficina.desc}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#e11d48' }}>
                        {oficina.precio} <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>{oficina.precioSub}</span>
                      </div>
                    </div>
                  </div>

                  {/* COLLAGE ESTILO BOOKING.COM ESPECÍFICO DE ESTE ESPACIO */}
                  <BookingShowcase
                    photos={oficina.fotos}
                    onOpenLightbox={(idx) => setAptoLightboxPhoto({ photos: oficina.fotos, index: idx })}
                    title={`Álbum Fotográfico — ${oficina.tipo}`}
                  />

                  {/* PIE DE ESPECIFICACIONES Y BOTÓN ACCIÓN */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span className="spec-pill"><Wifi size={13}/> Fibra Óptica Dedicada</span>
                      <span className="spec-pill"><Briefcase size={13}/> Pantalla HD 65" / Proyector</span>
                      <span className="spec-pill"><Clock size={13}/> Alquiler Flexible por Horas</span>
                    </div>
                    <button className="btn-book-red" onClick={() => setActiveTab('reservar')} style={{ padding: '0.75rem 1.8rem', fontSize: '0.92rem' }}>
                      Consultar Disponibilidad / Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* =========================================================================
          VISTA: GALERÍA DE FOTOS INTERACTIVA REAL CON LIGHTBOX & SHOWCASE BOOKING.COM
          ========================================================================= */}
      {activeTab === 'galeria' && (() => {
        const galleryItems = [
          // ZONAS COMUNES & APARTAHOTEL (11 FOTOS REALES)
          { id: 1, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9217-HDR.jpg', titulo: 'Fachada & Ingreso Principal', desc: 'Ubicación privileged en El Chicó, Bogotá' },
          { id: 2, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9226-HDR.jpg', titulo: 'Lobby & Recepción 24 Horas', desc: 'Atención personalizada y check-in 24/7' },
          { id: 3, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9229-HDR.jpg', titulo: 'Salón de Espera Principal', desc: 'Cómodas salas lounge para huéspedes y visitantes' },
          { id: 4, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9233-HDR.jpg', titulo: 'Comedor & Área Social', desc: 'Espacios luminosos ideales para descanso' },
          { id: 5, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9236-HDR.jpg', titulo: 'Lounge Social & Confort', desc: 'Mobiliario ergonómico de alta gama' },
          { id: 6, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9239-HDR.jpg', titulo: 'Hall de Ascensores', desc: 'Acceso rápido y seguro a todos los niveles' },
          { id: 7, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9248-HDR.jpg', titulo: 'Pasillos de Circulación', desc: 'Amplios corredores con iluminación ambiental' },
          { id: 8, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9254-HDR.jpg', titulo: 'Terraza & Entorno Natural', desc: 'Espacio al aire libre en la zona norte' },
          { id: 9, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9260-HDR.jpg', titulo: 'Lobby de Descanso', desc: 'Ambiente tranquilo para lectura y relajación' },
          { id: 10, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9305-HDR.jpg', titulo: 'Vista Panorámica del Sector', desc: 'Rodeado de los mejores restaurantes y centros empresariales' },
          { id: 11, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9317-HDR.jpg', titulo: 'Iluminación Nocturna de Recepción', desc: 'Seguridad y asistencia permanente' },

          // APARTAMENTOS & DÚPLEX (9 FOTOS REALES)
          { id: 12, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9408-HDR.jpg', titulo: 'Sala de Apartamento Dúplex', desc: 'Amplitud, sofá cama y televisión de alta resolución' },
          { id: 13, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9411-HDR.jpg', titulo: 'Cocina Integral & Comedor', desc: 'Equipada con nevera, microondas y menaje completo' },
          { id: 14, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9417-HDR.jpg', titulo: 'Habitación Master King', desc: 'Cama King, ropa de cama premium y cortinas black-out' },
          { id: 15, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9420-HDR.jpg', titulo: 'Segunda Habitación / Suite', desc: 'Confort individual o en pareja para estadías extendidas' },
          { id: 16, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9423-HDR.jpg', titulo: 'Baño Principal En-Suite', desc: 'Ducha de agua caliente constante y acabados modernos' },
          { id: 17, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9426-HDR.jpg', titulo: 'Zona de Ropas & Lavado', desc: 'Lavadora-secadora privada dentro de la unidad' },
          { id: 18, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/duplex IMG_9483-HDR.jpg', titulo: 'Nivel Superior Dúplex', desc: 'Diseño arquitectónico en dos niveles' },
          { id: 19, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/duplex IMG_9486-HDR.jpg', titulo: 'Alcoba Principal Dúplex', desc: 'Espacio exclusivo para un descanso reparador' },
          { id: 20, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/duplex IMG_9492-HDR.jpg', titulo: 'Detalle de Diseño Interior', desc: 'Mobiliario amoblado y pensado para la productividad' },

          // CENTRO DE NEGOCIOS & COWORKING (17 FOTOS REALES)
          { id: 21, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9272-HDR.jpg', titulo: 'Sala de Juntas Ejecutiva 1', desc: 'Capacidad para 10 personas con mesa corporativa' },
          { id: 22, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9275-HDR.jpg', titulo: 'Equipamiento Audiovisual', desc: 'Pantalla 65 pulgadas para videollamadas' },
          { id: 23, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9278-HDR.jpg', titulo: 'Puestos Coworking Flex', desc: 'Conexión a internet dedicado por fibra óptica' },
          { id: 24, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9281-HDR.jpg', titulo: 'Escritorio Ejecutivo Insonorizado', desc: 'Entorno de concentración individual' },
          { id: 25, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9287-HDR.jpg', titulo: 'Oficina Privada por Horas', desc: 'Insonorización y privacidad para reuniones' },
          { id: 26, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9290-HDR.jpg', titulo: 'Área de Trabajo & Reuniones Rápidas', desc: 'Mobiliario moderno con excelente iluminación' },
          { id: 27, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9296-HDR.jpg', titulo: 'Zona de Impresiones & Scanner', desc: 'Servicios de oficina integrados para huéspedes' },
          { id: 28, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9308-HDR.jpg', titulo: 'Lounge Corporativo & Estación de Café', desc: 'Bebidas calientes y espacio de networking' },
          { id: 29, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9311-HDR.jpg', titulo: 'Espacio Colaborativo de Negocios', desc: 'Ambiente dinámico para emprendedores' },
          { id: 30, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9366-HDR.jpg', titulo: 'Mesa Directiva & Proyector HD', desc: 'Tecnología lista para capacitaciones' },
          { id: 31, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9369-HDR.jpg', titulo: 'Ambiente de Silencio & Enfoque', desc: 'Climatización y ergonomía garantizada' },
          { id: 32, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9375-HDR.jpg', titulo: 'Conexiones Eléctricas Dobladas', desc: 'Tomas múltiples y conectividad en cada puesto' },
          { id: 33, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9378-HDR.jpg', titulo: 'Sala VIP Corporativa', desc: 'Servicio exclusivo para ejecutivos y firmas' },
          { id: 34, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9381-HDR.jpg', titulo: 'Puesto Ergonómico Ejecutivo', desc: 'Sillas de alta gama para jornadas prolongadas' },
          { id: 35, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9387-HDR.jpg', titulo: 'Oficina Privada Nivel Superior', desc: 'Vista privileged y máximo confort' },
          { id: 36, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9396-HDR.jpg', titulo: 'Zona de Descanso para Empresarios', desc: 'Sillones cómodos para pausas activas' },
          { id: 37, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9399-HDR.jpg', titulo: 'Vista General del Centro de Negocios', desc: 'Ubicación clave en el Parque de la 93 / Chicó' }
        ];

        const filteredList = galleryFilter === 'todas' 
          ? galleryItems 
          : galleryItems.filter(item => item.categoria === galleryFilter);

        const currentImage = lightboxIdx !== null ? filteredList[lightboxIdx] : null;

        return (
          <section className="facile-section">
            <div className="section-title-wrap">
              <h2>Galería Fotográfica Real</h2>
              <p>Conoce las instalaciones reales de Apartamentos Facile Bogotá & Centro de Negocios ({galleryItems.length} fotografías en total)</p>
            </div>

            {/* SHOWCASE HIGHLIGHT TIPO BOOKING.COM AL INICIO DE LA GALERÍA */}
            <BookingShowcase
              photos={filteredList}
              onOpenLightbox={(idx) => setLightboxIdx(idx)}
              title="Vistas Destacadas del Apartahotel & Centro de Negocios"
            />

            {/* BARRA DE FILTROS CATEGÓRICOS DE GALERÍA */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap', padding: '0 1rem' }}>
              {[
                { id: 'todas', label: '🌟 Ver Todas', count: galleryItems.length },
                { id: 'zonas', label: '🏢 Zonas Comunes & Lobby', count: galleryItems.filter(i => i.categoria === 'zonas').length },
                { id: 'apartamentos', label: '🛋️ Apartamentos & Dúplex', count: galleryItems.filter(i => i.categoria === 'apartamentos').length },
                { id: 'oficinas', label: '💼 Centro de Negocios & Coworking (17 fotos)', count: galleryItems.filter(i => i.categoria === 'oficinas').length }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setGalleryFilter(f.id); setLightboxIdx(null); }}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '25px',
                    border: galleryFilter === f.id ? '2px solid #e11d48' : '1.5px solid #cbd5e1',
                    background: galleryFilter === f.id ? '#e11d48' : '#ffffff',
                    color: galleryFilter === f.id ? '#ffffff' : '#334155',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: galleryFilter === f.id ? '0 4px 12px rgba(225,29,72,0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>{f.label}</span>
                  <span style={{
                    background: galleryFilter === f.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: galleryFilter === f.id ? '#ffffff' : '#64748b',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* GRID DE GALERÍA FOTOGRÁFICA (PURA FOTOGRAFÍA) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem', padding: '0 1rem 2rem' }}>
              {filteredList.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxIdx(idx)}
                  style={{
                    background: '#0f172a',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    height: '240px',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 14px 30px rgba(0,0,0,0.18)';
                    const overlay = e.currentTarget.querySelector('.photo-hover-overlay');
                    if (overlay) overlay.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)';
                    const overlay = e.currentTarget.querySelector('.photo-hover-overlay');
                    if (overlay) overlay.style.opacity = '0';
                  }}
                >
                  <img
                    src={item.url}
                    alt="Fotografía Facile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  />

                  {/* HOVER OVERLAY CON ÍCONO DE LUPA */}
                  <div
                    className="photo-hover-overlay"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(225, 29, 72, 0.45)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      opacity: 0,
                      transition: 'opacity 0.25s ease'
                    }}
                  >
                    <div style={{ background: '#ffffff', color: '#e11d48', padding: '0.6rem 1.2rem', borderRadius: '25px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                      <Maximize2 size={16}/> Ampliar Fotografía
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* LIGHTBOX MODAL FULLSCREEN AMPLIFICADOR DE FOTOS (SOLO IMAGEN) */}
            {currentImage && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(15, 23, 42, 0.94)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 99999,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem'
                }}
                onClick={() => setLightboxIdx(null)}
              >
                {/* BOTÓN CERRAR */}
                <button
                  type="button"
                  onClick={() => setLightboxIdx(null)}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '25px',
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#ffffff',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    zIndex: 100000
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e11d48'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                  <X size={24}/>
                </button>

                {/* NAVEGACIÓN ANTERIOR */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx((lightboxIdx - 1 + filteredList.length) % filteredList.length);
                  }}
                  style={{
                    position: 'absolute',
                    left: '25px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#ffffff',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    zIndex: 100000
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e11d48'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                  <ChevronLeft size={28}/>
                </button>

                {/* NAVEGACIÓN SIGUIENTE */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx((lightboxIdx + 1) % filteredList.length);
                  }}
                  style={{
                    position: 'absolute',
                    right: '25px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#ffffff',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    zIndex: 100000
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e11d48'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                  <ChevronRight size={28}/>
                </button>

                {/* CONTENEDOR DE LA IMAGEN EN ALTA RESOLUCIÓN (PURA FOTOGRAFÍA) */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '86vh',
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
                    background: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={currentImage.url}
                    alt="Fotografía Facile"
                    style={{ maxHeight: '86vh', maxWidth: '90vw', objectFit: 'contain', display: 'block' }}
                  />
                </div>
              </div>
            )}
          </section>
        );
      })()}

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
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#854d0e', fontWeight: 700 }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#eab308', display: 'inline-block' }}/> 🟡 Tu Selección
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
                            bg = '#e11d48';
                            color = '#ffffff';
                            borderColor = '#be123c';
                          } else if (item.inRange) {
                            bg = '#fef08a';
                            color = '#854d0e';
                            borderColor = '#fde047';
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
                    <div className="quote-row"><span>Valor por Noche:</span><strong>${cotizacion.precio_noche ? cotizacion.precio_noche.toLocaleString('es-CO') : '0'} COP / noche</strong></div>
                    <div className="quote-row"><span>Duración de Estadía:</span><span>{cotizacion.noches} {cotizacion.noches === 1 ? 'noche' : 'noches'}</span></div>
                    <div className="quote-row"><span>Subtotal Estadía:</span><span>${cotizacion.subtotal.toLocaleString('es-CO')} COP</span></div>
                    {cotizacion.descuento > 0 && (
                      <div className="quote-row discount">
                        <span>Descuento Larga Estadía ({cotizacion.noches >= 15 ? '15%' : '10%'}):</span>
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
                        <option value="Conserje">Conserje</option>
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
                              <option value="Conserje">Conserje</option>
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
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#854d0e', fontWeight: 700 }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#eab308', display: 'inline-block' }}/> 🟡 Tu Selección
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
                          bg = '#e11d48';
                          color = '#ffffff';
                          borderColor = '#be123c';
                        } else if (item.inRange) {
                          bg = '#fef08a';
                          color = '#854d0e';
                          borderColor = '#fde047';
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

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1.2rem' }}>
                <button
                  type="button"
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedHuesped(null);
                    setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
                    setPmsWalkInGuest({ tipo_documento: 'Cédula de Ciudadanía', documento: '', nombre: '', telefono: '', correo: '' });
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
                <h3 style={{ fontSize: '1.1rem' }}>Reservas Activas ({reservas.length})</h3>
              </div>
              <div className="pms-table-wrap">
                <table className="pms-table">
                  <thead>
                    <tr><th>Huésped</th><th>Apto</th><th>Fechas</th><th>Origen</th><th>Acción</th></tr>
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
                          <span className="badge-tag" style={{ background: r.creado_por?.includes('Web') ? '#e0f2fe' : '#fef3c7', color: r.creado_por?.includes('Web') ? '#0369a1' : '#b45309', fontSize: '0.7rem' }}>
                            {r.creado_por?.includes('Web') ? '🌐 Web Pública' : `👨‍💼 ${r.creado_por || 'Recepción'}`}
                          </span>
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
      )}

      {/* WHATSAPP FLOATING WIDGET Y FOOTER CONDICIONALES */}
      {activeTab !== 'pms' ? (
        <>
          {/* WHATSAPP FLOATING WIDGET (COMO EN APARTAMENTOSFACILE.COM) */}
          <div className="whatsapp-float-wrap">
            <span className="whatsapp-bubble">¿En qué podemos servirle?</span>
            <a href="https://wa.me/573153512085" target="_blank" rel="noreferrer" className="whatsapp-circle-btn" title="Contactar por WhatsApp">
              <MessageCircle size={28}/>
            </a>
          </div>

          {/* FOOTER CORPORATIVO OFICIAL PÚBLICO */}
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
              <button
                onClick={() => setShowLoginModal(true)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.72rem', cursor: 'pointer', marginTop: '0.4rem', textDecoration: 'underline' }}
              >
                🔒 Acceso Personal Autorizado (BookingSoft PMS)
              </button>
            </div>
          </footer>
        </>
      ) : (
        /* FOOTER INTERNO EXCLUSIVO PMS */
        <footer style={{ marginTop: 'auto', background: '#0f172a', color: '#64748b', borderTop: '1px solid #1e293b', padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.78rem' }}>
          <p style={{ margin: 0 }}>
            <strong>BookingSoft PMS v2.0</strong> — Sistema de Control Hotelero Interno | Apartamentos Facile — ADSO 2026
          </p>
        </footer>
      )}

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
                  <input type="text" placeholder="Ej: admin" value={loginForm.usuario} onChange={(e) => setLoginForm({ ...loginForm, usuario: e.target.value })} required/>
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
          </div>
        </div>
      )}
      {/* MODAL HUÉSPED AIRBNB ("Inicia sesión o regístrate") */}
      {showGuestAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowGuestAuthModal(false)}>
          <div className="modal-airbnb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-airbnb-header">
              <button className="btn-x-close" onClick={() => setShowGuestAuthModal(false)}>✕</button>
              <h3 className="modal-airbnb-title">Inicia sesión o regístrate</h3>
            </div>

            <div className="modal-airbnb-body">
              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem' }}>
                  <User size={24} color="#e11d48" />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                  Te damos la bienvenida a Facile
                </h4>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Ingrese sus datos para cotizar o confirmar su reserva de apartamento
                </p>
              </div>

              {guestRegJustCreated && selectedHuesped ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
                    <CheckCircle2 size={32} color="#166534" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#166534' }}>
                    ¡Usuario Creado Exitosamente!
                  </h4>
                  <p style={{ margin: '0.5rem 0 0.8rem', fontSize: '0.88rem', color: '#374151', lineHeight: '1.5' }}>
                    Hemos enviado una notificación de bienvenida al correo:<br/>
                    <strong style={{ color: '#15803d' }}>{selectedHuesped.correo}</strong>
                  </p>
                  <div style={{ background: '#ffffff', padding: '0.8rem', borderRadius: '10px', fontSize: '0.8rem', color: '#64748b', marginBottom: '1.2rem', border: '1px solid #e2e8f0' }}>
                    ✉️ Notificación enviada. Su perfil está activo y su contraseña ha sido registrada.
                  </div>
                  <button
                    type="button"
                    className="btn-airbnb-primary"
                    onClick={() => { setShowGuestAuthModal(false); setGuestRegJustCreated(false); setActiveTab('reservar'); }}
                  >
                    Continuar a la Reserva →
                  </button>
                </div>
              ) : selectedHuesped ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <CheckCircle2 size={20} /> Perfil Activo Seleccionado
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>{selectedHuesped.nombre}</p>
                  <p style={{ margin: '0.2rem 0 0.8rem', fontSize: '0.8rem', color: '#64748b' }}>Doc: {selectedHuesped.documento} | Tel: {selectedHuesped.telefono}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn-airbnb-primary"
                      style={{ marginTop: 0, flex: 1 }}
                      onClick={() => { setShowGuestAuthModal(false); setActiveTab('reservar'); }}
                    >
                      Ir a Reservar
                    </button>
                    <button
                      type="button"
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                      onClick={() => { setSelectedHuesped(null); setGuestRegJustCreated(false); setGuestAuthTab('login'); }}
                    >
                      Cambiar Perfil
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* PESTAÑAS SWITCHER (YA TENGO REGISTRO / CREAR CUENTA NUEVA) */}
                  <div className="airbnb-tab-switcher">
                    <button
                      type="button"
                      className={`airbnb-tab-btn ${guestAuthTab === 'login' ? 'active' : ''}`}
                      onClick={() => { setGuestAuthTab('login'); setGuestSearchError(null); }}
                    >
                      <Search size={14} /> Ya tengo registro
                    </button>
                    <button
                      type="button"
                      className={`airbnb-tab-btn ${guestAuthTab === 'registro' ? 'active' : ''}`}
                      onClick={() => { setGuestAuthTab('registro'); setGuestSearchError(null); }}
                    >
                      <UserPlus size={14} /> Crear cuenta nueva
                    </button>
                  </div>

                  {guestAuthTab === 'login' ? (
                    <form onSubmit={handleGuestSearchSubmit} style={{ marginTop: '1rem' }}>
                      <div className="form-field">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                          Número de Documento o Correo Electrónico
                        </label>
                        <div className="field-input-wrap">
                          <FileText className="field-icon" size={16} />
                          <input
                            type="text"
                            placeholder="Ej: 1017283944 o correo@ejemplo.com"
                            value={guestSearchQuery}
                            onChange={(e) => setGuestSearchQuery(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="form-field" style={{ marginTop: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', margin: 0 }}>
                            Contraseña
                          </label>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                            onClick={() => {
                              setGuestRecuperarQuery(guestSearchQuery);
                              setGuestAuthTab('recuperar');
                              setGuestSearchError(null);
                              setGuestRecuperarSuccess(null);
                            }}
                          >
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>
                        <div className="field-input-wrap">
                          <Lock className="field-icon" size={16} />
                          <input
                            type={showGuestPassword ? "text" : "password"}
                            placeholder="Ingrese su contraseña"
                            value={guestLoginPassword}
                            onChange={(e) => setGuestLoginPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowGuestPassword(!showGuestPassword)}
                            style={{ background: 'none', border: 'none', padding: '0 0.5rem', color: '#64748b', cursor: 'pointer' }}
                          >
                            {showGuestPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {guestSearchError && (
                        <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.68rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', margin: '0.8rem 0' }}>
                          ⚠️ {guestSearchError}
                        </div>
                      )}

                      <button type="submit" className="btn-airbnb-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Verificando...' : 'Iniciar Sesión y Continuar'}
                      </button>

                      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => { setGuestAuthTab('registro'); setGuestSearchError(null); }}
                        >
                          ¿Es tu primera vez? Regístrate aquí
                        </button>
                      </div>
                    </form>
                  ) : guestAuthTab === 'recuperar' ? (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                        <div style={{ width: '48px', height: '48px', background: '#fff1f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem' }}>
                          <KeyRound size={24} color="#e11d48" />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
                          Recuperar Contraseña
                        </h4>
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: '1.4' }}>
                          Ingrese su número de documento o correo electrónico. Le enviaremos las instrucciones de restablecimiento.
                        </p>
                      </div>

                      {guestRecuperarSuccess ? (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', textAlign: 'center', marginBottom: '1rem' }}>
                          <p style={{ margin: '0 0 0.8rem', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                            {guestRecuperarSuccess}
                          </p>

                          <form onSubmit={handleGuestRestablecerSubmit} style={{ marginTop: '0.8rem', textAlign: 'left' }}>
                            <div className="form-field">
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                                Crear Nueva Contraseña
                              </label>
                              <div className="field-input-wrap">
                                <Lock className="field-icon" size={16} />
                                <input
                                  type={showGuestPassword ? "text" : "password"}
                                  placeholder="Ingrese su nueva contraseña"
                                  value={guestNuevaPassword}
                                  onChange={(e) => setGuestNuevaPassword(e.target.value)}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowGuestPassword(!showGuestPassword)}
                                  style={{ background: 'none', border: 'none', padding: '0 0.5rem', color: '#64748b', cursor: 'pointer' }}
                                >
                                  {showGuestPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                            <button type="submit" className="btn-airbnb-primary" disabled={loading} style={{ marginTop: '0.8rem' }}>
                              {loading ? 'Actualizando...' : 'Restablecer e Iniciar Sesión →'}
                            </button>
                          </form>
                        </div>
                      ) : (
                        <form onSubmit={handleGuestRecuperarSubmit}>
                          <div className="form-field">
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                              Documento o Correo Registrado
                            </label>
                            <div className="field-input-wrap">
                              <Mail className="field-icon" size={16} />
                              <input
                                type="text"
                                placeholder="Ej: 1017283944 o correo@ejemplo.com"
                                value={guestRecuperarQuery}
                                onChange={(e) => setGuestRecuperarQuery(e.target.value)}
                                required
                                autoFocus
                              />
                            </div>
                          </div>

                          {guestSearchError && (
                            <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.68rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', margin: '0.8rem 0' }}>
                              ⚠️ {guestSearchError}
                            </div>
                          )}

                          <button type="submit" className="btn-airbnb-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                            {loading ? 'Enviando correo...' : 'Enviar Instrucciones de Recuperación'}
                          </button>

                          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button
                              type="button"
                              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                              onClick={() => { setGuestAuthTab('login'); setGuestSearchError(null); }}
                            >
                              ← Volver al Inicio de Sesión
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleUserSubmit} style={{ marginTop: '0.8rem' }}>
                      <div style={{ marginBottom: '1.2rem', borderBottom: '1px solid #f1f5f9', pb: '0.8rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                          Ahora creemos tu cuenta
                        </h4>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                          Esta información es obligatoria para reservar o hospedarte en Apartamentos Facile.
                        </p>
                      </div>

                      {guestSearchError && (
                        <div style={{ color: '#991b1b', background: '#fee2e2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                          ⚠️ {guestSearchError}
                          <div style={{ marginTop: '0.4rem' }}>
                            <button
                              type="button"
                              style={{ background: '#ffffff', border: '1px solid #f87171', color: '#991b1b', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                              onClick={() => {
                                setGuestSearchQuery(formData.documento || formData.correo || '');
                                setGuestAuthTab('login');
                                setGuestSearchError(null);
                              }}
                            >
                              🔑 Iniciar Sesión con mis datos →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 1. NOMBRE LEGAL OFICIAL */}
                      <div style={{ marginBottom: '0.8rem' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Nombre legal oficial
                        </label>
                        <div className="form-row-2">
                          <div className="form-field">
                            <div className="field-input-wrap">
                              <FileText className="field-icon" size={16}/>
                              <input
                                type="text"
                                placeholder="Nombre(s)"
                                value={nombreLegal}
                                onChange={(e) => setNombreLegal(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="form-field">
                            <div className="field-input-wrap">
                              <FileText className="field-icon" size={16}/>
                              <input
                                type="text"
                                placeholder="Apellido(s)"
                                value={apellidoLegal}
                                onChange={(e) => setApellidoLegal(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="airbnb-field-note">
                          Asegúrate de que coincida con el nombre que aparece en tu documento de identidad oficial.
                        </div>
                      </div>

                      {/* 2. DOCUMENTO DE IDENTIDAD Y TELÉFONO */}
                      <div className="form-row-2" style={{ marginBottom: '0.8rem' }}>
                        <div className="form-field">
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            Documento (Cédula/Pasaporte)
                          </label>
                          <div className="field-input-wrap">
                            <ShieldCheck className="field-icon" size={16}/>
                            <input
                              type="text"
                              name="documento"
                              value={formData.documento}
                              onChange={handleUserChange}
                              placeholder="Ej: 1017283944"
                              maxLength={15}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-field">
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            Teléfono de contacto
                          </label>
                          <div className="field-input-wrap">
                            <Phone className="field-icon" size={16}/>
                            <input
                              type="text"
                              name="telefono"
                              value={formData.telefono}
                              onChange={handleUserChange}
                              placeholder="Ej: 3154449876"
                              maxLength={15}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. FECHA DE NACIMIENTO */}
                      <div className="form-field" style={{ marginBottom: '0.8rem' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Fecha de nacimiento
                        </label>
                        <div className="field-input-wrap">
                          <Calendar className="field-icon" size={16}/>
                          <input
                            type="date"
                            value={fechaNacimiento}
                            onChange={(e) => setFechaNacimiento(e.target.value)}
                            required
                          />
                        </div>
                        <div className="airbnb-field-note">
                          Debes tener al menos 18 años para registrarte en BookingSoft.
                        </div>
                      </div>

                      {/* 4. CORREO Y CONTRASEÑA */}
                      <div className="form-row-2" style={{ marginBottom: '0.8rem' }}>
                        <div className="form-field">
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            Correo electrónico
                          </label>
                          <div className="field-input-wrap">
                            <Mail className="field-icon" size={16}/>
                            <input
                              type="email"
                              name="correo"
                              value={formData.correo}
                              onChange={handleUserChange}
                              placeholder="correo@ejemplo.com"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-field">
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            Contraseña
                          </label>
                          <div className="field-input-wrap">
                            <Lock className="field-icon" size={16}/>
                            <input
                              type={showGuestPassword ? "text" : "password"}
                              name="password"
                              value={formData.password || ''}
                              onChange={handleUserChange}
                              placeholder="Crear contraseña"
                            />
                            <button
                              type="button"
                              onClick={() => setShowGuestPassword(!showGuestPassword)}
                              style={{ background: 'none', border: 'none', padding: '0 0.5rem', color: '#64748b', cursor: 'pointer' }}
                            >
                              {showGuestPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="airbnb-field-note" style={{ marginBottom: '0.8rem' }}>
                        Te enviaremos las confirmaciones de viaje y los recibos por correo electrónico.
                      </div>

                      {/* 5. PREFERENCIAS MARKETING */}
                      <label className="airbnb-checkbox-row">
                        <input
                          type="checkbox"
                          checked={marketingOptOut}
                          onChange={(e) => setMarketingOptOut(e.target.checked)}
                        />
                        <span>No quiero recibir mensajes promocionales de BookingSoft Apartamentos Facile.</span>
                      </label>

                      {/* 6. ACEPTACIÓN LEGAL Y DISCLAIMER COLOMBIA (LEY 1581) */}
                      <div className="airbnb-legal-disclaimer">
                        Al seleccionar <strong>Aceptar y continuar</strong>, acepto los{' '}
                        <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('terminos')}>
                          Términos del servicio
                        </button>, los{' '}
                        <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('pagos')}>
                          Términos de pago del servicio
                        </button>, la{' '}
                        <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('discriminacion')}>
                          Política contra la discriminación
                        </button>{' '}
                        y el{' '}
                        <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('ley1581')}>
                          Suplemento de Privacidad para Colombia (Ley 1581 de 2012)
                        </button>{' '}
                        y reconozco la{' '}
                        <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('privacidad')}>
                          Política de privacidad
                        </button>{' '}
                        de Apartahotel Facile y BookingSoft.
                      </div>

                      <label className="airbnb-checkbox-row" style={{ marginBottom: '1.2rem' }}>
                        <input
                          type="checkbox"
                          checked={habeasData}
                          onChange={(e) => setHabeasData(e.target.checked)}
                        />
                        <span><strong>Autorizo expresamente</strong> el tratamiento de mis datos personales según la Ley 1581 de 2012 de Colombia.</span>
                      </label>

                      <button type="submit" className="btn-airbnb-primary" disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Aceptar y continuar'}
                      </button>
                    </form>
                  )}

                  {/* SECCIÓN DE AUTENTICACIÓN SOCIAL (GOOGLE Y APPLE) AL FINAL */}
                  {guestAuthTab !== 'recuperar' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', margin: '1.2rem 0 0.8rem', gap: '0.8rem' }}>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>o</span>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                          type="button"
                          className="btn-social-auth"
                          style={{ flex: 1, padding: '0.65rem' }}
                          onClick={() => {
                            const demoEmail = 'huesped_google@ejemplo.com';
                            setGuestSearchQuery(demoEmail);
                            setAlert({ type: 'success', message: '¡Autenticado mediante Google! Complete su reserva.' });
                            const gUser = huespedes.find(h => h.correo === demoEmail) || {
                              id_huesped: 99,
                              nombre: 'Usuario Google Demo',
                              documento: 'GOOGLE-12345',
                              telefono: '3001234567',
                              correo: demoEmail
                            };
                            setSelectedHuesped(gUser);
                            setShowGuestAuthModal(false);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          Google
                        </button>

                        <button
                          type="button"
                          className="btn-social-auth"
                          style={{ flex: 1, padding: '0.65rem' }}
                          onClick={() => {
                            const demoEmail = 'huesped_apple@icloud.com';
                            setGuestSearchQuery(demoEmail);
                            setAlert({ type: 'success', message: '¡Autenticado mediante Apple ID! Complete su reserva.' });
                            const aUser = huespedes.find(h => h.correo === demoEmail) || {
                              id_huesped: 98,
                              nombre: 'Usuario Apple Demo',
                              documento: 'APPLE-67890',
                              telefono: '3159876543',
                              correo: demoEmail
                            };
                            setSelectedHuesped(aUser);
                            setShowGuestAuthModal(false);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.1-1.9 0.98-3.01-1 .04-2.18.67-2.88 1.49-.62.72-1.16 1.87-1.01 2.97 1.12.09 2.26-.66 2.91-1.45z"/>
                          </svg>
                          Apple
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL INTERMEDIO: COMPROMISO DE LA COMUNIDAD (ESTILO AIRBNB)
          ========================================================================= */}
      {showCommunityCommitmentModal && (
        <div className="modal-backdrop" onClick={() => setShowCommunityCommitmentModal(false)}>
          <div className="modal-community-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <div style={{ width: '56px', height: '56px', background: '#fff1f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
                <Heart size={28} color="#e11d48" />
              </div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.3rem' }}>
                Nuestro compromiso de la comunidad
              </p>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                Este es un lugar para todo el mundo 🏨
              </h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.2rem' }}>
              En <strong>BookingSoft Apartamentos Facile</strong> nos comprometemos a construir una comunidad hospitalaria, segura e inclusiva. Para garantizarlo, te pedimos que aceptes nuestro compromiso:
            </p>

            <div style={{ background: '#f8fafc', borderLeft: '4px solid #e11d48', padding: '1rem 1.2rem', borderRadius: '8px', fontSize: '0.86rem', color: '#1e293b', lineHeight: '1.5', marginBottom: '1.5rem', fontWeight: 500 }}>
              "Trataré a todos en la comunidad de Apartamentos Facile con respeto y sin prejuicios, sin importar la raza, religión, nacionalidad, etnia, color de piel, discapacidad, sexo, identidad de género u orientación sexual."
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                type="button"
                className="btn-airbnb-primary"
                style={{ margin: 0 }}
                onClick={() => {
                  setShowCommunityCommitmentModal(false);
                  setActiveTab('reservar');
                  setAlert({ type: 'success', message: '¡Gracias por aceptar el compromiso de la comunidad! Ya puedes confirmar tu reserva.' });
                }}
              >
                Aceptar y continuar →
              </button>
              <button
                type="button"
                style={{ background: 'none', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '12px', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => {
                  setShowCommunityCommitmentModal(false);
                  setSelectedHuesped(null);
                  setAlert({ type: 'info', message: 'Debes aceptar el compromiso de la comunidad para reservar.' });
                }}
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LEGAL INTERACTIVO NATIVO (TÉRMINOS Y POLÍTICAS PROPIAS FACILE & BOOKINGSOFT) */}
      {renderModalLegal()}
    </div>
  );
}

export default App;
