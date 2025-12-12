"use client";

import { useEffect, useState } from "react";

interface BackendResponse {
  message: string;
  status: string;
}

interface ApiCheck {
  name: string;
  path: string;
  method?: string;
  expectJson?: boolean;
  acceptableStatuses?: number[];
  description?: string;
}

interface ApiStatus {
  name: string;
  status: "ok" | "error";
  details: string;
  info?: string;
  note?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const apiChecks: ApiCheck[] = [
  { name: "ヘルスチェック", path: "/health", expectJson: true, acceptableStatuses: [200] },
  {
    name: "認証API (ログイン)",
    path: "/api/v1/auth/login",
    method: "OPTIONS",
    acceptableStatuses: [204],
  },
  {
    name: "認証API (新規登録)",
    path: "/api/v1/auth/signup",
    method: "OPTIONS",
    acceptableStatuses: [204],
  },
  {
    name: "認証API (ログアウト)",
    path: "/api/v1/auth/logout",
    method: "OPTIONS",
    acceptableStatuses: [204],
    description: "ログアウトエンドポイントのプリフライト結果を確認します。",
  },
  {
    name: "ユーザー一覧取得",
    path: "/api/v1/users",
    acceptableStatuses: [200, 401],
    description: "401 の場合は認証が必要ですがエンドポイント自体は稼働中です。",
  },
  {
    name: "ユーザー詳細取得 (ID=1)",
    path: "/api/v1/users/1",
    acceptableStatuses: [200, 401, 404],
    description: "401/404 は想定内です。",
  },
  {
    name: "ユーザー作成 (OPTIONS)",
    path: "/api/v1/users",
    method: "OPTIONS",
    acceptableStatuses: [204],
    description: "POST /users のプリフライトを確認します。",
  },
  {
    name: "ユーザー更新 (OPTIONS)",
    path: "/api/v1/users/1",
    method: "OPTIONS",
    acceptableStatuses: [204],
  },
  {
    name: "ユーザー削除 (OPTIONS)",
    path: "/api/v1/users/1",
    method: "OPTIONS",
    acceptableStatuses: [204],
  },
  {
    name: "ユーザープロフィール更新 (OPTIONS)",
    path: "/api/v1/users/me",
    method: "OPTIONS",
    acceptableStatuses: [204],
  },
  {
    name: "プレース一覧取得",
    path: "/api/v1/places",
    acceptableStatuses: [200, 401],
    description: "401 は認証待ちを示します。",
  },
  {
    name: "プレース詳細取得 (ID=1)",
    path: "/api/v1/places/1",
    acceptableStatuses: [200, 401, 404],
  },
  {
    name: "プレース作成 (OPTIONS)",
    path: "/api/v1/places",
    method: "OPTIONS",
    acceptableStatuses: [204],
  },
  {
    name: "プレース更新 (OPTIONS)",
    path: "/api/v1/places/1",
    method: "OPTIONS",
    acceptableStatuses: [204],
  },
  {
    name: "プレース削除 (OPTIONS)",
    path: "/api/v1/places/1",
    method: "OPTIONS",
    acceptableStatuses: [204],
  },
];

export default function StatusPage() {
  const [backendMessage, setBackendMessage] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
          throw new Error("Failed to fetch from backend");
        }
        const data: BackendResponse = await response.json();
        setBackendMessage(data.message);
        setBackendStatus(data.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    const checkApis = async () => {
      const results: ApiStatus[] = await Promise.all(
        apiChecks.map(async (check) => {
          try {
            const response = await fetch(`${API_BASE_URL}${check.path}`, {
              method: check.method ?? "GET",
              credentials: "include",
              headers:
                check.method && check.method !== "GET"
                  ? { "Content-Type": "application/json" }
                  : undefined,
            });
            const info =
              check.expectJson && response.headers.get("Content-Type")?.includes("application/json")
                ? await response
                    .json()
                    .then((data: BackendResponse) => `${data.message} (${data.status})`)
                    .catch(() => undefined)
                : undefined;
            const acceptable = check.acceptableStatuses ?? [200, 204];
            const ok = acceptable.includes(response.status);
            return {
              name: check.name,
              status: ok ? "ok" : "error",
              details: `HTTP ${response.status} ${response.statusText}`,
              info,
              note: check.description,
            };
          } catch (err) {
            return {
              name: check.name,
              status: "error",
              details: err instanceof Error ? err.message : "Unknown error",
            };
          }
        })
      );
      setApiStatuses(results);
    };

    fetchBackendData();
    checkApis();
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
          <>
            <p style={{ color: "green" }}>✅ {backendMessage}</p>
            <p style={{ color: "#2563eb" }}>Status: {backendStatus}</p>
          </>
        )}
      </div>
      <div style={{ marginTop: "2rem" }}>
        <h2>API 稼働状況</h2>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {apiStatuses.map((api) => (
            <li
              key={api.name}
              style={{
                marginBottom: "0.75rem",
                padding: "0.75rem",
                borderRadius: "8px",
                backgroundColor: api.status === "ok" ? "#ecfdf5" : "#fef2f2",
                border: `1px solid ${api.status === "ok" ? "#34d399" : "#f87171"}`,
              }}
            >
              <strong>{api.name}</strong>
              <p style={{ margin: "0.25rem 0" }}>
                {api.status === "ok" ? "✅ 利用可能" : "❌ エラー"}
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#374151" }}>{api.details}</p>
              {api.info && (
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#2563eb" }}>{api.info}</p>
              )}
              {api.note && (
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>{api.note}</p>
              )}
            </li>
          ))}
        </ul>
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
