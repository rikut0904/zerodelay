"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { ScaleControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const KIT_POSITION: [number, number] = [36.531029, 136.62774];
const CITY_HALL_POSITION: [number, number] = [36.5613, 136.6562];

function SetCenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 17);
  }, [map, position]);
  return null;
}

function MapInitializer({
  onMapReady,
}: {
  onMapReady?: (map: any) => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

export default function MapView({
  onMapReady,
  onPositionChange,
  hazardType,
}: {
  onMapReady?: (map: any) => void;
  onPositionChange?: (pos: [number, number]) => void;
  hazardType?: "flood" | "tsunami" | "landslide" | null;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [region, setRegion] = useState("current");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("regionSetting");
    if (!saved) return;
    try {
      setRegion(JSON.parse(saved));
    } catch (error) {
      console.error("Failed to parse regionSetting from localStorage", error);
      localStorage.removeItem("regionSetting");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (region === "current") {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          setPosition(newPos);
          if (onPositionChange) onPositionChange(newPos);
        },
        () => {
          setPosition(KIT_POSITION);
          if (onPositionChange) onPositionChange(KIT_POSITION);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }

    if (region === "kit") {
      setPosition(KIT_POSITION);
      if (onPositionChange) onPositionChange(KIT_POSITION);
      return;
    }

    if (region === "cityhall") {
      setPosition(CITY_HALL_POSITION);
      if (onPositionChange) onPositionChange(CITY_HALL_POSITION);
      return;
    }
  }, [onPositionChange, region]);

  if (!position) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        📡 現在地を取得中...
      </div>
    );
  }

  return (
    <MapContainer center={position} zoom={17} style={{ height: "100%", width: "100%" }}>
      <SetCenter position={position} />
      <MapInitializer onMapReady={onMapReady} />
      <ScaleControl position="bottomleft" imperial={false} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {hazardType && (
        <TileLayer
          url={{
            flood: "https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png",
            tsunami: "https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_pref_data/17/{z}/{x}/{y}.png",
            landslide: "https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki_data/17/{z}/{x}/{y}.png",
          }[hazardType]}
          opacity={0.8}
        />
      )}
      
      <Marker position={position}>
        <Popup>あなたの設定した地域</Popup>
      </Marker>
    </MapContainer>
  );
}
