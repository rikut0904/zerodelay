package repository

import "zerodelay/internal/domain/model"

// PlaceRepository defines the interface for place data operations
type PlaceRepository interface {
	Create(place *model.Place) error
	FindByID(id uint) (*model.Place, error)
	FindAll() ([]model.Place, error)
	Update(place *model.Place) error
	Delete(id uint) error
}
