package service

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"

	"zerodelay/internal/domain/model"
	"zerodelay/internal/domain/repository"
)

var ErrUserNotFound = errors.New("user not found")

// UserService handles business logic for users
type UserService struct {
	userRepo repository.UserRepository
	authRepo repository.AuthRepository
}

// NewUserService creates a new user service
func NewUserService(userRepo repository.UserRepository, authRepo repository.AuthRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
		authRepo: authRepo,
	}
}

func (s *UserService) CreateUser(user *model.User) error {
	return s.userRepo.Create(user)
}

func (s *UserService) GetUser(id uint) (*model.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return user, nil
}

func (s *UserService) GetAllUsers() ([]model.User, error) {
	return s.userRepo.FindAll()
}

func (s *UserService) UpdateUser(user *model.User) error {
	// Check if user exists
	_, err := s.userRepo.FindByID(user.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return err
	}
	return s.userRepo.Update(user)
}

func (s *UserService) DeleteUser(id uint) error {
	// Check if user exists
	_, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return err
	}
	return s.userRepo.Delete(id)
}

func (s *UserService) UpdateProfile(ctx context.Context, firebaseUID string, req *model.UpdateProfileRequest) (*model.User, error) {
	// 1. FirebaseUIDでユーザーを取得
	user, err := s.userRepo.FindByFirebaseUID(firebaseUID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// 2. 部分更新：送信されたフィールドのみ更新
	isFirstAgeInput := false
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.NameKana != nil {
		user.NameKana = *req.NameKana
	}
	if req.Old != nil {
		// 初回の年齢入力判定（前回が0の場合）
		if user.Old == 0 {
			isFirstAgeInput = true
		}
		user.Old = *req.Old
	}
	if req.Sex != nil {
		user.Sex = *req.Sex
	}

	// 3. Email更新時はFirebaseも同期
	if req.Email != nil && *req.Email != user.Email {
		if err := s.authRepo.UpdateEmail(ctx, firebaseUID, *req.Email); err != nil {
			return nil, fmt.Errorf("failed to update email in Firebase: %w", err)
		}
		user.Email = *req.Email
	}

	// 4. Setting初期化またはマージ
	if user.Setting == nil {
		user.Setting = model.JSON{}
	}

	// 5. 初回の年齢入力時は、自動的にフォントサイズを設定
	if isFirstAgeInput {
		defaultFontSize := model.GetDefaultFontSizeByAge(user.Old)
		user.Setting["font_size"] = string(defaultFontSize)
	}

	// 6. Setting更新時はマージ
	if req.Setting != nil {
		// 既存Settingと新規Settingをマージ
		for key, value := range req.Setting {
			user.Setting[key] = value
		}
	}

	// 7. PostgreSQLに保存
	if err := s.userRepo.Update(user); err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return user, nil
}

// UpdateFontSize updates the font size setting for a user
func (s *UserService) UpdateFontSize(ctx context.Context, firebaseUID string, fontSize model.FontSizeOption) (*model.User, error) {
	// 1. FirebaseUIDでユーザーを取得
	user, err := s.userRepo.FindByFirebaseUID(firebaseUID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// 2. Settingを初期化または取得
	if user.Setting == nil {
		user.Setting = model.JSON{}
	}

	// 3. font_sizeを更新
	user.Setting["font_size"] = string(fontSize)

	// 4. PostgreSQLに保存
	if err := s.userRepo.Update(user); err != nil {
		return nil, fmt.Errorf("failed to update font size: %w", err)
	}

	return user, nil
}
