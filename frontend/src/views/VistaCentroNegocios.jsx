import React from 'react';
import {
  Briefcase, Wifi, Clock, Camera, Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const VistaCentroNegocios = () => {
  const {
    setActiveTab, setReservaData, setAptoLightboxPhoto
  } = useApp();

  const oficinasData = [
    {
      id: 'sala_1',
      tipo: 'Sala de Juntas 1',
      capacidad: 'Hasta 10 personas',
      desc: 'Sala ejecutiva de reuniones totalmente equipada con pantalla de 65" para presentaciones, conexión a internet por fibra óptica, climatización e insonorización acústica.',
      precio: '$70.000',
      precioSub: 'COP/hora',
      fotos: [
        { url: '/images/oficinas/IMG_9272-HDR.jpg', titulo: 'Sala de Juntas 1 — Vista Principal Mesa Directiva', desc: 'Mesa corporativa en madera con 10 sillas ergonómicas' },
        { url: '/images/oficinas/IMG_9275-HDR.jpg', titulo: 'Sala de Juntas 1 — Pantalla 65" & Audiovisual', desc: 'Conectividad HDMI, USB-C y sonido envolvente' },
        { url: '/images/oficinas/IMG_9366-HDR.jpg', titulo: 'Sala de Juntas 1 — Proyección & Climatización', desc: 'Clima individualizado y excelente acústica' },
        { url: '/images/oficinas/IMG_9378-HDR.jpg', titulo: 'Sala de Juntas 1 — Iluminación & Panorámica', desc: 'Luz natural con cortinas de graduación' },
        { url: '/images/oficinas/IMG_9281-HDR.jpg', titulo: 'Sala de Juntas 1 — Soporte Ejecutivo', desc: 'Estación de apoyo insonorizada' },
        { url: '/images/oficinas/IMG_9290-HDR.jpg', titulo: 'Sala de Juntas 1 — Vista Lateral', desc: 'Mobiliario corporativo moderno' }
      ]
    },
    {
      id: 'sala_2',
      tipo: 'Sala de Juntas 2',
      capacidad: 'Hasta 10 personas',
      desc: 'Segunda sala de juntas ejecutiva con equipamiento VIP completo. Ideal para reuniones directivas simultáneas, capacitaciones de equipos y firmas corporativas.',
      precio: '$70.000',
      precioSub: 'COP/hora',
      fotos: [
        { url: '/images/oficinas/IMG_9369-HDR.jpg', titulo: 'Sala de Juntas 2 — Área Directiva VIP', desc: 'Mesa ejecutiva con climatización de precisión' },
        { url: '/images/oficinas/IMG_9375-HDR.jpg', titulo: 'Sala de Juntas 2 — Conexiones Integradas', desc: 'Puertos de energía y red directos en mesa' },
        { url: '/images/oficinas/IMG_9381-HDR.jpg', titulo: 'Sala de Juntas 2 — Sillas Ergonómicas', desc: 'Asientos ergonómicos ajustables' },
        { url: '/images/oficinas/IMG_9387-HDR.jpg', titulo: 'Sala de Juntas 2 — Insonorización Acústica', desc: 'Privacidad total para llamadas y negociaciones' },
        { url: '/images/oficinas/IMG_9396-HDR.jpg', titulo: 'Sala de Juntas 2 — Zona Lounge de Pausas', desc: 'Sillones ejecutivos confortables' }
      ]
    },
    {
      id: 'sala_3',
      tipo: 'Sala de Juntas 3',
      capacidad: 'Hasta 15 personas',
      desc: 'Espacio flexible de reuniones y trabajo colaborativo (Coworking flex) con internet dedicado por fibra óptica, estaciones de café gourmet y ambiente profesional.',
      precio: '$20.000',
      precioSub: 'COP/hora',
      fotos: [
        { url: '/images/oficinas/IMG_9278-HDR.jpg', titulo: 'Sala de Juntas 3 — Puestos de Trabajo Flex', desc: 'Puestos libres con iluminación LED y fibra óptica' },
        { url: '/images/oficinas/IMG_9287-HDR.jpg', titulo: 'Sala de Juntas 3 — Puesto Individual Privado', desc: 'Insonorización y aislamiento para videollamadas' },
        { url: '/images/oficinas/IMG_9296-HDR.jpg', titulo: 'Sala de Juntas 3 — Impresiones & Copiado', desc: 'Multifuncional para huéspedes y profesionales' },
        { url: '/images/oficinas/IMG_9308-HDR.jpg', titulo: 'Sala de Juntas 3 — Estación de Café & Lounge', desc: 'Café gourmet ilimitado y zona de networking' },
        { url: '/images/oficinas/IMG_9311-HDR.jpg', titulo: 'Sala de Juntas 3 — Espacio Colaborativo', desc: 'Mobiliario adaptable para equipos' },
        { url: '/images/oficinas/IMG_9399-HDR.jpg', titulo: 'Sala de Juntas 3 — Panorama Centro de Negocios', desc: 'Entorno de alto desempeño profesional' }
      ]
    }
  ];

  return (
    <section className="w-full max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
      {/* Encabezado Principal */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Centro de Negocios & Salas de Juntas
        </h1>
        <div className="w-16 h-1 bg-[#d91a2a] mx-auto mt-3 mb-4 rounded-full"></div>
        <p className="text-slate-600 text-sm sm:text-base">
          Salas de reuniones ejecutivas y espacios de coworking con la mejor infraestructura en El Chicó
        </p>
      </div>

      <div className="space-y-8">
        {oficinasData.map((oficina) => (
          <div
            key={oficina.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Cabecera: Nombre, Capacidad, Descripción y Tarifa */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {oficina.tipo}
                  </h2>
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#fee2e2] text-[#d91a2a]">
                    {oficina.capacidad}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                  {oficina.desc}
                </p>
              </div>

              {/* Tarifa por hora */}
              <div className="text-left md:text-right shrink-0">
                <div className="text-3xl font-black text-[#d91a2a] tracking-tight">
                  {oficina.precio}
                  <span className="text-xs font-semibold text-slate-500 uppercase ml-1">
                    {oficina.precioSub}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra del botón Ver Álbum */}
            <div className="flex items-center justify-between mt-5 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Camera size={16} className="text-[#d91a2a]" />
                <span>Álbum Fotográfico — {oficina.tipo}</span>
              </div>
              
              <button
                type="button"
                onClick={() => setAptoLightboxPhoto({ photos: oficina.fotos, index: 0 })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d91a2a] hover:bg-[#b91522] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Ver Álbum ({oficina.fotos.length})
              </button>
            </div>

            {/* Mosaico Fotográfico Panorámico con Zoom Interactivo Suave al Hover */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-4">
              {/* Foto Grande Principal (Izquierda) */}
              <div 
                onClick={() => setAptoLightboxPhoto({ photos: oficina.fotos, index: 0 })}
                className="md:col-span-6 relative h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden cursor-pointer group bg-slate-900"
              >
                <img
                  src={oficina.fotos[0]?.url}
                  alt={oficina.fotos[0]?.titulo || `${oficina.tipo} principal`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-xl font-medium border border-white/10 flex items-center gap-2">
                  <Sparkles size={13} className="text-[#d91a2a]" />
                  <span>{oficina.fotos[0]?.titulo || `${oficina.tipo} — Vista Principal`}</span>
                </div>
              </div>

              {/* Cuadrícula de fotos secundarias (Derecha) */}
              <div className="md:col-span-6 grid grid-cols-2 gap-3 h-72 sm:h-80 md:h-96">
                {oficina.fotos.slice(1, 4).map((foto, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setAptoLightboxPhoto({ photos: oficina.fotos, index: idx + 1 })}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-900"
                  >
                    <img
                      src={foto.url}
                      alt={foto.titulo || `${oficina.tipo} detalle ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                ))}

                {/* Botón celda +X fotos para abrir la galería */}
                <div
                  onClick={() => setAptoLightboxPhoto({ photos: oficina.fotos, index: 4 })}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-950"
                >
                  <img
                    src={oficina.fotos[4]?.url || oficina.fotos[1]?.url}
                    alt="Más fotos"
                    className="w-full h-full object-cover opacity-40 transition-all duration-500 group-hover:scale-105 group-hover:opacity-30"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-2 bg-slate-950/40 backdrop-blur-xs group-hover:bg-slate-950/60 transition-all">
                    <Camera size={22} className="text-white mb-1" />
                    <span className="text-base font-extrabold">+{oficina.fotos.length - 4} fotos</span>
                    <span className="text-xs text-slate-200 font-medium">Ver Galería</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra Inferior: Chips de Servicios + Botón de Acción */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <Wifi size={14} className="text-[#d91a2a]" /> Fibra Óptica Dedicada
                </span>
                <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <Briefcase size={14} className="text-[#d91a2a]" /> Pantalla HD 65" / Proyector
                </span>
                <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <Clock size={14} className="text-[#d91a2a]" /> Alquiler Flexible por Horas
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const mapOficinas = { 'sala_1': 1, 'sala_2': 2, 'sala_3': 3 };
                  const espTarget = mapOficinas[oficina.id] || 1;
                  setReservaData(prev => ({ ...prev, id_habitacion: `coworking-${espTarget}` }));
                  setActiveTab('reservar');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl bg-[#d91a2a] hover:bg-[#b91522] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#d91a2a]/20 hover:shadow-lg transition-all cursor-pointer"
              >
                Consultar Disponibilidad / Reservar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VistaCentroNegocios;
