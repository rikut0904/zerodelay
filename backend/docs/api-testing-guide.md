# API テスティングガイド

このドキュメントでは、すべてのAPIエンドポイントをcurlコマンドでテストする方法を説明します。

## 前提条件

### 1. サーバーが起動していること
```bash
go run ./cmd/server/main.go
# または
./bin/server
```

### 2. 環境変数が設定されていること（`.env`ファイル）
```env
PORT=8080
DATABASE_URL=postgresql://user:password@host:port/database
FIREBASE_API_KEY=your_firebase_api_key
DB_LOG_LEVEL=warn
```

### 3. serviceAccountKey.jsonの配置
Firebaseコンソールからダウンロードした`serviceAccountKey.json`を`backend/`ディレクトリに配置してください。Railwayなどファイルを配置できない環境では、鍵のJSON文字列を `FIREBASE_CREDENTIALS_JSON` として環境変数に設定する方法でも動作します。

---

## APIバージョン

全てのAPIエンドポイントは `/api/v1` 配下にあります。

---

## 1. ヘルスチェック

### GET /health
サーバーの稼働状態を確認

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

---

## 2. 認証API

### 重要：メール確認必須について

- **サインアップ後、メールアドレスの確認が必須です**
- 確認メール内のリンクをクリックするまで、ログインやAPI利用はできません
- サインアップ時には`idToken`は返されません（セキュリティ上の理由）
- メール確認後、ログインして`idToken`を取得してください

---

### POST /api/v1/auth/signup
新規ユーザー登録

```bash
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**期待されるレスポンス:**
```json
{
  "user": {
    "id": 1,
    "firebase_uid": "xxxxxxxxxxx",
    "email": "test@example.com",
    "name": "",
    "name_kana": "",
    "old": 0,
    "sex": "",
    "setting": null
  }
}
```

**次のステップ:**
1. 登録したメールアドレスに確認メールが送信されます
2. メール内のリンクをクリックしてメールアドレスを確認
3. 確認後、ログインしてください

**エラーレスポンス例:**
```json
{
  "error": "firebase error: EMAIL_EXISTS"
}
```

---

### POST /api/v1/auth/login
ログイン（メール確認必須）

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
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
  "refreshToken": "AMf-vBxT...",
  "expiresIn": "3600",
  "user": {
    "id": 1,
    "firebase_uid": "xxxxxxxxxxx",
    "email": "test@example.com",
    "name": "",
    "name_kana": "",
    "old": 0,
    "sex": "",
    "setting": null
  }
}
```

**エラーレスポンス例（メール未確認）:**
```json
{
  "error": "email not verified. Please check your email and verify your account"
}
```

**エラーレスポンス例（認証情報が間違っている）:**
```json
{
  "error": "firebase error: INVALID_LOGIN_CREDENTIALS"
}
```

---

## 3. 認証必須エンドポイント

### 認証トークンの取得と使用

以下のAPIを実行する前に、ログインで取得した`idToken`を使用します。

```bash
# トークンを環境変数に保存（実際のトークンに置き換えてください）
export TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
```

**重要:**
- 全ての認証必須エンドポイントでは**メールアドレスの確認が必須**です
- メール未確認の場合は403エラーが返されます

---

### POST /api/v1/auth/logout
ログアウト

```bash
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
{
  "message": "Logged out successfully"
}
```

**注意:** サーバー側のログアウトは成功を返すだけです。実際のトークン削除はクライアント側で行ってください。

---

## 4. ユーザーAPI

### GET /api/v1/users
全ユーザー取得

```bash
curl -X GET http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
[
  {
    "id": 1,
    "firebase_uid": "xxxxxxxxxxx",
    "email": "test@example.com",
    "name": "山田太郎",
    "name_kana": "やまだたろう",
    "old": 25,
    "sex": "male",
    "setting": {
      "theme": "dark"
    }
  }
]
```

---

### GET /api/v1/users/:id
特定ユーザー取得

```bash
curl -X GET http://localhost:8080/api/v1/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "firebase_uid": "xxxxxxxxxxx",
  "email": "test@example.com",
  "name": "山田太郎",
  "name_kana": "やまだたろう",
  "old": 25,
  "sex": "male",
  "setting": {
    "theme": "dark"
  }
}
```

**エラーレスポンス（ユーザーが見つからない）:**
```json
{
  "error": "User not found"
}
```

---

### GET /api/v1/users/me
現在ログイン中のユーザー情報を取得

```bash
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "firebase_uid": "xxxxxxxxxxx",
  "email": "test@example.com",
  "name": "山田太郎",
  "name_kana": "やまだたろう",
  "old": 25,
  "sex": "male",
  "setting": {
    "theme": "dark"
  }
}
```

---

### PUT /api/v1/users/:id
ユーザー更新

```bash
curl -X PUT http://localhost:8080/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "山田太郎",
    "name_kana": "やまだたろう",
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
  "firebase_uid": "xxxxxxxxxxx",
  "email": "test@example.com",
  "name": "山田太郎",
  "name_kana": "やまだたろう",
  "old": 26,
  "sex": "male",
  "setting": {
    "theme": "light",
    "notifications": false
  }
}
```

---

### PATCH /api/v1/users/me
現在ログイン中のユーザー情報を部分更新

```bash
curl -X PATCH http://localhost:8080/api/v1/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "新しい名前",
    "old": 30
  }'
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "firebase_uid": "xxxxxxxxxxx",
  "email": "test@example.com",
  "name": "新しい名前",
  "name_kana": "やまだたろう",
  "old": 30,
  "sex": "male",
  "setting": {
    "theme": "dark"
  }
}
```

**注意:** メールアドレスを変更すると、新しいメールアドレスに確認メールが送信されます。

---

### DELETE /api/v1/users/:id
ユーザー削除

```bash
curl -X DELETE http://localhost:8080/api/v1/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
{
  "message": "User deleted successfully"
}
```

---

## 5. 場所API

### POST /api/v1/places
場所作成

```bash
curl -X POST http://localhost:8080/api/v1/places \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "東京タワー",
    "address": "東京都港区芝公園4-2-8",
    "lat": 35.6586,
    "lon": 139.7454,
    "url": "https://www.tokyotower.co.jp/",
    "tel": "03-3433-5111",
    "holiday": "年中無休",
    "open_time": "09:00 - 23:00",
    "price": "大人1200円",
    "tag": "観光スポット"
  }'
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "name": "東京タワー",
  "address": "東京都港区芝公園4-2-8",
  "lat": 35.6586,
  "lon": 139.7454,
  "url": "https://www.tokyotower.co.jp/",
  "tel": "03-3433-5111",
  "holiday": "年中無休",
  "open_time": "09:00 - 23:00",
  "price": "大人1200円",
  "tag": "観光スポット"
}
```

---

### GET /api/v1/places
全場所取得

```bash
curl -X GET http://localhost:8080/api/v1/places \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
[
  {
    "id": 1,
    "name": "東京タワー",
    "address": "東京都港区芝公園4-2-8",
    "lat": 35.6586,
    "lon": 139.7454,
    "url": "https://www.tokyotower.co.jp/",
    "tel": "03-3433-5111",
    "holiday": "年中無休",
    "open_time": "09:00 - 23:00",
    "price": "大人1200円",
    "tag": "観光スポット"
  }
]
```

---

### GET /api/v1/places/:id
特定場所取得

```bash
curl -X GET http://localhost:8080/api/v1/places/1 \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "name": "東京タワー",
  "address": "東京都港区芝公園4-2-8",
  "lat": 35.6586,
  "lon": 139.7454,
  "url": "https://www.tokyotower.co.jp/",
  "tel": "03-3433-5111",
  "holiday": "年中無休",
  "open_time": "09:00 - 23:00",
  "price": "大人1200円",
  "tag": "観光スポット"
}
```

---

### PUT /api/v1/places/:id
場所更新

```bash
curl -X PUT http://localhost:8080/api/v1/places/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "東京タワー",
    "address": "東京都港区芝公園4-2-8",
    "lat": 35.6586,
    "lon": 139.7454,
    "url": "https://www.tokyotower.co.jp/",
    "tel": "03-3433-5111",
    "holiday": "年中無休",
    "open_time": "09:00 - 23:00（変更）",
    "price": "大人1500円",
    "tag": "観光スポット"
  }'
```

**期待されるレスポンス:**
```json
{
  "id": 1,
  "name": "東京タワー",
  "address": "東京都港区芝公園4-2-8",
  "lat": 35.6586,
  "lon": 139.7454,
  "url": "https://www.tokyotower.co.jp/",
  "tel": "03-3433-5111",
  "holiday": "年中無休",
  "open_time": "09:00 - 23:00（変更）",
  "price": "大人1500円",
  "tag": "観光スポット"
}
```

---

### DELETE /api/v1/places/:id
場所削除

```bash
curl -X DELETE http://localhost:8080/api/v1/places/1 \
  -H "Authorization: Bearer $TOKEN"
```

**期待されるレスポンス:**
```json
{
  "message": "Place deleted successfully"
}
```

---

## 6. 統合テストスクリプト

すべてのAPIを順番にテストするシェルスクリプト:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080"
EMAIL="test_$(date +%s)@example.com"
PASSWORD="testpassword123"

echo "=== 1. ヘルスチェック ==="
curl -X GET $BASE_URL/health
echo -e "\n"

echo "=== 2. サインアップ ==="
SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo $SIGNUP_RESPONSE | jq .
echo -e "\n"

echo "【重要】登録したメールアドレス（$EMAIL）に確認メールが送信されました。"
echo "メール内のリンクをクリックしてメールアドレスを確認してください。"
echo "確認後、Enterキーを押してログインテストに進んでください..."
read

echo "=== 3. ログイン ==="
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo $LOGIN_RESPONSE | jq .
TOKEN=$(echo $LOGIN_RESPONSE | jq -r .idToken)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "エラー: ログインに失敗しました。メールアドレスが確認されているか確認してください。"
  exit 1
fi

echo "Token取得成功: $TOKEN"
echo -e "\n"

echo "=== 4. 現在のユーザー情報取得 ==="
curl -s -X GET $BASE_URL/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

echo "=== 5. ユーザー情報更新 ==="
curl -s -X PATCH $BASE_URL/api/v1/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "テストユーザー",
    "name_kana": "テストユーザー",
    "old": 25,
    "sex": "male",
    "setting": {"theme": "dark"}
  }' | jq .
echo -e "\n"

echo "=== 6. 全ユーザー取得 ==="
curl -s -X GET $BASE_URL/api/v1/users \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

echo "=== 7. 場所作成 ==="
PLACE_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/places \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "テスト場所",
    "address": "東京都",
    "lat": 35.6586,
    "lon": 139.7454,
    "url": "https://example.com",
    "tel": "03-1234-5678",
    "holiday": "年中無休",
    "open_time": "09:00 - 18:00",
    "price": "無料",
    "tag": "テスト"
  }')
echo $PLACE_RESPONSE | jq .
PLACE_ID=$(echo $PLACE_RESPONSE | jq -r .id)
echo -e "\n"

echo "=== 8. 全場所取得 ==="
curl -s -X GET $BASE_URL/api/v1/places \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

echo "=== 9. 場所削除 ==="
curl -s -X DELETE $BASE_URL/api/v1/places/$PLACE_ID \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

echo "=== 10. ログアウト ==="
curl -s -X POST $BASE_URL/api/v1/auth/logout \
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

## 7. エラーレスポンス

### 認証エラー（401）
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

### メール未確認エラー（403）
```json
{
  "error": "Email not verified. Please verify your email address"
}
```

```json
{
  "error": "email not verified. Please check your email and verify your account"
}
```

### バリデーションエラー（400）
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

### リソースが見つからない（404）
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

## 8. 注意事項

1. **メールアドレスの確認必須**: サインアップ後、必ずメールアドレスを確認してからログインしてください。

2. **トークンの有効期限**: FirebaseのIDトークンは1時間で期限切れになります。期限切れの場合は再度ログインしてください。

3. **データベース接続**: API実行前にデータベースが起動していることを確認してください。

4. **環境変数**: `FIREBASE_API_KEY`とサービスアカウントキーが正しく設定されていることを確認してください。

5. **JSON形式**: すべてのリクエストとレスポンスはJSON形式です。

6. **テストユーザーの削除**: テスト後、不要なユーザーは以下のコマンドで削除できます：
   ```bash
   go run cmd/debug/delete_user/main.go -all
   ```

---

## 9. トラブルシューティング

### サインアップ後にログインできない
**原因:** メールアドレスが確認されていない

**対処法:**
1. 登録したメールアドレスの受信ボックスを確認
2. 迷惑メールフォルダも確認
3. 確認メール内のリンクをクリック
4. 確認完了後、再度ログインを試す

### トークンが無効と表示される
**原因:** トークンの有効期限切れ

**対処法:**
1. 再度ログインして新しいトークンを取得
2. 環境変数を更新

### サーバーエラー（500）
**原因:** データベース接続やサーバー設定の問題

**対処法:**
1. サーバーログを確認
2. `.env`ファイルの設定を確認
3. `serviceAccountKey.json`が正しく配置されているか確認

---

## 10. 参考資料

- [api-endpoints.md](./api-endpoints.md) - 全APIエンドポイントの詳細仕様
- [testing-firebase-postgresql-auth.md](./testing-firebase-postgresql-auth.md) - Firebase認証の統合テスト
- [firebase-email-setup.md](./firebase-email-setup.md) - メール確認機能の設定手順
- [cmd/debug/README.md](../cmd/debug/README.md) - デバッグツールの使い方
