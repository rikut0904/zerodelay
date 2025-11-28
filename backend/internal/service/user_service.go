package service

import (
<<<<<<< HEAD
=======
	"errors"

	"gorm.io/gorm"

>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
	"zerodelay/internal/domain/model"
	"zerodelay/internal/domain/repository"
)

<<<<<<< HEAD
=======
var ErrUserNotFound = errors.New("user not found")

>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
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
<<<<<<< HEAD
	return s.userRepo.FindByID(id)
=======
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return user, nil
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
}

func (s *UserService) GetAllUsers() ([]model.User, error) {
	return s.userRepo.FindAll()
}

func (s *UserService) UpdateUser(user *model.User) error {
<<<<<<< HEAD
=======
	// Check if user exists
	_, err := s.userRepo.FindByID(user.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return err
	}
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
	return s.userRepo.Update(user)
}

func (s *UserService) DeleteUser(id uint) error {
<<<<<<< HEAD
=======
	// Check if user exists
	_, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return err
	}
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
	return s.userRepo.Delete(id)
}
