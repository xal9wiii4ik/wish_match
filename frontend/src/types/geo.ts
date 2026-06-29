export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoLocation extends GeoPoint {
  location_name: string | null;
  city: string | null;
}
