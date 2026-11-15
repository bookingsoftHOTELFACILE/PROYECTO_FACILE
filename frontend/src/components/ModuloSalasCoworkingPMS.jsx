import React, { useState, useMemo } from 'react';
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
  List,
  Trash2,
  AlertCircle,
  FileText,
  Users
} from 'lucide-react';

export default function ModuloSalasCoworkingPMS({ 
  espaciosNegocio = [], 
  reservasNegocio = [], 
  huespedes = [],
  habitaciones = [],
  reservasHabitaciones = [],
  onNuevaReserva, 
  onLiberarEspacio 
}) {
  // Lista de espacios disponibles (reales de la base de datos o fallback oficial)
  const espacios = useMemo(() => {
    if (espaciosNegocio && espaciosNegocio.length > 0) return espaciosNegocio;
    return [
      { id_espacio: 1, nombre: 'Sala de Juntas 1', tipo: 'Sala de Juntas', capacidad: 10, precio_hora: 70000, estado: 'Disponible' },
      { id_espacio: 2, nombre: 'Sala de Juntas 2', tipo: 'Sala de Juntas', capacidad: 10, precio_hora: 70000, estado: 'Disponible' },
      { id_espacio: 3, nombre: 'Espacio Coworking (Flex)', tipo: 'Coworking', capacidad: 15, precio_hora: 20000, estado: 'Disponible' },
    ];
  }, [espaciosNegocio]);

  // Lista de huéspedes mapeados con su apartamento si tienen estancia activa
  const opcionesHuespedes = useMemo(() => {
    return (huespedes || []).map(h => {
      const resActiva = (reservasHabitaciones || []).find(r => 
        (String(r.id_huesped) === String(h.id_huesped) || r.huesped === h.nombre) && 
        (r.estado === 'Confirmada' || r.estado === 'Check-In' || r.estado === 'In-House' || r.estado === 'Ocupada')
      );
      const aptoTexto = resActiva?.apartamento || resActiva?.numero_habitacion || '';
      return {
        ...h,
        label: aptoTexto 
          ? `Apto ${aptoTexto} — ${h.nombre} (Doc: ${h.documento})`
          : `Huésped Registrado — ${h.nombre} (Doc: ${h.documento})`,
        apto: aptoTexto
      };
    });
  }, [huespedes, reservasHabitaciones]);

  // Estados del Formulario
  const [idEspacio, setIdEspacio] = useState(() => (espacios[0]?.id_espacio ? String(espacios[0].id_espacio) : '1'));
  const [tipoCliente, setTipoCliente] = useState('HUESPED'); // 'HUESPED' | 'EXTERNO'
  const [idHuesped, setIdHuesped] = useState(() => (opcionesHuespedes[0]?.id_huesped ? String(opcionesHuespedes[0].id_huesped) : ''));
  const [clienteExternoNombre, setClienteExternoNombre] = useState('');
  const [clienteExternoNit, setClienteExternoNit] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alerta, setAlerta] = useState(null);

  // Espacio seleccionado actualmente
  const espacioSeleccionado = useMemo(() => {
    return espacios.find(e => String(e.id_espacio) === String(idEspacio)) || espacios[0];
  }, [espacios, idEspacio]);

  const tarifaPorHora = Number(espacioSeleccionado?.precio_hora || 70000);

  // Cálculo de horas en tiempo real
  let horasReservadas = 2.0;
  if (horaInicio && horaFin) {
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
    if (diff > 0) horasReservadas = Math.round(diff * 10) / 10;
    else horasReservadas = 1.0;
  }

  // Liquidación con tarifas y descuentos corporativos oficiales
  let totalLiquidacion = horasReservadas * tarifaPorHora;
  let descuentoPaqueteTexto = null;

  if (espacioSeleccionado?.tipo === 'Sala de Juntas') {
    if (horasReservadas >= 8) {
      totalLiquidacion = 450000;
      descuentoPaqueteTexto = 'Paquete Día Completo (Tarifa plana $450.000 COP)';
    } else if (horasReservadas >= 4) {
      totalLiquidacion = 250000;
      descuentoPaqueteTexto = 'Paquete Medio Día (Tarifa plana $250.000 COP)';
    }
  } else {
    if (horasReservadas >= 8) {
      totalLiquidacion = 100000;
      descuentoPaqueteTexto = 'Pase Día Coworking (Tarifa plana $100.000 COP)';
    } else if (horasReservadas >= 4) {
      totalLiquidacion = 70000;
      descuentoPaqueteTexto = 'Bloque 4 Horas Coworking (Tarifa plana $70.000 COP)';
    }
  }

  // Filtrado de reservas activas
  const reservasActivas = useMemo(() => {
    return (reservasNegocio || []).filter(r => r.estado !== 'Cancelada');
  }, [reservasNegocio]);

  // Reservas activas de hoy
  const hoyStr = new Date().toLocaleDateString('en-CA');
  const reservasHoy = useMemo(() => {
    return reservasActivas.filter(r => String(r.fecha) === hoyStr);
  }, [reservasActivas, hoyStr]);

  // Subtotal facturado hoy
  const subtotalFacturadoHoy = useMemo(() => {
    return reservasHoy.reduce((acc, curr) => acc + (Number(curr.precio_total) || 0), 0);
  }, [reservasHoy]);

  // Conteo de disponibilidad actual
  const salasTotales = espacios.filter(e => e.tipo === 'Sala de Juntas').length;
  const salasOcupadasHoy = new Set(reservasHoy.filter(r => r.tipo_espacio === 'Sala de Juntas' || (r.espacio && r.espacio.includes('Sala'))).map(r => r.espacio)).size;
  const salasDisponibles = Math.max(0, salasTotales - salasOcupadasHoy);

  // Manejo de envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlerta(null);

    const huespedSel = opcionesHuespedes.find(h => String(h.id_huesped) === String(idHuesped)) || opcionesHuespedes[0];
    const nombreFinal = tipoCliente === 'HUESPED' 
      ? (huespedSel?.nombre || 'Huésped Registrado')
      : (clienteExternoNombre.trim() || 'Cliente Corporativo');
    const docFinal = tipoCliente === 'HUESPED'
      ? (huespedSel?.documento || null)
      : (clienteExternoNit.trim() || null);

    const payload = {
      id_espacio: parseInt(idEspacio),
      tipo_cliente: tipoCliente === 'HUESPED' ? 'Huésped Registrado' : 'Cliente Externo',
      id_huesped: tipoCliente === 'HUESPED' ? (huespedSel?.id_huesped || null) : null,
      nombre_cliente: nombreFinal,
      documento_cliente: docFinal,
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      observaciones: observaciones.trim() || null
    };

    if (onNuevaReserva) {
      const res = await onNuevaReserva(payload);
      if (res && res.ok) {
        setAlerta({ type: 'success', text: `✓ ¡Reserva confirmada para ${espacioSeleccionado?.nombre || 'Espacio'}!` });
        setObservaciones('');
        if (tipoCliente === 'EXTERNO') {
          setClienteExternoNombre('');
          setClienteExternoNit('');
        }
      } else if (res && !res.ok) {
        setAlerta({ type: 'error', text: res.message || 'Error al procesar la reserva.' });
      }
    }
    setSubmitting(false);
  };

  // Liberar espacio
  const handleLiberar = async (id_reserva_negocio) => {
    if (onLiberarEspacio) {
      await onLiberarEspacio(id_reserva_negocio);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto mb-8 font-sans">
      
      {/* 1. ENCABEZADO INSTITUCIONAL CON CONTADORES DINÁMICOS */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px', margin: 0 }}>
                Centro de Negocios — Reservas por Horas & Coworking
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
                {espacios.length} Espacios Corporativos
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '4px', marginBottom: 0 }}>
              Gestión y liquidación de salas de juntas ejecutivas y puestos flex de conectividad para huéspedes y clientes corporativos.
            </p>
          </div>
        </div>

        {/* Lado Derecho: Contadores de Disponibilidad en Tiempo Real */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Salas Disponibles */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0'
            }}
          >
            <span style={{ width: '8px', height: '8px', minWidth: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)' }} className="animate-pulse"></span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>Salas Disponibles:</span>
            <span style={{ backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #6ee7b7', fontWeight: 800, color: '#0f172a', fontSize: '12px' }}>
              {salasDisponibles} de {salasTotales}
            </span>
          </div>

          {/* Coworking Flex */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe'
            }}
          >
            <span style={{ width: '8px', height: '8px', minWidth: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block', boxShadow: '0 0 6px rgba(59, 130, 246, 0.4)' }}></span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>Coworking Flex:</span>
            <span style={{ backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #93c5fd', fontWeight: 800, color: '#0f172a', fontSize: '12px' }}>
              15 Puestos
            </span>
          </div>
        </div>
      </div>

      {/* ALERTA DE ESTADO */}
      {alerta && (
        <div 
          style={{
            padding: '12px 18px',
            borderRadius: '14px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: alerta.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${alerta.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: alerta.type === 'success' ? '#065f46' : '#dc2626'
          }}
        >
          <span>{alerta.text}</span>
          <button 
            type="button" 
            onClick={() => setAlerta(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 900 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. GRID PRINCIPAL: 5 COLS FORMULARIO / 7 COLS AGENDA EN VIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA (5 COLS): FORMULARIO DE RESERVA */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-5">
          {/* Encabezado del Formulario */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', minWidth: '10px', borderRadius: '50%', backgroundColor: '#d91a2a', display: 'inline-block' }}></span>
              <h3 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0f172a', margin: 0 }}>
                NUEVA RESERVA DE SALA / COWORKING
              </h3>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Tarificación por Hora</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Espacio / Sala Real de la BD */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: '6px' }}>
                ESPACIO DE TRABAJO / SALA <span style={{ color: '#d91a2a' }}>*</span>
              </label>
              <select
                value={idEspacio}
                onChange={(e) => setIdEspacio(e.target.value)}
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
                {espacios.map(esp => (
                  <option key={esp.id_espacio} value={esp.id_espacio}>
                    {esp.tipo === 'Coworking' ? '💻' : '🏢'} {esp.nombre} ({esp.capacidad} pax) — ${Number(esp.precio_hora).toLocaleString('es-CO')} COP / h
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Cliente (Radio Cards) */}
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

            {/* Huésped Registrado de la BD o Formulario de Cliente Externo */}
            {tipoCliente === 'HUESPED' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', margin: 0 }}>
                    HUÉSPED TITULAR <span style={{ color: '#d91a2a' }}>*</span>
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                    {opcionesHuespedes.length} huéspedes registrados
                  </span>
                </div>
                <select
                  value={idHuesped}
                  onChange={(e) => setIdHuesped(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {opcionesHuespedes.length === 0 ? (
                    <option value="">No hay huéspedes registrados en el sistema</option>
                  ) : (
                    opcionesHuespedes.map(h => (
                      <option key={h.id_huesped} value={h.id_huesped}>
                        {h.label}
                      </option>
                    ))
                  )}
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
                    placeholder="Ej: Inversiones Tech S.A.S."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
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
                      outline: 'none',
                      boxSizing: 'border-box'
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
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                  required
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
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                  required
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
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                  required
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
                  minHeight: '62px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* TARJETA OSCURA DE COTIZACIÓN EN VIVO */}
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

              {/* Descuento por Paquete si aplica */}
              {descuentoPaqueteTexto && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    marginBottom: '14px'
                  }}
                >
                  <span>Promoción Aplicada:</span>
                  <span style={{ fontWeight: 800 }}>{descuentoPaqueteTexto}</span>
                </div>
              )}

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
                <span>IVA (19% Exento Servicios Integrados):</span>
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
                    {tipoCliente === 'HUESPED' ? 'Cargable al folio contable de estancia' : 'Facturación empresarial con NIT'}
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

            {/* Botón de Confirmación */}
            <button
              type="submit"
              disabled={submitting}
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
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.2s ease',
                marginTop: '16px'
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#b91522'; }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#d91a2a'; }}
            >
              <Calendar size={18} color="#ffffff" />
              <span>{submitting ? 'Confirmando Reserva...' : 'Confirmar Reserva de Espacio'}</span>
            </button>
            <p style={{ fontSize: '11px', textAlign: 'center', color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>
              Sincronización instantánea con agenda y bloqueo de sala en base de datos.
            </p>
          </form>
        </div>

        {/* COLUMNA DERECHA (7 COLS): AGENDA EN TIEMPO REAL & DISPONIBILIDAD */}
        <div className="lg:col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TABLA DE RESERVAS ACTIVAS DEL DÍA */}
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
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
                gap: '12px',
                flexWrap: 'wrap'
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
                    RESERVAS ACTIVAS & PROGRAMADAS
                  </h3>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
                    Agenda en vivo del Centro de Negocios • Fecha: {fecha}
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
                {reservasActivas.length} Reservas Registradas
              </span>
            </div>

            {/* Tabla de Reservas */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '580px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                    <th style={{ padding: '12px 14px' }}>ESPACIO / SALA</th>
                    <th style={{ padding: '12px 14px' }}>CLIENTE / TITULAR</th>
                    <th style={{ padding: '12px 12px' }}>HORARIO & DURACIÓN</th>
                    <th style={{ padding: '12px 12px' }}>TARIFA LIQUIDADA</th>
                    <th style={{ padding: '12px 12px' }}>ESTADO</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '12px' }}>
                  {reservasActivas.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '28px' }}>📅</span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>No hay reservas activas en el Centro de Negocios</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Diligencie el formulario a la izquierda para agendar una sala o flex desk.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reservasActivas.map((res, idx) => (
                      <tr 
                        key={res.id_reserva_negocio || idx} 
                        style={{ 
                          borderBottom: idx < reservasActivas.length - 1 ? '1px solid #f1f5f9' : 'none',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Espacio */}
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span 
                              style={{
                                width: '7px',
                                height: '7px',
                                minWidth: '7px',
                                borderRadius: '50%',
                                backgroundColor: res.estado === 'Confirmada' ? '#10b981' : '#3b82f6',
                                display: 'inline-block'
                              }}
                            />
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{res.espacio}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', paddingLeft: '15px', marginTop: '2px', fontWeight: 500 }}>
                            {res.tipo_espacio || 'Espacio Ejecutivo'}
                          </div>
                        </td>

                        {/* Cliente */}
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                            {res.nombre_cliente}
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            {res.tipo_cliente === 'Cliente Externo' ? (
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
                                {res.documento_cliente ? `NIT: ${res.documento_cliente}` : 'Cliente Externo'}
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
                                Huésped Facile
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Horario */}
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '12px' }}>
                            {res.hora_inicio} - {res.hora_fin}
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px', color: '#059669' }}>
                            {res.duracion_horas} {res.duracion_horas === 1 ? 'hora' : 'horas'} • {res.fecha}
                          </div>
                        </td>

                        {/* Tarifa */}
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '13px', lineHeight: 1.1 }}>
                            ${Number(res.precio_total).toLocaleString('es-CO')}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800 }}>COP</div>
                        </td>

                        {/* Estado */}
                        <td style={{ padding: '14px 12px' }}>
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#065f46',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                          >
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                            {res.estado || 'Confirmada'}
                          </span>
                        </td>

                        {/* Acción */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleLiberar(res.id_reserva_negocio)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '8px',
                              border: '1px solid #fecaca',
                              backgroundColor: '#ffffff',
                              color: '#dc2626',
                              fontWeight: 700,
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                            title="Cancelar reserva y liberar horario"
                          >
                            <RotateCcw size={12} color="#dc2626" />
                            <span>Liberar</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Subtotal al Pie de Tabla */}
            <div 
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                Auditoría horaria y folios contables integrados
              </span>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                Subtotal Facturado Hoy: <strong style={{ color: '#0f172a', fontWeight: 900 }}>${subtotalFacturadoHoy.toLocaleString('es-CO')} COP</strong>
              </span>
            </div>
          </div>

          {/* 3 TARJETAS INFERIORES DE ESTADO DINÁMICO POR CADA ESPACIO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
            {espacios.map((esp, i) => {
              const resActivaEspacio = reservasHoy.find(r => r.espacio === esp.nombre);
              const estaOcupada = !!resActivaEspacio;

              return (
                <div 
                  key={esp.id_espacio}
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
                      backgroundColor: estaOcupada ? '#fee2e2' : '#dcfce7',
                      color: estaOcupada ? '#dc2626' : '#059669',
                      fontSize: '18px',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                      {esp.nombre}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: estaOcupada ? '#dc2626' : '#059669', marginTop: '3px' }}>
                      {estaOcupada ? `En uso (${resActivaEspacio.hora_inicio} - ${resActivaEspacio.hora_fin})` : 'Disponible hoy'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500, marginTop: '1px' }}>
                      Capacidad: {esp.capacidad} pax
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
