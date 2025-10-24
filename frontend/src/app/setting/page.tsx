export default function SettingPage() {
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

      {/* 見やすさ */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>👁️ 見やすさ設定</h2>
        <div style={{ marginBottom: 8 }}>
          文字サイズ：
          <select style={styles.select} defaultValue="中">
            <option>小</option>
            <option>中</option>
            <option>大</option>
          </select>
        </div>
        <div>
          色テーマ：
          <select style={styles.select} defaultValue="通常">
            <option>通常</option>
            <option>高コントラスト</option>
          </select>
        </div>
      </section>

      <div style={{ textAlign: "center", marginTop: 10 }}>
        <a href="/" style={styles.link}>
          🏠 ホームに戻る
        </a>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "sans-serif",
    backgroundColor: "#f9fafc",
    minHeight: "100vh",
    padding: "20px",
    lineHeight: "1.8",
  },
  title: {
    textAlign: "center",
    fontSize: "28px",
    marginBottom: "20px",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  subtitle: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
  },
  select: {
    padding: "6px 8px",
    fontSize: "14px",
    marginLeft: "6px",
  },
  link: {
    display: "inline-block",
    padding: "10px 16px",
    backgroundColor: "#4A90E2",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
  },
};
