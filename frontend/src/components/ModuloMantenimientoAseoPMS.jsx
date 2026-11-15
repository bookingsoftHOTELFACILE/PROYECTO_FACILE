import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Clock, 
  Plus, 
  Check, 
  RotateCcw,
  Building2,
  Users,
  ShieldAlert,
  Layers,
  X,
  BedDouble,
  CheckCheck,
  CheckSquare
} from 'lucide-react';

/**
 * Helper para extraer el piso de una habitación a partir de su número
 * Ej: '101A' -> Piso 1, 'D102' -> Piso 1, 'DB203' -> Piso 2, 'F301' -> Piso 3, 'H406' -> Piso 4
 */
const calcularPiso = (numero) => {
  if (!numero) return 'Piso 1';
  const match = String(numero).match(/\d+/);
  if (match) {
    const primerDigito = match[0].charAt(0);
    return `Piso ${primerDigito}`;
  }
  return 'Piso 1';
};

/**
 * Helper para extraer el número de puerta para el badge visual
 */
const calcularNumeroPuerta = (numero) => {
  if (!numero) return '—';
  const match = String(numero).match(/\d+[A-Z]?/);
  return match ? match[0] : String(numero);
};

/**
 * Ponderación de prioridad operativa:
 * 1. Mantenimiento (Averías urgentes fuera de servicio)
 * 2. En limpieza (Salidas pendientes por higienizar)
 * 3. Ocupada (Huéspedes in-house)
 * 4. Disponible (Listas e inspeccionadas)
 */
const pesoEstadoOperativo = (estado) => {
  switch (estado) {
    case 'Mantenimiento': return 1;
    case 'En limpieza': return 2;
    case 'Ocupada': return 3;
    case 'Disponible': return 4;
    default: return 5;
  }
};

export default function ModuloMantenimientoAseoPMS({ 
  habitaciones = [], 
  usuarioSesion,
  onCambiarEstado,
  onReportarNovedad 
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroPiso, setFiltroPiso] = useState('TODOS');
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 8;

  // Estado del Modal de Reporte de Avería Técnica
  const [modalAveriaOpen, setModalAveriaOpen] = useState(false);
  const [averiaForm, setAveriaForm] = useState({
    id_habitacion: '',
    categoria: 'Fontanería & Grifería',
    descripcion: '',
    prioridad: 'Alta'
  });

  // Estado del Modal de Solución y Cierre Técnico de Avería
  const [modalSolucionOpen, setModalSolucionOpen] = useState(false);
  const [solucionForm, setSolucionForm] = useState({
    id_habitacion: '',
    numero: '',
    tipo: '',
    detalleActual: '',
    notaResolucion: 'Avería corregida y probada operativamente.',
    destinoEstado: 'En limpieza' // 'En limpieza' | 'Disponible'
  });

  // Rol del usuario actual
  const rol = usuarioSesion?.rol || 'Administrador';
  const esAmaDeLlaves = rol === 'Ama de llaves';
  const esMantenimiento = rol === 'Personal de mantenimiento';

  // Catálogo reactivo de habitaciones
  const listaHabitaciones = useMemo(() => {
    if (habitaciones && habitaciones.length > 0) return habitaciones;
    return [];
  }, [habitaciones]);

  // Contadores dinámicos calculados en tiempo real sobre la flota completa
  const totalHabitaciones = listaHabitaciones.length;
  const conteoDisponibles = listaHabitaciones.filter(h => h.estado === 'Disponible').length;
  const conteoLimpieza = listaHabitaciones.filter(h => h.estado === 'En limpieza').length;
  const conteoMantenimiento = listaHabitaciones.filter(h => h.estado === 'Mantenimiento').length;
  const conteoOcupadas = listaHabitaciones.filter(h => h.estado === 'Ocupada').length;

  const pctDisponibles = totalHabitaciones > 0 ? Math.round((conteoDisponibles / totalHabitaciones) * 100) : 0;
  const pctLimpieza = totalHabitaciones > 0 ? Math.round((conteoLimpieza / totalHabitaciones) * 100) : 0;
  const pctMantenimiento = totalHabitaciones > 0 ? Math.round((conteoMantenimiento / totalHabitaciones) * 100) : 0;
  const pctOcupadas = totalHabitaciones > 0 ? Math.round((conteoOcupadas / totalHabitaciones) * 100) : 0;

  // Filtrado y ordenamiento reactivo por Prioridad Operativa
  const aptosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    const filtrados = listaHabitaciones.filter(h => {
      const numStr = String(h.numero || '').toLowerCase();
      const tipoStr = String(h.tipo || '').toLowerCase();
      const detalleStr = String(h.detalle_mantenimiento || '').toLowerCase();
      const modifStr = String(h.modificado_por || '').toLowerCase();
      const pisoStr = calcularPiso(h.numero).toLowerCase();

      const coincideTexto = !q || 
        numStr.includes(q) || 
        tipoStr.includes(q) || 
        detalleStr.includes(q) || 
        modifStr.includes(q) ||
        pisoStr.includes(q);

      const coincideEstado = filtroEstado === 'TODOS' || h.estado === filtroEstado;
      const coincideTipo = filtroTipo === 'TODOS' || tipoStr === filtroTipo.toLowerCase();
      const coincidePiso = filtroPiso === 'TODOS' || pisoStr.includes(filtroPiso.toLowerCase());

      return coincideTexto && coincideEstado && coincideTipo && coincidePiso;
    });

    // Ordenar con prioridad operativa (los que requieren atención primero)
    return filtrados.sort((a, b) => {
      const pesoA = pesoEstadoOperativo(a.estado);
      const pesoB = pesoEstadoOperativo(b.estado);
      if (pesoA !== pesoB) return pesoA - pesoB;
      return String(a.numero || '').localeCompare(String(b.numero || ''), undefined, { numeric: true });
    });
  }, [listaHabitaciones, busqueda, filtroEstado, filtroTipo, filtroPiso]);

  // Paginación real
  const totalPaginas = Math.max(1, Math.ceil(aptosFiltrados.length / ITEMS_POR_PAGINA));
  const paginaValida = Math.min(paginaActual, totalPaginas);

  const aptosPaginados = useMemo(() => {
    const inicio = (paginaValida - 1) * ITEMS_POR_PAGINA;
    return aptosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [aptosFiltrados, paginaValida, ITEMS_POR_PAGINA]);

  // Manejo de cambio de estado
  const ejecutarCambioEstado = (id_habitacion, nuevoEstado, detalle = null) => {
    if (onCambiarEstado) {
      onCambiarEstado(id_habitacion, nuevoEstado, detalle);
    }
  };

  // Apertura del modal de avería
  const abrirModalAveria = (habitacion = null) => {
    if (habitacion) {
      setAveriaForm({
        id_habitacion: habitacion.id_habitacion,
        categoria: 'Fontanería & Grifería',
        descripcion: habitacion.detalle_mantenimiento || '',
        prioridad: 'Alta'
      });
    } else {
      const primeraHab = listaHabitaciones[0];
      setAveriaForm({
        id_habitacion: primeraHab ? primeraHab.id_habitacion : '',
        categoria: 'Fontanería & Grifería',
        descripcion: '',
        prioridad: 'Alta'
      });
    }
    setModalAveriaOpen(true);
  };

  // Envío del modal de avería
  const handleGuardarAveria = (e) => {
    e.preventDefault();
    if (!averiaForm.id_habitacion) return;
    const detalleFinal = `${averiaForm.categoria}: ${averiaForm.descripcion.trim()}`;
    ejecutarCambioEstado(averiaForm.id_habitacion, 'Mantenimiento', detalleFinal);
    setModalAveriaOpen(false);
  };

  // Apertura del modal de solución técnica
  const abrirModalSolucion = (habitacion, destino = 'En limpieza') => {
    setSolucionForm({
      id_habitacion: habitacion.id_habitacion,
      numero: habitacion.numero,
      tipo: habitacion.tipo,
      detalleActual: habitacion.detalle_mantenimiento || 'Avería técnica registrada',
      notaResolucion: 'Avería corregida y probada operativamente.',
      destinoEstado: destino
    });
    setModalSolucionOpen(true);
  };

  // Envío del modal de solución técnica
  const handleConfirmarSolucion = (e) => {
    e.preventDefault();
    if (!solucionForm.id_habitacion) return;
    const detalleFinal = solucionForm.destinoEstado === 'En limpieza'
      ? `Reparado: ${solucionForm.notaResolucion.trim()} • Pendiente aseo final`
      : '';
    ejecutarCambioEstado(solucionForm.id_habitacion, solucionForm.destinoEstado, detalleFinal);
    setModalSolucionOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans mb-8">
      
      {/* 1. ENCABEZADO INSTITUCIONAL DE OPERACIONES DE PLANTA */}
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        {/* Lado Izquierdo: Icono Institucional y Título Contextual según Rol */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{
              width: '48px',
              height: '48px',
              minWidth: '48px',
              borderRadius: '16px',
              backgroundColor: esAmaDeLlaves ? '#fefce8' : esMantenimiento ? '#eff6ff' : '#fef2f2',
              border: `1px solid ${esAmaDeLlaves ? '#fef08a' : esMantenimiento ? '#bfdbfe' : '#fee2e2'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: esAmaDeLlaves ? '#ca8a04' : esMantenimiento ? '#2563eb' : '#d91a2a',
              flexShrink: 0
            }}
          >
            {esAmaDeLlaves ? (
              <Sparkles size={24} color="#ca8a04" />
            ) : esMantenimiento ? (
              <Wrench size={24} color="#2563eb" />
            ) : (
              <Wrench size={24} color="#d91a2a" />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px', margin: 0 }}>
                {esAmaDeLlaves 
                  ? '🧹 Tablero de Aseo & Control de Unidades (Ama de Llaves)'
                  : esMantenimiento
                  ? '🔧 Bitácora Técnica & Mantenimiento de Planta'
                  : '🛠️ Operaciones de Planta — Mantenimiento & Aseo Hotelero'}
              </h2>
              <span 
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: '9999px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 800
                }}
              >
                {totalHabitaciones} Apartamentos
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '4px', marginBottom: 0 }}>
              {esAmaDeLlaves
                ? 'Certifique la limpieza de habitaciones tras el check-out, supervise el estado de la lencería y reporte cualquier avería técnica.'
                : esMantenimiento
                ? 'Atienda y resuelva las órdenes de avería técnica reportadas para liberar las habitaciones a estado Disponible o En Limpieza.'
                : 'Control integral de limpieza, rotación de cuartos, inspección de calidad y mantenimiento técnico de unidades habitacionales.'}
            </p>
          </div>
        </div>

        {/* Lado Derecho: Filtros Rápidos (Pills) y Botón + Reportar Novedad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Aseo Pendiente */}
          <button
            type="button"
            onClick={() => setFiltroEstado(filtroEstado === 'En limpieza' ? 'TODOS' : 'En limpieza')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: filtroEstado === 'En limpieza' ? '#fef3c7' : '#fffbeb',
              border: `1px solid ${filtroEstado === 'En limpieza' ? '#f59e0b' : '#fde68a'}`,
              color: '#92400e',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={13} color="#d97706" />
            <span>Aseo Pendiente ({conteoLimpieza})</span>
          </button>

          {/* Daños / Mantenimiento */}
          <button
            type="button"
            onClick={() => setFiltroEstado(filtroEstado === 'Mantenimiento' ? 'TODOS' : 'Mantenimiento')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: filtroEstado === 'Mantenimiento' ? '#fee2e2' : '#fef2f2',
              border: `1px solid ${filtroEstado === 'Mantenimiento' ? '#ef4444' : '#fecaca'}`,
              color: '#dc2626',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertTriangle size={13} color="#dc2626" />
            <span>Daños / Mantenimiento ({conteoMantenimiento})</span>
          </button>

          {/* Ver Todas */}
          <button
            type="button"
            onClick={() => {
              setFiltroEstado('TODOS');
              setFiltroTipo('TODOS');
              setFiltroPiso('TODOS');
              setBusqueda('');
              setPaginaActual(1);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '7px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              backgroundColor: filtroEstado === 'TODOS' ? '#0f172a' : '#f8fafc',
              border: `1px solid ${filtroEstado === 'TODOS' ? '#0f172a' : '#cbd5e1'}`,
              color: filtroEstado === 'TODOS' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Ver Todas ({totalHabitaciones})</span>
          </button>

          {/* + Reportar Novedad */}
          <button
            type="button"
            onClick={() => abrirModalAveria()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 15px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              backgroundColor: '#ffffff',
              border: '1px solid #fecdd3',
              color: '#d91a2a',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(217, 26, 42, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fff1f2';
              e.currentTarget.style.borderColor = '#d91a2a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#fecdd3';
            }}
          >
            <Plus size={14} color="#d91a2a" strokeWidth={3} />
            <span>Reportar Novedad</span>
          </button>
        </div>
      </div>

      {/* 2. TARJETAS DE KPIS OPERATIVAS DE PLANTA EN TIEMPO REAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* KPI 1: Disponibles Listas */}
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              DISPONIBLES LISTAS
            </span>
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Check size={16} strokeWidth={3} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{conteoDisponibles}</span>
            <span 
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#059669',
                backgroundColor: '#ecfdf5',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid #a7f3d0'
              }}
            >
              {pctDisponibles}% de la flota
            </span>
          </div>
          {/* Barra de progreso */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: `${pctDisponibles}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* KPI 2: En Limpieza Activa */}
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              EN LIMPIEZA ACTIVA
            </span>
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#fefce8',
                color: '#eab308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{conteoLimpieza}</span>
            <span 
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#a16207',
                backgroundColor: '#fefce8',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid #fef08a'
              }}
            >
              {conteoLimpieza === 0 ? 'Sin aseos pendientes' : `${conteoLimpieza} por certificar`}
            </span>
          </div>
          {/* Barra de progreso */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(pctLimpieza, conteoLimpieza > 0 ? 15 : 0)}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* KPI 3: Mantenimiento / Bloqueado */}
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              MANTENIMIENTO / BLOQUEADO
            </span>
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{conteoMantenimiento}</span>
            <span 
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: conteoMantenimiento > 0 ? '#dc2626' : '#64748b',
                backgroundColor: conteoMantenimiento > 0 ? '#fef2f2' : '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: `1px solid ${conteoMantenimiento > 0 ? '#fecaca' : '#e2e8f0'}`
              }}
            >
              {conteoMantenimiento > 0 ? 'Prioridad Alta' : 'Sin averías'}
            </span>
          </div>
          {/* Barra de progreso */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(pctMantenimiento, conteoMantenimiento > 0 ? 10 : 0)}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* KPI 4: Ocupadas In-House */}
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              OCUPADAS (IN-HOUSE)
            </span>
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{conteoOcupadas}</span>
            <span 
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid #bfdbfe'
              }}
            >
              {pctOcupadas}% ocupación
            </span>
          </div>
          {/* Barra de progreso */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: `${pctOcupadas}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

      </div>

      {/* 3. TABLA DE OPERACIONES Y CONTROLES */}
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
      >
        {/* Barra de Filtros y Búsqueda */}
        <div 
          style={{
            padding: '16px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            {/* Input de Búsqueda */}
            <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '480px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                placeholder="Buscar por apartamento (Ej: 101, D102, H406) o detalle de avería..."
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Selects de Filtrado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value);
                  setPaginaActual(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="TODOS">Todos los estados</option>
                <option value="Mantenimiento">⚠️ Mantenimiento (Avería técnica)</option>
                <option value="En limpieza">🧹 En Limpieza (Aseo pendiente)</option>
                <option value="Disponible">✓ Disponibles (Listas)</option>
                <option value="Ocupada">👥 Ocupadas (Huésped in-house)</option>
              </select>

              <select
                value={filtroTipo}
                onChange={(e) => {
                  setFiltroTipo(e.target.value);
                  setPaginaActual(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="Dúplex">Dúplex</option>
                <option value="Dobles">Dobles</option>
                <option value="Habitaciones">Habitaciones</option>
                <option value="Familiares">Familiares</option>
              </select>

              <select
                value={filtroPiso}
                onChange={(e) => {
                  setFiltroPiso(e.target.value);
                  setPaginaActual(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="TODOS">Todos los pisos</option>
                <option value="1">Piso 1</option>
                <option value="2">Piso 2</option>
                <option value="3">Piso 3</option>
                <option value="4">Piso 4</option>
              </select>
            </div>
          </div>

          {/* Sub-barra informativa */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              Mostrando <strong style={{ color: '#0f172a' }}>{aptosFiltrados.length === 0 ? 0 : `${(paginaValida - 1) * ITEMS_POR_PAGINA + 1} - ${Math.min(paginaValida * ITEMS_POR_PAGINA, aptosFiltrados.length)}`} de {aptosFiltrados.length}</strong> apartamentos registrados
              <span className="ml-2 text-slate-400 font-normal">| Prioridad operativa: Averías y Aseo al inicio</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#059669', fontWeight: 700 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} className="animate-pulse"></span>
              Sincronización en tiempo real con recepción & reservas
            </span>
          </div>
        </div>

        {/* Tabla Operativa */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '980px' }}>
            <thead>
              <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                <th style={{ padding: '14px 20px', width: '20%' }}>APARTAMENTO</th>
                <th style={{ padding: '14px 16px', width: '14%' }}>TIPO & CAPACIDAD</th>
                <th style={{ padding: '14px 16px', width: '15%' }}>ESTADO ACTUAL</th>
                <th style={{ padding: '14px 16px', width: '23%' }}>DETALLE DE NOVEDAD & ESTANCIA</th>
                <th style={{ padding: '14px 16px', width: '14%' }}>AUDITORÍA</th>
                <th style={{ padding: '14px 20px', width: '14%', textAlign: 'right' }}>ACCIONES DE TURNO</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '12px' }}>
              {aptosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                    No se encontraron apartamentos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                aptosPaginados.map((h, idx) => {
                  const isCleaning = h.estado === 'En limpieza';
                  const isMaintenance = h.estado === 'Mantenimiento';
                  const isAvailable = h.estado === 'Disponible';
                  const isOccupied = h.estado === 'Ocupada';

                  const piso = calcularPiso(h.numero);
                  const numeroPuerta = calcularNumeroPuerta(h.numero);

                  return (
                    <tr 
                      key={h.id_habitacion || h.numero}
                      style={{ 
                        borderBottom: idx < aptosPaginados.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background-color 0.15s ease',
                        backgroundColor: isMaintenance ? '#fffafb' : isCleaning ? '#fffdf7' : 'transparent'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isMaintenance ? '#fee2e2' : isCleaning ? '#fef3c7' : '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isMaintenance ? '#fffafb' : isCleaning ? '#fffdf7' : 'transparent'}
                    >
                      
                      {/* APARTAMENTO: Puerta Badge + Nombre y Piso */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div 
                            style={{
                              width: '38px',
                              height: '38px',
                              minWidth: '38px',
                              borderRadius: '10px',
                              backgroundColor: isCleaning ? '#fefce8' : isMaintenance ? '#fee2e2' : isOccupied ? '#eff6ff' : '#f1f5f9',
                              border: `1px solid ${isCleaning ? '#fef08a' : isMaintenance ? '#fca5a5' : isOccupied ? '#bfdbfe' : '#e2e8f0'}`,
                              color: isCleaning ? '#a16207' : isMaintenance ? '#dc2626' : isOccupied ? '#1d4ed8' : '#334155',
                              fontWeight: 900,
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {numeroPuerta}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', lineHeight: 1.2 }}>
                              Apto {h.numero}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                              {piso}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* TIPO */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span 
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#334155',
                              fontWeight: 700,
                              fontSize: '11px',
                              width: 'fit-content'
                            }}
                          >
                            {h.tipo}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                            Máx. {h.capacidad} personas
                          </span>
                        </div>
                      </td>

                      {/* ESTADO ACTUAL */}
                      <td style={{ padding: '14px 16px' }}>
                        {isAvailable && (
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#065f46',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                            Disponible
                          </span>
                        )}
                        {isCleaning && (
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              backgroundColor: '#fffbeb',
                              border: '1px solid #fde68a',
                              color: '#92400e',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#f59e0b', display: 'inline-block' }} className="animate-pulse"></span>
                            En Limpieza
                          </span>
                        )}
                        {isMaintenance && (
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              backgroundColor: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} className="animate-pulse"></span>
                            Daño / Avería
                          </span>
                        )}
                        {isOccupied && (
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block' }}></span>
                            Ocupada
                          </span>
                        )}
                      </td>

                      {/* DETALLE DE NOVEDAD & ESTANCIA */}
                      <td style={{ padding: '14px 16px' }}>
                        {isMaintenance ? (
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#dc2626', lineHeight: 1.3 }}>
                            ⚠️ {h.detalle_mantenimiento || 'Avería técnica reportada'}
                          </div>
                        ) : isCleaning ? (
                          <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#92400e', lineHeight: 1.3 }}>
                            🧹 {h.detalle_mantenimiento || 'Salida de huésped • Requiere aseo profundo y lencería'}
                          </div>
                        ) : isOccupied ? (
                          <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#1e40af', lineHeight: 1.3 }}>
                            🛎️ Huésped hospedado • Estancia activa
                          </div>
                        ) : (
                          <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#94a3b8' }}>
                            ✓ Habitación lista para huésped
                          </div>
                        )}
                      </td>

                      {/* AUDITORÍA */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '11.5px', lineHeight: 1.2 }}>
                          {h.modificado_por || 'Recepción Central'}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>
                          Sincronizado
                        </div>
                      </td>

                      {/* ACCIONES DE TURNO CONTEXTUALES E INTELIGENTES */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'nowrap' }}>
                          
                          {/* CASO 1: EN LIMPIEZA -> Acción principal: CERTIFICAR LIMPIA */}
                          {isCleaning && (
                            <>
                              <button
                                type="button"
                                onClick={() => ejecutarCambioEstado(h.id_habitacion, 'Disponible')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  backgroundColor: '#ecfdf5',
                                  border: '1px solid #a7f3d0',
                                  color: '#065f46',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  boxShadow: '0 1px 2px rgba(6, 95, 70, 0.08)',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                                title="Certificar limpieza terminada: Libera el apartamento a Disponible para asignación en Recepción"
                              >
                                <Check size={12} color="#059669" strokeWidth={3} />
                                <span>Certificar Limpia</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => abrirModalAveria(h)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 9px',
                                  borderRadius: '8px',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #fecaca',
                                  color: '#dc2626',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                                title="Reportar avería técnica detectada durante el aseo"
                              >
                                <AlertTriangle size={12} color="#dc2626" strokeWidth={2.5} />
                                <span>Avería</span>
                              </button>
                            </>
                          )}

                          {/* CASO 2: DISPONIBLE -> Ya está limpia, permite enviar a Aseo o Reportar Novedad */}
                          {isAvailable && (
                            <>
                              <button
                                type="button"
                                onClick={() => ejecutarCambioEstado(h.id_habitacion, 'En limpieza', 'Aseo de acondicionamiento preventivo')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  backgroundColor: '#fffbeb',
                                  border: '1px solid #fde68a',
                                  color: '#92400e',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fffbeb'}
                                title="Enviar a aseo de retoque o acondicionamiento"
                              >
                                <Sparkles size={12} color="#d97706" strokeWidth={2.5} />
                                <span>A Limpieza</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => abrirModalAveria(h)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 9px',
                                  borderRadius: '8px',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #fecaca',
                                  color: '#dc2626',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                                title="Reportar avería técnica"
                              >
                                <AlertTriangle size={12} color="#dc2626" strokeWidth={2.5} />
                                <span>Avería</span>
                              </button>
                            </>
                          )}

                          {/* CASO 3: MANTENIMIENTO -> Botones para resolver avería */}
                          {isMaintenance && (
                            <>
                              <button
                                type="button"
                                onClick={() => abrirModalSolucion(h, 'En limpieza')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 11px',
                                  borderRadius: '8px',
                                  backgroundColor: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                title="Avería reparada: Pasa la unidad a Limpieza para desinfección final tras obra técnica"
                              >
                                <Wrench size={12} color="#2563eb" strokeWidth={2.5} />
                                <span>Reparado ➔ Limpieza</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => abrirModalSolucion(h, 'Disponible')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 9px',
                                  borderRadius: '8px',
                                  backgroundColor: '#ecfdf5',
                                  border: '1px solid #a7f3d0',
                                  color: '#065f46',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                                title="Liberar directamente a Disponible si no requiere aseo adicional"
                              >
                                <Check size={12} color="#059669" strokeWidth={3} />
                                <span>Disponible</span>
                              </button>
                            </>
                          )}

                          {/* CASO 4: OCUPADA -> Huésped in-house */}
                          {isOccupied && (
                            <>
                              <button
                                type="button"
                                onClick={() => ejecutarCambioEstado(h.id_habitacion, 'En limpieza', 'Aseo diario de estancia solicitado por huésped')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  backgroundColor: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                title="Registrar solicitud de aseo diario durante la estancia"
                              >
                                <Sparkles size={12} color="#2563eb" strokeWidth={2.5} />
                                <span>Aseo Diario</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => abrirModalAveria(h)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 9px',
                                  borderRadius: '8px',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #fecaca',
                                  color: '#dc2626',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                                title="Reportar avería técnica con huésped hospedado"
                              >
                                <AlertTriangle size={12} color="#dc2626" strokeWidth={2.5} />
                                <span>Avería</span>
                              </button>
                            </>
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

        {/* Paginador Inferior Reactivo */}
        <div 
          style={{
            padding: '14px 24px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
            Página <strong style={{ color: '#0f172a' }}>{paginaValida}</strong> de <strong style={{ color: '#0f172a' }}>{totalPaginas}</strong>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              disabled={paginaValida === 1}
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 700,
                cursor: paginaValida === 1 ? 'not-allowed' : 'pointer',
                opacity: paginaValida === 1 ? 0.5 : 1
              }}
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setPaginaActual(pg)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: paginaValida === pg ? '#0f172a' : '#ffffff',
                  border: `1px solid ${paginaValida === pg ? '#0f172a' : '#e2e8f0'}`,
                  color: paginaValida === pg ? '#ffffff' : '#334155',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {pg}
              </button>
            ))}

            <button
              type="button"
              disabled={paginaValida === totalPaginas}
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: paginaValida === totalPaginas ? 'not-allowed' : 'pointer',
                opacity: paginaValida === totalPaginas ? 0.5 : 1
              }}
            >
              Siguiente
            </button>
          </div>
        </div>

      </div>

      {/* 4. MODAL EJECUTIVO: REPORTAR AVERÍA TÉCNICA O NOVEDAD */}
      {modalAveriaOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}
          >
            {/* Cabecera del Modal */}
            <div 
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#fff1f2'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#991b1b' }}>
                    Reportar Avería o Daño Técnico
                  </h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#b91c1c', fontWeight: 500 }}>
                    La habitación quedará bloqueada en estado Mantenimiento
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAveriaOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulario del Modal */}
            <form onSubmit={handleGuardarAveria} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Selección de Apartamento */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '6px' }}>
                    Apartamento Afectado *
                  </label>
                  <select
                    value={averiaForm.id_habitacion}
                    onChange={(e) => setAveriaForm({ ...averiaForm, id_habitacion: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {listaHabitaciones.map(hab => (
                      <option key={hab.id_habitacion} value={hab.id_habitacion}>
                        Apto {hab.numero} — {hab.tipo} ({calcularPiso(hab.numero)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categoría de Avería */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '6px' }}>
                    Tipo de Avería / Especialidad *
                  </label>
                  <select
                    value={averiaForm.categoria}
                    onChange={(e) => setAveriaForm({ ...averiaForm, categoria: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Fontanería & Grifería">🚿 Fontanería & Grifería (fuga de agua, grifos, baño)</option>
                    <option value="Electricidad & Iluminación">💡 Electricidad & Iluminación (luces, tomacorrientes)</option>
                    <option value="Climatización (Aire/Calefacción)">❄️ Climatización (aire acondicionado, calefacción)</option>
                    <option value="Cerrajería & Acceso">🔑 Cerrajería & Acceso (tarjeta, chapa magnética)</option>
                    <option value="Lencería & Mobiliario">🛏️ Lencería & Mobiliario (colchón, cortinas, espejos)</option>
                    <option value="Electrodomésticos & Smart TV">📺 Electrodomésticos & Smart TV (nevera, TV, microondas)</option>
                    <option value="Pintura & Acabados">🎨 Pintura & Acabados (paredes, humedad, pisos)</option>
                    <option value="Otro / General">🛠️ Otro / Novedad General</option>
                  </select>
                </div>

                {/* Descripción Detallada */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '6px' }}>
                    Descripción Específica del Daño *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={averiaForm.descripcion}
                    onChange={(e) => setAveriaForm({ ...averiaForm, descripcion: e.target.value })}
                    placeholder="Ej: Fuga de agua debajo del lavamanos principal con goteo constante. Requiere cambio de empaque."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '12px',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Banner de Impacto Operativo */}
                <div 
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '11px',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldAlert size={16} color="#d97706" style={{ flexShrink: 0 }} />
                  <span>
                    El apartamento no podrá ser asignado en Recepción ni reservado hasta que Mantenimiento resuelva la orden.
                  </span>
                </div>

              </div>

              {/* Botones de Acción */}
              <div 
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalAveriaOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#dc2626',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(220, 38, 38, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <AlertTriangle size={14} color="#ffffff" />
                  <span>Bloquear & Registrar Avería</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 5. MODAL EJECUTIVO: CERRAR ORDEN TÉCNICA / REGISTRAR SOLUCIÓN */}
      {modalSolucionOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}
          >
            {/* Cabecera del Modal de Solución */}
            <div 
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#eff6ff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#dbeafe',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e40af' }}>
                    Certificar Reparación Técnica — Apto {solucionForm.numero}
                  </h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#3b82f6', fontWeight: 500 }}>
                    {solucionForm.tipo} ({calcularPiso(solucionForm.numero)}) • Registro de Solución
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalSolucionOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulario de Solución */}
            <form onSubmit={handleConfirmarSolucion} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Avería actual reportada */}
                <div 
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}
                >
                  <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                    Avería Reportada Originalmente:
                  </span>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>
                    {solucionForm.detalleActual}
                  </p>
                </div>

                {/* Nota del Trabajo Realizado */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '6px' }}>
                    Trabajo Técnico Realizado *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={solucionForm.notaResolucion}
                    onChange={(e) => setSolucionForm({ ...solucionForm, notaResolucion: e.target.value })}
                    placeholder="Ej: Se reemplazó el empaque defectuoso de la grifería y se verificó el flujo de agua a presión normal sin fugas."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '12px',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Destino del Estado */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '6px' }}>
                    Estado posterior de la Habitación *
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSolucionForm({ ...solucionForm, destinoEstado: 'En limpieza' })}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: `1.5px solid ${solucionForm.destinoEstado === 'En limpieza' ? '#f59e0b' : '#e2e8f0'}`,
                        backgroundColor: solucionForm.destinoEstado === 'En limpieza' ? '#fefce8' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '12px', color: '#92400e' }}>
                        <Sparkles size={14} color="#d97706" />
                        <span>Pasar a Limpieza</span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '10.5px', color: '#a16207' }}>
                        Recomendado: Envía a Ama de Llaves para desinfección final tras la obra técnica.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSolucionForm({ ...solucionForm, destinoEstado: 'Disponible' })}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: `1.5px solid ${solucionForm.destinoEstado === 'Disponible' ? '#10b981' : '#e2e8f0'}`,
                        backgroundColor: solucionForm.destinoEstado === 'Disponible' ? '#ecfdf5' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '12px', color: '#065f46' }}>
                        <Check size={14} color="#059669" strokeWidth={3} />
                        <span>Disponible Directo</span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '10.5px', color: '#047857' }}>
                        Solo si la reparación fue limpia (ej: pilas de control, chapa).
                      </p>
                    </button>
                  </div>
                </div>

              </div>

              {/* Botones de Acción */}
              <div 
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalSolucionOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckSquare size={14} color="#ffffff" />
                  <span>Certificar Solución Técnica</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
