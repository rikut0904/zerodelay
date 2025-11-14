package middleware

import (
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
return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Authorization header missing"})
}

parts := strings.SplitN(authHeader, " ", 2)
if len(parts) != 2 || parts[0] != "Bearer" {
return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid Authorization header format"})
}

idToken := parts[1]

uid, err := authService.VerifyIDToken(c.Request().Context(), idToken)
if err != nil {
return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid or expired ID token"})
}

c.Set("uid", uid)
return next(c)
}
}
}
