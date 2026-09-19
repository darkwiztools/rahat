import type { GeoCoords } from '../types/rahat';

export const WEST_CHAMBARAN_CENTER: GeoCoords = {
  lat: 26.98,
  lng: 84.5,
  address: 'West Champaran District, Bihar, India',
};

export function haversineKm(a: GeoCoords, b: GeoCoords): number {
  const EARTH_RADIUS_KM = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function randomNearby(distanceKm: number, center: GeoCoords = WEST_CHAMBARAN_CENTER): GeoCoords {
  const EARTH_RADIUS_KM = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const random = Math.random();
  const distance = random * distanceKm;
  const bearing = Math.random() * 2 * Math.PI;

  const lat1 = toRad(center.lat);
  const lng1 = toRad(center.lng);
  const angularDist = distance / EARTH_RADIUS_KM;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDist) +
      Math.cos(lat1) * Math.sin(angularDist) * Math.cos(bearing)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDist) * Math.cos(lat1),
      Math.cos(angularDist) - Math.sin(lat1) * Math.sin(lat2)
    );

  const lat = toDeg(lat2);
  const lng = toDeg(lng2);

  return {
    lat: Math.round(lat * 10000) / 10000,
    lng: Math.round(lng * 10000) / 10000,
    address: `Near ${center.address.split(',')[0].trim()}`,
  };
}
