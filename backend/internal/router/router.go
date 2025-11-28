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

	// Health check (outside of API versioning)
	e.GET("/health", healthHandler.Health)

	// API v1
	v1 := e.Group("/api/v1")

	// Auth routes (public)
	auth := v1.Group("/auth")
	auth.POST("/signup", authHandler.SignUp)
	auth.POST("/login", authHandler.Login)

	// Protected auth routes (require authentication)
	auth.POST("/logout", authHandler.Logout, custommiddleware.FirebaseAuthMiddleware(authService))

	// Protected API routes (require authentication)
	v1.Use(custommiddleware.FirebaseAuthMiddleware(authService))

	// User routes
	users := v1.Group("/users")
	users.GET("", userHandler.GetAllUsers)
	users.GET("/:id", userHandler.GetUser)
	users.POST("", userHandler.CreateUser)
	users.PUT("/:id", userHandler.UpdateUser)
	users.DELETE("/:id", userHandler.DeleteUser)

	// Place routes
	places := v1.Group("/places")
	places.GET("", placeHandler.GetAllPlaces)
	places.GET("/:id", placeHandler.GetPlace)
	places.POST("", placeHandler.CreatePlace)
	places.PUT("/:id", placeHandler.UpdatePlace)
	places.DELETE("/:id", placeHandler.DeletePlace)
}
