export default function Home() {
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

      {/* 警報表示 */}
      <div style={styles.alert}>⚠️ 現在の警報：金沢市に大雨警報発令中</div>

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
