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
  const [hazardType, setHazardType] = useState<"flood" | "tsunami" |"landslide" | null>(null);

  const toggleHazardType = (type: "flood" | "tsunami" | "landslide") => {
    setHazardType((current) => (current === type ? null : type));
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
      {/* 🔍 検索バー＋メニューアイコン */}
      <div style={styles.header}>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="住所・施設名を入力"
            style={styles.searchInput}
          />
        </div>

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
        <button style={styles.button} onClick={() => setHazardType(hazardType === "flood" ? null : "flood")}>洪水</button>
        <button style={styles.button} onClick={() => setHazardType(hazardType === "tsunami" ? null : "tsunami")}>津波</button>
        <button style={styles.button} onClick={() => setHazardType(hazardType === "landslide" ? null : "landslide")}>土砂</button>
      </div>

      <div style={styles.mapArea}>
        <MapView onMapReady={setMap} onPositionChange={setCurrentPos} hazardType={hazardType} />

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
  button: {
    padding: "var(--button-padding)",
    backgroundColor: "#4A90E2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "var(--app-font-size)",
    cursor: "pointer",
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
