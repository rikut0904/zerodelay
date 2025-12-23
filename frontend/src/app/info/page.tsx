"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { shelters } from "@/data/shelters";
import { useApplyFontSize } from "@/hooks/useApplyFontSize";
import { useLayerVisibility } from "@/hooks/useLayerVisibility";
import { useCurrentPosition } from "@/hooks/useCurrentPosition";

const ShelterMap = dynamic(() => import("@/components/ShelterMap"), { ssr: false });

export default function InfoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useApplyFontSize();
  const showShelters = useLayerVisibility("避難所");
  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const currentPos = useCurrentPosition();

  const toggleShelters = (checked: boolean) => {
    if (typeof window === "undefined") return;
    const defaultLayers = { 避難所: true };
    try {
      const saved = localStorage.getItem("mapLayers");
      const parsed = saved ? JSON.parse(saved) : {};
      const next = { ...defaultLayers, ...parsed, 避難所: checked };
      localStorage.setItem("mapLayers", JSON.stringify(next));
      window.dispatchEvent(new Event("mapLayersUpdated"));
    } catch {
      localStorage.setItem("mapLayers", JSON.stringify({ 避難所: checked }));
      window.dispatchEvent(new Event("mapLayersUpdated"));
    }
  };

  const handleSelectShelter = (id: string) => {
    setSelectedId(id);
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sheltersWithDistance = useMemo(() => {
    if (!currentPos) return shelters.map((s) => ({ shelter: s, distanceKm: null }));
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const [lat1, lon1] = currentPos;
    return shelters
      .map((s) => {
        const lat2 = s.lat;
        const lon2 = s.lng;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return { shelter: s, distanceKm: d };
      })
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }, [currentPos]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📡 情報</h1>

      <section style={styles.section}>
        <h2 style={styles.subtitle}>避難所一覧</h2>
        <p style={styles.lead}>タップすると地図がその避難所へ移動します。</p>
        <label style={styles.toggleRow}>
          <input
            type="checkbox"
            checked={showShelters}
            onChange={(e) => toggleShelters(e.target.checked)}
          />
          <span>避難所のピンを表示</span>
        </label>
        <div style={styles.shelterGrid}>
          {sheltersWithDistance.map(({ shelter, distanceKm }) => (
            <button
              key={shelter.id}
              style={styles.shelterCard}
              onClick={() => handleSelectShelter(shelter.id)}
            >
              <div style={styles.shelterName}>{shelter.name}</div>
              <div style={styles.shelterAddress}>{shelter.address}</div>
              <div style={styles.cardHint}>
                {distanceKm != null ? `現在地から約 ${distanceKm.toFixed(1)} km` : "地図で位置を確認"}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section style={styles.section} ref={mapSectionRef}>
        <h2 style={styles.subtitle}>地図で確認</h2>
        <div style={styles.mapWrapper}>
          <ShelterMap shelters={shelters} selectedId={selectedId} currentPosition={currentPos} />
        </div>
      </section>

      <div style={styles.nav}>
        <Link href="/" style={styles.link}>
          🏠 ホーム
        </Link>
        <Link href="/info" style={{ ...styles.link, fontWeight: 700 }}>
          📡 情報
        </Link>
        <Link href="/setting" style={styles.link}>
          ⚙️ 設定
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "24px 16px 90px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    fontSize: "var(--app-font-size)",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    padding: 16,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  lead: {
    margin: "0 0 10px",
    color: "#4b5563",
  },
  toggleRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    fontSize: "var(--app-font-size)",
    cursor: "pointer",
  },
  shelterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  shelterCard: {
    textAlign: "left",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    cursor: "pointer",
    fontSize: "var(--app-font-size)",
  },
  shelterName: {
    fontWeight: 700,
    marginBottom: 6,
  },
  shelterAddress: {
    color: "#4b5563",
    marginBottom: 6,
  },
  cardHint: {
    fontSize: "0.9em",
    color: "#6b7280",
  },
  mapWrapper: {
    height: 360,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: "10px 0",
    borderTop: "1px solid #ccc",
    zIndex: 3000,
    boxShadow: "0 -2px 6px rgba(0,0,0,0.08)",
  },
  link: {
    textDecoration: "none",
    color: "black",
    fontSize: "var(--app-font-size)",
  },
};
