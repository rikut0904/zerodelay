"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Shelter } from "@/data/shelters";
import { shelterMarkerIcon } from "@/lib/mapIcons";

type Props = {
  shelters: Shelter[];
  selectedId?: string | null;
};

function FitAndFocus({ shelters, selectedId }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!shelters.length) return;
    const bounds = L.latLngBounds(shelters.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 17 });
  }, [map, shelters]);

  useEffect(() => {
    if (!selectedId) return;
    const target = shelters.find((s) => s.id === selectedId);
    if (!target) return;
    map.flyTo([target.lat, target.lng], 18, { duration: 0.8 });
  }, [map, selectedId, shelters]);

  return null;
}

export default function ShelterMap({ shelters, selectedId }: Props) {
  const initialCenter: [number, number] = shelters.length
    ? [shelters[0].lat, shelters[0].lng]
    : [36.5613, 136.6562];

  return (
    <MapContainer center={initialCenter} zoom={14} style={{ height: "100%", width: "100%" }}>
      <FitAndFocus shelters={shelters} selectedId={selectedId} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {shelters.map((shelter) => (
        <Marker
          key={shelter.id}
          position={[shelter.lat, shelter.lng]}
          icon={shelterMarkerIcon}
        >
          <Popup>
            <strong>{shelter.name}</strong>
            <br />
            {shelter.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
