/*
  ModalCompromiso — extraído de App.jsx durante la Fase A de descomposición.
  El estado y los handlers se consumen desde AppContext vía useApp().
*/
import {
  Heart
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const ModalCompromiso = () => {
  const {
  setActiveTab, setSelectedHuesped, setAlert, setShowCommunityCommitmentModal
  } = useApp();
  return (
        <div className="modal-backdrop" onClick={() => setShowCommunityCommitmentModal(false)}>
          <div className="modal-community-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <div style={{ width: '56px', height: '56px', background: '#fff1f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
                <Heart size={28} color="#e11d48" />
              </div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.3rem' }}>
                Nuestro compromiso de la comunidad
              </p>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                Este es un lugar para todo el mundo 🏨
              </h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.2rem' }}>
              En <strong>BookingSoft Apartamentos Facile</strong> nos comprometemos a construir una comunidad hospitalaria, segura e inclusiva. Para garantizarlo, te pedimos que aceptes nuestro compromiso:
            </p>

            <div style={{ background: '#f8fafc', borderLeft: '4px solid #e11d48', padding: '1rem 1.2rem', borderRadius: '8px', fontSize: '0.86rem', color: '#1e293b', lineHeight: '1.5', marginBottom: '1.5rem', fontWeight: 500 }}>
              "Trataré a todos en la comunidad de Apartamentos Facile con respeto y sin prejuicios, sin importar la raza, religión, nacionalidad, etnia, color de piel, discapacidad, sexo, identidad de género u orientación sexual."
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                type="button"
                className="btn-airbnb-primary"
                style={{ margin: 0 }}
                onClick={() => {
                  setShowCommunityCommitmentModal(false);
                  setActiveTab('reservar');
                  setAlert({ type: 'success', message: '¡Gracias por aceptar el compromiso de la comunidad! Ya puedes confirmar tu reserva.' });
                }}
              >
                Aceptar y continuar →
              </button>
              <button
                type="button"
                style={{ background: 'none', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '12px', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => {
                  setShowCommunityCommitmentModal(false);
                  setSelectedHuesped(null);
                  setAlert({ type: 'info', message: 'Debes aceptar el compromiso de la comunidad para reservar.' });
                }}
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
  );
};

export default ModalCompromiso;
