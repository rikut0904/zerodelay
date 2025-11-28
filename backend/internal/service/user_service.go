package service

import (
	"errors"

	"gorm.io/gorm"

	"zerodelay/internal/domain/model"
	"zerodelay/internal/domain/repository"
)

var ErrUserNotFound = errors.New("user not found")

// UserService handles business logic for users
type UserService struct {
	userRepo repository.UserRepository
}

// NewUserService creates a new user service
func NewUserService(userRepo repository.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
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
