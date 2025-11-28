package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	fbauth "firebase.google.com/go/v4/auth"
	"github.com/joho/godotenv"

	"zerodelay/internal/domain/model"
)

const (
	firebaseAuthBaseURL = "https://identitytoolkit.googleapis.com/v1"
	signUpEndpoint      = "/accounts:signUp"
	signInEndpoint      = "/accounts:signInWithPassword"
)

type authRepository struct {
	firebaseAuth *fbauth.Client
	apiKey       string
	baseURL      string
}

func NewAuthRepository(firebaseAuth *fbauth.Client) *authRepository {
	if err := godotenv.Load(); err != nil {
		log.Printf("[WARN] Failed to load .env file: %v", err)
	}
	apiKey := os.Getenv("FIREBASE_API_KEY")
	if apiKey == "" {
		log.Println("[WARN] FIREBASE_API_KEY is not set in .env file")
	}

	return &authRepository{
		firebaseAuth: firebaseAuth,
		apiKey:       apiKey,
		baseURL:      firebaseAuthBaseURL,
	}
}

func (r *authRepository) callFirebaseAuthAPI(ctx context.Context, endpoint string, payload map[string]string) (*model.AuthResponse, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[ERROR] Failed to marshal request payload: %v", err)
		return nil, fmt.Errorf("failed to marshal request payload: %w", err)
	}

	url := fmt.Sprintf("%s%s?key=%s", r.baseURL, endpoint, r.apiKey)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		log.Printf("[ERROR] Failed to create HTTP request: %v", err)
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[ERROR] Failed to communicate with Firebase: %v", err)
		return nil, fmt.Errorf("failed to communicate with Firebase: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("[ERROR] Failed to read response body: %v", err)
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var fbErr model.FirebaseError
		if err := json.Unmarshal(respBody, &fbErr); err != nil {
			log.Printf("[ERROR] Failed to parse Firebase error response: %v", err)
			return nil, fmt.Errorf("firebase request failed with status %d", resp.StatusCode)
		}
		log.Printf("[ERROR] Firebase API error: %s", fbErr.Error.Message)
		return nil, fmt.Errorf("firebase error: %s", fbErr.Error.Message)
	}

	var authResp model.AuthResponse
	if err := json.Unmarshal(respBody, &authResp); err != nil {
		log.Printf("[ERROR] Failed to parse auth response: %v", err)
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &authResp, nil
}

func (r *authRepository) SignUp(ctx context.Context, req *model.SignUpRequest) (*model.AuthResponse, error) {
	payload := map[string]string{
		"email":             req.Email,
		"password":          req.Password,
		"returnSecureToken": "true",
	}

	log.Printf("[DEBUG] Attempting to sign up user: %s", req.Email)
	resp, err := r.callFirebaseAuthAPI(ctx, signUpEndpoint, payload)
	if err != nil {
		log.Println("[INFO] Sign up failed")
		return nil, err
	}

	log.Println("[INFO] Sign up successful")
	log.Printf("[DEBUG] Signed up user: %s", req.Email)
	return resp, nil
}

func (r *authRepository) Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error) {
	payload := map[string]string{
		"email":             req.Email,
		"password":          req.Password,
		"returnSecureToken": "true",
	}

	log.Printf("[DEBUG] Attempting to login user: %s", req.Email)
	resp, err := r.callFirebaseAuthAPI(ctx, signInEndpoint, payload)
	if err != nil {
		log.Println("[INFO] Login failed")
		return nil, err
	}

	log.Println("[INFO] Login successful")
	log.Printf("[DEBUG] Logged in user: %s", req.Email)
	return resp, nil
}

func (r *authRepository) VerifyIDToken(ctx context.Context, idToken string) (string, error) {
	token, err := r.firebaseAuth.VerifyIDToken(ctx, idToken)
	if err != nil {
		log.Printf("[ERROR] Failed to verify ID token: %v", err)
		return "", fmt.Errorf("invalid or expired ID token: %w", err)
	}
	log.Println("[INFO] Token verification successful")
	log.Printf("[DEBUG] Verified token for UID: %s", token.UID)
	return token.UID, nil
}

func (r *authRepository) UpdateEmail(ctx context.Context, uid string, newEmail string) error {
	params := (&fbauth.UserToUpdate{}).Email(newEmail)
	_, err := r.firebaseAuth.UpdateUser(ctx, uid, params)
	if err != nil {
		log.Printf("[ERROR] Failed to update email in Firebase: %v", err)
		return fmt.Errorf("failed to update email in Firebase: %w", err)
	}
	log.Printf("[INFO] Email updated successfully in Firebase for UID: %s", uid)
	return nil
}
