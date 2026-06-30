function read_string(value: string | undefined, fallback: string): string {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  return value.trim();
}

function read_number(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function read_boolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  return value.trim().toLowerCase() === "true";
}

export const env_config = {
  api_base_url: read_string(import.meta.env.VITE_API_BASE_URL, ""),
  use_mocks: read_boolean(import.meta.env.VITE_USE_MOCKS, true),
  default_map_center: {
    lat: read_number(import.meta.env.VITE_DEFAULT_MAP_LAT, 55.751244),
    lng: read_number(import.meta.env.VITE_DEFAULT_MAP_LNG, 37.618423),
  },
} as const;
