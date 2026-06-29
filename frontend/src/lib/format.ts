import { formatDistanceToNow, format } from "date-fns";
import { ru } from "date-fns/locale";

export function format_relative_time(iso_date: string): string {
  const parsed = new Date(iso_date);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return formatDistanceToNow(parsed, { addSuffix: true, locale: ru });
}

export function format_date(iso_date: string): string {
  const parsed = new Date(iso_date);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return format(parsed, "d MMMM yyyy", { locale: ru });
}

export function format_distance(distance_km: number | null): string | null {
  if (distance_km === null) {
    return null;
  }
  if (distance_km < 1) {
    return `${Math.round(distance_km * 1000)} м`;
  }
  return `${distance_km.toFixed(1)} км`;
}

export function get_initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}
