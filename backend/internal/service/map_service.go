package service

import (
"strconv"
"zerodelay/internal/domain/model"
"zerodelay/internal/domain/repository"
)

type MapService struct {
placeRepo repository.PlaceRepository
}

func NewMapService(placeRepo repository.PlaceRepository) *MapService {
return &MapService{placeRepo: placeRepo}
}

// GetPlacesInBounds returns all places within the specified geographical bounds
func (s *MapService) GetPlacesInBounds(bounds *model.MapBounds) ([]model.MapPlace, error) {
places, err := s.placeRepo.FindAll()
if err != nil {
return nil, err
}

var mapPlaces []model.MapPlace
for _, place := range places {
lat, err := strconv.ParseFloat(place.Lat, 64)
if err != nil {
continue
}
lon, err := strconv.ParseFloat(place.Lon, 64)
if err != nil {
continue
}

if lat >= bounds.SouthLat && lat <= bounds.NorthLat &&
lon >= bounds.WestLon && lon <= bounds.EastLon {
mapPlaces = append(mapPlaces, model.MapPlace{
ID:       place.ID,
Name:     place.Name,
NameKana: place.NameKana,
Address:  place.Address,
Lat:      lat,
Lon:      lon,
URL:      place.URL,
Tel:      place.Tel,
})
}
}

return mapPlaces, nil
}

// GetAllMapPlaces returns all places formatted for map display
func (s *MapService) GetAllMapPlaces() ([]model.MapPlace, error) {
places, err := s.placeRepo.FindAll()
if err != nil {
return nil, err
}

var mapPlaces []model.MapPlace
for _, place := range places {
lat, err := strconv.ParseFloat(place.Lat, 64)
if err != nil {
continue
}
lon, err := strconv.ParseFloat(place.Lon, 64)
if err != nil {
continue
}

mapPlaces = append(mapPlaces, model.MapPlace{
ID:       place.ID,
Name:     place.Name,
NameKana: place.NameKana,
Address:  place.Address,
Lat:      lat,
Lon:      lon,
URL:      place.URL,
Tel:      place.Tel,
})
}

return mapPlaces, nil
}
