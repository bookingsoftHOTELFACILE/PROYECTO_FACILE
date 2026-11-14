import React, { useState } from 'react';
import { 
  X, Wifi, Tv, KeyRound, UtensilsCrossed, Shirt, 
  Home, Clock, ShieldCheck, Users, BedDouble, Bath, 
  Building, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Maximize2, MessageSquare, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ModalDetalle({ apartamento, onClose, onReservar }) {
  const { 
    selectedAptoFigma, setSelectedAptoFigma, setAptoLightboxPhoto, 
    handleReservarTipo 
  } = useApp();

  // Permite recibir el objeto como prop o tomarlo directamente del contexto global
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
    llegada: '14 / 11 / 2026',
    salida: '15 / 11 / 2026',
    mesActual: 'Noviembre 2026',
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

  const handleActionReservar = () => {
    if (onReservar) {
      onReservar(apto);
    } else if (handleReservarTipo) {
      if (setSelectedAptoFigma) setSelectedAptoFigma(null);
      handleReservarTipo(apto.tipo || apto.cat || 'Dúplex');
    }
  };

  // Mapeo estricto a las fotos reales del apartamento (locales)
  const fotosRaw = apto.fotos || apto.imagenes || (apto.imagen ? [{ url: apto.imagen }] : []);
  const fotosReales = fotosRaw.map(f => typeof f === 'string' ? f : f.url);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [numHuespedes, setNumHuespedes] = useState(apto.personas || '3 huéspedes');

  // Matriz de días del mes (1 = Disponible, 2 = Ocupado, 3 = Tu Selección)
  const diasMes = [
    { dia: null, estado: 0 }, { dia: null, estado: 0 }, { dia: null, estado: 0 }, { dia: null, estado: 0 }, { dia: null, estado: 0 }, { dia: null, estado: 0 }, { dia: 1, estado: 1 },
    { dia: 2, estado: 1 }, { dia: 3, estado: 1 }, { dia: 4, estado: 1 }, { dia: 5, estado: 1 }, { dia: 6, estado: 1 }, { dia: 7, estado: 2 }, { dia: 8, estado: 2 },
    { dia: 9, estado: 1 }, { dia: 10, estado: 1 }, { dia: 11, estado: 1 }, { dia: 12, estado: 1 }, { dia: 13, estado: 1 }, { dia: 14, estado: 3 }, { dia: 15, estado: 3 },
    { dia: 16, estado: 1 }, { dia: 17, estado: 1 }, { dia: 18, estado: 1 }, { dia: 19, estado: 1 }, { dia: 20, estado: 1 }, { dia: 21, estado: 2 }, { dia: 22, estado: 2 },
    { dia: 23, estado: 1 }, { dia: 24, estado: 1 }, { dia: 25, estado: 1 }, { dia: 26, estado: 1 }, { dia: 27, estado: 1 }, { dia: 28, estado: 1 }, { dia: 29, estado: 1 },
    { dia: 30, estado: 1 }
  ];

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
          width: '100%',
          maxWidth: '1060px',
          maxHeight: '92vh',
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
          
          {/* ============================================================== */}
          {/* COLUMNA IZQUIERDA: GALERÍA + ESPECIFICACIONES + AMENIDADES     */}
          {/* ============================================================== */}
          <div style={{ padding: '28px', borderRight: '1px solid #f1f5f9' }}>
            
            {/* 1. Galería de Fotos Reales */}
            <div style={{ marginBottom: '20px' }}>
              <div 
                style={{
                  position: 'relative',
                  height: '280px',
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
          {/* COLUMNA DERECHA: WIDGET DE RESERVA + CALENDARIO DE DISPONIBILIDAD*/}
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

              {/* Tarifa por Noche */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tarifa por noche
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                    {apto.precio}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>{apto.precioSub || 'COP/noche'}</span>
                </div>
                <span style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                  Impuestos aplican según perfil del huésped
                </span>
              </div>

              {/* Selectores de Llegada / Salida / Huéspedes */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Llegada</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                      <span>{apto.llegada || '14 / 11 / 2026'}</span>
                      <CalendarIcon size={13} color="#94a3b8" />
                    </div>
                  </div>

                  <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Salida</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                      <span>{apto.salida || '15 / 11 / 2026'}</span>
                      <CalendarIcon size={13} color="#94a3b8" />
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Huéspedes</label>
                  <select 
                    value={numHuespedes}
                    onChange={(e) => setNumHuespedes(e.target.value)}
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
                  >
                    <option>1 huésped</option>
                    <option>2 huéspedes</option>
                    <option>3 huéspedes</option>
                    <option>Hasta 4 huéspedes</option>
                    <option>Hasta 6 huéspedes</option>
                  </select>
                </div>
              </div>

              {/* CALENDARIO DE DISPONIBILIDAD ESTILIZADO DE TRES ESTADOS */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
                
                {/* Header del Calendario */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.72rem' }}>
                    <ChevronLeft size={13} />
                    <span>Mes Ant.</span>
                  </button>

                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                    🗓️ Disponibilidad: {apto.mesActual || 'Noviembre 2026'}
                  </span>

                  <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.72rem' }}>
                    <span>Mes Sig.</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                {/* Leyenda Explicativa de Tres Estados */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '6px 8px', backgroundColor: '#f8fafc', borderRadius: '10px', margin: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', fontWeight: 500, color: '#475569' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', display: 'inline-block' }} />
                    <span>Disponible</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', fontWeight: 500, color: '#94a3b8' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f1f5f9', color: '#94a3b8', textDecoration: 'line-through', fontSize: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      x
                    </span>
                    <span>Ocupado</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', fontWeight: 700, color: '#d91a2a' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#d91a2a', color: '#ffffff', fontSize: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✓
                    </span>
                    <span>Tu Selección</span>
                  </div>
                </div>

                {/* Encabezado Días Semanales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                </div>

                {/* Grilla de Días */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {diasMes.map((item, idx) => {
                    if (!item.dia) return <div key={idx} style={{ height: '30px' }} />;

                    if (item.estado === 1) {
                      return (
                        <button
                          key={idx}
                          type="button"
                          style={{
                            height: '30px',
                            borderRadius: '6px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            color: '#1e293b',
                            fontSize: '0.78rem',
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
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.color = '#1e293b';
                          }}
                        >
                          {item.dia}
                        </button>
                      );
                    }

                    if (item.estado === 2) {
                      return (
                        <div
                          key={idx}
                          title="Fecha no disponible"
                          style={{
                            height: '30px',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            color: '#94a3b8',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            textDecoration: 'line-through',
                            cursor: 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            userSelect: 'none'
                          }}
                        >
                          {item.dia}
                        </div>
                      );
                    }

                    if (item.estado === 3) {
                      return (
                        <button
                          key={idx}
                          type="button"
                          style={{
                            height: '30px',
                            borderRadius: '6px',
                            backgroundColor: '#d91a2a',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            border: 'none',
                            boxShadow: '0 2px 6px rgba(217, 26, 42, 0.35)',
                            transform: 'scale(1.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          {item.dia}
                        </button>
                      );
                    }

                    return null;
                  })}
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
                href={`https://wa.me/573153512085?text=Hola,%20deseo%20consultar%20disponibilidad%20del%20${encodeURIComponent(apto.nombreModal || apto.titulo)}%20en%20Facile%20Chicó`}
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
