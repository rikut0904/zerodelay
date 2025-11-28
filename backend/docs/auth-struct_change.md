# 認証機能の構造修正

## 概要
`/auth`ディレクトリに配置されていた認証機能を、既存のクリーンアーキテクチャに合わせて`/internal`配下に再構築しました。

さらに、**Firebase認証とPostgreSQL管理を分離**する設計に修正しました。

## 変更内容

### 削除されたファイル
- `/auth/firebase.go`
- `/auth/firebase_rest.go`
- `/auth/middleware.go`
- `/auth/types.go`
- `/main.go` (廃止、cmd/server/main.goを使用)

### 新規作成されたファイル

#### 1. Domain層 (ドメインモデルとインターフェース定義)
- **`internal/domain/model/auth.go`**
  - `SignUpRequest`: サインアップリクエスト構造体
  - `LoginRequest`: ログインリクエスト構造体
  - `AuthResponse`: 認証レスポンス構造体
    - **NEW**: `User` フィールド追加 - PostgreSQLから取得したユーザー情報
  - `FirebaseError`: Firebaseエラー構造体

- **`internal/domain/repository/auth_repository.go`**
  - `AuthRepository`: 認証リポジトリインターフェース
    - `SignUp(ctx, req)`: ユーザー登録 (Firebaseのみ)
    - `Login(ctx, req)`: ログイン (Firebaseのみ)
    - `VerifyIDToken(ctx, idToken)`: トークン検証

- **`internal/domain/repository/user_repository.go`** (更新)
  - **NEW**: `FindByFirebaseUID(firebaseUID)`: FirebaseUIDでユーザー検索
  - **NEW**: `FindByEmail(email)`: Emailでユーザー検索

#### 2. Domain Model更新
- **`internal/domain/model/user.go`** (更新)
  - **NEW**: `FirebaseUID` フィールド - Firebaseユーザー識別子 (ユニークインデックス、NOT NULL)
  - **NEW**: `Email` フィールド - メールアドレス (ユニークインデックス、NOT NULL)

#### 3. Repository層 (外部サービスとのやり取り)
- **`internal/repository/auth_repository.go`**
  - Firebase REST APIとの通信実装
  - Firebase Admin SDKを使用したトークン検証
  - エラーハンドリングの改善

- **`internal/repository/user_repository.go`** (更新)
  - `FindByFirebaseUID`: FirebaseUIDでPostgreSQLからユーザー検索
  - `FindByEmail`: EmailでPostgreSQLからユーザー検索

#### 4. Service層 (ビジネスロジック)
- **`internal/service/auth_service.go`** (大幅更新)
  - `AuthService`: 認証サービス
  - **NEW**: UserRepositoryを注入し、Firebase認証とPostgreSQL管理を統合
  - `SignUp`:
    1. Firebaseでユーザー作成
    2. **PostgreSQLにユーザー情報保存** (FirebaseUID + Email)
    3. レスポンスにPostgreSQLユーザー情報を含める
  - `Login`:
    1. Firebaseで認証
    2. **PostgreSQLからユーザー情報取得** (FirebaseUIDで検索)
    3. レスポンスにPostgreSQLユーザー情報を含める

#### 5. Handler層 (HTTPリクエスト処理)
- **`internal/handler/auth_handler.go`**
  - `AuthHandler`: 認証ハンドラー
  - `/signup`, `/login`エンドポイントの実装

#### 6. Middleware層 (認証ミドルウェア)
- **`internal/middleware/auth_middleware.go`**
  - `FirebaseAuthMiddleware`: Firebase認証ミドルウェア
  - Bearerトークンの検証とUIDの取得

#### 7. Config層 (初期化処理)
- **`internal/config/firebase.go`**
  - `InitFirebase()`: Firebase Admin SDKの初期化

### 更新されたファイル

#### `internal/router/router.go`
- 認証ハンドラーの追加
- 認証ルート(`/signup`, `/login`)の追加
- `/api`グループに認証ミドルウェアを適用

#### `cmd/server/main.go`
- Firebase初期化の追加
- **NEW**: AutoMigrate呼び出しの追加
- 認証リポジトリ、サービス、ハンドラーの初期化
- **NEW**: AuthServiceにUserRepositoryを注入
- 依存性注入の完全な実装

#### `internal/database/database.go`
- AutoMigrate関数でUserとPlaceモデルをマイグレーション

## アーキテクチャ構成

```
internal/
├── config/
│   ├── config.go                # 環境変数設定
│   └── firebase.go              # Firebase初期化
├── domain/
│   ├── model/
│   │   ├── auth.go              # 認証ドメインモデル (User情報含む)
│   │   └── user.go              # ユーザーモデル (FirebaseUID, Email追加)
│   └── repository/
│       ├── auth_repository.go   # 認証リポジトリインターフェース
│       └── user_repository.go   # ユーザーリポジトリインターフェース (検索メソッド追加)
├── repository/
│   ├── auth_repository.go       # 認証リポジトリ実装 (Firebase)
│   └── user_repository.go       # ユーザーリポジトリ実装 (PostgreSQL)
├── service/
│   ├── auth_service.go          # 認証サービス (Firebase + PostgreSQL統合)
│   └── user_service.go          # ユーザーサービス
├── handler/
│   ├── auth_handler.go          # 認証ハンドラー
│   └── user_handler.go          # ユーザーハンドラー
├── middleware/
│   └── auth_middleware.go       # 認証ミドルウェア
└── router/
    └── router.go                # ルーティング設定
```

## 依存関係の流れ

### 認証フロー (SignUp/Login)
```
Handler → AuthService → AuthRepository (Firebase)
            ↓
          UserRepository (PostgreSQL)
```

### データ管理の分離
```
┌─────────────────┐         ┌──────────────────┐
│   Firebase      │         │   PostgreSQL     │
│   (認証のみ)     │         │  (ユーザー管理)   │
├─────────────────┤         ├──────────────────┤
│ - Email         │   連携  │ - ID             │
│ - Password      │ ←────→ │ - FirebaseUID    │
│ - LocalID (UID) │         │ - Email          │
│ - IDToken       │         │ - Name           │
│                 │         │ - NameKana       │
│                 │         │ - Old            │
│                 │         │ - Sex            │
│                 │         │ - Setting        │
└─────────────────┘         └──────────────────┘
```

## エンドポイント

### 公開エンドポイント
- `POST /signup` - ユーザー登録
  - **NEW**: PostgreSQLにもユーザー情報を保存
  - レスポンスにPostgreSQLユーザー情報を含む
- `POST /login` - ログイン
  - **NEW**: PostgreSQLからユーザー情報を取得
  - レスポンスにPostgreSQLユーザー情報を含む
- `GET /health` - ヘルスチェック

### 保護されたエンドポイント (認証必須)
- `GET /api/users` - ユーザー一覧取得
- `POST /api/users` - ユーザー作成
- `GET /api/users/:id` - ユーザー取得
- `PUT /api/users/:id` - **ユーザー更新** (PostgreSQLのみ更新)
- `DELETE /api/users/:id` - ユーザー削除
- `GET /api/places` - 場所一覧取得
- その他すべての`/api/*`エンドポイント

## データフロー

### SignUp (新規登録)
1. クライアント → `POST /signup` (Email, Password)
2. AuthService → Firebase REST API (ユーザー作成)
3. Firebase → AuthService (LocalID/UID, IDToken)
4. **AuthService → PostgreSQL (FirebaseUID + Email保存)**
5. **PostgreSQL → AuthService (User情報)**
6. AuthService → クライアント (IDToken + **User情報**)

### Login (ログイン)
1. クライアント → `POST /login` (Email, Password)
2. AuthService → Firebase REST API (認証)
3. Firebase → AuthService (LocalID/UID, IDToken)
4. **AuthService → PostgreSQL (FirebaseUIDでユーザー検索)**
5. **PostgreSQL → AuthService (User情報)**
6. AuthService → クライアント (IDToken + **User情報**)

### 認証済みAPIアクセス
1. クライアント → `/api/*` (Authorization: Bearer <IDToken>)
2. Middleware → Firebase Admin SDK (トークン検証)
3. Firebase → Middleware (UID)
4. Handler → Service → **PostgreSQL** (データ取得/更新)

## 改善点

1. **依存性注入**: すべての依存関係がコンストラクタで注入され、テストが容易
2. **レイヤー分離**: 各層の責務が明確に分離
3. **インターフェース駆動**: リポジトリはインターフェースで定義され、実装の差し替えが可能
4. **エラーハンドリング**: より詳細なエラー情報を返すように改善
5. **一貫性**: 他の機能(User, Place)と同じアーキテクチャパターンを採用
6. **NEW: 責務の分離**:
   - Firebase: 認証のみ (SignUp, Login, トークン検証)
   - PostgreSQL: ユーザーデータ管理 (プロフィール情報など)
7. **NEW: データ一元管理**: すべてのユーザー情報をPostgreSQLで管理し、拡張性を向上

## ビルドと実行

```bash
# ビルド
go build -o server ./cmd/server

# 実行
./server
```

## 環境変数

`.env`ファイルに以下を設定:
```
FIREBASE_API_KEY=your_firebase_api_key
DATABASE_URL=postgresql://user:password@host:port/database
PORT=8080
DB_LOG_LEVEL=warn  # silent, error, warn, info
```

## マイグレーション

サーバー起動時に自動でマイグレーションが実行されます。

Userテーブルには以下のカラムが追加されます：
- `firebase_uid` (TEXT, UNIQUE, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)

## コミット履歴 (Firebase + PostgreSQL統合)

1. **UserモデルにFirebaseUIDとEmail追加、AutoMigrate有効化**
   - FirebaseUID, Emailフィールド追加
   - main.goでAutoMigrate呼び出し

2. **UserRepositoryにFirebaseUIDとEmail検索メソッド追加**
   - FindByFirebaseUID()メソッド追加
   - FindByEmail()メソッド追加

3. **SignUp時にPostgreSQLへユーザー保存機能を追加**
   - AuthServiceにUserRepository注入
   - SignUp時にPostgreSQLに保存

4. **Login時にPostgreSQLユーザー情報を取得してレスポンスに追加**
   - AuthResponseにUserフィールド追加
   - Login/SignUpレスポンスにユーザー情報含める
