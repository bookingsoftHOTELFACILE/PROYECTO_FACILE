import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Genera y descarga el archivo Microsoft Excel (.xlsx) oficial de Facile Apartamentos
 * con diseño corporativo, banners combinados, formatos contables COP y colores oficiales.
 * Formato formal 100% corporativo sin emojis.
 */
export async function exportarExcelFolio(fuente = {}) {
  // Soporta tanto el objeto folio completo del backend como un objeto plano de reserva
  const reserva = fuente.reserva || fuente;
  const cotizacion = fuente.cotizacion || {};
  const iva = fuente.iva || {};
  const totales = fuente.totales || {};
  const pagos = Array.isArray(fuente.pagos) ? fuente.pagos : [];

  const noches = Number(cotizacion.noches || reserva.noches || 1);
  const tarifaNoche = Number(
    reserva.precio_noche ||
    reserva.tarifaNoche ||
    reserva.tarifaBaseNoche ||
    (noches > 0 && cotizacion.subtotal ? cotizacion.subtotal / noches : 250000)
  );
  const subtotal = Number(cotizacion.subtotal || tarifaNoche * noches);
  const descuento = Number(cotizacion.descuento || reserva.descuento || 0);
  const total = Number(totales.total || cotizacion.total || reserva.total || (subtotal - descuento));
  const baseGravable = Number(iva.base || reserva.baseGravable || (total / 1.19));
  const iva19 = Number(iva.iva || reserva.iva19 || (total - baseGravable));
  const pagado = Number(totales.pagado ?? reserva.pagado ?? 0);
  const saldoPendiente = Number(totales.saldo ?? reserva.saldoPendiente ?? (total - pagado));

  const nroFolio = String(reserva.id_reserva || reserva.folio || reserva.id || '806');
  const huesped = reserva.huesped_nombre || reserva.huesped || reserva.nombre || 'Jose Miguel Chico';
  const documento = reserva.huesped_documento ? `C.C. ${reserva.huesped_documento}` : (reserva.documento || reserva.doc || 'C.C. 1016094333');
  const numHab = reserva.habitacion_numero || reserva.apartamento || 'D102';
  const apartamento = String(numHab).startsWith('Apto') ? numHab : `Apto ${numHab}`;
  const tipoUnidad = reserva.habitacion_tipo
    ? `${reserva.habitacion_tipo} Ejecutivo (2 Niveles)`
    : (reserva.tipoUnidad || 'Dúplex Ejecutivo (2 Niveles)');

  const entrada = reserva.fecha_entrada ? `${reserva.fecha_entrada} (15:00 COT)` : (reserva.entrada || '2026-11-20 (15:00 COT)');
  const salida = reserva.fecha_salida ? `${reserva.fecha_salida} (11:00 COT)` : (reserva.salida || '2026-11-29 (11:00 COT)');
  const estadoReserva = reserva.estado === 'Check-In' ? 'Check-In Activo' : (reserva.estado || 'Confirmada');
  const observaciones = reserva.observaciones || 'Huésped corporativo frecuente. Solicitó parqueadero cubierto para vehículo particular y factura a nombre propio.';

  // 2. Crear Libro de Trabajo
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Facile Apartamentos PMS';
  workbook.lastModifiedBy = 'Sistema PMS BookingSoft';
  workbook.created = new Date();

  // Hoja Principal
  const nombreHoja = `Folio_${nroFolio}_${apartamento.replace(/[^a-zA-Z0-9]/g, '')}`;
  const sheet = workbook.addWorksheet(nombreHoja.slice(0, 31), {
    views: [{ showGridLines: true }]
  });

  // Hoja Secundaria (Resumen Fiscal DIAN)
  const sheetFiscal = workbook.addWorksheet('Resumen_Fiscal_DIAN', {
    views: [{ showGridLines: true }]
  });

  // 3. Configuración de Anchos de Columna en la Hoja Principal (A - F)
  sheet.columns = [
    { key: 'colA', width: 28 }, // Conceptos / Etiquetas
    { key: 'colB', width: 26 }, // Huésped / Cantidad
    { key: 'colC', width: 20 }, // Documento / Valores
    { key: 'colD', width: 24 }, // Apto / Tarifa Unitaria
    { key: 'colE', width: 24 }, // Fechas / Totales
    { key: 'colF', width: 24 }, // Balances / Estados
  ];

  // Paleta de Colores
  const COLOR_HEADER_DARK = '0F172A'; // Azul carbón profundo
  const COLOR_SUBHEADER_DARK = '1E293B'; // Azul pizarra
  const COLOR_RED_FACILE = 'D91A2A'; // Rojo oficial
  const COLOR_RED_BG = 'FEE2E2'; // Rosa pastel para alertas
  const COLOR_GREEN_TEXT = '047857'; // Verde descuento
  const COLOR_GRAY_BG = 'F1F5F9'; // Gris suave contenedores
  const COLOR_BORDER = 'E2E8F0'; // Borde sutil

  const borderThin = {
    top: { style: 'thin', color: { argb: COLOR_BORDER } },
    left: { style: 'thin', color: { argb: COLOR_BORDER } },
    bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
    right: { style: 'thin', color: { argb: COLOR_BORDER } }
  };

  // --- FILA 1: BANNER CORPORATIVO PRINCIPAL ---
  sheet.mergeCells('A1:F1');
  const r1 = sheet.getCell('A1');
  r1.value = `FACILE | APARTAMENTOS BOGOTÁ — FOLIO OFICIAL DE RESERVA #${nroFolio}`;
  r1.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFF' } };
  r1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_DARK } };
  r1.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(1).height = 36;

  // --- FILA 2: RADICADO Y SUBTÍTULO ---
  sheet.mergeCells('A2:F2');
  const r2 = sheet.getCell('A2');
  r2.value = 'Sistema de Gestión Hotelera (PMS) • Radicado DIAN / SIRE • Sede Chicó: Calle 93 # 12-40, Bogotá D.C., Colombia';
  r2.font = { name: 'Segoe UI', size: 9, color: { argb: '94A3B8' } };
  r2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_SUBHEADER_DARK } };
  r2.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(2).height = 20;

  sheet.addRow([]); // Fila 3 vacía

  // --- FILA 4: ENCABEZADOS DE INFORMACIÓN (SIN EMOJIS) ---
  sheet.mergeCells('A4:C4');
  const hInfo = sheet.getCell('A4');
  hInfo.value = 'INFORMACIÓN DE LA RESERVA & TITULAR';
  hInfo.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '1E293B' } };
  hInfo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_GRAY_BG } };
  hInfo.alignment = { vertical: 'middle', indent: 1 };

  sheet.mergeCells('D4:F4');
  const hApto = sheet.getCell('D4');
  hApto.value = 'DETALLE DEL ALOJAMIENTO & FECHAS';
  hApto.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '1E293B' } };
  hApto.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_GRAY_BG } };
  hApto.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(4).height = 24;

  // --- FILAS 5-9: METADATOS ---
  const meta = [
    ['Folio Nro:', `#${nroFolio}`, '', 'Apartamento Asignado:', apartamento, ''],
    ['Huésped Titular:', huesped, '', 'Tipo de Unidad:', tipoUnidad, ''],
    ['Documento de Identidad:', documento, '', 'Fecha de Entrada (Check-In):', entrada, ''],
    ['Estado de la Reserva:', estadoReserva, '', 'Fecha de Salida (Check-Out):', salida, ''],
    ['Plazo de Estadía:', `${noches} Noches`, '', 'Hora Límite Salida:', '11:00 AM COT', '']
  ];

  meta.forEach((rowVals, idx) => {
    const row = sheet.addRow(rowVals);
    row.height = 21;
    row.getCell(1).font = { name: 'Segoe UI', size: 9.5, color: { argb: '64748B' } };
    row.getCell(2).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '0F172A' } };
    row.getCell(4).font = { name: 'Segoe UI', size: 9.5, color: { argb: '64748B' } };

    // Apartamento en rojo corporativo
    if (idx === 0) {
      row.getCell(5).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_RED_FACILE } };
    } else {
      row.getCell(5).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '0F172A' } };
    }
  });

  sheet.addRow([]); // Fila 10 vacía

  // --- FILA 11: SECCIÓN LIQUIDACIÓN (SIN EMOJIS) ---
  sheet.mergeCells('A11:F11');
  const hLiq = sheet.getCell('A11');
  hLiq.value = 'LIQUIDACIÓN DE ESTADÍA Y BASE TRIBUTARIA (TARIFA OFICIAL)';
  hLiq.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
  hLiq.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_SUBHEADER_DARK } };
  hLiq.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(11).height = 24;

  // --- FILA 12: CABECERA TABLA DE TARIFA ---
  const headerTarifa = sheet.addRow([
    'CONCEPTO / DESCRIPCIÓN DEL CARGO',
    'CANTIDAD / NOCHES',
    '',
    'VALOR TARIFA UNITARIA',
    '',
    'VALOR TOTAL (COP)'
  ]);
  sheet.mergeCells('B12:C12');
  sheet.mergeCells('D12:E12');
  headerTarifa.height = 22;
  headerTarifa.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '334155' } };
  headerTarifa.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };

  // --- FILA 13: ESTADÍA BASE ---
  const rowEstadia = sheet.addRow([
    `Estadía Alojamiento ${apartamento} (Tarifa Noche)`,
    `${noches} noches`,
    '',
    tarifaNoche,
    '',
    subtotal
  ]);
  sheet.mergeCells('B13:C13');
  sheet.mergeCells('D13:E13');
  rowEstadia.height = 22;
  rowEstadia.getCell(4).numFmt = '"$ "#,##0';
  rowEstadia.getCell(6).numFmt = '"$ "#,##0';
  rowEstadia.getCell(6).font = { name: 'Segoe UI', size: 9.5, bold: true };

  // --- FILA 14: DESCUENTO LARGA ESTADÍA ---
  const descPctStr = noches >= 15 ? '15 %' : (noches >= 7 ? '10 %' : '0 %');
  const rowDesc = sheet.addRow([
    'Descuento Larga Estadía (>7 noches consecutivas)',
    descPctStr,
    '',
    `-${descPctStr}`,
    '',
    -descuento
  ]);
  sheet.mergeCells('B14:C14');
  sheet.mergeCells('D14:E14');
  rowDesc.height = 22;
  rowDesc.getCell(1).font = { name: 'Segoe UI', size: 9.5, color: { argb: COLOR_GREEN_TEXT } };
  rowDesc.getCell(2).font = { name: 'Segoe UI', size: 9.5, color: { argb: COLOR_GREEN_TEXT } };
  rowDesc.getCell(4).font = { name: 'Segoe UI', size: 9.5, color: { argb: COLOR_GREEN_TEXT } };
  rowDesc.getCell(6).numFmt = '"-$ "#,##0';
  rowDesc.getCell(6).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLOR_GREEN_TEXT } };

  sheet.addRow([]); // Fila 15 vacía

  // --- FILA 16: ENCABEZADOS FISCAL Y BALANCE ---
  sheet.mergeCells('A16:C16');
  const hFisc = sheet.getCell('A16');
  hFisc.value = 'DESGLOSE FISCAL (ART. 468 ET)';
  hFisc.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '475569' } };
  hFisc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_GRAY_BG } };

  sheet.mergeCells('D16:F16');
  const hBal = sheet.getCell('D16');
  hBal.value = 'BALANCE FINANCIERO Y ESTADO DE CUENTA';
  hBal.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '475569' } };
  hBal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_GRAY_BG } };
  sheet.getRow(16).height = 22;

  // --- FILA 17: BASE GRAVABLE & TOTAL ---
  const rowF1 = sheet.addRow([
    'Base Gravable (Excluido IVA):',
    '',
    baseGravable,
    'Total Liquidado Reserva:',
    '',
    total
  ]);
  sheet.mergeCells('A17:B17');
  sheet.mergeCells('D17:E17');
  rowF1.height = 21;
  rowF1.getCell(3).numFmt = '"$ "#,##0.00';
  rowF1.getCell(6).numFmt = '"$ "#,##0';
  rowF1.getCell(6).font = { name: 'Segoe UI', size: 9.5, bold: true };

  // --- FILA 18: IVA 19% & ANTICIPOS ---
  const rowF2 = sheet.addRow([
    'IVA Hotelero Generado (19% Incluido):',
    '',
    iva19,
    'Total Pagado / Anticipos:',
    '',
    pagado
  ]);
  sheet.mergeCells('A18:B18');
  sheet.mergeCells('D18:E18');
  rowF2.height = 21;
  rowF2.getCell(3).numFmt = '"$ "#,##0.00';
  rowF2.getCell(6).numFmt = '"$ "#,##0';
  rowF2.getCell(6).font = { name: 'Segoe UI', size: 9.5, bold: true };

  // --- FILA 19: SALDO PENDIENTE ---
  const rowF3 = sheet.addRow([
    'Régimen Común • Facturación Electrónica DIAN',
    '',
    '',
    'SALDO PENDIENTE EXIGIBLE:',
    '',
    saldoPendiente
  ]);
  sheet.mergeCells('A19:C19');
  sheet.mergeCells('D19:E19');
  rowF3.height = 28;
  rowF3.getCell(1).font = { name: 'Segoe UI', size: 8.5, italic: true, color: { argb: '64748B' } };

  // Resaltado de Saldo
  rowF3.getCell(4).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_RED_FACILE } };
  rowF3.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
  rowF3.getCell(6).font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: COLOR_RED_FACILE } };
  rowF3.getCell(6).numFmt = '"$ "#,##0';
  rowF3.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_RED_BG } };
  rowF3.getCell(6).border = {
    top: { style: 'medium', color: { argb: COLOR_RED_FACILE } },
    bottom: { style: 'double', color: { argb: COLOR_RED_FACILE } },
    left: { style: 'thin', color: { argb: COLOR_RED_FACILE } },
    right: { style: 'thin', color: { argb: COLOR_RED_FACILE } }
  };

  sheet.addRow([]); // Fila 20 vacía

  // --- FILA 21: TRANSACCIONES Y PAGOS (SIN EMOJIS) ---
  sheet.mergeCells('A21:F21');
  const hPagos = sheet.getCell('A21');
  hPagos.value = 'REGISTRO HISTÓRICO DE TRANSACCIONES Y MEDIOS DE PAGO';
  hPagos.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
  hPagos.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_SUBHEADER_DARK } };
  hPagos.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(21).height = 24;

  const rowHeadPagos = sheet.addRow([
    'FECHA Y HORA', 'MÉTODO DE PAGO', 'REFERENCIA TRANSACCIÓN', 'MONTO APLICADO', 'ESTADO', 'REGISTRADO POR'
  ]);
  rowHeadPagos.height = 20;
  rowHeadPagos.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: '475569' } };
  rowHeadPagos.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };

  if (pagos.length === 0) {
    const rowSin = sheet.addRow([
      '-- Sin pagos registrados aún (Cobro en mostrador recepción programado para el Check-In) --',
      '', '', '', '', ''
    ]);
    sheet.mergeCells(`A${rowSin.number}:F${rowSin.number}`);
    rowSin.height = 22;
    rowSin.getCell(1).font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: '94A3B8' } };
    rowSin.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  } else {
    pagos.forEach((pago) => {
      const pRow = sheet.addRow([
        pago.creado_en ? String(pago.creado_en).replace('T', ' ').slice(0, 16) : 'N/A',
        pago.metodo || 'Efectivo',
        pago.referencia || pago.referencia_gateway || '-',
        Number(pago.monto || 0),
        pago.estado || 'Confirmado',
        pago.creado_por || 'Sistema'
      ]);
      pRow.height = 21;
      pRow.getCell(4).numFmt = '"$ "#,##0';
      pRow.getCell(4).font = { name: 'Segoe UI', size: 9.5, bold: true };
    });
  }

  sheet.addRow([]); // Fila vacía

  // --- OBSERVACIONES ---
  const rowObs = sheet.addRow([
    'Observaciones Generales:',
    observaciones,
    '', '', '', ''
  ]);
  sheet.mergeCells(`B${rowObs.number}:F${rowObs.number}`);
  rowObs.height = 22;
  rowObs.getCell(1).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '1E293B' } };
  rowObs.getCell(2).font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: '475569' } };

  // --- APLICAR BORDES SUTILES A TODAS LAS CELDAS VISIBLES ---
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 2 && rowNumber !== 10 && rowNumber !== 15 && rowNumber !== 20) {
      row.eachCell({ includeEmpty: false }, (cell) => {
        if (!cell.border) cell.border = borderThin;
      });
    }
  });

  // --- 4. CONFIGURAR HOJA SECUNDARIA: Resumen_Fiscal_DIAN ---
  sheetFiscal.columns = [{ width: 30 }, { width: 30 }];
  sheetFiscal.addRow(['CONCEPTO TRIBUTARIO', 'VALOR (COP)']).font = { bold: true };
  sheetFiscal.addRow(['Radicado DIAN', `DIAN-2026-BOG-${nroFolio}`]);
  sheetFiscal.addRow(['Huésped', huesped]);
  sheetFiscal.addRow(['Identificación Fiscal', documento]);
  sheetFiscal.addRow(['Base Gravable Neta', baseGravable]).getCell(2).numFmt = '"$ "#,##0.00';
  sheetFiscal.addRow(['IVA Hotelero (19%)', iva19]).getCell(2).numFmt = '"$ "#,##0.00';
  sheetFiscal.addRow(['Total Exigible', total]).getCell(2).numFmt = '"$ "#,##0';

  // --- 5. GENERAR EL BLOB Y DESCARGAR EL ARCHIVO .XLSX ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `FOLIO-${nroFolio}_${apartamento.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  return workbook;
}
