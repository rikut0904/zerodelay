package auth

import (
	"context"
	"log"

	"firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var FirebaseAuth *auth.Client

//InitFirebaseはFirebase Admin SDKを初期化し、Authクライアントを設定します。

func InitFirebase() {
	//serviceAccountKey.jsonはFirebaseコンソールから取得する秘密鍵ファイル
	opt := option.WithCredentialsFile("serviceAccountKey.json")

	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalf("error initializing firebase app: %v\n", err)
	}

	authClient, err := app.Auth(context.Background())
	if err != nil {
		log.Fatalf("error getting Auth client: %v\n", err)
	}

	FirebaseAuth = authClient
	log.Println("Firebase initialized successfully")
}