package service

import (
	"zerodelay/internal/domain/model"
	"zerodelay/internal/domain/repository"
)

// PlaceService handles business logic for places
type PlaceService struct {
	placeRepo repository.PlaceRepository
}

// NewPlaceService creates a new place service
func NewPlaceService(placeRepo repository.PlaceRepository) *PlaceService {
	return &PlaceService{placeRepo: placeRepo}
}

func (s *PlaceService) CreatePlace(place *model.Place) error {
	return s.placeRepo.Create(place)
}

func (s *PlaceService) GetPlace(id uint) (*model.Place, error) {
	return s.placeRepo.FindByID(id)
}

func (s *PlaceService) GetAllPlaces() ([]model.Place, error) {
	return s.placeRepo.FindAll()
}

func (s *PlaceService) UpdatePlace(place *model.Place) error {
	return s.placeRepo.Update(place)
}

func (s *PlaceService) DeletePlace(id uint) error {
	return s.placeRepo.Delete(id)
}
