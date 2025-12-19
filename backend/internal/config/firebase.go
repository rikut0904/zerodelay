package config

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"

	"firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

const (
	DefaultCredentialsFile = "serviceAccountKey.json"

	envCredentialsJSON     = "FIREBASE_CREDENTIALS_JSON"
)

func InitFirebase() (*auth.Client, error) {
	opt, err := selectCredentialOption()
	if err != nil {
		return nil, err
	}
	return initFirebaseWithOption(opt)
}

func InitFirebaseWithCredentials(credentialsFile string) (*auth.Client, error) {
	return initFirebaseWithOption(option.WithCredentialsFile(credentialsFile))
}

func initFirebaseWithOption(opt option.ClientOption) (*auth.Client, error) {
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Printf("[ERROR] Failed to initialize Firebase app: %v", err)
		return nil, fmt.Errorf("failed to initialize Firebase app: %w", err)
	}

	authClient, err := app.Auth(context.Background())
	if err != nil {
		log.Printf("[ERROR] Failed to get Firebase Auth client: %v", err)
		return nil, fmt.Errorf("failed to get Firebase Auth client: %w", err)
	}

	log.Println("[INFO] Firebase initialized successfully")
	return authClient, nil
}

func selectCredentialOption() (option.ClientOption, error) {
	if rawJSON := strings.TrimSpace(os.Getenv(envCredentialsJSON)); rawJSON != "" {
		log.Println("[INFO] Using Firebase credentials from FIREBASE_CREDENTIALS_JSON")
		return option.WithCredentialsJSON([]byte(rawJSON)), nil
	}

	if _, err := os.Stat(DefaultCredentialsFile); errors.Is(err, os.ErrNotExist) {
		return nil, fmt.Errorf("credentials not found: set %s or mount %s",
			envCredentialsJSON, DefaultCredentialsFile)
	}

	log.Println("[INFO] Using default Firebase credentials file:", DefaultCredentialsFile)
	return option.WithCredentialsFile(DefaultCredentialsFile), nil
}
