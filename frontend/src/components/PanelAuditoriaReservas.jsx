import React, { useState } from 'react';
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
  Crown
} from 'lucide-react';

export default function PanelAuditoriaReservas({ 
  reservas = [], 
  onNuevaReserva, 
  onCheckIn, 
  onCancelarReserva 
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroOrigen, setFiltroOrigen] = useState('TODOS');
  const [paginaActual, setPaginaActual] = useState(1);

  // Lista base con los registros idénticos a SCREEN_1 / SCREEN_2 / Imagen 2
  const [listaReservas, setListaReservas] = useState(
    reservas.length > 0 ? reservas : [
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
        origen: 'Administrador Grupo BookingSoft (Administrador)',
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
        origen: 'Administrador Grupo BookingSoft (Administrador)',
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
        origen: 'Administrador Grupo BookingSoft (Administrador)',
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
        origen: 'Administrador Grupo BookingSoft (Administrador)',
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
        origen: 'Administrador Grupo BookingSoft (Administrador)',
        tipoOrigen: 'admin',
        avatarBg: '#fef2f2',
        avatarText: '#b91c1c',
        avatarBorder: '#fecaca'
      }
    ]
  );

  const handleCheckInInterno = (id) => {
    if (onCheckIn) {
      onCheckIn(id);
    } else {
      setListaReservas(listaReservas.map(r => r.id === id ? { ...r, estado: 'Check-In' } : r));
    }
  };

  const handleCancelarInterno = (id) => {
    if (onCancelarReserva) {
      onCancelarReserva(id);
    } else {
      setListaReservas(listaReservas.filter(r => r.id !== id));
    }
  };

  const reservasFiltradas = listaReservas.filter((r) => {
    const q = busqueda.toLowerCase().trim();
    const coincideTexto = !q ||
      r.huesped.toLowerCase().includes(q) ||
      (r.doc && r.doc.includes(q)) ||
      r.apartamento.toLowerCase().includes(q);
    const coincideEstado = filtroEstado === 'TODOS' || r.estado.toUpperCase() === filtroEstado.toUpperCase();
    const coincideOrigen = filtroOrigen === 'TODOS' || r.tipoOrigen.toUpperCase() === filtroOrigen.toUpperCase();
    return coincideTexto && coincideEstado && coincideOrigen;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans mb-8">
      
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
              21
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', marginTop: '4px', display: 'inline-block' }}>
              ↑ +4 registradas hoy
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
              05
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', marginTop: '4px', display: 'inline-block' }}>
              Prioritarios antes de 15:00
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
                12
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
              <span style={{ color: '#059669', fontWeight: 900 }}>60%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', backgroundColor: '#10b981', borderRadius: '9999px' }}></div>
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
              03
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', marginTop: '4px', display: 'inline-block' }}>
              ✓ 1 liquidado con éxito
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
                  21 Activas
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
              <option value="CONFIRMADA">Confirmadas</option>
              <option value="CHECK-IN">Check-In</option>
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
            Mostrando <strong style={{ color: '#0f172a' }}>8 de 21</strong> reservas registradas
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
              {reservasFiltradas.map((r, idx) => {
                const iniciales = r.huesped.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

                return (
                  <tr 
                    key={r.id || idx}
                    style={{ 
                      borderBottom: idx < reservasFiltradas.length - 1 ? '1px solid #f1f5f9' : 'none',
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
                      </div>
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '14px 16px' }}>
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
                          fontSize: '11px'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706', display: 'inline-block' }}></span>
                        {r.estado}
                      </span>
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
                          onClick={() => handleCheckInInterno(r.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#334155',
                            fontWeight: 600,
                            fontSize: '11px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ecfdf5';
                            e.currentTarget.style.borderColor = '#a7f3d0';
                            e.currentTarget.style.color = '#065f46';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.color = '#334155';
                          }}
                        >
                          <Check size={12} strokeWidth={2.5} />
                          <span>Check-in</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCancelarInterno(r.id)}
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
                        >
                          Cancelar
                        </button>
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
            Página <strong style={{ color: '#0f172a' }}>{paginaActual}</strong> de <strong style={{ color: '#0f172a' }}>3</strong>
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
            
            {[1, 2, 3].map((pg) => (
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
              disabled={paginaActual === 3}
              onClick={() => setPaginaActual(p => Math.min(3, p + 1))}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: paginaActual === 3 ? 'not-allowed' : 'pointer'
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
