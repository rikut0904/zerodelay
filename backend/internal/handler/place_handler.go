package handler

import (
<<<<<<< HEAD
=======
	"errors"
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"

	"zerodelay/internal/domain/model"
	"zerodelay/internal/service"
)

// PlaceHandler handles HTTP requests for places
type PlaceHandler struct {
	placeService *service.PlaceService
}

// NewPlaceHandler creates a new place handler
func NewPlaceHandler(placeService *service.PlaceService) *PlaceHandler {
	return &PlaceHandler{placeService: placeService}
}

// CreatePlace handles POST /api/places
func (h *PlaceHandler) CreatePlace(c echo.Context) error {
	var place model.Place
	if err := c.Bind(&place); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	if err := h.placeService.CreatePlace(&place); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, place)
}

// GetPlace handles GET /api/places/:id
func (h *PlaceHandler) GetPlace(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid place ID"})
	}

	place, err := h.placeService.GetPlace(uint(id))
	if err != nil {
<<<<<<< HEAD
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Place not found"})
=======
		if errors.Is(err, service.ErrPlaceNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Place not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
	}

	return c.JSON(http.StatusOK, place)
}

// GetAllPlaces handles GET /api/places
func (h *PlaceHandler) GetAllPlaces(c echo.Context) error {
	places, err := h.placeService.GetAllPlaces()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, places)
}

// UpdatePlace handles PUT /api/places/:id
func (h *PlaceHandler) UpdatePlace(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid place ID"})
	}

	var place model.Place
	if err := c.Bind(&place); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	place.ID = uint(id)

	if err := h.placeService.UpdatePlace(&place); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, place)
}

// DeletePlace handles DELETE /api/places/:id
func (h *PlaceHandler) DeletePlace(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid place ID"})
	}

	if err := h.placeService.DeletePlace(uint(id)); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Place deleted successfully"})
}
