package model

import (
	"database/sql/driver"
	"encoding/json"
)

// User represents the users table
type User struct {
	ID       uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name     string `gorm:"type:text" json:"name"`
	NameKana string `gorm:"type:text;column:name_kana" json:"name_kana"`
	Old      int    `gorm:"type:integer" json:"old"`
	Sex      string `gorm:"type:text" json:"sex"`
	Setting  JSON   `gorm:"type:json" json:"setting"`
}

// TableName specifies the table name for User model
func (User) TableName() string {
	return "users"
}

// JSON is a custom type for handling JSON fields in GORM
type JSON map[string]interface{}

// Value implements the driver.Valuer interface for JSON
func (j JSON) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface for JSON
func (j *JSON) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, j)
}
