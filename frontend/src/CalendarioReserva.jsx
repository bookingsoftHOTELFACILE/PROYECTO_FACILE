import React, { useState, useEffect } from 'react';

/**
 * componente: CalendarioReserva 
 * permite seleccionar fechas de entrega y salida, navegar entre meses 
 * y muestra una cotización en tiempo real.
 */

export const CalendarioReserva = ({
    habitacion = { id_habitacion: 101, numero: 'D101', tipo: 'Dúplex', precio_noche: 200000 },
    reservasExistentes = [],
    onFechasSeleccionadas = () => {},
    initialDate = new Date(2026, 10, 1) // Inicia en Noviembre de 2026 para pruebas predecibles
}) => {
    // Estado del componente 
    const [calDate, setCalDate] = useState(initialDate);
    const [fechaEntrada, setFechaEntrada] = useState('');
    const [fechaSalida, setFechaSalida] = useState('');
    const [cotizacion, setCotizacion] = useState(null);

    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Cálculo de los dias del mes para pintar la cuadricula
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const daysGrid = [];
    for (let i = 0; i < startDay; i++) {
        daysGrid.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        const isOccupied = reservasExistentes.some(
            r => dayStr >= r.fecha_entrada && dayStr <= r.fecha_salida
        );
        const isSelectedIn = fechaEntrada === dayStr;
        const isSelectedOut = fechaSalida === dayStr;
        const inRange = fechaEntrada && fechaSalida && dayStr >= fechaEntrada && dayStr <= fechaSalida;

        daysGrid.push({ d, dayStr, isOccupied, isSelectedIn, isSelectedOut, inRange });
    }

    // Interacción al hacer clic en un dia del calendario
    const handleDayClick = (item) => {
        if (!item || item.isOccupied) return;

        if (!fechaEntrada || (fechaEntrada && fechaSalida)) {
            // primer clic: fija la fecha de entrada
            setFechaEntrada(item.dayStr);
            setFechaSalida('');
        } else if (fechaEntrada && !fechaSalida) {
            // segundo clic: si es posterior, fija la fecha de salida
            if (item.dayStr <= fechaEntrada) {
                setFechaEntrada(item.dayStr);
                setFechaSalida('');
            } else {
                setFechaSalida(item.dayStr);
                onFechasSeleccionadas({ entrada: fechaEntrada, salida: item.dayStr });
            }
        }
    };
    
    // calculo reactivo de la cotizacion
    useEffect(() => {
        if (fechaEntrada && fechaSalida && habitacion) {
            const eDt = new Date(fechaEntrada + 'T00:00:00');
            const sDt = new Date(fechaSalida + 'T00:00:00');

            if (!isNaN(eDt.getTime()) && !isNaN(sDt.getTime()) && sDt > eDt) {
                const diffMs = sDt.getTime() - eDt.getTime();
                const noches = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
                const precio_noche = Number(habitacion.precio_noche) || 0;

                // FORMULA DEL SUBTOTAL (aqui se aplicara el mutante mas adelante)
                const subtotal = noches * precio_noche;
                const descuento = noches >= 15 ? subtotal * 0.15 : (noches >= 7 ? subtotal * 0.10 : 0);
                const total = Math.max(0, subtotal - descuento);

                setCotizacion({ noches, precio_noche, subtotal, descuento, total });
                return;
            }
        }
        setCotizacion(null);
    }, [fechaEntrada, fechaSalida, habitacion]);

    return (
        <div className="calendario-reserva-card" style={{ padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fff', maxWidth: '600px' }}>
            {/* 1. Botones de navegacion de mes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <button
                    type="button"
                    onClick={() => setCalDate(new Date(year, month - 1, 1))}
                >
                    ◀ Mes Ant.
                </button>
                <strong> Disponibilidad: {monthNames[month]} {year}</strong>
                <button
                    type="button"
                    onClick={() => setCalDate(new Date(year, month + 1, 1))}
                >
                    Mes Sig. ▶
                </button>
            </div>

            {/* Grilla de días */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {daysGrid.map((item, idx) => {
                    if (!item) return <div key={`empty-${idx}`} />;
                    return (
                        <button
                            key={item.dayStr}
                            type="button"
                            data-testid={`dia-${item.d}`}
                            onClick={() => handleDayClick(item)}
                            disabled={item.isOccupied}
                            style={{ padding: '0.4rem', cursor: item.isOccupied ? 'not-allowed' : 'pointer' }}
                        >
                            {item.d}
                        </button>
                    );
                })}
            </div>

            {/* Fechas elegidas */}
            <div style={{ marginTop: '0.8rem', fontSize: '0.85rem' }}>
                <p><strong>Entrada:</strong> {fechaEntrada || 'Sin seleccionar'}</p>
                <p><strong>Salida:</strong> {fechaSalida || 'Sin seleccionar'}</p>
            </div>

            {/* 2. Resumen de Cotización asíncrono */}
            {cotizacion && (
                <div data-testid="resumen-cotizacion" style={{ marginTop: '1rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '8px' }}>
                    <h4>Resumen de Cotización</h4>
                    <p>Duración de Estadía: {cotizacion.noches} noches</p>
                    <p>
                        Subtotal Estadía: <span data-testid="subtotal-val">${Number(cotizacion.subtotal).toLocaleString('es-CO')} COP</span>
                    </p>
                    <p>Total a Pagar: ${Number(cotizacion.total).toLocaleString('es-CO')} COP</p>
                </div>
            )}
        </div>
    );
};

export default CalendarioReserva;
