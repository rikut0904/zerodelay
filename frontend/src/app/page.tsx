"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import dynamic from "next/dynamic";

import { useApplyFontSize } from "@/hooks/useApplyFontSize";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export type HazardType = "flood" | "tsunami" | "landslide" | "avalanche" | "inundation";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);

  const [hazardType, setHazardType] = useState<HazardType[]>([]);
  useApplyFontSize();

  const hazardButtons = [
    { type: "flood" as const, label: "洪水" },
    { type: "tsunami" as const, label: "津波" },
    { type: "landslide" as const, label: "土砂" },
    { type: "avalanche" as const, label: "雪崩" },
    { type: "inundation" as const, label: "内水" },
  ];

  const toggleHazardType = (type: HazardType) => {
    setHazardType((current) =>{
      const newTypes = new Set(current);
      if (newTypes.has(type)) {
        newTypes.delete(type);
      }else {
        newTypes.add(type);
      }
      return [...newTypes];
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkWidth = () => setIsMobile(window.innerWidth < 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const returnToCurrentLocation = () => {
    if (map && currentPos) {
      map.flyTo(currentPos, 17, { duration: 1.2 });
    }
  };

  return (
    <div style={styles.container}>
      {/* 🔍 メニューアイコン */}
      <div style={styles.header}>

        {isMobile && (
          <div
            style={styles.menuIcon}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <Menu size={28} />
          </div>
        )}
      </div>

      {menuOpen && isMobile && (
        <div style={styles.drawerOverlay} onClick={() => setMenuOpen(false)}>
          <div
            style={styles.drawer}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div style={styles.drawerHeader}>
              <span style={styles.drawerTitle}>メニュー</span>
              <button style={styles.closeButton} onClick={() => setMenuOpen(false)}>
                ✕
              </button>
            </div>
            <Link href="/" style={styles.drawerItem} onClick={() => setMenuOpen(false)}>
              🏠 ホーム
            </Link>
            <Link href="/info" style={styles.drawerItem} onClick={() => setMenuOpen(false)}>
              📡 情報
            </Link>
            <Link href="/setting" style={styles.drawerItem} onClick={() => setMenuOpen(false)}>
              ⚙️ 設定
            </Link>
          </div>
        </div>
      )}

      <div style={styles.buttons}>
        {hazardButtons.map(({ type, label }) => (
          <button
            key={type}
            style={{
              ...styles.buttonBase,
              ...(hazardType.includes(type) ? styles.buttonOn : styles.buttonOff),
            }}
            onClick={() => toggleHazardType(type)}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={styles.mapArea}>
        <MapView onMapReady={setMap} 
        onPositionChange={setCurrentPos} 
        hazardType={hazardType} 
        />

        <button
          onClick={returnToCurrentLocation}
          style={{
            position: "absolute",
            bottom: isMobile ? "20px" : "70px",
            right: "20px",
            padding: "10px 14px",
            backgroundColor: "#4A90E2",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            zIndex: 2000,
          }}
        >
          📍 現在地へ戻る
        </button>
      </div>

      {!isMobile && (
        <div style={styles.nav}>
          <Link href="/" style={styles.link}>
            🏠 ホーム
          </Link>
          <Link href="/info" style={styles.link}>
            📡 情報
          </Link>
          <Link href="/setting" style={styles.link}>
            ⚙️ 設定
          </Link>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "sans-serif",
    textAlign: "center",
    backgroundColor: "#f0f4ff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontSize: "var(--app-font-size)",
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "8px 12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  searchBar: {
    flex: 1,
  },
  searchInput: {
    width: "80%",
    padding: "8px",
    fontSize: "var(--app-font-size)",
  },
  menuIcon: {
    cursor: "pointer",
  },
  drawer: {
    width: "100%",
    backgroundColor: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    borderRadius: "0 0 12px 12px",
    overflow: "hidden",
    transform: "translateY(0)",
    transition: "transform 0.2s ease",
    maxHeight: "80vh",
  },
  drawerOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: 12,
    zIndex: 1500,
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    borderBottom: "1px solid #eee",
  },
  drawerTitle: {
    fontWeight: 700,
    fontSize: "var(--app-font-size)",
  },
  closeButton: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    padding: 6,
    lineHeight: 1,
  },
  drawerItem: {
    padding: "18px 20px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    color: "#333",
    textDecoration: "none",
    fontSize: "var(--app-font-size)",
    fontWeight: 600,
  },
  buttons: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px",
  },

  buttonBase: {
    padding: "var(--button-padding)",
    color: "#ffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "var(--app-font-size)",
    cursor: "pointer",
  },

  buttonOn:{
    backgroundColor: "#E74C3C",
  },

  buttonOff: {
    backgroundColor: "#4A90E2",
  },

  mapArea: {
    flex: 1,
    height: "100%",
    width: "100%",
    display: "flex",
    position: "relative",
  },
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: "10px",
    borderTop: "1px solid #ccc",
    zIndex: 3000,
    boxShadow: "0 -2px 6px rgba(0,0,0,0.08)",
  },
  link: {
    textDecoration: "none",
    color: "black",
  },
};
