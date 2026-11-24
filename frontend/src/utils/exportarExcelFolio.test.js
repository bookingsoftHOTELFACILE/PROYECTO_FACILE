import { describe, it, expect, vi } from 'vitest';
import { exportarExcelFolio } from './exportarExcelFolio.js';

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('exportarExcelFolio — Generador de Hoja Contable Oficial Excel (.xlsx)', () => {
  it('debe procesar un objeto de reserva y generar el archivo Excel sin errores', async () => {
    const mockFuente = {
      reserva: {
        id_reserva: 1218,
        huesped_nombre: 'Maritza Gomez',
        huesped_documento: '47446544',
        habitacion_numero: 'D108',
        habitacion_tipo: 'Dúplex',
        fecha_entrada: '2026-11-20',
        fecha_salida: '2026-11-26',
        noches: 6,
        precio_noche: 250000,
        estado: 'In-House (Activa)',
      },
      cotizacion: {
        noches: 6,
        subtotal: 1500000,
        descuento: 0,
        total: 1500000,
      },
      iva: {
        base: 1260504.2,
        iva: 239495.8,
      },
      totales: {
        total: 1500000,
        pagado: 500000,
        saldo: 1000000,
        estado: 'Pendiente',
      },
      pagos: [
        {
          id_pago: 1,
          monto: 500000,
          metodo: 'Tarjeta de crédito',
          fecha: '2026-11-20 14:30',
          referencia: 'TX-9901',
          creado_por: 'Recepcion Facile (RF)',
        },
      ],
    };

    const workbook = await exportarExcelFolio(mockFuente);
    expect(workbook).toBeDefined();
    expect(workbook.worksheets.length).toBe(2);

    const sheetPrincipal = workbook.worksheets[0];
    expect(sheetPrincipal).toBeDefined();
    expect(sheetPrincipal.name).toContain('Folio_1218');

    const sheetFiscal = workbook.getWorksheet('Resumen_Fiscal_DIAN');
    expect(sheetFiscal).toBeDefined();
  });

  it('debe tolerar un objeto vacío o plano aplicando valores por defecto seguros', async () => {
    const workbook = await exportarExcelFolio({});
    expect(workbook).toBeDefined();
    expect(workbook.worksheets.length).toBe(2);
    expect(workbook.worksheets[0]).toBeDefined();
  });
});
