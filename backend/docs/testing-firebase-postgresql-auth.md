# Firebase + PostgreSQL 認証統合の動作確認手順

## 概要
このガイドでは、Firebase認証とPostgreSQL管理が正しく統合されているかを確認する手順を説明します。

## 前提条件

### 1. 環境変数の設定
`.env`ファイルが正しく設定されていることを確認してください：

```bash
# .env ファイルの内容を確認
cat .env
```

必要な環境変数：
```
PORT=8080
DATABASE_URL=postgresql://user:password@host:port/database
FIREBASE_API_KEY=your_firebase_api_key
DB_LOG_LEVEL=info  # 開発時はinfoが推奨
```

### 2. serviceAccountKey.jsonの配置
Firebaseコンソールからダウンロードした`serviceAccountKey.json`を`backend/`ディレクトリに配置してください。

```bash
# ファイルが存在することを確認
ls -la serviceAccountKey.json
```

### 3. データベース接続確認
PostgreSQLデータベースに接続できることを確認してください。

## サーバー起動

### 1. ビルド
```bash
# backend ディレクトリに移動
cd backend

# ビルド
go build -o server ./cmd/server
```

### 2. サーバー起動
```bash
# サーバー起動
./server
```

**期待される出力:**
```
2025/11/28 12:00:00 Warning: .env file not found, using environment variables
2025/11/28 12:00:00 Connected to database successfully
2025/11/28 12:00:00 Auto migration completed successfully
2025/11/28 12:00:00 Server starting on port 8080
```

**重要なログポイント:**
- ✅ `Connected to database successfully` - DB接続成功
- ✅ `Auto migration completed successfully` - マイグレーション成功
- ✅ `Server starting on port 8080` - サーバー起動

## 動作確認手順

### Step 1: ヘルスチェック

```bash
curl -X GET http://localhost:8080/health
```

**期待されるレスポンス:**
```json
{
  "message": "Backend is running",
  "status": "ok"
}
```

### Step 2: ユーザー新規登録（SignUp）

```bash
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**期待されるレスポンス:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjM...",
  "email": "test@example.com",
  "refreshToken": "AMf-vBxT...",
  "expiresIn": "3600",
  "localId": "firebase_uid_here",
  "user": {
    "id": 1,
    "firebase_uid": "firebase_uid_here",
    "email": "test@example.com",
    "name": "",
    "name_kana": "",
    "old": 0,
    "sex": "",
    "setting": null
  }
}
```

**確認ポイント:**
- ✅ `idToken`が返される（Firebase認証成功）
- ✅ `user`オブジェクトが含まれる（PostgreSQL保存成功）
- ✅ `user.firebase_uid`が`localId`と一致
- ✅ `user.email`がリクエストのemailと一致
- ✅ `user.id`が自動採番されている

**サーバーログ確認:**
```
[DEBUG] Attempting to sign up user: test@example.com
[INFO] Sign up successful
[DEBUG] Signed up user: test@example.com
```

### Step 3: PostgreSQLでユーザー確認（オプション）

データベースに直接接続できる場合、ユーザーが保存されているか確認：

```bash
# PostgreSQLに接続
psql $DATABASE_URL

# ユーザー確認
SELECT id, firebase_uid, email, name FROM users;
```

**期待される結果:**
```
 id | firebase_uid          | email              | name
----+-----------------------+--------------------+------
  1 | firebase_uid_here     | test@example.com   |
```

### Step 4: ログイン（Login）

同じ認証情報でログインできるか確認：

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**期待されるレスポンス:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjM...",
  "email": "test@example.com",
  "refreshToken": "AMf-vBxT...",
  "expiresIn": "3600",
  "localId": "firebase_uid_here",
  "registered": true,
  "user": {
    "id": 1,
    "firebase_uid": "firebase_uid_here",
    "email": "test@example.com",
    "name": "",
    "name_kana": "",
    "old": 0,
    "sex": "",
    "setting": null
  }
}
```

**確認ポイント:**
- ✅ `idToken`が新しく発行される
- ✅ `registered: true`が返される
- ✅ `user`オブジェクトがPostgreSQLから取得されている
- ✅ `user.id`がSignUp時と同じ

**サーバーログ確認:**
```
[DEBUG] Attempting to login user: test@example.com
[INFO] Login successful
[DEBUG] Logged in user: test@example.com
```

### Step 5: 認証トークンを使ったAPIアクセス

取得したIDTokenを使って保護されたエンドポイントにアクセス：

```bash
# Step 4で取得したidTokenを使用
ID_TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjM..."

# 全ユーザー取得
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer $ID_TOKEN"
```

**期待されるレスポンス:**
```json
[
  {
    "id": 1,
    "firebase_uid": "firebase_uid_here",
    "email": "test@example.com",
    "name": "",
    "name_kana": "",
    "old": 0,
    "sex": "",
    "setting": null
  }
]
```

**確認ポイント:**
- ✅ 認証が通る（401エラーにならない）
- ✅ PostgreSQLからユーザー一覧が取得できる

**サーバーログ確認:**
```
[INFO] Token verification successful
[DEBUG] Verified token for UID: firebase_uid_here
```

### Step 6: ユーザー情報の更新

PostgreSQLのユーザー情報を更新：

```bash
# ユーザー情報更新（ID=1のユーザー）
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "firebase_uid": "firebase_uid_here",
    "email": "test@example.com",
    "name": "山田太郎",
    "name_kana": "やまだたろう",
    "old": 25,
    "sex": "male",
    "setting": {"theme": "dark"}
  }'
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "firebase_uid": "firebase_uid_here",
  "email": "test@example.com",
  "name": "山田太郎",
  "name_kana": "やまだたろう",
  "old": 25,
  "sex": "male",
  "setting": {"theme": "dark"}
}
```

### Step 7: 更新後のログインで確認

再度ログインして、更新されたユーザー情報が返されるか確認：

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**期待されるレスポンス:**
```json
{
  "idToken": "...",
  "email": "test@example.com",
  "refreshToken": "...",
  "expiresIn": "3600",
  "localId": "firebase_uid_here",
  "registered": true,
  "user": {
    "id": 1,
    "firebase_uid": "firebase_uid_here",
    "email": "test@example.com",
    "name": "山田太郎",
    "name_kana": "やまだたろう",
    "old": 25,
    "sex": "male",
    "setting": {"theme": "dark"}
  }
}
```

**確認ポイント:**
- ✅ `user.name`が更新されている
- ✅ `user.old`が25になっている
- ✅ `user.setting`にtheme情報が含まれている

### Step 8: ログアウト

認証済みユーザーのログアウト：

```bash
# Step 4で取得したidTokenを使用
ID_TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjM..."

curl -X POST http://localhost:8080/auth/logout \
  -H "Authorization: Bearer $ID_TOKEN"
```

**期待されるレスポンス:**
```json
{
  "message": "Logged out successfully"
}
```

**確認ポイント:**
- ✅ 200 OKが返される
- ✅ メッセージが表示される
- ✅ **クライアント側でトークンを削除する必要がある**（サーバーはステートレス）

**重要:** サーバー側のログアウトは成功を返すだけです。実際のトークン削除はクライアント側（フロントエンド）で行います。

## エラーケースの確認

### 1. 重複メールアドレスでのSignUp

```bash
# 同じメールアドレスで再度SignUp
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**期待されるレスポンス:**
```json
{
  "error": "firebase error: EMAIL_EXISTS"
}
```

### 2. 間違ったパスワードでのLogin

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'
```

**期待されるレスポンス:**
```json
{
  "error": "firebase error: INVALID_LOGIN_CREDENTIALS"
}
```

### 3. 無効なトークンでのAPIアクセス

```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer invalid_token_here"
```

**期待されるレスポンス:**
```json
{
  "error": "Invalid or expired token"
}
```

**サーバーログ確認:**
```
[ERROR] Failed to verify ID token: ...
```

## 統合確認チェックリスト

全ての機能が正しく動作しているか確認：

- [ ] サーバーが正常に起動する
- [ ] AutoMigrationが成功する
- [ ] ヘルスチェックが成功する
- [ ] SignUpが成功する（Firebase + PostgreSQL）
- [ ] SignUpレスポンスにUserオブジェクトが含まれる
- [ ] PostgreSQLにユーザーが保存される
- [ ] Loginが成功する（Firebase認証）
- [ ] LoginレスポンスにPostgreSQLユーザー情報が含まれる
- [ ] IDTokenで保護されたAPIにアクセスできる
- [ ] ユーザー情報の更新ができる（PostgreSQLのみ）
- [ ] 更新後のLoginで最新情報が返される
- [ ] **Logoutが成功する（認証必須）**
- [ ] 重複メールアドレスでSignUpがエラーになる
- [ ] 間違ったパスワードでLoginがエラーになる
- [ ] 無効なトークンでAPIアクセスがエラーになる

## トラブルシューティング

### サーバーが起動しない

**症状:** `Failed to connect to database`

**対処法:**
1. `.env`ファイルの`DATABASE_URL`を確認
2. PostgreSQLサーバーが起動しているか確認
3. ネットワーク接続を確認

---

**症状:** `Failed to initialize Firebase`

**対処法:**
1. `serviceAccountKey.json`が`backend/`ディレクトリにあるか確認
2. ファイルの内容が正しいJSON形式か確認
3. Firebaseプロジェクトの設定を確認

### SignUpが失敗する

**症状:** `failed to create user in database`

**対処法:**
1. PostgreSQLの接続を確認
2. AutoMigrationが成功しているか確認
3. `users`テーブルに`firebase_uid`と`email`カラムがあるか確認

### Loginでユーザー情報が返されない

**症状:** レスポンスに`user`フィールドがない

**対処法:**
1. PostgreSQLに該当するFirebaseUIDのユーザーが存在するか確認
2. サーバーログでエラーがないか確認
3. `FindByFirebaseUID`が正しく実装されているか確認

## 次のステップ

動作確認が完了したら：
1. フロントエンドとの連携テスト
2. 本番環境へのデプロイ準備
3. セキュリティ設定の確認
4. パフォーマンステスト

## 参考資料

- [BACKEND_README.md](../BACKEND_README.md) - バックエンド全体の構成説明
- [auth-struct_change.md](./auth-struct_change.md) - 認証機能の構造変更詳細
- [api-testing-guide.md](./api-testing-guide.md) - API全体のテストガイド
