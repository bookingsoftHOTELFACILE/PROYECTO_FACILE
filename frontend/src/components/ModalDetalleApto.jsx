import React from 'react';
import { 
  Maximize2, X, Users, Bed, Bath, Wifi, Calendar, CheckCircle2, 
  MessageCircle, ShieldCheck, Clock, MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import FigmaBookingBox from './FigmaBookingBox';

export default function ModalDetalleApto() {
  const {
    selectedAptoFigma, setSelectedAptoFigma, aptoActivePhoto, 
    setAptoActivePhoto, setAptoLightboxPhoto, reservas, 
    handleReservarTipo, setActiveTab
  } = useApp();

  if (!selectedAptoFigma) return null;

  const activePhotoIdx = aptoActivePhoto[selectedAptoFigma.tipo] || 0;
  const currentPhoto = selectedAptoFigma.fotos?.[activePhotoIdx] || selectedAptoFigma.fotos?.[0] || { url: selectedAptoFigma.imagen, titulo: selectedAptoFigma.titulo };

  return (
    <div 
      className="figma-modal-backdrop"
      onClick={() => setSelectedAptoFigma(null)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 14, 26, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <div 
        className="figma-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '1120px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={() => setSelectedAptoFigma(null)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            color: '#334155',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
          title="Cerrar detalle"
        >
          <X size={20} />
        </button>

        {/* Migas de pan / Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
          <span style={{ cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600 }} onClick={() => { setSelectedAptoFigma(null); setActiveTab('inicio'); }}>Inicio</span>
          <span>&gt;</span>
          <span style={{ cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600 }} onClick={() => { setSelectedAptoFigma(null); setActiveTab('apartamentos'); }}>Apartamentos</span>
          <span>&gt;</span>
          <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{selectedAptoFigma.nombreModal || selectedAptoFigma.titulo}</span>
        </div>

        {/* Grid Principal: Galería a la izquierda, Información y Caja de Disponibilidad a la derecha */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* COLUMNA IZQUIERDA: FOTOS REALES Y AMENIDADES */}
          <div>
            {/* Foto Principal con Apertura de Lightbox */}
            <div 
              style={{
                position: 'relative',
                height: '340px',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
              onClick={() => {
                if (selectedAptoFigma.fotos?.length) {
                  setAptoLightboxPhoto({ photos: selectedAptoFigma.fotos, index: activePhotoIdx });
                }
              }}
              title="Haz clic para ver en pantalla completa"
            >
              <img
                src={currentPhoto.url}
                alt={currentPhoto.titulo || selectedAptoFigma.titulo}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(9, 14, 26, 0.8)',
                backdropFilter: 'blur(4px)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Maximize2 size={13} />
                <span>Ver Pantalla Completa</span>
              </div>
            </div>

            {/* Miniaturas de Fotos Reales */}
            {selectedAptoFigma.fotos && selectedAptoFigma.fotos.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
                {selectedAptoFigma.fotos.map((f, i) => (
                  <div
                    key={i}
                    onClick={() => setAptoActivePhoto(prev => ({ ...prev, [selectedAptoFigma.tipo]: i }))}
                    style={{
                      width: '85px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0,
                      border: i === activePhotoIdx ? '2px solid var(--color-primary)' : '2px solid transparent',
                      opacity: i === activePhotoIdx ? 1 : 0.75,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={f.url} alt={f.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Resumen de Ubicación y Servicios Incluidos */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>
                <MapPin size={16} color="var(--color-primary)" />
                <span>Bogotá D.C. — Barrio El Chicó (Calle 97 #21-62)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wifi size={16} color="var(--color-primary)" />
                  <span>Wi-Fi Simétrico 300 Mbps</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="var(--color-success)" />
                  <span>Vigilancia y Portería 24/7</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#2563eb" />
                  <span>Check-in 3:00 PM • Check-out 11:00 AM</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--color-primary)" />
                  <span>Sin depósito ni contratos complejos</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: ESPECIFICACIONES Y CAJA DE DISPONIBILIDAD */}
          <div>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#fff1f2',
              color: 'var(--color-primary)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '10px'
            }}>
              {selectedAptoFigma.tipo} • Facile Chicó
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', lineHeight: 1.2 }}>
              {selectedAptoFigma.nombreModal || selectedAptoFigma.titulo}
            </h2>

            <p style={{ fontSize: '0.93rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              {selectedAptoFigma.desc}
            </p>

            {/* Badges de Capacidad y Ambientes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color="var(--color-primary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Capacidad</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{selectedAptoFigma.personas || selectedAptoFigma.capacidad}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bath size={18} color="var(--color-primary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Baños</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{selectedAptoFigma.numBanos || selectedAptoFigma.banos || '1 Baño'}</div>
                </div>
              </div>
            </div>

            {/* CAJA DE DISPONIBILIDAD Y COTIZACIÓN (FigmaBookingBox) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Tarifa por Noche</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{selectedAptoFigma.precio}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginLeft: '4px' }}>COP/noche</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700, backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: 'var(--radius-pill)' }}>
                  Disponibilidad Inmediata
                </span>
              </div>

              {/* Componente Interactivo de Fechas y Disponibilidad */}
              <FigmaBookingBox
                selectedApto={selectedAptoFigma}
                reservas={reservas}
                onReservar={(inDate, outDate) => {
                  setSelectedAptoFigma(null);
                  handleReservarTipo(selectedAptoFigma.tipo);
                }}
              />
            </div>

            {/* Asesor por WhatsApp */}
            <a
              href={`https://wa.me/573153512085?text=Hola,%20quisiera%20consultar%20disponibilidad%20para%20${encodeURIComponent(selectedAptoFigma.nombreModal || selectedAptoFigma.titulo)}%20en%20Facile%20Chicó`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid #10b981',
                color: '#065f46',
                backgroundColor: '#ecfdf5',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#d1fae5'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ecfdf5'; }}
            >
              <MessageCircle size={16} color="#10b981" />
              <span>Consultar este apartamento por WhatsApp</span>
            </a>

          </div>

        </div>
      </div>
    </div>
  );
}
