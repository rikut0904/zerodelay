package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	fbauth "firebase.google.com/go/v4/auth"
	"github.com/joho/godotenv"

	"zerodelay/internal/domain/model"
)

type authRepository struct {
	firebaseAuth *fbauth.Client
	apiKey       string
}

func NewAuthRepository(firebaseAuth *fbauth.Client) *authRepository {
	_ = godotenv.Load()
	apiKey := os.Getenv("FIREBASE_API_KEY")
	if apiKey == "" {
		fmt.Println("Warning: FIREBASE_API_KEY is not set in .env file")
	}

	return &authRepository{
		firebaseAuth: firebaseAuth,
		apiKey:       apiKey,
	}
}

func (r *authRepository) SignUp(ctx context.Context, req *model.SignUpRequest) (*model.AuthResponse, error) {
	payload := map[string]string{
		"email":             req.Email,
		"password":          req.Password,
		"returnSecureToken": "true",
	}

	body, _ := json.Marshal(payload)
	resp, err := http.Post(
		fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=%s", r.apiKey),
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to communicate with Firebase: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		var fbErr model.FirebaseError
		_ = json.Unmarshal(respBody, &fbErr)
		return nil, fmt.Errorf("firebase error: %s", fbErr.Error.Message)
	}

	var authResp model.AuthResponse
	if err := json.Unmarshal(respBody, &authResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &authResp, nil
}

func (r *authRepository) Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error) {
	payload := map[string]string{
		"email":             req.Email,
		"password":          req.Password,
		"returnSecureToken": "true",
	}

	body, _ := json.Marshal(payload)
	resp, err := http.Post(
		fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=%s", r.apiKey),
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to communicate with Firebase: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		var fbErr model.FirebaseError
		_ = json.Unmarshal(respBody, &fbErr)
		return nil, fmt.Errorf("firebase error: %s", fbErr.Error.Message)
	}

	var authResp model.AuthResponse
	if err := json.Unmarshal(respBody, &authResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &authResp, nil
}

func (r *authRepository) VerifyIDToken(ctx context.Context, idToken string) (string, error) {
	token, err := r.firebaseAuth.VerifyIDToken(ctx, idToken)
	if err != nil {
		return "", fmt.Errorf("invalid or expired ID token: %w", err)
	}
	return token.UID, nil
}
