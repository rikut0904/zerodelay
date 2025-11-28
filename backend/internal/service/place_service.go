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
var ErrPlaceNotFound = errors.New("place not found")

>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
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
<<<<<<< HEAD
	return s.placeRepo.FindByID(id)
=======
	place, err := s.placeRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPlaceNotFound
		}
		return nil, err
	}
	return place, nil
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
}

func (s *PlaceService) GetAllPlaces() ([]model.Place, error) {
	return s.placeRepo.FindAll()
}

func (s *PlaceService) UpdatePlace(place *model.Place) error {
<<<<<<< HEAD
=======
	// Check if place exists
	_, err := s.placeRepo.FindByID(place.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPlaceNotFound
		}
		return err
	}
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
	return s.placeRepo.Update(place)
}

func (s *PlaceService) DeletePlace(id uint) error {
<<<<<<< HEAD
=======
	// Check if place exists
	_, err := s.placeRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPlaceNotFound
		}
		return err
	}
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
	return s.placeRepo.Delete(id)
}
