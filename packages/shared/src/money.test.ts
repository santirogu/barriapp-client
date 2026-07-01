import { describe, expect, it } from 'vitest';
import { formatCOP, formatCOPNumber } from './money';
import { toGeoPoint, fromGeoPoint, toNearParam } from './geo';
import { resolveErrorMessage } from './errors';

describe('money', () => {
  it('formats integer COP with symbol and no decimals', () => {
    expect(formatCOP(3500)).toContain('3.500');
    expect(formatCOP(3500)).not.toContain(',00');
  });

  it('rounds and formats plain COP numbers', () => {
    expect(formatCOPNumber(3500.4)).toBe('3.500');
  });
});

describe('geo', () => {
  it('round-trips lat/lng through GeoJSON [lng, lat]', () => {
    const point = toGeoPoint({ lat: 4.609, lng: -74.081 });
    expect(point.coordinates).toEqual([-74.081, 4.609]);
    expect(fromGeoPoint(point)).toEqual({ lat: 4.609, lng: -74.081 });
  });

  it('serializes near param as lng,lat', () => {
    expect(toNearParam({ lat: 4.609, lng: -74.081 })).toBe('-74.081,4.609');
  });
});

describe('errors', () => {
  it('prefers the server message', () => {
    expect(
      resolveErrorMessage({ error: { code: 'invalid_credentials', message: 'Nope' } }),
    ).toBe('Nope');
  });

  it('falls back to the code map', () => {
    expect(
      resolveErrorMessage({ error: { code: 'insufficient_stock', message: '' } }),
    ).toBe('No hay suficiente inventario.');
  });
});
