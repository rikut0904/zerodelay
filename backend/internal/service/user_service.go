package service

import (
	"zerodelay/internal/domain/model"
	"zerodelay/internal/domain/repository"
)

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
	return s.userRepo.FindByID(id)
}

func (s *UserService) GetAllUsers() ([]model.User, error) {
	return s.userRepo.FindAll()
}

func (s *UserService) UpdateUser(user *model.User) error {
	return s.userRepo.Update(user)
}

func (s *UserService) DeleteUser(id uint) error {
	return s.userRepo.Delete(id)
}
