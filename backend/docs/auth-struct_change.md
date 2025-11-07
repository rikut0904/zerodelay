# 認証機能の構造修正

## 概要
`/auth`ディレクトリに配置されていた認証機能を、既存のクリーンアーキテクチャに合わせて`/internal`配下に再構築しました。

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
  - `FirebaseError`: Firebaseエラー構造体

- **`internal/domain/repository/auth_repository.go`**
  - `AuthRepository`: 認証リポジトリインターフェース
    - `SignUp(ctx, req)`: ユーザー登録
    - `Login(ctx, req)`: ログイン
    - `VerifyIDToken(ctx, idToken)`: トークン検証

#### 2. Repository層 (外部サービスとのやり取り)
- **`internal/repository/auth_repository.go`**
  - Firebase REST APIとの通信実装
  - Firebase Admin SDKを使用したトークン検証
  - エラーハンドリングの改善

#### 3. Service層 (ビジネスロジック)
- **`internal/service/auth_service.go`**
  - `AuthService`: 認証サービス
  - リポジトリを通じた認証処理の実行

#### 4. Handler層 (HTTPリクエスト処理)
- **`internal/handler/auth_handler.go`**
  - `AuthHandler`: 認証ハンドラー
  - `/signup`, `/login`エンドポイントの実装

#### 5. Middleware層 (認証ミドルウェア)
- **`internal/middleware/auth_middleware.go`**
  - `FirebaseAuthMiddleware`: Firebase認証ミドルウェア
  - Bearerトークンの検証とUIDの取得

#### 6. Config層 (初期化処理)
- **`internal/config/firebase.go`**
  - `InitFirebase()`: Firebase Admin SDKの初期化

### 更新されたファイル

#### `internal/router/router.go`
- 認証ハンドラーの追加
- 認証ルート(`/signup`, `/login`)の追加
- `/api`グループに認証ミドルウェアを適用

#### `cmd/server/main.go`
- Firebase初期化の追加
- 認証リポジトリ、サービス、ハンドラーの初期化
- 依存性注入の完全な実装

## アーキテクチャ構成

```
internal/
├── config/
│   └── firebase.go              # Firebase初期化
├── domain/
│   ├── model/
│   │   └── auth.go              # 認証ドメインモデル
│   └── repository/
│       └── auth_repository.go   # 認証リポジトリインターフェース
├── repository/
│   └── auth_repository.go       # 認証リポジトリ実装
├── service/
│   └── auth_service.go          # 認証サービス
├── handler/
│   └── auth_handler.go          # 認証ハンドラー
├── middleware/
│   └── auth_middleware.go       # 認証ミドルウェア
└── router/
    └── router.go                # ルーティング設定
```

## 依存関係の流れ

```
Handler → Service → Repository → External Service (Firebase)
   ↓         ↓          ↓
Domain Models ← Interface
```

## エンドポイント

### 公開エンドポイント
- `POST /signup` - ユーザー登録
- `POST /login` - ログイン
- `GET /health` - ヘルスチェック

### 保護されたエンドポイント (認証必須)
- `GET /api/users` - ユーザー一覧取得
- `POST /api/users` - ユーザー作成
- `GET /api/places` - 場所一覧取得
- その他すべての`/api/*`エンドポイント

## 改善点

1. **依存性注入**: すべての依存関係がコンストラクタで注入され、テストが容易
2. **レイヤー分離**: 各層の責務が明確に分離
3. **インターフェース駆動**: リポジトリはインターフェースで定義され、実装の差し替えが可能
4. **エラーハンドリング**: より詳細なエラー情報を返すように改善
5. **一貫性**: 他の機能(User, Place)と同じアーキテクチャパターンを採用

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
DATABASE_URL=your_database_url
PORT=8080
```
