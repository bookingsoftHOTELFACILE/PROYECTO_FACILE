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

  const getInitials = (nombre) => {
    if (!nombre) return 'AD';
    const parts = nombre.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nombre.slice(0, 2).toUpperCase();
  };

  if (activeTab === 'pms') {
    const initials = getInitials(usuarioSesion?.nombre);
    return (
      <header style={{ backgroundColor: '#090e1a', borderBottom: '1px solid #1e293b', color: '#ffffff', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
        <div style={{ width: '100%', maxWidth: '1720px', margin: '0 auto', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          {/* LADO IZQUIERDO: LOGO FACILE PMS + SERVIDOR BADGE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div 
              onClick={() => setActiveTab('pms')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#d91a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0, boxShadow: '0 2px 8px rgba(217,26,42,0.35)' }}>
                <Building2 size={20} color="#ffffff" />
              </div>
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 900, color: '#ffffff', fontSize: '1rem', letterSpacing: '-0.3px' }}>FACILE</span>
                  <span style={{ color: '#f87171', fontWeight: 800, fontSize: '0.78rem' }}>PMS V4.8</span>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, display: 'block', marginTop: '2px' }}>
                  Apartamentos & Suites de Lujo
                </span>
              </div>
            </div>

            {/* STATUS BADGE CENTRAL */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
              <span>Servidor Central: <strong style={{ color: '#34d399', fontWeight: 800 }}>Activo</strong></span>
              <span style={{ color: '#475569' }}>•</span>
              <span>Latencia: 24ms</span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontWeight: 700 }}>Terminal: REC-01-MED</span>
            </div>
          </div>

          {/* LADO DERECHO: USUARIO + TURNO + AVATAR + SALIR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>
                {usuarioSesion?.nombre || 'Administrador Grupo BookingSoft'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>
                Turno Dia • Recepción Central
              </div>
            </div>

            <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>
              {initials}
            </div>

            <button
              onClick={() => setActiveTab('inicio')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', backgroundColor: '#1e293b', border: '1px solid #334155', cursor: 'pointer', transition: 'all 0.2s ease' }}
              title="Ir al sitio web comercial de huéspedes"
            >
              <Globe size={13} color="#94a3b8" />
              <span>Ver Web</span>
            </button>

            <button
              onClick={handleLogout}
              style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}
              title="Cerrar Sesión"
            >
              <LogOut size={14} />
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
