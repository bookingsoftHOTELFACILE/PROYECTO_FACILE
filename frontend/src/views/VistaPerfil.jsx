import {
  ShieldCheck, Mail, Phone, FileText, Briefcase, Calendar,
  User, CheckCircle2, Sparkles, Clock, Camera, Heart,
  GraduationCap, Globe, BookOpen, Music, Languages, Luggage,
  Award, Smile
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const VistaPerfil = () => {
  const {
  setActiveTab, selectedHuesped, setSelectedHuesped, guestProfileExtras,
  setGuestProfileExtras, guestAvatarUrl, setGuestAvatarUrl, profileSavedMsg,
  setProfileSavedMsg, setAlert, setShowGuestAuthModal, setShowCommunityCommitmentModal
  } = useApp();
  return (
        <section className="facile-section" style={{ paddingTop: '1.5rem' }}>
          {selectedHuesped ? (
            <div className="airbnb-profile-container">
              {profileSavedMsg && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.8rem 1.2rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span>¡Tu perfil se ha actualizado correctamente! Los cambios son visibles para la comunidad.</span>
                  </div>
                  <button onClick={() => setProfileSavedMsg(false)} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                </div>
              )}

              <div className="airbnb-profile-grid">
                {/* COLUMNA IZQUIERDA: TARJETA DE PERFIL Y FOTO */}
                <div className="airbnb-profile-card">
                  <div className="airbnb-avatar-wrapper">
                    <div className="airbnb-avatar-circle">
                      {guestAvatarUrl ? (
                        <img src={guestAvatarUrl} alt={selectedHuesped.nombre} className="airbnb-avatar-img" />
                      ) : (
                        <span>{selectedHuesped.nombre ? selectedHuesped.nombre.charAt(0).toUpperCase() : 'H'}</span>
                      )}
                    </div>
                    <label className="airbnb-avatar-badge-btn" title="Subir o cambiar fotografía">
                      <Camera size={14} color="#0f172a" />
                      <span>Agrega</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              const b64 = reader.result;
                              setGuestAvatarUrl(b64);
                              try { localStorage.setItem('bookingsoft_guest_avatar', b64); } catch {}
                              setProfileSavedMsg(true);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedHuesped.nombre}
                  </h2>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '1.2rem' }}>
                    <ShieldCheck size={14} color="#059669" /> Huésped Verificado • {selectedHuesped.lealtad || 'Silver'}
                  </div>

                  <div style={{ textAlign: 'left', borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={16} color="#94a3b8" />
                      <span><strong>Documento:</strong> {selectedHuesped.documento}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Mail size={16} color="#94a3b8" />
                      <span style={{ wordBreak: 'break-all' }}><strong>Correo:</strong> {selectedHuesped.correo}</span>
                    </div>
                    {selectedHuesped.telefono && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Phone size={16} color="#94a3b8" />
                        <span><strong>Teléfono:</strong> {selectedHuesped.telefono}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Calendar size={16} color="#94a3b8" />
                      <span><strong>Miembro desde:</strong> 2026</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <button
                      className="btn-airbnb-black"
                      style={{ width: '100%', padding: '0.7rem' }}
                      onClick={() => setActiveTab('viajes')}
                    >
                      <Luggage size={16} /> Ver Mis Reservas / Viajes
                    </button>
                    <button
                      style={{ background: 'none', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedHuesped(null);
                        setActiveTab('inicio');
                        setAlert({ type: 'info', message: 'Sesión cerrada.' });
                      }}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>

                {/* COLUMNA DERECHA: SECCIÓN MI PERFIL ESTILO AIRBNB */}
                <div className="airbnb-profile-title-col">
                  <h1>Mi perfil</h1>
                  <p className="airbnb-profile-sub">
                    Los anfitriones y huéspedes pueden ver tu perfil y es posible que aparezca en Apartamentos Facile para ayudarnos a fomentar la confianza en nuestra comunidad.{' '}
                    <span 
                      style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={() => setShowCommunityCommitmentModal(true)}
                    >
                      Más información
                    </span>
                  </p>

                  <div className="airbnb-questions-grid">
                    {/* Dónde estudié */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <GraduationCap size={19} color="#475569" />
                        <span>Dónde estudié</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="Escribe tu universidad o institución..."
                        value={guestProfileExtras.estudie || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, estudie: e.target.value }))}
                      />
                    </div>

                    {/* A qué me dedico */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <Briefcase size={19} color="#475569" />
                        <span>A qué me dedico</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="Tu profesión u ocupación..."
                        value={guestProfileExtras.dedico || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, dedico: e.target.value }))}
                      />
                    </div>

                    {/* A dónde siempre quise ir */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <Globe size={19} color="#475569" />
                        <span>A dónde siempre quise ir</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="Destino soñado..."
                        value={guestProfileExtras.destino || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, destino: e.target.value }))}
                      />
                    </div>

                    {/* Mascotas */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <Heart size={19} color="#475569" />
                        <span>Mascotas</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="¿Tienes perros, gatos u otras mascotas?..."
                        value={guestProfileExtras.mascotas || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, mascotas: e.target.value }))}
                      />
                    </div>

                    {/* Década en la que nací */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <Sparkles size={19} color="#475569" />
                        <span>Década en la que nací</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="Ej: Años 90, Años 80..."
                        value={guestProfileExtras.decada || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, decada: e.target.value }))}
                      />
                    </div>

                    {/* A qué dedico demasiado tiempo */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <Clock size={19} color="#475569" />
                        <span>A qué dedico demasiado tiempo</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="Tus pasatiempos o aficiones..."
                        value={guestProfileExtras.tiempo || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, tiempo: e.target.value }))}
                      />
                    </div>

                    {/* Mi canción favorita en la secundaria */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <Music size={19} color="#475569" />
                        <span>Mi canción favorita en la secundaria</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="Canción o banda favorita..."
                        value={guestProfileExtras.cancion || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, cancion: e.target.value }))}
                      />
                    </div>

                    {/* Mi habilidad menos útil */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <Smile size={19} color="#475569" />
                        <span>Mi habilidad menos útil</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="Ej: Hacer trucos de magia sencillos..."
                        value={guestProfileExtras.habilidad || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, habilidad: e.target.value }))}
                      />
                    </div>

                    {/* Dato curioso sobre mí */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <Award size={19} color="#475569" />
                        <span>Dato curioso sobre mí</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="Un dato divertido o anecdótico..."
                        value={guestProfileExtras.dato_curioso || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, dato_curioso: e.target.value }))}
                      />
                    </div>

                    {/* Amo */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <Heart size={19} color="#e11d48" />
                        <span>Amo</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="Qué cosas te apasionan en la vida..."
                        value={guestProfileExtras.amo || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, amo: e.target.value }))}
                      />
                    </div>

                    {/* El título de mi biografía sería */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <BookOpen size={19} color="#475569" />
                        <span>El título de mi biografía sería</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="Una frase que te resuma..."
                        value={guestProfileExtras.biografia || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, biografia: e.target.value }))}
                      />
                    </div>

                    {/* Idiomas que hablo */}
                    <div className="airbnb-question-card">
                      <div className="airbnb-question-label">
                        <Languages size={19} color="#475569" />
                        <span>Idiomas que hablo</span>
                      </div>
                      <input 
                        type="text" 
                        className="airbnb-question-input"
                        placeholder="Ej: Español, Inglés, Francés..."
                        value={guestProfileExtras.idiomas || ''}
                        onChange={(e) => setGuestProfileExtras(prev => ({ ...prev, idiomas: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      className="airbnb-btn-done"
                      onClick={() => {
                        try {
                          localStorage.setItem('bookingsoft_guest_profile_extras', JSON.stringify(guestProfileExtras));
                        } catch {}
                        setProfileSavedMsg(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Listo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <User size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3>Inicia sesión para ver tu perfil</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Debes identificarte como huésped para consultar o editar tu perfil público.</p>
              <button className="btn-airbnb-primary" onClick={() => setShowGuestAuthModal(true)}>
                Iniciar sesión o registrarme
              </button>
            </div>
          )}
        </section>
  );
};

export default VistaPerfil;
