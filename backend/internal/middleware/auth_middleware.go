package middleware

import (
"log"
"net/http"
"strings"

"github.com/labstack/echo/v4"

"zerodelay/internal/service"
)

func FirebaseAuthMiddleware(authService *service.AuthService) echo.MiddlewareFunc {
return func(next echo.HandlerFunc) echo.HandlerFunc {
return func(c echo.Context) error {
authHeader := c.Request().Header.Get("Authorization")
if authHeader == "" {
log.Printf("[WARN] Authorization header missing for request: %s %s", c.Request().Method, c.Request().URL.Path)
return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Authorization header missing"})
}

parts := strings.SplitN(authHeader, " ", 2)
if len(parts) != 2 || parts[0] != "Bearer" {
log.Printf("[WARN] Invalid Authorization header format for request: %s %s", c.Request().Method, c.Request().URL.Path)
return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid Authorization header format"})
}

idToken := parts[1]

uid, err := authService.VerifyIDToken(c.Request().Context(), idToken)
if err != nil {
log.Printf("[WARN] Token verification failed for request: %s %s - %v", c.Request().Method, c.Request().URL.Path, err)
return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid or expired ID token"})
}

log.Printf("[INFO] Authentication successful for request: %s %s", c.Request().Method, c.Request().URL.Path)
log.Printf("[DEBUG] Authenticated user %s for request: %s %s", uid, c.Request().Method, c.Request().URL.Path)
c.Set("uid", uid)
return next(c)
}
}
}
