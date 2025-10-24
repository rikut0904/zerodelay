"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";

export default function MapView() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const center: [number, number] = [36.5613, 136.6562]; // 金沢市付近

  return (
    <div style={{ height: "calc(100vh - 100px)", width: "100%" }}>
      {ready && (
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <Marker position={center}>
            <Popup>金沢市付近</Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
}
