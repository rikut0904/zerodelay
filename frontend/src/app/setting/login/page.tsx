"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import styles from "../AuthForm.module.css";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = useMemo(() => {
    const raw = searchParams.get("redirect_url");
    if (!raw || !raw.startsWith("/")) {
      return null;
    }
    const url = new URL(raw, "http://localhost");
    return url.pathname + url.search + url.hash;
  }, [searchParams]);
  const redirectQuery = redirectTarget
    ? `?redirect_url=${encodeURIComponent(redirectTarget)}`
    : "";
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
        credentials: "include", // 認証APIからのHttpOnlyクッキーを保持
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const serverMessage =
          typeof data.error === "string" && data.error.length > 0
            ? data.error
            : typeof data.message === "string" && data.message.length > 0
              ? data.message
              : "";
        const message = mapLoginErrorMessage(serverMessage, response.status);
        throw new Error(message);
      }

      await response.json().catch(() => undefined);

      setInfo("ログインに成功しました。画面を遷移します。");
      const destination = redirectTarget ?? "/";
      router.push(destination);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "Failed to fetch") {
          setError(
            `サーバー(${API_BASE_URL})に接続できませんでした。ネットワーク状態やAPIサーバーの起動状況、CORS設定を確認してください。`
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("不明なエラーが発生しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>ログイン</h1>
        <p className={styles.description}>
          登録済みのメールアドレスとパスワードを入力してください。
        </p>

        <form onSubmit={handleLogin} className={styles.form}>
          <label className={styles.label}>
            メールアドレス
            <input
              type="email"
              value={email}
              required
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
              placeholder="example@example.com"
            />
          </label>

          <label className={styles.label}>
            パスワード
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                required
                onChange={(event) => setPassword(event.target.value)}
                className={`${styles.input} ${styles.inputWithToggle}`}
                placeholder="8文字以上"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={styles.toggleButton}
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "送信中..." : "ログイン"}
          </button>
        </form>

        {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
        {info && <p className={`${styles.message} ${styles.info}`}>{info}</p>}

        <p className={styles.helperText}>
          アカウントをお持ちでない場合は{" "}
          <Link
            href={`/setting/signin${redirectQuery}`}
            className={styles.link}
          >
            新規登録
          </Link>
          へ
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginPageContent />
    </Suspense>
  );
}

function mapLoginErrorMessage(rawMessage: string, status: number): string {
  const fallback =
    status >= 500
      ? "サーバー側でエラーが発生しました。時間をおいて再度お試しください。"
      : "メールアドレスまたはパスワードが正しくありません。";
  if (!rawMessage) {
    return fallback;
  }
  const normalized = rawMessage.toLowerCase();
  if (normalized.includes("invalid_login_credentials")) {
    return "メールアドレスまたはパスワードが正しくありません。";
  }
  if (normalized.includes("user_disabled")) {
    return "このアカウントは無効化されています。管理者にお問い合わせください。";
  }
  if (normalized.includes("too_many_attempts")) {
    return "一定回数以上ログインに失敗しました。しばらく時間を置いてから再度お試しください。";
  }
  return rawMessage;
}
