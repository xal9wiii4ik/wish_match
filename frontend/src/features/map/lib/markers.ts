import L from "leaflet";

function pin_svg(fill: string, glyph: string): string {
  return `
    <span class="relative flex h-9 w-9 -translate-x-1/2 -translate-y-full items-center justify-center">
      <svg viewBox="0 0 24 24" class="h-9 w-9 drop-shadow-lg" fill="${fill}">
        <path d="M12 2c-3.9 0-7 3.1-7 7 0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z" />
        <circle cx="12" cy="9" r="3" fill="white" />
      </svg>
      <span class="absolute top-1.5 text-xs">${glyph}</span>
    </span>
  `;
}

export const wish_marker_icon = L.divIcon({
  className: "wishmatch-marker",
  html: pin_svg("#6366f1", ""),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -34],
});

export const selected_marker_icon = L.divIcon({
  className: "wishmatch-marker wishmatch-marker--selected",
  html: pin_svg("#ec4899", ""),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -34],
});

export const me_marker_icon = L.divIcon({
  className: "wishmatch-marker wishmatch-marker--me",
  html: `
    <span class="flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-400 ring-4 ring-emerald-400/30"></span>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
