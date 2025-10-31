"use client"; 
import { useEffect, useState } from "react";  // ← 追加！

export default function Home() {
  // ← ここで警報メッセージを管理
  const [alertText, setAlertText] = useState("警報情報を取得中...");

  useEffect(() => {
    // 警報データを取得する関数
    const fetchAlert = async () => {
      try {
        // さっき作った APIルート（/app/api/alert/route.ts）を呼び出す
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

    // 最初に1回実行
    fetchAlert();
    // 5分ごとに自動更新
    const timer = setInterval(fetchAlert, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // ↓↓↓ ここから下は元のままでOK。ただし alert 部分だけ置き換え ↓↓↓
  return (
    <div style={styles.container}>
      {/* 検索バー */}
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="住所・施設名を入力"
          style={styles.searchInput}
        />
      </div>

      {/* 災害ボタン */}
      <div style={styles.buttons}>
        <button style={styles.button}>洪水</button>
        <button style={styles.button}>土砂</button>
        <button style={styles.button}>津波</button>
        <button style={styles.button}>地震</button>
      </div>

      {/* 地図エリア */}
      <div style={styles.mapArea}>🗺️ 地図エリア（現在地＋避難所）</div>

      {/* 警報表示（ここだけ変える） */}
      <div style={styles.alert}>{alertText}</div>

      {/* ナビゲーション */}
      <div style={styles.nav}>
        <span>🏠 ホーム</span>
        <span>📡 情報</span>
        <a href="/setting" style={styles.link}>⚙️ 設定</a>
      </div>
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
  },
  searchBar: {
    padding: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  searchInput: {
    width: "80%",
    padding: "8px",
    fontSize: "16px",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4A90E2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  mapArea: {
    flex: 1,
    backgroundColor: "#d9e6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  alert: {
    backgroundColor: "#ffeb3b",
    padding: "10px",
    fontWeight: "bold",
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
