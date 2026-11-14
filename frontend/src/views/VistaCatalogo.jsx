import {
  Users, Home, Wifi, Check, Maximize2, Eye, BedDouble,
  Bath, UtensilsCrossed, Shirt, ShieldCheck, KeyRound,
  Briefcase, CheckCircle2, Sparkles, Tv
} from 'lucide-react';
import FigmaBookingBox from '../components/FigmaBookingBox.jsx';
import { useApp } from '../context/AppContext.jsx';

const VistaCatalogo = () => {
  const {
  habitaciones, reservas, activeTab, setActiveTab,
  setReservaData, filtroTipoApto, setFiltroTipoApto, setAptoLightboxPhoto,
  aptoActivePhoto, setAptoActivePhoto, selectedAptoFigma, setSelectedAptoFigma,
  navegarATab, handleReservarTipo
  } = useApp();

  const amenidadesPorTipo = {
    'Dúplex': [
      { icon: Users, label: 'Hasta 3 personas' },
      { icon: Wifi, label: 'Wi-Fi 300 Mbps' },
      { icon: Home, label: '1 Hab. + 1.5 Baños' },
      { icon: Shirt, label: 'Lavadora-secadora' },
      { icon: Sparkles, label: 'Balcón con vista' },
      { icon: Tv, label: '2 Smart TV 4K' }
    ],
    'Dobles': [
      { icon: Users, label: 'Hasta 4 personas' },
      { icon: Wifi, label: 'Wi-Fi 300 Mbps' },
      { icon: Home, label: '2 Hab. + 2 Baños' },
      { icon: BedDouble, label: 'Cama King + Auxiliar' },
      { icon: UtensilsCrossed, label: 'Cocina & Comedor' },
      { icon: Tv, label: '3 Smart TV HD' }
    ],
    'Familiares': [
      { icon: Users, label: 'Hasta 6 personas' },
      { icon: Wifi, label: 'Wi-Fi 300 Mbps' },
      { icon: Home, label: '3 Hab. + 2 Baños' },
      { icon: BedDouble, label: '1 King + Camas Nido' },
      { icon: UtensilsCrossed, label: 'Comedor 6 Puestos' },
      { icon: Shirt, label: 'Zona Lavandería' }
    ],
    'Habitaciones': [
      { icon: Users, label: 'Hasta 2 personas' },
      { icon: Wifi, label: 'Wi-Fi 300 Mbps' },
      { icon: Bath, label: 'Baño en Suite' },
      { icon: BedDouble, label: 'Cama Queen Confort' },
      { icon: Briefcase, label: 'Escritorio Ejecutivo' },
      { icon: Tv, label: 'Smart TV & Frigobar' }
    ]
  };
        const alojamientosData = [
          {
            tipo: 'Dúplex',
            nombreModal: 'Apartamento Dúplex',
            numHabitaciones: '1 Habitación',
            numBanos: '1.5 Baños',
            formato: 'Dúplex en 2 Niveles',
            unidades: '14 unidades',
            desc: 'Cuenta con 1 habitación privada, 1.5 baños, cocina totalmente equipada, sala social con sofá cama, comedor, cuarto de lavado con lavadora-secadora, 2 televisores HD, Wi-Fi de alta velocidad y balcón con vista.',
            personas: 'Hasta 3 personas',
            ambientes: '1 Hab. + 1.5 Baños',
            precio: '$250.000',
            precioSub: 'COP/noche',
            fotos: [
              { url: '/images/apartamentos/duplex IMG_9483-HDR.jpg', titulo: 'Dúplex — Vista Nivel Superior', desc: 'Diseño en doble altura con escaleras flotantes' },
              { url: '/images/apartamentos/duplex IMG_9486-HDR.jpg', titulo: 'Dúplex — Alcoba en Altillo', desc: 'Habitación privada con vista panorámica' },
              { url: '/images/apartamentos/IMG_9408-HDR.jpg', titulo: 'Dúplex — Sala Principal', desc: 'Amplitud, televisión HD y sofá cama' },
              { url: '/images/apartamentos/duplex IMG_9492-HDR.jpg', titulo: 'Dúplex — Detalles de Diseño', desc: 'Iluminación ambiental y gran confort' }
            ]
          },
          {
            tipo: 'Dobles',
            nombreModal: 'Apartamento Doble',
            numHabitaciones: '2 Habitaciones',
            numBanos: '2 Baños',
            formato: 'Suite Doble',
            unidades: '11 unidades',
            desc: 'Cuenta con 2 habitaciones (habitación principal con cama King y vestier, habitación auxiliar con 2 camas sencillas o doble), 2 baños completos, sala social, comedor, sofá cama, cocina equipada y 3 televisores HD.',
            personas: 'Hasta 4 personas',
            ambientes: '2 Hab. + 2 Baños',
            precio: '$350.000',
            precioSub: 'COP/noche',
            fotos: [
              { url: '/images/apartamentos/IMG_9417-HDR.jpg', titulo: 'Dobles — Habitación Master King', desc: 'Cama King size con ropa de cama premium' },
              { url: '/images/apartamentos/IMG_9420-HDR.jpg', titulo: 'Dobles — Habitación Auxiliar', desc: 'Dos camas sencillas o doble auxiliar' },
              { url: '/images/apartamentos/IMG_9411-HDR.jpg', titulo: 'Dobles — Cocina Integral & Comedor', desc: 'Cocina totalmente equipada' },
              { url: '/images/apartamentos/IMG_9438-HDR.jpg', titulo: 'Dobles — Sala Social', desc: 'Espacio integrado para 4 personas' }
            ]
          },
          {
            tipo: 'Familiares',
            nombreModal: 'Apartamento Familiar',
            numHabitaciones: '3 Habitaciones',
            numBanos: '2 Baños',
            formato: 'Suite Familiar',
            unidades: '2 unidades',
            desc: 'Cuenta con 3 habitaciones (habitación principal King con vestier, 2 habitaciones auxiliares con cama nido), 2 baños completos, comedor de 6 puestos, sofá cama, cocina abierta y 4 televisores HD.',
            personas: 'Hasta 6 personas',
            ambientes: '3 Hab. + 2 Baños',
            precio: '$450.000',
            precioSub: 'COP/noche',
            fotos: [
              { url: '/images/apartamentos/IMG_9459-HDR.jpg', titulo: 'Familiares — Comedor de 6 Puestos & Sala', desc: 'Amplitud única para familias y grupos corporativos' },
              { url: '/images/apartamentos/IMG_9462-HDR.jpg', titulo: 'Familiares — Habitaciones Auxiliares', desc: 'Camas nido para máximo aprovechamiento' },
              { url: '/images/apartamentos/IMG_9465-HDR.jpg', titulo: 'Familiares — Cocina Abierta', desc: 'Cocina espaciosa con menaje completo' },
              { url: '/images/apartamentos/IMG_9426-HDR.jpg', titulo: 'Familiares — Zona de Lavandería Privada', desc: 'Lavadora y secadora en la unidad' }
            ]
          },
          {
            tipo: 'Habitaciones',
            nombreModal: 'Habitación Executive',
            numHabitaciones: '1 Habitación',
            numBanos: '1 Baño privado',
            formato: 'Habitación Executive',
            unidades: '11 unidades',
            desc: 'Cuenta con habitación confort individual, baño privado en suite, escritorio de trabajo, televisión HD y Wi-Fi de alta velocidad. Ideal para ejecutivos y viajes de negocios.',
            personas: 'Hasta 2 personas',
            ambientes: 'Baño privado',
            precio: '$180.000',
            precioSub: 'COP/noche',
            fotos: [
              { url: '/images/apartamentos/IMG_9495-HDR.jpg', titulo: 'Habitación — Alcoba Ejecutiva', desc: 'Cama confort, escritorio de trabajo y TV' },
              { url: '/images/apartamentos/IMG_9498-HDR.jpg', titulo: 'Habitación — Vista Interna', desc: 'Entorno silencioso para descanso o teletrabajo' },
              { url: '/images/apartamentos/IMG_9423-HDR.jpg', titulo: 'Habitación — Baño Privado En-Suite', desc: 'Acabados en cerámica y ducha tipo lluvia' },
              { url: '/images/apartamentos/IMG_9351-HDR.jpg', titulo: 'Habitación — Detalles de Confort', desc: 'Wi-Fi de alta velocidad incluido' }
            ]
          }
        ];

        const alojamientosVisibles = filtroTipoApto === 'todas'
          ? alojamientosData
          : alojamientosData.filter(apto => apto.tipo === filtroTipoApto);

        return (
          <section className="facile-section" style={{ borderTop: activeTab === 'inicio' ? '1px solid #e2e8f0' : 'none' }}>
            <div className="section-title-wrap">
              <h2>Nuestros Alojamientos</h2>
              <p>38 unidades disponibles en 4 categorías — Reserve directamente con nosotros</p>
            </div>

            {/* BOTONES DE FILTRO POR CATEGORÍA SIN RECARGA */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', marginBottom: '2.5rem', flexWrap: 'wrap', padding: '0 1rem' }}>
              {[
                { id: 'todas', label: 'Ver Todos', count: 38 },
                { id: 'Dúplex', label: 'Dúplex', count: 14 },
                { id: 'Dobles', label: 'Dobles', count: 11 },
                { id: 'Familiares', label: 'Familiares', count: 2 },
                { id: 'Habitaciones', label: 'Habitaciones', count: 11 }
              ].map(f => {
                const isActive = filtroTipoApto === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFiltroTipoApto(f.id)}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      border: isActive ? '2px solid #d91a2a' : '1.5px solid #cbd5e1',
                      background: isActive ? '#d91a2a' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 4px 14px rgba(217, 26, 42, 0.28)' : '0 2px 6px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = '#d91a2a';
                        e.currentTarget.style.color = '#d91a2a';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = '#334155';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <span>{f.label}</span>
                    <span style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#64748b',
                      padding: '0.12rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* VISTA 1: CUANDO SE MUESTRAN TODAS LAS CATEGORÍAS (4 COLUMNAS BALANCEADAS) */}
            {filtroTipoApto === 'todas' ? (
              <div className="apto-grid">
                {alojamientosVisibles.map((apto) => {
                  const activePhotoIndex = aptoActivePhoto[apto.tipo] || 0;
                  const currentPhoto = apto.fotos[activePhotoIndex] || apto.fotos[0];

                  return (
                    <div key={apto.tipo} className="apto-item">
                      {/* ENCABEZADO ORIGINAL DE LA TARJETA CON NOMBRE VISIBLE */}
                      <div className="apto-header">
                        <h3>{apto.tipo}</h3>
                        <span className="badge-red-num" style={{ background: '#fee2e2', color: '#d91a2a', borderRadius: 'var(--radius-pill, 9999px)', fontWeight: 800 }}>{apto.unidades}</span>
                      </div>

                      {/* IMAGEN DE BANNER PRINCIPAL DE LA TARJETA */}
                      <div
                        style={{ position: 'relative', width: '100%', height: '195px', overflow: 'hidden', background: '#0f172a', cursor: 'pointer' }}
                        onClick={() => setSelectedAptoFigma(apto)}
                        title="Haz clic para explorar fotos y amenidades de este alojamiento"
                      >
                        <img
                          src={currentPhoto.url}
                          alt={currentPhoto.titulo}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />

                        {/* INSIGNIA PROFESIONAL: EXPLORAR SUITE */}
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill, 9999px)', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                          <Maximize2 size={13}/> Explorar Suite
                        </div>
                      </div>

                      {/* MINI CARRUSEL DE MINIATURAS FOTOGRÁFICAS */}
                      <div style={{ display: 'flex', gap: '0.4rem', padding: '0.5rem 0.8rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', overflowX: 'auto' }}>
                        {apto.fotos.map((f, i) => (
                          <div
                            key={i}
                            onClick={() => setAptoActivePhoto(prev => ({ ...prev, [apto.tipo]: i }))}
                            style={{
                              width: '52px',
                              height: '38px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: activePhotoIndex === i ? '2px solid #d91a2a' : '1.5px solid #cbd5e1',
                              opacity: activePhotoIndex === i ? 1 : 0.65,
                              transition: 'all 0.2s ease',
                              flexShrink: 0
                            }}
                          >
                            <img src={f.url} alt="Vista" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>

                      {/* CUERPO Y DETALLES */}
                      <div className="apto-body">
                        <p className="apto-text">
                          {apto.desc}
                        </p>
                        <div className="apto-specs">
                          <span className="spec-pill"><Users size={12}/> {apto.personas}</span>
                          <span className="spec-pill"><Wifi size={12}/> Wi-Fi</span>
                          <span className="spec-pill"><Home size={12}/> {apto.ambientes}</span>
                        </div>
                        <div className="apto-footer">
                          <div className="price-text">
                            {apto.precio} <span>{apto.precioSub}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              style={{
                                borderRadius: 'var(--radius-pill, 9999px)',
                                padding: '8px 16px',
                                background: '#f8fafc',
                                color: '#0f172a',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                border: '1px solid #cbd5e1',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.borderColor = '#d91a2a';
                                e.currentTarget.style.color = '#d91a2a';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                                e.currentTarget.style.color = '#0f172a';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                              onClick={() => setSelectedAptoFigma(apto)}
                              title="Ver ficha técnica y disponibilidad de este alojamiento"
                            >
                              <Eye size={13} color="#d91a2a" />
                              <span>Detalle</span>
                            </button>
                            <button
                              type="button"
                              className="btn-book-red"
                              style={{
                                borderRadius: 'var(--radius-pill, 9999px)',
                                padding: '8px 18px',
                                background: '#d91a2a',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                border: 'none',
                                boxShadow: '0 2px 8px rgba(217, 26, 42, 0.25)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#b91522';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = '#d91a2a';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                              onClick={() => handleReservarTipo(apto.tipo)}
                            >
                              Reservar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* VISTA 2: CUANDO SE FILTRA UNA CATEGORÍA ESPECÍFICA (APROVECHA 100% EL ANCHO Y MUESTRA TODAS SUS UNIDADES) */
              <div>
                {alojamientosVisibles.map((apto) => {
                  const activePhotoIndex = aptoActivePhoto[apto.tipo] || 0;
                  const currentPhoto = apto.fotos[activePhotoIndex] || apto.fotos[0];

                  // Lista de unidades de esta categoría (backend o distribución oficial)
                  const unidadesDefault = {
                    'Dúplex': Array.from({ length: 14 }, (_, i) => ({
                      id: `D${101 + i}`,
                      numero: `D${101 + i}`,
                      tipo: 'Dúplex',
                      capacidad: 3,
                      precio: 250000,
                      piso: i < 7 ? 'Piso 1' : 'Piso 2'
                    })),
                    'Dobles': Array.from({ length: 11 }, (_, i) => ({
                      id: `DB${201 + i}`,
                      numero: `DB${201 + i}`,
                      tipo: 'Dobles',
                      capacidad: 4,
                      precio: 350000,
                      piso: i < 6 ? 'Piso 2' : 'Piso 3'
                    })),
                    'Familiares': [
                      { id: 'F301', numero: 'F301', tipo: 'Familiares', capacidad: 6, precio: 450000, piso: 'Piso 3' },
                      { id: 'F302', numero: 'F302', tipo: 'Familiares', capacidad: 6, precio: 450000, piso: 'Piso 3' }
                    ],
                    'Habitaciones': Array.from({ length: 11 }, (_, i) => ({
                      id: `H${401 + i}`,
                      numero: `H${401 + i}`,
                      tipo: 'Habitaciones',
                      capacidad: 2,
                      precio: 180000,
                      piso: 'Piso 4'
                    }))
                  }[apto.tipo] || [];

                  const unidadesFinales = habitaciones.length > 0
                    ? habitaciones.filter(h => h.tipo === apto.tipo && !['101A', '102A'].includes(String(h.numero))).map(h => ({
                        id: h.id_habitacion || h.numero,
                        numero: String(h.numero),
                        tipo: h.tipo,
                        capacidad: h.capacidad,
                        precio: Number(h.precio_noche || 0),
                        piso: String(h.numero || '').startsWith('D') ? 'Pisos 1-2' : (String(h.numero || '').startsWith('DB') ? 'Pisos 2-3' : (String(h.numero || '').startsWith('F') ? 'Piso 3' : 'Piso 4'))
                      }))
                    : unidadesDefault;

                  return (
                    <div key={apto.tipo}>
                      {/* TARJETA DESTACADA HORIZONTAL (APROVECHA EL 100% DEL ESPACIO SUPERIOR) */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                        background: '#ffffff',
                        borderRadius: '24px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: '0 8px 30px rgba(15,23,42,0.06)',
                        marginBottom: '3rem'
                      }}>
                        {/* COLUMNA IZQUIERDA: FOTO PRINCIPAL Y MINIATURAS */}
                        <div style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column', borderRight: '1px solid #f1f5f9' }}>
                          <div
                            style={{ position: 'relative', width: '100%', height: '340px', overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() => setSelectedAptoFigma(apto)}
                            title="Haz clic para ver el detalle interactivo"
                          >
                            <img
                              src={currentPhoto.url}
                              alt={currentPhoto.titulo}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            <div style={{ position: 'absolute', bottom: '14px', right: '14px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', color: '#ffffff', padding: '0.45rem 0.95rem', borderRadius: 'var(--radius-pill)', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                              <Maximize2 size={14}/> Ver Detalle / Fotos
                            </div>
                            <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(217, 26, 42, 0.9)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Categoría Destacada
                            </div>
                          </div>

                          {/* MINI CARRUSEL DE MINIATURAS FOTOGRÁFICAS */}
                          <div style={{ display: 'flex', gap: '0.6rem', padding: '0.85rem 1.25rem', background: '#ffffff', borderTop: '1px solid #f1f5f9', overflowX: 'auto' }}>
                            {apto.fotos.map((f, i) => (
                              <div
                                key={i}
                                onClick={() => setAptoActivePhoto(prev => ({ ...prev, [apto.tipo]: i }))}
                                style={{
                                  width: '68px',
                                  height: '48px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  border: activePhotoIndex === i ? '2.5px solid #d91a2a' : '1.5px solid #e2e8f0',
                                  opacity: activePhotoIndex === i ? 1 : 0.65,
                                  transition: 'all 0.2s ease',
                                  flexShrink: 0
                                }}
                              >
                                <img src={f.url} alt="Vista" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* COLUMNA DERECHA: INFORMACIÓN COMPLETA Y ESPECIFICACIONES (BALANCEADA) */}
                        <div style={{ padding: '2rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
                          <div>
                            {/* Badges superiores y Título */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d91a2a', textTransform: 'uppercase', letterSpacing: '0.8px', background: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', border: '1px solid #fecaca' }}>
                                  Apartamento
                                </span>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-pill)' }}>
                                  {apto.formato || apto.tipo}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', background: '#ecfdf5', color: '#059669', borderRadius: 'var(--radius-pill)', fontWeight: 800, border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <CheckCircle2 size={13} /> {apto.unidades} disponibles
                              </span>
                            </div>

                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                              {apto.nombreModal || `Apartamento ${apto.tipo}`}
                            </h3>

                            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1.25rem' }}>
                              {apto.desc}
                            </p>

                            {/* GRILLA EJECUTIVA DE 6 AMENIDADES CLAVE */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                              gap: '0.55rem',
                              marginBottom: '1.2rem'
                            }}>
                              {(amenidadesPorTipo[apto.tipo] || amenidadesPorTipo['Dúplex']).map((am, idx) => {
                                const AmIcon = am.icon;
                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.45rem',
                                      padding: '0.5rem 0.7rem',
                                      backgroundColor: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '12px',
                                      fontSize: '0.78rem',
                                      color: '#334155',
                                      fontWeight: 600
                                    }}
                                  >
                                    <AmIcon size={14} color="#d91a2a" style={{ flexShrink: 0 }} />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{am.label}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* BARRA DE GARANTÍAS DEL APARTAHOTEL */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              padding: '0.65rem 0.95rem',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '14px',
                              fontSize: '0.76rem',
                              color: '#475569',
                              fontWeight: 600,
                              marginBottom: '1.5rem',
                              flexWrap: 'wrap'
                            }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <KeyRound size={13} color="#059669" /> Check-in 24/7 digital
                              </span>
                              <span style={{ color: '#cbd5e1' }}>•</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <ShieldCheck size={13} color="#059669" /> Vigilancia 24h
                              </span>
                              <span style={{ color: '#cbd5e1' }}>•</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Briefcase size={13} color="#059669" /> Acceso Centro Negocios
                              </span>
                            </div>
                          </div>

                          {/* FOOTER: TARIFA GARANTIZADA Y BOTONES PÍLDORA */}
                          <div style={{
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: '1.25rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            background: '#f8fafc',
                            margin: '0 -2.25rem -2rem -2.25rem',
                            padding: '1.25rem 2.25rem'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Tarifa Directa Garantizada
                              </div>
                              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                                {apto.precio}
                              </div>
                              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{apto.precioSub} • Impuestos incluidos</span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              <button
                                type="button"
                                style={{
                                  borderRadius: 'var(--radius-pill)',
                                  padding: '0.75rem 1.4rem',
                                  background: '#ffffff',
                                  border: '1.5px solid #cbd5e1',
                                  color: '#0f172a',
                                  fontSize: '0.86rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '7px',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.borderColor = '#d91a2a';
                                  e.currentTarget.style.color = '#d91a2a';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.borderColor = '#cbd5e1';
                                  e.currentTarget.style.color = '#0f172a';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                                onClick={() => setSelectedAptoFigma(apto)}
                                title="Ver ficha técnica y disponibilidad de este alojamiento"
                              >
                                <Eye size={15} color="#d91a2a" />
                                <span>Detalle Completo</span>
                              </button>
                              <button
                                type="button"
                                className="btn-book-red"
                                style={{
                                  borderRadius: 'var(--radius-pill)',
                                  padding: '0.75rem 1.6rem',
                                  background: '#d91a2a',
                                  color: '#ffffff',
                                  fontSize: '0.86rem',
                                  fontWeight: 800,
                                  border: 'none',
                                  boxShadow: '0 4px 14px rgba(217, 26, 42, 0.3)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = '#b91522';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = '#d91a2a';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                                onClick={() => handleReservarTipo(apto.tipo)}
                              >
                                Reservar {apto.tipo}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SUBSECCIÓN: TODAS LAS UNIDADES DISPONIBLES DE ESTA CATEGORÍA */}
                      <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                                Unidades asignables de {apto.tipo}
                              </h3>
                              <span style={{ background: '#fee2e2', color: '#d91a2a', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 800, border: '1px solid #fecaca' }}>
                                {unidadesFinales.length} disponibles
                              </span>
                            </div>
                            <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                              Selecciona tu apartamento para asignarlo directamente a tu reserva y asegurar piso de tu preferencia
                            </p>
                          </div>
                          <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.4rem 0.95rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} /> Todas las unidades disponibles para hoy
                          </span>
                        </div>

                        {/* GRID DE UNIDADES ESPECÍFICAS DE ESTA CATEGORÍA (BALANCEADO Y ERGONÓMICO) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
                          {unidadesFinales.map((unidad) => (
                            <div
                              key={unidad.id}
                              style={{
                                background: '#ffffff',
                                borderRadius: '20px',
                                border: '1.5px solid #e2e8f0',
                                padding: '1.35rem',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 28px rgba(15,23,42,0.08)';
                                e.currentTarget.style.borderColor = '#d91a2a';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                  <span style={{ background: '#fee2e2', color: '#d91a2a', border: '1px solid #fecaca', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 800 }}>
                                    Apto {unidad.numero}
                                  </span>
                                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, background: '#f8fafc', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-pill)', border: '1px solid #e2e8f0' }}>
                                    {unidad.piso}
                                  </span>
                                </div>
                                <div style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.2px' }}>
                                  {apto.formato || apto.tipo}
                                </div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                  <span>Disponible para asignar</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '1.1rem', background: '#f8fafc', padding: '0.55rem 0.85rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                  <Users size={14} color="#d91a2a"/>
                                  <span style={{ fontWeight: 600 }}>Capacidad: <strong>{unidad.capacidad} personas</strong></span>
                                </div>
                              </div>

                              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tarifa noche</div>
                                  <div style={{ fontSize: '1.18rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.15 }}>
                                    ${Number(unidad.precio).toLocaleString('es-CO')}
                                  </div>
                                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>COP / noche</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReservaData(prev => ({ ...prev, id_habitacion: String(unidad.id || unidad.numero) }));
                                    navegarATab('reservar');
                                  }}
                                  style={{
                                    background: '#d91a2a',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '0.55rem 1.35rem',
                                    borderRadius: 'var(--radius-pill)',
                                    fontSize: '0.84rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    boxShadow: '0 3px 10px rgba(217, 26, 42, 0.25)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = '#b91522';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = '#d91a2a';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }}
                                >
                                  Reservar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODAL DETALLE GLOBALIZADO EN App.jsx CON ModalDetalleApto */}
            {false && selectedAptoFigma && (() => {
              const activeFigmaIdx = aptoActivePhoto[selectedAptoFigma.tipo] || 0;
              const mainPhoto = selectedAptoFigma.fotos[activeFigmaIdx] || selectedAptoFigma.fotos[0];

              return (
                <div className="figma-modal-backdrop" onClick={() => setSelectedAptoFigma(null)}>
                  <div className="figma-modal-card" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedAptoFigma(null)}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '20px',
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#334155',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ✕
                    </button>

                    <div className="figma-breadcrumb">
                      <span className="link" onClick={() => { setSelectedAptoFigma(null); setActiveTab('inicio'); }}>Inicio</span>
                      <span>&gt;</span>
                      <span className="link" onClick={() => { setSelectedAptoFigma(null); setActiveTab('apartamentos'); }}>Apartamentos</span>
                      <span>&gt;</span>
                      <span className="active">{selectedAptoFigma.nombreModal || `Apartamento ${selectedAptoFigma.tipo}`}</span>
                    </div>

                    <div className="figma-detail-grid">
                      <div>
                        <div
                          className="figma-main-img-wrap"
                          onClick={() => {
                            setAptoLightboxPhoto({ photos: selectedAptoFigma.fotos, index: activeFigmaIdx });
                          }}
                          title="Haz clic para ampliar en pantalla completa"
                        >
                          <img src={mainPhoto.url} alt={mainPhoto.titulo} />
                          <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(15,23,42,0.85)', color: '#fff', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                            🔍 Ampliar Fotografía Real
                          </div>
                        </div>

                        <div className="figma-thumbs-row">
                          {selectedAptoFigma.fotos.slice(0, 4).map((f, i) => (
                            <div
                              key={i}
                              className={`figma-thumb-item ${activeFigmaIdx === i ? 'active' : ''}`}
                              onClick={() => setAptoActivePhoto(prev => ({ ...prev, [selectedAptoFigma.tipo]: i }))}
                            >
                              <img src={f.url} alt={f.titulo} />
                            </div>
                          ))}
                          <div
                            className="figma-thumb-item"
                            onClick={() => setAptoLightboxPhoto({ photos: selectedAptoFigma.fotos, index: 0 })}
                          >
                            <img src={selectedAptoFigma.fotos[0]?.url} alt="Más fotos" />
                            <div className="figma-thumb-more">
                              +{selectedAptoFigma.fotos.length} fotos
                            </div>
                          </div>
                        </div>

                        {/* COMODIDADES Y SERVICIOS DE LA SUITE (EQUILIBRIO DE COLUMNA IZQUIERDA) */}
                        <div style={{ marginTop: '1.2rem', padding: '1.1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            ✨ Lo que ofrece este apartamento
                          </h4>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: '#334155' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontSize: '1.1rem' }}>📶</span>
                              <div>
                                <strong>Wi-Fi Alta Velocidad</strong>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Fibra 300 Mbps para teletrabajo</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontSize: '1.1rem' }}>🍳</span>
                              <div>
                                <strong>Cocina Integral</strong>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Equipada con vajilla y electrodomésticos</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontSize: '1.1rem' }}>📺</span>
                              <div>
                                <strong>Smart TV 55"</strong>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Streaming listo (Netflix / Prime)</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontSize: '1.1rem' }}>🧺</span>
                              <div>
                                <strong>Zona de Lavado</strong>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Lavadora/Secadora en suite</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontSize: '1.1rem' }}>🔑</span>
                              <div>
                                <strong>Cerradura Digital</strong>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Autocheck-in con código único</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontSize: '1.1rem' }}>🌇</span>
                              <div>
                                <strong>Balcón Privado</strong>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Vista a la ciudad de Bogotá</div>
                              </div>
                            </div>
                          </div>

                          <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                            <span>🕒 <strong>Check-in:</strong> 3:00 PM</span>
                            <span>🕚 <strong>Check-out:</strong> 11:00 AM</span>
                            <span>🛡️ <strong>Vigilancia:</strong> 24/7</span>
                          </div>
                        </div>
                      </div>

                      <div className="figma-right-card">
                        <span className="figma-badge-pill">APARTAMENTO</span>
                        <h2 className="figma-title">{selectedAptoFigma.nombreModal || selectedAptoFigma.tipo}</h2>
                        <p className="figma-subtitle">
                          {selectedAptoFigma.desc}
                        </p>

                        <div className="figma-price-box">
                          <div className="figma-price-label">TARIFA POR NOCHE</div>
                          <div className="figma-price-amount">
                            {selectedAptoFigma.precio} <span className="figma-price-unit">{selectedAptoFigma.precioSub}</span>
                          </div>
                          <div className="figma-price-tax">Impuestos aplican según perfil del huésped</div>
                        </div>

                        <div className="figma-specs-grid">
                          <div className="figma-spec-card">
                            <div className="figma-spec-icon">👥</div>
                            <div className="figma-spec-text">
                              <span className="figma-spec-label">CAPACIDAD</span>
                              <span className="figma-spec-value">{selectedAptoFigma.personas}</span>
                            </div>
                          </div>
                          <div className="figma-spec-card">
                            <div className="figma-spec-icon">🛏️</div>
                            <div className="figma-spec-text">
                              <span className="figma-spec-label">HABITACIONES</span>
                              <span className="figma-spec-value">{selectedAptoFigma.numHabitaciones || selectedAptoFigma.ambientes}</span>
                            </div>
                          </div>
                          <div className="figma-spec-card">
                            <div className="figma-spec-icon">🚿</div>
                            <div className="figma-spec-text">
                              <span className="figma-spec-label">BAÑOS</span>
                              <span className="figma-spec-value">{selectedAptoFigma.numBanos || 'Privado en suite'}</span>
                            </div>
                          </div>
                          <div className="figma-spec-card">
                            <div className="figma-spec-icon">🛋️</div>
                            <div className="figma-spec-text">
                              <span className="figma-spec-label">FORMATO</span>
                              <span className="figma-spec-value">{selectedAptoFigma.formato || selectedAptoFigma.tipo}</span>
                            </div>
                          </div>
                        </div>

                        <FigmaBookingBox
                          selectedApto={selectedAptoFigma}
                          reservas={reservas}
                          onReservar={(inDate, outDate) => {
                            setSelectedAptoFigma(null);
                            handleReservarTipo(selectedAptoFigma.tipo);
                          }}
                        />

                        <a
                          href="https://wa.me/573153512085?text=Hola,%20quisiera%20consultar%20disponibilidad%20para%20el%20Apartamento%20Facile"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-figma-whatsapp"
                          style={{ textDecoration: 'none' }}
                        >
                          <span style={{ color: '#10b981', fontSize: '1.2rem', lineHeight: 1 }}>•</span> Consultar por WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>
        );
};

export default VistaCatalogo;
