import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { env_config } from "@/config/env";
import { format_distance } from "@/lib/format";
import { compute_distance_km } from "@/features/wishes/lib/wish-view";
import type { Category, GeoPoint, Wish } from "@/types";

import { me_marker_icon, wish_marker_icon } from "../lib/markers";

const tile_url =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const tile_attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface WishMapProps {
  wishes: Wish[];
  category_map?: Map<string, Category>;
  me_location?: GeoPoint | null;
  on_select_wish?: (wish: Wish) => void;
  height?: string;
}

function FitToWishes({
  wishes,
  me_location,
}: {
  wishes: Wish[];
  me_location?: GeoPoint | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = wishes.map((wish) => [
      wish.location.latitude,
      wish.location.longitude,
    ]);
    if (me_location) {
      points.push([me_location.latitude, me_location.longitude]);
    }

    if (points.length === 0) {
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 14 });
  }, [map, wishes, me_location]);

  return null;
}

export function WishMap({
  wishes,
  category_map,
  me_location,
  on_select_wish,
  height = "100%",
}: WishMapProps) {
  const center: [number, number] = [
    me_location?.latitude ?? env_config.default_map_center.lat,
    me_location?.longitude ?? env_config.default_map_center.lng,
  ];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      style={{ height, width: "100%" }}
      className="overflow-hidden rounded-2xl"
    >
      <TileLayer url={tile_url} attribution={tile_attribution} />

      {me_location ? (
        <Marker
          position={[me_location.latitude, me_location.longitude]}
          icon={me_marker_icon}
        >
          <Popup>Вы здесь</Popup>
        </Marker>
      ) : null}

      {wishes.map((wish) => {
        const category = category_map?.get(wish.category_id);
        const distance_label = format_distance(
          compute_distance_km(me_location, wish)
        );
        return (
          <Marker
            key={wish.id}
            position={[wish.location.latitude, wish.location.longitude]}
            icon={wish_marker_icon}
            eventHandlers={{
              click: () => on_select_wish?.(wish),
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold text-white">{wish.title}</p>
                <p className="text-xs text-slate-400">
                  {wish.location.location_name ?? wish.location.city ?? ""}
                </p>
                {category ? (
                  <p className="text-xs text-brand-300">{category.name}</p>
                ) : null}
                {distance_label ? (
                  <p className="text-xs text-slate-500">
                    {distance_label} от вас
                  </p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        );
      })}

      <FitToWishes wishes={wishes} me_location={me_location} />
    </MapContainer>
  );
}
