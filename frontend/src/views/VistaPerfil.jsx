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

                  {/* Pie de Formulario: Privacidad y Botón Guardar */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="text-emerald-600 font-bold">🔒</span>
                      <span>Tus datos están protegidos bajo la <strong>Ley 1581 de 2012 (Habeas Data)</strong> y encriptación SSL de 256 bits.</span>
                    </div>

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
              <form onSubmit={handleGuardarCambios}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                      Facturación Electrónica DIAN para Empresas
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                      Registro oficial de persona jurídica o natural con NIT para expedición de factura electrónica validada ante la DIAN.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}>
                    Validación DIAN / RUT
                  </span>
                </div>

                {/* Switch de modo corporativo */}
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      RAZÓN SOCIAL DE LA EMPRESA <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input-airbnb"
                        value={datosPerfil.razonSocial}
                        onChange={(e) => handleChange('razonSocial', e.target.value)}
                        placeholder="Ej: Soluciones Tecnológicas SAS"
                        required={datosPerfil.esEmpresa}
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <Building2 size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Nombre legal completo registrado ante Cámara de Comercio.
                    </span>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      NIT DE LA COMPAÑÍA <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input-airbnb"
                        value={datosPerfil.nit}
                        onChange={(e) => handleChange('nit', e.target.value)}
                        placeholder="Ej: 901.456.789-1"
                        required={datosPerfil.esEmpresa}
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <Hash size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Incluye el dígito de verificación (Ej: 901.456.789-1).
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      CORREO PARA FACTURACIÓN ELECTRÓNICA DIAN <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        className="input-airbnb"
                        value={datosPerfil.correoFacturacion}
                        onChange={(e) => handleChange('correoFacturacion', e.target.value)}
                        placeholder="facturacion@tuempresa.com"
                        required={datosPerfil.esEmpresa}
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <Mail size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Buzón electrónico corporativo para envío del XML y PDF oficial.
                    </span>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      TELÉFONO DE CONTACTO CORPORATIVO <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        className="input-airbnb"
                        value={datosPerfil.telefonoEmpresa}
                        onChange={(e) => handleChange('telefonoEmpresa', e.target.value)}
                        placeholder="Ej: +57 601 7458900"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <Phone size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Línea directa del área contable o administrativa.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      DIRECCIÓN FISCAL REGISTRADA <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input-airbnb"
                        value={datosPerfil.direccionFiscal}
                        onChange={(e) => handleChange('direccionFiscal', e.target.value)}
                        placeholder="Ej: Cra 11 # 93-45, Oficina 402"
                        required={datosPerfil.esEmpresa}
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Dirección fiscal según constancia en el RUT corporativo.
                    </span>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      CIUDAD / MUNICIPIO FISCAL <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input-airbnb"
                        value={datosPerfil.ciudadFiscal}
                        onChange={(e) => handleChange('ciudadFiscal', e.target.value)}
                        placeholder="Ej: Bogotá D.C."
                        required={datosPerfil.esEmpresa}
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Municipio de domicilio fiscal de la compañía.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      RESPONSABILIDAD TRIBUTARIA <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <select
                      className="input-airbnb"
                      value={datosPerfil.responsabilidadTributaria}
                      onChange={(e) => handleChange('responsabilidadTributaria', e.target.value)}
                    >
                      <option value="IVA Común (Responsable de IVA)">IVA Común (Responsable de IVA)</option>
                      <option value="No Responsable de IVA">No Responsable de IVA</option>
                      <option value="Gran Contribuyente">Gran Contribuyente</option>
                      <option value="Autorretenedor">Autorretenedor</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Régimen tributario aplicable para retenciones en la fuente.
                    </span>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      CÓDIGO DE ACTIVIDAD ECONÓMICA (CIIU)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input-airbnb"
                        value={datosPerfil.ciiu}
                        onChange={(e) => handleChange('ciiu', e.target.value)}
                        placeholder="Ej: 6201 (Desarrollo de software)"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <Briefcase size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Código de 4 dígitos según casilla 46 del RUT corporativo.
                    </span>
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '0.9rem 1.15rem', fontSize: '0.82rem', color: '#166534', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Building2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Convenio Corporativo Facile:</strong> Reservas acumuladas de más de 10 noches al mes obtienen 15% de descuento directo y acceso preferencial a Salas de Juntas del Centro de Negocios.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.4 }}>
                    <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
                    <span>Emisión de factura electrónica validada en tiempo real ante la DIAN (Decreto 2242 / Ley 2010).</span>
                  </div>
                  <button
                    type="submit"
                    className="btn-airbnb-primary"
                    style={{ width: 'auto', padding: '0.65rem 2rem', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.88rem' }}
                  >
                    <CheckCircle2 size={16} /> Guardar Datos de Facturación
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
              <form onSubmit={handleGuardarCambios}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                      Huéspedes Extranjeros & Exención de IVA
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                      Registro migratorio internacional conforme a la plataforma SIRE y solicitud de exención del 19% de IVA (Decreto 297 de 2016).
                    </p>
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}>
                    Decreto 297/2016 / SIRE
                  </span>
                </div>

                {/* Banner informativo de exención del 19% de IVA */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <ShieldCheck size={22} color="#2563eb" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.15rem' }}>
                      Exención Legal de IVA (19%) para Turistas Extranjeros
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#3b82f6', lineHeight: 1.45 }}>
                      Los ciudadanos extranjeros no residentes en Colombia que ingresen al país con sello de permiso de turismo (PT) están legalmente exentos del 19% de IVA en servicios de alojamiento hotelero.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      NÚMERO DE PASAPORTE INTERNACIONAL <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input-airbnb"
                        value={datosPerfil.numeroPasaporte}
                        onChange={(e) => handleChange('numeroPasaporte', e.target.value.toUpperCase())}
                        placeholder="Ej: A12345678"
                        style={{ paddingRight: '2.5rem', textTransform: 'uppercase' }}
                      />
                      <Globe2 size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Número alfanumérico tal como figura en la libreta del pasaporte.
                    </span>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      PAÍS EMISOR DEL PASAPORTE <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input-airbnb"
                        value={datosPerfil.paisEmisorPasaporte}
                        onChange={(e) => handleChange('paisEmisorPasaporte', e.target.value)}
                        placeholder="Ej: United States, España, México..."
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      País que expidió el documento de viaje internacional.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      FECHA DE VENCIMIENTO DEL PASAPORTE <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="date"
                        className="input-airbnb"
                        value={datosPerfil.fechaVencimientoPasaporte}
                        onChange={(e) => handleChange('fechaVencimientoPasaporte', e.target.value)}
                        style={{ paddingRight: '2.5rem' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Debe tener vigencia mínima de 6 meses para ingreso hotelero.
                    </span>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      TIPO DE PERMISO MIGRATORIO <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <select
                      className="input-airbnb"
                      value={datosPerfil.tipoPermisoMigratorio}
                      onChange={(e) => handleChange('tipoPermisoMigratorio', e.target.value)}
                    >
                      <option value="Permiso de Turismo (PT - 19% Exento)">Permiso de Turismo (PT - 19% Exento)</option>
                      <option value="Visa de Negocios (V)">Visa de Negocios (V)</option>
                      <option value="Visa de Trabajo (M)">Visa de Trabajo (M)</option>
                      <option value="Comunidad Andina (CAN)">Comunidad Andina (CAN)</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Tipo de sello o estatus otorgado por Migración Colombia.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      IDIOMA PREFERIDO DE COMUNICACIÓN <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <select
                      className="input-airbnb"
                      value={datosPerfil.idiomaPreferido}
                      onChange={(e) => handleChange('idiomaPreferido', e.target.value)}
                    >
                      <option value="es">🇪🇸 Español (Colombia / Latam)</option>
                      <option value="en">🇺🇸 English (US / Global)</option>
                      <option value="fr">🇫🇷 Français (France)</option>
                      <option value="pt">🇧🇷 Português (Brasil)</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Idioma para confirmaciones de reserva y atención del concierge.
                    </span>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      MONEDA DE VISUALIZACIÓN & COBRO <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <select
                      className="input-airbnb"
                      value={datosPerfil.monedaPreferida}
                      onChange={(e) => handleChange('monedaPreferida', e.target.value)}
                    >
                      <option value="COP">🇨🇴 Pesos Colombianos (COP $)</option>
                      <option value="USD">🇺🇸 Dólares Americanos (USD $)</option>
                      <option value="EUR">🇪🇺 Euros (EUR €)</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Moneda preferida para cotizaciones y estados de cuenta.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      PAÍS DE PROCEDENCIA DEL VUELO
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input-airbnb"
                        value={datosPerfil.paisProcedenciaVuelo}
                        onChange={(e) => handleChange('paisProcedenciaVuelo', e.target.value)}
                        placeholder="Ej: Estados Unidos, España, México..."
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <Globe2 size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Último país antes de tu llegada a Bogotá El Dorado.
                    </span>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      FECHA ESTIMADA DE ENTRADA AL PAÍS
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="date"
                        className="input-airbnb"
                        value={datosPerfil.fechaIngresoPais}
                        onChange={(e) => handleChange('fechaIngresoPais', e.target.value)}
                        style={{ paddingRight: '2.5rem' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Fecha del sello migratorio de ingreso a Colombia.
                    </span>
                  </div>
                </div>

                <label style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '1.5rem' }}>
                  <input
                    type="checkbox"
                    checked={datosPerfil.solicitaExencionIva}
                    onChange={(e) => handleChange('solicitaExencionIva', e.target.checked)}
                    style={{ marginTop: '3px', accentColor: '#d91a2a', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                    <strong>Confirmo bajo gravedad de juramento que soy extranjero no residente</strong> y presentaré mi pasaporte con sello de turismo vigente al momento del check-in para acceder a la exención del 19% de IVA según el Decreto 297 de 2016.
                  </span>
                </label>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.4 }}>
                    <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
                    <span>Reporte automático al Sistema de Información para el Reporte de Extranjeros (SIRE - Migración Colombia).</span>
                  </div>
                  <button
                    type="submit"
                    className="btn-airbnb-primary"
                    style={{ width: 'auto', padding: '0.65rem 2rem', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.88rem' }}
                  >
                    <CheckCircle2 size={16} /> Guardar Preferencias Internacionales
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
              <form onSubmit={handleGuardarCambios}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                      Novedades de Reserva & Alertas de Estadía
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                      Elige cómo deseas recibir las confirmaciones de viaje, códigos de apertura de cerraduras digitales y avisos de estadía.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}>
                    Notificaciones 24/7
                  </span>
                </div>

                {/* Grilla 2x2 de Canales Ejecutivos */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  {/* WhatsApp Check-in */}
                  <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Phone size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>WhatsApp Concierge & Smart Key</div>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)' }}>Canal Instantáneo</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={datosPerfil.notifWhatsapp}
                        onChange={(e) => handleChange('notifWhatsapp', e.target.checked)}
                        style={{ width: '20px', height: '20px', accentColor: '#d91a2a', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                      Envío automático del código PIN de la cerradura digital 2 horas antes de tu check-in (3:00 PM) al móvil registrado.
                    </div>
                  </div>

                  {/* Correo Check-in / Comprobantes */}
                  <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mail size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Comprobantes Oficiales por Email</div>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1e40af', background: '#dbeafe', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)' }}>Documento Legal</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={datosPerfil.notifCorreoCheckin}
                        onChange={(e) => handleChange('notifCorreoCheckin', e.target.checked)}
                        style={{ width: '20px', height: '20px', accentColor: '#d91a2a', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                      Envío de voucher oficial en PDF, factura proforma, ubicación con Waze/Maps y código QR de confirmación.
                    </div>
                  </div>

                  {/* Recordatorios de Horarios */}
                  <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Horarios (3:00 PM / 11:00 AM)</div>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6d28d9', background: '#ede9fe', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)' }}>Puntualidad</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={datosPerfil.notifNovedadesReserva}
                        onChange={(e) => handleChange('notifNovedadesReserva', e.target.checked)}
                        style={{ width: '20px', height: '20px', accentColor: '#d91a2a', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                      Instrucciones anticipadas de llegada, clave Wi-Fi 300 Mbps y protocolo ágil de salida sin filas ni esperas.
                    </div>
                  </div>

                  {/* Tarifas Exclusivas y Promociones */}
                  <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#d91a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Club de Lealtad & Tarifas VIP</div>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#b91522', background: '#ffe4e6', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)' }}>Beneficios Facile</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={datosPerfil.notifPromociones}
                        onChange={(e) => handleChange('notifPromociones', e.target.checked)}
                        style={{ width: '20px', height: '20px', accentColor: '#d91a2a', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                      Descuentos especiales de hasta el 20% en estancias medias y largas y tarifas preferenciales de fin de semana.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      HORARIO PREFERIDO PARA CONTACTO <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <select
                      className="input-airbnb"
                      value={datosPerfil.horarioContacto}
                      onChange={(e) => handleChange('horarioContacto', e.target.value)}
                    >
                      <option value="Cualquier hora (24/7)">Cualquier hora (Servicio Concierge 24/7)</option>
                      <option value="Solo horario diurno (8:00 AM - 8:00 PM)">Solo horario diurno (8:00 AM - 8:00 PM)</option>
                      <option value="Solo emergencias de reserva">Solo emergencias o cambios de reserva</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Respetamos tu descanso durante estadías de negocios y turismo.
                    </span>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      IDIOMA DE LAS NOTIFICACIONES <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <select
                      className="input-airbnb"
                      value={datosPerfil.idiomaNotificaciones}
                      onChange={(e) => handleChange('idiomaNotificaciones', e.target.value)}
                    >
                      <option value="Español">🇪🇸 Español (Latinoamérica)</option>
                      <option value="English">🇺🇸 English (International)</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Idioma para mensajes de texto, WhatsApp y plantillas de correo.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.4 }}>
                    <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
                    <span>Puedes pausar o modificar estas alertas en cualquier momento sin afectar tus reservas confirmadas.</span>
                  </div>
                  <button
                    type="submit"
                    className="btn-airbnb-primary"
                    style={{ width: 'auto', padding: '0.65rem 2rem', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.88rem' }}
                  >
                    <CheckCircle2 size={16} /> Guardar Preferencias de Alertas
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
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                      Seguridad de la Cuenta & Control de Acceso
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                      Administra tus credenciales de acceso seguro al portal, monitorea tus sesiones activas y actualiza tu clave.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}>
                    Cifrado SHA-256 / SSL
                  </span>
                </div>

                {/* Sesión Activa */}
                <div style={{ background: '#f8fafc', padding: '1.15rem 1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      <MapPin size={16} color="#059669" />
                      <span>Sesión Activa en Navegador Web Seguro</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-pill)' }}>
                      ACTIVA AHORA
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Bogotá D.C., Colombia • Almacenamiento local cifrado y token de sesión verificado para {datosPerfil.correo}.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      CONTRASEÑA ACTUAL (OPCIONAL)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showClaveActual ? "text" : "password"}
                        className="input-airbnb"
                        value={datosPerfil.claveActual}
                        onChange={(e) => handleChange('claveActual', e.target.value)}
                        placeholder="Ingresa tu clave actual"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowClaveActual(!showClaveActual)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                      >
                        {showClaveActual ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Para validar tu identidad antes de efectuar cambios.
                    </span>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      MÉTODO DE RECUPERACIÓN DE CUENTA <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <select
                      className="input-airbnb"
                      value={datosPerfil.metodoRecuperacion}
                      onChange={(e) => handleChange('metodoRecuperacion', e.target.value)}
                    >
                      <option value="Correo Electrónico Registrado">Correo Electrónico Registrado ({datosPerfil.correo})</option>
                      <option value="Mensaje SMS / WhatsApp">Mensaje WhatsApp ({datosPerfil.telefono || 'Teléfono'})</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Canal de respaldo en caso de olvidar tu clave de acceso.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      NUEVA CONTRASEÑA DE ACCESO <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNuevaClave ? "text" : "password"}
                        className="input-airbnb"
                        value={datosPerfil.nuevaClave}
                        onChange={(e) => handleChange('nuevaClave', e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNuevaClave(!showNuevaClave)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                      >
                        {showNuevaClave ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Mínimo 6 caracteres, combina letras y números.
                    </span>
                  </div>

                  <div className="form-field">
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      CONFIRMAR NUEVA CONTRASEÑA <span style={{ color: '#d91a2a' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmarClave ? "text" : "password"}
                        className="input-airbnb"
                        value={datosPerfil.confirmarClave}
                        onChange={(e) => handleChange('confirmarClave', e.target.value)}
                        placeholder="Repite la nueva contraseña"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmarClave(!showConfirmarClave)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                      >
                        {showConfirmarClave ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      Debe coincidir exactamente con la nueva clave.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.4 }}>
                    <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
                    <span>Tu contraseña se almacena con hash criptográfico bcrypt y nunca es compartida con terceros.</span>
                  </div>
                  <button
                    type="submit"
                    disabled={!datosPerfil.nuevaClave}
                    className="btn-airbnb-primary"
                    style={{
                      width: 'auto',
                      padding: '0.65rem 2rem',
                      borderRadius: 'var(--radius-pill)',
                      background: datosPerfil.nuevaClave ? 'linear-gradient(135deg, #d91a2a 0%, #b91522 100%)' : '#cbd5e1',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: datosPerfil.nuevaClave ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <CheckCircle2 size={16} /> Actualizar Contraseña y Seguridad
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
