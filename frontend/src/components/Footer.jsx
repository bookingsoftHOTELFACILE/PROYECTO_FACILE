/*
  Footer — extraído de App.jsx durante la Fase A de descomposición.
  El estado y los handlers se consumen desde AppContext vía useApp().
*/
import {
  MessageCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const Footer = () => {
  const {
  activeTab, setShowLoginModal
  } = useApp();
  return (
activeTab !== 'pms' ? (
        <>
          {/* WHATSAPP FLOATING WIDGET (COMO EN APARTAMENTOSFACILE.COM) */}
          <div className="whatsapp-float-wrap">
            <span className="whatsapp-bubble">¿En qué podemos servirle?</span>
            <a href="https://wa.me/573153512085" target="_blank" rel="noreferrer" className="whatsapp-circle-btn" title="Contactar por WhatsApp">
              <MessageCircle size={28}/>
            </a>
          </div>

          {/* FOOTER CORPORATIVO OFICIAL PÚBLICO */}
          <footer className="facile-footer">
            <div className="facile-footer-grid">
              <div className="footer-section">
                <h4>Apartamentos Facile</h4>
                <p>Apartamentos amoblados para largas estadías en Bogotá con los servicios completos de un hotel y centro de negocios.</p>
                <p><strong>PBX:</strong> +57 315 351 2085</p>
              </div>
              <div className="footer-section">
                <h4>Ubicación & Contacto</h4>
                <p>Calle 97 #21-62, Barrio Chicó</p>
                <p>Bogotá D.C., Colombia</p>
                <p>Recepción 24 Horas</p>
              </div>
              <div className="footer-section">
                <h4>Proyecto Formativo</h4>
                <p><strong>BookingSoft</strong> — Sistema de Gestión Integral Hotelera.</p>
                <p>SENA Centro de Formación — ADSO 2026.</p>
                <p>José Chico, Maicol Mayor, Ashly Echeverri, Sebastián Parada, David López.</p>
              </div>
            </div>
            <div className="footer-copy">
              <p>© 2026 Apartamentos Facile — Todos los derechos reservados.</p>
              <button
                onClick={() => setShowLoginModal(true)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.72rem', cursor: 'pointer', marginTop: '0.4rem', textDecoration: 'underline' }}
              >
                🔒 Acceso Personal Autorizado (BookingSoft PMS)
              </button>
            </div>
          </footer>
        </>
      ) : (
        /* FOOTER INTERNO EXCLUSIVO PMS */
        <footer style={{ marginTop: 'auto', background: '#0f172a', color: '#64748b', borderTop: '1px solid #1e293b', padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.78rem' }}>
          <p style={{ margin: 0 }}>
            <strong>BookingSoft PMS v2.0</strong> — Sistema de Control Hotelero Interno | Apartamentos Facile — ADSO 2026
          </p>
        </footer>
      )
  );
};

export default Footer;
