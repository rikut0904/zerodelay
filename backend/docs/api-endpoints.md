# API エンドポイント一覧

## 概要
このドキュメントは、ZeroDelay バックエンドAPIの全エンドポイントを記載しています。

**ベースURL:** `http://localhost:8080` (開発環境)

**APIバージョン:** v1

---

## エンドポイント構造

```
/health                          # ヘルスチェック（バージョン外）
/api/v1/auth/signup              # ユーザー登録（公開）
/api/v1/auth/login               # ログイン（公開）
/api/v1/auth/logout              # ログアウト（認証必須）
/api/v1/users/*                  # ユーザー管理（認証必須）
/api/v1/places/*                 # 場所管理（認証必須）
```

---

## 🌐 公開エンドポイント（認証不要）

### ヘルスチェック
```
GET /health
```

**説明:** サーバーの稼働状態を確認

**リクエスト:** なし

**レスポンス:**
```json
{
  "message": "Backend is running",
  "status": "ok"
}
```

---

### ユーザー登録
```
POST /api/v1/auth/signup
```

**説明:** 新規ユーザーを作成（Firebase + PostgreSQL）

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "email": "user@example.com",
  "refreshToken": "AMf-vBxT...",
  "expiresIn": "3600",
  "localId": "firebase_uid_here",
  "user": {
    "id": 1,
    "firebase_uid": "firebase_uid_here",
    "email": "user@example.com",
    "name": "",
    "name_kana": "",
    "old": 0,
    "sex": "",
    "setting": null
  }
}
```

---

### ログイン
```
POST /api/v1/auth/login
```

**説明:** ユーザー認証（Firebase + PostgreSQL）

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "email": "user@example.com",
  "refreshToken": "AMf-vBxT...",
  "expiresIn": "3600",
  "localId": "firebase_uid_here",
  "registered": true,
  "user": {
    "id": 1,
    "firebase_uid": "firebase_uid_here",
    "email": "user@example.com",
    "name": "山田太郎",
    "name_kana": "やまだたろう",
    "old": 25,
    "sex": "male",
    "setting": {"theme": "dark"}
  }
}
```

---

## 🔐 認証が必要なエンドポイント

**認証方法:** すべてのリクエストに以下のヘッダーが必要

```
Authorization: Bearer <idToken>
```

---

### ログアウト
```
POST /api/v1/auth/logout
```

**説明:** ログアウト処理（サーバー側は成功を返すのみ）

**リクエストヘッダー:**
```
Authorization: Bearer <idToken>
```

**リクエストボディ:** なし

**レスポンス:**
```json
{
  "message": "Logged out successfully"
}
```

**注意:** 実際のトークン削除はクライアント側で実施する必要があります。

---

## 👥 ユーザー管理

### 全ユーザー取得
```
GET /api/v1/users
```

**リクエストヘッダー:**
```
Authorization: Bearer <idToken>
```

**レスポンス:**
```json
[
  {
    "id": 1,
    "firebase_uid": "abc123",
    "email": "user1@example.com",
    "name": "山田太郎",
    "name_kana": "やまだたろう",
    "old": 25,
    "sex": "male",
    "setting": {"theme": "dark"}
  },
  {
    "id": 2,
    "firebase_uid": "def456",
    "email": "user2@example.com",
    "name": "佐藤花子",
    "name_kana": "さとうはなこ",
    "old": 30,
    "sex": "female",
    "setting": null
  }
]
```

---

### 特定ユーザー取得
```
GET /api/v1/users/:id
```

**パラメータ:**
- `id` (number) - ユーザーID

**リクエストヘッダー:**
```
Authorization: Bearer <idToken>
```

**レスポンス:**
```json
{
  "id": 1,
  "firebase_uid": "abc123",
  "email": "user@example.com",
  "name": "山田太郎",
  "name_kana": "やまだたろう",
  "old": 25,
  "sex": "male",
  "setting": {"theme": "dark"}
}
```

**エラー（404）:**
```json
{
  "error": "user not found"
}
```

---

### ユーザー作成
```
POST /api/v1/users
```

**説明:** 新規ユーザーをPostgreSQLに作成（通常はSignUpを使用）

**リクエストヘッダー:**
```
Authorization: Bearer <idToken>
```

**リクエストボディ:**
```json
{
  "firebase_uid": "firebase_uid_here",
  "email": "newuser@example.com",
  "name": "新規ユーザー",
  "name_kana": "しんきゆーざー",
  "old": 28,
  "sex": "male",
  "setting": {"notifications": true}
}
```

**レスポンス:**
```json
{
  "id": 3,
  "firebase_uid": "firebase_uid_here",
  "email": "newuser@example.com",
  "name": "新規ユーザー",
  "name_kana": "しんきゆーざー",
  "old": 28,
  "sex": "male",
  "setting": {"notifications": true}
}
```

---

### ユーザー更新
```
PUT /api/v1/users/:id
```

**パラメータ:**
- `id` (number) - ユーザーID

**リクエストヘッダー:**
```
Authorization: Bearer <idToken>
```

**リクエストボディ:**
```json
{
  "id": 1,
  "firebase_uid": "abc123",
  "email": "user@example.com",
  "name": "山田太郎（更新）",
  "name_kana": "やまだたろう",
  "old": 26,
  "sex": "male",
  "setting": {"theme": "light"}
}
```

**レスポンス:**
```json
{
  "id": 1,
  "firebase_uid": "abc123",
  "email": "user@example.com",
  "name": "山田太郎（更新）",
  "name_kana": "やまだたろう",
  "old": 26,
  "sex": "male",
  "setting": {"theme": "light"}
}
```

**エラー（404）:**
```json
{
  "error": "user not found"
}
```

---

### ユーザー削除
```
DELETE /api/v1/users/:id
```

**パラメータ:**
- `id` (number) - ユーザーID

**リクエストヘッダー:**
```
Authorization: Bearer <idToken>
```

**レスポンス:**
```json
{
  "message": "User deleted successfully"
}
```

**エラー（404）:**
```json
{
  "error": "user not found"
}
```

---

## 📍 場所管理

### 全場所取得
```
GET /api/v1/places
```

**リクエストヘッダー:**
```
Authorization: Bearer <idToken>
```

**レスポンス:**
```json
[
  {
    "id": 1,
    "name": "東京タワー",
    "name_kana": "とうきょうたわー",
    "address": "東京都港区芝公園4-2-8",
    "lat": "35.6586",
    "lon": "139.7454",
    "url": "https://www.tokyotower.co.jp/",
    "tel": "03-3433-5111"
  }
]
```

---

### 特定場所取得
```
GET /api/v1/places/:id
```

**パラメータ:**
- `id` (number) - 場所ID

**リクエストヘッダー:**
```
Authorization: Bearer <idToken>
```

**レスポンス:**
```json
{
  "id": 1,
  "name": "東京タワー",
  "name_kana": "とうきょうたわー",
  "address": "東京都港区芝公園4-2-8",
  "lat": "35.6586",
  "lon": "139.7454",
  "url": "https://www.tokyotower.co.jp/",
  "tel": "03-3433-5111"
}
```

**エラー（404）:**
```json
{
  "error": "place not found"
}
```

---

### 場所作成
```
POST /api/v1/places
```

**リクエストヘッダー:**
```
Authorization: Bearer <idToken>
```

**リクエストボディ:**
```json
{
  "name": "スカイツリー",
  "name_kana": "すかいつりー",
  "address": "東京都墨田区押上1-1-2",
  "lat": "35.7101",
  "lon": "139.8107",
  "url": "https://www.tokyo-skytree.jp/",
  "tel": "0570-55-0634"
}
```

**レスポンス:**
```json
{
  "id": 2,
  "name": "スカイツリー",
  "name_kana": "すかいつりー",
  "address": "東京都墨田区押上1-1-2",
  "lat": "35.7101",
  "lon": "139.8107",
  "url": "https://www.tokyo-skytree.jp/",
  "tel": "0570-55-0634"
}
```

---

### 場所更新
```
PUT /api/v1/places/:id
```

**パラメータ:**
- `id` (number) - 場所ID

**リクエストヘッダー:**
```
Authorization: Bearer <idToken>
```

**リクエストボディ:**
```json
{
  "id": 1,
  "name": "東京タワー（更新）",
  "name_kana": "とうきょうたわー",
  "address": "東京都港区芝公園4-2-8",
  "lat": "35.6586",
  "lon": "139.7454",
  "url": "https://www.tokyotower.co.jp/",
  "tel": "03-3433-5111"
}
```

**レスポンス:**
```json
{
  "id": 1,
  "name": "東京タワー（更新）",
  "name_kana": "とうきょうたわー",
  "address": "東京都港区芝公園4-2-8",
  "lat": "35.6586",
  "lon": "139.7454",
  "url": "https://www.tokyotower.co.jp/",
  "tel": "03-3433-5111"
}
```

---

### 場所削除
```
DELETE /api/v1/places/:id
```

**パラメータ:**
- `id` (number) - 場所ID

**リクエストヘッダー:**
```
Authorization: Bearer <idToken>
```

**レスポンス:**
```json
{
  "message": "Place deleted successfully"
}
```

**エラー（404）:**
```json
{
  "error": "place not found"
}
```

---

## 📋 エンドポイント早見表

| メソッド | エンドポイント | 認証 | 説明 |
|---------|---------------|------|------|
| GET | `/health` | 不要 | ヘルスチェック |
| POST | `/api/v1/auth/signup` | 不要 | ユーザー登録 |
| POST | `/api/v1/auth/login` | 不要 | ログイン |
| POST | `/api/v1/auth/logout` | 必要 | ログアウト |
| GET | `/api/v1/users` | 必要 | 全ユーザー取得 |
| GET | `/api/v1/users/:id` | 必要 | 特定ユーザー取得 |
| POST | `/api/v1/users` | 必要 | ユーザー作成 |
| PUT | `/api/v1/users/:id` | 必要 | ユーザー更新 |
| DELETE | `/api/v1/users/:id` | 必要 | ユーザー削除 |
| GET | `/api/v1/places` | 必要 | 全場所取得 |
| GET | `/api/v1/places/:id` | 必要 | 特定場所取得 |
| POST | `/api/v1/places` | 必要 | 場所作成 |
| PUT | `/api/v1/places/:id` | 必要 | 場所更新 |
| DELETE | `/api/v1/places/:id` | 必要 | 場所削除 |

---

## 🔧 共通レスポンスコード

| コード | 説明 |
|-------|------|
| 200 | 成功 |
| 400 | リクエストエラー（バリデーション失敗など） |
| 401 | 認証エラー（トークン無効・期限切れ） |
| 404 | リソースが見つからない |
| 500 | サーバーエラー |

---

## 💡 使用例

### cURLでの使用例

```bash
# 1. ログイン
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 2. トークンを変数に保存
ID_TOKEN="<取得したidToken>"

# 3. 認証が必要なAPIを呼び出し
curl -X GET http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer $ID_TOKEN"

# 4. ログアウト
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer $ID_TOKEN"
```

---

## 📚 関連ドキュメント

- [BACKEND_README.md](../BACKEND_README.md) - バックエンド全体の構成
- [auth-struct_change.md](./auth-struct_change.md) - 認証機能の詳細
- [testing-firebase-postgresql-auth.md](./testing-firebase-postgresql-auth.md) - 動作確認手順
