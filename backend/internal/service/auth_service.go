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

	// 2. メール確認リンクを送信
	if err := s.authRepo.SendEmailVerification(ctx, authResp.IDToken); err != nil {
		// メール送信失敗してもユーザー作成は続行
		// エラーログは既にRepository層で出力済み
	}

	// 3. PostgreSQL にユーザー情報を保存
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

	// 4. レスポンスにユーザー情報を追加
	authResp.User = user

	return authResp, nil
}

func (s *AuthService) Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error) {
	// 1. Firebase で認証
	authResp, err := s.authRepo.Login(ctx, req)
	if err != nil {
		return nil, err
	}

	// 2. メールアドレスが確認済みかチェック
	user, err := s.authRepo.GetUser(ctx, authResp.LocalID)
	if err != nil {
		return nil, errors.New("failed to get user information")
	}

	if !user.EmailVerified {
		return nil, errors.New("email not verified. Please check your email and verify your account")
	}

	// 3. PostgreSQL からユーザー情報を取得
	dbUser, err := s.userRepo.FindByFirebaseUID(authResp.LocalID)
	if err != nil {
		// ユーザーが見つからない場合は警告ログを出して続行
		// （Firebase認証は成功しているため）
		return authResp, nil
	}

	// 4. レスポンスにユーザー情報を追加
	authResp.User = dbUser

	return authResp, nil
}

func (s *AuthService) VerifyIDToken(ctx context.Context, idToken string) (string, error) {
	return s.authRepo.VerifyIDToken(ctx, idToken)
}

func (s *AuthService) IsEmailVerified(ctx context.Context, uid string) (bool, error) {
	user, err := s.authRepo.GetUser(ctx, uid)
	if err != nil {
		return false, err
	}
	return user.EmailVerified, nil
}
