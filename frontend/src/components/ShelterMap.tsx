"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Shelter } from "@/types/shelter";
import { currentMarkerIcon, shelterMarkerIcon } from "@/lib/mapIcons";
import { useLayerVisibility } from "@/hooks/useLayerVisibility";

type Props = {
  shelters: Shelter[];
  selectedId?: string | null;
  currentPosition?: [number, number] | null;
};

function FitAndFocus({ shelters, selectedId, currentPosition }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!shelters.length && !currentPosition) return;
    const points = shelters.map((s) => [s.lat, s.lng]) as [number, number][];
    if (currentPosition) points.push(currentPosition);
    if (!points.length) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 17 });
  }, [currentPosition, map, shelters]);

  useEffect(() => {
    if (!selectedId) return;
    const target = shelters.find((s) => s.id === selectedId);
    if (!target) return;
    map.flyTo([target.lat, target.lng], 18, { duration: 0.8 });
  }, [map, selectedId, shelters]);

  return null;
}

export default function ShelterMap({ shelters, selectedId, currentPosition }: Props) {
  const showShelters = useLayerVisibility("避難所");
  const initialCenter: [number, number] = shelters.length
    ? [shelters[0].lat, shelters[0].lng]
    : currentPosition ?? [36.5613, 136.6562];

  return (
    <MapContainer center={initialCenter} zoom={14} style={{ height: "100%", width: "100%" }}>
      <FitAndFocus shelters={shelters} selectedId={selectedId} currentPosition={currentPosition} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {currentPosition && (
        <Marker position={currentPosition} icon={currentMarkerIcon}>
          <Popup>現在地</Popup>
        </Marker>
      )}
      {showShelters &&
        shelters.map((shelter) => (
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
