package model

type SignUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// FirebaseAuthResponse はFirebase APIから返される内部用のレスポンス
type FirebaseAuthResponse struct {
	IDToken      string `json:"idToken"`
	Email        string `json:"email"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    string `json:"expiresIn"`
	LocalID      string `json:"localId"`
	Registered   bool   `json:"registered,omitempty"`
}

// AuthResponse はクライアントに返す認証レスポンス
type AuthResponse struct {
	IDToken      string `json:"idToken,omitempty"`
	RefreshToken string `json:"refreshToken,omitempty"`
	ExpiresIn    string `json:"expiresIn,omitempty"`
	User         *User  `json:"user,omitempty"` // PostgreSQLから取得したユーザー情報
	// Firebase APIから取得した内部データ（クライアントには返さない）
	Email      string `json:"-"`
	LocalID    string `json:"-"`
	Registered bool   `json:"-"`
}

type FirebaseError struct {
	Error struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Errors  []struct {
			Message string `json:"message"`
			Domain  string `json:"domain"`
			Reason  string `json:"reason"`
		} `json:"errors"`
	} `json:"error"`
}
