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
  MapPin,
  Eye,
  EyeOff,
  KeyRound,
  Clock,
  MessageSquare,
  Briefcase,
  Hash
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

  // Estados solicitados para Información Personal Oficial
  const [nombreCompleto, setNombreCompleto] = useState(selectedHuesped?.nombre || '');
  const [correo, setCorreo] = useState(selectedHuesped?.correo || '');
  const [tipoDocumento, setTipoDocumento] = useState(guestProfileExtras?.tipoDoc || 'CC');
  const [numeroDocumento, setNumeroDocumento] = useState(selectedHuesped?.documento || '');
  const [indicativo, setIndicativo] = useState(guestProfileExtras?.indicativo || '+57');
  const [telefono, setTelefono] = useState(selectedHuesped?.telefono || '');
  const [pais, setPais] = useState(guestProfileExtras?.paisOrigen || 'Colombia');
  const [ciudad, setCiudad] = useState(guestProfileExtras?.ciudad || 'Bogotá');

  // Sincronización si selectedHuesped o extras cambian
  React.useEffect(() => {
    if (selectedHuesped) {
      setNombreCompleto(selectedHuesped.nombre || '');
      setCorreo(selectedHuesped.correo || '');
      setNumeroDocumento(selectedHuesped.documento || '');
      setTelefono(selectedHuesped.telefono || '');
    }
    if (guestProfileExtras) {
      if (guestProfileExtras.tipoDoc) setTipoDocumento(guestProfileExtras.tipoDoc);
      if (guestProfileExtras.indicativo) setIndicativo(guestProfileExtras.indicativo);
      if (guestProfileExtras.paisOrigen) setPais(guestProfileExtras.paisOrigen);
      if (guestProfileExtras.ciudad) setCiudad(guestProfileExtras.ciudad);
    }
  }, [selectedHuesped, guestProfileExtras]);

  // Visibilidad de contraseñas
  const [showClaveActual, setShowClaveActual] = useState(false);
  const [showNuevaClave, setShowNuevaClave] = useState(false);
  const [showConfirmarClave, setShowConfirmarClave] = useState(false);

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
    esEmpresa: guestProfileExtras?.esEmpresa ?? false,
    razonSocial: guestProfileExtras?.razonSocial || '',
    nit: guestProfileExtras?.nit || '',
    correoFacturacion: guestProfileExtras?.correoFacturacion || '',
    telefonoEmpresa: guestProfileExtras?.telefonoEmpresa || '',
    direccionFiscal: guestProfileExtras?.direccionFiscal || '',
    ciudadFiscal: guestProfileExtras?.ciudadFiscal || 'Bogotá D.C.',
    responsabilidadTributaria: guestProfileExtras?.responsabilidadTributaria || 'IVA Común (Responsable de IVA)',
    ciiu: guestProfileExtras?.ciiu || '',
    // Extranjería & Exención de IVA
    numeroPasaporte: guestProfileExtras?.numeroPasaporte || '',
    paisEmisorPasaporte: guestProfileExtras?.paisEmisorPasaporte || '',
    fechaVencimientoPasaporte: guestProfileExtras?.fechaVencimientoPasaporte || '',
    tipoPermisoMigratorio: guestProfileExtras?.tipoPermisoMigratorio || 'Permiso de Turismo (PT - 19% Exento)',
    monedaPreferida: guestProfileExtras?.monedaPreferida || 'COP',
    idiomaPreferido: guestProfileExtras?.idiomaPreferido || 'es',
    paisProcedenciaVuelo: guestProfileExtras?.paisProcedenciaVuelo || '',
    fechaIngresoPais: guestProfileExtras?.fechaIngresoPais || '',
    solicitaExencionIva: guestProfileExtras?.solicitaExencionIva ?? true,
    // Notificaciones de reserva
    notifWhatsapp: guestProfileExtras?.notifWhatsapp ?? true,
    notifCorreoCheckin: guestProfileExtras?.notifCorreoCheckin ?? true,
    notifNovedadesReserva: guestProfileExtras?.notifNovedadesReserva ?? true,
    notifPromociones: guestProfileExtras?.notifPromociones ?? false,
    horarioContacto: guestProfileExtras?.horarioContacto || 'Cualquier hora (24/7)',
    idiomaNotificaciones: guestProfileExtras?.idiomaNotificaciones || 'Español',
    // Seguridad
    claveActual: '',
    nuevaClave: '',
    confirmarClave: '',
    metodoRecuperacion: guestProfileExtras?.metodoRecuperacion || 'Correo Electrónico Registrado'
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

  const handleGuardarInformacionPersonal = (e) => {
    e?.preventDefault();
    try {
      const mergedExtras = {
        ...guestProfileExtras,
        tipoDoc: tipoDocumento,
        indicativo: indicativo,
        paisOrigen: pais,
        ciudad: ciudad
      };
      setGuestProfileExtras(mergedExtras);
      localStorage.setItem('bookingsoft_guest_profile_extras', JSON.stringify(mergedExtras));

      if (selectedHuesped) {
        const updated = {
          ...selectedHuesped,
          nombre: nombreCompleto,
          telefono: telefono,
          documento: numeroDocumento,
          correo: correo
        };
        setSelectedHuesped(updated);
        localStorage.setItem('bookingsoft_guest_user', JSON.stringify(updated));
      }

      setDatosPerfil(prev => ({
        ...prev,
        nombre: nombreCompleto,
        correo: correo,
        tipoDoc: tipoDocumento,
        documento: numeroDocumento,
        indicativo: indicativo,
        telefono: telefono,
        paisOrigen: pais,
        ciudad: ciudad
      }));

      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 4000);
    } catch (err) {
      console.error('Error al guardar información personal:', err);
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
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* TARJETA CENTRAL: INFORMACIÓN PERSONAL OFICIAL */}
            {tabActiva === 'personal' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                {/* Cabecera del Panel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Información Personal Oficial
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Datos requeridos por la legislación colombiana (MinCIT) para el registro de huéspedes y tarjeta de alojamiento en Apartamentos Facile.
                    </p>
                  </div>
                  <span className="self-start sm:self-center text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                    Registro Sire / MinCIT
                  </span>
                </div>

                {/* Formulario en Cuadrícula de 2 Columnas */}
                <form onSubmit={handleGuardarInformacionPersonal} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nombre Completo */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Nombre Completo Legal <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="text"
                        value={nombreCompleto}
                        onChange={(e) => setNombreCompleto(e.target.value)}
                        placeholder="Como figura en tu documento oficial"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Como figura en su documento de identidad.</span>
                    </div>

                    {/* Correo Electrónico */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Correo Electrónico Principal <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Donde recibirás códigos de cerradura digital y confirmación.</span>
                    </div>

                    {/* Tipo de Documento */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Tipo de Documento <span className="text-[#d91a2a]">*</span>
                      </label>
                      <select
                        value={tipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none cursor-pointer"
                      >
                        <option value="CC">Cédula de Ciudadanía (CC)</option>
                        <option value="CE">Cédula de Extranjería (CE)</option>
                        <option value="PAS">Pasaporte Internacional</option>
                        <option value="NIT">NIT / RUT Corporativo</option>
                      </select>
                      <span className="text-[11px] text-slate-500 mt-1 block">Obligatorio para la tarjeta de registro hotelero.</span>
                    </div>

                    {/* Número de Documento */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Número de Documento <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="text"
                        value={numeroDocumento}
                        onChange={(e) => setNumeroDocumento(e.target.value)}
                        placeholder="Sin puntos ni guiones"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Sin puntos, espacios ni guiones.</span>
                    </div>

                    {/* Indicativo Telefónico */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Indicativo de País <span className="text-[#d91a2a]">*</span>
                      </label>
                      <select
                        value={indicativo}
                        onChange={(e) => setIndicativo(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none cursor-pointer"
                      >
                        <option value="+57">🇨🇴 +57 (Colombia)</option>
                        <option value="+1">🇺🇸 +1 (Estados Unidos)</option>
                        <option value="+34">🇪🇸 +34 (España)</option>
                        <option value="+52">🇲🇽 +52 (México)</option>
                      </select>
                      <span className="text-[11px] text-slate-500 mt-1 block">Para el envío de novedades vía WhatsApp.</span>
                    </div>

                    {/* Teléfono Móvil */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Teléfono Móvil (WhatsApp) <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="3116334957"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Canal para entrega de clave digital del apartamento.</span>
                    </div>

                    {/* País de Residencia */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        País de Residencia <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="text"
                        value={pais}
                        onChange={(e) => setPais(e.target.value)}
                        placeholder="Colombia"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Los no residentes en Colombia tienen exención de IVA (19%).</span>
                    </div>

                    {/* Ciudad */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Ciudad de Origen / Residencia <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="text"
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        placeholder="Bogotá"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Ciudad actual de residencia.</span>
                    </div>
                  </div>

                  {/* Pie de Formulario */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-[#d91a2a] hover:bg-[#b91522] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#d91a2a]/20 hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      Guardar Información Personal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* =====================================================================
                2. EMPRESAS Y FACTURACIÓN ELECTRÓNICA DIAN
               ===================================================================== */}
            {tabActiva === 'empresas' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                {/* Cabecera del Panel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Facturación Electrónica DIAN para Empresas
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Registro oficial de persona jurídica o natural con NIT para expedición de factura electrónica validada ante la DIAN.
                    </p>
                  </div>
                  <span className="self-start sm:self-center text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                    Validación DIAN / RUT
                  </span>
                </div>

                <form onSubmit={handleGuardarCambios} className="space-y-6">
                  {/* Switch de modo corporativo */}
                  <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70">
                    <div className="pr-4">
                      <div className="text-sm font-extrabold text-slate-900 leading-snug">¿Facturar mis estadías a nombre de una Empresa?</div>
                      <p className="text-xs text-slate-500 mt-1 m-0 leading-relaxed">Emitiremos la factura electrónica oficial directamente al NIT de tu compañía.</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={datosPerfil.esEmpresa}
                        onChange={(e) => handleChange('esEmpresa', e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                      />
                      <span style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: datosPerfil.esEmpresa ? '#d91a2a' : '#cbd5e1',
                        borderRadius: '9999px', transition: 'background-color 0.2s ease'
                      }}>
                        <span style={{
                          position: 'absolute', height: '20px', width: '20px', left: '3px', bottom: '3px',
                          backgroundColor: '#ffffff', borderRadius: '50%', transition: 'transform 0.2s ease',
                          transform: datosPerfil.esEmpresa ? 'translateX(22px)' : 'none',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Razón Social */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Razón Social de la Empresa <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="text"
                        value={datosPerfil.razonSocial}
                        onChange={(e) => handleChange('razonSocial', e.target.value)}
                        placeholder="Ej: Soluciones Tecnológicas SAS"
                        required={datosPerfil.esEmpresa}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Nombre legal completo registrado ante Cámara de Comercio.</span>
                    </div>

                    {/* NIT */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        NIT de la Compañía <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="text"
                        value={datosPerfil.nit}
                        onChange={(e) => handleChange('nit', e.target.value)}
                        placeholder="Ej: 901.456.789-1"
                        required={datosPerfil.esEmpresa}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Incluye el dígito de verificación (Ej: 901.456.789-1).</span>
                    </div>

                    {/* Correo Facturación */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Correo para Facturación Electrónica DIAN <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="email"
                        value={datosPerfil.correoFacturacion}
                        onChange={(e) => handleChange('correoFacturacion', e.target.value)}
                        placeholder="facturacion@tuempresa.com"
                        required={datosPerfil.esEmpresa}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Buzón electrónico corporativo para envío del XML y PDF oficial.</span>
                    </div>

                    {/* Teléfono Empresa */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Teléfono de Contacto Corporativo <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={datosPerfil.telefonoEmpresa}
                        onChange={(e) => handleChange('telefonoEmpresa', e.target.value)}
                        placeholder="Ej: +57 601 7458900"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Línea directa del área contable o administrativa.</span>
                    </div>

                    {/* Dirección Fiscal */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Dirección Fiscal Registrada <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="text"
                        value={datosPerfil.direccionFiscal}
                        onChange={(e) => handleChange('direccionFiscal', e.target.value)}
                        placeholder="Ej: Cra 11 # 93-45, Oficina 402"
                        required={datosPerfil.esEmpresa}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Dirección fiscal según constancia en el RUT corporativo.</span>
                    </div>

                    {/* Ciudad Fiscal */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Ciudad / Municipio Fiscal <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="text"
                        value={datosPerfil.ciudadFiscal}
                        onChange={(e) => handleChange('ciudadFiscal', e.target.value)}
                        placeholder="Ej: Bogotá D.C."
                        required={datosPerfil.esEmpresa}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Municipio de domicilio fiscal de la compañía.</span>
                    </div>

                    {/* Responsabilidad Tributaria */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Responsabilidad Tributaria <span className="text-[#d91a2a]">*</span>
                      </label>
                      <select
                        value={datosPerfil.responsabilidadTributaria}
                        onChange={(e) => handleChange('responsabilidadTributaria', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none cursor-pointer"
                      >
                        <option value="IVA Común (Responsable de IVA)">IVA Común (Responsable de IVA)</option>
                        <option value="No Responsable de IVA">No Responsable de IVA</option>
                        <option value="Gran Contribuyente">Gran Contribuyente</option>
                        <option value="Autorretenedor">Autorretenedor</option>
                      </select>
                      <span className="text-[11px] text-slate-500 mt-1 block">Régimen tributario aplicable para retenciones en la fuente.</span>
                    </div>

                    {/* CIIU */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Código de Actividad Económica (CIIU)
                      </label>
                      <input
                        type="text"
                        value={datosPerfil.ciiu}
                        onChange={(e) => handleChange('ciiu', e.target.value)}
                        placeholder="Ej: 6201 (Desarrollo de software)"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Código de 4 dígitos según casilla 46 del RUT corporativo.</span>
                    </div>
                  </div>

                  {/* Convenio Corporativo Facile */}
                  <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs sm:text-sm">
                    <span className="text-2xl shrink-0 leading-none">🏢</span>
                    <div className="flex-1 min-w-0">
                      <strong className="font-extrabold text-emerald-950 block mb-0.5">Convenio Corporativo Facile:</strong>
                      <p className="text-emerald-800 leading-relaxed text-xs sm:text-sm m-0">Reservas acumuladas de más de 10 noches al mes obtienen 15% de descuento directo y acceso preferencial a Salas de Juntas del Centro de Negocios.</p>
                    </div>
                  </div>

                  {/* Pie de Formulario */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-[#d91a2a] hover:bg-[#b91522] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#d91a2a]/20 hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      Guardar Datos de Facturación
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* =====================================================================
                3. HUÉSPEDES EXTRANJEROS & BENEFICIOS
               ===================================================================== */}
            {tabActiva === 'extranjeros' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                {/* Cabecera del Panel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Huéspedes Extranjeros & Exención de IVA
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Registro migratorio internacional conforme a la plataforma SIRE y solicitud de exención del 19% de IVA (Decreto 297 de 2016).
                    </p>
                  </div>
                  <span className="self-start sm:self-center text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                    Decreto 297/2016 / SIRE
                  </span>
                </div>

                <form onSubmit={handleGuardarCambios} className="space-y-6">
                  {/* Banner Exención Legal de IVA (19%) */}
                  <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs sm:text-sm">
                    <ShieldCheck size={22} className="text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-blue-950 text-sm mb-1">Exención Legal de IVA (19%) para Turistas Extranjeros</div>
                      <p className="text-blue-800 leading-relaxed text-xs sm:text-sm m-0">
                        Los ciudadanos extranjeros no residentes en Colombia que ingresen al país con sello de permiso de turismo (PT) están legalmente exentos del 19% de IVA en servicios de alojamiento hotelero.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Número de Pasaporte */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Número de Pasaporte Internacional <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="text"
                        value={datosPerfil.numeroPasaporte}
                        onChange={(e) => handleChange('numeroPasaporte', e.target.value.toUpperCase())}
                        placeholder="Ej: A12345678"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none uppercase"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Número alfanumérico tal como figura en la libreta del pasaporte.</span>
                    </div>

                    {/* País Emisor */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        País Emisor del Pasaporte <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="text"
                        value={datosPerfil.paisEmisorPasaporte}
                        onChange={(e) => handleChange('paisEmisorPasaporte', e.target.value)}
                        placeholder="Ej: United States, España, México..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">País que expidió el documento de viaje internacional.</span>
                    </div>

                    {/* Fecha de Vencimiento */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Fecha de Vencimiento del Pasaporte <span className="text-[#d91a2a]">*</span>
                      </label>
                      <input
                        type="date"
                        value={datosPerfil.fechaVencimientoPasaporte}
                        onChange={(e) => handleChange('fechaVencimientoPasaporte', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Debe tener vigencia mínima de 6 meses para ingreso hotelero.</span>
                    </div>

                    {/* Tipo de Permiso */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Tipo de Permiso Migratorio <span className="text-[#d91a2a]">*</span>
                      </label>
                      <select
                        value={datosPerfil.tipoPermisoMigratorio}
                        onChange={(e) => handleChange('tipoPermisoMigratorio', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none cursor-pointer"
                      >
                        <option value="Permiso de Turismo (PT - 19% Exento)">Permiso de Turismo (PT - 19% Exento)</option>
                        <option value="Visa de Negocios (V)">Visa de Negocios (V)</option>
                        <option value="Visa de Trabajo (M)">Visa de Trabajo (M)</option>
                        <option value="Comunidad Andina (CAN)">Comunidad Andina (CAN)</option>
                      </select>
                      <span className="text-[11px] text-slate-500 mt-1 block">Tipo de sello o estatus otorgado por Migración Colombia.</span>
                    </div>

                    {/* Idioma Preferido */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Idioma Preferido de Comunicación <span className="text-[#d91a2a]">*</span>
                      </label>
                      <select
                        value={datosPerfil.idiomaPreferido}
                        onChange={(e) => handleChange('idiomaPreferido', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none cursor-pointer"
                      >
                        <option value="es">🇪🇸 Español (Colombia / Latam)</option>
                        <option value="en">🇺🇸 English (US / Global)</option>
                        <option value="fr">🇫🇷 Français (France)</option>
                        <option value="pt">🇧🇷 Português (Brasil)</option>
                      </select>
                      <span className="text-[11px] text-slate-500 mt-1 block">Idioma para confirmaciones de reserva y atención del concierge.</span>
                    </div>

                    {/* Moneda Preferida */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Moneda de Visualización & Cobro <span className="text-[#d91a2a]">*</span>
                      </label>
                      <select
                        value={datosPerfil.monedaPreferida}
                        onChange={(e) => handleChange('monedaPreferida', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none cursor-pointer"
                      >
                        <option value="COP">🇨🇴 Pesos Colombianos (COP $)</option>
                        <option value="USD">🇺🇸 Dólares Americanos (USD $)</option>
                        <option value="EUR">🇪🇺 Euros (EUR €)</option>
                      </select>
                      <span className="text-[11px] text-slate-500 mt-1 block">Moneda preferida para cotizaciones y estados de cuenta.</span>
                    </div>

                    {/* Procedencia Vuelo */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        País de Procedencia del Vuelo
                      </label>
                      <input
                        type="text"
                        value={datosPerfil.paisProcedenciaVuelo}
                        onChange={(e) => handleChange('paisProcedenciaVuelo', e.target.value)}
                        placeholder="Ej: Estados Unidos, España, México..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Último país antes de tu llegada a Bogotá El Dorado.</span>
                    </div>

                    {/* Fecha de Entrada */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Fecha Estimada de Entrada al País
                      </label>
                      <input
                        type="date"
                        value={datosPerfil.fechaIngresoPais}
                        onChange={(e) => handleChange('fechaIngresoPais', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Fecha del sello migratorio de ingreso a Colombia.</span>
                    </div>
                  </div>

                  {/* Juramento de no residente */}
                  <label className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={datosPerfil.solicitaExencionIva}
                      onChange={(e) => handleChange('solicitaExencionIva', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-[#d91a2a] focus:ring-[#d91a2a]/20 cursor-pointer shrink-0 mt-0.5"
                      style={{ accentColor: '#d91a2a' }}
                    />
                    <div className="flex-1 min-w-0 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 font-bold block mb-0.5">Declaración Juramentada de Extranjero No Residente</strong>
                      <p className="text-slate-600 m-0 leading-relaxed">
                        Confirmo bajo gravedad de juramento que soy extranjero no residente en Colombia y presentaré mi pasaporte con sello de turismo vigente al momento del check-in para acceder a la exención legal del 19% de IVA según el Decreto 297 de 2016.
                      </p>
                    </div>
                  </label>

                  {/* Pie de Formulario */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-[#d91a2a] hover:bg-[#b91522] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#d91a2a]/20 hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      Guardar Preferencias Internacionales
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* =====================================================================
                4. NOTIFICACIONES Y NOVEDADES DE RESERVA
               ===================================================================== */}
            {tabActiva === 'notificaciones' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                {/* Cabecera del Panel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Novedades de Reserva & Alertas de Estadía
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Elige cómo deseas recibir las confirmaciones de viaje, códigos de apertura de cerraduras digitales y avisos de estadía.
                    </p>
                  </div>
                  <span className="self-start sm:self-center text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                    Notificaciones 24/7
                  </span>
                </div>

                <form onSubmit={handleGuardarCambios} className="space-y-6">
                  {/* Grilla 2x2 de Canales Ejecutivos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* WhatsApp Check-in */}
                    <label className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all cursor-pointer flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <Phone size={19} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 leading-snug">WhatsApp Concierge & Smart Key</div>
                            <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                              Canal Instantáneo
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={datosPerfil.notifWhatsapp}
                          onChange={(e) => handleChange('notifWhatsapp', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-[#d91a2a] focus:ring-[#d91a2a]/20 cursor-pointer shrink-0 mt-0.5"
                          style={{ accentColor: '#d91a2a' }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed m-0">
                        Envío automático del código PIN de la cerradura digital 2 horas antes de tu check-in (3:00 PM) al móvil registrado.
                      </p>
                    </label>

                    {/* Correo Check-in / Comprobantes */}
                    <label className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all cursor-pointer flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Mail size={19} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 leading-snug">Comprobantes Oficiales por Email</div>
                            <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200/60">
                              Documento Legal
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={datosPerfil.notifCorreoCheckin}
                          onChange={(e) => handleChange('notifCorreoCheckin', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-[#d91a2a] focus:ring-[#d91a2a]/20 cursor-pointer shrink-0 mt-0.5"
                          style={{ accentColor: '#d91a2a' }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed m-0">
                        Envío de voucher oficial en PDF, factura proforma, ubicación con Waze/Maps y código QR de confirmación.
                      </p>
                    </label>

                    {/* Recordatorios de Horarios */}
                    <label className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all cursor-pointer flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <Clock size={19} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 leading-snug">Horarios (3:00 PM / 11:00 AM)</div>
                            <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200/60">
                              Puntualidad
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={datosPerfil.notifNovedadesReserva}
                          onChange={(e) => handleChange('notifNovedadesReserva', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-[#d91a2a] focus:ring-[#d91a2a]/20 cursor-pointer shrink-0 mt-0.5"
                          style={{ accentColor: '#d91a2a' }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed m-0">
                        Instrucciones anticipadas de llegada, clave Wi-Fi 300 Mbps y protocolo ágil de salida sin filas ni esperas.
                      </p>
                    </label>

                    {/* Tarifas Exclusivas y Promociones */}
                    <label className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all cursor-pointer flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-100 text-[#d91a2a] flex items-center justify-center shrink-0">
                            <Sparkles size={19} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 leading-snug">Club de Lealtad & Tarifas VIP</div>
                            <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-[#b91522] border border-rose-200/60">
                              Beneficios Facile
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={datosPerfil.notifPromociones}
                          onChange={(e) => handleChange('notifPromociones', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-[#d91a2a] focus:ring-[#d91a2a]/20 cursor-pointer shrink-0 mt-0.5"
                          style={{ accentColor: '#d91a2a' }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed m-0">
                        Descuentos especiales de hasta el 20% en estancias medias y largas y tarifas preferenciales de fin de semana.
                      </p>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    {/* Horario Preferido */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Horario Preferido para Contacto <span className="text-[#d91a2a]">*</span>
                      </label>
                      <select
                        value={datosPerfil.horarioContacto}
                        onChange={(e) => handleChange('horarioContacto', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none cursor-pointer"
                      >
                        <option value="Cualquier hora (24/7)">Cualquier hora (Servicio Concierge 24/7)</option>
                        <option value="Solo horario diurno (8:00 AM - 8:00 PM)">Solo horario diurno (8:00 AM - 8:00 PM)</option>
                        <option value="Solo emergencias de reserva">Solo emergencias o cambios de reserva</option>
                      </select>
                      <span className="text-[11px] text-slate-500 mt-1 block">Respetamos tu descanso durante estadías de negocios y turismo.</span>
                    </div>

                    {/* Idioma Notificaciones */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Idioma de las Notificaciones <span className="text-[#d91a2a]">*</span>
                      </label>
                      <select
                        value={datosPerfil.idiomaNotificaciones}
                        onChange={(e) => handleChange('idiomaNotificaciones', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none cursor-pointer"
                      >
                        <option value="Español">🇪🇸 Español (Latinoamérica)</option>
                        <option value="English">🇺🇸 English (International)</option>
                      </select>
                      <span className="text-[11px] text-slate-500 mt-1 block">Idioma para mensajes de texto, WhatsApp y plantillas de correo.</span>
                    </div>
                  </div>

                  {/* Pie de Formulario */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-[#d91a2a] hover:bg-[#b91522] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#d91a2a]/20 hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      Guardar Preferencias de Alertas
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* =====================================================================
                5. INICIO DE SESIÓN Y SEGURIDAD
               ===================================================================== */}
            {tabActiva === 'seguridad' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                {/* Cabecera del Panel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Seguridad de la Cuenta & Control de Acceso
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Administra tus credenciales de acceso seguro al portal, monitorea tus sesiones activas y actualiza tu clave.
                    </p>
                  </div>
                  <span className="self-start sm:self-center text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                    Cifrado SHA-256 / SSL
                  </span>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (datosPerfil.nuevaClave && datosPerfil.nuevaClave.length < 6) {
                    setAlert({ type: 'error', message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
                    return;
                  }
                  if (datosPerfil.nuevaClave && datosPerfil.nuevaClave !== datosPerfil.confirmarClave) {
                    setAlert({ type: 'error', message: 'Las contraseñas no coinciden.' });
                    return;
                  }
                  handleGuardarCambios();
                  setAlert({ type: 'success', message: 'Credenciales de acceso actualizadas con éxito.' });
                  handleChange('claveActual', '');
                  handleChange('nuevaClave', '');
                  handleChange('confirmarClave', '');
                }} className="space-y-6">

                  {/* Sesión Activa */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                        <MapPin size={17} className="text-emerald-600 shrink-0" />
                        <span>Sesión Activa en Navegador Web Seguro</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ACTIVA AHORA
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 m-0 leading-relaxed">
                      Bogotá D.C., Colombia • Almacenamiento local cifrado y token de sesión verificado para {datosPerfil.correo}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Contraseña Actual */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Contraseña Actual (Opcional)
                      </label>
                      <div className="relative w-full">
                        <input
                          type={showClaveActual ? "text" : "password"}
                          value={datosPerfil.claveActual}
                          onChange={(e) => handleChange('claveActual', e.target.value)}
                          placeholder="Ingresa tu clave actual"
                          className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowClaveActual(!showClaveActual)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                          aria-label="Ver u ocultar clave actual"
                        >
                          {showClaveActual ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Para validar tu identidad antes de efectuar cambios.</span>
                    </div>

                    {/* Método de Recuperación */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Método de Recuperación de Cuenta <span className="text-[#d91a2a]">*</span>
                      </label>
                      <select
                        value={datosPerfil.metodoRecuperacion}
                        onChange={(e) => handleChange('metodoRecuperacion', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none cursor-pointer"
                      >
                        <option value="Correo Electrónico Registrado">Correo Electrónico Registrado ({datosPerfil.correo})</option>
                        <option value="Mensaje SMS / WhatsApp">Mensaje WhatsApp ({datosPerfil.telefono || 'Teléfono'})</option>
                      </select>
                      <span className="text-[11px] text-slate-500 mt-1 block">Canal de respaldo en caso de olvidar tu clave de acceso.</span>
                    </div>

                    {/* Nueva Contraseña */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Nueva Contraseña de Acceso <span className="text-[#d91a2a]">*</span>
                      </label>
                      <div className="relative w-full">
                        <input
                          type={showNuevaClave ? "text" : "password"}
                          value={datosPerfil.nuevaClave}
                          onChange={(e) => handleChange('nuevaClave', e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNuevaClave(!showNuevaClave)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                          aria-label="Ver u ocultar nueva contraseña"
                        >
                          {showNuevaClave ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Mínimo 6 caracteres, combina letras y números.</span>
                    </div>

                    {/* Confirmar Contraseña */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Confirmar Nueva Contraseña <span className="text-[#d91a2a]">*</span>
                      </label>
                      <div className="relative w-full">
                        <input
                          type={showConfirmarClave ? "text" : "password"}
                          value={datosPerfil.confirmarClave}
                          onChange={(e) => handleChange('confirmarClave', e.target.value)}
                          placeholder="Repite la nueva contraseña"
                          className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#d91a2a] focus:ring-2 focus:ring-[#d91a2a]/10 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmarClave(!showConfirmarClave)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                          aria-label="Ver u ocultar confirmación de contraseña"
                        >
                          {showConfirmarClave ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Debe coincidir exactamente con la nueva clave.</span>
                    </div>
                  </div>

                  {/* Pie de Formulario */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={!datosPerfil.nuevaClave}
                      className={`px-8 py-3 rounded-xl text-white text-xs sm:text-sm font-extrabold shadow-md transition-all whitespace-nowrap ${
                        datosPerfil.nuevaClave 
                          ? 'bg-[#d91a2a] hover:bg-[#b91522] shadow-[#d91a2a]/20 hover:shadow-lg cursor-pointer' 
                          : 'bg-slate-300 cursor-not-allowed opacity-60'
                      }`}
                    >
                      Actualizar Contraseña y Seguridad
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
