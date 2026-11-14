import React, { useState, useMemo } from 'react';
import { 
  X, Wifi, Tv, KeyRound, UtensilsCrossed, Shirt, 
  Home, Clock, ShieldCheck, Users, BedDouble, Bath, 
  Building, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Maximize2, MessageSquare, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import HuespedesPicker from './HuespedesPicker.jsx';
import { 
  calcularNochesAgnostico, 
  iterarFechasRango, 
  rangoTieneOcupados, 
  formatearFechaDisplay, 
  formatearFechaCorta 
} from '../utils/dateUtils.js';

export default function ModalDetalle({ apartamento, onClose, onReservar }) {
  const { 
    selectedAptoFigma, setSelectedAptoFigma, setAptoLightboxPhoto, 
    handleReservarTipo, selectedHuesped, setShowGuestAuthModal,
    setReservaData, reservas = [], navegarATab
  } = useApp();

  // Fallback seguro respetando las propiedades reales de Facile Chicó
  const apto = apartamento || selectedAptoFigma || {
    tipo: 'Familiares',
    categoria: 'APARTAMENTO',
    nombreModal: 'Apartamento Familiar',
    titulo: 'Gran Suite Familiar Confort',
    desc: 'Cuenta con 3 habitaciones (habitación principal King con vestier, 2 habitaciones auxiliares con cama nido), 2 baños completos, comedor de 6 puestos, sofá cama, cocina abierta y 4 televisores HD.',
    precio: '$450.000',
    precioSub: 'COP/noche',
    capacidad: 'Hasta 6 personas',
    personas: 'Hasta 6 personas',
    habitaciones: '3 Habitaciones',
    numHabitaciones: '3 Habitaciones',
    banos: '2 Baños completos',
    numBanos: '2 Baños completos',
    formato: 'Suite Familiar',
    fotos: [
      { url: '/images/apartamentos/IMG_9459-HDR.jpg', titulo: 'Comedor y Sala' },
      { url: '/images/apartamentos/IMG_9462-HDR.jpg', titulo: 'Habitaciones Auxiliares' },
      { url: '/images/apartamentos/IMG_9465-HDR.jpg', titulo: 'Cocina Abierta' },
      { url: '/images/apartamentos/IMG_9426-HDR.jpg', titulo: 'Zona de Lavandería' }
    ]
  };

  const handleClose = () => {
    if (onClose) onClose();
    if (setSelectedAptoFigma) setSelectedAptoFigma(null);
  };

  // Mapeo estricto a las fotos reales del apartamento (locales)
  const fotosRaw = apto.fotos || apto.imagenes || (apto.imagen ? [{ url: apto.imagen }] : []);
  const fotosReales = fotosRaw.map(f => typeof f === 'string' ? f : f.url);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [numHuespedes, setNumHuespedes] = useState(apto.personas || '1 huésped');

  // Capacidad numérica máxima para el selector de huéspedes
  const capacidadNum = useMemo(() => {
    const raw = String(apto.personas || apto.capacidad || '6').replace(/\D/g, '');
    const num = parseInt(raw, 10);
    return isNaN(num) || num <= 0 ? 6 : num;
  }, [apto.personas, apto.capacidad]);

  // =========================================================================
  // MOTOR DE CALENDARIO 100% INTERACTIVO Y DINÁMICO
  // =========================================================================
  // Inicialización de mes en pantalla (Noviembre 2026 para alinear con la fecha comercial del diseño)
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(10); // 0-indexed: 10 = Noviembre

  // Rango de fechas seleccionado (YYYY-MM-DD)
  const [fechaEntrada, setFechaEntrada] = useState('2026-11-14');
  const [fechaSalida, setFechaSalida] = useState('2026-11-17');
  const [mensajeInteraccion, setMensajeInteraccion] = useState(null);

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Navegación de mes
  const handleMesAnterior = () => {
    if (calMonth === 0) {
      setCalYear(prev => prev - 1);
      setCalMonth(11);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleMesSiguiente = () => {
    if (calMonth === 11) {
      setCalYear(prev => prev + 1);
      setCalMonth(0);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  // Matriz de ocupación real simulada + reservas del sistema visibles en todos los meses
  const diasOcupados = useMemo(() => {
    const setOcupados = new Set();
    
    // Fechas ocupadas estándar visibles para que el usuario nunca esté a ciegas en cualquier mes:
    // Noviembre 2026: 7, 8, 21, 22
    setOcupados.add('2026-11-07');
    setOcupados.add('2026-11-08');
    setOcupados.add('2026-11-21');
    setOcupados.add('2026-11-22');

    // Diciembre 2026
    setOcupados.add('2026-12-04');
    setOcupados.add('2026-12-05');
    setOcupados.add('2026-12-12');
    setOcupados.add('2026-12-13');
    setOcupados.add('2026-12-24');
    setOcupados.add('2026-12-25');
    setOcupados.add('2026-12-31');

    // Enero 2027
    setOcupados.add('2027-01-01');
    setOcupados.add('2027-01-02');
    setOcupados.add('2027-01-15');
    setOcupados.add('2027-01-16');
    setOcupados.add('2027-01-29');
    setOcupados.add('2027-01-30');

    // Febrero 2027
    setOcupados.add('2027-02-05');
    setOcupados.add('2027-02-06');
    setOcupados.add('2027-02-19');
    setOcupados.add('2027-02-20');

    // Integración con reservas reales del contexto (agnóstica de zona horaria)
    if (Array.isArray(reservas)) {
      reservas.forEach(res => {
        const inicio = res.fecha_entrada || res.fecha_inicio;
        const fin = res.fecha_salida || res.fecha_fin;
        if (inicio && fin) {
          try {
            const fechas = iterarFechasRango(inicio, fin);
            fechas.forEach(f => setOcupados.add(f));
          } catch {
            // Ignorar formatos de fecha inválidos
          }
        }
      });
    }

    return setOcupados;
  }, [reservas]);

  // Generación de celdas del mes
  const celdasCalendario = useMemo(() => {
    // Primer día del mes (0 = Domingo, 1 = Lunes, etc.)
    const primerDia = new Date(calYear, calMonth, 1).getDay();
    // Ajustar a semana europea/latina (Lunes = 0, Domingo = 6)
    const desfaseLunes = (primerDia + 6) % 7;
    const totalDias = new Date(calYear, calMonth + 1, 0).getDate();

    const celdas = [];
    // Espacios vacíos antes del día 1
    for (let i = 0; i < desfaseLunes; i++) {
      celdas.push({ tipo: 'vacio', id: `empty-${i}` });
    }

    // Días del mes
    for (let dia = 1; dia <= totalDias; dia++) {
      const fechaStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const esOcupado = diasOcupados.has(fechaStr);
      
      const esEntrada = fechaEntrada === fechaStr;
      const esSalida = fechaSalida === fechaStr;
      const estaEnRango = fechaEntrada && fechaSalida && fechaStr > fechaEntrada && fechaStr < fechaSalida;
      const esSeleccionado = esEntrada || esSalida || estaEnRango;

      let estado = 1; // 1 = Disponible
      if (esOcupado) estado = 2; // 2 = Ocupado
      else if (esSeleccionado) estado = 3; // 3 = Tu Selección

      celdas.push({
        tipo: 'dia',
        dia,
        fechaStr,
        estado,
        esEntrada,
        esSalida,
        estaEnRango,
        esOcupado
      });
    }

    return celdas;
  }, [calYear, calMonth, diasOcupados, fechaEntrada, fechaSalida]);

  // Manejador interactivo e inteligente de clic en día (sin bloqueos frustrantes)
  const handleDiaClick = (celda) => {
    if (celda.esOcupado) {
      setMensajeInteraccion(`La fecha ${celda.dia} de ${nombresMeses[calMonth]} está ocupada. Selecciona un día disponible.`);
      setTimeout(() => setMensajeInteraccion(null), 3000);
      return;
    }

    // Si no hay fecha de entrada o ya se había completado el rango
    if (!fechaEntrada || (fechaEntrada && fechaSalida)) {
      setFechaEntrada(celda.fechaStr);
      setFechaSalida(null);
      setMensajeInteraccion(`Llegada: ${formatearFechaCorta(celda.fechaStr)}. Ahora selecciona tu fecha de salida.`);
      return;
    }

    // Si ya hay fecha de entrada pero no de salida
    if (fechaEntrada && !fechaSalida) {
      if (celda.fechaStr <= fechaEntrada) {
        // Clic en fecha anterior o igual: reiniciar con esta fecha como nueva llegada
        setFechaEntrada(celda.fechaStr);
        setFechaSalida(null);
        setMensajeInteraccion(`Nueva fecha de llegada: ${formatearFechaCorta(celda.fechaStr)}. Selecciona la salida.`);
        return;
      }

      // Verificar si en el rango seleccionado existen días ocupados
      // 100% agnóstico de zona horaria internacional (Australia UTC+11, Japón UTC+9, EE.UU., Europa, etc.)
      const tieneOcupadosEnRango = rangoTieneOcupados(fechaEntrada, celda.fechaStr, diasOcupados);

      if (tieneOcupadosEnRango) {
        // Si hay días ocupados en el camino, en lugar de un error molesto que bloquee al usuario,
        // se fija amigablemente esta fecha como la nueva llegada:
        setFechaEntrada(celda.fechaStr);
        setFechaSalida(null);
        setMensajeInteraccion(`Había fechas intermedias ocupadas. Tu nueva llegada es: ${formatearFechaCorta(celda.fechaStr)}. Ahora selecciona tu salida.`);
        setTimeout(() => setMensajeInteraccion(null), 4000);
        return;
      }

      // Rango válido
      setFechaSalida(celda.fechaStr);
      const noches = calcularNochesAgnostico(fechaEntrada, celda.fechaStr);
      setMensajeInteraccion(`¡Excelente! Has seleccionado ${noches} ${noches === 1 ? 'noche' : 'noches'}.`);
      setTimeout(() => setMensajeInteraccion(null), 3500);
    }
  };

  // Cálculo de noches de estancia de forma agnóstica de zona horaria
  const nochesEstancia = useMemo(() => {
    if (!fechaEntrada || !fechaSalida) return 1;
    return calcularNochesAgnostico(fechaEntrada, fechaSalida);
  }, [fechaEntrada, fechaSalida]);

  // Precio numérico base
  const precioNumerico = useMemo(() => {
    const raw = String(apto.precio || '450000').replace(/\D/g, '');
    const num = parseInt(raw, 10);
    return isNaN(num) || num <= 0 ? 450000 : num;
  }, [apto.precio]);

  // Desglose de descuentos por duración de estancia:
  // - 7 a 14 noches: 10% de descuento
  // - 15+ noches: 15% de descuento
  const porcentajeDescuento = useMemo(() => {
    if (nochesEstancia >= 15) return 15;
    if (nochesEstancia >= 7) return 10;
    return 0;
  }, [nochesEstancia]);

  const subtotalSinDescuento = useMemo(() => {
    return precioNumerico * nochesEstancia;
  }, [precioNumerico, nochesEstancia]);

  const montoDescuento = useMemo(() => {
    if (porcentajeDescuento > 0) {
      return Math.round((subtotalSinDescuento * porcentajeDescuento) / 100);
    }
    return 0;
  }, [subtotalSinDescuento, porcentajeDescuento]);

  const totalCalculado = useMemo(() => {
    return subtotalSinDescuento - montoDescuento;
  }, [subtotalSinDescuento, montoDescuento]);

  // =========================================================================
  // ACCIÓN DE RESERVA (INTEGRACIÓN FLUIDA CON LOGIN / REGISTRO)
  // =========================================================================
  const handleActionReservar = () => {
    const datosReservaApto = {
      ...apto,
      fechaEntrada,
      fechaSalida: fechaSalida || fechaEntrada,
      noches: nochesEstancia,
      numHuespedes,
      total: totalCalculado
    };

    // Actualizar datos de reserva en el estado global
    if (setReservaData) {
      setReservaData(prev => ({
        ...prev,
        id_habitacion: String(apto.id_habitacion || apto.numero || '101'),
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida || fechaEntrada,
        huespedes: parseInt(String(numHuespedes).replace(/\D/g, ''), 10) || 2
      }));
    }

    if (onReservar) {
      onReservar(datosReservaApto);
      handleClose();
      return;
    }

    // Regla de negocio del usuario: Si no ha iniciado sesión, mostrar modal de registro/login
    if (!selectedHuesped) {
      handleClose();
      if (setShowGuestAuthModal) {
        setShowGuestAuthModal(true);
      }
    } else {
      // Si ya está autenticado, continuar al flujo de reserva directa
      handleClose();
      if (navegarATab) {
        navegarATab('reservar');
        window.scrollTo({ top: 300, behavior: 'smooth' });
      } else if (handleReservarTipo) {
        handleReservarTipo(apto.tipo || 'Familiares');
      }
    }
  };

  return (
    <div 
      className="modal-detalle-backdrop"
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(9, 14, 26, 0.78)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto'
      }}
    >
      <div 
        className="modal-detalle-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '96%',
          maxWidth: '1360px',
          maxHeight: '94vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          margin: 'auto'
        }}
      >
        {/* Botón cerrar modal */}
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 20,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: 'none',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
          title="Cerrar modal"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))' }}>
          
          {/* ============================================================== */}
          {/* COLUMNA IZQUIERDA: GALERÍA + ESPECIFICACIONES + AMENIDADES     */}
          {/* ============================================================== */}
          <div style={{ padding: '28px', borderRight: '1px solid #f1f5f9' }}>
            
            {/* 1. Galería de Fotos Reales */}
            <div style={{ marginBottom: '20px' }}>
              <div 
                style={{
                  position: 'relative',
                  height: '340px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#0f172a',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (fotosRaw.length && setAptoLightboxPhoto) {
                    setAptoLightboxPhoto({ photos: fotosRaw, index: fotoActiva });
                  }
                }}
                title="Ampliar fotografía real a pantalla completa"
              >
                {fotosReales.length > 0 ? (
                  <img 
                    src={fotosReales[fotoActiva]} 
                    alt={apto.nombreModal || apto.titulo} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                    Fotografía no disponible
                  </div>
                )}
                <button 
                  type="button"
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(9, 14, 26, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <Maximize2 size={13} />
                  <span>Ampliar Fotografía Real</span>
                </button>
              </div>

              {/* Tira de Miniaturas Reales */}
              {fotosReales.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(fotosReales.length, 5)}, 1fr)`, gap: '8px', marginTop: '10px' }}>
                  {fotosReales.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFotoActiva(idx)}
                      style={{
                        position: 'relative',
                        height: '62px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: fotoActiva === idx ? '2px solid #d91a2a' : '2px solid transparent',
                        padding: 0,
                        backgroundColor: '#f1f5f9',
                        cursor: 'pointer',
                        transform: fotoActiva === idx ? 'scale(0.97)' : 'scale(1)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <img src={img} alt={`Miniatura ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {idx === 4 && fotosReales.length > 5 && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(9, 14, 26, 0.65)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          +{fotosReales.length - 4} fotos
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Grid de Especificaciones (2x2) con acentos de marca */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#fff8f8', border: '1px solid #fee2e2', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#d91a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={17} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#d91a2a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Capacidad</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>{apto.personas || apto.capacidad || 'Hasta 6 personas'}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff8f8', border: '1px solid #fee2e2', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#d91a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BedDouble size={17} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#d91a2a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Habitaciones</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>{apto.habitaciones || apto.numHabitaciones || '1 Habitación'}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff8f8', border: '1px solid #fee2e2', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#d91a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bath size={17} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#d91a2a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Baños</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>{apto.banos || apto.numBanos || '2 Baños completos'}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff8f8', border: '1px solid #fee2e2', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#d91a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building size={17} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#d91a2a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Formato</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>{apto.formato || apto.tipo || 'Suite Familiar'}</span>
                </div>
              </div>
            </div>

            {/* 3. Amenidades y Servicios del Apartamento */}
            <div>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                <span style={{ color: '#f59e0b' }}>✨</span> Lo que ofrece este apartamento
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><Wifi size={15} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600 }}>Wi-Fi Alta Velocidad</strong>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Fibra 300 Mbps para teletrabajo</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><UtensilsCrossed size={15} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600 }}>Cocina Integral</strong>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Equipada con vajilla y nevera</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><Tv size={15} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600 }}>Smart TV 55"</strong>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Streaming listo (Netflix/Prime)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><Shirt size={15} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600 }}>Zona de Lavado</strong>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Lavadora/Secadora en suite</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><KeyRound size={15} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600 }}>Cerradura Digital</strong>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Autocheck-in con código único</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><Home size={15} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600 }}>Balcón Privado</strong>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Vista a la ciudad de Bogotá</span>
                  </div>
                </div>
              </div>

              {/* Franja de Check-in / Check-out */}
              <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={13} color="#d91a2a" /> Check-in: 3:00 PM</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={13} color="#d91a2a" /> Check-out: 11:00 AM</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={13} color="#10b981" /> Vigilancia: 24/7</span>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* COLUMNA DERECHA: WIDGET DE RESERVA + CALENDARIO INTERACTIVO   */}
          {/* ============================================================== */}
          <div style={{ padding: '28px', backgroundColor: '#fafbfc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            <div>
              {/* Título y Categoría */}
              <div style={{ marginBottom: '14px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  backgroundColor: '#fee2e2',
                  color: '#d91a2a',
                  marginBottom: '6px'
                }}>
                  {apto.categoria || 'APARTAMENTO'}
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.2 }}>
                  {apto.nombreModal || apto.titulo}
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  {apto.desc}
                </p>
              </div>

              {/* Tarifa por Noche Base */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tarifa por noche
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                    ${precioNumerico.toLocaleString('es-CO')}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>COP / noche</span>
                </div>
                <span style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                  Impuestos incluidos • Tarifas transparentes sin cargos sorpresa
                </span>
              </div>

              {/* Selectores Interactivos de Llegada / Salida / Huéspedes */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setMensajeInteraccion('Haz clic en el calendario abajo para seleccionar tu fecha de llegada.');
                      setTimeout(() => setMensajeInteraccion(null), 3000);
                    }}
                  >
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Llegada</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                      <span>{formatearFechaDisplay(fechaEntrada)}</span>
                      <CalendarIcon size={13} color="#d91a2a" />
                    </div>
                  </div>

                  <div 
                    style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '12px', cursor: 'pointer' }}
                    onClick={() => {
                      setMensajeInteraccion('Haz clic en el calendario abajo para seleccionar tu fecha de salida.');
                      setTimeout(() => setMensajeInteraccion(null), 3000);
                    }}
                  >
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Salida</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: fechaSalida ? '#0f172a' : '#d91a2a' }}>
                      <span>{fechaSalida ? formatearFechaDisplay(fechaSalida) : 'Elige en calendario'}</span>
                      <CalendarIcon size={13} color={fechaSalida ? '#94a3b8' : '#d91a2a'} />
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Huéspedes</label>
                  <HuespedesPicker 
                    maxCapacidad={capacidadNum}
                    onChange={(obj) => setNumHuespedes(obj.summary)}
                  />
                </div>
              </div>

              {/* Notificación interactiva / Guía al hacer clic */}
              {mensajeInteraccion && (
                <div style={{
                  marginBottom: '10px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#be123c',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{mensajeInteraccion}</span>
                </div>
              )}

              {/* CALENDARIO DE DISPONIBILIDAD ESTILIZADO DE TRES ESTADOS */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
                
                {/* Header interactivo del Calendario */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <button 
                    type="button" 
                    onClick={handleMesAnterior}
                    title="Mes Anterior"
                    style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.72rem', padding: '4px 6px', borderRadius: '6px' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                  >
                    <ChevronLeft size={14} />
                    <span>Mes Ant.</span>
                  </button>

                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                    🗓️ Disponibilidad: {nombresMeses[calMonth]} {calYear}
                  </span>

                  <button 
                    type="button" 
                    onClick={handleMesSiguiente}
                    title="Mes Siguiente"
                    style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.72rem', padding: '4px 6px', borderRadius: '6px' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                  >
                    <span>Mes Sig.</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Leyenda Explicativa de Tres Estados */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '12px', margin: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', display: 'inline-block' }} />
                    <span>Disponible</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 600, color: '#ef4444' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#94a3b8', textDecoration: 'line-through 2px #ef4444', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✕
                    </span>
                    <span>Ocupado (No disponible)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#d91a2a' }}>
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
                  {celdasCalendario.map((celda, idx) => {
                    if (celda.tipo === 'vacio') {
                      return <div key={celda.id} style={{ height: '36px' }} />;
                    }

                    // 1. DÍA OCUPADO (Estado 2)
                    if (celda.estado === 2) {
                      return (
                        <div
                          key={celda.fechaStr}
                          title={`Fecha ${celda.fechaStr} ocupada (No disponible)`}
                          onClick={() => handleDiaClick(celda)}
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
                          {celda.dia}
                        </div>
                      );
                    }

                    // 2. DÍA EN SELECCIÓN (Estado 3: Entrada, Salida o en Rango)
                    if (celda.estado === 3) {
                      const esExtremo = celda.esEntrada || celda.esSalida;
                      return (
                        <button
                          key={celda.fechaStr}
                          type="button"
                          onClick={() => handleDiaClick(celda)}
                          title={`${celda.esEntrada ? 'Llegada: ' : celda.esSalida ? 'Salida: ' : ''}${celda.fechaStr}`}
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
                          {celda.dia}
                        </button>
                      );
                    }

                    // 3. DÍA DISPONIBLE (Estado 1)
                    return (
                      <button
                        key={celda.fechaStr}
                        type="button"
                        onClick={() => handleDiaClick(celda)}
                        title={`Seleccionar ${celda.fechaStr}`}
                        style={{
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          color: '#1e293b',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#fff5f5';
                          e.currentTarget.style.borderColor = '#d91a2a';
                          e.currentTarget.style.color = '#d91a2a';
                          e.currentTarget.style.transform = 'scale(1.06)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.color = '#1e293b';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {celda.dia}
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* TARJETA DE DESGLOSE DE PRECIOS Y DESCUENTOS EN TIEMPO REAL */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Resumen de tu Estadía
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: porcentajeDescuento > 0 ? '#d1fae5' : '#fee2e2',
                    color: porcentajeDescuento > 0 ? '#065f46' : '#d91a2a'
                  }}>
                    {nochesEstancia} {nochesEstancia === 1 ? 'noche' : 'noches'}
                  </span>
                </div>

                {/* Fechas seleccionadas */}
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarIcon size={13} color="#94a3b8" />
                  <span>
                    <strong>{formatearFechaDisplay(fechaEntrada)}</strong> al <strong>{fechaSalida ? formatearFechaDisplay(fechaSalida) : 'Elige salida'}</strong>
                  </span>
                </div>

                {/* Líneas de cálculo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                    <span>{nochesEstancia} {nochesEstancia === 1 ? 'noche' : 'noches'} × ${precioNumerico.toLocaleString('es-CO')} COP</span>
                    <span style={{ fontWeight: 600 }}>${subtotalSinDescuento.toLocaleString('es-CO')} COP</span>
                  </div>

                  {/* Descuento si aplica */}
                  {porcentajeDescuento > 0 ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#ecfdf5',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      color: '#065f46',
                      fontWeight: 700
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>🎉 Descuento Larga Estancia ({porcentajeDescuento}%)</span>
                      </span>
                      <span>-${montoDescuento.toLocaleString('es-CO')} COP</span>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      color: '#64748b',
                      border: '1px dashed #cbd5e1'
                    }}>
                      💡 <strong>Ahorro disponible:</strong> Reserva 7 o más noches para obtener un <strong>10% de descuento automático</strong>.
                    </div>
                  )}

                  {/* Total final destacado */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '10px',
                    marginTop: '4px'
                  }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                        Total a pagar
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        Impuestos incluidos • Sin cargos sorpresa
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                        ${totalCalculado.toLocaleString('es-CO')}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '4px' }}>COP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Conversión */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={handleActionReservar}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '16px',
                  backgroundColor: '#d91a2a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(217, 26, 42, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b91522'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#d91a2a'; }}
              >
                <span>Reservar este apartamento</span>
                <ArrowRight size={16} />
              </button>

              <a
                href={`https://wa.me/573153512085?text=Hola,%20deseo%20consultar%20disponibilidad%20del%20${encodeURIComponent(apto.nombreModal || apto.titulo)}%20en%20Facile%20Chicó%20(Llegada:%20${fechaEntrada}%20-%20Salida:%20${fechaSalida || fechaEntrada},%20${numHuespedes})`}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.backgroundColor = '#ecfdf5';
                  e.currentTarget.style.color = '#065f46';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#334155';
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>Consultar por WhatsApp</span>
                <MessageSquare size={14} color="#10b981" />
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
