"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const fontSizeMap: Record<string, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

export default function SettingPage() {
  const [openModal, setOpenModal] = useState<string | null>(null);

  // 📍 地域設定
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // 🗺️ マップ表示設定
  const [mapLayers, setMapLayers] = useState({
    避難所: false,
    河川水位: false,
    土砂危険エリア: false,
  });

  // 👀 見やすさ設定
  const [fontSize, setFontSize] = useState("medium");

  // 🔄 初回読み込み
  useEffect(() => {
    const savedLocation = localStorage.getItem("useCurrentLocation");
    const savedLayers = localStorage.getItem("mapLayers");
    const savedFontSize = localStorage.getItem("fontSize");

    if (savedLocation) setUseCurrentLocation(JSON.parse(savedLocation));
    if (savedLayers) setMapLayers(JSON.parse(savedLayers));
    if (savedFontSize) {
      setFontSize(savedFontSize);
      document.documentElement.style.setProperty(
        "--app-font-size",
        fontSizeMap[savedFontSize]
      );
    }
  }, []);

  // 🧠 自動保存関数
  const autoSave = (
    key: string,
    value: any,
    extraEffect?: () => void
  ) => {
    localStorage.setItem(key, JSON.stringify(value));
    if (extraEffect) extraEffect();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ 設定</h1>

      {/* 🧑‍💻 見た目だけのログインフォーム */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>🔐 ログイン</h2>
        <p style={{ marginBottom: 10, color: "#555" }}>
          メールアドレスとパスワードを入力してください。
        </p>
        <form style={styles.form}>
          <label style={styles.label}>
            メールアドレス：
            <input type="email" placeholder="example@example.com" style={styles.input} />
          </label>
          <label style={styles.label}>
            パスワード：
            <input type="password" placeholder="••••••••" style={styles.input} />
          </label>
          <button type="button" style={styles.button}>
            ログイン
          </button>
        </form>
      </section>

      {/* 各設定項目ボタン */}
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

      {/* 📍 地域設定モーダル */}
      {openModal === "region" && (
        <Modal title="📍 表示する地域の設定" onClose={() => setOpenModal(null)}>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={useCurrentLocation}
              onChange={(e) => {
                setUseCurrentLocation(e.target.checked);
                autoSave("useCurrentLocation", e.target.checked);
              }}
            />{" "}
            現在地を使用
          </label>
        </Modal>
      )}

      {/* 🗺️ 地図表示モーダル */}
      {openModal === "map" && (
        <Modal title="🗺️ ハザードマップの表示設定" onClose={() => setOpenModal(null)}>
          {Object.keys(mapLayers).map((key) => (
            <label key={key} style={styles.label}>
              <input
                type="checkbox"
                checked={mapLayers[key as keyof typeof mapLayers]}
                onChange={(e) => {
                  const newState = {
                    ...mapLayers,
                    [key]: e.target.checked,
                  };
                  setMapLayers(newState);
                  autoSave("mapLayers", newState);
                }}
              />{" "}
              {key} を表示
            </label>
          ))}
        </Modal>
      )}

      {/* 👀 見やすさ設定モーダル */}
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
              />{" "}
              {size === "small" ? "小" : size === "medium" ? "中" : "大"}
            </label>
          ))}
        </Modal>
      )}

      {/* 下部固定ナビ */}
      <div style={styles.nav}>
        <Link href="/" style={styles.link}>🏠 ホーム</Link>
        <span>📡 情報</span>
        <Link href="/setting" style={styles.link}>⚙️ 設定</Link>
      </div>
    </div>
  );
}

/* 🪟 モーダル */
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <h2 style={{ marginBottom: 10 }}>{title}</h2>
        <div>{children}</div>
        <button style={modalStyles.closeButton} onClick={onClose}>
          ✖ 閉じる
        </button>
      </div>
    </div>
  );
}

/* 🎨 スタイル */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "60px 20px 80px",
    fontFamily: "sans-serif",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
  },
  title: { fontSize: 24, marginBottom: 20 },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    marginBottom: 32,
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 12,
    background: "#fafafa",
  },
  subtitle: { fontSize: 18, marginBottom: 10 },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
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
    marginTop: 8,
  },
  itemButton: {
    padding: "14px 16px",
    fontSize: "16px",
    textAlign: "left",
    border: "1px solid #ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    cursor: "pointer",
    width: "100%",
  },
  label: { display: "block", margin: "8px 0" },
  optionTitle: { fontSize: 16, marginBottom: 6 },
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
  link: { textDecoration: "none", color: "black" },
};

const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  content: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  closeButton: {
    marginTop: 16,
    width: "100%",
    padding: "10px",
    backgroundColor: "#999",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};
