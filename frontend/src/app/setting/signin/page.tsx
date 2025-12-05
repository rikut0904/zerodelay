"use client";

import Link from "next/link";
import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          typeof data.error === "string" && data.error.length > 0
            ? data.error
            : "新規登録に失敗しました。";
        throw new Error(message);
      }

      await response.json();
      setInfo(
        "登録メールアドレス宛に確認メールを送信しました。確認完了後にログインしてください。"
      );
      setEmail("");
      setPassword("");
      setShowPassword(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "不明なエラーが発生しました。"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>新規登録</h1>
        <p style={{ marginBottom: "1.5rem", color: "#4b5563", fontSize: "0.95rem" }}>
          メールアドレスとパスワードを入力し、認証メールから登録を完了してください。
        </p>

        <form
          onSubmit={handleSignup}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <label style={labelStyle}>
            メールアドレス
            <input
              type="email"
              value={email}
              required
              onChange={(event) => setEmail(event.target.value)}
              style={inputStyle}
              placeholder="example@example.com"
              autoComplete="email"
            />
          </label>

          <label style={labelStyle}>
            パスワード
            <div style={passwordWrapperStyle}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                required
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                style={{ ...inputStyle, paddingRight: "2.75rem" }}
                placeholder="8文字以上"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={toggleButtonStyle}
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.85rem" }}>
            登録完了後はログインページからサインインできます。
          </p>

          <button type="submit" style={buttonStyle(loading)} disabled={loading}>
            {loading ? "送信中..." : "登録する"}
          </button>
        </form>

        {error && <p style={{ ...messageStyle, color: "#dc2626" }}>{error}</p>}
        {info && <p style={{ ...messageStyle, color: "#16a34a" }}>{info}</p>}

        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
          既にアカウントをお持ちの場合は{" "}
          <Link href="/setting/login" style={{ color: "#2563eb" }}>
            ログイン
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.15rem",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  lineHeight: 1,
  color: "#4b5563",
};
