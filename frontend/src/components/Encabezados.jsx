/*
  Encabezados — extraído de App.jsx durante la Fase A de descomposición.
  El estado y los handlers se consumen desde AppContext vía useApp().
*/
import {
  ShieldCheck, Phone, Calendar, LogOut, User, MapPin,
  Menu, Heart, Luggage
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const Encabezados = () => {
  const {
  activeTab, setActiveTab, selectedHuesped, setSelectedHuesped,
  setAlert, usuarioSesion, setShowGuestAuthModal, setGuestRegJustCreated,
  setShowCommunityCommitmentModal, showGuestMenuDropdown, setShowGuestMenuDropdown, setModalLegalTipo,
  handleLogout
  } = useApp();
  return (
activeTab === 'pms' ? (
        /* HEADER DEDICADO PARA EMPLEADOS (PANEL DE CONTROL PMS) */
        <header className="pms-dedicated-header">
          <div className="pms-dedicated-header-content">
            <div className="pms-logo-brand" onClick={() => setActiveTab('pms')}>
              <span className="pms-logo-title">BookingSoft</span>
              <span className="pms-logo-badge">PMS HOTELERO</span>
            </div>



            <div className="pms-user-actions">
              {usuarioSesion && (
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                  👤 {usuarioSesion.nombre} <strong style={{ color: '#f43f5e' }}>({usuarioSesion.rol})</strong>
                </span>
              )}
              <button
                className="btn-pms-switch-web"
                onClick={() => setActiveTab('inicio')}
                title="Ir al sitio web comercial de huéspedes"
              >
                🌐 Ver Web Pública
              </button>
              <button className="btn-pms-logout" onClick={handleLogout} title="Cerrar Sesión">
                <LogOut size={13}/> Salir
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* HEADER PÚBLICO OFICIAL PARA HUÉSPEDES */
        <>
          {/* 1. TOPBAR OFICIAL ROJA */}
          <div className="facile-topbar">
            <div className="facile-topbar-content">
              <div className="topbar-left">
                <MapPin size={14}/>
                <span>Calle 97 #21-62</span>
              </div>
              <div className="topbar-right">
                <a href="tel:3153512085" className="topbar-phone">
                  <Phone size={14}/>
                  <span>315 351 2085</span>
                </a>
                <div className="topbar-social">
                  <a href="https://www.facebook.com/apartamentosfacile/" target="_blank" rel="noreferrer">Facebook</a>
                  <a href="https://www.instagram.com/apartamentosfacile/" target="_blank" rel="noreferrer">Instagram</a>
                  <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">YouTube</a>
                </div>
              </div>
            </div>
          </div>

          {/* 2. HEADER ROJO OFICIAL CON LOGO FACILE BLANCO EN CURSIVA */}
          <header className="facile-header">
            <div className="facile-header-content">
              <div className="facile-logo" onClick={() => setActiveTab('inicio')}>
                <span className="facile-logo-script">Facile</span>
                <span className="facile-logo-sub">APARTAMENTOS</span>
              </div>

              <nav className="facile-nav">
                <button className={`facile-nav-link ${activeTab === 'inicio' ? 'active' : ''}`} onClick={() => setActiveTab('inicio')}>
                  Inicio
                </button>
                <button className={`facile-nav-link ${activeTab === 'apartamentos' ? 'active' : ''}`} onClick={() => setActiveTab('apartamentos')}>
                  Apartamentos
                </button>
                <button className={`facile-nav-link ${activeTab === 'centro_negocios_pub' ? 'active' : ''}`} onClick={() => setActiveTab('centro_negocios_pub')}>
                  Centro de Negocios
                </button>
                <button className={`facile-nav-link ${activeTab === 'servicios' ? 'active' : ''}`} onClick={() => setActiveTab('servicios')}>
                  Servicios
                </button>
                <button className={`facile-nav-link ${activeTab === 'galeria' ? 'active' : ''}`} onClick={() => setActiveTab('galeria')}>
                  Galería
                </button>

                {/* Botón de Empleado o Airbnb para huéspedes */}
                {usuarioSesion && usuarioSesion.rol !== 'Huésped' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                    <button className="facile-nav-link" onClick={() => setActiveTab('pms')} style={{ background: '#0f172a', color: '#fff', borderRadius: '20px', padding: '0.35rem 0.85rem' }}>
                      🏢 Ir a Panel PMS ({usuarioSesion.rol})
                    </button>
                  </div>
                ) : selectedHuesped ? (
                  <div className="guest-profile-container">
                    <button
                      className="btn-airbnb-user active-guest-pill"
                      onClick={() => setShowGuestMenuDropdown(!showGuestMenuDropdown)}
                      title="Menú de Perfil de Huésped"
                    >
                      <Menu size={16} />
                      <div style={{ width: '26px', height: '26px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={15} color="#e11d48"/>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                        {selectedHuesped.nombre ? selectedHuesped.nombre.split(' ')[0] : 'Huésped'}
                      </span>
                    </button>

                    {showGuestMenuDropdown && (
                      <div className="guest-dropdown-menu" onClick={() => setShowGuestMenuDropdown(false)}>
                        <div style={{ padding: '0.8rem 1.1rem', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                            {selectedHuesped.nombre}
                          </p>
                          <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                            {selectedHuesped.correo}
                          </p>
                        </div>
                        <button className="guest-dropdown-item" onClick={() => { setActiveTab('perfil'); setShowGuestMenuDropdown(false); }}>
                          <User size={16} color="#0f172a" /> Mi Perfil
                        </button>
                        <button className="guest-dropdown-item" onClick={() => { setActiveTab('viajes'); setShowGuestMenuDropdown(false); }}>
                          <Luggage size={16} color="#0f172a" /> Viajes / Mis Reservas
                        </button>
                        <button className="guest-dropdown-item" onClick={() => { setActiveTab('reservar'); setShowGuestMenuDropdown(false); }}>
                          <Calendar size={16} color="#0f172a" /> Reservar Apartamento
                        </button>
                        <div className="guest-dropdown-divider"></div>
                        <button className="guest-dropdown-item" onClick={() => { setShowCommunityCommitmentModal(true); setShowGuestMenuDropdown(false); }}>
                          <Heart size={16} color="#e11d48" /> Compromiso de la Comunidad
                        </button>
                        <button
                          className="guest-dropdown-item"
                          onClick={() => { setModalLegalTipo('ley1581'); setShowGuestMenuDropdown(false); }}
                        >
                          <ShieldCheck size={16} color="#2563eb" /> Privacidad Colombia (Ley 1581)
                        </button>
                        <div className="guest-dropdown-divider"></div>
                        <button
                          className="guest-dropdown-item"
                          style={{ color: '#dc2626' }}
                          onClick={() => {
                            setSelectedHuesped(null);
                            setGuestRegJustCreated(false);
                            setShowGuestMenuDropdown(false);
                            setAlert({ type: 'success', message: 'Sesión de huésped cerrada.' });
                          }}
                        >
                          <LogOut size={16} color="#dc2626" /> Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="btn-airbnb-user"
                    onClick={() => setShowGuestAuthModal(true)}
                    title="Inicia sesión o regístrate como Huésped"
                    aria-label="Inicia sesión o regístrate como Huésped"
                  >
                    <Menu size={16}/>
                    <User size={18}/>
                  </button>
                )}
              </nav>
            </div>
          </header>
        </>
      )
  );
};

export default Encabezados;
