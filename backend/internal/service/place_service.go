package service

import (
	"errors"

	"gorm.io/gorm"

	"zerodelay/internal/domain/model"
	"zerodelay/internal/domain/repository"
)

var ErrPlaceNotFound = errors.New("place not found")

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
	place, err := s.placeRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPlaceNotFound
		}
		return nil, err
	}
	return place, nil
}

func (s *PlaceService) GetAllPlaces() ([]model.Place, error) {
	return s.placeRepo.FindAll()
}

func (s *PlaceService) UpdatePlace(place *model.Place) error {
	// Check if place exists
	_, err := s.placeRepo.FindByID(place.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPlaceNotFound
		}
		return err
	}
	return s.placeRepo.Update(place)
}

func (s *PlaceService) DeletePlace(id uint) error {
	// Check if place exists
	_, err := s.placeRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPlaceNotFound
		}
		return err
	}
	return s.placeRepo.Delete(id)
}
