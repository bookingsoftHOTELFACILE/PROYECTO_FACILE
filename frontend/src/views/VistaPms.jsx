import { useState, useMemo } from 'react';
import {
  UserPlus, ShieldCheck, Users, Calendar, ListOrdered, Trash2,
  Wrench, Check, Search, Tag, Mail, Shield, User, AlertTriangle,
  CheckCircle2, X, Clock, KeyRound, RotateCcw, Sparkles, Ban, CheckCircle, Home,
  Building2, UserCheck, Download, Plus, Phone
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

  // Estados de Búsqueda, Filtros y Paginación para Huéspedes Registrados
  const [huespedSearch, setHuespedSearch] = useState('');
  const [huespedTipoFilter, setHuespedTipoFilter] = useState('TODOS');
  const [huespedEstadoFilter, setHuespedEstadoFilter] = useState('TODOS');
  const [huespedCurrentPage, setHuespedCurrentPage] = useState(1);
  const HUESPEDES_PER_PAGE = 6;

  // Filtrado reactivo de huéspedes
  const filteredHuespedes = useMemo(() => {
    return (huespedes || []).filter(h => {
      const q = huespedSearch.toLowerCase().trim();
      const matchSearch = !q ||
        (h.nombre && h.nombre.toLowerCase().includes(q)) ||
        (h.documento && String(h.documento).toLowerCase().includes(q)) ||
        (h.correo && h.correo.toLowerCase().includes(q)) ||
        (h.telefono && String(h.telefono).includes(q));

      const matchTipo =
        huespedTipoFilter === 'TODOS' ||
        (huespedTipoFilter === 'PARTICULAR' && !h.empresa) ||
        (huespedTipoFilter === 'CORPORATIVO' && !!h.empresa) ||
        (huespedTipoFilter === 'FRECUENTE' && (h.lealtad === 'Gold' || h.lealtad === 'Platinum'));

      const matchEstado =
        huespedEstadoFilter === 'TODOS' ||
        (huespedEstadoFilter === 'ACTIVO' && h.estado === 'Activo') ||
        (huespedEstadoFilter === 'INACTIVO' && h.estado === 'Inactivo');

      return matchSearch && matchTipo && matchEstado;
    });
  }, [huespedes, huespedSearch, huespedTipoFilter, huespedEstadoFilter]);

  const totalHuespedesPages = Math.max(1, Math.ceil(filteredHuespedes.length / HUESPEDES_PER_PAGE));
  const validHuespedPage = Math.min(huespedCurrentPage, totalHuespedesPages);

  const paginatedHuespedes = useMemo(() => {
    const start = (validHuespedPage - 1) * HUESPEDES_PER_PAGE;
    return filteredHuespedes.slice(start, start + HUESPEDES_PER_PAGE);
  }, [filteredHuespedes, validHuespedPage]);

  // Exportar huéspedes a CSV
  const handleExportarHuespedesCSV = () => {
    if (!huespedes || huespedes.length === 0) return;
    const headers = ['ID', 'Nombre', 'Documento', 'Correo', 'Telefono', 'Empresa', 'Lealtad', 'Estado', 'Creado_Por'];
    const rows = huespedes.map(h => [
      h.id_huesped,
      `"${(h.nombre || '').replace(/"/g, '""')}"`,
      `"${h.documento || ''}"`,
      `"${h.correo || ''}"`,
      `"${h.telefono || ''}"`,
      `"${h.empresa || 'Particular'}"`,
      `"${h.lealtad || 'Silver'}"`,
      `"${h.estado || 'Activo'}"`,
      `"${h.creado_por || 'Sistema'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `huespedes_hotel_facile_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <section className="facile-section" style={{ padding: '24px 0' }}>
          <div className="pms-container-bounded">
          {/* CABECERA PMS EJECUTIVA */}
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-7 bg-[#d91a2a] rounded-full inline-block"></span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">
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
            {/* SUB-PESTAÑA ADMINISTRACIÓN DE PERSONAL — Administrador / Recepcionista 24h / Grupo BookingSoft */}
            {(usuarioSesion?.rol === 'Administrador' || usuarioSesion?.rol === 'Grupo BookingSoft' || usuarioSesion?.rol === 'Recepcionista 24h') && (
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
                  {pmsSubTab === 'recepcion' && (
                    <span className="bg-red-900/60 text-white text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase">
                      ACTIVO
                    </span>
                  )}
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

          {/* 0. SUB-PESTAÑA 0: MÓDULO DE GESTIÓN DE PERSONAL & ROLES (ADMINISTRACIÓN / RECEPCIÓN 24H / GRUPO BOOKINGSOFT) */}
          {(pmsSubTab === 'empleados' || pmsSubTab === 'todos') && (usuarioSesion?.rol === 'Administrador' || usuarioSesion?.rol === 'Grupo BookingSoft' || usuarioSesion?.rol === 'Recepcionista 24h') && (
            <div id="pms-empleados-module" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden mb-6">
              {/* Encabezado interno de la tarjeta */}
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
                    <ShieldCheck size={20} className="text-slate-800" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 m-0">
                      👑 Gestión de Personal & Roles — Dirección Operativa y Front Desk
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 mb-0">
                      Control integral de colaboradores, asignación de turnos, roles operativos y estados del personal del apartahotel.
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
                <div className="flex flex-wrap items-center gap-3" style={{ flex: '1 1 auto' }}>
                  <div className="relative" style={{ minWidth: '280px', flex: '1 1 280px', maxWidth: '420px' }}>
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
                    style={{ minWidth: '180px' }}
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
                    style={{ minWidth: '150px' }}
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
              <div className="overflow-x-auto" style={{ width: '100%' }}>
                <table className="pms-table-executive" style={{ minWidth: '1000px' }}>
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 border-b border-slate-200/80">
                      <th style={{ width: '25%' }}>Empleado</th>
                      <th style={{ width: '15%' }}>Usuario</th>
                      <th style={{ width: '18%' }}>Rol en Sistema</th>
                      <th style={{ width: '12%' }}>Estado</th>
                      <th style={{ width: '18%' }}>Documento & Contacto</th>
                      <th style={{ width: '12%', textAlign: 'right' }}>Acción de Estado</th>
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
                            <td>
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
                            <td>
                              <span className="pms-user-tag">
                                @{emp.usuario}
                              </span>
                            </td>
                            <td>
                              {isSelf ? (
                                <span
                                  title="Tu cuenta actual (No puedes auto-degradar tu rol)"
                                  className="px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap"
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
                                  className="pms-select-role"
                                >
                                  <option value="Ama de llaves">Ama de llaves</option>
                                  <option value="Personal de mantenimiento">Personal de mantenimiento</option>
                                  <option value="Recepcionista 24h">Recepcionista 24h</option>
                                  <option value="Administrador">Administrador</option>
                                </select>
                              )}
                            </td>
                            <td>
                              {emp.estado === 'Activo' ? (
                                <span className="pms-status-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                  <span>Activo</span>
                                </span>
                              ) : (
                                <span className="pms-status-pill bg-red-50 text-red-700 border border-red-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                                  <span>Inactivo</span>
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="font-medium text-slate-700 leading-tight text-xs">
                                Cédula de ciudadanía: {emp.numero_documento || 'No registrada'}
                              </div>
                              <a
                                href={`mailto:${emp.correo}`}
                                className="text-blue-600 hover:underline inline-flex items-center gap-1.5 mt-1 leading-tight text-xs"
                                style={{ textDecoration: 'none' }}
                              >
                                <Mail size={13} className="text-slate-400 shrink-0" />
                                <span>{emp.correo}</span>
                              </a>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {isSelf ? (
                                <span className="text-[11px] font-bold text-slate-400 italic whitespace-nowrap">
                                  🔒 Sesión Activa
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
                                  className={emp.estado === 'Activo' ? 'pms-action-btn-danger' : 'pms-action-btn-success'}
                                  title={emp.estado === 'Activo' ? 'Desactivar acceso al sistema' : 'Activar colaborador'}
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
          {(pmsSubTab === 'recepcion' || pmsSubTab === 'todos') && (() => {
            const guestReservasPrevias = selectedHuesped ? reservas.filter(r => String(r.id_huesped) === String(selectedHuesped.id_huesped)).length : 0;
            const guestNivel = guestReservasPrevias >= 5 ? 'Nivel Platinum' : guestReservasPrevias >= 2 ? 'Nivel Gold' : 'Huésped Frecuente';
            const vacantesCount = (habitaciones || []).filter(h => h.estado === 'Disponible').length || 6;
            const selectedHab = habitaciones.find(h => String(h.id_habitacion) === String(reservaData.id_habitacion));
            const tarifaNoche = selectedHab ? Number(selectedHab.precio_noche || 0) : (cotizacion?.precio_noche || 250000);
            
            let noches = 2;
            if (reservaData.fecha_entrada && reservaData.fecha_salida) {
              const diff = (new Date(reservaData.fecha_salida + 'T00:00:00') - new Date(reservaData.fecha_entrada + 'T00:00:00')) / (1000 * 60 * 60 * 24);
              if (diff > 0) noches = Math.round(diff);
            } else if (cotizacion?.noches) {
              noches = cotizacion.noches;
            }
            const depositoGarantia = 150000;
            const subtotalCalculado = noches * tarifaNoche;
            const descuentoCalculado = cotizacion?.descuento || (noches >= 15 ? subtotalCalculado * 0.15 : (noches >= 7 ? subtotalCalculado * 0.10 : 0));
            const totalFacturar = cotizacion?.total || Math.max(0, subtotalCalculado - descuentoCalculado);

            return (
              <div id="pms-reception-reserva-module" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8 mb-6">
                
                {/* 1. ENCABEZADO DEL MÓDULO OPERATIVO */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d91a2a]">
                      <span>📅</span>
                      <span>Módulo de Recepción</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600">Crear Nueva Reserva Presencial (Walk-in)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-normal mb-0">
                      Seleccione un huésped frecuente registrado o capture en tiempo real sus datos de contacto e identidad (Cédula, Pasaporte o C.E.) para emisión inmediata de llaves.
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Turno: AM / Recepción Principal
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d91a2a]"></span>
                      Atención Presencial en Hotel
                    </span>
                  </div>
                </div>

                {/* ALERTAS OPERATIVAS DEL PMS */}
                {reservaAlert && (
                  <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2.5 ${
                    reservaAlert.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : reservaAlert.type === 'info'
                      ? 'bg-blue-50 text-blue-900 border-blue-200'
                      : 'bg-red-50 text-red-900 border-red-200'
                  }`}>
                    <span>{reservaAlert.type === 'success' ? '🎉' : reservaAlert.type === 'info' ? 'ℹ️' : '⚠️'}</span>
                    <span>{reservaAlert.message}</span>
                  </div>
                )}

                {/* 2. ALERTA DE HUÉSPED FRECUENTE ENCONTRADO */}
                {selectedHuesped && (
                  <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-4 flex items-center justify-between gap-3 transition-all">
                    <div className="flex items-center gap-3 text-xs text-emerald-950">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="leading-relaxed">
                        <span className="font-extrabold text-emerald-900">
                          Huésped Frecuente Encontrado: {selectedHuesped.nombre}
                        </span>
                        <span className="mx-2 text-emerald-400">•</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100/90 font-bold text-emerald-800 text-[11px] inline-block mr-2">
                          {guestNivel}
                        </span>
                        <span className="mx-1 text-emerald-400">•</span>
                        <span className="font-semibold">{guestReservasPrevias} Reservas Previas.</span>
                        <span className="text-emerald-800/80 hidden md:inline ml-1">
                          Los registros de contacto han sido precompletados con los datos guardados en el sistema central.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHuesped(null);
                        setPmsWalkInGuest(prev => ({ ...prev, documento: '', nombre: '', telefono: '', correo: '' }));
                      }}
                      className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors cursor-pointer"
                      title="Cerrar notificación y limpiar huésped"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* FORMULARIO OPERATIVO */}
                <form onSubmit={handleReservaSubmit} className="space-y-8">
                  
                  {/* SECCIÓN 1: DATOS DEL HUÉSPED */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold">
                          👤
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 m-0" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          1. Datos del Huésped Presencial (Walk-in)
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                        Campos marcados con (*) son obligatorios
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 italic m-0">
                      Digite el número de documento para auto-completar datos de un huésped existente o ingrese la información si es un nuevo registro.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Tipo de Documento */}
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          Tipo de Documento <span className="text-[#d91a2a]">*</span>
                        </label>
                        <select
                          name="tipo_documento"
                          value={pmsWalkInGuest.tipo_documento}
                          onChange={handlePmsWalkInGuestChange}
                          style={{ height: '44px', borderRadius: '12px' }}
                          className="w-full px-3.5 border border-slate-300 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 outline-none transition-all cursor-pointer"
                        >
                          <option value="Cédula de Ciudadanía">Cédula de Ciudadanía (C.C.)</option>
                          <option value="Cédula de Extranjería">Cédula de Extranjería (C.E.)</option>
                          <option value="Pasaporte">Pasaporte Internacional</option>
                        </select>
                      </div>

                      {/* Número de Documento + Buscador */}
                      <div className="md:col-span-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 m-0" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                            Número de Documento <span className="text-[#d91a2a]">*</span>
                          </label>
                          <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
                            💡 Presione Enter o Buscar
                          </span>
                        </div>
                        <div className="flex gap-2" style={{ alignItems: 'stretch' }}>
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
                            style={{ height: '44px', borderRadius: '12px', flex: '1 1 auto' }}
                            className="w-full px-3.5 border border-slate-300 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => handleBuscarHuespedPorDocumento(pmsWalkInGuest.documento)}
                            style={{ height: '44px', borderRadius: '12px' }}
                            className="px-4 bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Buscar</span>
                          </button>
                        </div>
                      </div>

                      {/* Nombre Completo */}
                      <div className="md:col-span-5">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          Nombre Completo <span className="text-[#d91a2a]">*</span>
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={pmsWalkInGuest.nombre}
                          onChange={handlePmsWalkInGuestChange}
                          placeholder="Ej: Jose Miguel Chico"
                          required
                          style={{ height: '44px', borderRadius: '12px' }}
                          className="w-full px-3.5 border border-slate-300 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 outline-none transition-all"
                        />
                      </div>

                      {/* Celular / WhatsApp */}
                      <div className="md:col-span-6">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          Celular / WhatsApp <span className="text-[#d91a2a]">*</span>
                        </label>
                        <div className="relative" style={{ display: 'flex', alignItems: 'center' }}>
                          <div 
                            style={{ 
                              position: 'absolute', 
                              left: '12px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              pointerEvents: 'none', 
                              color: '#475569', 
                              fontSize: '0.8125rem', 
                              fontWeight: 700,
                              zIndex: 2
                            }}
                          >
                            🇨🇴 +57
                          </div>
                          <input
                            type="tel"
                            name="telefono"
                            value={pmsWalkInGuest.telefono}
                            onChange={handlePmsWalkInGuestChange}
                            placeholder="3154449876"
                            maxLength={15}
                            required
                            style={{ paddingLeft: '84px', height: '44px', borderRadius: '12px' }}
                            className="w-full pr-3.5 border border-slate-300 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Correo Electrónico */}
                      <div className="md:col-span-6">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          Correo Electrónico (Factura & Llave Digital) <span className="text-[#d91a2a]">*</span>
                        </label>
                        <input
                          type="email"
                          name="correo"
                          value={pmsWalkInGuest.correo}
                          onChange={handlePmsWalkInGuestChange}
                          placeholder="jocmiguelcc@gmail.com"
                          required
                          style={{ height: '44px', borderRadius: '12px' }}
                          className="w-full px-3.5 border border-slate-300 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: ASIGNACIÓN DE UNIDAD Y CALENDARIO */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-red-50 text-[#d91a2a] flex items-center justify-center text-xs font-bold">
                          🏠
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 m-0" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          2. Asignación de Unidad y Calendario de Estadía
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Disponibilidad en vivo: {vacantesCount} Apartamentos Vacantes
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Apartamento / Habitación Disponible */}
                      <div className="md:col-span-8">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          Apartamento / Habitación Disponible <span className="text-[#d91a2a]">*</span>
                        </label>
                        <select
                          name="id_habitacion"
                          value={reservaData.id_habitacion}
                          onChange={handleReservaChange}
                          required
                          style={{ height: '44px', borderRadius: '12px' }}
                          className="w-full px-3.5 border border-slate-300 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 outline-none transition-all cursor-pointer"
                        >
                          <option value="">-- Seleccionar Unidad Disponible --</option>
                          {habitaciones.map(hab => (
                            <option key={hab.id_habitacion} value={hab.id_habitacion}>
                              🏢 {hab.tipo?.toLowerCase().includes('suite') ? 'Suite' : 'Dúplex'} {hab.numero} — Piso {hab.numero?.[0] || '1'} ({hab.tipo} • Disponible) — ${Number(hab.precio_noche || 0).toLocaleString('es-CO')} COP / Noche
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ocupantes */}
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          Número de Personas / Ocupantes <span className="text-[#d91a2a]">*</span>
                        </label>
                        <select
                          name="numero_personas"
                          value={reservaData.numero_personas}
                          onChange={handleReservaChange}
                          style={{ height: '44px', borderRadius: '12px' }}
                          className="w-full px-3.5 border border-slate-300 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 outline-none transition-all cursor-pointer"
                        >
                          <option value={1}>1 huésped (Titular)</option>
                          <option value={2}>2 huéspedes</option>
                          <option value={3}>3 huéspedes</option>
                          <option value={4}>4 huéspedes</option>
                          <option value={5}>5 huéspedes</option>
                          <option value={6}>6 huéspedes</option>
                        </select>
                      </div>

                      {/* Fecha Entrada */}
                      <div className="md:col-span-6">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 m-0" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                            Fecha de Entrada (Check-In) <span className="text-[#d91a2a]">*</span>
                          </label>
                          <span className="text-[11px] text-slate-400">Hora estándar: 15:00</span>
                        </div>
                        <input
                          type="date"
                          name="fecha_entrada"
                          value={reservaData.fecha_entrada}
                          onChange={handleReservaChange}
                          required
                          style={{ height: '44px', borderRadius: '12px' }}
                          className="w-full px-3.5 border border-slate-300 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 outline-none transition-all cursor-pointer"
                        />
                      </div>

                      {/* Fecha Salida */}
                      <div className="md:col-span-6">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 m-0" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                            Fecha de Salida (Check-Out) <span className="text-[#d91a2a]">*</span>
                          </label>
                          <span className="text-[11px] text-slate-400">Hora límite: 11:00</span>
                        </div>
                        <input
                          type="date"
                          name="fecha_salida"
                          value={reservaData.fecha_salida}
                          onChange={handleReservaChange}
                          required
                          style={{ height: '44px', borderRadius: '12px' }}
                          className="w-full px-3.5 border border-slate-300 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 outline-none transition-all cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* CALENDARIO DE OCUPACIÓN INTERACTIVO */}
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
                        <div className="bg-slate-50/50 rounded-2xl border border-slate-200/90 p-4 mt-2">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                            <button
                              type="button"
                              onClick={() => setCalDate(new Date(year, month - 1, 1))}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                            >
                              ◀ Mes Ant.
                            </button>
                            <span className="text-xs font-extrabold text-slate-800">
                              🗓️ Calendario de Disponibilidad: {monthNames[month]} {year}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCalDate(new Date(year, month + 1, 1))}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                            >
                              Mes Sig. ▶
                            </button>
                          </div>

                          <div className="flex items-center justify-center gap-4 py-2 text-[11px] font-semibold text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 rounded bg-white border border-slate-300 inline-block" />
                              <span>Disponible</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-red-600">
                              <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300 text-slate-400 line-through flex items-center justify-center text-[9px] font-black">
                                ✕
                              </span>
                              <span>Ocupado</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#d91a2a]">
                              <span className="w-3.5 h-3.5 rounded bg-[#d91a2a] text-white flex items-center justify-center text-[9px] font-black">
                                ✓
                              </span>
                              <span>Tu Selección</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 uppercase mb-1">
                            <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                          </div>

                          <div className="grid grid-cols-7 gap-1.5">
                            {daysGrid.map((item, idx) => {
                              if (!item) return <div key={`empty-${idx}`} className="h-9" />;

                              if (item.isOccupied) {
                                return (
                                  <div
                                    key={item.dayStr}
                                    title={`Fecha ${item.dayStr} ocupada`}
                                    className="h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold line-through flex items-center justify-center cursor-not-allowed select-none"
                                  >
                                    {item.d}
                                  </div>
                                );
                              }

                              const esExtremo = item.isSelectedIn || item.isSelectedOut;
                              if (esExtremo || item.inRange) {
                                return (
                                  <button
                                    key={item.dayStr}
                                    type="button"
                                    onClick={() => handleDayClick(item)}
                                    className={`h-9 rounded-lg text-xs font-black flex items-center justify-center cursor-pointer transition-all ${
                                      esExtremo
                                        ? 'bg-[#d91a2a] text-white shadow-sm shadow-[#d91a2a]/30 scale-105'
                                        : 'bg-red-50 text-[#b91522] border border-dashed border-red-300'
                                    }`}
                                  >
                                    {item.d}
                                  </button>
                                );
                              }

                              return (
                                <button
                                  key={item.dayStr}
                                  type="button"
                                  onClick={() => handleDayClick(item)}
                                  className="h-9 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:border-[#d91a2a] hover:text-[#d91a2a] hover:bg-red-50/50 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  {item.d}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 3. RESUMEN DE COTIZACIÓN EN TIEMPO REAL (LIVE PRICING) */}
                  <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-6">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/70">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                        <span>💳</span>
                        <span>Resumen de Cotización en Tiempo Real</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">Moneda: COP ($)</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block mb-1" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          Estadía Total
                        </span>
                        <span className="text-xl font-bold text-slate-900">{noches} {noches === 1 ? 'Noche' : 'Noches'}</span>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-slate-500 block mb-1" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          Tarifa por Noche
                        </span>
                        <span className="text-xl font-bold text-slate-900">
                          ${tarifaNoche.toLocaleString('es-CO')} COP
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-slate-500 block mb-1" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          Depósito en Garantía
                        </span>
                        <span className="text-xl font-bold text-slate-900">
                          ${depositoGarantia.toLocaleString('es-CO')} COP{' '}
                          <span className="text-xs font-normal text-slate-500">(Reembolsable)</span>
                        </span>
                      </div>

                      <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
                        <span className="text-xs font-bold text-slate-700 block mb-1" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                          Total a Facturar Presencial
                        </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#d91a2a] block" style={{ letterSpacing: '-0.01em' }}>
                          ${totalFacturar.toLocaleString('es-CO')}{' '}
                          <span className="text-xs font-bold text-slate-600">COP</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. CHECKBOX CHECK-IN DIRECTO Y LLAVE DIGITAL */}
                  <div className="bg-amber-50/60 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="checkin-directo"
                      checked={walkinCheckinInmediato}
                      onChange={(e) => setWalkinCheckinInmediato(e.target.checked)}
                      className="w-4 h-4 rounded text-[#d91a2a] focus:ring-[#d91a2a] accent-[#d91a2a] mt-0.5 cursor-pointer shrink-0"
                    />
                    <label htmlFor="checkin-directo" className="text-xs text-slate-700 leading-relaxed cursor-pointer m-0">
                      <span className="font-extrabold text-slate-900">🏷️ Registrar check-in directo (El huésped ya se encuentra físicamente en el hotel):</span>{' '}
                      Se expedirá y enviará al correo el código de acceso a cerradura digital Yale para el <strong>{selectedHab ? `Apto ${selectedHab.numero} (${selectedHab.tipo})` : 'apartamento seleccionado'}</strong> y se registrará formalmente el ingreso en la bitácora activa del PMS.
                    </label>
                  </div>

                  {/* 5. BOTONES DE ACCIÓN */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHuesped(null);
                        setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
                        setPmsWalkInGuest({ tipo_documento: 'Cédula de Ciudadanía', documento: '', nombre: '', telefono: '', correo: '' });
                        setWalkinCheckinInmediato(true);
                      }}
                      style={{ height: '44px', borderRadius: '12px' }}
                      className="px-6 border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                      <span>Limpiar Formulario</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{ height: '44px', borderRadius: '12px' }}
                      className="px-8 bg-[#d91a2a] hover:bg-[#b91522] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#d91a2a]/25 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{loading ? 'Guardando Reserva...' : 'Confirmar Reserva Presencial (Check-in)'}</span>
                    </button>
                  </div>
                </form>
              </div>
            );
          })()}

          {/* 2. SUB-PESTAÑA 2: HUÉSPEDES REGISTRADOS */}
          {(pmsSubTab === 'huespedes' || pmsSubTab === 'todos') && (() => {
            const totalH = huespedes.length;
            const activosH = huespedes.filter(h => h.estado === 'Activo').length;
            const pctActivos = totalH > 0 ? ((activosH / totalH) * 100).toFixed(1) : 100;
            const particularesH = huespedes.filter(h => !h.empresa).length;
            const corporativosH = huespedes.filter(h => !!h.empresa).length || huespedes.filter(h => h.lealtad === 'Gold' || h.lealtad === 'Platinum').length;

            const startIdx = filteredHuespedes.length > 0 ? (validHuespedPage - 1) * HUESPEDES_PER_PAGE + 1 : 0;
            const endIdx = Math.min(validHuespedPage * HUESPEDES_PER_PAGE, filteredHuespedes.length);

            return (
              <div id="pms-huespedes-module" className="space-y-6 mb-6">
                
                {/* 1. TARJETAS DE MÉTRICAS RÁPIDAS (KPIs) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Huéspedes</span>
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">{totalH}</div>
                      <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">● 100% Sede Chicó</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Activos en Sistema</span>
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">{activosH}</div>
                      <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">● {pctActivos}% Habilitados</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Particulares</span>
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">{particularesH}</div>
                      <span className="text-[11px] font-semibold text-slate-500 mt-1 inline-block">Cédula / Pasaporte</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      <UserCheck className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Cuentas Corporativas</span>
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">{corporativosH}</div>
                      <span className="text-[11px] font-semibold text-slate-500 mt-1 inline-block">Empresas & Convenios</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* 2. CONTENEDOR PRINCIPAL: CABECERA, BÚSQUEDA Y TABLA */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                  
                  {/* Cabecera del Módulo */}
                  <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#d91a2a] flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 m-0">
                            Huéspedes Registrados
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#d91a2a] text-white text-xs font-bold">
                            {totalH} Registros
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hidden sm:inline">
                            Sede Chicó • PMS Core
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-0">
                          Control centralizado de perfiles de clientes, auditoría de trazabilidad de registro, estados de cuenta y emisión directa de reservas inmediatas.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={handleExportarHuespedesCSV}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                        title="Exportar base de datos a archivo CSV"
                      >
                        <Download className="w-4 h-4 text-slate-500" />
                        <span>Exportar CSV</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowGuestAuthModal(true);
                          setGuestAuthTab('registro');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#d91a2a] hover:bg-[#b91522] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-[#d91a2a]/20 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Nuevo Huésped</span>
                      </button>
                    </div>
                  </div>

                  {/* Barra de Filtros y Búsqueda */}
                  <div className="p-4 sm:px-8 bg-slate-50/60 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={huespedSearch}
                        onChange={(e) => {
                          setHuespedSearch(e.target.value);
                          setHuespedCurrentPage(1);
                        }}
                        placeholder="Buscar por nombre completo, documento de identidad o correo..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-xs font-bold text-slate-500 shrink-0">Tipo:</label>
                        <select
                          value={huespedTipoFilter}
                          onChange={(e) => {
                            setHuespedTipoFilter(e.target.value);
                            setHuespedCurrentPage(1);
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:border-[#d91a2a] outline-none cursor-pointer"
                        >
                          <option value="TODOS">Todos los registros</option>
                          <option value="PARTICULAR">Solo Particulares</option>
                          <option value="CORPORATIVO">Empresas & Corporativos</option>
                          <option value="FRECUENTE">Huéspedes Frecuentes (Gold/Platinum)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-xs font-bold text-slate-500 shrink-0">Estado:</label>
                        <select
                          value={huespedEstadoFilter}
                          onChange={(e) => {
                            setHuespedEstadoFilter(e.target.value);
                            setHuespedCurrentPage(1);
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:border-[#d91a2a] outline-none cursor-pointer"
                        >
                          <option value="TODOS">Todos</option>
                          <option value="ACTIVO">Activos</option>
                          <option value="INACTIVO">Inactivos</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Tabla Operativa */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                          <th className="px-6 sm:px-8 py-3.5">Huésped / Perfil</th>
                          <th className="px-6 py-3.5">Documento</th>
                          <th className="px-6 py-3.5">Contacto & Correo</th>
                          <th className="px-6 py-3.5">Estado</th>
                          <th className="px-6 sm:px-8 py-3.5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                        {paginatedHuespedes.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-medium">
                              No se encontraron huéspedes con los filtros seleccionados.
                            </td>
                          </tr>
                        ) : (
                          paginatedHuespedes.map((h) => {
                            const iniciales = h.nombre
                              ? h.nombre.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase()
                              : 'HU';
                            const tipoDocLabel = h.documento?.toUpperCase().startsWith('P')
                              ? 'Pasaporte Internacional'
                              : 'Cédula de Ciudadanía';

                            return (
                              <tr key={h.id_huesped} className="hover:bg-slate-50/80 transition-colors">
                                {/* Huésped / Perfil */}
                                <td className="px-6 sm:px-8 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-red-50 text-[#d91a2a] font-black text-xs flex items-center justify-center shrink-0 border border-red-100">
                                      {iniciales}
                                    </div>
                                    <div>
                                      <div className="font-extrabold text-slate-900 leading-tight">
                                        {h.nombre}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold text-slate-600">
                                          {h.empresa || 'Particular'}
                                        </span>
                                        <span className="text-[11px] text-red-700 font-semibold">
                                          • Auditoría: {h.creado_por || h.modificado_por || 'Recepción Presencial Walk-in'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Documento */}
                                <td className="px-6 py-4">
                                  <div className="font-bold text-slate-800">{h.documento || 'No registrado'}</div>
                                  <div className="text-[11px] text-slate-500">{tipoDocLabel}</div>
                                </td>

                                {/* Contacto & Correo */}
                                <td className="px-6 py-4">
                                  <a
                                    href={`mailto:${h.correo}`}
                                    className="text-slate-800 font-medium flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                                    style={{ textDecoration: 'none' }}
                                  >
                                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{h.correo}</span>
                                  </a>
                                  {h.telefono ? (
                                    <a
                                      href={`https://wa.me/${String(h.telefono).replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-slate-600 text-xs mt-0.5 flex items-center gap-1.5 font-mono hover:text-emerald-600 transition-colors"
                                      style={{ textDecoration: 'none' }}
                                    >
                                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span>{h.telefono}</span>
                                    </a>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 italic block mt-0.5">Sin teléfono registrado</span>
                                  )}
                                </td>

                                {/* Estado */}
                                <td className="px-6 py-4">
                                  {h.estado === 'Activo' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                      Activo
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>
                                      Inactivo
                                    </span>
                                  )}
                                </td>

                                {/* Acciones */}
                                <td className="px-6 sm:px-8 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedHuesped(h);
                                        setPmsWalkInGuest({
                                          tipo_documento: h.documento?.toUpperCase().startsWith('P') ? 'Pasaporte' : 'Cédula de Ciudadanía',
                                          documento: h.documento || '',
                                          nombre: h.nombre || '',
                                          telefono: h.telefono || '',
                                          correo: h.correo || ''
                                        });
                                        setPmsSubTab('recepcion');
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                      title="Crear reserva directa para este huésped en Recepción Walk-in"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>+ Reservar</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleEstadoHuesped(h)}
                                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                        h.estado === 'Activo'
                                          ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                                          : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                      }`}
                                    >
                                      {h.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteHuesped(h.id_huesped)}
                                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                      title="Eliminar registro de huésped"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación al Pie */}
                  <div className="p-4 sm:px-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
                    <div>
                      Mostrando <strong>{startIdx} - {endIdx}</strong> de <strong>{filteredHuespedes.length}</strong> huéspedes registrados en el PMS
                    </div>
                    {totalHuespedesPages > 1 && (
                      <div className="flex items-center gap-1.5 self-center sm:self-auto">
                        <button
                          type="button"
                          disabled={validHuespedPage === 1}
                          onClick={() => setHuespedCurrentPage(p => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          Anterior
                        </button>

                        {Array.from({ length: totalHuespedesPages }, (_, i) => i + 1).map((pg) => (
                          <button
                            key={pg}
                            type="button"
                            onClick={() => setHuespedCurrentPage(pg)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              validHuespedPage === pg
                                ? 'bg-[#d91a2a] text-white shadow-xs'
                                : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {pg}
                          </button>
                        ))}

                        <button
                          type="button"
                          disabled={validHuespedPage === totalHuespedesPages}
                          onClick={() => setHuespedCurrentPage(p => Math.min(totalHuespedesPages, p + 1))}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          Siguiente
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })()}

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

          {/* PIE DE PÁGINA OPERATIVO DEL PMS */}
          <footer className="mt-8 pt-4 pb-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
            <div>
              © 2026 Facile Apartamentos • Property Management System (PMS)
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Servidor Central: Activo
              </span>
              <span>•</span>
              <span>Latencia: 24ms</span>
              <span>•</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold border border-slate-200/60">
                Terminal ID: REC-01-MED
              </span>
            </div>
          </footer>
          </div>
        </section>
  );
};

export default VistaPms;
