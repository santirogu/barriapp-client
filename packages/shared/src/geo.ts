/**
 * Geo helpers. The BarriApp API uses GeoJSON coordinates in
 * **[longitude, latitude]** order (NOT [lat, lng]). Keep this boundary explicit
 * so UI code that thinks in {lat, lng} never leaks the wrong order to the API.
 */

/** A GeoJSON point as stored/sent by the API. */
export interface GeoPoint {
  type: 'Point';
  /** [longitude, latitude] */
  coordinates: [number, number];
}

export interface LatLng {
  lat: number;
  lng: number;
}

/** Build a GeoJSON point from a {lat, lng} pair. */
export function toGeoPoint({ lat, lng }: LatLng): GeoPoint {
  return { type: 'Point', coordinates: [lng, lat] };
}

/** Read a GeoJSON point into a {lat, lng} pair. */
export function fromGeoPoint(point: GeoPoint): LatLng {
  const [lng, lat] = point.coordinates;
  return { lat, lng };
}

/** Serialize a {lat, lng} into the API's `near=lng,lat` query value. */
export function toNearParam({ lat, lng }: LatLng): string {
  return `${lng},${lat}`;
}
