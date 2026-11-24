import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Wifi, Tv, KeyRound, UtensilsCrossed, Shirt, 
  Home, Clock, ShieldCheck, Users, BedDouble, Bath, 
  Building, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Maximize2, MessageSquare, ArrowRight, CheckCircle2, AlertCircle,
  Heart, Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { porcentajeDescuentoEstadia } from '../utils/pricing.js';
import HuespedesPicker from './HuespedesPicker.jsx';
import { 
  calcularNochesAgnostico, 
  iterarFechasRango, 
  rangoTieneOcupados, 
  formatearFechaDisplay, 
  formatearFechaCorta 
} from '../utils/dateUtils.js';

export default function ModalDetalle({ apartamento, onClose, onReservar }) {
  const { 
    selectedAptoFigma, setSelectedAptoFigma, setAptoLightboxPhoto, 
    handleReservarTipo, selectedHuesped, setShowGuestAuthModal,
    setReservaData, reservas = [], habitaciones = [], navegarATab
  } = useApp();

  const [selectedUnidadId, setSelectedUnidadId] = useState(null);

  // Fallback seguro respetando las propiedades reales de Facile Chicó
  const apto = apartamento || selectedAptoFigma || {
    tipo: 'Familiares',
    categoria: 'APARTAMENTO',
    nombreModal: 'Apartamento Familiar',
    titulo: 'Gran Suite Familiar Confort',
    desc: 'Cuenta con 3 habitaciones (habitación principal King con vestier, 2 habitaciones auxiliares con cama nido), 2 baños completos, comedor de 6 puestos, sofá cama, cocina abierta y 4 televisores HD.',
    precio: '$450.000',
    precioSub: 'COP/noche',
    capacidad: 'Hasta 6 personas',
    personas: 'Hasta 6 personas',
    habitaciones: '3 Habitaciones',
    numHabitaciones: '3 Habitaciones',
    banos: '2 Baños completos',
    numBanos: '2 Baños completos',
    formato: 'Suite Familiar',
    fotos: [
      { url: '/images/apartamentos/IMG_9459-HDR.jpg', titulo: 'Comedor y Sala' },
      { url: '/images/apartamentos/IMG_9462-HDR.jpg', titulo: 'Habitaciones Auxiliares' },
      { url: '/images/apartamentos/IMG_9465-HDR.jpg', titulo: 'Cocina Abierta' },
      { url: '/images/apartamentos/IMG_9426-HDR.jpg', titulo: 'Zona de Lavandería' }
    ]
  };

  const handleClose = () => {
    if (onClose) onClose();
    if (setSelectedAptoFigma) setSelectedAptoFigma(null);
  };

  // Mapeo estricto a las fotos reales del apartamento (locales)
  const fotosRaw = apto.fotos || apto.imagenes || (apto.imagen ? [{ url: apto.imagen }] : []);
  const fotosReales = fotosRaw.map(f => typeof f === 'string' ? f : f.url);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [numHuespedes, setNumHuespedes] = useState(apto.personas || '1 huésped');

  // Capacidad numérica máxima para el selector de huéspedes
  const capacidadNum = useMemo(() => {
    const raw = String(apto.personas || apto.capacidad || '6').replace(/\D/g, '');
    const num = parseInt(raw, 10);
    return isNaN(num) || num <= 0 ? 6 : num;
  }, [apto.personas, apto.capacidad]);

  // =========================================================================
  // MOTOR DE CALENDARIO 100% INTERACTIVO Y DINÁMICO
  // =========================================================================
  const todayObj = new Date();
  const todayYear = todayObj.getFullYear();
  const todayMonth = todayObj.getMonth();
  const todayDay = todayObj.getDate();
  const todayStr = `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;

  // Inicialización de mes en pantalla
  const [calYear, setCalYear] = useState(todayYear || 2026);
  const [calMonth, setCalMonth] = useState(todayMonth ?? 10); // 0-indexed: 10 = Noviembre

  // Rango de fechas seleccionado (YYYY-MM-DD) - Inicialmente vacío sin preselección
  const [fechaEntrada, setFechaEntrada] = useState(null);
  const [fechaSalida, setFechaSalida] = useState(null);
  const [mensajeInteraccion, setMensajeInteraccion] = useState(null);

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Control para no permitir navegar hacia meses pasados
  const isPrevMonthDisabled = calYear < todayYear || (calYear === todayYear && calMonth <= todayMonth);

  // Navegación de mes
  const handleMesAnterior = () => {
    if (isPrevMonthDisabled) return;
    if (calMonth === 0) {
      setCalYear(prev => prev - 1);
      setCalMonth(11);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleMesSiguiente = () => {
    if (calMonth === 11) {
      setCalYear(prev => prev + 1);
      setCalMonth(0);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  // Matriz de ocupación real simulada + reservas del sistema visibles en todos los meses
  const diasOcupados = useMemo(() => {
    const setOcupados = new Set();
    
    // Fechas ocupadas estándar visibles para que el usuario nunca esté a ciegas en cualquier mes:
    // Noviembre 2026: 7, 8, 21, 22
    setOcupados.add('2026-11-07');
    setOcupados.add('2026-11-08');
    setOcupados.add('2026-11-21');
    setOcupados.add('2026-11-22');

    // Diciembre 2026
    setOcupados.add('2026-12-04');
    setOcupados.add('2026-12-05');
    setOcupados.add('2026-12-12');
    setOcupados.add('2026-12-13');
    setOcupados.add('2026-12-24');
    setOcupados.add('2026-12-25');
    setOcupados.add('2026-12-31');

    // Enero 2027
    setOcupados.add('2027-01-01');
    setOcupados.add('2027-01-02');
    setOcupados.add('2027-01-15');
    setOcupados.add('2027-01-16');
    setOcupados.add('2027-01-29');
    setOcupados.add('2027-01-30');

    // Febrero 2027
    setOcupados.add('2027-02-05');
    setOcupados.add('2027-02-06');
    setOcupados.add('2027-02-19');
    setOcupados.add('2027-02-20');

    // Integración con reservas reales del contexto (agnóstica de zona horaria)
    if (Array.isArray(reservas)) {
      reservas.forEach(res => {
        const inicio = res.fecha_entrada || res.fecha_inicio;
        const fin = res.fecha_salida || res.fecha_fin;
        if (inicio && fin) {
          try {
            const fechas = iterarFechasRango(inicio, fin);
            fechas.forEach(f => setOcupados.add(f));
          } catch {
            // Ignorar formatos de fecha inválidos
          }
        }
      });
    }

    return setOcupados;
  }, [reservas]);

  // Unidades físicas asignables enriquecidas según la tipología oficial de Facile Chicó
  const unidadesDeEstaCategoria = useMemo(() => {
    if (apto.tipo === 'Habitaciones') {
      return [
        { id: 'H401', numero: 'H401', piso: 'Piso 4', torre: 'Torre', caracteristica: 'Torre', estado: 'Disponible' },
        { id: 'H402', numero: 'H402', piso: 'Piso 4', torre: 'Torre', caracteristica: 'Torre', estado: 'Disponible' },
        { id: 'H403', numero: 'H403', piso: 'Piso 4', torre: 'Torre', caracteristica: 'Torre', estado: 'Disponible' },
        { id: 'H404', numero: 'H404', piso: 'Piso 4', torre: 'Torre', caracteristica: 'Torre', estado: 'Disponible' },
        { id: 'H405', numero: 'H405', piso: 'Piso 4', torre: 'Torre', caracteristica: 'Torre', estado: 'Disponible' },
        { id: 'H406', numero: 'H406', piso: 'Piso 4', torre: 'Torre', caracteristica: 'Torre', estado: 'Disponible' },
        { id: 'H407', numero: 'H407', piso: 'Piso 4', torre: 'Torre', caracteristica: 'Torre', estado: 'Disponible' },
        { id: 'H408', numero: 'H408', piso: 'Piso 4', torre: 'Torre', caracteristica: 'Torre', estado: 'Disponible' },
        { id: 'H409', numero: 'H409', piso: 'Piso 4', torre: 'Torre', caracteristica: 'Torre', estado: 'Disponible' },
        { id: 'H410', numero: 'H410', piso: 'Piso 4', torre: 'Torre', caracteristica: 'Con Balcón', estado: 'Disponible' },
        { id: 'H411', numero: 'H411', piso: 'Piso 4', torre: 'Torre', caracteristica: 'Con Balcón', estado: 'Disponible' },
        { id: 'H501', numero: 'H501', piso: 'Piso 5', torre: 'Torre', caracteristica: 'Torre', estado: 'Disponible' },
        { id: 'H502', numero: 'H502', piso: 'Piso 5', torre: 'Torre', caracteristica: 'Torre', estado: 'Disponible' },
      ];
    } else if (apto.tipo === 'Dúplex') {
      return Array.from({ length: 14 }, (_, i) => ({
        id: `D${101 + i}`,
        numero: `D${101 + i}`,
        piso: i < 7 ? 'Piso 1' : 'Piso 2',
        torre: 'Torre',
        caracteristica: i >= 7 ? 'Con Balcón' : 'Torre',
        estado: 'Disponible'
      }));
    } else if (apto.tipo === 'Dobles') {
      return Array.from({ length: 11 }, (_, i) => ({
        id: `DB${201 + i}`,
        numero: `DB${201 + i}`,
        piso: i < 6 ? 'Piso 2' : 'Piso 3',
        torre: 'Torre',
        caracteristica: i >= 6 ? 'Vista Exterior' : 'Torre',
        estado: 'Disponible'
      }));
    } else {
      // Familiares
      return [
        { id: 'F301', numero: 'F301', piso: 'Piso 3', torre: 'Torre', caracteristica: 'Master King', estado: 'Disponible' },
        { id: 'F302', numero: 'F302', piso: 'Piso 3', torre: 'Torre', caracteristica: 'Con Balcón', estado: 'Disponible' }
      ];
    }
  }, [apto.tipo]);

  // Subfiltro por defecto según la tipología
  const defaultSubFiltro = useMemo(() => {
    if (apto.tipo === 'Habitaciones') return 'piso4';
    if (apto.tipo === 'Dúplex') return 'piso1';
    if (apto.tipo === 'Dobles') return 'piso2';
    return 'piso3';
  }, [apto.tipo]);

  const [subFiltroPiso, setSubFiltroPiso] = useState(defaultSubFiltro);

  useEffect(() => {
    setSubFiltroPiso(defaultSubFiltro);
  }, [defaultSubFiltro]);

  // Subfiltros dinámicos por sección/piso (sin pestaña 'Todos')
  const subFiltros = useMemo(() => {
    if (apto.tipo === 'Habitaciones') {
      return [
        { id: 'piso4', label: 'Piso 4 (Torre)' },
        { id: 'piso5', label: 'Piso 5 (Torre)' },
        { id: 'balcon', label: 'Con Balcón Frontal' }
      ];
    } else if (apto.tipo === 'Dúplex') {
      return [
        { id: 'piso1', label: 'Piso 1 (Torre)' },
        { id: 'piso2', label: 'Piso 2 (Torre)' },
        { id: 'balcon', label: 'Con Balcón Panorámico' }
      ];
    } else if (apto.tipo === 'Dobles') {
      return [
        { id: 'piso2', label: 'Piso 2 (Torre)' },
        { id: 'piso3', label: 'Piso 3 (Torre)' },
        { id: 'exterior', label: 'Vista Exterior' }
      ];
    } else {
      return [
        { id: 'piso3', label: 'Piso 3 (Torre)' },
        { id: 'balcon', label: 'Con Balcón' }
      ];
    }
  }, [apto.tipo]);

  // Chequeo de disponibilidad de una unidad física específica para las fechas seleccionadas
  const checkUnidadOcupadaModal = (habId) => {
    if (!fechaEntrada || !fechaSalida) return false;
    return reservas.some(r => 
      String(r.id_habitacion) === String(habId) &&
      (r.estado === 'Confirmada' || r.estado === 'Check-In') &&
      r.fecha_entrada < fechaSalida &&
      r.fecha_salida > fechaEntrada
    );
  };

  // Unidades filtradas por subfiltro de piso/característica
  const unidadesFiltradas = useMemo(() => {
    const filtroActivo = subFiltroPiso || defaultSubFiltro;
    if (filtroActivo === 'piso1') return unidadesDeEstaCategoria.filter(u => u.piso.includes('1'));
    if (filtroActivo === 'piso2') return unidadesDeEstaCategoria.filter(u => u.piso.includes('2'));
    if (filtroActivo === 'piso3') return unidadesDeEstaCategoria.filter(u => u.piso.includes('3'));
    if (filtroActivo === 'piso4') return unidadesDeEstaCategoria.filter(u => u.piso.includes('4'));
    if (filtroActivo === 'piso5') return unidadesDeEstaCategoria.filter(u => u.piso.includes('5'));
    if (filtroActivo === 'balcon') return unidadesDeEstaCategoria.filter(u => u.caracteristica.toLowerCase().includes('balcón'));
    if (filtroActivo === 'exterior') return unidadesDeEstaCategoria.filter(u => u.caracteristica.toLowerCase().includes('exterior'));
    return unidadesDeEstaCategoria;
  }, [unidadesDeEstaCategoria, subFiltroPiso, defaultSubFiltro]);

  // Unidad actualmente seleccionada (objeto)
  const unidadElegidaObj = useMemo(() => {
    if (selectedUnidadId) {
      const found = unidadesDeEstaCategoria.find(u => u.id === selectedUnidadId || u.numero === selectedUnidadId);
      if (found) return found;
    }
    // Preferir unidad libre de la sección visible actual
    const enSeccion = unidadesFiltradas.find(u => !checkUnidadOcupadaModal(u.id || u.numero));
    if (enSeccion) return enSeccion;
    return unidadesFiltradas[0] || unidadesDeEstaCategoria[0];
  }, [selectedUnidadId, unidadesDeEstaCategoria, unidadesFiltradas]);

  // Generación de celdas del mes
  const celdasCalendario = useMemo(() => {
    // Primer día del mes (0 = Domingo, 1 = Lunes, etc.)
    const primerDia = new Date(calYear, calMonth, 1).getDay();
    // Ajustar a semana europea/latina (Lunes = 0, Domingo = 6)
    const desfaseLunes = (primerDia + 6) % 7;
    const totalDias = new Date(calYear, calMonth + 1, 0).getDate();

    const celdas = [];
    // Espacios vacíos antes del día 1
    for (let i = 0; i < desfaseLunes; i++) {
      celdas.push({ tipo: 'vacio', id: `empty-${i}` });
    }

    // Días del mes
    for (let dia = 1; dia <= totalDias; dia++) {
      const fechaStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const isPast = fechaStr < todayStr;
      const esOcupado = diasOcupados.has(fechaStr);
      
      const esEntrada = fechaEntrada === fechaStr;
      const esSalida = fechaSalida === fechaStr;
      const estaEnRango = fechaEntrada && fechaSalida && fechaStr > fechaEntrada && fechaStr < fechaSalida;
      const esSeleccionado = esEntrada || esSalida || estaEnRango;

      let estado = 1; // 1 = Disponible
      if (isPast) estado = 0; // 0 = Pasado (No disponible para agendar)
      else if (esOcupado) estado = 2; // 2 = Ocupado
      else if (esSeleccionado) estado = 3; // 3 = Tu Selección

      celdas.push({
        tipo: 'dia',
        dia,
        fechaStr,
        estado,
        esEntrada,
        esSalida,
        estaEnRango,
        esOcupado,
        isPast
      });
    }

    return celdas;
  }, [calYear, calMonth, diasOcupados, fechaEntrada, fechaSalida, todayStr]);

  // Manejador interactivo e inteligente de clic en día (sin bloqueos frustrantes)
  const handleDiaClick = (celda) => {
    if (celda.isPast || celda.estado === 0) {
      setMensajeInteraccion(`No es posible reservar en fechas pasadas (${celda.dia} de ${nombresMeses[calMonth]}). Selecciona una fecha a partir de hoy.`);
      setTimeout(() => setMensajeInteraccion(null), 3500);
      return;
    }

    if (celda.esOcupado || celda.estado === 2) {
      setMensajeInteraccion(`La fecha ${celda.dia} de ${nombresMeses[calMonth]} está ocupada. Selecciona un día disponible.`);
      setTimeout(() => setMensajeInteraccion(null), 3000);
      return;
    }

    // Si no hay fecha de entrada o ya se había completado el rango
    if (!fechaEntrada || (fechaEntrada && fechaSalida)) {
      setFechaEntrada(celda.fechaStr);
      setFechaSalida(null);
      setMensajeInteraccion(`Llegada: ${formatearFechaCorta(celda.fechaStr)}. Ahora selecciona tu fecha de salida.`);
      return;
    }

    // Si ya hay fecha de entrada pero no de salida
    if (fechaEntrada && !fechaSalida) {
      if (celda.fechaStr <= fechaEntrada) {
        // Clic en fecha anterior o igual: reiniciar con esta fecha como nueva llegada
        setFechaEntrada(celda.fechaStr);
        setFechaSalida(null);
        setMensajeInteraccion(`Nueva fecha de llegada: ${formatearFechaCorta(celda.fechaStr)}. Selecciona la salida.`);
        return;
      }

      // Verificar si en el rango seleccionado existen días ocupados
      // 100% agnóstico de zona horaria internacional (Australia UTC+11, Japón UTC+9, EE.UU., Europa, etc.)
      const tieneOcupadosEnRango = rangoTieneOcupados(fechaEntrada, celda.fechaStr, diasOcupados);

      if (tieneOcupadosEnRango) {
        // Si hay días ocupados en el camino, en lugar de un error molesto que bloquee al usuario,
        // se fija amigablemente esta fecha como la nueva llegada:
        setFechaEntrada(celda.fechaStr);
        setFechaSalida(null);
        setMensajeInteraccion(`Había fechas intermedias ocupadas. Tu nueva llegada es: ${formatearFechaCorta(celda.fechaStr)}. Ahora selecciona tu salida.`);
        setTimeout(() => setMensajeInteraccion(null), 4000);
        return;
      }

      // Rango válido
      setFechaSalida(celda.fechaStr);
      const noches = calcularNochesAgnostico(fechaEntrada, celda.fechaStr);
      setMensajeInteraccion(`¡Excelente! Has seleccionado ${noches} ${noches === 1 ? 'noche' : 'noches'}.`);
      setTimeout(() => setMensajeInteraccion(null), 3500);
    }
  };

  // Cálculo de noches de estancia de forma agnóstica de zona horaria (0 si no hay rango completo)
  const nochesEstancia = useMemo(() => {
    if (!fechaEntrada || !fechaSalida) return 0;
    return calcularNochesAgnostico(fechaEntrada, fechaSalida);
  }, [fechaEntrada, fechaSalida]);

  // Precio numérico base
  const precioNumerico = useMemo(() => {
    const raw = String(apto.precio || '450000').replace(/\D/g, '');
    const num = parseInt(raw, 10);
    return isNaN(num) || num <= 0 ? 450000 : num;
  }, [apto.precio]);

  // Desglose de descuentos por duración de estancia (política unificada):
  // - < 7 noches: sin descuento
  // - 7 a 14 noches: 10% de descuento
  // - 15+ noches: 15% de descuento
  const porcentajeDescuento = useMemo(
    () => porcentajeDescuentoEstadia(nochesEstancia),
    [nochesEstancia]
  );

  const subtotalSinDescuento = useMemo(() => {
    if (nochesEstancia === 0) return 0;
    return precioNumerico * nochesEstancia;
  }, [precioNumerico, nochesEstancia]);

  const montoDescuento = useMemo(() => {
    if (porcentajeDescuento > 0 && subtotalSinDescuento > 0) {
      return Math.round((subtotalSinDescuento * porcentajeDescuento) / 100);
    }
    return 0;
  }, [subtotalSinDescuento, porcentajeDescuento]);

  const totalCalculado = useMemo(() => {
    if (nochesEstancia === 0) return 0;
    return subtotalSinDescuento - montoDescuento;
  }, [subtotalSinDescuento, montoDescuento, nochesEstancia]);

  // =========================================================================
  // ACCIÓN DE RESERVA (INTEGRACIÓN FLUIDA CON LOGIN / REGISTRO)
  // =========================================================================
  const handleActionReservar = () => {
    if (!fechaEntrada) {
      setMensajeInteraccion('Por favor selecciona tu fecha de llegada en el calendario.');
      setTimeout(() => setMensajeInteraccion(null), 3500);
      return;
    }
    if (fechaEntrada < todayStr) {
      setMensajeInteraccion('La fecha de llegada no puede ser anterior a la fecha actual.');
      setTimeout(() => setMensajeInteraccion(null), 3500);
      return;
    }
    if (!fechaSalida) {
      setMensajeInteraccion('Por favor selecciona tu fecha de salida en el calendario.');
      setTimeout(() => setMensajeInteraccion(null), 3500);
      return;
    }

    const datosReservaApto = {
      ...apto,
      fechaEntrada,
      fechaSalida: fechaSalida || fechaEntrada,
      noches: nochesEstancia,
      numHuespedes,
      total: totalCalculado
    };

    // Asignar la unidad seleccionada por el usuario o la primera disponible
    const unidadAsignada = selectedUnidadId || (unidadesDeEstaCategoria.find(u => !checkUnidadOcupadaModal(u.id_habitacion || u.numero))?.id_habitacion || unidadesDeEstaCategoria[0]?.id_habitacion || apto.id_habitacion || apto.numero || '101');

    // Actualizar datos de reserva en el estado global
    if (setReservaData) {
      setReservaData(prev => ({
        ...prev,
        id_habitacion: String(unidadAsignada),
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida || fechaEntrada,
        huespedes: parseInt(String(numHuespedes).replace(/\D/g, ''), 10) || 2
      }));
    }

    if (onReservar) {
      onReservar(datosReservaApto);
      handleClose();
      return;
    }

    // Regla de negocio del usuario: Si no ha iniciado sesión, mostrar modal de registro/login
    if (!selectedHuesped) {
      handleClose();
      if (setShowGuestAuthModal) {
        setShowGuestAuthModal(true);
      }
    } else {
      // Si ya está autenticado, continuar al flujo de reserva directa
      handleClose();
      if (navegarATab) {
        navegarATab('reservar');
        window.scrollTo({ top: 300, behavior: 'smooth' });
      } else if (handleReservarTipo) {
        handleReservarTipo(apto.tipo || 'Familiares');
      }
    }
  };

  return (
    <div 
      className="modal-detalle-backdrop"
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(9, 14, 26, 0.78)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto'
      }}
    >
      <div 
        className="modal-detalle-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '96%',
          maxWidth: '1360px',
          maxHeight: '94vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          margin: 'auto'
        }}
      >
        {/* ENCABEZADO SUPERIOR EJECUTIVO REDISEÑADO CON LOGO FACILE Y ACCIONES */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#ffffff'
        }}>
          {/* Logo F + Subtítulo Ubicación + Título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#d91a2a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.3rem',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(217, 26, 42, 0.3)'
            }}>
              F
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                <span style={{ color: '#d91a2a' }}>EXECUTIVE APARTHOTEL</span>
                <span style={{ color: '#94a3b8' }}>• Calle 97 #21-62, Bogotá D.C.</span>
              </div>
              <h2 style={{ margin: '2px 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {apto.nombreModal || apto.titulo}
              </h2>
            </div>
          </div>

          {/* Acciones: Favorito, Compartir, Cerrar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#ffffff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
              title="Guardar en favoritos"
            >
              <Heart size={16} />
            </button>
            <button
              type="button"
              style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#ffffff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
              title="Compartir alojamiento"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              onClick={handleClose}
              style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
              title="Cerrar modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))' }}>
          
          {/* ============================================================== */}
          {/* COLUMNA IZQUIERDA: DESCRIPCIÓN + GALERÍA + ESPECIFICACIONES   */}
          {/* ============================================================== */}
          <div style={{ padding: '28px', borderRight: '1px solid #f1f5f9' }}>
            
            {/* Título y Descripción Corta del Alojamiento + Tarifa por noche (Columna Izquierda) */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                backgroundColor: '#fee2e2',
                color: '#d91a2a',
                marginBottom: '8px'
              }}>
                {apto.categoria || 'APARTAMENTO'}
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.25 }}>
                {apto.nombreModal || apto.titulo}
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.55 }}>
                {apto.desc}
              </p>

              {/* Tarifa por Noche Base en Columna Izquierda */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: '#f8fafc', 
                padding: '9px 14px', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tarifa por noche
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                      ${precioNumerico.toLocaleString('es-CO')}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>COP / noche</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ecfdf5',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid #a7f3d0',
                    display: 'inline-block'
                  }}>
                    ✓ Tarifa directa garantizada
                  </span>
                  <span style={{ display: 'block', fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}>
                    Impuestos incluidos
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Galería de Fotos Reales */}
            <div style={{ marginBottom: '20px' }}>
              <div 
                style={{
                  position: 'relative',
                  height: '290px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#0f172a',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (fotosRaw.length && setAptoLightboxPhoto) {
                    setAptoLightboxPhoto({ photos: fotosRaw, index: fotoActiva });
                  }
                }}
                title="Ampliar fotografía real a pantalla completa"
              >
                {fotosReales.length > 0 ? (
                  <img 
                    src={fotosReales[fotoActiva]} 
                    alt={apto.nombreModal || apto.titulo} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                    Fotografía no disponible
                  </div>
                )}
                <button 
                  type="button"
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(9, 14, 26, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <Maximize2 size={13} />
                  <span>Ampliar Fotografía Real</span>
                </button>
              </div>

              {/* Tira de Miniaturas Reales */}
              {fotosReales.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(fotosReales.length, 5)}, 1fr)`, gap: '8px', marginTop: '10px' }}>
                  {fotosReales.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFotoActiva(idx)}
                      style={{
                        position: 'relative',
                        height: '62px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: fotoActiva === idx ? '2px solid #d91a2a' : '2px solid transparent',
                        padding: 0,
                        backgroundColor: '#f1f5f9',
                        cursor: 'pointer',
                        transform: fotoActiva === idx ? 'scale(0.97)' : 'scale(1)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <img src={img} alt={`Miniatura ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {idx === 4 && fotosReales.length > 5 && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(9, 14, 26, 0.65)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          +{fotosReales.length - 4} fotos
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Grid de Especificaciones (2x2) Compacto y Estilizado */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#fff8f8', border: '1px solid #fee2e2', borderRadius: '10px', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#d91a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={14} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: 700, color: '#d91a2a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Capacidad</span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>{apto.personas || apto.capacidad || 'Hasta 6 personas'}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff8f8', border: '1px solid #fee2e2', borderRadius: '10px', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#d91a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BedDouble size={14} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: 700, color: '#d91a2a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Habitaciones</span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>{apto.habitaciones || apto.numHabitaciones || '1 Habitación'}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff8f8', border: '1px solid #fee2e2', borderRadius: '10px', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#d91a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bath size={14} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: 700, color: '#d91a2a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Baños</span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>{apto.banos || apto.numBanos || '2 Baños completos'}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff8f8', border: '1px solid #fee2e2', borderRadius: '10px', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#d91a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building size={14} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: 700, color: '#d91a2a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Formato</span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>{apto.formato || apto.tipo || 'Suite Familiar'}</span>
                </div>
              </div>
            </div>

            {/* 3. Amenidades y Servicios del Apartamento (Compacto y Elegante) */}
            <div>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                <span style={{ color: '#f59e0b' }}>✨</span> Lo que ofrece este apartamento
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.74rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                  <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><Wifi size={13} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600, fontSize: '0.74rem' }}>Wi-Fi Alta Velocidad</strong>
                    <span style={{ color: '#64748b', fontSize: '0.67rem' }}>Fibra 300 Mbps para teletrabajo</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                  <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><UtensilsCrossed size={13} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600, fontSize: '0.74rem' }}>Cocina Integral</strong>
                    <span style={{ color: '#64748b', fontSize: '0.67rem' }}>Equipada con vajilla y nevera</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                  <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><Tv size={13} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600, fontSize: '0.74rem' }}>Smart TV 55"</strong>
                    <span style={{ color: '#64748b', fontSize: '0.67rem' }}>Streaming listo (Netflix/Prime)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                  <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><Shirt size={13} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600, fontSize: '0.74rem' }}>Zona de Lavado</strong>
                    <span style={{ color: '#64748b', fontSize: '0.67rem' }}>Lavadora/Secadora en suite</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                  <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><KeyRound size={13} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600, fontSize: '0.74rem' }}>Cerradura Digital</strong>
                    <span style={{ color: '#64748b', fontSize: '0.67rem' }}>Autocheck-in con código único</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                  <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155', flexShrink: 0 }}><Home size={13} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 600, fontSize: '0.74rem' }}>Balcón Privado</strong>
                    <span style={{ color: '#64748b', fontSize: '0.67rem' }}>Vista a la ciudad de Bogotá</span>
                  </div>
                </div>
              </div>

              {/* Franja de Check-in / Check-out */}
              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} color="#d91a2a" /> Check-in: 3:00 PM</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} color="#d91a2a" /> Check-out: 11:00 AM</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12} color="#10b981" /> Vigilancia: 24/7</span>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* COLUMNA DERECHA: WIDGET DE RESERVA + CALENDARIO INTERACTIVO   */}
          {/* ============================================================== */}
          <div style={{ padding: '24px 28px', backgroundColor: '#fafbfc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            <div>
              {/* Selectores Interactivos de Llegada / Salida / Huéspedes (Inicio Inmediato de Reserva) */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setMensajeInteraccion('Haz clic en el calendario abajo para seleccionar tu fecha de llegada.');
                      setTimeout(() => setMensajeInteraccion(null), 3000);
                    }}
                  >
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Llegada</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: fechaEntrada ? '#0f172a' : '#d91a2a' }}>
                      <span>{fechaEntrada ? formatearFechaDisplay(fechaEntrada) : 'Elige en calendario'}</span>
                      <CalendarIcon size={13} color={fechaEntrada ? '#64748b' : '#d91a2a'} />
                    </div>
                  </div>

                  <div 
                    style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '12px', cursor: 'pointer' }}
                    onClick={() => {
                      setMensajeInteraccion('Haz clic en el calendario abajo para seleccionar tu fecha de salida.');
                      setTimeout(() => setMensajeInteraccion(null), 3000);
                    }}
                  >
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Salida</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: fechaSalida ? '#0f172a' : '#d91a2a' }}>
                      <span>{fechaSalida ? formatearFechaDisplay(fechaSalida) : 'Elige en calendario'}</span>
                      <CalendarIcon size={13} color={fechaSalida ? '#94a3b8' : '#d91a2a'} />
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Huéspedes</label>
                  <HuespedesPicker 
                    maxCapacidad={capacidadNum}
                    onChange={(obj) => setNumHuespedes(obj.summary)}
                  />
                </div>
              </div>

              {/* Notificación interactiva / Guía al hacer clic */}
              {mensajeInteraccion && (
                <div style={{
                  marginBottom: '10px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#be123c',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{mensajeInteraccion}</span>
                </div>
              )}

              {/* CALENDARIO DE DISPONIBILIDAD ESTILIZADO DE TRES ESTADOS (COMPACTO Y ERGONÓMICO) */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '10px 12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginBottom: '12px' }}>
                
                {/* Header interactivo del Calendario */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <button 
                    type="button" 
                    onClick={handleMesAnterior}
                    disabled={isPrevMonthDisabled}
                    title={isPrevMonthDisabled ? "No es posible navegar a meses anteriores al actual" : "Mes Anterior"}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      background: isPrevMonthDisabled ? '#f1f5f9' : 'none',
                      border: isPrevMonthDisabled ? '1px solid #e2e8f0' : 'none',
                      color: isPrevMonthDisabled ? '#94a3b8' : '#64748b',
                      cursor: isPrevMonthDisabled ? 'not-allowed' : 'pointer',
                      fontSize: '0.68rem',
                      padding: '2px 5px',
                      borderRadius: '5px',
                      opacity: isPrevMonthDisabled ? 0.5 : 1
                    }}
                    onMouseEnter={e => {
                      if (!isPrevMonthDisabled) {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.color = '#0f172a';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isPrevMonthDisabled) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#64748b';
                      }
                    }}
                  >
                    <ChevronLeft size={13} />
                    <span>Mes Ant.</span>
                  </button>

                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>
                    🗓️ Disponibilidad: {nombresMeses[calMonth]} {calYear}
                  </span>

                  <button 
                    type="button" 
                    onClick={handleMesSiguiente}
                    title="Mes Siguiente"
                    style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.68rem', padding: '2px 5px', borderRadius: '5px' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                  >
                    <span>Mes Sig.</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                {/* Leyenda Explicativa de Estados Compacta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '4px 6px', backgroundColor: '#f8fafc', borderRadius: '8px', margin: '6px 0', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', fontWeight: 600, color: '#475569' }}>
                    <span style={{ width: '11px', height: '11px', borderRadius: '3px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', display: 'inline-block' }} />
                    <span>Disponible</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', fontWeight: 600, color: '#94a3b8' }}>
                    <span style={{ width: '11px', height: '11px', borderRadius: '3px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700 }}>
                      —
                    </span>
                    <span>Pasado</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', fontWeight: 600, color: '#ef4444' }}>
                    <span style={{ width: '11px', height: '11px', borderRadius: '3px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#94a3b8', textDecoration: 'line-through 2px #ef4444', fontSize: '8px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✕
                    </span>
                    <span>Ocupado</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', fontWeight: 700, color: '#d91a2a' }}>
                    <span style={{ width: '11px', height: '11px', borderRadius: '3px', backgroundColor: '#d91a2a', color: '#ffffff', fontSize: '8px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✓
                    </span>
                    <span>Tu Selección</span>
                  </div>
                </div>

                {/* Encabezado Días Semanales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '0.66rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px' }}>
                  <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                </div>

                {/* Grilla Interactiva de Días */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {celdasCalendario.map((celda, idx) => {
                    if (celda.tipo === 'vacio') {
                      return <div key={celda.id} style={{ height: '28px' }} />;
                    }

                    // 1. DÍA EN EL PASADO (Estado 0: No permitido reservar antes de hoy)
                    if (celda.isPast || celda.estado === 0) {
                      return (
                        <div
                          key={celda.fechaStr}
                          title={`Fecha pasada (${celda.fechaStr}) no disponible para reservar`}
                          onClick={() => handleDiaClick(celda)}
                          style={{
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            color: '#cbd5e1',
                            fontSize: '0.74rem',
                            fontWeight: 500,
                            cursor: 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            userSelect: 'none',
                            opacity: 0.45
                          }}
                        >
                          {celda.dia}
                        </div>
                      );
                    }

                    // 2. DÍA OCUPADO (Estado 2)
                    if (celda.estado === 2) {
                      return (
                        <div
                          key={celda.fechaStr}
                          title={`Fecha ${celda.fechaStr} ocupada (No disponible)`}
                          onClick={() => handleDiaClick(celda)}
                          style={{
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            color: '#94a3b8',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            textDecoration: 'line-through 2px #ef4444',
                            cursor: 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            userSelect: 'none'
                          }}
                        >
                          {celda.dia}
                        </div>
                      );
                    }

                    // 2. DÍA EN SELECCIÓN (Estado 3: Entrada, Salida o en Rango)
                    if (celda.estado === 3) {
                      const esExtremo = celda.esEntrada || celda.esSalida;
                      return (
                        <button
                          key={celda.fechaStr}
                          type="button"
                          onClick={() => handleDiaClick(celda)}
                          title={`${celda.esEntrada ? 'Llegada: ' : celda.esSalida ? 'Salida: ' : ''}${celda.fechaStr}`}
                          style={{
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: esExtremo ? '#d91a2a' : '#fee2e2',
                            color: esExtremo ? '#ffffff' : '#b91522',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            border: esExtremo ? 'none' : '1px dashed #fca5a5',
                            boxShadow: esExtremo ? '0 2px 6px rgba(217, 26, 42, 0.3)' : 'none',
                            transform: esExtremo ? 'scale(1.05)' : 'scale(1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {celda.dia}
                        </button>
                      );
                    }

                    // 3. DÍA DISPONIBLE (Estado 1)
                    return (
                      <button
                        key={celda.fechaStr}
                        type="button"
                        onClick={() => handleDiaClick(celda)}
                        title={`Seleccionar ${celda.fechaStr}`}
                        style={{
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          color: '#1e293b',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#fff5f5';
                          e.currentTarget.style.borderColor = '#d91a2a';
                          e.currentTarget.style.color = '#d91a2a';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.color = '#1e293b';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {celda.dia}
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* SECCIÓN REDISEÑADA EXACTA AL DISEÑO: UNIDADES ASIGNABLES DE {TIPO} */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                padding: '16px 18px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                marginBottom: '16px'
              }}>
                {/* Cabecera con Icono, Título y Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ fontSize: '1rem' }}>📑</span>
                    <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      UNIDADES ASIGNABLES DE {apto.tipo.toUpperCase() === 'HABITACIONES' ? 'HABITACIÓN' : apto.tipo.toUpperCase()}
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ecfdf5',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid #a7f3d0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    {unidadesDeEstaCategoria.filter(u => !checkUnidadOcupadaModal(u.id || u.numero)).length} de {unidadesDeEstaCategoria.length} disponibles en Torre
                  </span>
                </div>

                <p style={{ margin: '0 0 12px 0', fontSize: '0.73rem', color: '#64748b', lineHeight: 1.45 }}>
                  Selecciona tu apartamento de preferencia. Se asociará automáticamente a tu reserva y recibirás el código de acceso inteligente para esta unidad exacta.
                </p>

                {/* Subfiltros por piso / características */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {subFiltros.map(sf => {
                    const isSfActive = subFiltroPiso === sf.id;
                    return (
                      <button
                        key={sf.id}
                        type="button"
                        onClick={() => setSubFiltroPiso(sf.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: isSfActive ? 'none' : '1px solid #cbd5e1',
                          backgroundColor: isSfActive ? '#0f172a' : '#f8fafc',
                          color: isSfActive ? '#ffffff' : '#334155',
                          fontSize: '0.72rem',
                          fontWeight: isSfActive ? 800 : 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {sf.label}
                      </button>
                    );
                  })}
                </div>

                {/* Grilla de Tarjetas de Unidades (3 columnas ergonómicas con scroll interno suave) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '12px',
                  maxHeight: '190px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}>
                  {unidadesFiltradas.map(u => {
                    const uId = String(u.id || u.numero);
                    const isOcc = checkUnidadOcupadaModal(uId);
                    const isSelected = (selectedUnidadId ? selectedUnidadId === uId : unidadElegidaObj?.numero === u.numero) && !isOcc;

                    return (
                      <div
                        key={uId}
                        onClick={() => {
                          if (!isOcc) setSelectedUnidadId(uId);
                        }}
                        style={{
                          backgroundColor: '#ffffff',
                          border: isSelected ? '2px solid #d91a2a' : (isOcc ? '1px solid #f1f5f9' : '1px solid #cbd5e1'),
                          borderRadius: '10px',
                          padding: '8px 10px',
                          cursor: isOcc ? 'not-allowed' : 'pointer',
                          opacity: isOcc ? 0.45 : 1,
                          boxShadow: isSelected ? '0 2px 8px rgba(217, 26, 42, 0.18)' : 'none',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isSelected ? '#d91a2a' : '#0f172a' }}>
                            Apto {u.numero}
                          </span>

                          {isSelected ? (
                            <span style={{
                              fontSize: '0.64rem',
                              fontWeight: 800,
                              color: '#d91a2a',
                              backgroundColor: '#fff1f2',
                              border: '1px solid #fecdd3',
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}>
                              ✓ Asignado
                            </span>
                          ) : isOcc ? (
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444', textDecoration: 'line-through' }}>
                              Ocupado
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669' }}>
                              Libre
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          {u.piso} • {u.caracteristica}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Barra inferior de confirmación: Unidad elegida y Llave digital lista */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#d91a2a' }} />
                    <span>
                      Unidad elegida: <strong>Apto {unidadElegidaObj?.numero || 'H411'} ({unidadElegidaObj?.torre || 'Torre'}, {unidadElegidaObj?.piso} {unidadElegidaObj?.caracteristica ? `con ${unidadElegidaObj.caracteristica}` : ''})</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.73rem', fontWeight: 700, color: '#d91a2a' }}>
                    <KeyRound size={13} />
                    <span>Llave Digital Lista</span>
                  </div>
                </div>
              </div>

              {/* TARJETA DE DESGLOSE DE PRECIOS Y DESCUENTOS EN TIEMPO REAL */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Resumen de tu Estadía
                  </span>
                  {nochesEstancia > 0 ? (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: porcentajeDescuento > 0 ? '#d1fae5' : '#fee2e2',
                      color: porcentajeDescuento > 0 ? '#065f46' : '#d91a2a'
                    }}>
                      {nochesEstancia} {nochesEstancia === 1 ? 'noche' : 'noches'}
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b'
                    }}>
                      Elige tus fechas
                    </span>
                  )}
                </div>

                {/* Fechas seleccionadas */}
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarIcon size={13} color="#94a3b8" />
                  {fechaEntrada && fechaSalida ? (
                    <span>
                      <strong>{formatearFechaDisplay(fechaEntrada)}</strong> al <strong>{formatearFechaDisplay(fechaSalida)}</strong>
                    </span>
                  ) : fechaEntrada ? (
                    <span>
                      Llegada: <strong>{formatearFechaDisplay(fechaEntrada)}</strong> — <span style={{ color: '#d91a2a', fontWeight: 600 }}>Ahora elige fecha de salida en el calendario</span>
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                      Selecciona fecha de llegada y salida en el calendario
                    </span>
                  )}
                </div>

                {/* Líneas de cálculo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  {nochesEstancia > 0 ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                        <span>{nochesEstancia} {nochesEstancia === 1 ? 'noche' : 'noches'} × ${precioNumerico.toLocaleString('es-CO')} COP</span>
                        <span style={{ fontWeight: 600 }}>${subtotalSinDescuento.toLocaleString('es-CO')} COP</span>
                      </div>

                      {/* Descuento si aplica */}
                      {porcentajeDescuento > 0 ? (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#ecfdf5',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          color: '#065f46',
                          fontWeight: 700
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>🎉 Descuento Larga Estancia ({porcentajeDescuento}%)</span>
                          </span>
                          <span>-${montoDescuento.toLocaleString('es-CO')} COP</span>
                        </div>
                      ) : (
                        <div style={{
                          backgroundColor: '#f8fafc',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          color: '#64748b',
                          border: '1px dashed #cbd5e1'
                        }}>
                          💡 <strong>Ahorro disponible:</strong> Reserva 7 o más noches para obtener un <strong>10% de descuento automático</strong>.
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      color: '#64748b',
                      border: '1px dashed #cbd5e1'
                    }}>
                      Tarifa base: <strong>${precioNumerico.toLocaleString('es-CO')} COP / noche</strong>. Elige tus fechas para cotizar.
                    </div>
                  )}

                  {/* Total final destacado */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '10px',
                    marginTop: '4px'
                  }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                        Total a pagar
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        {nochesEstancia > 0 ? 'Impuestos incluidos • Sin cargos sorpresa' : 'Tarifa calculada al elegir fechas'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {nochesEstancia > 0 ? (
                        <>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                            ${totalCalculado.toLocaleString('es-CO')}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '4px' }}>COP</span>
                        </>
                      ) : (
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#94a3b8' }}>
                          $— COP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Conversión */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={handleActionReservar}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '16px',
                  backgroundColor: '#d91a2a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(217, 26, 42, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b91522'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#d91a2a'; }}
              >
                <span>Reservar este apartamento</span>
                <ArrowRight size={16} />
              </button>

              <a
                href={`https://wa.me/573153512085?text=Hola,%20deseo%20consultar%20disponibilidad%20del%20${encodeURIComponent(apto.nombreModal || apto.titulo)}%20en%20Facile%20Chicó%20(Llegada:%20${fechaEntrada}%20-%20Salida:%20${fechaSalida || fechaEntrada},%20${numHuespedes})`}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.backgroundColor = '#ecfdf5';
                  e.currentTarget.style.color = '#065f46';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#334155';
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>Consultar por WhatsApp</span>
                <MessageSquare size={14} color="#10b981" />
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
