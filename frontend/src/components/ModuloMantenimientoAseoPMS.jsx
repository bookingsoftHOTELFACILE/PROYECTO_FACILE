import React, { useState } from 'react';
import { 
  Wrench, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Clock, 
  Plus, 
  Check, 
  RotateCcw 
} from 'lucide-react';

export default function ModuloMantenimientoAseoPMS({ onReportarNovedad, onCambiarEstado }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroPiso, setFiltroPiso] = useState('TODOS');
  const [paginaActual, setPaginaActual] = useState(1);

  // Lista de apartamentos operativos (con datos idénticos a SCREEN_60 / Imagen 2)
  const [apartamentos, setApartamentos] = useState([
    {
      id: 'D102',
      numeroPuerta: '102',
      nombre: 'Apto D102',
      piso: 'Piso 1',
      tipo: 'Dúplex',
      estado: 'DISPONIBLE',
      novedad: '— Sin novedades',
      modificadoPor: 'Administrador Grupo BookingSoft',
      tiempoModificacion: 'Administrador • Hace 12 min'
    },
    {
      id: 'H402',
      numeroPuerta: '402',
      nombre: 'Apto H402',
      piso: 'Piso 4',
      tipo: 'Habitaciones',
      estado: 'DISPONIBLE',
      novedad: '— Sin novedades',
      modificadoPor: 'Administrador Grupo BookingSoft',
      tiempoModificacion: 'Administrador • Hace 34 min'
    },
    {
      id: 'H406',
      numeroPuerta: '406',
      nombre: 'Apto H406',
      piso: 'Piso 4',
      tipo: 'Habitaciones',
      estado: 'LIMPIEZA',
      novedad: 'Cambio sábanas suite & aseo baño máster',
      modificadoPor: 'Camila R. (Gobernanta)',
      tiempoModificacion: 'Ama de Llaves • Hace 8 min'
    },
    {
      id: 'D103',
      numeroPuerta: '103',
      nombre: 'Apto D103',
      piso: 'Piso 1',
      tipo: 'Dúplex',
      estado: 'DISPONIBLE',
      novedad: '— Sin novedades',
      modificadoPor: 'Administrador Grupo BookingSoft',
      tiempoModificacion: 'Administrador • Hace 1 h'
    },
    {
      id: 'DB203',
      numeroPuerta: '203',
      nombre: 'Apto DB203',
      piso: 'Piso B',
      tipo: 'Dobles',
      estado: 'MANTENIMIENTO',
      novedad: 'Fuga menor grifería lavamanos principal',
      modificadoPor: 'Técnico Fabio (Mantto)',
      tiempoModificacion: 'Mantenimiento • Hace 2 h'
    },
    {
      id: 'DB210',
      numeroPuerta: '210',
      nombre: 'Apto DB210',
      piso: 'Piso B',
      tipo: 'Dobles',
      estado: 'DISPONIBLE',
      novedad: '— Sin novedades',
      modificadoPor: 'Administrador Grupo BookingSoft',
      tiempoModificacion: 'Administrador • Ayer'
    },
    {
      id: 'D104',
      numeroPuerta: '104',
      nombre: 'Apto D104',
      piso: 'Piso 1',
      tipo: 'Dúplex',
      estado: 'DISPONIBLE',
      novedad: '— Sin novedades',
      modificadoPor: 'Administrador Grupo BookingSoft',
      tiempoModificacion: 'Administrador • Hace 3 h'
    },
    {
      id: 'H403',
      numeroPuerta: '403',
      nombre: 'Apto H403',
      piso: 'Piso 4',
      tipo: 'Habitaciones',
      estado: 'DISPONIBLE',
      novedad: '— Sin novedades',
      modificadoPor: 'Administrador Grupo BookingSoft',
      tiempoModificacion: 'Administrador • Hace 5 h'
    }
  ]);

  const handleCambiarEstado = (id, nuevoEstado) => {
    setApartamentos(prev => prev.map(apto => {
      if (apto.id === id) {
        return {
          ...apto,
          estado: nuevoEstado,
          novedad: nuevoEstado === 'DISPONIBLE' ? '— Sin novedades' : apto.novedad,
          tiempoModificacion: 'Administrador • Ahora'
        };
      }
      return apto;
    }));
    if (onCambiarEstado) {
      onCambiarEstado(id, nuevoEstado);
    }
  };

  const handleReportarAccion = (apto) => {
    if (onReportarNovedad) {
      onReportarNovedad(apto);
    } else {
      handleCambiarEstado(apto.id, 'MANTENIMIENTO');
    }
  };

  // Contadores dinámicos para KPIs
  const conteoDisponibles = apartamentos.filter(a => a.estado === 'DISPONIBLE').length;
  const conteoLimpieza = apartamentos.filter(a => a.estado === 'LIMPIEZA').length;
  const conteoMantenimiento = apartamentos.filter(a => a.estado === 'MANTENIMIENTO').length;

  // Filtrado de apartamentos
  const aptosFiltrados = apartamentos.filter(a => {
    const query = busqueda.toLowerCase().trim();
    const coincideTexto = !query || 
                          a.nombre.toLowerCase().includes(query) || 
                          a.numeroPuerta.includes(query) ||
                          a.novedad.toLowerCase().includes(query) ||
                          a.tipo.toLowerCase().includes(query);
    const coincideEstado = filtroEstado === 'TODOS' || a.estado === filtroEstado;
    const coincideTipo = filtroTipo === 'TODOS' || a.tipo.toLowerCase() === filtroTipo.toLowerCase();
    const coincidePiso = filtroPiso === 'TODOS' || a.piso.toLowerCase().includes(filtroPiso.toLowerCase());
    return coincideTexto && coincideEstado && coincideTipo && coincidePiso;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans mb-8">
      
      {/* 1. ENCABEZADO INSTITUCIONAL DE OPERACIONES DE PLANTA (IDÉNTICO A IMAGEN 2) */}
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
        {/* Lado Izquierdo: Icono y Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{
              width: '48px',
              height: '48px',
              minWidth: '48px',
              borderRadius: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d91a2a',
              flexShrink: 0
            }}
          >
            <Wrench size={24} color="#d91a2a" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px', margin: 0 }}>
                Operaciones de Planta — Mantenimiento & Aseo Hotelero
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
                40 Apartamentos
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '4px', marginBottom: 0 }}>
              Atienda y solucione los reportes de daños enviados por las amas de llaves para liberar las habitaciones a estado Disponible.
            </p>
          </div>
        </div>

        {/* Lado Derecho: Pastillas de Filtro Rápido y Botón + Reportar Novedad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Aseo Pendiente */}
          <button
            type="button"
            onClick={() => setFiltroEstado(filtroEstado === 'LIMPIEZA' ? 'TODOS' : 'LIMPIEZA')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: filtroEstado === 'LIMPIEZA' ? '#fef3c7' : '#fffbeb',
              border: `1px solid ${filtroEstado === 'LIMPIEZA' ? '#f59e0b' : '#fde68a'}`,
              color: '#92400e',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>✓ Aseo Pendiente (1)</span>
          </button>

          {/* Daños / Mantenimiento */}
          <button
            type="button"
            onClick={() => setFiltroEstado(filtroEstado === 'MANTENIMIENTO' ? 'TODOS' : 'MANTENIMIENTO')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: filtroEstado === 'MANTENIMIENTO' ? '#fee2e2' : '#fef2f2',
              border: `1px solid ${filtroEstado === 'MANTENIMIENTO' ? '#ef4444' : '#fecaca'}`,
              color: '#dc2626',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>⚠️ Daños / Mantenimiento (1)</span>
          </button>

          {/* Ver Todas */}
          <button
            type="button"
            onClick={() => {
              setFiltroEstado('TODOS');
              setFiltroTipo('TODOS');
              setFiltroPiso('TODOS');
              setBusqueda('');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 16px',
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
            <span>Ver Todas (40)</span>
          </button>

          {/* + Reportar Novedad */}
          <button
            type="button"
            onClick={() => onReportarNovedad && onReportarNovedad()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
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

      {/* 2. TARJETAS DE KPIS OPERATIVAS DE PLANTA (IDÉNTICO A IMAGEN 2) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* KPI 1: Disponibles Listos */}
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
              DISPONIBLES LISTOS
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
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>32</span>
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
              80% flota
            </span>
          </div>
          {/* Barra de progreso */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: '80%', height: '100%', backgroundColor: '#10b981', borderRadius: '9999px' }} />
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
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>5</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
              en proceso turnos
            </span>
          </div>
          {/* Barra de progreso */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: '15%', height: '100%', backgroundColor: '#f59e0b', borderRadius: '9999px' }} />
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
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>3</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626' }}>
              Prioridad Alta
            </span>
          </div>
          {/* Barra de progreso */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: '10%', height: '100%', backgroundColor: '#ef4444', borderRadius: '9999px' }} />
          </div>
        </div>

        {/* KPI 4: Tiempo Promedio Turno */}
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
              TIEMPO PROMEDIO TURNO
            </span>
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>42</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
              minutos / checkout
            </span>
          </div>
          {/* Barra de progreso */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: '55%', height: '100%', backgroundColor: '#6366f1', borderRadius: '9999px' }} />
          </div>
        </div>

      </div>

      {/* 3. TABLA DE OPERACIONES Y CONTROLES (IDÉNTICO A IMAGEN 2) */}
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
                placeholder="Buscar por apartamento (Ej: H402, D102) o detalle de novedad..."
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
                <option value="DISPONIBLE">Disponibles</option>
                <option value="LIMPIEZA">En Limpieza</option>
                <option value="MANTENIMIENTO">Daños / Mantenimiento</option>
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
                <option value="B">Piso B</option>
                <option value="4">Piso 4</option>
              </select>
            </div>
          </div>

          {/* Sub-barra informativa */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              Mostrando <strong style={{ color: '#0f172a' }}>{aptosFiltrados.length} de 40</strong> apartamentos registrados
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              Actualización de planta en tiempo real
            </span>
          </div>
        </div>

        {/* Tabla Operativa */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '980px' }}>
            <thead>
              <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                <th style={{ padding: '14px 20px', width: '18%' }}>APARTAMENTO</th>
                <th style={{ padding: '14px 16px', width: '13%' }}>TIPO</th>
                <th style={{ padding: '14px 16px', width: '15%' }}>ESTADO ACTUAL</th>
                <th style={{ padding: '14px 16px', width: '22%' }}>DETALLE DE NOVEDAD</th>
                <th style={{ padding: '14px 16px', width: '18%' }}>ÚLTIMA MODIFICACIÓN</th>
                <th style={{ padding: '14px 20px', width: '14%', textAlign: 'right' }}>ACCIONES DE TURNO</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '12px' }}>
              {aptosFiltrados.map((apto, idx) => {
                const isCleaning = apto.estado === 'LIMPIEZA';
                const isMaintenance = apto.estado === 'MANTENIMIENTO';
                const isAvailable = apto.estado === 'DISPONIBLE';

                return (
                  <tr 
                    key={apto.id}
                    style={{ 
                      borderBottom: idx < aptosFiltrados.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                            backgroundColor: isCleaning ? '#fefce8' : isMaintenance ? '#fee2e2' : '#f1f5f9',
                            border: `1px solid ${isCleaning ? '#fef08a' : isMaintenance ? '#fca5a5' : '#e2e8f0'}`,
                            color: isCleaning ? '#a16207' : isMaintenance ? '#dc2626' : '#334155',
                            fontWeight: 900,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {apto.numeroPuerta}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', lineHeight: 1.2 }}>
                            {apto.nombre}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                            {apto.piso}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* TIPO */}
                    <td style={{ padding: '14px 16px' }}>
                      <span 
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#334155',
                          fontWeight: 700,
                          fontSize: '11px'
                        }}
                      >
                        {apto.tipo}
                      </span>
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
                          <span style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
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
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                          Daño / Reparación
                        </span>
                      )}
                    </td>

                    {/* DETALLE DE NOVEDAD */}
                    <td style={{ padding: '14px 16px' }}>
                      <div 
                        style={{
                          fontSize: '12px',
                          fontWeight: apto.novedad !== '— Sin novedades' ? 700 : 500,
                          color: isMaintenance ? '#dc2626' : apto.novedad !== '— Sin novedades' ? '#0f172a' : '#94a3b8'
                        }}
                      >
                        {apto.novedad}
                      </div>
                    </td>

                    {/* ÚLTIMA MODIFICACIÓN */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '12px', lineHeight: 1.2 }}>
                        {apto.modificadoPor}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>
                        {apto.tiempoModificacion}
                      </div>
                    </td>

                    {/* ACCIONES DE TURNO */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'nowrap' }}>
                        {/* Marcar Disponible */}
                        <button
                          type="button"
                          onClick={() => handleCambiarEstado(apto.id, 'DISPONIBLE')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
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
                          title="Liberar apartamento a Disponible"
                        >
                          <Check size={12} color="#059669" strokeWidth={3} />
                          <span>Marcar Disponible</span>
                        </button>

                        {/* En Limpieza */}
                        <button
                          type="button"
                          onClick={() => handleCambiarEstado(apto.id, 'LIMPIEZA')}
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
                          title="Enviar a limpieza y aseo"
                        >
                          <Sparkles size={12} color="#d97706" strokeWidth={2.5} />
                          <span>En Limpieza</span>
                        </button>

                        {/* Reportar Daño */}
                        <button
                          type="button"
                          onClick={() => handleReportarAccion(apto)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                          title="Reportar avería técnica a mantenimiento"
                        >
                          <AlertTriangle size={12} color="#dc2626" strokeWidth={2.5} />
                          <span>Reportar Daño</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginador Inferior */}
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
            Página <strong style={{ color: '#0f172a' }}>{paginaActual}</strong> de <strong style={{ color: '#0f172a' }}>5</strong>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 700,
                cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                opacity: paginaActual === 1 ? 0.5 : 1
              }}
            >
              Anterior
            </button>

            {[1, 2, 3, 4, 5].map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setPaginaActual(pg)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: paginaActual === pg ? '#0f172a' : '#ffffff',
                  border: `1px solid ${paginaActual === pg ? '#0f172a' : '#e2e8f0'}`,
                  color: paginaActual === pg ? '#ffffff' : '#334155',
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
              disabled={paginaActual === 5}
              onClick={() => setPaginaActual(p => Math.min(5, p + 1))}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: paginaActual === 5 ? 'not-allowed' : 'pointer'
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

