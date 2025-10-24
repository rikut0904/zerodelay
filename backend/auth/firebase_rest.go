package auth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
)

//Firebase_API_KEYをenvファイルから取得
func FirebaseAPIKey() string {
	//.env　読み込み
	_ = godotenv.Load()

	apiKey := os.Getenv("FIREBASE_API_KEY")
	if apiKey == "" {
		fmt.Println("FIREBASE_API_KEY is not set in .env file")
	}
	return apiKey
}

//SignUpHandler - Firebase Auth REST APT経由で新規登録
func SignUpHandler(c echo.Context) error {
	var req SignUpRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	paylode := map[string]string{
		"email":             req.Email,
		"password":          req.Password,
		"returnSecureToken": "true",
	}

	body, _ := json.Marshal(paylode)
	resp, err := http.Post(
		fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=%s", FirebaseAPIKey()),
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to communicate with Firebase"})
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		var fbErr FirebaseError
		_ = json.Unmarshal(respBody, &fbErr)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": fbErr.Error.Message,
		})
	}

	var fbResp FirebaseAuthResponse
	_ = json.Unmarshal(respBody, &fbResp)

	return c.JSON(http.StatusOK, fbResp)
}

func LoginHandler(c echo.Context) error {
	var req SignUpRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	paylode := map[string]string{
		"email":             req.Email,
		"password":          req.Password,
		"returnSecureToken": "true",
	}

	body, _ := json.Marshal(paylode)
	resp, err := http.Post(
		fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=%s", FirebaseAPIKey()),
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to communicate with Firebase"})
	}
	defer resp.Body.Close()


	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		var fbErr FirebaseError
		_ = json.Unmarshal(respBody, &fbErr)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": fbErr.Error.Message,
		})
	}

	var fbResp FirebaseAuthResponse
	_ = json.Unmarshal(respBody, &fbResp)
	return c.JSON(http.StatusOK, fbResp)
}