package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

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

func main() {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Mock data - 金沢周辺のサンプル場所
	mockPlaces := []MapPlace{
		{
			ID:       1,
			Name:     "金沢城公園",
			NameKana: "かなざわじょうこうえん",
			Address:  "石川県金沢市丸の内1-1",
			Lat:      36.5619,
			Lon:      136.6596,
			URL:      "https://www.pref.ishikawa.jp/siro-niwa/kanazawajou/",
			Tel:      "076-234-3800",
		},
		{
			ID:       2,
			Name:     "兼六園",
			NameKana: "けんろくえん",
			Address:  "石川県金沢市兼六町1",
			Lat:      36.5616,
			Lon:      136.6625,
			URL:      "https://www.pref.ishikawa.jp/siro-niwa/kenrokuen/",
			Tel:      "076-234-3800",
		},
		{
			ID:       3,
			Name:     "金沢21世紀美術館",
			NameKana: "かなざわにじゅういっせいきびじゅつかん",
			Address:  "石川県金沢市広坂1-2-1",
			Lat:      36.5608,
			Lon:      136.6578,
			URL:      "https://www.kanazawa21.jp/",
			Tel:      "076-220-2800",
		},
		{
			ID:       4,
			Name:     "近江町市場",
			NameKana: "おうみちょういちば",
			Address:  "石川県金沢市上近江町50",
			Lat:      36.5665,
			Lon:      136.6563,
			URL:      "https://ohmicho-ichiba.com/",
			Tel:      "076-231-1462",
		},
		{
			ID:       5,
			Name:     "金沢駅",
			NameKana: "かなざわえき",
			Address:  "石川県金沢市木ノ新保町1-1",
			Lat:      36.5778,
			Lon:      136.6484,
			URL:      "https://www.jr-odekake.net/eki/top?id=0541626",
			Tel:      "076-253-5149",
		},
	}

	// Health check
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status":  "healthy",
			"message": "マップAPIテストサーバーが稼働中です",
		})
	})

	// Get all map places
	e.GET("/api/map/places", func(c echo.Context) error {
		return c.JSON(http.StatusOK, mockPlaces)
	})

	// Get places within bounds
	e.POST("/api/map/places/bounds", func(c echo.Context) error {
		var bounds MapBounds
		if err := c.Bind(&bounds); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error": "リクエストボディが不正です",
			})
		}

		// Filter places within bounds
		var filteredPlaces []MapPlace
		for _, place := range mockPlaces {
			if place.Lat >= bounds.SouthLat && place.Lat <= bounds.NorthLat &&
				place.Lon >= bounds.WestLon && place.Lon <= bounds.EastLon {
				filteredPlaces = append(filteredPlaces, place)
			}
		}

		return c.JSON(http.StatusOK, filteredPlaces)
	})

	// Start server
	e.Logger.Fatal(e.Start(":8080"))
}
