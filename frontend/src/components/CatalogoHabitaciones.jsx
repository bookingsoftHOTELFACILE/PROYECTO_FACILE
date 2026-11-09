import React, { useState, useEffect } from 'react';
import { Users, Wifi, Home, Maximize2 } from 'lucide-react';
import { obtenerHabitacionesCatalogo } from '../api.js';

export const CATALOGO_HABITACIONES_INICIAL = [
  ...Array.from({ length: 14 }, (_, i) => ({
    id_habitacion: i + 1,
    numero: `D${101 + i}`,
    tipo: 'Dúplex',
    capacidad: 3,
    precio_noche: 250000,
    estado: 'Disponible',
    piso: i < 7 ? 'Piso 1' : 'Piso 2',
    zona: i < 7 ? 'Piso 1 — Zona Dúplex Norte' : 'Piso 2 — Zona Dúplex Sur'
  })),
  ...Array.from({ length: 11 }, (_, i) => ({
    id_habitacion: 15 + i,
    numero: `DB${201 + i}`,
    tipo: 'Dobles',
    capacidad: 4,
    precio_noche: 350000,
    estado: 'Disponible',
    piso: i < 6 ? 'Piso 2' : 'Piso 3',
    zona: i < 6 ? 'Piso 2 — Suite Doble Lateral' : 'Piso 3 — Suite Doble Panorámica'
  })),
  {
    id_habitacion: 26,
    numero: 'F301',
    tipo: 'Familiares',
    capacidad: 6,
    precio_noche: 450000,
    estado: 'Disponible',
    piso: 'Piso 3',
    zona: 'Piso 3 — Ala Familiar Premium'
  },
  {
    id_habitacion: 27,
    numero: 'F302',
    tipo: 'Familiares',
    capacidad: 6,
    precio_noche: 450000,
    estado: 'Disponible',
    piso: 'Piso 3',
    zona: 'Piso 3 — Ala Familiar Ejecutiva'
  },
  ...Array.from({ length: 11 }, (_, i) => ({
    id_habitacion: 28 + i,
    numero: `H${401 + i}`,
    tipo: 'Habitaciones',
    capacidad: 2,
    precio_noche: 180000,
    estado: 'Disponible',
    piso: 'Piso 4',
    zona: 'Piso 4 — Nivel Executive Business'
  }))
];

export const ALOJAMIENTOS_DATA = [
  {
    tipo: 'Dúplex',
    nombreModal: 'Apartamento Dúplex',
    numHabitaciones: '1 Habitación',
    numBanos: '1.5 Baños',
    formato: 'Dúplex en 2 Niveles',
    unidades: '14 unidades',
    capacidad: 3,
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
    capacidad: 4,
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
    capacidad: 6,
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
    capacidad: 2,
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

export function filtrarAlojamientos(
  alojamientos = ALOJAMIENTOS_DATA,
  {
    categoria = 'todas',
    capacidad = 'todas',
    habitaciones = CATALOGO_HABITACIONES_INICIAL
  } = {}
) {
  return alojamientos.filter((apto) => {
    const coincideCategoria = categoria === 'todas' || apto.tipo === categoria;
    const coincideCapacidad = capacidad === 'todas' || apto.capacidad === Number(capacidad);
    const tieneUnidades = habitaciones.some((h) => h.tipo === apto.tipo);
    return coincideCategoria && coincideCapacidad && tieneUnidades;
  });
}

export function CatalogoHabitaciones({
  habitaciones = CATALOGO_HABITACIONES_INICIAL,
  filtroTipoApto: filtroControlado,
  onChangeFiltroTipoApto,
  aptoActivePhoto: activePhotoControlado,
  onChangeAptoActivePhoto,
  onSelectAptoFigma = () => {},
  onReservarTipo = () => {},
  onReservarUnidad = () => {},
  cargarDesdeApi = false,
  borderTop = false
}) {
  const [filtroInterno, setFiltroInterno] = useState('todas');
  const [filtroCapacidad, setFiltroCapacidad] = useState('todas');
  const [activePhotoInterno, setActivePhotoInterno] = useState({});
  const [habitacionesRemotas, setHabitacionesRemotas] = useState(null);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(cargarDesdeApi);
  const [errorCatalogo, setErrorCatalogo] = useState(null);

  const filtroTipoApto = filtroControlado !== undefined ? filtroControlado : filtroInterno;
  const aptoActivePhoto = activePhotoControlado !== undefined ? activePhotoControlado : activePhotoInterno;

  const handleCategoriaChange = (nuevaCategoria) => {
    if (onChangeFiltroTipoApto) {
      onChangeFiltroTipoApto(nuevaCategoria);
    } else {
      setFiltroInterno(nuevaCategoria);
    }
  };

  const handleSetActivePhoto = (tipo, index) => {
    if (onChangeAptoActivePhoto) {
      onChangeAptoActivePhoto((prev) => ({ ...prev, [tipo]: index }));
    } else {
      setActivePhotoInterno((prev) => ({ ...prev, [tipo]: index }));
    }
  };

  useEffect(() => {
    if (!cargarDesdeApi) return;
    let activo = true;
    setCargandoCatalogo(true);
    setErrorCatalogo(null);

    obtenerHabitacionesCatalogo()
      .then((datos) => {
        if (activo) {
          setHabitacionesRemotas(Array.isArray(datos) ? datos : []);
          setCargandoCatalogo(false);
        }
      })
      .catch((err) => {
        if (activo) {
          setErrorCatalogo(err.message || 'No se pudieron cargar las unidades habitacionales');
          setCargandoCatalogo(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [cargarDesdeApi]);

  const listaHabitaciones = habitacionesRemotas !== null ? habitacionesRemotas : habitaciones;

  const alojamientosVisibles = filtrarAlojamientos(ALOJAMIENTOS_DATA, {
    categoria: filtroTipoApto,
    capacidad: filtroCapacidad,
    habitaciones: listaHabitaciones
  });

  const mostrarGridGeneral = filtroTipoApto === 'todas' && filtroCapacidad === 'todas';

  return (
    <section
      className="facile-section"
      aria-labelledby="catalogo-alojamientos-heading"
      style={{ borderTop: borderTop ? '1px solid #e2e8f0' : 'none' }}
    >
      <div className="section-title-wrap">
        <h2 id="catalogo-alojamientos-heading">Nuestros Alojamientos</h2>
        <p>38 unidades disponibles en 4 categorías — Reserve directamente con nosotros</p>
      </div>

      {/* BOTONES DE FILTRO POR CATEGORÍA Y SELECTOR DE CAPACIDAD ACCESIBLE */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          padding: '0 1rem'
        }}
      >
        {[
          { id: 'todas', label: 'Ver Todos', count: 38 },
          { id: 'Dúplex', label: 'Dúplex', count: 14 },
          { id: 'Dobles', label: 'Dobles', count: 11 },
          { id: 'Familiares', label: 'Familiares', count: 2 },
          { id: 'Habitaciones', label: 'Habitaciones', count: 11 }
        ].map((f) => {
          const isActive = filtroTipoApto === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleCategoriaChange(f.id)}
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
              <span
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  padding: '0.12rem 0.45rem',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}
              >
                {f.count}
              </span>
            </button>
          );
        })}

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginLeft: '0.4rem' }}>
          <label
            htmlFor="filtro-capacidad-apto"
            style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}
          >
            Filtrar por capacidad
          </label>
          <select
            id="filtro-capacidad-apto"
            value={filtroCapacidad}
            onChange={(e) => setFiltroCapacidad(e.target.value)}
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: '20px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="todas">Todas las capacidades</option>
            <option value="2">Hasta 2 personas</option>
            <option value="3">Hasta 3 personas</option>
            <option value="4">Hasta 4 personas</option>
            <option value="6">Hasta 6 personas</option>
          </select>
        </div>
      </div>

      {/* ESTADO DE CARGA ASÍNCRONA (SPINNER ACCESIBLE) */}
      {cargandoCatalogo && (
        <div role="status" aria-live="polite" className="catalogo-spinner">
          <p>Cargando catálogo de apartamentos…</p>
        </div>
      )}

      {/* ESTADO DE ERROR DE CARGA */}
      {!cargandoCatalogo && errorCatalogo && (
        <div
          role="alert"
          style={{
            textAlign: 'center',
            padding: '2rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '14px',
            color: '#991b1b',
            maxWidth: '620px',
            margin: '0 auto 2rem'
          }}
        >
          <p style={{ margin: 0, fontWeight: 700 }}>{errorCatalogo}</p>
        </div>
      )}

      {/* ESTADO VACÍO CUANDO UN FILTRO NO ARROJA RESULTADOS */}
      {!cargandoCatalogo && !errorCatalogo && alojamientosVisibles.length === 0 && (
        <div
          role="alert"
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            background: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '16px',
            maxWidth: '640px',
            margin: '0 auto 2rem'
          }}
        >
          <p style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#334155' }}>
            No se encontraron apartamentos disponibles para el filtro seleccionado.
          </p>
          <button
            type="button"
            onClick={() => {
              handleCategoriaChange('todas');
              setFiltroCapacidad('todas');
            }}
            style={{
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.2rem',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* VISTA 1: CUANDO SE MUESTRAN TODAS LAS CATEGORÍAS (4 COLUMNAS BALANCEADAS) */}
      {!cargandoCatalogo && !errorCatalogo && alojamientosVisibles.length > 0 && mostrarGridGeneral && (
        <div className="apto-grid">
          {alojamientosVisibles.map((apto) => {
            const activePhotoIndex = aptoActivePhoto[apto.tipo] || 0;
            const currentPhoto = apto.fotos[activePhotoIndex] || apto.fotos[0];

            return (
              <article key={apto.tipo} className="apto-item" aria-label={`Categoría ${apto.tipo}`}>
                {/* ENCABEZADO ORIGINAL DE LA TARJETA CON NOMBRE VISIBLE */}
                <div className="apto-header">
                  <h3>{apto.tipo}</h3>
                  <span className="badge-red-num">{apto.unidades}</span>
                </div>

                {/* IMAGEN DE BANNER PRINCIPAL DE LA TARJETA */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '195px',
                    overflow: 'hidden',
                    background: '#0f172a',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectAptoFigma(apto)}
                  title="Haz clic para ver el detalle en el diseño de Figma"
                >
                  <img
                    src={currentPhoto.url}
                    alt={currentPhoto.titulo}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                  />

                  {/* INSIGNIA VER DETALLE FIGMA */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Maximize2 size={13} /> Ver Detalle Figma
                  </div>
                </div>

                {/* MINI CARRUSEL DE MINIATURAS FOTOGRÁFICAS */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.4rem',
                    padding: '0.5rem 0.8rem',
                    background: '#f8fafc',
                    borderBottom: '1px solid #f1f5f9',
                    overflowX: 'auto'
                  }}
                >
                  {apto.fotos.map((f, i) => (
                    <div
                      key={i}
                      onClick={() => handleSetActivePhoto(apto.tipo, i)}
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
                  <p className="apto-text">{apto.desc}</p>
                  <div className="apto-specs">
                    <span className="spec-pill">
                      <Users size={12} /> {apto.personas}
                    </span>
                    <span className="spec-pill">
                      <Wifi size={12} /> Wi-Fi
                    </span>
                    <span className="spec-pill">
                      <Home size={12} /> {apto.ambientes}
                    </span>
                  </div>
                  <div className="apto-footer">
                    <div className="price-text">
                      {apto.precio} <span>{apto.precioSub}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn-book-red"
                        style={{ background: '#0f172a', color: '#fff', padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={() => onSelectAptoFigma(apto)}
                        title="Ver vista interactiva de Figma"
                      >
                        Detalle
                      </button>
                      <button
                        type="button"
                        className="btn-book-red"
                        onClick={() => onReservarTipo(apto.tipo)}
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* VISTA 2: CUANDO SE FILTRA UNA CATEGORÍA ESPECÍFICA (MUESTRA TARJETA DESTACADA Y TODAS SUS UNIDADES) */}
      {!cargandoCatalogo && !errorCatalogo && alojamientosVisibles.length > 0 && !mostrarGridGeneral && (
        <div>
          {alojamientosVisibles.map((apto) => {
            const activePhotoIndex = aptoActivePhoto[apto.tipo] || 0;
            const currentPhoto = apto.fotos[activePhotoIndex] || apto.fotos[0];

            const unidadesDefault = {
              Dúplex: Array.from({ length: 14 }, (_, i) => ({
                id: `D${101 + i}`,
                numero: `D${101 + i}`,
                tipo: 'Dúplex',
                capacidad: 3,
                precio: 250000,
                piso: i < 7 ? 'Piso 1' : 'Piso 2'
              })),
              Dobles: Array.from({ length: 11 }, (_, i) => ({
                id: `DB${201 + i}`,
                numero: `DB${201 + i}`,
                tipo: 'Dobles',
                capacidad: 4,
                precio: 350000,
                piso: i < 6 ? 'Piso 2' : 'Piso 3'
              })),
              Familiares: [
                { id: 'F301', numero: 'F301', tipo: 'Familiares', capacidad: 6, precio: 450000, piso: 'Piso 3' },
                { id: 'F302', numero: 'F302', tipo: 'Familiares', capacidad: 6, precio: 450000, piso: 'Piso 3' }
              ],
              Habitaciones: Array.from({ length: 11 }, (_, i) => ({
                id: `H${401 + i}`,
                numero: `H${401 + i}`,
                tipo: 'Habitaciones',
                capacidad: 2,
                precio: 180000,
                piso: 'Piso 4'
              }))
            }[apto.tipo] || [];

            const unidadesFinales =
              listaHabitaciones.length > 0
                ? listaHabitaciones
                    .filter((h) => h.tipo === apto.tipo && !['101A', '102A'].includes(String(h.numero)))
                    .map((h) => ({
                      id: h.id_habitacion || h.numero,
                      numero: String(h.numero),
                      tipo: h.tipo,
                      capacidad: h.capacidad,
                      precio: Number(h.precio_noche || 0),
                      piso: String(h.numero || '').startsWith('D')
                        ? 'Pisos 1-2'
                        : String(h.numero || '').startsWith('DB')
                        ? 'Pisos 2-3'
                        : String(h.numero || '').startsWith('F')
                        ? 'Piso 3'
                        : 'Piso 4'
                    }))
                : unidadesDefault;

            return (
              <article key={apto.tipo} aria-label={`Categoría ${apto.tipo}`}>
                {/* TARJETA DESTACADA HORIZONTAL */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    marginBottom: '2.5rem'
                  }}
                >
                  <div style={{ background: '#0f172a', display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{ position: 'relative', width: '100%', height: '320px', overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => onSelectAptoFigma(apto)}
                      title="Haz clic para ver el detalle en Figma"
                    >
                      <img
                        src={currentPhoto.url}
                        alt={currentPhoto.titulo}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          background: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '15px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Maximize2 size={14} /> Ver Detalle Figma
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        background: '#090d16',
                        overflowX: 'auto'
                      }}
                    >
                      {apto.fotos.map((f, i) => (
                        <div
                          key={i}
                          onClick={() => handleSetActivePhoto(apto.tipo, i)}
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

                  <div
                    style={{
                      padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: '#ffffff'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{apto.tipo}</h3>
                        <span className="badge-red-num" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                          {apto.unidades}
                        </span>
                      </div>

                      <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
                        {apto.desc}
                      </p>

                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <span className="spec-pill" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
                          <Users size={14} /> {apto.personas}
                        </span>
                        <span className="spec-pill" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
                          <Wifi size={14} /> Wi-Fi de alta velocidad
                        </span>
                        <span className="spec-pill" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
                          <Home size={14} /> {apto.ambientes}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e11d48', lineHeight: 1 }}>
                          {apto.precio}
                        </div>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{apto.precioSub}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                          type="button"
                          className="btn-book-red"
                          style={{ background: '#0f172a', color: '#fff', padding: '0.6rem 1.1rem', fontSize: '0.86rem' }}
                          onClick={() => onSelectAptoFigma(apto)}
                          title="Ver vista interactiva de Figma"
                        >
                          Detalle Completo
                        </button>
                        <button
                          type="button"
                          className="btn-book-red"
                          style={{ padding: '0.6rem 1.25rem', fontSize: '0.86rem' }}
                          onClick={() => onReservarTipo(apto.tipo)}
                        >
                          Reservar {apto.tipo}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUBSECCIÓN: TODAS LAS UNIDADES DISPONIBLES DE ESTA CATEGORÍA */}
                <div style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1.2rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                        Unidades asignables de {apto.tipo} ({unidadesFinales.length} disponibles)
                      </h4>
                      <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                        Selecciona tu apartamento para asignarlo directamente a tu reserva
                      </p>
                    </div>
                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '15px',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                    >
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
                      >
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.5rem'
                            }}
                          >
                            <span
                              style={{
                                background: '#e11d48',
                                color: '#ffffff',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 800
                              }}
                            >
                              Apto {unidad.numero}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                              {unidad.piso}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, marginBottom: '0.3rem' }}>
                            {apto.formato || apto.tipo}
                          </div>
                          <div
                            style={{
                              fontSize: '0.76rem',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              marginBottom: '0.75rem'
                            }}
                          >
                            <Users size={12} /> Capacidad: {unidad.capacidad} pers.
                          </div>
                        </div>

                        <div
                          style={{
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#e11d48' }}>
                              ${Number(unidad.precio).toLocaleString('es-CO')}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>COP / noche</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onReservarUnidad(unidad)}
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
                          >
                            Reservar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default CatalogoHabitaciones;
