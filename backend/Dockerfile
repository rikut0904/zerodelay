# Build stage
FROM golang:1.25.2-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# Run stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .
# Copy Firebase credentials (if present) for DefaultCredentialsFile usage
COPY --from=builder /app/serviceAccountKey.json ./serviceAccountKey.json

EXPOSE 8080

CMD ["./main"]
