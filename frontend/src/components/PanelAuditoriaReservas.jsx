import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Plus, 
  Check, 
  Clock, 
  Hourglass,
  Building, 
  UserCheck, 
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Laptop,
  ConciergeBell,
  Crown,
  ArrowRight,
  Receipt,
  Pencil
} from 'lucide-react';

const normalizarReserva = (r) => ({
  ...r,
  id: r.id_reserva || r.id,
  id_reserva: r.id_reserva || r.id,
  huesped: r.huesped_nombre || r.huesped || 'Huésped',
  huesped_nombre: r.huesped_nombre || r.huesped || 'Huésped',
  doc: r.huesped_documento || r.doc || '',
  apartamento: r.habitacion_numero ? `Apto ${r.habitacion_numero}` : (r.apartamento || 'Apto'),
  checkIn: r.fecha_entrada || r.checkIn,
  checkOut: r.fecha_salida || r.checkOut,
  estado: r.estado || 'Confirmada',
  origen: r.creado_por || r.origen || 'Sistema',
  tipoOrigen: (r.creado_por || r.origen || '').toLowerCase().includes('recep') ? 'recepcion' : (r.creado_por || r.origen || '').toLowerCase().includes('admin') ? 'admin' : 'sistema',
  checkin_at: r.checkin_at || null,
  checkout_at: r.checkout_at || null,
  observaciones: r.observaciones || '',
  avatarBg: r.avatarBg || '#fdf2f8',
  avatarText: r.avatarText || '#be185d',
  avatarBorder: r.avatarBorder || '#fbcfe8'
});

export default function PanelAuditoriaReservas({ 
  reservas = [], 
  reservaAlert,
  onNuevaReserva, 
  onCheckIn, 
  onCheckOut,
  onCancelarReserva,
  onVerFolio,
  onEditarReserva,
  totalUnidades
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroOrigen, setFiltroOrigen] = useState('TODOS');
  const [paginaActual, setPaginaActual] = useState(1);

  // Lista base con los registros idénticos a SCREEN_1 / SCREEN_2 / Imagen 2
  const [listaReservas, setListaReservas] = useState(
    reservas.length > 0 ? reservas.map(normalizarReserva) : [
      {
        id: 'res-01',
        huesped: 'John Doe',
        doc: '12345678',
        apartamento: 'Apto 101A',
        checkIn: '2026-09-03',
        checkOut: '2026-09-06',
        estado: 'Confirmada',
        origen: 'Sistema',
        tipoOrigen: 'sistema',
        avatarBg: '#fdf2f8',
        avatarText: '#be185d',
        avatarBorder: '#fbcfe8'
      },
      {
        id: 'res-02',
        huesped: 'Sofía Restrepo',
        doc: '98765432',
        apartamento: 'Apto D101',
        checkIn: '2026-09-07',
        checkOut: '2026-09-12',
        estado: 'Confirmada',
        origen: 'Sistema',
        tipoOrigen: 'sistema',
        avatarBg: '#fdf2f8',
        avatarText: '#be185d',
        avatarBorder: '#fbcfe8'
      },
      {
        id: 'res-03',
        huesped: 'John Doe',
        doc: '12345678',
        apartamento: 'Apto 102A',
        checkIn: '2035-08-01',
        checkOut: '2035-08-10',
        estado: 'Confirmada',
        origen: 'Recepción Facile (Recepcionista 24h)',
        tipoOrigen: 'recepcion',
        avatarBg: '#fef3c7',
        avatarText: '#b45309',
        avatarBorder: '#fde68a'
      },
      {
        id: 'res-04',
        huesped: 'John Doe',
        doc: '12345678',
        apartamento: 'Apto 101A',
        checkIn: '3330-01-01',
        checkOut: '3330-01-17',
        estado: 'Confirmada',
        origen: 'Administrador del Sistema (Administrador)',
        tipoOrigen: 'admin',
        avatarBg: '#eff6ff',
        avatarText: '#1d4ed8',
        avatarBorder: '#bfdbfe'
      },
      {
        id: 'res-05',
        huesped: 'John Doe',
        doc: '12345678',
        apartamento: 'Apto 101A',
        checkIn: '3681-01-01',
        checkOut: '3681-01-17',
        estado: 'Confirmada',
        origen: 'Administrador del Sistema (Administrador)',
        tipoOrigen: 'admin',
        avatarBg: '#ecfdf5',
        avatarText: '#047857',
        avatarBorder: '#a7f3d0'
      },
      {
        id: 'res-06',
        huesped: 'John Doe',
        doc: '12345678',
        apartamento: 'Apto 101A',
        checkIn: '3816-01-01',
        checkOut: '3816-01-17',
        estado: 'Confirmada',
        origen: 'Administrador del Sistema (Administrador)',
        tipoOrigen: 'admin',
        avatarBg: '#eff6ff',
        avatarText: '#1d4ed8',
        avatarBorder: '#bfdbfe'
      },
      {
        id: 'res-07',
        huesped: 'John Doe',
        doc: '12345678',
        apartamento: 'Apto 101A',
        checkIn: '3578-01-01',
        checkOut: '3578-01-17',
        estado: 'Confirmada',
        origen: 'Administrador del Sistema (Administrador)',
        tipoOrigen: 'admin',
        avatarBg: '#fdf2f8',
        avatarText: '#be185d',
        avatarBorder: '#fbcfe8'
      },
      {
        id: 'res-08',
        huesped: 'John Doe',
        doc: '12345678',
        apartamento: 'Apto 101A',
        checkIn: '3471-01-01',
        checkOut: '3471-01-17',
        estado: 'Confirmada',
        origen: 'Administrador del Sistema (Administrador)',
        tipoOrigen: 'admin',
        avatarBg: '#fef2f2',
        avatarText: '#b91c1c',
        avatarBorder: '#fecaca'
      }
    ]
  );

  useEffect(() => {
    if (reservas && reservas.length > 0) {
      setListaReservas(reservas.map(normalizarReserva));
    }
  }, [reservas]);

  const handleCheckInInterno = (id) => {
    if (onCheckIn) {
      onCheckIn(id);
    }
    setListaReservas(prev => prev.map(r => (r.id === id || r.id_reserva === id) ? { ...r, estado: 'Check-In' } : r));
  };

  const handleCheckOutInterno = (id) => {
    if (onCheckOut) {
      onCheckOut(id);
    }
    setListaReservas(prev => prev.map(r => (r.id === id || r.id_reserva === id) ? { ...r, estado: 'Completada' } : r));
  };

  const handleCancelarInterno = (id) => {
    if (onCancelarReserva) {
      onCancelarReserva(id);
    }
    setListaReservas(prev => prev.map(r => (r.id === id || r.id_reserva === id) ? { ...r, estado: 'Cancelada' } : r));
  };

  // Métricas dinámicas de ciclo de vida PMS
  const totalReservasCount = listaReservas.filter(r => r.estado !== 'Cancelada').length;
  const checkinsPendientesCount = listaReservas.filter(r => {
    const est = String(r.estado || '').toUpperCase();
    return est === 'CONFIRMADA' || est === 'PENDIENTE';
  }).length;
  const inHouseCount = listaReservas.filter(r => {
    const est = String(r.estado || '').toUpperCase();
    return est === 'CHECK-IN' || est === 'IN-HOUSE' || est === 'OCUPADA';
  }).length;
  const checkoutsProgramadosCount = inHouseCount;
  // P1-1.3: el inventario deja de ser un número fijo del componente. Si el PMS
  // aún no pasa el total de unidades, se usa el sembrado oficial (40 unidades).
  const totalAptos = Number(totalUnidades) > 0 ? Number(totalUnidades) : 40;
  // Sin in-house no debe fingirse un 30% de ocupación: el KPI refleja 0.
  const pctOcupacion = totalAptos > 0
    ? Math.min(100, Math.round((inHouseCount / totalAptos) * 100))
    : 0;

  const reservasFiltradas = listaReservas.filter((r) => {
    const q = busqueda.toLowerCase().trim();
    const coincideTexto = !q ||
      r.huesped.toLowerCase().includes(q) ||
      (r.doc && r.doc.includes(q)) ||
      r.apartamento.toLowerCase().includes(q);
    const est = String(r.estado || '').toUpperCase();
    const coincideEstado = filtroEstado === 'TODOS' || 
      (filtroEstado === 'CHECK-IN' ? (est === 'CHECK-IN' || est === 'IN-HOUSE' || est === 'OCUPADA') : est === filtroEstado.toUpperCase());
    const coincideOrigen = filtroOrigen === 'TODOS' || (r.tipoOrigen && r.tipoOrigen.toUpperCase() === filtroOrigen.toUpperCase());
    return coincideTexto && coincideEstado && coincideOrigen;
  });

  // P1-1.3 — Paginación real sobre la lista filtrada (antes eran 3 páginas fijas
  // y una tabla que renderizaba todo de golpe sin cortar por página).
  const POR_PAGINA = 8;
  const totalPaginas = Math.max(1, Math.ceil(reservasFiltradas.length / POR_PAGINA));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicioFila = (paginaSegura - 1) * POR_PAGINA;
  const filasVisibles = reservasFiltradas.slice(inicioFila, inicioFila + POR_PAGINA);
  const hayFiltrosAplicados = reservasFiltradas.length !== listaReservas.length;

  // Números de página visibles (ventana de 7 con "…" cuando hay muchas páginas)
  const paginasVisibles = (() => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    const candidatas = [1, totalPaginas, paginaSegura - 1, paginaSegura, paginaSegura + 1]
      .filter((p) => p >= 1 && p <= totalPaginas);
    const ordenadas = [...new Set(candidatas)].sort((a, b) => a - b);
    const salida = [];
    let previa = 0;
    for (const pg of ordenadas) {
      if (previa && pg - previa > 1) salida.push('…');
      salida.push(pg);
      previa = pg;
    }
    return salida;
  })();

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans mb-8">
      {reservaAlert && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 700,
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          backgroundColor: reservaAlert.type === 'success' ? '#f0fdf4' : reservaAlert.type === 'info' ? '#eff6ff' : '#fef2f2',
          color: reservaAlert.type === 'success' ? '#166534' : reservaAlert.type === 'info' ? '#1e40af' : '#991b1b',
          border: `1px solid ${reservaAlert.type === 'success' ? '#bbf7d0' : reservaAlert.type === 'info' ? '#bfdbfe' : '#fecaca'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{reservaAlert.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{reservaAlert.message}</span>
          </div>
          {reservaAlert.data?.yale_lock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: '#fcd34d',
                letterSpacing: '0.2em',
                fontWeight: 900,
                fontSize: '12px'
              }}>
                🔑 PIN YALE: {reservaAlert.data.yale_lock.pin_temporal}
              </span>
              <span style={{ fontSize: '11px', color: '#065f46', fontWeight: 600 }}>
                🔒 Válido hasta: {reservaAlert.data.yale_lock.valido_hasta}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* 1. KPIS SUPERIORES OPERATIVOS (IDÉNTICO A IMAGEN 2) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Total Reservas */}
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', display: 'block' }}>
              TOTAL RESERVAS
            </span>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1, marginTop: '4px' }}>
              {totalReservasCount}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', marginTop: '4px', display: 'inline-block' }}>
              ↑ Activas en Sistema
            </span>
          </div>
          <div 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#d91a2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CalendarCheck size={22} color="#d91a2a" />
          </div>
        </div>

        {/* Check-ins Pendientes */}
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', display: 'block' }}>
              CHECK-INS PENDIENTES
            </span>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1, marginTop: '4px' }}>
              {String(checkinsPendientesCount).padStart(2, '0')}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', marginTop: '4px', display: 'inline-block' }}>
              Por ingresar al hotel
            </span>
          </div>
          <div 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#fefce8',
              border: '1px solid #fef08a',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Clock size={22} color="#d97706" />
          </div>
        </div>

        {/* Huéspedes In-House */}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', display: 'block' }}>
                HUÉSPEDES IN-HOUSE
              </span>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1, marginTop: '4px' }}>
                {String(inHouseCount).padStart(2, '0')}
              </div>
            </div>
            <div 
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Building size={22} color="#059669" />
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              <span>Ocupación actual</span>
              <span style={{ color: '#059669', fontWeight: 900 }}>{pctOcupacion}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${pctOcupacion}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '9999px', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        </div>

        {/* Check-outs Programados */}
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', display: 'block' }}>
              CHECK-OUTS PROGRAMADOS
            </span>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1, marginTop: '4px' }}>
              {String(checkoutsProgramadosCount).padStart(2, '0')}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', marginTop: '4px', display: 'inline-block' }}>
              ✓ Salidas por liquidar
            </span>
          </div>
          <div 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <UserCheck size={22} color="#2563eb" />
          </div>
        </div>
      </div>

      {/* 2. TABLA PRINCIPAL DE AUDITORÍA */}
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
      >
        
        {/* Cabecera del Panel */}
        <div 
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                borderRadius: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                flexShrink: 0
              }}
            >
              <CalendarCheck size={22} color="#0284c7" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px', margin: 0 }}>
                  Panel de Auditoría — Reservas Activas del Hotel
                </h2>
                <span 
                  style={{
                    backgroundColor: '#d91a2a',
                    color: '#ffffff',
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 900
                  }}
                >
                  {totalReservasCount} Activas
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '4px', marginBottom: 0 }}>
                Control de estancias, liquidación inmediata, seguimiento de Check-In/Check-Out y auditoría operativa.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNuevaReserva && onNuevaReserva()}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '12px',
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
          >
            <Plus size={15} color="#ffffff" strokeWidth={2.5} />
            <span>+ Nueva Reserva Presencial</span>
          </button>
        </div>

        {/* Filtros y Buscador */}
        <div 
          style={{
            padding: '14px 28px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 320px', maxWidth: '640px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                placeholder="Buscar por huésped, documento o apartamento..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

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
              <option value="CONFIRMADA">Confirmadas (Por llegar)</option>
              <option value="CHECK-IN">In-House (Hospedadas)</option>
              <option value="COMPLETADA">Completadas (Check-out)</option>
              <option value="CANCELADA">Canceladas</option>
            </select>

            <select
              value={filtroOrigen}
              onChange={(e) => {
                setFiltroOrigen(e.target.value);
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
              <option value="TODOS">Todos los orígenes</option>
              <option value="SISTEMA">Sistema</option>
              <option value="RECEPCION">Recepción Facile</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
            Mostrando <strong style={{ color: '#0f172a' }}>{filasVisibles.length}</strong> de{' '}
            <strong style={{ color: '#0f172a' }}>{reservasFiltradas.length}</strong> reservas
            {hayFiltrosAplicados ? ' (con filtros aplicados)' : ' registradas'}
          </div>
        </div>

        {/* Tabla de Reservas */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '950px' }}>
            <thead>
              <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                <th style={{ padding: '14px 28px', width: '22%' }}>HUÉSPED</th>
                <th style={{ padding: '14px 16px', width: '16%' }}>APARTAMENTO</th>
                <th style={{ padding: '14px 16px', width: '18%' }}>FECHAS & ESTADÍA</th>
                <th style={{ padding: '14px 16px', width: '14%' }}>ESTADO</th>
                <th style={{ padding: '14px 16px', width: '16%' }}>ORIGEN</th>
                <th style={{ padding: '14px 28px', width: '14%', textAlign: 'right' }}>ACCIÓN DE CICLO</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '12px' }}>
              {filasVisibles.map((r, idx) => {
                const iniciales = r.huesped.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

                return (
                  <tr 
                    key={r.id || idx}
                    style={{ 
                      borderBottom: idx < filasVisibles.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    
                    {/* Huésped */}
                    <td style={{ padding: '14px 28px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div 
                          style={{
                            width: '34px',
                            height: '34px',
                            minWidth: '34px',
                            borderRadius: '50%',
                            backgroundColor: r.avatarBg || '#f1f5f9',
                            color: r.avatarText || '#334155',
                            border: `1px solid ${r.avatarBorder || '#e2e8f0'}`,
                            fontSize: '11px',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {iniciales}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', lineHeight: 1.2 }}>
                            {r.huesped}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>
                            Doc: {r.doc}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Apartamento */}
                    <td style={{ padding: '14px 16px' }}>
                      <span 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#0369a1',
                          fontWeight: 700,
                          fontSize: '11px'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284c7', display: 'inline-block' }}></span>
                        {r.apartamento}
                      </span>
                    </td>

                    {/* Fechas */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '11px', color: '#334155', fontWeight: 600 }}>
                        <div><span style={{ color: '#94a3b8', fontWeight: 500 }}>In:</span> {r.checkIn}</div>
                        <div style={{ marginTop: '2px' }}><span style={{ color: '#94a3b8', fontWeight: 500 }}>Out:</span> {r.checkOut}</div>
                        {r.checkin_at && (
                          <div style={{ marginTop: '3px', color: '#047857', fontWeight: 700, fontSize: '10px' }}>
                            Entrada: {new Date(r.checkin_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                        {r.checkout_at && (
                          <div style={{ marginTop: '2px', color: '#2563eb', fontWeight: 700, fontSize: '10px' }}>
                            Salida: {new Date(r.checkout_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '14px 16px' }}>
                      {(() => {
                        const est = String(r.estado || '').toUpperCase();
                        if (est === 'CHECK-IN' || est === 'IN-HOUSE' || est === 'OCUPADA') {
                          return (
                            <span 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                backgroundColor: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                color: '#047857',
                                fontWeight: 800,
                                fontSize: '11px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} className="animate-pulse"></span>
                              In-House (Activa)
                            </span>
                          );
                        }
                        if (est === 'COMPLETADA' || est === 'FINALIZADA') {
                          return (
                            <span 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                color: '#475569',
                                fontWeight: 700,
                                fontSize: '11px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b', display: 'inline-block' }}></span>
                              Completada
                            </span>
                          );
                        }
                        if (est === 'CANCELADA') {
                          return (
                            <span 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#b91c1c',
                                fontWeight: 700,
                                fontSize: '11px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'inline-block' }}></span>
                              Cancelada
                            </span>
                          );
                        }
                        // Por defecto: Confirmada
                        return (
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              backgroundColor: '#fffbeb',
                              border: '1px solid #fde68a',
                              color: '#b45309',
                              fontWeight: 700,
                              fontSize: '11px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706', display: 'inline-block' }}></span>
                            Confirmada
                          </span>
                        );
                      })()}
                    </td>

                    {/* Origen */}
                    <td style={{ padding: '14px 16px' }}>
                      {r.tipoOrigen === 'sistema' ? (
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '11px'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '1px', backgroundColor: '#64748b', display: 'inline-block' }}></span>
                          Sistema
                        </span>
                      ) : (
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fef08a',
                            color: '#854d0e',
                            fontWeight: 600,
                            fontSize: '11px'
                          }}
                        >
                          {r.tipoOrigen === 'recepcion' ? '🛎️' : '👑'}
                          <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.origen}>
                            {r.origen}
                          </span>
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '14px 28px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          id={`pms-folio-${r.id_reserva || r.id}`}
                          onClick={() => onVerFolio && onVerFolio(r.id_reserva || r.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 14px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: '11px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                          title="Ver folio financiero: desglose de IVA, cobros y factura"
                        >
                          <Receipt size={13} />
                          <span>Folio</span>
                        </button>
                        {String(r.estado || '').toUpperCase() === 'CONFIRMADA' && onEditarReserva && (
                          <button
                            type="button"
                            id={`pms-editar-${r.id_reserva || r.id}`}
                            onClick={() => onEditarReserva(r)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 14px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              fontWeight: 700,
                              fontSize: '11px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f1f5f9';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                            title="Modificar fechas, unidad u observaciones sin cancelar la reserva"
                          >
                            <Pencil size={13} />
                            <span>Editar</span>
                          </button>
                        )}
                        {(() => {
                          const est = String(r.estado || '').toUpperCase();

                          // ESTADO IN-HOUSE: el huésped ya está adentro, corresponde CHECK-OUT
                          if (est === 'CHECK-IN' || est === 'IN-HOUSE' || est === 'OCUPADA') {
                            return (
                              <button
                                type="button"
                                id={`pms-checkout-${r.id_reserva || r.id}`}
                                onClick={() => handleCheckOutInterno(r.id || r.id_reserva)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '5px 14px',
                                  borderRadius: '8px',
                                  border: '1px solid #bfdbfe',
                                  backgroundColor: '#eff6ff',
                                  color: '#1d4ed8',
                                  fontWeight: 700,
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  boxShadow: '0 1px 2px rgba(29, 78, 216, 0.08)',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#dbeafe';
                                  e.currentTarget.style.borderColor = '#93c5fd';
                                  e.currentTarget.style.color = '#1e40af';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#eff6ff';
                                  e.currentTarget.style.borderColor = '#bfdbfe';
                                  e.currentTarget.style.color = '#1d4ed8';
                                }}
                                title="Registrar salida del huésped (Check-out), liquidar estancia y pasar apartamento a Limpieza"
                              >
                                <ArrowRight size={13} strokeWidth={2.5} />
                                <span>Check-out</span>
                              </button>
                            );
                          }

                          // ESTADO COMPLETADA: estancia finalizada
                          if (est === 'COMPLETADA' || est === 'FINALIZADA') {
                            return (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  color: '#166534',
                                  fontWeight: 700,
                                  fontSize: '11px',
                                  whiteSpace: 'nowrap'
                                }}
                                title="Estancia completada y liquidada"
                              >
                                <Check size={12} strokeWidth={2.5} color="#059669" />
                                <span>✓ Estadía finalizada</span>
                              </span>
                            );
                          }

                          // ESTADO CANCELADA: anulada
                          if (est === 'CANCELADA') {
                            return (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: '#fef2f2',
                                  border: '1px solid #fee2e2',
                                  color: '#dc2626',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                Anulada
                              </span>
                            );
                          }

                          // ESTADO CONFIRMADA (Llegada pendiente): CHECK-IN + CANCELAR
                          return (
                            <>
                              <button
                                type="button"
                                id={`pms-checkin-${r.id_reserva || r.id}`}
                                onClick={() => handleCheckInInterno(r.id || r.id_reserva)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #a7f3d0',
                                  backgroundColor: '#f0fdf4',
                                  color: '#047857',
                                  fontWeight: 700,
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  boxShadow: '0 1px 2px rgba(4, 120, 87, 0.06)',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#dcfce7';
                                  e.currentTarget.style.borderColor = '#86efac';
                                  e.currentTarget.style.color = '#065f46';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                                  e.currentTarget.style.borderColor = '#a7f3d0';
                                  e.currentTarget.style.color = '#047857';
                                }}
                                title="Registrar entrada del huésped (Check-in) y marcar habitación como Ocupada"
                              >
                                <Check size={12} strokeWidth={2.5} />
                                <span>Check-in</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCancelarInterno(r.id || r.id_reserva)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '4px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #fecdd3',
                                  backgroundColor: '#ffffff',
                                  color: '#dc2626',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fff1f2';
                                  e.currentTarget.style.borderColor = '#fca5a5';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#ffffff';
                                  e.currentTarget.style.borderColor = '#fecdd3';
                                }}
                                title="Cancelar esta reserva"
                              >
                                Cancelar
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div 
          style={{
            padding: '14px 28px',
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
            Página <strong style={{ color: '#0f172a' }}>{paginaSegura}</strong> de{' '}
            <strong style={{ color: '#0f172a' }}>{totalPaginas}</strong>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button 
              type="button"
              disabled={paginaSegura === 1}
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 700,
                cursor: paginaSegura === 1 ? 'not-allowed' : 'pointer',
                opacity: paginaSegura === 1 ? 0.5 : 1
              }}
            >
              Anterior
            </button>
            
            {paginasVisibles.map((pg, i) => (
              pg === '…' ? (
                <span
                  key={`gap-${i}`}
                  style={{ padding: '0 4px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}
                >
                  …
                </span>
              ) : (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setPaginaActual(pg)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: paginaSegura === pg ? '#0f172a' : '#ffffff',
                    border: `1px solid ${paginaSegura === pg ? '#0f172a' : '#e2e8f0'}`,
                    color: paginaSegura === pg ? '#ffffff' : '#334155',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {pg}
                </button>
              )
            ))}

            <button
              type="button"
              disabled={paginaSegura === totalPaginas}
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: paginaSegura === totalPaginas ? 'not-allowed' : 'pointer',
                opacity: paginaSegura === totalPaginas ? 0.5 : 1
              }}
            >
              Siguiente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
