# Firebase メール送信機能の有効化手順

## 概要
Firebaseでメールアドレス変更時に確認メールを送信する機能を有効化する手順を説明します。

## 前提条件
- Firebaseプロジェクトが作成済み
- Firebase Consoleにアクセス可能

---

## 手順

### 1. Firebase Consoleにログイン

https://console.firebase.google.com/ にアクセスし、プロジェクトを選択

### 2. Authentication設定を開く

1. 左メニューから「Authentication」をクリック
2. 「Sign-in method」タブをクリック

### 3. メール/パスワード認証を有効化

1. 「Email/Password」をクリック
2. 「Enable（有効にする）」をオンにする
3. 「Save（保存）」をクリック

### 4. メールテンプレートの設定

1. 「Templates」タブをクリック
2. 「Email address change（メールアドレスの変更）」を選択
3. テンプレートをカスタマイズ（オプション）

**デフォルトテンプレート例:**
```
Subject: メールアドレスを変更しました

こんにちは、

あなたのアカウントのメールアドレスが %NEW_EMAIL% に変更されました。

この変更に心当たりがない場合は、すぐにサポートにお問い合わせください。

よろしくお願いします。
```

### 5. メール送信者名の設定

1. 「Settings（設定）」→「Project settings（プロジェクト設定）」
2. 下にスクロールして「Public settings（公開設定）」セクション
3. 「Project name（プロジェクト名）」を設定（メール送信者名として使用される）

---

## 自動送信されるメールの種類

Firebase Authenticationで自動的に送信されるメール：

### 1. メールアドレス確認（新規登録時）✅ **実装済み**
- **送信タイミング:** ユーザー登録（サインアップ）直後
- **送信先:** 登録したメールアドレス
- **目的:** メールアドレスの所有確認
- **実装:** `POST /api/v1/auth/signup` で自動送信
- **重要:** メール確認が完了するまでログインできません

### 2. メールアドレス確認（メール変更時）✅ **実装済み**
- **送信タイミング:** `PATCH /api/v1/users/me` でメールアドレス変更時
- **送信先:** 新しいメールアドレス
- **実装:** Firebase側で自動送信

### 3. パスワードリセット
パスワードを忘れた場合のリセットメール（今後実装予定）

### 4. メールアドレス変更通知
メールアドレス変更時に旧アドレスにも通知（設定により）

---

## カスタムドメインの設定（オプション）

デフォルトでは `noreply@<your-project>.firebaseapp.com` から送信されます。

カスタムドメインを使用する場合：

1. Firebase Console → Authentication → Templates
2. 「Customize email domain」をクリック
3. 独自ドメインを設定（DNSレコードの設定が必要）

---

## メール送信のテスト

### 1. 新規登録時のメール確認テスト

```bash
# ステップ1: 新規ユーザー登録
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# → 登録したメールアドレス（test@example.com）に確認メールが届く
# → メール内のリンクをクリックして確認を完了

# ステップ2: メール確認前にログインを試す（エラーになる）
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# レスポンス:
# {
#   "error": "email not verified. Please check your email and verify your account"
# }

# ステップ3: メール確認後にログイン（成功する）
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# レスポンス:
# {
#   "idToken": "...",
#   "email": "test@example.com",
#   ...
# }
```

### 2. メールアドレス変更時のテスト

```bash
# メールアドレス変更
curl -X PATCH http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com"
  }'

# → 新しいメールアドレス（newemail@example.com）に確認メールが届く
# → 古いメールアドレス（test@example.com）に変更通知が届く（設定により）
```

---

## トラブルシューティング

### メールが届かない場合

1. **スパムフォルダを確認**
   - 迷惑メールフォルダに振り分けられている可能性

2. **メールアドレスが正しいか確認**
   - Firebase Console → Authentication → Users で確認

3. **送信制限を確認**
   - Firebaseの無料プランには送信制限あり
   - Blaze（従量課金）プランにアップグレードを検討

4. **Firebase Console のログを確認**
   - Authentication → Usage で送信状況を確認

### メールがスパム判定される場合

1. **カスタムドメインを設定**
   - 独自ドメインからの送信に変更

2. **SPF/DKIM レコードを設定**
   - DNS設定でメール認証を強化

---

## セキュリティ設定

### メールアドレス確認を必須にする

```go
// ユーザー作成後に確認メールを送信
import firebase "firebase.google.com/go/v4"

// メール確認リンクを送信
link, err := client.EmailVerificationLink(ctx, email)
```

### メールアドレス変更時の再認証

セキュリティを強化するため、メール変更前に再認証を要求することも可能：

```go
// 実装例（将来的に追加可能）
// 1. パスワード再入力を要求
// 2. 現在のトークンを検証
// 3. メールアドレスを変更
```

---

## 参考リンク

- [Firebase Authentication - Email Verification](https://firebase.google.com/docs/auth/web/manage-users#send_a_user_a_verification_email)
- [Firebase Console](https://console.firebase.google.com/)
- [Customize Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)

---

## まとめ

✅ Firebase Console で Email/Password 認証を有効化
✅ Templates タブでメールテンプレートをカスタマイズ
✅ **新規登録時に自動的に確認メールが送信される（実装済み）**
✅ **メール確認が完了するまでログイン・API利用不可（実装済み）**
✅ メールアドレス変更時に自動的に確認メールが送信される
✅ 本番環境ではカスタムドメインの設定を推奨

## 実装されたセキュリティ機能

1. **サインアップ時のメール確認必須化**
   - `POST /api/v1/auth/signup` 実行時に確認メールを自動送信
   - メール確認完了まではログイン不可

2. **ログイン時のメール確認チェック**
   - `POST /api/v1/auth/login` でメール未確認の場合はエラーを返す

3. **全APIでのメール確認必須化**
   - 認証ミドルウェアでメール確認状態をチェック
   - メール未確認の場合は403エラーを返す
