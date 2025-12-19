package repository

import "zerodelay/internal/domain/model"

// UserRepository defines the interface for user data operations
type UserRepository interface {
	Create(user *model.User) error
	FindByID(id uint) (*model.User, error)
	FindByFirebaseUID(firebaseUID string) (*model.User, error)
	FindByEmail(email string) (*model.User, error)
	FindAll() ([]model.User, error)
	Update(user *model.User) error
	Delete(id uint) error
}
