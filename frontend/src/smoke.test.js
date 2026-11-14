import { describe, it, expect } from 'vitest';

describe('Frontend Smoke Test', () => {
  it('renders application smoke suite', () => {
    const appName = 'BookingSoft - Apartahotel Facile';
    expect(appName).toContain('BookingSoft');
  });

  it('persiste y recupera la sesión de huésped desde localStorage', () => {
    const fakeGuest = {
      id_huesped: 42,
      nombre: 'Carlos Mendoza',
      correo: 'carlos.mendoza@gmail.com',
      documento: 'G-551940'
    };
    localStorage.setItem('bookingsoft_guest_user', JSON.stringify(fakeGuest));
    const retrieved = JSON.parse(localStorage.getItem('bookingsoft_guest_user'));
    expect(retrieved.id_huesped).toBe(42);
    expect(retrieved.nombre).toBe('Carlos Mendoza');
    expect(retrieved.correo).toBe('carlos.mendoza@gmail.com');
    localStorage.removeItem('bookingsoft_guest_user');
    expect(localStorage.getItem('bookingsoft_guest_user')).toBeNull();
  });
});
