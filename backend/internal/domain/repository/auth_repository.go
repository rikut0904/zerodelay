package repository

import (
	"context"

	"zerodelay/internal/domain/model"
)

type AuthRepository interface {
	SignUp(ctx context.Context, req *model.SignUpRequest) (*model.AuthResponse, error)
	Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error)
	VerifyIDToken(ctx context.Context, idToken string) (string, error)
	UpdateEmail(ctx context.Context, uid string, newEmail string) error
}
