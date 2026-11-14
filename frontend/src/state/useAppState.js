import { useState, useEffect } from 'react';
import { apiFetch, formatErrorMessage } from '../api/client.js';
import { CATALOGO_HABITACIONES_INICIAL } from '../data/catalogo.js';
import {
  ArrowRight, Check
} from 'lucide-react';

export function useAppState() {
  // ---- ESTADO DEL MODO DE CONEXIÓN ----
  const [backendActivo, setBackendActivo] = useState(false);

  // ---- ESTADO DE DATOS ----
  const [huespedes, setHuespedes] = useState([
    { id_huesped: 1, nombre: 'John Doe', documento: '12345678', telefono: '3115551234', correo: 'john.doe@example.com', lealtad: 'Silver', estado: 'Activo' },
    { id_huesped: 2, nombre: 'Sofía Restrepo', documento: '98765432', telefono: '3126667890', correo: 'sofia.restrepo@bancolombia.com.co', lealtad: 'Gold', estado: 'Activo' },
    { id_huesped: 3, nombre: 'Thomas Miller', documento: 'PP998877', telefono: '+155589012', correo: 'thomas.miller@siemens.com', lealtad: 'Platinum', estado: 'Activo' }
  ]);
  const [habitaciones, setHabitaciones] = useState(CATALOGO_HABITACIONES_INICIAL);
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

  // ---- ESTADOS DE PERFIL DE HUÉSPED ESTILO AIRBNB ----
  const [guestProfileExtras, setGuestProfileExtras] = useState(() => {
    try {
      const saved = localStorage.getItem('bookingsoft_guest_profile_extras');
      return saved ? JSON.parse(saved) : {
        dedico: 'Ingeniero de Software / Consultor',
        estudie: 'Universidad / SENA',
        destino: 'Kioto, Japón',
        mascotas: 'Un perro golden retriever',
        decada: 'Años 90',
        tiempo: 'Aprender nuevas tecnologías',
        cancion: 'Clásicos del rock en español',
        habilidad: 'Hacer café perfecto',
        idiomas: 'Español, Inglés',
        dato_curioso: 'Me encanta la gastronomía colombiana',
        amo: 'Viajar los fines de semana y el café de origen',
        biografia: 'El camino del aprendizaje y nuevos destinos'
      };
    } catch {
      return {};
    }
  });
  const [guestAvatarUrl, setGuestAvatarUrl] = useState(() => {
    try {
      return localStorage.getItem('bookingsoft_guest_avatar') || '';
    } catch {
      return '';
    }
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

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
  const [filtroTipoApto, setFiltroTipoApto] = useState('todas'); // 'todas' | 'Dúplex' | 'Dobles' | 'Familiares' | 'Habitaciones'
  const [lightboxIdx, setLightboxIdx] = useState(null); // visor de imágenes de la galería
  const [aptoLightboxPhoto, setAptoLightboxPhoto] = useState(null); // { photos: [...], index: n } o photo object
  const [lightboxZoom, setLightboxZoom] = useState(false); // Estado de zoom 1.65x interactivo para imágenes en Lightbox
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
  // HU-005 / CA-005.2: check-in directo al crear la reserva en recepción (walk-in).
  const [walkinCheckinInmediato, setWalkinCheckinInmediato] = useState(false);

  // ---- ESTADO DE SUB-PESTAÑAS INDIVIDUALES EN EL PANEL PMS ----
  const [pmsSubTab, setPmsSubTab] = useState('recepcion'); // 'recepcion' | 'huespedes' | 'reservas' | 'planta' | 'coworking' | 'todos'

  // Formatear errores de FastAPI

  // Iniciar sesión contra /api/auth/login
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      const res = await apiFetch(`/api/auth/login`, {method: 'POST', body: {
          usuario: loginForm.usuario.trim(),
          contrasena: loginForm.contrasena,
        }});

      const data = res.data;

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
      // Fallback local si backend está en segundo plano o desconectado
      const u = loginForm.usuario.trim();
      const p = loginForm.contrasena;
      if ((u === 'admin' || u === 'bookingsoft_admin') && p === 'Admin2026!') {
        setUsuarioSesion({ usuario: u, nombre: 'Administrador BookingSoft', rol: 'Administrador' });
        setShowLoginModal(false);
        setLoginForm({ usuario: '', contrasena: '' });
        setActiveTab('pms');
        setPmsSubTab('empleados');
        setAlert({ type: 'success', message: '¡Sesión iniciada con éxito como Administrador!' });
      } else if ((u === 'recepcion' || u === 'carlos_recep') && p === 'Recep2026!') {
        setUsuarioSesion({ usuario: u, nombre: 'Carlos Recepción', rol: 'Recepcionista 24h' });
        setShowLoginModal(false);
        setLoginForm({ usuario: '', contrasena: '' });
        setActiveTab('pms');
        setPmsSubTab('recepcion');
        setAlert({ type: 'success', message: '¡Sesión iniciada con éxito como Recepcionista 24h!' });
      } else if ((u === 'amallaves' || u === 'marta_limpieza') && (p === 'Amallaves2026!' || p === 'marta123')) {
        setUsuarioSesion({ usuario: u, nombre: 'Marta Ama de Llaves', rol: 'Ama de llaves' });
        setShowLoginModal(false);
        setLoginForm({ usuario: '', contrasena: '' });
        setActiveTab('pms');
        setPmsSubTab('planta');
        setAlert({ type: 'success', message: '¡Sesión iniciada con éxito como Ama de llaves!' });
      } else if ((u === 'mantenimiento' || u === 'jhon_mantenimiento') && p === 'Mantenimiento2026!') {
        setUsuarioSesion({ usuario: u, nombre: 'Jhon Mantenimiento', rol: 'Personal de mantenimiento' });
        setShowLoginModal(false);
        setLoginForm({ usuario: '', contrasena: '' });
        setActiveTab('pms');
        setPmsSubTab('planta');
        setAlert({ type: 'success', message: '¡Sesión iniciada con éxito como Mantenimiento!' });
      } else {
        setLoginError('Credenciales incorrectas o servidor no disponible.');
      }
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
        // El inventario exige rol (H-02); la comprobación de disponibilidad usa /health.
        const res = await apiFetch(`/health`, {timeoutMs: 2000});
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          setBackendActivo(true);
        } else {
          setBackendActivo(false);
        }
      } catch {
        setBackendActivo(false);
      }
    };
    verificarBackend();
  }, []);

  // Sincronizar navegación con el historial del navegador para evitar pantalla en blanco al dar Atrás
  useEffect(() => {
    try {
      window.history.replaceState({ tab: 'apartamentos' }, '', window.location.href);
    } catch {}

    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        setActiveTab('apartamentos');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navegarATab = (tab) => {
    setActiveTab(tab);
    try {
      window.history.pushState({ tab }, '', window.location.href);
    } catch {}
  };

  // Cargar datos
  const cargarDatosBackend = async (token = authToken) => {
    try {
      // H-02: el inventario completo exige rol operativo. Sin sesión (o sin rol)
      // se cae al catálogo público, que omite los datos internos de mantenimiento.
      const fetchHabitaciones = async () => {
        const res = await apiFetch(`/api/habitaciones`, {token: token});
        if (res.status === 401 || res.status === 403) {
          return apiFetch(`/api/habitaciones/publicas`);
        }
        return res;
      };

      const [gRes, hRes, rRes, eRes, rnRes, empRes] = await Promise.all([
        apiFetch(`/api/huespedes`, {token: token}),
        fetchHabitaciones(),
        apiFetch(`/api/reservas`, {token: token}),
        apiFetch(`/api/centro-negocios/espacios`),
        apiFetch(`/api/centro-negocios/reservas`),
        token ? apiFetch(`/api/empleados`, {token: token}) : Promise.resolve(null),
      ]);
      if (gRes.ok) setHuespedes(gRes.data);
      if (hRes.ok) setHabitaciones(hRes.data);
      if (rRes.ok) setReservas(rRes.data);
      if (eRes.ok) setEspaciosNegocio(eRes.data);
      if (rnRes.ok) setReservasNegocio(rnRes.data);
      if (empRes && empRes.ok) setEmpleadosList(empRes.data);
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
      const hab = habitaciones.find(h => String(h.id_habitacion) === String(reservaData.id_habitacion) || String(h.numero) === String(reservaData.id_habitacion));
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
      const res = await apiFetch(`/api/auth/registro`, {method: 'POST', token: authToken, body: newEmpleadoForm});
      const data = res.data;
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
      const res = await apiFetch(`/api/empleados/${idEmpleado}/rol`, {method: 'PATCH', token: authToken, body: { rol: nuevoRol }});
      const data = res.data;
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
      const res = await apiFetch(`/api/empleados/${emp.id_empleado}/estado`, {method: 'PATCH', token: authToken, body: { estado: nuevoEstado }});
      const data = res.data;
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
      : (formData.nombre || '').trim();

    if (!habeasData) {
      const msg = 'Debe aceptar los Términos del Servicio y la Política de Protección de Datos (Ley 1581 de 2012 de Colombia).';
      setAlert({ type: 'error', message: msg });
      setGuestSearchError(msg);
      return;
    }
    if (!nombreCompletoFinal || !(formData.documento || '').trim() || !(formData.telefono || '').trim() || !(formData.correo || '').trim()) {
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
        const res = await apiFetch(`/api/user/registro`, {method: 'POST', token: authToken, body: payload});
        const data = res.data;
        if (res.ok) {
          const nuevoUsuario = data.usuario;
          setSelectedHuesped(nuevoUsuario);
          setGuestRegJustCreated(true);
          setShowGuestAuthModal(false); // Cierra modal de login/registro
          setShowCommunityCommitmentModal(true); // Despliega el Compromiso de la Comunidad (Airbnb)

          // Si el usuario ya había seleccionado apartamento y fechas, crear la reserva automáticamente
          if (reservaData.id_habitacion && reservaData.fecha_entrada && reservaData.fecha_salida) {
            try {
              const resReserva = await apiFetch(`/api/reservas`, {method: 'POST', token: authToken, body: {
                  id_huesped: nuevoUsuario.id_huesped,
                  id_habitacion: parseInt(reservaData.id_habitacion),
                  fecha_entrada: reservaData.fecha_entrada,
                  fecha_salida: reservaData.fecha_salida,
                  numero_personas: parseInt(reservaData.numero_personas || 1)
                }});
              const dataReserva = resReserva.data;
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
        const res = await apiFetch(`/api/user/login`, {method: 'POST', body: {
            documento_o_correo: q,
            password: guestLoginPassword.trim() || undefined
          }});
        const data = res.data;
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
        // Fallback local si backend no responde o está offline
        const encontrado = huespedes.find(h => 
          (h.documento && h.documento.toLowerCase() === q.toLowerCase()) ||
          (h.correo && h.correo.toLowerCase() === q.toLowerCase()) ||
          (h.telefono && h.telefono.toLowerCase() === q.toLowerCase())
        );
        if (encontrado) {
          setSelectedHuesped(encontrado);
          setShowGuestAuthModal(false);
          setGuestSearchQuery('');
          setGuestLoginPassword('');
          setAlert({ type: 'success', message: `¡Bienvenido de nuevo, ${encontrado.nombre}!` });
        } else {
          setGuestSearchError('No encontramos un registro con estos datos. Regístrese en la opción "Crear cuenta nueva".');
        }
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
        setAlert({ type: 'success', message: `¡Bienvenido de nuevo, ${encontrado.nombre}!` });
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
        const res = await apiFetch(`/api/user/recuperar-password`, {method: 'POST', body: { correo_o_documento: q }});
        const data = res.data;
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
        const res = await apiFetch(`/api/user/restablecer-password`, {method: 'POST', body: {
            correo_o_documento: guestRecuperarQuery.trim(),
            nueva_password: guestNuevaPassword.trim()
          }});
        const data = res.data;
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
      setReservaData(prev => ({ ...prev, id_habitacion: String(habDispo.id_habitacion || habDispo.numero) }));
    }
    if (!selectedHuesped) {
      setShowGuestAuthModal(true);
    } else {
      navegarATab('reservar');
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
      setReservaAlert({ type: 'error', message: 'Debe seleccionar un apartamento o espacio de coworking.' });
      return;
    }

    if (String(reservaData.id_habitacion).startsWith('coworking-')) {
      const espId = parseInt(String(reservaData.id_habitacion).replace('coworking-', ''));
      const espacioSel = espaciosNegocio.find(esp => esp.id_espacio === espId);

      let huespedDestino = selectedHuesped;
      if (!huespedDestino && pmsWalkInGuest.documento) {
        huespedDestino = huespedes.find(h => h.documento === (pmsWalkInGuest.documento || '').trim());
      }

      if (!huespedDestino) {
        setReservaAlert({ type: 'error', message: 'Debe iniciar sesión o seleccionar un huésped primero.' });
        return;
      }

      const hInicio = reservaNegocioForm.hora_inicio || '09:00';
      const hFin = reservaNegocioForm.hora_fin || '11:00';
      if (hFin <= hInicio) {
        setReservaAlert({ type: 'error', message: 'La hora de fin debe ser posterior a la de inicio.' });
        return;
      }

      setLoading(true);
      setReservaAlert(null);

      try {
        const res = await apiFetch(`/api/centro-negocios/reservas`, {method: 'POST', token: authToken, body: {
            id_espacio: espId,
            tipo_cliente: 'Huésped Registrado',
            id_huesped: huespedDestino.id_huesped,
            nombre_cliente: huespedDestino.nombre,
            documento_cliente: huespedDestino.documento || null,
            correo_cliente: huespedDestino.correo || null,
            fecha: reservaNegocioForm.fecha || new Date().toISOString().split('T')[0],
            hora_inicio: hInicio,
            hora_fin: hFin,
            observaciones: reservaNegocioForm.observaciones || null,
          }});
        const data = res.data;
        if (res.ok) {
          setReservaAlert({
            type: 'success',
            message: data.message || `✓ ¡Reserva de ${espacioSel?.nombre || 'espacio'} confirmada exitosamente!`
          });
          setReservaData(prev => ({ ...prev, id_habitacion: '' }));
          setReservaNegocioForm({ id_espacio: '', tipo_cliente: 'Huésped Registrado', id_huesped: '', nombre_cliente: '', documento_cliente: '', fecha: new Date().toISOString().split('T')[0], hora_inicio: '09:00', hora_fin: '11:00', observaciones: '' });
          cargarDatosBackend(authToken);
        } else {
          setReservaAlert({ type: 'error', message: formatErrorMessage(data.detail) });
        }
      } catch {
        setReservaAlert({ type: 'error', message: 'Error de conexión al reservar espacio de coworking.' });
      }
      setLoading(false);
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
      const q = (pmsWalkInGuest.documento || '').trim();
      const existente = huespedes.find(h => 
        (q && h.documento && (h.documento || '').trim() === q) || 
        (pmsWalkInGuest.correo && h.correo && (h.correo || '').toLowerCase() === (pmsWalkInGuest.correo || '').trim().toLowerCase())
      );
      if (existente) {
        huespedDestino = existente;
        setSelectedHuesped(existente);
      } else if ((pmsWalkInGuest.nombre || '').trim() && (pmsWalkInGuest.documento || '').trim()) {
        if (!(pmsWalkInGuest.telefono || '').trim() || !(pmsWalkInGuest.correo || '').trim()) {
          setReservaAlert({ type: 'error', message: 'Nombre, documento, teléfono y correo son obligatorios para registrar al nuevo huésped.' });
          setLoading(false);
          return;
        }
        if (backendActivo) {
          try {
            const resReg = await apiFetch(`/api/user/registro`, {method: 'POST', body: {
                nombre: (pmsWalkInGuest.nombre || '').trim(),
                documento: (pmsWalkInGuest.documento || '').trim(),
                telefono: (pmsWalkInGuest.telefono || '').trim(),
                correo: (pmsWalkInGuest.correo || '').trim(),
                empresa: `Walk-in (${pmsWalkInGuest.tipo_documento || 'Cédula'})`,
                password: (pmsWalkInGuest.documento || '').trim()
              }});
            const dataReg = resReg.data;
            if (resReg.ok) {
              huespedDestino = dataReg.usuario;
              setSelectedHuesped(huespedDestino);
            } else {
              // Si el usuario ya existía en backend por documento/correo
              const qStr = (pmsWalkInGuest.documento || '').trim() || (pmsWalkInGuest.correo || '').trim();
              const existenteBk = huespedes.find(h => 
                (h.documento && h.documento === qStr) || 
                (h.correo && (h.correo || '').toLowerCase() === qStr.toLowerCase())
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
            nombre: (pmsWalkInGuest.nombre || '').trim(),
            documento: (pmsWalkInGuest.documento || '').trim(),
            telefono: (pmsWalkInGuest.telefono || '').trim(),
            correo: (pmsWalkInGuest.correo || '').trim(),
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
        const res = await apiFetch(`/api/reservas`, {method: 'POST', token: authToken, body: {
            id_huesped: huespedDestino.id_huesped,
            id_habitacion: parseInt(reservaData.id_habitacion),
            fecha_entrada: reservaData.fecha_entrada,
            fecha_salida: reservaData.fecha_salida,
            numero_personas: parseInt(reservaData.numero_personas || 1),
            // HU-005 / CA-005.2: check-in directo (solo recepción; el backend exige rol operativo).
            checkin_inmediato: walkinCheckinInmediato,
          }});
        const data = res.data;
        if (res.ok) {
          if (data.reserva) {
            setReservas(prev => [data.reserva, ...prev]);
          }
          setReservaAlert({
            type: 'success',
            message: walkinCheckinInmediato
              ? `✓ Check-in directo registrado para ${huespedDestino.nombre} (Doc: ${huespedDestino.documento}).`
              : `¡Reserva presencial confirmada exitosamente para ${huespedDestino.nombre} (Doc: ${huespedDestino.documento})!`,
            data
          });
          setWalkinCheckinInmediato(false);
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
        const res = await apiFetch(`/api/huespedes/${h.id_huesped}/estado`, {method: 'PATCH', token: authToken, body: { estado: nuevoEstado }});
        const data = res.data;
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
        const res = await apiFetch(`/api/huespedes/${id_huesped}`, {method: 'DELETE', token: authToken});
        const data = res.data;
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
        const res = await apiFetch(`/api/reservas/${id_reserva}`, {method: 'DELETE', token: authToken});
        const data = res.data;
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

  // HU-005 — Check-in / Check-out de la reserva (PMS > Reservas)
  const handleCambiarEstadoReserva = async (id_reserva, nuevoEstado) => {
    const esCheckIn = nuevoEstado === 'Check-In';
    const etiqueta = esCheckIn ? 'check-in' : 'check-out';
    if (!window.confirm(`¿Confirmar el ${etiqueta} de la reserva #${id_reserva}?`)) return;

    setLoading(true);
    if (backendActivo) {
      try {
        const res = await apiFetch(`/api/reservas/${id_reserva}/estado`, {
          method: 'PATCH',
          token: authToken,
          body: { estado: nuevoEstado }
        });
        const data = res.data;
        if (res.ok) {
          // Refresca reservas y habitaciones: la unidad cambia de 'Ocupada' a 'En limpieza'.
          setReservas(prev => prev.map(r => (
            r.id_reserva === id_reserva
              ? { ...r, ...(data.reserva || {}) }
              : r
          )));
          setReservaAlert({ type: 'success', message: data.message || `✓ ${etiqueta} registrado.` });
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
        const res = await apiFetch(`/api/habitaciones/${id_habitacion}/estado`, {method: 'PATCH', token: authToken, body: { estado: nuevoEstado, detalle_mantenimiento: detalleMantenimiento }});
        const data = res.data;
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
      const res = await apiFetch(`/api/centro-negocios/reservas`, {method: 'POST', token: authToken, body: {
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
        }});
      const data = res.data;
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
    const query = docValue ? docValue.trim() : (pmsWalkInGuest.documento || '').trim();
    if (!query) return;
    const found = huespedes.find(h => h.documento && (h.documento || '').trim() === query);
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
      const res = await apiFetch(`/api/centro-negocios/reservas/${id_reserva_negocio}`, {method: 'DELETE', token: authToken});
      const data = res.data;
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

  return {
    backendActivo, setBackendActivo, huespedes, setHuespedes, habitaciones, setHabitaciones,
    reservas, setReservas, espaciosNegocio, setEspaciosNegocio, reservasNegocio, setReservasNegocio,
    reservaNegocioForm, setReservaNegocioForm, reservaNegocioAlert, setReservaNegocioAlert, activeTab, setActiveTab,
    formData, setFormData, habeasData, setHabeasData, selectedHuesped, setSelectedHuesped,
    guestProfileExtras, setGuestProfileExtras, guestAvatarUrl, setGuestAvatarUrl, profileSavedMsg, setProfileSavedMsg,
    empleadosList, setEmpleadosList, newEmpleadoForm, setNewEmpleadoForm, showCreateEmpleadoModal, setShowCreateEmpleadoModal,
    empleadoAlert, setEmpleadoAlert, reservaData, setReservaData, cotizacion, setCotizacion,
    calDate, setCalDate, loading, setLoading, alert, setAlert,
    reservaAlert, setReservaAlert, filtroHabitaciones, setFiltroHabitaciones, galleryFilter, setGalleryFilter,
    filtroTipoApto, setFiltroTipoApto, lightboxIdx, setLightboxIdx, aptoLightboxPhoto, setAptoLightboxPhoto,
    lightboxZoom, setLightboxZoom, aptoActivePhoto, setAptoActivePhoto, selectedAptoFigma, setSelectedAptoFigma,
    authToken, setAuthToken, usuarioSesion, setUsuarioSesion, showLoginModal, setShowLoginModal,
    loginForm, setLoginForm, loginError, setLoginError, showGuestAuthModal, setShowGuestAuthModal,
    guestAuthTab, setGuestAuthTab, guestSearchQuery, setGuestSearchQuery, guestLoginPassword, setGuestLoginPassword,
    showGuestPassword, setShowGuestPassword, guestSearchError, setGuestSearchError, guestRegJustCreated, setGuestRegJustCreated,
    guestRecuperarQuery, setGuestRecuperarQuery, guestRecuperarSuccess, setGuestRecuperarSuccess, guestNuevaPassword, setGuestNuevaPassword,
    showCommunityCommitmentModal, setShowCommunityCommitmentModal, nombreLegal, setNombreLegal, apellidoLegal, setApellidoLegal,
    fechaNacimiento, setFechaNacimiento, marketingOptOut, setMarketingOptOut, showGuestMenuDropdown, setShowGuestMenuDropdown,
    modalLegalTipo, setModalLegalTipo, pmsWalkInMode, setPmsWalkInMode, pmsWalkInGuest, setPmsWalkInGuest,
    pmsSubTab, setPmsSubTab, formatErrorMessage, handleLoginSubmit, handleLogout, navegarATab,
    cargarDatosBackend, handleCreateEmpleadoSubmit, handleChangeEmpleadoRol, handleToggleEmpleadoEstado, handleUserChange, handleReservaChange,
    handleUserSubmit, handleGuestSearchSubmit, handleGuestRecuperarSubmit, handleGuestRestablecerSubmit, handleReservarTipo, handlePmsWalkInGuestChange,
    handleReservaSubmit, handleSelectApartamentoCatalog, handleToggleEstadoHuesped, handleSelectHuesped, handleDeleteHuesped, handleDeleteReserva,
    handleCambiarEstadoReserva, walkinCheckinInmediato, setWalkinCheckinInmediato,
    handleCambiarEstadoHabitacion, handleReportarDano, handleCrearReservaNegocio, handleBuscarHuespedPorDocumento, handleCancelarReservaNegocio
  };
}
