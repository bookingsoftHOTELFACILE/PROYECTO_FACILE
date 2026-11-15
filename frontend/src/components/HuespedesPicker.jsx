import { useState, useEffect, useRef } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import ServiceAnimalModal from './ServiceAnimalModal.jsx';

// COMPONENTE DESPLEGABLE SELECTOR DE HUÉSPEDES ESTILO AIRBNB (ADULTOS, NIÑOS, BEBÉS, MASCOTAS)
const HuespedesPicker = ({
  maxCapacidad = 4,
  onChange,
  initialAdultos = 1,
  initialNinos = 0,
  initialBebes = 0,
  initialMascotas = 0,
  popoverAlign = 'left',
  variant = 'default'
}) => {
  const [adultos, setAdultos] = useState(initialAdultos);
  const [ninos, setNinos] = useState(initialNinos);
  const [bebes, setBebes] = useState(initialBebes);
  const [mascotas, setMascotas] = useState(initialMascotas);
  const [isOpen, setIsOpen] = useState(false);
  const [showServiceAnimalModal, setShowServiceAnimalModal] = useState(false);
  const containerRef = useRef(null);

  // Cerrar popover automáticamente al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const totalHuespedes = adultos + ninos;

  const getSummaryText = () => {
    let parts = [];
    if (totalHuespedes === 1) parts.push('1 huésped');
    else parts.push(`${totalHuespedes} huéspedes`);

    if (bebes > 0) parts.push(`${bebes} bebé${bebes > 1 ? 's' : ''}`);
    if (mascotas > 0) parts.push(`${mascotas} mascota${mascotas > 1 ? 's' : ''}`);

    return parts.join(', ');
  };

  useEffect(() => {
    if (onChange) {
      onChange({
        adultos,
        ninos,
        bebes,
        mascotas,
        total: totalHuespedes,
        summary: getSummaryText()
      });
    }
  }, [adultos, ninos, bebes, mascotas]);

  return (
    <div ref={containerRef} className={`huespedes-trigger-box relative ${variant === 'pms' ? 'w-full' : ''}`}>
      {variant === 'pms' ? (
        <div
          className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold flex items-center justify-between transition-all cursor-pointer select-none ${
            isOpen
              ? 'border-[#d91a2a] ring-4 ring-[#d91a2a]/10 bg-white text-slate-900 shadow-xs'
              : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white text-slate-900'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{getSummaryText()}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#d91a2a]' : ''
            }`}
          />
        </div>
      ) : (
        <div
          className={`huespedes-trigger-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{getSummaryText()}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{isOpen ? '▲' : '▼'}</span>
        </div>
      )}

      {isOpen && (
        <div
          className="huespedes-popover-card"
          style={popoverAlign === 'right' ? { left: 'auto', right: 0, minWidth: '320px' } : { minWidth: '320px' }}
        >
          {/* Adultos */}
          <div className="huespedes-row">
            <div className="huespedes-info">
              <span className="huespedes-label">Adultos</span>
              <span className="huespedes-sublabel">Edad: 13 o más</span>
            </div>
            <div className="huespedes-stepper">
              <button
                type="button"
                className="stepper-btn"
                disabled={adultos <= 1}
                onClick={(e) => { e.stopPropagation(); setAdultos(prev => Math.max(1, prev - 1)); }}
              >
                -
              </button>
              <span className="stepper-val">{adultos}</span>
              <button
                type="button"
                className="stepper-btn"
                disabled={totalHuespedes >= maxCapacidad}
                onClick={(e) => { e.stopPropagation(); setAdultos(prev => prev + 1); }}
              >
                +
              </button>
            </div>
          </div>

          {/* Niños */}
          <div className="huespedes-row">
            <div className="huespedes-info">
              <span className="huespedes-label">Niños</span>
              <span className="huespedes-sublabel">De 2 a 12 años</span>
            </div>
            <div className="huespedes-stepper">
              <button
                type="button"
                className="stepper-btn"
                disabled={ninos <= 0}
                onClick={(e) => { e.stopPropagation(); setNinos(prev => Math.max(0, prev - 1)); }}
              >
                -
              </button>
              <span className="stepper-val">{ninos}</span>
              <button
                type="button"
                className="stepper-btn"
                disabled={totalHuespedes >= maxCapacidad}
                onClick={(e) => { e.stopPropagation(); setNinos(prev => prev + 1); }}
              >
                +
              </button>
            </div>
          </div>

          {/* Bebés */}
          <div className="huespedes-row">
            <div className="huespedes-info">
              <span className="huespedes-label">Bebés</span>
              <span className="huespedes-sublabel">Menos de 2 años</span>
            </div>
            <div className="huespedes-stepper">
              <button
                type="button"
                className="stepper-btn"
                disabled={bebes <= 0}
                onClick={(e) => { e.stopPropagation(); setBebes(prev => Math.max(0, prev - 1)); }}
              >
                -
              </button>
              <span className="stepper-val">{bebes}</span>
              <button
                type="button"
                className="stepper-btn"
                disabled={bebes >= 5}
                onClick={(e) => { e.stopPropagation(); setBebes(prev => prev + 1); }}
              >
                +
              </button>
            </div>
          </div>

          {/* Mascotas */}
          <div className="huespedes-row">
            <div className="huespedes-info">
              <span className="huespedes-label">Mascotas</span>
              <span className="huespedes-sublabel">
                <span
                  className="link-service"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowServiceAnimalModal(true);
                  }}
                  style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 600, color: '#0f172a' }}
                >
                  ¿Traes a un animal de servicio?
                </span>
              </span>
            </div>
            <div className="huespedes-stepper">
              <button
                type="button"
                className="stepper-btn"
                disabled={mascotas <= 0}
                onClick={(e) => { e.stopPropagation(); setMascotas(prev => Math.max(0, prev - 1)); }}
              >
                -
              </button>
              <span className="stepper-val">{mascotas}</span>
              <button
                type="button"
                className="stepper-btn"
                disabled={mascotas >= 5}
                onClick={(e) => { e.stopPropagation(); setMascotas(prev => prev + 1); }}
              >
                +
              </button>
            </div>
          </div>

          <div className="huespedes-notice">
            Este alojamiento tiene una capacidad máxima de {maxCapacidad} huéspedes, sin incluir bebés. Si vienes con más de 2 mascotas, avísale al anfitrión.
          </div>

          <div className="huespedes-popover-footer">
            <button
              type="button"
              className="btn-close-huespedes"
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE POLÍTICA DE ANIMALES DE SERVICIO */}
      <ServiceAnimalModal
        isOpen={showServiceAnimalModal}
        onClose={() => setShowServiceAnimalModal(false)}
      />
    </div>
  );
};

export default HuespedesPicker;
