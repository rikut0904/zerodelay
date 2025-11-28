package config

import (
	"os"
)

// Config holds all application configuration
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Port string
}

// DatabaseConfig holds database connection configuration
type DatabaseConfig struct {
<<<<<<< HEAD
	URL string
=======
	URL      string
	LogLevel string
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
}

// Load loads configuration from environment variables
func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
		},
		Database: DatabaseConfig{
<<<<<<< HEAD
			URL: getEnv("DATABASE_URL", ""),
=======
			URL:      getEnv("DATABASE_URL", ""),
			LogLevel: getEnv("DB_LOG_LEVEL", "warn"), // silent, error, warn, info
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
		},
	}
}

// getEnv gets an environment variable with a default fallback
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
