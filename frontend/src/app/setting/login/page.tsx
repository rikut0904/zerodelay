"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          typeof data.error === "string" && data.error.length > 0
            ? data.error
            : "ログインに失敗しました。";
        throw new Error(message);
      }

      const data = await response.json();

      if (typeof window !== "undefined") {
        if (data.idToken) {
          localStorage.setItem("idToken", data.idToken);
        }
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        localStorage.setItem("userEmail", email);
      }

      setInfo("ログインに成功しました。画面を遷移します。");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>ログイン</h1>
        <p style={{ marginBottom: "1.5rem", color: "#4b5563", fontSize: "0.95rem" }}>
          登録済みのメールアドレスとパスワードを入力してください。
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={labelStyle}>
            メールアドレス
            <input
              type="email"
              value={email}
              required
              onChange={(event) => setEmail(event.target.value)}
              style={inputStyle}
              placeholder="example@example.com"
            />
          </label>

          <label style={labelStyle}>
            パスワード
            <div style={passwordWrapperStyle}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                required
                onChange={(event) => setPassword(event.target.value)}
                style={{ ...inputStyle, paddingRight: "2.75rem" }}
                placeholder="8文字以上"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={toggleButtonStyle}
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </label>

          <button type="submit" style={buttonStyle(loading)} disabled={loading}>
            {loading ? "送信中..." : "ログイン"}
          </button>
        </form>

        {error && <p style={{ ...messageStyle, color: "#dc2626" }}>{error}</p>}
        {info && <p style={{ ...messageStyle, color: "#16a34a" }}>{info}</p>}

        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
          アカウントをお持ちでない場合は{" "}
          <Link href="/setting/signin" style={{ color: "#2563eb" }}>
            新規登録
          </Link>
          へ
        </p>
      </div>
    </div>
  );
}

const pageWrapperStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  background:
    "radial-gradient(circle at top, rgba(37,99,235,0.15), transparent 40%), #f9fafb",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "2rem",
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.1)",
};

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  fontSize: "0.9rem",
  color: "#374151",
  fontWeight: 600,
  gap: "0.4rem",
};

const inputStyle: CSSProperties = {
  padding: "0.8rem 0.9rem",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const buttonStyle = (disabled: boolean): CSSProperties => ({
  marginTop: "0.5rem",
  padding: "0.9rem",
  borderRadius: "999px",
  border: "none",
  background:
    "linear-gradient(120deg, rgba(59,130,246,1) 0%, rgba(37,99,235,1) 100%)",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: "1rem",
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "opacity 0.2s",
  opacity: disabled ? 0.6 : 1,
});

const messageStyle: CSSProperties = {
  marginTop: "1rem",
  fontSize: "0.9rem",
};

const passwordWrapperStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const toggleButtonStyle: CSSProperties = {
  position: "absolute",
  right: "0.65rem",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "1.1rem",
  lineHeight: 1,
};
