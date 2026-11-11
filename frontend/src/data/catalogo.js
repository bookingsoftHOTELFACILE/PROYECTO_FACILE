/*
  Catálogo semilla de unidades habitacionales (Fase A).
  Fuente de respaldo cuando el backend no responde.
*/
const CATALOGO_HABITACIONES_INICIAL = [
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
  { id_habitacion: 26, numero: 'F301', tipo: 'Familiares', capacidad: 6, precio_noche: 450000, estado: 'Disponible', piso: 'Piso 3', zona: 'Piso 3 — Ala Familiar Premium' },
  { id_habitacion: 27, numero: 'F302', tipo: 'Familiares', capacidad: 6, precio_noche: 450000, estado: 'Disponible', piso: 'Piso 3', zona: 'Piso 3 — Ala Familiar Ejecutiva' },
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

export { CATALOGO_HABITACIONES_INICIAL };
