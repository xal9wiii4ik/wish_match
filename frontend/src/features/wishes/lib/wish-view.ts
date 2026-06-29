import { haversine_distance_km } from "@/lib/geo";
import type { Category, GeoPoint, Wish } from "@/types";

export function build_category_map(
  categories: Category[]
): Map<string, Category> {
  return new Map(categories.map((category) => [category.id, category]));
}

export function compute_distance_km(
  me_location: GeoPoint | null | undefined,
  wish: Wish
): number | null {
  if (!me_location) {
    return null;
  }
  const distance = haversine_distance_km(me_location, {
    latitude: wish.location.latitude,
    longitude: wish.location.longitude,
  });
  return Math.round(distance * 10) / 10;
}
