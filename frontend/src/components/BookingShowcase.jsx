/*
  BookingShowcase — componente original de App.jsx, extraído en la Fase A.
*/
import {
  Sparkles, X, Maximize2, Camera
} from 'lucide-react';

// COMPONENTE SHOWCASE DE FOTOS ESTILO BOOKING.COM (FOTO DESTACADA HÉROE + COLLAGE)
const BookingShowcase = ({ photos, onOpenLightbox, title }) => {
  if (!photos || photos.length === 0) return null;

  const heroPhoto = photos[0];
  const topPhotos = photos.slice(1, 3);
  const bottomPhotos = photos.slice(3, 5);
  const totalCount = photos.length;

  return (
    <div style={{ marginBottom: '2.5rem', padding: '0 1rem' }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Camera size={22} color="#e11d48" /> {title}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenLightbox(0)}
            style={{
              background: '#e11d48',
              border: 'none',
              color: '#ffffff',
              padding: '0.6rem 1.2rem',
              borderRadius: '25px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(225,29,72,0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <Maximize2 size={15} /> Ver Álbum ({totalCount})
          </button>
        </div>
      )}

      {/* COLLAGE TIPO BOOKING.COM */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr 1fr',
          gridTemplateRows: '230px 160px',
          gap: '10px',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(0,0,0,0.12)',
          background: '#0f172a'
        }}
      >
        {/* FOTO DESTACADA HÉROE (IZQUIERDA - ALTO COMPLETO) */}
        <div
          style={{
            gridColumn: '1 / 2',
            gridRow: '1 / 3',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
          onClick={() => onOpenLightbox(0)}
        >
          <img
            src={heroPhoto.url}
            alt={heroPhoto.titulo || 'Foto Destacada'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div style={{ position: 'absolute', bottom: '14px', left: '14px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', color: '#ffffff', padding: '0.45rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Sparkles size={14} color="#e11d48" /> {heroPhoto.titulo || 'Instalaciones Destacadas'}
          </div>
        </div>

        {/* FOTO SECUNDARIA DERECHA TOP 1 */}
        {topPhotos[0] && (
          <div
            style={{ gridColumn: '2 / 3', gridRow: '1 / 2', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => onOpenLightbox(1)}
          >
            <img
              src={topPhotos[0].url}
              alt="Vista Secundario 1"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        )}

        {/* FOTO SECUNDARIA DERECHA TOP 2 */}
        {topPhotos[1] && (
          <div
            style={{ gridColumn: '3 / 4', gridRow: '1 / 2', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => onOpenLightbox(2)}
          >
            <img
              src={topPhotos[1].url}
              alt="Vista Secundario 2"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        )}

        {/* FOTO SECUNDARIA DERECHA BOTTOM 1 */}
        {bottomPhotos[0] && (
          <div
            style={{ gridColumn: '2 / 3', gridRow: '2 / 3', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => onOpenLightbox(3)}
          >
            <img
              src={bottomPhotos[0].url}
              alt="Miniatura"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        )}

        {/* ÚLTIMA CASILLA CON SUPERPOSICIÓN (+X FOTOS MÁS) */}
        {bottomPhotos[1] && (
          <div
            style={{ gridColumn: '3 / 4', gridRow: '2 / 3', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => onOpenLightbox(4)}
          >
            <img
              src={bottomPhotos[1].url}
              alt="Más fotos"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(225, 29, 72, 0.88)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)'}
            >
              <Camera size={26} color="#ffffff" />
              <span style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.4rem' }}>
                +{totalCount - 4} fotos
              </span>
              <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                Ver Galería
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingShowcase;
