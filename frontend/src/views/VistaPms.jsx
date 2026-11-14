import { useState, useMemo } from 'react';
import {
  UserPlus, ShieldCheck, Users, Calendar, ListOrdered, Trash2,
  Wrench, Check, Search, Tag, Mail, Shield, User, AlertTriangle
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

  // Estados de Búsqueda, Filtros y Paginación para Personal & Roles
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [empRolFilter, setEmpRolFilter] = useState('todos');
  const [empEstadoFilter, setEmpEstadoFilter] = useState('todos');
  const [empCurrentPage, setEmpCurrentPage] = useState(1);
  const EMP_ITEMS_PER_PAGE = 6;

  // Modales de Confirmación de Seguridad antes de aplicar cambios
  const [confirmRolModal, setConfirmRolModal] = useState(null);
  const [confirmEstadoModal, setConfirmEstadoModal] = useState(null);

  // Filtrado reactivo de empleados
  const filteredEmpleados = useMemo(() => {
    return (empleadosList || []).filter(emp => {
      const q = empSearchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        (emp.nombre && emp.nombre.toLowerCase().includes(q)) ||
        (emp.usuario && emp.usuario.toLowerCase().includes(q)) ||
        (emp.numero_documento && String(emp.numero_documento).toLowerCase().includes(q)) ||
        (emp.correo && emp.correo.toLowerCase().includes(q));

      const matchRol = empRolFilter === 'todos' || emp.rol === empRolFilter;
      const matchEstado = empEstadoFilter === 'todos' || emp.estado === empEstadoFilter;

      return matchSearch && matchRol && matchEstado;
    });
  }, [empleadosList, empSearchQuery, empRolFilter, empEstadoFilter]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredEmpleados.length / EMP_ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(empCurrentPage, totalPages);

  const paginatedEmpleados = useMemo(() => {
    const start = (validCurrentPage - 1) * EMP_ITEMS_PER_PAGE;
    return filteredEmpleados.slice(start, start + EMP_ITEMS_PER_PAGE);
  }, [filteredEmpleados, validCurrentPage]);

  // Paletas de iniciales en tonos pastel según el diseño con valores HEX garantizados
  const getAvatarStyle = (index) => {
    const palettes = [
      { bgHex: '#faf5ff', textHex: '#7e22ce', borderHex: '#e9d5ff' }, // Purple
      { bgHex: '#fdf2f8', textHex: '#be185d', borderHex: '#fbcfe8' }, // Pink
      { bgHex: '#fffbeb', textHex: '#b45309', borderHex: '#fde68a' }, // Amber
      { bgHex: '#eff6ff', textHex: '#1d4ed8', borderHex: '#bfdbfe' }, // Blue
      { bgHex: '#ecfdf5', textHex: '#047857', borderHex: '#a7f3d0' }, // Emerald
      { bgHex: '#f1f5f9', textHex: '#334155', borderHex: '#cbd5e1' }, // Slate
    ];
    return palettes[index % palettes.length];
  };

  const getSubinfo = (emp, index) => {
    if (emp.rol === 'Ama de llaves') {
      return index % 2 === 0 ? 'Piso 1-4 • Matutino' : 'Piso 5-8 • Vespertino';
    }
    if (emp.rol === 'Personal de mantenimiento') {
      return 'Áreas comunes & Clima';
    }
    if (emp.rol === 'Recepcionista 24h') {
      return index % 2 === 0 ? 'Front Desk • Diurno' : 'Front Desk • Nocturno';
    }
    if (emp.rol === 'Administrador' || emp.rol === 'Grupo BookingSoft') {
      return 'Soporte Técnico PMS';
    }
    return 'Operativo Facile';
  };

  const getInitials = (nombre) => {
    if (!nombre) return 'EM';
    // Omitir conectores comunes para evitar iniciales erróneas como "AD" en "Ama de Llaves"
    const stopWords = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y']);
    const meaningfulWords = nombre.trim().split(/\s+/).filter(w => !stopWords.has(w.toLowerCase()));
    
    if (meaningfulWords.length >= 2) {
      return (meaningfulWords[0][0] + meaningfulWords[1][0]).toUpperCase();
    }
    if (meaningfulWords.length === 1 && meaningfulWords[0].length >= 2) {
      return meaningfulWords[0].slice(0, 2).toUpperCase();
    }
    const rawParts = nombre.trim().split(/\s+/);
    if (rawParts.length >= 2) {
      return (rawParts[0][0] + rawParts[1][0]).toUpperCase();
    }
    return nombre.trim().slice(0, 2).toUpperCase();
  };

  // Estilos y badges ejecutivos por rol (estándar Cloudbeds & Mews)
  const getRoleBadgeStyle = (rol) => {
    switch (rol) {
      case 'Administrador':
      case 'Grupo BookingSoft':
        return {
          bg: '#f5f3ff',
          text: '#6b21a8',
          border: '#ddd6fe',
          icon: '👑',
          label: 'Administrador'
        };
      case 'Recepcionista 24h':
        return {
          bg: '#eff6ff',
          text: '#1d4ed8',
          border: '#bfdbfe',
          icon: '🛎️',
          label: 'Recepción 24h'
        };
      case 'Ama de llaves':
        return {
          bg: '#f0fdf4',
          text: '#15803d',
          border: '#bbf7d0',
          icon: '🧹',
          label: 'Ama de llaves'
        };
      case 'Personal de mantenimiento':
        return {
          bg: '#fffbeb',
          text: '#b45309',
          border: '#fde68a',
          icon: '🛠️',
          label: 'Mantenimiento'
        };
      default:
        return {
          bg: '#f8fafc',
          text: '#475569',
          border: '#e2e8f0',
          icon: '👤',
          label: rol || 'Empleado'
        };
    }
  };

  return (
        <section className="facile-section">
          <div className="w-full max-w-[1380px] mx-auto">
          {/* CABECERA PMS EJECUTIVA */}
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-7 bg-[#d91a2a] rounded-full inline-block"></span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0">
                    Panel de Control Hotelero
                  </h2>
                  <span className="bg-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md text-slate-300 border border-slate-700/60 uppercase tracking-wider">
                    PMS
                  </span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 mb-0 font-medium">
                  Módulo interno de gestión por sub-pestañas independientes
                </p>
              </div>
            </div>
            {usuarioSesion && (
              <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2.5 shadow-inner self-start md:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>👤 {usuarioSesion.nombre} — <strong className="text-[#f87171]">{usuarioSesion.rol}</strong></span>
              </div>
            )}
          </div>

          {/* BARRA DE NAVEGACIÓN RÁPIDA DE SUB-PESTAÑAS PMS */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            {/* SUB-PESTAÑA ADMINISTRACIÓN DE PERSONAL — Solo para Administrador / Grupo BookingSoft */}
            {(usuarioSesion?.rol === 'Administrador' || usuarioSesion?.rol === 'Grupo BookingSoft') && (
              <button
                type="button"
                onClick={() => setPmsSubTab('empleados')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  pmsSubTab === 'empleados'
                    ? 'bg-[#d91a2a] text-white shadow-md shadow-[#d91a2a]/25'
                    : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <span>👑 Personal & Roles</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  pmsSubTab === 'empleados' ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200/50'
                }`}>
                  {empleadosList.length}
                </span>
              </button>
            )}

            {/* SUB-PESTAÑAS OPERATIVAS (RECEPCIÓN, HUÉSPEDES, RESERVAS, COWORKING) */}
            {(usuarioSesion?.rol === 'Administrador' || usuarioSesion?.rol === 'Grupo BookingSoft' || usuarioSesion?.rol === 'Recepcionista 24h') && (
              <>
                <button
                  type="button"
                  onClick={() => setPmsSubTab('recepcion')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    pmsSubTab === 'recepcion'
                      ? 'bg-[#d91a2a] text-white shadow-md shadow-[#d91a2a]/25'
                      : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <span>🛎️ Recepción (Walk-in)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPmsSubTab('huespedes')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    pmsSubTab === 'huespedes'
                      ? 'bg-[#d91a2a] text-white shadow-md shadow-[#d91a2a]/25'
                      : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <span>👥 Huéspedes</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    pmsSubTab === 'huespedes' ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200/50'
                  }`}>
                    {huespedes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPmsSubTab('reservas')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    pmsSubTab === 'reservas'
                      ? 'bg-[#d91a2a] text-white shadow-md shadow-[#d91a2a]/25'
                      : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <span>📋 Reservas</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    pmsSubTab === 'reservas' ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200/50'
                  }`}>
                    {reservas.length}
                  </span>
                </button>
              </>
            )}

            {/* MANTENIMIENTO Y ASEO — Acceso para todos los roles de planta */}
            <button
              type="button"
              onClick={() => {
                setPmsSubTab('planta');
                if (usuarioSesion?.rol === 'Ama de llaves') setFiltroHabitaciones('amas_llaves');
                else if (usuarioSesion?.rol === 'Personal de mantenimiento') setFiltroHabitaciones('mantenimiento');
              }}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                pmsSubTab === 'planta'
                  ? 'bg-[#d91a2a] text-white shadow-md shadow-[#d91a2a]/25'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <span>🛠️ Mantenimiento y Aseo</span>
            </button>

            {(usuarioSesion?.rol === 'Administrador' || usuarioSesion?.rol === 'Grupo BookingSoft' || usuarioSesion?.rol === 'Recepcionista 24h') && (
              <button
                type="button"
                onClick={() => setPmsSubTab('coworking')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  pmsSubTab === 'coworking'
                    ? 'bg-[#d91a2a] text-white shadow-md shadow-[#d91a2a]/25'
                    : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <span>💼 Salas & Coworking</span>
              </button>
            )}
          </div>

          {/* 0. SUB-PESTAÑA 0: MÓDULO EXCLUSIVO DE GESTIÓN DE PERSONAL & ROLES (ADMINISTRADOR / GRUPO BOOKINGSOFT) */}
          {(pmsSubTab === 'empleados' || pmsSubTab === 'todos') && (usuarioSesion?.rol === 'Administrador' || usuarioSesion?.rol === 'Grupo BookingSoft') && (
            <div id="pms-empleados-module" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden mb-6">
              {/* Encabezado interno de la tarjeta */}
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
                    <ShieldCheck size={20} className="text-slate-800" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 m-0">
                      👑 Panel de Superusuario — Gestión de Personal & Roles (Grupo BookingSoft)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 mb-0">
                      Control integral de empleados, asignación de roles operativos y estados del personal.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateEmpleadoModal(prev => !prev)}
                  className="bg-[#0f172a] hover:bg-slate-800 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto shrink-0"
                >
                  <UserPlus size={15} />
                  <span>+ Registrar Nuevo Empleado</span>
                </button>
              </div>

              {empleadoAlert && (
                <div className={`mx-6 mt-4 p-3.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                  empleadoAlert.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  <span>{empleadoAlert.type === 'success' ? '✅' : '⚠️'}</span>
                  <span>{empleadoAlert.message}</span>
                </div>
              )}

              {/* MODAL / FORMULARIO PARA REGISTRAR UN NUEVO EMPLEADO */}
              {showCreateEmpleadoModal && (
                <div className="m-6 p-5 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-inner">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-extrabold text-slate-900 m-0 flex items-center gap-2">
                      <span>➕ Registrar Nuevo Empleado del Apartahotel</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowCreateEmpleadoModal(false)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      ✖️ Cerrar
                    </button>
                  </div>
                  <form onSubmit={handleCreateEmpleadoSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        value={newEmpleadoForm.nombre}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, nombre: e.target.value })}
                        placeholder="Ej: Carlos Mendoza"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#d91a2a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Usuario de Acceso *</label>
                      <input
                        type="text"
                        required
                        value={newEmpleadoForm.usuario}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, usuario: e.target.value })}
                        placeholder="Ej: cmendoza"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#d91a2a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Contraseña Inicial *</label>
                      <input
                        type="password"
                        required
                        value={newEmpleadoForm.contrasena}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, contrasena: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#d91a2a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Tipo de Documento</label>
                      <select
                        value={newEmpleadoForm.tipo_documento}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, tipo_documento: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#d91a2a] cursor-pointer"
                      >
                        <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="Cédula de extranjería">Cédula de extranjería</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Número de Documento *</label>
                      <input
                        type="text"
                        required
                        value={newEmpleadoForm.numero_documento}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, numero_documento: e.target.value })}
                        placeholder="1018459201"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#d91a2a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Correo Electrónico *</label>
                      <input
                        type="email"
                        required
                        value={newEmpleadoForm.correo}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, correo: e.target.value })}
                        placeholder="empleado@bookingsoft.com"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#d91a2a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Rol Operativo Asignado</label>
                      <select
                        value={newEmpleadoForm.rol}
                        onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, rol: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-[#d91a2a] focus:outline-none focus:border-[#d91a2a] cursor-pointer"
                      >
                        <option value="Recepcionista 24h">Recepcionista 24h</option>
                        <option value="Ama de llaves">Ama de llaves (Limpieza)</option>
                        <option value="Personal de mantenimiento">Personal de mantenimiento (Reparaciones)</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-[#d91a2a] hover:bg-[#b91522] text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>✅ Crear Cuenta de Empleado</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* BARRA DE BÚSQUEDA Y FILTROS OPERATIVOS */}
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/40">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-72 sm:w-80">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={empSearchQuery}
                      onChange={e => {
                        setEmpSearchQuery(e.target.value);
                        setEmpCurrentPage(1);
                      }}
                      placeholder="Buscar por nombre, documento o usuario..."
                      className="w-full pl-9 pr-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#d91a2a] shadow-xs"
                    />
                  </div>

                  <select
                    value={empRolFilter}
                    onChange={e => {
                      setEmpRolFilter(e.target.value);
                      setEmpCurrentPage(1);
                    }}
                    className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#d91a2a] shadow-xs cursor-pointer"
                  >
                    <option value="todos">Todos los roles</option>
                    <option value="Ama de llaves">Ama de llaves</option>
                    <option value="Personal de mantenimiento">Personal de mantenimiento</option>
                    <option value="Recepcionista 24h">Recepcionista 24h</option>
                    <option value="Administrador">Administrador</option>
                  </select>

                  <select
                    value={empEstadoFilter}
                    onChange={e => {
                      setEmpEstadoFilter(e.target.value);
                      setEmpCurrentPage(1);
                    }}
                    className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#d91a2a] shadow-xs cursor-pointer"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  Mostrando <strong className="text-slate-800">{paginatedEmpleados.length}</strong> de <strong className="text-slate-800">{filteredEmpleados.length}</strong> colaboradores registrados
                </div>
              </div>

              {/* TABLA DE EMPLEADOS DEL SISTEMA */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200/80">
                      <th className="py-4 px-6">Empleado</th>
                      <th className="py-4 px-6">Usuario</th>
                      <th className="py-4 px-6">Rol en Sistema</th>
                      <th className="py-4 px-6">Estado</th>
                      <th className="py-4 px-6">Documento & Contacto</th>
                      <th className="py-4 px-6 text-right">Acción de Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedEmpleados.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-slate-500 font-medium">
                          No se encontraron colaboradores con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      paginatedEmpleados.map((emp, idx) => {
                        const avatar = getAvatarStyle(idx);
                        const subinfo = getSubinfo(emp, idx);
                        const initials = getInitials(emp.nombre);
                        const isSelf = usuarioSesion && (usuarioSesion.usuario === emp.usuario || usuarioSesion.nombre === emp.nombre);

                        return (
                          <tr key={emp.id_empleado} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-6" style={{ verticalAlign: 'middle' }}>
                              <div className="flex items-center gap-3.5">
                                <div
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    minWidth: '38px',
                                    minHeight: '38px',
                                    borderRadius: '12px',
                                    backgroundColor: avatar.bgHex,
                                    color: avatar.textHex,
                                    border: `1px solid ${avatar.borderHex}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.84rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.5px',
                                    lineHeight: 1,
                                    flexShrink: 0,
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  {initials}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 text-sm block leading-tight">
                                    {emp.nombre}
                                  </span>
                                  <span className="text-xs text-slate-500 font-medium block mt-0.5 leading-tight">
                                    {subinfo}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6" style={{ verticalAlign: 'middle' }}>
                              <span className="font-mono text-xs text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-md border border-slate-200/60 inline-block font-medium">
                                @{emp.usuario}
                              </span>
                            </td>
                            <td className="py-4 px-6" style={{ verticalAlign: 'middle' }}>
                              {isSelf ? (
                                <span
                                  title="Tu cuenta actual (No puedes auto-degradar tu rol)"
                                  className="px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                                >
                                  <span>👑</span>
                                  <span>{emp.rol} (Tú)</span>
                                </span>
                              ) : (
                                <select
                                  value={emp.rol}
                                  onChange={e => {
                                    const nuevoRol = e.target.value;
                                    if (nuevoRol !== emp.rol) {
                                      setConfirmRolModal({
                                        id_empleado: emp.id_empleado,
                                        nombre: emp.nombre,
                                        rolActual: emp.rol,
                                        nuevoRol
                                      });
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#d91a2a] outline-none cursor-pointer shadow-xs transition-colors"
                                >
                                  <option value="Ama de llaves">Ama de llaves</option>
                                  <option value="Personal de mantenimiento">Personal de mantenimiento</option>
                                  <option value="Recepcionista 24h">Recepcionista 24h</option>
                                  <option value="Administrador">Administrador</option>
                                </select>
                              )}
                            </td>
                            <td className="py-4 px-6" style={{ verticalAlign: 'middle' }}>
                              {emp.estado === 'Activo' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                  <span>Activo</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                                  <span>Inactivo</span>
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-600 space-y-0.5" style={{ verticalAlign: 'middle' }}>
                              <div className="font-medium text-slate-700 leading-tight">
                                Cédula de ciudadanía: {emp.numero_documento || 'No registrada'}
                              </div>
                              <a
                                href={`mailto:${emp.correo}`}
                                className="text-blue-600 hover:underline flex items-center gap-1 mt-0.5 leading-tight"
                                style={{ textDecoration: 'none' }}
                              >
                                <Mail size={12} className="text-slate-400 shrink-0" />
                                <span>{emp.correo}</span>
                              </a>
                            </td>
                            <td className="py-4 px-6 text-right" style={{ verticalAlign: 'middle' }}>
                              {isSelf ? (
                                <span
                                  title="Esta es tu sesión activa conectada"
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 text-slate-500 inline-flex items-center gap-1.5"
                                >
                                  <span>🔒</span>
                                  <span>Sesión Activa</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nuevoEstado = emp.estado === 'Activo' ? 'Inactivo' : 'Activo';
                                    setConfirmEstadoModal({
                                      emp,
                                      nuevoEstado
                                    });
                                  }}
                                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                    emp.estado === 'Activo'
                                      ? 'border-red-200 bg-red-50 hover:bg-red-100 text-[#d91a2a]'
                                      : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {emp.estado === 'Activo' ? (
                                    <>
                                      <Ban size={13} />
                                      <span>Desactivar</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle size={13} />
                                      <span>Activar</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 bg-white">
                  <div className="font-semibold text-slate-600">
                    Página <strong className="text-slate-800">{validCurrentPage}</strong> de <strong className="text-slate-800">{totalPages}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={validCurrentPage === 1}
                      onClick={() => setEmpCurrentPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      Anterior
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === 1 || page === totalPages || Math.abs(page - validCurrentPage) <= 1;
                      })
                      .map((page, idx, arr) => {
                        const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsisBefore && <span className="px-1 text-slate-400 font-bold">...</span>}
                            <button
                              type="button"
                              onClick={() => setEmpCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                validCurrentPage === page
                                  ? 'bg-[#0f172a] text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}

                    <button
                      type="button"
                      disabled={validCurrentPage === totalPages}
                      onClick={() => setEmpCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL DE SEGURIDAD: CONFIRMAR CAMBIO DE ROL */}
              {confirmRolModal && (
                <div className="modal-backdrop" onClick={() => setConfirmRolModal(null)}>
                  <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', borderRadius: '16px', padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                          ¿Confirmar cambio de rol operativo?
                        </h3>
                        <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                          Estás a punto de modificar el rol y los permisos de acceso para <strong>{confirmRolModal.nombre}</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Comparativa visual del rol */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Rol Actual</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{confirmRolModal.rolActual}</span>
                      </div>
                      <div style={{ color: '#d91a2a', fontWeight: 900, fontSize: '1.2rem' }}>
                        ➔
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#d91a2a', textTransform: 'uppercase', fontWeight: 700 }}>Nuevo Rol</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{confirmRolModal.nuevoRol}</span>
                      </div>
                    </div>

                    <div style={{ background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.78rem', color: '#991b1b', lineHeight: 1.4 }}>
                      ⚠️ <strong>Advertencia de Seguridad:</strong> Los módulos visibles en el PMS y los permisos de este colaborador cambiarán en el momento en que guardes este cambio.
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setConfirmRolModal(null)}
                        style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await handleChangeEmpleadoRol(confirmRolModal.id_empleado, confirmRolModal.nuevoRol);
                          setConfirmRolModal(null);
                        }}
                        style={{ padding: '0.65rem 1.35rem', borderRadius: '10px', border: 'none', background: '#d91a2a', color: '#ffffff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217, 26, 42, 0.25)' }}
                      >
                        Sí, Confirmar Cambio de Rol
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL DE SEGURIDAD: CONFIRMAR ACTIVACIÓN / DESACTIVACIÓN */}
              {confirmEstadoModal && (
                <div className="modal-backdrop" onClick={() => setConfirmEstadoModal(null)}>
                  <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px', borderRadius: '16px', padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: confirmEstadoModal.nuevoEstado === 'Inactivo' ? '#fee2e2' : '#ecfdf5',
                        border: `1px solid ${confirmEstadoModal.nuevoEstado === 'Inactivo' ? '#fecdd3' : '#a7f3d0'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: confirmEstadoModal.nuevoEstado === 'Inactivo' ? '#b91c1c' : '#059669',
                        flexShrink: 0
                      }}>
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                          {confirmEstadoModal.nuevoEstado === 'Inactivo' ? '¿Confirmar desactivación?' : '¿Confirmar reactivación?'}
                        </h3>
                        <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                          {confirmEstadoModal.nuevoEstado === 'Inactivo' ? (
                            <>¿Estás seguro de que deseas desactivar a <strong>{confirmEstadoModal.emp.nombre}</strong>? Esta persona perderá acceso inmediato para iniciar sesión en el PMS.</>
                          ) : (
                            <>¿Deseas restaurar y activar la cuenta de <strong>{confirmEstadoModal.emp.nombre}</strong> para que pueda ingresar al PMS?</>
                          )}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setConfirmEstadoModal(null)}
                        style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await handleToggleEmpleadoEstado(confirmEstadoModal.emp);
                          setConfirmEstadoModal(null);
                        }}
                        style={{
                          padding: '0.65rem 1.35rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: confirmEstadoModal.nuevoEstado === 'Inactivo' ? '#b91522' : '#059669',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          boxShadow: confirmEstadoModal.nuevoEstado === 'Inactivo' ? '0 4px 12px rgba(185, 21, 34, 0.25)' : '0 4px 12px rgba(5, 150, 105, 0.25)'
                        }}
                      >
                        {confirmEstadoModal.nuevoEstado === 'Inactivo' ? 'Sí, Desactivar Empleado' : 'Sí, Activar Empleado'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '1.2rem' }}>
                    
                    {/* Header interactivo del Calendario */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                      <button 
                        type="button" 
                        onClick={() => setCalDate(new Date(year, month - 1, 1))}
                        title="Mes Anterior"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', cursor: 'pointer', fontSize: '0.75rem', padding: '5px 9px', borderRadius: '8px', fontWeight: 700, transition: 'all 0.15s ease' }}
                      >
                        <span>◀ Mes Ant.</span>
                      </button>

                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                        🗓️ Disponibilidad: {monthNames[month]} {year}
                      </span>

                      <button 
                        type="button" 
                        onClick={() => setCalDate(new Date(year, month + 1, 1))}
                        title="Mes Siguiente"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', cursor: 'pointer', fontSize: '0.75rem', padding: '5px 9px', borderRadius: '8px', fontWeight: 700, transition: 'all 0.15s ease' }}
                      >
                        <span>Mes Sig. ▶</span>
                      </button>
                    </div>

                    {/* Leyenda Explicativa de Tres Estados */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '12px', margin: '10px 0', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                        <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', display: 'inline-block' }} />
                        <span>Disponible</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#ef4444' }}>
                        <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#94a3b8', textDecoration: 'line-through 2px #ef4444', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ✕
                        </span>
                        <span>Ocupado (No disponible)</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#d91a2a' }}>
                        <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#d91a2a', color: '#ffffff', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ✓
                        </span>
                        <span>Tu Selección</span>
                      </div>
                    </div>

                    {/* Encabezado Días Semanales */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                      <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                    </div>

                    {/* Grilla Interactiva de Días */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                      {daysGrid.map((item, idx) => {
                        if (!item) return <div key={`empty-${idx}`} style={{ height: '36px' }} />;

                        // 1. DÍA OCUPADO (No disponible)
                        if (item.isOccupied) {
                          return (
                            <div
                              key={item.dayStr}
                              title={`Fecha ${item.dayStr} ocupada (No disponible)`}
                              style={{
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                color: '#94a3b8',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                textDecoration: 'line-through 2px #ef4444',
                                cursor: 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                userSelect: 'none'
                              }}
                            >
                              {item.d}
                            </div>
                          );
                        }

                        // 2. DÍA EN SELECCIÓN (Entrada, Salida o en Rango)
                        const esExtremo = item.isSelectedIn || item.isSelectedOut;
                        if (esExtremo || item.inRange) {
                          return (
                            <button
                              key={item.dayStr}
                              type="button"
                              onClick={() => handleDayClick(item)}
                              title={`${item.isSelectedIn ? 'Llegada: ' : item.isSelectedOut ? 'Salida: ' : ''}${item.dayStr}`}
                              style={{
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: esExtremo ? '#d91a2a' : '#fee2e2',
                                color: esExtremo ? '#ffffff' : '#b91522',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                border: esExtremo ? 'none' : '1px dashed #fca5a5',
                                boxShadow: esExtremo ? '0 2px 8px rgba(217, 26, 42, 0.35)' : 'none',
                                transform: esExtremo ? 'scale(1.05)' : 'scale(1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {item.d}
                            </button>
                          );
                        }

                        // 3. DÍA DISPONIBLE
                        return (
                          <button
                            key={item.dayStr}
                            type="button"
                            onClick={() => handleDayClick(item)}
                            title={`Seleccionar fecha ${item.dayStr}`}
                            style={{
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#0f172a',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.borderColor = '#d91a2a'; e.currentTarget.style.color = '#d91a2a'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#0f172a'; }}
                          >
                            {item.d}
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
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  border: '1px solid #e2e8f0',
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                }}>
                  {/* Cabecera Tarifa y Noches */}
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                        ${cotizacion.precio_noche ? cotizacion.precio_noche.toLocaleString('es-CO') : '0'}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginLeft: '5px' }}>
                        COP / noche (Apto {cotizacion.habitacion?.numero})
                      </span>
                    </div>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      border: '1px solid #e2e8f0'
                    }}>
                      {cotizacion.noches} {cotizacion.noches === 1 ? 'noche' : 'noches'}
                    </span>
                  </div>

                  {/* Desglose de Cálculo */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                      <span>Subtotal Estadía:</span>
                      <span style={{ fontWeight: 600 }}>${cotizacion.subtotal.toLocaleString('es-CO')} COP</span>
                    </div>

                    {cotizacion.descuento > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#ecfdf5',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        color: '#065f46',
                        fontWeight: 700,
                        border: '1px solid #a7f3d0'
                      }}>
                        <span>🎉 Descuento Larga Estadía ({cotizacion.noches >= 15 ? '15%' : '10%'})</span>
                        <span>-${cotizacion.descuento.toLocaleString('es-CO')} COP</span>
                      </div>
                    )}

                    {/* Total final */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '12px',
                      marginTop: '6px'
                    }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                          Total a Pagar
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          Tarifa calculada con impuestos incluidos
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#d91a2a' }}>
                          ${cotizacion.total.toLocaleString('es-CO')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px', fontWeight: 700 }}>COP</span>
                      </div>
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
          </div>
        </section>
  );
};

export default VistaPms;
