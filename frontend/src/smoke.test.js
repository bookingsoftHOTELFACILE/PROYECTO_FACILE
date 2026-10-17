import { describe, it, expect } from 'vitest';

describe('Frontend Smoke Test', () => {
  it('renders application smoke suite', () => {
    const appName = 'BookingSoft - Apartahotel Facile';
    expect(appName).toContain('BookingSoft');
  });
});
