"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { fontSizeMap } from "@/constants/font";

const defaultMapLayers = {
  避難所: true,
};

type MapLayers = typeof defaultMapLayers;

export default function SettingPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [regionSetting, setRegionSetting] = useState<string>("current");
  const [mapLayers, setMapLayers] = useState<MapLayers>(defaultMapLayers);
  const [fontSize, setFontSize] = useState<string>("medium");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLayers = localStorage.getItem("mapLayers");
    const savedFontSize = localStorage.getItem("fontSize");
    const savedRegion = localStorage.getItem("regionSetting");
    const token = localStorage.getItem("idToken"); // 仮の認証判定。実装に合わせてキーを変更してください。
    const savedUser = localStorage.getItem("userName");

    if (savedLayers) {
      try {
        const parsed = JSON.parse(savedLayers);
        const sanitizedLayers = Object.keys(defaultMapLayers).reduce<MapLayers>(
          (acc, key) => {
            const typedKey = key as keyof MapLayers;
            acc[typedKey] = Boolean(parsed?.[typedKey]);
            return acc;
          },
          { ...defaultMapLayers }
        );
        setMapLayers(sanitizedLayers);
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

    if (token) setIsLoggedIn(true);
    if (savedUser) {
      try {
        setUserName(JSON.parse(savedUser));
      } catch {
        setUserName(savedUser);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserName(null);
    setInfoMessage("ログアウトしました");
    setShowLogoutConfirm(false);
  };

  const autoSave = (key: string, value: any, extraEffect?: () => void) => {
    localStorage.setItem(key, JSON.stringify(value));
    if (key === "mapLayers") {
      window.dispatchEvent(new Event("mapLayersUpdated"));
    }
    if (extraEffect) extraEffect();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ 設定</h1>

      <section style={styles.section}>
        <h2 style={styles.subtitle}>👤 アカウント</h2>
        {isLoggedIn ? (
          <div style={styles.accountBox}>
            <p style={{ margin: 0, fontSize: "var(--app-font-size)" }}>
              {userName ? `${userName} さん、こんにちは` : "こんにちは"}
            </p>
            <button
              type="button"
              style={styles.authButton}
              onClick={() => setShowLogoutConfirm(true)}
            >
              ログアウト
            </button>
          </div>
        ) : (
          <div style={styles.accountBox}>
            <p style={{ margin: "0 0 8px", fontSize: "var(--app-font-size)" }}>
              ログインしていません
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/setting/login?redirect_url=/setting" style={styles.authButton}>
                ログイン
              </Link>
              <Link href="/setting/signin?redirect_url=/setting" style={styles.authButtonSecondary}>
                新規登録
              </Link>
            </div>
          </div>
        )}
        {infoMessage && (
          <p style={{ margin: "12px 0 0", color: "#047857", fontWeight: 600 }}>
            {infoMessage}
          </p>
        )}
      </section>

      <section style={styles.section}>
        <p style={styles.sectionLead}>よく使う設定をまとめています。</p>
        <div style={styles.accordion}>
          <button
            style={{
              ...styles.itemButton,
              ...(openSection === "region" ? styles.itemButtonActive : {}),
            }}
            onClick={() => setOpenSection(openSection === "region" ? null : "region")}
          >
            <span style={styles.itemTitle}>📍 表示する地域の設定</span>
            <span style={styles.itemDescription}>現在地/拠点の切り替えができます</span>
          </button>
          {openSection === "region" && (
            <div style={styles.panel}>
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
            </div>
          )}

          <button
            style={{
              ...styles.itemButton,
              ...(openSection === "map" ? styles.itemButtonActive : {}),
            }}
            onClick={() => setOpenSection(openSection === "map" ? null : "map")}
          >
            <span style={styles.itemTitle}>🗺️ ハザードマップの表示設定</span>
            <span style={styles.itemDescription}>避難所などの表示をON/OFF</span>
          </button>
          {openSection === "map" && (
            <div style={styles.panel}>
              {Object.keys(mapLayers).map((key) => (
                <div key={key}>
                  <label style={styles.label}>
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
                  {key === "避難所" && <p style={styles.note}>※ 現在作成中</p>}
                </div>
              ))}
            </div>
          )}

          <button
            style={{
              ...styles.itemButton,
              ...(openSection === "view" ? styles.itemButtonActive : {}),
            }}
            onClick={() => setOpenSection(openSection === "view" ? null : "view")}
          >
            <span style={styles.itemTitle}>👀 画面の見やすさ設定</span>
            <span style={styles.itemDescription}>文字サイズの変更</span>
          </button>
          {openSection === "view" && (
            <div style={styles.panel}>
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
            </div>
          )}
        </div>
      </section>

      {showLogoutConfirm && (
        <Modal title="ログアウト確認" onClose={() => setShowLogoutConfirm(false)}>
          <p style={{ marginBottom: 16 }}>ログアウトしますか？</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              style={styles.authButtonSecondary}
              onClick={() => setShowLogoutConfirm(false)}
            >
              いいえ
            </button>
            <button type="button" style={styles.authButton} onClick={handleLogout}>
              はい
            </button>
          </div>
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
    padding: "60px 20px 120px",
    background: "linear-gradient(180deg, #f9fbff 0%, #f3f4f6 100%)",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    padding: 16,
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    background: "#fff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
    marginBottom: 32,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  subtitle: {
    fontSize: 18,
  },
  accountBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
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
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    background: "#f8fafc",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    transition: "background 0.15s ease, border-color 0.15s ease",
  },
  itemTitle: {
    fontWeight: 700,
    fontSize: "1.02em",
  },
  itemDescription: {
    color: "#6b7280",
    fontSize: "0.95em",
  },
  label: {
    fontSize: "var(--app-font-size)",
    margin: "6px 0",
    display: "block",
    padding: "10px 12px",
    borderRadius: 10,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  panel: {
    padding: "10px 4px 4px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
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
  authButton: {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "var(--app-font-size)",
  },
  authButtonSecondary: {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: 8,
    background: "#e5e7eb",
    color: "#111",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "var(--app-font-size)",
  },
  note: {
    margin: "4px 0 0 24px",
    fontSize: "0.9em",
    color: "#6b7280",
  },
  sectionLead: {
    margin: "-2px 0 4px",
    color: "#6b7280",
    fontSize: "0.95em",
  },
  accordion: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  itemButtonActive: {
    borderColor: "#2563eb",
    background: "#e0f2fe",
  },
};
