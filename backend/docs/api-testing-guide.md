# API テスティングガイド

このドキュメントでは、すべてのAPIエンドポイントの単体テストをcurlコマンドで実行する方法を説明します。

## 前提条件

1. サーバーが起動していること
```bash
go run ./cmd/server/main.go
```

2. 環境変数が設定されていること（`.env`ファイル）
```
FIREBASE_API_KEY=your_firebase_api_key
DATABASE_URL=your_database_url
PORT=8080
```

---

## 1. ヘルスチェック

### GET /health
サーバーの稼働状態を確認

```bash
curl --noproxy "*" -X GET http://localhost:8080/health
```

**期待されるレスポンス:**
```json
{
  "message": "Server is healthy",
  "status": "ok"
}
```

---

## 2. 認証API

### POST /signup
新規ユーザー登録

```bash
curl --noproxy "*"  -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**期待されるレスポンス:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...",
  "email": "test@example.com",
  "refreshToken": "AGEhc0HZ4FHFQjg...",
  "expiresIn": "3600",
  "localId": "xxxxxxxxxxx"
}
```

**エラーレスポンス例:**
```json
{
  "error": "EMAIL_EXISTS"
}
```

---

### POST /login
ログイン

```bash
curl --noproxy "*"  -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**期待されるレスポンス:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...",
  "email": "test@example.com",
  "refreshToken": "AGEhc0HZ4FHFQjg...",
  "expiresIn": "3600",
  "localId": "xxxxxxxxxxx",
  "registered": true
}
```

**エラーレスポンス例:**
```json
{
  "error": "EMAIL_NOT_FOUND"
}
```
または
```json
{
  "error": "INVALID_PASSWORD"
}
```

---

## 3. ユーザーAPI（認証必須）

### 認証トークンの取得
以下のAPIを実行する前に、ログインまたはサインアップで取得した`idToken`を使用します。

```bash
# トークンを環境変数に保存
export TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
```

---

### POST /api/users
ユーザー作成

```bash
curl --noproxy "*"  -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "山田太郎",
    "name_kana": "ヤマダタロウ",
    "old": 25,
    "sex": "male",
    "setting": {
      "theme": "dark",
      "notifications": true
    }
  }'
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "name": "山田太郎",
  "name_kana": "ヤマダタロウ",
  "old": 25,
  "sex": "male",
  "setting": {
    "theme": "dark",
    "notifications": true
  }
}
```

---

### GET /api/users
全ユーザー取得

```bash
curl --noproxy "*"  -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
[
  {
    "id": 1,
    "name": "山田太郎",
    "name_kana": "ヤマダタロウ",
    "old": 25,
    "sex": "male",
    "setting": {
      "theme": "dark",
      "notifications": true
    }
  },
  {
    "id": 2,
    "name": "佐藤花子",
    "name_kana": "サトウハナコ",
    "old": 30,
    "sex": "female",
    "setting": {}
  }
]
```

---

### GET /api/users/:id
特定ユーザー取得

```bash
curl --noproxy "*"  -X GET http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "name": "山田太郎",
  "name_kana": "ヤマダタロウ",
  "old": 25,
  "sex": "male",
  "setting": {
    "theme": "dark",
    "notifications": true
  }
}
```

---

### PUT /api/users/:id
ユーザー更新

```bash
curl --noproxy "*"  -X PUT http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "山田太郎",
    "name_kana": "ヤマダタロウ",
    "old": 26,
    "sex": "male",
    "setting": {
      "theme": "light",
      "notifications": false
    }
  }'
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "name": "山田太郎",
  "name_kana": "ヤマダタロウ",
  "old": 26,
  "sex": "male",
  "setting": {
    "theme": "light",
    "notifications": false
  }
}
```

---

### DELETE /api/users/:id
ユーザー削除

```bash
curl --noproxy "*"  -X DELETE http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
{
  "message": "User deleted successfully"
}
```

---

## 4. 場所API（認証必須）

### POST /api/places
場所作成

```bash
curl --noproxy "*"  -X POST http://localhost:8080/api/places \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "東京タワー",
    "address": "東京都港区芝公園4-2-8",
    "latitude": 35.6586,
    "longitude": 139.7454,
    "description": "東京のシンボルタワー"
  }'
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "name": "東京タワー",
  "address": "東京都港区芝公園4-2-8",
  "latitude": 35.6586,
  "longitude": 139.7454,
  "description": "東京のシンボルタワー"
}
```

---

### GET /api/places
全場所取得

```bash
curl --noproxy "*"  -X GET http://localhost:8080/api/places \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
[
  {
    "id": 1,
    "name": "東京タワー",
    "address": "東京都港区芝公園4-2-8",
    "latitude": 35.6586,
    "longitude": 139.7454,
    "description": "東京のシンボルタワー"
  }
]
```

---

### GET /api/places/:id
特定場所取得

```bash
curl --noproxy "*"  -X GET http://localhost:8080/api/places/1 \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "name": "東京タワー",
  "address": "東京都港区芝公園4-2-8",
  "latitude": 35.6586,
  "longitude": 139.7454,
  "description": "東京のシンボルタワー"
}
```

---

### PUT /api/places/:id
場所更新

```bash
curl --noproxy "*"  -X PUT http://localhost:8080/api/places/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "東京タワー",
    "address": "東京都港区芝公園4-2-8",
    "latitude": 35.6586,
    "longitude": 139.7454,
    "description": "更新された説明"
  }'
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "name": "東京タワー",
  "address": "東京都港区芝公園4-2-8",
  "latitude": 35.6586,
  "longitude": 139.7454,
  "description": "更新された説明"
}
```

---

### DELETE /api/places/:id
場所削除

```bash
curl --noproxy "*"  -X DELETE http://localhost:8080/api/places/1 \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
{
  "message": "Place deleted successfully"
}
```

---

## 5. 統合テストスクリプト

すべてのAPIを順番にテストするシェルスクリプト:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080"
EMAIL="test_$(date +%s)@example.com"
PASSWORD="testpassword123"

echo "=== 1. ヘルスチェック ==="
curl --noproxy "*"  -X GET $BASE_URL/health
echo -e "\n"

echo "=== 2. サインアップ ==="
SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo $SIGNUP_RESPONSE | jq .
TOKEN=$(echo $SIGNUP_RESPONSE | jq -r .idToken)
echo "Token: $TOKEN"
echo -e "\n"

echo "=== 3. ログイン ==="
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo $LOGIN_RESPONSE | jq .
TOKEN=$(echo $LOGIN_RESPONSE | jq -r .idToken)
echo -e "\n"

echo "=== 4. ユーザー作成 ==="
USER_RESPONSE=$(curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "テストユーザー",
    "name_kana": "テストユーザー",
    "old": 25,
    "sex": "male",
    "setting": {"theme": "dark"}
  }')
echo $USER_RESPONSE | jq .
USER_ID=$(echo $USER_RESPONSE | jq -r .id)
echo -e "\n"

echo "=== 5. 全ユーザー取得 ==="
curl -s -X GET $BASE_URL/api/users \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

echo "=== 6. 特定ユーザー取得 ==="
curl -s -X GET $BASE_URL/api/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

echo "=== 7. ユーザー更新 ==="
curl -s -X PUT $BASE_URL/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "更新されたユーザー",
    "name_kana": "コウシンサレタユーザー",
    "old": 26,
    "sex": "male",
    "setting": {"theme": "light"}
  }' | jq .
echo -e "\n"

echo "=== 8. 場所作成 ==="
PLACE_RESPONSE=$(curl -s -X POST $BASE_URL/api/places \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "テスト場所",
    "address": "東京都",
    "latitude": 35.6586,
    "longitude": 139.7454,
    "description": "テスト用の場所"
  }')
echo $PLACE_RESPONSE | jq .
PLACE_ID=$(echo $PLACE_RESPONSE | jq -r .id)
echo -e "\n"

echo "=== 9. 全場所取得 ==="
curl -s -X GET $BASE_URL/api/places \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

echo "=== 10. 場所削除 ==="
curl -s -X DELETE $BASE_URL/api/places/$PLACE_ID \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

echo "=== 11. ユーザー削除 ==="
curl -s -X DELETE $BASE_URL/api/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

echo "=== テスト完了 ==="
```

このスクリプトを`test-api.sh`として保存し、実行権限を付与して実行:

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## エラーレスポンス

### 認証エラー
```json
{
  "error": "Authorization header missing"
}
```

```json
{
  "error": "Invalid Authorization header format"
}
```

```json
{
  "error": "Invalid or expired ID token"
}
```

### バリデーションエラー
```json
{
  "error": "Invalid request payload"
}
```

```json
{
  "error": "Invalid user ID"
}
```

### リソースが見つからない
```json
{
  "error": "User not found"
}
```

```json
{
  "error": "Place not found"
}
```

---

## 注意事項

1. **トークンの有効期限**: FirebaseのIDトークンは1時間で期限切れになります。期限切れの場合は再度ログインしてください。

2. **データベース接続**: API実行前にデータベースが起動していることを確認してください。

3. **環境変数**: `FIREBASE_API_KEY`が正しく設定されていることを確認してください。

4. **CORS**: フロントエンドから呼び出す場合、CORSミドルウェアが有効になっています。

5. **JSON形式**: すべてのリクエストとレスポンスはJSON形式です。
