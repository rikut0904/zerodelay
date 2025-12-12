"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import styles from "../AuthForm.module.css";

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
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>新規登録</h1>
        <p className={styles.description}>
          メールアドレスとパスワードを入力し、認証メールから登録を完了してください。
        </p>

        <form onSubmit={handleSignup} className={styles.form}>
          <label className={styles.label}>
            メールアドレス
            <input
              type="email"
              value={email}
              required
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
              placeholder="example@example.com"
              autoComplete="email"
            />
          </label>

          <label className={styles.label}>
            パスワード
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                required
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                className={`${styles.input} ${styles.inputWithToggle}`}
                placeholder="8文字以上"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={styles.toggleButton}
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <p className={styles.helperNote}>登録完了後はログインページからサインインできます。</p>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "送信中..." : "登録する"}
          </button>
        </form>

        {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
        {info && <p className={`${styles.message} ${styles.info}`}>{info}</p>}

        <p className={styles.helperText}>
          既にアカウントをお持ちの場合は{" "}
          <Link href="/setting/login" className={styles.link}>
            ログイン
          </Link>
          へ
        </p>
      </div>
    </div>
  );
}
