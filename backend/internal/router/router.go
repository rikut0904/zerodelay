package router

import (
	"os"
	"strings"

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
	e.Use(middleware.CORSWithConfig(buildCORSConfig()))

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
	users.PATCH("/me", userHandler.UpdateProfile) // プロフィール更新（自分自身）

	// Place routes
	places := v1.Group("/places")
	places.GET("", placeHandler.GetAllPlaces)
	places.GET("/:id", placeHandler.GetPlace)
	places.POST("", placeHandler.CreatePlace)
	places.PUT("/:id", placeHandler.UpdatePlace)
	places.DELETE("/:id", placeHandler.DeletePlace)
}

func buildCORSConfig() middleware.CORSConfig {
	defaultOrigins := []string{"http://localhost:3000"}
	allowedOrigins := defaultOrigins
	if raw := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS")); raw != "" {
		if origins := filterSplit(raw); len(origins) > 0 {
			allowedOrigins = origins
		} else {
			allowedOrigins = defaultOrigins
		}
	}

	return middleware.CORSConfig{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{echo.GET, echo.POST, echo.PUT, echo.PATCH, echo.DELETE, echo.OPTIONS},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		ExposeHeaders:    []string{echo.HeaderAuthorization},
		AllowCredentials: true,
	}
}

func filterSplit(raw string) []string {
	parts := strings.Split(raw, ",")
	result := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
