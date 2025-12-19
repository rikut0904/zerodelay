"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { shelters } from "@/data/shelters";
import { useApplyFontSize } from "@/hooks/useApplyFontSize";

const ShelterMap = dynamic(() => import("@/components/ShelterMap"), { ssr: false });

export default function InfoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useApplyFontSize();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📡 情報</h1>

      <section style={styles.section}>
        <h2 style={styles.subtitle}>避難所一覧</h2>
        <p style={styles.lead}>タップすると地図がその避難所へ移動します。</p>
        <div style={styles.shelterGrid}>
          {shelters.map((shelter) => (
            <button
              key={shelter.id}
              style={styles.shelterCard}
              onClick={() => setSelectedId(shelter.id)}
            >
              <div style={styles.shelterName}>{shelter.name}</div>
              <div style={styles.shelterAddress}>{shelter.address}</div>
              <div style={styles.cardHint}>地図で位置を確認</div>
            </button>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.subtitle}>地図で確認</h2>
        <div style={styles.mapWrapper}>
          <ShelterMap shelters={shelters} selectedId={selectedId} />
        </div>
      </section>

      <div style={styles.nav}>
        <Link href="/" style={styles.link}>
          🏠 ホーム
        </Link>
        <Link href="/info" style={{ ...styles.link, fontWeight: 700 }}>
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
    padding: "24px 16px 90px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    fontSize: "var(--app-font-size)",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    padding: 16,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  lead: {
    margin: "0 0 10px",
    color: "#4b5563",
  },
  shelterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  shelterCard: {
    textAlign: "left",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    cursor: "pointer",
    fontSize: "var(--app-font-size)",
  },
  shelterName: {
    fontWeight: 700,
    marginBottom: 6,
  },
  shelterAddress: {
    color: "#4b5563",
    marginBottom: 6,
  },
  cardHint: {
    fontSize: "0.9em",
    color: "#6b7280",
  },
  mapWrapper: {
    height: 360,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
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
