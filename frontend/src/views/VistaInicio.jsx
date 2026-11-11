/*
  VistaInicio — extraído de App.jsx durante la Fase A de descomposición.
  El estado y los handlers se consumen desde AppContext vía useApp().
*/
import { useApp } from '../context/AppContext.jsx';

const VistaInicio = () => {
  const {
  reservas, setActiveTab
  } = useApp();
  return (
        <>
          <section className="facile-hero">
            <div className="facile-hero-container">
              <div className="facile-hero-card">
                <h1>Hola Bienvenidos!</h1>
                <p>
                  Apartamentos amoblados para largas estadías con los servicios completos de un hotel 5 estrellas! Estamos ubicados en la mejor zona del norte de Bogotá el Chicó.
                </p>
                <button className="btn-whatsapp-blue" onClick={() => setActiveTab('reservar')}>
                  AQUI INFORMACION POR WHATSAPP
                </button>
              </div>
            </div>
          </section>

          {/* Destacados rápidos */}
          <div className="facile-section">
            <div className="section-title-wrap">
              <h2>Apartamentos Facile Bogotá</h2>
              <p>Confort, elegancia y centro de negocios en la mejor ubicación de la capital</p>
            </div>

            <div className="services-card-grid">
              <div className="service-card">
                <div className="service-card-icon">🏢</div>
                <h3>Apartamentos Amoblados</h3>
                <p>Unidades dúplex y suites ejecutivas totalmente equipadas para estadías cortas y largas.</p>
              </div>
              <div className="service-card">
                <div className="service-card-icon">💼</div>
                <h3>Centro de Negocios</h3>
                <p>Salas de reuniones y conectividad por fibra óptica para profesionales y empresas.</p>
              </div>
              <div className="service-card">
                <div className="service-card-icon">🛡️</div>
                <h3>Recepción & Seguridad 24/7</h3>
                <p>Personal operativo en portería y circuito de cámaras de vigilancia permanente.</p>
              </div>
              <div className="service-card">
                <div className="service-card-icon">✨</div>
                <h3>15% Descuento Larga Estadía</h3>
                <p>Descuento automático para todas las reservas superiores a 15 noches continuas.</p>
              </div>
            </div>
          </div>
        </>
  );
};

export default VistaInicio;
