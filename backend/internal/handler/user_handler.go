package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"

	"zerodelay/internal/domain/model"
	"zerodelay/internal/service"
)

// UserHandler handles HTTP requests for users
type UserHandler struct {
	userService *service.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// CreateUser handles POST /api/users
func (h *UserHandler) CreateUser(c echo.Context) error {
	var user model.User
	if err := c.Bind(&user); err != nil {
		log.Printf("[WARN] CreateUser bind failed: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	if err := h.userService.CreateUser(&user); err != nil {
		log.Printf("[ERROR] CreateUser failed: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "ユーザーの作成に失敗しました"})
	}

	return c.JSON(http.StatusCreated, user)
}

// GetUser handles GET /api/users/:id
func (h *UserHandler) GetUser(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}

	user, err := h.userService.GetUser(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}

	return c.JSON(http.StatusOK, user)
}

// GetAllUsers handles GET /api/users
func (h *UserHandler) GetAllUsers(c echo.Context) error {
	users, err := h.userService.GetAllUsers()
	if err != nil {
		log.Printf("[ERROR] GetAllUsers failed: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "ユーザーの取得に失敗しました"})
	}

	return c.JSON(http.StatusOK, users)
}

// UpdateUser handles PUT /api/users/:id
func (h *UserHandler) UpdateUser(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}

	var user model.User
	if err := c.Bind(&user); err != nil {
		log.Printf("[WARN] UpdateUser bind failed: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	user.ID = uint(id)

	if err := h.userService.UpdateUser(&user); err != nil {
		log.Printf("[ERROR] UpdateUser failed: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "ユーザーの更新に失敗しました"})
	}

	return c.JSON(http.StatusOK, user)
}

// DeleteUser handles DELETE /api/users/:id
func (h *UserHandler) DeleteUser(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}

	if err := h.userService.DeleteUser(uint(id)); err != nil {
		log.Printf("[ERROR] DeleteUser failed: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "ユーザーの削除に失敗しました"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "User deleted successfully"})
}

// UpdateProfile handles PATCH /api/v1/users/me
func (h *UserHandler) UpdateProfile(c echo.Context) error {
	// ミドルウェアでセットされたFirebaseUIDを取得
	uid := c.Get("uid")
	if uid == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}

	firebaseUID, ok := uid.(string)
	if !ok {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Invalid UID format"})
	}

	var req model.UpdateProfileRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("[WARN] UpdateProfile bind failed for UID %s: %v", firebaseUID, err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	user, err := h.userService.UpdateProfile(c.Request().Context(), firebaseUID, &req)
	if err != nil {
		log.Printf("[ERROR] UpdateProfile failed for UID %s: %v", firebaseUID, err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "プロフィールの更新に失敗しました"})
	}

	return c.JSON(http.StatusOK, user)
}
