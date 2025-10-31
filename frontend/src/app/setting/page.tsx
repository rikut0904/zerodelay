"use client";
import { useState } from "react";

export default function SettingPage() {
  const [fontSize, setFontSize] = useState("medium");

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(e.target.value);
    document.documentElement.style.setProperty(
      "--app-font-size",
      fontSizeMap[e.target.value]
    );
  };

  const fontSizeMap: Record<string, string> = {
    small: "14px",
    medium: "16px",
    large: "18px",
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ 設定</h1>

      {/* 地域設定 */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>📍 地域設定</h2>
        <label style={styles.label}>
          <input type="checkbox" /> 現在地を使用
        </label>
      </section>

      {/* 地図表示 */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>🗺️ 地図表示</h2>
        {["避難所", "河川水位", "土砂危険エリア"].map((label) => (
          <label key={label} style={styles.label}>
            <input type="checkbox" /> {label} を表示
          </label>
        ))}
      </section>

      {/* 見やすさ設定 */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>👀 見やすさ</h2>

        {/* 🅰️ 文字サイズの変更 */}
        <div style={{ marginTop: 8 }}>
          <h3 style={styles.optionTitle}>🅰️ 文字サイズの変更</h3>
          <label style={styles.label}>
            <input
              type="radio"
              name="fontSize"
              value="small"
              checked={fontSize === "small"}
              onChange={handleFontSizeChange}
            />{" "}
            小
          </label>
          <label style={styles.label}>
            <input
              type="radio"
              name="fontSize"
              value="medium"
              checked={fontSize === "medium"}
              onChange={handleFontSizeChange}
            />{" "}
            中
          </label>
          <label style={styles.label}>
            <input
              type="radio"
              name="fontSize"
              value="large"
              checked={fontSize === "large"}
              onChange={handleFontSizeChange}
            />{" "}
            大
          </label>
        </div>
      </section>

      {/* ナビゲーション */}
      <div style={styles.nav}>
        <a href="/" style={styles.link}>🏠 ホーム</a>
        <span>📡 情報</span>
        <a href="/setting" style={styles.link}>⚙️ 設定</a>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: 20, fontFamily: "sans-serif" },
  title: { fontSize: 24, marginBottom: 20 },
  section: {
    marginBottom: 24,
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 12,
    background: "#fafafa",
  },
  subtitle: { fontSize: 18, marginBottom: 10 },
  label: { display: "block", margin: "6px 0" },
  optionTitle: { fontSize: 16, marginBottom: 6 },
  nav: {
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: "10px",
    borderTop: "1px solid #ccc",
    marginTop: 30,
  },
  link: { textDecoration: "none", color: "black" },
};
