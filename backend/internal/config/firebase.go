package config

import (
	"context"
	"fmt"
	"log"

	"firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

const (
	DefaultCredentialsFile = "serviceAccountKey.json"
)

func InitFirebase() (*auth.Client, error) {
	return InitFirebaseWithCredentials(DefaultCredentialsFile)
}

func InitFirebaseWithCredentials(credentialsFile string) (*auth.Client, error) {
	opt := option.WithCredentialsFile(credentialsFile)

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
