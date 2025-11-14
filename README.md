# ZeroDelay Application

本アプリケーションは金沢工業大学工学部情報工学科2年PD実践のEP-F5班で制作しているアプリケーションです。本アプリケーションは金沢市の「水害に備えて～ハザードマップを活用した自主防災～」というテーマを解決するために、金沢市ハザードマップを簡単にWebサイトで閲覧することができ、パーソナライズされたアプリケーションを開発しています。

## 前提条件

- Go: 1.25.2
- Node.js: 24.9.0
- npm: 11.6.0
- Next.js: 15.1.6
- Docker: 28.4.0

## ディレクトリ構成

```
zerodelay/
├── backend/          # バックエンド（Go）
│   ├── main.go
│   ├── go.mod
│   └── Dockerfile
├── frontend/         # フロントエンド(Next.js)
│   ├── src/
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## 実行方法

### Docker Compose（結合テスト）

```bash
docker-compose up --build
```

### Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### API Endpoints

- `GET /health`

## 開発

### バックエンド実行方法（Go）

```bash
cd backend
go run main.go
```

### フロントエンド実行方法 (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## 文書情報

**最終更新**:2025年10月24日
**作成者**:平田陸翔
**バージョン**:v1.0.1