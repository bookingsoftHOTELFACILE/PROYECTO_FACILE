import React from 'react';
import { MessageSquare, Phone, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function Footer() {
  const { activeTab, setActiveTab, setShowLoginModal } = useApp();

  if (activeTab === 'pms') {
    return (
      <footer style={{ marginTop: 'auto', background: '#0f172a', color: '#64748b', borderTop: '1px solid #1e293b', padding: '1.2rem 1.5rem', textAlign: 'center', fontSize: '0.78rem' }}>
        <p style={{ margin: 0 }}>
          <strong>BookingSoft PMS v2.0</strong> — Sistema de Control Hotelero Interno | Apartamentos Facile — ADSO 2026
        </p>
      </footer>
    );
  }

  return (
    <>
      {/* 1. MÓDULO CONVENIOS CORPORATIVOS B2B (EXCLUSIVO DE LA PESTAÑA INICIO) */}
      {activeTab === 'inicio' && (
        <section style={{ padding: '20px 24px 60px' }}>
          <div className="facile-container">
            <div style={{
              backgroundColor: '#090e1a',
              borderRadius: '24px',
              padding: '48px 56px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-card)',
              flexWrap: 'wrap',
              gap: '24px'
            }}>
              <div style={{ maxWidth: '640px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  ¿Estadía Empresarial o Mensual?
                </span>
                <h3 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', margin: '8px 0 12px' }}>
                  Convenios Corporativos y Larga Estadía
                </h3>
                <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                  Ofrecemos facturación electrónica directa, tarifas corporativas preferenciales y atención ejecutiva personalizada en Bogotá Chicó.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setActiveTab('reservar')}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: '700',
                    fontSize: '0.9375rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    boxShadow: '0 4px 14px rgba(217, 26, 42, 0.35)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
                >
                  Solicitar Cotización
                </button>
                <a
                  href="tel:+573153512085"
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    padding: '14px 24px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: '600',
                    fontSize: '0.9375rem',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  Llamar a Asesor
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. FOOTER CORPORATIVO OFICIAL CON LOGO BLANCO SOBRE OSCURO */}
      <footer style={{ backgroundColor: '#090e1a', color: '#94a3b8', paddingTop: '64px', borderTop: '1px solid #1e293b' }}>
        <div className="facile-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', paddingBottom: '48px', borderBottom: '1px solid #1e293b' }}>
            
            {/* Columna Marca con Logo Oficial */}
            <div>
              <div 
                style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', cursor: 'pointer' }}
                onClick={() => setActiveTab('inicio')}
                title="Apartamentos Facile — Ir a Inicio"
              >
                <img 
                  src="/images/logo-facile-oficial.png" 
                  alt="Apartamentos Facile" 
                  style={{ height: '46px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#64748b' }}>
                Hospedaje amoblado de alto perfil y centro de negocios en el exclusivo sector de El Chicó, Bogotá.
              </p>
            </div>

            {/* Ubicación Exclusiva */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' }}>Ubicación</h4>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.8, margin: 0 }}>
                <strong style={{ color: '#ffffff' }}>Bogotá:</strong> Calle 97 #21-62, El Chicó
              </p>
            </div>

            {/* Categorías */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' }}>Categorías</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <span onClick={() => setActiveTab('apartamentos')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Suites Dúplex</span>
                <span onClick={() => setActiveTab('apartamentos')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Suites Dobles Ejecutivas</span>
                <span onClick={() => setActiveTab('apartamentos')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Apartamentos Familiares</span>
                <span onClick={() => setActiveTab('apartamentos')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Habitaciones Corporativas</span>
              </div>
            </div>

            {/* Contacto Directo */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' }}>Contacto Directo</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <span>📞 +57 315 3512085</span>
                <span>✉️ reservas@facileapartamentos.com</span>
                <div style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: '#131d31', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>RNT Vigente Certificado</span>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
                    title="Acceso exclusivo al sistema interno PMS"
                  >
                    🔒 Acceso PMS
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#475569', flexWrap: 'wrap', gap: '12px' }}>
            <span>© 2026 Apartamentos Facile. Todos los derechos reservados.</span>
            <span>Diseñado para la máxima comodidad en estadías corporativas y turísticas en El Chicó, Bogotá.</span>
          </div>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE WHATSAPP FIJO GLOBAL */}
      <a
        href="https://wa.me/573153512085"
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#10b981',
          color: '#ffffff',
          borderRadius: 'var(--radius-pill)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '0.875rem',
          zIndex: 100,
          transition: 'transform 0.2s ease'
        }}
      >
        <span>¿En qué podemos servirle?</span>
        <MessageSquare size={18} />
      </a>
    </>
  );
}
