package router

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"zerodelay/internal/handler"
	custommiddleware "zerodelay/internal/middleware"
	"zerodelay/internal/service"
)

// SetupRoutes configures all application routes
func SetupRoutes(
	e *echo.Echo,
	healthHandler *handler.HealthHandler,
	userHandler *handler.UserHandler,
	placeHandler *handler.PlaceHandler,
	authHandler *handler.AuthHandler,
	authService *service.AuthService,
) {
	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Health check
	e.GET("/health", healthHandler.Health)

	// Auth routes
	e.POST("/signup", authHandler.SignUp)
	e.POST("/login", authHandler.Login)

	// Protected API routes
	api := e.Group("/api")
	api.Use(custommiddleware.FirebaseAuthMiddleware(authService))

	// User routes
	users := api.Group("/users")
	users.GET("", userHandler.GetAllUsers)
	users.GET("/:id", userHandler.GetUser)
	users.POST("", userHandler.CreateUser)
	users.PUT("/:id", userHandler.UpdateUser)
	users.DELETE("/:id", userHandler.DeleteUser)

	// Place routes
	places := api.Group("/places")
	places.GET("", placeHandler.GetAllPlaces)
	places.GET("/:id", placeHandler.GetPlace)
	places.POST("", placeHandler.CreatePlace)
	places.PUT("/:id", placeHandler.UpdatePlace)
	places.DELETE("/:id", placeHandler.DeletePlace)
}
