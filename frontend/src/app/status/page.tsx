"use client";

import { useEffect, useState } from "react";

interface BackendResponse {
  message: string;
  status: string;
}

export default function StatusPage() {
  const [backendMessage, setBackendMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/hello");
        if (!response.ok) {
          throw new Error("Failed to fetch from backend");
        }
        const data: BackendResponse = await response.json();
        setBackendMessage(data.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchBackendData();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>ZeroDelay Application</h1>
      <div style={{ marginTop: "2rem" }}>
        <h2>Frontend Status</h2>
        <p>✅ Next.js is running successfully!</p>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <h2>Backend Status</h2>
        {loading && <p>Loading backend data...</p>}
        {error && <p style={{ color: "red" }}>❌ Error: {error}</p>}
        {backendMessage && (
          <p style={{ color: "green" }}>✅ {backendMessage}</p>
        )}
      </div>
      <div style={{ marginTop: "2rem", fontSize: "0.875rem", color: "#666" }}>
        <p>
          Frontend running on port 3000
          <br />
          Backend running on port 8080
        </p>
      </div>
    </div>
  );
}
