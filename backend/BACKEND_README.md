# ZeroDelay Backend 構成説明(2025/11)


## ねらい

**1ファイル集中・ロジック混在・拡張/テストのしづらさを解消**

- 設定・DB・ルーティング・各層を疎結合にして、機能追加を定型手順で回せるようにする
- 初心者でも理解できる明確なレイヤ構造
- テスト可能で保守性の高いコードベース

---

## Before → After（最小イメージ）

### 旧：main.go　のみ

- ルート定義・ハンドラー・ログ・ポート指定が直書き
- DBなし／テスタビリティ低い
- すべてのロジックが混在

### 新：エントリ分離 + レイヤ化

- **cmd/server/main.go** … 起動/配線だけ
- **internal/router** … ルーティング集約
- **internal/handler** … HTTP I/O
- **internal/service** … ビジネスルール
- **internal/repository** … DBアクセス
- **internal/database** … 接続確立
- **internal/config** … 環境変数→設定

---

## ディレクトリ構造

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # エントリポイント（起動・依存性注入）
├── internal/
│   ├── config/
│   │   └── config.go            # 設定管理（環境変数読み込み）
│   ├── database/
│   │   └── database.go          # DB接続・マイグレーション
│   ├── domain/
│   │   ├── model/               # データモデル定義
│   │   │   ├── user.go
│   │   │   └── place.go
│   │   └── repository/          # リポジトリインターフェース
│   │       ├── user_repository.go
│   │       └── place_repository.go
│   ├── repository/              # リポジトリ実装（DB操作）
│   │   ├── user_repository.go
│   │   └── place_repository.go
│   ├── service/                 # ビジネスロジック
│   │   ├── user_service.go
│   │   └── place_service.go
│   ├── handler/                 # HTTPハンドラー
│   │   ├── health_handler.go
│   │   ├── user_handler.go
│   │   └── place_handler.go
│   └── router/
│       └── router.go            # ルーティング設定
├── .env.example                 # 環境変数テンプレート
├── Dockerfile
├── go.mod
└── go.sum
```

---

## 主な変更点（箇条書き）

- **ルーティング**：`router.SetupRoutes` へ集約
- **依存注入**：repository → service → handler を main で配線
- **設定**：`config.Load()` に一本化
- **DB**：`database.NewDatabase(cfg)` に委譲
- **ハンドラーの構造化**：関数 → 構造体メソッド化（テスト容易化・依存注入・拡張のしやすさ）

---

## レイヤ構造（役割を最短で把握）

### 料理店に例える

| レイヤ | 役割 | 例え |
|--------|------|------|
| **Handler** | HTTP入出力（JSONパース/バリデーション/応答） | ウェイター（注文受付・配膳） |
| **Service** | ビジネスルール（検証・計算・ユースケース） | 料理長（レシピ・品質チェック） |
| **Repository** | データ取得/保存の抽象化（SQL/ORMに閉じる） | 倉庫係（食材の出し入れ） |
| **Database** | 接続生成/プール管理 | 倉庫 |
| **Config** | 環境変数→構造体（デフォルト含む） | 営業時間・仕入れ先 |
| **Model** | データの形を定義 | メニュー（料理の定義） |

---

## 1. なぜレイヤ化するのか？

### 悪い例：全部 main.go に書く

```go
// DBアクセス・検証・HTTP応答が混在
func CreateUser(c echo.Context) error {
  name := c.FormValue("name")
  if name == "" { return c.JSON(400, "name required") } // ← 検証
  db.Exec("INSERT INTO users...") // ← DB直接
  return c.JSON(200, "OK") // ← HTTP応答
}
```

**問題点：**
- テスト時に必ず本物のDBが必要
- 同じ検証ロジックを別APIで使い回せない
- PostgreSQL → MySQL に変更すると全ハンドラーを修正

### 良い例：レイヤ化

```go
// Handler: HTTP だけ
func (h *UserHandler) CreateUser(c echo.Context) error {
  var u model.User
  c.Bind(&u)
  err := h.service.CreateUser(&u) // ← サービス層に委譲
  if err != nil { return c.JSON(400, err.Error()) }
  return c.JSON(200, u)
}

// Service: ビジネスルール
func (s *UserService) CreateUser(u *model.User) error {
  if u.Name == "" { return errors.New("name required") }
  return s.repo.Create(u) // ← リポジトリに委譲
}

// Repository: DB操作
func (r *UserRepository) Create(u *model.User) error {
  return r.db.Create(u).Error
}
```

**メリット：**
- Service は DB なしでテスト可能（モックを注入）
- 検証ロジックを他APIからも呼べる
- DB変更は Repository だけ修正すれば良い

---

## 2. 依存性注入（DI）とは何か？

### NG：ハンドラー内で直接 DB 接続

```go
func CreateUser(c echo.Context) error {
  db := gorm.Open(...) // ← ハンドラーがDBを直接持つ
  db.Create(&user)
}
```

**問題**：テスト時にモックに差し替えられない

### OK：外から「必要なもの」を渡す（注入する）

```go
// Handler は「何か User を保存できる人」だけ知っていれば良い
type UserHandler struct {
  service UserServiceInterface // ← 本物でもモックでも良い
}

// main.go で「本物」を注入
repo := repository.NewUserRepository(db)
svc  := service.NewUserService(repo)
handler := handler.NewUserHandler(svc) // ← ここで注入
```

### テストでは「偽物（モック）」を注入

```go
mockSvc := &MockUserService{} // 偽物
handler := handler.NewUserHandler(mockSvc)
// DBなしでテスト可能！
```

**実際のコード例（cmd/server/main.go:30-41）：**

```go
// Initialize repositories
userRepo := repository.NewUserRepository(db.DB)
placeRepo := repository.NewPlaceRepository(db.DB)

// Initialize services
userService := service.NewUserService(userRepo)
placeService := service.NewPlaceService(placeRepo)

// Initialize handlers
healthHandler := handler.NewHealthHandler()
userHandler := handler.NewUserHandler(userService)
placeHandler := handler.NewPlaceHandler(placeService)
```

---

## 3. interface の威力（初心者が最も迷う点）

### interface = 「できること」の約束

**internal/domain/repository/user_repository.go:6-12**

```go
type UserRepository interface {
  Create(user *model.User) error
  FindByID(id uint) (*model.User, error)
  FindAll() ([]model.User, error)
  Update(user *model.User) error
  Delete(id uint) error
}
```

↑「これらのメソッドができれば何でも良い」という契約

### 実装は複数作れる

```go
// 本物：PostgreSQL 用
type GormUserRepository struct { db *gorm.DB }
func (r *GormUserRepository) Create(u *model.User) error { ... }

// 偽物：テスト用（メモリ上の配列）
type MockUserRepository struct { users []*model.User }
func (r *MockUserRepository) Create(u *model.User) error {
  r.users = append(r.users, u)
  return nil
}
```

### Service は「どっちでも良い」

**internal/service/user_service.go:9-16**

```go
type UserService struct {
  userRepo repository.UserRepository // ← 本物でも偽物でも受け入れる
}

func NewUserService(userRepo repository.UserRepository) *UserService {
  return &UserService{userRepo: userRepo}
}
```

**使い分け**
- 本番：`NewUserService(&GormUserRepository{})`
- テスト：`NewUserService(&MockUserRepository{})`

---

## 4. Model とは何か？（データの「型」）

### 役割：アプリ全体で扱うデータの形を定義

**internal/domain/model/user.go:9-16**

```go
type User struct {
  ID       uint   `gorm:"primaryKey;autoIncrement" json:"id"`
  Name     string `gorm:"type:text" json:"name"`
  NameKana string `gorm:"type:text;column:name_kana" json:"name_kana"`
  Old      int    `gorm:"type:integer" json:"old"`
  Sex      string `gorm:"type:text" json:"sex"`
  Setting  JSON   `gorm:"type:json" json:"setting"`
}
```

### タグの意味

- `json:"name"` → JSONにする時のキー名
- `gorm:"primaryKey"` → プライマリキー
- `gorm:"type:text"` → DB上のカラム型
- `gorm:"not null"` → DB制約（NULLを許さない）
- `validate:"required"` → バリデーション

### 使い所

- **Handler**：JSON → Model へ変換（Bind）
- **Service**：Model を検証・加工
- **Repository**：Model を DB に保存/取得
- **レスポンス**：Model → JSON へ変換

---

## 5. 1リクエストの流れ（ユーザー作成の例）

```
クライアント
    ↓ POST /api/users { "name": "Alice", "old": 20 }
[Handler]
    ↓ JSONをmodel.UserにBind
    ↓ service.CreateUser呼び出し
[Service]
    ↓ ビジネス検証（必須項目・値域など）
    ↓ repository.Create呼び出し
[Repository]
    ↓ GORM でINSERT実行
[Database]
    ↓ PostgreSQLにデータ保存
    ↑ 成功/失敗を返却
[Repository]
    ↑ エラーをそのまま返す
[Service]
    ↑ エラーを返す（必要なら変換）
[Handler]
    ↑ HTTPステータスコードで返却（200 or 400）
クライアント
```

### 実際のコード

**Service（internal/service/user_service.go:18-20）**

```go
func (s *UserService) CreateUser(user *model.User) error {
  return s.userRepo.Create(user)
}
```

**Repository（internal/repository/user_repository.go:19-21）**

```go
func (r *userRepository) Create(user *model.User) error {
  return r.db.Create(user).Error
}
```

---

## 6. エラーハンドリングの基本

### 各層でのエラーの扱い

#### Repository：DB エラーをそのまま返す

```go
func (r *UserRepository) FindByID(id uint) (*model.User, error) {
  var user model.User
  err := r.db.First(&user, id).Error
  if err != nil {
    return nil, err // ← gorm のエラーをそのまま
  }
  return &user, nil
}
```

#### Service：ビジネスエラーを追加

```go
func (s *UserService) GetUser(id uint) (*model.User, error) {
  user, err := s.repo.FindByID(id)
  if err != nil {
    if errors.Is(err, gorm.ErrRecordNotFound) {
      return nil, errors.New("user not found") // ← 意味のあるエラーに変換
    }
    return nil, err
  }
  return user, nil
}
```

#### Handler：HTTP ステータスに変換

```go
func (h *UserHandler) GetUser(c echo.Context) error {
  id, _ := strconv.Atoi(c.Param("id"))
  user, err := h.service.GetUser(uint(id))
  if err != nil {
    if err.Error() == "user not found" {
      return c.JSON(404, map[string]string{"error": err.Error()}) // ← 404
    }
    return c.JSON(500, map[string]string{"error": err.Error()}) // ← 500
  }
  return c.JSON(200, user)
}
```

---

## 7. config.go（設定管理の中心）

### 役割：設定の単一集約点

- 型で安全・環境差分は環境変数で吸収・デフォルト保障
- 設定が散逸しない（main等に直書きしない）
- 追加が容易（構造体に生やして Load へ）
- 本番/開発の切替が環境変数で完結
- 秘密情報（JWT_SECRET, API_KEY）もここで受ける

### 構成（internal/config/config.go:8-21）

```go
type Config struct {
  Server   ServerConfig
  Database DatabaseConfig
}

type ServerConfig struct {
  Port string
}

type DatabaseConfig struct {
  URL string
}
```

### 読み込み（internal/config/config.go:24-33）

```go
func Load() *Config {
  return &Config{
    Server: ServerConfig{
      Port: getEnv("PORT", "8080"), // ← 環境変数から取得（なければデフォルト）
    },
    Database: DatabaseConfig{
      URL: getEnv("DATABASE_URL", ""),
    },
  }
}
```

### 利用（cmd/server/main.go:19）

```go
cfg := config.Load() // 設定読み込み
```

---

## 8. 環境変数と .env ファイル

### なぜ環境変数？

- 秘密情報（パスワード・API Key）をコードに書かない
- 開発/本番で違う値を使う（ポート番号・DB URL）

### 開発時：.env ファイル

```bash
# .env（Gitに入れない！）
PORT=8080
DATABASE_URL=postgres://user:pass@localhost/zerodelay?sslmode=disable
JWT_SECRET=my-secret-key
```

### 本番時：Railway/Heroku の環境変数設定画面

```
PORT=443
DATABASE_URL=postgres://prod-db-url
JWT_SECRET=super-secure-random-string
```

---

## 9. マイグレーション（DB テーブル作成）

### 役割：Model からテーブルを自動生成

### 手動SQL は書かない

```sql
-- NG：これを手で書くのは古い
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ...
);
```

### GORM AutoMigrate を使う

**internal/database/database.go:39-44**

```go
func (db *DB) AutoMigrate() error {
  return db.DB.AutoMigrate(
    &model.User{},
    &model.Place{},
    // ← Model を追加するだけ
  )
}
```

---

## 10. ルーティングの集約

### ミドルウェア + ルート群を一箇所で管理

**internal/router/router.go:11-43**

```go
func SetupRoutes(
  e *echo.Echo,
  healthHandler *handler.HealthHandler,
  userHandler *handler.UserHandler,
  placeHandler *handler.PlaceHandler,
) {
  // Middleware（全リクエストで実行）
  e.Use(middleware.Logger())       // ← アクセスログ
  e.Use(middleware.Recover())      // ← panic時に500を返す
  e.Use(middleware.CORS())         // ← フロントエンドからのアクセス許可

  // Health check
  e.GET("/health", healthHandler.Health)

  // API routes
  api := e.Group("/api")

  // User routes
  users := api.Group("/users")
  users.GET("", userHandler.GetAllUsers)
  users.GET("/:id", userHandler.GetUser)
  users.POST("", userHandler.CreateUser)
  users.PUT("/:id", userHandler.UpdateUser)
  users.DELETE("/:id", userHandler.DeleteUser)

  // Place routes
  places := api.Group("/places")
  places.GET("", placeHandler.GetAllPlaces)
  places.GET("/:id", placeHandler.GetPlace)
  places.POST("", placeHandler.CreatePlace)
  places.PUT("/:id", placeHandler.UpdatePlace)
  places.DELETE("/:id", placeHandler.DeletePlace)
}
```

### グルーピングで整理

- `/api/users` → ユーザー関連
- `/api/places` → 場所関連
- `/health` → ヘルスチェック

---

## 11. ミドルウェア（共通処理）

### 役割：全リクエストで実行する処理

- ログ出力
- エラー回復（panic防止）
- 認証チェック
- CORS設定

### Echo での設定

```go
// 全リクエストで実行
e.Use(middleware.Logger())       // アクセスログ
e.Use(middleware.Recover())      // panic時に500を返す
e.Use(middleware.CORS())         // フロントエンドからのアクセス許可
```

### 認証ミドルウェア（例）

```go
// 特定のルートだけに適用
api := e.Group("/api")
api.Use(authMiddleware) // ← /api/* は認証必須
api.POST("/users", uh.CreateUser)
```

---

## 12. ハンドラーの構造化（例：Health）

### 関数 → 構造体メソッド化

**internal/handler/health_handler.go:9-29**

```go
type Response struct {
  Message string `json:"message"`
  Status  string `json:"status"`
}

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
  return &HealthHandler{}
}

func (h *HealthHandler) Health(c echo.Context) error {
  response := Response{
    Message: "Backend is running",
    Status:  "ok",
  }
  return c.JSON(http.StatusOK, response)
}
```

### 目的

- テスト容易化
- 依存注入
- 拡張のしやすさ

---

## 13. バリデーション（入力検証）

### 役割：不正なデータを弾く

### Model にルールを書く

```go
type User struct {
  Name  string `json:"name" validate:"required,min=1,max=50"`
  Email string `json:"email" validate:"required,email"`
  Age   int    `json:"age" validate:"min=0,max=150"`
}
```

### Service で検証

```go
func (s *UserService) CreateUser(u *model.User) error {
  validate := validator.New()
  if err := validate.Struct(u); err != nil {
    return err // ← "Name is required" 等のエラー
  }
  return s.repo.Create(u)
}
```

### Handler でエラーを返す

```go
err := h.service.CreateUser(&user)
if err != nil {
  return c.JSON(400, map[string]string{"error": err.Error()})
}
```

---

## 新機能（例：Product）を足す最短手順

### 実装順序（依存の逆順：下から上へ）

1. **Model**：`internal/domain/model/product.go`
   ```go
   type Product struct {
     ID    uint   `gorm:"primaryKey" json:"id"`
     Name  string `gorm:"type:text" json:"name"`
     Price int    `gorm:"type:integer" json:"price"`
   }
   ```

2. **Repository IF**：`internal/domain/repository/product_repository.go`
   ```go
   type ProductRepository interface {
     Create(product *model.Product) error
     FindByID(id uint) (*model.Product, error)
     FindAll() ([]model.Product, error)
   }
   ```

3. **Repository 実装**：`internal/repository/product_repository.go`
   ```go
   type productRepository struct {
     db *gorm.DB
   }
   func (r *productRepository) Create(p *model.Product) error {
     return r.db.Create(p).Error
   }
   ```

4. **Service**：`internal/service/product_service.go`
   ```go
   type ProductService struct {
     productRepo repository.ProductRepository
   }
   func (s *ProductService) CreateProduct(p *model.Product) error {
     if p.Name == "" { return errors.New("name required") }
     if p.Price < 0 { return errors.New("price must be positive") }
     return s.productRepo.Create(p)
   }
   ```

5. **Handler**：`internal/handler/product_handler.go`
   ```go
   type ProductHandler struct {
     service *service.ProductService
   }
   func (h *ProductHandler) CreateProduct(c echo.Context) error {
     var p model.Product
     c.Bind(&p)
     err := h.service.CreateProduct(&p)
     if err != nil { return c.JSON(400, err.Error()) }
     return c.JSON(200, p)
   }
   ```

6. **Router**：`internal/router/router.go` にルート追加
   ```go
   products := api.Group("/products")
   products.POST("", productHandler.CreateProduct)
   ```

7. **main**：`cmd/server/main.go` で依存注入して配線
   ```go
   productRepo := repository.NewProductRepository(db.DB)
   productService := service.NewProductService(productRepo)
   productHandler := handler.NewProductHandler(productService)
   router.SetupRoutes(e, healthHandler, userHandler, placeHandler, productHandler)
   ```

8. **Database**：`internal/database/database.go` でマイグレーション追加
   ```go
   func (db *DB) AutoMigrate() error {
     return db.DB.AutoMigrate(
       &model.User{},
       &model.Place{},
       &model.Product{}, // ← 追加
     )
   }
   ```

---

## よくある質問

### Q1: Service と Repository を分ける理由？

**A**: データ取得手段（SQL/ORM/別DB）を差し替えても、ビジネスルールは不変 → 保守性/テスト性↑

### Q2: interface の効果？

**A**: Repoをモック化してService/HandlerをDBなしでテスト可能

### Q3: internal/ と pkg/ の違い？

**A**:
- `internal/` はプロジェクト私有（他のプロジェクトからimportできない）
- `pkg/` は外部公開可能な汎用パッケージ

### Q4: なぜ main.go を cmd/server/ に置く？

**A**:
- 複数のエントリポイント（CLIツール、ワーカー等）を持てる
- `cmd/server/`, `cmd/worker/`, `cmd/migrate/` のように分けられる

---

## チェックリスト（導入・追加時）

- [ ] model を定義（ID/型/タグ）
- [ ] repository IF/実装（DBエラーの扱い統一）
- [ ] service にビジネス検証（必須・値域・重複）
- [ ] handler でBind/Validate/HTTPコード整理
- [ ] router にルート追記（グループ活用）
- [ ] main で依存注入（Repo→Service→Handler）
- [ ] database でマイグレーション追加
- [ ] .env/Railway で PORT/DATABASE_URL/Secrets を設定

---

## まとめ：初心者が最初に押さえるべき順序

### 1. 理解の順序

1. **Model**：データの形を決める
2. **Repository interface**：「何ができるか」を決める
3. **Repository 実装**：GORM で DB 操作
4. **Service**：ビジネスルール（検証・計算）
5. **Handler**：HTTP 入出力
6. **Router**：URL とハンドラーを紐付け
7. **Config**：環境変数から設定読み込み
8. **main.go**：全部を配線して起動

### 2. この構造の最大の利点

- **テストが書ける**（モックで差し替え）
- **機能追加が定型作業**（上記1〜8を繰り返す）
- **チーム開発で衝突しにくい**（層ごとに分業）
- **責務が明確**（どこに何を書くか迷わない）
- **本番/開発の差替え容易**（環境変数だけ）

### 3. 分離の核

- **設定**（Config）
- **接続**（Database）
- **ルーティング**（Router）
- **層**（Handler/Service/Repository）

### 4. 効果

- 拡張容易
- テスト容易
- 責務明確
- 本番/開発の差替え容易

### 5. 運用

**定型のスキャフォールドで機能追加を繰り返すだけ（下層→上層の順で実装、main で配線）**

この型を守れば、機能追加の迷いが消え、破壊的変更が局所化します。

---

## 参考：主要ファイルの役割まとめ

| ファイル | 役割 |
|---------|------|
| `cmd/server/main.go` | エントリポイント。全体の配線（依存性注入）と起動 |
| `internal/config/config.go` | 環境変数からの設定読み込み |
| `internal/database/database.go` | DB接続・マイグレーション |
| `internal/domain/model/*.go` | データモデル定義 |
| `internal/domain/repository/*.go` | リポジトリインターフェース |
| `internal/repository/*.go` | リポジトリ実装（GORM使用） |
| `internal/service/*.go` | ビジネスロジック |
| `internal/handler/*.go` | HTTPハンドラー |
| `internal/router/router.go` | ルーティング設定 |
| `.env` | 環境変数（開発用、Gitに入れない） |
| `Dockerfile` | Docker イメージビルド設定 |

---

## API エンドポイント一覧

### Health Check

- `GET /health` - ヘルスチェック

### Users

- `GET /api/users` - 全ユーザー取得
- `GET /api/users/:id` - ユーザー取得
- `POST /api/users` - ユーザー作成
- `PUT /api/users/:id` - ユーザー更新
- `DELETE /api/users/:id` - ユーザー削除

### Places

- `GET /api/places` - 全場所取得
- `GET /api/places/:id` - 場所取得
- `POST /api/places` - 場所作成
- `PUT /api/places/:id` - 場所更新
- `DELETE /api/places/:id` - 場所削除

---

## 開発環境セットアップ

### 1. 環境変数設定

```bash
cp .env.example .env
# .env を編集してデータベースURLなどを設定
```

### 2. 依存関係インストール

```bash
go mod download
```

### 3. サーバー起動

```bash
go run cmd/server/main.go
```

### 4. 動作確認

```bash
curl http://localhost:8080/health
```