package main

import (
	"fmt"
	"log"

<<<<<<< HEAD
=======
	"github.com/joho/godotenv"
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
	"github.com/labstack/echo/v4"

	"zerodelay/internal/config"
	"zerodelay/internal/database"
	"zerodelay/internal/handler"
	"zerodelay/internal/repository"
	"zerodelay/internal/router"
	"zerodelay/internal/service"
)

func main() {
<<<<<<< HEAD
=======
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
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
