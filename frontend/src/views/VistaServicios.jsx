import React, { useState } from 'react';
import { 
  Sparkles, 
  Wifi, 
  Car, 
  UtensilsCrossed, 
  ShieldCheck, 
  KeyRound, 
  Briefcase, 
  Coffee, 
  Clock, 
  Shirt, 
  Headphones, 
  Plane, 
  ChevronRight, 
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const VistaServicios = () => {
  const { setActiveTab } = useApp();
  const [categoriaActiva, setCategoriaActiva] = useState('todos');

  // Catálogo completo de servicios del Apartahotel & Centro de Negocios
  const servicios = [
    {
      id: 'amas_llaves',
      categoria: 'confort',
      icono: Sparkles,
      titulo: 'Servicio de Amas de Llaves',
      subtitulo: 'Aseo profesional y protocolos hoteleros',
      descripcion: 'Aseo riguroso, cambio periódico de lencería de alta densidad y toallas premium de algodón. Protocolos de desinfección garantizados.',
      badge: 'Incluido en estadía',
      destacado: true
    },
    {
      id: 'wifi_fibra',
      categoria: 'negocios',
      icono: Wifi,
      titulo: 'Wi-Fi 6 de Alta Velocidad',
      subtitulo: 'Fibra óptica simétrica 300+ Mbps',
      descripcion: 'Conexión de nivel empresarial en cada apartamento y zonas comunes, ideal para videollamadas, streaming 4K y teletrabajo sin cortes.',
      badge: 'Ultra Rápido',
      destacado: true
    },
    {
      id: 'parqueadero',
      categoria: 'seguridad',
      icono: Car,
      titulo: 'Parqueadero Privado Cubierto',
      subtitulo: 'Acceso vehicular vigilado 24/7',
      descripcion: 'Espacio de estacionamiento privado dentro del edificio con circuito cerrado de televisión y control de acceso permanente.',
      badge: 'Seguridad 24h',
      destacado: false
    },
    {
      id: 'cocina_equipada',
      categoria: 'confort',
      icono: UtensilsCrossed,
      titulo: 'Cocina Integral Dotada',
      subtitulo: 'Total independencia culinaria',
      descripcion: 'Nevera, microondas, estufa de inducción/gas, vajilla completa, licuadora, cafetera y utensilios para preparar tus comidas con total libertad.',
      badge: 'En cada apartamento',
      destacado: false
    },
    {
      id: 'checkin_digital',
      categoria: 'seguridad',
      icono: KeyRound,
      titulo: 'Smart Check-in Autónomo 24/7',
      subtitulo: 'Cerraduras digitales con código único',
      descripcion: 'Llega a cualquier hora sin esperas. Recibirás tu clave digital de acceso por correo y WhatsApp para ingresar de forma privada y segura.',
      badge: 'Acceso Autónomo',
      destacado: true
    },
    {
      id: 'centro_negocios',
      categoria: 'negocios',
      icono: Briefcase,
      titulo: 'Salas de Juntas & Coworking',
      subtitulo: 'Infraestructura corporativa premium',
      descripcion: 'Acceso preferencial a las salas de juntas ejecutivas con pantallas Smart TV para presentaciones, conectividad LAN y cafetería ejecutiva.',
      badge: 'Para Ejecutivos',
      destacado: false
    },
    {
      id: 'seguridad_cctv',
      categoria: 'seguridad',
      icono: ShieldCheck,
      titulo: 'Vigilancia & Monitoreo 24 Horas',
      subtitulo: 'Tranquilidad en El Chicó',
      descripcion: 'Personal de recepción y vigilancia física permanente las 24 horas del día, complementado con red de cámaras de seguridad CCTV.',
      badge: 'Monitoreo 24/7',
      destacado: false
    },
    {
      id: 'lavanderia',
      categoria: 'confort',
      icono: Shirt,
      titulo: 'Zona de Lavado y Secado',
      subtitulo: 'Comodidad para estadías medias y largas',
      descripcion: 'Torre de lavadora y secadora en apartamentos seleccionados o acceso a centro de lavado, con plancha y mesa de planchado disponible.',
      badge: 'Estadías Largas',
      destacado: false
    },
    {
      id: 'concierge',
      categoria: 'servicios_adicionales',
      icono: Headphones,
      titulo: 'Concierge y Asistencia al Huésped',
      subtitulo: 'Atención personalizada multicanal',
      descripcion: 'Orientación turística de Bogotá, recomendaciones gastronómicas en la Zona T y Parque de la 93, y soporte continuo vía WhatsApp.',
      badge: 'Atención Bilingüe',
      destacado: false
    },
    {
      id: 'transporte_aeropuerto',
      categoria: 'servicios_adicionales',
      icono: Plane,
      titulo: 'Coordinación de Traslados Aeropuerto',
      subtitulo: 'Aeropuerto El Dorado ↔ El Chicó',
      descripcion: 'Servicio de transporte privado con conductor de confianza para tu llegada o salida hacia el Aeropuerto Internacional El Dorado (bajo solicitud).',
      badge: 'Bajo Solicitud',
      destacado: false
    }
  ];

  const serviciosFiltrados = categoriaActiva === 'todos' 
    ? servicios 
    : servicios.filter(s => s.categoria === categoriaActiva);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '3.5rem' }}>
      {/* =========================================================================
          1. HEADER PRINCIPAL / HERO DE SERVICIOS
         ========================================================================= */}
      <section style={{ 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '3rem 1.5rem 2.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.45rem', 
            backgroundColor: '#fee2e2', 
            color: '#d91a2a', 
            padding: '0.35rem 0.9rem', 
            borderRadius: 'var(--radius-pill)', 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            <Sparkles size={14} /> Experiencia Hotelera con Privacidad de Hogar
          </div>

          <h1 style={{ 
            fontSize: '2.4rem', 
            fontWeight: 800, 
            color: '#0f172a', 
            margin: '0 0 0.8rem', 
            letterSpacing: '-0.025em',
            lineHeight: 1.2
          }}>
            Servicios e Instalaciones
          </h1>

          <p style={{ 
            fontSize: '1.05rem', 
            color: '#64748b', 
            margin: '0 auto 1.8rem', 
            maxWidth: '680px',
            lineHeight: 1.6
          }}>
            Diseñados para estancias corporativas y turísticas en El Chicó, Bogotá. Disfruta de conectividad de alta velocidad, total autonomía y confort de primer nivel.
          </p>

          {/* Píldoras de filtrado por categoría */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
            {[
              { id: 'todos', label: 'Todos los Servicios', count: servicios.length },
              { id: 'confort', label: 'Confort & Estadía', count: servicios.filter(s => s.categoria === 'confort').length },
              { id: 'negocios', label: 'Trabajo & Conectividad', count: servicios.filter(s => s.categoria === 'negocios').length },
              { id: 'seguridad', label: 'Seguridad & Acceso', count: servicios.filter(s => s.categoria === 'seguridad').length },
              { id: 'servicios_adicionales', label: 'Concierge & Traslados', count: servicios.filter(s => s.categoria === 'servicios_adicionales').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoriaActiva(tab.id)}
                style={{
                  padding: '0.55rem 1.15rem',
                  borderRadius: 'var(--radius-pill)',
                  border: categoriaActiva === tab.id ? '1px solid #d91a2a' : '1px solid #cbd5e1',
                  backgroundColor: categoriaActiva === tab.id ? '#d91a2a' : '#ffffff',
                  color: categoriaActiva === tab.id ? '#ffffff' : '#334155',
                  fontSize: '0.84rem',
                  fontWeight: categoriaActiva === tab.id ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: categoriaActiva === tab.id ? '0 4px 12px rgba(217, 26, 42, 0.22)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>{tab.label}</span>
                <span style={{ 
                  opacity: categoriaActiva === tab.id ? 0.9 : 0.6, 
                  fontSize: '0.74rem',
                  backgroundColor: categoriaActiva === tab.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. GRILLA PRINCIPAL DE TARJETAS DE SERVICIOS
         ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '2.5rem auto 0', padding: '0 1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.5rem'
        }}>
          {serviciosFiltrados.map((srv) => {
            const IconComponent = srv.icono;
            return (
              <div
                key={srv.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: srv.destacado ? '1.5px solid #fecdd3' : '1px solid #e2e8f0',
                  padding: '1.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: srv.destacado ? '0 8px 24px rgba(217, 26, 42, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  {/* Encabezado de la tarjeta: Icono y Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      backgroundColor: srv.destacado ? '#fee2e2' : '#f8fafc',
                      color: srv.destacado ? '#d91a2a' : '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #f1f5f9'
                    }}>
                      <IconComponent size={24} />
                    </div>

                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: srv.destacado ? '#b91522' : '#64748b',
                      backgroundColor: srv.destacado ? '#ffe4e6' : '#f1f5f9',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-pill)'
                    }}>
                      {srv.badge}
                    </span>
                  </div>

                  {/* Título y Subtítulo */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                    {srv.titulo}
                  </h3>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#d91a2a', marginBottom: '0.75rem' }}>
                    {srv.subtitulo}
                  </div>

                  {/* Descripción */}
                  <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                    {srv.descripcion}
                  </p>
                </div>

                <div style={{ marginTop: '1.2rem', paddingTop: '0.9rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                  <CheckCircle2 size={14} /> Disponible para huéspedes de Apartamentos Facile
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            3. BANNER DE CONCIERGE & ASISTENCIA DIRECTA (CTA)
           ========================================================================= */}
        <div style={{
          marginTop: '3rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 16px 36px rgba(15, 23, 42, 0.25)'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#d91a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: '#ffffff'
          }}>
            <CalendarCheck size={26} />
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.6rem', color: '#ffffff' }}>
            ¿Tienes un requerimiento especial para tu estadía?
          </h2>

          <p style={{ fontSize: '0.92rem', color: '#94a3b8', maxWidth: '640px', margin: '0 0 1.8rem', lineHeight: 1.6 }}>
            Si requieres check-in tardío, cuna para bebés, reserva de sala de juntas para tu equipo o traslado corporativo desde el Aeropuerto El Dorado, nuestro equipo de concierge está a tu servicio.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
            <button
              onClick={() => setActiveTab('reservar')}
              style={{
                backgroundColor: '#d91a2a',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '0.8rem 1.8rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(217, 26, 42, 0.35)',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b91522'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#d91a2a'; }}
            >
              Reservar Apartamento Directo
              <ChevronRight size={16} />
            </button>

            <a
              href="https://wa.me/573153512085?text=Hola%20Apartamentos%20Facile,%20deseo%20consultar%20sobre%20los%20servicios%20del%20apartahotel"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '0.8rem 1.6rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <Headphones size={16} color="#d91a2a" />
              <span>Contactar Concierge (WhatsApp)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VistaServicios;
