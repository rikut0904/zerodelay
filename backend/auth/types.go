package auth

// ---共通リクエスト----

//SignUpRequestは新規登録とログインの入力用構造体
type SignUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

//-----Firebase REST API レスポンス ----

//FirebaseAuthResponseはサインアップ/ログイン時にFirebaseから返されるレスポンス構造体
type FirebaseAuthResponse struct {
	IDToken      string `json:"idToken"`
	Email        string `json:"email"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    string `json:"expiresIn"`
	LocalID      string `json:"localId"`
	Registered   bool   `json:"registered,omitempty"`
}

//FirebaseErrorはFirebaseからのエラーレスポンス構造体
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