package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Response struct {
	Message string `json:"message"`
	Status  string `json:"status"`
}

// HealthHandler handles health check requests
type HealthHandler struct{}

// NewHealthHandler creates a new health handler
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// Health handles GET /health
func (h *HealthHandler) Health(c echo.Context) error {
	response := Response{
		Message: "Backend is running",
		Status:  "ok",
	}
	return c.JSON(http.StatusOK, response)
}
