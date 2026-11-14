import React, { useState } from 'react';
import { 
  MapPin, Calendar, Users, Search, Building2, Briefcase, 
  ShieldCheck, Percent, Star, ArrowRight, CheckCircle2,
  Wifi, Bath, User as UserIcon, MessageSquare, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALOJAMIENTOS_FACILE } from '../data/alojamientosData';

export default function VistaInicio() {
  const { setActiveTab, setShowLoginModal, setSelectedAptoFigma, handleReservarTipo } = useApp();
  const [categoriaActiva, setCategoriaActiva] = useState('todos');

  const categorias = [
    { id: 'todos', label: 'Ver Todos', count: 38 },
    { id: 'duplex', label: 'Dúplex', count: 14 },
    { id: 'dobles', label: 'Dobles', count: 11 },
    { id: 'familiares', label: 'Familiares', count: 2 },
    { id: 'habitaciones', label: 'Habitaciones', count: 11 }
  ];

  const apartamentosFiltrados = categoriaActiva === 'todos'
    ? ALOJAMIENTOS_FACILE
    : ALOJAMIENTOS_FACILE.filter(a => a.cat === categoriaActiva);

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
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-card)',
                  padding: '30px 24px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  {card.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-main)', margin: '0 0 10px 0' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.55, margin: '0 0 24px 0', flexGrow: 1 }}>
                  {card.desc}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab(card.tab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: 'var(--color-text-main)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{card.link}</span>
                  <ArrowRight size={14} color="var(--color-primary)" />
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
                    boxShadow: isActive ? '0 4px 12px rgba(217, 26, 42, 0.25)' : 'var(--shadow-sm)',
                    transition: 'all 0.2s ease'
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

          {/* Grid de Tarjetas de Apartamentos con FOTOS REALES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {apartamentosFiltrados.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Imagen con Badges y clic para ver detalle */}
                <div 
                  style={{ position: 'relative', height: '220px', cursor: 'pointer' }}
                  onClick={() => setSelectedAptoFigma(item)}
                  title="Haz clic para ver las fotos y disponibilidad de este apartamento"
                >
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                    onClick={() => setSelectedAptoFigma(item)}
                    style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-text-main)', margin: '0 0 4px 0', cursor: 'pointer' }}
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
                      {/* BOTÓN DETALLE (ABRE MODAL Y CONSULTA DISPONIBILIDAD SIN REGISTRO) */}
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
                        title="Ver fotos, especificaciones y consultar disponibilidad sin necesidad de registro"
                      >
                        <Eye size={14} color="var(--color-primary)" />
                        <span>Detalle</span>
                      </button>

                      {/* BOTÓN RESERVAR (INICIA EL REGISTRO / RESERVA) */}
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
        </div>
      </section>

      {/* 4. MÓDULO CONVENIOS CORPORATIVOS B2B */}
      <section style={{ padding: '0 24px 80px' }}>
        <div className="facile-container">
          <div style={{
            backgroundColor: '#090e1a',
            borderRadius: '24px',
            padding: '48px 56px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-card)',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div style={{ maxWidth: '640px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ¿Estadía Empresarial o Mensual?
              </span>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', margin: '8px 0 12px' }}>
                Convenios Corporativos y Larga Estadía
              </h3>
              <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Ofrecemos facturación electrónica directa, tarifas corporativas preferenciales y atención ejecutiva personalizada en Bogotá Chicó.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setActiveTab('reservar')}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: '700',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
              >
                Solicitar Cotización
              </button>
              <a
                href="tel:+573153512085"
                style={{
                  backgroundColor: '#1e293b',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  padding: '14px 24px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Llamar a Asesor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER CORPORATIVO CON LOGO OFICIAL REAL */}
      <footer style={{ backgroundColor: '#090e1a', color: '#94a3b8', paddingTop: '64px', borderTop: '1px solid #1e293b' }}>
        <div className="facile-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', paddingBottom: '48px', borderBottom: '1px solid #1e293b' }}>
            {/* Columna Marca con Logo Oficial */}
            <div>
              <div 
                style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', cursor: 'pointer' }}
                onClick={() => setActiveTab('inicio')}
              >
                <img 
                  src="/images/logo-facile-oficial.png" 
                  alt="Apartamentos Facile" 
                  style={{ height: '46px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#64748b' }}>
                Hospedaje amoblado de alto perfil y centro de negocios en el exclusivo sector de El Chicó, Bogotá.
              </p>
            </div>

            {/* Ubicación Exclusiva */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' }}>Ubicación</h4>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.8, margin: 0 }}>
                <strong style={{ color: '#ffffff' }}>Bogotá:</strong> Calle 97 #21-62, El Chicó<br />
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Recepción & Seguridad 24 Horas</span>
              </p>
            </div>

            {/* Categorías */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' }}>Categorías</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <span onClick={() => { setCategoriaActiva('duplex'); }} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Suites Dúplex</span>
                <span onClick={() => { setCategoriaActiva('dobles'); }} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Suites Dobles Ejecutivas</span>
                <span onClick={() => { setCategoriaActiva('familiares'); }} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Apartamentos Familiares</span>
                <span onClick={() => { setCategoriaActiva('habitaciones'); }} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Habitaciones Corporativas</span>
              </div>
            </div>

            {/* Contacto Directo */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' }}>Contacto Directo</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <span>📞 +57 315 3512085</span>
                <span>✉️ reservas@facileapartamentos.com</span>
                <div style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: '#131d31', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>RNT Vigente Certificado</span>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
                    title="Acceso exclusivo al sistema interno PMS"
                  >
                    🔒 Acceso PMS
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#475569', flexWrap: 'wrap', gap: '12px' }}>
            <span>© 2026 Apartamentos Facile. Todos los derechos reservados.</span>
            <span>Diseñado para la máxima comodidad en estadías corporativas y turísticas en El Chicó, Bogotá.</span>
          </div>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE WHATSAPP FIJO */}
      <a
        href="https://wa.me/573153512085"
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#10b981',
          color: '#ffffff',
          borderRadius: 'var(--radius-pill)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '0.875rem',
          zIndex: 100,
          transition: 'transform 0.2s ease'
        }}
      >
        <span>¿En qué podemos servirle?</span>
        <MessageSquare size={18} />
      </a>

    </div>
  );
}
