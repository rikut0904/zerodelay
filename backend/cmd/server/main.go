package main

import (
	"fmt"
	"log"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"

	"zerodelay/internal/config"
	"zerodelay/internal/database"
	"zerodelay/internal/handler"
	"zerodelay/internal/repository"
	"zerodelay/internal/router"
	"zerodelay/internal/service"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}
	// Load configuration
	cfg := config.Load()

	// Initialize Firebase
	firebaseAuth, err := config.InitFirebase()
	if err != nil {
		log.Fatalf("Failed to initialize Firebase: %v", err)
	}

	// Initialize database
	db, err := database.NewDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("Connected to database successfully")

	// Run auto migration
	if err := db.AutoMigrate(); err != nil {
		log.Fatalf("Failed to run auto migration: %v", err)
	}
	log.Println("Auto migration completed successfully")

	// Initialize repositories
	userRepo := repository.NewUserRepository(db.DB)
	placeRepo := repository.NewPlaceRepository(db.DB)
	authRepo := repository.NewAuthRepository(firebaseAuth)

	// Initialize services
	userService := service.NewUserService(userRepo, authRepo)
	placeService := service.NewPlaceService(placeRepo)
	authService := service.NewAuthService(authRepo, userRepo)

	// Initialize handlers
	healthHandler := handler.NewHealthHandler()
	userHandler := handler.NewUserHandler(userService)
	placeHandler := handler.NewPlaceHandler(placeService)
	authHandler := handler.NewAuthHandler(authService)

	// Initialize Echo
	e := echo.New()

	// Setup routes
	router.SetupRoutes(e, healthHandler, userHandler, placeHandler, authHandler, authService)

	// Start server
	port := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Server starting on port %s", port)
	if err := e.Start(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
