"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet マーカーのズレ修正（Next.js では必須）
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("返ってきた座標:", pos.coords.latitude, pos.coords.longitude);
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.log("位置情報エラー:", err);
        setPosition([36.5613, 136.6562]); // 金沢デフォルト
      }
    );
  }, []);

  if (!position) {
    return (
      <div style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        📡 現在地を取得中...
      </div>
    );
  }

  return (
    <MapContainer
      center={position}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position}>
        <Popup>あなたの現在地</Popup>
      </Marker>
    </MapContainer>
  );
}
