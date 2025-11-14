package handler

import (
"net/http"

"github.com/labstack/echo/v4"

"zerodelay/internal/domain/model"
"zerodelay/internal/service"
)

type MapHandler struct {
mapService *service.MapService
}

func NewMapHandler(mapService *service.MapService) *MapHandler {
return &MapHandler{mapService: mapService}
}

// GetMapPlaces handles GET /api/map/places
func (h *MapHandler) GetMapPlaces(c echo.Context) error {
places, err := h.mapService.GetAllMapPlaces()
if err != nil {
return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
}

return c.JSON(http.StatusOK, places)
}

// GetPlacesInBounds handles POST /api/map/places/bounds
func (h *MapHandler) GetPlacesInBounds(c echo.Context) error {
var bounds model.MapBounds
if err := c.Bind(&bounds); err != nil {
return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
}

places, err := h.mapService.GetPlacesInBounds(&bounds)
if err != nil {
return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
}

return c.JSON(http.StatusOK, places)
}
