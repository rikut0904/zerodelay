package repository

import (
	"context"

	fbauth "firebase.google.com/go/v4/auth"

	"zerodelay/internal/domain/model"
)

type AuthRepository interface {
	SignUp(ctx context.Context, req *model.SignUpRequest) (*model.AuthResponse, error)
	Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error)
	VerifyIDToken(ctx context.Context, idToken string) (string, error)
	UpdateEmail(ctx context.Context, uid string, newEmail string) error
	DeleteUser(ctx context.Context, uid string) error
	SendEmailVerification(ctx context.Context, idToken string) error
	GetUser(ctx context.Context, uid string) (*fbauth.UserRecord, error)
}
