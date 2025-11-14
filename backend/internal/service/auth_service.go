package service

import (
	"context"

	"zerodelay/internal/domain/model"
	"zerodelay/internal/domain/repository"
)

type AuthService struct {
	authRepo repository.AuthRepository
}

func NewAuthService(authRepo repository.AuthRepository) *AuthService {
	return &AuthService{authRepo: authRepo}
}

func (s *AuthService) SignUp(ctx context.Context, req *model.SignUpRequest) (*model.AuthResponse, error) {
	return s.authRepo.SignUp(ctx, req)
}

func (s *AuthService) Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error) {
	return s.authRepo.Login(ctx, req)
}

func (s *AuthService) VerifyIDToken(ctx context.Context, idToken string) (string, error) {
	return s.authRepo.VerifyIDToken(ctx, idToken)
}
