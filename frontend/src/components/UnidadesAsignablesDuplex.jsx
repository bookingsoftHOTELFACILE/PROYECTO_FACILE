import React from 'react';
import { 
  Wifi, 
  Tv, 
  Maximize2, 
  Users, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Car, 
  Coffee, 
  ChevronRight, 
  CheckCircle2
} from 'lucide-react';

export default function UnidadesAsignablesDuplex({
  categoriaActiva = 'duplex',
  onCambiarCategoria,
  onSeleccionarUnidad,
  onVerDetalleCompleto,
  onReservarDuplexGeneral,
  onAbrirGaleria
}) {
  // Lista oficial de las 14 unidades Dúplex asignables (Apto D101 al D114)
  const unidades = [
    { id: 'D101', codigo: 'Apto D101', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D102', codigo: 'Apto D102', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D103', codigo: 'Apto D103', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D104', codigo: 'Apto D104', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D105', codigo: 'Apto D105', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D106', codigo: 'Apto D106', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D107', codigo: 'Apto D107', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D108', codigo: 'Apto D108', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D109', codigo: 'Apto D109', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D110', codigo: 'Apto D110', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D111', codigo: 'Apto D111', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D112', codigo: 'Apto D112', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D113', codigo: 'Apto D113', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
    { id: 'D114', codigo: 'Apto D114', pisos: 'Pisos 1–2', tipo: 'Dúplex en 2 Niveles', capacidad: '3 pers.', precio: '$250.000', disponible: true },
  ];

  // Fotografías locales reales del Apartamento Dúplex en Bogotá Chicó
  const fotosDuplex = [
    { src: '/images/apartamentos/duplex IMG_9483-HDR.jpg', alt: 'Vista panorámica sala y altillo' },
    { src: '/images/apartamentos/duplex IMG_9486-HDR.jpg', alt: 'Habitación privada en altillo' },
    { src: '/images/apartamentos/duplex IMG_9492-HDR.jpg', alt: 'Detalles de iluminación y acabados' },
    { src: '/images/apartamentos/IMG_9408-HDR.jpg', alt: 'Sala principal con sofá cama' }
  ];

  const handlePillClick = (catId) => {
    if (onCambiarCategoria) {
      onCambiarCategoria(catId);
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 antialiased py-6">
      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12 space-y-10">

        {/* =========================================================================
            1. PÍLDORAS DE FILTRADO DE CATEGORÍAS (Superior)
           ========================================================================= */}
        <section className="flex flex-wrap items-center justify-between gap-4 pb-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => handlePillClick('todas')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                categoriaActiva === 'todas' || categoriaActiva === 'todos'
                  ? 'bg-[#d91a2a] text-white shadow-md shadow-[#d91a2a]/20'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              Ver Todos <span className="opacity-70 ml-1">38</span>
            </button>

            <button
              type="button"
              onClick={() => handlePillClick('Dúplex')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                categoriaActiva === 'Dúplex' || categoriaActiva === 'duplex'
                  ? 'bg-[#d91a2a] text-white shadow-md shadow-[#d91a2a]/25'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              Dúplex <span className="opacity-80 ml-1">14</span>
            </button>

            <button
              type="button"
              onClick={() => handlePillClick('Dobles')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                categoriaActiva === 'Dobles' || categoriaActiva === 'dobles'
                  ? 'bg-[#d91a2a] text-white shadow-md shadow-[#d91a2a]/20'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              Dobles <span className="opacity-70 ml-1">11</span>
            </button>

            <button
              type="button"
              onClick={() => handlePillClick('Familiares')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                categoriaActiva === 'Familiares' || categoriaActiva === 'familiares'
                  ? 'bg-[#d91a2a] text-white shadow-md shadow-[#d91a2a]/20'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              Familiares <span className="opacity-70 ml-1">2</span>
            </button>

            <button
              type="button"
              onClick={() => handlePillClick('Habitaciones')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                categoriaActiva === 'Habitaciones' || categoriaActiva === 'habitaciones'
                  ? 'bg-[#d91a2a] text-white shadow-md shadow-[#d91a2a]/20'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              Habitaciones <span className="opacity-70 ml-1">11</span>
            </button>
          </div>

          {/* Badge informativo lateral */}
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200/80 px-4 py-2 rounded-xl shadow-xs">
            <span className="text-[#d91a2a]">🏨</span>
            <span>14 Unidades Dúplex Asignables para reserva</span>
          </div>
        </section>

        {/* =========================================================================
            2. TARJETA DESTACADA SUPERIOR (Suite Dúplex Panorámica)
           ========================================================================= */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* LADO IZQUIERDO: Visuales y Galería (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Foto principal con Zoom suave y badge */}
              <div 
                onClick={onAbrirGaleria}
                className="relative rounded-2xl overflow-hidden h-72 sm:h-96 bg-slate-900 group cursor-pointer"
              >
                <img
                  src={fotosDuplex[0]?.src}
                  alt="Dúplex en 2 Niveles"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-slate-950/75 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#d91a2a]"></span>
                  Categoría Destacada
                </div>

                <div className="absolute bottom-4 right-4 bg-slate-950/75 hover:bg-slate-950 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all border border-white/10">
                  <Maximize2 className="w-3.5 h-3.5" />
                  Ver Detalle & Galería
                </div>
              </div>

              {/* Mosaico de 4 miniaturas */}
              <div className="grid grid-cols-4 gap-3">
                {fotosDuplex.map((foto, idx) => (
                  <div
                    key={idx}
                    onClick={onAbrirGaleria}
                    className="relative rounded-xl overflow-hidden h-20 sm:h-24 bg-slate-100 border border-slate-200/80 cursor-pointer hover:border-[#d91a2a] transition-all group"
                  >
                    <img
                      src={foto.src}
                      alt={foto.alt}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300 ease-out"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* LADO DERECHO: Especificaciones, Amenidades y Conversión (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
              <div>
                {/* Badges de cabecera */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#fee2e2] text-[#d91a2a] border border-red-100">
                    Dúplex Ejecutivo
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    14 unidades disponibles
                  </span>
                </div>

                {/* Título y descripción */}
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                  Dúplex en 2 Niveles
                </h1>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  Cuenta con 1 habitación privada, 1.5 baños, cocina totalmente equipada, sala social con sofá cama, comedor, cuarto de lavado con lavadora-secadora, 2 televisores HD, Wi-Fi de alta velocidad y balcón con vista.
                </p>

                {/* Grilla de Chips de Amenidades */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                    <Users className="w-4 h-4 text-[#d91a2a] shrink-0" />
                    <span>Hasta 3 personas</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                    <Wifi className="w-4 h-4 text-[#d91a2a] shrink-0" />
                    <span>WiFi 300 Mbps</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                    <Layers className="w-4 h-4 text-[#d91a2a] shrink-0" />
                    <span>1 Hab + 1.5 Baños</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                    <Sparkles className="w-4 h-4 text-[#d91a2a] shrink-0" />
                    <span>Lavadora-secadora</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                    <MapPin className="w-4 h-4 text-[#d91a2a] shrink-0" />
                    <span>Balcón con vista</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                    <Tv className="w-4 h-4 text-[#d91a2a] shrink-0" />
                    <span>2 Smart TV 4K</span>
                  </div>
                </div>

                {/* Características adicionales con check */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Check-in 24/7 digital</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#d91a2a] shrink-0" />
                    <span>Vigilancia privada 24h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Acceso Business Hub</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#d91a2a] shrink-0" />
                    <span>Aseo hotelero opcional</span>
                  </div>
                </div>
              </div>

              {/* Caja de Precio Garantizado y Botones de Conversión */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Tarifa Garantizada
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-black text-[#d91a2a] tracking-tight">
                      $250.000
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      COP / noche
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onVerDetalleCompleto}
                    className="px-5 py-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    Detalle Completo
                  </button>

                  <button
                    type="button"
                    onClick={onReservarDuplexGeneral}
                    className="px-6 py-3 rounded-xl bg-[#d91a2a] hover:bg-[#b91522] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#d91a2a]/25 hover:shadow-lg transition-all cursor-pointer"
                  >
                    Reservar Dúplex
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            3. CUADRÍCULA DE UNIDADES ASIGNABLES (Apto D101 al D114)
           ========================================================================= */}
        <section className="space-y-6">
          {/* Cabecera del Grid */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Unidades asignables de Dúplex
                </h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-[#d91a2a] text-white">
                  14 disponibles
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Selecciona tu apartamento para asignarlo directamente a tu reserva y asegurar piso de preferencia.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Todas las unidades disponibles para hoy</span>
            </div>
          </div>

          {/* Grid de 4 columnas panorámicas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {unidades.map((unidad) => (
              <div
                key={unidad.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Cabecera de la tarjeta: Badge y nivel */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#d91a2a] text-white shadow-xs">
                      {unidad.codigo}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {unidad.pisos}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base mt-3 group-hover:text-[#d91a2a] transition-colors">
                    {unidad.tipo}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Capacidad: {unidad.capacidad}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Disponible para asignar</span>
                  </div>
                </div>

                {/* Pie de la tarjeta: Precio y Botón Reservar */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-black text-slate-900 block leading-tight">
                      {unidad.precio}
                    </span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                      COP / noche
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSeleccionarUnidad && onSeleccionarUnidad(unidad)}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-[#d91a2a] hover:bg-[#b91522] text-white shadow-sm shadow-[#d91a2a]/20 hover:shadow-md transition-all cursor-pointer"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            4. BLOQUE INFORMATIVO DE UBICACIÓN & SERVICIOS COMPLEMENTARIOS
           ========================================================================= */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#d91a2a] flex items-center justify-center shrink-0 border border-red-100">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Ubicación Estratégica en El Chicó, Bogotá
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                A pocos minutos del Parque de la 93, Centro Empresarial Chicó y Zona T.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
              <Car className="w-4 h-4 text-slate-500" />
              Parqueadero disponible
            </span>
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
              <Coffee className="w-4 h-4 text-slate-500" />
              Cafetería ejecutiva
            </span>
            <a 
              href="https://maps.google.com/?q=Calle+97+%2321-62,+Bogota"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-[#d91a2a] hover:underline flex items-center gap-1 ml-2"
            >
              Ver mapa interactivo <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
