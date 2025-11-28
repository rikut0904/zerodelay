package database

import (
	"fmt"
	"log"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"zerodelay/internal/config"
	"zerodelay/internal/domain/model"
)

// DB holds the database connection
type DB struct {
	*gorm.DB
}

// getLogLevel converts string log level to logger.LogLevel
func getLogLevel(level string) logger.LogLevel {
	switch strings.ToLower(level) {
	case "silent":
		return logger.Silent
	case "error":
		return logger.Error
	case "warn":
		return logger.Warn
	case "info":
		return logger.Info
	default:
		return logger.Warn // Default to Warn if unknown value
	}
}

// NewDatabase creates a new database connection
func NewDatabase(cfg *config.Config) (*DB, error) {
	if cfg.Database.URL == "" {
		return nil, fmt.Errorf("DATABASE_URL is not set")
	}

	logLevel := getLogLevel(cfg.Database.LogLevel)

	db, err := gorm.Open(postgres.Open(cfg.Database.URL), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Printf("Database connection established (log level: %s)", cfg.Database.LogLevel)

	return &DB{db}, nil
}

// AutoMigrate runs auto migration for all models
func (db *DB) AutoMigrate() error {
	return db.DB.AutoMigrate(
		&model.User{},
		&model.Place{},
	)
}

// Close closes the database connection
func (db *DB) Close() error {
	sqlDB, err := db.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
