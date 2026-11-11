/*
  VistaServicios — extraído de App.jsx durante la Fase A de descomposición.
  El estado y los handlers se consumen desde AppContext vía useApp().
*/
import { useApp } from '../context/AppContext.jsx';

const VistaServicios = () => {
  return (
        <section className="facile-section">
          <div className="section-title-wrap">
            <h2>Nuestros Servicios</h2>
            <p>Todo lo que necesita para una estadía placentera y productiva</p>
          </div>

          <div className="services-card-grid">
            <div className="service-card">
              <div className="service-card-icon">🧹</div>
              <h3>Servicio de Amas de Llaves</h3>
              <p>Aseo profesional, cambio de lencería y toallas de alta calidad con protocolos de desinfección.</p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">🚗</div>
              <h3>Parqueadero Privado</h3>
              <p>Estacionamiento vigilado dentro del edificio las 24 horas para huéspedes y visitantes.</p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">📶</div>
              <h3>Wi-Fi de Alta Velocidad</h3>
              <p>Conexión por fibra óptica en todos los apartamentos y zonas de coworking.</p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">🍳</div>
              <h3>Cocina Totalmente Equipada</h3>
              <p>Nevera, microondas, estufa, vajilla completa y electrodomésticos en cada apartamento.</p>
            </div>
          </div>
        </section>
  );
};

export default VistaServicios;
