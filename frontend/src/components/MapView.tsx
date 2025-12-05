"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ScaleControl } from "react-leaflet";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const KIT_POSITION: [number, number] = [36.531029, 136.627740];
const CITY_HALL_POSITION: [number, number] = [36.5613, 136.6562];

function SetCenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 17);
  }, [position]);
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
  }, [map]);
  return null;
}

// ★ Home から onPositionChange を受け取れるよう拡張！
export default function MapView({
  onMapReady,
  onPositionChange,
}: {
  onMapReady?: (map: any) => void;
  onPositionChange?: (pos: [number, number]) => void; // ← 追加
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [region, setRegion] = useState("current");

  useEffect(() => {
    const saved = localStorage.getItem("regionSetting");
    if (saved) setRegion(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (region === "current") {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];

          setPosition(newPos);

          // ★ 現在地を Home に通知！
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
  }, [region]);

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
    <MapContainer
      key={position.toString()}
      center={position}
      zoom={17}
      style={{ height: "100%", width: "100%" }}
    >
      <SetCenter position={position} />

      <MapInitializer onMapReady={onMapReady} />

      <ScaleControl position="bottomleft" imperial={false} />

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker position={position}>
        <Popup>あなたの設定した地域</Popup>
      </Marker>
    </MapContainer>
  );
}
