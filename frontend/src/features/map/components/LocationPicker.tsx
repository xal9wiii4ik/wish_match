import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { env_config } from "@/config/env";
import type { GeoPoint } from "@/types";

import { selected_marker_icon } from "../lib/markers";

const tile_url =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const tile_attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO';

interface LocationPickerProps {
  value: GeoPoint | null;
  on_change: (point: GeoPoint) => void;
  height?: string;
}

function ClickCapture({ on_change }: { on_change: (point: GeoPoint) => void }) {
  useMapEvents({
    click: (event) => {
      on_change({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });
  return null;
}

function RecenterOnValue({ value }: { value: GeoPoint | null }) {
  const map = useMap();
  if (value) {
    map.panTo([value.latitude, value.longitude]);
  }
  return null;
}

export function LocationPicker({
  value,
  on_change,
  height = "320px",
}: LocationPickerProps) {
  const center: [number, number] = value
    ? [value.latitude, value.longitude]
    : [env_config.default_map_center.lat, env_config.default_map_center.lng];

  return (
    <div className="space-y-2">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height, width: "100%" }}
        className="overflow-hidden rounded-2xl border border-white/10"
      >
        <TileLayer url={tile_url} attribution={tile_attribution} />
        <ClickCapture on_change={on_change} />
        <RecenterOnValue value={value} />
        {value ? (
          <Marker
            position={[value.latitude, value.longitude]}
            icon={selected_marker_icon}
          />
        ) : null}
      </MapContainer>
      <p className="text-xs text-slate-500">
        {value
          ? `Выбрано: ${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
          : "Нажмите на карту, чтобы выбрать точку"}
      </p>
    </div>
  );
}
