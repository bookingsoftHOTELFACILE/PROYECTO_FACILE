import React, { useState } from 'react';
import {
  Briefcase, Calendar, CheckCircle2, MapPin, ArrowRight, Check,
  Luggage, X, ShieldCheck, Clock, Key, CreditCard, Building
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const FOTOS_APTO = [
  '/images/apartamentos/IMG_9408-HDR.jpg',
  '/images/apartamentos/IMG_9411-HDR.jpg',
  '/images/apartamentos/IMG_9417-HDR.jpg',
  '/images/apartamentos/IMG_9420-HDR.jpg',
  '/images/apartamentos/IMG_9423-HDR.jpg',
  '/images/apartamentos/IMG_9426-HDR.jpg',
  '/images/apartamentos/IMG_9438-HDR.jpg',
  '/images/apartamentos/IMG_9459-HDR.jpg',
];

const VistaViajes = () => {
  const {
    reservas, reservasNegocio, setActiveTab, selectedHuesped,
    setShowGuestAuthModal, handleCancelarReservaNegocio
  } = useApp();

  const [reservaModal, setReservaModal] = useState(null);
  return (
        <section className="facile-section" style={{ paddingTop: '1.5rem' }}>
          {selectedHuesped ? (() => {
            const misReservas = reservas.filter(r => 
              String(r.id_huesped) === String(selectedHuesped.id_huesped) || 
              (selectedHuesped.documento && String(r.huesped_documento) === String(selectedHuesped.documento))
            );
            const misReservasCoworking = reservasNegocio.filter(rn => 
              (selectedHuesped.id_huesped && String(rn.id_huesped) === String(selectedHuesped.id_huesped)) || 
              (selectedHuesped.documento && String(rn.documento_cliente) === String(selectedHuesped.documento))
            );

            return (
              <div className="airbnb-profile-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
                      Viajes y Reservas de Apartamento
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                      Gestiona tus estadías en Apartamentos Facile, consulta fechas de check-in y confirma nuevas noches.
                    </p>
                  </div>
                  <button 
                    className="btn-airbnb-primary"
                    style={{ margin: 0, padding: '0.75rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => setActiveTab('reservar')}
                  >
                    <Calendar size={18} /> Reservar otro apartamento
                  </button>
                </div>

                {misReservas.length > 0 ? (
                  <div className="airbnb-trips-grid">
                    {misReservas.map(res => {
                      return (
                        <div key={res.id_reserva} className="airbnb-trip-card">
                          <div style={{ height: '180px', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                            <img 
                              src={FOTOS_APTO[res.id_reserva % FOTOS_APTO.length]} 
                              alt={`Apto ${res.habitacion_numero}`}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/apartamentos/IMG_9408-HDR.jpg';
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {res.estado}
                            </div>
                          </div>
                          <div style={{ padding: '1.4rem' }}>
                            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                              Apartamento {res.habitacion_numero} — {res.habitacion_tipo}
                            </h3>
                            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <MapPin size={15} color="#e11d48" /> Calle 97 #21-62, Chicó / Bogotá D.C.
                            </p>

                            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                              <div>
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Llegada (Check-in)</span>
                                <strong style={{ color: '#0f172a' }}>{res.fecha_entrada}</strong>
                              </div>
                              <ArrowRight size={16} color="#94a3b8" />
                              <div>
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Salida (Check-out)</span>
                                <strong style={{ color: '#0f172a' }}>{res.fecha_salida}</strong>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <CheckCircle2 size={15} /> Reserva Confirmada
                              </span>
                              <button 
                                className="btn-mini"
                                onClick={() => setReservaModal(res)}
                              >
                                Ver Detalle
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '70px', height: '70px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
                      <Luggage size={32} color="#e11d48" />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                      Aún no tienes ningún apartamento reservado
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1.8rem' }}>
                      Es hora de preparar tus maletas. Explora nuestros 38 apartamentos con cocina equipada, WiFi de alta velocidad y servicios ejecutivos.
                    </p>
                    <button 
                      className="btn-airbnb-primary" 
                      style={{ margin: 0, padding: '0.85rem 2rem' }}
                      onClick={() => setActiveTab('reservar')}
                    >
                      Explorar Apartamentos y Reservar
                    </button>
                  </div>
                )}

                {misReservasCoworking.length > 0 && (
                  <div style={{ marginTop: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                      <Briefcase size={22} color="#e11d48" />
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Reservas en Centro de Negocios & Coworking ({misReservasCoworking.length})
                      </h2>
                    </div>
                    <div className="airbnb-trips-grid">
                      {misReservasCoworking.map(rn => (
                        <div key={rn.id_reserva_negocio} className="airbnb-trip-card" style={{ border: '1px solid #cbd5e1' }}>
                          <div style={{ background: '#f8fafc', padding: '1.2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', padding: '0.25rem 0.6rem', borderRadius: '12px' }}>
                                {rn.tipo_espacio}
                              </span>
                              <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                                {rn.espacio}
                              </h3>
                            </div>
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {rn.estado}
                            </span>
                          </div>
                          <div style={{ padding: '1.2rem' }}>
                            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                              <div style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Calendar size={14} color="#64748b" /> Fecha: <strong>{rn.fecha}</strong>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Clock size={14} color="#64748b" /> Horario: <strong>{rn.hora_inicio} a {rn.hora_fin} ({rn.duracion_horas}h)</strong>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Total Liquidado</span>
                                <strong style={{ fontSize: '1.05rem', color: '#e11d48' }}>${Number(rn.precio_total).toLocaleString('es-CO')} COP</strong>
                              </div>
                              <button
                                className="btn-mini"
                                style={{ color: '#ef4444', fontWeight: 700, border: '1px solid #fca5a5' }}
                                onClick={() => handleCancelarReservaNegocio(rn.id_reserva_negocio)}
                              >
                                Cancelar Reserva
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })() : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <Luggage size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3>Inicia sesión para ver tus viajes</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Identifícate como huésped para consultar tus reservas activas.</p>
              <button className="btn-airbnb-primary" onClick={() => setShowGuestAuthModal(true)}>
                Iniciar sesión o registrarme
              </button>
            </div>
          )}

          {/* Modal Detalle de Reserva */}
          {reservaModal && (
            <div
              onClick={() => setReservaModal(null)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                zIndex: 9999,
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  width: '100%',
                  maxWidth: '520px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* Cabecera modal */}
                <div style={{ padding: '1.25rem 1.5rem', background: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>
                      Detalle de Reserva
                    </span>
                    <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.2rem', fontWeight: 800 }}>
                      Apartamento {reservaModal.habitacion_numero} • Folio #{reservaModal.id_reserva}
                    </h3>
                  </div>
                  <button
                    onClick={() => setReservaModal(null)}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Contenido modal */}
                <div style={{ padding: '1.5rem' }}>
                  {/* Banner estado */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Estado de la estadía</span>
                    <span style={{ background: '#0f172a', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 800 }}>
                      {reservaModal.estado}
                    </span>
                  </div>

                  {/* Acceso cerradura inteligente Yale Lock si aplica */}
                  {(reservaModal.pin_cerradura || reservaModal.estado === 'Check-In') && (
                    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '14px', padding: '1.1rem', color: '#ffffff', marginBottom: '1.25rem', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <Key size={16} color="#38bdf8" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38bdf8' }}>
                          Cerradura Inteligente Yale (IoT)
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Código PIN asignado:</span>
                        <strong style={{ fontSize: '1.3rem', letterSpacing: '0.15em', color: '#ffffff', fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                          {reservaModal.pin_cerradura || '482910 #'}
                        </strong>
                      </div>
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                        Digita el PIN seguido de la tecla numeral (#) en la cerradura electrónica para ingresar de forma autónoma.
                      </p>
                    </div>
                  )}

                  {/* Datos del Alojamiento */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Tipo de Unidad</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{reservaModal.habitacion_tipo || 'Apartamento'}</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Titular</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{selectedHuesped?.nombre || reservaModal.huesped_nombre || 'Huésped Titular'}</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Fecha Check-In</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{reservaModal.fecha_entrada}</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Fecha Check-Out</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{reservaModal.fecha_salida}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                    <MapPin size={14} color="#e11d48" /> Calle 97 #21-62, Chicó / Bogotá D.C., Colombia
                  </div>

                  {/* Acciones */}
                  <button
                    onClick={() => setReservaModal(null)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '12px',
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    Entendido / Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
  );
};

export default VistaViajes;
