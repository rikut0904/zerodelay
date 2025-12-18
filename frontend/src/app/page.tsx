"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);

  type HazardType = "flood" | "tsunami" | "landslide" | "avalanche" | "inundation";
  const [hazardType, setHazardType] = useState<HazardType[]>([]);

  const toggleHazardType = (type: HazardType) => {
    setHazardType((current) => 
      current.includes(type) 
      ? current.filter((t) => t !== type) 
      : [...current, type]
    );
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
        <div style={styles.drawer}>
          <Link href="/" style={styles.drawerItem}>
            🏠 ホーム
          </Link>
          <Link href="/info" style={styles.drawerItem}>
            📡 情報
          </Link>
          <Link href="/setting" style={styles.drawerItem}>
            ⚙️ 設定
          </Link>
        </div>
      )}

      <div style={styles.buttons}>
        <button style={{...styles.buttonBase,...(hazardType.includes("flood") ? styles.buttonOn : styles.buttonOff),}} onClick={() => toggleHazardType("flood")}>洪水</button>
        <button style={{...styles.buttonBase,...(hazardType.includes("tsunami") ? styles.buttonOn : styles.buttonOff),}} onClick={() => toggleHazardType("tsunami")}>津波</button>
        <button style={{...styles.buttonBase,...(hazardType.includes("landslide") ? styles.buttonOn : styles.buttonOff),}} onClick={() => toggleHazardType("landslide")}>土砂</button>
        <button style={{...styles.buttonBase,...(hazardType.includes("avalanche") ? styles.buttonOn : styles.buttonOff)}} onClick={() => toggleHazardType("avalanche")}>雪崩</button>
        <button style={{...styles.buttonBase,...(hazardType.includes("inundation") ? styles.buttonOn : styles.buttonOff)}} onClick={() => toggleHazardType("inundation")}>内水</button>
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
            bottom: "20px",
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
    justifyContent: "space-between",
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
    position: "absolute",
    top: 60,
    right: 10,
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
  },
  drawerItem: {
    padding: "12px 20px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    color: "#333",
    textDecoration: "none",
    fontSize: "var(--app-font-size)",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px",
  },
    //padding: "var(--button-padding)",
    //backgroundColor: "#4A90E2",
    //color: "#fff",
    //border: "none",
    //borderRadius: "6px",
    //fontSize: "var(--app-font-size)",
    //cursor: "pointer",
  //},
  buttonBase: {
    padding: "var(--button-padding)",
    border: "none",
    borderRadius: "6px",
    fontSize: "var(--app-font-size)",
    cursor: "pointer",
  },

  buttonOn:{
    backgroundColor: "#E74C3C",
    color: "#fff",
  },

  buttonOff: {
    backgroundColor: "#4A90E2",
    color: "#fff",
  },

  mapArea: {
    flex: 1,
    height: "100%",
    width: "100%",
    display: "flex",
    position: "relative",
  },
  nav: {
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: "10px",
    borderTop: "1px solid #ccc",
  },
  link: {
    textDecoration: "none",
    color: "black",
  },
};
