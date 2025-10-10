# ZeroDelay Application

Next.js + Go application with Docker

## Prerequisites

- Docker version 28.4.0 or higher
- Docker Compose

## Project Structure

```
zerodelay/
├── backend/          # Go backend
│   ├── main.go
│   ├── go.mod
│   └── Dockerfile
├── frontend/         # Next.js frontend
│   ├── src/
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Getting Started

### Build and run with Docker Compose

```bash
docker-compose up --build
```

### Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/hello` - Test API endpoint

## Development

### Backend (Go)

```bash
cd backend
go run main.go
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## Stop the application

```bash
docker-compose down
```

## Environment Versions

- Go: 1.25.2
- Node.js: 24.9.0
- npm: 11.6.0
- Next.js: 15.1.6
- Docker: 28.4.0
