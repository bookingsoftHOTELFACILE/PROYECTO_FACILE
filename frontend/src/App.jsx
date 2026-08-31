import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, Mail, Phone, FileText, Briefcase, Users, AlertCircle, Calendar, Home, ListOrdered, Wifi, WifiOff, LogIn, LogOut, Lock, User, Trash2 } from 'lucide-react';

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
const API_URL = '';

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
        // Decodificar el payload del token JWT para conocer el rol
        let rol = 'Empleado';
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          rol = payload.rol || 'Empleado';
        } catch {
          // fallback si no se pudo decodificar
        }

        // Mapear nombre visual del usuario
        const nombreMap = {
          sandra_admin: 'Sandra Milena',
          carlos_recep: 'Carlos Pérez',
          marta_limpieza: 'Marta Ama',
        };
        const nombre = nombreMap[loginForm.usuario.trim()] || loginForm.usuario.trim();

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

  // Autenticación inicial automática de respaldo (Recepcionista por defecto)
  const iniciarSesionSemilla = async (usr, pwd, nombre, rol) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usr, contrasena: pwd }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuthToken(data.access_token);
        setUsuarioSesion({ usuario: usr, nombre, rol });
        cargarDatosBackend(data.access_token);
      }
    } catch (e) {
      console.error('Error en auto-login semilla:', e);
    }
  };

  // ---- VERIFICAR SI EL BACKEND ESTÁ ACTIVO Y OBTENER TOKEN INICIAL ----
  useEffect(() => {
    const verificarBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          setBackendActivo(true);
          await iniciarSesionSemilla('carlos_recep', 'Recep2026!', 'Carlos Pérez', 'Recepcionista 24h');
        }
      } catch {
        setBackendActivo(false); // Sin backend → usa simulación
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
      creado_por:         `${usuarioSesion?.nombre || 'Empleado'} (${usuarioSesion?.rol || 'Simulación'})`,
    };

    setReservas(prev => [...prev, nuevaReserva]);
    setReservaAlert({
      type: 'success',
      message: `✅ ¡Reserva confirmada para ${selectedHuesped.nombre} en Apto ${habObj.numero}! (Modo Simulación)`,
      data: { cotizacion: { noches, subtotal, descuento, total } },
    });
    setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
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
      const auditoriaSimulada = `${usuarioSesion?.nombre || 'Empleado'} (${usuarioSesion?.rol || 'Simulación'})`;
      setHuespedes(prev => prev.map(item => item.id_huesped === h.id_huesped ? { ...item, estado: nuevoEstado, modificado_por: auditoriaSimulada } : item));
      setAlert({ type: 'success', message: `Huésped ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} por ${auditoriaSimulada}.` });
      if (selectedHuesped?.id_huesped === h.id_huesped && nuevoEstado === 'Inactivo') {
        setSelectedHuesped(null);
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
          setAlert({ type: 'success', message: 'Huésped eliminado exitosamente.' });
          if (selectedHuesped?.id_huesped === id_huesped) setSelectedHuesped(null);
          cargarDatosBackend(authToken);
        } else {
          setAlert({ type: 'error', message: formatErrorMessage(data.detail) });
        }
      } catch {
        setAlert({ type: 'error', message: 'Error al comunicarse con el servidor.' });
      }
    } else {
      setHuespedes(prev => prev.filter(h => h.id_huesped !== id_huesped));
      if (selectedHuesped?.id_huesped === id_huesped) setSelectedHuesped(null);
      setAlert({ type: 'success', message: 'Huésped eliminado (Modo Simulación).' });
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
