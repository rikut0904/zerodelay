package main

import (
	"log"
	"net/http"

	"zerodelay/auth"

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

func main() {

	auth.InitFirebase()

	e := echo.New()

	// Routes
	e.GET("/health", healthHandler)

	e.POST("/signup", auth.SignUpHandler)
	e.POST("/login", auth.LoginHandler)

	// Protected routes
	api := e.Group("/api")
	api.Use(auth.FirebaseAuthMiddleware)

	port := ":8080"
	log.Printf("Server starting on port %s", port)
	if err := e.Start(port); err != nil {
		log.Fatal(err)
	}
}
