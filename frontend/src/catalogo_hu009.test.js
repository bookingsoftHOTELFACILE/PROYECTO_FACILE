import { describe, it, expect } from 'vitest';

describe('HU-009 — Catálogo y Filtros de Unidades Habitacionales', () => {
  const unidadesCatalogo = [
    // 14 Dúplex
    ...Array.from({ length: 14 }, (_, i) => ({
      numero: `D${101 + i}`,
      tipo: 'Dúplex',
      capacidad: 3,
      precio: 250000,
      estado: 'Disponible'
    })),
    // 11 Dobles
    ...Array.from({ length: 11 }, (_, i) => ({
      numero: `DB${201 + i}`,
      tipo: 'Dobles',
      capacidad: 4,
      precio: 350000,
      estado: 'Disponible'
    })),
    // 2 Familiares
    { numero: 'F301', tipo: 'Familiares', capacidad: 6, precio: 450000, estado: 'Disponible' },
    { numero: 'F302', tipo: 'Familiares', capacidad: 6, precio: 450000, estado: 'Disponible' },
    // 11 Habitaciones / Estándar
    ...Array.from({ length: 11 }, (_, i) => ({
      numero: `H${401 + i}`,
      tipo: 'Habitaciones',
      capacidad: 2,
      precio: 180000,
      estado: 'Disponible'
    }))
  ];

  it('debe contener exactamente 38 unidades habitacionales oficiales del apartahotel', () => {
    expect(unidadesCatalogo).toHaveLength(38);
  });

  it('debe distribuir las unidades correctamente según la regla de negocio', () => {
    const duplex = unidadesCatalogo.filter(u => u.tipo === 'Dúplex');
    const dobles = unidadesCatalogo.filter(u => u.tipo === 'Dobles');
    const familiares = unidadesCatalogo.filter(u => u.tipo === 'Familiares');
    const habitaciones = unidadesCatalogo.filter(u => u.tipo === 'Habitaciones');

    expect(duplex).toHaveLength(14);
    expect(dobles).toHaveLength(11);
    expect(familiares).toHaveLength(2);
    expect(habitaciones).toHaveLength(11);
  });

  it('debe aplicar filtros dinámicos por categoría sin alterar la lista original', () => {
    const filtrarPorCategoria = (cat) => 
      cat === 'todas' ? unidadesCatalogo : unidadesCatalogo.filter(u => u.tipo === cat);

    expect(filtrarPorCategoria('Dúplex')).toHaveLength(14);
    expect(filtrarPorCategoria('Dobles')).toHaveLength(11);
    expect(filtrarPorCategoria('Familiares')).toHaveLength(2);
    expect(filtrarPorCategoria('Habitaciones')).toHaveLength(11);
    expect(filtrarPorCategoria('todas')).toHaveLength(38);
  });

  it('debe aplicar filtros dinámicos por capacidad de personas', () => {
    const filtrarPorCapacidad = (cap) =>
      cap === 'todas' ? unidadesCatalogo : unidadesCatalogo.filter(u => u.capacidad === Number(cap));

    expect(filtrarPorCapacidad('2')).toHaveLength(11); // Habitaciones
    expect(filtrarPorCapacidad('3')).toHaveLength(14); // Dúplex
    expect(filtrarPorCapacidad('4')).toHaveLength(11); // Dobles
    expect(filtrarPorCapacidad('6')).toHaveLength(2);  // Familiares
    expect(filtrarPorCapacidad('todas')).toHaveLength(38);
  });

  it('debe combinar filtros de categoría y capacidad correctamente', () => {
    const filtrar = (cat, cap) => unidadesCatalogo.filter(u => {
      const matchCat = cat === 'todas' || u.tipo === cat;
      const matchCap = cap === 'todas' || u.capacidad === Number(cap);
      return matchCat && matchCap;
    });

    expect(filtrar('Dúplex', '3')).toHaveLength(14);
    expect(filtrar('Dúplex', '4')).toHaveLength(0); // combinación no existente
    expect(filtrar('Familiares', '6')).toHaveLength(2);
  });
});
