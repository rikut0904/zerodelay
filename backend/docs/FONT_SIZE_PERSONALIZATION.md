# フォントサイズ パーソナライズ機能

## 概要

ユーザーの年齢に基づいて初期の文字サイズを自動設定し、ユーザーがいつでも文字サイズ（小・中・大）を変更できる機能です。

## 年齢別の初期設定

| 年齢 | 初期文字サイズ |
|-----|--------------|
| 0-12歳 | **大** (large) |
| 13-64歳 | **中** (medium) |
| 65歳以上 | **大** (large) |

## API エンドポイント

### 1. 新規登録（年齢なし）

**リクエスト:**
```
POST /api/v1/auth/signup
```

**リクエストボディ:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス例:**
```json
{
  "user": {
    "id": 1,
    "firebase_uid": "...",
    "email": "user@example.com",
    "old": 0,
    "setting": null
  }
}
```

**処理:**
- 年齢は別の画面で入力
- 登録時点では `setting` は空（null）

---

### 2. 年齢を設定（別の画面）

**リクエスト:**
```
PATCH /api/v1/users/me
Authorization: Bearer {idToken}
```

**リクエストボディ:**
```json
{
  "old": 8
}
```

**レスポンス例:**
```json
{
  "id": 1,
  "firebase_uid": "...",
  "email": "user@example.com",
  "old": 8,
  "setting": null
}
```

**処理:**
- ユーザーの年齢（`old` フィールド）を更新
- この時点では文字サイズ設定は別途実施

---

### 3. 文字サイズを設定・更新

**リクエスト:**
```
PATCH /api/v1/users/me/font-size
Authorization: Bearer {idToken}
```

**リクエストボディ:**
```json
{
  "font_size": "large"
}
```

**レスポンス例:**
```json
{
  "id": 1,
  "firebase_uid": "...",
  "email": "user@example.com",
  "old": 8,
  "setting": {
    "font_size": "large"
  }
}
```

**有効な値:**
- `small` - 小
- `medium` - 中
- `large` - 大

---

## 実装の詳細

### ファイル変更内容

#### 1. `internal/domain/model/auth.go`
- `SignUpRequest` から `Age` フィールドを削除

#### 2. `internal/domain/model/font_size.go`（新規作成）
- フォントサイズ設定のモデル定義
- `GetDefaultFontSizeByAge()` - 年齢から初期値を決定

#### 3. `internal/service/auth_service.go`
- `SignUp()` メソッドを修正
- 年齢処理をすべて削除（元に戻した）

#### 4. `internal/service/user_service.go`
- `UpdateFontSize()` メソッドを追加
- ユーザーの文字サイズ設定を更新

#### 5. `internal/handler/user_handler.go`
- `UpdateFontSize()` メソッドを追加
- HTTPリクエストを処理し、バリデーション実施

#### 6. `internal/router/router.go`
- `PATCH /api/v1/users/me/font-size` ルートを追加

---

## フロントエンド実装例

### 1. 新規登録時に年齢を送信

```javascript
async function signup(email, password, age) {
  const response = await fetch('/api/v1/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, age })
  });
  
  const data = await response.json();
  
  // 初期文字サイズを取得
  const fontSize = data.user.setting.font_size;
  console.log('Initial font size:', fontSize); // "large"
  
  return data;
}
```

### 2. 文字サイズを変更

```javascript
async function updateFontSize(idToken, fontSize) {
  const response = await fetch('/api/v1/users/me/font-size', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ font_size: fontSize })
  });
  
  const data = await response.json();
  console.log('Updated font size:', data.setting.font_size);
  
  return data;
}
```

### 3. CSS での適用

```css
:root {
  --font-size: 14px; /* デフォルト */
}

body.font-size-small {
  --font-size: 12px;
}

body.font-size-medium {
  --font-size: 14px;
}

body.font-size-large {
  --font-size: 16px;
}

body {
  font-size: var(--font-size);
}
```

```javascript
// ユーザー情報取得時にクラスを適用
function applyFontSize(user) {
  const fontSize = user.setting.font_size;
  document.body.className = `font-size-${fontSize}`;
}
```

---

## 使用例

### 例1: 子供（8歳）が登録

```bash
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "child@example.com",
    "password": "password123",
    "age": 8
  }'
```

**結果:**
- 初期文字サイズは自動的に `large（大）` に設定される
- `setting` JSON: `{ "font_size": "large" }`

### 例2: 成人（35歳）が登録

```bash
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "adult@example.com",
    "password": "password123",
    "age": 35
  }'
```

**結果:**
- 初期文字サイズは自動的に `medium（中）` に設定される
- `setting` JSON: `{ "font_size": "medium" }`

### 例3: 文字サイズを変更

```bash
curl -X PATCH http://localhost:8080/api/v1/users/me/font-size \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {idToken}" \
  -d '{"font_size": "small"}'
```

**結果:**
- ユーザーの `setting` JSON が更新される
- `setting` JSON: `{ "font_size": "small" }`

---

## データベース構造

### users テーブル

```sql
-- 既存カラム
id SERIAL PRIMARY KEY
name TEXT
name_kana TEXT
old INTEGER        -- 年齢（新規登録時に設定）
sex TEXT
setting JSON       -- パーソナライズ設定をJSON形式で保存
```

### setting JSONの構造

```json
{
  "font_size": "large"  // "small", "medium", "large" のいずれか
}
```

---

## トラブルシューティング

### Q: 年齢を指定しても文字サイズが設定されない

**A**: 年齢が`0`以下またはサインアップリクエストに`age`フィールドが含まれていないかチェックしてください。

### Q: 無効な文字サイズ値でエラーが出る

**A**: 有効な値は `small`, `medium`, `large` のいずれかです。

### Q: 古いユーザーの初期値を変更したい

**A**: プロフィール更新エンドポイント (`PATCH /api/v1/users/me`) で、`Old` フィールドを更新した後、文字サイズ更新エンドポイント (`PATCH /api/v1/users/me/font-size`) で新しい年齢に基づいた文字サイズに更新してください。

