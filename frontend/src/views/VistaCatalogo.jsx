import {
  Users, Home, Wifi, Check, Maximize2
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap', padding: '0 1rem' }}>
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
                      padding: '0.6rem 1.15rem',
                      borderRadius: '25px',
                      border: isActive ? '2px solid #e11d48' : '1.5px solid #cbd5e1',
                      background: isActive ? '#e11d48' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 4px 12px rgba(225,29,72,0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    <span>{f.label}</span>
                    <span style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#64748b',
                      padding: '0.12rem 0.45rem',
                      borderRadius: '12px',
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
                        <span className="badge-red-num">{apto.unidades}</span>
                      </div>

                      {/* IMAGEN DE BANNER PRINCIPAL DE LA TARJETA */}
                      <div
                        style={{ position: 'relative', width: '100%', height: '195px', overflow: 'hidden', background: '#0f172a', cursor: 'pointer' }}
                        onClick={() => setSelectedAptoFigma(apto)}
                        title="Haz clic para ver el detalle en el diseño de Figma"
                      >
                        <img
                          src={currentPhoto.url}
                          alt={currentPhoto.titulo}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />

                        {/* INSIGNIA VER DETALLE FIGMA */}
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '0.35rem 0.75rem', borderRadius: '15px', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Maximize2 size={13}/> Ver Detalle Figma
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
                              border: activePhotoIndex === i ? '2px solid #e11d48' : '1.5px solid #cbd5e1',
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
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              className="btn-book-red"
                              style={{ background: '#0f172a', color: '#fff', padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
                              onClick={() => setSelectedAptoFigma(apto)}
                              title="Ver vista interactiva de Figma"
                            >
                              Detalle
                            </button>
                            <button className="btn-book-red" onClick={() => handleReservarTipo(apto.tipo)}>
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        marginBottom: '2.5rem'
                      }}>
                        {/* COLUMNA IZQUIERDA: FOTO PRINCIPAL Y MINIATURAS */}
                        <div style={{ background: '#0f172a', display: 'flex', flexDirection: 'column' }}>
                          <div
                            style={{ position: 'relative', width: '100%', height: '320px', overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() => setSelectedAptoFigma(apto)}
                            title="Haz clic para ver el detalle en Figma"
                          >
                            <img
                              src={currentPhoto.url}
                              alt={currentPhoto.titulo}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Maximize2 size={14}/> Ver Detalle Figma
                            </div>
                          </div>

                          {/* MINI CARRUSEL DE MINIATURAS FOTOGRÁFICAS */}
                          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem', background: '#090d16', overflowX: 'auto' }}>
                            {apto.fotos.map((f, i) => (
                              <div
                                key={i}
                                onClick={() => setAptoActivePhoto(prev => ({ ...prev, [apto.tipo]: i }))}
                                style={{
                                  width: '64px',
                                  height: '46px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  border: activePhotoIndex === i ? '2px solid #e11d48' : '1.5px solid #334155',
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

                        {/* COLUMNA DERECHA: INFORMACIÓN COMPLETA Y ESPECIFICACIONES */}
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{apto.tipo}</h3>
                              <span className="badge-red-num" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>{apto.unidades}</span>
                            </div>

                            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
                              {apto.desc}
                            </p>

                            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                              <span className="spec-pill" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}><Users size={14}/> {apto.personas}</span>
                              <span className="spec-pill" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}><Wifi size={14}/> Wi-Fi de alta velocidad</span>
                              <span className="spec-pill" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}><Home size={14}/> {apto.ambientes}</span>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e11d48', lineHeight: 1 }}>
                                {apto.precio}
                              </div>
                              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{apto.precioSub}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                              <button
                                className="btn-book-red"
                                style={{ background: '#0f172a', color: '#fff', padding: '0.6rem 1.1rem', fontSize: '0.86rem' }}
                                onClick={() => setSelectedAptoFigma(apto)}
                                title="Ver vista interactiva de Figma"
                              >
                                Detalle Completo
                              </button>
                              <button
                                className="btn-book-red"
                                style={{ padding: '0.6rem 1.25rem', fontSize: '0.86rem' }}
                                onClick={() => handleReservarTipo(apto.tipo)}
                              >
                                Reservar {apto.tipo}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SUBSECCIÓN: TODAS LAS UNIDADES DISPONIBLES DE ESTA CATEGORÍA (LLENAN EL ANCHO DE LA PANTALLA) */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                              Unidades asignables de {apto.tipo} ({unidadesFinales.length} disponibles)
                            </h3>
                            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                              Selecciona tu apartamento para asignarlo directamente a tu reserva
                            </p>
                          </div>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.78rem', fontWeight: 700 }}>
                            ● Todas las unidades disponibles
                          </span>
                        </div>

                        {/* GRID DE UNIDADES ESPECÍFICAS DE ESTA CATEGORÍA */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem' }}>
                          {unidadesFinales.map((unidad) => (
                            <div
                              key={unidad.id}
                              style={{
                                background: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                padding: '1rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                                e.currentTarget.style.borderColor = '#e11d48';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                  <span style={{ background: '#e11d48', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
                                    Apto {unidad.numero}
                                  </span>
                                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                                    {unidad.piso}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, marginBottom: '0.3rem' }}>
                                  {apto.formato || apto.tipo}
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.75rem' }}>
                                  <Users size={12}/> Capacidad: {unidad.capacidad} pers.
                                </div>
                              </div>

                              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#e11d48' }}>
                                    ${Number(unidad.precio).toLocaleString('es-CO')}
                                  </div>
                                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>COP / noche</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReservaData(prev => ({ ...prev, id_habitacion: String(unidad.id || unidad.numero) }));
                                    navegarATab('reservar');
                                  }}
                                  style={{
                                    background: '#0f172a',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#e11d48'}
                                  onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
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

            {/* MODAL DETALLE DE APARTAMENTO IDENTICO AL MOCKUP DE FIGMA */}
            {selectedAptoFigma && (() => {
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
