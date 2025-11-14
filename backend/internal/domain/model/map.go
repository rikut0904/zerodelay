package model

// MapPlace represents a place with coordinates for map display
type MapPlace struct {
ID       uint    `json:"id"`
Name     string  `json:"name"`
NameKana string  `json:"name_kana"`
Address  string  `json:"address"`
Lat      float64 `json:"lat"`
Lon      float64 `json:"lon"`
URL      string  `json:"url"`
Tel      string  `json:"tel"`
}

// MapBounds represents geographical boundaries
type MapBounds struct {
NorthLat float64 `json:"north_lat"`
SouthLat float64 `json:"south_lat"`
EastLon  float64 `json:"east_lon"`
WestLon  float64 `json:"west_lon"`
}
