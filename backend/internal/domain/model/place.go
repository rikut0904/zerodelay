package model

// Place represents the place table
type Place struct {
	ID       uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name     string `gorm:"type:text" json:"name"`
	NameKana string `gorm:"type:text;column:name_kana" json:"name_kana"`
	Address  string `gorm:"type:text" json:"address"`
	Lat      string `gorm:"type:text" json:"lat"`
	Lon      string `gorm:"type:text" json:"lon"`
	URL      string `gorm:"type:text;column:url" json:"url"`
	Tel      string `gorm:"type:text" json:"tel"`
}

// TableName specifies the table name for Place model
func (Place) TableName() string {
	return "place"
}
