package model

// FontSizeOption represents font size options
type FontSizeOption string

const (
	FontSizeSmall  FontSizeOption = "small"   // 小
	FontSizeMedium FontSizeOption = "medium"  // 中
	FontSizeLarge  FontSizeOption = "large"   // 大
)

// GetDefaultFontSizeByAge returns the default font size option based on age
func GetDefaultFontSizeByAge(age int) FontSizeOption {
	switch {
	case age <= 12:
		return FontSizeLarge  // 12歳以下は大（読みやすく）
	case age <= 64:
		return FontSizeMedium // 13-64歳は中（標準）
	default: // 65+
		return FontSizeLarge  // 65歳以上は大（見やすく）
	}
}

// FontSizeUpdateRequest represents a font size update request
type FontSizeUpdateRequest struct {
	FontSize FontSizeOption `json:"font_size"`
}
