import React from 'react';
import {
  Briefcase, Wifi, Clock
} from 'lucide-react';
import BookingShowcase from '../components/BookingShowcase.jsx';
import { useApp } from '../context/AppContext.jsx';

const VistaCentroNegocios = () => {
  const {
    setActiveTab, setReservaData, setAptoLightboxPhoto
  } = useApp();

  const oficinasData = [
    {
      id: 'sala_1',
      tipo: 'Sala de Juntas 1',
      capacidad: 'Hasta 10 personas',
      desc: 'Sala ejecutiva de reuniones totalmente equipada con pantalla de 65" para presentaciones, conexión a internet por fibra óptica, climatización e insonorización acústica.',
      precio: '$70.000',
      precioSub: 'COP/hora',
      fotos: [
        { url: '/images/oficinas/IMG_9272-HDR.jpg', titulo: 'Sala de Juntas 1 — Vista Principal Mesa Directiva', desc: 'Mesa corporativa en madera con 10 sillas ergonómicas' },
        { url: '/images/oficinas/IMG_9275-HDR.jpg', titulo: 'Sala de Juntas 1 — Pantalla 65" & Audiovisual', desc: 'Conectividad HDMI, USB-C y sonido envolvente' },
        { url: '/images/oficinas/IMG_9366-HDR.jpg', titulo: 'Sala de Juntas 1 — Proyección & Climatización', desc: 'Clima individualizado y excelente acústica' },
        { url: '/images/oficinas/IMG_9378-HDR.jpg', titulo: 'Sala de Juntas 1 — Iluminación & Panorámica', desc: 'Luz natural con cortinas de graduación' },
        { url: '/images/oficinas/IMG_9281-HDR.jpg', titulo: 'Sala de Juntas 1 — Soporte Ejecutivo', desc: 'Estación de apoyo insonorizada' },
        { url: '/images/oficinas/IMG_9290-HDR.jpg', titulo: 'Sala de Juntas 1 — Vista Lateral', desc: 'Mobiliario corporativo moderno' }
      ]
    },
    {
      id: 'sala_2',
      tipo: 'Sala de Juntas 2',
      capacidad: 'Hasta 10 personas',
      desc: 'Segunda sala de juntas ejecutiva con equipamiento VIP completo. Ideal para reuniones directivas simultáneas, capacitaciones de equipos y firmas corporativas.',
      precio: '$70.000',
      precioSub: 'COP/hora',
      fotos: [
        { url: '/images/oficinas/IMG_9369-HDR.jpg', titulo: 'Sala de Juntas 2 — Área Directiva VIP', desc: 'Mesa ejecutiva con climatización de precisión' },
        { url: '/images/oficinas/IMG_9375-HDR.jpg', titulo: 'Sala de Juntas 2 — Conexiones Integradas', desc: 'Puertos de energía y red directos en mesa' },
        { url: '/images/oficinas/IMG_9381-HDR.jpg', titulo: 'Sala de Juntas 2 — Sillas Ergonómicas', desc: 'Asientos ergonómicos ajustables' },
        { url: '/images/oficinas/IMG_9387-HDR.jpg', titulo: 'Sala de Juntas 2 — Insonorización Acústica', desc: 'Privacidad total para llamadas y negociaciones' },
        { url: '/images/oficinas/IMG_9396-HDR.jpg', titulo: 'Sala de Juntas 2 — Zona Lounge de Pausas', desc: 'Sillones ejecutivos confortables' }
      ]
    },
    {
      id: 'sala_3',
      tipo: 'Sala de Juntas 3',
      capacidad: 'Hasta 15 personas',
      desc: 'Espacio flexible de reuniones y trabajo colaborativo (Coworking flex) con internet dedicado por fibra óptica, estaciones de café gourmet y ambiente profesional.',
      precio: '$20.000',
      precioSub: 'COP/hora',
      fotos: [
        { url: '/images/oficinas/IMG_9278-HDR.jpg', titulo: 'Sala de Juntas 3 — Puestos de Trabajo Flex', desc: 'Puestos libres con iluminación LED y fibra óptica' },
        { url: '/images/oficinas/IMG_9287-HDR.jpg', titulo: 'Sala de Juntas 3 — Puesto Individual Privado', desc: 'Insonorización y aislamiento para videollamadas' },
        { url: '/images/oficinas/IMG_9296-HDR.jpg', titulo: 'Sala de Juntas 3 — Impresiones & Copiado', desc: 'Multifuncional para huéspedes y profesionales' },
        { url: '/images/oficinas/IMG_9308-HDR.jpg', titulo: 'Sala de Juntas 3 — Estación de Café & Lounge', desc: 'Café gourmet ilimitado y zona de networking' },
        { url: '/images/oficinas/IMG_9311-HDR.jpg', titulo: 'Sala de Juntas 3 — Espacio Colaborativo', desc: 'Mobiliario adaptable para equipos' },
        { url: '/images/oficinas/IMG_9399-HDR.jpg', titulo: 'Sala de Juntas 3 — Panorama Centro de Negocios', desc: 'Entorno de alto desempeño profesional' }
      ]
    }
  ];

  return (
    <section className="facile-section">
      <div className="section-title-wrap">
        <h2>Centro de Negocios & Salas de Juntas</h2>
        <p>Salas de reuniones ejecutivas y espacios de coworking con la mejor infraestructura en El Chicó</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1rem' }}>
        {oficinasData.map((oficina) => (
          <div
            key={oficina.id}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '1.8rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* CABECERA DEL ESPACIO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    {oficina.tipo}
                  </h3>
                  <span style={{ 
                    backgroundColor: '#fee2e2', 
                    color: '#d91a2a', 
                    padding: '0.35rem 0.9rem', 
                    borderRadius: 'var(--radius-pill)', 
                    fontSize: '0.82rem', 
                    fontWeight: 800,
                    border: '1px solid #fecaca'
                  }}>
                    {oficina.capacidad}
                  </span>
                </div>
                <p style={{ margin: '0.4rem 0 0', color: '#64748b', fontSize: '0.92rem' }}>
                  {oficina.desc}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d91a2a' }}>
                  {oficina.precio} <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{oficina.precioSub}</span>
                </div>
              </div>
            </div>

            {/* COLLAGE ESTILO BOOKING.COM ESPECÍFICO DE ESTE ESPACIO */}
            <BookingShowcase
              photos={oficina.fotos}
              onOpenLightbox={(idx) => setAptoLightboxPhoto({ photos: oficina.fotos, index: idx })}
              title={oficina.tipo}
            />

            {/* PIE DE ESPECIFICACIONES Y BOTÓN ACCIÓN */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span className="spec-pill" style={{ borderRadius: 'var(--radius-pill)', padding: '0.4rem 0.85rem' }}>
                  <Wifi size={13} color="#d91a2a" /> Fibra Óptica Dedicada
                </span>
                <span className="spec-pill" style={{ borderRadius: 'var(--radius-pill)', padding: '0.4rem 0.85rem' }}>
                  <Briefcase size={13} color="#d91a2a" /> Pantalla HD 65" / Proyector
                </span>
                <span className="spec-pill" style={{ borderRadius: 'var(--radius-pill)', padding: '0.4rem 0.85rem' }}>
                  <Clock size={13} color="#d91a2a" /> Alquiler Flexible por Horas
                </span>
              </div>

              {/* BOTÓN REDONDO CON HOVER Y COLOR OFICIAL */}
              <button
                type="button"
                onClick={() => {
                  const mapOficinas = { 'sala_1': 1, 'sala_2': 2, 'sala_3': 3 };
                  const espTarget = mapOficinas[oficina.id] || 1;
                  setReservaData(prev => ({ ...prev, id_habitacion: `coworking-${espTarget}` }));
                  setActiveTab('reservar');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ 
                  backgroundColor: '#d91a2a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.8rem', 
                  borderRadius: 'var(--radius-pill)', 
                  fontWeight: '700',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(217, 26, 42, 0.25)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91522';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(217, 26, 42, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#d91a2a';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(217, 26, 42, 0.25)';
                }}
              >
                Consultar Disponibilidad / Reservar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VistaCentroNegocios;
