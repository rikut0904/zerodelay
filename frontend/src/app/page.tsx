"use client"; // ← これが必要！

import { useEffect, useState } from "react";

export default function Home() {
  // ⚠️ 警報テキストを状態管理
  const [alertText, setAlertText] = useState("警報情報を取得中...");

  // ⏳ 5分ごとに気象庁API（石川県）から情報取得
  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const res = await fetch("/api/alert", { cache: "no-store" });
        const data = await res.json();

        if (!data.hasAny) {
          setAlertText("✅ 石川県に警報・注意報は発令されていません");
          return;
        }

        const parts: string[] = [];
        if (data.buckets.special.length) parts.push("🟣特別警報");
        if (data.buckets.warning.length) parts.push("🔴警報");
        if (data.buckets.advisory.length) parts.push("🟡注意報");

        setAlertText(`⚠️ 石川県の発表状況：${parts.join("・")}`);
      } catch {
        setAlertText("⚠️ 警報情報の取得に失敗しました");
      }
    };

    fetchAlert(); // 初回実行
    const timer = setInterval(fetchAlert, 5 * 60 * 1000); // 5分ごと
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={styles.container}>
      {/* 🔍 検索バー */}
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="住所・施設名を入力"
          style={styles.searchInput}
        />
      </div>

      {/* 🌊 災害ボタン */}
      <div style={styles.buttons}>
        <button style={styles.button}>洪水</button>
        <button style={styles.button}>土砂</button>
        <button style={styles.button}>津波</button>
        <button style={styles.button}>地震</button>
      </div>

      {/* 🗺️ 地図エリア */}
      <div style={styles.mapArea}>🗺️ 地図エリア（現在地＋避難所）</div>

      {/* ⚠️ 警報表示 */}
      <div style={styles.alert}>{alertText}</div>

      {/* 🧭 ナビゲーション */}
      <div style={styles.nav}>
        <span>🏠 ホーム</span>
        <span>📡 情報</span>
        <a href="/setting" style={styles.link}>
          ⚙️ 設定
        </a>
      </div>
    </div>
  );
}

// 💅 スタイル設定（レスポンシブ対応済み）
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "sans-serif",
    textAlign: "center",
    backgroundColor: "#f0f4ff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontSize: "var(--app-font-size)", // ←画面幅で文字サイズ変化
  },
  searchBar: {
    padding: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  searchInput: {
    width: "80%",
    padding: "8px",
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
    backgroundColor: "#d9e6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "var(--app-font-size)",
  },
  alert: {
    backgroundColor: "#ffeb3b",
    padding: "10px",
    fontWeight: "bold",
    fontSize: "var(--app-font-size)",
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
