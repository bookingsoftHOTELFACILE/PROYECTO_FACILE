import React, { useState } from 'react';
import { 
  MapPin, Calendar, Users, Search, Building2, Briefcase, 
  ShieldCheck, Percent, Star, ArrowRight, CheckCircle2,
  Wifi, Bath, User as UserIcon, MessageSquare, Eye,
  Maximize2, BedDouble, UtensilsCrossed, Shirt, Sparkles, Tv, KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALOJAMIENTOS_FACILE } from '../data/alojamientosData';

export default function VistaInicio() {
  const { 
    habitaciones = [], 
    reservas = [], 
    setActiveTab, 
    setShowLoginModal, 
    setSelectedAptoFigma, 
    handleReservarTipo,
    setReservaData,
    navegarATab
  } = useApp();

  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [aptoActivePhoto, setAptoActivePhoto] = useState({});

  const categorias = [
    { id: 'todos', label: 'Ver Todos', count: 38 },
    { id: 'Dúplex', label: 'Dúplex', count: 14 },
    { id: 'Dobles', label: 'Dobles', count: 11 },
    { id: 'Familiares', label: 'Familiares', count: 2 },
    { id: 'Habitaciones', label: 'Habitaciones', count: 11 }
  ];

  const amenidadesPorTipo = {
    'Dúplex': [
      { icon: Users, label: 'Hasta 3 personas' },
      { icon: Wifi, label: 'Wi-Fi 300 Mbps' },
      { icon: Building2, label: '1 Hab. + 1.5 Baños' },
      { icon: Shirt, label: 'Lavadora-secadora' },
      { icon: Sparkles, label: 'Balcón con vista' },
      { icon: Tv, label: '2 Smart TV 4K' }
    ],
    'Dobles': [
      { icon: Users, label: 'Hasta 4 personas' },
      { icon: Wifi, label: 'Wi-Fi 300 Mbps' },
      { icon: Building2, label: '2 Hab. + 2 Baños' },
      { icon: BedDouble, label: 'Cama King + Auxiliar' },
      { icon: UtensilsCrossed, label: 'Cocina & Comedor' },
      { icon: Tv, label: '3 Smart TV HD' }
    ],
    'Familiares': [
      { icon: Users, label: 'Hasta 6 personas' },
      { icon: Wifi, label: 'Wi-Fi 300 Mbps' },
      { icon: Building2, label: '3 Hab. + 2 Baños' },
      { icon: BedDouble, label: '1 King + Camas Nido' },
      { icon: UtensilsCrossed, label: 'Comedor 6 Puestos' },
      { icon: Shirt, label: 'Zona Lavandería' }
    ],
    'Habitaciones': [
      { icon: Users, label: 'Hasta 2 personas' },
      { icon: Wifi, label: 'Wi-Fi 300 Mbps' },
      { icon: Bath, label: 'Baño en Suite' },
      { icon: BedDouble, label: 'Cama Queen Confort' },
      { icon: Briefcase, label: 'Escritorio Ejecutivo' },
      { icon: Tv, label: 'Smart TV & Frigobar' }
    ]
  };

  const unidadesDefault = {
    'Dúplex': Array.from({ length: 14 }, (_, i) => ({
      id: `D${101 + i}`,
      numero: `D${101 + i}`,
      tipo: 'Dúplex',
      capacidad: 3,
      precio: 250000,
      piso: i < 7 ? 'Piso 1' : 'Piso 2'
    })),
    'Dobles': Array.from({ length: 11 }, (_, i) => ({
      id: `DB${201 + i}`,
      numero: `DB${201 + i}`,
      tipo: 'Dobles',
      capacidad: 4,
      precio: 350000,
      piso: i < 6 ? 'Piso 2' : 'Piso 3'
    })),
    'Familiares': [
      { id: 'F301', numero: 'F301', tipo: 'Familiares', capacidad: 6, precio: 450000, piso: 'Piso 3' },
      { id: 'F302', numero: 'F302', tipo: 'Familiares', capacidad: 6, precio: 450000, piso: 'Piso 3' }
    ],
    'Habitaciones': Array.from({ length: 11 }, (_, i) => ({
      id: `H${401 + i}`,
      numero: `H${401 + i}`,
      tipo: 'Habitaciones',
      capacidad: 2,
      precio: 180000,
      piso: 'Piso 4'
    }))
  };

  const alojamientosFiltrados = categoriaActiva === 'todos'
    ? ALOJAMIENTOS_FACILE
    : ALOJAMIENTOS_FACILE.filter(a => a.tipo === categoriaActiva);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      
      {/* 1. HERO SECTION PANORÁMICO (Fachada Real Facile Chicó) */}
      <section style={{
        position: 'relative',
        height: '560px',
        backgroundImage: `linear-gradient(to right, rgba(9, 14, 26, 0.92) 0%, rgba(9, 14, 26, 0.65) 60%, rgba(9, 14, 26, 0.4) 100%), url('/images/zonas/IMG_9217-HDR.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px'
      }}>
        <div className="facile-container" style={{ width: '100%' }}>
          <div style={{ maxWidth: '680px' }}>
            {/* Badge Ubicación Exclusiva Bogotá Chicó */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '20px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              El Chicó, Bogotá Norte • Calle 97 #21-62
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.12, margin: '0 0 16px 0', letterSpacing: '-1px' }}>
              Apartamentos amoblados para cortas y largas <span style={{ color: '#fca5a5' }}>estadías</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 28px 0', maxWidth: '680px' }}>
              El confort, amplitud e independencia de un hogar premium combinados con servicios de hotel 5 estrellas y un exclusivo centro de negocios corporativo en el norte de Bogotá.
            </p>

            <div>
              <button
                onClick={() => setActiveTab('apartamentos')}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '14px 28px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(217, 26, 42, 0.35)',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
              >
                <span>Explorar Nuestros Apartamentos</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LOS 4 BLOQUES DE BENEFICIOS (EXPERIENCIA GARANTIZADA) */}
      <section style={{ padding: '80px 0 60px' }}>
        <div className="facile-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Experiencia Garantizada
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--color-text-main)', margin: '8px 0 12px' }}>
              Apartamentos Facile Bogotá
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Confort, elegancia y centro de negocios en la mejor ubicación estratégica de la capital colombiana.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              {
                icon: <Building2 size={24} color="var(--color-primary)" />,
                title: 'Apartamentos Amoblados',
                desc: 'Unidades dúplex y suites ejecutivas totalmente equipadas para estadías cortas y largas con cocina integral y menaje completo.',
                link: 'Ver especificaciones',
                tab: 'apartamentos'
              },
              {
                icon: <Briefcase size={24} color="#2563eb" />,
                title: 'Centro de Negocios',
                desc: 'Salas de reuniones equipadas con conectividad por fibra óptica simétrica, ideal para profesionales, teletrabajo y empresas.',
                link: 'Espacios de coworking',
                tab: 'centro_negocios_pub'
              },
              {
                icon: <ShieldCheck size={24} color="#059669" />,
                title: 'Recepción & Seguridad 24/7',
                desc: 'Personal operativo en portería permanente, cerraduras electrónicas y circuito cerrado de cámaras de alta vigilancia.',
                link: 'Tranquilidad total',
                tab: 'servicios'
              },
              {
                icon: <Percent size={24} color="#d97706" />,
                title: '15% Descuento Larga Estadía',
                desc: 'Descuento automático e instantáneo para todas las reservas superiores a 15 noches continuas. Sin intermediarios.',
                link: 'Tarifas corporativas',
                tab: 'reservar'
              }
            ].map((card, i) => (
              <div 
                key={i}
                className="facile-feature-card"
                onClick={() => setActiveTab(card.tab)}
                title={`Ir a ${card.title}`}
              >
                <div className="feature-icon-badge">
                  {card.icon}
                </div>
                <h3 className="feature-title">
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.55, margin: '0 0 24px 0', flexGrow: 1 }}>
                  {card.desc}
                </p>
                <button
                  type="button"
                  className="feature-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(card.tab);
                  }}
                >
                  <span>{card.link}</span>
                  <ArrowRight size={14} className="feature-arrow" color="var(--color-primary)" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATÁLOGO: NUESTROS ALOJAMIENTOS */}
      <section style={{ padding: '40px 0 80px', backgroundColor: '#fafbfc' }}>
        <div className="facile-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Portafolio Exclusivo
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--color-text-main)', margin: '8px 0 12px' }}>
              Nuestros <span style={{ textDecoration: 'underline', textDecorationColor: 'var(--color-primary)', textUnderlineOffset: '6px' }}>Alojamientos</span>
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: 0 }}>
              38 unidades disponibles en 4 categorías en El Chicó, Bogotá — Consulta fotos, disponibilidad y reserva con tarifa directa.
            </p>
          </div>

          {/* Filtros de Categoría */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {categorias.map((cat) => {
              const isActive = categoriaActiva === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className="facile-filter-pill"
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : '#ffffff',
                    color: isActive ? '#ffffff' : 'var(--color-text-main)',
                    border: isActive ? 'none' : '1px solid var(--color-border)',
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isActive ? '0 4px 12px rgba(217, 26, 42, 0.25)' : 'var(--shadow-sm)'
                  }}
                >
                  <span>{cat.label}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b',
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-pill)'
                  }}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* VISTA 1: TODAS LAS CATEGORÍAS (GRILLA DE 4 TARJETAS BALANCEADAS) */}
          {categoriaActiva === 'todos' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
              {alojamientosFiltrados.map((item) => (
                <div
                  key={item.id}
                  className="facile-alojamiento-card"
                >
                  {/* Imagen con Badges, Zoom Suave y clic para ver detalle */}
                  <div 
                    className="card-img-wrap"
                    onClick={() => setSelectedAptoFigma(item)}
                    title="Haz clic para ver las fotos y disponibilidad de este apartamento"
                  >
                    <img
                      src={item.imagen}
                      alt={item.titulo}
                    />
                    {/* Tag Categoría */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(9, 14, 26, 0.8)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)'
                    }}>
                      {item.tipo}
                    </div>
                    {/* Calificación */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#ffffff',
                      color: 'var(--color-text-main)',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <Star size={13} fill="var(--color-star)" color="var(--color-star)" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  {/* Contenido de la Tarjeta */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 
                      className="card-title"
                      onClick={() => setSelectedAptoFigma(item)}
                    >
                      {item.titulo}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>
                      {item.ubicacion}
                    </div>

                    {/* Chips de características con iconos */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', fontSize: '0.75rem', color: '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserIcon size={14} color="#94a3b8" /> {item.personas || item.capacidad}
                      </span>
                      {item.banos && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Bath size={14} color="#94a3b8" /> {item.banos}
                        </span>
                      )}
                      {item.wifi && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Wifi size={14} color="#94a3b8" /> {item.wifi}
                        </span>
                      )}
                    </div>

                    {/* Fila Inferior: Precio + BOTONES (Detalle y Reservar) */}
                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '16px',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
                          Por Noche
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-main)' }}>
                          {item.precio} <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' }}>COP</span>
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* BOTÓN DETALLE */}
                        <button
                          type="button"
                          onClick={() => setSelectedAptoFigma(item)}
                          style={{
                            backgroundColor: '#f8fafc',
                            color: '#0f172a',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-pill)',
                            padding: '8px 14px',
                            fontWeight: '700',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                          }}
                          title="Ver fotos, especificaciones y consultar disponibilidad"
                        >
                          <Eye size={14} color="var(--color-primary)" />
                          <span>Detalle</span>
                        </button>

                        {/* BOTÓN RESERVAR */}
                        <button
                          type="button"
                          onClick={() => handleReservarTipo(item.tipo)}
                          style={{
                            backgroundColor: 'var(--color-primary)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 'var(--radius-pill)',
                            padding: '8px 16px',
                            fontWeight: '700',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 2px 8px rgba(217, 26, 42, 0.25)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                          }}
                          title="Iniciar proceso de reserva"
                        >
                          Reservar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* VISTA 2: CATEGORÍA FILTRADA (SHOWCASE 2 COLUMNAS + UNIDADES ASIGNABLES - NUNCA MÁS TARJETA ESTIRADA) */
            alojamientosFiltrados.map((apto) => {
              const activePhotoIndex = aptoActivePhoto[apto.tipo] || 0;
              const currentPhoto = (apto.fotos && apto.fotos[activePhotoIndex]) || { url: apto.imagen, titulo: apto.titulo };

              const unidadesFinales = habitaciones.length > 0
                ? habitaciones.filter(h => h.tipo === apto.tipo && !['101A', '102A'].includes(String(h.numero))).map(h => ({
                    id: h.id_habitacion || h.numero,
                    numero: String(h.numero),
                    tipo: h.tipo,
                    capacidad: h.capacidad,
                    precio: Number(h.precio_noche || 0),
                    piso: String(h.numero || '').startsWith('D') ? 'Pisos 1-2' : (String(h.numero || '').startsWith('DB') ? 'Pisos 2-3' : (String(h.numero || '').startsWith('F') ? 'Piso 3' : 'Piso 4'))
                  }))
                : (unidadesDefault[apto.tipo] || []);

              return (
                <div key={apto.tipo}>
                  {/* TARJETA DESTACADA HORIZONTAL 2 COLUMNAS */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                    background: '#ffffff',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(15,23,42,0.06)',
                    marginBottom: '3rem'
                  }}>
                    {/* COLUMNA IZQUIERDA: FOTO PRINCIPAL Y MINIATURAS */}
                    <div style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column', borderRight: '1px solid #f1f5f9' }}>
                      <div
                        style={{ position: 'relative', width: '100%', height: '340px', overflow: 'hidden', cursor: 'pointer' }}
                        onClick={() => setSelectedAptoFigma(apto)}
                        title="Haz clic para ver el detalle interactivo"
                      >
                        <img
                          src={currentPhoto.url}
                          alt={currentPhoto.titulo}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        <div style={{ position: 'absolute', bottom: '14px', right: '14px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', color: '#ffffff', padding: '0.45rem 0.95rem', borderRadius: 'var(--radius-pill)', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                          <Maximize2 size={14}/> Ver Detalle / Fotos
                        </div>
                        <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(217, 26, 42, 0.9)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Categoría Destacada
                        </div>
                      </div>

                      {/* MINI CARRUSEL DE MINIATURAS FOTOGRÁFICAS */}
                      {apto.fotos && apto.fotos.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.6rem', padding: '0.85rem 1.25rem', background: '#ffffff', borderTop: '1px solid #f1f5f9', overflowX: 'auto' }}>
                          {apto.fotos.map((f, i) => (
                            <div
                              key={i}
                              onClick={() => setAptoActivePhoto(prev => ({ ...prev, [apto.tipo]: i }))}
                              style={{
                                width: '68px',
                                height: '48px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: activePhotoIndex === i ? '2.5px solid #d91a2a' : '1.5px solid #e2e8f0',
                                opacity: activePhotoIndex === i ? 1 : 0.65,
                                transition: 'all 0.2s ease',
                                flexShrink: 0
                              }}
                            >
                              <img src={f.url} alt="Vista" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* COLUMNA DERECHA: INFORMACIÓN COMPLETA */}
                    <div style={{ padding: '2rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
                      <div>
                        {/* Badges superiores y Título */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d91a2a', textTransform: 'uppercase', letterSpacing: '0.8px', background: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', border: '1px solid #fecaca' }}>
                              Apartamento
                            </span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-pill)' }}>
                              {apto.formato || apto.tipo}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', background: '#ecfdf5', color: '#059669', borderRadius: 'var(--radius-pill)', fontWeight: 800, border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckCircle2 size={13} /> {apto.unidades} disponibles
                          </span>
                        </div>

                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                          {apto.nombreModal || `Apartamento ${apto.tipo}`}
                        </h3>

                        <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1.25rem' }}>
                          {apto.desc}
                        </p>

                        {/* GRILLA EJECUTIVA DE 6 AMENIDADES CLAVE */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                          gap: '0.55rem',
                          marginBottom: '1.2rem'
                        }}>
                          {(amenidadesPorTipo[apto.tipo] || amenidadesPorTipo['Dúplex']).map((am, idx) => {
                            const AmIcon = am.icon;
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.45rem',
                                  padding: '0.5rem 0.7rem',
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '12px',
                                  fontSize: '0.78rem',
                                  color: '#334155',
                                  fontWeight: 600
                                }}
                              >
                                <AmIcon size={14} color="#d91a2a" style={{ flexShrink: 0 }} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{am.label}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* BARRA DE GARANTÍAS DEL APARTAHOTEL */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          padding: '0.65rem 0.95rem',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          fontSize: '0.76rem',
                          color: '#475569',
                          fontWeight: 600,
                          marginBottom: '1.5rem',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <KeyRound size={13} color="#059669" /> Check-in 24/7 digital
                          </span>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <ShieldCheck size={13} color="#059669" /> Vigilancia 24h
                          </span>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Briefcase size={13} color="#059669" /> Acceso Centro Negocios
                          </span>
                        </div>
                      </div>

                      {/* FOOTER: TARIFA GARANTIZADA Y BOTONES */}
                      <div style={{
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        background: '#f8fafc',
                        margin: '0 -2.25rem -2rem -2.25rem',
                        padding: '1.25rem 2.25rem'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Tarifa Directa Garantizada
                          </div>
                          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                            {apto.precio}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{apto.precioSub} • Impuestos incluidos</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            type="button"
                            style={{
                              borderRadius: 'var(--radius-pill)',
                              padding: '0.75rem 1.4rem',
                              background: '#ffffff',
                              border: '1.5px solid #cbd5e1',
                              color: '#0f172a',
                              fontSize: '0.86rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '7px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#d91a2a';
                              e.currentTarget.style.color = '#d91a2a';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.color = '#0f172a';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            onClick={() => setSelectedAptoFigma(apto)}
                            title="Ver ficha técnica y disponibilidad de este alojamiento"
                          >
                            <Eye size={15} color="#d91a2a" />
                            <span>Detalle Completo</span>
                          </button>
                          <button
                            type="button"
                            className="btn-book-red"
                            style={{
                              borderRadius: 'var(--radius-pill)',
                              padding: '0.75rem 1.6rem',
                              background: '#d91a2a',
                              color: '#ffffff',
                              fontSize: '0.86rem',
                              fontWeight: 800,
                              border: 'none',
                              boxShadow: '0 4px 14px rgba(217, 26, 42, 0.3)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#b91522';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#d91a2a';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            onClick={() => handleReservarTipo(apto.tipo)}
                          >
                            Reservar {apto.tipo}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUBSECCIÓN: TODAS LAS UNIDADES DISPONIBLES DE ESTA CATEGORÍA */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                            Unidades asignables de {apto.tipo}
                          </h3>
                          <span style={{ background: '#fee2e2', color: '#d91a2a', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 800, border: '1px solid #fecaca' }}>
                            {unidadesFinales.length} disponibles
                          </span>
                        </div>
                        <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                          Selecciona tu apartamento para asignarlo directamente a tu reserva y asegurar piso de tu preferencia
                        </p>
                      </div>
                      <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.4rem 0.95rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} /> Todas las unidades disponibles para hoy
                      </span>
                    </div>

                    {/* GRID DE UNIDADES ESPECÍFICAS DE ESTA CATEGORÍA */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                      {unidadesFinales.map((unidad) => (
                        <div
                          key={unidad.id}
                          style={{
                            background: '#ffffff',
                            borderRadius: '20px',
                            border: '1.5px solid #e2e8f0',
                            padding: '1.35rem',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 28px rgba(15,23,42,0.08)';
                            e.currentTarget.style.borderColor = '#d91a2a';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                              <span style={{ background: '#fee2e2', color: '#d91a2a', border: '1px solid #fecaca', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 800 }}>
                                Apto {unidad.numero}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, background: '#f8fafc', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-pill)', border: '1px solid #e2e8f0' }}>
                                {unidad.piso}
                              </span>
                            </div>
                            <div style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.2px' }}>
                              {apto.formato || apto.tipo}
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                              <span>Disponible para asignar</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '1.1rem', background: '#f8fafc', padding: '0.55rem 0.85rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                              <Users size={14} color="#d91a2a"/>
                              <span style={{ fontWeight: 600 }}>Capacidad: <strong>{unidad.capacidad} personas</strong></span>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tarifa noche</div>
                              <div style={{ fontSize: '1.18rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.15 }}>
                                ${Number(unidad.precio).toLocaleString('es-CO')}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>COP / noche</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setReservaData(prev => ({ ...prev, id_habitacion: String(unidad.id || unidad.numero) }));
                                if (navegarATab) {
                                  navegarATab('reservar');
                                } else {
                                  setActiveTab('reservar');
                                }
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              style={{
                                background: '#d91a2a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '0.55rem 1.35rem',
                                borderRadius: 'var(--radius-pill)',
                                fontSize: '0.84rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(217, 26, 42, 0.25)'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#b91522';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = '#d91a2a';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              Reservar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

    </div>
  );
}
