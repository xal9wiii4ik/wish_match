import type { GeoPoint } from "@/types";

const earth_radius_km = 6371;

function to_radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversine_distance_km(a: GeoPoint, b: GeoPoint): number {
  const d_lat = to_radians(b.latitude - a.latitude);
  const d_lng = to_radians(b.longitude - a.longitude);
  const lat_a = to_radians(a.latitude);
  const lat_b = to_radians(b.latitude);

  const sin_lat = Math.sin(d_lat / 2);
  const sin_lng = Math.sin(d_lng / 2);
  const h =
    sin_lat * sin_lat + Math.cos(lat_a) * Math.cos(lat_b) * sin_lng * sin_lng;

  return 2 * earth_radius_km * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function is_valid_coordinate(point: GeoPoint): boolean {
  return (
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}
