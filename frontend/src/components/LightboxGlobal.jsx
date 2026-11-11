/*
  LightboxGlobal — extraído de App.jsx durante la Fase A de descomposición.
  El estado y los handlers se consumen desde AppContext vía useApp().
*/
import {
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const LightboxGlobal = () => {
  const {
  aptoLightboxPhoto, setAptoLightboxPhoto, lightboxZoom, setLightboxZoom
  } = useApp();
        const photosList = aptoLightboxPhoto.photos || [aptoLightboxPhoto];
        const currentIndex = aptoLightboxPhoto.index || 0;
        const activePhoto = photosList[currentIndex] || photosList[0];

        const goPrev = (e) => {
          if (e) e.stopPropagation();
          setLightboxZoom(false);
          const newIdx = (currentIndex - 1 + photosList.length) % photosList.length;
          setAptoLightboxPhoto({ photos: photosList, index: newIdx });
        };

        const goNext = (e) => {
          if (e) e.stopPropagation();
          setLightboxZoom(false);
          const newIdx = (currentIndex + 1) % photosList.length;
          setAptoLightboxPhoto({ photos: photosList, index: newIdx });
        };

        const toggleZoom = (e) => {
          if (e) e.stopPropagation();
          setLightboxZoom(prev => !prev);
        };

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(15, 23, 42, 0.96)',
              backdropFilter: 'blur(12px)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => {
              setLightboxZoom(false);
              setAptoLightboxPhoto(null);
            }}
          >
            {/* BOTÓN CERRAR (X) */}
            <button
              type="button"
              onClick={() => {
                setLightboxZoom(false);
                setAptoLightboxPhoto(null);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '25px',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#ffffff',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 100000,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e11d48'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              title="Cerrar (Esc)"
            >
              <X size={26}/>
            </button>

            {/* NAVEGACIÓN FLECHA IZQUIERDA */}
            {photosList.length > 1 && (
              <button
                type="button"
                onClick={goPrev}
                style={{
                  position: 'absolute',
                  left: '25px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.18)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 100000,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#e11d48';
                  e.currentTarget.style.borderColor = '#e11d48';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
                title="Fotografía Anterior (Flecha Izquierda)"
              >
                <ChevronLeft size={32}/>
              </button>
            )}

            {/* NAVEGACIÓN FLECHA DERECHA */}
            {photosList.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                style={{
                  position: 'absolute',
                  right: '25px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.18)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 100000,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#e11d48';
                  e.currentTarget.style.borderColor = '#e11d48';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
                title="Siguiente Fotografía (Flecha Derecha)"
              >
                <ChevronRight size={32}/>
              </button>
            )}

            {/* CONTENEDOR DE LA FOTO EN ALTA RESOLUCIÓN CON ZOOM */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '88vw',
                maxHeight: '82vh',
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
                background: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                onClick={toggleZoom}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: lightboxZoom ? 'zoom-out' : 'zoom-in',
                  maxHeight: '72vh',
                  maxWidth: '88vw',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={activePhoto.url}
                  alt={activePhoto.titulo || 'Fotografía'}
                  style={{
                    maxHeight: '72vh',
                    maxWidth: '88vw',
                    objectFit: 'contain',
                    display: 'block',
                    transform: lightboxZoom ? 'scale(1.65)' : 'scale(1)',
                    transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    pointerEvents: 'none',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {lightboxZoom ? '🔍 Alejar (1.65x)' : '🔍 Haz clic para acercar'}
                </div>
              </div>

              <div style={{ width: '100%', background: '#0f172a', padding: '1rem 1.5rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  {activePhoto.titulo && (
                    <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.15rem', fontWeight: 800 }}>
                      {activePhoto.titulo}
                    </h3>
                  )}
                  {activePhoto.desc && (
                    <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.86rem' }}>
                      {activePhoto.desc}
                    </p>
                  )}
                </div>

                {/* CONTADOR DE FOTOS */}
                {photosList.length > 1 && (
                  <div style={{ background: '#e11d48', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0 }}>
                    {currentIndex + 1} de {photosList.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
};

export default LightboxGlobal;
