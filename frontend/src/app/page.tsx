"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export default function Home() {
  const [alertText, setAlertText] = useState("警報情報を取得中...");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // ← 追加：スマホ判定用

  // 📱 画面幅によってスマホかどうか判定
  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // ⚠️ 警報データを取得
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
    fetchAlert();
    const timer = setInterval(fetchAlert, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

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

        {/* スマホ時だけ三本線を表示 */}
        {isMobile && (
          <div
            style={styles.menuIcon}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <Menu size={28} />
          </div>
        )}
      </div>

      {/* スマホ時：ハンバーガーメニュー */}
      {menuOpen && isMobile && (
        <div style={styles.drawer}>
          <Link href="/" style={styles.drawerItem}>🏠 ホーム</Link>
          <Link href="/info" style={styles.drawerItem}>📡 情報</Link>
          <Link href="/setting" style={styles.drawerItem}>⚙️ 設定</Link>
        </div>
      )}

      {/* 災害ボタン */}
      <div style={styles.buttons}>
        <button style={styles.button}>洪水</button>
        <button style={styles.button}>津波</button>
        <button style={styles.button}>地震</button>
      </div>

      {/* 地図エリア */}
      <div style={styles.mapArea}>🗺️ 地図エリア（現在地＋避難所）</div>

      {/* PC時のみナビ表示 */}
      {!isMobile && (
        <div style={styles.nav}>
          <span>🏠 ホーム</span>
          <span>📡 情報</span>
          <Link href="/setting" style={styles.link}>
            ⚙️ 設定
          </Link>
        </div>
      )}
    </div>
  );
}

// 🎨 スタイル
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
