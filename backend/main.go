package main

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
)

type Response struct {
	Message string `json:"message"`
	Status  string `json:"status"`
}

func healthHandler(c echo.Context) error {
	response := Response{
		Message: "Backend is running",
		Status:  "ok",
	}
	return c.JSON(http.StatusOK, response)
}

func apiHandler(c echo.Context) error {
	response := Response{
		Message: "Hello from Go backend!",
		Status:  "success",
	}
	return c.JSON(http.StatusOK, response)
}

func main() {
	e := echo.New()

	// Routes
	e.GET("/health", healthHandler)
	e.GET("/api/hello", apiHandler)

	port := ":8080"
	log.Printf("Server starting on port %s", port)
	if err := e.Start(port); err != nil {
		log.Fatal(err)
	}
}
