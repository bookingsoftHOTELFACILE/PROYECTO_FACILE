import {
  UserPlus, ShieldCheck, Mail, Phone, FileText, Calendar,
  Lock, User, CheckCircle2, Search, Eye, EyeOff,
  KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const ModalGuestAuth = () => {
  const {
  huespedes, setActiveTab, formData, habeasData,
  setHabeasData, selectedHuesped, setSelectedHuesped, loading,
  setAlert, setShowGuestAuthModal, guestAuthTab, setGuestAuthTab,
  guestSearchQuery, setGuestSearchQuery, guestLoginPassword, setGuestLoginPassword,
  showGuestPassword, setShowGuestPassword, guestSearchError, setGuestSearchError,
  guestRegJustCreated, setGuestRegJustCreated, guestRecuperarQuery, setGuestRecuperarQuery,
  guestRecuperarSuccess, setGuestRecuperarSuccess, guestNuevaPassword, setGuestNuevaPassword,
  nombreLegal, setNombreLegal, apellidoLegal, setApellidoLegal,
  fechaNacimiento, setFechaNacimiento, marketingOptOut, setMarketingOptOut,
  setModalLegalTipo, handleUserChange, handleUserSubmit, handleGuestSearchSubmit,
  handleGuestRecuperarSubmit, handleGuestRestablecerSubmit
  } = useApp();
  return (
        <div className="modal-backdrop" onClick={() => setShowGuestAuthModal(false)}>
          <div className="modal-airbnb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-airbnb-header">
              <button className="btn-x-close" onClick={() => setShowGuestAuthModal(false)}>✕</button>
              <h3 className="modal-airbnb-title">Inicia sesión o regístrate</h3>
            </div>

            <div className="modal-airbnb-body">
              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem' }}>
                  <User size={24} color="#e11d48" />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                  Te damos la bienvenida a Facile
                </h4>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Ingrese sus datos para cotizar o confirmar su reserva de apartamento
                </p>
              </div>

              {guestRegJustCreated && selectedHuesped ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
                    <CheckCircle2 size={32} color="#166534" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#166534' }}>
                    ¡Usuario Creado Exitosamente!
                  </h4>
                  <p style={{ margin: '0.5rem 0 0.8rem', fontSize: '0.88rem', color: '#374151', lineHeight: '1.5' }}>
                    Hemos enviado una notificación de bienvenida al correo:<br/>
                    <strong style={{ color: '#15803d' }}>{selectedHuesped.correo}</strong>
                  </p>
                  <div style={{ background: '#ffffff', padding: '0.8rem', borderRadius: '10px', fontSize: '0.8rem', color: '#64748b', marginBottom: '1.2rem', border: '1px solid #e2e8f0' }}>
                    ✉️ Notificación enviada. Su perfil está activo y su contraseña ha sido registrada.
                  </div>
                  <button
                    type="button"
                    className="btn-airbnb-primary"
                    onClick={() => { setShowGuestAuthModal(false); setGuestRegJustCreated(false); setActiveTab('reservar'); }}
                  >
                    Continuar a la Reserva →
                  </button>
                </div>
              ) : selectedHuesped ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <CheckCircle2 size={20} /> Perfil Activo Seleccionado
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>{selectedHuesped.nombre}</p>
                  <p style={{ margin: '0.2rem 0 0.8rem', fontSize: '0.8rem', color: '#64748b' }}>Doc: {selectedHuesped.documento} | Tel: {selectedHuesped.telefono}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn-airbnb-primary"
                      style={{ marginTop: 0, flex: 1 }}
                      onClick={() => { setShowGuestAuthModal(false); setActiveTab('reservar'); }}
                    >
                      Ir a Reservar
                    </button>
                    <button
                      type="button"
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                      onClick={() => { setSelectedHuesped(null); setGuestRegJustCreated(false); setGuestAuthTab('login'); }}
                    >
                      Cambiar Perfil
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* PESTAÑAS SWITCHER (YA TENGO REGISTRO / CREAR CUENTA NUEVA) */}
                  <div className="airbnb-tab-switcher">
                    <button
                      type="button"
                      className={`airbnb-tab-btn ${guestAuthTab === 'login' ? 'active' : ''}`}
                      onClick={() => { setGuestAuthTab('login'); setGuestSearchError(null); }}
                    >
                      <Search size={14} /> Ya tengo registro
                    </button>
                    <button
                      type="button"
                      className={`airbnb-tab-btn ${guestAuthTab === 'registro' ? 'active' : ''}`}
                      onClick={() => { setGuestAuthTab('registro'); setGuestSearchError(null); }}
                    >
                      <UserPlus size={14} /> Crear cuenta nueva
                    </button>
                  </div>

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
                    <form onSubmit={handleUserSubmit} style={{ marginTop: '0.8rem' }}>
                      <div style={{ marginBottom: '1.2rem', borderBottom: '1px solid #f1f5f9', pb: '0.8rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                          Ahora creemos tu cuenta
                        </h4>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                          Esta información es obligatoria para reservar o hospedarte en Apartamentos Facile.
                        </p>
                      </div>

                      {guestSearchError && (
                        <div style={{ color: '#991b1b', background: '#fee2e2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                          ⚠️ {guestSearchError}
                          <div style={{ marginTop: '0.4rem' }}>
                            <button
                              type="button"
                              style={{ background: '#ffffff', border: '1px solid #f87171', color: '#991b1b', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
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

                      {/* 1. NOMBRE LEGAL OFICIAL */}
                      <div style={{ marginBottom: '0.8rem' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Nombre legal oficial
                        </label>
                        <div className="form-row-2">
                          <div className="form-field">
                            <div className="field-input-wrap">
                              <FileText className="field-icon" size={16}/>
                              <input
                                id="reg-nombre"
                                type="text"
                                aria-label="Nombre(s)"
                                placeholder="Nombre(s)"
                                value={nombreLegal}
                                onChange={(e) => setNombreLegal(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="form-field">
                            <div className="field-input-wrap">
                              <FileText className="field-icon" size={16}/>
                              <input
                                id="reg-apellido"
                                type="text"
                                aria-label="Apellido(s)"
                                placeholder="Apellido(s)"
                                value={apellidoLegal}
                                onChange={(e) => setApellidoLegal(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="airbnb-field-note">
                          Asegúrate de que coincida con el nombre que aparece en tu documento de identidad oficial.
                        </div>
                      </div>

                      {/* 2. DOCUMENTO DE IDENTIDAD Y TELÉFONO */}
                      <div className="form-row-2" style={{ marginBottom: '0.8rem' }}>
                        <div className="form-field">
                          <label htmlFor="reg-documento" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            Documento (Cédula/Pasaporte)
                          </label>
                          <div className="field-input-wrap">
                            <ShieldCheck className="field-icon" size={16}/>
                            <input
                              id="reg-documento"
                              type="text"
                              name="documento"
                              value={formData.documento}
                              onChange={handleUserChange}
                              placeholder="Ej: 1017283944"
                              maxLength={15}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-field">
                          <label htmlFor="reg-telefono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            Teléfono de contacto
                          </label>
                          <div className="field-input-wrap">
                            <Phone className="field-icon" size={16}/>
                            <input
                              id="reg-telefono"
                              type="text"
                              name="telefono"
                              value={formData.telefono}
                              onChange={handleUserChange}
                              placeholder="Ej: 3154449876"
                              maxLength={15}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. FECHA DE NACIMIENTO */}
                      <div className="form-field" style={{ marginBottom: '0.8rem' }}>
                        <label htmlFor="reg-nacimiento" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Fecha de nacimiento
                        </label>
                        <div className="field-input-wrap">
                          <Calendar className="field-icon" size={16}/>
                          <input
                            id="reg-nacimiento"
                            type="date"
                            value={fechaNacimiento}
                            onChange={(e) => setFechaNacimiento(e.target.value)}
                            required
                          />
                        </div>
                        <div className="airbnb-field-note">
                          Debes tener al menos 18 años para registrarte en BookingSoft.
                        </div>
                      </div>

                      {/* 4. CORREO Y CONTRASEÑA */}
                      <div className="form-row-2" style={{ marginBottom: '0.8rem' }}>
                        <div className="form-field">
                          <label htmlFor="reg-correo" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            Correo electrónico
                          </label>
                          <div className="field-input-wrap">
                            <Mail className="field-icon" size={16}/>
                            <input
                              id="reg-correo"
                              type="email"
                              name="correo"
                              value={formData.correo}
                              onChange={handleUserChange}
                              placeholder="correo@ejemplo.com"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-field">
                          <label htmlFor="reg-password" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            Contraseña
                          </label>
                          <div className="field-input-wrap">
                            <Lock className="field-icon" size={16}/>
                            <input
                              id="reg-password"
                              type={showGuestPassword ? "text" : "password"}
                              name="password"
                              value={formData.password || ''}
                              onChange={handleUserChange}
                              placeholder="Crear contraseña"
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
                      </div>
                      <div className="airbnb-field-note" style={{ marginBottom: '0.8rem' }}>
                        Te enviaremos las confirmaciones de viaje y los recibos por correo electrónico.
                      </div>

                      {/* 5. PREFERENCIAS MARKETING */}
                      <label className="airbnb-checkbox-row">
                        <input
                          type="checkbox"
                          checked={marketingOptOut}
                          onChange={(e) => setMarketingOptOut(e.target.checked)}
                        />
                        <span>No quiero recibir mensajes promocionales de BookingSoft Apartamentos Facile.</span>
                      </label>

                      {/* 6. ACEPTACIÓN LEGAL Y DISCLAIMER COLOMBIA (LEY 1581) */}
                      <div className="airbnb-legal-disclaimer">
                        Al seleccionar <strong>Aceptar y continuar</strong>, acepto los{' '}
                        <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('terminos')}>
                          Términos del servicio
                        </button>, los{' '}
                        <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('pagos')}>
                          Términos de pago del servicio
                        </button>, la{' '}
                        <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('discriminacion')}>
                          Política contra la discriminación
                        </button>{' '}
                        y el{' '}
                        <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('ley1581')}>
                          Suplemento de Privacidad para Colombia (Ley 1581 de 2012)
                        </button>{' '}
                        y reconozco la{' '}
                        <button type="button" className="btn-link-legal" onClick={() => setModalLegalTipo('privacidad')}>
                          Política de privacidad
                        </button>{' '}
                        de Apartahotel Facile y BookingSoft.
                      </div>

                      <label className="airbnb-checkbox-row" style={{ marginBottom: '1.2rem' }}>
                        <input
                          type="checkbox"
                          checked={habeasData}
                          onChange={(e) => setHabeasData(e.target.checked)}
                        />
                        <span><strong>Autorizo expresamente</strong> el tratamiento de mis datos personales según la Ley 1581 de 2012 de Colombia.</span>
                      </label>

                      <button type="submit" className="btn-airbnb-primary" disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Aceptar y continuar'}
                      </button>
                    </form>
                  )}

                  {/* SECCIÓN DE AUTENTICACIÓN SOCIAL (GOOGLE Y APPLE) AL FINAL */}
                  {guestAuthTab !== 'recuperar' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', margin: '1.2rem 0 0.8rem', gap: '0.8rem' }}>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>o</span>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                          type="button"
                          className="btn-social-auth"
                          style={{ flex: 1, padding: '0.65rem' }}
                          onClick={() => {
                            const demoEmail = 'huesped_google@ejemplo.com';
                            setGuestSearchQuery(demoEmail);
                            setAlert({ type: 'success', message: '¡Autenticado mediante Google! Complete su reserva.' });
                            const gUser = huespedes.find(h => h.correo === demoEmail) || {
                              id_huesped: 99,
                              nombre: 'Usuario Google Demo',
                              documento: 'GOOGLE-12345',
                              telefono: '3001234567',
                              correo: demoEmail
                            };
                            setSelectedHuesped(gUser);
                            setShowGuestAuthModal(false);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24">
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
                          style={{ flex: 1, padding: '0.65rem' }}
                          onClick={() => {
                            const demoEmail = 'huesped_apple@icloud.com';
                            setGuestSearchQuery(demoEmail);
                            setAlert({ type: 'success', message: '¡Autenticado mediante Apple ID! Complete su reserva.' });
                            const aUser = huespedes.find(h => h.correo === demoEmail) || {
                              id_huesped: 98,
                              nombre: 'Usuario Apple Demo',
                              documento: 'APPLE-67890',
                              telefono: '3159876543',
                              correo: demoEmail
                            };
                            setSelectedHuesped(aUser);
                            setShowGuestAuthModal(false);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.1-1.9 0.98-3.01-1 .04-2.18.67-2.88 1.49-.62.72-1.16 1.87-1.01 2.97 1.12.09 2.26-.66 2.91-1.45z"/>
                          </svg>
                          Apple
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
  );
};

export default ModalGuestAuth;
