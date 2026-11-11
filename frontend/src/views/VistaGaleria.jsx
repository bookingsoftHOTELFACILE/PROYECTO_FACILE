/*
  VistaGaleria — extraído de App.jsx durante la Fase A de descomposición.
  El estado y los handlers se consumen desde AppContext vía useApp().
*/
import {
  Maximize2
} from 'lucide-react';
import BookingShowcase from '../components/BookingShowcase.jsx';
import { useApp } from '../context/AppContext.jsx';

const VistaGaleria = () => {
  const {
  galleryFilter, setGalleryFilter, lightboxIdx, setAptoLightboxPhoto
  } = useApp();
        const galleryItems = [
          // ZONAS COMUNES & APARTAHOTEL (11 FOTOS REALES)
          { id: 1, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9217-HDR.jpg', titulo: 'Fachada & Ingreso Principal', desc: 'Ubicación privileged en El Chicó, Bogotá' },
          { id: 2, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9226-HDR.jpg', titulo: 'Lobby & Recepción 24 Horas', desc: 'Atención personalizada y check-in 24/7' },
          { id: 3, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9229-HDR.jpg', titulo: 'Salón de Espera Principal', desc: 'Cómodas salas lounge para huéspedes y visitantes' },
          { id: 4, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9233-HDR.jpg', titulo: 'Comedor & Área Social', desc: 'Espacios luminosos ideales para descanso' },
          { id: 5, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9236-HDR.jpg', titulo: 'Lounge Social & Confort', desc: 'Mobiliario ergonómico de alta gama' },
          { id: 6, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9239-HDR.jpg', titulo: 'Hall de Ascensores', desc: 'Acceso rápido y seguro a todos los niveles' },
          { id: 7, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9248-HDR.jpg', titulo: 'Pasillos de Circulación', desc: 'Amplios corredores con iluminación ambiental' },
          { id: 8, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9254-HDR.jpg', titulo: 'Terraza & Entorno Natural', desc: 'Espacio al aire libre en la zona norte' },
          { id: 9, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9260-HDR.jpg', titulo: 'Lobby de Descanso', desc: 'Ambiente tranquilo para lectura y relajación' },
          { id: 10, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9305-HDR.jpg', titulo: 'Vista Panorámica del Sector', desc: 'Rodeado de los mejores restaurantes y centros empresariales' },
          { id: 11, categoria: 'zonas', catNombre: 'Zonas Comunes', url: '/images/zonas/IMG_9317-HDR.jpg', titulo: 'Iluminación Nocturna de Recepción', desc: 'Seguridad y asistencia permanente' },

          // APARTAMENTOS & DÚPLEX (9 FOTOS REALES)
          { id: 12, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9408-HDR.jpg', titulo: 'Sala de Apartamento Dúplex', desc: 'Amplitud, sofá cama y televisión de alta resolución' },
          { id: 13, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9411-HDR.jpg', titulo: 'Cocina Integral & Comedor', desc: 'Equipada con nevera, microondas y menaje completo' },
          { id: 14, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9417-HDR.jpg', titulo: 'Habitación Master King', desc: 'Cama King, ropa de cama premium y cortinas black-out' },
          { id: 15, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9420-HDR.jpg', titulo: 'Segunda Habitación / Suite', desc: 'Confort individual o en pareja para estadías extendidas' },
          { id: 16, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9423-HDR.jpg', titulo: 'Baño Principal En-Suite', desc: 'Ducha de agua caliente constante y acabados modernos' },
          { id: 17, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/IMG_9426-HDR.jpg', titulo: 'Zona de Ropas & Lavado', desc: 'Lavadora-secadora privada dentro de la unidad' },
          { id: 18, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/duplex IMG_9483-HDR.jpg', titulo: 'Nivel Superior Dúplex', desc: 'Diseño arquitectónico en dos niveles' },
          { id: 19, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/duplex IMG_9486-HDR.jpg', titulo: 'Alcoba Principal Dúplex', desc: 'Espacio exclusivo para un descanso reparador' },
          { id: 20, categoria: 'apartamentos', catNombre: 'Apartamentos', url: '/images/apartamentos/duplex IMG_9492-HDR.jpg', titulo: 'Detalle de Diseño Interior', desc: 'Mobiliario amoblado y pensado para la productividad' },

          // CENTRO DE NEGOCIOS & COWORKING (17 FOTOS REALES)
          { id: 21, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9272-HDR.jpg', titulo: 'Sala de Juntas Ejecutiva 1', desc: 'Capacidad para 10 personas con mesa corporativa' },
          { id: 22, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9275-HDR.jpg', titulo: 'Equipamiento Audiovisual', desc: 'Pantalla 65 pulgadas para videollamadas' },
          { id: 23, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9278-HDR.jpg', titulo: 'Puestos Coworking Flex', desc: 'Conexión a internet dedicado por fibra óptica' },
          { id: 24, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9281-HDR.jpg', titulo: 'Escritorio Ejecutivo Insonorizado', desc: 'Entorno de concentración individual' },
          { id: 25, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9287-HDR.jpg', titulo: 'Oficina Privada por Horas', desc: 'Insonorización y privacidad para reuniones' },
          { id: 26, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9290-HDR.jpg', titulo: 'Área de Trabajo & Reuniones Rápidas', desc: 'Mobiliario moderno con excelente iluminación' },
          { id: 27, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9296-HDR.jpg', titulo: 'Zona de Impresiones & Scanner', desc: 'Servicios de oficina integrados para huéspedes' },
          { id: 28, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9308-HDR.jpg', titulo: 'Lounge Corporativo & Estación de Café', desc: 'Bebidas calientes y espacio de networking' },
          { id: 29, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9311-HDR.jpg', titulo: 'Espacio Colaborativo de Negocios', desc: 'Ambiente dinámico para emprendedores' },
          { id: 30, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9366-HDR.jpg', titulo: 'Mesa Directiva & Proyector HD', desc: 'Tecnología lista para capacitaciones' },
          { id: 31, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9369-HDR.jpg', titulo: 'Ambiente de Silencio & Enfoque', desc: 'Climatización y ergonomía garantizada' },
          { id: 32, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9375-HDR.jpg', titulo: 'Conexiones Eléctricas Dobladas', desc: 'Tomas múltiples y conectividad en cada puesto' },
          { id: 33, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9378-HDR.jpg', titulo: 'Sala VIP Corporativa', desc: 'Servicio exclusivo para ejecutivos y firmas' },
          { id: 34, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9381-HDR.jpg', titulo: 'Puesto Ergonómico Ejecutivo', desc: 'Sillas de alta gama para jornadas prolongadas' },
          { id: 35, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9387-HDR.jpg', titulo: 'Oficina Privada Nivel Superior', desc: 'Vista privileged y máximo confort' },
          { id: 36, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9396-HDR.jpg', titulo: 'Zona de Descanso para Empresarios', desc: 'Sillones cómodos para pausas activas' },
          { id: 37, categoria: 'oficinas', catNombre: 'Centro de Negocios', url: '/images/oficinas/IMG_9399-HDR.jpg', titulo: 'Vista General del Centro de Negocios', desc: 'Ubicación clave en el Parque de la 93 / Chicó' }
        ];

        const filteredList = galleryFilter === 'todas' 
          ? galleryItems 
          : galleryItems.filter(item => item.categoria === galleryFilter);

        const currentImage = lightboxIdx !== null ? filteredList[lightboxIdx] : null;

        return (
          <section className="facile-section">
            <div className="section-title-wrap">
              <h2>Galería Fotográfica Real</h2>
              <p>Conoce las instalaciones reales de Apartamentos Facile Bogotá & Centro de Negocios</p>
            </div>

            {/* SHOWCASE HIGHLIGHT TIPO BOOKING.COM AL INICIO DE LA GALERÍA */}
            <BookingShowcase
              photos={filteredList}
              onOpenLightbox={(idx) => setAptoLightboxPhoto({ photos: filteredList, index: idx })}
              title="Vistas Destacadas del Apartahotel & Centro de Negocios"
            />

            {/* BARRA DE FILTROS CATEGÓRICOS DE GALERÍA */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap', padding: '0 1rem' }}>
              {[
                { id: 'todas', label: '🌟 Ver Todas', count: galleryItems.length },
                { id: 'zonas', label: '🏢 Zonas Comunes & Lobby', count: galleryItems.filter(i => i.categoria === 'zonas').length },
                { id: 'apartamentos', label: '🛋️ Apartamentos & Dúplex', count: galleryItems.filter(i => i.categoria === 'apartamentos').length },
                { id: 'oficinas', label: '💼 Centro de Negocios & Coworking (17 fotos)', count: galleryItems.filter(i => i.categoria === 'oficinas').length }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setGalleryFilter(f.id)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '25px',
                    border: galleryFilter === f.id ? '2px solid #e11d48' : '1.5px solid #cbd5e1',
                    background: galleryFilter === f.id ? '#e11d48' : '#ffffff',
                    color: galleryFilter === f.id ? '#ffffff' : '#334155',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: galleryFilter === f.id ? '0 4px 12px rgba(225,29,72,0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>{f.label}</span>
                  <span style={{
                    background: galleryFilter === f.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: galleryFilter === f.id ? '#ffffff' : '#64748b',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* GRID DE GALERÍA FOTOGRÁFICA (PURA FOTOGRAFÍA CON ZOOM INTERACTIVO) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem', padding: '0 1rem 2rem' }}>
              {filteredList.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setAptoLightboxPhoto({ photos: filteredList, index: idx })}
                  style={{
                    background: '#0f172a',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    height: '240px',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 14px 30px rgba(0,0,0,0.18)';
                    const overlay = e.currentTarget.querySelector('.photo-hover-overlay');
                    if (overlay) overlay.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)';
                    const overlay = e.currentTarget.querySelector('.photo-hover-overlay');
                    if (overlay) overlay.style.opacity = '0';
                  }}
                >
                  <img
                    src={item.url}
                    alt="Fotografía Facile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  />

                  {/* HOVER OVERLAY CON ÍCONO DE LUPA */}
                  <div
                    className="photo-hover-overlay"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(225, 29, 72, 0.45)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      opacity: 0,
                      transition: 'opacity 0.25s ease'
                    }}
                  >
                    <div style={{ background: '#ffffff', color: '#e11d48', padding: '0.6rem 1.2rem', borderRadius: '25px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                      <Maximize2 size={16}/> Ampliar Fotografía (Zoom)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
};

export default VistaGaleria;
