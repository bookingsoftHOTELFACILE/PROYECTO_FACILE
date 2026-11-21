import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { exportarExcelFolio } from '../utils/exportarExcelFolio.js';
import ModalFacturaDian from './ModalFacturaDian.jsx';
import ModalFolioReservaIoT from './pms/ModalFolioReservaIoT.jsx';
import {
  apiFetch,
  authHeaders,
  formatErrorMessage,
  API_URL,
} from '../api/client.js';
import { formatoFecha } from '../utils/folio.js';

export default function ModalFolioReserva({ idReserva, onClose }) {
  const { authToken, usuarioSesion } = useApp();

  const [folio, setFolio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [descargando, setDescargando] = useState(false);
  const [mostrarFacturaDian, setMostrarFacturaDian] = useState(false);

  const esAdmin = (usuarioSesion?.rol || '') === 'Administrador';

  const cargarFolio = useCallback(async () => {
    const res = await apiFetch(`/api/reservas/${idReserva}/folio`, { token: authToken });
    setCargando(false);
    if (res.ok) {
      setFolio(res.data);
      setError(null);
    } else {
      setError(formatErrorMessage(res.data?.detail));
    }
  }, [idReserva, authToken]);

  useEffect(() => {
    cargarFolio();
  }, [cargarFolio]);

  const registrarPago = async ({ monto, metodo, referencia }) => {
    const valor = Number(monto);
    if (!(valor > 0)) {
      setError('Ingrese un monto mayor a cero.');
      return;
    }
    setError(null);
    setExito(null);
    const res = await apiFetch(`/api/reservas/${idReserva}/pagos`, {
      method: 'POST',
      token: authToken,
      body: { monto: valor, metodo, referencia: referencia || undefined },
    });

    if (res.ok) {
      setFolio(res.data.folio);
      if (res.data.aprobado) {
        setExito(res.data.message);
      } else {
        setError(res.data.message);
      }
    } else {
      setError(formatErrorMessage(res.data?.detail));
    }
  };

  const anularPago = async (idPago) => {
    if (!window.confirm(`¿Anular el pago #${idPago}? El saldo volverá a estar disponible.`)) {
      return;
    }
    setError(null);
    setExito(null);
    const res = await apiFetch(`/api/reservas/${idReserva}/pagos/${idPago}/anular`, {
      method: 'POST',
      token: authToken,
    });
    if (res.ok) {
      setFolio(res.data.folio);
      setExito(res.data.message);
    } else {
      setError(formatErrorMessage(res.data?.detail));
    }
  };

  const descargarFactura = async () => {
    setDescargando(true);
    setError(null);
    setExito(null);
    try {
      const respuesta = await fetch(`${API_URL}/api/reservas/${idReserva}/factura.xml`, {
        headers: authHeaders(authToken),
      });
      if (!respuesta.ok) {
        let detalle = null;
        try {
          detalle = await respuesta.json();
        } catch {
          detalle = null;
        }
        setError(formatErrorMessage(detalle?.detail));
        return;
      }
      const blob = await respuesta.blob();
      const disposition = respuesta.headers.get('Content-Disposition') || '';
      const coincidencia = /filename="([^"]+)"/.exec(disposition);
      const nombre = coincidencia ? coincidencia[1] : `FACTURA-${idReserva}.xml`;
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
      setExito(
        `Factura ${nombre} descargada. Documento SIMULADO en borrador: sin valor fiscal (pendiente de habilitación DIAN).`
      );
    } catch {
      setError('No se pudo descargar la factura. Verifique la conexión con el servidor.');
    } finally {
      setDescargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-slate-600 font-bold text-center">
          Cargando folio de la reserva...
        </div>
      </div>
    );
  }

  const reserva = folio?.reserva || {};
  const cotizacion = folio?.cotizacion || {};
  const iva = folio?.iva || { base: 0, iva: 0, iva_pct: 19, total: 0 };
  const totales = folio?.totales || { total: 0, pagado: 0, saldo: 0 };
  const pagos = folio?.pagos || [];

  const folioData = {
    numero: String(reserva.id_reserva || idReserva),
    huesped: reserva.huesped_nombre || 'Huésped',
    apartamento: `Apto ${reserva.habitacion_numero || '—'}`,
    checkIn: formatoFecha(reserva.fecha_entrada),
    checkOut: formatoFecha(reserva.fecha_salida),
    noches: cotizacion.noches || 1,
    tarifaBaseNoche: cotizacion.noches ? Math.round((cotizacion.subtotal || totales.total) / cotizacion.noches) : 250000,
    totalReserva: totales.total || 0,
    baseGravable: iva.base || 0,
    iva19: iva.iva || 0,
    pagado: totales.pagado || 0,
    saldoPendiente: totales.saldo || 0,
    rfidTarjeta: reserva.cerradura?.tarjeta_rfid || `CARD-${reserva.habitacion_numero || 'HAB'}-3C2B`,
    pinTeclado: reserva.cerradura?.pin_temporal ? `${reserva.cerradura.pin_temporal} #` : '049481 #'
  };

  return (
    <>
      <ModalFolioReservaIoT
        isOpen={true}
        onClose={onClose}
        folioData={folioData}
        movimientosIniciales={pagos}
        onRegistrarCobro={registrarPago}
        onAnularCobro={anularPago}
        esAdmin={esAdmin}
        onDescargarExcel={() => exportarExcelFolio(folio)}
        onVerFacturaDian={() => setMostrarFacturaDian(true)}
        onDescargarXml={descargarFactura}
        alertaExito={exito}
        alertaError={error}
        descargandoXml={descargando}
      />

      {mostrarFacturaDian && folio && (
        <ModalFacturaDian
          folio={folio}
          onClose={() => setMostrarFacturaDian(false)}
        />
      )}
    </>
  );
}
