package repository

import (
	"gorm.io/gorm"

	"zerodelay/internal/domain/model"
	"zerodelay/internal/domain/repository"
)

type placeRepository struct {
	db *gorm.DB
}

// NewPlaceRepository creates a new place repository
func NewPlaceRepository(db *gorm.DB) repository.PlaceRepository {
	return &placeRepository{db: db}
}

func (r *placeRepository) Create(place *model.Place) error {
	return r.db.Create(place).Error
}

func (r *placeRepository) FindByID(id uint) (*model.Place, error) {
	var place model.Place
	if err := r.db.First(&place, id).Error; err != nil {
		return nil, err
	}
	return &place, nil
}

func (r *placeRepository) FindAll() ([]model.Place, error) {
	var places []model.Place
	if err := r.db.Find(&places).Error; err != nil {
		return nil, err
	}
	return places, nil
}

func (r *placeRepository) Update(place *model.Place) error {
	return r.db.Save(place).Error
}

func (r *placeRepository) Delete(id uint) error {
	return r.db.Delete(&model.Place{}, id).Error
}
