package service

import (
	"context"
	"errors"

	"zerodelay/internal/domain/model"
	"zerodelay/internal/domain/repository"
)

type AuthService struct {
	authRepo repository.AuthRepository
	userRepo repository.UserRepository
}

func NewAuthService(authRepo repository.AuthRepository, userRepo repository.UserRepository) *AuthService {
	return &AuthService{
		authRepo: authRepo,
		userRepo: userRepo,
	}
}

func (s *AuthService) SignUp(ctx context.Context, req *model.SignUpRequest) (*model.AuthResponse, error) {
	// 1. Firebase で認証ユーザーを作成
	authResp, err := s.authRepo.SignUp(ctx, req)
	if err != nil {
		return nil, err
	}

	// 2. PostgreSQL にユーザー情報を保存
	user := &model.User{
		FirebaseUID: authResp.LocalID,
		Email:       authResp.Email,
		// Name, NameKana, Old, Sex, Setting は初期値（空/ゼロ値）
	}

	if err := s.userRepo.Create(user); err != nil {
		// PostgreSQL保存失敗時もFirebaseユーザーは作成済み
		// ログを出力してエラーを返す
		return nil, errors.New("failed to create user in database: " + err.Error())
	}

	return authResp, nil
}

func (s *AuthService) Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error) {
	return s.authRepo.Login(ctx, req)
}

func (s *AuthService) VerifyIDToken(ctx context.Context, idToken string) (string, error) {
	return s.authRepo.VerifyIDToken(ctx, idToken)
}
