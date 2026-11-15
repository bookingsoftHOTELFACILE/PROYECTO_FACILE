import React, { useState } from 'react';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  Building, 
  CreditCard, 
  User, 
  X,
  Plus,
  List
} from 'lucide-react';

export default function ModuloSalasCoworkingPMS({ onNuevaReserva, onLiberarEspacio }) {
  // Estados del Formulario
  const [espacio, setEspacio] = useState('SALA_1');
  const [tipoCliente, setTipoCliente] = useState('HUESPED'); // 'HUESPED' | 'EXTERNO'
  const [huespedRegistrado, setHuespedRegistrado] = useState('APTO_D101');
  const [clienteExternoNombre, setClienteExternoNombre] = useState('');
  const [clienteExternoNit, setClienteExternoNit] = useState('');
  const [fecha, setFecha] = useState('2026-11-15');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [observaciones, setObservaciones] = useState('');

  // Tarifario oficial por hora
  const tarifario = {
    SALA_1: { nombre: 'Sala de Juntas 1 (10 pax)', tarifa: 70000, capacidad: 'Capacidad: 10 pax' },
    SALA_2: { nombre: 'Sala de Juntas 2 (10 pax)', tarifa: 70000, capacidad: 'Capacidad: 10 pax' },
    SALA_3: { nombre: 'Sala 3 VIP (15 pax)', tarifa: 20000, capacidad: 'Capacidad: 15 pax' },
    COWORKING: { nombre: 'Coworking Flex (Puesto)', tarifa: 15000, capacidad: 'Flex Desk Conectividad' },
  };

  // Cálculo de horas en tiempo real
  let horasReservadas = 2.0;
  if (horaInicio && horaFin) {
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
    if (diff <= 0) diff = 2.0;
    horasReservadas = Math.round(diff * 10) / 10;
  }
  const tarifaPorHora = tarifario[espacio]?.tarifa || 70000;
  const totalLiquidacion = tarifaPorHora * horasReservadas;

  // Lista de reservas activas del día
  const [reservasHoy, setReservasHoy] = useState([
    {
      id: 'res-01',
      espacio: 'Sala de Juntas 1',
      capacidad: 'Capacidad: 10 pax',
      cliente: 'Jose Miguel Chico',
      origen: 'Apto D101',
      tipoCliente: 'Huésped Facile',
      horario: '09:00 - 11:00',
      duracion: '2 horas (En uso)',
      total: 140000,
      estado: 'EN_CURSO',
    },
    {
      id: 'res-02',
      espacio: 'Sala de Juntas 2',
      capacidad: 'Capacidad: 10 pax',
      cliente: 'Inversiones Tech SAS',
      origen: 'NIT: 901.442.110-3',
      tipoCliente: 'Cliente Externo',
      horario: '14:00 - 17:00',
      duracion: '3 horas',
      total: 210000,
      estado: 'CONFIRMADA',
    },
    {
      id: 'res-03',
      espacio: 'Coworking Puesto 4',
      capacidad: 'Flex Desk Conectividad',
      cliente: 'Carlos Mendoza',
      origen: 'Apto S201',
      tipoCliente: 'Huésped Facile',
      horario: '10:00 - 18:00',
      duracion: '8 horas (Pase Día)',
      total: 120000,
      estado: 'ACTIVA',
    },
  ]);

  const handleLiberar = (id) => {
    if (onLiberarEspacio) {
      onLiberarEspacio(id);
    }
    setReservasHoy(reservasHoy.filter((r) => r.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nueva = {
      id: `res-${Date.now()}`,
      espacio: tarifario[espacio].nombre,
      capacidad: tarifario[espacio].capacidad,
      cliente: tipoCliente === 'HUESPED' ? 'Jose Miguel Chico' : (clienteExternoNombre || 'Cliente Corporativo'),
      origen: tipoCliente === 'HUESPED' ? 'Apto D101' : `NIT: ${clienteExternoNit || '901.883.210-1'}`,
      tipoCliente: tipoCliente === 'HUESPED' ? 'Huésped Facile' : 'Cliente Externo',
      horario: `${horaInicio} - ${horaFin}`,
      duracion: `${horasReservadas.toFixed(1)} horas`,
      total: totalLiquidacion,
      estado: 'CONFIRMADA',
    };
    if (onNuevaReserva) {
      onNuevaReserva(nueva);
    }
    setReservasHoy([nueva, ...reservasHoy]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto mb-8 font-sans">
      
      {/* 1. ENCABEZADO INSTITUCIONAL CON CONTADORES (ESTILO SCREEN_60 / IMAGEN 2) */}
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
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
              fontSize: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              flexShrink: 0
            }}
          >
            💼
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.4px', lineHeight: 1.15, margin: 0 }}>
                Centro de<br />Negocios
              </h2>
              <span style={{ color: '#cbd5e1', fontWeight: 300, fontSize: '24px', lineHeight: 1, userSelect: 'none' }}>—</span>
              <div style={{ color: '#1e293b', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.2px', lineHeight: 1.2 }}>
                Reservas por Horas &<br />Coworking
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '6px', marginBottom: 0 }}>
              Gestión ejecutiva de salas de conferencias, juntas y puestos flex por bloques horarios
            </p>
          </div>
        </div>

        {/* Lado Derecho: Contadores de Disponibilidad (Sin botón de actualizar) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Salas Disponibles */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0'
            }}
          >
            <span style={{ width: '8px', height: '8px', minWidth: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)' }}></span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>Salas Disponibles:</span>
            <span style={{ backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #6ee7b7', fontWeight: 800, color: '#0f172a', fontSize: '12px' }}>
              3 de 4
            </span>
          </div>

          {/* Coworking Flex */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe'
            }}
          >
            <span style={{ width: '8px', height: '8px', minWidth: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block', boxShadow: '0 0 6px rgba(59, 130, 246, 0.4)' }}></span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>Coworking Flex:</span>
            <span style={{ backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #93c5fd', fontWeight: 800, color: '#0f172a', fontSize: '12px' }}>
              12 Disponibles
            </span>
          </div>
        </div>
      </div>

      {/* 2. GRID PRINCIPAL (12 COLUMNAS: 5 COLS FORMULARIO / 7 COLS AGENDA) */}
      <div className="pms-coworking-grid grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA (5 COLS): FORMULARIO DE RESERVA */}
        <div className="pms-coworking-form-col lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
          {/* Encabezado del Formulario */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', minWidth: '10px', borderRadius: '50%', backgroundColor: '#d91a2a', display: 'inline-block' }}></span>
              <h3 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0f172a', margin: 0 }}>
                NUEVA RESERVA DE SALA / COWORKING
              </h3>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>Tarificación por Hora</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Espacio / Sala */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: '6px' }}>
                ESPACIO DE TRABAJO / SALA <span style={{ color: '#d91a2a' }}>*</span>
              </label>
              <select
                value={espacio}
                onChange={(e) => setEspacio(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="SALA_1">🏢 Sala de Juntas 1 (10 pax) — $70.000 COP / hora</option>
                <option value="SALA_2">🏢 Sala de Juntas 2 (10 pax) — $70.000 COP / hora</option>
                <option value="SALA_3">🏢 Sala 3 VIP (15 pax) — $20.000 COP / hora</option>
                <option value="COWORKING">💻 Puesto Coworking Flex — $15.000 COP / hora</option>
              </select>
            </div>

            {/* Tipo de Cliente (Radio Cards Idénticas a Imagen 2) */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: '8px' }}>
                TIPO DE CLIENTE <span style={{ color: '#d91a2a' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* HUÉSPED FACILE */}
                <button
                  type="button"
                  onClick={() => setTipoCliente('HUESPED')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '16px',
                    border: tipoCliente === 'HUESPED' ? '2px solid #d91a2a' : '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: tipoCliente === 'HUESPED' ? '0 1px 4px rgba(217, 26, 42, 0.1)' : 'none'
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      minWidth: '20px',
                      borderRadius: '50%',
                      border: tipoCliente === 'HUESPED' ? '2px solid #d91a2a' : '2px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    {tipoCliente === 'HUESPED' && (
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          minWidth: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#d91a2a'
                        }}
                      />
                    )}
                  </span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🏨</span> Huésped Facile
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>
                      Cargar a cuenta de habitación
                    </div>
                  </div>
                </button>

                {/* CLIENTE EXTERNO */}
                <button
                  type="button"
                  onClick={() => setTipoCliente('EXTERNO')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '16px',
                    border: tipoCliente === 'EXTERNO' ? '2px solid #d91a2a' : '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: tipoCliente === 'EXTERNO' ? '0 1px 4px rgba(217, 26, 42, 0.1)' : 'none'
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      minWidth: '20px',
                      borderRadius: '50%',
                      border: tipoCliente === 'EXTERNO' ? '2px solid #d91a2a' : '2px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    {tipoCliente === 'EXTERNO' && (
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          minWidth: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#d91a2a'
                        }}
                      />
                    )}
                  </span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🏢</span> Cliente Externo
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>
                      Factura directa / Razón Social
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Huésped Registrado o Datos Cliente Externo */}
            {tipoCliente === 'HUESPED' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', margin: 0 }}>
                    HUÉSPED REGISTRADO <span style={{ color: '#d91a2a' }}>*</span>
                  </label>
                  <span style={{ fontSize: '12px', color: '#d91a2a', fontWeight: 700, cursor: 'pointer' }}>
                    Ver folio de cuenta
                  </span>
                </div>
                <select
                  value={huespedRegistrado}
                  onChange={(e) => setHuespedRegistrado(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="APTO_D101">Apto D101 — Jose Miguel Chico (Check-out: 18 Nov)</option>
                  <option value="APTO_S201">Apto S201 — Carlos Mendoza (Check-out: 20 Nov)</option>
                  <option value="APTO_F301">Apto F301 — María Gómez (Check-out: 22 Nov)</option>
                </select>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: '6px' }}>
                    RAZÓN SOCIAL / NOMBRE <span style={{ color: '#d91a2a' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={clienteExternoNombre}
                    onChange={(e) => setClienteExternoNombre(e.target.value)}
                    placeholder="Ej: Inversiones Tech SAS"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: '6px' }}>
                    NIT / DOCUMENTO <span style={{ color: '#d91a2a' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={clienteExternoNit}
                    onChange={(e) => setClienteExternoNit(e.target.value)}
                    placeholder="901.442.110-3"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
              </div>
            )}

            {/* Fecha, Hora Inicio y Fin */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: '6px' }}>
                  FECHA
                </label>
                <input
                  type="date"
                  min={new Date().toLocaleDateString('en-CA')}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    textAlign: 'center',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: '6px' }}>
                  HORA INICIO
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    textAlign: 'center',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: '6px' }}>
                  HORA FIN
                </label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    textAlign: 'center',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: '6px' }}>
                OBSERVACIONES & SERVICIOS OPCIONALES
              </label>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Video beam 4K calibrado, estación de café gourmet x10, rotafolios..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  color: '#334155',
                  outline: 'none',
                  resize: 'none',
                  minHeight: '62px'
                }}
              />
            </div>

            {/* TARJETA OSCURA DE COTIZACIÓN EN VIVO (ESTILO SCREEN_60 / IMAGEN 2) */}
            <div 
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '16px',
                padding: '20px 22px',
                color: '#ffffff',
                border: '1px solid #1e293b',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Tarifa Horaria Base */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#94a3b8',
                  borderBottom: '1px solid #1e293b',
                  paddingBottom: '12px',
                  marginBottom: '14px'
                }}
              >
                <span>Tarifa Horaria Base:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#ffffff', fontSize: '13px' }}>
                  ${tarifaPorHora.toLocaleString('es-CO')} <span style={{ color: '#cbd5e1', fontFamily: 'sans-serif', fontWeight: 600, fontSize: '11px' }}>COP / h</span>
                </span>
              </div>

              {/* Bloque Horario Reservado */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '14px'
                }}
              >
                <span>Bloque Horario Reservado:</span>
                <span 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #059669',
                    backgroundColor: 'rgba(6, 78, 59, 0.35)',
                    color: '#34d399',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                >
                  {horaInicio} - {horaFin} ({horasReservadas.toFixed(1)} Horas)
                </span>
              </div>

              {/* IVA Exento */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '16px'
                }}
              >
                <span>IVA (19% Exento Huéspedes Ley Turismo):</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#ffffff', fontSize: '13px' }}>
                  $0 <span style={{ color: '#cbd5e1', fontFamily: 'sans-serif', fontWeight: 600, fontSize: '11px' }}>COP</span>
                </span>
              </div>

              {/* Total a Liquidar */}
              <div 
                style={{
                  paddingTop: '14px',
                  borderTop: '1px solid #1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span 
                    style={{
                      fontSize: '12px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#38bdf8',
                      display: 'block'
                    }}
                  >
                    TOTAL A LIQUIDAR
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '3px' }}>
                    {tipoCliente === 'HUESPED' ? 'Cargable a cuenta folio #FC-9482' : 'Factura corporativa directa'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span 
                    style={{
                      fontSize: '26px',
                      fontWeight: 900,
                      color: '#ffffff',
                      letterSpacing: '-0.5px',
                      lineHeight: 1
                    }}
                  >
                    ${totalLiquidacion.toLocaleString('es-CO')}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>COP</span>
                </div>
              </div>
            </div>

            {/* Botón de Confirmación con Rojo Facile y Sombra Luminosa */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '14px',
                backgroundColor: '#d91a2a',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                border: 'none',
                boxShadow: '0 4px 14px rgba(217, 26, 42, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '16px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91522'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d91a2a'}
            >
              <Calendar size={18} color="#ffffff" />
              <span>Confirmar Reserva de Espacio</span>
            </button>
            <p style={{ fontSize: '11px', textAlign: 'center', color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>
              Se enviará voucher digital al correo del titular automáticamente.
            </p>
          </form>
        </div>

        {/* COLUMNA DERECHA (7 COLS): AGENDA EN TIEMPO REAL & DISPONIBILIDAD (ESTILO SCREEN_60 / IMAGEN 2) */}
        <div className="pms-coworking-table-col lg:col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TABLA DE RESERVAS ACTIVAS DEL DÍA */}
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}
          >
            {/* Header de la Tarjeta */}
            <div 
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    minWidth: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#d1fae5',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <List size={18} color="#059669" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0f172a', margin: 0 }}>
                    RESERVAS ACTIVAS & PROGRAMADAS DE HOY
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
                    Agenda en tiempo real del 15 de Noviembre de 2026
                  </p>
                </div>
              </div>

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
                  fontSize: '12px',
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                {reservasHoy.length} Reservas Hoy
              </span>
            </div>

            {/* Tabla */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '580px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                    <th style={{ padding: '12px 14px' }}>ESPACIO / RECURSO</th>
                    <th style={{ padding: '12px 14px' }}>CLIENTE / APTO</th>
                    <th style={{ padding: '12px 12px' }}>HORARIO & TIEMPO</th>
                    <th style={{ padding: '12px 12px' }}>TIPO & TOTAL</th>
                    <th style={{ padding: '12px 12px' }}>ESTADO</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '12px' }}>
                  {reservasHoy.map((res, idx) => (
                    <tr 
                      key={res.id} 
                      style={{ 
                        borderBottom: idx < reservasHoy.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Espacio / Recurso */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span 
                            style={{
                              width: '7px',
                              height: '7px',
                              minWidth: '7px',
                              borderRadius: '50%',
                              backgroundColor: res.estado === 'EN_CURSO' ? '#10b981' : res.estado === 'CONFIRMADA' ? '#3b82f6' : '#a855f7',
                              display: 'inline-block'
                            }}
                          />
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{res.espacio}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', paddingLeft: '15px', marginTop: '2px', fontWeight: 500 }}>
                          {res.capacidad}
                        </div>
                      </td>

                      {/* Cliente / Apto */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{res.cliente}</div>
                        <div style={{ marginTop: '4px' }}>
                          {res.origen.includes('NIT') ? (
                            <span 
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#fffbeb',
                                border: '1px solid #fde68a',
                                color: '#b45309',
                                fontSize: '11px',
                                fontWeight: 700
                              }}
                            >
                              {res.origen}
                            </span>
                          ) : (
                            <span 
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                fontSize: '11px',
                                fontWeight: 700
                              }}
                            >
                              {res.origen}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Horario & Tiempo */}
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '12px' }}>
                          {res.horario}
                        </div>
                        <div 
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            marginTop: '2px',
                            color: res.estado === 'EN_CURSO' ? '#059669' : res.estado === 'CONFIRMADA' ? '#64748b' : '#9333ea'
                          }}
                        >
                          {res.duracion}
                        </div>
                      </td>

                      {/* Tipo & Total */}
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '13px', lineHeight: 1.1 }}>
                          ${res.total.toLocaleString('es-CO')}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800 }}>COP</div>
                        <div 
                          style={{
                            fontSize: '11px',
                            marginTop: '2px',
                            fontWeight: res.tipoCliente === 'Cliente Externo' ? 700 : 500,
                            color: res.tipoCliente === 'Cliente Externo' ? '#2563eb' : '#94a3b8'
                          }}
                        >
                          {res.tipoCliente}
                        </div>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '14px 12px' }}>
                        {res.estado === 'EN_CURSO' && (
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#047857',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                          >
                            <span style={{ fontSize: '10px' }}>◌</span>
                            En Curso
                          </span>
                        )}
                        {res.estado === 'CONFIRMADA' && (
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 14px',
                              borderRadius: '9999px',
                              backgroundColor: '#eff6ff',
                              border: '1.5px solid #60a5fa',
                              color: '#2563eb',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                          >
                            Confirmada
                          </span>
                        )}
                        {res.estado === 'ACTIVA' && (
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 14px',
                              borderRadius: '9999px',
                              backgroundColor: '#faf5ff',
                              border: '1px solid #f3e8ff',
                              color: '#9333ea',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                          >
                            Activa
                          </span>
                        )}
                      </td>

                      {/* Acción */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          {idx === 2 ? (
                            <button
                              type="button"
                              style={{
                                padding: '5px 14px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                color: '#334155',
                                fontWeight: 700,
                                fontSize: '11px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                            >
                              Gestionar
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#ffffff',
                                  color: '#334155',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                              >
                                Detalle
                              </button>
                              {res.estado === 'EN_CURSO' ? (
                                <button
                                  type="button"
                                  onClick={() => handleLiberar(res.id)}
                                  style={{
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #fecdd3',
                                    backgroundColor: '#fff1f2',
                                    color: '#e11d48',
                                    fontWeight: 700,
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe4e6'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff1f2'}
                                >
                                  Liberar
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleLiberar(res.id)}
                                  style={{
                                    padding: '4px 8px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#94a3b8',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                  title="Cancelar reserva"
                                >
                                  ✕
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer de la Tabla */}
            <div 
              style={{
                padding: '14px 24px',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                <span>🛡️</span> Tolerancia de desocupación: 15 min después de la hora fin.
              </span>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                Subtotal Facturado Hoy: <strong style={{ color: '#0f172a', fontWeight: 900 }}>$470.000 COP</strong>
              </span>
            </div>
          </div>

          {/* 3 TARJETAS INFERIORES DE ESTADO RÁPIDO DE SALAS (ESTILO IMAGEN 2) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {/* Tarjeta 1 - Sala 1 */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#fee2e2',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '20px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                1
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                  Sala 1 (10p)
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginTop: '3px' }}>
                  En uso hasta 11:00
                </div>
              </div>
            </div>

            {/* Tarjeta 2 - Sala 2 */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#dcfce7',
                  border: 'none',
                  color: '#059669',
                  fontSize: '20px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                2
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                  Sala 2 (10p)
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginTop: '3px' }}>
                  Disponible hasta 14:00
                </div>
              </div>
            </div>

            {/* Tarjeta 3 - Sala 3 VIP */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#dcfce7',
                  border: 'none',
                  color: '#059669',
                  fontSize: '20px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                  Sala 3 VIP (15p)
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginTop: '3px' }}>
                  Disponible todo el día
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
