import { useState, useEffect } from 'react';
import {
  ShieldCheck, Mail, Phone, FileText, Calendar,
  Lock, User, CheckCircle2, Eye, EyeOff,
  KeyRound, ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const ModalGuestAuth = () => {
  const {
    setActiveTab, formData, habeasData,
    setHabeasData, selectedHuesped, setSelectedHuesped, loading,
    setAlert, setShowGuestAuthModal, guestAuthTab, setGuestAuthTab,
    guestSearchQuery, setGuestSearchQuery, guestLoginPassword, setGuestLoginPassword,
    showGuestPassword, setShowGuestPassword, guestSearchError, setGuestSearchError,
    setGuestRegJustCreated, guestRecuperarQuery, setGuestRecuperarQuery,
    guestRecuperarSuccess, setGuestRecuperarSuccess, guestNuevaPassword, setGuestNuevaPassword,
    nombreLegal, setNombreLegal, apellidoLegal, setApellidoLegal,
    fechaNacimiento, setFechaNacimiento, marketingOptOut, setMarketingOptOut,
    setModalLegalTipo, handleUserChange, handleUserSubmit, handleGuestSearchSubmit,
    handleGuestRecuperarSubmit, handleGuestRestablecerSubmit, handleSocialAuth
  } = useApp();

  const [socialProvider, setSocialProvider] = useState(null); // 'google' | 'apple' | null
  const [customSocialNombre, setCustomSocialNombre] = useState('');
  const [customSocialCorreo, setCustomSocialCorreo] = useState('');

  // Selector internacional de documento e indicativo telefónico
  const [docTipo, setDocTipo] = useState('PASAPORTE');
  const [docPaisEmisor, setDocPaisEmisor] = useState('CO');
  const [telIndicativo, setTelIndicativo] = useState('+57');

  // Purgar inmediatamente cualquier usuario demo residual (id 99 o 98)
  useEffect(() => {
    if (
      selectedHuesped?.id_huesped === 99 ||
      selectedHuesped?.id_huesped === 98 ||
      selectedHuesped?.nombre?.toLowerCase().includes('demo') ||
      selectedHuesped?.documento === 'GOOGLE-12345' ||
      selectedHuesped?.documento === 'APPLE-67890' ||
      selectedHuesped?.correo === 'huesped_google@ejemplo.com' ||
      selectedHuesped?.correo === 'huesped_apple@icloud.com'
    ) {
      setSelectedHuesped(null);
      localStorage.removeItem('bookingsoft_guest_user');
    }
  }, [selectedHuesped, setSelectedHuesped]);

  // Pre-llenar datos reales si el usuario ya escribió en el formulario
  useEffect(() => {
    if (socialProvider) {
      if (formData?.nombre && !customSocialNombre) {
        setCustomSocialNombre(formData.nombre);
      }
      if (formData?.correo && !customSocialCorreo) {
        setCustomSocialCorreo(formData.correo);
      } else if (guestSearchQuery && guestSearchQuery.includes('@') && !customSocialCorreo) {
        setCustomSocialCorreo(guestSearchQuery);
      }
    }
  }, [socialProvider, formData, guestSearchQuery]);

  const handleCustomSocialSubmit = async (e) => {
    e.preventDefault();
    if (!customSocialNombre.trim() || !customSocialCorreo.trim()) {
      setAlert({ type: 'error', message: 'Por favor ingrese su nombre y correo.' });
      return;
    }
    const res = await handleSocialAuth(socialProvider, {
      nombre: customSocialNombre.trim(),
      correo: customSocialCorreo.trim()
    });
    if (res?.ok) {
      setSocialProvider(null);
      setCustomSocialNombre('');
      setCustomSocialCorreo('');
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setShowGuestAuthModal(false)}>
      <div className={`modal-airbnb-dialog ${guestAuthTab === 'registro' ? 'modal-airbnb-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-airbnb-header">
          <button className="btn-x-close" onClick={() => setShowGuestAuthModal(false)}>✕</button>
          <h3 className="modal-airbnb-title">
            {socialProvider === 'google'
              ? 'Continuar con Google'
              : socialProvider === 'apple'
              ? 'Continuar con Apple ID'
              : guestAuthTab === 'registro'
              ? 'Crear cuenta nueva'
              : guestAuthTab === 'recuperar'
              ? 'Recuperar contraseña'
              : 'Inicia sesión o regístrate'}
          </h3>
        </div>

        <div className="modal-airbnb-body">
          {socialProvider ? (
            /* =========================================================================
               VISTA DE AUTENTICACIÓN SOCIAL (GOOGLE / APPLE)
               ========================================================================= */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setSocialProvider(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, padding: 0 }}
                >
                  <ArrowLeft size={16} /> Volver
                </button>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                  {socialProvider === 'google' ? 'Acceso con Google' : 'Acceso con Apple ID'}
                </span>
                <div style={{ width: '50px' }} />
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: socialProvider === 'apple' ? '#000000' : '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.5rem',
                  border: socialProvider === 'google' ? '1px solid #e2e8f0' : 'none'
                }}>
                  {socialProvider === 'google' ? (
                    <svg width="22" height="22" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.1-1.9 0.98-3.01-1 .04-2.18.67-2.88 1.49-.62.72-1.16 1.87-1.01 2.97 1.12.09 2.26-.66 2.91-1.45z"/>
                    </svg>
                  )}
                </div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  {socialProvider === 'google' ? 'Continuar con Google' : 'Continuar con Apple ID'}
                </h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Ingresa tus datos reales de {socialProvider === 'google' ? 'Google' : 'Apple'} para identificarte y sincronizar tus reservas.
                </p>
              </div>

              <form onSubmit={handleCustomSocialSubmit} style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '14px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Nombre y Apellidos:
                  </label>
                  <input
                    type="text"
                    className="input-airbnb"
                    placeholder="Tu nombre completo"
                    value={customSocialNombre}
                    onChange={(e) => setCustomSocialNombre(e.target.value)}
                    required
                    autoFocus
                    style={{ fontSize: '0.88rem', padding: '0.65rem 0.75rem', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '0.9rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Correo Electrónico ({socialProvider === 'google' ? 'Gmail / Google' : 'iCloud / Apple'}):
                  </label>
                  <input
                    type="email"
                    className="input-airbnb"
                    placeholder={socialProvider === 'apple' ? 'usuario@icloud.com' : 'usuario@gmail.com'}
                    value={customSocialCorreo}
                    onChange={(e) => setCustomSocialCorreo(e.target.value)}
                    required
                    style={{ fontSize: '0.88rem', padding: '0.65rem 0.75rem', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-airbnb-primary"
                  disabled={loading}
                  style={{ width: '100%', marginTop: 0, padding: '0.7rem', fontSize: '0.9rem', fontWeight: 700 }}
                >
                  {loading ? 'Conectando con base de datos...' : `Continuar con ${socialProvider === 'google' ? 'Google' : 'Apple ID'} →`}
                </button>
              </form>

              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', lineHeight: '1.4' }}>
                🔒 Conexión segura con PostgreSQL de BookingSoft. Tu perfil de huésped y reservas se guardarán con integridad referencial.
              </div>
            </div>
          ) : (
            /* =========================================================================
               VISTA PRINCIPAL: LOGIN / REGISTRO ESTILO AIRBNB
               ========================================================================= */
            <>
              <div style={{ textAlign: 'center', marginBottom: guestAuthTab === 'registro' ? '0.75rem' : '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.4rem' }}>
                  <User size={20} color="#d91a2a" />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                  {guestAuthTab === 'registro' ? 'Crear cuenta de Huésped' : 'Te damos la bienvenida a Facile'}
                </h4>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  {guestAuthTab === 'registro' 
                    ? 'Registro oficial para huéspedes nacionales y extranjeros' 
                    : 'Inicia sesión para reservar tu apartamento y acceder a tarifas oficiales'}
                </p>
              </div>

              {/* Indicador de sesión activa con opción de cerrar sesión */}
              {selectedHuesped && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.75rem 0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#166534', fontWeight: 700, fontSize: '0.84rem' }}>
                      <CheckCircle2 size={16} /> Sesión activa: {selectedHuesped.nombre}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{selectedHuesped.correo}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn-airbnb-primary"
                      style={{ marginTop: 0, padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      onClick={() => { setShowGuestAuthModal(false); setActiveTab('reservar'); }}
                    >
                      Ir a Reservar
                    </button>
                    <button
                      type="button"
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.35rem 0.65rem', fontSize: '0.76rem', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}
                      onClick={() => { setSelectedHuesped(null); setGuestRegJustCreated(false); }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}

              {/* CONTENIDO DE PESTAÑA: YA TENGO REGISTRO */}
              {guestAuthTab === 'login' ? (
                <form onSubmit={handleGuestSearchSubmit} style={{ marginTop: '1rem' }}>
                  <div className="form-field">
                    <label htmlFor="login-usuario" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                      Número de Documento o Correo Electrónico
                    </label>
                    <div className="field-input-wrap">
                      <FileText className="field-icon" size={16} />
                      <input
                        id="login-usuario"
                        type="text"
                        placeholder="Ej: 1017283944 o correo@ejemplo.com"
                        value={guestSearchQuery}
                        onChange={(e) => setGuestSearchQuery(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="form-field" style={{ marginTop: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label htmlFor="login-password" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', margin: 0 }}>
                        Contraseña
                      </label>
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                        onClick={() => {
                          setGuestRecuperarQuery(guestSearchQuery);
                          setGuestAuthTab('recuperar');
                          setGuestSearchError(null);
                          setGuestRecuperarSuccess(null);
                        }}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="field-input-wrap">
                      <Lock className="field-icon" size={16} />
                      <input
                        id="login-password"
                        type={showGuestPassword ? "text" : "password"}
                        placeholder="Ingrese su contraseña"
                        value={guestLoginPassword}
                        onChange={(e) => setGuestLoginPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowGuestPassword(!showGuestPassword)}
                        style={{ background: 'none', border: 'none', padding: '0 0.5rem', color: '#64748b', cursor: 'pointer' }}
                      >
                        {showGuestPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {guestSearchError && (
                    <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.68rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', margin: '0.8rem 0' }}>
                      ⚠️ {guestSearchError}
                    </div>
                  )}

                  <button type="submit" className="btn-airbnb-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                    {loading ? 'Verificando...' : 'Iniciar Sesión y Continuar'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => { setGuestAuthTab('registro'); setGuestSearchError(null); }}
                    >
                      ¿Es tu primera vez? Regístrate aquí
                    </button>
                  </div>
                </form>
              ) : guestAuthTab === 'recuperar' ? (
                /* CONTENIDO DE PESTAÑA: RECUPERAR CONTRASEÑA */
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                    <div style={{ width: '48px', height: '48px', background: '#fff1f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem' }}>
                      <KeyRound size={24} color="#e11d48" />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
                      Recuperar Contraseña
                    </h4>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: '1.4' }}>
                      Ingrese su número de documento o correo electrónico. Le enviaremos las instrucciones de restablecimiento.
                    </p>
                  </div>

                  {guestRecuperarSuccess ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', textAlign: 'center', marginBottom: '1rem' }}>
                      <p style={{ margin: '0 0 0.8rem', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                        {guestRecuperarSuccess}
                      </p>

                      <form onSubmit={handleGuestRestablecerSubmit} style={{ marginTop: '0.8rem', textAlign: 'left' }}>
                        <div className="form-field">
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                            Crear Nueva Contraseña
                          </label>
                          <div className="field-input-wrap">
                            <Lock className="field-icon" size={16} />
                            <input
                              type={showGuestPassword ? "text" : "password"}
                              placeholder="Ingrese su nueva contraseña"
                              value={guestNuevaPassword}
                              onChange={(e) => setGuestNuevaPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowGuestPassword(!showGuestPassword)}
                              style={{ background: 'none', border: 'none', padding: '0 0.5rem', color: '#64748b', cursor: 'pointer' }}
                            >
                              {showGuestPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        <button type="submit" className="btn-airbnb-primary" disabled={loading} style={{ marginTop: '0.8rem' }}>
                          {loading ? 'Actualizando...' : 'Restablecer e Iniciar Sesión →'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <form onSubmit={handleGuestRecuperarSubmit}>
                      <div className="form-field">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                          Documento o Correo Registrado
                        </label>
                        <div className="field-input-wrap">
                          <Mail className="field-icon" size={16} />
                          <input
                            type="text"
                            placeholder="Ej: 1017283944 o correo@ejemplo.com"
                            value={guestRecuperarQuery}
                            onChange={(e) => setGuestRecuperarQuery(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      {guestSearchError && (
                        <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.68rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', margin: '0.8rem 0' }}>
                          ⚠️ {guestSearchError}
                        </div>
                      )}

                      <button type="submit" className="btn-airbnb-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Enviando correo...' : 'Enviar Instrucciones de Recuperación'}
                      </button>

                      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => { setGuestAuthTab('login'); setGuestSearchError(null); }}
                        >
                          ← Volver al Inicio de Sesión
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* CONTENIDO DE PESTAÑA: CREAR CUENTA NUEVA (DISEÑO INTERNACIONAL SIMÉTRICO Y ELEGANTE) */
                <form onSubmit={handleUserSubmit} style={{ marginTop: '0.2rem' }}>
                  {guestSearchError && (
                    <div style={{ color: '#991b1b', background: '#fee2e2', border: '1px solid #fca5a5', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '0.8rem' }}>
                      ⚠️ {guestSearchError}
                      <div style={{ marginTop: '0.35rem' }}>
                        <button
                          type="button"
                          style={{ background: '#ffffff', border: '1px solid #f87171', color: '#991b1b', borderRadius: '6px', padding: '0.2rem 0.55rem', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => {
                            setGuestSearchQuery(formData.documento || formData.correo || '');
                            setGuestAuthTab('login');
                            setGuestSearchError(null);
                          }}
                        >
                          🔑 Iniciar Sesión con mis datos →
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid-registro-auth" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
                    {/* =================================================================
                        COLUMNA 1: IDENTIFICACIÓN Y DOCUMENTO INTERNACIONAL
                       ================================================================= */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: '0.25rem', borderBottom: '1px solid #f1f5f9' }}>
                        1. Identificación y Documento Oficial
                      </div>

                      {/* Nombre(s) y Apellido(s) */}
                      <div>
                        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                          Nombre Legal Oficial
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                          <div className="field-input-wrap" style={{ height: '38px' }}>
                            <FileText className="field-icon" size={14} />
                            <input
                              id="reg-nombre"
                              type="text"
                              placeholder="Nombre(s)"
                              value={nombreLegal}
                              onChange={(e) => setNombreLegal(e.target.value)}
                              required
                              style={{ fontSize: '0.82rem' }}
                            />
                          </div>
                          <div className="field-input-wrap" style={{ height: '38px' }}>
                            <FileText className="field-icon" size={14} />
                            <input
                              id="reg-apellido"
                              type="text"
                              placeholder="Apellido(s)"
                              value={apellidoLegal}
                              onChange={(e) => setApellidoLegal(e.target.value)}
                              required
                              style={{ fontSize: '0.82rem' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Selector Internacional de Tipo de Documento */}
                      <div>
                        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                          Tipo de Documento de Identidad
                        </label>
                        <select
                          className="input-airbnb"
                          value={docTipo}
                          onChange={(e) => setDocTipo(e.target.value)}
                          style={{ width: '100%', height: '38px', fontSize: '0.82rem', padding: '0 0.6rem', background: '#ffffff', borderRadius: '10px' }}
                        >
                          <option value="PASAPORTE">🛂 Pasaporte Internacional (Recomendado Extranjeros)</option>
                          <option value="CC">🪪 Cédula de Ciudadanía (Colombia)</option>
                          <option value="CE">🪪 Cédula de Extranjería (Colombia)</option>
                          <option value="DNI">💳 DNI / Documento Nacional (Latam / España / UE)</option>
                          <option value="LICENCIA">🪪 Licencia de Conducir / ID Oficial</option>
                        </select>
                      </div>

                      {/* País Emisor & Número de Documento */}
                      <div>
                        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                          País Emisor & Número de Documento
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '125px 1fr', gap: '0.45rem' }}>
                          <select
                            className="input-airbnb"
                            value={docPaisEmisor}
                            onChange={(e) => setDocPaisEmisor(e.target.value)}
                            style={{ height: '38px', fontSize: '0.8rem', padding: '0 0.4rem', background: '#ffffff', borderRadius: '10px' }}
                          >
                            <option value="CO">🇨🇴 Colombia</option>
                            <option value="US">🇺🇸 USA</option>
                            <option value="ES">🇪🇸 España</option>
                            <option value="MX">🇲🇽 México</option>
                            <option value="AR">🇦🇷 Argentina</option>
                            <option value="CL">🇨🇱 Chile</option>
                            <option value="PE">🇵🇪 Perú</option>
                            <option value="BR">🇧🇷 Brasil</option>
                            <option value="PA">🇵🇦 Panamá</option>
                            <option value="CA">🇨🇦 Canadá</option>
                            <option value="FR">🇫🇷 Francia</option>
                            <option value="DE">🇩🇪 Alemania</option>
                            <option value="GB">🇬🇧 UK</option>
                            <option value="OTRO">🌎 Otro País</option>
                          </select>
                          <div className="field-input-wrap" style={{ height: '38px' }}>
                            <ShieldCheck className="field-icon" size={14} />
                            <input
                              id="reg-documento"
                              type="text"
                              name="documento"
                              value={formData.documento}
                              onChange={handleUserChange}
                              placeholder={docTipo === 'PASAPORTE' ? 'Ej: A12345678' : 'Ej: 1017283944'}
                              maxLength={20}
                              required
                              style={{ fontSize: '0.82rem', textTransform: 'uppercase' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Fecha de Nacimiento */}
                      <div>
                        <label htmlFor="reg-nacimiento" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                          Fecha de Nacimiento (Mayor de 18 años)
                        </label>
                        <div className="field-input-wrap" style={{ height: '38px' }}>
                          <Calendar className="field-icon" size={14} />
                          <input
                            id="reg-nacimiento"
                            type="date"
                            value={fechaNacimiento}
                            onChange={(e) => setFechaNacimiento(e.target.value)}
                            required
                            style={{ fontSize: '0.82rem' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* =================================================================
                        COLUMNA 2: CONTACTO Y CREDENCIALES DE ACCESO
                       ================================================================= */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: '0.25rem', borderBottom: '1px solid #f1f5f9' }}>
                        2. Contacto, Seguridad y Términos
                      </div>

                      {/* Correo Electrónico */}
                      <div>
                        <label htmlFor="reg-correo" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                          Correo Electrónico (Recibirás confirmación)
                        </label>
                        <div className="field-input-wrap" style={{ height: '38px' }}>
                          <Mail className="field-icon" size={14} />
                          <input
                            id="reg-correo"
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleUserChange}
                            placeholder="correo@ejemplo.com"
                            required
                            style={{ fontSize: '0.82rem' }}
                          />
                        </div>
                      </div>

                      {/* Teléfono Móvil con Indicativo Internacional */}
                      <div>
                        <label htmlFor="reg-telefono" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                          Teléfono Móvil (WhatsApp de Check-in)
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '105px 1fr', gap: '0.45rem' }}>
                          <select
                            className="input-airbnb"
                            value={telIndicativo}
                            onChange={(e) => setTelIndicativo(e.target.value)}
                            style={{ height: '38px', fontSize: '0.8rem', padding: '0 0.35rem', background: '#ffffff', borderRadius: '10px' }}
                          >
                            <option value="+57">🇨🇴 +57</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+34">🇪🇸 +34</option>
                            <option value="+52">🇲🇽 +52</option>
                            <option value="+54">🇦🇷 +54</option>
                            <option value="+56">🇨🇱 +56</option>
                            <option value="+55">🇧🇷 +55</option>
                            <option value="+51">🇵🇪 +51</option>
                            <option value="+593">🇪🇨 +593</option>
                            <option value="+507">🇵🇦 +507</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+49">🇩🇪 +49</option>
                            <option value="+44">🇬🇧 +44</option>
                          </select>
                          <div className="field-input-wrap" style={{ height: '38px' }}>
                            <Phone className="field-icon" size={14} />
                            <input
                              id="reg-telefono"
                              type="tel"
                              name="telefono"
                              value={formData.telefono}
                              onChange={handleUserChange}
                              placeholder="Ej: 3154449876"
                              maxLength={16}
                              required
                              style={{ fontSize: '0.82rem' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contraseña */}
                      <div>
                        <label htmlFor="reg-password" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                          Contraseña de la Cuenta
                        </label>
                        <div className="field-input-wrap" style={{ height: '38px' }}>
                          <Lock className="field-icon" size={14} />
                          <input
                            id="reg-password"
                            type={showGuestPassword ? "text" : "password"}
                            name="password"
                            value={formData.password || ''}
                            onChange={handleUserChange}
                            placeholder="Mínimo 6 caracteres"
                            style={{ fontSize: '0.82rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowGuestPassword(!showGuestPassword)}
                            style={{ background: 'none', border: 'none', padding: '0 0.35rem', color: '#64748b', cursor: 'pointer' }}
                          >
                            {showGuestPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* Consentimiento Legal y Habeas Data Integrado */}
                      <div style={{ paddingTop: '0.15rem' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.72rem', color: '#475569', cursor: 'pointer', lineHeight: 1.35 }}>
                          <input
                            type="checkbox"
                            checked={habeasData}
                            onChange={(e) => setHabeasData(e.target.checked)}
                            style={{ marginTop: '2px', accentColor: '#d91a2a', flexShrink: 0 }}
                          />
                          <span>
                            Acepto los <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('terminos')}>Términos</button>, la <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('privacidad')}>Privacidad</button> y autorizo el tratamiento de mis datos personales (Ley 1581 de 2012 / RNT Colombia).
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* =================================================================
                      BOTÓN PRINCIPAL DE ANCHO COMPLETO AL PIE
                     ================================================================= */}
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="submit"
                      className="btn-airbnb-primary"
                      disabled={loading}
                      style={{
                        width: '100%',
                        height: '44px',
                        marginTop: 0,
                        borderRadius: 'var(--radius-pill)',
                        background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)',
                        boxShadow: '0 4px 14px rgba(217, 26, 42, 0.28)',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {loading ? 'Creando cuenta...' : 'Aceptar y continuar'}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => { setGuestAuthTab('login'); setGuestSearchError(null); }}
                        style={{ background: 'none', border: 'none', color: '#d91a2a', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        ¿Ya tienes cuenta registrada? Inicia sesión aquí
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* SECCIÓN DE AUTENTICACIÓN SOCIAL (GOOGLE Y APPLE) AL FINAL */}
              {guestAuthTab !== 'recuperar' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.65rem', paddingTop: '0.55rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>o continúa con:</span>
                  <button
                    type="button"
                    className="btn-social-auth"
                    style={{ width: 'auto', padding: '0.4rem 1.1rem', fontSize: '0.8rem', borderRadius: 'var(--radius-pill)' }}
                    onClick={() => setSocialProvider('google')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    className="btn-social-auth"
                    style={{ width: 'auto', padding: '0.4rem 1.1rem', fontSize: '0.8rem', borderRadius: 'var(--radius-pill)' }}
                    onClick={() => setSocialProvider('apple')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.1-1.9 0.98-3.01-1 .04-2.18.67-2.88 1.49-.62.72-1.16 1.87-1.01 2.97 1.12.09 2.26-.66 2.91-1.45z"/>
                    </svg>
                    Apple
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalGuestAuth;
