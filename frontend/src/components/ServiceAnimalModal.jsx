/*
  ServiceAnimalModal — componente original de App.jsx, extraído en la Fase A.
*/
import { useState } from 'react';

// COMPONENTE MODAL DE POLÍTICA DE ANIMALES DE SERVICIO Y ACCESIBILIDAD UNIVERSAL (FACILE BOGOTÁ)
const ServiceAnimalModal = ({ isOpen, onClose }) => {
  const [showFullPolicy, setShowFullPolicy] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(7px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: showFullPolicy ? '680px' : '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÓN CERRAR SUPERIOR */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.65)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(4px)'
          }}
          title="Cerrar política"
        >
          ✕
        </button>

        {/* ILUSTRACIÓN DE ANIMALES DE SERVICIO */}
        <div style={{ width: '100%', height: showFullPolicy ? '180px' : '230px', overflow: 'hidden', background: '#f8fafc', position: 'relative', transition: 'height 0.3s ease' }}>
          <img
            src="/images/service_animal.png"
            alt="Ilustración Animales de Servicio Apartamentos Facile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* CONTENIDO PRINCIPAL / VISTA RESUMEN VS COMPLETA */}
        <div style={{ padding: '1.4rem 1.6rem 1.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', color: '#e11d48', textTransform: 'uppercase', background: '#ffe4e6', padding: '0.25rem 0.65rem', borderRadius: '12px' }}>
              Accesibilidad Inclusiva BookingSoft
            </span>

            {showFullPolicy && (
              <button
                type="button"
                onClick={() => setShowFullPolicy(false)}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                ◀ Volver al resumen
              </button>
            )}
          </div>

          {!showFullPolicy ? (
            /* VISTA PRINCIPAL CORTA ESTILO AIRBNB CON ENLACE A POLÍTICA COMPLETA */
            <>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.6rem', lineHeight: 1.25 }}>
                Animales de servicio
              </h3>

              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, margin: '0 0 1rem' }}>
                Los animales de servicio no se consideran mascotas, así que <strong>no hace falta que los agregues aquí ni pagues suplementos adicionales.</strong>
              </p>

              <div style={{ background: '#f8fafc', borderLeft: '4px solid #e11d48', padding: '0.9rem 1.1rem', borderRadius: '10px', marginBottom: '1.2rem' }}>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                  🐕 <strong>Perros Guía & Asistencia:</strong> Tienen acceso libre a todas las instalaciones y suites de Apartamentos Facile Bogotá.
                  <br/><br/>
                  ❤️ <strong>¿Viajas con un animal de apoyo emocional?</strong> Consulta nuestra{' '}
                  <button
                    type="button"
                    onClick={() => setShowFullPolicy(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#0f172a',
                      fontWeight: 800,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '0.86rem'
                    }}
                  >
                    política de accesibilidad completa
                  </button>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowFullPolicy(true)}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  📖 Leer Política Completa
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
                  }}
                >
                  Entendido
                </button>
              </div>
            </>
          ) : (
            /* DOCUMENTO DETALLADO DE POLÍTICA DE ACCESIBILIDAD INSTITUCIONAL FACILE BOGOTÁ */
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0 0.8rem', lineHeight: 1.25 }}>
                Política Oficial de Accesibilidad e Inclusión Universal
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.55 }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.4rem', color: '#0f172a', fontSize: '0.95rem', fontWeight: 800 }}>
                    1. Definición y Exención de Tarifas
                  </h4>
                  <p style={{ margin: 0 }}>
                    En <strong>Apartamentos Facile Bogotá & BookingSoft</strong>, reconocemos los animales de servicio (perros guía, lazarillos y de asistencia médica) como un derecho fundamental de accesibilidad. Por esta razón:
                  </p>
                  <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
                    <li>No se aplican cargos suplementarios de limpieza ni tarifas adicionales por mascota.</li>
                    <li>No cuentan dentro del límite estándar de mascotas del formulario de reserva.</li>
                  </ul>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.4rem', color: '#0f172a', fontSize: '0.95rem', fontWeight: 800 }}>
                    2. Acceso Garantizado a Instalaciones
                  </h4>
                  <p style={{ margin: 0 }}>
                    Los animales de servicio tienen libre tránsito e ingreso autorizado a todas las áreas públicas y privadas del complejo, incluyendo:
                  </p>
                  <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
                    <li>Recepción y lobby principal.</li>
                    <li>Ascensores y pasillos de acceso a suites.</li>
                    <li>Interior amoblado de los apartamentos reservables.</li>
                  </ul>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.4rem', color: '#0f172a', fontSize: '0.95rem', fontWeight: 800 }}>
                    3. Animales de Apoyo Emocional & Salud
                  </h4>
                  <p style={{ margin: 0 }}>
                    Si tu acompañante es un animal de soporte o apoyo emocional, solicitamos notificarlo previamente a recepción o mediante las notas de reserva para coordinar la preparación adecuada de tu suite y ofrecerte la mejor experiencia.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.4rem', color: '#0f172a', fontSize: '0.95rem', fontWeight: 800 }}>
                    4. Convivencia Responsable & Normas
                  </h4>
                  <p style={{ margin: 0 }}>
                    El animal debe estar bajo el control y supervisión permanente de su titular (con correa, arnés o comandos de voz). El huésped responderá únicamente por daños materiales directos ocasionados a la propiedad bajo la tarifa estándar de reparación sin penalizaciones adicionales.
                  </p>
                </div>

                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px', border: '1px solid #bfdbfe', color: '#1e40af' }}>
                  <strong>💬 ¿Requieres asistencia especial de accesibilidad?</strong>
                  <br/>
                  Nuestro equipo de recepción 24/7 en Apartamentos Facile Bogotá está disponible para ayudarte. Escríbenos directamente al WhatsApp oficial o contáctanos en recepción al realizar tu check-in.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFullPolicy(false)}
                style={{
                  marginTop: '1.2rem',
                  width: '100%',
                  padding: '0.85rem',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                ◀ Volver
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceAnimalModal;
