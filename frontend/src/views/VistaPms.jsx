import { useState, useMemo, useCallback } from 'react';
import {
  UserPlus, ShieldCheck, Users, Calendar, ListOrdered, Trash2,
  Wrench, Check, Search, Tag, Mail, Shield, User, AlertTriangle,
  CheckCircle2, X, Clock, KeyRound, RotateCcw, Sparkles, Ban, CheckCircle, Home,
  Building2, UserCheck, Download, Plus, Phone, Key, Building, CreditCard, ArrowRight,
  CalendarCheck, Bed, Briefcase, Monitor
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import HuespedesPicker from '../components/HuespedesPicker.jsx';

// Lista de indicativos telefónicos internacionales para recepción presencial
const LISTA_PAISES_INDICATIVOS = [
  { code: '+57', flag: '🇨🇴', label: '🇨🇴 +57 (Colombia)' },
  { code: '+1', flag: '🇺🇸', label: '🇺🇸 +1 (EE.UU. / CA)' },
  { code: '+34', flag: '🇪🇸', label: '🇪🇸 +34 (España)' },
  { code: '+52', flag: '🇲🇽', label: '🇲🇽 +52 (México)' },
  { code: '+54', flag: '🇦🇷', label: '🇦🇷 +54 (Argentina)' },
  { code: '+56', flag: '🇨🇱', label: '🇨🇱 +56 (Chile)' },
  { code: '+55', flag: '🇧🇷', label: '🇧🇷 +55 (Brasil)' },
  { code: '+51', flag: '🇵🇪', label: '🇵🇪 +51 (Perú)' },
  { code: '+593', flag: '🇪🇨', label: '🇪🇨 +593 (Ecuador)' },
  { code: '+507', flag: '🇵🇦', label: '🇵🇦 +507 (Panamá)' },
  { code: '+58', flag: '🇻🇪', label: '🇻🇪 +58 (Venezuela)' },
  { code: '+506', flag: '🇨🇷', label: '🇨🇷 +506 (Costa Rica)' },
  { code: '+502', flag: '🇬🇹', label: '🇬🇹 +502 (Guatemala)' },
  { code: '+503', flag: '🇸🇻', label: '🇸🇻 +503 (El Salvador)' },
  { code: '+504', flag: '🇭🇳', label: '🇭🇳 +504 (Honduras)' },
  { code: '+591', flag: '🇧🇴', label: '🇧🇴 +591 (Bolivia)' },
  { code: '+595', flag: '🇵🇾', label: '🇵🇾 +595 (Paraguay)' },
  { code: '+598', flag: '🇺🇾', label: '🇺🇾 +598 (Uruguay)' },
  { code: '+33', flag: '🇫🇷', label: '🇫🇷 +33 (Francia)' },
  { code: '+49', flag: '🇩🇪', label: '🇩🇪 +49 (Alemania)' },
  { code: '+44', flag: '🇬🇧', label: '🇬🇧 +44 (Reino Unido)' },
  { code: '+39', flag: '🇮🇹', label: '🇮🇹 +39 (Italia)' },
  { code: '+351', flag: '🇵🇹', label: '🇵🇹 +351 (Portugal)' },
  { code: '+41', flag: '🇨🇭', label: '🇨🇭 +41 (Suiza)' },
  { code: '+31', flag: '🇳🇱', label: '🇳🇱 +31 (Países Bajos)' },
  { code: '+81', flag: '🇯🇵', label: '🇯🇵 +81 (Japón)' },
  { code: '+86', flag: '🇨🇳', label: '🇨🇳 +86 (China)' },
  { code: '+61', flag: '🇦🇺', label: '🇦🇺 +61 (Australia)' }
];

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

  // Detección robusta de la cuenta activa (Tú)
  const checkIsSelf = useCallback((emp) => {
    if (!emp) return false;
    if (!usuarioSesion) {
      return Number(emp.id_empleado) === 2 || emp.usuario === 'admin';
    }
    const empUser = String(emp.usuario || '').toLowerCase().trim();
    const sesUser = String(usuarioSesion.usuario || '').toLowerCase().trim();
    if (empUser && sesUser && empUser === sesUser) return true;

    const empNom = String(emp.nombre || '').toLowerCase().trim();
    const sesNom = String(usuarioSesion.nombre || '').toLowerCase().trim();
    if (empNom && sesNom && (empNom === sesNom || empNom.includes(sesNom) || sesNom.includes(empNom))) return true;

    const empMail = String(emp.correo || '').toLowerCase().trim();
    const sesMail = String(usuarioSesion.correo || '').toLowerCase().trim();
    if (empMail && sesMail && empMail === sesMail) return true;

    const empId = String(emp.id_empleado || '');
    const sesId = String(usuarioSesion.id_empleado || usuarioSesion.sub || '');
    if (empId && sesId && empId === sesId) return true;

    if ((sesUser === 'admin' || sesNom.includes('administrador')) && (empUser === 'admin' || empId === '2')) {
      return true;
    }

    return false;
  }, [usuarioSesion]);

  // Filtrado y ordenamiento reactivo de empleados (orden natural por id_empleado para que las cuentas clave y la sesión activa aparezcan ordenadas en la página 1)
  const filteredEmpleados = useMemo(() => {
    const list = (empleadosList || []).filter(emp => {
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

    return list.sort((a, b) => {
      return (Number(a.id_empleado) || 0) - (Number(b.id_empleado) || 0);
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

  // Estados de Búsqueda, Filtros y Paginación para Reservas Activas
  const [reservaSearchQuery, setReservaSearchQuery] = useState('');
  const [reservaEstadoFilter, setReservaEstadoFilter] = useState('todos');
  const [reservaOrigenFilter, setReservaOrigenFilter] = useState('todos');
  const [reservaCurrentPage, setReservaCurrentPage] = useState(1);
  const RESERVAS_ITEMS_PER_PAGE = 8;

  const filteredReservas = useMemo(() => {
    return (reservas || []).filter(r => {
      const q = reservaSearchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        (r.huesped_nombre && r.huesped_nombre.toLowerCase().includes(q)) ||
        (r.huesped_documento && String(r.huesped_documento).toLowerCase().includes(q)) ||
        (r.habitacion_numero && String(r.habitacion_numero).toLowerCase().includes(q)) ||
        (r.id_reserva && String(r.id_reserva).includes(q));

      const matchEstado =
        reservaEstadoFilter === 'todos'
          ? r.estado !== 'Cancelada'
          : r.estado === reservaEstadoFilter;

      const matchOrigen =
        reservaOrigenFilter === 'todos' ||
        (reservaOrigenFilter === 'web' && r.creado_por?.includes('Web')) ||
        (reservaOrigenFilter === 'pms' && !r.creado_por?.includes('Web'));

      return matchSearch && matchEstado && matchOrigen;
    });
  }, [reservas, reservaSearchQuery, reservaEstadoFilter, reservaOrigenFilter]);

  const totalReservasPages = Math.max(1, Math.ceil(filteredReservas.length / RESERVAS_ITEMS_PER_PAGE));
  const validReservaPage = Math.min(reservaCurrentPage, totalReservasPages);

  const paginatedReservas = useMemo(() => {
    const start = (validReservaPage - 1) * RESERVAS_ITEMS_PER_PAGE;
    return filteredReservas.slice(start, start + RESERVAS_ITEMS_PER_PAGE);
  }, [filteredReservas, validReservaPage]);

  // Estados de Búsqueda, Filtros y Paginación para Mantenimiento y Aseo (Plantas)
  const [plantaSearchQuery, setPlantaSearchQuery] = useState('');
  const [plantaEstadoFilter, setPlantaEstadoFilter] = useState('todos');
  const [plantaTipoFilter, setPlantaTipoFilter] = useState('todos');
  const [plantaCurrentPage, setPlantaCurrentPage] = useState(1);
  const PLANTA_ITEMS_PER_PAGE = 8;

  const filteredPlantas = useMemo(() => {
    return (habitaciones || []).filter(h => {
      const q = plantaSearchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        (h.numero && String(h.numero).toLowerCase().includes(q)) ||
        (h.tipo && h.tipo.toLowerCase().includes(q)) ||
        (h.detalle_mantenimiento && h.detalle_mantenimiento.toLowerCase().includes(q));

      const matchEstado =
        plantaEstadoFilter === 'todos' ||
        (plantaEstadoFilter === 'En limpieza' && h.estado === 'En limpieza') ||
        (plantaEstadoFilter === 'Mantenimiento' && h.estado === 'Mantenimiento') ||
        (plantaEstadoFilter === 'Disponible' && h.estado === 'Disponible') ||
        (plantaEstadoFilter === 'Ocupada' && h.estado === 'Ocupada');

      const matchTipo = plantaTipoFilter === 'todos' || h.tipo === plantaTipoFilter;

      return matchSearch && matchEstado && matchTipo;
    });
  }, [habitaciones, plantaSearchQuery, plantaEstadoFilter, plantaTipoFilter]);

  const totalPlantaPages = Math.max(1, Math.ceil(filteredPlantas.length / PLANTA_ITEMS_PER_PAGE));
  const validPlantaPage = Math.min(plantaCurrentPage, totalPlantaPages);

  const paginatedPlantas = useMemo(() => {
    const start = (validPlantaPage - 1) * PLANTA_ITEMS_PER_PAGE;
    return filteredPlantas.slice(start, start + PLANTA_ITEMS_PER_PAGE);
  }, [filteredPlantas, validPlantaPage]);

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
                        const isSelf = checkIsSelf(emp);

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
                                  title="Tu cuenta actual (Sesión Activa - No puedes auto-degradar tu rol)"
                                  className="pms-role-badge-self"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 14px',
                                    borderRadius: '12px',
                                    fontSize: '0.82rem',
                                    fontWeight: 800,
                                    color: '#7e22ce',
                                    backgroundColor: '#f3e8ff',
                                    border: '1px solid #ddd6fe',
                                    boxShadow: '0 1px 3px rgba(126, 34, 206, 0.1)',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <span>👑</span>
                                  <span>{emp.rol || 'Administrador'} (Tú)</span>
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
                                <span
                                  className="pms-status-pill"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: '#15803d',
                                    backgroundColor: '#dcfce7',
                                    border: '1px solid #bbf7d0',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }}></span>
                                  <span>Activo</span>
                                </span>
                              ) : (
                                <span
                                  className="pms-status-pill"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: '#b91c1c',
                                    backgroundColor: '#fee2e2',
                                    border: '1px solid #fecdd3',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'inline-block' }}></span>
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
                                <span
                                  className="pms-session-active-pill"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '6px',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    fontStyle: 'italic',
                                    color: '#64748b',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <span style={{ fontSize: '0.9rem' }}>🔒</span>
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
                                  className={emp.estado === 'Activo' ? 'pms-action-btn-danger' : 'pms-action-btn-success'}
                                  style={
                                    emp.estado === 'Activo'
                                      ? {
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '6px 16px',
                                          borderRadius: '10px',
                                          fontSize: '0.8rem',
                                          fontWeight: 700,
                                          color: '#b91c1c',
                                          backgroundColor: '#fef2f2',
                                          border: '1px solid #fecdd3',
                                          cursor: 'pointer',
                                          whiteSpace: 'nowrap'
                                        }
                                      : {
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '6px 16px',
                                          borderRadius: '10px',
                                          fontSize: '0.8rem',
                                          fontWeight: 700,
                                          color: '#047857',
                                          backgroundColor: '#ecfdf5',
                                          border: '1px solid #a7f3d0',
                                          cursor: 'pointer',
                                          whiteSpace: 'nowrap'
                                        }
                                  }
                                  title={emp.estado === 'Activo' ? 'Desactivar acceso al sistema' : 'Activar colaborador'}
                                >
                                  {emp.estado === 'Activo' ? (
                                    <>
                                      <Ban size={14} style={{ color: '#dc2626' }} />
                                      <span>Desactivar</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle size={14} style={{ color: '#16a34a' }} />
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
            const porcentajeDcto = noches >= 15 ? 15 : (noches >= 7 ? 10 : 0);
            const descuentoCalculado = cotizacion?.descuento !== undefined ? cotizacion.descuento : (noches >= 15 ? subtotalCalculado * 0.15 : (noches >= 7 ? subtotalCalculado * 0.10 : 0));
            const totalFacturar = cotizacion?.total !== undefined ? cotizacion.total : Math.max(0, subtotalCalculado - descuentoCalculado);

            return (
              <div id="pms-reception-reserva-module" className="w-full mx-auto space-y-8 mb-6">
                
                {/* 1. ENCABEZADO CON IDENTIFICACIÓN INSTITUCIONAL */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-1.5 rounded-lg bg-red-50 text-[#d91a2a]">
                        <Calendar className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#d91a2a]">
                        Módulo de Recepción
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-500">Operaciones en Vivo</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
                      Crear Nueva Reserva Presencial (Walk-In)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl mb-0">
                      Registre huéspedes al instante, asigne suites con disponibilidad en tiempo real y genere códigos de cerradura digital para emisión inmediata de llaves.
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', minWidth: '8px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block' }}></span>
                      Turno: AM / Recepción Principal
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', minWidth: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                      Atención Presencial en Hotel
                    </span>
                  </div>
                </div>

                {/* ALERTAS OPERATIVAS DEL PMS */}
                {reservaAlert && (
                  <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2.5 ${
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

                <form onSubmit={handleReservaSubmit} className="space-y-8">
                  
                  {/* 2. BLOQUE 1: IDENTIDAD DEL HUÉSPED & LOCALIZACIÓN */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs relative z-20">
                    {/* Acento rojo superior */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#d91a2a] via-rose-500 to-amber-500 rounded-t-3xl" />
                    
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 m-0">
                              1. Identidad del Huésped Presencial & Localización
                            </h3>
                            <span className="text-xs text-slate-400">
                              Búsqueda automática en base de datos de huéspedes frecuentes o registro rápido
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          Campos con (<span className="text-[#d91a2a]">*</span>) obligatorios
                        </span>
                      </div>

                      {/* Alerta Huésped VIP / Frecuente (SOLO VISIBLE SI SE ENCUENTRA UN HUÉSPED REGISTRADO) */}
                      {selectedHuesped && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-emerald-950">
                                  Huésped Frecuente Identificado
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wider uppercase">
                                  {guestNivel}
                                </span>
                              </div>
                              <p className="text-xs text-emerald-800/90 mt-0.5 mb-0">
                                {selectedHuesped.nombre} ha completado {guestReservasPrevias} estancias previas en BookingSoft. Datos sincronizados correctamente.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHuesped(null);
                              setPmsWalkInGuest(prev => ({ ...prev, documento: '', nombre: '', telefono: '', correo: '' }));
                            }}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-end sm:self-center cursor-pointer"
                            title="Limpiar datos de huésped"
                          >
                            <span>Limpiar datos</span>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Inputs del Huésped (LIMPIOS POR DEFECTO CON PLACEHOLDERS) */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Tipo de Documento */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Tipo de Documento <span className="text-[#d91a2a]">*</span>
                          </label>
                          <select
                            name="tipo_documento"
                            value={pmsWalkInGuest.tipo_documento}
                            onChange={handlePmsWalkInGuestChange}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-4 focus:ring-[#d91a2a]/10 outline-none transition-all cursor-pointer"
                          >
                            <option value="Cédula de Ciudadanía">Cédula de Ciudadanía (C.C.)</option>
                            <option value="Cédula de Extranjería">Cédula de Extranjería (C.E.)</option>
                            <option value="Pasaporte">Pasaporte Internacional</option>
                          </select>
                        </div>

                        {/* Número de Documento + Buscador */}
                        <div className="md:col-span-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700 m-0">
                              Número de Documento <span className="text-[#d91a2a]">*</span>
                            </label>
                            <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                              ↵ Enter para buscar
                            </span>
                          </div>
                          <div className="flex gap-2">
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
                                    let tel = match.telefono || '';
                                    let ind = '+57';
                                    if (tel.startsWith('+')) {
                                      const parts = tel.split(' ');
                                      if (parts.length > 1) {
                                        ind = parts[0];
                                        tel = parts.slice(1).join('');
                                      }
                                    }
                                    setPmsWalkInGuest(prev => ({
                                      ...prev,
                                      nombre: match.nombre,
                                      indicativo: ind,
                                      telefono: tel || prev.telefono,
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
                              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-4 focus:ring-[#d91a2a]/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                            />
                            <button
                              type="button"
                              onClick={() => handleBuscarHuespedPorDocumento(pmsWalkInGuest.documento)}
                              className="btn-pms-search-dark"
                              style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                              title="Buscar huésped por documento"
                            >
                              <Search className="w-4 h-4 text-white" />
                              <span className="text-white">Buscar</span>
                            </button>
                          </div>
                        </div>

                        {/* Nombre Completo */}
                        <div className="md:col-span-5">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Nombre Completo <span className="text-[#d91a2a]">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="nombre"
                              value={pmsWalkInGuest.nombre}
                              onChange={handlePmsWalkInGuestChange}
                              placeholder="Ej: Jose Miguel Chico"
                              required
                              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-4 focus:ring-[#d91a2a]/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                            />
                            {pmsWalkInGuest.nombre && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            )}
                          </div>
                        </div>

                        {/* Celular / WhatsApp Internacional */}
                        <div className="md:col-span-6">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Teléfono Móvil (WhatsApp) <span className="text-[#d91a2a]">*</span>
                          </label>
                          <div className="flex gap-2">
                            <select
                              name="indicativo"
                              value={pmsWalkInGuest.indicativo || '+57'}
                              onChange={handlePmsWalkInGuestChange}
                              className="w-40 sm:w-44 shrink-0 px-3 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-[#d91a2a] focus:ring-4 focus:ring-[#d91a2a]/10 outline-none transition-all cursor-pointer"
                              title="Seleccione nacionalidad e indicativo de país"
                            >
                              {LISTA_PAISES_INDICATIVOS.map(p => (
                                <option key={p.code + p.label} value={p.code}>
                                  {p.label}
                                </option>
                              ))}
                            </select>
                            <div className="relative flex-1">
                              <input
                                type="tel"
                                name="telefono"
                                value={pmsWalkInGuest.telefono}
                                onChange={handlePmsWalkInGuestChange}
                                placeholder="Ej: 3154449876"
                                maxLength={16}
                                required
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-4 focus:ring-[#d91a2a]/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Correo Electrónico */}
                        <div className="md:col-span-6">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Correo Electrónico <span className="text-[#d91a2a]">*</span>
                          </label>
                          <input
                            type="email"
                            name="correo"
                            value={pmsWalkInGuest.correo}
                            onChange={handlePmsWalkInGuestChange}
                            placeholder="Ej: jocmiguelcc@gmail.com"
                            required
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-4 focus:ring-[#d91a2a]/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. BLOQUE 2: ASIGNACIÓN DE HABITACIÓN & CALENDARIO */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs relative z-30">
                    <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-[#d91a2a] rounded-t-3xl" />
                    
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#d91a2a] flex items-center justify-center font-bold">
                            <Bed className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 m-0 tracking-tight">
                              2. Asignación de Unidad y Calendario de Estadía
                            </h3>
                            <span className="text-xs text-slate-400">
                              Seleccione el tipo de habitación disponible y defina el período de alojamiento
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Disponibilidad en vivo: {vacantesCount} Apartamentos Vacantes
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Apartamento / Habitación Seleccionada */}
                        <div className="md:col-span-7">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Apartamento / Habitación Seleccionada <span className="text-[#d91a2a]">*</span>
                          </label>
                          <select
                            name="id_habitacion"
                            value={reservaData.id_habitacion}
                            onChange={handleReservaChange}
                            required
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-4 focus:ring-[#d91a2a]/10 outline-none transition-all cursor-pointer"
                          >
                            <option value="">-- Seleccionar Apartamento Disponible --</option>
                            {habitaciones.map(hab => {
                              const digits = String(hab.numero || '').replace(/\D/g, '');
                              const piso = digits ? digits[0] : '1';
                              let icono = '🏢';
                              let nombreTipo = hab.tipo || 'Apartamento';
                              if (hab.tipo === 'Dúplex') {
                                icono = '🏢';
                                nombreTipo = 'Dúplex';
                              } else if (hab.tipo === 'Dobles') {
                                icono = '🛏️';
                                nombreTipo = 'Suite Doble';
                              } else if (hab.tipo === 'Familiares') {
                                icono = '👨‍👩‍👧‍👦';
                                nombreTipo = 'Suite Familiar';
                              } else if (hab.tipo === 'Habitaciones') {
                                icono = '🚪';
                                nombreTipo = 'Habitación Estándar';
                              }

                              const capText = hab.capacidad ? `(Capacidad: ${hab.capacidad} ${hab.capacidad === 1 ? 'persona' : 'personas'})` : '';
                              return (
                                <option key={hab.id_habitacion} value={hab.id_habitacion}>
                                  {icono} {nombreTipo} {hab.numero} — Piso {piso} {capText} — ${Number(hab.precio_noche || 0).toLocaleString('es-CO')} COP / Noche
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Ocupantes con Selector Airbnb (Adultos, Niños, Bebés, Mascotas) */}
                        <div className="md:col-span-5">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Número de Personas / Ocupantes <span className="text-[#d91a2a]">*</span>
                          </label>
                          <HuespedesPicker
                            maxCapacidad={selectedHab ? (selectedHab.capacidad || (selectedHab.tipo?.toLowerCase().includes('familiar') ? 6 : 4)) : 6}
                            variant="pms"
                            popoverAlign="right"
                            onChange={(val) => {
                              setReservaData(prev => ({
                                ...prev,
                                numero_personas: val.total || 1,
                                huespedes_detalle: val.summary
                              }));
                            }}
                          />
                        </div>

                        {/* Fecha Entrada */}
                        <div className="md:col-span-6">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700 m-0">
                              Fecha de Entrada (Check-In) <span className="text-[#d91a2a]">*</span>
                            </label>
                            <span
                              style={{
                                backgroundColor: '#f1f5f9',
                                color: '#64748b',
                                fontSize: '11px',
                                fontWeight: 500,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                border: 'none'
                              }}
                            >
                              Hora estándar: 15:00
                            </span>
                          </div>
                          <div
                            className="relative cursor-pointer"
                            onClick={() => {
                              const el = document.getElementById('pms-input-checkin');
                              if (el && typeof el.showPicker === 'function') el.showPicker();
                            }}
                          >
                            <input
                              id="pms-input-checkin"
                              type="date"
                              name="fecha_entrada"
                              min={new Date().toLocaleDateString('en-CA')}
                              value={reservaData.fecha_entrada || '2026-11-14'}
                              onChange={handleReservaChange}
                              onClick={(e) => e.target.showPicker && e.target.showPicker()}
                              required
                              className="pms-date-input w-full px-11 py-3 text-center rounded-2xl border border-slate-200 bg-slate-50/60 text-sm outline-none transition-all cursor-pointer focus:bg-white focus:border-[#d91a2a] focus:ring-4 focus:ring-[#d91a2a]/10"
                              style={{
                                color: '#334155',
                                fontWeight: 500,
                                fontSize: '0.88rem',
                                letterSpacing: 'normal',
                                textAlign: 'center'
                              }}
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-slate-400">
                              <Calendar className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        </div>

                        {/* Fecha Salida */}
                        <div className="md:col-span-6">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700 m-0">
                              Fecha de Salida (Check-Out) <span className="text-[#d91a2a]">*</span>
                            </label>
                            <span
                              style={{
                                backgroundColor: '#f1f5f9',
                                color: '#64748b',
                                fontSize: '11px',
                                fontWeight: 500,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                border: 'none'
                              }}
                            >
                              Hora límite: 11:00
                            </span>
                          </div>
                          <div
                            className="relative cursor-pointer"
                            onClick={() => {
                              const el = document.getElementById('pms-input-checkout');
                              if (el && typeof el.showPicker === 'function') el.showPicker();
                            }}
                          >
                            <input
                              id="pms-input-checkout"
                              type="date"
                              name="fecha_salida"
                              min={reservaData.fecha_entrada || new Date().toLocaleDateString('en-CA')}
                              value={reservaData.fecha_salida || '2026-11-16'}
                              onChange={handleReservaChange}
                              onClick={(e) => e.target.showPicker && e.target.showPicker()}
                              required
                              className="pms-date-input w-full px-11 py-3 text-center rounded-2xl border border-slate-200 bg-slate-50/60 text-sm outline-none transition-all cursor-pointer focus:bg-white focus:border-[#d91a2a] focus:ring-4 focus:ring-[#d91a2a]/10"
                              style={{
                                color: '#334155',
                                fontWeight: 500,
                                fontSize: '0.88rem',
                                letterSpacing: 'normal',
                                textAlign: 'center'
                              }}
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-emerald-600">
                              <CalendarCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CALENDARIO DE OCUPACIÓN INTERACTIVO */}
                      {reservaData.id_habitacion && (() => {
                        const todayObj = new Date();
                        const todayStr = todayObj.toLocaleDateString('en-CA');
                        const todayYear = todayObj.getFullYear();
                        const todayMonth = todayObj.getMonth();

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
                          const isPast = dayStr < todayStr;
                          const isOccupied = habReservas.some(r => dayStr >= r.fecha_entrada && dayStr <= r.fecha_salida);
                          const isSelectedIn = reservaData.fecha_entrada === dayStr;
                          const isSelectedOut = reservaData.fecha_salida === dayStr;
                          const inRange = reservaData.fecha_entrada && reservaData.fecha_salida && dayStr >= reservaData.fecha_entrada && dayStr <= reservaData.fecha_salida;
                          daysGrid.push({ d, dayStr, isPast, isOccupied, isSelectedIn, isSelectedOut, inRange });
                        }

                        const handleDayClick = (item) => {
                          if (!item || item.isOccupied || item.isPast) return;
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

                        const isPrevMonthDisabled = year < todayYear || (year === todayYear && month <= todayMonth);

                        return (
                          <div className="bg-slate-50/50 rounded-2xl border border-slate-200/90 p-4 mt-2">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                              <button
                                type="button"
                                disabled={isPrevMonthDisabled}
                                onClick={() => setCalDate(new Date(year, month - 1, 1))}
                                className={`px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold transition-colors ${
                                  isPrevMonthDisabled
                                    ? 'bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
                                }`}
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
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 text-slate-300 flex items-center justify-center text-[9px] font-black opacity-60">
                                  —
                                </span>
                                <span>Pasado</span>
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

                                if (item.isPast) {
                                  return (
                                    <div
                                      key={item.dayStr}
                                      title={`Fecha pasada (${item.dayStr}) no permitida`}
                                      className="h-9 rounded-lg bg-slate-100/50 border border-slate-200/50 text-slate-300 text-xs font-medium flex items-center justify-center cursor-not-allowed select-none opacity-50"
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
                  </div>

                  {/* 4. BLOQUE OSCURO DE COTIZACIÓN EN VIVO (LIVE PRICING EXACTO A IMAGEN 2) */}
                  <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
                    <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-red-500/10 text-rose-500 border border-red-500/20">
                          <CreditCard className="w-5 h-5" />
                        </span>
                        <div>
                          <h4 className="text-base font-extrabold text-white m-0 tracking-tight">
                            Resumen de Cotización en Tiempo Real
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 mb-0">Cálculo automático con impuestos hoteleros incluidos</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        MONEDA: COP ($)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
                      {/* Tarjeta 1: Estadía Total */}
                      <div className="card-pms-pricing-dark">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Estadía Total
                          </span>
                          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                        <div className="text-2xl font-black text-white">{noches} {noches === 1 ? 'Noche' : 'Noches'}</div>
                        <span className="text-xs text-slate-400 mt-1 block">
                          {reservaData.fecha_entrada && reservaData.fecha_salida ? `${reservaData.fecha_entrada} — ${reservaData.fecha_salida}` : '14 Nov — 16 Nov 2026'}
                        </span>
                      </div>

                      {/* Tarjeta 2: Tarifa por Noche */}
                      <div className="card-pms-pricing-dark">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Tarifa por Noche
                          </span>
                          <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                        <div className="text-2xl font-black text-white">${tarifaNoche.toLocaleString('es-CO')} <span className="text-xs font-normal text-slate-400">COP</span></div>
                        {descuentoCalculado > 0 ? (
                          <span className="text-xs text-emerald-400 font-bold mt-1 block">
                            🎉 Dcto. Larga Estadía ({porcentajeDcto}%)
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-400 font-semibold mt-1 block">✓ Tarifa Estándar Walk-In</span>
                        )}
                      </div>

                      {/* Tarjeta 3: Depósito en Garantía */}
                      <div className="card-pms-pricing-dark">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Depósito en Garantía
                          </span>
                          <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                        <div className="text-2xl font-black text-white">${depositoGarantia.toLocaleString('es-CO')} <span className="text-xs font-normal text-slate-400">COP</span></div>
                        <span className="text-xs text-amber-400 font-semibold mt-1 block">(100% Reembolsable)</span>
                      </div>

                      {/* Tarjeta 4: Total a Facturar Presencial (Exacto a Imagen 2) */}
                      <div className="card-pms-pricing-total" style={{ background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 55%, #881337 100%)', boxShadow: '0 8px 24px rgba(217, 26, 42, 0.4)' }}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="text-[11px] font-black uppercase tracking-wider text-white leading-tight">
                            Total a<br />Facturar
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white shrink-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}>
                            Liquidación Inmediata
                          </span>
                        </div>
                        {descuentoCalculado > 0 && (
                          <div className="text-[11px] text-red-200/90 line-through font-semibold -mb-1">
                            Base: ${subtotalCalculado.toLocaleString('es-CO')} COP
                          </div>
                        )}
                        <div className="text-3xl font-black tracking-tight text-white my-0.5">
                          ${totalFacturar.toLocaleString('es-CO')} <span className="text-xs font-bold text-red-100">COP</span>
                        </div>
                        {descuentoCalculado > 0 ? (
                          <span className="text-[11px] text-emerald-200 font-bold block">
                            🎉 Ahorro aplicado: -${descuentoCalculado.toLocaleString('es-CO')} COP ({porcentajeDcto}%)
                          </span>
                        ) : (
                          <span className="text-[11px] text-red-100 font-medium block">
                            Incluye impuestos y seguro hotelero
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Banner de Desglose de Descuento de Larga Estadía (Misma Lógica del Portal Principal) */}
                    {descuentoCalculado > 0 ? (
                      <div className="mt-5 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🎉</span>
                          <div>
                            <span className="text-xs sm:text-sm font-extrabold text-emerald-300 block">
                              ¡Descuento de Larga Estadía Activado ({porcentajeDcto}% de Ahorro Automático)!
                            </span>
                            <span className="text-[11px] text-slate-300 font-medium">
                              Subtotal base: <span className="line-through text-slate-400">${subtotalCalculado.toLocaleString('es-CO')} COP</span> por estadía de {noches} noches.
                            </span>
                          </div>
                        </div>
                        <div className="bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1.5 rounded-xl text-left sm:text-right shrink-0">
                          <span className="text-[10px] uppercase font-bold text-emerald-300/90 block">Ahorro Aplicado</span>
                          <span className="text-xs sm:text-sm font-black text-emerald-300">-${descuentoCalculado.toLocaleString('es-CO')} COP</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-400">
                        <div className="flex items-center gap-2 text-xs">
                          <span>💡</span>
                          <span>
                            <strong>Ahorro por estadía prolongada:</strong> Estadías de 7 a 14 noches reciben <strong>10% de descuento automático</strong>, y de 15 o más noches reciben <strong>15% de descuento</strong>.
                          </span>
                        </div>
                        {noches < 7 && (
                          <span className="text-[11px] text-amber-400 font-semibold whitespace-nowrap">
                            Faltan {7 - noches} {7 - noches === 1 ? 'noche' : 'noches'} para el 10%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 5. CHECK-IN DIRECTO & YALE CONNECT SMARTLOCK (EXACTO A IMAGEN 2) */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="checkin-directo"
                      checked={walkinCheckinInmediato}
                      onChange={(e) => setWalkinCheckinInmediato(e.target.checked)}
                      className="w-5 h-5 rounded-md text-[#d91a2a] focus:ring-[#d91a2a] accent-[#d91a2a] mt-0.5 cursor-pointer shrink-0"
                    />
                    <label htmlFor="checkin-directo" className="text-xs sm:text-sm text-slate-700 leading-relaxed cursor-pointer m-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-xs">🔑</span>
                        <span className="font-extrabold text-slate-900">
                          Registrar Check-In Directo Inmediato (Huésped presente en el lobby)
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black tracking-wider uppercase border border-amber-200">
                          🔒 Yale Connect Smartlock
                        </span>
                      </div>
                      Al confirmar, el PMS generará de inmediato el código dinámico de cerradura digital Yale para el apartamento <strong>{selectedHab ? `Apto ${selectedHab.numero} (${selectedHab.tipo})` : 'apartamento seleccionado'}</strong>, enviará el enlace de llave móvil al correo <strong>{pmsWalkInGuest.correo || 'indicado'}</strong> y WhatsApp, y actualizará la bitácora activa del hotel a estado <span className="font-bold text-emerald-700">"Ocupada (Check-in Realizado)"</span>.
                    </label>
                  </div>

                  {/* 6. BOTONES DE ACCIÓN (EXACTOS A IMAGEN 2) */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-end gap-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHuesped(null);
                        setReservaData({ id_habitacion: '', fecha_entrada: '', fecha_salida: '', numero_personas: 1 });
                        setPmsWalkInGuest({ tipo_documento: 'Cédula de Ciudadanía', documento: '', nombre: '', indicativo: '+57', telefono: '', correo: '' });
                        setWalkinCheckinInmediato(false);
                      }}
                      className="btn-pms-clear"
                      style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <span>Limpiar Formulario</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-pms-confirm"
                      style={{ backgroundColor: '#d91a2a', color: '#ffffff' }}
                    >
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>{loading ? 'Confirmando Reserva...' : 'Confirmar Reserva Presencial & Emitir Llave'}</span>
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
            <div id="pms-reservas-module" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden mb-6">
              {/* Encabezado interno de la tarjeta */}
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
                    <ListOrdered size={20} className="text-slate-800" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 m-0">
                        📑 Panel de Auditoría — Reservas Activas del Hotel
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#d91a2a] text-white text-xs font-bold">
                        {reservas.filter(r => r.estado !== 'Cancelada').length} Activas
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 mb-0">
                      Control de estancias, liquidación inmediata, seguimiento de Check-In/Check-Out y auditoría operativa.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPmsSubTab('recepcion')}
                  className="bg-[#0f172a] hover:bg-slate-800 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto shrink-0"
                >
                  <Plus size={15} />
                  <span>+ Nueva Reserva Presencial</span>
                </button>
              </div>

              {reservaAlert && (
                <div className={`mx-6 mt-4 p-3.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                  reservaAlert.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  <span>{reservaAlert.type === 'success' ? '✅' : '⚠️'}</span>
                  <span>{reservaAlert.message}</span>
                </div>
              )}

              {/* BARRA DE BÚSQUEDA Y FILTROS OPERATIVOS */}
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/40">
                <div className="flex flex-wrap items-center gap-3" style={{ flex: '1 1 auto' }}>
                  <div className="relative" style={{ minWidth: '280px', flex: '1 1 280px', maxWidth: '420px' }}>
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={reservaSearchQuery}
                      onChange={e => {
                        setReservaSearchQuery(e.target.value);
                        setReservaCurrentPage(1);
                      }}
                      placeholder="Buscar por huésped, documento o apartamento..."
                      className="w-full pl-9 pr-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#d91a2a] shadow-xs"
                    />
                  </div>

                  <select
                    value={reservaEstadoFilter}
                    onChange={e => {
                      setReservaEstadoFilter(e.target.value);
                      setReservaCurrentPage(1);
                    }}
                    style={{ minWidth: '160px' }}
                    className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#d91a2a] shadow-xs cursor-pointer"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Check-In">Check-In</option>
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>

                  <select
                    value={reservaOrigenFilter}
                    onChange={e => {
                      setReservaOrigenFilter(e.target.value);
                      setReservaCurrentPage(1);
                    }}
                    style={{ minWidth: '160px' }}
                    className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#d91a2a] shadow-xs cursor-pointer"
                  >
                    <option value="todos">Todos los orígenes</option>
                    <option value="web">Web Pública</option>
                    <option value="pms">Recepción / PMS</option>
                  </select>
                </div>

                <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  Mostrando <strong className="text-slate-800">{paginatedReservas.length}</strong> de <strong className="text-slate-800">{filteredReservas.length}</strong> reservas registradas
                </div>
              </div>

              {/* TABLA DE RESERVAS DEL SISTEMA */}
              <div className="overflow-x-auto" style={{ width: '100%' }}>
                <table className="pms-table-executive" style={{ minWidth: '1000px' }}>
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 border-b border-slate-200/80">
                      <th style={{ width: '24%' }}>Huésped</th>
                      <th style={{ width: '14%' }}>Apartamento</th>
                      <th style={{ width: '18%' }}>Fechas & Estadía</th>
                      <th style={{ width: '16%' }}>Estado</th>
                      <th style={{ width: '14%' }}>Origen</th>
                      <th style={{ width: '14%', textAlign: 'right' }}>Acción de Ciclo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedReservas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-slate-500 font-medium">
                          No se encontraron reservas con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      paginatedReservas.map((r, idx) => {
                        const avatar = getAvatarStyle(idx);
                        const initials = getInitials(r.huesped_nombre);
                        const estadoEstilos = {
                          'Confirmada': { bg: '#fef3c7', fg: '#b45309', border: '#fde68a', dot: '#d97706', label: 'Confirmada' },
                          'Check-In': { bg: '#dcfce7', fg: '#166534', border: '#bbf7d0', dot: '#16a34a', label: 'Check-In' },
                          'Completada': { bg: '#e0f2fe', fg: '#0369a1', border: '#bae6fd', dot: '#0284c7', label: 'Completada' },
                          'Cancelada': { bg: '#fee2e2', fg: '#991b1b', border: '#fca5a5', dot: '#dc2626', label: 'Cancelada' }
                        };
                        const est = estadoEstilos[r.estado] || { bg: '#f1f5f9', fg: '#475569', border: '#e2e8f0', dot: '#64748b', label: r.estado };

                        return (
                          <tr key={r.id_reserva} className="hover:bg-slate-50/50 transition-colors">
                            <td>
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 border"
                                  style={{
                                    backgroundColor: avatar.bgHex,
                                    color: avatar.textHex,
                                    borderColor: avatar.borderHex
                                  }}
                                >
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                    {r.huesped_nombre}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                    <span>Doc: {r.huesped_documento || 'No registrado'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe'
                                }}
                              >
                                🚪 Apto {r.habitacion_numero}
                              </span>
                            </td>
                            <td>
                              <div className="text-xs text-slate-700 font-semibold">
                                <div><span className="text-slate-400 font-medium">In:</span> {r.fecha_entrada}</div>
                                <div><span className="text-slate-400 font-medium">Out:</span> {r.fecha_salida}</div>
                              </div>
                            </td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '3px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: est.bg,
                                  color: est.fg,
                                  border: `1px solid ${est.border}`
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: est.dot }}></span>
                                {est.label}
                              </span>
                              {r.checkin_at && (
                                <div className="text-[10px] text-emerald-700 font-bold mt-1">
                                  Entrada: {r.checkin_at}
                                </div>
                              )}
                              {r.checkout_at && (
                                <div className="text-[10px] text-blue-700 font-bold mt-0.5">
                                  Salida: {r.checkout_at}
                                </div>
                              )}
                            </td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '3px 9px',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  backgroundColor: r.creado_por?.includes('Web') ? '#f0f9ff' : '#fefce8',
                                  color: r.creado_por?.includes('Web') ? '#0284c7' : '#854d0e',
                                  border: `1px solid ${r.creado_por?.includes('Web') ? '#bae6fd' : '#fef08a'}`
                                }}
                              >
                                {r.creado_por?.includes('Web') ? '🌐 Web Pública' : `👨‍💼 ${r.creado_por || 'Recepción'}`}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="flex items-center justify-end gap-2">
                                {r.estado === 'Confirmada' && (
                                  <button
                                    type="button"
                                    id={`pms-checkin-${r.id_reserva}`}
                                    onClick={() => handleCambiarEstadoReserva(r.id_reserva, 'Check-In')}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                  >
                                    <span>🚪 Check-in</span>
                                  </button>
                                )}
                                {r.estado === 'Check-In' && (
                                  <button
                                    type="button"
                                    id={`pms-checkout-${r.id_reserva}`}
                                    onClick={() => handleCambiarEstadoReserva(r.id_reserva, 'Completada')}
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                  >
                                    <span>🏁 Check-out</span>
                                  </button>
                                )}
                                {r.estado !== 'Completada' && r.estado !== 'Cancelada' && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReserva(r.id_reserva)}
                                    className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                )}
                                {r.estado === 'Completada' && (
                                  <span className="text-xs text-slate-400 font-semibold">✓ Finalizada</span>
                                )}
                                {r.estado === 'Cancelada' && (
                                  <span className="text-xs text-red-400 font-semibold">✕ Anulada</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN INFERIOR DE RESERVAS */}
              <div className="p-4 sm:px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                  Página <strong>{validReservaPage}</strong> de <strong>{totalReservasPages}</strong>
                </div>

                {totalReservasPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={validReservaPage === 1}
                      onClick={() => setReservaCurrentPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Anterior
                    </button>

                    {Array.from({ length: totalReservasPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setReservaCurrentPage(pg)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          validReservaPage === pg
                            ? 'bg-[#0f172a] text-white shadow-xs'
                            : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={validReservaPage === totalReservasPages}
                      onClick={() => setReservaCurrentPage(p => Math.min(totalReservasPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. SUB-PESTAÑA 4: GESTIÓN DE PLANTAS (AMAS DE LLAVES & MANTENIMIENTO) */}
          {(pmsSubTab === 'planta' || pmsSubTab === 'todos') && (
            <div id="pms-operaciones-planta" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden mb-6">
              {/* Encabezado interno de la tarjeta */}
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
                    <Wrench size={20} className="text-slate-800" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 m-0">
                        {usuarioSesion?.rol === 'Ama de llaves' ? '🧹 Tablero de Aseo & Control de Unidades (Ama de Llaves)' :
                         usuarioSesion?.rol === 'Personal de mantenimiento' ? '🔧 Bitácora de Novedades Técnicas y Reparaciones (Mantenimiento)' :
                         '🛠️ Operaciones de Planta — Mantenimiento & Aseo Hotelero'}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                        {habitaciones.length} Apartamentos
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 mb-0">
                      {usuarioSesion?.rol === 'Ama de llaves' ? 'Realice el aseo de apartamentos y reporte inmediatamente cualquier avería técnica detectada al equipo de mantenimiento.' :
                       'Atienda y solucione los reportes de daños enviados por las amas de llaves para liberar las habitaciones a estado Disponible.'}
                    </p>
                  </div>
                </div>

                {/* Filtros rápidos estilo pastillas en la cabecera */}
                <div className="flex items-center gap-2 flex-wrap self-start md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setPlantaEstadoFilter(plantaEstadoFilter === 'En limpieza' ? 'todos' : 'En limpieza');
                      setPlantaCurrentPage(1);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: plantaEstadoFilter === 'En limpieza' ? '#fef3c7' : '#ffffff',
                      color: plantaEstadoFilter === 'En limpieza' ? '#92400e' : '#475569',
                      border: `1px solid ${plantaEstadoFilter === 'En limpieza' ? '#fcd34d' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>🧹 Aseo Pendiente ({habitaciones.filter(h => h.estado === 'En limpieza').length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPlantaEstadoFilter(plantaEstadoFilter === 'Mantenimiento' ? 'todos' : 'Mantenimiento');
                      setPlantaCurrentPage(1);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: plantaEstadoFilter === 'Mantenimiento' ? '#fee2e2' : '#ffffff',
                      color: plantaEstadoFilter === 'Mantenimiento' ? '#991b1b' : '#475569',
                      border: `1px solid ${plantaEstadoFilter === 'Mantenimiento' ? '#fca5a5' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>⚠️ Daños / Mantenimiento ({habitaciones.filter(h => h.estado === 'Mantenimiento').length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPlantaEstadoFilter('todos');
                      setPlantaTipoFilter('todos');
                      setPlantaCurrentPage(1);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: plantaEstadoFilter === 'todos' && plantaTipoFilter === 'todos' ? '#0f172a' : '#ffffff',
                      color: plantaEstadoFilter === 'todos' && plantaTipoFilter === 'todos' ? '#ffffff' : '#475569',
                      border: `1px solid ${plantaEstadoFilter === 'todos' && plantaTipoFilter === 'todos' ? '#0f172a' : '#cbd5e1'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>Ver Todas ({habitaciones.length})</span>
                  </button>
                </div>
              </div>

              {/* SECCIÓN DESTACADA DE NOVEDADES REPORTADAS POR AMA DE LLAVES (PARA MANTENIMIENTO) */}
              {habitaciones.some(h => h.estado === 'Mantenimiento') && (
                <div className="p-5 bg-rose-50/70 border-b border-rose-200/80">
                  <h4 className="text-xs sm:text-sm font-extrabold text-rose-900 mb-3 flex items-center gap-2 m-0">
                    <span>🚨 Bitácora de Daños Activos para Mantenimiento ({habitaciones.filter(h => h.estado === 'Mantenimiento').length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {habitaciones.filter(h => h.estado === 'Mantenimiento').map(h => (
                      <div key={h.id_habitacion} className="bg-white border border-rose-200 rounded-xl p-3.5 shadow-xs">
                        <div className="flex justify-between items-center mb-1.5">
                          <strong className="text-slate-900 text-sm font-black">Apartamento {h.numero}</strong>
                          <span className="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                            ⚠️ Avería Activa
                          </span>
                        </div>
                        <p className="text-xs text-rose-900 bg-rose-50/80 p-2 rounded-lg font-semibold m-0 mb-2 border border-rose-100">
                          📝 {h.detalle_mantenimiento || 'Reporte técnico general'}
                        </p>
                        {h.modificado_por && (
                          <div className="text-[11px] text-slate-500 mb-2.5">
                            👤 <strong>Reportado por:</strong> {h.modificado_por}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'Disponible')}
                          >
                            ✓ Reparado / Listo
                          </button>
                          <button
                            type="button"
                            className="py-1.5 px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            onClick={() => handleReportarDano(h)}
                          >
                            ✏️ Editar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BARRA DE BÚSQUEDA Y FILTROS OPERATIVOS */}
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/40">
                <div className="flex flex-wrap items-center gap-3" style={{ flex: '1 1 auto' }}>
                  <div className="relative" style={{ minWidth: '280px', flex: '1 1 280px', maxWidth: '420px' }}>
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={plantaSearchQuery}
                      onChange={e => {
                        setPlantaSearchQuery(e.target.value);
                        setPlantaCurrentPage(1);
                      }}
                      placeholder="Buscar por apartamento (Ej: H402, D102) o detalle..."
                      className="w-full pl-9 pr-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#d91a2a] shadow-xs"
                    />
                  </div>

                  <select
                    value={plantaEstadoFilter}
                    onChange={e => {
                      setPlantaEstadoFilter(e.target.value);
                      setPlantaCurrentPage(1);
                    }}
                    style={{ minWidth: '160px' }}
                    className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#d91a2a] shadow-xs cursor-pointer"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="Disponible">Disponible</option>
                    <option value="En limpieza">En limpieza</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Ocupada">Ocupada</option>
                  </select>

                  <select
                    value={plantaTipoFilter}
                    onChange={e => {
                      setPlantaTipoFilter(e.target.value);
                      setPlantaCurrentPage(1);
                    }}
                    style={{ minWidth: '160px' }}
                    className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#d91a2a] shadow-xs cursor-pointer"
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="Habitaciones">Habitaciones</option>
                    <option value="Dúplex">Dúplex</option>
                    <option value="Dobles">Dobles</option>
                    <option value="Familiares">Familiares</option>
                  </select>
                </div>

                <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  Mostrando <strong className="text-slate-800">{paginatedPlantas.length}</strong> de <strong className="text-slate-800">{filteredPlantas.length}</strong> apartamentos registrados
                </div>
              </div>

              {/* TABLA PRINCIPAL DE INVENTARIO DE HABITACIONES */}
              <div className="overflow-x-auto" style={{ width: '100%' }}>
                <table className="pms-table-executive" style={{ minWidth: '1000px' }}>
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 border-b border-slate-200/80">
                      <th style={{ width: '15%' }}>Apartamento</th>
                      <th style={{ width: '15%' }}>Tipo</th>
                      <th style={{ width: '15%' }}>Estado Actual</th>
                      <th style={{ width: '22%' }}>Detalle de Novedad</th>
                      <th style={{ width: '15%' }}>Última Modificación</th>
                      <th style={{ width: '18%', textAlign: 'right' }}>Acciones de Turno</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedPlantas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-slate-500 font-medium">
                          No se encontraron apartamentos con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      paginatedPlantas.map(h => {
                        const estadoPills = {
                          'Disponible': { bg: '#ecfdf5', fg: '#065f46', border: '#a7f3d0', dot: '#10b981', label: 'Disponible' },
                          'Ocupada': { bg: '#eff6ff', fg: '#1e40af', border: '#bfdbfe', dot: '#3b82f6', label: 'Ocupada' },
                          'En limpieza': { bg: '#fefce8', fg: '#854d0e', border: '#fef08a', dot: '#eab308', label: 'En limpieza' },
                          'Mantenimiento': { bg: '#fee2e2', fg: '#991b1b', border: '#fca5a5', dot: '#ef4444', label: 'Mantenimiento' }
                        };
                        const est = estadoPills[h.estado] || { bg: '#f1f5f9', fg: '#475569', border: '#cbd5e1', dot: '#64748b', label: h.estado };

                        return (
                          <tr key={h.id_habitacion} className="hover:bg-slate-50/50 transition-colors">
                            <td>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                Apto {h.numero}
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                Piso {h.piso || h.numero?.charAt(1) || '1'}
                              </div>
                            </td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '3px 9px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                  border: '1px solid #e2e8f0'
                                }}
                              >
                                {h.tipo}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 11px',
                                  borderRadius: '9999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: est.bg,
                                  color: est.fg,
                                  border: `1px solid ${est.border}`
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: est.dot }}></span>
                                {est.label}
                              </span>
                            </td>
                            <td>
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: h.detalle_mantenimiento ? 700 : 500,
                                  color: h.detalle_mantenimiento ? '#b91c1c' : '#64748b'
                                }}
                              >
                                {h.detalle_mantenimiento || '— Sin novedades'}
                              </div>
                            </td>
                            <td>
                              <div className="text-xs text-slate-500 font-medium truncate max-w-[180px]" title={h.modificado_por || 'Sistema'}>
                                {h.modificado_por || 'Sistema'}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'Disponible')}
                                  title="Marcar Apto Limpio y Listo para Huéspedes"
                                  className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                                >
                                  ✓ Marcar Disponible
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCambiarEstadoHabitacion(h.id_habitacion, 'En limpieza')}
                                  title="Iniciar Aseo y Cambio de Lencería"
                                  className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                                >
                                  🧹 En Limpieza
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReportarDano(h)}
                                  title="Reportar Daño a Mantenimiento"
                                  className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold transition-colors cursor-pointer"
                                >
                                  ⚠️ Reportar Daño
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

              {/* PAGINACIÓN INFERIOR DE PLANTA */}
              <div className="p-4 sm:px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                  Página <strong>{validPlantaPage}</strong> de <strong>{totalPlantaPages}</strong>
                </div>

                {totalPlantaPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={validPlantaPage === 1}
                      onClick={() => setPlantaCurrentPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Anterior
                    </button>

                    {Array.from({ length: totalPlantaPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setPlantaCurrentPage(pg)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          validPlantaPage === pg
                            ? 'bg-[#0f172a] text-white shadow-xs'
                            : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={validPlantaPage === totalPlantaPages}
                      onClick={() => setPlantaCurrentPage(p => Math.min(totalPlantaPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. SUB-PESTAÑA 5: CENTRO DE NEGOCIOS — RESERVAS POR HORAS & COWORKING */}
          {(pmsSubTab === 'coworking' || pmsSubTab === 'todos') && (() => {
            const espacioActual = espaciosNegocio.find(e => String(e.id_espacio) === String(reservaNegocioForm.id_espacio)) || espaciosNegocio[0];
            const tarifaBase = espacioActual ? Number(espacioActual.precio_hora) : 70000;

            let horasCalculadas = 2.0;
            if (reservaNegocioForm.hora_inicio && reservaNegocioForm.hora_fin) {
              const [h1, m1] = reservaNegocioForm.hora_inicio.split(':').map(Number);
              const [h2, m2] = reservaNegocioForm.hora_fin.split(':').map(Number);
              const diff = (h2 + m2 / 60) - (h1 + m1 / 60);
              if (diff > 0) horasCalculadas = Math.round(diff * 10) / 10;
            }
            const subtotalNegocio = Math.round(tarifaBase * horasCalculadas);

            // Agenda activa de hoy (combina reservas reales con agenda operativa de demostración si está vacía)
            const reservasMostrar = reservasNegocio.length > 0 ? reservasNegocio : [
              {
                id_reserva_negocio: 'res-demo-1',
                espacio: 'Sala de Juntas 1',
                tipo_espacio: '10 pax',
                nombre_cliente: 'Jose Miguel Chico',
                origen_desc: 'Apto D101 • Huésped Facile',
                hora_inicio: '09:00',
                hora_fin: '11:00',
                duracion_horas: '2 horas (En uso)',
                precio_total: 140000,
                estado: 'EN_CURSO'
              },
              {
                id_reserva_negocio: 'res-demo-2',
                espacio: 'Sala de Juntas 2',
                tipo_espacio: '10 pax',
                nombre_cliente: 'Inversiones Tech SAS',
                origen_desc: 'NIT: 901.442.110-3 • Cliente Externo',
                hora_inicio: '14:00',
                hora_fin: '17:00',
                duracion_horas: '3 horas',
                precio_total: 210000,
                estado: 'CONFIRMADA'
              },
              {
                id_reserva_negocio: 'res-demo-3',
                espacio: 'Coworking Puesto 4',
                tipo_espacio: 'Flex Desk Conectividad',
                nombre_cliente: 'Carlos Mendoza',
                origen_desc: 'Apto S201 • Huésped Facile',
                hora_inicio: '10:00',
                hora_fin: '18:00',
                duracion_horas: '8 horas (Pase Día)',
                precio_total: 120000,
                estado: 'ACTIVA'
              }
            ];

            return (
              <div id="pms-centro-negocios" className="space-y-8 max-w-7xl mx-auto mb-8">
                
                {/* 1. ENCABEZADO DEL MÓDULO CON BADGES DE DISPONIBILIDAD */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#d91a2a] flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                          Centro de Negocios
                        </h2>
                        <span className="text-slate-300 font-normal">—</span>
                        <span className="text-slate-600 font-bold text-sm sm:text-base">
                          Reservas por Horas & Coworking
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-0">
                        Gestión ejecutiva de salas de conferencias, juntas y puestos flex por bloques horarios en tiempo real.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Salas Disponibles: <strong>3 de 4</strong>
                    </span>
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Coworking Flex: <strong>12 Disponibles</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => cargarDatosBackend(authToken)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>Actualizar</span>
                    </button>
                  </div>
                </div>

                {/* ALERTAS OPERATIVAS */}
                {reservaNegocioAlert && (
                  <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2.5 ${
                    reservaNegocioAlert.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-red-50 text-red-900 border-red-200'
                  }`}>
                    <span>{reservaNegocioAlert.type === 'success' ? '🎉' : '⚠️'}</span>
                    <span>{reservaNegocioAlert.message}</span>
                  </div>
                )}

                {/* 2. GRID PRINCIPAL A 2 COLUMNAS (5 COLS FORM / 7 COLS AGENDA) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* COLUMNA IZQUIERDA: FORMULARIO DE RESERVA (5 COLS) */}
                  <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#d91a2a]"></span>
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 m-0">
                          Nueva Reserva de Sala / Coworking
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">Tarificación por Hora</span>
                    </div>

                    <form onSubmit={handleCrearReservaNegocio} className="space-y-5">
                      {/* Espacio de trabajo / Sala */}
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Espacio de Trabajo / Sala <span className="text-[#d91a2a]">*</span>
                        </label>
                        <select
                          value={reservaNegocioForm.id_espacio}
                          onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, id_espacio: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-4 focus:ring-[#d91a2a]/10 outline-none transition-all cursor-pointer"
                        >
                          <option value="">-- Seleccionar espacio disponible --</option>
                          {espaciosNegocio.length > 0 ? (
                            espaciosNegocio.map(e => (
                              <option key={e.id_espacio} value={e.id_espacio}>
                                🏢 {e.nombre} ({e.capacidad} pax) — ${Number(e.precio_hora).toLocaleString('es-CO')} COP / hora
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="1">🏢 Sala de Juntas 1 (10 pax) — $70.000 COP / hora</option>
                              <option value="2">🏢 Sala de Juntas 2 (10 pax) — $70.000 COP / hora</option>
                              <option value="3">🏢 Sala 3 VIP (15 pax) — $20.000 COP / hora</option>
                              <option value="4">💻 Puesto Coworking Flex — $15.000 COP / hora</option>
                            </>
                          )}
                        </select>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 mb-0">
                          <span>ℹ️</span> Incluye WiFi de 500Mbps simétrico, pantalla 4K y tablero acrílico.
                        </p>
                      </div>

                      {/* Tipo de Cliente (Radio Cards Interactivas) */}
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Tipo de Cliente <span className="text-[#d91a2a]">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setReservaNegocioForm({ ...reservaNegocioForm, tipo_cliente: 'Huésped Registrado' })}
                            className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                              reservaNegocioForm.tipo_cliente === 'Huésped Registrado'
                                ? 'border-[#d91a2a] bg-red-50/40 text-slate-900 ring-2 ring-[#d91a2a]/10'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span className="text-xl">🏨</span>
                            <div>
                              <div className="text-xs font-bold leading-tight">Huésped Facile</div>
                              <div className="text-[10px] text-slate-500">Cargar a cuenta de habitación</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setReservaNegocioForm({ ...reservaNegocioForm, tipo_cliente: 'Cliente Externo' })}
                            className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                              reservaNegocioForm.tipo_cliente === 'Cliente Externo'
                                ? 'border-[#d91a2a] bg-red-50/40 text-slate-900 ring-2 ring-[#d91a2a]/10'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span className="text-xl">🏢</span>
                            <div>
                              <div className="text-xs font-bold leading-tight">Cliente Externo</div>
                              <div className="text-[10px] text-slate-500">Factura directa / Razón Social</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Selector de Huésped / Datos de Cliente Externo */}
                      {reservaNegocioForm.tipo_cliente === 'Huésped Registrado' ? (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 m-0">
                              Huésped Registrado <span className="text-[#d91a2a]">*</span>
                            </label>
                            <span className="text-[11px] text-[#d91a2a] font-bold cursor-pointer hover:underline">
                              Ver folio de cuenta
                            </span>
                          </div>
                          <select
                            value={reservaNegocioForm.id_huesped}
                            onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, id_huesped: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-4 focus:ring-[#d91a2a]/10 outline-none transition-all cursor-pointer"
                          >
                            <option value="">-- Seleccionar huésped activo --</option>
                            {huespedes.filter(h => h.estado === 'Activo').map(h => (
                              <option key={h.id_huesped} value={h.id_huesped}>
                                {h.nombre} (Doc: {h.documento})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                              Razón Social / Nombre <span className="text-[#d91a2a]">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: Inversiones Tech SAS"
                              value={reservaNegocioForm.nombre_cliente}
                              onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, nombre_cliente: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                              NIT / Documento
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="Ej: 901.442.110-3"
                              value={reservaNegocioForm.documento_cliente}
                              onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, documento_cliente: e.target.value.replace(/\D/g, '') })}
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Fecha y Bloque Horario */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                            Fecha <span className="text-[#d91a2a]">*</span>
                          </label>
                          <input
                            type="date"
                            min={new Date().toLocaleDateString('en-CA')}
                            value={reservaNegocioForm.fecha || '2026-11-15'}
                            onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, fecha: e.target.value })}
                            required
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                            Hora Inicio <span className="text-[#d91a2a]">*</span>
                          </label>
                          <input
                            type="time"
                            value={reservaNegocioForm.hora_inicio || '09:00'}
                            onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, hora_inicio: e.target.value })}
                            required
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                            Hora Fin <span className="text-[#d91a2a]">*</span>
                          </label>
                          <input
                            type="time"
                            value={reservaNegocioForm.hora_fin || '11:00'}
                            onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, hora_fin: e.target.value })}
                            required
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#d91a2a] outline-none"
                          />
                        </div>
                      </div>

                      {/* Observaciones y Servicios Opcionales */}
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                          Observaciones & Servicios Opcionales
                        </label>
                        <textarea
                          rows={2}
                          value={reservaNegocioForm.observaciones}
                          onChange={e => setReservaNegocioForm({ ...reservaNegocioForm, observaciones: e.target.value })}
                          placeholder="Ej: Video beam 4K calibrado, estación de café gourmet x10, rotafolios..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] outline-none resize-none placeholder:text-slate-400"
                        />
                      </div>

                      {/* Bloque Oscuro de Cotización Horaria */}
                      <div className="bg-[#0f172a] rounded-2xl p-5 text-white shadow-lg border border-slate-800 space-y-3.5">
                        <div className="flex items-center justify-between text-xs sm:text-[13px] text-slate-400 border-b border-slate-800/80 pb-3">
                          <span>Tarifa Horaria Base:</span>
                          <span className="font-mono font-bold text-white">
                            ${tarifaBase.toLocaleString('es-CO')} <span className="text-slate-300 font-sans font-semibold text-xs">COP / h</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-[13px] text-slate-400">
                          <span>Bloque Horario Reservado:</span>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-md border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 font-mono text-xs sm:text-[13px] font-bold">
                            {reservaNegocioForm.hora_inicio || '09:00'} – {reservaNegocioForm.hora_fin || '11:00'} ({horasCalculadas}.0 Horas)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-[13px] text-slate-400">
                          <span>IVA (19% Exento Huéspedes Ley Turismo):</span>
                          <span className="font-mono font-bold text-white">
                            $0 <span className="text-slate-300 font-sans font-semibold text-xs">COP</span>
                          </span>
                        </div>

                        <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-slate-200 block">
                              TOTAL A LIQUIDAR
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {reservaNegocioForm.tipo_cliente === 'Huésped Registrado' ? 'Cargable a cuenta folio #FC-9482' : 'Factura corporativa directa'}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-[26px] font-black text-white tracking-tight">
                              ${subtotalNegocio.toLocaleString('es-CO')}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-400">COP</span>
                          </div>
                        </div>
                      </div>

                      {/* Botón de Confirmación */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl bg-[#d91a2a] hover:bg-[#b91522] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{loading ? 'Confirmando Espacio...' : 'Confirmar Reserva de Espacio'}</span>
                      </button>
                      <p className="text-[11px] text-center text-slate-400 mt-1 mb-0">
                        Se enviará voucher digital al correo del titular automáticamente.
                      </p>
                    </form>
                  </div>

                  {/* COLUMNA DERECHA: RESERVAS ACTIVAS & PROGRAMADAS (7 COLS) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                      
                      {/* Cabecera de la Agenda */}
                      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 m-0">
                              Reservas Activas & Programadas de Hoy
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200">
                              {reservasMostrar.length} Reservas Hoy
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 mb-0">
                            Agenda en tiempo real del {reservaNegocioForm.fecha || '15 de Noviembre de 2026'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => cargarDatosBackend(authToken)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Actualizar</span>
                        </button>
                      </div>

                      {/* Tabla de Reservas del Día */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                              <th className="px-5 py-3">Espacio / Recurso</th>
                              <th className="px-4 py-3">Cliente / Apto</th>
                              <th className="px-4 py-3">Horario & Tiempo</th>
                              <th className="px-4 py-3">Tipo & Total</th>
                              <th className="px-4 py-3">Estado</th>
                              <th className="px-5 py-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {reservasMostrar.map((res, idx) => {
                              const isDemo = String(res.id_reserva_negocio).startsWith('res-demo');
                              return (
                                <tr key={res.id_reserva_negocio || idx} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-5 py-4">
                                    <div className="font-extrabold text-slate-900">{res.espacio}</div>
                                    <div className="text-[11px] text-slate-500">Capacidad: {res.tipo_espacio || '10 pax'}</div>
                                  </td>

                                  <td className="px-4 py-4">
                                    <div className="font-bold text-slate-800">{res.nombre_cliente}</div>
                                    <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                                      {res.origen_desc || (res.creado_por?.includes('Web') ? '🌐 Web Pública' : '👨‍💼 Huésped Facile')}
                                    </div>
                                  </td>

                                  <td className="px-4 py-4">
                                    <div className="font-mono font-bold text-slate-800">{res.hora_inicio} - {res.hora_fin}</div>
                                    <div className="text-[11px] text-slate-500">{res.duracion_horas ? `${res.duracion_horas}h` : '2 horas'}</div>
                                  </td>

                                  <td className="px-4 py-4">
                                    <div className="font-extrabold text-slate-900">
                                      ${Number(res.precio_total || 140000).toLocaleString('es-CO')} COP
                                    </div>
                                    <div className="text-[10px] text-slate-400">Facturación PMS</div>
                                  </td>

                                  <td className="px-4 py-4">
                                    {res.estado === 'EN_CURSO' || idx === 0 ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        En Curso
                                      </span>
                                    ) : res.estado === 'CONFIRMADA' || idx === 1 ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                                        Confirmada
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-800 border border-purple-200">
                                        Activa
                                      </span>
                                    )}
                                  </td>

                                  <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-all cursor-pointer"
                                      >
                                        Detalle
                                      </button>
                                      {!isDemo && (
                                        <button
                                          type="button"
                                          onClick={() => handleCancelarReservaNegocio(res.id_reserva_negocio)}
                                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[#d91a2a] font-bold transition-all cursor-pointer"
                                        >
                                          Liberar
                                        </button>
                                      )}
                                      {isDemo && idx === 0 && (
                                        <button
                                          type="button"
                                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[#d91a2a] font-bold transition-all cursor-pointer"
                                        >
                                          Liberar
                                        </button>
                                      )}
                                      {isDemo && idx > 0 && (
                                        <button
                                          type="button"
                                          className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-400 font-bold transition-all cursor-pointer"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                        <span>Tolerancia de desocupación: 15 min después de la hora fin.</span>
                        <span className="font-bold text-slate-700">Subtotal Facturado Hoy: $470.000 COP</span>
                      </div>
                    </div>

                    {/* TARJETAS RÁPIDAS DE ESTADO DE LAS SALAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-[#d91a2a] flex items-center justify-center font-black">
                          1
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">Sala 1 (10p)</div>
                          <div className="text-[11px] text-amber-600 font-bold">En uso hasta 11:00</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                          2
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">Sala 2 (10p)</div>
                          <div className="text-[11px] text-emerald-600 font-bold">Disponible hasta 14:00</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                          3
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">Sala 3 VIP (15p)</div>
                          <div className="text-[11px] text-emerald-600 font-bold">Disponible todo el día</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

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
