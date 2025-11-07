package main

import (
	"fmt"
	"log"

	"github.com/labstack/echo/v4"

	"zerodelay/internal/config"
	"zerodelay/internal/database"
	"zerodelay/internal/handler"
	"zerodelay/internal/repository"
	"zerodelay/internal/router"
	"zerodelay/internal/service"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.NewDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("Connected to database successfully")

	// Initialize repositories
	userRepo := repository.NewUserRepository(db.DB)
	placeRepo := repository.NewPlaceRepository(db.DB)

	// Initialize services
	userService := service.NewUserService(userRepo)
	placeService := service.NewPlaceService(placeRepo)

	// Initialize handlers
	healthHandler := handler.NewHealthHandler()
	userHandler := handler.NewUserHandler(userService)
	placeHandler := handler.NewPlaceHandler(placeService)

	// Initialize Echo
	e := echo.New()

	// Setup routes
	router.SetupRoutes(e, healthHandler, userHandler, placeHandler)

	// Start server
	port := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Server starting on port %s", port)
	if err := e.Start(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
