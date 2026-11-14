import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  FileText,
  Building2,
  Globe2,
  Bell,
  Lock,
  Luggage,
  Calendar,
  CheckCircle2,
  Camera,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CreditCard,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const VistaPerfil = () => {
  const {
    setActiveTab,
    selectedHuesped,
    setSelectedHuesped,
    guestProfileExtras,
    setGuestProfileExtras,
    guestAvatarUrl,
    setGuestAvatarUrl,
    profileSavedMsg,
    setProfileSavedMsg,
    setAlert,
    setShowGuestAuthModal
  } = useApp();

  // Pestaña activa dentro de la configuración de cuenta
  const [tabActiva, setTabActiva] = useState('personal'); // 'personal' | 'empresas' | 'extranjeros' | 'notificaciones' | 'seguridad'

  // Estados locales editables para información extendida
  const [datosPerfil, setDatosPerfil] = useState({
    nombre: selectedHuesped?.nombre || '',
    documento: selectedHuesped?.documento || '',
    tipoDoc: guestProfileExtras?.tipoDoc || 'CC',
    telefono: selectedHuesped?.telefono || '',
    indicativo: guestProfileExtras?.indicativo || '+57',
    correo: selectedHuesped?.correo || '',
    paisOrigen: guestProfileExtras?.paisOrigen || 'Colombia',
    ciudad: guestProfileExtras?.ciudad || 'Bogotá',
    // Empresa / Facturación DIAN
    esEmpresa: guestProfileExtras?.esEmpresa || false,
    razonSocial: guestProfileExtras?.razonSocial || '',
    nit: guestProfileExtras?.nit || '',
    correoFacturacion: guestProfileExtras?.correoFacturacion || '',
    direccionFiscal: guestProfileExtras?.direccionFiscal || '',
    // Extranjería & Exención de IVA
    numeroPasaporte: guestProfileExtras?.numeroPasaporte || '',
    paisEmisorPasaporte: guestProfileExtras?.paisEmisorPasaporte || '',
    solicitaExencionIva: guestProfileExtras?.solicitaExencionIva ?? true,
    monedaPreferida: guestProfileExtras?.monedaPreferida || 'COP',
    idiomaPreferido: guestProfileExtras?.idiomaPreferido || 'es',
    // Notificaciones de reserva
    notifWhatsapp: guestProfileExtras?.notifWhatsapp ?? true,
    notifCorreoCheckin: guestProfileExtras?.notifCorreoCheckin ?? true,
    notifNovedadesReserva: guestProfileExtras?.notifNovedadesReserva ?? true,
    notifPromociones: guestProfileExtras?.notifPromociones ?? false,
    // Seguridad
    nuevaClave: '',
    confirmarClave: ''
  });

  const handleChange = (campo, valor) => {
    setDatosPerfil(prev => ({ ...prev, [campo]: valor }));
  };

  const handleGuardarCambios = (e) => {
    e?.preventDefault();
    try {
      const mergedExtras = {
        ...guestProfileExtras,
        ...datosPerfil
      };
      setGuestProfileExtras(mergedExtras);
      localStorage.setItem('bookingsoft_guest_profile_extras', JSON.stringify(mergedExtras));
      
      // Actualizar también en el objeto seleccionado del contexto
      if (selectedHuesped) {
        const updated = {
          ...selectedHuesped,
          nombre: datosPerfil.nombre,
          telefono: datosPerfil.telefono,
          documento: datosPerfil.documento
        };
        setSelectedHuesped(updated);
        localStorage.setItem('bookingsoft_guest_user', JSON.stringify(updated));
      }

      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 4000);
    } catch (err) {
      console.error('Error al guardar perfil:', err);
    }
  };

  if (!selectedHuesped) {
    return (
      <section className="facile-section" style={{ paddingTop: '3rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#ffffff', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#d91a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
            <User size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
            Inicia sesión para gestionar tu cuenta
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1.8rem', lineHeight: 1.5 }}>
            Accede a tus datos oficiales de check-in, preferencias de facturación corporativa DIAN y novedades de tus reservas.
          </p>
          <button
            className="btn-airbnb-primary"
            style={{ borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)', height: '46px' }}
            onClick={() => setShowGuestAuthModal(true)}
          >
            Iniciar sesión o registrarme
          </button>
        </div>
      </section>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Banner de éxito al guardar */}
        {profileSavedMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.85rem 1.2rem',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(6, 95, 70, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', fontWeight: 700 }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>Cambios guardados exitosamente. Tus datos de reserva y facturación están actualizados.</span>
            </div>
            <button onClick={() => setProfileSavedMsg(false)} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontWeight: 800 }}>✕</button>
          </div>
        )}

        {/* Encabezado Principal */}
        <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
              Configuración de la Cuenta
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748b' }}>
              Gestiona tus datos oficiales de huésped, facturación corporativa DIAN, beneficios para extranjeros y novedades de reserva.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => setActiveTab('viajes')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-pill)',
                padding: '0.6rem 1.2rem',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Luggage size={15} color="#d91a2a" />
              <span>Ver Mis Reservas</span>
            </button>
            <button
              onClick={() => {
                setSelectedHuesped(null);
                localStorage.removeItem('bookingsoft_guest_user');
                setActiveTab('inicio');
                setAlert({ type: 'info', message: 'Sesión cerrada correctamente.' });
              }}
              style={{
                backgroundColor: '#fee2e2',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '0.6rem 1.1rem',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#b91522',
                cursor: 'pointer'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* =========================================================================
            LAYOUT EN 2 COLUMNAS (Estilo Airbnb Ejecutivo): SIDEBAR + CONTENIDO
           ========================================================================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 310px) 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* SIDEBAR IZQUIERDO: TARJETA DE USUARIO + PESTAÑAS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Tarjeta de Resumen del Huésped */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 0.8rem' }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#d91a2a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  overflow: 'hidden',
                  border: '2px solid #ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  {guestAvatarUrl ? (
                    <img src={guestAvatarUrl} alt={selectedHuesped.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{selectedHuesped.nombre ? selectedHuesped.nombre.charAt(0).toUpperCase() : 'H'}</span>
                  )}
                </div>

                {/* Botón para cambiar foto */}
                <label style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid #ffffff'
                }} title="Subir foto">
                  <Camera size={13} />
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

              <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {selectedHuesped.nombre}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b', wordBreak: 'break-all', marginBottom: '0.8rem' }}>
                {selectedHuesped.correo}
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#ecfdf5', color: '#065f46', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 700 }}>
                <ShieldCheck size={13} color="#059669" />
                <span>Huésped Verificado</span>
              </div>
            </div>

            {/* Menú de Navegación Lateral */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '0.6rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              {[
                { id: 'personal', label: 'Información Personal', icono: User, desc: 'Datos oficiales y check-in' },
                { id: 'empresas', label: 'Empresas y Facturación DIAN', icono: Building2, desc: 'NIT, Razón social y recibos' },
                { id: 'extranjeros', label: 'Extranjería y Moneda', icono: Globe2, desc: 'Pasaporte, exención IVA, USD' },
                { id: 'notificaciones', label: 'Novedades de Reserva', icono: Bell, desc: 'WhatsApp, alertas check-in' },
                { id: 'seguridad', label: 'Seguridad y Acceso', icono: Lock, desc: 'Contraseña y sesión activa' },
              ].map((item) => {
                const IconComp = item.icono;
                const isSelected = tabActiva === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTabActiva(item.id)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '14px',
                      border: 'none',
                      backgroundColor: isSelected ? '#fee2e2' : 'transparent',
                      color: isSelected ? '#d91a2a' : '#334155',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <IconComp size={18} color={isSelected ? '#d91a2a' : '#64748b'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: isSelected ? 800 : 600 }}>{item.label}</div>
                      <div style={{ fontSize: '0.72rem', color: isSelected ? '#b91522' : '#94a3b8' }}>{item.desc}</div>
                    </div>
                    <ChevronRight size={14} color={isSelected ? '#d91a2a' : '#cbd5e1'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTENIDO DERECHO: PESTAÑA SELECCIONADA */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            padding: '2rem 2.2rem',
            boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
          }}>

            {/* =====================================================================
                1. INFORMACIÓN PERSONAL
               ===================================================================== */}
            {tabActiva === 'personal' && (
              <form onSubmit={handleGuardarCambios}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                    Información Personal Oficial
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                    Datos requeridos por la legislación colombiana (MinCIT) para el registro de huéspedes en Apartamentos Facile.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Nombre Completo Legal
                    </label>
                    <input
                      type="text"
                      className="input-airbnb"
                      value={datosPerfil.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      placeholder="Nombres y Apellidos"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Correo Electrónico Principal
                    </label>
                    <input
                      type="email"
                      className="input-airbnb"
                      value={datosPerfil.correo}
                      disabled
                      style={{ backgroundColor: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                      title="El correo principal de la cuenta no se puede modificar directamente"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Tipo Documento
                    </label>
                    <select
                      className="input-airbnb"
                      value={datosPerfil.tipoDoc}
                      onChange={(e) => handleChange('tipoDoc', e.target.value)}
                      style={{ padding: '0.65rem 0.5rem' }}
                    >
                      <option value="CC">Cédula (CC)</option>
                      <option value="CE">Cédula Ext. (CE)</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="DNI">DNI Extranjero</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Número de Documento
                    </label>
                    <input
                      type="text"
                      className="input-airbnb"
                      value={datosPerfil.documento}
                      onChange={(e) => handleChange('documento', e.target.value)}
                      placeholder="Ej: 1017283944"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Indicativo
                    </label>
                    <select
                      className="input-airbnb"
                      value={datosPerfil.indicativo}
                      onChange={(e) => handleChange('indicativo', e.target.value)}
                    >
                      <option value="+57">🇨🇴 +57 (Colombia)</option>
                      <option value="+1">🇺🇸 +1 (USA/Canadá)</option>
                      <option value="+34">🇪🇸 +34 (España)</option>
                      <option value="+52">🇲🇽 +52 (México)</option>
                      <option value="+54">🇦🇷 +54 (Argentina)</option>
                      <option value="+507">🇵🇦 +507 (Panamá)</option>
                      <option value="+55">🇧🇷 +55 (Brasil)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Teléfono Móvil (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      className="input-airbnb"
                      value={datosPerfil.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="Ej: 3154449876"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      País de Residencia
                    </label>
                    <input
                      type="text"
                      className="input-airbnb"
                      value={datosPerfil.paisOrigen}
                      onChange={(e) => handleChange('paisOrigen', e.target.value)}
                      placeholder="Ej: Colombia, Estados Unidos, España..."
                    />
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Ciudad
                    </label>
                    <input
                      type="text"
                      className="input-airbnb"
                      value={datosPerfil.ciudad}
                      onChange={(e) => handleChange('ciudad', e.target.value)}
                      placeholder="Ej: Bogotá, Medellín, Miami..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem' }}>
                  <button
                    type="submit"
                    className="btn-airbnb-primary"
                    style={{ width: 'auto', padding: '0.65rem 2rem', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)' }}
                  >
                    Guardar Información Personal
                  </button>
                </div>
              </form>
            )}

            {/* =====================================================================
                2. EMPRESAS Y FACTURACIÓN ELECTRÓNICA DIAN
               ===================================================================== */}
            {tabActiva === 'empresas' && (
              <form onSubmit={handleGuardarCambios}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#d91a2a', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    <Building2 size={14} /> Viajes Corporativos & Facturación
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                    Facturación Electrónica DIAN para Empresas
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                    Si viajas en representación de una empresa o requieres factura con NIT desglosado para deducción tributaria en Colombia.
                  </p>
                </div>

                {/* Switch de modo corporativo */}
                <div style={{ background: '#f8fafc', padding: '1rem 1.2rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>¿Facturar mis estadías a nombre de una Empresa?</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Emitiremos la factura electrónica oficial directamente al NIT de tu compañía.</div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                    <input
                      type="checkbox"
                      checked={datosPerfil.esEmpresa}
                      onChange={(e) => handleChange('esEmpresa', e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: datosPerfil.esEmpresa ? '#d91a2a' : '#cbd5e1',
                      borderRadius: '34px', transition: '0.2s'
                    }}>
                      <span style={{
                        position: 'absolute', height: '20px', width: '20px', left: '3px', bottom: '3px',
                        backgroundColor: '#ffffff', borderRadius: '50%', transition: '0.2s',
                        transform: datosPerfil.esEmpresa ? 'translateX(22px)' : 'none'
                      }} />
                    </span>
                  </label>
                </div>

                {datosPerfil.esEmpresa && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                      <div className="form-field">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Razón Social de la Empresa
                        </label>
                        <input
                          type="text"
                          className="input-airbnb"
                          value={datosPerfil.razonSocial}
                          onChange={(e) => handleChange('razonSocial', e.target.value)}
                          placeholder="Ej: Soluciones Tecnológicas SAS"
                          required={datosPerfil.esEmpresa}
                        />
                      </div>

                      <div className="form-field">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          NIT (con dígito de verificación)
                        </label>
                        <input
                          type="text"
                          className="input-airbnb"
                          value={datosPerfil.nit}
                          onChange={(e) => handleChange('nit', e.target.value)}
                          placeholder="Ej: 901.456.789-1"
                          required={datosPerfil.esEmpresa}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                      <div className="form-field">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Correo para Facturación Electrónica DIAN
                        </label>
                        <input
                          type="email"
                          className="input-airbnb"
                          value={datosPerfil.correoFacturacion}
                          onChange={(e) => handleChange('correoFacturacion', e.target.value)}
                          placeholder="facturacion@tuempresa.com"
                          required={datosPerfil.esEmpresa}
                        />
                      </div>

                      <div className="form-field">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Dirección Fiscal Registrada
                        </label>
                        <input
                          type="text"
                          className="input-airbnb"
                          value={datosPerfil.direccionFiscal}
                          onChange={(e) => handleChange('direccionFiscal', e.target.value)}
                          placeholder="Ej: Cra 11 # 93-45, Bogotá"
                          required={datosPerfil.esEmpresa}
                        />
                      </div>
                    </div>

                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#166534' }}>
                      💼 <strong>Convenio Corporativo:</strong> Las reservas facturadas a empresas con más de 10 noches al mes tienen acceso preferencial a las Salas de Juntas del Centro de Negocios de Apartamentos Facile.
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem' }}>
                  <button
                    type="submit"
                    className="btn-airbnb-primary"
                    style={{ width: 'auto', padding: '0.65rem 2rem', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)' }}
                  >
                    Guardar Datos Corporativos
                  </button>
                </div>
              </form>
            )}

            {/* =====================================================================
                3. HUÉSPEDES EXTRANJEROS & BENEFICIOS
               ===================================================================== */}
            {tabActiva === 'extranjeros' && (
              <form onSubmit={handleGuardarCambios}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#d91a2a', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    <Globe2 size={14} /> International Guests & Exemption
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                    Huéspedes Extranjeros & Exención de IVA
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                    Registro internacional conforme al sistema SIRE de Migración Colombia y beneficio de exención del 19% de IVA (Decreto 297 de 2016).
                  </p>
                </div>

                {/* Banner informativo de exención del 19% de IVA */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '1.1rem 1.3rem', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                  <ShieldCheck size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.2rem' }}>
                      Exención de IVA (19%) para Turistas Extranjeros
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#3b82f6', lineHeight: 1.5 }}>
                      Los ciudadanos extranjeros no residentes en Colombia que ingresen al país con sello de permiso de turismo (PT) están legalmente exentos del 19% de IVA en servicios de alojamiento hotelero.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Número de Pasaporte Internacional
                    </label>
                    <input
                      type="text"
                      className="input-airbnb"
                      value={datosPerfil.numeroPasaporte}
                      onChange={(e) => handleChange('numeroPasaporte', e.target.value)}
                      placeholder="Ej: A12345678"
                    />
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      País Emisor del Pasaporte
                    </label>
                    <input
                      type="text"
                      className="input-airbnb"
                      value={datosPerfil.paisEmisorPasaporte}
                      onChange={(e) => handleChange('paisEmisorPasaporte', e.target.value)}
                      placeholder="Ej: United States, España, México..."
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Idioma Preferido de Comunicación
                    </label>
                    <select
                      className="input-airbnb"
                      value={datosPerfil.idiomaPreferido}
                      onChange={(e) => handleChange('idiomaPreferido', e.target.value)}
                    >
                      <option value="es">🇪🇸 Español (Colombia / Latam)</option>
                      <option value="en">🇺🇸 English (US / International)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Moneda de Visualización
                    </label>
                    <select
                      className="input-airbnb"
                      value={datosPerfil.monedaPreferida}
                      onChange={(e) => handleChange('monedaPreferida', e.target.value)}
                    >
                      <option value="COP">🇨🇴 Pesos Colombianos (COP $)</option>
                      <option value="USD">🇺🇸 Dólares Americanos (USD $)</option>
                    </select>
                  </div>
                </div>

                <label className="airbnb-checkbox-row" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={datosPerfil.solicitaExencionIva}
                    onChange={(e) => handleChange('solicitaExencionIva', e.target.checked)}
                    style={{ marginTop: '3px', accentColor: '#d91a2a' }}
                  />
                  <span style={{ fontSize: '0.82rem', color: '#334155' }}>
                    <strong>Confirmo que soy extranjero no residente</strong> y presentaré mi pasaporte con sello de entrada vigente al momento del check-in para acceder a la exención del 19% de IVA.
                  </span>
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem' }}>
                  <button
                    type="submit"
                    className="btn-airbnb-primary"
                    style={{ width: 'auto', padding: '0.65rem 2rem', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)' }}
                  >
                    Guardar Preferencias Internacionales
                  </button>
                </div>
              </form>
            )}

            {/* =====================================================================
                4. NOTIFICACIONES Y NOVEDADES DE RESERVA
               ===================================================================== */}
            {tabActiva === 'notificaciones' && (
              <form onSubmit={handleGuardarCambios}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#d91a2a', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    <Bell size={14} /> Alertas de Estadía
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                    Novedades de Reserva & Notificaciones
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                    Elige cómo deseas recibir las confirmaciones de viaje, códigos de apertura de cerraduras digitales y avisos de estadía.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  
                  {/* WhatsApp Check-in */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                        Notificaciones y Claves de Acceso por WhatsApp
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Recibe la confirmación inmediata y tu código de cerradura digital al móvil {datosPerfil.telefono || 'registrado'}.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={datosPerfil.notifWhatsapp}
                      onChange={(e) => handleChange('notifWhatsapp', e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: '#d91a2a', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Correo Check-in / Check-out */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                        Recordatorios de Check-in (3:00 PM) y Check-out (11:00 AM)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Te avisaremos con anticipación con instrucciones de llegada, conexión Wi-Fi y salida para que tu experiencia sea fluida.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={datosPerfil.notifCorreoCheckin}
                      onChange={(e) => handleChange('notifCorreoCheckin', e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: '#d91a2a', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Novedades y Cambios en Reservas */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                        Novedades y Actualizaciones del Apartahotel
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Avisos importantes sobre mantenimiento programado, disponibilidad de salas de juntas o servicios en El Chicó.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={datosPerfil.notifNovedadesReserva}
                      onChange={(e) => handleChange('notifNovedadesReserva', e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: '#d91a2a', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Ofertas y Promociones */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                        Descuentos Exclusivos para Próximas Estadías
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Tarifas especiales para huéspedes frecuentes en temporadas de vacaciones o viajes de negocios.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={datosPerfil.notifPromociones}
                      onChange={(e) => handleChange('notifPromociones', e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: '#d91a2a', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem' }}>
                  <button
                    type="submit"
                    className="btn-airbnb-primary"
                    style={{ width: 'auto', padding: '0.65rem 2rem', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)' }}
                  >
                    Guardar Preferencias de Notificación
                  </button>
                </div>
              </form>
            )}

            {/* =====================================================================
                5. INICIO DE SESIÓN Y SEGURIDAD
               ===================================================================== */}
            {tabActiva === 'seguridad' && (
              <div>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#d91a2a', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    <Lock size={14} /> Acceso Seguro
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                    Inicio de Sesión y Seguridad
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                    Administra tus credenciales de acceso al portal y revisa tu sesión activa.
                  </p>
                </div>

                {/* Sesión Activa */}
                <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      <MapPin size={16} color="#059669" />
                      <span>Sesión Activa en Portal Web</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)' }}>
                      ACTUAL
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Bogotá D.C., Colombia • Navegador web seguro con almacenamiento local cifrado.
                  </div>
                </div>

                {/* Formulario de actualización de contraseña */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (datosPerfil.nuevaClave && datosPerfil.nuevaClave !== datosPerfil.confirmarClave) {
                    setAlert({ type: 'error', message: 'Las contraseñas no coinciden.' });
                    return;
                  }
                  handleGuardarCambios();
                  setAlert({ type: 'success', message: 'Contraseña actualizada con éxito.' });
                  handleChange('nuevaClave', '');
                  handleChange('confirmarClave', '');
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                    Actualizar Contraseña de Acceso
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                    <div className="form-field">
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        className="input-airbnb"
                        value={datosPerfil.nuevaClave}
                        onChange={(e) => handleChange('nuevaClave', e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>

                    <div className="form-field">
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        className="input-airbnb"
                        value={datosPerfil.confirmarClave}
                        onChange={(e) => handleChange('confirmarClave', e.target.value)}
                        placeholder="Repite la contraseña"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem' }}>
                    <button
                      type="submit"
                      disabled={!datosPerfil.nuevaClave}
                      className="btn-airbnb-primary"
                      style={{
                        width: 'auto',
                        padding: '0.65rem 2rem',
                        borderRadius: 'var(--radius-pill)',
                        background: datosPerfil.nuevaClave ? 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)' : '#cbd5e1',
                        cursor: datosPerfil.nuevaClave ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Actualizar Contraseña
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaPerfil;
