package handler

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v4"

	"zerodelay/internal/domain/model"
	"zerodelay/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) SignUp(c echo.Context) error {
	var req model.SignUpRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("[WARN] SignUp bind failed: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	resp, err := h.authService.SignUp(c.Request().Context(), &req)
	if err != nil {
		log.Printf("[ERROR] SignUp failed: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req model.LoginRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("[WARN] Login bind failed: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	resp, err := h.authService.Login(c.Request().Context(), &req)
	if err != nil {
		log.Printf("[ERROR] Login failed: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) Logout(c echo.Context) error {
	// Firebaseのログアウトはクライアント側でトークンを削除するだけで完結
	// サーバー側ではログの記録や統計情報の更新などを行う

	// 認証ミドルウェアで設定されたUIDを取得（オプション）
	uid := c.Get("uid")
	if uid != nil {
		// ログ出力（必要に応じて）
		// log.Printf("[INFO] User logged out: %s", uid)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Logged out successfully",
	})
}
