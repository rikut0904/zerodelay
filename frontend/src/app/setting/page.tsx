"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";

const fontSizeMap: Record<string, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

export default function SettingPage() {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [regionSetting, setRegionSetting] = useState<string>("current");
  const [mapLayers, setMapLayers] = useState({
    避難所: false,
    河川水位: false,
    土砂危険エリア: false,
  });
  const [fontSize, setFontSize] = useState<string>("medium");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLayers = localStorage.getItem("mapLayers");
    const savedFontSize = localStorage.getItem("fontSize");
    const savedRegion = localStorage.getItem("regionSetting");

    if (savedLayers) {
      try {
        setMapLayers(JSON.parse(savedLayers));
      } catch (error) {
        console.error("Failed to parse mapLayers from localStorage", error);
        localStorage.removeItem("mapLayers");
      }
    }

    if (savedFontSize) {
      try {
        const parsedFont = JSON.parse(savedFontSize);
        setFontSize(parsedFont);
        document.documentElement.style.setProperty(
          "--app-font-size",
          fontSizeMap[parsedFont]
        );
      } catch (error) {
        console.error("Failed to parse fontSize from localStorage", error);
        localStorage.removeItem("fontSize");
      }
    } else {
      localStorage.setItem("fontSize", JSON.stringify("medium"));
      document.documentElement.style.setProperty(
        "--app-font-size",
        fontSizeMap["medium"]
      );
    }

    if (savedRegion) {
      try {
        setRegionSetting(JSON.parse(savedRegion));
      } catch (error) {
        console.error("Failed to parse regionSetting from localStorage", error);
        localStorage.removeItem("regionSetting");
      }
    }
  }, []);

  const autoSave = (key: string, value: any, extraEffect?: () => void) => {
    localStorage.setItem(key, JSON.stringify(value));
    if (extraEffect) extraEffect();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ 設定</h1>

      <section style={styles.section}>
        <button style={styles.itemButton} onClick={() => setOpenModal("region")}>
          📍 表示する地域の設定
        </button>

        <button style={styles.itemButton} onClick={() => setOpenModal("map")}>
          🗺️ ハザードマップの表示設定
        </button>

        <button style={styles.itemButton} onClick={() => setOpenModal("view")}>
          👀 画面の見やすさ設定
        </button>
      </section>

      {openModal === "region" && (
        <Modal title="📍 表示する地域の設定" onClose={() => setOpenModal(null)}>
          <label style={styles.label}>
            <input
              type="radio"
              name="region"
              value="current"
              checked={regionSetting === "current"}
              onChange={(e) => {
                setRegionSetting(e.target.value);
                autoSave("regionSetting", e.target.value);
              }}
            />
            現在地を使用
          </label>

          <label style={styles.label}>
            <input
              type="radio"
              name="region"
              value="kit"
              checked={regionSetting === "kit"}
              onChange={(e) => {
                setRegionSetting(e.target.value);
                autoSave("regionSetting", e.target.value);
              }}
            />
            金沢工業大学
          </label>

          <label style={styles.label}>
            <input
              type="radio"
              name="region"
              value="cityhall"
              checked={regionSetting === "cityhall"}
              onChange={(e) => {
                setRegionSetting(e.target.value);
                autoSave("regionSetting", e.target.value);
              }}
            />
            金沢市役所
          </label>
        </Modal>
      )}

      {openModal === "map" && (
        <Modal title="🗺️ ハザードマップの表示設定" onClose={() => setOpenModal(null)}>
          {Object.keys(mapLayers).map((key) => (
            <label key={key} style={styles.label}>
              <input
                type="checkbox"
                checked={mapLayers[key as keyof typeof mapLayers]}
                onChange={(e) => {
                  const updated = {
                    ...mapLayers,
                    [key]: e.target.checked,
                  };
                  setMapLayers(updated);
                  autoSave("mapLayers", updated);
                }}
              />
              {key} を表示
            </label>
          ))}
        </Modal>
      )}

      {openModal === "view" && (
        <Modal title="👀 画面の見やすさ設定" onClose={() => setOpenModal(null)}>
          <h3 style={styles.optionTitle}>🅰️ 文字サイズの変更</h3>

          {["small", "medium", "large"].map((size) => (
            <label key={size} style={styles.label}>
              <input
                type="radio"
                name="fontSize"
                value={size}
                checked={fontSize === size}
                onChange={(e) => {
                  setFontSize(e.target.value);
                  autoSave("fontSize", e.target.value, () => {
                    document.documentElement.style.setProperty(
                      "--app-font-size",
                      fontSizeMap[e.target.value]
                    );
                  });
                }}
              />
              {size === "small" ? "小" : size === "medium" ? "中" : "大"}
            </label>
          ))}
        </Modal>
      )}

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
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "60px 20px 80px",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 12,
    background: "#fafafa",
    marginBottom: 32,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  subtitle: {
    fontSize: 18,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    width: "100%",
    padding: 8,
    marginTop: 4,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#0070f3",
    color: "#fff",
    padding: "10px 0",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  itemButton: {
    fontSize: "var(--app-font-size)",
    padding: "14px 16px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "#fff",
    textAlign: "left",
    cursor: "pointer",
  },
  label: {
    fontSize: "var(--app-font-size)",
    margin: "6px 0",
    display: "block",
  },
  optionTitle: {
    fontSize: "1.1em",
    marginBottom: 8,
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
  },
  link: {
    textDecoration: "none",
    color: "black",
    fontSize: "var(--app-font-size)",
  },
};
