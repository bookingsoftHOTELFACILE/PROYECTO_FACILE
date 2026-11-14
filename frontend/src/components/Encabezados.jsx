import React from 'react';
import { 
  Phone, Facebook, Instagram, Youtube, Calendar, User, 
  LogOut, Luggage, MapPin, Settings, Bell, Building2, Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Encabezados() {
  const { 
    activeTab, setActiveTab, selectedHuesped, setShowGuestAuthModal, 
    setGuestAuthTab, showGuestMenuDropdown, setShowGuestMenuDropdown, 
    handleLogout, handleGuestLogout, usuarioSesion
  } = useApp();

  const navLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'apartamentos', label: 'Apartamentos' },
    { id: 'centro_negocios_pub', label: 'Centro de Negocios' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'galeria', label: 'Galería' }
  ];

  if (activeTab === 'pms') {
    return (
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
    );
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#ffffff', borderBottom: '1px solid var(--color-border)' }}>
      {/* 1. Top Bar sutil oscuro */}
      <div style={{ backgroundColor: '#090e1a', color: '#94a3b8', fontSize: '0.8rem', padding: '6px 0' }}>
        <div className="facile-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>📍 Calle 97 #21-62, El Chicó, Bogotá</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="tel:+573153512085" style={{ color: '#e2e8f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={13} color="var(--color-primary)" />
              <span style={{ fontWeight: '600' }}>+57 315 351 2085</span>
            </a>
            <div style={{ display: 'flex', gap: '10px', marginLeft: '12px' }}>
              <Facebook size={14} style={{ cursor: 'pointer', color: '#94a3b8' }} />
              <Instagram size={14} style={{ cursor: 'pointer', color: '#94a3b8' }} />
              <Youtube size={14} style={{ cursor: 'pointer', color: '#94a3b8' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Navegación Principal Blanca */}
      <div style={{ backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
        <div className="facile-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '76px' }}>
          {/* Logo Oficial Real Facile Bicolor: "Facile" en Rojo y "APARTAMENTOS" en Negro */}
          <div 
            onClick={() => setActiveTab('inicio')}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            title="Apartamentos Facile — El Chicó, Bogotá"
          >
            <img 
              src="/images/logo-facile-bicolor.png" 
              alt="Apartamentos Facile" 
              style={{ height: '52px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Enlaces de Navegación */}
          <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {navLinks.map((item) => {
              const isActive = activeTab === item.id || (item.id === 'apartamentos' && activeTab === 'catalogo') || (item.id === 'centro_negocios_pub' && activeTab === 'negocios');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                    padding: '8px 12px',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.9375rem',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Acciones Rápidas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Menú de Huésped / Login */}
            {selectedHuesped ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowGuestMenuDropdown(prev => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '8px 14px',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    color: 'var(--color-text-main)',
                    cursor: 'pointer'
                  }}
                >
                  <User size={15} color="var(--color-primary)" />
                  <span>{selectedHuesped.nombre ? selectedHuesped.nombre.split(' ')[0] : 'Huésped'}</span>
                </button>
                {showGuestMenuDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                    border: '1px solid var(--color-border)',
                    padding: '8px',
                    minWidth: '220px',
                    zIndex: 100
                  }}>
                    <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{selectedHuesped.nombre}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', wordBreak: 'break-all' }}>{selectedHuesped.correo}</div>
                    </div>

                    <button 
                      onClick={() => { setActiveTab('viajes'); setShowGuestMenuDropdown(false); }} 
                      style={{ width: '100%', padding: '9px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
                    >
                      <Luggage size={15} color="#d91a2a" /> Mis Reservas / Viajes
                    </button>
                    <button 
                      onClick={() => { setActiveTab('perfil'); setShowGuestMenuDropdown(false); }} 
                      style={{ width: '100%', padding: '9px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
                    >
                      <Settings size={15} color="#475569" /> Configuración de la Cuenta
                    </button>
                    <button 
                      onClick={() => { setActiveTab('perfil'); setShowGuestMenuDropdown(false); }} 
                      style={{ width: '100%', padding: '9px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
                    >
                      <Building2 size={15} color="#475569" /> Facturación Corporativa DIAN
                    </button>
                    <button 
                      onClick={() => { setActiveTab('perfil'); setShowGuestMenuDropdown(false); }} 
                      style={{ width: '100%', padding: '9px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
                    >
                      <Globe size={15} color="#475569" /> Extranjeros (Exención IVA)
                    </button>

                    <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                    <button 
                      onClick={() => { handleGuestLogout(); setShowGuestMenuDropdown(false); }} 
                      style={{ width: '100%', padding: '9px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
                    >
                      <LogOut size={15} /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setGuestAuthTab('login'); setShowGuestAuthModal(true); }}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-main)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '8px 14px',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Iniciar Sesión o Registrarse"
              >
                <User size={15} />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
